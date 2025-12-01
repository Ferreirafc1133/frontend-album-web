"""
ASGI config for badgeup project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "badgeup.settings")

# Inicializa Django primero
http_app = get_asgi_application()

# Importa middleware y rutas de websockets después de que Django esté listo
from achievements.auth import JwtAuthMiddlewareStack  # noqa: E402
from achievements.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": http_app,
        "websocket": JwtAuthMiddlewareStack(
            URLRouter(websocket_urlpatterns),
        ),
    }
)
