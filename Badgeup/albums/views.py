from rest_framework import generics, permissions

from .models import Album, Sticker
from .serializers import AlbumDetailSerializer, AlbumSerializer, StickerSerializer


class AlbumListView(generics.ListAPIView):
    queryset = Album.objects.prefetch_related("stickers").all()
    serializer_class = AlbumSerializer
    permission_classes = [permissions.IsAuthenticated]


class AlbumDetailView(generics.RetrieveAPIView):
    queryset = Album.objects.prefetch_related("stickers").all()
    serializer_class = AlbumDetailSerializer
    permission_classes = [permissions.IsAuthenticated]


class StickerDetailView(generics.RetrieveAPIView):
    queryset = Sticker.objects.select_related("album")
    serializer_class = StickerSerializer
    permission_classes = [permissions.IsAuthenticated]
