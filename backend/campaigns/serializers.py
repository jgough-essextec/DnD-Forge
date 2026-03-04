from rest_framework import serializers

from characters.models import Character

from .models import Campaign, Encounter


class CharacterSummarySerializer(serializers.ModelSerializer):
    """Read-only summary of a character, used when nested inside a campaign."""

    class Meta:
        model = Character
        fields = ["id", "name", "race", "class_name", "level", "owner"]
        read_only_fields = fields


class EncounterSerializer(serializers.ModelSerializer):
    """Serializer for Encounter CRUD operations."""

    class Meta:
        model = Encounter
        fields = [
            "id",
            "campaign",
            "name",
            "combatants",
            "round",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class CampaignSerializer(serializers.ModelSerializer):
    """Serializer for Campaign CRUD operations."""

    characters = CharacterSummarySerializer(many=True, read_only=True)
    character_count = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            "id",
            "name",
            "description",
            "join_code",
            "owner",
            "settings",
            "is_archived",
            "characters",
            "character_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "join_code", "created_at", "updated_at", "owner"]

    def get_character_count(self, obj):
        return obj.characters.count()
