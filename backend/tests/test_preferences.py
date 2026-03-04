import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from users.models import UserPreferences

User = get_user_model()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="prefuser",
        email="prefuser@example.com",
        password="SecurePass123!",
    )


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


# =====================================================================
# Preferences API Tests
# =====================================================================


@pytest.mark.django_db
class TestPreferencesAPI:
    def test_get_returns_defaults_for_new_user(self, auth_client, user):
        response = auth_client.get("/api/preferences/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["theme"] == "dark"
        assert data["auto_save_enabled"] is True
        assert data["last_active_character"] is None

    def test_get_auto_creates_preferences_record(self, auth_client, user):
        assert not UserPreferences.objects.filter(user=user).exists()
        auth_client.get("/api/preferences/")
        assert UserPreferences.objects.filter(user=user).exists()

    def test_put_updates_preferences(self, auth_client, user):
        # First GET to create
        auth_client.get("/api/preferences/")
        response = auth_client.put(
            "/api/preferences/",
            {"theme": "light", "auto_save_enabled": False},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["theme"] == "light"
        assert data["auto_save_enabled"] is False

    def test_preferences_persist_across_requests(self, auth_client, user):
        auth_client.put(
            "/api/preferences/",
            {"theme": "light"},
            format="json",
        )
        response = auth_client.get("/api/preferences/")
        assert response.json()["theme"] == "light"

    def test_unauthenticated_get_rejected(self, api_client):
        response = api_client.get("/api/preferences/")
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )

    def test_unauthenticated_put_rejected(self, api_client):
        response = api_client.put(
            "/api/preferences/",
            {"theme": "light"},
            format="json",
        )
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )

    def test_put_with_last_active_character(self, auth_client, user):
        from characters.models import Character

        char = Character.objects.create(
            name="ActiveChar",
            race="Human",
            class_name="Fighter",
            owner=user,
        )
        response = auth_client.put(
            "/api/preferences/",
            {"last_active_character": str(char.id)},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["last_active_character"] == str(char.id)
