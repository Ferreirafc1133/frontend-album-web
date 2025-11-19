from django.urls import path

from .views import StickerUnlockView

urlpatterns = [
    path("stickers/<int:pk>/unlock/", StickerUnlockView.as_view(), name="sticker-unlock"),
]
