// @ts-nocheck — Test fixtures use partial Character objects that don't fully satisfy the interface
// =============================================================================
// Story 4.8 -- Character Validation Tests
// Comprehensive test suite for character validation rules including required
// fields, ability score ranges, point buy, standard array, skill counts,
// spell counts, equipment weight, attunement limits, and multiclass prereqs.
// =============================================================================

import { describe, it, expect } from 'vitest';
import type { Character } from '@/types/character';
import { validateCharacter } from '../validation';

// ---------------------------------------------------------------------------
// Test character fixture factory
// ---------------------------------------------------------------------------

function makeAbilityScores(overrides: Partial<AbilityScores> = {}): AbilityScores {
  return {
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 10,
    charisma: 8,
    ...overrides,
  };
}

function makeValidCharacter(overrides: Partial<Character> = {}): Character {
  const scores = makeAbilityScores();
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
        level: 5,
        chosenSkills: ['athletics', 'perception'],
        hpRolls: [7, 6, 5, 6],
      },
    ],
    background: {
      backgroundId: 'acolyte',
      characterIdentity: { name: 'Test' },
      characterPersonality: {
        personalityTraits: ['Brave', 'Strong'],
        ideal: 'Justice',
        bond: 'Comrades',
        flaw: 'Stubborn',
      },
    },
    alignment: 'lawful-good',
    baseAbilityScores: scores,
    abilityScores: scores,
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 6500,
    hpMax: 44,
    hpCurrent: 44,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 16, dexModifier: 0, shieldBonus: 2, otherBonuses: [], formula: '18' },
      initiative: 0,
      speed: { walk: 30 },
      hitPoints: { maximum: 44, current: 44, temporary: 0, hitDice: { total: [], used: [] } },
      attacks: [],
      savingThrows: {},
    },
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: ['common'],
      skills: [
        { skill: 'athletics', proficient: true, expertise: false },
        { skill: 'perception', proficient: true, expertise: false },
        { skill: 'insight', proficient: true, expertise: false },
        { skill: 'religion', proficient: true, expertise: false },
      ],
      savingThrows: ['strength', 'constitution'],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 100, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
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
    ...overrides,
  } as Character;
}

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'item-1',
    equipmentId: 'eq-1',
    name: 'Test Item',
    category: 'adventuring-gear',
    quantity: 1,
    weight: 1,
    isEquipped: false,
    isAttuned: false,
    requiresAttunement: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Valid character (baseline)
// ---------------------------------------------------------------------------

describe('validateCharacter - valid character', () => {
  it('should return no errors for a valid character', () => {
    const char = makeValidCharacter();
    const results = validateCharacter(char);
    const errors = results.filter((r) => r.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Required fields
// ---------------------------------------------------------------------------

describe('validateCharacter - required fields', () => {
  it('should error on missing name', () => {
    const char = makeValidCharacter({ name: '' });
    const results = validateCharacter(char);
    expect(results.some((r) => r.field === 'name' && r.severity === 'error')).toBe(true);
  });

  it('should error on whitespace-only name', () => {
    const char = makeValidCharacter({ name: '   ' });
    const results = validateCharacter(char);
    expect(results.some((r) => r.field === 'name' && r.severity === 'error')).toBe(true);
  });

  it('should error on missing race', () => {
    const char = makeValidCharacter({ race: { raceId: '', subraceId: undefined, abilityBonusChoices: [] } });
    const results = validateCharacter(char);
    expect(results.some((r) => r.field === 'race' && r.severity === 'error')).toBe(true);
  });

  it('should error on empty classes array', () => {
    const char = makeValidCharacter({ classes: [] });
    const results = validateCharacter(char);
    expect(results.some((r) => r.field === 'classes' && r.severity === 'error')).toBe(true);
  });

  it('should error on missing base ability scores', () => {
    const char = makeValidCharacter();
    (char as Record<string, unknown>).baseAbilityScores = null;
    const results = validateCharacter(char);
    expect(results.some((r) => r.field === 'baseAbilityScores' && r.severity === 'error')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Ability score range (1-30)
// ---------------------------------------------------------------------------

describe('validateCharacter - ability score range', () => {
  it('should error on ability score below 1', () => {
    const char = makeValidCharacter({
      abilityScores: makeAbilityScores({ strength: 0 }),
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'abilityScores.strength' && r.severity === 'error',
    )).toBe(true);
  });

  it('should error on ability score above 30', () => {
    const char = makeValidCharacter({
      abilityScores: makeAbilityScores({ charisma: 31 }),
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'abilityScores.charisma' && r.severity === 'error',
    )).toBe(true);
  });

  it('should accept score of 1', () => {
    const char = makeValidCharacter({
      abilityScores: makeAbilityScores({ strength: 1 }),
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'abilityScores.strength' && r.severity === 'error',
    )).toBe(false);
  });

  it('should accept score of 30', () => {
    const char = makeValidCharacter({
      abilityScores: makeAbilityScores({ strength: 30 }),
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'abilityScores.strength' && r.severity === 'error',
    )).toBe(false);
  });

  it('should error on negative ability score', () => {
    const char = makeValidCharacter({
      abilityScores: makeAbilityScores({ dexterity: -5 }),
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'abilityScores.dexterity' && r.severity === 'error',
    )).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Point buy validation
// ---------------------------------------------------------------------------

describe('validateCharacter - point buy', () => {
  it('should pass for correct 27-point buy', () => {
    // 15(9) + 14(7) + 13(5) + 12(4) + 10(2) + 8(0) = 27
    const char = makeValidCharacter({
      abilityScoreMethod: 'pointBuy',
      baseAbilityScores: makeAbilityScores(),
    });
    const results = validateCharacter(char);
    const pbErrors = results.filter(
      (r) => r.field === 'abilityScoreMethod' && r.severity === 'error',
    );
    expect(pbErrors).toHaveLength(0);
  });

  it('should error when point buy exceeds 27', () => {
    // 15(9) + 15(9) + 15(9) + 8(0) + 8(0) + 8(0) = 27... that is exactly 27
    // 15(9) + 15(9) + 14(7) + 13(5) + 8(0) + 8(0) = 30
    const char = makeValidCharacter({
      abilityScoreMethod: 'pointBuy',
      baseAbilityScores: {
        strength: 15, dexterity: 15, constitution: 14,
        intelligence: 13, wisdom: 8, charisma: 8,
      },
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'abilityScoreMethod' && r.severity === 'error' && r.message.includes('exceeds'),
    )).toBe(true);
  });

  it('should warn when point buy is under 27', () => {
    // 10(2) + 10(2) + 10(2) + 10(2) + 10(2) + 10(2) = 12
    const char = makeValidCharacter({
      abilityScoreMethod: 'pointBuy',
      baseAbilityScores: {
        strength: 10, dexterity: 10, constitution: 10,
        intelligence: 10, wisdom: 10, charisma: 10,
      },
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'abilityScoreMethod' && r.severity === 'warning' && r.message.includes('below'),
    )).toBe(true);
  });

  it('should error for out-of-range point buy scores', () => {
    const char = makeValidCharacter({
      abilityScoreMethod: 'pointBuy',
      baseAbilityScores: {
        strength: 16, dexterity: 14, constitution: 13,
        intelligence: 12, wisdom: 10, charisma: 8,
      },
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'baseAbilityScores.strength' && r.severity === 'error',
    )).toBe(true);
  });

  it('should error for score below 8 in point buy', () => {
    const char = makeValidCharacter({
      abilityScoreMethod: 'pointBuy',
      baseAbilityScores: {
        strength: 7, dexterity: 14, constitution: 13,
        intelligence: 12, wisdom: 10, charisma: 8,
      },
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'baseAbilityScores.strength' && r.severity === 'error',
    )).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Standard array validation
// ---------------------------------------------------------------------------

describe('validateCharacter - standard array', () => {
  it('should pass for correct standard array', () => {
    const char = makeValidCharacter({
      abilityScoreMethod: 'standard',
      baseAbilityScores: {
        strength: 15, dexterity: 14, constitution: 13,
        intelligence: 12, wisdom: 10, charisma: 8,
      },
    });
    const results = validateCharacter(char);
    const saErrors = results.filter(
      (r) => r.field === 'abilityScoreMethod' && r.severity === 'error',
    );
    expect(saErrors).toHaveLength(0);
  });

  it('should pass for permuted standard array', () => {
    const char = makeValidCharacter({
      abilityScoreMethod: 'standard',
      baseAbilityScores: {
        strength: 8, dexterity: 15, constitution: 10,
        intelligence: 14, wisdom: 13, charisma: 12,
      },
    });
    const results = validateCharacter(char);
    const saErrors = results.filter(
      (r) => r.field === 'abilityScoreMethod' && r.severity === 'error',
    );
    expect(saErrors).toHaveLength(0);
  });

  it('should error for non-standard array values', () => {
    const char = makeValidCharacter({
      abilityScoreMethod: 'standard',
      baseAbilityScores: {
        strength: 16, dexterity: 14, constitution: 13,
        intelligence: 12, wisdom: 10, charisma: 8,
      },
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'abilityScoreMethod' && r.severity === 'error' && r.message.includes('permutation'),
    )).toBe(true);
  });

  it('should error for all same values', () => {
    const char = makeValidCharacter({
      abilityScoreMethod: 'standard',
      baseAbilityScores: {
        strength: 10, dexterity: 10, constitution: 10,
        intelligence: 10, wisdom: 10, charisma: 10,
      },
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'abilityScoreMethod' && r.severity === 'error',
    )).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Skill count validation
// ---------------------------------------------------------------------------

describe('validateCharacter - skill count', () => {
  it('should pass for correct skill count (Fighter 2 + Acolyte 2 = 4)', () => {
    const char = makeValidCharacter();
    const results = validateCharacter(char);
    const skillErrors = results.filter(
      (r) => r.field === 'proficiencies.skills' && r.severity === 'error',
    );
    expect(skillErrors).toHaveLength(0);
  });

  it('should error when too many skills are proficient', () => {
    const char = makeValidCharacter({
      proficiencies: {
        armor: [],
        weapons: [],
        tools: [],
        languages: ['common'],
        skills: [
          { skill: 'athletics', proficient: true, expertise: false },
          { skill: 'perception', proficient: true, expertise: false },
          { skill: 'insight', proficient: true, expertise: false },
          { skill: 'religion', proficient: true, expertise: false },
          { skill: 'stealth', proficient: true, expertise: false },
          { skill: 'acrobatics', proficient: true, expertise: false },
        ],
        savingThrows: ['strength', 'constitution'],
      },
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'proficiencies.skills' && r.severity === 'error',
    )).toBe(true);
  });

  it('should not count non-proficient skills', () => {
    const char = makeValidCharacter({
      proficiencies: {
        armor: [],
        weapons: [],
        tools: [],
        languages: ['common'],
        skills: [
          { skill: 'athletics', proficient: true, expertise: false },
          { skill: 'perception', proficient: true, expertise: false },
          { skill: 'insight', proficient: true, expertise: false },
          { skill: 'religion', proficient: true, expertise: false },
          { skill: 'stealth', proficient: false, expertise: false },
        ],
        savingThrows: ['strength', 'constitution'],
      },
    });
    const results = validateCharacter(char);
    const skillErrors = results.filter(
      (r) => r.field === 'proficiencies.skills' && r.severity === 'error',
    );
    expect(skillErrors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Spell count validation
// ---------------------------------------------------------------------------

describe('validateCharacter - spell count', () => {
  it('should error when too many cantrips are known', () => {
    const char = makeValidCharacter({
      classes: [{ classId: 'wizard', level: 1, chosenSkills: ['arcana', 'history'], hpRolls: [] }],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: ['fire-bolt', 'mage-hand', 'light', 'prestidigitation'],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: { 1: 2 },
        usedSpellSlots: { 1: 0 },
        ritualCasting: true,
      },
    });
    // Wizard level 1 allows 3 cantrips, but we have 4
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'spellcasting.cantrips' && r.severity === 'error',
    )).toBe(true);
  });

  it('should pass when cantrip count is within limit', () => {
    const char = makeValidCharacter({
      classes: [{ classId: 'wizard', level: 1, chosenSkills: ['arcana', 'history'], hpRolls: [] }],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: ['fire-bolt', 'mage-hand', 'light'],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: { 1: 2 },
        usedSpellSlots: { 1: 0 },
        ritualCasting: true,
      },
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'spellcasting.cantrips' && r.severity === 'error',
    )).toBe(false);
  });

  it('should error when known-caster has too many spells', () => {
    const char = makeValidCharacter({
      classes: [{ classId: 'bard', level: 1, chosenSkills: ['performance', 'persuasion', 'deception'], hpRolls: [] }],
      spellcasting: {
        type: 'known',
        ability: 'charisma',
        cantrips: ['vicious-mockery', 'minor-illusion'],
        knownSpells: ['cure-wounds', 'healing-word', 'thunderwave', 'faerie-fire', 'dissonant-whispers'],
        preparedSpells: [],
        spellSlots: { 1: 2 },
        usedSpellSlots: { 1: 0 },
        ritualCasting: true,
      },
    });
    // Bard level 1 knows 4 spells, but we have 5
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'spellcasting.knownSpells' && r.severity === 'error',
    )).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Equipment weight / carrying capacity
// ---------------------------------------------------------------------------

describe('validateCharacter - equipment weight', () => {
  it('should warn when weight exceeds carry capacity', () => {
    // STR 10 * 15 = 150 lbs capacity
    const char = makeValidCharacter({
      abilityScores: makeAbilityScores({ strength: 10 }),
      inventory: [
        makeItem({ weight: 80, quantity: 2 }), // 160 lbs
      ],
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'inventory' && r.severity === 'warning' && r.message.includes('exceeds'),
    )).toBe(true);
  });

  it('should not warn when within carry capacity', () => {
    // STR 15 * 15 = 225 lbs capacity
    const char = makeValidCharacter({
      abilityScores: makeAbilityScores({ strength: 15 }),
      inventory: [
        makeItem({ weight: 10, quantity: 5 }), // 50 lbs
      ],
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'inventory' && r.severity === 'warning',
    )).toBe(false);
  });

  it('should not warn for empty inventory', () => {
    const char = makeValidCharacter({ inventory: [] });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'inventory' && r.severity === 'warning',
    )).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Attunement
// ---------------------------------------------------------------------------

describe('validateCharacter - attunement', () => {
  it('should error when more than 3 items are attuned', () => {
    const char = makeValidCharacter({
      attunedItems: ['item-1', 'item-2', 'item-3', 'item-4'],
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'attunedItems' && r.severity === 'error',
    )).toBe(true);
  });

  it('should pass with exactly 3 attuned items', () => {
    const char = makeValidCharacter({
      attunedItems: ['item-1', 'item-2', 'item-3'],
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'attunedItems' && r.severity === 'error',
    )).toBe(false);
  });

  it('should pass with no attuned items', () => {
    const char = makeValidCharacter({ attunedItems: [] });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'attunedItems' && r.severity === 'error',
    )).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Multiclass prerequisites
// ---------------------------------------------------------------------------

describe('validateCharacter - multiclass prerequisites', () => {
  it('should not check prerequisites for single-class characters', () => {
    const char = makeValidCharacter({
      abilityScores: makeAbilityScores({ strength: 8 }), // Below fighter prereq of 13
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field.startsWith('multiclass.') && r.severity === 'error',
    )).toBe(false);
  });

  it('should error when multiclass prerequisite is not met', () => {
    const char = makeValidCharacter({
      classes: [
        { classId: 'fighter', level: 3, chosenSkills: ['athletics', 'perception'], hpRolls: [7, 6] },
        { classId: 'wizard', level: 2, chosenSkills: ['arcana', 'history'], hpRolls: [3] },
      ],
      abilityScores: makeAbilityScores({ intelligence: 10 }), // Wizard needs INT 13
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'multiclass.wizard' && r.severity === 'error',
    )).toBe(true);
  });

  it('should pass when all multiclass prerequisites are met', () => {
    const char = makeValidCharacter({
      classes: [
        { classId: 'fighter', level: 3, chosenSkills: ['athletics', 'perception'], hpRolls: [7, 6] },
        { classId: 'wizard', level: 2, chosenSkills: ['arcana', 'history'], hpRolls: [3] },
      ],
      abilityScores: makeAbilityScores({ strength: 13, intelligence: 13 }),
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field.startsWith('multiclass.') && r.severity === 'error',
    )).toBe(false);
  });

  it('should error for Paladin multiclass with low STR and CHA', () => {
    const char = makeValidCharacter({
      classes: [
        { classId: 'fighter', level: 3, chosenSkills: ['athletics', 'perception'], hpRolls: [7, 6] },
        { classId: 'paladin', level: 2, chosenSkills: ['athletics', 'insight'], hpRolls: [8] },
      ],
      abilityScores: makeAbilityScores({ strength: 10, charisma: 10 }),
    });
    const results = validateCharacter(char);
    // Paladin requires STR 13 AND CHA 13
    const paladinErrors = results.filter(
      (r) => r.field === 'multiclass.paladin' && r.severity === 'error',
    );
    expect(paladinErrors.length).toBeGreaterThanOrEqual(2);
  });

  it('should error for Monk multiclass with low DEX', () => {
    const char = makeValidCharacter({
      classes: [
        { classId: 'fighter', level: 3, chosenSkills: ['athletics', 'perception'], hpRolls: [7, 6] },
        { classId: 'monk', level: 2, chosenSkills: ['acrobatics', 'stealth'], hpRolls: [5] },
      ],
      abilityScores: makeAbilityScores({ dexterity: 10, wisdom: 13 }),
    });
    const results = validateCharacter(char);
    expect(results.some(
      (r) => r.field === 'multiclass.monk' && r.severity === 'error' && r.message.includes('Dexterity'),
    )).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('validateCharacter - edge cases', () => {
  it('should handle rolled ability score method without special validation', () => {
    const char = makeValidCharacter({
      abilityScoreMethod: 'rolled',
      baseAbilityScores: {
        strength: 18, dexterity: 16, constitution: 14,
        intelligence: 12, wisdom: 10, charisma: 8,
      },
    });
    const results = validateCharacter(char);
    // No point buy or standard array errors
    expect(results.some((r) => r.field === 'abilityScoreMethod')).toBe(false);
  });

  it('should report multiple errors simultaneously', () => {
    const char = makeValidCharacter({
      name: '',
      classes: [],
      attunedItems: ['a', 'b', 'c', 'd'],
      abilityScores: makeAbilityScores({ strength: 0 }),
    });
    const results = validateCharacter(char);
    const errors = results.filter((r) => r.severity === 'error');
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it('should not crash on character with minimal data', () => {
    const char = makeValidCharacter();
    // Ensure it does not throw
    expect(() => validateCharacter(char)).not.toThrow();
  });
});
