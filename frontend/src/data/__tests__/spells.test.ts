/**
 * Tests for SRD Spell Data (Story 3.3)
 */
import { describe, it, expect } from 'vitest';
import {
  SPELLS,
  getSpellById,
  getSpellsByLevel,
  getSpellsByClass,
  getCantrips,
} from '@/data/spells';
import { SPELL_SCHOOLS } from '@/types/spell';
import type { SpellSchool } from '@/types/spell';

// ---------------------------------------------------------------------------
// Valid class IDs (the 12 SRD classes)
// ---------------------------------------------------------------------------

const VALID_CLASS_IDS = [
  'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk',
  'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard',
];

// ---------------------------------------------------------------------------
// Spell Collection
// ---------------------------------------------------------------------------

describe('SPELLS', () => {
  it('should export the correct total number of spells', () => {
    // 27 cantrips + 28 level 1 + 19 level 2 + 14 level 3 = 88
    expect(SPELLS.length).toBe(88);
  });

  it('should have no duplicate spell IDs', () => {
    const ids = SPELLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have no duplicate spell names', () => {
    const names = SPELLS.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('should only contain spells of levels 0-3', () => {
    for (const spell of SPELLS) {
      expect([0, 1, 2, 3]).toContain(spell.level);
    }
  });

  it('should have all 8 spell schools represented', () => {
    const schools = new Set(SPELLS.map((s) => s.school));
    for (const school of SPELL_SCHOOLS) {
      expect(schools.has(school as SpellSchool)).toBe(true);
    }
  });

  it('should have every spell with at least one class', () => {
    for (const spell of SPELLS) {
      expect(spell.classes.length).toBeGreaterThan(0);
    }
  });

  it('should only reference valid class IDs in spell class lists', () => {
    for (const spell of SPELLS) {
      for (const cls of spell.classes) {
        expect(VALID_CLASS_IDS).toContain(cls);
      }
    }
  });

  it('should have class lists in alphabetical order', () => {
    for (const spell of SPELLS) {
      const sorted = [...spell.classes].sort();
      expect(spell.classes).toEqual(sorted);
    }
  });

  it('should have concentration flag match duration type', () => {
    for (const spell of SPELLS) {
      if (spell.duration.type === 'concentration') {
        expect(spell.concentration).toBe(true);
      }
      if (spell.concentration) {
        expect(spell.duration.type).toBe('concentration');
      }
    }
  });

  it('should have every spell with a non-empty description', () => {
    for (const spell of SPELLS) {
      expect(spell.description.length).toBeGreaterThan(10);
    }
  });

  it('should have every spell with a non-empty name', () => {
    for (const spell of SPELLS) {
      expect(spell.name.length).toBeGreaterThan(0);
    }
  });

  it('should have spell IDs as lowercase kebab-case', () => {
    for (const spell of SPELLS) {
      expect(spell.id).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });
});

// ---------------------------------------------------------------------------
// Cantrips (Level 0)
// ---------------------------------------------------------------------------

describe('Cantrips', () => {
  it('should have 27 cantrips', () => {
    expect(getCantrips().length).toBe(27);
  });

  it('should all be level 0', () => {
    for (const cantrip of getCantrips()) {
      expect(cantrip.level).toBe(0);
    }
  });

  it('should include Eldritch Blast as warlock-only cantrip', () => {
    const eb = getSpellById('eldritch-blast');
    expect(eb).toBeDefined();
    expect(eb!.level).toBe(0);
    expect(eb!.classes).toEqual(['warlock']);
    expect(eb!.damage).toBeDefined();
    expect(eb!.damage!.type).toBe('force');
  });

  it('should include Fire Bolt with 1d10 fire damage', () => {
    const fb = getSpellById('fire-bolt');
    expect(fb).toBeDefined();
    expect(fb!.damage).toBeDefined();
    expect(fb!.damage!.count).toBe(1);
    expect(fb!.damage!.die).toBe('d10');
    expect(fb!.damage!.type).toBe('fire');
    expect(fb!.attackType).toBe('ranged');
  });

  it('should include Guidance as cleric/druid concentration cantrip', () => {
    const g = getSpellById('guidance');
    expect(g).toBeDefined();
    expect(g!.concentration).toBe(true);
    expect(g!.classes).toContain('cleric');
    expect(g!.classes).toContain('druid');
  });

  it('should include Vicious Mockery as bard-only cantrip', () => {
    const vm = getSpellById('vicious-mockery');
    expect(vm).toBeDefined();
    expect(vm!.classes).toEqual(['bard']);
    expect(vm!.damage!.type).toBe('psychic');
    expect(vm!.savingThrow).toBe('wisdom');
  });
});

// ---------------------------------------------------------------------------
// Level 1 Spells
// ---------------------------------------------------------------------------

describe('Level 1 Spells', () => {
  it('should have 28 level 1 spells', () => {
    expect(getSpellsByLevel(1).length).toBe(28);
  });

  it('should include Shield as a reaction spell', () => {
    const shield = getSpellById('shield');
    expect(shield).toBeDefined();
    expect(shield!.castingTime.unit).toBe('reaction');
    expect(shield!.castingTime.reactionTrigger).toBeDefined();
    expect(shield!.level).toBe(1);
  });

  it('should include Magic Missile with force damage', () => {
    const mm = getSpellById('magic-missile');
    expect(mm).toBeDefined();
    expect(mm!.damage).toBeDefined();
    expect(mm!.damage!.type).toBe('force');
    expect(mm!.classes).toContain('wizard');
  });

  it('should include Find Familiar as a ritual spell', () => {
    const ff = getSpellById('find-familiar');
    expect(ff).toBeDefined();
    expect(ff!.ritual).toBe(true);
    expect(ff!.castingTime.value).toBe(1);
    expect(ff!.castingTime.unit).toBe('hour');
  });

  it('should include Detect Magic as both ritual and concentration', () => {
    const dm = getSpellById('detect-magic');
    expect(dm).toBeDefined();
    expect(dm!.ritual).toBe(true);
    expect(dm!.concentration).toBe(true);
  });

  it('should include Cure Wounds available to healing classes', () => {
    const cw = getSpellById('cure-wounds');
    expect(cw).toBeDefined();
    expect(cw!.classes).toContain('cleric');
    expect(cw!.classes).toContain('druid');
    expect(cw!.classes).toContain('bard');
    expect(cw!.classes).toContain('paladin');
    expect(cw!.classes).toContain('ranger');
  });

  it('should include Hex as warlock-only bonus action spell', () => {
    const hex = getSpellById('hex');
    expect(hex).toBeDefined();
    expect(hex!.classes).toEqual(['warlock']);
    expect(hex!.castingTime.unit).toBe('bonus-action');
    expect(hex!.concentration).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Level 2 Spells
// ---------------------------------------------------------------------------

describe('Level 2 Spells', () => {
  it('should have 19 level 2 spells', () => {
    expect(getSpellsByLevel(2).length).toBe(19);
  });

  it('should include Misty Step as a bonus action teleport', () => {
    const ms = getSpellById('misty-step');
    expect(ms).toBeDefined();
    expect(ms!.castingTime.unit).toBe('bonus-action');
    expect(ms!.concentration).toBe(false);
    expect(ms!.school).toBe('conjuration');
  });

  it('should include Spiritual Weapon as non-concentration', () => {
    const sw = getSpellById('spiritual-weapon');
    expect(sw).toBeDefined();
    expect(sw!.concentration).toBe(false);
    expect(sw!.classes).toEqual(['cleric']);
  });

  it('should include Hold Person as concentration enchantment', () => {
    const hp = getSpellById('hold-person');
    expect(hp).toBeDefined();
    expect(hp!.school).toBe('enchantment');
    expect(hp!.concentration).toBe(true);
    expect(hp!.savingThrow).toBe('wisdom');
  });

  it('should include Silence as a ritual spell', () => {
    const s = getSpellById('silence');
    expect(s).toBeDefined();
    expect(s!.ritual).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Level 3 Spells
// ---------------------------------------------------------------------------

describe('Level 3 Spells', () => {
  it('should have 14 level 3 spells', () => {
    expect(getSpellsByLevel(3).length).toBe(14);
  });

  it('should include Fireball with 8d6 fire damage', () => {
    const fb = getSpellById('fireball');
    expect(fb).toBeDefined();
    expect(fb!.damage).toBeDefined();
    expect(fb!.damage!.count).toBe(8);
    expect(fb!.damage!.die).toBe('d6');
    expect(fb!.damage!.type).toBe('fire');
    expect(fb!.savingThrow).toBe('dexterity');
  });

  it('should include Counterspell as a reaction spell', () => {
    const cs = getSpellById('counterspell');
    expect(cs).toBeDefined();
    expect(cs!.castingTime.unit).toBe('reaction');
    expect(cs!.castingTime.reactionTrigger).toBeDefined();
  });

  it('should include Revivify with 300 gp consumed material cost', () => {
    const r = getSpellById('revivify');
    expect(r).toBeDefined();
    expect(r!.components.materialCost).toEqual({ amount: 300, unit: 'gp' });
    expect(r!.components.materialConsumed).toBe(true);
  });

  it('should include Haste as concentration transmutation', () => {
    const h = getSpellById('haste');
    expect(h).toBeDefined();
    expect(h!.school).toBe('transmutation');
    expect(h!.concentration).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

describe('getSpellById', () => {
  it('should return the correct spell for a valid ID', () => {
    const spell = getSpellById('fireball');
    expect(spell).toBeDefined();
    expect(spell!.name).toBe('Fireball');
  });

  it('should return undefined for a non-existent ID', () => {
    expect(getSpellById('wish')).toBeUndefined();
  });
});

describe('getSpellsByLevel', () => {
  it('should return only spells of the requested level', () => {
    const level2 = getSpellsByLevel(2);
    for (const spell of level2) {
      expect(spell.level).toBe(2);
    }
  });

  it('should return an empty array for levels with no spells', () => {
    expect(getSpellsByLevel(9).length).toBe(0);
  });
});

describe('getSpellsByClass', () => {
  it('should return spells available to wizard', () => {
    const wizardSpells = getSpellsByClass('wizard');
    expect(wizardSpells.length).toBeGreaterThan(10);
    for (const spell of wizardSpells) {
      expect(spell.classes).toContain('wizard');
    }
  });

  it('should return spells available to cleric', () => {
    const clericSpells = getSpellsByClass('cleric');
    expect(clericSpells.length).toBeGreaterThan(5);
    for (const spell of clericSpells) {
      expect(spell.classes).toContain('cleric');
    }
  });

  it('should return an empty array for non-caster classes', () => {
    expect(getSpellsByClass('barbarian').length).toBe(0);
  });

  it('should return an empty array for invalid class', () => {
    expect(getSpellsByClass('artificer').length).toBe(0);
  });
});

describe('getCantrips', () => {
  it('should return the same spells as getSpellsByLevel(0)', () => {
    expect(getCantrips()).toEqual(getSpellsByLevel(0));
  });
});

// ---------------------------------------------------------------------------
// Cross-cutting checks
// ---------------------------------------------------------------------------

describe('Spell data integrity', () => {
  it('should have spells with valid casting time units', () => {
    const validUnits = ['action', 'bonus-action', 'reaction', 'minute', 'hour'];
    for (const spell of SPELLS) {
      expect(validUnits).toContain(spell.castingTime.unit);
    }
  });

  it('should have reaction spells with a trigger description', () => {
    for (const spell of SPELLS) {
      if (spell.castingTime.unit === 'reaction') {
        expect(spell.castingTime.reactionTrigger).toBeDefined();
        expect(spell.castingTime.reactionTrigger!.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have material components with a description when material is true', () => {
    for (const spell of SPELLS) {
      if (spell.components.material) {
        expect(spell.components.materialDescription).toBeDefined();
        expect(spell.components.materialDescription!.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have spells with damage include valid damage types', () => {
    const validDamageTypes = [
      'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
      'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder',
    ];
    for (const spell of SPELLS) {
      if (spell.damage) {
        expect(validDamageTypes).toContain(spell.damage.type);
      }
    }
  });

  it('should have spells with savingThrow use a valid ability', () => {
    const validAbilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    for (const spell of SPELLS) {
      if (spell.savingThrow) {
        expect(validAbilities).toContain(spell.savingThrow);
      }
    }
  });

  it('should have non-concentration timed durations with duration values', () => {
    for (const spell of SPELLS) {
      if (spell.duration.type === 'timed' || spell.duration.type === 'concentration') {
        expect(spell.duration.value).toBeDefined();
        expect(spell.duration.value).toBeGreaterThan(0);
        expect(spell.duration.unit).toBeDefined();
      }
    }
  });

  it('should cover spells for all main caster classes', () => {
    const casterClasses = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'];
    for (const cls of casterClasses) {
      const spells = getSpellsByClass(cls);
      expect(spells.length).toBeGreaterThan(3);
    }
  });

  it('should cover spells for half-caster classes', () => {
    const halfCasters = ['paladin', 'ranger'];
    for (const cls of halfCasters) {
      const spells = getSpellsByClass(cls);
      expect(spells.length).toBeGreaterThan(0);
    }
  });
});
