// =============================================================================
// Story 4.1 -- Ability Score Calculations
// Pure functions for computing modifiers, applying racial bonuses, validating
// ability score generation methods, and assembling total ability scores.
// =============================================================================

import type {
  AbilityScores,
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
