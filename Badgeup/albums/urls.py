from django.urls import path

from .views import AlbumDetailView, AlbumListCreateView, StickerDetailView, MatchAlbumPhotoView

urlpatterns = [
    path("", AlbumListCreateView.as_view(), name="album-list-create"),
    path("<int:pk>/", AlbumDetailView.as_view(), name="album-detail"),
    path("<int:pk>/match-photo/", MatchAlbumPhotoView.as_view(), name="album-match-photo"),
    path("stickers/<int:pk>/", StickerDetailView.as_view(), name="sticker-detail"),
]
