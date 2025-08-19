from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model

from .models import Resume
from .serializers import ResumeSerializer
from .utils import extract_text_from_upload, compute_all_scores, ai_suggestions

User = get_user_model()


# -------------------------------
# Login via Email (JWT tokens)
# -------------------------------
class EmailLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        if not email:
            return Response({"error": "Email is required"}, status=400)

        # Create or get user
        user, created = User.objects.get_or_create(email=email)


        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "email": user.email,
            "user_id": user.id
        })


# -------------------------------
# Resume Upload
# -------------------------------
class ResumeUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        file = request.FILES.get("resume")
        if not file:
            return Response({"error": "Resume file missing"}, status=400)

        # Extract text BEFORE saving
        text = extract_text_from_upload(file)

        # Save file + create Resume row
        resume = Resume.objects.create(user=request.user, file=file)

        # Manual deep analysis
        analysis = compute_all_scores(text)

        # Optional AI suggestions
        ai_feedback = ai_suggestions(text)

        # Persist analysis
        resume.manual_score = analysis.get("ats_score")
        resume.analysis = analysis
        resume.found_keywords = analysis.get("found_keywords")
        resume.missing_keywords = analysis.get("missing_keywords")
        resume.ai_feedback = ai_feedback
        resume.save()

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
        return Response(data, status=status.HTTP_201_CREATED)


# -------------------------------
# Get last uploaded Resume result
# -------------------------------
class MyLastResultView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        resume = Resume.objects.filter(user=request.user).order_by("-uploaded_at").first()
        if not resume:
            return Response({"message": "No analyses yet"}, status=200)

        data = ResumeSerializer(resume).data
        data["manual_score"] = resume.manual_score
        if resume.analysis:
            data["subscores"] = resume.analysis.get("subscores")
            data["ats_score"] = resume.analysis.get("ats_score")
            data["impact_score"] = resume.analysis.get("impact_score")
        return Response(data)
