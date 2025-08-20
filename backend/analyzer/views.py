from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, permissions, serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model

from .models import Resume
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

        user, created = User.objects.get_or_create(email=email)

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "email": user.email,
            "user_id": user.id
        })


# -------------------------------
# Resume Serializer
# -------------------------------
class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = [
            "id", "file", "uploaded_at",
            "manual_score", "analysis",
            "ai_feedback", "found_keywords",
            "missing_keywords"
        ]


# -------------------------------
# Resume Upload
# -------------------------------
class ResumeUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("resume")
        if not file:
            return Response({"error": "Resume file missing"}, status=400)

        # Extract text from uploaded file
        text = extract_text_from_upload(file)

        # Save resume in DB
        resume = Resume.objects.create(user=request.user, file=file)

        # Compute scores and AI feedback
        analysis = compute_all_scores(text)
        ai_feedback = ai_suggestions(text)

        # Save analysis in resume object
        resume.manual_score = analysis.get("ats_score")
        resume.analysis = analysis
        resume.ai_feedback = ai_feedback
        resume.save()

        # Return full analysis
        data = ResumeSerializer(resume).data
        data.update({
            "manual_score": resume.manual_score,
            "ats_score": analysis.get("ats_score"),
            "impact_score": analysis.get("impact_score"),
            "subscores": analysis.get("subscores"),
            "found_keywords": analysis.get("found_keywords"),
            "missing_keywords": analysis.get("missing_keywords"),
            "ai_feedback": ai_feedback
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
        if resume.analysis:
            data.update({
                "ats_score": resume.analysis.get("ats_score"),
                "impact_score": resume.analysis.get("impact_score"),
                "subscores": resume.analysis.get("subscores"),
                "found_keywords": resume.analysis.get("found_keywords"),
                "missing_keywords": resume.analysis.get("missing_keywords"),
                "ai_feedback": resume.ai_feedback
            })

        return Response(data)
