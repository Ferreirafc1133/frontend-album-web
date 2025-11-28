from django.urls import path

from .views import AlbumDetailView, AlbumListCreateView, StickerDetailView

urlpatterns = [
    path("", AlbumListCreateView.as_view(), name="album-list-create"),
    path("<int:pk>/", AlbumDetailView.as_view(), name="album-detail"),
    path("stickers/<int:pk>/", StickerDetailView.as_view(), name="sticker-detail"),
]
