from django.conf import settings
from django.db.models import F
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from achievements.models import UserSticker
from achievements.services import analyze_car_photo
from .models import Album, Sticker
from .permissions import IsAdminOrReadOnly
from .serializers import (
    AlbumCreateSerializer,
    AlbumDetailSerializer,
    AlbumSerializer,
    StickerCreateSerializer,
    StickerSerializer,
)


class AlbumListCreateView(generics.ListCreateAPIView):
    queryset = Album.objects.prefetch_related("stickers").all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AlbumCreateSerializer
        return AlbumSerializer


class AlbumDetailView(generics.RetrieveUpdateAPIView):
    queryset = Album.objects.prefetch_related("stickers").all()
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return AlbumCreateSerializer
        return AlbumDetailSerializer


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


class MatchAlbumPhotoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not settings.USE_OPENAI_STICKER_VALIDATION:
            return Response(
                {
                    "unlocked": False,
                    "message": "Validación por IA deshabilitada",
                }
            )

        album = get_object_or_404(Album.objects.prefetch_related("stickers"), pk=pk)
        stickers = list(album.stickers.all())

        photo = request.FILES.get("photo")
        if not photo:
            return Response({"detail": "Se requiere un archivo 'photo'."}, status=status.HTTP_400_BAD_REQUEST)

        result = analyze_car_photo(photo, stickers)
        if result.get("error"):
            return Response(
                {
                    "unlocked": False,
                    "message": "No pudimos validar la foto en este momento.",
                    "reason": result.get("error"),
                }
            )

        sticker_id = result.get("sticker_id")
        confidence = float(result.get("confidence") or 0)
        car_info = {
            "make": result.get("make"),
            "model": result.get("model"),
            "generation": result.get("generation"),
            "year_range": result.get("year_range"),
        }
        reason = result.get("reason")

        if not sticker_id or confidence < 0.6:
            return Response(
                {
                    "unlocked": False,
                    "match_score": confidence,
                    "car": car_info,
                    "reason": reason,
                    "message": "No encontramos ningún sticker que coincida con esta foto.",
                }
            )

        try:
            sticker = next(s for s in stickers if s.id == sticker_id)
        except StopIteration:
            return Response(
                {
                    "unlocked": False,
                    "match_score": confidence,
                    "car": car_info,
                    "reason": reason,
                    "message": "No encontramos ningún sticker que coincida con esta foto.",
                }
            )

        user_sticker, created = UserSticker.objects.get_or_create(
            user=request.user,
            sticker=sticker,
            defaults={
                "status": UserSticker.STATUS_APPROVED,
                "validated": True,
                "validated_at": timezone.now(),
                "validation_score": confidence,
                "validation_notes": reason,
            },
        )

        try:
            photo.seek(0)
        except Exception:
            pass

        already_validated = user_sticker.validated if not created else False
        user_sticker.photo = photo

        if not created:
            user_sticker.status = UserSticker.STATUS_APPROVED
            user_sticker.validated = True
            user_sticker.validated_at = timezone.now()
            user_sticker.validation_score = confidence
            user_sticker.validation_notes = reason
            user_sticker.save(
                update_fields=[
                    "status",
                    "validated",
                    "validated_at",
                    "validation_score",
                    "validation_notes",
                    "photo",
                    "updated_at",
                ]
            )
        else:
            user_sticker.photo = photo
            user_sticker.save(update_fields=["photo", "updated_at"])

        if not already_validated:
            reward = sticker.reward_points
            type(user_sticker.user).objects.filter(pk=user_sticker.user_id).update(
                points=F("points") + reward
            )

        serializer = StickerSerializer(sticker, context={"request": request})
        return Response(
            {
                "unlocked": True,
                "sticker": serializer.data,
                "match_score": confidence,
                "car": car_info,
                "reason": reason,
            }
        )
