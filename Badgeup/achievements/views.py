from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from albums.models import Sticker

from .models import UserSticker
from .serializers import StickerUnlockSerializer, UserStickerSerializer
from .tasks import validate_user_sticker


class StickerUnlockView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        sticker = get_object_or_404(Sticker, pk=pk)
        user_sticker, created = UserSticker.objects.get_or_create(
            user=request.user,
            sticker=sticker,
        )

        serializer = StickerUnlockSerializer(
            user_sticker,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        for attr, value in serializer.validated_data.items():
            setattr(user_sticker, attr, value)
        user_sticker.status = UserSticker.STATUS_VALIDATING
        user_sticker.validated = False
        user_sticker.save()

        try:
            validate_user_sticker.delay(user_sticker.id)
        except Exception:  # pragma: no cover - fallback for missing broker
            validate_user_sticker.apply(args=[user_sticker.id])

        output_serializer = UserStickerSerializer(user_sticker)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_202_ACCEPTED
        return Response(output_serializer.data, status=status_code)
