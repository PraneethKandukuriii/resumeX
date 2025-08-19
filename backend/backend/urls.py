"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from analyzer.views import EmailLoginView, ResumeUploadView, MyLastResultView
# backend/backend/urls.py
from analyzer.views import EmailLoginView, ResumeUploadView, MyLastResultView


urlpatterns = [
    path('api/login/', EmailLoginView.as_view(), name='email-login'),
    path('api/upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('api/last/', MyLastResultView.as_view(), name='last-result'),
]

