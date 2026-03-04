// =============================================================================
// Story 4.1 -- Ability Score Calculations Tests
// Comprehensive test suite for ability score modifier, racial bonuses,
// point buy, standard array, total scores, and saving throws.
// =============================================================================

import { describe, it, expect } from 'vitest';
import type { AbilityScores, Race, RaceSelection } from '@/types';
import {
  getModifier,
  applyRacialBonuses,
  calculatePointBuyCost,
  getPointBuyCost,
  validatePointBuy,
  validateStandardArray,
  getTotalAbilityScores,
  getSavingThrowBonus,
} from '../ability';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeScores(
  str: number,
  dex: number,
  con: number,
  int: number,
  wis: number,
  cha: number,
): AbilityScores {
  return {
    strength: str,
    dexterity: dex,
    constitution: con,
    intelligence: int,
    wisdom: wis,
    charisma: cha,
  };
}

// ---------------------------------------------------------------------------
// getModifier
// ---------------------------------------------------------------------------

describe('getModifier', () => {
  it('should return -5 for score 1', () => {
    expect(getModifier(1)).toBe(-5);
  });

  it('should return -4 for score 2', () => {
    expect(getModifier(2)).toBe(-4);
  });

  it('should return -4 for score 3', () => {
    expect(getModifier(3)).toBe(-4);
  });

  it('should return -3 for score 4', () => {
    expect(getModifier(4)).toBe(-3);
  });

  it('should return -2 for score 6', () => {
    expect(getModifier(6)).toBe(-2);
  });

  it('should return -1 for score 8', () => {
    expect(getModifier(8)).toBe(-1);
  });

  it('should return -1 for score 9', () => {
    expect(getModifier(9)).toBe(-1);
  });

  it('should return 0 for score 10', () => {
    expect(getModifier(10)).toBe(0);
  });

  it('should return 0 for score 11', () => {
    expect(getModifier(11)).toBe(0);
  });

  it('should return +1 for score 12', () => {
    expect(getModifier(12)).toBe(1);
  });

  it('should return +1 for score 13', () => {
    expect(getModifier(13)).toBe(1);
  });

  it('should return +2 for score 14', () => {
    expect(getModifier(14)).toBe(2);
  });

  it('should return +2 for score 15', () => {
    expect(getModifier(15)).toBe(2);
  });

  it('should return +3 for score 16', () => {
    expect(getModifier(16)).toBe(3);
  });

  it('should return +4 for score 18', () => {
    expect(getModifier(18)).toBe(4);
  });

  it('should return +5 for score 20', () => {
    expect(getModifier(20)).toBe(5);
  });

  it('should return +6 for score 22', () => {
    expect(getModifier(22)).toBe(6);
  });

  it('should return +7 for score 24', () => {
    expect(getModifier(24)).toBe(7);
  });

  it('should return +10 for score 30', () => {
    expect(getModifier(30)).toBe(10);
  });

  it('should handle all scores from 1 to 30 correctly', () => {
    for (let score = 1; score <= 30; score++) {
      expect(getModifier(score)).toBe(Math.floor((score - 10) / 2));
    }
  });
});

// ---------------------------------------------------------------------------
// applyRacialBonuses
// ---------------------------------------------------------------------------

describe('applyRacialBonuses', () => {
  const baseScores = makeScores(10, 10, 10, 10, 10, 10);

  it('should apply Human +1 to all ability scores', () => {
    const raceData: Race = {
      id: 'human',
      name: 'Human',
      description: '',
      abilityScoreIncrease: {
        strength: 1,
        dexterity: 1,
        constitution: 1,
        intelligence: 1,
        wisdom: 1,
        charisma: 1,
      },
      age: '',
      size: 'medium',
      speed: 30,
      senses: [],
      traits: [],
      languages: ['common'],
      subraces: [],
    };
    const selection: RaceSelection = { raceId: 'human' };

    const result = applyRacialBonuses(baseScores, selection, raceData);

    expect(result.strength).toBe(11);
    expect(result.dexterity).toBe(11);
    expect(result.constitution).toBe(11);
    expect(result.intelligence).toBe(11);
    expect(result.wisdom).toBe(11);
    expect(result.charisma).toBe(11);
  });

  it('should apply Dwarf +2 CON racial bonus', () => {
    const raceData: Race = {
      id: 'dwarf',
      name: 'Dwarf',
      description: '',
      abilityScoreIncrease: { constitution: 2 },
      age: '',
      size: 'medium',
      speed: 25,
      senses: [{ type: 'darkvision', range: 60 }],
      traits: [],
      languages: ['common', 'dwarvish'],
      subraces: [],
    };
    const selection: RaceSelection = { raceId: 'dwarf' };

    const result = applyRacialBonuses(baseScores, selection, raceData);

    expect(result.constitution).toBe(12);
    expect(result.strength).toBe(10);
    expect(result.dexterity).toBe(10);
  });

  it('should apply Dwarf racial + Hill Dwarf subrace bonuses', () => {
    const raceData: Race = {
      id: 'dwarf',
      name: 'Dwarf',
      description: '',
      abilityScoreIncrease: { constitution: 2 },
      age: '',
      size: 'medium',
      speed: 25,
      senses: [{ type: 'darkvision', range: 60 }],
      traits: [],
      languages: ['common', 'dwarvish'],
      subraces: [
        {
          id: 'hill-dwarf',
          name: 'Hill Dwarf',
          description: '',
          abilityScoreIncrease: { wisdom: 1 },
          traits: [],
        },
      ],
    };
    const selection: RaceSelection = {
      raceId: 'dwarf',
      subraceId: 'hill-dwarf',
    };

    const result = applyRacialBonuses(baseScores, selection, raceData);

    expect(result.constitution).toBe(12);
    expect(result.wisdom).toBe(11);
    expect(result.strength).toBe(10);
  });

  it('should apply Mountain Dwarf +2 STR subrace bonus alongside racial +2 CON', () => {
    const raceData: Race = {
      id: 'dwarf',
      name: 'Dwarf',
      description: '',
      abilityScoreIncrease: { constitution: 2 },
      age: '',
      size: 'medium',
      speed: 25,
      senses: [{ type: 'darkvision', range: 60 }],
      traits: [],
      languages: ['common', 'dwarvish'],
      subraces: [
        {
          id: 'mountain-dwarf',
          name: 'Mountain Dwarf',
          description: '',
          abilityScoreIncrease: { strength: 2 },
          traits: [],
        },
      ],
    };
    const selection: RaceSelection = {
      raceId: 'dwarf',
      subraceId: 'mountain-dwarf',
    };

    const result = applyRacialBonuses(baseScores, selection, raceData);

    expect(result.constitution).toBe(12);
    expect(result.strength).toBe(12);
  });

  it('should apply Half-Elf +2 CHA and chosen +1 to two other abilities', () => {
    const raceData: Race = {
      id: 'half-elf',
      name: 'Half-Elf',
      description: '',
      abilityScoreIncrease: { charisma: 2 },
      abilityBonusChoices: [
        { choose: 2, from: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom'], bonus: 1 },
      ],
      age: '',
      size: 'medium',
      speed: 30,
      senses: [{ type: 'darkvision', range: 60 }],
      traits: [],
      languages: ['common', 'elvish'],
      subraces: [],
    };
    const selection: RaceSelection = {
      raceId: 'half-elf',
      chosenAbilityBonuses: [
        { abilityName: 'dexterity', bonus: 1 },
        { abilityName: 'constitution', bonus: 1 },
      ],
    };

    const result = applyRacialBonuses(baseScores, selection, raceData);

    expect(result.charisma).toBe(12);
    expect(result.dexterity).toBe(11);
    expect(result.constitution).toBe(11);
    expect(result.strength).toBe(10);
  });

  it('should not mutate the original base scores', () => {
    const original = makeScores(10, 10, 10, 10, 10, 10);
    const raceData: Race = {
      id: 'human',
      name: 'Human',
      description: '',
      abilityScoreIncrease: { strength: 1 },
      age: '',
      size: 'medium',
      speed: 30,
      senses: [],
      traits: [],
      languages: ['common'],
      subraces: [],
    };
    const selection: RaceSelection = { raceId: 'human' };

    applyRacialBonuses(original, selection, raceData);

    expect(original.strength).toBe(10);
  });

  it('should handle Elf +2 DEX with no subrace selected', () => {
    const raceData: Race = {
      id: 'elf',
      name: 'Elf',
      description: '',
      abilityScoreIncrease: { dexterity: 2 },
      age: '',
      size: 'medium',
      speed: 30,
      senses: [{ type: 'darkvision', range: 60 }],
      traits: [],
      languages: ['common', 'elvish'],
      subraces: [
        {
          id: 'high-elf',
          name: 'High Elf',
          description: '',
          abilityScoreIncrease: { intelligence: 1 },
          traits: [],
        },
      ],
    };
    const selection: RaceSelection = { raceId: 'elf' };

    const result = applyRacialBonuses(baseScores, selection, raceData);

    expect(result.dexterity).toBe(12);
    expect(result.intelligence).toBe(10);
  });

  it('should handle a race with no ability score increases', () => {
    const raceData: Race = {
      id: 'custom',
      name: 'Custom',
      description: '',
      abilityScoreIncrease: {},
      age: '',
      size: 'medium',
      speed: 30,
      senses: [],
      traits: [],
      languages: ['common'],
      subraces: [],
    };
    const selection: RaceSelection = { raceId: 'custom' };

    const result = applyRacialBonuses(baseScores, selection, raceData);

    expect(result).toEqual(baseScores);
  });
});

// ---------------------------------------------------------------------------
// calculatePointBuyCost
// ---------------------------------------------------------------------------

describe('calculatePointBuyCost', () => {
  it('should return 0 for all scores at 8', () => {
    expect(calculatePointBuyCost(makeScores(8, 8, 8, 8, 8, 8))).toBe(0);
  });

  it('should return 54 for all scores at 15', () => {
    // 9 * 6 = 54
    expect(calculatePointBuyCost(makeScores(15, 15, 15, 15, 15, 15))).toBe(54);
  });

  it('should return 27 for a valid allocation', () => {
    // 15(9) + 15(9) + 15(9) + 8(0) + 8(0) + 8(0) = 27
    expect(calculatePointBuyCost(makeScores(15, 15, 15, 8, 8, 8))).toBe(27);
  });

  it('should return -1 if any score is below 8', () => {
    expect(calculatePointBuyCost(makeScores(7, 10, 10, 10, 10, 10))).toBe(-1);
  });

  it('should return -1 if any score is above 15', () => {
    expect(calculatePointBuyCost(makeScores(16, 10, 10, 10, 10, 10))).toBe(-1);
  });

  it('should correctly calculate a typical allocation (15, 14, 13, 12, 10, 8)', () => {
    // 9 + 7 + 5 + 4 + 2 + 0 = 27
    expect(calculatePointBuyCost(makeScores(15, 14, 13, 12, 10, 8))).toBe(27);
  });
});

// ---------------------------------------------------------------------------
// getPointBuyCost
// ---------------------------------------------------------------------------

describe('getPointBuyCost', () => {
  it('should return 0 for score 8', () => {
    expect(getPointBuyCost(8)).toBe(0);
  });

  it('should return 1 for score 9', () => {
    expect(getPointBuyCost(9)).toBe(1);
  });

  it('should return 2 for score 10', () => {
    expect(getPointBuyCost(10)).toBe(2);
  });

  it('should return 3 for score 11', () => {
    expect(getPointBuyCost(11)).toBe(3);
  });

  it('should return 4 for score 12', () => {
    expect(getPointBuyCost(12)).toBe(4);
  });

  it('should return 5 for score 13', () => {
    expect(getPointBuyCost(13)).toBe(5);
  });

  it('should return 7 for score 14', () => {
    expect(getPointBuyCost(14)).toBe(7);
  });

  it('should return 9 for score 15', () => {
    expect(getPointBuyCost(15)).toBe(9);
  });

  it('should throw RangeError for score 7 (below minimum)', () => {
    expect(() => getPointBuyCost(7)).toThrow(RangeError);
  });

  it('should throw RangeError for score 16 (above maximum)', () => {
    expect(() => getPointBuyCost(16)).toThrow(RangeError);
  });

  it('should throw RangeError for score 0', () => {
    expect(() => getPointBuyCost(0)).toThrow(RangeError);
  });

  it('should throw RangeError for negative score', () => {
    expect(() => getPointBuyCost(-1)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// validatePointBuy
// ---------------------------------------------------------------------------

describe('validatePointBuy', () => {
  it('should validate a valid 27-point allocation', () => {
    const scores = makeScores(15, 15, 15, 8, 8, 8);
    const result = validatePointBuy(scores);

    expect(result.valid).toBe(true);
    expect(result.pointsUsed).toBe(27);
    expect(result.pointsRemaining).toBe(0);
  });

  it('should validate an allocation under budget', () => {
    const scores = makeScores(10, 10, 10, 10, 10, 10);
    const result = validatePointBuy(scores);

    expect(result.valid).toBe(true);
    expect(result.pointsUsed).toBe(12);
    expect(result.pointsRemaining).toBe(15);
  });

  it('should invalidate an allocation over budget', () => {
    // 9+9+9+9+7+5 = 48 > 27
    const scores = makeScores(15, 15, 15, 15, 14, 13);
    const result = validatePointBuy(scores);

    expect(result.valid).toBe(false);
    expect(result.pointsUsed).toBe(48);
    expect(result.pointsRemaining).toBe(-21);
  });

  it('should invalidate scores out of range (below 8)', () => {
    const scores = makeScores(7, 10, 10, 10, 10, 10);
    const result = validatePointBuy(scores);

    expect(result.valid).toBe(false);
    expect(result.pointsUsed).toBe(0);
    expect(result.pointsRemaining).toBe(27);
  });

  it('should invalidate scores out of range (above 15)', () => {
    const scores = makeScores(16, 8, 8, 8, 8, 8);
    const result = validatePointBuy(scores);

    expect(result.valid).toBe(false);
    expect(result.pointsUsed).toBe(0);
    expect(result.pointsRemaining).toBe(27);
  });

  it('should handle all scores at minimum (8) as valid with 0 cost', () => {
    const scores = makeScores(8, 8, 8, 8, 8, 8);
    const result = validatePointBuy(scores);

    expect(result.valid).toBe(true);
    expect(result.pointsUsed).toBe(0);
    expect(result.pointsRemaining).toBe(27);
  });

  it('should validate a typical standard-array-like allocation', () => {
    // 15(9) + 14(7) + 13(5) + 12(4) + 10(2) + 8(0) = 27
    const scores = makeScores(15, 14, 13, 12, 10, 8);
    const result = validatePointBuy(scores);

    expect(result.valid).toBe(true);
    expect(result.pointsUsed).toBe(27);
    expect(result.pointsRemaining).toBe(0);
  });

  it('should validate a balanced allocation (all 12s and 8s)', () => {
    // 12(4) * 6 = 24
    const scores = makeScores(12, 12, 12, 12, 12, 12);
    const result = validatePointBuy(scores);

    expect(result.valid).toBe(true);
    expect(result.pointsUsed).toBe(24);
    expect(result.pointsRemaining).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// validateStandardArray
// ---------------------------------------------------------------------------

describe('validateStandardArray', () => {
  it('should accept valid permutation [15, 14, 13, 12, 10, 8]', () => {
    expect(validateStandardArray(makeScores(15, 14, 13, 12, 10, 8))).toBe(true);
  });

  it('should accept valid permutation in different order [8, 10, 12, 13, 14, 15]', () => {
    expect(validateStandardArray(makeScores(8, 10, 12, 13, 14, 15))).toBe(true);
  });

  it('should accept valid permutation [13, 8, 15, 10, 14, 12]', () => {
    expect(validateStandardArray(makeScores(13, 8, 15, 10, 14, 12))).toBe(true);
  });

  it('should reject wrong values [15, 14, 13, 12, 10, 9]', () => {
    expect(validateStandardArray(makeScores(15, 14, 13, 12, 10, 9))).toBe(false);
  });

  it('should reject duplicates [15, 15, 13, 12, 10, 8]', () => {
    expect(validateStandardArray(makeScores(15, 15, 13, 12, 10, 8))).toBe(false);
  });

  it('should reject all same values [10, 10, 10, 10, 10, 10]', () => {
    expect(validateStandardArray(makeScores(10, 10, 10, 10, 10, 10))).toBe(false);
  });

  it('should reject point buy values that are not the standard array', () => {
    expect(validateStandardArray(makeScores(15, 14, 14, 12, 10, 8))).toBe(false);
  });

  it('should reject if values sum is correct but individual values differ', () => {
    // Sum of standard array: 15+14+13+12+10+8 = 72
    // Different breakdown that sums to 72: 16+14+13+12+10+7
    expect(validateStandardArray(makeScores(16, 14, 13, 12, 10, 7))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTotalAbilityScores
// ---------------------------------------------------------------------------

describe('getTotalAbilityScores', () => {
  const base = makeScores(15, 14, 13, 12, 10, 8);

  it('should sum base + racial + ASI + feat bonuses', () => {
    const result = getTotalAbilityScores(
      base,
      { strength: 2, constitution: 1 },
      { strength: 2 },
      { dexterity: 1 },
    );

    expect(result.strength).toBe(19); // 15 + 2 + 2 = 19
    expect(result.dexterity).toBe(15); // 14 + 0 + 0 + 1 = 15
    expect(result.constitution).toBe(14); // 13 + 1 + 0 + 0 = 14
    expect(result.intelligence).toBe(12);
    expect(result.wisdom).toBe(10);
    expect(result.charisma).toBe(8);
  });

  it('should cap ability scores at 20 by default', () => {
    const result = getTotalAbilityScores(
      makeScores(18, 10, 10, 10, 10, 10),
      { strength: 2 },
      { strength: 2 },
      {},
    );

    expect(result.strength).toBe(20); // 18 + 2 + 2 = 22, capped at 20
  });

  it('should respect cap override of 24 for Barbarian Primal Champion', () => {
    const result = getTotalAbilityScores(
      makeScores(18, 10, 18, 10, 10, 10),
      { strength: 2 },
      { strength: 4, constitution: 4 },
      {},
      24,
    );

    expect(result.strength).toBe(24); // 18 + 2 + 4 = 24
    expect(result.constitution).toBe(22); // 18 + 0 + 4 = 22
  });

  it('should handle empty bonus objects', () => {
    const result = getTotalAbilityScores(base, {}, {}, {});

    expect(result).toEqual(base);
  });

  it('should not mutate the input base scores', () => {
    const originalBase = makeScores(15, 14, 13, 12, 10, 8);
    getTotalAbilityScores(originalBase, { strength: 2 }, {}, {});

    expect(originalBase.strength).toBe(15);
  });

  it('should cap each ability independently', () => {
    const result = getTotalAbilityScores(
      makeScores(18, 18, 10, 10, 10, 10),
      { strength: 4 },
      {},
      {},
    );

    expect(result.strength).toBe(20); // 18 + 4 = 22, capped at 20
    expect(result.dexterity).toBe(18); // 18 + 0 = 18, not capped
  });

  it('should handle scores that exactly reach the cap', () => {
    const result = getTotalAbilityScores(
      makeScores(18, 10, 10, 10, 10, 10),
      { strength: 2 },
      {},
      {},
    );

    expect(result.strength).toBe(20); // 18 + 2 = 20, exactly at cap
  });
});

// ---------------------------------------------------------------------------
// getSavingThrowBonus
// ---------------------------------------------------------------------------

describe('getSavingThrowBonus', () => {
  it('should return just the modifier when not proficient', () => {
    expect(getSavingThrowBonus(14, false, 1)).toBe(2); // modifier for 14 = +2
  });

  it('should return modifier + proficiency bonus when proficient at level 1', () => {
    // modifier for 14 = +2, proficiency at level 1 = +2
    expect(getSavingThrowBonus(14, true, 1)).toBe(4);
  });

  it('should return modifier + proficiency bonus when proficient at level 5', () => {
    // modifier for 14 = +2, proficiency at level 5 = +3
    expect(getSavingThrowBonus(14, true, 5)).toBe(5);
  });

  it('should return modifier + proficiency bonus when proficient at level 17', () => {
    // modifier for 14 = +2, proficiency at level 17 = +6
    expect(getSavingThrowBonus(14, true, 17)).toBe(8);
  });

  it('should handle low ability scores correctly', () => {
    // modifier for 8 = -1, proficiency at level 1 = +2
    expect(getSavingThrowBonus(8, true, 1)).toBe(1);
  });

  it('should return negative modifier when not proficient with low score', () => {
    expect(getSavingThrowBonus(6, false, 1)).toBe(-2);
  });

  it('should return 0 for score 10 without proficiency', () => {
    expect(getSavingThrowBonus(10, false, 5)).toBe(0);
  });

  it('should handle proficiency at max level (20)', () => {
    // modifier for 20 = +5, proficiency at level 20 = +6
    expect(getSavingThrowBonus(20, true, 20)).toBe(11);
  });

  it('should handle score 1 without proficiency', () => {
    expect(getSavingThrowBonus(1, false, 1)).toBe(-5);
  });

  it('should handle score 1 with proficiency at level 1', () => {
    // modifier for 1 = -5, proficiency at level 1 = +2
    expect(getSavingThrowBonus(1, true, 1)).toBe(-3);
  });
});
