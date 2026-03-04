/**
 * Level Up Calculation Functions (Story 4.5)
 *
 * Pure functions for computing level-up gains including HP, features,
 * spell slots, proficiency bonus changes, and XP thresholds.
 */

import type { Character } from '@/types/character';
import type { ClassFeature } from '@/types/class';
import { getClassById } from '@/data/classes';
import {
  XP_THRESHOLDS,
  getLevelForXP as refGetLevelForXP,
  getProficiencyBonus,
  FULL_CASTER_SPELL_SLOTS,
  HALF_CASTER_SPELL_SLOTS,
  THIRD_CASTER_SPELL_SLOTS,
  PACT_MAGIC_SLOTS,
} from '@/data/reference';

// ---------------------------------------------------------------------------
// LevelUpResult interface
// ---------------------------------------------------------------------------

export interface LevelUpResult {
  /** The hit die type for this class (e.g. 10 for Fighter) */
  hitDieType: number;
  /** Average HP gained: floor(die/2) + 1 */
  averageHP: number;
  /** Features unlocked at this class level */
  newFeatures: ClassFeature[];
  /** Whether this level grants a subclass choice */
  isSubclassLevel: boolean;
  /** Whether this level is an Ability Score Improvement level */
  isASILevel: boolean;
  /** New spell slots gained at this level (spell level -> count) */
  newSpellSlots?: Record<number, number>;
  /** New cantrips known at this level */
  newCantripsKnown?: number;
  /** New spells prepared/known at this level */
  newSpellsPrepared?: number;
  /** Proficiency bonus change if it increases at this level */
  proficiencyBonusChange?: { from: number; to: number };
}

// ---------------------------------------------------------------------------
// XP / Level helpers
// ---------------------------------------------------------------------------

/**
 * Get the XP required to reach a specific level.
 * @param level Character level (1-20)
 * @returns Cumulative XP threshold for that level
 */
export function getXPForLevel(level: number): number {
  if (level < 1 || level > 20) {
    throw new RangeError(`Level must be between 1 and 20, got ${level}`);
  }
  return XP_THRESHOLDS[level - 1];
}

/**
 * Get the character level for a given XP total (highest qualifying level).
 * @param xp Total experience points
 * @returns Character level (1-20)
 */
export function getLevelForXP(xp: number): number {
  return refGetLevelForXP(xp);
}

/**
 * Get the average HP roll for a given hit die.
 * Average = floor(die/2) + 1
 * @param hitDie Number of sides on the hit die (e.g. 6, 8, 10, 12)
 * @returns Average HP gained per level
 */
export function getAverageHPRoll(hitDie: number): number {
  return Math.floor(hitDie / 2) + 1;
}

// ---------------------------------------------------------------------------
// Spell slot diff helpers
// ---------------------------------------------------------------------------

/**
 * Get the spell slot table for a given spellcasting type.
 * Returns null for non-casters and pact magic (handled separately).
 */
function getSpellSlotTable(
  spellcastingType: string,
): readonly (readonly number[])[] | null {
  switch (spellcastingType) {
    case 'full':
      return FULL_CASTER_SPELL_SLOTS;
    case 'half':
      return HALF_CASTER_SPELL_SLOTS;
    case 'third':
      return THIRD_CASTER_SPELL_SLOTS;
    default:
      return null;
  }
}

/**
 * Compute the diff in spell slots between two class levels.
 * Returns a record of spell level -> additional slots gained, or undefined if none.
 */
function computeSpellSlotDiff(
  spellcastingType: string,
  oldClassLevel: number,
  newClassLevel: number,
): Record<number, number> | undefined {
  if (spellcastingType === 'pact') {
    // Pact magic: check if slots or slot level changed
    const oldPact = PACT_MAGIC_SLOTS[oldClassLevel - 1];
    const newPact = PACT_MAGIC_SLOTS[newClassLevel - 1];
    if (!oldPact || !newPact) return undefined;

    const diff: Record<number, number> = {};
    if (newPact.slots > oldPact.slots) {
      diff[newPact.slotLevel] = newPact.slots - oldPact.slots;
    }
    if (newPact.slotLevel > oldPact.slotLevel) {
      // The slot level itself increased
      diff[newPact.slotLevel] = (diff[newPact.slotLevel] ?? 0) + newPact.slots;
      diff[oldPact.slotLevel] = -(oldPact.slots);
    }

    return Object.keys(diff).length > 0 ? diff : undefined;
  }

  const table = getSpellSlotTable(spellcastingType);
  if (!table) return undefined;

  const oldSlots = oldClassLevel >= 1 ? table[oldClassLevel - 1] : undefined;
  const newSlots = table[newClassLevel - 1];

  if (!newSlots) return undefined;

  const diff: Record<number, number> = {};
  for (let i = 0; i < newSlots.length; i++) {
    const spellLevel = i + 1;
    const oldCount = oldSlots ? oldSlots[i] : 0;
    const newCount = newSlots[i];
    if (newCount > oldCount) {
      diff[spellLevel] = newCount - oldCount;
    }
  }

  return Object.keys(diff).length > 0 ? diff : undefined;
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

/**
 * Calculate all gains from leveling up a specific class.
 *
 * @param character The current character state
 * @param classId The class being leveled up
 * @param newClassLevel The new level in that class (e.g. going from 4 to 5 means newClassLevel=5)
 * @returns A LevelUpResult describing everything gained
 * @throws Error if the classId is not found
 */
export function getLevelUpGains(
  character: Character,
  classId: string,
  newClassLevel: number,
): LevelUpResult {
  const classData = getClassById(classId);
  if (!classData) {
    throw new Error(`Class not found: ${classId}`);
  }

  const oldClassLevel = newClassLevel - 1;
  const oldTotalLevel = character.level;
  const newTotalLevel = oldTotalLevel + 1;

  // Hit die and average HP
  const hitDieType = classData.hitDie;
  const averageHP = getAverageHPRoll(hitDieType);

  // Features at this class level
  const newFeatures: ClassFeature[] = classData.features[newClassLevel]
    ? [...classData.features[newClassLevel]]
    : [];

  // Subclass level check
  const isSubclassLevel = classData.subclassLevel === newClassLevel;

  // ASI level check
  const isASILevel = classData.asiLevels.includes(newClassLevel);

  // Build result
  const result: LevelUpResult = {
    hitDieType,
    averageHP,
    newFeatures,
    isSubclassLevel,
    isASILevel,
  };

  // Spell slots
  if (classData.spellcasting) {
    const spellSlotDiff = computeSpellSlotDiff(
      classData.spellcasting.type,
      oldClassLevel,
      newClassLevel,
    );
    if (spellSlotDiff) {
      result.newSpellSlots = spellSlotDiff;
    }

    // Cantrips known
    const cantrips = classData.spellcasting.cantripsKnown;
    if (cantrips && cantrips.length >= newClassLevel) {
      const oldCantrips = oldClassLevel >= 1 ? (cantrips[oldClassLevel - 1] ?? 0) : 0;
      const newCantrips = cantrips[newClassLevel - 1];
      if (newCantrips > oldCantrips) {
        result.newCantripsKnown = newCantrips - oldCantrips;
      }
    }

    // Spells known / prepared changes
    if (classData.spellcasting.spellsKnownByLevel) {
      const spellsByLevel = classData.spellcasting.spellsKnownByLevel;
      const oldSpells = oldClassLevel >= 1 ? (spellsByLevel[oldClassLevel - 1] ?? 0) : 0;
      const newSpells = spellsByLevel[newClassLevel - 1] ?? 0;
      if (newSpells > oldSpells) {
        result.newSpellsPrepared = newSpells - oldSpells;
      }
    }
  }

  // Proficiency bonus change
  const oldProfBonus = oldTotalLevel >= 1 ? getProficiencyBonus(Math.min(oldTotalLevel, 20)) : 1;
  const newProfBonus = getProficiencyBonus(Math.min(newTotalLevel, 20));
  if (newProfBonus > oldProfBonus) {
    result.proficiencyBonusChange = { from: oldProfBonus, to: newProfBonus };
  }

  return result;
}
