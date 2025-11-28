from django.urls import path

from achievements.views import StickerUnlockView

from .views import StickerDetailView, StickerListCreateView

urlpatterns = [
    path("", StickerListCreateView.as_view(), name="sticker-list-create"),
    path("<int:pk>/", StickerDetailView.as_view(), name="sticker-detail-global"),
    path("<int:pk>/unlock/", StickerUnlockView.as_view(), name="sticker-unlock-global"),
]
