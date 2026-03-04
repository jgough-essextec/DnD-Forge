/**
 * Validation Engine Coverage Integration Tests
 *
 * Verifies that the validateCharacter function correctly identifies errors
 * and warnings for various character states: valid characters pass, missing
 * required fields produce errors, and informational issues produce warnings.
 */

import { describe, it, expect } from 'vitest';

import { validateCharacter } from '@/utils/calculations/validation';
import type { Character, CharacterValidationEntry } from '@/types/character';
import type { AbilityScores } from '@/types/core';

// ---------------------------------------------------------------------------
// Shared Fixtures
// ---------------------------------------------------------------------------

/** Valid standard array scores (pre-racial bonuses): 15,14,13,12,10,8 */
const VALID_STANDARD_ARRAY: AbilityScores = {
  strength: 15,
  dexterity: 14,
  constitution: 13,
  intelligence: 12,
  wisdom: 10,
  charisma: 8,
};

/** Valid point buy scores summing to exactly 27 points */
const VALID_POINT_BUY: AbilityScores = {
  strength: 15,   // 9 pts
  dexterity: 14,  // 7 pts
  constitution: 13, // 5 pts
  intelligence: 12, // 4 pts
  wisdom: 10,      // 2 pts
  charisma: 8,     // 0 pts = total 27
};

/**
 * Build a fully valid Human Fighter Character object.
 * This is the baseline for "should pass validation" tests.
 */
function buildValidHumanFighter(): Character {
  return {
    id: 'test-human-fighter',
    name: 'Aldric the Bold',
    playerName: 'Test Player',
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human' },
    classes: [{
      classId: 'fighter',
      level: 1,
      chosenSkills: ['athletics', 'intimidation'],
      hpRolls: [],
    }],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: 'Aldric the Bold' },
      characterPersonality: {
        personalityTraits: ['Brave beyond measure', 'Always first into battle'],
        ideal: 'Honor above all',
        bond: 'My fallen comrades',
        flaw: 'I never back down from a fight',
      },
    },
    alignment: 'lawful-good',
    baseAbilityScores: VALID_STANDARD_ARRAY,
    abilityScores: {
      // Human: +1 to all
      strength: 16,
      dexterity: 15,
      constitution: 14,
      intelligence: 13,
      wisdom: 11,
      charisma: 9,
    },
    abilityScoreMethod: 'standard',
    level: 1,
    experiencePoints: 0,
    hpMax: 12,
    hpCurrent: 12,
    tempHp: 0,
    hitDiceTotal: [1],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: {
        base: 16,
        dexModifier: 0,
        shieldBonus: 2,
        otherBonuses: [],
        formula: 'chain mail + shield',
      },
      initiative: 2,
      speed: { walk: 30 },
      hitPoints: {
        maximum: 12,
        current: 12,
        temporary: 0,
        hitDice: { total: [{ count: 1, die: 'd10' }], used: [0] },
      },
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
        { skill: 'intimidation', proficient: true, expertise: false },
      ],
      savingThrows: ['strength', 'constitution'],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
    feats: [],
    description: {
      name: 'Aldric the Bold',
      age: '28',
      height: "6'1\"",
      weight: '195 lbs',
      eyes: 'Blue',
      skin: 'Fair',
      hair: 'Brown',
      appearance: 'Tall and muscular with battle scars',
      backstory: 'A seasoned soldier from the northern wars',
      alliesAndOrgs: 'The Northern Guard',
      treasure: 'A family crest ring',
    },
    personality: {
      personalityTraits: ['Brave beyond measure', 'Always first into battle'],
      ideal: 'Honor above all',
      bond: 'My fallen comrades',
      flaw: 'I never back down from a fight',
    },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
  };
}

/**
 * Build a fully valid High Elf Wizard Character object.
 */
function buildValidHighElfWizard(): Character {
  return {
    id: 'test-high-elf-wizard',
    name: 'Elyndra Starweaver',
    playerName: 'Test Player',
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'elf', subraceId: 'high-elf' },
    classes: [{
      classId: 'wizard',
      level: 1,
      chosenSkills: ['arcana', 'investigation'],
      hpRolls: [],
    }],
    background: {
      backgroundId: 'sage',
      characterIdentity: { name: 'Elyndra Starweaver' },
      characterPersonality: {
        personalityTraits: ['Always lost in thought', 'I speak slowly and deliberately'],
        ideal: 'Knowledge is the path to power',
        bond: 'My spellbook is my most prized possession',
        flaw: 'I overlook obvious solutions in favor of complex ones',
      },
    },
    alignment: 'neutral-good',
    baseAbilityScores: {
      strength: 8,
      dexterity: 12,
      constitution: 14,
      intelligence: 15,
      wisdom: 13,
      charisma: 10,
    },
    abilityScores: {
      // Elf: DEX +2, High Elf: INT +1
      strength: 8,
      dexterity: 14,
      constitution: 14,
      intelligence: 16,
      wisdom: 13,
      charisma: 10,
    },
    abilityScoreMethod: 'standard',
    level: 1,
    experiencePoints: 0,
    hpMax: 8,
    hpCurrent: 8,
    tempHp: 0,
    hitDiceTotal: [1],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: {
        base: 10,
        dexModifier: 2,
        shieldBonus: 0,
        otherBonuses: [],
        formula: '10 + DEX',
      },
      initiative: 2,
      speed: { walk: 30 },
      hitPoints: {
        maximum: 8,
        current: 8,
        temporary: 0,
        hitDice: { total: [{ count: 1, die: 'd6' }], used: [0] },
      },
      attacks: [],
      savingThrows: {},
    },
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: ['common', 'elvish'],
      skills: [
        { skill: 'arcana', proficient: true, expertise: false },
        { skill: 'investigation', proficient: true, expertise: false },
        // sage background gives arcana + history, but arcana overlaps so we skip
        // In a proper fixture the sage would add history
        { skill: 'history', proficient: true, expertise: false },
      ],
      savingThrows: ['intelligence', 'wisdom'],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunedItems: [],
    spellcasting: {
      type: 'known',
      ability: 'intelligence',
      cantrips: ['fire-bolt', 'mage-hand', 'prestidigitation'],
      knownSpells: ['magic-missile', 'shield', 'detect-magic', 'mage-armor'],
      preparedSpells: [],
      spellSlots: { 1: 2 },
      usedSpellSlots: {},
      ritualCasting: true,
    },
    features: [],
    feats: [],
    description: {
      name: 'Elyndra Starweaver',
      age: '145',
      height: "5'8\"",
      weight: '120 lbs',
      eyes: 'Silver',
      skin: 'Pale',
      hair: 'Silver-white',
      appearance: 'Slender with an otherworldly grace',
      backstory: 'A scholar from the Elven Arcane Academy',
      alliesAndOrgs: 'The Arcane Academy',
      treasure: 'An ancient spellbook',
    },
    personality: {
      personalityTraits: ['Always lost in thought', 'I speak slowly and deliberately'],
      ideal: 'Knowledge is the path to power',
      bond: 'My spellbook is my most prized possession',
      flaw: 'I overlook obvious solutions in favor of complex ones',
    },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getErrors(entries: CharacterValidationEntry[]): CharacterValidationEntry[] {
  return entries.filter((e) => e.severity === 'error');
}

function hasErrorForField(entries: CharacterValidationEntry[], field: string): boolean {
  return entries.some((e) => e.severity === 'error' && e.field === field);
}

function hasWarningForField(entries: CharacterValidationEntry[], field: string): boolean {
  return entries.some((e) => e.severity === 'warning' && e.field === field);
}

// ---------------------------------------------------------------------------
// Tests: Valid Characters
// ---------------------------------------------------------------------------

describe('Valid Characters Pass Validation', () => {
  it('fully valid Human Fighter passes with no errors', () => {
    const character = buildValidHumanFighter();
    const entries = validateCharacter(character);
    const errors = getErrors(entries);
    expect(errors).toHaveLength(0);
  });

  it('fully valid High Elf Wizard passes with no errors', () => {
    const character = buildValidHighElfWizard();
    const entries = validateCharacter(character);
    const errors = getErrors(entries);
    expect(errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: Missing Required Fields
// ---------------------------------------------------------------------------

describe('Missing Required Fields Fail Validation', () => {
  it('missing race fails validation', () => {
    const character = buildValidHumanFighter();
    // Set race to empty raceId
    character.race = { raceId: '' };
    const entries = validateCharacter(character);
    expect(hasErrorForField(entries, 'race')).toBe(true);
  });

  it('missing class fails validation', () => {
    const character = buildValidHumanFighter();
    character.classes = [];
    const entries = validateCharacter(character);
    expect(hasErrorForField(entries, 'classes')).toBe(true);
  });

  it('missing character name fails validation', () => {
    const character = buildValidHumanFighter();
    character.name = '';
    const entries = validateCharacter(character);
    expect(hasErrorForField(entries, 'name')).toBe(true);
  });

  it('whitespace-only name fails validation', () => {
    const character = buildValidHumanFighter();
    character.name = '   ';
    const entries = validateCharacter(character);
    expect(hasErrorForField(entries, 'name')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: Missing Ability Scores
// ---------------------------------------------------------------------------

describe('Missing Ability Scores Fail Validation', () => {
  it('null baseAbilityScores fails validation', () => {
    const character = buildValidHumanFighter();
    // Force null to simulate missing scores
    (character as any).baseAbilityScores = null;
    const entries = validateCharacter(character);
    expect(hasErrorForField(entries, 'baseAbilityScores')).toBe(true);
  });

  it('undefined ability score value fails validation', () => {
    const character = buildValidHumanFighter();
    // Set one ability to undefined
    (character.baseAbilityScores as any).strength = undefined;
    const entries = validateCharacter(character);
    expect(entries.some((e) =>
      e.severity === 'error' && e.field === 'baseAbilityScores.strength',
    )).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: Ability Score Method Validation
// ---------------------------------------------------------------------------

describe('Ability Score Method Validation', () => {
  it('point buy with cost exceeding 27 fails validation', () => {
    const character = buildValidHumanFighter();
    character.abilityScoreMethod = 'pointBuy';
    // All 15s = 9 pts each * 6 = 54, way over 27
    character.baseAbilityScores = {
      strength: 15,
      dexterity: 15,
      constitution: 15,
      intelligence: 15,
      wisdom: 15,
      charisma: 15,
    };
    const entries = validateCharacter(character);
    expect(hasErrorForField(entries, 'abilityScoreMethod')).toBe(true);
  });

  it('point buy with cost under 27 produces warning', () => {
    const character = buildValidHumanFighter();
    character.abilityScoreMethod = 'pointBuy';
    // All 8s = 0 pts each, way under 27
    character.baseAbilityScores = {
      strength: 8,
      dexterity: 8,
      constitution: 8,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    };
    const entries = validateCharacter(character);
    expect(hasWarningForField(entries, 'abilityScoreMethod')).toBe(true);
  });

  it('point buy with exactly 27 points passes', () => {
    const character = buildValidHumanFighter();
    character.abilityScoreMethod = 'pointBuy';
    character.baseAbilityScores = VALID_POINT_BUY;
    const entries = validateCharacter(character);
    expect(hasErrorForField(entries, 'abilityScoreMethod')).toBe(false);
    expect(hasWarningForField(entries, 'abilityScoreMethod')).toBe(false);
  });

  it('point buy with score outside 8-15 range fails', () => {
    const character = buildValidHumanFighter();
    character.abilityScoreMethod = 'pointBuy';
    character.baseAbilityScores = {
      strength: 16, // above 15, invalid for point buy
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    };
    const entries = validateCharacter(character);
    // Should have an error for the out-of-range score
    const scoreErrors = entries.filter((e) =>
      e.severity === 'error' && e.field.startsWith('baseAbilityScores'),
    );
    expect(scoreErrors.length).toBeGreaterThan(0);
  });

  it('standard array with duplicate values fails validation', () => {
    const character = buildValidHumanFighter();
    character.abilityScoreMethod = 'standard';
    // Duplicate 15s instead of valid [15, 14, 13, 12, 10, 8]
    character.baseAbilityScores = {
      strength: 15,
      dexterity: 15,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    };
    const entries = validateCharacter(character);
    expect(hasErrorForField(entries, 'abilityScoreMethod')).toBe(true);
  });

  it('standard array with non-standard values fails validation', () => {
    const character = buildValidHumanFighter();
    character.abilityScoreMethod = 'standard';
    // Values that are not from [15, 14, 13, 12, 10, 8]
    character.baseAbilityScores = {
      strength: 16,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    };
    const entries = validateCharacter(character);
    expect(hasErrorForField(entries, 'abilityScoreMethod')).toBe(true);
  });

  it('valid standard array permutation passes', () => {
    const character = buildValidHumanFighter();
    character.abilityScoreMethod = 'standard';
    // Different arrangement of the standard array
    character.baseAbilityScores = {
      strength: 8,
      dexterity: 10,
      constitution: 15,
      intelligence: 14,
      wisdom: 13,
      charisma: 12,
    };
    const entries = validateCharacter(character);
    expect(hasErrorForField(entries, 'abilityScoreMethod')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: Ability Score Range Validation
// ---------------------------------------------------------------------------

describe('Ability Score Range Validation', () => {
  it('ability score above 30 fails validation', () => {
    const character = buildValidHumanFighter();
    character.abilityScores = {
      ...character.abilityScores,
      strength: 31,
    };
    const entries = validateCharacter(character);
    expect(entries.some((e) =>
      e.severity === 'error' && e.field === 'abilityScores.strength',
    )).toBe(true);
  });

  it('ability score below 1 fails validation', () => {
    const character = buildValidHumanFighter();
    character.abilityScores = {
      ...character.abilityScores,
      charisma: 0,
    };
    const entries = validateCharacter(character);
    expect(entries.some((e) =>
      e.severity === 'error' && e.field === 'abilityScores.charisma',
    )).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: Skill Count Validation
// ---------------------------------------------------------------------------

describe('Skill Count Validation', () => {
  it('too many skill proficiencies produces error', () => {
    const character = buildValidHumanFighter();
    // Fighter gets 2 class skills + 2 background (soldier: athletics, intimidation) = 4 total
    // Add too many proficiencies
    character.proficiencies.skills = [
      { skill: 'athletics', proficient: true, expertise: false },
      { skill: 'intimidation', proficient: true, expertise: false },
      { skill: 'perception', proficient: true, expertise: false },
      { skill: 'survival', proficient: true, expertise: false },
      { skill: 'acrobatics', proficient: true, expertise: false },
      // 5 proficient skills exceeds fighter(2) + soldier(2) = 4
    ];
    const entries = validateCharacter(character);
    expect(hasErrorForField(entries, 'proficiencies.skills')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: Attunement Validation
// ---------------------------------------------------------------------------

describe('Attunement Validation', () => {
  it('more than 3 attuned items fails validation', () => {
    const character = buildValidHumanFighter();
    character.attunedItems = ['item-1', 'item-2', 'item-3', 'item-4'];
    const entries = validateCharacter(character);
    expect(hasErrorForField(entries, 'attunedItems')).toBe(true);
  });

  it('3 attuned items passes validation', () => {
    const character = buildValidHumanFighter();
    character.attunedItems = ['item-1', 'item-2', 'item-3'];
    const entries = validateCharacter(character);
    expect(hasErrorForField(entries, 'attunedItems')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: Background Validation
// ---------------------------------------------------------------------------

describe('Background Handling', () => {
  it('missing background does not produce an error (allowed by validation)', () => {
    const character = buildValidHumanFighter();
    // Set background to minimal empty state
    character.background = {
      backgroundId: '',
      characterIdentity: { name: character.name },
      characterPersonality: {
        personalityTraits: ['', ''],
        ideal: '',
        bond: '',
        flaw: '',
      },
    };
    const entries = validateCharacter(character);
    // Current validation does not require background as error
    // It may produce warnings but should not block character creation
    const bgErrors = entries.filter(
      (e) => e.severity === 'error' && e.field === 'background',
    );
    expect(bgErrors).toHaveLength(0);
  });
});
