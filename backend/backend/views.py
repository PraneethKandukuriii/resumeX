from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status, permissions

User = get_user_model()  # Uses your custom user model


# -------------------------------
# Login via Email
# -------------------------------
@method_decorator(csrf_exempt, name='dispatch')
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
# Resume Upload
# -------------------------------
class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('resume')
        if not file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        # TODO: handle saving file and analysis
        return Response({'message': 'File uploaded successfully'}, status=status.HTTP_200_OK)


# -------------------------------
# Get last uploaded resume result
# -------------------------------
class MyLastResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO: fetch last result logic
        return Response({'message': 'Last result fetched'}, status=status.HTTP_200_OK)
