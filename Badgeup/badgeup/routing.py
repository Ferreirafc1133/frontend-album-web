from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from albums.routing import websocket_urlpatterns as album_websocket_urlpatterns

# Único set de rutas websocket (chat y notificaciones) basado en los consumers de albums,
# que autenticán via token JWT en la query (?token=...).
websocket_urlpatterns = [*album_websocket_urlpatterns]

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    }
)
