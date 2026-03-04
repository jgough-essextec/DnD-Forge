/**
 * Type assertion tests for character.ts (Story 2.8)
 *
 * These tests verify that all Character master types compile correctly
 * under strict TypeScript. They use type-level assertions and minimal
 * runtime checks.
 */

import { describe, it, expect } from 'vitest';
import type {
  AbilityScoreMethod,
  Character,
  CharacterSummary,
  CharacterExport,
  CharacterValidation,
  CharacterValidationEntry,
  CreateCharacterData,
  UpdateCharacterData,
} from '../character';

// ---------------------------------------------------------------------------
// Helper: assert a value satisfies a type at compile time
// ---------------------------------------------------------------------------
function assertType<T>(_value: T): void {
  // compile-time check only
}

// ---------------------------------------------------------------------------
// Minimal valid Character fixture (satisfies all required fields)
// ---------------------------------------------------------------------------
function createMinimalCharacter(): Character {
  return {
    id: 'char-001',
    name: 'Theron Ironforge',
    playerName: 'Alice',
    avatarUrl: null,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T12:00:00Z',
    version: 1,
    race: { raceId: 'dwarf', subraceId: 'hill-dwarf' },
    classes: [
      {
        classId: 'fighter',
        level: 5,
        chosenSkills: ['athletics', 'perception'],
        hpRolls: [8, 7, 6, 9],
      },
    ],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: 'Theron Ironforge' },
      characterPersonality: {
        personalityTraits: [
          'I face problems head-on.',
          'I can stare down a hell hound without flinching.',
        ],
        ideal: 'Greater Good',
        bond: 'I fight for those who cannot fight for themselves.',
        flaw: 'I have a weakness for the vices of the city.',
      },
    },
    alignment: 'lawful-good',
    baseAbilityScores: {
      strength: 15,
      dexterity: 10,
      constitution: 14,
      intelligence: 8,
      wisdom: 12,
      charisma: 13,
    },
    abilityScores: {
      strength: 16,
      dexterity: 10,
      constitution: 16,
      intelligence: 8,
      wisdom: 13,
      charisma: 13,
    },
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 6500,
    hpMax: 44,
    hpCurrent: 44,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [0],
    speed: { walk: 25 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: {
        base: 16,
        dexModifier: 0,
        shieldBonus: 2,
        otherBonuses: [],
        formula: '16 (chain mail) + 2 (shield)',
      },
      initiative: 0,
      speed: { walk: 25 },
      hitPoints: {
        maximum: 44,
        current: 44,
        temporary: 0,
        hitDice: { total: [{ count: 5, die: 'd10' }], used: [0] },
      },
      attacks: [],
      savingThrows: { strength: 6, constitution: 5 },
    },
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple', 'martial'],
      tools: [],
      languages: ['common', 'dwarvish'],
      skills: [
        { skill: 'athletics', proficient: true, expertise: false },
        { skill: 'perception', proficient: true, expertise: false },
      ],
      savingThrows: ['strength', 'constitution'],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 15, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: ['fighting-style-defense', 'second-wind', 'action-surge', 'extra-attack'],
    feats: [],
    description: {
      name: 'Theron Ironforge',
      age: '125',
      height: "4'6\"",
      weight: '180 lbs',
      eyes: 'Brown',
      skin: 'Tan',
      hair: 'Black',
      appearance: 'Stocky and battle-scarred',
      backstory: 'A veteran of many campaigns.',
      alliesAndOrgs: 'Order of the Gauntlet',
      treasure: 'A broken sword hilt from my first battle',
    },
    personality: {
      personalityTraits: [
        'I face problems head-on.',
        'I can stare down a hell hound without flinching.',
      ],
      ideal: 'Greater Good',
      bond: 'I fight for those who cannot fight for themselves.',
      flaw: 'I have a weakness for the vices of the city.',
    },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
  };
}

// ---------------------------------------------------------------------------
// Character identity fields
// ---------------------------------------------------------------------------
describe('Character', () => {
  it('should define Character interface with all required identity fields (id, name, createdAt, updatedAt, version)', () => {
    const char = createMinimalCharacter();
    assertType<Character>(char);
    expect(char.id).toBe('char-001');
    expect(char.name).toBe('Theron Ironforge');
    expect(char.createdAt).toBe('2025-01-15T10:30:00Z');
    expect(char.updatedAt).toBe('2025-01-15T12:00:00Z');
    expect(char.version).toBe(1);
  });

  it('should define Character.classes as array of ClassSelection to support multiclassing', () => {
    const char = createMinimalCharacter();
    char.classes.push({
      classId: 'wizard',
      level: 2,
      chosenSkills: ['arcana'],
      hpRolls: [4],
    });
    assertType<Character>(char);
    expect(char.classes).toHaveLength(2);
    expect(char.classes[0].classId).toBe('fighter');
    expect(char.classes[1].classId).toBe('wizard');
  });

  it('should define Character with inspiration boolean flag', () => {
    const char = createMinimalCharacter();
    assertType<boolean>(char.inspiration);
    expect(char.inspiration).toBe(false);

    char.inspiration = true;
    expect(char.inspiration).toBe(true);
  });

  it('should define Character with version number for optimistic concurrency', () => {
    const char = createMinimalCharacter();
    assertType<number>(char.version);
    expect(char.version).toBe(1);
  });

  it('should define Character with all combat stat fields (hpMax, hpCurrent, tempHp, hitDiceTotal, hitDiceUsed)', () => {
    const char = createMinimalCharacter();
    assertType<number>(char.hpMax);
    assertType<number>(char.hpCurrent);
    assertType<number>(char.tempHp);
    assertType<number[]>(char.hitDiceTotal);
    assertType<number[]>(char.hitDiceUsed);
    expect(char.hpMax).toBe(44);
    expect(char.hpCurrent).toBe(44);
    expect(char.tempHp).toBe(0);
    expect(char.hitDiceTotal).toEqual([5]);
    expect(char.hitDiceUsed).toEqual([0]);
  });

  it('should define Character with optional armorClassOverride and initiativeBonus', () => {
    const char = createMinimalCharacter();
    expect(char.armorClassOverride).toBeUndefined();
    expect(char.initiativeBonus).toBeUndefined();

    char.armorClassOverride = 20;
    char.initiativeBonus = 5;
    assertType<number | undefined>(char.armorClassOverride);
    assertType<number | undefined>(char.initiativeBonus);
    expect(char.armorClassOverride).toBe(20);
    expect(char.initiativeBonus).toBe(5);
  });

  it('should define Character with attunedItems field', () => {
    const char = createMinimalCharacter();
    assertType<string[]>(char.attunedItems);
    expect(char.attunedItems).toEqual([]);

    char.attunedItems = ['ring-of-protection', 'cloak-of-elvenkind', 'staff-of-power'];
    expect(char.attunedItems).toHaveLength(3);
  });

  it('should define Character with alignment field', () => {
    const char = createMinimalCharacter();
    expect(char.alignment).toBe('lawful-good');
  });

  it('should define Character with isArchived soft-delete flag', () => {
    const char = createMinimalCharacter();
    assertType<boolean>(char.isArchived);
    expect(char.isArchived).toBe(false);
  });

  it('should define Character with optional dmNotes', () => {
    const char = createMinimalCharacter();
    expect(char.dmNotes).toBeUndefined();
    char.dmNotes = 'Watch this player, they tend to hoard loot.';
    assertType<string | undefined>(char.dmNotes);
    expect(char.dmNotes).toBeDefined();
  });

  it('should define Character with spellcasting as SpellcastingData or null', () => {
    const char = createMinimalCharacter();
    expect(char.spellcasting).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// AbilityScoreMethod
// ---------------------------------------------------------------------------
describe('AbilityScoreMethod', () => {
  it('should support standard, pointBuy, and rolled methods', () => {
    const standard: AbilityScoreMethod = 'standard';
    const pointBuy: AbilityScoreMethod = 'pointBuy';
    const rolled: AbilityScoreMethod = 'rolled';
    assertType<AbilityScoreMethod>(standard);
    assertType<AbilityScoreMethod>(pointBuy);
    assertType<AbilityScoreMethod>(rolled);
    expect([standard, pointBuy, rolled]).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// CharacterSummary
// ---------------------------------------------------------------------------
describe('CharacterSummary', () => {
  it('should define CharacterSummary with only gallery-card fields (id, name, race, class, level, hp, ac)', () => {
    const summary: CharacterSummary = {
      id: 'char-001',
      name: 'Theron Ironforge',
      race: 'Hill Dwarf',
      class: 'Fighter 5',
      level: 5,
      hp: { current: 44, max: 44 },
      ac: 18,
      avatarUrl: '/avatars/theron.png',
    };
    assertType<CharacterSummary>(summary);
    expect(summary.id).toBe('char-001');
    expect(summary.race).toBe('Hill Dwarf');
    expect(summary.class).toBe('Fighter 5');
    expect(summary.level).toBe(5);
    expect(summary.hp.current).toBe(44);
    expect(summary.ac).toBe(18);
  });

  it('should allow optional avatarUrl on CharacterSummary', () => {
    const summary: CharacterSummary = {
      id: 'char-002',
      name: 'Elara',
      race: 'High Elf',
      class: 'Wizard 3',
      level: 3,
      hp: { current: 18, max: 18 },
      ac: 12,
    };
    assertType<CharacterSummary>(summary);
    expect(summary.avatarUrl).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// CharacterExport
// ---------------------------------------------------------------------------
describe('CharacterExport', () => {
  it('should define CharacterExport extending Character with formatVersion string', () => {
    const exported: CharacterExport = {
      ...createMinimalCharacter(),
      formatVersion: '1.0.0',
    };
    assertType<CharacterExport>(exported);
    assertType<string>(exported.formatVersion);
    expect(exported.formatVersion).toBe('1.0.0');
    expect(exported.id).toBe('char-001');
  });
});

// ---------------------------------------------------------------------------
// CharacterValidation
// ---------------------------------------------------------------------------
describe('CharacterValidation', () => {
  it('should define CharacterValidation as array of { field, severity, message }', () => {
    const validation: CharacterValidation = [
      { field: 'name', severity: 'error', message: 'Name is required' },
      {
        field: 'abilityScores.strength',
        severity: 'warning',
        message: 'Strength is below 8',
      },
    ];
    assertType<CharacterValidation>(validation);
    expect(validation).toHaveLength(2);
    expect(validation[0].severity).toBe('error');
    expect(validation[1].severity).toBe('warning');
  });

  it('should define CharacterValidationEntry with field, severity, and message', () => {
    const entry: CharacterValidationEntry = {
      field: 'attunedItems',
      severity: 'error',
      message: 'Cannot attune to more than 3 items',
    };
    assertType<CharacterValidationEntry>(entry);
    expect(entry.field).toBe('attunedItems');
  });
});

// ---------------------------------------------------------------------------
// CreateCharacterData
// ---------------------------------------------------------------------------
describe('CreateCharacterData', () => {
  it('should omit id, createdAt, updatedAt, version, and computed fields', () => {
    const createData: CreateCharacterData = {
      name: 'New Character',
      playerName: 'Bob',
      avatarUrl: null,
      race: { raceId: 'elf' },
      classes: [{ classId: 'wizard', level: 1, chosenSkills: ['arcana', 'history'], hpRolls: [] }],
      background: {
        backgroundId: 'sage',
        characterIdentity: { name: 'New Character' },
        characterPersonality: {
          personalityTraits: ['Curious', 'Quiet'],
          ideal: 'Knowledge',
          bond: 'My library',
          flaw: 'Absent-minded',
        },
      },
      alignment: 'true-neutral',
      baseAbilityScores: {
        strength: 8,
        dexterity: 14,
        constitution: 12,
        intelligence: 15,
        wisdom: 13,
        charisma: 10,
      },
      abilityScoreMethod: 'standard',
      experiencePoints: 0,
      hpMax: 8,
      hpCurrent: 8,
      tempHp: 0,
      hitDiceTotal: [1],
      hitDiceUsed: [0],
      speed: { walk: 30 },
      deathSaves: { successes: 0, failures: 0, stable: false },
      proficiencies: {
        armor: [],
        weapons: ['dagger', 'quarterstaff'],
        tools: [],
        languages: ['common', 'elvish'],
        skills: [
          { skill: 'arcana', proficient: true, expertise: false },
          { skill: 'history', proficient: true, expertise: false },
        ],
        savingThrows: ['intelligence', 'wisdom'],
      },
      inventory: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      attunedItems: [],
      spellcasting: null,
      features: [],
      feats: [],
      description: {
        name: 'New Character',
        age: '120',
        height: "5'8\"",
        weight: '130 lbs',
        eyes: 'Green',
        skin: 'Fair',
        hair: 'Silver',
        appearance: 'Slender and bookish',
        backstory: '',
        alliesAndOrgs: '',
        treasure: '',
      },
      personality: {
        personalityTraits: ['Curious', 'Quiet'],
        ideal: 'Knowledge',
        bond: 'My library',
        flaw: 'Absent-minded',
      },
      conditions: [],
      inspiration: false,
      campaignId: null,
      isArchived: false,
    };
    assertType<CreateCharacterData>(createData);
    expect(createData.name).toBe('New Character');
    // Should NOT have id, createdAt, updatedAt, version, abilityScores, combatStats, level
    expect((createData as Record<string, unknown>)['id']).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// UpdateCharacterData
// ---------------------------------------------------------------------------
describe('UpdateCharacterData', () => {
  it('should require id and version, with all other fields optional', () => {
    const update: UpdateCharacterData = {
      id: 'char-001',
      version: 2,
      name: 'Theron the Brave',
    };
    assertType<UpdateCharacterData>(update);
    expect(update.id).toBe('char-001');
    expect(update.version).toBe(2);
    expect(update.name).toBe('Theron the Brave');
  });

  it('should allow partial updates with only id and version', () => {
    const update: UpdateCharacterData = {
      id: 'char-001',
      version: 3,
    };
    assertType<UpdateCharacterData>(update);
    expect(update.name).toBeUndefined();
  });
});
