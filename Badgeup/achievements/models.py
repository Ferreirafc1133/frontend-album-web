from django.conf import settings
from django.db import models

from albums.models import Sticker


class UserSticker(models.Model):
    """
    Represents a sticker unlocked (or pending validation) by a user.
    """

    STATUS_PENDING = "pending"
    STATUS_VALIDATING = "validating"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_VALIDATING, "Validating"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="user_stickers",
        on_delete=models.CASCADE,
    )
    sticker = models.ForeignKey(
        Sticker,
        related_name="user_stickers",
        on_delete=models.CASCADE,
    )
    photo = models.ImageField(upload_to="user_stickers/", blank=True, null=True)
    photo_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    validated = models.BooleanField(default=False)
    validated_at = models.DateTimeField(blank=True, null=True)
    validation_notes = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "sticker")
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"{self.user} - {self.sticker}"
