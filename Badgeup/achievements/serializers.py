from rest_framework import serializers

from users.models import User

from .models import FriendRequest, UserSticker


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email", "avatar", "points")


class UserStickerSerializer(serializers.ModelSerializer):
    sticker = serializers.PrimaryKeyRelatedField(read_only=True)
    album = serializers.SerializerMethodField()

    class Meta:
        model = UserSticker
        fields = (
            "id",
            "sticker",
            "album",
            "photo",
            "photo_url",
            "comment",
            "status",
            "validated",
            "validated_at",
            "validation_score",
            "validation_notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "status",
            "validated",
            "validated_at",
            "validation_score",
            "validation_notes",
            "created_at",
            "updated_at",
            "album",
        )

    def get_album(self, obj):
        return obj.sticker.album_id


class StickerUnlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSticker
        fields = ("photo", "photo_url", "comment")

    def validate(self, attrs):
        photo = attrs.get("photo")
        photo_url = attrs.get("photo_url")
        if not photo and not photo_url:
            raise serializers.ValidationError("Provide at least photo or photo_url.")
        return attrs


class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSummarySerializer(read_only=True)
    to_user = UserSummarySerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = (
            "id",
            "from_user",
            "to_user",
            "status",
            "created_at",
            "responded_at",
        )


class MemberWithRelationSerializer(UserSummarySerializer):
    relationship_status = serializers.SerializerMethodField()
    friend_request_id = serializers.SerializerMethodField()

    class Meta(UserSummarySerializer.Meta):
        fields = UserSummarySerializer.Meta.fields + ("relationship_status", "friend_request_id")

    def get_relationship_status(self, obj):
        relationship_map = self.context.get("relationship_map", {})
        rel = relationship_map.get(obj.id) or {}
        return rel.get("status", "none")

    def get_friend_request_id(self, obj):
        relationship_map = self.context.get("relationship_map", {})
        rel = relationship_map.get(obj.id) or {}
        return rel.get("request_id")
