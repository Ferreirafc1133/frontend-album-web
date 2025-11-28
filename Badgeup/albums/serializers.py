from rest_framework import serializers

from achievements.models import UserSticker

from .models import Album, Sticker


class StickerSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(source="image_reference", required=False, allow_null=True)
    is_unlocked = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Sticker
        fields = (
            "id",
            "album",
            "name",
            "description",
            "location_lat",
            "location_lng",
            "image_reference",
            "image",
            "reward_points",
            "order",
            "rarity",
            "is_unlocked",
            "status",
        )
        read_only_fields = ("album",)

    def get_is_unlocked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.user_stickers.filter(
            user=request.user,
            status=UserSticker.STATUS_APPROVED,
        ).exists()

    def get_status(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        capture = obj.user_stickers.filter(user=request.user).first()
        return capture.status if capture else None


class AlbumSerializer(serializers.ModelSerializer):
    stickers_count = serializers.IntegerField(source="stickers.count", read_only=True)

    class Meta:
        model = Album
        fields = (
            "id",
            "title",
            "description",
            "theme",
            "cover_image",
            "is_premium",
            "price",
            "stickers_count",
        )


class AlbumDetailSerializer(AlbumSerializer):
    stickers = StickerSerializer(many=True, read_only=True)

    class Meta(AlbumSerializer.Meta):
        fields = AlbumSerializer.Meta.fields + ("stickers",)


class AlbumCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = (
            "id",
            "title",
            "description",
            "theme",
            "cover_image",
            "is_premium",
            "price",
        )
        read_only_fields = ("id",)


class StickerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sticker
        fields = (
            "album",
            "name",
            "description",
            "location_lat",
            "location_lng",
            "image_reference",
            "reward_points",
            "order",
            "rarity",
        )
