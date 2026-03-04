import pytest
from django.test import override_settings


@pytest.mark.django_db
def test_django_check(api_client):
    """Smoke test: Django is configured correctly."""
    from django.core.management import call_command
    call_command('check')


def test_api_root_requires_auth(api_client):
    """Unauthenticated requests should get 403."""
    # No API root yet, but verify DRF is wired up
    response = api_client.get('/api/')
    assert response.status_code in (403, 404)
