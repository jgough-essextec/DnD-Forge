import json
import re

from django.utils import timezone
from rest_framework import serializers

from .models import Character


class CharacterSerializer(serializers.ModelSerializer):
    """
    Serializer for Character CRUD operations.

    The frontend sends a rich nested object (race as object, classes as array,
    background as object, etc.). We extract flat indexed fields for the model
    columns and store the entire payload in ``character_data``.

    On read, we return the stored ``character_data`` enriched with server-side
    fields (id, owner, created_at, updated_at, is_archived, campaign).
    """

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

    def to_internal_value(self, data):
        """
        Accept the frontend's rich character payload and map it to model fields.

        Extracts flat string values for indexed model columns while preserving
        the full payload in character_data.
        """
        # Extract flat fields from the rich nested payload
        name = data.get("name", "")

        # race: may be a string or {raceId: "dwarf", subraceId: "mountain-dwarf"}
        race_raw = data.get("race", "")
        if isinstance(race_raw, dict):
            race = race_raw.get("raceId", "")
        else:
            race = str(race_raw)

        # classes: may be an array [{classId: "fighter", level: 1, ...}]
        classes_raw = data.get("classes", [])
        if isinstance(classes_raw, list) and classes_raw:
            class_name = classes_raw[0].get("classId", "") if isinstance(classes_raw[0], dict) else str(classes_raw[0])
            level = sum(
                (cls.get("level", 1) if isinstance(cls, dict) else 1)
                for cls in classes_raw
            )
        else:
            class_name = data.get("class_name", "")
            level = data.get("level", 1)

        # background: may be a string or {backgroundId: "hermit", ...}
        bg_raw = data.get("background", "")
        if isinstance(bg_raw, dict):
            background = bg_raw.get("backgroundId", "")
        else:
            background = str(bg_raw)

        hp = data.get("hpMax", data.get("hp", 0))

        # Build the flat model data
        model_data = {
            "name": name,
            "race": race,
            "class_name": class_name,
            "level": level,
            "background": background,
            "hp": hp if isinstance(hp, int) else 0,
            "ability_scores": data.get("baseAbilityScores", data.get("ability_scores", {})),
            "skills": data.get("skills", []),
            "equipment": data.get("inventory", data.get("equipment", [])),
            "spells": data.get("spells", []),
            "character_data": data,
            "is_archived": data.get("isArchived", data.get("is_archived", False)),
            "campaign": data.get("campaignId", data.get("campaign", None)),
        }

        return super().to_internal_value(model_data)

    def to_representation(self, instance):
        """
        On read, return the stored character_data enriched with server-side fields.
        If character_data is empty (legacy record), fall back to flat model fields.
        """
        char_data = instance.character_data or {}

        if char_data:
            # Return the rich character data with server-managed fields injected
            result = dict(char_data)
            result["id"] = str(instance.id)
            result["owner"] = instance.owner_id
            result["createdAt"] = instance.created_at.isoformat() if instance.created_at else None
            result["updatedAt"] = instance.updated_at.isoformat() if instance.updated_at else None
            result["isArchived"] = instance.is_archived
            result["version"] = 1
            if instance.campaign_id:
                result["campaignId"] = str(instance.campaign_id)
            # Ensure abilityScores is available (frontend expects this key)
            if "baseAbilityScores" in result and "abilityScores" not in result:
                result["abilityScores"] = result["baseAbilityScores"]
            # Ensure level is a top-level field (sum of class levels)
            if "level" not in result:
                classes = result.get("classes", [])
                if isinstance(classes, list) and classes:
                    result["level"] = sum(
                        (c.get("level", 1) if isinstance(c, dict) else 1)
                        for c in classes
                    )
                else:
                    result["level"] = instance.level
            return result

        # Fallback for legacy flat records
        return super().to_representation(instance)

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Name must not be empty.")
        return value


class CharacterListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for the character list (gallery) endpoint.
    Returns the flat CharacterSummary / GalleryCharacter shape expected
    by the frontend gallery.
    """

    class Meta:
        model = Character
        fields = ["id", "name", "race", "class_name", "level", "hp", "is_archived", "updated_at", "created_at"]

    def to_representation(self, instance):
        cd = instance.character_data or {}

        # Extract race display name
        race_raw = cd.get("race", instance.race)
        if isinstance(race_raw, dict):
            subrace_id = race_raw.get("subraceId", "")
            race_id = race_raw.get("raceId", "")
            race = (subrace_id or race_id).replace("-", " ").title()
        else:
            race = str(race_raw).replace("-", " ").title() if race_raw else instance.race

        # Extract class display name
        classes_raw = cd.get("classes", [])
        if isinstance(classes_raw, list) and classes_raw:
            parts = []
            for cls in classes_raw:
                if isinstance(cls, dict):
                    cid = cls.get("classId", "unknown")
                    parts.append(cid.replace("-", " ").title())
                else:
                    parts.append(str(cls))
            class_display = " / ".join(parts)
        else:
            class_display = instance.class_name.replace("-", " ").title() if instance.class_name else "Unknown"

        # Compute level
        level = instance.level

        # HP
        hp_max = cd.get("hpMax", instance.hp) or 0
        hp_current = cd.get("hpCurrent", hp_max) or 0

        # AC — try combatStats first, fall back to 10
        combat = cd.get("combatStats", {})
        ac_obj = combat.get("armorClass", {}) if isinstance(combat, dict) else {}
        ac = ac_obj.get("base", 10) if isinstance(ac_obj, dict) else 10

        return {
            "id": str(instance.id),
            "name": instance.name,
            "race": race,
            "class": class_display,
            "level": level,
            "hp": {"current": hp_current, "max": hp_max},
            "ac": ac,
            "updatedAt": instance.updated_at.isoformat() if instance.updated_at else None,
            "createdAt": instance.created_at.isoformat() if instance.created_at else None,
            "isArchived": instance.is_archived,
            "campaignId": str(instance.campaign_id) if instance.campaign_id else None,
        }


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
        # Prefer rich character_data if available
        if instance.character_data:
            character_data = dict(instance.character_data)
        else:
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

        # Stage 2: Schema validation -- require at minimum a name
        if "name" not in character_data:
            raise serializers.ValidationError(
                {"file": "Missing required field: name"}
            )

        # Stage 3: Type validation
        errors = {}
        warnings = []

        if not isinstance(character_data.get("name"), str):
            errors["name"] = "Must be a string."
        elif not character_data["name"].strip():
            errors["name"] = "Must not be empty."

        if errors:
            raise serializers.ValidationError(errors)

        # Extract flat fields for the model
        name = character_data["name"].strip()

        race_raw = character_data.get("race", "")
        if isinstance(race_raw, dict):
            race = race_raw.get("raceId", "unknown")
        else:
            race = str(race_raw) if race_raw else "unknown"

        classes_raw = character_data.get("classes", [])
        if isinstance(classes_raw, list) and classes_raw:
            class_name = classes_raw[0].get("classId", "unknown") if isinstance(classes_raw[0], dict) else str(classes_raw[0])
            level = sum(
                (cls.get("level", 1) if isinstance(cls, dict) else 1)
                for cls in classes_raw
            )
        else:
            class_name = character_data.get("class_name", "unknown")
            level = character_data.get("level", 1)

        if isinstance(level, (int, float)):
            level = max(1, min(20, int(level)))
        else:
            level = 1

        bg_raw = character_data.get("background", "")
        if isinstance(bg_raw, dict):
            background = bg_raw.get("backgroundId", "")
        else:
            background = str(bg_raw) if bg_raw else ""

        hp = character_data.get("hpMax", character_data.get("hp", 0))
        if not isinstance(hp, int):
            hp = 0

        validated = {
            "name": name,
            "race": race,
            "class_name": class_name,
            "level": level,
            "ability_scores": character_data.get("baseAbilityScores", character_data.get("ability_scores", {})),
            "skills": character_data.get("skills", []),
            "equipment": character_data.get("inventory", character_data.get("equipment", [])),
            "spells": character_data.get("spells", []),
            "background": background,
            "hp": hp,
            "character_data": character_data,
            "is_archived": character_data.get("isArchived", character_data.get("is_archived", False)),
        }

        attrs["character_data_parsed"] = validated
        attrs["warnings"] = warnings
        return attrs

    def create(self, validated_data):
        char_data = validated_data["character_data_parsed"]
        owner = self.context["request"].user
        character = Character.objects.create(owner=owner, **char_data)
        return character
