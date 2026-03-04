from django.urls import path

from .views import CharacterPDFView

urlpatterns = [
    path(
        "characters/<uuid:character_id>/pdf/",
        CharacterPDFView.as_view(),
        name="character-pdf",
    ),
]
