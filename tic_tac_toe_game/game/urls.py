from django.urls import path
from .views import *

app_name = "game"
urlpatterns = [
    path("", HomePage.as_view(), name="index"),
    path("play/<str:room_code>", Game.as_view(), name="game")
]
