from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CharacterViewSet, SharedCharacterView

router = DefaultRouter()
router.register("characters", CharacterViewSet, basename="character")

urlpatterns = router.urls + [
    path(
        "shared/<uuid:token>/",
        SharedCharacterView.as_view(),
        name="shared-character",
    ),
]
