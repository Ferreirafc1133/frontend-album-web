from django.db import models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from albums.models import Sticker

from users.models import User

from .models import FriendRequest, UserSticker
from .serializers import (
    FriendRequestSerializer,
    MemberWithRelationSerializer,
    StickerUnlockSerializer,
    UserStickerSerializer,
)
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


class FriendRequestListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendRequestSerializer

    def get_queryset(self):
        scope = self.request.query_params.get("scope", "all")
        qs = FriendRequest.objects.select_related("from_user", "to_user")
        if scope == "received":
            qs = qs.filter(to_user=self.request.user)
        elif scope == "sent":
            qs = qs.filter(from_user=self.request.user)
        else:
            qs = qs.filter(
                models.Q(from_user=self.request.user) | models.Q(to_user=self.request.user)
            )
        status_param = self.request.query_params.get("status")
        if status_param in {FriendRequest.STATUS_PENDING, FriendRequest.STATUS_ACCEPTED, FriendRequest.STATUS_REJECTED}:
            qs = qs.filter(status=status_param)
        return qs.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        to_user_id = request.data.get("to_user")
        if not to_user_id:
            return Response({"detail": "to_user is required"}, status=status.HTTP_400_BAD_REQUEST)
        if str(to_user_id) == str(request.user.id):
            return Response({"detail": "No puedes enviarte una solicitud a ti mismo."}, status=status.HTTP_400_BAD_REQUEST)

        target = get_object_or_404(User, pk=to_user_id)

        existing = FriendRequest.objects.filter(
            models.Q(from_user=request.user, to_user=target)
            | models.Q(from_user=target, to_user=request.user)
        ).first()

        if existing:
            if existing.status == FriendRequest.STATUS_ACCEPTED:
                serializer = self.get_serializer(existing)
                return Response(serializer.data, status=status.HTTP_200_OK)
            if existing.status == FriendRequest.STATUS_PENDING:
                if existing.from_user_id == request.user.id:
                    serializer = self.get_serializer(existing)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                existing.status = FriendRequest.STATUS_ACCEPTED
                existing.responded_at = timezone.now()
                existing.save(update_fields=["status", "responded_at"])
                serializer = self.get_serializer(existing)
                return Response(serializer.data, status=status.HTTP_200_OK)
            if existing.status == FriendRequest.STATUS_REJECTED:
                existing.from_user = request.user
                existing.to_user = target
                existing.status = FriendRequest.STATUS_PENDING
                existing.responded_at = None
                existing.save(update_fields=["from_user", "to_user", "status", "responded_at"])
                serializer = self.get_serializer(existing)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        friend_request = FriendRequest.objects.create(
            from_user=request.user,
            to_user=target,
            status=FriendRequest.STATUS_PENDING,
        )
        serializer = self.get_serializer(friend_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FriendRequestActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, action: str):
        fr = get_object_or_404(
            FriendRequest.objects.select_related("from_user", "to_user"),
            pk=pk,
        )
        if action == "accept":
            if fr.to_user != request.user or fr.status != FriendRequest.STATUS_PENDING:
                return Response({"detail": "No puedes aceptar esta solicitud."}, status=status.HTTP_400_BAD_REQUEST)
            fr.status = FriendRequest.STATUS_ACCEPTED
            fr.responded_at = timezone.now()
            fr.save(update_fields=["status", "responded_at"])
        elif action == "reject":
            if fr.to_user != request.user or fr.status != FriendRequest.STATUS_PENDING:
                return Response({"detail": "No puedes rechazar esta solicitud."}, status=status.HTTP_400_BAD_REQUEST)
            fr.status = FriendRequest.STATUS_REJECTED
            fr.responded_at = timezone.now()
            fr.save(update_fields=["status", "responded_at"])
        elif action == "cancel":
            if fr.from_user != request.user or fr.status != FriendRequest.STATUS_PENDING:
                return Response({"detail": "No puedes cancelar esta solicitud."}, status=status.HTTP_400_BAD_REQUEST)
            fr.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        elif action == "remove":
            if fr.status != FriendRequest.STATUS_ACCEPTED or (
                fr.from_user != request.user and fr.to_user != request.user
            ):
                return Response({"detail": "No puedes eliminar esta amistad."}, status=status.HTTP_400_BAD_REQUEST)
            fr.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"detail": "Acción no válida"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = FriendRequestSerializer(fr)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FriendRequestAcceptView(FriendRequestActionView):
    def post(self, request, pk):
        return super().post(request, pk, "accept")


class FriendRequestRejectView(FriendRequestActionView):
    def post(self, request, pk):
        return super().post(request, pk, "reject")


class FriendRequestCancelView(FriendRequestActionView):
    def post(self, request, pk):
        return super().post(request, pk, "cancel")


class FriendRemoveView(FriendRequestActionView):
    def post(self, request, pk):
        return super().post(request, pk, "remove")


class FriendsListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MemberWithRelationSerializer

    def get_queryset(self):
        user = self.request.user
        accepted = list(
            FriendRequest.objects.filter(
                status=FriendRequest.STATUS_ACCEPTED,
            )
            .filter(models.Q(from_user=user) | models.Q(to_user=user))
            .select_related("from_user", "to_user")
        )
        other_ids = []
        relationship_map = {}
        for fr in accepted:
            other = fr.to_user if fr.from_user_id == user.id else fr.from_user
            other_ids.append(other.id)
            relationship_map[other.id] = {
                "status": "friends",
                "request_id": fr.id,
            }
        self.relationship_map = relationship_map
        return User.objects.filter(id__in=other_ids)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["relationship_map"] = getattr(self, "relationship_map", {})
        return ctx


class MemberListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MemberWithRelationSerializer

    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id).order_by("-points")

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        user = self.request.user
        relationships = FriendRequest.objects.filter(
            status__in=[FriendRequest.STATUS_PENDING, FriendRequest.STATUS_ACCEPTED],
        ).filter(
            models.Q(from_user=user) | models.Q(to_user=user),
        ).select_related("from_user", "to_user")
        relationship_map = {}
        for fr in relationships:
            other = fr.to_user if fr.from_user_id == user.id else fr.from_user
            if fr.status == FriendRequest.STATUS_ACCEPTED:
                status_value = "friends"
            elif fr.from_user_id == user.id:
                status_value = "request_sent"
            else:
                status_value = "request_received"
            relationship_map[other.id] = {"status": status_value, "request_id": fr.id}
        ctx["relationship_map"] = relationship_map
        return ctx
