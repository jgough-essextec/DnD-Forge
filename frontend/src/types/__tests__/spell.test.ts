/**
 * Spell & Spellcasting Type Tests (Story 2.5)
 *
 * Type assertion tests that verify all spell types compile correctly
 * and that constant values are accurate.
 */

import { describe, it, expect } from 'vitest';
import type {
  SpellSchool,
  SpellLevel,
  CastingTime,
  CastingTimeUnit,
  SpellRange,
  SpellRangeType,
  SpellDuration,
  SpellDurationType,
  SpellComponents,
  SpellDamage,
  SpellHealing,
  Spell,
  SpellSlots,
  UsedSpellSlots,
  SpellSlot,
  SpellcastingType,
  PactMagic,
  SpellcastingData,
  SpellSelection,
  KnownSpell,
} from '../spell';
import {
  SPELL_SCHOOLS,
  MULTICLASS_SPELL_SLOT_TABLE,
} from '../spell';

// ---------------------------------------------------------------------------
// Helper: compile-time type assertion (value is never used at runtime)
// ---------------------------------------------------------------------------
function assertType<_T>(_value: _T): void {
  // no-op; purely for compile-time verification
}

// ---------------------------------------------------------------------------
// SpellSchool
// ---------------------------------------------------------------------------
describe('SpellSchool', () => {
  it('should define SpellSchool enum with all 8 schools (Abjuration through Transmutation)', () => {
    expect(SPELL_SCHOOLS).toHaveLength(8);
    expect(SPELL_SCHOOLS).toContain('abjuration');
    expect(SPELL_SCHOOLS).toContain('conjuration');
    expect(SPELL_SCHOOLS).toContain('divination');
    expect(SPELL_SCHOOLS).toContain('enchantment');
    expect(SPELL_SCHOOLS).toContain('evocation');
    expect(SPELL_SCHOOLS).toContain('illusion');
    expect(SPELL_SCHOOLS).toContain('necromancy');
    expect(SPELL_SCHOOLS).toContain('transmutation');
  });

  it('should accept valid SpellSchool values', () => {
    const school: SpellSchool = 'evocation';
    assertType<SpellSchool>(school);
  });
});

// ---------------------------------------------------------------------------
// SpellLevel
// ---------------------------------------------------------------------------
describe('SpellLevel', () => {
  it('should define SpellLevel type with values 0-9 where 0 is cantrip', () => {
    const cantrip: SpellLevel = 0;
    const firstLevel: SpellLevel = 1;
    const ninthLevel: SpellLevel = 9;
    assertType<SpellLevel>(cantrip);
    assertType<SpellLevel>(firstLevel);
    assertType<SpellLevel>(ninthLevel);
    expect(cantrip).toBe(0);
    expect(ninthLevel).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// CastingTime
// ---------------------------------------------------------------------------
describe('CastingTime', () => {
  it('should define CastingTime supporting action, bonus action, reaction with trigger, and minute/hour', () => {
    const action: CastingTime = { value: 1, unit: 'action' };
    assertType<CastingTime>(action);
    expect(action.value).toBe(1);
    expect(action.unit).toBe('action');

    const bonusAction: CastingTime = { value: 1, unit: 'bonus-action' };
    assertType<CastingTime>(bonusAction);
    expect(bonusAction.unit).toBe('bonus-action');

    const reaction: CastingTime = {
      value: 1,
      unit: 'reaction',
      reactionTrigger: 'when you see a creature within 60 feet of you casting a spell',
    };
    assertType<CastingTime>(reaction);
    expect(reaction.reactionTrigger).toBeDefined();

    const ritual: CastingTime = { value: 10, unit: 'minute' };
    assertType<CastingTime>(ritual);
    expect(ritual.value).toBe(10);

    const longCast: CastingTime = { value: 1, unit: 'hour' };
    assertType<CastingTime>(longCast);
    expect(longCast.unit).toBe('hour');
  });

  it('should accept all CastingTimeUnit values', () => {
    const units: CastingTimeUnit[] = ['action', 'bonus-action', 'reaction', 'minute', 'hour'];
    expect(units).toHaveLength(5);
    units.forEach((unit) => assertType<CastingTimeUnit>(unit));
  });
});

// ---------------------------------------------------------------------------
// SpellRange
// ---------------------------------------------------------------------------
describe('SpellRange', () => {
  it('should define SpellRange with self, touch, ranged, sight, unlimited and optional area shape', () => {
    const self: SpellRange = { type: 'self' };
    assertType<SpellRange>(self);
    expect(self.type).toBe('self');

    const touch: SpellRange = { type: 'touch' };
    assertType<SpellRange>(touch);

    const ranged: SpellRange = { type: 'ranged', distance: 120, unit: 'feet' };
    assertType<SpellRange>(ranged);
    expect(ranged.distance).toBe(120);

    const sight: SpellRange = { type: 'sight' };
    assertType<SpellRange>(sight);

    const unlimited: SpellRange = { type: 'unlimited' };
    assertType<SpellRange>(unlimited);

    // Area-of-effect spell (e.g., Fireball: 150 feet ranged, 20-foot sphere)
    const aoe: SpellRange = {
      type: 'ranged',
      distance: 150,
      unit: 'feet',
      shape: 'sphere',
      areaSize: 20,
    };
    assertType<SpellRange>(aoe);
    expect(aoe.shape).toBe('sphere');
    expect(aoe.areaSize).toBe(20);
  });

  it('should accept all SpellRangeType values', () => {
    const types: SpellRangeType[] = ['self', 'touch', 'ranged', 'sight', 'unlimited'];
    expect(types).toHaveLength(5);
    types.forEach((t) => assertType<SpellRangeType>(t));
  });
});

// ---------------------------------------------------------------------------
// SpellDuration
// ---------------------------------------------------------------------------
describe('SpellDuration', () => {
  it('should define SpellDuration with all duration types', () => {
    const instantaneous: SpellDuration = { type: 'instantaneous' };
    assertType<SpellDuration>(instantaneous);

    const concentration: SpellDuration = { type: 'concentration', value: 1, unit: 'minute' };
    assertType<SpellDuration>(concentration);
    expect(concentration.value).toBe(1);

    const timed: SpellDuration = { type: 'timed', value: 8, unit: 'hour' };
    assertType<SpellDuration>(timed);

    const untilDispelled: SpellDuration = { type: 'until-dispelled' };
    assertType<SpellDuration>(untilDispelled);
  });

  it('should accept all SpellDurationType values', () => {
    const types: SpellDurationType[] = ['instantaneous', 'concentration', 'timed', 'until-dispelled'];
    expect(types).toHaveLength(4);
    types.forEach((t) => assertType<SpellDurationType>(t));
  });
});

// ---------------------------------------------------------------------------
// SpellComponents
// ---------------------------------------------------------------------------
describe('SpellComponents', () => {
  it('should define SpellComponents with materialCost using CurrencyAmount and materialConsumed flag', () => {
    // Fireball: V, S, M (a tiny ball of bat guano and sulfur)
    const fireball: SpellComponents = {
      verbal: true,
      somatic: true,
      material: true,
      materialDescription: 'a tiny ball of bat guano and sulfur',
    };
    assertType<SpellComponents>(fireball);
    expect(fireball.materialCost).toBeUndefined();
    expect(fireball.materialConsumed).toBeUndefined();

    // Chromatic Orb: V, S, M (a diamond worth at least 50 gp)
    const chromaticOrb: SpellComponents = {
      verbal: true,
      somatic: true,
      material: true,
      materialDescription: 'a diamond worth at least 50 gp',
      materialCost: { amount: 50, unit: 'gp' },
      materialConsumed: false,
    };
    assertType<SpellComponents>(chromaticOrb);
    expect(chromaticOrb.materialCost).toEqual({ amount: 50, unit: 'gp' });
    expect(chromaticOrb.materialConsumed).toBe(false);

    // Revivify: V, S, M (diamonds worth 300 gp, consumed)
    const revivify: SpellComponents = {
      verbal: true,
      somatic: true,
      material: true,
      materialDescription: 'diamonds worth 300 gp, which the spell consumes',
      materialCost: { amount: 300, unit: 'gp' },
      materialConsumed: true,
    };
    assertType<SpellComponents>(revivify);
    expect(revivify.materialConsumed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SpellDamage & SpellHealing
// ---------------------------------------------------------------------------
describe('SpellDamage', () => {
  it('should define SpellDamage with damageType and diceAtLevel', () => {
    // Firebolt cantrip scaling
    const fireboltDamage: SpellDamage = {
      damageType: 'fire',
      diceAtLevel: {
        1: '1d10',
        5: '2d10',
        11: '3d10',
        17: '4d10',
      },
    };
    assertType<SpellDamage>(fireboltDamage);
    expect(fireboltDamage.damageType).toBe('fire');
    expect(fireboltDamage.diceAtLevel[1]).toBe('1d10');
    expect(fireboltDamage.diceAtLevel[17]).toBe('4d10');
  });
});

describe('SpellHealing', () => {
  it('should define SpellHealing with diceAtLevel', () => {
    // Cure Wounds at various levels
    const cureWoundsHealing: SpellHealing = {
      diceAtLevel: {
        1: '1d8',
        2: '2d8',
        3: '3d8',
        4: '4d8',
        5: '5d8',
      },
    };
    assertType<SpellHealing>(cureWoundsHealing);
    expect(cureWoundsHealing.diceAtLevel[1]).toBe('1d8');
  });
});

// ---------------------------------------------------------------------------
// Spell
// ---------------------------------------------------------------------------
describe('Spell', () => {
  it('should define Spell interface with concentration and ritual boolean flags', () => {
    // Fireball: a classic evocation spell
    const fireball: Spell = {
      id: 'fireball',
      name: 'Fireball',
      level: 3,
      school: 'evocation',
      castingTime: { value: 1, unit: 'action' },
      range: { type: 'ranged', distance: 150, unit: 'feet', shape: 'sphere', areaSize: 20 },
      components: {
        verbal: true,
        somatic: true,
        material: true,
        materialDescription: 'a tiny ball of bat guano and sulfur',
      },
      duration: { type: 'instantaneous' },
      description: 'A bright streak flashes from your pointing finger...',
      higherLevelDescription: 'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.',
      ritual: false,
      concentration: false,
      classes: ['sorcerer', 'wizard'],
      damage: { count: 8, die: 'd6', type: 'fire' },
      savingThrow: 'dexterity',
    };
    assertType<Spell>(fireball);
    expect(fireball.concentration).toBe(false);
    expect(fireball.ritual).toBe(false);
    expect(fireball.level).toBe(3);
  });

  it('should represent concentration spells', () => {
    const bless: Spell = {
      id: 'bless',
      name: 'Bless',
      level: 1,
      school: 'enchantment',
      castingTime: { value: 1, unit: 'action' },
      range: { type: 'ranged', distance: 30, unit: 'feet' },
      components: {
        verbal: true,
        somatic: true,
        material: true,
        materialDescription: 'a sprinkling of holy water',
      },
      duration: { type: 'concentration', value: 1, unit: 'minute' },
      description: 'You bless up to three creatures of your choice...',
      ritual: false,
      concentration: true,
      classes: ['cleric', 'paladin'],
    };
    assertType<Spell>(bless);
    expect(bless.concentration).toBe(true);
  });

  it('should represent ritual spells', () => {
    const detectMagic: Spell = {
      id: 'detect-magic',
      name: 'Detect Magic',
      level: 1,
      school: 'divination',
      castingTime: { value: 1, unit: 'action' },
      range: { type: 'self' },
      components: { verbal: true, somatic: true, material: false },
      duration: { type: 'concentration', value: 10, unit: 'minute' },
      description: 'For the duration, you sense the presence of magic...',
      ritual: true,
      concentration: true,
      classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'wizard'],
    };
    assertType<Spell>(detectMagic);
    expect(detectMagic.ritual).toBe(true);
  });

  it('should represent cantrips (level 0)', () => {
    const fireBolt: Spell = {
      id: 'fire-bolt',
      name: 'Fire Bolt',
      level: 0,
      school: 'evocation',
      castingTime: { value: 1, unit: 'action' },
      range: { type: 'ranged', distance: 120, unit: 'feet' },
      components: { verbal: true, somatic: true, material: false },
      duration: { type: 'instantaneous' },
      description: 'You hurl a mote of fire at a creature or object...',
      ritual: false,
      concentration: false,
      classes: ['sorcerer', 'wizard'],
      damage: { count: 1, die: 'd10', type: 'fire' },
      attackType: 'ranged',
    };
    assertType<Spell>(fireBolt);
    expect(fireBolt.level).toBe(0);
    expect(fireBolt.attackType).toBe('ranged');
  });
});

// ---------------------------------------------------------------------------
// SpellSlots
// ---------------------------------------------------------------------------
describe('SpellSlots', () => {
  it('should define SpellSlots and UsedSpellSlots as Record<number, number>', () => {
    const slots: SpellSlots = { 1: 4, 2: 3, 3: 3, 4: 1 };
    const used: UsedSpellSlots = { 1: 2, 2: 1, 3: 0, 4: 0 };
    assertType<SpellSlots>(slots);
    assertType<UsedSpellSlots>(used);
    expect(slots[1]).toBe(4);
    expect(used[1]).toBe(2);
  });

  it('should define SpellSlot with level, total, and used', () => {
    const slot: SpellSlot = { level: 3, total: 3, used: 1 };
    assertType<SpellSlot>(slot);
    expect(slot.level).toBe(3);
    expect(slot.total).toBe(3);
    expect(slot.used).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// PactMagic
// ---------------------------------------------------------------------------
describe('PactMagic', () => {
  it('should define PactMagic interface with slotLevel, totalSlots, usedSlots, and mysticArcanum', () => {
    // Level 5 Warlock: 2 slots at 3rd level
    const pactMagic: PactMagic = {
      slotLevel: 3,
      totalSlots: 2,
      usedSlots: 1,
      mysticArcanum: {},
    };
    assertType<PactMagic>(pactMagic);
    expect(pactMagic.slotLevel).toBe(3);
    expect(pactMagic.totalSlots).toBe(2);
    expect(pactMagic.usedSlots).toBe(1);

    // Level 17 Warlock with Mystic Arcanum
    const highLevelPact: PactMagic = {
      slotLevel: 5,
      totalSlots: 4,
      usedSlots: 0,
      mysticArcanum: {
        6: { spellId: 'circle-of-death', used: false },
        7: { spellId: 'finger-of-death', used: true },
        8: { spellId: 'dominate-monster', used: false },
        9: { spellId: 'power-word-kill', used: false },
      },
    };
    assertType<PactMagic>(highLevelPact);
    expect(highLevelPact.mysticArcanum[7]?.used).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SpellcastingData
// ---------------------------------------------------------------------------
describe('SpellcastingData', () => {
  it('should define SpellcastingData supporting all three spellcasting systems (prepared, known, pact)', () => {
    // Prepared caster (Wizard)
    const wizard: SpellcastingData = {
      type: 'prepared',
      ability: 'intelligence',
      cantrips: ['fire-bolt', 'mage-hand', 'prestidigitation'],
      knownSpells: ['fireball', 'shield', 'magic-missile', 'detect-magic'],
      preparedSpells: ['fireball', 'shield'],
      spellSlots: { 1: 4, 2: 3, 3: 2 },
      usedSpellSlots: { 1: 1, 2: 0, 3: 0 },
      ritualCasting: true,
    };
    assertType<SpellcastingData>(wizard);
    expect(wizard.type).toBe('prepared');

    // Known caster (Sorcerer)
    const sorcerer: SpellcastingData = {
      type: 'known',
      ability: 'charisma',
      cantrips: ['fire-bolt', 'ray-of-frost'],
      knownSpells: ['shield', 'magic-missile'],
      preparedSpells: [],
      spellSlots: { 1: 4, 2: 2 },
      usedSpellSlots: { 1: 0, 2: 0 },
      ritualCasting: false,
    };
    assertType<SpellcastingData>(sorcerer);
    expect(sorcerer.type).toBe('known');

    // Pact caster (Warlock)
    const warlock: SpellcastingData = {
      type: 'pact-magic',
      ability: 'charisma',
      cantrips: ['eldritch-blast'],
      knownSpells: ['hex', 'armor-of-agathys'],
      preparedSpells: [],
      spellSlots: {},
      usedSpellSlots: {},
      pactMagic: {
        slotLevel: 3,
        totalSlots: 2,
        usedSlots: 0,
        mysticArcanum: {},
      },
      ritualCasting: false,
    };
    assertType<SpellcastingData>(warlock);
    expect(warlock.type).toBe('pact-magic');
    expect(warlock.pactMagic).toBeDefined();
  });

  it('should define SpellcastingData.activeConcentration as optional string for tracking concentrated spell', () => {
    const data: SpellcastingData = {
      type: 'prepared',
      ability: 'wisdom',
      cantrips: ['sacred-flame'],
      knownSpells: ['bless', 'cure-wounds'],
      preparedSpells: ['bless', 'cure-wounds'],
      spellSlots: { 1: 2 },
      usedSpellSlots: { 1: 1 },
      activeConcentration: 'bless',
      ritualCasting: true,
    };
    assertType<SpellcastingData>(data);
    expect(data.activeConcentration).toBe('bless');

    // Without concentration
    const noConc: SpellcastingData = {
      type: 'prepared',
      ability: 'wisdom',
      cantrips: [],
      knownSpells: [],
      preparedSpells: [],
      spellSlots: {},
      usedSpellSlots: {},
      ritualCasting: false,
    };
    expect(noConc.activeConcentration).toBeUndefined();
  });

  it('should accept all SpellcastingType values', () => {
    const types: SpellcastingType[] = ['prepared', 'known', 'pact-magic'];
    expect(types).toHaveLength(3);
    types.forEach((t) => assertType<SpellcastingType>(t));
  });
});

// ---------------------------------------------------------------------------
// SpellSelection
// ---------------------------------------------------------------------------
describe('SpellSelection', () => {
  it('should define SpellSelection with selectedCantrips, selectedSpells, preparedSpells', () => {
    const selection: SpellSelection = {
      selectedCantrips: ['fire-bolt', 'mage-hand'],
      selectedSpells: ['shield', 'magic-missile', 'detect-magic'],
      preparedSpells: ['shield', 'magic-missile'],
    };
    assertType<SpellSelection>(selection);
    expect(selection.selectedCantrips).toHaveLength(2);
    expect(selection.selectedSpells).toHaveLength(3);
    expect(selection.preparedSpells).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// KnownSpell
// ---------------------------------------------------------------------------
describe('KnownSpell', () => {
  it('should define KnownSpell with spellId, prepared, and source', () => {
    const classSpell: KnownSpell = {
      spellId: 'fireball',
      prepared: true,
      source: 'class',
    };
    assertType<KnownSpell>(classSpell);
    expect(classSpell.source).toBe('class');

    const raceSpell: KnownSpell = {
      spellId: 'hellish-rebuke',
      prepared: false,
      source: 'race',
    };
    assertType<KnownSpell>(raceSpell);
    expect(raceSpell.source).toBe('race');

    const featSpell: KnownSpell = {
      spellId: 'find-familiar',
      prepared: false,
      source: 'feat',
    };
    assertType<KnownSpell>(featSpell);

    const itemSpell: KnownSpell = {
      spellId: 'light',
      prepared: false,
      source: 'item',
    };
    assertType<KnownSpell>(itemSpell);
  });
});

// ---------------------------------------------------------------------------
// MULTICLASS_SPELL_SLOT_TABLE
// ---------------------------------------------------------------------------
describe('MULTICLASS_SPELL_SLOT_TABLE', () => {
  it('should define MULTICLASS_SPELL_SLOT_TABLE as 20-row lookup table (plus row 0)', () => {
    // 21 rows: index 0 (no spellcasting) through index 20
    expect(MULTICLASS_SPELL_SLOT_TABLE).toHaveLength(21);
  });

  it('should have 9 spell slot entries per row (levels 1-9)', () => {
    for (let i = 0; i <= 20; i++) {
      expect(MULTICLASS_SPELL_SLOT_TABLE[i]).toHaveLength(9);
    }
  });

  it('should have all zeros for combined caster level 0', () => {
    expect(MULTICLASS_SPELL_SLOT_TABLE[0]).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('should have correct slots for caster level 1', () => {
    // Level 1: 2 first-level slots
    expect(MULTICLASS_SPELL_SLOT_TABLE[1]?.[0]).toBe(2);
    expect(MULTICLASS_SPELL_SLOT_TABLE[1]?.[1]).toBe(0);
  });

  it('should have correct slots for caster level 5', () => {
    // Level 5: 4/3/2/0/0/0/0/0/0
    expect(MULTICLASS_SPELL_SLOT_TABLE[5]).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0]);
  });

  it('should have correct slots for caster level 20', () => {
    // Level 20: 4/3/3/3/3/2/2/1/1
    expect(MULTICLASS_SPELL_SLOT_TABLE[20]).toEqual([4, 3, 3, 3, 3, 2, 2, 1, 1]);
  });

  it('should grant 9th-level slots starting at caster level 17', () => {
    // No 9th level slots before level 17
    for (let i = 0; i < 17; i++) {
      expect(MULTICLASS_SPELL_SLOT_TABLE[i]?.[8]).toBe(0);
    }
    // 9th level slot at level 17+
    expect(MULTICLASS_SPELL_SLOT_TABLE[17]?.[8]).toBe(1);
    expect(MULTICLASS_SPELL_SLOT_TABLE[20]?.[8]).toBe(1);
  });
});
