import random
import string
import uuid

from django.conf import settings
from django.db import models


class Campaign(models.Model):
    """
    A D&D campaign owned by a user. Characters can join via a unique join code.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    join_code = models.CharField(max_length=6, unique=True, blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="campaigns",
    )
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["name"]),
        ]

    def __str__(self):
        return self.name

    @staticmethod
    def generate_join_code():
        """Generate a random 6-character uppercase alphanumeric join code.

        Retries up to 10 times on collision with existing codes.
        """
        chars = string.ascii_uppercase + string.digits
        for _ in range(10):
            code = "".join(random.choices(chars, k=6))
            if not Campaign.objects.filter(join_code=code).exists():
                return code
        raise RuntimeError("Failed to generate a unique join code after 10 attempts.")

    def save(self, *args, **kwargs):
        if not self.join_code:
            self.join_code = self.generate_join_code()
        super().save(*args, **kwargs)
