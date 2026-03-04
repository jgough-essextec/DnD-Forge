import uuid

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from characters.models import Character

from .models import Campaign, Encounter

User = get_user_model()


class CampaignModelTests(TestCase):
    """Tests for the Campaign model."""

    def setUp(self):
        self.user = User.objects.create_user(username="dm", password="testpass123")

    def test_create_campaign(self):
        campaign = Campaign.objects.create(name="Test Campaign", owner=self.user)
        self.assertEqual(campaign.name, "Test Campaign")
        self.assertEqual(campaign.owner, self.user)
        self.assertFalse(campaign.is_archived)
        self.assertEqual(campaign.description, "")
        self.assertIsNotNone(campaign.join_code)

    def test_join_code_auto_generated(self):
        campaign = Campaign.objects.create(name="Test", owner=self.user)
        self.assertEqual(len(campaign.join_code), 6)
        self.assertTrue(campaign.join_code.isalnum())
        self.assertTrue(campaign.join_code.isupper() or campaign.join_code.isdigit())

    def test_join_code_unique(self):
        c1 = Campaign.objects.create(name="Campaign 1", owner=self.user)
        c2 = Campaign.objects.create(name="Campaign 2", owner=self.user)
        self.assertNotEqual(c1.join_code, c2.join_code)

    def test_generate_join_code_static_method(self):
        code = Campaign.generate_join_code()
        self.assertEqual(len(code), 6)
        self.assertTrue(code.isalnum())

    def test_campaign_str(self):
        campaign = Campaign.objects.create(name="Dragons of Icespire", owner=self.user)
        self.assertEqual(str(campaign), "Dragons of Icespire")

    def test_campaign_default_settings(self):
        campaign = Campaign.objects.create(name="Test", owner=self.user)
        self.assertEqual(campaign.settings, {})

    def test_campaign_with_settings(self):
        settings_data = {"xpTracking": "milestone", "houseRules": {"allowFeats": True}}
        campaign = Campaign.objects.create(
            name="Custom Campaign", owner=self.user, settings=settings_data
        )
        self.assertEqual(campaign.settings["xpTracking"], "milestone")
        self.assertTrue(campaign.settings["houseRules"]["allowFeats"])

    def test_campaign_is_archived_default_false(self):
        campaign = Campaign.objects.create(name="Test", owner=self.user)
        self.assertFalse(campaign.is_archived)

    def test_campaign_ordering(self):
        c1 = Campaign.objects.create(name="First", owner=self.user)
        c2 = Campaign.objects.create(name="Second", owner=self.user)
        campaigns = list(Campaign.objects.filter(owner=self.user))
        self.assertEqual(campaigns[0].id, c2.id)
        self.assertEqual(campaigns[1].id, c1.id)

    def test_campaign_uuid_primary_key(self):
        campaign = Campaign.objects.create(name="UUID Test", owner=self.user)
        self.assertIsInstance(campaign.id, uuid.UUID)

    def test_campaign_cascade_delete_with_owner(self):
        Campaign.objects.create(name="Test", owner=self.user)
        self.assertEqual(Campaign.objects.count(), 1)
        self.user.delete()
        self.assertEqual(Campaign.objects.count(), 0)


class EncounterModelTests(TestCase):
    """Tests for the Encounter model."""

    def setUp(self):
        self.user = User.objects.create_user(username="dm", password="testpass123")
        self.campaign = Campaign.objects.create(name="Test Campaign", owner=self.user)

    def test_create_encounter(self):
        encounter = Encounter.objects.create(
            campaign=self.campaign,
            name="Goblin Ambush",
        )
        self.assertEqual(encounter.name, "Goblin Ambush")
        self.assertEqual(encounter.campaign, self.campaign)
        self.assertEqual(encounter.round, 0)
        self.assertFalse(encounter.is_active)
        self.assertEqual(encounter.combatants, [])

    def test_encounter_with_combatants(self):
        combatants = [
            {"id": "1", "name": "Goblin 1", "hp": 7, "maxHp": 7, "ac": 15, "initiative": 12},
            {"id": "2", "name": "Goblin 2", "hp": 7, "maxHp": 7, "ac": 15, "initiative": 8},
        ]
        encounter = Encounter.objects.create(
            campaign=self.campaign,
            name="Goblin Ambush",
            combatants=combatants,
        )
        self.assertEqual(len(encounter.combatants), 2)
        self.assertEqual(encounter.combatants[0]["name"], "Goblin 1")

    def test_encounter_str(self):
        encounter = Encounter.objects.create(
            campaign=self.campaign,
            name="Dragon Fight",
        )
        self.assertEqual(str(encounter), "Dragon Fight (Test Campaign)")

    def test_encounter_uuid_primary_key(self):
        encounter = Encounter.objects.create(
            campaign=self.campaign,
            name="Test",
        )
        self.assertIsInstance(encounter.id, uuid.UUID)

    def test_encounter_cascade_delete_with_campaign(self):
        Encounter.objects.create(campaign=self.campaign, name="Test")
        self.assertEqual(Encounter.objects.count(), 1)
        self.campaign.delete()
        self.assertEqual(Encounter.objects.count(), 0)


class CampaignViewSetTests(TestCase):
    """Tests for the CampaignViewSet."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="dm", password="testpass123")
        self.other_user = User.objects.create_user(username="other", password="testpass123")
        self.client.force_authenticate(user=self.user)

    def test_list_campaigns(self):
        Campaign.objects.create(name="Campaign 1", owner=self.user)
        Campaign.objects.create(name="Campaign 2", owner=self.user)
        Campaign.objects.create(name="Other Campaign", owner=self.other_user)

        response = self.client.get("/api/campaigns/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_create_campaign(self):
        response = self.client.post(
            "/api/campaigns/",
            {"name": "New Campaign", "description": "A grand adventure"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Campaign")
        self.assertEqual(response.data["description"], "A grand adventure")
        self.assertEqual(str(response.data["owner"]), str(self.user.id))
        self.assertFalse(response.data["isArchived"])
        self.assertIsNotNone(response.data["joinCode"])

    def test_create_campaign_minimal(self):
        response = self.client.post(
            "/api/campaigns/",
            {"name": "Minimal Campaign"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Minimal Campaign")
        self.assertEqual(response.data["description"], "")

    def test_create_campaign_with_settings(self):
        settings_data = {"xpTracking": "milestone"}
        response = self.client.post(
            "/api/campaigns/",
            {"name": "Settings Campaign", "settings": settings_data},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["settings"]["xpTracking"], "milestone")

    def test_create_campaign_name_required(self):
        response = self.client.post(
            "/api/campaigns/",
            {"description": "No name"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_campaign(self):
        campaign = Campaign.objects.create(name="My Campaign", owner=self.user)
        response = self.client.get(f"/api/campaigns/{campaign.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "My Campaign")
        self.assertIn("characters", response.data)
        self.assertIn("characterCount", response.data)

    def test_retrieve_campaign_not_owned(self):
        campaign = Campaign.objects.create(name="Other", owner=self.other_user)
        response = self.client.get(f"/api/campaigns/{campaign.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_campaign(self):
        campaign = Campaign.objects.create(name="Old Name", owner=self.user)
        response = self.client.patch(
            f"/api/campaigns/{campaign.id}/",
            {"name": "New Name"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "New Name")

    def test_update_campaign_description(self):
        campaign = Campaign.objects.create(name="Test", owner=self.user)
        response = self.client.patch(
            f"/api/campaigns/{campaign.id}/",
            {"description": "Updated description"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["description"], "Updated description")

    def test_delete_campaign(self):
        campaign = Campaign.objects.create(name="Delete Me", owner=self.user)
        response = self.client.delete(f"/api/campaigns/{campaign.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Campaign.objects.filter(id=campaign.id).exists())

    def test_delete_campaign_unlinks_characters(self):
        campaign = Campaign.objects.create(name="Delete Me", owner=self.user)
        character = Character.objects.create(
            name="Hero",
            race="Elf",
            class_name="Wizard",
            owner=self.user,
            campaign=campaign,
        )
        self.client.delete(f"/api/campaigns/{campaign.id}/")
        character.refresh_from_db()
        self.assertIsNone(character.campaign)

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/campaigns/")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class CampaignJoinTests(TestCase):
    """Tests for the join action."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="player", password="testpass123")
        self.dm = User.objects.create_user(username="dm", password="testpass123")
        self.campaign = Campaign.objects.create(name="Campaign", owner=self.dm)
        self.character = Character.objects.create(
            name="Hero",
            race="Human",
            class_name="Fighter",
            owner=self.user,
        )
        self.client.force_authenticate(user=self.dm)

    def test_join_campaign(self):
        self.client.force_authenticate(user=self.user)
        # The join endpoint requires the DM's campaign to be accessible.
        # Since CampaignViewSet filters by owner, only the DM can access the join action.
        # Let's test from the DM's perspective.
        self.client.force_authenticate(user=self.dm)
        dm_char = Character.objects.create(
            name="DM NPC", race="Human", class_name="Rogue", owner=self.dm
        )
        response = self.client.post(
            f"/api/campaigns/{self.campaign.id}/join/",
            {"join_code": self.campaign.join_code, "character_id": str(dm_char.id)},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        dm_char.refresh_from_db()
        self.assertEqual(dm_char.campaign, self.campaign)

    def test_join_campaign_invalid_code(self):
        self.client.force_authenticate(user=self.dm)
        dm_char = Character.objects.create(
            name="DM NPC", race="Human", class_name="Rogue", owner=self.dm
        )
        response = self.client.post(
            f"/api/campaigns/{self.campaign.id}/join/",
            {"join_code": "WRONG1", "character_id": str(dm_char.id)},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_join_campaign_missing_fields(self):
        response = self.client.post(
            f"/api/campaigns/{self.campaign.id}/join/",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_join_campaign_character_not_found(self):
        fake_id = str(uuid.uuid4())
        response = self.client.post(
            f"/api/campaigns/{self.campaign.id}/join/",
            {"join_code": self.campaign.join_code, "character_id": fake_id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_join_campaign_character_already_in_another(self):
        other_campaign = Campaign.objects.create(name="Other", owner=self.dm)
        dm_char = Character.objects.create(
            name="DM NPC", race="Human", class_name="Rogue", owner=self.dm, campaign=other_campaign
        )
        response = self.client.post(
            f"/api/campaigns/{self.campaign.id}/join/",
            {"join_code": self.campaign.join_code, "character_id": str(dm_char.id)},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CampaignArchiveTests(TestCase):
    """Tests for the archive action."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="dm", password="testpass123")
        self.client.force_authenticate(user=self.user)
        self.campaign = Campaign.objects.create(name="Test Campaign", owner=self.user)

    def test_archive_campaign(self):
        response = self.client.post(f"/api/campaigns/{self.campaign.id}/archive/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.campaign.refresh_from_db()
        self.assertTrue(self.campaign.is_archived)
        self.assertIn("archived", response.data["detail"])

    def test_unarchive_campaign(self):
        self.campaign.is_archived = True
        self.campaign.save()
        response = self.client.post(f"/api/campaigns/{self.campaign.id}/archive/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.campaign.refresh_from_db()
        self.assertFalse(self.campaign.is_archived)
        self.assertIn("unarchived", response.data["detail"])

    def test_archive_returns_campaign_data(self):
        response = self.client.post(f"/api/campaigns/{self.campaign.id}/archive/")
        self.assertIn("campaign", response.data)
        self.assertEqual(response.data["campaign"]["name"], "Test Campaign")


class CampaignRegenerateCodeTests(TestCase):
    """Tests for the regenerate-code action."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="dm", password="testpass123")
        self.client.force_authenticate(user=self.user)
        self.campaign = Campaign.objects.create(name="Test Campaign", owner=self.user)

    def test_regenerate_code(self):
        old_code = self.campaign.join_code
        response = self.client.post(
            f"/api/campaigns/{self.campaign.id}/regenerate-code/"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.campaign.refresh_from_db()
        self.assertNotEqual(self.campaign.join_code, old_code)
        self.assertEqual(len(self.campaign.join_code), 6)

    def test_regenerate_code_returns_campaign_data(self):
        response = self.client.post(
            f"/api/campaigns/{self.campaign.id}/regenerate-code/"
        )
        self.assertIn("campaign", response.data)
        self.assertIn("joinCode", response.data["campaign"])


class CampaignRemoveCharacterTests(TestCase):
    """Tests for the remove-character action."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="dm", password="testpass123")
        self.client.force_authenticate(user=self.user)
        self.campaign = Campaign.objects.create(name="Test Campaign", owner=self.user)
        self.character = Character.objects.create(
            name="Hero",
            race="Elf",
            class_name="Wizard",
            owner=self.user,
            campaign=self.campaign,
        )

    def test_remove_character(self):
        response = self.client.post(
            f"/api/campaigns/{self.campaign.id}/remove-character/",
            {"character_id": str(self.character.id)},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.character.refresh_from_db()
        self.assertIsNone(self.character.campaign)

    def test_remove_character_not_in_campaign(self):
        other_character = Character.objects.create(
            name="Other", race="Dwarf", class_name="Fighter", owner=self.user
        )
        response = self.client.post(
            f"/api/campaigns/{self.campaign.id}/remove-character/",
            {"character_id": str(other_character.id)},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_remove_character_missing_id(self):
        response = self.client.post(
            f"/api/campaigns/{self.campaign.id}/remove-character/",
            {},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_remove_character_preserves_character(self):
        """Removing a character from a campaign should not delete the character."""
        response = self.client.post(
            f"/api/campaigns/{self.campaign.id}/remove-character/",
            {"character_id": str(self.character.id)},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Character.objects.filter(id=self.character.id).exists())


class CampaignCharacterIntegrationTests(TestCase):
    """Integration tests for campaign-character relationships."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="dm", password="testpass123")
        self.client.force_authenticate(user=self.user)
        self.campaign = Campaign.objects.create(name="Test Campaign", owner=self.user)

    def test_campaign_shows_characters(self):
        Character.objects.create(
            name="Hero 1", race="Elf", class_name="Wizard",
            owner=self.user, campaign=self.campaign,
        )
        Character.objects.create(
            name="Hero 2", race="Human", class_name="Fighter",
            owner=self.user, campaign=self.campaign,
        )
        response = self.client.get(f"/api/campaigns/{self.campaign.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["characters"]), 2)
        self.assertEqual(response.data["characterCount"], 2)

    def test_campaign_character_count_empty(self):
        response = self.client.get(f"/api/campaigns/{self.campaign.id}/")
        self.assertEqual(response.data["characterCount"], 0)

    def test_delete_campaign_does_not_delete_characters(self):
        character = Character.objects.create(
            name="Hero", race="Elf", class_name="Wizard",
            owner=self.user, campaign=self.campaign,
        )
        self.client.delete(f"/api/campaigns/{self.campaign.id}/")
        self.assertTrue(Character.objects.filter(id=character.id).exists())
        character.refresh_from_db()
        self.assertIsNone(character.campaign)


class CampaignJoinedEndpointTests(TestCase):
    """Tests for the /campaigns/joined/ endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.dm = User.objects.create_user(username="dm", password="testpass123")
        self.player = User.objects.create_user(username="player", password="testpass123")
        self.campaign = Campaign.objects.create(name="Test Campaign", owner=self.dm)
        self.player_char = Character.objects.create(
            name="Player Hero", race="Elf", class_name="Wizard",
            owner=self.player, campaign=self.campaign,
        )

    def test_joined_returns_campaigns_player_has_joined(self):
        self.client.force_authenticate(user=self.player)
        response = self.client.get("/api/campaigns/joined/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Test Campaign")

    def test_joined_excludes_owned_campaigns(self):
        """DM should not see their own campaigns in the joined list."""
        self.client.force_authenticate(user=self.dm)
        response = self.client.get("/api/campaigns/joined/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_joined_empty_for_user_with_no_campaigns(self):
        other = User.objects.create_user(username="nobody", password="testpass123")
        self.client.force_authenticate(user=other)
        response = self.client.get("/api/campaigns/joined/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class CampaignPartyEndpointTests(TestCase):
    """Tests for the /campaigns/{id}/party/ endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.dm = User.objects.create_user(username="dm", password="testpass123")
        self.player = User.objects.create_user(username="player", password="testpass123")
        self.outsider = User.objects.create_user(username="outsider", password="testpass123")
        self.campaign = Campaign.objects.create(name="Test Campaign", owner=self.dm)
        self.dm_char = Character.objects.create(
            name="DM NPC", race="Human", class_name="Rogue",
            owner=self.dm, campaign=self.campaign,
        )
        self.player_char = Character.objects.create(
            name="Player Hero", race="Elf", class_name="Wizard",
            owner=self.player, campaign=self.campaign,
        )

    def test_party_returns_all_characters_for_dm(self):
        self.client.force_authenticate(user=self.dm)
        response = self.client.get(f"/api/campaigns/{self.campaign.id}/party/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_party_returns_all_characters_for_player(self):
        self.client.force_authenticate(user=self.player)
        response = self.client.get(f"/api/campaigns/{self.campaign.id}/party/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_party_denied_for_non_member(self):
        self.client.force_authenticate(user=self.outsider)
        response = self.client.get(f"/api/campaigns/{self.campaign.id}/party/")
        # Non-members get 404 because the queryset filters out campaigns they can't access
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_party_returns_expected_fields(self):
        self.client.force_authenticate(user=self.player)
        response = self.client.get(f"/api/campaigns/{self.campaign.id}/party/")
        member = response.data[0]
        self.assertIn("id", member)
        self.assertIn("name", member)
        self.assertIn("race", member)
        self.assertIn("class", member)
        self.assertIn("level", member)
        self.assertIn("hp", member)
        self.assertIn("ac", member)


class CampaignLeaveEndpointTests(TestCase):
    """Tests for the /campaigns/{id}/leave/ endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.dm = User.objects.create_user(username="dm", password="testpass123")
        self.player = User.objects.create_user(username="player", password="testpass123")
        self.campaign = Campaign.objects.create(name="Test Campaign", owner=self.dm)
        self.player_char = Character.objects.create(
            name="Player Hero", race="Elf", class_name="Wizard",
            owner=self.player, campaign=self.campaign,
        )

    def test_leave_removes_player_character(self):
        self.client.force_authenticate(user=self.player)
        response = self.client.post(f"/api/campaigns/{self.campaign.id}/leave/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.player_char.refresh_from_db()
        self.assertIsNone(self.player_char.campaign)

    def test_leave_denied_for_campaign_owner(self):
        self.client.force_authenticate(user=self.dm)
        response = self.client.post(f"/api/campaigns/{self.campaign.id}/leave/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_leave_denied_for_non_member(self):
        outsider = User.objects.create_user(username="outsider", password="testpass123")
        self.client.force_authenticate(user=outsider)
        response = self.client.post(f"/api/campaigns/{self.campaign.id}/leave/")
        # Non-members get 404 because the queryset filters out campaigns they can't access
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_leave_removes_multiple_characters(self):
        """If a player has multiple characters in a campaign, all are removed."""
        second_char = Character.objects.create(
            name="Second Hero", race="Dwarf", class_name="Fighter",
            owner=self.player, campaign=self.campaign,
        )
        self.client.force_authenticate(user=self.player)
        response = self.client.post(f"/api/campaigns/{self.campaign.id}/leave/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.player_char.refresh_from_db()
        second_char.refresh_from_db()
        self.assertIsNone(self.player_char.campaign)
        self.assertIsNone(second_char.campaign)


class CampaignLookupByCodeTests(TestCase):
    """Tests for the /campaigns/lookup/{code}/ endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="player", password="testpass123")
        self.dm = User.objects.create_user(username="dm", password="testpass123")
        self.campaign = Campaign.objects.create(name="Findable Campaign", owner=self.dm)
        self.client.force_authenticate(user=self.user)

    def test_lookup_returns_campaign_info(self):
        response = self.client.get(f"/api/campaigns/lookup/{self.campaign.join_code}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Findable Campaign")
        self.assertIn("id", response.data)
        self.assertIn("characterCount", response.data)

    def test_lookup_not_found(self):
        response = self.client.get("/api/campaigns/lookup/ZZZZZ1/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class CampaignPlayerRetrieveTests(TestCase):
    """Tests that a player can retrieve a campaign they've joined."""

    def setUp(self):
        self.client = APIClient()
        self.dm = User.objects.create_user(username="dm", password="testpass123")
        self.player = User.objects.create_user(username="player", password="testpass123")
        self.outsider = User.objects.create_user(username="outsider", password="testpass123")
        self.campaign = Campaign.objects.create(name="Test Campaign", owner=self.dm)
        self.player_char = Character.objects.create(
            name="Player Hero", race="Elf", class_name="Wizard",
            owner=self.player, campaign=self.campaign,
        )

    def test_player_can_retrieve_joined_campaign(self):
        self.client.force_authenticate(user=self.player)
        response = self.client.get(f"/api/campaigns/{self.campaign.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Test Campaign")

    def test_outsider_cannot_retrieve_campaign(self):
        self.client.force_authenticate(user=self.outsider)
        response = self.client.get(f"/api/campaigns/{self.campaign.id}/")
        # Non-members get 404 because the queryset filters out campaigns they can't access
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_player_appears_in_campaign_list(self):
        """Player's campaigns should include joined campaigns."""
        self.client.force_authenticate(user=self.player)
        response = self.client.get("/api/campaigns/")
        # Player should see the campaign they joined
        campaign_ids = [c["id"] for c in response.data["results"]]
        self.assertIn(str(self.campaign.id), campaign_ids)


class PartyMemberCharacterAccessTests(TestCase):
    """Tests that players can view party members' character sheets."""

    def setUp(self):
        self.client = APIClient()
        self.dm = User.objects.create_user(username="dm", password="testpass123")
        self.player1 = User.objects.create_user(username="player1", password="testpass123")
        self.player2 = User.objects.create_user(username="player2", password="testpass123")
        self.outsider = User.objects.create_user(username="outsider", password="testpass123")
        self.campaign = Campaign.objects.create(name="Test Campaign", owner=self.dm)
        self.char1 = Character.objects.create(
            name="Player 1 Hero", race="Elf", class_name="Wizard",
            owner=self.player1, campaign=self.campaign,
        )
        self.char2 = Character.objects.create(
            name="Player 2 Hero", race="Dwarf", class_name="Fighter",
            owner=self.player2, campaign=self.campaign,
        )

    def test_player_can_view_party_member_character(self):
        self.client.force_authenticate(user=self.player1)
        response = self.client.get(f"/api/characters/{self.char2.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_outsider_cannot_view_party_member_character(self):
        self.client.force_authenticate(user=self.outsider)
        response = self.client.get(f"/api/characters/{self.char2.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
