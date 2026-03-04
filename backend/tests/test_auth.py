import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def user_data():
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
    }


@pytest.fixture
def existing_user(db):
    return User.objects.create_user(
        username="existinguser",
        email="existing@example.com",
        password="SecurePass123!",
    )


@pytest.fixture
def auth_client(existing_user):
    client = APIClient()
    client.force_authenticate(user=existing_user)
    return client


# =====================================================================
# Registration Tests
# =====================================================================


@pytest.mark.django_db
class TestRegistration:
    def test_register_success(self, api_client, user_data):
        response = api_client.post("/api/auth/register/", user_data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert "id" in data
        assert "date_joined" in data
        assert "password" not in data

    def test_register_creates_user_in_db(self, api_client, user_data):
        api_client.post("/api/auth/register/", user_data, format="json")
        assert User.objects.filter(username="testuser").exists()

    def test_register_logs_user_in(self, api_client, user_data):
        api_client.post("/api/auth/register/", user_data, format="json")
        # After registration, /me should work because the session was set
        response = api_client.get("/api/auth/me/")
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["username"] == "testuser"

    def test_register_duplicate_username(self, api_client, existing_user, user_data):
        user_data["username"] = existing_user.username
        response = api_client.post("/api/auth/register/", user_data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_duplicate_email(self, api_client, existing_user, user_data):
        user_data["email"] = existing_user.email
        response = api_client.post("/api/auth/register/", user_data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_weak_password(self, api_client, user_data):
        user_data["password"] = "short"
        user_data["password_confirm"] = "short"
        response = api_client.post("/api/auth/register/", user_data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_password_mismatch(self, api_client, user_data):
        user_data["password_confirm"] = "DifferentPass123!"
        response = api_client.post("/api/auth/register/", user_data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_missing_fields(self, api_client):
        response = api_client.post("/api/auth/register/", {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_user_has_uuid_pk(self, api_client, user_data):
        response = api_client.post("/api/auth/register/", user_data, format="json")
        data = response.json()
        # UUID format: 8-4-4-4-12 hex characters
        assert len(data["id"]) == 36
        assert data["id"].count("-") == 4


# =====================================================================
# Login Tests
# =====================================================================


@pytest.mark.django_db
class TestLogin:
    def test_login_success(self, api_client, existing_user):
        response = api_client.post(
            "/api/auth/login/",
            {"username": "existinguser", "password": "SecurePass123!"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["username"] == "existinguser"
        assert data["email"] == "existing@example.com"

    def test_login_creates_session(self, api_client, existing_user):
        api_client.post(
            "/api/auth/login/",
            {"username": "existinguser", "password": "SecurePass123!"},
            format="json",
        )
        response = api_client.get("/api/auth/me/")
        assert response.status_code == status.HTTP_200_OK

    def test_login_wrong_password(self, api_client, existing_user):
        response = api_client.post(
            "/api/auth/login/",
            {"username": "existinguser", "password": "WrongPassword!"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_nonexistent_user(self, api_client):
        response = api_client.post(
            "/api/auth/login/",
            {"username": "nobody", "password": "NoPassword1!"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_inactive_user(self, api_client, existing_user):
        existing_user.is_active = False
        existing_user.save()
        response = api_client.post(
            "/api/auth/login/",
            {"username": "existinguser", "password": "SecurePass123!"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_missing_fields(self, api_client):
        response = api_client.post("/api/auth/login/", {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# =====================================================================
# Logout Tests
# =====================================================================


@pytest.mark.django_db
class TestLogout:
    def test_logout_success(self, auth_client):
        response = auth_client.post("/api/auth/logout/")
        assert response.status_code == status.HTTP_200_OK

    def test_logout_invalidates_session(self, api_client, existing_user):
        # Log in first
        api_client.post(
            "/api/auth/login/",
            {"username": "existinguser", "password": "SecurePass123!"},
            format="json",
        )
        # Verify logged in
        assert api_client.get("/api/auth/me/").status_code == status.HTTP_200_OK

        # Log out
        api_client.post("/api/auth/logout/")

        # Verify session is gone
        response = api_client.get("/api/auth/me/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_logout_when_not_authenticated(self, api_client):
        response = api_client.post("/api/auth/logout/")
        assert response.status_code == status.HTTP_200_OK


# =====================================================================
# Me Endpoint Tests
# =====================================================================


@pytest.mark.django_db
class TestMeEndpoint:
    def test_me_authenticated(self, auth_client, existing_user):
        response = auth_client.get("/api/auth/me/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["username"] == existing_user.username
        assert data["email"] == existing_user.email
        assert "id" in data
        assert "date_joined" in data

    def test_me_unauthenticated(self, api_client):
        response = api_client.get("/api/auth/me/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_me_does_not_expose_password(self, auth_client):
        response = auth_client.get("/api/auth/me/")
        data = response.json()
        assert "password" not in data


# =====================================================================
# Profile Update Tests
# =====================================================================


@pytest.mark.django_db
class TestProfileUpdate:
    def test_update_display_name(self, auth_client):
        response = auth_client.patch(
            "/api/auth/me/",
            {"display_name": "New Name"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["display_name"] == "New Name"

    def test_update_email(self, auth_client):
        response = auth_client.patch(
            "/api/auth/me/",
            {"email": "newemail@example.com"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["email"] == "newemail@example.com"

    def test_update_avatar_url(self, auth_client):
        response = auth_client.patch(
            "/api/auth/me/",
            {"avatar_url": "https://example.com/avatar.png"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["avatar_url"] == "https://example.com/avatar.png"

    def test_update_preferences(self, auth_client):
        response = auth_client.patch(
            "/api/auth/me/",
            {"preferences": {"theme": "dark"}},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

    def test_update_duplicate_email_rejected(self, auth_client, db):
        User.objects.create_user(
            username="otheruser",
            email="taken@example.com",
            password="SecurePass123!",
        )
        response = auth_client.patch(
            "/api/auth/me/",
            {"email": "taken@example.com"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_update_unauthenticated(self, api_client):
        response = api_client.patch(
            "/api/auth/me/",
            {"display_name": "Hacker"},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


# =====================================================================
# CSRF Token Tests
# =====================================================================


@pytest.mark.django_db
class TestCSRFToken:
    def test_csrf_endpoint_returns_token(self, api_client):
        response = api_client.get("/api/auth/csrf/")
        assert response.status_code == status.HTTP_200_OK
        assert "csrfToken" in response.json()
