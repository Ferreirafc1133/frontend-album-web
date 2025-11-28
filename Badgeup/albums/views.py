from rest_framework import generics, permissions

from .models import Album, Sticker
from .serializers import (
    AlbumCreateSerializer,
    AlbumDetailSerializer,
    AlbumSerializer,
    StickerSerializer,
)


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


class StickerDetailView(generics.RetrieveAPIView):
    queryset = Sticker.objects.select_related("album")
    serializer_class = StickerSerializer
    permission_classes = [permissions.IsAuthenticated]
