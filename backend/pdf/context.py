"""
Context builder for PDF character sheet templates.

Transforms the raw Django Character model data (which stores ability_scores,
skills, equipment, and spells as JSONFields) into a rich, template-friendly
dictionary with computed modifiers, proficiency bonus, AC, initiative,
spell slots, and other derived values.
"""

import math

# Standard D&D 5e skill list, each mapped to its governing ability.
SKILL_ABILITY_MAP = {
    "Acrobatics": "dexterity",
    "Animal Handling": "wisdom",
    "Arcana": "intelligence",
    "Athletics": "strength",
    "Deception": "charisma",
    "History": "intelligence",
    "Insight": "wisdom",
    "Intimidation": "charisma",
    "Investigation": "intelligence",
    "Medicine": "wisdom",
    "Nature": "intelligence",
    "Perception": "wisdom",
    "Performance": "charisma",
    "Persuasion": "charisma",
    "Religion": "intelligence",
    "Sleight of Hand": "dexterity",
    "Stealth": "dexterity",
    "Survival": "wisdom",
}

ABILITY_NAMES = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
]

ABILITY_ABBREVIATIONS = {
    "strength": "STR",
    "dexterity": "DEX",
    "constitution": "CON",
    "intelligence": "INT",
    "wisdom": "WIS",
    "charisma": "CHA",
}

# Spellcasting ability per class (5e SRD)
SPELLCASTING_CLASSES = {
    "bard": "charisma",
    "cleric": "wisdom",
    "druid": "wisdom",
    "paladin": "charisma",
    "ranger": "wisdom",
    "sorcerer": "charisma",
    "warlock": "charisma",
    "wizard": "intelligence",
    "artificer": "intelligence",
}

# Full casters spell slot progression (Bard, Cleric, Druid, Sorcerer, Wizard)
FULL_CASTER_SLOTS = {
    1: {1: 2},
    2: {1: 3},
    3: {1: 4, 2: 2},
    4: {1: 4, 2: 3},
    5: {1: 4, 2: 3, 3: 2},
    6: {1: 4, 2: 3, 3: 3},
    7: {1: 4, 2: 3, 3: 3, 4: 1},
    8: {1: 4, 2: 3, 3: 3, 4: 2},
    9: {1: 4, 2: 3, 3: 3, 4: 3, 5: 1},
    10: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2},
    11: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1},
    12: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1},
    13: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1},
    14: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1},
    15: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1},
    16: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1},
    17: {1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1},
    18: {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1},
    19: {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1},
    20: {1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1},
}

HALF_CASTER_CLASSES = {"paladin", "ranger", "artificer"}
FULL_CASTER_CLASSES = {"bard", "cleric", "druid", "sorcerer", "wizard"}

# Warlock pact magic slots by level
WARLOCK_PACT_SLOTS = {
    1: {"count": 1, "level": 1},
    2: {"count": 2, "level": 1},
    3: {"count": 2, "level": 2},
    4: {"count": 2, "level": 2},
    5: {"count": 2, "level": 3},
    6: {"count": 2, "level": 3},
    7: {"count": 2, "level": 4},
    8: {"count": 2, "level": 4},
    9: {"count": 2, "level": 5},
    10: {"count": 2, "level": 5},
    11: {"count": 3, "level": 5},
    12: {"count": 3, "level": 5},
    13: {"count": 3, "level": 5},
    14: {"count": 3, "level": 5},
    15: {"count": 3, "level": 5},
    16: {"count": 3, "level": 5},
    17: {"count": 4, "level": 5},
    18: {"count": 4, "level": 5},
    19: {"count": 4, "level": 5},
    20: {"count": 4, "level": 5},
}


def ability_modifier(score):
    """Compute the D&D ability modifier from a score."""
    if score is None:
        return 0
    return math.floor((int(score) - 10) / 2)


def proficiency_bonus(level):
    """Compute proficiency bonus from character level."""
    if level is None or level < 1:
        return 2
    return 2 + (int(level) - 1) // 4


def format_modifier(mod):
    """Format a modifier as a string like '+3' or '-1'."""
    if mod >= 0:
        return f"+{mod}"
    return str(mod)


def build_character_context(character):
    """
    Build a template context dictionary from a Character model instance.

    Returns a dict suitable for passing to Django templates for PDF rendering.
    """
    # --- Basic info ---
    char_data = character.character_data or {}
    ability_scores = character.ability_scores or {}
    skills_data = character.skills or []
    equipment_data = character.equipment or []
    spells_data = character.spells or []
    level = character.level or 1
    class_name = character.class_name or "Unknown"
    class_name_lower = class_name.lower().split("/")[0].strip()

    prof_bonus = proficiency_bonus(level)

    # --- Ability scores and modifiers ---
    abilities = []
    modifiers = {}
    for ab in ABILITY_NAMES:
        score = ability_scores.get(ab, 10)
        mod = ability_modifier(score)
        modifiers[ab] = mod
        abilities.append(
            {
                "name": ab.capitalize(),
                "abbreviation": ABILITY_ABBREVIATIONS[ab],
                "score": score,
                "modifier": mod,
                "modifier_str": format_modifier(mod),
            }
        )

    # --- Saving throws ---
    # Determine save proficiencies from character_data or skills
    save_proficiencies = set()
    if isinstance(char_data.get("proficiencies"), dict):
        st_list = char_data["proficiencies"].get("savingThrows", [])
        for s in st_list:
            save_proficiencies.add(s.lower())

    saving_throws = []
    for ab in ABILITY_NAMES:
        mod = modifiers[ab]
        is_proficient = ab in save_proficiencies
        total = mod + (prof_bonus if is_proficient else 0)
        saving_throws.append(
            {
                "name": ab.capitalize(),
                "abbreviation": ABILITY_ABBREVIATIONS[ab],
                "modifier": total,
                "modifier_str": format_modifier(total),
                "proficient": is_proficient,
            }
        )

    # --- Skills ---
    # Build a set of proficient and expertise skills
    skill_proficiencies = set()
    skill_expertise = set()
    if isinstance(skills_data, list):
        for sk in skills_data:
            if isinstance(sk, dict):
                name = sk.get("name", sk.get("skill", ""))
                if sk.get("proficient", False):
                    skill_proficiencies.add(name.lower())
                if sk.get("expertise", False):
                    skill_expertise.add(name.lower())
            elif isinstance(sk, str):
                skill_proficiencies.add(sk.lower())

    # Also check character_data proficiencies
    if isinstance(char_data.get("proficiencies"), dict):
        prof_skills = char_data["proficiencies"].get("skills", [])
        for sk in prof_skills:
            if isinstance(sk, dict):
                name = sk.get("skill", sk.get("name", ""))
                if sk.get("proficient", True):
                    skill_proficiencies.add(name.lower().replace("-", " "))
                if sk.get("expertise", False):
                    skill_expertise.add(name.lower().replace("-", " "))
            elif isinstance(sk, str):
                skill_proficiencies.add(sk.lower().replace("-", " "))

    skills_list = []
    for skill_name, ab in sorted(SKILL_ABILITY_MAP.items()):
        skill_lower = skill_name.lower()
        # Also check with dashes
        skill_dashed = skill_name.lower().replace(" ", "-")
        is_proficient = (
            skill_lower in skill_proficiencies or skill_dashed in skill_proficiencies
        )
        is_expertise = (
            skill_lower in skill_expertise or skill_dashed in skill_expertise
        )
        mod = modifiers.get(ab, 0)
        bonus = mod
        if is_expertise:
            bonus += prof_bonus * 2
        elif is_proficient:
            bonus += prof_bonus
        skills_list.append(
            {
                "name": skill_name,
                "ability": ABILITY_ABBREVIATIONS.get(ab, ab[:3].upper()),
                "modifier": bonus,
                "modifier_str": format_modifier(bonus),
                "proficient": is_proficient,
                "expertise": is_expertise,
            }
        )

    # --- Passive perception ---
    wis_mod = modifiers.get("wisdom", 0)
    perception_proficient = (
        "perception" in skill_proficiencies
    )
    passive_perception = 10 + wis_mod + (prof_bonus if perception_proficient else 0)

    # --- Combat stats ---
    combat_stats = char_data.get("combatStats", {})
    ac_data = combat_stats.get("armorClass", {})
    ac = ac_data.get("base", 10) if isinstance(ac_data, dict) else 10
    ac_formula = ac_data.get("formula", "") if isinstance(ac_data, dict) else ""
    initiative = modifiers.get("dexterity", 0)
    speed_data = char_data.get("speed", combat_stats.get("speed", {}))
    speed = speed_data.get("walk", 30) if isinstance(speed_data, dict) else 30

    # --- Hit points ---
    hp_max = char_data.get("hpMax", character.hp) or character.hp
    hp_current = char_data.get("hpCurrent", hp_max)
    temp_hp = char_data.get("tempHp", 0)

    # Hit dice
    hit_dice_total = char_data.get("hitDiceTotal", [level])
    hit_dice_used = char_data.get("hitDiceUsed", [0])

    # Death saves
    death_saves = char_data.get("deathSaves", {})
    death_save_successes = death_saves.get("successes", 0) if isinstance(death_saves, dict) else 0
    death_save_failures = death_saves.get("failures", 0) if isinstance(death_saves, dict) else 0

    # --- Attacks ---
    attacks = []
    if isinstance(combat_stats.get("attacks"), list):
        for atk in combat_stats["attacks"]:
            if isinstance(atk, dict):
                attacks.append(
                    {
                        "name": atk.get("name", "Unknown"),
                        "bonus": format_modifier(atk.get("attackBonus", 0)),
                        "damage": atk.get("damage", "--"),
                        "damage_type": atk.get("damageType", ""),
                    }
                )

    # --- Personality ---
    personality = char_data.get("personality", {})
    if not isinstance(personality, dict):
        personality = {}
    personality_traits = personality.get("personalityTraits", [])
    if isinstance(personality_traits, list):
        personality_traits = "\n".join(personality_traits)
    ideal = personality.get("ideal", "")
    bond = personality.get("bond", "")
    flaw = personality.get("flaw", "")

    # --- Features ---
    features = char_data.get("features", [])
    if not isinstance(features, list):
        features = []
    feats = char_data.get("feats", [])
    if not isinstance(feats, list):
        feats = []

    # --- Proficiencies ---
    proficiencies = char_data.get("proficiencies", {})
    if not isinstance(proficiencies, dict):
        proficiencies = {}
    armor_prof = proficiencies.get("armor", [])
    weapon_prof = proficiencies.get("weapons", [])
    tool_prof = proficiencies.get("tools", [])
    languages = proficiencies.get("languages", [])

    # --- Description / appearance (page 2) ---
    description = char_data.get("description", {})
    if not isinstance(description, dict):
        description = {}
    age = description.get("age", "")
    height = description.get("height", "")
    weight = description.get("weight", "")
    eyes = description.get("eyes", "")
    skin = description.get("skin", "")
    hair = description.get("hair", "")
    appearance = description.get("appearance", "")
    backstory = description.get("backstory", "")
    allies_and_orgs = description.get("alliesAndOrgs", "")
    treasure_notes = description.get("treasure", "")
    avatar_url = char_data.get("avatarUrl", None)

    # --- Currency ---
    currency = char_data.get("currency", {})
    if not isinstance(currency, dict):
        currency = {}

    # --- Equipment ---
    equipment_list = []
    total_weight = 0
    if isinstance(equipment_data, list):
        for item in equipment_data:
            if isinstance(item, dict):
                name = item.get("name", "Unknown")
                qty = item.get("quantity", 1)
                wt = item.get("weight", 0)
                equipment_list.append(
                    {
                        "name": name,
                        "quantity": qty,
                        "weight": wt,
                    }
                )
                total_weight += (wt or 0) * (qty or 1)
            elif isinstance(item, str):
                equipment_list.append(
                    {"name": item, "quantity": 1, "weight": 0}
                )

    strength_score = ability_scores.get("strength", 10)
    carrying_capacity = int(strength_score) * 15

    # --- Spellcasting ---
    is_spellcaster = class_name_lower in SPELLCASTING_CLASSES
    has_pact_magic = class_name_lower == "warlock"
    spellcasting_ability = SPELLCASTING_CLASSES.get(class_name_lower, None)
    spell_ability_mod = modifiers.get(spellcasting_ability, 0) if spellcasting_ability else 0
    spell_save_dc = 8 + prof_bonus + spell_ability_mod if is_spellcaster else None
    spell_attack_bonus = prof_bonus + spell_ability_mod if is_spellcaster else None

    # Also check character_data for explicit spellcasting info
    spellcasting_data = char_data.get("spellcasting", None)
    if spellcasting_data and isinstance(spellcasting_data, dict):
        is_spellcaster = True
        if spellcasting_data.get("ability"):
            spellcasting_ability = spellcasting_data["ability"]
            spell_ability_mod = modifiers.get(spellcasting_ability, 0)
            spell_save_dc = 8 + prof_bonus + spell_ability_mod
            spell_attack_bonus = prof_bonus + spell_ability_mod

    # Spell slots
    spell_slots = {}
    if is_spellcaster and not has_pact_magic:
        if class_name_lower in FULL_CASTER_CLASSES:
            spell_slots = FULL_CASTER_SLOTS.get(level, {})
        elif class_name_lower in HALF_CASTER_CLASSES:
            effective_level = max(1, level // 2)
            spell_slots = FULL_CASTER_SLOTS.get(effective_level, {})

    # Pact magic slots (Warlock)
    pact_slots = None
    if has_pact_magic:
        pact_slots = WARLOCK_PACT_SLOTS.get(level, {"count": 1, "level": 1})

    # Organize spells by level
    cantrips = []
    spells_by_level = {}  # {1: [...], 2: [...], ...}
    if isinstance(spells_data, list):
        for sp in spells_data:
            if isinstance(sp, dict):
                sp_level = sp.get("level", 0)
                sp_name = sp.get("name", "Unknown Spell")
                sp_prepared = sp.get("prepared", False)
                sp_always = sp.get("alwaysPrepared", False)
                sp_ritual = sp.get("ritual", False)
                spell_entry = {
                    "name": sp_name,
                    "prepared": sp_prepared or sp_always,
                    "always_prepared": sp_always,
                    "ritual": sp_ritual,
                }
                if sp_level == 0:
                    cantrips.append(spell_entry)
                else:
                    spells_by_level.setdefault(sp_level, []).append(spell_entry)
            elif isinstance(sp, str):
                cantrips.append({"name": sp, "prepared": True, "always_prepared": False, "ritual": False})

    # Build spell levels list for template iteration
    spell_levels = []
    for lvl in range(1, 10):
        spells_at_level = spells_by_level.get(lvl, [])
        slots = spell_slots.get(lvl, 0)
        if spells_at_level or slots > 0:
            spell_levels.append(
                {
                    "level": lvl,
                    "slots_total": slots,
                    "slots_range": range(slots),
                    "spells": sorted(spells_at_level, key=lambda s: s["name"]),
                }
            )

    # Alignment formatting
    alignment = char_data.get("alignment", "")
    if isinstance(alignment, str):
        alignment = alignment.replace("-", " ").title()

    # Experience points
    xp = char_data.get("experiencePoints", 0)

    context = {
        "character": {
            "name": character.name or "Unnamed Character",
            "class_name": class_name,
            "level": level,
            "race": character.race or "Unknown",
            "background": character.background or "",
            "alignment": alignment,
            "xp": xp,
            "player_name": char_data.get("playerName", ""),
            # Abilities
            "abilities": abilities,
            "proficiency_bonus": prof_bonus,
            "proficiency_bonus_str": format_modifier(prof_bonus),
            # Saving throws
            "saving_throws": saving_throws,
            # Skills
            "skills": skills_list,
            "passive_perception": passive_perception,
            # Combat
            "ac": ac,
            "ac_formula": ac_formula,
            "initiative": initiative,
            "initiative_str": format_modifier(initiative),
            "speed": speed,
            # HP
            "hp_max": hp_max,
            "hp_current": hp_current,
            "temp_hp": temp_hp,
            "hit_dice_total": hit_dice_total,
            "hit_dice_used": hit_dice_used,
            "death_save_successes": death_save_successes,
            "death_save_failures": death_save_failures,
            "death_save_success_range": range(3),
            "death_save_failure_range": range(3),
            # Attacks
            "attacks": attacks,
            # Personality
            "personality_traits": personality_traits,
            "ideal": ideal,
            "bond": bond,
            "flaw": flaw,
            # Features
            "features": features,
            "feats": feats,
            # Proficiencies
            "armor_proficiencies": armor_prof,
            "weapon_proficiencies": weapon_prof,
            "tool_proficiencies": tool_prof,
            "languages": languages,
            # Page 2: Backstory
            "age": age,
            "height": height,
            "weight": weight,
            "eyes": eyes,
            "skin": skin,
            "hair": hair,
            "appearance": appearance,
            "backstory": backstory,
            "allies_and_orgs": allies_and_orgs,
            "treasure_notes": treasure_notes,
            "avatar_url": avatar_url,
            # Currency
            "cp": currency.get("cp", 0),
            "sp": currency.get("sp", 0),
            "ep": currency.get("ep", 0),
            "gp": currency.get("gp", 0),
            "pp": currency.get("pp", 0),
            # Equipment
            "equipment": equipment_list,
            "total_weight": total_weight,
            "carrying_capacity": carrying_capacity,
            # Spellcasting
            "is_spellcaster": is_spellcaster,
            "has_pact_magic": has_pact_magic,
            "spellcasting_class": class_name if is_spellcaster else "",
            "spellcasting_ability": (
                spellcasting_ability.capitalize() if spellcasting_ability else ""
            ),
            "spell_save_dc": spell_save_dc,
            "spell_attack_bonus": (
                format_modifier(spell_attack_bonus) if spell_attack_bonus is not None else ""
            ),
            "cantrips": cantrips,
            "spell_levels": spell_levels,
            "pact_slots": pact_slots,
        }
    }

    return context
