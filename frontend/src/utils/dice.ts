// =============================================================================
// Story 7.1 -- Core Dice Engine
// Pure-function dice engine using crypto.getRandomValues() for all rolling.
// Supports all D&D 5e dice types, notation parsing, advantage/disadvantage,
// ability score generation, attack/damage/check/initiative rolls, and more.
// =============================================================================

import type { DieType, Dice } from '@/types';
import type { HitDie } from '@/types';

// -- Internal helpers ---------------------------------------------------------

/** Map from DieType string to number of sides */
const DIE_SIDES: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d100: 100,
};

// -- Core random number generation --------------------------------------------

/**
 * Generates a cryptographically secure random integer in [min, max] (inclusive).
 * Uses rejection sampling to avoid modulo bias.
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param _randomSource - Optional injectable random source for testing
 * @returns A uniformly distributed random integer in [min, max]
 */
export function secureRandom(
  min: number,
  max: number,
  _randomSource?: () => number,
): number {
  if (min > max) {
    throw new RangeError(`min (${min}) must be <= max (${max})`);
  }
  if (min === max) return min;

  const range = max - min + 1;

  if (_randomSource) {
    // Dependency injection path for testing -- _randomSource returns [0, 1)
    return min + Math.floor(_randomSource() * range);
  }

  // Rejection sampling to avoid modulo bias.
  // 2^32 = 4294967296. Find the largest multiple of `range` that fits.
  const limit = Math.floor(4294967296 / range) * range;
  const buf = new Uint32Array(1);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) {
      return min + (buf[0] % range);
    }
    // Value falls in the biased tail -- reject and retry
  }
}

// -- Single die / multi-die ---------------------------------------------------

/**
 * Roll a single die of the given type.
 *
 * @param die - A DieType string (e.g. 'd20')
 * @param _randomSource - Optional random source for testing
 * @returns A value in [1, sides]
 */
export function rollDie(die: DieType, _randomSource?: () => number): number {
  const sides = DIE_SIDES[die];
  return secureRandom(1, sides, _randomSource);
}

/**
 * Roll multiple dice of the same type.
 *
 * @param count - Number of dice to roll
 * @param die   - A DieType string (e.g. 'd6')
 * @param _randomSource - Optional random source for testing
 * @returns Array of individual die results
 */
export function rollDice(
  count: number,
  die: DieType,
  _randomSource?: () => number,
): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(rollDie(die, _randomSource));
  }
  return results;
}

// -- Parsed dice notation -----------------------------------------------------

/**
 * Parsed representation of a dice notation string such as "2d6+3" or "4d6kh3".
 */
export interface ParsedDice {
  count: number;
  sides: number;
  keepHighest?: number;
  keepLowest?: number;
  modifier: number;
}

/**
 * Full result of evaluating a dice expression.
 */
export interface DiceRollResult {
  notation: string;
  parsed: ParsedDice;
  rolls: number[];
  kept: number[];
  dropped: number[];
  modifier: number;
  total: number;
}

/**
 * Parse a dice notation string.
 *
 * Supported forms:
 *   "1d20"      -> { count: 1, sides: 20, modifier: 0 }
 *   "2d6+3"     -> { count: 2, sides: 6,  modifier: 3 }
 *   "4d6kh3"    -> { count: 4, sides: 6,  keepHighest: 3, modifier: 0 }
 *   "4d6kl1"    -> { count: 4, sides: 6,  keepLowest: 1, modifier: 0 }
 *   "1d8-1"     -> { count: 1, sides: 8,  modifier: -1 }
 *
 * @param notation - The dice notation string
 * @returns A ParsedDice object
 * @throws Error if the notation cannot be parsed
 */
export function parseDiceNotation(notation: string): ParsedDice {
  const pattern = /^(\d+)?d(\d+)(?:(kh|kl)(\d+))?([+-]\d+)?$/;
  const match = notation.trim().toLowerCase().match(pattern);

  if (!match) {
    throw new Error(`Invalid dice notation: "${notation}"`);
  }

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  const keepType = match[3] as 'kh' | 'kl' | undefined;
  const keepCount = match[4] ? parseInt(match[4], 10) : undefined;
  const modifier = match[5] ? parseInt(match[5], 10) : 0;

  if (sides <= 0) {
    throw new Error(`Die must have at least 1 side, got ${sides}`);
  }
  if (count <= 0) {
    throw new Error(`Must roll at least 1 die, got ${count}`);
  }
  if (keepCount !== undefined && keepCount > count) {
    throw new Error(
      `Cannot keep ${keepCount} dice when only rolling ${count}`,
    );
  }

  const result: ParsedDice = { count, sides, modifier };
  if (keepType === 'kh' && keepCount !== undefined) {
    result.keepHighest = keepCount;
  } else if (keepType === 'kl' && keepCount !== undefined) {
    result.keepLowest = keepCount;
  }

  return result;
}

/**
 * Execute a dice expression from a notation string and return the full result.
 *
 * @param notation - A dice notation string (e.g. "2d6+3", "4d6kh3")
 * @param _randomSource - Optional random source for testing
 * @returns A DiceRollResult with all rolls, kept/dropped dice, and totals
 */
export function rollExpression(
  notation: string,
  _randomSource?: () => number,
): DiceRollResult {
  const parsed = parseDiceNotation(notation);
  const dieType = `d${parsed.sides}` as DieType;

  // Check if this is a valid DieType; if not, use raw secureRandom
  const isStandardDie = dieType in DIE_SIDES;

  const rolls: number[] = [];
  for (let i = 0; i < parsed.count; i++) {
    if (isStandardDie) {
      rolls.push(rollDie(dieType, _randomSource));
    } else {
      rolls.push(secureRandom(1, parsed.sides, _randomSource));
    }
  }

  let kept: number[];
  let dropped: number[];

  if (parsed.keepHighest !== undefined) {
    const sorted = [...rolls].sort((a, b) => b - a);
    kept = sorted.slice(0, parsed.keepHighest);
    dropped = sorted.slice(parsed.keepHighest);
  } else if (parsed.keepLowest !== undefined) {
    const sorted = [...rolls].sort((a, b) => a - b);
    kept = sorted.slice(0, parsed.keepLowest);
    dropped = sorted.slice(parsed.keepLowest);
  } else {
    kept = [...rolls];
    dropped = [];
  }

  const total = kept.reduce((sum, v) => sum + v, 0) + parsed.modifier;

  return {
    notation,
    parsed,
    rolls,
    kept,
    dropped,
    modifier: parsed.modifier,
    total,
  };
}

// -- Drop-lowest helper (used directly by ability score generation) -----------

/**
 * Roll count dice of the given sides, drop the lowest dropCount, and return
 * full details including kept, dropped, and total.
 *
 * @param count      - Number of dice to roll
 * @param sides      - Number of sides on each die
 * @param dropCount  - Number of lowest dice to drop
 * @param _randomSource - Optional random source for testing
 */
export function rollWithDropLowest(
  count: number,
  sides: number,
  dropCount: number,
  _randomSource?: () => number,
): { rolls: number[]; dropped: number[]; kept: number[]; total: number } {
  const dieType = `d${sides}` as DieType;
  const isStandard = dieType in DIE_SIDES;

  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(
      isStandard
        ? rollDie(dieType, _randomSource)
        : secureRandom(1, sides, _randomSource),
    );
  }

  const sorted = [...rolls].sort((a, b) => a - b);
  const dropped = sorted.slice(0, dropCount);
  const kept = sorted.slice(dropCount);
  const total = kept.reduce((sum, v) => sum + v, 0);

  return { rolls, dropped, kept, total };
}

// -- Ability score generation -------------------------------------------------

/**
 * Roll a single ability score using the 4d6-drop-lowest method.
 *
 * @param _randomSource - Optional random source for testing
 * @returns The four individual rolls, which die was dropped, and the total
 */
export function rollAbilityScore(_randomSource?: () => number): {
  rolls: number[];
  dropped: number;
  total: number;
} {
  const result = rollWithDropLowest(4, 6, 1, _randomSource);
  return {
    rolls: result.rolls,
    dropped: result.dropped[0],
    total: result.total,
  };
}

/**
 * Roll a full set of 6 ability scores using 4d6-drop-lowest.
 *
 * @param _randomSource - Optional random source for testing
 * @returns Array of 6 ability score results
 */
export function rollAbilityScores(
  _randomSource?: () => number,
): Array<{ rolls: number[]; dropped: number; total: number }> {
  const scores = [];
  for (let i = 0; i < 6; i++) {
    scores.push(rollAbilityScore(_randomSource));
  }
  return scores;
}

// -- Advantage / Disadvantage -------------------------------------------------

/**
 * Roll with advantage: roll 2d20, take the higher result.
 *
 * @param _randomSource - Optional random source for testing
 * @returns Both rolls and the higher result
 */
export function rollWithAdvantage(_randomSource?: () => number): {
  rolls: [number, number];
  result: number;
} {
  const roll1 = rollDie('d20', _randomSource);
  const roll2 = rollDie('d20', _randomSource);
  return {
    rolls: [roll1, roll2],
    result: Math.max(roll1, roll2),
  };
}

/**
 * Roll with disadvantage: roll 2d20, take the lower result.
 *
 * @param _randomSource - Optional random source for testing
 * @returns Both rolls and the lower result
 */
export function rollWithDisadvantage(_randomSource?: () => number): {
  rolls: [number, number];
  result: number;
} {
  const roll1 = rollDie('d20', _randomSource);
  const roll2 = rollDie('d20', _randomSource);
  return {
    rolls: [roll1, roll2],
    result: Math.min(roll1, roll2),
  };
}

// -- Check / Attack / Damage / Initiative ------------------------------------

/**
 * Roll a skill or ability check (d20 + modifier), optionally with
 * advantage or disadvantage.
 *
 * @param modifier     - The ability/skill modifier to add
 * @param advantage    - Whether to roll with advantage
 * @param disadvantage - Whether to roll with disadvantage
 * @param _randomSource - Optional random source for testing
 */
export function rollCheck(
  modifier: number,
  advantage?: boolean,
  disadvantage?: boolean,
  _randomSource?: () => number,
): {
  roll: number;
  modifier: number;
  total: number;
  naturalRoll: number;
  isCritical: boolean;
  isCriticalFail: boolean;
} {
  let naturalRoll: number;

  // Advantage and disadvantage cancel out per 5e rules
  if (advantage && disadvantage) {
    naturalRoll = rollDie('d20', _randomSource);
  } else if (advantage) {
    naturalRoll = rollWithAdvantage(_randomSource).result;
  } else if (disadvantage) {
    naturalRoll = rollWithDisadvantage(_randomSource).result;
  } else {
    naturalRoll = rollDie('d20', _randomSource);
  }

  return {
    roll: naturalRoll,
    modifier,
    total: naturalRoll + modifier,
    naturalRoll,
    isCritical: naturalRoll === 20,
    isCriticalFail: naturalRoll === 1,
  };
}

/**
 * Roll an attack (d20 + attack bonus), optionally with advantage/disadvantage.
 *
 * @param attackBonus  - The attack bonus modifier
 * @param advantage    - Whether to roll with advantage
 * @param disadvantage - Whether to roll with disadvantage
 * @param _randomSource - Optional random source for testing
 */
export function rollAttack(
  attackBonus: number,
  advantage?: boolean,
  disadvantage?: boolean,
  _randomSource?: () => number,
): {
  roll: number;
  attackBonus: number;
  total: number;
  isCritical: boolean;
  isCriticalFail: boolean;
} {
  const check = rollCheck(attackBonus, advantage, disadvantage, _randomSource);
  return {
    roll: check.naturalRoll,
    attackBonus,
    total: check.total,
    isCritical: check.isCritical,
    isCriticalFail: check.isCriticalFail,
  };
}

/**
 * Roll damage for one or more dice groups plus an optional flat bonus.
 *
 * @param dice  - Array of Dice objects (each with count and die type)
 * @param bonus - Optional flat damage bonus
 * @param _randomSource - Optional random source for testing
 */
export function rollDamage(
  dice: Dice[],
  bonus?: number,
  _randomSource?: () => number,
): {
  rolls: Array<{ die: DieType; results: number[] }>;
  bonus: number;
  total: number;
} {
  const resolvedBonus = bonus ?? 0;
  const rollResults: Array<{ die: DieType; results: number[] }> = [];
  let total = resolvedBonus;

  for (const d of dice) {
    const results = rollDice(d.count, d.die, _randomSource);
    rollResults.push({ die: d.die, results });
    total += results.reduce((sum, v) => sum + v, 0);
  }

  return {
    rolls: rollResults,
    bonus: resolvedBonus,
    total,
  };
}

/**
 * Roll initiative (d20 + DEX modifier + optional bonus).
 *
 * @param dexModifier - The character's DEX modifier
 * @param bonus       - Any additional initiative bonus
 * @param _randomSource - Optional random source for testing
 */
export function rollInitiative(
  dexModifier: number,
  bonus?: number,
  _randomSource?: () => number,
): {
  roll: number;
  modifier: number;
  total: number;
} {
  const totalModifier = dexModifier + (bonus ?? 0);
  const roll = rollDie('d20', _randomSource);
  return {
    roll,
    modifier: totalModifier,
    total: roll + totalModifier,
  };
}

// -- Hit points on level up ---------------------------------------------------

/**
 * Roll hit points gained on level up.
 *
 * @param hitDie       - The class hit die value (4, 6, 8, 10, or 12)
 * @param conModifier  - The character's CON modifier
 * @param _randomSource - Optional random source for testing
 * @returns Hit points gained (minimum 1)
 */
export function rollHitPoints(
  hitDie: HitDie,
  conModifier: number,
  _randomSource?: () => number,
): number {
  const dieType = `d${hitDie}` as DieType;
  const roll = rollDie(dieType, _randomSource);
  return Math.max(1, roll + conModifier);
}

// -- Starting gold ------------------------------------------------------------

/**
 * Parse and roll a starting gold formula (e.g. "5d4x10", "5d4").
 *
 * @param diceFormula - A string like "5d4x10" or "2d4"
 * @param _randomSource - Optional random source for testing
 * @returns The computed gold amount
 */
export function rollStartingGold(
  diceFormula: string,
  _randomSource?: () => number,
): number {
  const pattern = /^(\d+)d(\d+)(?:x(\d+))?$/i;
  const match = diceFormula.trim().match(pattern);

  if (!match) {
    throw new Error(`Invalid starting gold formula: "${diceFormula}"`);
  }

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const multiplier = match[3] ? parseInt(match[3], 10) : 1;

  const dieType = `d${sides}` as DieType;
  const isStandard = dieType in DIE_SIDES;

  let sum = 0;
  for (let i = 0; i < count; i++) {
    sum += isStandard
      ? rollDie(dieType, _randomSource)
      : secureRandom(1, sides, _randomSource);
  }

  return sum * multiplier;
}
