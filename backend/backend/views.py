from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from analyzer.models import Resume
from analyzer.serializers import ResumeSerializer
from analyzer.utils import extract_text_from_upload, compute_all_scores, ai_suggestions

# backend/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework import permissions

User = get_user_model()

class EmailLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Only use email, no username field
        user, created = User.objects.get_or_create(email=email)

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })


class ResumeUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        print("FILES:", request.FILES)  # Debug

        file = request.FILES.get("resume")
        if not file:
            return Response({"error": "Resume file missing"}, status=400)

        # Extract text from uploaded file
        text = extract_text_from_upload(file)
        print("Extracted text length:", len(text))

        # Save the resume
        resume = Resume.objects.create(user=request.user, file=file)

        # Compute analysis scores
        analysis = compute_all_scores(text)
        ai_feedback = ai_suggestions(text)

        # Save analysis in DB
        resume.manual_score = analysis.get("ats_score")
        resume.analysis = analysis
        resume.found_keywords = analysis.get("found_keywords")
        resume.missing_keywords = analysis.get("missing_keywords")
        resume.ai_feedback = ai_feedback
        resume.save()

        # Prepare serialized response
        data = ResumeSerializer(resume).data
        data.update({
            "manual_score": resume.manual_score,
            "ats_score": analysis.get("ats_score"),
            "impact_score": analysis.get("impact_score"),
            "subscores": analysis.get("subscores"),
            "found_keywords": analysis.get("found_keywords"),
            "missing_keywords": analysis.get("missing_keywords"),
            "ai_feedback": ai_feedback,
            "full_analysis": analysis
        })

        print("Returning response with ATS score:", resume.manual_score)
        return Response(data, status=201)
    

class MyLastResultView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        resume = request.user.resume_set.order_by('-created_at').first()
        if not resume:
            return Response({"error": "No resume found"}, status=404)
        from .serializers import ResumeSerializer
        return Response(ResumeSerializer(resume).data)
