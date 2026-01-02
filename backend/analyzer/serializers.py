from rest_framework import serializers
from .models import SimpleUser, Resume

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimpleUser
        fields = ["id", "email"]

class ResumeSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    class Meta:
        model = Resume
        fields = "__all__"
