// =============================================================================
// Story 4.5 -- Level Up Calculation Tests
// Comprehensive test suite for level up gains, XP thresholds, HP averages,
// spell slot progression, proficiency bonus changes, and feature unlocking.
// =============================================================================

import { describe, it, expect } from 'vitest';
import type { Character } from '@/types/character';
import type { AbilityScores } from '@/types/core';
import {
  getLevelUpGains,
  getXPForLevel,
  getLevelForXP,
  getAverageHPRoll,
} from '../levelup';

// ---------------------------------------------------------------------------
// Test character fixture factory
// ---------------------------------------------------------------------------

function makeAbilityScores(overrides: Partial<AbilityScores> = {}): AbilityScores {
  return {
    strength: 10,
    dexterity: 10,
    constitution: 14,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    ...overrides,
  };
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const scores = overrides.abilityScores ?? makeAbilityScores();
  const { abilityScores: _a, baseAbilityScores: _b, ...restOverrides } = overrides;
  return {
    id: 'test-char-1',
    name: 'Test Character',
    playerName: 'Test Player',
    avatarUrl: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human', subraceId: undefined, abilityBonusChoices: [] },
    classes: [
      {
        classId: 'fighter',
        level: 4,
        chosenSkills: ['athletics', 'perception'],
        hpRolls: [7, 6, 5],
      },
    ],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: 'Test' },
      characterPersonality: {
        personalityTraits: ['Brave', 'Strong'],
        ideal: 'Justice',
        bond: 'Comrades',
        flaw: 'Stubborn',
      },
    },
    alignment: 'lawful-good',
    abilityScoreMethod: 'standard' as const,
    level: 4,
    experiencePoints: 2700,
    hpMax: 36,
    hpCurrent: 36,
    tempHp: 0,
    hitDiceTotal: [4],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 16, dexModifier: 0, shieldBonus: 2, otherBonuses: [], formula: '16 + 2' },
      initiative: 0,
      speed: { walk: 30 },
      hitPoints: { maximum: 36, current: 36, temporary: 0, hitDice: { total: [], used: [] } },
      attacks: [],
      savingThrows: {},
    },
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple melee', 'simple ranged', 'martial melee', 'martial ranged'],
      tools: [],
      languages: ['common'],
      skills: [
        { skill: 'athletics', proficient: true, expertise: false },
        { skill: 'perception', proficient: true, expertise: false },
      ],
      savingThrows: ['strength', 'constitution'],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 100, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: ['fighting-style-fighter', 'second-wind', 'action-surge'],
    feats: [],
    description: {
      name: 'Test', age: '25', height: '6ft', weight: '180',
      eyes: 'brown', skin: 'tan', hair: 'black', appearance: '',
      backstory: '', alliesAndOrgs: '', treasure: '',
    },
    personality: {
      personalityTraits: ['Brave', 'Strong'],
      ideal: 'Justice',
      bond: 'Comrades',
      flaw: 'Stubborn',
    },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    ...restOverrides,
    baseAbilityScores: scores,
    abilityScores: scores,
  } as Character;
}

// ---------------------------------------------------------------------------
// getXPForLevel
// ---------------------------------------------------------------------------

describe('getXPForLevel', () => {
  it('should return 0 for level 1', () => {
    expect(getXPForLevel(1)).toBe(0);
  });

  it('should return 300 for level 2', () => {
    expect(getXPForLevel(2)).toBe(300);
  });

  it('should return 900 for level 3', () => {
    expect(getXPForLevel(3)).toBe(900);
  });

  it('should return 2700 for level 4', () => {
    expect(getXPForLevel(4)).toBe(2700);
  });

  it('should return 6500 for level 5', () => {
    expect(getXPForLevel(5)).toBe(6500);
  });

  it('should return 355000 for level 20', () => {
    expect(getXPForLevel(20)).toBe(355000);
  });

  it('should throw for level 0', () => {
    expect(() => getXPForLevel(0)).toThrow();
  });

  it('should throw for level 21', () => {
    expect(() => getXPForLevel(21)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// getLevelForXP
// ---------------------------------------------------------------------------

describe('getLevelForXP', () => {
  it('should return 1 for 0 XP', () => {
    expect(getLevelForXP(0)).toBe(1);
  });

  it('should return 1 for 299 XP', () => {
    expect(getLevelForXP(299)).toBe(1);
  });

  it('should return 2 for 300 XP', () => {
    expect(getLevelForXP(300)).toBe(2);
  });

  it('should return 2 for 899 XP', () => {
    expect(getLevelForXP(899)).toBe(2);
  });

  it('should return 3 for 900 XP', () => {
    expect(getLevelForXP(900)).toBe(3);
  });

  it('should return 20 for 355000 XP', () => {
    expect(getLevelForXP(355000)).toBe(20);
  });

  it('should return 20 for 999999 XP', () => {
    expect(getLevelForXP(999999)).toBe(20);
  });

  it('should return 1 for negative XP', () => {
    expect(getLevelForXP(-100)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getAverageHPRoll
// ---------------------------------------------------------------------------

describe('getAverageHPRoll', () => {
  it('should return 3 for d4 (wizard/sorcerer)', () => {
    expect(getAverageHPRoll(4)).toBe(3);
  });

  it('should return 4 for d6 (sorcerer)', () => {
    expect(getAverageHPRoll(6)).toBe(4);
  });

  it('should return 5 for d8 (bard/cleric/rogue)', () => {
    expect(getAverageHPRoll(8)).toBe(5);
  });

  it('should return 6 for d10 (fighter/paladin/ranger)', () => {
    expect(getAverageHPRoll(10)).toBe(6);
  });

  it('should return 7 for d12 (barbarian)', () => {
    expect(getAverageHPRoll(12)).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// getLevelUpGains - Fighter
// ---------------------------------------------------------------------------

describe('getLevelUpGains - Fighter', () => {
  it('should return d10 hit die and average 6 HP', () => {
    const char = makeCharacter();
    const result = getLevelUpGains(char, 'fighter', 5);
    expect(result.hitDieType).toBe(10);
    expect(result.averageHP).toBe(6);
  });

  it('should mark level 3 as subclass level', () => {
    const char = makeCharacter({ level: 2 });
    const result = getLevelUpGains(char, 'fighter', 3);
    expect(result.isSubclassLevel).toBe(true);
  });

  it('should not mark level 2 as subclass level', () => {
    const char = makeCharacter({ level: 1 });
    const result = getLevelUpGains(char, 'fighter', 2);
    expect(result.isSubclassLevel).toBe(false);
  });

  it('should mark level 4 as ASI level', () => {
    const char = makeCharacter({ level: 3 });
    const result = getLevelUpGains(char, 'fighter', 4);
    expect(result.isASILevel).toBe(true);
  });

  it('should mark level 6 as ASI level (Fighter extra ASI)', () => {
    const char = makeCharacter({ level: 5 });
    const result = getLevelUpGains(char, 'fighter', 6);
    expect(result.isASILevel).toBe(true);
  });

  it('should not mark level 5 as ASI level', () => {
    const char = makeCharacter({ level: 4 });
    const result = getLevelUpGains(char, 'fighter', 5);
    expect(result.isASILevel).toBe(false);
  });

  it('should return new features at level 2 (Action Surge)', () => {
    const char = makeCharacter({ level: 1 });
    const result = getLevelUpGains(char, 'fighter', 2);
    expect(result.newFeatures.length).toBeGreaterThan(0);
    expect(result.newFeatures.some((f) => f.id === 'action-surge')).toBe(true);
  });

  it('should return empty features at a level with no new features', () => {
    const char = makeCharacter({ level: 3 });
    // Level 4 has no listed features in the class data (ASI is separate)
    const result = getLevelUpGains(char, 'fighter', 4);
    expect(result.newFeatures).toEqual([]);
  });

  it('should detect proficiency bonus change from level 4 to 5', () => {
    const char = makeCharacter({ level: 4 });
    const result = getLevelUpGains(char, 'fighter', 5);
    expect(result.proficiencyBonusChange).toBeDefined();
    expect(result.proficiencyBonusChange!.from).toBe(2);
    expect(result.proficiencyBonusChange!.to).toBe(3);
  });

  it('should not have proficiency bonus change from level 2 to 3', () => {
    const char = makeCharacter({ level: 2 });
    const result = getLevelUpGains(char, 'fighter', 3);
    expect(result.proficiencyBonusChange).toBeUndefined();
  });

  it('should not return spell slots for non-caster Fighter', () => {
    const char = makeCharacter({ level: 4 });
    const result = getLevelUpGains(char, 'fighter', 5);
    expect(result.newSpellSlots).toBeUndefined();
    expect(result.newCantripsKnown).toBeUndefined();
    expect(result.newSpellsPrepared).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getLevelUpGains - Wizard (full caster)
// ---------------------------------------------------------------------------

describe('getLevelUpGains - Wizard', () => {
  it('should return d6 hit die and average 4 HP', () => {
    const char = makeCharacter({
      level: 1,
      classes: [{ classId: 'wizard', level: 1, chosenSkills: ['arcana', 'history'], hpRolls: [] }],
    });
    const result = getLevelUpGains(char, 'wizard', 2);
    expect(result.hitDieType).toBe(6);
    expect(result.averageHP).toBe(4);
  });

  it('should return new spell slots when going from level 1 to 2', () => {
    const char = makeCharacter({
      level: 1,
      classes: [{ classId: 'wizard', level: 1, chosenSkills: ['arcana', 'history'], hpRolls: [] }],
    });
    const result = getLevelUpGains(char, 'wizard', 2);
    // Full caster level 1: [2,0,...], level 2: [3,0,...]
    expect(result.newSpellSlots).toBeDefined();
    expect(result.newSpellSlots![1]).toBe(1); // Gains 1 extra 1st-level slot
  });

  it('should return 2nd level spell slots when going from level 2 to 3', () => {
    const char = makeCharacter({
      level: 2,
      classes: [{ classId: 'wizard', level: 2, chosenSkills: ['arcana', 'history'], hpRolls: [3] }],
    });
    const result = getLevelUpGains(char, 'wizard', 3);
    expect(result.newSpellSlots).toBeDefined();
    expect(result.newSpellSlots![2]).toBe(2); // Gains 2 second-level slots
  });

  it('should mark level 2 as subclass level for Wizard', () => {
    const char = makeCharacter({
      level: 1,
      classes: [{ classId: 'wizard', level: 1, chosenSkills: ['arcana', 'history'], hpRolls: [] }],
    });
    const result = getLevelUpGains(char, 'wizard', 2);
    expect(result.isSubclassLevel).toBe(true);
  });

  it('should detect new cantrips when cantrip count increases', () => {
    // Wizard cantrips: 3,3,3,4,... so level 3->4 gains 1 cantrip
    const char = makeCharacter({
      level: 3,
      classes: [{ classId: 'wizard', level: 3, chosenSkills: ['arcana', 'history'], hpRolls: [3, 4] }],
    });
    const result = getLevelUpGains(char, 'wizard', 4);
    expect(result.newCantripsKnown).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getLevelUpGains - Bard (full caster with spells known)
// ---------------------------------------------------------------------------

describe('getLevelUpGains - Bard', () => {
  it('should track new spells known for known-casters', () => {
    const char = makeCharacter({
      level: 1,
      classes: [{ classId: 'bard', level: 1, chosenSkills: ['performance', 'persuasion', 'deception'], hpRolls: [] }],
    });
    const result = getLevelUpGains(char, 'bard', 2);
    // Bard spells known: 4, 5, ... so gains 1 spell
    expect(result.newSpellsPrepared).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getLevelUpGains - Barbarian
// ---------------------------------------------------------------------------

describe('getLevelUpGains - Barbarian', () => {
  it('should return d12 hit die and average 7 HP', () => {
    const char = makeCharacter({
      level: 1,
      classes: [{ classId: 'barbarian', level: 1, chosenSkills: ['athletics', 'intimidation'], hpRolls: [] }],
    });
    const result = getLevelUpGains(char, 'barbarian', 2);
    expect(result.hitDieType).toBe(12);
    expect(result.averageHP).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// getLevelUpGains - Error handling
// ---------------------------------------------------------------------------

describe('getLevelUpGains - Error handling', () => {
  it('should throw for unknown class', () => {
    const char = makeCharacter();
    expect(() => getLevelUpGains(char, 'unknown-class', 2)).toThrow(
      'Class not found: unknown-class',
    );
  });
});
