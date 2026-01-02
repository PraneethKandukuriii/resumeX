from django.contrib import admin
from django.urls import path
from .views import EmailLoginView, ResumeUploadView, MyLastResultView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/login/", EmailLoginView.as_view(), name="login"),
    path("api/upload/", ResumeUploadView.as_view(), name="upload"),
    path("api/last/", MyLastResultView.as_view(), name="last"),
]

