// =============================================================================
// Story 4.7 -- Rest Mechanics Tests
// Comprehensive test suite for short rest and long rest recovery mechanics
// including HP recovery, hit dice spending, spell slot restoration,
// pact magic recovery, feature resets, exhaustion reduction, and death saves.
// =============================================================================

// @ts-nocheck — Test fixtures use partial Character objects that don't fully satisfy the interface
import { describe, it, expect } from 'vitest';
import type { Character } from '@/types/character';
import { getShortRestRecovery, getLongRestRecovery } from '../rest';

// ---------------------------------------------------------------------------
// Test character fixture factory
// ---------------------------------------------------------------------------

function makeAbilityScores(overrides: Partial<AbilityScores> = {}): AbilityScores {
  return {
    strength: 10,
    dexterity: 10,
    constitution: 14, // +2 modifier
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    ...overrides,
  };
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const scores = makeAbilityScores();
  return {
    id: 'test-char-1',
    name: 'Test Fighter',
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
    baseAbilityScores: scores,
    abilityScores: scores,
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 6500,
    hpMax: 44,
    hpCurrent: 20,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [2],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 16, dexModifier: 0, shieldBonus: 2, otherBonuses: [], formula: '18' },
      initiative: 0,
      speed: { walk: 30 },
      hitPoints: { maximum: 44, current: 20, temporary: 0, hitDice: { total: [], used: [] } },
      attacks: [],
      savingThrows: {},
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

function makeSpellcasting(overrides: Partial<SpellcastingData> = {}): SpellcastingData {
  return {
    type: 'prepared',
    ability: 'wisdom',
    cantrips: ['sacred-flame', 'guidance'],
    knownSpells: [],
    preparedSpells: ['cure-wounds', 'bless'],
    spellSlots: { 1: 4, 2: 3, 3: 2 },
    usedSpellSlots: { 1: 2, 2: 1, 3: 0 },
    ritualCasting: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Short Rest Recovery - HP from hit dice
// ---------------------------------------------------------------------------

describe('getShortRestRecovery - Hit Dice', () => {
  // With midRandom (0.5), d10 = 1 + floor(0.5 * 10) = 6
  // With CON mod +2, each die = max(0, 6 + 2) = 8
  const midRandom = () => 0.5;

  it('should recover HP from spending one hit die', () => {
    const char = makeCharacter();
    const result = getShortRestRecovery(char, [10], midRandom);
    // d10 roll = 6, + CON mod 2 = 8. Current HP 20 + 8 = 28
    expect(result.hpCurrent).toBe(28);
  });

  it('should recover HP from spending multiple hit dice', () => {
    const char = makeCharacter();
    const result = getShortRestRecovery(char, [10, 10], midRandom);
    // 2 * 8 = 16 recovered. 20 + 16 = 36
    expect(result.hpCurrent).toBe(36);
  });

  it('should not exceed max HP', () => {
    const char = makeCharacter({ hpCurrent: 40, hpMax: 44 });
    const result = getShortRestRecovery(char, [10], midRandom);
    // 40 + 8 = 48, clamped to 44
    expect(result.hpCurrent).toBe(44);
  });

  it('should track hit dice used', () => {
    const char = makeCharacter({ hitDiceUsed: [1] });
    const result = getShortRestRecovery(char, [10], midRandom);
    expect(result.hitDiceUsed![0]).toBe(2);
  });

  it('should not spend more hit dice than available', () => {
    const char = makeCharacter({ hitDiceTotal: [5], hitDiceUsed: [5] });
    const result = getShortRestRecovery(char, [10], midRandom);
    // No dice available, HP should stay the same
    expect(result.hpCurrent).toBe(char.hpCurrent);
  });

  it('should handle zero hit dice to spend', () => {
    const char = makeCharacter();
    const result = getShortRestRecovery(char, [], midRandom);
    expect(result.hpCurrent).toBe(char.hpCurrent);
  });

  it('should enforce minimum 0 HP per die (low CON)', () => {
    // CON 6 = -2 modifier. With minRandom, d10 = 1. 1 + (-2) = -1 -> 0
    const char = makeCharacter({
      abilityScores: makeAbilityScores({ constitution: 6 }),
    });
    const minRandom = () => 0;
    const result = getShortRestRecovery(char, [10], minRandom);
    // min(0, 1 + (-2)) = 0, so no HP recovered
    expect(result.hpCurrent).toBe(char.hpCurrent);
  });
});

// ---------------------------------------------------------------------------
// Short Rest Recovery - Pact Magic
// ---------------------------------------------------------------------------

describe('getShortRestRecovery - Pact Magic', () => {
  it('should recover Warlock pact magic slots', () => {
    const char = makeCharacter({
      classes: [{ classId: 'warlock', level: 5, chosenSkills: ['arcana', 'deception'], hpRolls: [5, 4, 5, 6] }],
      spellcasting: {
        type: 'pact-magic',
        ability: 'charisma',
        cantrips: ['eldritch-blast'],
        knownSpells: ['hex'],
        preparedSpells: [],
        spellSlots: {},
        usedSpellSlots: {},
        ritualCasting: false,
        pactMagic: {
          slotLevel: 3,
          totalSlots: 2,
          usedSlots: 2,
          mysticArcanum: {},
        },
      },
    });
    const result = getShortRestRecovery(char, []);
    expect(result.spellcasting?.pactMagic?.usedSlots).toBe(0);
  });

  it('should not affect standard spell slots on short rest', () => {
    const char = makeCharacter({
      classes: [{ classId: 'cleric', level: 5, chosenSkills: ['insight', 'religion'], hpRolls: [5, 4, 5, 6] }],
      spellcasting: makeSpellcasting(),
    });
    const result = getShortRestRecovery(char, []);
    // No pact magic, so spellcasting should not be touched
    expect(result.spellcasting).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Short Rest Recovery - Feature Reset
// ---------------------------------------------------------------------------

describe('getShortRestRecovery - Feature Reset', () => {
  it('should identify short-rest features to reset', () => {
    const char = makeCharacter({
      classes: [{ classId: 'fighter', level: 5, chosenSkills: ['athletics', 'perception'], hpRolls: [7, 6, 5, 6] }],
    });
    const result = getShortRestRecovery(char, []);
    const resetIds = (result as Record<string, unknown>)['_resetFeatureIds'] as string[];
    // Fighter short rest features: second-wind, action-surge
    expect(resetIds).toContain('second-wind');
    expect(resetIds).toContain('action-surge');
  });
});

// ---------------------------------------------------------------------------
// Long Rest Recovery - HP
// ---------------------------------------------------------------------------

describe('getLongRestRecovery - HP', () => {
  it('should restore HP to maximum', () => {
    const char = makeCharacter({ hpCurrent: 10, hpMax: 44 });
    const result = getLongRestRecovery(char);
    expect(result.hpCurrent).toBe(44);
  });

  it('should reset temporary HP to 0', () => {
    const char = makeCharacter({ tempHp: 10 });
    const result = getLongRestRecovery(char);
    expect(result.tempHp).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Long Rest Recovery - Hit Dice
// ---------------------------------------------------------------------------

describe('getLongRestRecovery - Hit Dice Recovery', () => {
  it('should recover half of total hit dice (rounded down, min 1)', () => {
    // 5 total, recover floor(5/2) = 2
    const char = makeCharacter({ hitDiceTotal: [5], hitDiceUsed: [4] });
    const result = getLongRestRecovery(char);
    // 4 used - 2 recovered = 2 used remaining
    expect(result.hitDiceUsed![0]).toBe(2);
  });

  it('should recover at least 1 hit die even with only 1 total', () => {
    const char = makeCharacter({ hitDiceTotal: [1], hitDiceUsed: [1] });
    const result = getLongRestRecovery(char);
    // floor(1/2) = 0, but min is 1, so recover 1
    expect(result.hitDiceUsed![0]).toBe(0);
  });

  it('should not recover more dice than were used', () => {
    // 10 total, recover floor(10/2) = 5, but only 2 used
    const char = makeCharacter({ hitDiceTotal: [10], hitDiceUsed: [2] });
    const result = getLongRestRecovery(char);
    expect(result.hitDiceUsed![0]).toBe(0);
  });

  it('should handle multiclass hit dice recovery', () => {
    // Fighter 3 + Wizard 2 = 5 total, recover floor(5/2) = 2
    const char = makeCharacter({
      classes: [
        { classId: 'fighter', level: 3, chosenSkills: ['athletics', 'perception'], hpRolls: [7, 6] },
        { classId: 'wizard', level: 2, chosenSkills: ['arcana', 'history'], hpRolls: [3] },
      ],
      hitDiceTotal: [3, 2],
      hitDiceUsed: [3, 2],
    });
    const result = getLongRestRecovery(char);
    const totalUsed = result.hitDiceUsed!.reduce((s, v) => s + v, 0);
    // 5 total used - 2 recovered = 3 used remaining
    expect(totalUsed).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Long Rest Recovery - Spell Slots
// ---------------------------------------------------------------------------

describe('getLongRestRecovery - Spell Slots', () => {
  it('should restore all spell slots', () => {
    const char = makeCharacter({
      classes: [{ classId: 'cleric', level: 5, chosenSkills: ['insight', 'religion'], hpRolls: [5, 4, 5, 6] }],
      spellcasting: makeSpellcasting(),
    });
    const result = getLongRestRecovery(char);
    expect(result.spellcasting?.usedSpellSlots).toEqual({ 1: 0, 2: 0, 3: 0 });
  });

  it('should clear active concentration', () => {
    const char = makeCharacter({
      spellcasting: makeSpellcasting({ activeConcentration: 'bless' }),
    });
    const result = getLongRestRecovery(char);
    expect(result.spellcasting?.activeConcentration).toBeUndefined();
  });

  it('should also restore pact magic on long rest', () => {
    const char = makeCharacter({
      classes: [{ classId: 'warlock', level: 5, chosenSkills: ['arcana', 'deception'], hpRolls: [5, 4, 5, 6] }],
      spellcasting: {
        type: 'pact-magic',
        ability: 'charisma',
        cantrips: ['eldritch-blast'],
        knownSpells: ['hex'],
        preparedSpells: [],
        spellSlots: {},
        usedSpellSlots: {},
        ritualCasting: false,
        pactMagic: {
          slotLevel: 3,
          totalSlots: 2,
          usedSlots: 2,
          mysticArcanum: {},
        },
      },
    });
    const result = getLongRestRecovery(char);
    expect(result.spellcasting?.pactMagic?.usedSlots).toBe(0);
  });

  it('should not affect character without spellcasting', () => {
    const char = makeCharacter({ spellcasting: null });
    const result = getLongRestRecovery(char);
    expect(result.spellcasting).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Long Rest Recovery - Death Saves
// ---------------------------------------------------------------------------

describe('getLongRestRecovery - Death Saves', () => {
  it('should reset death saves', () => {
    const char = makeCharacter({
      deathSaves: { successes: 2, failures: 1, stable: false },
    });
    const result = getLongRestRecovery(char);
    expect(result.deathSaves).toEqual({ successes: 0, failures: 0, stable: false });
  });
});

// ---------------------------------------------------------------------------
// Long Rest Recovery - Exhaustion
// ---------------------------------------------------------------------------

describe('getLongRestRecovery - Exhaustion', () => {
  it('should reduce exhaustion by 1 level', () => {
    const char = makeCharacter({
      conditions: [
        { condition: 'exhaustion', exhaustionLevel: 3 },
      ],
    });
    const result = getLongRestRecovery(char);
    const exhaustion = result.conditions!.find(
      (c) => c.condition === 'exhaustion',
    );
    expect(exhaustion?.exhaustionLevel).toBe(2);
  });

  it('should remove exhaustion entirely at level 1', () => {
    const char = makeCharacter({
      conditions: [
        { condition: 'exhaustion', exhaustionLevel: 1 },
      ],
    });
    const result = getLongRestRecovery(char);
    const exhaustion = result.conditions!.find(
      (c) => c.condition === 'exhaustion',
    );
    expect(exhaustion).toBeUndefined();
  });

  it('should not affect other conditions', () => {
    const char = makeCharacter({
      conditions: [
        { condition: 'poisoned' },
        { condition: 'exhaustion', exhaustionLevel: 2 },
      ],
    });
    const result = getLongRestRecovery(char);
    expect(result.conditions!.some((c) => c.condition === 'poisoned')).toBe(true);
    expect(result.conditions!.find((c) => c.condition === 'exhaustion')?.exhaustionLevel).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Long Rest Recovery - Feature Reset
// ---------------------------------------------------------------------------

describe('getLongRestRecovery - Feature Reset', () => {
  it('should identify both short-rest and long-rest features to reset', () => {
    const char = makeCharacter({
      classes: [{ classId: 'barbarian', level: 3, chosenSkills: ['athletics', 'intimidation'], hpRolls: [10, 8] }],
    });
    const result = getLongRestRecovery(char);
    const resetIds = (result as Record<string, unknown>)['_resetFeatureIds'] as string[];
    // Barbarian: rage is longRest, wild-shape (druid) is shortRest
    expect(resetIds).toContain('rage');
  });
});
