import json
import re

from django.utils import timezone
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


class CharacterExportSerializer(serializers.ModelSerializer):
    """
    Serializer that formats a Character for JSON export.
    Wraps the character data with metadata (format version, app version, timestamp).
    Excludes internal fields: id, owner, created_at, updated_at.
    """

    class Meta:
        model = Character
        fields = [
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
            "is_archived",
        ]

    def to_representation(self, instance):
        character_data = super().to_representation(instance)
        return {
            "formatVersion": "1.0",
            "appVersion": "1.0.0",
            "exportedAt": timezone.now().isoformat(),
            "character": character_data,
        }


class CharacterImportSerializer(serializers.Serializer):
    """
    Serializer for importing a character from a JSON file.
    Performs multi-stage validation:
      1. JSON syntax validation (handled before this serializer)
      2. Schema validation (required fields)
      3. Type validation
      4. Business rule validation (ability score ranges, level bounds)
    """

    file = serializers.FileField(required=False)

    # These are extracted from the parsed JSON, not from form fields.
    # We validate them manually.

    def validate(self, attrs):
        request = self.context.get("request")
        if not request:
            raise serializers.ValidationError("Request context is required.")

        # Check for uploaded file
        uploaded_file = request.FILES.get("file")
        raw_body = None

        if uploaded_file:
            # File size limit: 1MB
            if uploaded_file.size > 1_048_576:
                raise serializers.ValidationError(
                    {"file": "File size exceeds 1MB limit."}
                )
            raw_body = uploaded_file.read().decode("utf-8")
        else:
            # Try reading JSON from request body
            raw_body = request.body.decode("utf-8")

        if not raw_body:
            raise serializers.ValidationError(
                {"file": "No file or JSON body provided."}
            )

        # Stage 1: JSON syntax validation
        try:
            data = json.loads(raw_body)
        except (json.JSONDecodeError, ValueError) as e:
            raise serializers.ValidationError(
                {"file": f"Invalid JSON: {str(e)}"}
            )

        # Support both wrapped format (with "character" key) and flat format
        if isinstance(data, dict) and "character" in data:
            character_data = data["character"]
        else:
            character_data = data

        if not isinstance(character_data, dict):
            raise serializers.ValidationError(
                {"file": "Expected a JSON object for character data."}
            )

        # Stage 2: Schema validation (required fields)
        required_fields = ["name", "race", "class_name", "level", "ability_scores"]
        missing = [f for f in required_fields if f not in character_data]
        if missing:
            raise serializers.ValidationError(
                {"file": f"Missing required fields: {', '.join(missing)}"}
            )

        # Stage 3: Type validation
        errors = {}
        warnings = []

        if not isinstance(character_data.get("name"), str):
            errors["name"] = "Must be a string."
        elif not character_data["name"].strip():
            errors["name"] = "Must not be empty."

        if not isinstance(character_data.get("race"), str):
            errors["race"] = "Must be a string."

        if not isinstance(character_data.get("class_name"), str):
            errors["class_name"] = "Must be a string."

        if not isinstance(character_data.get("level"), (int, float)):
            errors["level"] = "Must be a number."

        if not isinstance(character_data.get("ability_scores"), dict):
            errors["ability_scores"] = "Must be an object."

        if errors:
            raise serializers.ValidationError(errors)

        # Stage 4: Business rule validation
        level = int(character_data["level"])
        if level < 1 or level > 20:
            errors["level"] = "Level must be between 1 and 20."

        ability_scores = character_data["ability_scores"]
        for key, value in ability_scores.items():
            if not isinstance(value, (int, float)):
                errors[f"ability_scores.{key}"] = f"Score '{key}' must be a number."
            elif int(value) < 3 or int(value) > 30:
                warnings.append(
                    f"Ability score '{key}' value {value} is outside normal range (3-30)."
                )

        if errors:
            raise serializers.ValidationError(errors)

        # Build validated character data
        validated = {
            "name": character_data["name"].strip(),
            "race": character_data["race"],
            "class_name": character_data["class_name"],
            "level": level,
            "ability_scores": ability_scores,
            "skills": character_data.get("skills", []),
            "equipment": character_data.get("equipment", []),
            "spells": character_data.get("spells", []),
            "background": character_data.get("background", ""),
            "hp": character_data.get("hp", 0),
            "character_data": character_data.get("character_data", {}),
            "is_archived": character_data.get("is_archived", False),
        }

        attrs["character_data_parsed"] = validated
        attrs["warnings"] = warnings
        return attrs

    def create(self, validated_data):
        char_data = validated_data["character_data_parsed"]
        owner = self.context["request"].user
        character = Character.objects.create(owner=owner, **char_data)
        return character
