// =============================================================================
// Story 7.1 -- Core Dice Engine Tests
// Comprehensive unit tests for every dice engine function.
// =============================================================================

import { describe, it, expect, vi } from 'vitest';
import {
  secureRandom,
  rollDie,
  rollDice,
  parseDiceNotation,
  rollExpression,
  rollWithDropLowest,
  rollAbilityScore,
  rollAbilityScores,
  rollWithAdvantage,
  rollWithDisadvantage,
  rollCheck,
  rollAttack,
  rollDamage,
  rollInitiative,
  rollHitPoints,
  rollStartingGold,
} from '../dice';
import type { DieType, Dice } from '@/types';

// -- Helpers ------------------------------------------------------------------

/** Create a deterministic random source that returns values in sequence. */
function createSequence(values: number[]): () => number {
  let idx = 0;
  return () => {
    const val = values[idx % values.length];
    idx++;
    return val;
  };
}

/**
 * Convert a desired die result (1-based) to the [0,1) value the
 * _randomSource needs to return so that `Math.floor(value * sides) + 1`
 * equals the desired result.
 *
 * For secureRandom(min, max, source):
 *   result = min + Math.floor(source() * range)
 *   where range = max - min + 1
 *
 * To get result R from range [min, max]:
 *   R = min + Math.floor(source() * range)
 *   source() needs to be in [(R - min) / range, (R - min + 1) / range)
 *   We pick the midpoint: (R - min + 0.5) / range
 */
function dieValueToSource(desiredResult: number, sides: number): number {
  return (desiredResult - 1 + 0.5) / sides;
}

/** Create a random source that yields specific die results for a given number of sides. */
function createDieSequence(
  results: number[],
  sides: number,
): () => number {
  return createSequence(results.map((r) => dieValueToSource(r, sides)));
}

// =============================================================================
// secureRandom
// =============================================================================

describe('secureRandom', () => {
  it('should return min when min equals max', () => {
    expect(secureRandom(5, 5)).toBe(5);
  });

  it('should throw when min > max', () => {
    expect(() => secureRandom(10, 5)).toThrow(RangeError);
  });

  it('should return values in [min, max] over many calls', () => {
    for (let i = 0; i < 200; i++) {
      const val = secureRandom(1, 6);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(6);
    }
  });

  it('should use crypto.getRandomValues (not Math.random)', () => {
    const spy = vi.spyOn(crypto, 'getRandomValues');
    secureRandom(1, 20);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should accept an injectable random source for testing', () => {
    // Source returns 0.5, so for range [1,20], result = 1 + floor(0.5 * 20) = 11
    const result = secureRandom(1, 20, () => 0.5);
    expect(result).toBe(11);
  });
});

// =============================================================================
// rollDie
// =============================================================================

describe('rollDie', () => {
  const dieTypes: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
  const maxSides: Record<DieType, number> = {
    d4: 4,
    d6: 6,
    d8: 8,
    d10: 10,
    d12: 12,
    d20: 20,
    d100: 100,
  };

  it.each(dieTypes)(
    'should produce values in [1, sides] for %s',
    (die) => {
      for (let i = 0; i < 100; i++) {
        const result = rollDie(die);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(maxSides[die]);
      }
    },
  );

  it('should use crypto.getRandomValues, not Math.random', () => {
    const cryptoSpy = vi.spyOn(crypto, 'getRandomValues');
    const mathSpy = vi.spyOn(Math, 'random');

    rollDie('d20');

    expect(cryptoSpy).toHaveBeenCalled();
    expect(mathSpy).not.toHaveBeenCalled();

    cryptoSpy.mockRestore();
    mathSpy.mockRestore();
  });

  it('should return deterministic results with injected random source', () => {
    // Source returning 0.0 => result = 1 + floor(0 * 20) = 1
    expect(rollDie('d20', () => 0.0)).toBe(1);
    // Source returning 0.95 => result = 1 + floor(0.95 * 20) = 1 + 19 = 20
    expect(rollDie('d20', () => 0.95)).toBe(20);
  });
});

// =============================================================================
// rollDice
// =============================================================================

describe('rollDice', () => {
  it('should return array of correct length with valid values', () => {
    const results = rollDice(5, 'd8');
    expect(results).toHaveLength(5);
    results.forEach((r) => {
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(8);
    });
  });

  it('should return deterministic results with injected random source', () => {
    const source = createDieSequence([3, 5, 2], 6);
    const results = rollDice(3, 'd6', source);
    expect(results).toEqual([3, 5, 2]);
  });

  it('should return empty array for count 0', () => {
    expect(rollDice(0, 'd6')).toEqual([]);
  });
});

// =============================================================================
// parseDiceNotation
// =============================================================================

describe('parseDiceNotation', () => {
  it('should parse "1d20"', () => {
    const parsed = parseDiceNotation('1d20');
    expect(parsed).toEqual({ count: 1, sides: 20, modifier: 0 });
  });

  it('should parse "d20" (implied count of 1)', () => {
    const parsed = parseDiceNotation('d20');
    expect(parsed).toEqual({ count: 1, sides: 20, modifier: 0 });
  });

  it('should parse "2d6+3"', () => {
    const parsed = parseDiceNotation('2d6+3');
    expect(parsed).toEqual({ count: 2, sides: 6, modifier: 3 });
  });

  it('should parse "1d8-1"', () => {
    const parsed = parseDiceNotation('1d8-1');
    expect(parsed).toEqual({ count: 1, sides: 8, modifier: -1 });
  });

  it('should parse "4d6kh3"', () => {
    const parsed = parseDiceNotation('4d6kh3');
    expect(parsed).toEqual({
      count: 4,
      sides: 6,
      keepHighest: 3,
      modifier: 0,
    });
  });

  it('should parse "4d6kl1"', () => {
    const parsed = parseDiceNotation('4d6kl1');
    expect(parsed).toEqual({
      count: 4,
      sides: 6,
      keepLowest: 1,
      modifier: 0,
    });
  });

  it('should parse "3d8"', () => {
    const parsed = parseDiceNotation('3d8');
    expect(parsed).toEqual({ count: 3, sides: 8, modifier: 0 });
  });

  it('should parse "1d20+5"', () => {
    const parsed = parseDiceNotation('1d20+5');
    expect(parsed).toEqual({ count: 1, sides: 20, modifier: 5 });
  });

  it('should be case insensitive', () => {
    const parsed = parseDiceNotation('2D6+3');
    expect(parsed).toEqual({ count: 2, sides: 6, modifier: 3 });
  });

  it('should throw for invalid notation', () => {
    expect(() => parseDiceNotation('abc')).toThrow('Invalid dice notation');
    expect(() => parseDiceNotation('')).toThrow('Invalid dice notation');
    expect(() => parseDiceNotation('d')).toThrow('Invalid dice notation');
  });

  it('should throw when keepCount exceeds dice count', () => {
    expect(() => parseDiceNotation('2d6kh3')).toThrow(
      'Cannot keep 3 dice when only rolling 2',
    );
  });
});

// =============================================================================
// rollExpression
// =============================================================================

describe('rollExpression', () => {
  it('should roll "2d6+3" and produce valid total', () => {
    const source = createDieSequence([4, 5], 6);
    const result = rollExpression('2d6+3', source);

    expect(result.notation).toBe('2d6+3');
    expect(result.rolls).toEqual([4, 5]);
    expect(result.kept).toEqual([4, 5]);
    expect(result.dropped).toEqual([]);
    expect(result.modifier).toBe(3);
    expect(result.total).toBe(4 + 5 + 3);
  });

  it('should handle "4d6kh3" (keep highest 3)', () => {
    const source = createDieSequence([3, 5, 2, 6], 6);
    const result = rollExpression('4d6kh3', source);

    expect(result.rolls).toEqual([3, 5, 2, 6]);
    expect(result.kept.sort((a, b) => a - b)).toEqual([3, 5, 6]);
    expect(result.dropped).toEqual([2]);
    expect(result.total).toBe(3 + 5 + 6);
  });

  it('should handle "4d6kl1" (keep lowest 1)', () => {
    const source = createDieSequence([3, 5, 2, 6], 6);
    const result = rollExpression('4d6kl1', source);

    expect(result.rolls).toEqual([3, 5, 2, 6]);
    expect(result.kept).toEqual([2]);
    expect(result.dropped.sort((a, b) => a - b)).toEqual([3, 5, 6]);
    expect(result.total).toBe(2);
  });

  it('should handle "1d20-1"', () => {
    const source = createDieSequence([15], 20);
    const result = rollExpression('1d20-1', source);
    expect(result.total).toBe(14);
  });

  it('should handle "1d20+5"', () => {
    const source = createDieSequence([10], 20);
    const result = rollExpression('1d20+5', source);
    expect(result.total).toBe(15);
  });
});

// =============================================================================
// rollWithDropLowest
// =============================================================================

describe('rollWithDropLowest', () => {
  it('should drop the lowest die and sum remaining', () => {
    const source = createDieSequence([4, 2, 6, 3], 6);
    const result = rollWithDropLowest(4, 6, 1, source);

    expect(result.rolls).toEqual([4, 2, 6, 3]);
    expect(result.dropped).toEqual([2]);
    expect(result.kept.sort((a, b) => a - b)).toEqual([3, 4, 6]);
    expect(result.total).toBe(3 + 4 + 6);
  });

  it('should drop multiple lowest dice when dropCount > 1', () => {
    const source = createDieSequence([1, 5, 2, 6], 6);
    const result = rollWithDropLowest(4, 6, 2, source);

    expect(result.dropped).toEqual([1, 2]);
    expect(result.kept.sort((a, b) => a - b)).toEqual([5, 6]);
    expect(result.total).toBe(5 + 6);
  });

  it('should always drop the minimum value(s)', () => {
    for (let i = 0; i < 50; i++) {
      const result = rollWithDropLowest(4, 6, 1);
      const minRoll = Math.min(...result.rolls);
      // The dropped array should contain the minimum
      expect(result.dropped[0]).toBe(minRoll);
      // Total should equal the sum of kept
      expect(result.total).toBe(result.kept.reduce((s, v) => s + v, 0));
    }
  });
});

// =============================================================================
// rollAbilityScore
// =============================================================================

describe('rollAbilityScore', () => {
  it('should return 4 rolls, 1 dropped die, and a total of the 3 kept', () => {
    const source = createDieSequence([4, 2, 6, 3], 6);
    const result = rollAbilityScore(source);

    expect(result.rolls).toHaveLength(4);
    expect(result.dropped).toBe(2);
    expect(result.total).toBe(4 + 6 + 3);
  });

  it('should produce totals in range [3, 18]', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollAbilityScore();
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.total).toBeLessThanOrEqual(18);
    }
  });

  it('should produce total = sum of rolls minus dropped', () => {
    for (let i = 0; i < 50; i++) {
      const result = rollAbilityScore();
      const allSum = result.rolls.reduce((s, v) => s + v, 0);
      expect(result.total).toBe(allSum - result.dropped);
    }
  });
});

// =============================================================================
// rollAbilityScores
// =============================================================================

describe('rollAbilityScores', () => {
  it('should produce 6 ability scores from 4d6-drop-lowest', () => {
    const scores = rollAbilityScores();
    expect(scores).toHaveLength(6);
    scores.forEach((s) => {
      expect(s.rolls).toHaveLength(4);
      expect(s.total).toBeGreaterThanOrEqual(3);
      expect(s.total).toBeLessThanOrEqual(18);
    });
  });

  it('should produce deterministic results with injected random source', () => {
    // 6 scores * 4 dice each = 24 rolls needed
    const dieResults = [
      4, 3, 5, 2, // score 1: drop 2, total 12
      6, 6, 6, 1, // score 2: drop 1, total 18
      3, 3, 3, 3, // score 3: drop 3, total 9
      5, 4, 4, 3, // score 4: drop 3, total 13
      2, 1, 1, 1, // score 5: drop 1, total 4
      6, 5, 4, 3, // score 6: drop 3, total 15
    ];
    const source = createDieSequence(dieResults, 6);
    const scores = rollAbilityScores(source);

    expect(scores[0].total).toBe(12);
    expect(scores[1].total).toBe(18);
    expect(scores[2].total).toBe(9);
    expect(scores[3].total).toBe(13);
    expect(scores[4].total).toBe(4);
    expect(scores[5].total).toBe(15);
  });
});

// =============================================================================
// rollWithAdvantage
// =============================================================================

describe('rollWithAdvantage', () => {
  it('should return both d20 rolls and the higher one as result', () => {
    const source = createDieSequence([8, 15], 20);
    const result = rollWithAdvantage(source);

    expect(result.rolls).toEqual([8, 15]);
    expect(result.result).toBe(15);
  });

  it('should handle tied rolls', () => {
    const source = createDieSequence([12, 12], 20);
    const result = rollWithAdvantage(source);

    expect(result.result).toBe(12);
  });

  it('should always return the higher or equal die over many runs', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollWithAdvantage();
      expect(result.result).toBe(Math.max(result.rolls[0], result.rolls[1]));
    }
  });
});

// =============================================================================
// rollWithDisadvantage
// =============================================================================

describe('rollWithDisadvantage', () => {
  it('should return both d20 rolls and the lower one as result', () => {
    const source = createDieSequence([8, 15], 20);
    const result = rollWithDisadvantage(source);

    expect(result.rolls).toEqual([8, 15]);
    expect(result.result).toBe(8);
  });

  it('should handle tied rolls', () => {
    const source = createDieSequence([12, 12], 20);
    const result = rollWithDisadvantage(source);

    expect(result.result).toBe(12);
  });

  it('should always return the lower or equal die over many runs', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollWithDisadvantage();
      expect(result.result).toBe(Math.min(result.rolls[0], result.rolls[1]));
    }
  });
});

// =============================================================================
// rollCheck
// =============================================================================

describe('rollCheck', () => {
  it('should roll d20 + modifier and return full details', () => {
    const source = createDieSequence([14], 20);
    const result = rollCheck(5, false, false, source);

    expect(result.naturalRoll).toBe(14);
    expect(result.modifier).toBe(5);
    expect(result.total).toBe(19);
    expect(result.isCritical).toBe(false);
    expect(result.isCriticalFail).toBe(false);
  });

  it('should detect natural 20 as critical', () => {
    const source = createDieSequence([20], 20);
    const result = rollCheck(0, false, false, source);

    expect(result.isCritical).toBe(true);
    expect(result.isCriticalFail).toBe(false);
  });

  it('should detect natural 1 as critical fail', () => {
    const source = createDieSequence([1], 20);
    const result = rollCheck(0, false, false, source);

    expect(result.isCritical).toBe(false);
    expect(result.isCriticalFail).toBe(true);
  });

  it('should use advantage when specified', () => {
    // Rolls: 8, 15 -> advantage picks 15
    const source = createDieSequence([8, 15], 20);
    const result = rollCheck(3, true, false, source);

    expect(result.naturalRoll).toBe(15);
    expect(result.total).toBe(18);
  });

  it('should use disadvantage when specified', () => {
    // Rolls: 8, 15 -> disadvantage picks 8
    const source = createDieSequence([8, 15], 20);
    const result = rollCheck(3, false, true, source);

    expect(result.naturalRoll).toBe(8);
    expect(result.total).toBe(11);
  });

  it('should cancel advantage and disadvantage (roll normally)', () => {
    const source = createDieSequence([12], 20);
    const result = rollCheck(2, true, true, source);

    // Only one roll consumed when both cancel
    expect(result.naturalRoll).toBe(12);
    expect(result.total).toBe(14);
  });

  it('should work with 0 modifier', () => {
    const source = createDieSequence([17], 20);
    const result = rollCheck(0, false, false, source);

    expect(result.total).toBe(17);
  });

  it('should work with negative modifier', () => {
    const source = createDieSequence([10], 20);
    const result = rollCheck(-3, false, false, source);

    expect(result.total).toBe(7);
  });
});

// =============================================================================
// rollAttack
// =============================================================================

describe('rollAttack', () => {
  it('should roll d20 + attack bonus', () => {
    const source = createDieSequence([14], 20);
    const result = rollAttack(7, false, false, source);

    expect(result.roll).toBe(14);
    expect(result.attackBonus).toBe(7);
    expect(result.total).toBe(21);
    expect(result.isCritical).toBe(false);
    expect(result.isCriticalFail).toBe(false);
  });

  it('should detect critical hit (nat 20)', () => {
    const source = createDieSequence([20], 20);
    const result = rollAttack(5, false, false, source);

    expect(result.isCritical).toBe(true);
    expect(result.total).toBe(25);
  });

  it('should detect critical fail (nat 1)', () => {
    const source = createDieSequence([1], 20);
    const result = rollAttack(5, false, false, source);

    expect(result.isCriticalFail).toBe(true);
    expect(result.total).toBe(6);
  });

  it('should support advantage', () => {
    const source = createDieSequence([5, 18], 20);
    const result = rollAttack(3, true, false, source);

    expect(result.roll).toBe(18);
    expect(result.total).toBe(21);
  });

  it('should support disadvantage', () => {
    const source = createDieSequence([5, 18], 20);
    const result = rollAttack(3, false, true, source);

    expect(result.roll).toBe(5);
    expect(result.total).toBe(8);
  });
});

// =============================================================================
// rollDamage
// =============================================================================

describe('rollDamage', () => {
  it('should roll damage with a single dice group', () => {
    const dice: Dice[] = [{ count: 2, die: 'd6' }];
    const source = createDieSequence([4, 5], 6);
    const result = rollDamage(dice, 3, source);

    expect(result.rolls).toEqual([{ die: 'd6', results: [4, 5] }]);
    expect(result.bonus).toBe(3);
    expect(result.total).toBe(4 + 5 + 3);
  });

  it('should roll damage with multiple dice groups', () => {
    // 1d8 + 2d6, bonus 2
    // Need: 1 d8 result, then 2 d6 results
    // We'll use separate sources conceptually. Since they share a source,
    // the d8 call will consume first value, then d6 calls consume next two.
    // d8: value for result 6 => (6-1+0.5)/8 = 0.6875
    // d6: value for result 3 => (3-1+0.5)/6 = 0.4167
    // d6: value for result 4 => (4-1+0.5)/6 = 0.5833
    const source = createSequence([
      dieValueToSource(6, 8),
      dieValueToSource(3, 6),
      dieValueToSource(4, 6),
    ]);
    const dice: Dice[] = [
      { count: 1, die: 'd8' },
      { count: 2, die: 'd6' },
    ];
    const result = rollDamage(dice, 2, source);

    expect(result.rolls).toEqual([
      { die: 'd8', results: [6] },
      { die: 'd6', results: [3, 4] },
    ]);
    expect(result.bonus).toBe(2);
    expect(result.total).toBe(6 + 3 + 4 + 2);
  });

  it('should default bonus to 0 when not provided', () => {
    const dice: Dice[] = [{ count: 1, die: 'd8' }];
    const source = createDieSequence([5], 8);
    const result = rollDamage(dice, undefined, source);

    expect(result.bonus).toBe(0);
    expect(result.total).toBe(5);
  });
});

// =============================================================================
// rollInitiative
// =============================================================================

describe('rollInitiative', () => {
  it('should return d20 + modifier', () => {
    const source = createDieSequence([14], 20);
    const result = rollInitiative(3, 0, source);

    expect(result.roll).toBe(14);
    expect(result.modifier).toBe(3);
    expect(result.total).toBe(17);
  });

  it('should include bonus in modifier and total', () => {
    const source = createDieSequence([10], 20);
    const result = rollInitiative(2, 3, source);

    expect(result.modifier).toBe(5);
    expect(result.total).toBe(15);
  });

  it('should work with negative dex modifier', () => {
    const source = createDieSequence([12], 20);
    const result = rollInitiative(-1, 0, source);

    expect(result.total).toBe(11);
  });

  it('should default bonus to 0', () => {
    const source = createDieSequence([10], 20);
    const result = rollInitiative(2, undefined, source);

    expect(result.modifier).toBe(2);
    expect(result.total).toBe(12);
  });
});

// =============================================================================
// rollHitPoints
// =============================================================================

describe('rollHitPoints', () => {
  it('should return hit die roll + CON modifier', () => {
    const source = createDieSequence([5], 8);
    const result = rollHitPoints(8, 2, source);
    expect(result).toBe(7);
  });

  it('should enforce minimum 1 HP even with negative CON modifier', () => {
    // Roll 1 on d6, CON modifier -3 => 1 + (-3) = -2 => clamped to 1
    const source = createDieSequence([1], 6);
    const result = rollHitPoints(6, -3, source);
    expect(result).toBe(1);
  });

  it('should return minimum 1 even if roll + modifier = 0', () => {
    // Roll 2 on d8, CON modifier -2 => 0 => clamped to 1
    const source = createDieSequence([2], 8);
    const result = rollHitPoints(8, -2, source);
    expect(result).toBe(1);
  });

  it('should work with CON modifier of 0', () => {
    const source = createDieSequence([4], 10);
    const result = rollHitPoints(10, 0, source);
    expect(result).toBe(4);
  });

  it('should work with all valid hit die sizes', () => {
    const hitDice = [4, 6, 8, 10, 12] as const;
    hitDice.forEach((hd) => {
      for (let i = 0; i < 20; i++) {
        const result = rollHitPoints(hd, 0);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(hd);
      }
    });
  });
});

// =============================================================================
// rollStartingGold
// =============================================================================

describe('rollStartingGold', () => {
  it('should parse and roll "5d4x10" formula correctly', () => {
    // 5 rolls of d4, each returning 3 => sum=15, *10 = 150
    const source = createDieSequence([3, 3, 3, 3, 3], 4);
    const result = rollStartingGold('5d4x10', source);
    expect(result).toBe(150);
  });

  it('should parse and roll "5d4" (no multiplier) for Monk', () => {
    // 5 rolls of d4, each returning 2 => sum=10, multiplier=1 => 10
    const source = createDieSequence([2, 2, 2, 2, 2], 4);
    const result = rollStartingGold('5d4', source);
    expect(result).toBe(10);
  });

  it('should parse "2d4x10"', () => {
    const source = createDieSequence([3, 4], 4);
    const result = rollStartingGold('2d4x10', source);
    expect(result).toBe(70);
  });

  it('should throw for invalid formula', () => {
    expect(() => rollStartingGold('abc')).toThrow('Invalid starting gold formula');
    expect(() => rollStartingGold('')).toThrow('Invalid starting gold formula');
  });
});

// =============================================================================
// Distribution Tests (Statistical)
// =============================================================================

describe('Distribution tests', () => {
  it('should produce 10,000 d20 rolls averaging approximately 10.5 (+/-0.5)', () => {
    const rolls: number[] = [];
    for (let i = 0; i < 10000; i++) {
      rolls.push(rollDie('d20'));
    }

    const avg = rolls.reduce((s, v) => s + v, 0) / rolls.length;
    expect(avg).toBeGreaterThanOrEqual(10.0);
    expect(avg).toBeLessThanOrEqual(11.0);
  });

  it('should have each d20 face within +/-3% of expected 5% over 10,000 rolls', () => {
    const counts = new Array(20).fill(0) as number[];
    const total = 10000;

    for (let i = 0; i < total; i++) {
      const roll = rollDie('d20');
      counts[roll - 1]++;
    }

    const expectedPct = 5.0; // 1/20 = 5%
    const tolerance = 3.0; // +/- 3 percentage points

    counts.forEach((count, idx) => {
      const pct = (count / total) * 100;
      expect(pct).toBeGreaterThanOrEqual(
        expectedPct - tolerance,
      );
      expect(pct).toBeLessThanOrEqual(
        expectedPct + tolerance,
      );
      // Suppress unused variable warning
      void idx;
    });
  });

  it('should never produce values outside valid range across 10,000 rolls for all die types', () => {
    const dieTypes: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
    const maxSides: Record<DieType, number> = {
      d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20, d100: 100,
    };

    dieTypes.forEach((die) => {
      for (let i = 0; i < 10000; i++) {
        const val = rollDie(die);
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(maxSides[die]);
      }
    });
  });

  it('should produce 10,000 ability score rolls averaging approximately 12.2 (+/-0.5)', () => {
    const scores: number[] = [];
    for (let i = 0; i < 10000; i++) {
      scores.push(rollAbilityScore().total);
    }

    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    // Expected average of 4d6-drop-lowest is ~12.24
    expect(avg).toBeGreaterThanOrEqual(11.7);
    expect(avg).toBeLessThanOrEqual(12.7);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('Edge cases', () => {
  it('d100 should produce values in [1, 100]', () => {
    for (let i = 0; i < 200; i++) {
      const val = rollDie('d100');
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(100);
    }
  });

  it('rollCheck with 0 modifier should return raw d20 as total', () => {
    const source = createDieSequence([13], 20);
    const result = rollCheck(0, false, false, source);
    expect(result.total).toBe(13);
  });

  it('rollCheck with negative modifier should subtract from roll', () => {
    const source = createDieSequence([10], 20);
    const result = rollCheck(-2, false, false, source);
    expect(result.total).toBe(8);
  });

  it('rollAttack with 0 bonus should return raw d20 as total', () => {
    const source = createDieSequence([7], 20);
    const result = rollAttack(0, false, false, source);
    expect(result.total).toBe(7);
  });

  it('rollDamage with empty dice array should return only bonus', () => {
    const result = rollDamage([], 5);
    expect(result.total).toBe(5);
    expect(result.rolls).toEqual([]);
  });

  it('rollDamage with zero bonus should sum only dice', () => {
    const source = createDieSequence([3, 4], 6);
    const result = rollDamage([{ count: 2, die: 'd6' }], 0, source);
    expect(result.total).toBe(7);
  });

  it('rollInitiative produces values in expected range', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollInitiative(0);
      expect(result.roll).toBeGreaterThanOrEqual(1);
      expect(result.roll).toBeLessThanOrEqual(20);
      expect(result.total).toBe(result.roll);
    }
  });

  it('rollExpression should handle non-standard die sizes via secureRandom fallback', () => {
    // d3 is not a standard DieType, so rollExpression falls back to secureRandom
    const source = createSequence([
      (2 - 1 + 0.5) / 3, // result 2 from a d3
      (1 - 1 + 0.5) / 3, // result 1 from a d3
    ]);
    const result = rollExpression('2d3+1', source);
    expect(result.rolls).toEqual([2, 1]);
    expect(result.total).toBe(2 + 1 + 1);
  });

  it('rollWithDropLowest should handle non-standard die sizes', () => {
    // d3 is not a standard DieType
    const source = createSequence([
      (3 - 1 + 0.5) / 3,
      (1 - 1 + 0.5) / 3,
      (2 - 1 + 0.5) / 3,
    ]);
    const result = rollWithDropLowest(3, 3, 1, source);
    expect(result.rolls).toEqual([3, 1, 2]);
    expect(result.dropped).toEqual([1]);
    expect(result.total).toBe(3 + 2);
  });

  it('rollStartingGold should handle non-standard die sizes', () => {
    // d3 is not a standard DieType
    const source = createSequence([
      (2 - 1 + 0.5) / 3,
      (3 - 1 + 0.5) / 3,
    ]);
    const result = rollStartingGold('2d3x5', source);
    expect(result).toBe((2 + 3) * 5);
  });

  it('parseDiceNotation should throw for zero sides', () => {
    expect(() => parseDiceNotation('1d0')).toThrow('at least 1 side');
  });

  it('parseDiceNotation should throw for zero count', () => {
    expect(() => parseDiceNotation('0d6')).toThrow('Must roll at least 1 die');
  });
});
