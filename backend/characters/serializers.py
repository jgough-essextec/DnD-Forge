from rest_framework import serializers

from .models import Character


class CharacterSerializer(serializers.ModelSerializer):
    """Serializer for Character CRUD operations."""

    class Meta:
        model = Character
        fields = [
            "id",
            "name",
            "race",
            "class_name",
            "level",
            "ability_scores",
            "skills",
            "equipment",
            "spells",
            "background",
            "hp",
            "character_data",
            "campaign",
            "owner",
            "is_archived",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "owner"]

    def validate_level(self, value):
        if value < 1 or value > 20:
            raise serializers.ValidationError("Level must be between 1 and 20.")
        return value

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Name must not be empty.")
        return value
