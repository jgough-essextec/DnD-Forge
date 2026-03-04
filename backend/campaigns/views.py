from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from characters.models import Character
from characters.permissions import IsOwner
from characters.serializers import CharacterListSerializer

from .models import Campaign
from .permissions import IsCampaignMember
from .serializers import CampaignSerializer


class CampaignViewSet(ModelViewSet):
    """
    ViewSet for Campaign CRUD. Returns campaigns the user owns OR has
    a character in.

    Includes custom actions for joining, archiving, regenerating
    join codes, managing characters, viewing party, and leaving.
    """

    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ('retrieve', 'party', 'leave'):
            return [IsAuthenticated(), IsCampaignMember()]
        if self.action in ('update', 'partial_update', 'destroy', 'archive',
                           'regenerate_code', 'remove_character'):
            return [IsAuthenticated(), IsOwner()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        return Campaign.objects.filter(
            Q(owner=user) | Q(characters__owner=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    # ------------------------------------------------------------------
    # Join
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        """
        Join a character to this campaign.

        Expects JSON body: {"join_code": "ABC123", "character_id": "<uuid>"}
        Validates that the join_code matches the campaign and that the
        character is owned by the requesting user.
        """
        # Bypass normal object permissions for join — the user isn't a
        # member yet. We look up the campaign directly.
        try:
            campaign = Campaign.objects.get(pk=pk)
        except Campaign.DoesNotExist:
            return Response(
                {"detail": "Campaign not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

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

        if character.campaign and character.campaign != campaign:
            return Response(
                {"detail": "Character is already in another campaign."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        character.campaign = campaign
        character.save()

        return Response(
            {"detail": f"Character '{character.name}' joined campaign '{campaign.name}'."},
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------
    # Archive
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        """
        Toggle the is_archived flag on a campaign.
        """
        campaign = self.get_object()
        campaign.is_archived = not campaign.is_archived
        campaign.save()

        state = "archived" if campaign.is_archived else "unarchived"
        serializer = self.get_serializer(campaign)
        return Response(
            {"detail": f"Campaign '{campaign.name}' has been {state}.", "campaign": serializer.data},
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------
    # Regenerate join code
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="regenerate-code")
    def regenerate_code(self, request, pk=None):
        """
        Generate a new join code for the campaign, invalidating the old one.
        """
        campaign = self.get_object()
        campaign.join_code = Campaign.generate_join_code()
        campaign.save()

        serializer = self.get_serializer(campaign)
        return Response(
            {"detail": "Join code regenerated.", "campaign": serializer.data},
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------
    # Remove character (DM action)
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="remove-character")
    def remove_character(self, request, pk=None):
        """
        Remove a character from this campaign (unlink, not delete).

        Expects JSON body: {"character_id": "<uuid>"}
        """
        campaign = self.get_object()
        character_id = request.data.get("character_id")

        if not character_id:
            return Response(
                {"detail": "character_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            character = Character.objects.get(id=character_id, campaign=campaign)
        except Character.DoesNotExist:
            return Response(
                {"detail": "Character not found in this campaign."},
                status=status.HTTP_404_NOT_FOUND,
            )

        character.campaign = None
        character.save()

        return Response(
            {"detail": f"Character '{character.name}' removed from campaign '{campaign.name}'."},
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------
    # Joined campaigns (player view)
    # ------------------------------------------------------------------

    @action(detail=False, methods=["get"])
    def joined(self, request):
        """
        Return campaigns where the user has a character but is NOT the owner.
        """
        campaigns = Campaign.objects.filter(
            characters__owner=request.user
        ).exclude(owner=request.user).distinct()

        serializer = self.get_serializer(campaigns, many=True)
        return Response(serializer.data)

    # ------------------------------------------------------------------
    # Party members
    # ------------------------------------------------------------------

    @action(detail=True, methods=["get"])
    def party(self, request, pk=None):
        """
        Return all characters in the campaign with gallery-card-level data.
        Permission: IsCampaignMember (owner or has character in campaign).
        """
        campaign = self.get_object()
        characters = Character.objects.filter(campaign=campaign)
        serializer = CharacterListSerializer(characters, many=True)
        return Response(serializer.data)

    # ------------------------------------------------------------------
    # Leave campaign (player action)
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"])
    def leave(self, request, pk=None):
        """
        Remove all of the requesting user's characters from this campaign.
        The campaign owner (DM) cannot leave their own campaign.
        """
        campaign = self.get_object()

        if campaign.owner == request.user:
            return Response(
                {"detail": "The campaign owner cannot leave their own campaign."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_characters = Character.objects.filter(
            campaign=campaign, owner=request.user
        )
        count = user_characters.update(campaign=None)

        return Response(
            {"detail": f"Left campaign '{campaign.name}'. {count} character(s) removed."},
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------
    # Lookup by join code
    # ------------------------------------------------------------------

    @action(detail=False, methods=["get"], url_path="lookup/(?P<code>[A-Za-z0-9]{6})")
    def lookup_by_code(self, request, code=None):
        """
        Look up a campaign by its 6-character join code.
        Returns minimal info for a join preview.
        """
        try:
            campaign = Campaign.objects.get(join_code=code.upper())
        except Campaign.DoesNotExist:
            return Response(
                {"detail": "Campaign not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            "id": str(campaign.id),
            "name": campaign.name,
            "description": campaign.description,
            "characterCount": campaign.characters.count(),
        })

    # ------------------------------------------------------------------
    # Destroy
    # ------------------------------------------------------------------

    def perform_destroy(self, instance):
        """
        On campaign deletion, unlink all characters (don't delete them).
        """
        instance.characters.update(campaign=None)
        instance.delete()
