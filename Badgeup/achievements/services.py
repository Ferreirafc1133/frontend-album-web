import base64
import json
import logging
from typing import Any, Dict, Iterable, Optional

from django.conf import settings

from albums.models import Sticker
from badgeup.openai_client import get_openai_client
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


def _sticker_reference_payload(sticker: Sticker) -> Optional[Dict[str, Any]]:
    """
    Build an image payload for the sticker reference if available.
    """
    if not sticker.image_reference:
        return None
    try:
        with sticker.image_reference.open("rb") as ref:
            encoded = base64.b64encode(ref.read()).decode("utf-8")
        return {"type": "input_image", "image_url": f"data:image/jpeg;base64,{encoded}"}
    except FileNotFoundError:
        logger.warning("Sticker reference image not found for id=%s", sticker.id)
    except (NotImplementedError, ValueError):
        try:
            return {"type": "input_image", "image_url": sticker.image_reference.url}
        except ValueError:
            logger.warning("Unable to resolve URL for sticker reference id=%s", sticker.id)
    return None


def analyze_car_photo(photo_file, stickers: Iterable[Sticker]) -> dict[str, Any]:
    """
    Usa OpenAI Vision para identificar un coche en una foto y elegir el sticker que mejor coincide,
    únicamente con nombres/descripciones de stickers (sin imágenes de referencia).
    """
    if not settings.USE_OPENAI_STICKER_VALIDATION:
        return {"error": "validación por IA deshabilitada"}

    try:
        client = get_openai_client()
    except Exception as exc:  # pragma: no cover
        logger.exception("No se pudo inicializar el cliente de OpenAI")
        return {"error": str(exc)}

    # Codificar la foto del usuario
    try:
        encoded = base64.b64encode(photo_file.read()).decode("utf-8")
        data_url = f"data:image/jpeg;base64,{encoded}"
    except Exception as exc:
        logger.exception("No se pudo leer la foto del usuario")
        return {"error": f"Foto inválida: {exc}"}
    finally:
        try:
            photo_file.seek(0)
        except Exception:
            pass

    stickers_text_lines = [
        f"{s.id}: {s.name}" + (f" - {s.description}" if s.description else "")
        for s in stickers
    ]
    stickers_text = "Stickers disponibles:\n" + "\n".join(stickers_text_lines)

    system_msg = (
        "Eres un experto en autos. Te doy una foto de un coche real y una lista de stickers (id, nombre, descripción). "
        "Solo con tu conocimiento y esa lista, identifica marca, modelo, generación o versión, rango aproximado de años, "
        "y elige qué sticker coincide mejor. Responde SOLO un JSON con: "
        '{ "make": str, "model": str, "generation": str|null, "year_range": str|null, '
        '"confidence": float 0-1, "sticker_id": int|null, "reason": str }.'
    )

    user_text = (
        "Lista de stickers disponibles:\n"
        f"{stickers_text}\n\n"
        "Ahora te mando la foto del coche. Usa solo tu conocimiento y los nombres/descripciones de los stickers para decidir cuál corresponde."
    )

    try:
        completion = client.chat.completions.create(
            model="gpt-4.1-mini",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": system_msg,
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": user_text,
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": data_url},
                        },
                    ],
                },
            ],
            max_tokens=300,
        )
        raw_output = completion.choices[0].message.content or ""
        data = json.loads(raw_output)
        data.setdefault("sticker_id", None)
        data.setdefault("confidence", 0)
        data.setdefault("make", "")
        data.setdefault("model", "")
        data.setdefault("generation", None)
        data.setdefault("year_range", None)
        data.setdefault("reason", "")
        data["request_id"] = getattr(completion, "id", None)
        return data
    except json.JSONDecodeError as exc:
        logger.exception("No se pudo parsear la respuesta de OpenAI")
        return {"error": f"Respuesta inválida de OpenAI: {exc}"}
    except Exception as exc:  # pragma: no cover - dependiente de API externa
        logger.exception("Error llamando a OpenAI para análisis de coche")
        return {"error": str(exc)}


def analyze_user_sticker(user_sticker: UserSticker) -> dict[str, Any]:
    """
    Validate a user sticker submission using OpenAI Vision when enabled.
    Falls back to auto-approve when no API key is configured.
    """

    user_image = _image_payload(user_sticker)
    if not user_image:
        return {"approved": False, "reason": "No image provided"}

    sticker: Sticker = user_sticker.sticker
    reference_image = _sticker_reference_payload(sticker)

    if not settings.USE_OPENAI_STICKER_VALIDATION:
        return {
            "approved": True,
            "reason": "OpenAI validation disabled or missing API key - auto-approved (development mode).",
            "details": {},
        }

    try:
        client = get_openai_client()
    except Exception as exc:  # pragma: no cover - guarded by flag
        logger.exception("OpenAI client unavailable: %s", exc)
        return {"approved": False, "error": str(exc)}

    prompt_parts = [
        "Evalúa si la foto del usuario corresponde al mismo automóvil que el sticker de referencia.",
        f"Sticker: {sticker.name}.",
    ]
    if sticker.album:
        prompt_parts.append(f"Álbum: {sticker.album.title}.")
    if sticker.description:
        prompt_parts.append(f"Descripción: {sticker.description}.")

    prompt_parts.append(
        'Responde SOLO en JSON con la forma: {"match_score": 0-1, "is_match": true|false, "reason": "texto breve"}'
    )
    prompt = " ".join(prompt_parts)

    content = [
        {"type": "input_text", "text": prompt},
    ]
    if reference_image:
        content.append(reference_image)
    content.append(user_image)

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=[
                {
                    "role": "user",
                    "content": content,
                }
            ],
            max_output_tokens=200,
        )
        raw_output = response.output_text.strip()
        data = json.loads(raw_output)
        match_score = float(data.get("match_score", 0) or 0)
        is_match = bool(data.get("is_match"))
        reason = data.get("reason", "")
        approved = is_match and match_score >= 0.6
        request_id = getattr(response, "id", None)

        return {
            "approved": approved,
            "match_score": match_score,
            "is_match": is_match,
            "reason": reason,
            "raw_response": data,
            "request_id": request_id,
        }

    except json.JSONDecodeError as exc:
        logger.exception("Failed to parse OpenAI response for UserSticker %s", user_sticker.id)
        return {"approved": False, "error": f"Invalid JSON response: {exc}"}
    except Exception as exc:  # pragma: no cover - external dependency
        logger.exception("OpenAI validation failed for UserSticker %s", user_sticker.id)
        return {"approved": False, "error": str(exc)}
