// @ts-nocheck — Test fixtures use partial Character objects that don't fully satisfy the interface
// =============================================================================
// Story 4.1 -- Ability Score Calculations Tests
// Comprehensive test suite for ability score modifier, racial bonuses,
// point buy, standard array, total scores, and saving throws.
// =============================================================================

import { describe, it, expect } from 'vitest';
import type { AbilityScores, Character, Race, RaceSelection } from '@/types';
import {
  getModifier,
  applyRacialBonuses,
  calculatePointBuyCost,
  getPointBuyCost,
  validatePointBuy,
  validateStandardArray,
  validateStandardArrayAssignments,
  getTotalAbilityScores,
  getTotalAbilityScore,
  getSavingThrowBonus,
  getEffectiveAbilityScores,
  getRacialBonuses,
  getFeatBonuses,
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

// ---------------------------------------------------------------------------
// Character Factory Helper (for Character-level function tests)
// ---------------------------------------------------------------------------

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const defaults: Character = {
    id: 'test-char-1',
    name: 'Test Character',
    playerName: 'Test Player',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human' },
    classes: [{ classId: 'fighter', level: 1, chosenSkills: [], hpRolls: [] }],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: 'Test' },
      characterPersonality: {
        personalityTraits: ['Brave', 'Loyal'],
        ideal: 'Honor',
        bond: 'Duty',
        flaw: 'Stubborn',
      },
    },
    alignment: 'true-neutral',
    baseAbilityScores: makeScores(15, 14, 13, 12, 10, 8),
    abilityScores: makeScores(15, 14, 13, 12, 10, 8),
    abilityScoreMethod: 'standard',
    level: 1,
    experiencePoints: 0,
    hpMax: 10,
    hpCurrent: 10,
    tempHp: 0,
    hitDiceTotal: [1],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0 },
    combatStats: {
      armorClass: 10,
      initiative: 0,
      proficiencyBonus: 2,
      passivePerception: 10,
      passiveInsight: 10,
      passiveInvestigation: 10,
    },
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: ['common'],
      skills: [],
      savingThrows: ['strength', 'constitution'],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
    feats: [],
    description: {
      name: 'Test',
      age: '25',
      height: '6ft',
      weight: '180lbs',
      eyes: 'brown',
      skin: 'tan',
      hair: 'black',
      appearance: '',
      backstory: '',
      alliesAndOrgs: '',
      treasure: '',
    },
    personality: {
      personalityTraits: ['Brave', 'Loyal'],
      ideal: 'Honor',
      bond: 'Duty',
      flaw: 'Stubborn',
    },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
  };

  return { ...defaults, ...overrides };
}

// ---------------------------------------------------------------------------
// getTotalAbilityScore (single score)
// ---------------------------------------------------------------------------

describe('getTotalAbilityScore', () => {
  it('should sum all bonus sources', () => {
    expect(getTotalAbilityScore(10, 2, 2, 1, 0)).toBe(15);
  });

  it('should cap at 20 by default', () => {
    expect(getTotalAbilityScore(15, 2, 4, 1, 0)).toBe(20);
  });

  it('should respect custom cap of 24', () => {
    expect(getTotalAbilityScore(15, 2, 4, 1, 2, 24)).toBe(24);
  });

  it('should allow exactly 24 with Barbarian capstone', () => {
    expect(getTotalAbilityScore(20, 0, 4, 0, 0, 24)).toBe(24);
  });

  it('should handle zero bonuses', () => {
    expect(getTotalAbilityScore(10, 0, 0, 0, 0)).toBe(10);
  });

  it('should handle negative totals (no floor)', () => {
    // Technically ability scores should not go below 1 but the function
    // only has a cap, not a floor
    expect(getTotalAbilityScore(3, 0, 0, 0, 0)).toBe(3);
  });

  it('should include misc bonus in calculation', () => {
    // base 14 + racial 2 + ASI 0 + feat 0 + misc 3 = 19
    expect(getTotalAbilityScore(14, 2, 0, 0, 3)).toBe(19);
  });

  it('should cap even with large misc bonus', () => {
    expect(getTotalAbilityScore(18, 2, 2, 1, 5)).toBe(20);
  });

  it('should work with cap of 30 (for magic items)', () => {
    expect(getTotalAbilityScore(18, 2, 4, 1, 5, 30)).toBe(30);
  });

  it('should handle all zero inputs', () => {
    expect(getTotalAbilityScore(0, 0, 0, 0, 0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// validateStandardArrayAssignments (number[] overload)
// ---------------------------------------------------------------------------

describe('validateStandardArrayAssignments', () => {
  it('should accept [15, 14, 13, 12, 10, 8]', () => {
    expect(validateStandardArrayAssignments([15, 14, 13, 12, 10, 8])).toBe(true);
  });

  it('should accept reversed order [8, 10, 12, 13, 14, 15]', () => {
    expect(validateStandardArrayAssignments([8, 10, 12, 13, 14, 15])).toBe(true);
  });

  it('should accept scrambled order [13, 8, 15, 10, 14, 12]', () => {
    expect(validateStandardArrayAssignments([13, 8, 15, 10, 14, 12])).toBe(true);
  });

  it('should reject wrong values', () => {
    expect(validateStandardArrayAssignments([15, 14, 13, 12, 10, 9])).toBe(false);
  });

  it('should reject duplicate values', () => {
    expect(validateStandardArrayAssignments([15, 15, 13, 12, 10, 8])).toBe(false);
  });

  it('should reject fewer than 6 values', () => {
    expect(validateStandardArrayAssignments([15, 14, 13])).toBe(false);
  });

  it('should reject more than 6 values', () => {
    expect(validateStandardArrayAssignments([15, 14, 13, 12, 10, 8, 7])).toBe(false);
  });

  it('should reject empty array', () => {
    expect(validateStandardArrayAssignments([])).toBe(false);
  });

  it('should reject all same values', () => {
    expect(validateStandardArrayAssignments([10, 10, 10, 10, 10, 10])).toBe(false);
  });

  it('should reject values with correct sum but wrong distribution', () => {
    // 72 = 16+14+13+12+10+7
    expect(validateStandardArrayAssignments([16, 14, 13, 12, 10, 7])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getEffectiveAbilityScores (Character-level)
// ---------------------------------------------------------------------------

describe('getEffectiveAbilityScores', () => {
  it('should apply Human +1 to all scores', () => {
    const character = makeCharacter({
      race: { raceId: 'human' },
      baseAbilityScores: makeScores(10, 10, 10, 10, 10, 10),
      feats: [],
    });

    const result = getEffectiveAbilityScores(character);

    // Human gets +1 to all
    expect(result.strength).toBe(11);
    expect(result.dexterity).toBe(11);
    expect(result.constitution).toBe(11);
    expect(result.intelligence).toBe(11);
    expect(result.wisdom).toBe(11);
    expect(result.charisma).toBe(11);
  });

  it('should apply Dwarf +2 CON', () => {
    const character = makeCharacter({
      race: { raceId: 'dwarf' },
      baseAbilityScores: makeScores(10, 10, 10, 10, 10, 10),
      feats: [],
    });

    const result = getEffectiveAbilityScores(character);

    expect(result.constitution).toBe(12);
    expect(result.strength).toBe(10);
  });

  it('should apply Dwarf +2 CON and Hill Dwarf +1 WIS', () => {
    const character = makeCharacter({
      race: { raceId: 'dwarf', subraceId: 'hill-dwarf' },
      baseAbilityScores: makeScores(10, 10, 10, 10, 10, 10),
      feats: [],
    });

    const result = getEffectiveAbilityScores(character);

    expect(result.constitution).toBe(12);
    expect(result.wisdom).toBe(11);
  });

  it('should apply Elf +2 DEX and High Elf +1 INT', () => {
    const character = makeCharacter({
      race: { raceId: 'elf', subraceId: 'high-elf' },
      baseAbilityScores: makeScores(10, 10, 10, 10, 10, 10),
      feats: [],
    });

    const result = getEffectiveAbilityScores(character);

    expect(result.dexterity).toBe(12);
    expect(result.intelligence).toBe(11);
  });

  it('should apply Half-Elf +2 CHA and chosen bonuses', () => {
    const character = makeCharacter({
      race: {
        raceId: 'half-elf',
        chosenAbilityBonuses: [
          { abilityName: 'strength', bonus: 1 },
          { abilityName: 'constitution', bonus: 1 },
        ],
      },
      baseAbilityScores: makeScores(10, 10, 10, 10, 10, 10),
      feats: [],
    });

    const result = getEffectiveAbilityScores(character);

    expect(result.charisma).toBe(12);
    expect(result.strength).toBe(11);
    expect(result.constitution).toBe(11);
    expect(result.dexterity).toBe(10);
  });

  it('should apply feat ability score increases (fixed)', () => {
    // Actor feat: +1 CHA
    const character = makeCharacter({
      race: { raceId: 'human' },
      baseAbilityScores: makeScores(10, 10, 10, 10, 10, 10),
      feats: [{ featId: 'actor' }],
    });

    const result = getEffectiveAbilityScores(character);

    // Human +1 all + Actor +1 CHA
    expect(result.charisma).toBe(12);
    expect(result.strength).toBe(11);
  });

  it('should apply feat with chosenAbility', () => {
    // Athlete feat: normally +1 STR, but player chose DEX
    const character = makeCharacter({
      race: { raceId: 'human' },
      baseAbilityScores: makeScores(10, 10, 10, 10, 10, 10),
      feats: [{ featId: 'athlete', chosenAbility: 'dexterity' }],
    });

    const result = getEffectiveAbilityScores(character);

    // Human +1 all + Athlete +1 to chosen (DEX)
    expect(result.dexterity).toBe(12);
    expect(result.strength).toBe(11); // Only human +1, not athlete
  });

  it('should apply multiple feats', () => {
    // Actor (+1 CHA) + Keen Mind (+1 INT)
    const character = makeCharacter({
      race: { raceId: 'human' },
      baseAbilityScores: makeScores(10, 10, 10, 10, 10, 10),
      feats: [{ featId: 'actor' }, { featId: 'keen-mind' }],
    });

    const result = getEffectiveAbilityScores(character);

    // Human +1 all + Actor +1 CHA + Keen Mind +1 INT
    expect(result.charisma).toBe(12);
    expect(result.intelligence).toBe(12);
    expect(result.strength).toBe(11);
  });

  it('should cap ability scores at 20', () => {
    const character = makeCharacter({
      race: { raceId: 'human' }, // +1 all
      baseAbilityScores: makeScores(20, 10, 10, 10, 10, 10),
      feats: [{ featId: 'athlete' }], // default applies +1 STR
    });

    const result = getEffectiveAbilityScores(character);

    // 20 + 1 (human) + 1 (athlete STR) = 22 -> capped at 20
    expect(result.strength).toBe(20);
  });

  it('should handle character with no feats and unknown race gracefully', () => {
    const character = makeCharacter({
      race: { raceId: 'nonexistent-race' },
      baseAbilityScores: makeScores(15, 14, 13, 12, 10, 8),
      feats: [],
    });

    const result = getEffectiveAbilityScores(character);

    // No race found, so no bonuses applied
    expect(result).toEqual(makeScores(15, 14, 13, 12, 10, 8));
  });

  it('should handle Dragonborn +2 STR +1 CHA', () => {
    const character = makeCharacter({
      race: { raceId: 'dragonborn' },
      baseAbilityScores: makeScores(10, 10, 10, 10, 10, 10),
      feats: [],
    });

    const result = getEffectiveAbilityScores(character);

    expect(result.strength).toBe(12);
    expect(result.charisma).toBe(11);
    expect(result.constitution).toBe(10);
  });

  it('should handle Tiefling +2 CHA +1 INT', () => {
    const character = makeCharacter({
      race: { raceId: 'tiefling' },
      baseAbilityScores: makeScores(10, 10, 10, 10, 10, 10),
      feats: [],
    });

    const result = getEffectiveAbilityScores(character);

    expect(result.charisma).toBe(12);
    expect(result.intelligence).toBe(11);
  });

  it('should handle feat with unknown featId gracefully', () => {
    const character = makeCharacter({
      race: { raceId: 'human' },
      baseAbilityScores: makeScores(10, 10, 10, 10, 10, 10),
      feats: [{ featId: 'nonexistent-feat' }],
    });

    const result = getEffectiveAbilityScores(character);

    // Human +1 all, unknown feat adds nothing
    expect(result.strength).toBe(11);
    expect(result.charisma).toBe(11);
  });
});

// ---------------------------------------------------------------------------
// getRacialBonuses
// ---------------------------------------------------------------------------

describe('getRacialBonuses', () => {
  it('should return Human +1 to all', () => {
    const character = makeCharacter({ race: { raceId: 'human' } });
    const bonuses = getRacialBonuses(character);

    expect(bonuses.strength).toBe(1);
    expect(bonuses.dexterity).toBe(1);
    expect(bonuses.constitution).toBe(1);
    expect(bonuses.intelligence).toBe(1);
    expect(bonuses.wisdom).toBe(1);
    expect(bonuses.charisma).toBe(1);
  });

  it('should return Dwarf +2 CON + Hill Dwarf +1 WIS', () => {
    const character = makeCharacter({
      race: { raceId: 'dwarf', subraceId: 'hill-dwarf' },
    });
    const bonuses = getRacialBonuses(character);

    expect(bonuses.constitution).toBe(2);
    expect(bonuses.wisdom).toBe(1);
    expect(bonuses.strength).toBeUndefined();
  });

  it('should include chosen ability bonuses for Half-Elf', () => {
    const character = makeCharacter({
      race: {
        raceId: 'half-elf',
        chosenAbilityBonuses: [
          { abilityName: 'strength', bonus: 1 },
          { abilityName: 'wisdom', bonus: 1 },
        ],
      },
    });
    const bonuses = getRacialBonuses(character);

    expect(bonuses.charisma).toBe(2);
    expect(bonuses.strength).toBe(1);
    expect(bonuses.wisdom).toBe(1);
  });

  it('should return empty for unknown race', () => {
    const character = makeCharacter({ race: { raceId: 'unknown' } });
    const bonuses = getRacialBonuses(character);

    expect(Object.keys(bonuses).length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getFeatBonuses
// ---------------------------------------------------------------------------

describe('getFeatBonuses', () => {
  it('should return empty for no feats', () => {
    const character = makeCharacter({ feats: [] });
    const bonuses = getFeatBonuses(character);

    expect(Object.keys(bonuses).length).toBe(0);
  });

  it('should return Actor +1 CHA', () => {
    const character = makeCharacter({ feats: [{ featId: 'actor' }] });
    const bonuses = getFeatBonuses(character);

    expect(bonuses.charisma).toBe(1);
  });

  it('should apply chosenAbility when specified', () => {
    const character = makeCharacter({
      feats: [{ featId: 'athlete', chosenAbility: 'dexterity' }],
    });
    const bonuses = getFeatBonuses(character);

    expect(bonuses.dexterity).toBe(1);
    expect(bonuses.strength).toBeUndefined();
  });

  it('should stack multiple feat bonuses to different abilities', () => {
    const character = makeCharacter({
      feats: [{ featId: 'actor' }, { featId: 'keen-mind' }],
    });
    const bonuses = getFeatBonuses(character);

    expect(bonuses.charisma).toBe(1);
    expect(bonuses.intelligence).toBe(1);
  });

  it('should handle feat with no ASI', () => {
    const character = makeCharacter({ feats: [{ featId: 'alert' }] });
    const bonuses = getFeatBonuses(character);

    expect(Object.keys(bonuses).length).toBe(0);
  });

  it('should handle unknown feat gracefully', () => {
    const character = makeCharacter({
      feats: [{ featId: 'nonexistent-feat' }],
    });
    const bonuses = getFeatBonuses(character);

    expect(Object.keys(bonuses).length).toBe(0);
  });
});
