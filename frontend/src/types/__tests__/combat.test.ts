/**
 * Type assertion tests for combat.ts (Story 2.7)
 *
 * These tests verify that all combat and game mechanic types compile
 * correctly under strict TypeScript. They use type-level assertions and
 * minimal runtime checks.
 */

import { describe, it, expect } from 'vitest';
import type {
  ActionEconomy,
  ActionType,
  ArmorClassCalculation,
  Attack,
  AttackType,
  CombatStats,
  CombatTurn,
  ConditionInstance,
  DamageRoll,
  DeathSaves,
  Encounter,
  HitDicePool,
  HitPoints,
  InitiativeEntry,
  InitiativeRoll,
  RestResult,
  RestType,
  Speed,
} from '../combat';
import {
  ACTION_TYPES,
  ATTACK_TYPES,
  EXHAUSTION_EFFECTS,
  REST_TYPES,
} from '../combat';

// ---------------------------------------------------------------------------
// Helper: assert a value satisfies a type at compile time
// ---------------------------------------------------------------------------
function assertType<T>(_value: T): void {
  // compile-time check only
}

// ---------------------------------------------------------------------------
// ConditionInstance
// ---------------------------------------------------------------------------
describe('ConditionInstance', () => {
  it('should define ConditionInstance with optional exhaustionLevel (1-6) for Exhaustion', () => {
    const exhaustion: ConditionInstance = {
      condition: 'exhaustion',
      exhaustionLevel: 3,
      source: 'forced march',
      duration: 'until long rest',
    };
    assertType<ConditionInstance>(exhaustion);
    expect(exhaustion.exhaustionLevel).toBe(3);
  });

  it('should define ConditionInstance without exhaustionLevel for non-Exhaustion conditions', () => {
    const blinded: ConditionInstance = {
      condition: 'blinded',
      source: 'blindness/deafness spell',
      duration: '1 minute',
    };
    assertType<ConditionInstance>(blinded);
    expect(blinded.condition).toBe('blinded');
    expect(blinded.exhaustionLevel).toBeUndefined();
  });

  it('should define Condition enum with all 14 standard conditions', () => {
    const conditions: ConditionInstance[] = [
      { condition: 'blinded', conditions: [] } as unknown as ConditionInstance,
      { condition: 'charmed' },
      { condition: 'deafened' },
      { condition: 'exhaustion', exhaustionLevel: 1 },
      { condition: 'frightened' },
      { condition: 'grappled' },
      { condition: 'incapacitated' },
      { condition: 'invisible' },
      { condition: 'paralyzed' },
      { condition: 'petrified' },
      { condition: 'poisoned' },
      { condition: 'prone' },
      { condition: 'restrained' },
      { condition: 'stunned' },
      { condition: 'unconscious' },
    ];
    expect(conditions).toHaveLength(15); // 14 standard + exhaustion
  });
});

// ---------------------------------------------------------------------------
// DeathSaves
// ---------------------------------------------------------------------------
describe('DeathSaves', () => {
  it('should define DeathSaves with successes and failures as 0|1|2|3 literal types', () => {
    const fresh: DeathSaves = { successes: 0, failures: 0, stable: false };
    assertType<DeathSaves>(fresh);
    expect(fresh.successes).toBe(0);

    const stabilised: DeathSaves = { successes: 3, failures: 1, stable: true };
    assertType<DeathSaves>(stabilised);
    expect(stabilised.stable).toBe(true);

    const dead: DeathSaves = { successes: 1, failures: 3, stable: false };
    assertType<DeathSaves>(dead);
    expect(dead.failures).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Speed
// ---------------------------------------------------------------------------
describe('Speed', () => {
  it('should define Speed interface with required walk and optional fly, swim, climb, burrow', () => {
    // Walk only (most common)
    const basic: Speed = { walk: 30 };
    assertType<Speed>(basic);
    expect(basic.walk).toBe(30);

    // Multiple movement types (e.g. an Aarakocra)
    const flying: Speed = { walk: 25, fly: 50 };
    assertType<Speed>(flying);
    expect(flying.fly).toBe(50);

    // All movement types
    const full: Speed = {
      walk: 30,
      fly: 60,
      swim: 30,
      climb: 30,
      burrow: 10,
    };
    assertType<Speed>(full);
    expect(full.burrow).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// AttackType
// ---------------------------------------------------------------------------
describe('AttackType', () => {
  it('should define AttackType as a union of four attack methods', () => {
    const melee: AttackType = 'melee-weapon';
    const ranged: AttackType = 'ranged-weapon';
    const meleeSpell: AttackType = 'melee-spell';
    const rangedSpell: AttackType = 'ranged-spell';

    assertType<AttackType>(melee);
    assertType<AttackType>(ranged);
    assertType<AttackType>(meleeSpell);
    assertType<AttackType>(rangedSpell);
    expect(ATTACK_TYPES).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// DamageRoll
// ---------------------------------------------------------------------------
describe('DamageRoll', () => {
  it('should define DamageRoll with dice, damageType, and optional bonus', () => {
    const slashing: DamageRoll = {
      dice: { count: 2, die: 'd6' },
      damageType: 'slashing',
    };
    assertType<DamageRoll>(slashing);
    expect(slashing.dice.count).toBe(2);

    const withBonus: DamageRoll = {
      dice: { count: 1, die: 'd8', modifier: 3 },
      damageType: 'piercing',
      bonus: 2,
    };
    assertType<DamageRoll>(withBonus);
    expect(withBonus.bonus).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Attack
// ---------------------------------------------------------------------------
describe('Attack', () => {
  it('should define Attack interface with attackBonus, damage, abilityUsed, and isProficient', () => {
    const longsword: Attack = {
      name: 'Longsword',
      attackType: 'melee-weapon',
      attackBonus: 5,
      abilityModifier: 'strength',
      proficient: true,
      damageRolls: [
        { dice: { count: 1, die: 'd8' }, damageType: 'slashing' },
      ],
      reach: '5 ft.',
      properties: ['versatile'],
    };
    assertType<Attack>(longsword);
    expect(longsword.attackBonus).toBe(5);
    expect(longsword.proficient).toBe(true);
  });

  it('should support ranged attacks with range property', () => {
    const longbow: Attack = {
      name: 'Longbow',
      attackType: 'ranged-weapon',
      attackBonus: 7,
      abilityModifier: 'dexterity',
      proficient: true,
      damageRolls: [
        { dice: { count: 1, die: 'd8' }, damageType: 'piercing' },
      ],
      range: '150/600 ft.',
      properties: ['ammunition', 'heavy', 'two-handed'],
    };
    assertType<Attack>(longbow);
    expect(longbow.range).toBe('150/600 ft.');
  });
});

// ---------------------------------------------------------------------------
// ArmorClassCalculation
// ---------------------------------------------------------------------------
describe('ArmorClassCalculation', () => {
  it('should define ArmorClassCalculation with base, modifiers, and formula', () => {
    const ac: ArmorClassCalculation = {
      base: 14,
      dexModifier: 2,
      shieldBonus: 2,
      otherBonuses: [1],
      formula: '14 (studded leather) + 2 (DEX) + 2 (shield) + 1 (ring)',
    };
    assertType<ArmorClassCalculation>(ac);
    expect(ac.base + ac.dexModifier + ac.shieldBonus).toBe(18);
  });
});

// ---------------------------------------------------------------------------
// HitDicePool & HitPoints
// ---------------------------------------------------------------------------
describe('HitDicePool', () => {
  it('should define HitDicePool with total dice and used counts', () => {
    const pool: HitDicePool = {
      total: [
        { count: 5, die: 'd10' },
        { count: 3, die: 'd8' },
      ],
      used: [1, 0],
    };
    assertType<HitDicePool>(pool);
    expect(pool.total).toHaveLength(2);
    expect(pool.used[0]).toBe(1);
  });
});

describe('HitPoints', () => {
  it('should define HitPoints with maximum, current, temporary, and hitDice', () => {
    const hp: HitPoints = {
      maximum: 45,
      current: 32,
      temporary: 5,
      hitDice: {
        total: [{ count: 5, die: 'd10' }],
        used: [2],
      },
    };
    assertType<HitPoints>(hp);
    expect(hp.current).toBeLessThanOrEqual(hp.maximum);
    expect(hp.temporary).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// CombatStats
// ---------------------------------------------------------------------------
describe('CombatStats', () => {
  it('should define CombatStats as an aggregate of all combat statistics', () => {
    const stats: CombatStats = {
      armorClass: {
        base: 10,
        dexModifier: 3,
        shieldBonus: 0,
        otherBonuses: [],
        formula: '10 + 3 (DEX)',
      },
      initiative: 3,
      speed: { walk: 30 },
      hitPoints: {
        maximum: 45,
        current: 45,
        temporary: 0,
        hitDice: { total: [{ count: 5, die: 'd10' }], used: [0] },
      },
      attacks: [],
      savingThrows: { strength: 5, constitution: 4 },
    };
    assertType<CombatStats>(stats);
    expect(stats.initiative).toBe(3);
    expect(stats.savingThrows.strength).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// InitiativeRoll
// ---------------------------------------------------------------------------
describe('InitiativeRoll', () => {
  it('should define InitiativeRoll with dexModifier, bonus, and advantage', () => {
    const roll: InitiativeRoll = {
      dexModifier: 3,
      bonus: 5,
      advantage: true,
    };
    assertType<InitiativeRoll>(roll);
    expect(roll.bonus).toBe(5); // e.g. Alert feat
    expect(roll.advantage).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// InitiativeEntry & Encounter
// ---------------------------------------------------------------------------
describe('InitiativeEntry', () => {
  it('should define InitiativeEntry supporting both player characters and NPCs', () => {
    const player: InitiativeEntry = {
      id: 'entry-1',
      name: 'Theron',
      initiative: 18,
      isPlayer: true,
      characterId: 'char-abc',
      hp: 45,
      maxHp: 45,
      ac: 16,
      conditions: [],
    };
    assertType<InitiativeEntry>(player);
    expect(player.isPlayer).toBe(true);

    const npc: InitiativeEntry = {
      id: 'entry-2',
      name: 'Goblin',
      initiative: 12,
      isPlayer: false,
      hp: 7,
      maxHp: 7,
      ac: 15,
      conditions: [
        { condition: 'frightened', source: 'Turn Undead', duration: '1 minute' },
      ],
    };
    assertType<InitiativeEntry>(npc);
    expect(npc.isPlayer).toBe(false);
    expect(npc.characterId).toBeUndefined();
  });
});

describe('Encounter', () => {
  it('should define Encounter with currentTurnIndex, round counter, and isActive flag', () => {
    const encounter: Encounter = {
      id: 'enc-1',
      campaignId: 'campaign-abc',
      entries: [
        {
          id: 'e1',
          name: 'Theron',
          initiative: 18,
          isPlayer: true,
          characterId: 'char-1',
          conditions: [],
        },
        {
          id: 'e2',
          name: 'Goblin',
          initiative: 12,
          isPlayer: false,
          hp: 7,
          maxHp: 7,
          ac: 15,
          conditions: [],
        },
      ],
      currentTurnIndex: 0,
      round: 1,
      isActive: true,
    };
    assertType<Encounter>(encounter);
    expect(encounter.round).toBe(1);
    expect(encounter.isActive).toBe(true);
    expect(encounter.entries).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// RestType & RestResult
// ---------------------------------------------------------------------------
describe('RestType', () => {
  it('should define RestType as short or long', () => {
    const short: RestType = 'short';
    const long: RestType = 'long';
    assertType<RestType>(short);
    assertType<RestType>(long);
    expect(REST_TYPES).toEqual(['short', 'long']);
  });
});

describe('RestResult', () => {
  it('should define RestResult with recovery amounts', () => {
    const shortRest: RestResult = {
      hpRecovered: 15,
      hitDiceRecovered: 0,
      slotsRecovered: 0,
      featuresRecovered: ['Second Wind'],
    };
    assertType<RestResult>(shortRest);
    expect(shortRest.featuresRecovered).toHaveLength(1);

    const longRest: RestResult = {
      hpRecovered: 45,
      hitDiceRecovered: 3,
      slotsRecovered: 8,
      featuresRecovered: ['Action Surge', 'Second Wind', 'Channel Divinity'],
    };
    assertType<RestResult>(longRest);
    expect(longRest.hpRecovered).toBe(45);
  });
});

// ---------------------------------------------------------------------------
// ActionType & ActionEconomy
// ---------------------------------------------------------------------------
describe('ActionType', () => {
  it('should define ActionType as a union of five action categories', () => {
    const types: ActionType[] = [
      'action',
      'bonus-action',
      'reaction',
      'movement',
      'free',
    ];
    types.forEach((t) => assertType<ActionType>(t));
    expect(ACTION_TYPES).toHaveLength(5);
  });
});

describe('ActionEconomy', () => {
  it('should define ActionEconomy with action resource counts', () => {
    const economy: ActionEconomy = {
      actions: 1,
      bonusActions: 1,
      reactions: 1,
      movement: 30,
    };
    assertType<ActionEconomy>(economy);
    expect(economy.actions).toBe(1);
    expect(economy.movement).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// CombatTurn
// ---------------------------------------------------------------------------
describe('CombatTurn', () => {
  it('should define CombatTurn with round, initiative, and actions taken', () => {
    const turn: CombatTurn = {
      round: 2,
      initiative: 18,
      actions: ['action', 'bonus-action', 'movement'],
    };
    assertType<CombatTurn>(turn);
    expect(turn.round).toBe(2);
    expect(turn.actions).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// Constant arrays
// ---------------------------------------------------------------------------
describe('Constant arrays', () => {
  it('should export ATTACK_TYPES as const', () => {
    expect(ATTACK_TYPES).toEqual([
      'melee-weapon',
      'ranged-weapon',
      'melee-spell',
      'ranged-spell',
    ]);
  });

  it('should export REST_TYPES as const', () => {
    expect(REST_TYPES).toEqual(['short', 'long']);
  });

  it('should export ACTION_TYPES as const', () => {
    expect(ACTION_TYPES).toEqual([
      'action',
      'bonus-action',
      'reaction',
      'movement',
      'free',
    ]);
  });

  it('should export EXHAUSTION_EFFECTS with 6 levels', () => {
    expect(EXHAUSTION_EFFECTS).toHaveLength(6);
    expect(EXHAUSTION_EFFECTS[0]).toBe('Disadvantage on ability checks');
    expect(EXHAUSTION_EFFECTS[5]).toBe('Death');
  });
});
