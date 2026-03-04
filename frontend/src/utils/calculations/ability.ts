// =============================================================================
// Story 4.1 -- Ability Score Calculations
// Pure functions for computing modifiers, applying racial bonuses, validating
// ability score generation methods, and assembling total ability scores.
// =============================================================================

import type {
  AbilityScores,
  Character,
  Race,
  RaceSelection,
} from '@/types';

import {
  ABILITY_NAMES,
} from '@/types';

import {
  POINT_BUY_COSTS,
  POINT_BUY_BUDGET,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
  STANDARD_ARRAY,
  PROFICIENCY_BONUS_BY_LEVEL,
} from '@/data/reference';

import { races } from '@/data/races';
import { getFeatById } from '@/data/feats';

// ---------------------------------------------------------------------------
// Ability Modifier
// ---------------------------------------------------------------------------

/**
 * Get the ability modifier for a given ability score.
 *
 * Formula: Math.floor((score - 10) / 2)
 *
 * Examples: 1 -> -5, 8 -> -1, 10 -> 0, 14 -> +2, 20 -> +5, 30 -> +10
 *
 * @param score - Ability score (typically 1-30)
 * @returns The ability modifier
 */
export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// ---------------------------------------------------------------------------
// Racial Bonuses
// ---------------------------------------------------------------------------

/**
 * Apply racial ability score bonuses to base ability scores.
 *
 * Handles:
 * - Fixed racial bonuses (e.g., Dwarf +2 CON)
 * - Subrace bonuses (e.g., Hill Dwarf +1 WIS)
 * - Chosen ability bonuses (e.g., Half-Elf +1 to two chosen abilities)
 *
 * @param baseScores - The character's base ability scores
 * @param race       - The player's race selection (IDs and choices)
 * @param raceData   - The full Race data object for the selected race
 * @returns A new AbilityScores object with racial bonuses applied
 */
export function applyRacialBonuses(
  baseScores: AbilityScores,
  race: RaceSelection,
  raceData: Race,
): AbilityScores {
  const result: AbilityScores = { ...baseScores };

  // Apply fixed racial ability score increases
  for (const ability of ABILITY_NAMES) {
    const bonus = raceData.abilityScoreIncrease[ability];
    if (bonus !== undefined) {
      result[ability] += bonus;
    }
  }

  // Apply subrace ability score increases
  if (race.subraceId) {
    const subrace = raceData.subraces.find((s) => s.id === race.subraceId);
    if (subrace) {
      for (const ability of ABILITY_NAMES) {
        const bonus = subrace.abilityScoreIncrease[ability];
        if (bonus !== undefined) {
          result[ability] += bonus;
        }
      }
    }
  }

  // Apply player-chosen ability bonuses (e.g., Half-Elf +1 to two of choice)
  if (race.chosenAbilityBonuses) {
    for (const { abilityName, bonus } of race.chosenAbilityBonuses) {
      result[abilityName] += bonus;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Point Buy Validation
// ---------------------------------------------------------------------------

/**
 * Calculate the total point buy cost for a set of ability scores.
 *
 * Cost table: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9.
 * Scores outside 8-15 are invalid and will cause this function to return -1.
 *
 * @param scores - Ability scores to calculate cost for
 * @returns The total point buy cost, or -1 if any score is out of range
 */
export function calculatePointBuyCost(scores: AbilityScores): number {
  let total = 0;
  for (const ability of ABILITY_NAMES) {
    const score = scores[ability];
    if (score < POINT_BUY_MIN || score > POINT_BUY_MAX) {
      return -1;
    }
    total += POINT_BUY_COSTS[score];
  }
  return total;
}

/**
 * Get the point buy cost for a single ability score value.
 *
 * @param score - An ability score value (8-15)
 * @returns The cost in points
 * @throws RangeError if the score is outside the 8-15 range
 */
export function getPointBuyCost(score: number): number {
  if (score < POINT_BUY_MIN || score > POINT_BUY_MAX) {
    throw new RangeError(
      `Point buy score must be between ${POINT_BUY_MIN} and ${POINT_BUY_MAX}, got ${score}`,
    );
  }
  return POINT_BUY_COSTS[score];
}

/**
 * Validate a point buy ability score allocation.
 *
 * Rules:
 * - Each score must be between 8 and 15 (inclusive)
 * - Total cost must not exceed 27 points
 *
 * @param scores - The ability scores to validate
 * @returns An object with the validation result, points used, and points remaining
 */
export function validatePointBuy(scores: AbilityScores): {
  valid: boolean;
  pointsUsed: number;
  pointsRemaining: number;
} {
  const pointsUsed = calculatePointBuyCost(scores);

  // If any score was out of range, calculatePointBuyCost returns -1
  if (pointsUsed === -1) {
    return { valid: false, pointsUsed: 0, pointsRemaining: POINT_BUY_BUDGET };
  }

  return {
    valid: pointsUsed <= POINT_BUY_BUDGET,
    pointsUsed,
    pointsRemaining: POINT_BUY_BUDGET - pointsUsed,
  };
}

// ---------------------------------------------------------------------------
// Standard Array Validation
// ---------------------------------------------------------------------------

/**
 * Validate that a set of ability scores uses the standard array.
 *
 * The standard array is [15, 14, 13, 12, 10, 8]. Each value must be used
 * exactly once across the six ability scores.
 *
 * @param scores - The ability scores to validate
 * @returns true if the scores are a valid permutation of the standard array
 */
export function validateStandardArray(scores: AbilityScores): boolean {
  const values = ABILITY_NAMES.map((a) => scores[a]).sort((a, b) => a - b);
  const expected = [...STANDARD_ARRAY].sort((a, b) => a - b);

  if (values.length !== expected.length) {
    return false;
  }

  for (let i = 0; i < values.length; i++) {
    if (values[i] !== expected[i]) {
      return false;
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Total Ability Scores
// ---------------------------------------------------------------------------

/**
 * Calculate the total ability scores by summing base scores with all bonus
 * sources. Each ability is independently capped (default 20).
 *
 * @param base          - Base ability scores
 * @param racialBonuses - Racial ability score increases (partial)
 * @param asiIncreases  - Ability Score Improvement increases from level-ups (partial)
 * @param featBonuses   - Ability score bonuses from feats (partial)
 * @param maxScore      - Maximum allowed score (default 20, e.g. 24 for Barbarian capstone)
 * @returns The capped total ability scores
 */
export function getTotalAbilityScores(
  base: AbilityScores,
  racialBonuses: Partial<AbilityScores>,
  asiIncreases: Partial<AbilityScores>,
  featBonuses: Partial<AbilityScores>,
  maxScore: number = 20,
): AbilityScores {
  const result = {} as AbilityScores;

  for (const ability of ABILITY_NAMES) {
    const total =
      base[ability] +
      (racialBonuses[ability] ?? 0) +
      (asiIncreases[ability] ?? 0) +
      (featBonuses[ability] ?? 0);

    result[ability] = Math.min(total, maxScore);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Saving Throw Bonus
// ---------------------------------------------------------------------------

/**
 * Calculate the saving throw bonus for an ability.
 *
 * @param abilityScore - The character's ability score for the save
 * @param proficient   - Whether the character is proficient in this saving throw
 * @param level        - The character's level (for proficiency bonus lookup)
 * @returns The total saving throw bonus
 */
export function getSavingThrowBonus(
  abilityScore: number,
  proficient: boolean,
  level: number,
): number {
  const modifier = getModifier(abilityScore);
  if (!proficient) {
    return modifier;
  }
  const proficiencyBonus = PROFICIENCY_BONUS_BY_LEVEL[level - 1];
  return modifier + proficiencyBonus;
}

// ---------------------------------------------------------------------------
// Single Ability Score Total
// ---------------------------------------------------------------------------

/**
 * Calculate the total for a single ability score by summing all bonus sources,
 * capped at maxScore (default 20).
 *
 * @param base        - Base score before any bonuses
 * @param racialBonus - Racial ability score increase (0 if none)
 * @param asiBonus    - Ability Score Improvement increase (0 if none)
 * @param featBonus   - Feat ability score increase (0 if none)
 * @param miscBonus   - Miscellaneous bonuses from items/effects (0 if none)
 * @param maxScore    - Maximum allowed score (default 20)
 * @returns The capped total ability score
 */
export function getTotalAbilityScore(
  base: number,
  racialBonus: number,
  asiBonus: number,
  featBonus: number,
  miscBonus: number,
  maxScore: number = 20,
): number {
  const total = base + racialBonus + asiBonus + featBonus + miscBonus;
  return Math.min(total, maxScore);
}

// ---------------------------------------------------------------------------
// Validate Standard Array (number[] overload)
// ---------------------------------------------------------------------------

/**
 * Validate that an array of six numbers is a valid permutation of the
 * standard array [15, 14, 13, 12, 10, 8].
 *
 * @param assignments - Array of exactly 6 numbers to validate
 * @returns true if the assignments are a valid permutation of the standard array
 */
export function validateStandardArrayAssignments(assignments: number[]): boolean {
  if (assignments.length !== 6) {
    return false;
  }

  const sorted = [...assignments].sort((a, b) => a - b);
  const expected = [...STANDARD_ARRAY].sort((a, b) => a - b);

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== expected[i]) {
      return false;
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Effective Ability Scores (Character-level)
// ---------------------------------------------------------------------------

/**
 * Compute the effective (final) ability scores for a character by applying
 * all bonus sources to the base scores:
 *
 * 1. Racial ability score increases (from race + subrace + chosen bonuses)
 * 2. Feat ability score increases (from selected feats)
 *
 * Note: ASI increases from level-ups are not explicitly stored on the
 * Character interface; they are assumed to be already incorporated into
 * baseAbilityScores or passed separately via getTotalAbilityScores.
 *
 * Each ability is independently capped at 20 (standard D&D 5e cap).
 *
 * @param character - The full character object
 * @returns The computed AbilityScores with all bonuses applied
 */
export function getEffectiveAbilityScores(character: Character): AbilityScores {
  const base = character.baseAbilityScores;

  // 1. Gather racial bonuses
  const racialBonuses: Partial<AbilityScores> = {};
  const raceData = races.find((r) => r.id === character.race.raceId);

  if (raceData) {
    // Fixed racial ability score increases
    for (const ability of ABILITY_NAMES) {
      const bonus = raceData.abilityScoreIncrease[ability];
      if (bonus !== undefined) {
        racialBonuses[ability] = (racialBonuses[ability] ?? 0) + bonus;
      }
    }

    // Subrace ability score increases
    if (character.race.subraceId) {
      const subrace = raceData.subraces.find(
        (s) => s.id === character.race.subraceId,
      );
      if (subrace) {
        for (const ability of ABILITY_NAMES) {
          const bonus = subrace.abilityScoreIncrease[ability];
          if (bonus !== undefined) {
            racialBonuses[ability] = (racialBonuses[ability] ?? 0) + bonus;
          }
        }
      }
    }
  }

  // Player-chosen ability bonuses (e.g., Half-Elf, Variant Human)
  if (character.race.chosenAbilityBonuses) {
    for (const { abilityName, bonus } of character.race.chosenAbilityBonuses) {
      racialBonuses[abilityName] = (racialBonuses[abilityName] ?? 0) + bonus;
    }
  }

  // 2. Gather feat bonuses
  const featBonuses: Partial<AbilityScores> = {};
  for (const featSelection of character.feats) {
    const feat = getFeatById(featSelection.featId);
    if (feat?.abilityScoreIncrease) {
      // If the feat has a chosenAbility (player picks which ability gets the bonus),
      // use that. Otherwise apply the fixed bonus from the feat definition.
      if (featSelection.chosenAbility) {
        // Sum all values from abilityScoreIncrease and apply to the chosen ability
        const totalBonus = Object.values(feat.abilityScoreIncrease).reduce(
          (sum, val) => sum + (val ?? 0),
          0,
        );
        featBonuses[featSelection.chosenAbility] =
          (featBonuses[featSelection.chosenAbility] ?? 0) + totalBonus;
      } else {
        // Apply fixed ability score increases from the feat
        for (const ability of ABILITY_NAMES) {
          const bonus = feat.abilityScoreIncrease[ability];
          if (bonus !== undefined) {
            featBonuses[ability] = (featBonuses[ability] ?? 0) + bonus;
          }
        }
      }
    }
  }

  // 3. Combine: base + racial + feat, capped at 20
  return getTotalAbilityScores(base, racialBonuses, {}, featBonuses, 20);
}

// ---------------------------------------------------------------------------
// Get Racial Bonuses (convenience extractor)
// ---------------------------------------------------------------------------

/**
 * Extract the total racial ability score bonuses for a character, including
 * base race, subrace, and player-chosen bonuses.
 *
 * @param character - The character to extract racial bonuses for
 * @returns A partial AbilityScores record with the bonuses
 */
export function getRacialBonuses(character: Character): Partial<AbilityScores> {
  const bonuses: Partial<AbilityScores> = {};
  const raceData = races.find((r) => r.id === character.race.raceId);

  if (raceData) {
    for (const ability of ABILITY_NAMES) {
      const bonus = raceData.abilityScoreIncrease[ability];
      if (bonus !== undefined) {
        bonuses[ability] = (bonuses[ability] ?? 0) + bonus;
      }
    }

    if (character.race.subraceId) {
      const subrace = raceData.subraces.find(
        (s) => s.id === character.race.subraceId,
      );
      if (subrace) {
        for (const ability of ABILITY_NAMES) {
          const bonus = subrace.abilityScoreIncrease[ability];
          if (bonus !== undefined) {
            bonuses[ability] = (bonuses[ability] ?? 0) + bonus;
          }
        }
      }
    }
  }

  if (character.race.chosenAbilityBonuses) {
    for (const { abilityName, bonus } of character.race.chosenAbilityBonuses) {
      bonuses[abilityName] = (bonuses[abilityName] ?? 0) + bonus;
    }
  }

  return bonuses;
}

// ---------------------------------------------------------------------------
// Get Feat Bonuses (convenience extractor)
// ---------------------------------------------------------------------------

/**
 * Extract the total feat ability score bonuses for a character.
 *
 * @param character - The character to extract feat bonuses for
 * @returns A partial AbilityScores record with the bonuses
 */
export function getFeatBonuses(character: Character): Partial<AbilityScores> {
  const bonuses: Partial<AbilityScores> = {};

  for (const featSelection of character.feats) {
    const feat = getFeatById(featSelection.featId);
    if (feat?.abilityScoreIncrease) {
      if (featSelection.chosenAbility) {
        const totalBonus = Object.values(feat.abilityScoreIncrease).reduce(
          (sum, val) => sum + (val ?? 0),
          0,
        );
        bonuses[featSelection.chosenAbility] =
          (bonuses[featSelection.chosenAbility] ?? 0) + totalBonus;
      } else {
        for (const ability of ABILITY_NAMES) {
          const bonus = feat.abilityScoreIncrease[ability];
          if (bonus !== undefined) {
            bonuses[ability] = (bonuses[ability] ?? 0) + bonus;
          }
        }
      }
    }
  }

  return bonuses;
}
