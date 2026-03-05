from django.urls import path
from . import views

urlpatterns = [
    path('candidate', views.storeCandidate, name='storeCandidate'),
]