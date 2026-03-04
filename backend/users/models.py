import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Custom user model for D&D Character Forge.

    Extends Django's AbstractUser to add UUID primary key, display name,
    avatar URL, and a JSON preferences field.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    display_name = models.CharField(max_length=100, blank=True, default="")
    avatar_url = models.URLField(max_length=500, blank=True, default="")
    preferences = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "users_customuser"

    def __str__(self):
        return self.username
