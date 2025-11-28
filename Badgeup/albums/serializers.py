from rest_framework import serializers

from .models import Album, Sticker


class StickerSerializer(serializers.ModelSerializer):
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
            "reward_points",
            "order",
        )
        read_only_fields = ("album",)


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
