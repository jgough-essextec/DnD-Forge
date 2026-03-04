from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from .models import Character
from .permissions import IsOwner
from .serializers import CharacterSerializer


class CharacterViewSet(ModelViewSet):
    """
    ViewSet for Character CRUD. Only returns characters owned by
    the requesting user. Excludes archived characters by default.
    """

    serializer_class = CharacterSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        qs = Character.objects.filter(owner=self.request.user)
        include_archived = self.request.query_params.get("include_archived", "").lower()
        if include_archived not in ("true", "1", "yes"):
            qs = qs.filter(is_archived=False)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
