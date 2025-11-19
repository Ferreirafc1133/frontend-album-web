import logging

from celery import shared_task
from django.db.models import F
from django.utils import timezone

from .models import UserSticker
from .services import analyze_user_sticker

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def validate_user_sticker(self, user_sticker_id: int):
    try:
        user_sticker = UserSticker.objects.select_related("sticker", "user").get(
            pk=user_sticker_id
        )
    except UserSticker.DoesNotExist:
        logger.warning("UserSticker %s no longer exists.", user_sticker_id)
        return

    if user_sticker.validated:
        logger.info("UserSticker %s already validated. Skipping.", user_sticker_id)
        return

    user_sticker.status = UserSticker.STATUS_VALIDATING
    user_sticker.save(update_fields=["status", "updated_at"])

    result = analyze_user_sticker(user_sticker)
    approved = result.get("approved", False)
    status_value = (
        UserSticker.STATUS_APPROVED if approved else UserSticker.STATUS_REJECTED
    )

    user_sticker.status = status_value
    user_sticker.validated = approved
    user_sticker.validated_at = timezone.now() if approved else None
    user_sticker.validation_notes = result
    user_sticker.save(
        update_fields=[
            "status",
            "validated",
            "validated_at",
            "validation_notes",
            "updated_at",
        ]
    )

    if approved:
        reward = user_sticker.sticker.reward_points
        type(user_sticker.user).objects.filter(pk=user_sticker.user_id).update(
            points=F("points") + reward
        )
        logger.info(
            "UserSticker %s approved; awarded %s points to user %s",
            user_sticker_id,
            reward,
            user_sticker.user_id,
        )
    else:
        logger.info("UserSticker %s rejected: %s", user_sticker_id, result)
