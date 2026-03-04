import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


class Character(models.Model):
    """
    A D&D character owned by a user, optionally belonging to a campaign.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    race = models.CharField(max_length=50)
    class_name = models.CharField(max_length=50)
    level = models.PositiveIntegerField(default=1)
    ability_scores = models.JSONField(default=dict)
    skills = models.JSONField(default=list)
    equipment = models.JSONField(default=list)
    spells = models.JSONField(default=list)
    background = models.CharField(max_length=100, blank=True)
    hp = models.PositiveIntegerField(default=0)
    character_data = models.JSONField(default=dict, blank=True)

    campaign = models.ForeignKey(
        "campaigns.Campaign",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="characters",
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="characters",
    )

    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["campaign"]),
            models.Index(fields=["is_archived"]),
            models.Index(fields=["updated_at"]),
            models.Index(fields=["owner"]),
        ]

    def __str__(self):
        return f"{self.name} (Lv{self.level} {self.class_name})"


class CharacterShareToken(models.Model):
    """
    A time-limited share token that grants public read access to a character.
    """

    token = models.UUIDField(primary_key=True, default=uuid.uuid4)
    character = models.ForeignKey(
        Character,
        on_delete=models.CASCADE,
        related_name="share_tokens",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Share token for {self.character.name} (expires {self.expires_at})"
