"""
Tests for Epic 22: JSON Export, JSON Import, and Share via URL.
"""

import io
import json
import uuid
from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from characters.models import Character, CharacterShareToken

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="exportuser",
        email="export@example.com",
        password="SecurePass123!",
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        username="otherexportuser",
        email="otherexport@example.com",
        password="SecurePass123!",
    )


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def other_auth_client(other_user):
    client = APIClient()
    client.force_authenticate(user=other_user)
    return client


@pytest.fixture
def anon_client():
    return APIClient()


@pytest.fixture
def character(user):
    return Character.objects.create(
        name="Gandalf the Grey",
        race="Human",
        class_name="Wizard",
        level=10,
        ability_scores={"str": 10, "dex": 14, "con": 12, "int": 20, "wis": 16, "cha": 14},
        skills=["arcana", "history"],
        equipment=["staff", "spellbook"],
        spells=["fireball", "shield"],
        background="Sage",
        hp=65,
        owner=user,
    )


@pytest.fixture
def valid_import_data():
    return {
        "formatVersion": "1.0",
        "appVersion": "1.0.0",
        "exportedAt": "2024-01-01T00:00:00Z",
        "character": {
            "name": "Imported Hero",
            "race": "Elf",
            "class_name": "Ranger",
            "level": 5,
            "ability_scores": {"str": 14, "dex": 18, "con": 12, "int": 10, "wis": 16, "cha": 8},
            "skills": ["stealth", "nature"],
            "equipment": ["longbow", "leather armor"],
            "spells": [],
            "background": "Outlander",
            "hp": 40,
        },
    }


# =====================================================================
# Export Tests (Story 22.1)
# =====================================================================


@pytest.mark.django_db
class TestCharacterExport:
    def test_export_returns_200_with_json(self, auth_client, character):
        response = auth_client.get(f"/api/characters/{character.id}/export/")
        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/json"

    def test_export_has_correct_content_disposition(self, auth_client, character):
        response = auth_client.get(f"/api/characters/{character.id}/export/")
        assert "Content-Disposition" in response
        assert "character-Gandalf-the-Grey.json" in response["Content-Disposition"]

    def test_export_format_has_metadata_wrapper(self, auth_client, character):
        response = auth_client.get(f"/api/characters/{character.id}/export/")
        data = json.loads(response.content)
        assert data["formatVersion"] == "1.0"
        assert data["appVersion"] == "1.0.0"
        assert "exportedAt" in data
        assert "character" in data

    def test_export_character_data_excludes_internal_fields(self, auth_client, character):
        response = auth_client.get(f"/api/characters/{character.id}/export/")
        data = json.loads(response.content)
        char_data = data["character"]
        assert "id" not in char_data
        assert "owner" not in char_data
        assert "created_at" not in char_data
        assert "updated_at" not in char_data

    def test_export_character_data_includes_expected_fields(self, auth_client, character):
        response = auth_client.get(f"/api/characters/{character.id}/export/")
        data = json.loads(response.content)
        char_data = data["character"]
        assert char_data["name"] == "Gandalf the Grey"
        assert char_data["race"] == "Human"
        assert char_data["class_name"] == "Wizard"
        assert char_data["level"] == 10
        assert char_data["ability_scores"] == {
            "str": 10, "dex": 14, "con": 12, "int": 20, "wis": 16, "cha": 14,
        }

    def test_export_pretty_printed(self, auth_client, character):
        response = auth_client.get(f"/api/characters/{character.id}/export/")
        content = response.content.decode("utf-8")
        # Pretty-printed JSON contains newlines and indentation
        assert "\n" in content
        assert "  " in content

    def test_export_other_users_character_returns_404(self, other_auth_client, character):
        response = other_auth_client.get(f"/api/characters/{character.id}/export/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_export_nonexistent_character_returns_404(self, auth_client):
        fake_id = uuid.uuid4()
        response = auth_client.get(f"/api/characters/{fake_id}/export/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_export_unauthenticated_returns_403(self, anon_client, character):
        response = anon_client.get(f"/api/characters/{character.id}/export/")
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )


# =====================================================================
# Import Tests (Story 22.2)
# =====================================================================


@pytest.mark.django_db
class TestCharacterImport:
    def test_import_valid_file_returns_201(self, auth_client, valid_import_data):
        json_content = json.dumps(valid_import_data).encode("utf-8")
        uploaded = SimpleUploadedFile(
            "character.json", json_content, content_type="application/json"
        )
        response = auth_client.post(
            "/api/characters/import/",
            {"file": uploaded},
            format="multipart",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_import_creates_character_with_new_uuid(self, auth_client, valid_import_data):
        json_content = json.dumps(valid_import_data).encode("utf-8")
        uploaded = SimpleUploadedFile(
            "character.json", json_content, content_type="application/json"
        )
        response = auth_client.post(
            "/api/characters/import/",
            {"file": uploaded},
            format="multipart",
        )
        data = response.json()
        assert "character" in data
        assert data["character"]["name"] == "Imported Hero"
        # Verify it has a UUID id
        char_id = data["character"]["id"]
        assert len(char_id) == 36

    def test_import_sets_owner_to_current_user(self, auth_client, user, valid_import_data):
        json_content = json.dumps(valid_import_data).encode("utf-8")
        uploaded = SimpleUploadedFile(
            "character.json", json_content, content_type="application/json"
        )
        response = auth_client.post(
            "/api/characters/import/",
            {"file": uploaded},
            format="multipart",
        )
        data = response.json()
        assert data["character"]["owner"] == str(user.id)

    def test_import_flat_format_without_wrapper(self, auth_client):
        flat_data = {
            "name": "Flat Hero",
            "race": "Dwarf",
            "class_name": "Fighter",
            "level": 3,
            "ability_scores": {"str": 16, "dex": 10, "con": 14, "int": 8, "wis": 12, "cha": 10},
        }
        json_content = json.dumps(flat_data).encode("utf-8")
        uploaded = SimpleUploadedFile(
            "character.json", json_content, content_type="application/json"
        )
        response = auth_client.post(
            "/api/characters/import/",
            {"file": uploaded},
            format="multipart",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["character"]["name"] == "Flat Hero"

    def test_import_missing_required_fields_returns_400(self, auth_client):
        incomplete = {"name": "Incomplete", "race": "Elf"}
        json_content = json.dumps(incomplete).encode("utf-8")
        uploaded = SimpleUploadedFile(
            "character.json", json_content, content_type="application/json"
        )
        response = auth_client.post(
            "/api/characters/import/",
            {"file": uploaded},
            format="multipart",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_import_invalid_json_returns_400(self, auth_client):
        uploaded = SimpleUploadedFile(
            "character.json", b"not valid json{{{", content_type="application/json"
        )
        response = auth_client.post(
            "/api/characters/import/",
            {"file": uploaded},
            format="multipart",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_import_level_out_of_range_returns_400(self, auth_client):
        bad_data = {
            "name": "BadLevel",
            "race": "Human",
            "class_name": "Fighter",
            "level": 25,
            "ability_scores": {"str": 10},
        }
        json_content = json.dumps(bad_data).encode("utf-8")
        uploaded = SimpleUploadedFile(
            "character.json", json_content, content_type="application/json"
        )
        response = auth_client.post(
            "/api/characters/import/",
            {"file": uploaded},
            format="multipart",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_import_invalid_name_type_returns_400(self, auth_client):
        bad_data = {
            "name": 12345,
            "race": "Human",
            "class_name": "Fighter",
            "level": 5,
            "ability_scores": {"str": 10},
        }
        json_content = json.dumps(bad_data).encode("utf-8")
        uploaded = SimpleUploadedFile(
            "character.json", json_content, content_type="application/json"
        )
        response = auth_client.post(
            "/api/characters/import/",
            {"file": uploaded},
            format="multipart",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_import_unauthenticated_returns_403(self, anon_client, valid_import_data):
        json_content = json.dumps(valid_import_data).encode("utf-8")
        uploaded = SimpleUploadedFile(
            "character.json", json_content, content_type="application/json"
        )
        response = anon_client.post(
            "/api/characters/import/",
            {"file": uploaded},
            format="multipart",
        )
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )


# =====================================================================
# Share Tests (Story 22.3)
# =====================================================================


@pytest.mark.django_db
class TestCharacterShare:
    def test_share_creates_token(self, auth_client, character):
        response = auth_client.get(f"/api/characters/{character.id}/share/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "token" in data
        assert "url" in data
        assert "expires_at" in data

    def test_share_reuses_existing_valid_token(self, auth_client, character):
        response1 = auth_client.get(f"/api/characters/{character.id}/share/")
        response2 = auth_client.get(f"/api/characters/{character.id}/share/")
        assert response1.json()["token"] == response2.json()["token"]

    def test_share_other_users_character_returns_404(self, other_auth_client, character):
        response = other_auth_client.get(f"/api/characters/{character.id}/share/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_shared_character_public_access(self, auth_client, anon_client, character):
        # First create a share token
        share_response = auth_client.get(f"/api/characters/{character.id}/share/")
        token = share_response.json()["token"]

        # Access the shared character without authentication
        response = anon_client.get(f"/api/shared/{token}/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["character"]["name"] == "Gandalf the Grey"
        assert data["formatVersion"] == "1.0"

    def test_shared_character_expired_returns_410(self, anon_client, character):
        token = CharacterShareToken.objects.create(
            character=character,
            expires_at=timezone.now() - timedelta(hours=1),
        )
        response = anon_client.get(f"/api/shared/{token.token}/")
        assert response.status_code == status.HTTP_410_GONE

    def test_shared_character_not_found_returns_404(self, anon_client):
        fake_token = uuid.uuid4()
        response = anon_client.get(f"/api/shared/{fake_token}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_share_unauthenticated_returns_403(self, anon_client, character):
        response = anon_client.get(f"/api/characters/{character.id}/share/")
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )
