from rest_framework import serializers

from characters.models import Character

from .models import Campaign


class CharacterSummarySerializer(serializers.ModelSerializer):
    """Read-only summary of a character, used when nested inside a campaign."""

    class Meta:
        model = Character
        fields = ["id", "name", "race", "class_name", "level", "owner"]
        read_only_fields = fields


class CampaignSerializer(serializers.ModelSerializer):
    """Serializer for Campaign CRUD operations."""

    characters = CharacterSummarySerializer(many=True, read_only=True)

    class Meta:
        model = Campaign
        fields = [
            "id",
            "name",
            "description",
            "join_code",
            "owner",
            "settings",
            "characters",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "join_code", "created_at", "updated_at", "owner"]
