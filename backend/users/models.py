import uuid

from django.conf import settings
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


class UserPreferences(models.Model):
    """
    Per-user preferences for the D&D Character Forge application.
    """

    THEME_CHOICES = [
        ("dark", "Dark"),
        ("light", "Light"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_preferences",
    )
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default="dark")
    auto_save_enabled = models.BooleanField(default=True)
    last_active_character = models.ForeignKey(
        "characters.Character",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    class Meta:
        verbose_name = "User Preferences"
        verbose_name_plural = "User Preferences"

    def __str__(self):
        return f"Preferences for {self.user}"
