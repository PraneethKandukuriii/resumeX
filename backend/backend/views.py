from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

User = get_user_model()  # Uses your custom user model

class EmailLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or get the user using only email
        user, created = User.objects.get_or_create(email=email)
        
        # Generate JWT token
        refresh = RefreshToken.for_user(user)
        return Response({'access': str(refresh.access_token)}, status=status.HTTP_200_OK)


class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('resume')
        if not file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle file upload here
        return Response({'message': 'File uploaded successfully'}, status=status.HTTP_200_OK)


class MyLastResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch last result logic
        return Response({'message': 'Last result fetched'}, status=status.HTTP_200_OK)
