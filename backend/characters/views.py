import json
import re
from datetime import timedelta

from django.http import HttpResponse as DjangoHttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from .models import Character, CharacterShareToken
from .permissions import IsOwner
from .serializers import (
    CharacterExportSerializer,
    CharacterImportSerializer,
    CharacterSerializer,
)


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

    @action(detail=True, methods=["get"], url_path="export")
    def export(self, request, pk=None):
        """Export a character as a downloadable JSON file."""
        character = self.get_object()  # handles 404 + permission checks
        serializer = CharacterExportSerializer(character)
        data = serializer.data

        # Sanitize name for filename
        safe_name = re.sub(r"[^\w\s-]", "", character.name).strip().replace(" ", "-")
        if not safe_name:
            safe_name = "character"

        response = DjangoHttpResponse(
            json.dumps(data, indent=2),
            content_type="application/json",
        )
        response["Content-Disposition"] = (
            f'attachment; filename="character-{safe_name}.json"'
        )
        return response

    @action(detail=False, methods=["post"], url_path="import")
    def import_character(self, request):
        """Import a character from a JSON file or JSON body."""
        serializer = CharacterImportSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        character = serializer.save()

        # Return the created character using the standard serializer
        output_serializer = CharacterSerializer(character)
        warnings = serializer.validated_data.get("warnings", [])
        response_data = {
            "character": output_serializer.data,
            "warnings": warnings,
        }
        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="share")
    def share(self, request, pk=None):
        """Generate or return an existing share token for a character."""
        character = self.get_object()  # handles 404 + permission checks

        # Reuse an existing non-expired token if one exists
        existing_token = (
            CharacterShareToken.objects.filter(
                character=character,
                expires_at__gt=timezone.now(),
            )
            .order_by("-created_at")
            .first()
        )

        if existing_token:
            token = existing_token
        else:
            token = CharacterShareToken.objects.create(
                character=character,
                expires_at=timezone.now() + timedelta(days=7),
            )

        return Response(
            {
                "token": str(token.token),
                "url": f"/shared/{token.token}",
                "expires_at": token.expires_at.isoformat(),
            },
            status=status.HTTP_200_OK,
        )


class SharedCharacterView(APIView):
    """
    Public endpoint for viewing a shared character via token.
    No authentication required.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, token):
        try:
            share_token = CharacterShareToken.objects.select_related(
                "character"
            ).get(token=token)
        except CharacterShareToken.DoesNotExist:
            return Response(
                {"detail": "Share link not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if share_token.is_expired():
            return Response(
                {"detail": "This share link has expired."},
                status=status.HTTP_410_GONE,
            )

        serializer = CharacterExportSerializer(share_token.character)
        return Response(serializer.data, status=status.HTTP_200_OK)
