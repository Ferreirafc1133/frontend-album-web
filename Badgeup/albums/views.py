from rest_framework import generics, permissions

from .models import Album, Sticker
from .serializers import (
    AlbumCreateSerializer,
    AlbumDetailSerializer,
    AlbumSerializer,
    StickerCreateSerializer,
    StickerSerializer,
)
from .permissions import IsAdminOrReadOnly


class AlbumListCreateView(generics.ListCreateAPIView):
    queryset = Album.objects.prefetch_related("stickers").all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AlbumCreateSerializer
        return AlbumSerializer


class AlbumDetailView(generics.RetrieveAPIView):
    queryset = Album.objects.prefetch_related("stickers").all()
    serializer_class = AlbumDetailSerializer
    permission_classes = [permissions.IsAuthenticated]


class StickerDetailView(generics.RetrieveUpdateAPIView):
    queryset = Sticker.objects.select_related("album")
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return StickerCreateSerializer
        return StickerSerializer


class StickerListCreateView(generics.ListCreateAPIView):
    queryset = Sticker.objects.select_related("album")
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        album_id = self.request.query_params.get("album")
        if album_id:
            qs = qs.filter(album_id=album_id)
        return qs

    def get_serializer_class(self):
        if self.request.method == "POST":
            return StickerCreateSerializer
        return StickerSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        return ctx
