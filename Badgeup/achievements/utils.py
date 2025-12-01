from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import FriendRequest


def get_friend_ids(user_id: int) -> list[int]:
    accepted = FriendRequest.objects.filter(
        status=FriendRequest.STATUS_ACCEPTED,
        from_user_id=user_id,
    ).values_list("to_user_id", flat=True)
    accepted_rev = FriendRequest.objects.filter(
        status=FriendRequest.STATUS_ACCEPTED,
        to_user_id=user_id,
    ).values_list("from_user_id", flat=True)
    return list(set(accepted) | set(accepted_rev))


def send_notification(user_ids: list[int], payload: dict, broadcast: bool = False):
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
    if broadcast:
        async_to_sync(channel_layer.group_send)("broadcast", {"type": "notification", "payload": payload})
    for uid in user_ids:
        async_to_sync(channel_layer.group_send)(
            f"user_{uid}",
            {"type": "notification", "payload": payload},
        )
