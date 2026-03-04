import uuid

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from characters.models import Character

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="charowner",
        email="charowner@example.com",
        password="SecurePass123!",
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        username="otheruser",
        email="other@example.com",
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
def character_data():
    return {
        "name": "Gandalf",
        "race": "Human",
        "class_name": "Wizard",
        "level": 10,
        "ability_scores": {"str": 10, "dex": 14, "con": 12, "int": 20, "wis": 16, "cha": 14},
        "skills": ["arcana", "history"],
        "equipment": ["staff", "spellbook"],
        "spells": ["fireball", "shield"],
        "background": "Sage",
        "hp": 65,
    }


@pytest.fixture
def character(user):
    return Character.objects.create(
        name="Legolas",
        race="Elf",
        class_name="Ranger",
        level=5,
        owner=user,
    )


# =====================================================================
# Model Tests
# =====================================================================


@pytest.mark.django_db
class TestCharacterModel:
    def test_create_character_with_auto_uuid(self, user):
        char = Character.objects.create(
            name="Aragorn",
            race="Human",
            class_name="Fighter",
            owner=user,
        )
        assert char.id is not None
        assert isinstance(char.id, uuid.UUID)

    def test_default_values(self, user):
        char = Character.objects.create(
            name="Gimli",
            race="Dwarf",
            class_name="Fighter",
            owner=user,
        )
        assert char.level == 1
        assert char.is_archived is False
        assert char.hp == 0
        assert char.ability_scores == {}
        assert char.skills == []
        assert char.equipment == []
        assert char.spells == []
        assert char.background == ""
        assert char.character_data == {}

    def test_json_fields_store_and_retrieve_nested_data(self, user):
        nested = {"str": 18, "sub": {"nested": True, "list": [1, 2, 3]}}
        char = Character.objects.create(
            name="JsonTest",
            race="Human",
            class_name="Fighter",
            owner=user,
            ability_scores=nested,
            skills=["athletics", "perception"],
            equipment=[{"name": "sword", "weight": 3}],
            character_data={"full": "data", "nested": {"key": "value"}},
        )
        char.refresh_from_db()
        assert char.ability_scores == nested
        assert char.skills == ["athletics", "perception"]
        assert char.equipment == [{"name": "sword", "weight": 3}]
        assert char.character_data["nested"]["key"] == "value"

    def test_cascade_delete_when_user_deleted(self, user, character):
        user_id = user.id
        char_id = character.id
        user.delete()
        assert not Character.objects.filter(id=char_id).exists()

    def test_set_null_when_campaign_deleted(self, user):
        from campaigns.models import Campaign

        campaign = Campaign.objects.create(name="Test Campaign", owner=user)
        char = Character.objects.create(
            name="CampChar",
            race="Human",
            class_name="Fighter",
            owner=user,
            campaign=campaign,
        )
        campaign.delete()
        char.refresh_from_db()
        assert char.campaign is None

    def test_str_representation(self, character):
        assert str(character) == "Legolas (Lv5 Ranger)"


# =====================================================================
# API Tests
# =====================================================================


@pytest.mark.django_db
class TestCharacterAPI:
    def test_list_returns_only_users_characters(self, auth_client, user, other_user):
        Character.objects.create(name="Mine", race="Elf", class_name="Ranger", owner=user)
        Character.objects.create(
            name="NotMine", race="Dwarf", class_name="Fighter", owner=other_user
        )
        response = auth_client.get("/api/characters/")
        assert response.status_code == status.HTTP_200_OK
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["name"] == "Mine"

    def test_create_sets_owner(self, auth_client, user, character_data):
        response = auth_client.post("/api/characters/", character_data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["owner"] == str(user.id)
        assert data["name"] == "Gandalf"
        assert data["level"] == 10

    def test_retrieve_own_character(self, auth_client, character):
        response = auth_client.get(f"/api/characters/{character.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["name"] == "Legolas"

    def test_retrieve_other_users_character_returns_404(
        self, other_auth_client, character
    ):
        response = other_auth_client.get(f"/api/characters/{character.id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_character(self, auth_client, character):
        response = auth_client.put(
            f"/api/characters/{character.id}/",
            {
                "name": "Legolas Updated",
                "race": "Elf",
                "class_name": "Ranger",
                "level": 10,
            },
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["name"] == "Legolas Updated"
        assert response.json()["level"] == 10

    def test_partial_update_character(self, auth_client, character):
        response = auth_client.patch(
            f"/api/characters/{character.id}/",
            {"level": 8},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["level"] == 8
        assert response.json()["name"] == "Legolas"

    def test_delete_character(self, auth_client, character):
        response = auth_client.delete(f"/api/characters/{character.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Character.objects.filter(id=character.id).exists()

    def test_exclude_archived_by_default(self, auth_client, user):
        Character.objects.create(
            name="Active", race="Human", class_name="Fighter", owner=user
        )
        Character.objects.create(
            name="Archived",
            race="Human",
            class_name="Fighter",
            owner=user,
            is_archived=True,
        )
        response = auth_client.get("/api/characters/")
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["name"] == "Active"

    def test_include_archived_with_query_param(self, auth_client, user):
        Character.objects.create(
            name="Active", race="Human", class_name="Fighter", owner=user
        )
        Character.objects.create(
            name="Archived",
            race="Human",
            class_name="Fighter",
            owner=user,
            is_archived=True,
        )
        response = auth_client.get("/api/characters/?include_archived=true")
        results = response.json()["results"]
        assert len(results) == 2

    def test_validation_error_missing_name(self, auth_client):
        response = auth_client.post(
            "/api/characters/",
            {"race": "Elf", "class_name": "Ranger"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_validation_error_level_above_20(self, auth_client):
        response = auth_client.post(
            "/api/characters/",
            {"name": "TooHigh", "race": "Human", "class_name": "Fighter", "level": 21},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_validation_error_level_zero(self, auth_client):
        response = auth_client.post(
            "/api/characters/",
            {"name": "TooLow", "race": "Human", "class_name": "Fighter", "level": 0},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_unauthenticated_access_rejected(self, api_client):
        response = api_client.get("/api/characters/")
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )

    def test_unauthenticated_create_rejected(self, api_client, character_data):
        response = api_client.post("/api/characters/", character_data, format="json")
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )

    def test_create_character_has_uuid_id(self, auth_client, character_data):
        response = auth_client.post("/api/characters/", character_data, format="json")
        data = response.json()
        assert len(data["id"]) == 36
        assert data["id"].count("-") == 4
