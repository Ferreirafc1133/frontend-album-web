from django.urls import path

from .views import AlbumDetailView, AlbumListView, StickerDetailView

urlpatterns = [
    path("", AlbumListView.as_view(), name="album-list"),
    path("<int:pk>/", AlbumDetailView.as_view(), name="album-detail"),
    path("stickers/<int:pk>/", StickerDetailView.as_view(), name="sticker-detail"),
]
