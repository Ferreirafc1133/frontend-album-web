from rest_framework import serializers

from .models import UserSticker


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
            "validation_notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "status",
            "validated",
            "validated_at",
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
