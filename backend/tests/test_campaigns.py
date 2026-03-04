import re
import uuid

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from campaigns.models import Campaign
from characters.models import Character

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="campowner",
        email="campowner@example.com",
        password="SecurePass123!",
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        username="othercamp",
        email="othercamp@example.com",
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
def campaign(user):
    return Campaign.objects.create(
        name="Dragon's Lair",
        description="A perilous campaign",
        owner=user,
    )


@pytest.fixture
def character(user):
    return Character.objects.create(
        name="Frodo",
        race="Halfling",
        class_name="Rogue",
        level=3,
        owner=user,
    )


# =====================================================================
# Model Tests
# =====================================================================


@pytest.mark.django_db
class TestCampaignModel:
    def test_create_campaign_with_auto_uuid(self, user):
        camp = Campaign.objects.create(name="Test", owner=user)
        assert camp.id is not None
        assert isinstance(camp.id, uuid.UUID)

    def test_join_code_auto_generated_on_create(self, user):
        camp = Campaign.objects.create(name="AutoCode", owner=user)
        assert camp.join_code is not None
        assert len(camp.join_code) == 6

    def test_join_code_is_uppercase_alphanumeric(self, user):
        camp = Campaign.objects.create(name="CodeCheck", owner=user)
        assert re.match(r"^[A-Z0-9]{6}$", camp.join_code)

    def test_unique_join_codes_across_campaigns(self, user):
        codes = set()
        for i in range(20):
            camp = Campaign.objects.create(name=f"Camp{i}", owner=user)
            codes.add(camp.join_code)
        # All 20 should be unique
        assert len(codes) == 20

    def test_join_code_not_overwritten_on_update(self, campaign):
        original_code = campaign.join_code
        campaign.name = "Updated Name"
        campaign.save()
        campaign.refresh_from_db()
        assert campaign.join_code == original_code

    def test_str_representation(self, campaign):
        assert str(campaign) == "Dragon's Lair"


# =====================================================================
# API Tests
# =====================================================================


@pytest.mark.django_db
class TestCampaignAPI:
    def test_list_returns_only_users_campaigns(self, auth_client, user, other_user):
        Campaign.objects.create(name="MyCampaign", owner=user)
        Campaign.objects.create(name="NotMyCampaign", owner=other_user)
        response = auth_client.get("/api/campaigns/")
        assert response.status_code == status.HTTP_200_OK
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["name"] == "MyCampaign"

    def test_create_campaign_sets_owner(self, auth_client, user):
        response = auth_client.post(
            "/api/campaigns/",
            {"name": "New Campaign", "description": "A test campaign"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["owner"] == str(user.id)
        assert data["name"] == "New Campaign"
        assert len(data["join_code"]) == 6

    def test_retrieve_own_campaign(self, auth_client, campaign):
        response = auth_client.get(f"/api/campaigns/{campaign.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["name"] == "Dragon's Lair"

    def test_retrieve_other_users_campaign_returns_404(
        self, other_auth_client, campaign
    ):
        response = other_auth_client.get(f"/api/campaigns/{campaign.id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_campaign_name(self, auth_client, campaign):
        response = auth_client.patch(
            f"/api/campaigns/{campaign.id}/",
            {"name": "Updated Lair"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["name"] == "Updated Lair"

    def test_update_cannot_change_join_code(self, auth_client, campaign):
        original_code = campaign.join_code
        response = auth_client.patch(
            f"/api/campaigns/{campaign.id}/",
            {"join_code": "ZZZZZZ"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        # join_code is read_only, so it should not change
        assert response.json()["join_code"] == original_code

    def test_delete_campaign_sets_character_campaign_to_null(
        self, auth_client, user, campaign
    ):
        char = Character.objects.create(
            name="CampChar",
            race="Human",
            class_name="Fighter",
            owner=user,
            campaign=campaign,
        )
        response = auth_client.delete(f"/api/campaigns/{campaign.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        char.refresh_from_db()
        assert char.campaign is None

    def test_campaign_includes_nested_characters(self, auth_client, user, campaign):
        Character.objects.create(
            name="InCampaign",
            race="Elf",
            class_name="Ranger",
            owner=user,
            campaign=campaign,
        )
        response = auth_client.get(f"/api/campaigns/{campaign.id}/")
        data = response.json()
        assert len(data["characters"]) == 1
        assert data["characters"][0]["name"] == "InCampaign"

    def test_unauthenticated_access_rejected(self, api_client):
        response = api_client.get("/api/campaigns/")
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )

    def test_unauthenticated_create_rejected(self, api_client):
        response = api_client.post(
            "/api/campaigns/",
            {"name": "Hacker Campaign"},
            format="json",
        )
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )


# =====================================================================
# Join Flow Tests
# =====================================================================


@pytest.mark.django_db
class TestCampaignJoin:
    def test_join_success(self, auth_client, campaign, character):
        response = auth_client.post(
            f"/api/campaigns/{campaign.id}/join/",
            {"join_code": campaign.join_code, "character_id": str(character.id)},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        character.refresh_from_db()
        assert character.campaign == campaign

    def test_join_wrong_code(self, auth_client, campaign, character):
        response = auth_client.post(
            f"/api/campaigns/{campaign.id}/join/",
            {"join_code": "WRONG1", "character_id": str(character.id)},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_join_character_not_owned_by_user(
        self, auth_client, other_user, campaign
    ):
        other_char = Character.objects.create(
            name="NotMine",
            race="Orc",
            class_name="Barbarian",
            owner=other_user,
        )
        response = auth_client.post(
            f"/api/campaigns/{campaign.id}/join/",
            {"join_code": campaign.join_code, "character_id": str(other_char.id)},
            format="json",
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_join_missing_fields(self, auth_client, campaign):
        response = auth_client.post(
            f"/api/campaigns/{campaign.id}/join/",
            {},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_join_nonexistent_character(self, auth_client, campaign):
        fake_id = str(uuid.uuid4())
        response = auth_client.post(
            f"/api/campaigns/{campaign.id}/join/",
            {"join_code": campaign.join_code, "character_id": fake_id},
            format="json",
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_join_unauthenticated(self, api_client, campaign):
        response = api_client.post(
            f"/api/campaigns/{campaign.id}/join/",
            {"join_code": campaign.join_code, "character_id": str(uuid.uuid4())},
            format="json",
        )
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )
