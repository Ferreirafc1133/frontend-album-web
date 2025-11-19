from django.db import models


class Album(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    theme = models.CharField(max_length=255, blank=True)
    cover_image = models.ImageField(upload_to="albums/covers/", blank=True, null=True)
    is_premium = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self) -> str:
        return self.title


class Sticker(models.Model):
    album = models.ForeignKey(
        Album,
        related_name="stickers",
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    location_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    image_reference = models.ImageField(
        upload_to="stickers/reference/",
        blank=True,
        null=True,
    )
    reward_points = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]
        unique_together = ("album", "name")

    def __str__(self) -> str:
        return f"{self.album.title} - {self.name}"
