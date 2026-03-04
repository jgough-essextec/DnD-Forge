/**
 * Spellcasting Calculations (Story 4.4)
 *
 * Pure calculation functions for spell save DC, spell attack bonus, spell slots
 * (single-class, multiclass, and Pact Magic), cantrips known, spells
 * known/prepared, and spell casting eligibility. All functions are
 * deterministic and side-effect free.
 */

import {
  FULL_CASTER_SPELL_SLOTS,
  HALF_CASTER_SPELL_SLOTS,
  THIRD_CASTER_SPELL_SLOTS,
  PACT_MAGIC_SLOTS,
} from '@/data/reference';
import { MULTICLASS_SPELL_SLOT_TABLE } from '@/types/spell';
import { CLASSES } from '@/data/classes';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Caster type for spell slot calculation */
export type CasterType = 'full' | 'half' | 'third' | 'pact';

/** Entry for multiclass caster level calculation */
export interface MulticlassCasterEntry {
  type: 'full' | 'half' | 'third';
  level: number;
}

// ---------------------------------------------------------------------------
// Spell Save DC
// ---------------------------------------------------------------------------

/**
 * Calculate the spell save DC.
 * Formula: 8 + proficiency bonus + spellcasting ability modifier
 *
 * @param abilityModifier - The spellcasting ability modifier (INT for Wizard, WIS for Cleric, etc.)
 * @param proficiencyBonus - The character's proficiency bonus
 * @returns The spell save DC
 */
export function getSpellSaveDC(abilityModifier: number, proficiencyBonus: number): number {
  return 8 + proficiencyBonus + abilityModifier;
}

// ---------------------------------------------------------------------------
// Spell Attack Bonus
// ---------------------------------------------------------------------------

/**
 * Calculate the spell attack bonus.
 * Formula: proficiency bonus + spellcasting ability modifier
 *
 * @param abilityModifier - The spellcasting ability modifier
 * @param proficiencyBonus - The character's proficiency bonus
 * @returns The spell attack bonus
 */
export function getSpellAttackBonus(abilityModifier: number, proficiencyBonus: number): number {
  return proficiencyBonus + abilityModifier;
}

// ---------------------------------------------------------------------------
// Spell Slots (Single-Class)
// ---------------------------------------------------------------------------

/**
 * Convert a spell slot array (from the progression tables) to a Record<number, number>
 * mapping spell level (1-9) to number of slots.
 */
function slotsArrayToRecord(slots: readonly number[]): Record<number, number> {
  const result: Record<number, number> = {};
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] > 0) {
      result[i + 1] = slots[i];
    }
  }
  return result;
}

/**
 * Get spell slots for a single-class caster at a given level.
 *
 * - Full casters (Bard, Cleric, Druid, Sorcerer, Wizard): full progression, start at level 1
 * - Half casters (Paladin, Ranger): half progression, start at level 2
 * - Third casters (Eldritch Knight, Arcane Trickster): third progression, start at level 3
 * - Pact casters (Warlock): use getPactMagicSlots instead (returns empty here)
 *
 * @param classType - The caster type
 * @param level - The class level (1-20)
 * @returns A record mapping spell level to number of slots
 */
export function getSpellSlots(
  classType: CasterType,
  level: number,
): Record<number, number> {
  if (level < 1 || level > 20) return {};

  const index = level - 1;

  switch (classType) {
    case 'full':
      return slotsArrayToRecord(FULL_CASTER_SPELL_SLOTS[index]);
    case 'half':
      return slotsArrayToRecord(HALF_CASTER_SPELL_SLOTS[index]);
    case 'third':
      return slotsArrayToRecord(THIRD_CASTER_SPELL_SLOTS[index]);
    case 'pact':
      // Warlock uses Pact Magic, not standard spell slots
      return {};
    default:
      return {};
  }
}

// ---------------------------------------------------------------------------
// Multiclass Spell Slots
// ---------------------------------------------------------------------------

/**
 * Calculate the combined caster level for multiclass spell slot determination.
 *
 * - Full casters contribute full class level
 * - Half casters contribute floor(class level / 2)
 * - Third casters contribute floor(class level / 3)
 * - Warlock (Pact Magic) does NOT contribute (tracked separately)
 *
 * @param classes - Array of class entries with caster type and level
 * @returns The combined caster level
 */
export function getMulticlassCasterLevel(
  classes: MulticlassCasterEntry[],
): number {
  let total = 0;
  for (const cls of classes) {
    switch (cls.type) {
      case 'full':
        total += cls.level;
        break;
      case 'half':
        total += Math.floor(cls.level / 2);
        break;
      case 'third':
        total += Math.floor(cls.level / 3);
        break;
    }
  }
  return total;
}

/**
 * Get spell slots for a multiclass character using the combined caster level.
 *
 * The combined caster level is calculated by summing individual class contributions,
 * then looked up in the multiclass spell slot table.
 *
 * @param classes - Array of class entries with caster type and level
 * @returns A record mapping spell level to number of slots
 */
export function getMulticlassSpellSlots(
  classes: MulticlassCasterEntry[],
): Record<number, number> {
  const casterLevel = getMulticlassCasterLevel(classes);

  if (casterLevel <= 0 || casterLevel > 20) {
    return casterLevel <= 0 ? {} : slotsArrayToRecord(MULTICLASS_SPELL_SLOT_TABLE[20]);
  }

  return slotsArrayToRecord(MULTICLASS_SPELL_SLOT_TABLE[casterLevel]);
}

// ---------------------------------------------------------------------------
// Cantrips Known
// ---------------------------------------------------------------------------

/**
 * Get the number of cantrips known for a given class at a given level.
 *
 * This looks up the cantripsKnown array from the class's spellcasting data.
 * Non-spellcasting classes return 0.
 *
 * @param classId - The class identifier (e.g. 'wizard', 'cleric')
 * @param level - The class level (1-20)
 * @returns The number of cantrips known
 */
export function getCantripsKnown(classId: string, level: number): number {
  if (level < 1) return 0;

  const cls = CLASSES.find((c) => c.id === classId);
  if (!cls || !cls.spellcasting) return 0;

  const cantrips = cls.spellcasting.cantripsKnown;
  const index = Math.min(level, cantrips.length) - 1;

  return cantrips[index] ?? 0;
}

// ---------------------------------------------------------------------------
// Spells Known / Prepared
// ---------------------------------------------------------------------------

/**
 * Get the number of spells a character can know or have prepared.
 *
 * - Prepared casters (Cleric, Druid, Paladin, Wizard):
 *   ability modifier + class level (minimum 1)
 * - Known casters (Bard, Ranger, Sorcerer, Warlock):
 *   Fixed value from class table by level
 *
 * @param params - Parameters for the calculation
 * @returns Number of spells known or prepared
 */
export function getSpellsKnownOrPrepared(params: {
  classId: string;
  level: number;
  abilityModifier: number;
  preparedCaster: boolean;
}): number {
  const { classId, level, abilityModifier, preparedCaster } = params;

  if (level < 1) return 0;

  if (preparedCaster) {
    // Prepared casters: ability modifier + class level, minimum 1
    return Math.max(1, abilityModifier + level);
  }

  // Known casters: look up the fixed value from class data
  const cls = CLASSES.find((c) => c.id === classId);
  if (!cls || !cls.spellcasting || !cls.spellcasting.spellsKnownByLevel) {
    return 0;
  }

  const knownByLevel = cls.spellcasting.spellsKnownByLevel;
  const index = Math.min(level, knownByLevel.length) - 1;

  return knownByLevel[index] ?? 0;
}

// ---------------------------------------------------------------------------
// Spell Casting Eligibility
// ---------------------------------------------------------------------------

/**
 * Check if a character can cast a spell of a given level.
 *
 * A character can cast a spell if they have at least one available slot
 * at or above the spell's level.
 *
 * @param spellLevel - The level of the spell to cast (1-9)
 * @param availableSlots - Record of available spell slots (level -> count)
 * @returns True if the character can cast the spell
 */
export function canCastSpell(
  spellLevel: number,
  availableSlots: Record<number, number>,
): boolean {
  if (spellLevel === 0) return true; // Cantrips can always be cast

  for (let slotLevel = spellLevel; slotLevel <= 9; slotLevel++) {
    if ((availableSlots[slotLevel] ?? 0) > 0) {
      return true;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// Pact Magic (Warlock)
// ---------------------------------------------------------------------------

/**
 * Get Pact Magic slot information for a Warlock at a given level.
 *
 * Warlock spell slots are all at the same level and recharge on a short rest.
 * - Level 1: 1 slot at 1st level
 * - Level 2: 2 slots at 1st level
 * - Level 3-4: 2 slots at 2nd level
 * - Level 5-6: 2 slots at 3rd level
 * - Level 7-8: 2 slots at 4th level
 * - Level 9-10: 2 slots at 5th level
 * - Level 11-16: 3 slots at 5th level
 * - Level 17-20: 4 slots at 5th level
 *
 * @param warlockLevel - The Warlock's class level (1-20)
 * @returns Object with slotLevel and numSlots
 */
export function getPactMagicSlots(
  warlockLevel: number,
): { slotLevel: number; numSlots: number } {
  if (warlockLevel < 1 || warlockLevel > 20) {
    return { slotLevel: 0, numSlots: 0 };
  }

  const entry = PACT_MAGIC_SLOTS[warlockLevel - 1];
  return {
    slotLevel: entry.slotLevel,
    numSlots: entry.slots,
  };
}
