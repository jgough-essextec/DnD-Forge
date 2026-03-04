from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from characters.models import Character
from characters.permissions import IsOwner

from .models import Campaign
from .serializers import CampaignSerializer


class CampaignViewSet(ModelViewSet):
    """
    ViewSet for Campaign CRUD. Only returns campaigns owned by
    the requesting user.

    Includes a custom 'join' action to add a character to a campaign
    via the campaign's join code.
    """

    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Campaign.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        """
        Join a character to this campaign.

        Expects JSON body: {"join_code": "ABC123", "character_id": "<uuid>"}
        Validates that the join_code matches the campaign and that the
        character is owned by the requesting user.
        """
        campaign = self.get_object()

        join_code = request.data.get("join_code")
        character_id = request.data.get("character_id")

        if not join_code or not character_id:
            return Response(
                {"detail": "Both join_code and character_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if campaign.join_code != join_code:
            return Response(
                {"detail": "Invalid join code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            character = Character.objects.get(id=character_id, owner=request.user)
        except Character.DoesNotExist:
            return Response(
                {"detail": "Character not found or not owned by you."},
                status=status.HTTP_404_NOT_FOUND,
            )

        character.campaign = campaign
        character.save()

        return Response(
            {"detail": f"Character '{character.name}' joined campaign '{campaign.name}'."},
            status=status.HTTP_200_OK,
        )
