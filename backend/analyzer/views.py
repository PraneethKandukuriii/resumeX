from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model

from .models import Resume
from .serializers import ResumeSerializer
from .utils import extract_text_from_upload, compute_all_scores, ai_suggestions

User = get_user_model()


# -------------------------------
# Resume Upload View
# -------------------------------
class ResumeUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        # 1️⃣ Check for uploaded file
        file = request.FILES.get("resume")
        if not file:
            return Response({"error": "Resume file missing"}, status=status.HTTP_400_BAD_REQUEST)

        # 2️⃣ Extract text from uploaded file
        text = extract_text_from_upload(file)
        if not text.strip():
            return Response({"error": "Could not extract text from resume"}, status=status.HTTP_400_BAD_REQUEST)

        # 3️⃣ Compute manual analysis scores
        analysis = compute_all_scores(text)

        # 4️⃣ Optional AI suggestions (catch errors)
        try:
            ai_feedback = ai_suggestions(text)
        except Exception as e:
            ai_feedback = f"AI feedback failed: {e}"

        # 5️⃣ Save resume to DB
        resume = Resume.objects.create(user=request.user, file=file)
        resume.manual_score = analysis.get("ats_score")
        resume.analysis = analysis
        resume.found_keywords = analysis.get("found_keywords")
        resume.missing_keywords = analysis.get("missing_keywords")
        resume.ai_feedback = ai_feedback
        resume.save()

        # 6️⃣ Prepare serialized response
        data = ResumeSerializer(resume).data
        data.update({
            "manual_score": resume.manual_score,
            "ats_score": analysis.get("ats_score"),
            "impact_score": analysis.get("impact_score"),
            "subscores": analysis.get("subscores"),
            "skills": analysis.get("skills"),
            "experience_years": analysis.get("experience_years"),
            "education": analysis.get("education"),
            "certifications": analysis.get("certifications"),
            "achievements": analysis.get("achievements"),
            "projects": analysis.get("projects"),
            "links": analysis.get("links"),
            "found_keywords": analysis.get("found_keywords"),
            "missing_keywords": analysis.get("missing_keywords"),
            "ai_feedback": ai_feedback,
            "full_analysis": analysis
        })

        return Response(data, status=status.HTTP_201_CREATED)
