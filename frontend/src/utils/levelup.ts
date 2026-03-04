/**
 * Level Up Flow Utility Functions (Epic 31)
 *
 * High-level orchestration functions for the level-up wizard.
 * Uses the existing calculations/levelup.ts for core math, and adds
 * step-generation, prerequisite checking, and state application logic.
 */

import type { Character } from '@/types/character';
import type { ClassFeature } from '@/types/class';
import type { AbilityName } from '@/types/core';
import type { FeatSelection } from '@/types/background';
import { getClassById } from '@/data/classes';
import { PACT_MAGIC_SLOTS } from '@/data/reference';
import {
  getLevelUpGains,
  getXPForLevel,
  getLevelForXP,
  getAverageHPRoll,
} from '@/utils/calculations/levelup';
import { getAbilityModifier } from '@/data/reference';

// ---------------------------------------------------------------------------
// LevelUpChanges — the master change description for one level advance
// ---------------------------------------------------------------------------

export interface LevelUpChanges {
  /** The target character level after leveling up */
  newLevel: number;
  /** HP increase for this level (set during the HP step) */
  hpIncrease: number;
  /** New class features gained at this level */
  newFeatures: { id: string; name: string; description: string; hasChoices: boolean }[];
  /** Whether this level triggers subclass selection */
  isSubclassLevel: boolean;
  /** Whether this level grants an ASI/feat choice */
  isASILevel: boolean;
  /** Proficiency bonus change, if any */
  proficiencyBonusChange?: { from: number; to: number };
  /** New spell slots gained (spell level -> count) */
  newSpellSlots?: Record<number, number>;
  /** Number of new cantrips to learn */
  newCantripsKnown?: number;
  /** Number of new spells to learn/prepare */
  newSpellsKnown?: number;
  /** Pact magic changes (warlock) */
  pactMagicChanges?: { slotLevel: number; totalSlots: number };
  /** The hit die type for this class */
  hitDieType: number;
  /** The average HP roll (used when taking average) */
  averageHP: number;
  /** The class ID being leveled */
  classId: string;
  /** The new class level (within this class) */
  newClassLevel: number;
  /** Selected subclass ID (set during subclass step) */
  selectedSubclassId?: string;
  /** ASI choices (set during ASI step) */
  asiChoices?: { ability: AbilityName; amount: number }[];
  /** Selected feat (set during feat step) */
  selectedFeat?: FeatSelection;
  /** Whether the character chose ASI mode vs feat mode */
  asiMode?: 'asi' | 'feat';
  /** New spells selected (set during spell step) */
  selectedSpells?: string[];
  /** Spell to swap out (for known-casters) */
  swappedSpell?: { oldSpellId: string; newSpellId: string };
}

// ---------------------------------------------------------------------------
// Step identifiers
// ---------------------------------------------------------------------------

export type LevelUpStepId =
  | 'overview'
  | 'hp'
  | 'features'
  | 'subclass'
  | 'asi-feat'
  | 'spells'
  | 'review';

// ---------------------------------------------------------------------------
// Feature choice detection
// ---------------------------------------------------------------------------

/** IDs of features that involve player choices */
const CHOICE_FEATURE_IDS = new Set([
  'fighting-style-fighter',
  'fighting-style-paladin',
  'fighting-style-ranger',
  'metamagic',
  'expertise-bard',
  'expertise-rogue',
  'eldritch-invocations',
  'pact-boon',
  'favored-enemy',
  'natural-explorer',
  'primal-path',
  'bard-college',
  'divine-domain',
  'druid-circle',
  'martial-archetype',
  'monastic-tradition',
  'sacred-oath',
  'ranger-archetype',
  'roguish-archetype',
  'sorcerous-origin',
  'otherworldly-patron',
  'arcane-tradition',
]);

function featureHasChoices(feature: ClassFeature): boolean {
  return CHOICE_FEATURE_IDS.has(feature.id);
}

// ---------------------------------------------------------------------------
// Subclass level lookup
// ---------------------------------------------------------------------------

/** Classes that choose subclass at L1 (already chosen during creation) */
const L1_SUBCLASS_CLASSES = new Set(['cleric', 'sorcerer', 'warlock']);

/**
 * Get the level at which a class chooses its subclass.
 */
export function getSubclassLevel(classId: string): number {
  const classData = getClassById(classId);
  if (!classData) return 3; // default fallback
  return classData.subclassLevel;
}

// ---------------------------------------------------------------------------
// ASI level lookup
// ---------------------------------------------------------------------------

/**
 * Get all ASI levels for a given class.
 */
export function getASILevels(classId: string): number[] {
  const classData = getClassById(classId);
  if (!classData) return [4, 8, 12, 16, 19];
  return [...classData.asiLevels];
}

// ---------------------------------------------------------------------------
// canLevelUp
// ---------------------------------------------------------------------------

/**
 * Determine if a character is eligible to level up.
 * In XP mode: XP must be enough for next level.
 * In milestone mode: always true if under level 20.
 * Character must be below level 20.
 */
export function canLevelUp(character: Character): boolean {
  if (character.level >= 20) return false;
  const nextLevel = character.level + 1;
  const xpNeeded = getXPForLevel(nextLevel);
  // Allow level up if XP is sufficient or if character has no XP tracking (milestone)
  return character.experiencePoints >= xpNeeded || character.experiencePoints === 0;
}

// ---------------------------------------------------------------------------
// getLevelUpChanges
// ---------------------------------------------------------------------------

/**
 * Compute the full set of changes for leveling a character up by one level.
 */
export function getLevelUpChanges(
  character: Character,
  targetLevel: number,
): LevelUpChanges {
  // For single-class: the primary class is classes[0]
  const primaryClass = character.classes[0];
  if (!primaryClass) {
    throw new Error('Character has no class selection');
  }

  const classId = primaryClass.classId;
  const newClassLevel = primaryClass.level + (targetLevel - character.level);

  // Use the existing calculation engine
  const gains = getLevelUpGains(character, classId, newClassLevel);

  // Map features to our format
  const newFeatures = gains.newFeatures.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    hasChoices: featureHasChoices(f),
  }));

  // Build pact magic changes for warlocks
  let pactMagicChanges: LevelUpChanges['pactMagicChanges'];
  const classData = getClassById(classId);
  if (classData?.spellcasting?.type === 'pact' && newClassLevel <= 20) {
    const pactEntry = PACT_MAGIC_SLOTS[newClassLevel - 1];
    if (pactEntry) {
      pactMagicChanges = {
        slotLevel: pactEntry.slotLevel,
        totalSlots: pactEntry.slots,
      };
    }
  }

  // Determine if this is actually a subclass level
  // Skip subclass step for L1 subclass classes if they already chose at creation
  let isSubclassLevel = gains.isSubclassLevel;
  if (isSubclassLevel && L1_SUBCLASS_CLASSES.has(classId) && primaryClass.subclassId) {
    isSubclassLevel = false;
  }

  return {
    newLevel: targetLevel,
    hpIncrease: 0, // Set during HP step
    newFeatures,
    isSubclassLevel,
    isASILevel: gains.isASILevel,
    proficiencyBonusChange: gains.proficiencyBonusChange,
    newSpellSlots: gains.newSpellSlots,
    newCantripsKnown: gains.newCantripsKnown,
    newSpellsKnown: gains.newSpellsPrepared,
    pactMagicChanges,
    hitDieType: gains.hitDieType,
    averageHP: gains.averageHP,
    classId,
    newClassLevel,
  };
}

// ---------------------------------------------------------------------------
// getRequiredSteps
// ---------------------------------------------------------------------------

/**
 * Determine which steps are needed for a given level-up based on the
 * character's class and the target level.
 */
export function getRequiredSteps(
  character: Character,
  targetLevel: number,
): LevelUpStepId[] {
  const changes = getLevelUpChanges(character, targetLevel);
  const steps: LevelUpStepId[] = ['overview', 'hp'];

  // Features step: always shown if there are features
  if (changes.newFeatures.length > 0 || changes.proficiencyBonusChange) {
    steps.push('features');
  }

  // Subclass step: only at subclass level
  if (changes.isSubclassLevel) {
    steps.push('subclass');
  }

  // ASI/Feat step: only at ASI levels
  if (changes.isASILevel) {
    steps.push('asi-feat');
  }

  // Spell step: only for spellcasting classes with spell changes
  const classData = getClassById(changes.classId);
  if (
    classData?.spellcasting &&
    (changes.newSpellSlots ||
      changes.newCantripsKnown ||
      changes.newSpellsKnown ||
      changes.pactMagicChanges)
  ) {
    steps.push('spells');
  }

  steps.push('review');
  return steps;
}

// ---------------------------------------------------------------------------
// applyLevelUp
// ---------------------------------------------------------------------------

/**
 * Apply level-up changes to a character, producing a new character object.
 * This is a pure function that does not mutate the input.
 */
export function applyLevelUp(
  character: Character,
  changes: LevelUpChanges,
): Character {
  const updated = structuredClone(character);

  // Update level
  updated.level = changes.newLevel;

  // Update class level
  if (updated.classes[0]) {
    updated.classes[0].level = changes.newClassLevel;
  }

  // Update HP
  updated.hpMax += changes.hpIncrease;
  updated.hpCurrent += changes.hpIncrease;

  // Update hit dice
  if (updated.hitDiceTotal.length > 0) {
    updated.hitDiceTotal[0] = changes.newClassLevel;
  } else {
    updated.hitDiceTotal = [changes.newClassLevel];
    updated.hitDiceUsed = [0];
  }

  // Add HP roll to class selection
  if (updated.classes[0] && changes.hpIncrease > 0) {
    const conMod = getAbilityModifier(updated.abilityScores.constitution);
    const rawRoll = changes.hpIncrease - conMod;
    updated.classes[0].hpRolls.push(Math.max(1, rawRoll));
  }

  // Add new features
  for (const feature of changes.newFeatures) {
    if (!updated.features.includes(feature.id)) {
      updated.features.push(feature.id);
    }
  }

  // Apply subclass selection
  if (changes.selectedSubclassId && updated.classes[0]) {
    updated.classes[0].subclassId = changes.selectedSubclassId;
  }

  // Apply ASI choices
  if (changes.asiMode === 'asi' && changes.asiChoices) {
    for (const choice of changes.asiChoices) {
      const current = updated.abilityScores[choice.ability];
      updated.abilityScores[choice.ability] = Math.min(20, current + choice.amount);
      const baseCurrent = updated.baseAbilityScores[choice.ability];
      updated.baseAbilityScores[choice.ability] = Math.min(20, baseCurrent + choice.amount);
    }

    // If CON changed, retroactively adjust HP
    const conChoice = changes.asiChoices.find((c) => c.ability === 'constitution');
    if (conChoice) {
      // Each level gains additional HP from CON modifier increase
      const oldConMod = getAbilityModifier(
        updated.abilityScores.constitution - conChoice.amount,
      );
      const newConMod = getAbilityModifier(updated.abilityScores.constitution);
      const conModDiff = newConMod - oldConMod;
      if (conModDiff > 0) {
        // Retroactive HP adjustment for all levels
        const retroactiveHP = conModDiff * changes.newLevel;
        updated.hpMax += retroactiveHP;
        updated.hpCurrent += retroactiveHP;
      }
    }
  }

  // Apply feat selection
  if (changes.asiMode === 'feat' && changes.selectedFeat) {
    updated.feats.push(changes.selectedFeat);
  }

  // Update XP if using XP mode
  if (changes.newLevel <= 20) {
    const minXP = getXPForLevel(changes.newLevel);
    if (updated.experiencePoints < minXP) {
      updated.experiencePoints = minXP;
    }
  }

  // Update version
  updated.version += 1;
  updated.updatedAt = new Date().toISOString();

  return updated;
}

// ---------------------------------------------------------------------------
// Helper: compute XP info
// ---------------------------------------------------------------------------

export interface XPInfo {
  currentXP: number;
  currentLevel: number;
  nextLevelXP: number;
  xpToNextLevel: number;
  progress: number; // 0-1
}

export function getXPInfo(character: Character): XPInfo {
  const currentXP = character.experiencePoints;
  const currentLevel = character.level;
  const nextLevel = Math.min(currentLevel + 1, 20);
  const nextLevelXP = getXPForLevel(nextLevel);
  const currentLevelXP = getXPForLevel(currentLevel);
  const xpToNextLevel = nextLevelXP - currentXP;
  const levelRange = nextLevelXP - currentLevelXP;
  const progress = levelRange > 0 ? Math.min(1, (currentXP - currentLevelXP) / levelRange) : 1;

  return { currentXP, currentLevel, nextLevelXP, xpToNextLevel, progress };
}

// Re-export calculation helpers that components may need
export { getAverageHPRoll, getLevelForXP, getXPForLevel };
