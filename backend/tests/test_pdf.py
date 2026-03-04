"""
Tests for the PDF Character Sheet Export (Epic 39).

Covers:
- PDF endpoint auth, permissions, 404, content-type, content-disposition
- Template rendering (minimal and full character, caster vs non-caster)
- Context builder (ability modifiers, proficiency bonus, spell slots)
- PDFGenerationService (mocks WeasyPrint if system deps unavailable)

WeasyPrint requires cairo/pango system libraries. If those are not
present, tests that would call WeasyPrint mock the rendering step.
"""

import re
import uuid
from unittest.mock import MagicMock, patch

import pytest
from django.contrib.auth import get_user_model
from django.template.loader import render_to_string
from django.test import override_settings
from rest_framework.test import APIClient

from characters.models import Character
from pdf.context import (
    ability_modifier,
    build_character_context,
    format_modifier,
    proficiency_bonus,
)
from pdf.services import PDFGenerationError, PDFGenerationService

User = get_user_model()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def owner(db):
    return User.objects.create_user(
        username="thorin_player", email="thorin@example.com", password="SecurePass1!"
    )


@pytest.fixture
def other_user(db):
    return User.objects.create_user(
        username="other_player", email="other@example.com", password="SecurePass2!"
    )


@pytest.fixture
def fighter_character(owner):
    """Level 5 Fighter with full data — non-caster."""
    return Character.objects.create(
        name="Thorin Ironforge",
        race="Dwarf",
        class_name="Fighter",
        level=5,
        ability_scores={
            "strength": 16,
            "dexterity": 12,
            "constitution": 14,
            "intelligence": 10,
            "wisdom": 13,
            "charisma": 8,
        },
        skills=[
            {"name": "athletics", "proficient": True, "expertise": False},
            {"name": "perception", "proficient": True, "expertise": False},
        ],
        equipment=[
            {"name": "Longsword", "quantity": 1, "weight": 3},
            {"name": "Chain Mail", "quantity": 1, "weight": 55},
            {"name": "Shield", "quantity": 1, "weight": 6},
        ],
        spells=[],
        background="Soldier",
        hp=52,
        character_data={
            "playerName": "Test Player",
            "alignment": "lawful-good",
            "experiencePoints": 6500,
            "hpMax": 52,
            "hpCurrent": 44,
            "tempHp": 5,
            "hitDiceTotal": [5],
            "hitDiceUsed": [1],
            "speed": {"walk": 25},
            "deathSaves": {"successes": 1, "failures": 0},
            "combatStats": {
                "armorClass": {"base": 18, "formula": "16 + 2 (shield)"},
                "attacks": [
                    {
                        "name": "Longsword",
                        "attackBonus": 6,
                        "damage": "1d8+3",
                        "damageType": "slashing",
                    }
                ],
                "speed": {"walk": 25},
            },
            "proficiencies": {
                "armor": ["light", "medium", "heavy", "shields"],
                "weapons": ["simple", "martial"],
                "tools": [],
                "languages": ["Common", "Dwarvish"],
                "savingThrows": ["strength", "constitution"],
                "skills": [
                    {"skill": "athletics", "proficient": True, "expertise": False},
                    {"skill": "perception", "proficient": True, "expertise": False},
                ],
            },
            "personality": {
                "personalityTraits": [
                    "I can stare down a hell hound without flinching.",
                    "I enjoy being strong.",
                ],
                "ideal": "Greater Good",
                "bond": "I fight for those who cannot fight for themselves.",
                "flaw": "I have a weakness for ale.",
            },
            "features": ["Second Wind", "Action Surge", "Extra Attack"],
            "feats": [],
            "description": {
                "name": "Thorin Ironforge",
                "age": "150",
                "height": "4'4\"",
                "weight": "180 lbs",
                "eyes": "Brown",
                "skin": "Tan",
                "hair": "Black",
                "appearance": "Stocky and battle-scarred",
                "backstory": "A veteran of many wars, Thorin left his mountain home to seek adventure.",
                "alliesAndOrgs": "The Ironforge Clan",
                "treasure": "A family crest ring",
            },
            "currency": {"cp": 0, "sp": 15, "ep": 0, "gp": 50, "pp": 0},
        },
        owner=owner,
    )


@pytest.fixture
def wizard_character(owner):
    """Level 3 Wizard — spellcaster."""
    return Character.objects.create(
        name="Elara Nightwhisper",
        race="Elf",
        class_name="Wizard",
        level=3,
        ability_scores={
            "strength": 8,
            "dexterity": 14,
            "constitution": 12,
            "intelligence": 16,
            "wisdom": 10,
            "charisma": 13,
        },
        skills=[
            {"name": "arcana", "proficient": True, "expertise": False},
            {"name": "investigation", "proficient": True, "expertise": False},
        ],
        equipment=[
            {"name": "Quarterstaff", "quantity": 1, "weight": 4},
            {"name": "Spellbook", "quantity": 1, "weight": 3},
        ],
        spells=[
            {"name": "Fire Bolt", "level": 0, "prepared": True},
            {"name": "Mage Hand", "level": 0, "prepared": True},
            {"name": "Light", "level": 0, "prepared": True},
            {"name": "Magic Missile", "level": 1, "prepared": True},
            {"name": "Shield", "level": 1, "prepared": True},
            {"name": "Detect Magic", "level": 1, "prepared": True, "ritual": True},
            {"name": "Misty Step", "level": 2, "prepared": True},
            {"name": "Scorching Ray", "level": 2, "prepared": False},
        ],
        background="Sage",
        hp=18,
        character_data={
            "playerName": "Test Mage",
            "alignment": "neutral-good",
            "experiencePoints": 900,
            "hpMax": 18,
            "hpCurrent": 18,
            "tempHp": 0,
            "hitDiceTotal": [3],
            "hitDiceUsed": [0],
            "speed": {"walk": 30},
            "deathSaves": {"successes": 0, "failures": 0},
            "combatStats": {
                "armorClass": {"base": 12, "formula": "10 + 2 (DEX)"},
                "attacks": [],
            },
            "proficiencies": {
                "armor": [],
                "weapons": ["daggers", "darts", "slings", "quarterstaffs", "light crossbows"],
                "tools": [],
                "languages": ["Common", "Elvish", "Draconic"],
                "savingThrows": ["intelligence", "wisdom"],
                "skills": [
                    {"skill": "arcana", "proficient": True},
                    {"skill": "investigation", "proficient": True},
                ],
            },
            "personality": {
                "personalityTraits": ["I use polysyllabic words."],
                "ideal": "Knowledge",
                "bond": "My life's work is a series of tomes.",
                "flaw": "I overlook obvious solutions.",
            },
            "features": ["Arcane Recovery"],
            "feats": [],
            "description": {
                "age": "120",
                "height": "5'6\"",
                "weight": "120 lbs",
                "eyes": "Green",
                "skin": "Fair",
                "hair": "Silver",
                "backstory": "A scholar who left the academy to discover ancient magic.",
            },
            "currency": {"cp": 10, "sp": 5, "ep": 0, "gp": 75, "pp": 2},
        },
        owner=owner,
    )


@pytest.fixture
def minimal_character(owner):
    """Character with only required fields, no optional data."""
    return Character.objects.create(
        name="Minimal Bob",
        race="Human",
        class_name="Fighter",
        level=1,
        ability_scores={
            "strength": 10,
            "dexterity": 10,
            "constitution": 10,
            "intelligence": 10,
            "wisdom": 10,
            "charisma": 10,
        },
        skills=[],
        equipment=[],
        spells=[],
        background="",
        hp=10,
        character_data={},
        owner=owner,
    )


@pytest.fixture
def warlock_character(owner):
    """Level 5 Warlock with Pact Magic."""
    return Character.objects.create(
        name="Vex Shadowmere",
        race="Tiefling",
        class_name="Warlock",
        level=5,
        ability_scores={
            "strength": 8,
            "dexterity": 14,
            "constitution": 12,
            "intelligence": 10,
            "wisdom": 13,
            "charisma": 18,
        },
        skills=[],
        equipment=[],
        spells=[
            {"name": "Eldritch Blast", "level": 0, "prepared": True},
            {"name": "Hex", "level": 1, "prepared": True},
            {"name": "Armor of Agathys", "level": 1, "prepared": True},
            {"name": "Misty Step", "level": 2, "prepared": True},
            {"name": "Counterspell", "level": 3, "prepared": True},
        ],
        background="Charlatan",
        hp=33,
        character_data={},
        owner=owner,
    )


@pytest.fixture
def auth_client(owner):
    client = APIClient()
    client.force_authenticate(user=owner)
    return client


@pytest.fixture
def unauth_client():
    return APIClient()


@pytest.fixture
def other_client(other_user):
    client = APIClient()
    client.force_authenticate(user=other_user)
    return client


# ---------------------------------------------------------------------------
# Helper: mock WeasyPrint if unavailable
# ---------------------------------------------------------------------------


def _mock_weasyprint_generate():
    """Return a patcher that makes PDFGenerationService.generate return fake PDF bytes."""
    fake_pdf = b"%PDF-1.4 fake pdf content for testing"
    return patch.object(
        PDFGenerationService,
        "generate",
        return_value=fake_pdf,
    )


# ===========================================================================
# Context builder unit tests
# ===========================================================================


class TestContextBuilder:
    """Tests for pdf.context helper functions and build_character_context."""

    def test_ability_modifier_standard_values(self):
        assert ability_modifier(10) == 0
        assert ability_modifier(11) == 0
        assert ability_modifier(12) == 1
        assert ability_modifier(8) == -1
        assert ability_modifier(20) == 5
        assert ability_modifier(1) == -5

    def test_ability_modifier_none_returns_zero(self):
        assert ability_modifier(None) == 0

    def test_proficiency_bonus_by_level(self):
        assert proficiency_bonus(1) == 2
        assert proficiency_bonus(4) == 2
        assert proficiency_bonus(5) == 3
        assert proficiency_bonus(9) == 4
        assert proficiency_bonus(13) == 5
        assert proficiency_bonus(17) == 6
        assert proficiency_bonus(20) == 6

    def test_format_modifier(self):
        assert format_modifier(0) == "+0"
        assert format_modifier(3) == "+3"
        assert format_modifier(-2) == "-2"

    def test_build_context_basic_fields(self, fighter_character):
        ctx = build_character_context(fighter_character)
        char = ctx["character"]
        assert char["name"] == "Thorin Ironforge"
        assert char["class_name"] == "Fighter"
        assert char["level"] == 5
        assert char["race"] == "Dwarf"
        assert char["proficiency_bonus"] == 3

    def test_build_context_ability_scores(self, fighter_character):
        ctx = build_character_context(fighter_character)
        abilities = ctx["character"]["abilities"]
        assert len(abilities) == 6
        # STR 16 -> mod +3
        str_ab = next(a for a in abilities if a["abbreviation"] == "STR")
        assert str_ab["score"] == 16
        assert str_ab["modifier"] == 3
        assert str_ab["modifier_str"] == "+3"

    def test_build_context_saving_throws(self, fighter_character):
        ctx = build_character_context(fighter_character)
        saves = ctx["character"]["saving_throws"]
        assert len(saves) == 6
        str_save = next(s for s in saves if s["abbreviation"] == "STR")
        # STR mod (+3) + prof (+3) = +6
        assert str_save["proficient"] is True
        assert str_save["modifier"] == 6

    def test_build_context_skills(self, fighter_character):
        ctx = build_character_context(fighter_character)
        skills = ctx["character"]["skills"]
        assert len(skills) == 18  # all 18 D&D 5e skills
        athletics = next(s for s in skills if s["name"] == "Athletics")
        assert athletics["proficient"] is True
        # STR mod (3) + prof (3) = 6
        assert athletics["modifier"] == 6

    def test_build_context_combat_stats(self, fighter_character):
        ctx = build_character_context(fighter_character)
        char = ctx["character"]
        assert char["ac"] == 18
        assert char["speed"] == 25
        assert char["hp_max"] == 52
        assert char["hp_current"] == 44
        assert char["temp_hp"] == 5

    def test_build_context_attacks(self, fighter_character):
        ctx = build_character_context(fighter_character)
        attacks = ctx["character"]["attacks"]
        assert len(attacks) == 1
        assert attacks[0]["name"] == "Longsword"
        assert attacks[0]["bonus"] == "+6"

    def test_build_context_personality(self, fighter_character):
        ctx = build_character_context(fighter_character)
        char = ctx["character"]
        assert "hell hound" in char["personality_traits"]
        assert char["ideal"] == "Greater Good"
        assert "cannot fight" in char["bond"]

    def test_build_context_equipment(self, fighter_character):
        ctx = build_character_context(fighter_character)
        char = ctx["character"]
        assert len(char["equipment"]) == 3
        assert char["total_weight"] == 64  # 3 + 55 + 6
        assert char["carrying_capacity"] == 240  # 16 * 15

    def test_build_context_currency(self, fighter_character):
        ctx = build_character_context(fighter_character)
        char = ctx["character"]
        assert char["gp"] == 50
        assert char["sp"] == 15

    def test_build_context_description(self, fighter_character):
        ctx = build_character_context(fighter_character)
        char = ctx["character"]
        assert char["age"] == "150"
        assert char["eyes"] == "Brown"
        assert "veteran" in char["backstory"]

    def test_non_caster_is_not_spellcaster(self, fighter_character):
        ctx = build_character_context(fighter_character)
        assert ctx["character"]["is_spellcaster"] is False

    def test_wizard_is_spellcaster(self, wizard_character):
        ctx = build_character_context(wizard_character)
        char = ctx["character"]
        assert char["is_spellcaster"] is True
        assert char["spellcasting_ability"] == "Intelligence"
        assert char["spell_save_dc"] == 13  # 8 + 2 + 3
        assert char["spell_attack_bonus"] == "+5"  # 2 + 3

    def test_wizard_spells_organized_by_level(self, wizard_character):
        ctx = build_character_context(wizard_character)
        char = ctx["character"]
        assert len(char["cantrips"]) == 3
        assert len(char["spell_levels"]) >= 2  # levels 1 and 2

    def test_wizard_spell_slots(self, wizard_character):
        ctx = build_character_context(wizard_character)
        char = ctx["character"]
        level_1 = next(sl for sl in char["spell_levels"] if sl["level"] == 1)
        assert level_1["slots_total"] == 4

    def test_warlock_pact_magic(self, warlock_character):
        ctx = build_character_context(warlock_character)
        char = ctx["character"]
        assert char["is_spellcaster"] is True
        assert char["has_pact_magic"] is True
        assert char["pact_slots"]["count"] == 2
        assert char["pact_slots"]["level"] == 3

    def test_minimal_character_context(self, minimal_character):
        """Minimal character with empty data should not cause errors."""
        ctx = build_character_context(minimal_character)
        char = ctx["character"]
        assert char["name"] == "Minimal Bob"
        assert char["is_spellcaster"] is False
        assert len(char["abilities"]) == 6
        assert len(char["skills"]) == 18
        assert len(char["equipment"]) == 0


# ===========================================================================
# Template rendering tests (no WeasyPrint needed)
# ===========================================================================


@pytest.mark.django_db
class TestTemplateRendering:
    """Tests that Django templates render without errors for various character data."""

    def test_page1_renders_for_fighter(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/page1_core_stats.html", ctx)
        assert "Thorin Ironforge" in html
        assert "Fighter" in html
        assert "Armor Class" in html
        assert "Saving Throws" in html
        assert "Skills" in html

    def test_page1_includes_ability_scores(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/page1_core_stats.html", ctx)
        assert "STR" in html
        assert "DEX" in html
        assert "CON" in html
        assert "INT" in html
        assert "WIS" in html
        assert "CHA" in html
        assert "+3" in html  # STR modifier

    def test_page1_includes_all_18_skills(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/page1_core_stats.html", ctx)
        assert "Acrobatics" in html
        assert "Athletics" in html
        assert "Perception" in html
        assert "Stealth" in html
        assert "Survival" in html

    def test_page1_includes_combat_stats(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/page1_core_stats.html", ctx)
        assert "18" in html  # AC
        assert "25" in html  # Speed
        assert "Initiative" in html

    def test_page1_includes_attacks(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/page1_core_stats.html", ctx)
        assert "Longsword" in html
        assert "+6" in html
        assert "1d8+3" in html

    def test_page1_empty_attacks_renders_placeholder(self, minimal_character):
        ctx = build_character_context(minimal_character)
        html = render_to_string("pdf/page1_core_stats.html", ctx)
        assert "No attacks configured" in html

    def test_page1_includes_personality(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/page1_core_stats.html", ctx)
        assert "Personality Traits" in html
        assert "Greater Good" in html  # Ideal

    def test_page2_renders_for_fighter(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/page2_backstory.html", ctx)
        assert "Backstory" in html
        assert "veteran" in html
        assert "Equipment" in html
        assert "Longsword" in html

    def test_page2_includes_appearance_fields(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/page2_backstory.html", ctx)
        assert "150" in html  # age
        assert "Brown" in html  # eyes
        assert "Black" in html  # hair

    def test_page2_includes_currency(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/page2_backstory.html", ctx)
        assert "GP" in html
        assert "50" in html

    def test_page2_no_avatar_shows_placeholder(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/page2_backstory.html", ctx)
        assert "No Portrait" in html

    def test_page2_empty_fields_render_gracefully(self, minimal_character):
        ctx = build_character_context(minimal_character)
        html = render_to_string("pdf/page2_backstory.html", ctx)
        assert "No equipment" in html
        assert "No backstory provided" in html

    def test_page3_renders_for_wizard(self, wizard_character):
        ctx = build_character_context(wizard_character)
        html = render_to_string("pdf/page3_spellcasting.html", ctx)
        assert "Spellcasting" in html
        assert "Intelligence" in html
        assert "Fire Bolt" in html
        assert "Magic Missile" in html

    def test_page3_includes_spell_save_dc(self, wizard_character):
        ctx = build_character_context(wizard_character)
        html = render_to_string("pdf/page3_spellcasting.html", ctx)
        assert "13" in html  # spell save DC

    def test_page3_includes_cantrips(self, wizard_character):
        ctx = build_character_context(wizard_character)
        html = render_to_string("pdf/page3_spellcasting.html", ctx)
        assert "Fire Bolt" in html
        assert "Mage Hand" in html
        assert "Light" in html

    def test_page3_ritual_spells_marked(self, wizard_character):
        ctx = build_character_context(wizard_character)
        html = render_to_string("pdf/page3_spellcasting.html", ctx)
        assert "(R)" in html  # Detect Magic has ritual: True

    def test_page3_warlock_pact_magic(self, warlock_character):
        ctx = build_character_context(warlock_character)
        html = render_to_string("pdf/page3_spellcasting.html", ctx)
        assert "Pact Magic" in html
        assert "Short Rest" in html

    def test_master_template_includes_page1_and_page2(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/character_sheet.html", ctx)
        assert 'id="page1"' in html
        assert 'id="page2"' in html

    def test_master_template_excludes_page3_for_non_caster(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/character_sheet.html", ctx)
        assert 'id="page3"' not in html

    def test_master_template_includes_page3_for_caster(self, wizard_character):
        ctx = build_character_context(wizard_character)
        html = render_to_string("pdf/character_sheet.html", ctx)
        assert 'id="page1"' in html
        assert 'id="page2"' in html
        assert 'id="page3"' in html

    def test_master_template_includes_css_link(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/character_sheet.html", ctx)
        assert "styles.css" in html

    def test_master_template_page_break_classes(self, fighter_character):
        ctx = build_character_context(fighter_character)
        html = render_to_string("pdf/character_sheet.html", ctx)
        assert "pdf-page" in html

    def test_minimal_character_master_template(self, minimal_character):
        ctx = build_character_context(minimal_character)
        html = render_to_string("pdf/character_sheet.html", ctx)
        assert "Minimal Bob" in html
        assert 'id="page1"' in html
        assert 'id="page2"' in html


# ===========================================================================
# PDFGenerationService tests
# ===========================================================================


@pytest.mark.django_db
class TestPDFGenerationService:
    """Tests for the PDFGenerationService class."""

    def test_build_filename_standard(self, fighter_character):
        filename = PDFGenerationService.build_filename(fighter_character)
        assert filename == "Thorin_Ironforge_Level5_Fighter.pdf"

    def test_build_filename_sanitizes_special_chars(self, owner):
        char = Character.objects.create(
            name="Bob's <Char>",
            race="Human",
            class_name="Fighter",
            level=1,
            ability_scores={},
            owner=owner,
        )
        filename = PDFGenerationService.build_filename(char)
        assert "<" not in filename
        assert ">" not in filename
        assert "'" not in filename
        assert filename.endswith(".pdf")

    def test_build_filename_empty_name(self, owner):
        char = Character.objects.create(
            name="",
            race="Human",
            class_name="Fighter",
            level=1,
            ability_scores={},
            owner=owner,
        )
        filename = PDFGenerationService.build_filename(char)
        assert filename.startswith("Character_")

    def test_render_html_returns_string(self, fighter_character):
        service = PDFGenerationService()
        html = service.render_html(fighter_character)
        assert isinstance(html, str)
        assert "Thorin Ironforge" in html

    def test_generate_raises_when_weasyprint_unavailable(self, fighter_character):
        service = PDFGenerationService()
        with patch("pdf.services.WEASYPRINT_AVAILABLE", False):
            with pytest.raises(PDFGenerationError, match="WeasyPrint is not installed"):
                service.generate(fighter_character)


# ===========================================================================
# API endpoint tests
# ===========================================================================


@pytest.mark.django_db
class TestCharacterPDFEndpoint:
    """Tests for GET /api/characters/:id/pdf/."""

    def test_authenticated_owner_gets_200(self, auth_client, fighter_character):
        with _mock_weasyprint_generate():
            url = f"/api/characters/{fighter_character.id}/pdf/"
            response = auth_client.get(url)
            assert response.status_code == 200

    def test_response_content_type_is_pdf(self, auth_client, fighter_character):
        with _mock_weasyprint_generate():
            url = f"/api/characters/{fighter_character.id}/pdf/"
            response = auth_client.get(url)
            assert response["Content-Type"] == "application/pdf"

    def test_response_starts_with_pdf_magic_bytes(self, auth_client, fighter_character):
        with _mock_weasyprint_generate():
            url = f"/api/characters/{fighter_character.id}/pdf/"
            response = auth_client.get(url)
            assert response.content.startswith(b"%PDF-")

    def test_content_disposition_header(self, auth_client, fighter_character):
        with _mock_weasyprint_generate():
            url = f"/api/characters/{fighter_character.id}/pdf/"
            response = auth_client.get(url)
            disposition = response["Content-Disposition"]
            assert "attachment" in disposition
            assert "Thorin_Ironforge_Level5_Fighter.pdf" in disposition

    def test_unauthenticated_user_gets_403(self, unauth_client, fighter_character):
        url = f"/api/characters/{fighter_character.id}/pdf/"
        response = unauth_client.get(url)
        assert response.status_code == 403

    def test_non_owner_gets_403(self, other_client, fighter_character):
        url = f"/api/characters/{fighter_character.id}/pdf/"
        response = other_client.get(url)
        assert response.status_code == 403

    def test_nonexistent_character_gets_404(self, auth_client):
        fake_id = uuid.uuid4()
        url = f"/api/characters/{fake_id}/pdf/"
        response = auth_client.get(url)
        assert response.status_code == 404

    def test_wizard_character_pdf(self, auth_client, wizard_character):
        with _mock_weasyprint_generate():
            url = f"/api/characters/{wizard_character.id}/pdf/"
            response = auth_client.get(url)
            assert response.status_code == 200
            assert response["Content-Type"] == "application/pdf"
            assert "Elara_Nightwhisper" in response["Content-Disposition"]

    def test_minimal_character_pdf(self, auth_client, minimal_character):
        with _mock_weasyprint_generate():
            url = f"/api/characters/{minimal_character.id}/pdf/"
            response = auth_client.get(url)
            assert response.status_code == 200

    def test_pdf_generation_error_returns_500(self, auth_client, fighter_character):
        with patch.object(
            PDFGenerationService,
            "generate",
            side_effect=PDFGenerationError("Test error"),
        ):
            url = f"/api/characters/{fighter_character.id}/pdf/"
            response = auth_client.get(url)
            assert response.status_code == 500
