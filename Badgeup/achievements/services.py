import base64
import logging
from typing import Any, Dict, Optional

from django.conf import settings

from albums.models import Sticker
from .models import UserSticker

logger = logging.getLogger(__name__)


def _image_payload(user_sticker: UserSticker) -> Optional[Dict[str, Any]]:
    if user_sticker.photo_url:
        return {"type": "input_image", "image_url": user_sticker.photo_url}

    if user_sticker.photo:
        try:
            with user_sticker.photo.open("rb") as uploaded:
                encoded = base64.b64encode(uploaded.read()).decode("utf-8")
            return {
                "type": "input_image",
                "image_url": f"data:image/jpeg;base64,{encoded}",
            }
        except FileNotFoundError:
            logger.warning("UserSticker photo file not found for id=%s", user_sticker.id)
        except (NotImplementedError, ValueError):
            try:
                return {"type": "input_image", "image_url": user_sticker.photo.url}
            except ValueError:
                logger.warning("Unable to resolve URL for UserSticker photo id=%s", user_sticker.id)

    return None


def analyze_user_sticker(user_sticker: UserSticker) -> dict[str, Any]:
    """
    Call OpenAI Vision model to verify the uploaded sticker photo.
    Returns a dict with the decision and any metadata required by the caller.
    """

    image_payload = _image_payload(user_sticker)
    if not image_payload:
        return {
            "approved": False,
            "reason": "No image provided",
        }

    if not settings.OPENAI_API_KEY:
        # Development fallback: auto approve and record reason.
        return {
            "approved": True,
            "reason": "OpenAI API key missing - auto-approved (development mode).",
            "details": {},
        }

    try:
        from openai import OpenAI

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        sticker: Sticker = user_sticker.sticker
        prompt = (
            "You are validating BadgeUp sticker submissions. "
            f"Confirm the image matches the context '{sticker.name}' from album '{sticker.album.title}'. "
            "Answer with YES if it matches, otherwise NO and include a short reason."
        )

        response = client.responses.create(
            model="gpt-4.1-mini",
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": prompt},
                        image_payload,
                    ],
                }
            ],
        )
        decision_text = response.output_text.strip().lower()
        approved = decision_text.startswith("yes")
        return {
            "approved": approved,
            "decision_text": decision_text,
        }

    except Exception as exc:  # pragma: no cover - depends on external API
        logger.exception("OpenAI validation failed for UserSticker %s", user_sticker.id)
        return {
            "approved": False,
            "error": str(exc),
        }
