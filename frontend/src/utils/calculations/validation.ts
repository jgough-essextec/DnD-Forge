/**
 * Character Validation Functions (Story 4.8)
 *
 * Pure functions for validating a character against D&D 5e rules.
 * Returns an array of validation entries (errors and warnings) rather
 * than throwing exceptions, so consumers can display all issues at once.
 */

import type { Character, CharacterValidationEntry } from '@/types/character';
import { ABILITY_NAMES } from '@/types/core';
import { getClassById } from '@/data/classes';
import { getBackgroundById } from '@/data/backgrounds';
import {
  POINT_BUY_COSTS,
  POINT_BUY_BUDGET,
  STANDARD_ARRAY,
  CARRY_CAPACITY_MULTIPLIER,
} from '@/data/reference';
import { getTotalInventoryWeight } from './currency';

// ---------------------------------------------------------------------------
// Main validation function
// ---------------------------------------------------------------------------

/**
 * Validate a character against D&D 5e rules.
 *
 * Returns an array of validation entries. Each entry has:
 * - field: the field or area that has an issue
 * - severity: 'error' (must fix) or 'warning' (informational)
 * - message: human-readable description of the issue
 *
 * @param character The character to validate
 * @returns Array of validation issues (empty array = valid)
 */
export function validateCharacter(
  character: Character,
): CharacterValidationEntry[] {
  const entries: CharacterValidationEntry[] = [];

  validateRequiredFields(character, entries);
  validateAbilityScoreRange(character, entries);
  validateAbilityScoreMethod(character, entries);
  validateSkillCount(character, entries);
  validateSpellCount(character, entries);
  validateEquipmentWeight(character, entries);
  validateAttunement(character, entries);
  validateMulticlassPrerequisites(character, entries);

  return entries;
}

// ---------------------------------------------------------------------------
// Individual validation checks
// ---------------------------------------------------------------------------

/**
 * Check that required fields are present and non-empty.
 */
function validateRequiredFields(
  character: Character,
  entries: CharacterValidationEntry[],
): void {
  if (!character.name || character.name.trim() === '') {
    entries.push({
      field: 'name',
      severity: 'error',
      message: 'Character name is required.',
    });
  }

  if (!character.race || !character.race.raceId) {
    entries.push({
      field: 'race',
      severity: 'error',
      message: 'Race selection is required.',
    });
  }

  if (!character.classes || character.classes.length === 0) {
    entries.push({
      field: 'classes',
      severity: 'error',
      message: 'At least one class selection is required.',
    });
  }

  // Validate ability scores are present
  if (!character.baseAbilityScores) {
    entries.push({
      field: 'baseAbilityScores',
      severity: 'error',
      message: 'Base ability scores are required.',
    });
  } else {
    for (const ability of ABILITY_NAMES) {
      const value = character.baseAbilityScores[ability];
      if (value === undefined || value === null) {
        entries.push({
          field: `baseAbilityScores.${ability}`,
          severity: 'error',
          message: `Base ${ability} score is required.`,
        });
      }
    }
  }
}

/**
 * Validate that all ability scores are within the legal range (1-30).
 */
function validateAbilityScoreRange(
  character: Character,
  entries: CharacterValidationEntry[],
): void {
  if (!character.abilityScores) return;

  for (const ability of ABILITY_NAMES) {
    const value = character.abilityScores[ability];
    if (value !== undefined && value !== null && (value < 1 || value > 30)) {
      entries.push({
        field: `abilityScores.${ability}`,
        severity: 'error',
        message: `${capitalize(ability)} score must be between 1 and 30, got ${value}.`,
      });
    }
  }
}

/**
 * Validate ability scores against the chosen generation method.
 *
 * For point buy: total cost must equal 27.
 * For standard array: values must be a permutation of [15, 14, 13, 12, 10, 8].
 */
function validateAbilityScoreMethod(
  character: Character,
  entries: CharacterValidationEntry[],
): void {
  if (!character.baseAbilityScores || !character.abilityScoreMethod) return;

  if (character.abilityScoreMethod === 'pointBuy') {
    let totalCost = 0;
    let allInRange = true;

    for (const ability of ABILITY_NAMES) {
      const value = character.baseAbilityScores[ability];
      const cost = POINT_BUY_COSTS[value];
      if (cost === undefined) {
        allInRange = false;
        entries.push({
          field: `baseAbilityScores.${ability}`,
          severity: 'error',
          message: `${capitalize(ability)} score ${value} is not valid for point buy (must be 8-15).`,
        });
      } else {
        totalCost += cost;
      }
    }

    if (allInRange) {
      if (totalCost > POINT_BUY_BUDGET) {
        entries.push({
          field: 'abilityScoreMethod',
          severity: 'error',
          message: `Point buy cost (${totalCost}) exceeds budget of ${POINT_BUY_BUDGET}.`,
        });
      } else if (totalCost < POINT_BUY_BUDGET) {
        entries.push({
          field: 'abilityScoreMethod',
          severity: 'warning',
          message: `Point buy cost (${totalCost}) is below budget of ${POINT_BUY_BUDGET}. You have ${POINT_BUY_BUDGET - totalCost} points remaining.`,
        });
      }
    }
  }

  if (character.abilityScoreMethod === 'standard') {
    const values = ABILITY_NAMES.map(
      (a) => character.baseAbilityScores[a],
    ).sort((a, b) => b - a);
    const expected = [...STANDARD_ARRAY].sort((a, b) => b - a);

    const isMatch =
      values.length === expected.length &&
      values.every((v, i) => v === expected[i]);

    if (!isMatch) {
      entries.push({
        field: 'abilityScoreMethod',
        severity: 'error',
        message: `Standard array values must be a permutation of [${STANDARD_ARRAY.join(', ')}].`,
      });
    }
  }
}

/**
 * Validate that the number of proficient skills matches the class + background allowance.
 */
function validateSkillCount(
  character: Character,
  entries: CharacterValidationEntry[],
): void {
  if (!character.proficiencies?.skills) return;
  if (!character.classes || character.classes.length === 0) return;

  const proficientSkillCount = character.proficiencies.skills.filter(
    (s) => s.proficient,
  ).length;

  // Calculate expected skill count from class and background
  let expectedSkillCount = 0;

  // Primary class skill choices (only the first class for multiclass)
  const primaryClassData = getClassById(character.classes[0].classId);
  if (primaryClassData) {
    expectedSkillCount += primaryClassData.proficiencies.skillChoices.choose;
  }

  // Background skill proficiencies
  if (character.background?.backgroundId) {
    const bgData = getBackgroundById(character.background.backgroundId);
    if (bgData) {
      expectedSkillCount += bgData.skillProficiencies.length;
    }
  }

  if (proficientSkillCount > expectedSkillCount) {
    entries.push({
      field: 'proficiencies.skills',
      severity: 'error',
      message: `Character has ${proficientSkillCount} skill proficiencies but is allowed ${expectedSkillCount} (class + background).`,
    });
  }
}

/**
 * Validate that known/prepared spells do not exceed limits.
 */
function validateSpellCount(
  character: Character,
  entries: CharacterValidationEntry[],
): void {
  if (!character.spellcasting) return;
  if (!character.classes || character.classes.length === 0) return;

  // For each class with spellcasting, check spell limits
  for (const classSel of character.classes) {
    const classData = getClassById(classSel.classId);
    if (!classData?.spellcasting) continue;

    const sc = classData.spellcasting;

    // Check cantrips
    if (sc.cantripsKnown && classSel.level <= sc.cantripsKnown.length) {
      const maxCantrips = sc.cantripsKnown[classSel.level - 1];
      const currentCantrips = character.spellcasting.cantrips.length;
      if (currentCantrips > maxCantrips) {
        entries.push({
          field: 'spellcasting.cantrips',
          severity: 'error',
          message: `${classData.name} can know at most ${maxCantrips} cantrips at level ${classSel.level}, but has ${currentCantrips}.`,
        });
      }
    }

    // Check known spells (for known-casters like Bard, Sorcerer, Warlock, Ranger)
    if (sc.spellsKnownOrPrepared === 'known' && sc.spellsKnownByLevel) {
      const maxSpells = sc.spellsKnownByLevel[classSel.level - 1] ?? 0;
      const currentSpells = character.spellcasting.knownSpells.length;
      if (currentSpells > maxSpells) {
        entries.push({
          field: 'spellcasting.knownSpells',
          severity: 'error',
          message: `${classData.name} can know at most ${maxSpells} spells at level ${classSel.level}, but has ${currentSpells}.`,
        });
      }
    }
  }
}

/**
 * Warn if equipment weight exceeds carrying capacity (STR x 15).
 */
function validateEquipmentWeight(
  character: Character,
  entries: CharacterValidationEntry[],
): void {
  if (!character.inventory || !character.abilityScores) return;

  const totalWeight = getTotalInventoryWeight(character.inventory);
  const carryCapacity =
    character.abilityScores.strength * CARRY_CAPACITY_MULTIPLIER;

  if (totalWeight > carryCapacity) {
    entries.push({
      field: 'inventory',
      severity: 'warning',
      message: `Equipment weight (${totalWeight} lbs) exceeds carrying capacity (${carryCapacity} lbs).`,
    });
  }
}

/**
 * Validate that the character has at most 3 attuned items.
 */
function validateAttunement(
  character: Character,
  entries: CharacterValidationEntry[],
): void {
  if (!character.attunedItems) return;

  if (character.attunedItems.length > 3) {
    entries.push({
      field: 'attunedItems',
      severity: 'error',
      message: `Character has ${character.attunedItems.length} attuned items but the maximum is 3.`,
    });
  }
}

/**
 * Validate multiclass prerequisites.
 *
 * Each class in a multiclass build has minimum ability score requirements.
 * For multiclassing, you must meet the prerequisites of BOTH the class you
 * are leaving AND the class you are entering.
 */
function validateMulticlassPrerequisites(
  character: Character,
  entries: CharacterValidationEntry[],
): void {
  if (!character.classes || character.classes.length <= 1) return;
  if (!character.abilityScores) return;

  for (const classSel of character.classes) {
    const classData = getClassById(classSel.classId);
    if (!classData?.multiclassRequirements) continue;

    for (const req of classData.multiclassRequirements) {
      const score = character.abilityScores[req.ability];
      if (score < req.minimum) {
        entries.push({
          field: `multiclass.${classSel.classId}`,
          severity: 'error',
          message: `Multiclassing as ${classData.name} requires ${capitalize(req.ability)} ${req.minimum}, but character has ${score}.`,
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
