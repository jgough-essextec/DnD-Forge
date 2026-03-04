/**
 * Tests for SRD Class Data (Story 3.2)
 */
import { describe, it, expect } from 'vitest';
import { CLASSES, getClassById, getClassIds } from '@/data/classes';

describe('CLASSES', () => {
  it('should export exactly 12 SRD classes', () => {
    expect(CLASSES).toHaveLength(12);
  });

  it('should have no duplicate class IDs', () => {
    const ids = CLASSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should contain all expected class IDs', () => {
    const expectedIds = [
      'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk',
      'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard',
    ];
    const actualIds = getClassIds();
    for (const id of expectedIds) {
      expect(actualIds).toContain(id);
    }
  });

  it('should have required fields for every class', () => {
    for (const cls of CLASSES) {
      expect(cls.id).toBeTruthy();
      expect(cls.name).toBeTruthy();
      expect(cls.description).toBeTruthy();
      expect(cls.hitDie).toBeGreaterThan(0);
      expect(cls.primaryAbility.length).toBeGreaterThan(0);
      expect(cls.proficiencies).toBeDefined();
      expect(cls.proficiencies.savingThrows).toHaveLength(2);
      expect(cls.proficiencies.skillChoices.choose).toBeGreaterThan(0);
      expect(cls.proficiencies.skillChoices.from.length).toBeGreaterThan(0);
      expect(cls.features).toBeDefined();
      expect(cls.subclassLevel).toBeGreaterThan(0);
      expect(cls.subclassName).toBeTruthy();
      expect(cls.asiLevels.length).toBeGreaterThan(0);
      expect(cls.startingEquipment.length).toBeGreaterThan(0);
    }
  });

  it('should have correct hit dice', () => {
    const hitDice: Record<string, number> = {
      barbarian: 12,
      bard: 8,
      cleric: 8,
      druid: 8,
      fighter: 10,
      monk: 8,
      paladin: 10,
      ranger: 10,
      rogue: 8,
      sorcerer: 6,
      warlock: 8,
      wizard: 6,
    };
    for (const [id, expected] of Object.entries(hitDice)) {
      const cls = getClassById(id);
      expect(cls).toBeDefined();
      expect(cls!.hitDie).toBe(expected);
    }
  });

  it('should have correct saving throws', () => {
    const saves: Record<string, [string, string]> = {
      barbarian: ['strength', 'constitution'],
      bard: ['dexterity', 'charisma'],
      cleric: ['wisdom', 'charisma'],
      druid: ['intelligence', 'wisdom'],
      fighter: ['strength', 'constitution'],
      monk: ['strength', 'dexterity'],
      paladin: ['wisdom', 'charisma'],
      ranger: ['strength', 'dexterity'],
      rogue: ['dexterity', 'intelligence'],
      sorcerer: ['constitution', 'charisma'],
      warlock: ['wisdom', 'charisma'],
      wizard: ['intelligence', 'wisdom'],
    };
    for (const [id, expected] of Object.entries(saves)) {
      const cls = getClassById(id);
      expect(cls).toBeDefined();
      expect(cls!.proficiencies.savingThrows).toEqual(expected);
    }
  });

  it('should have features at level 1 for every class', () => {
    for (const cls of CLASSES) {
      expect(cls.features[1]).toBeDefined();
      expect(cls.features[1].length).toBeGreaterThan(0);
    }
  });

  it('should have unique feature IDs within each class', () => {
    for (const cls of CLASSES) {
      const featureIds: string[] = [];
      for (const level of Object.keys(cls.features)) {
        for (const feat of cls.features[Number(level)]) {
          featureIds.push(feat.id);
        }
      }
      expect(new Set(featureIds).size).toBe(featureIds.length);
    }
  });
});

describe('Spellcasting classes', () => {
  const fullCasters = ['bard', 'cleric', 'druid', 'sorcerer', 'wizard'];
  const halfCasters = ['paladin', 'ranger'];
  const pactCasters = ['warlock'];
  const nonCasters = ['barbarian', 'fighter', 'monk', 'rogue'];

  it('should have spellcasting info for full casters with type "full"', () => {
    for (const id of fullCasters) {
      const cls = getClassById(id);
      expect(cls).toBeDefined();
      expect(cls!.spellcasting).toBeDefined();
      expect(cls!.spellcasting!.type).toBe('full');
    }
  });

  it('should have spellcasting info for half casters with type "half"', () => {
    for (const id of halfCasters) {
      const cls = getClassById(id);
      expect(cls).toBeDefined();
      expect(cls!.spellcasting).toBeDefined();
      expect(cls!.spellcasting!.type).toBe('half');
    }
  });

  it('should have spellcasting info for warlock with type "pact"', () => {
    for (const id of pactCasters) {
      const cls = getClassById(id);
      expect(cls).toBeDefined();
      expect(cls!.spellcasting).toBeDefined();
      expect(cls!.spellcasting!.type).toBe('pact');
    }
  });

  it('should NOT have spellcasting info for non-caster classes', () => {
    for (const id of nonCasters) {
      const cls = getClassById(id);
      expect(cls).toBeDefined();
      expect(cls!.spellcasting).toBeUndefined();
    }
  });

  it('should have 20-level cantripsKnown arrays for all casters', () => {
    const casters = [...fullCasters, ...halfCasters, ...pactCasters];
    for (const id of casters) {
      const cls = getClassById(id);
      expect(cls!.spellcasting!.cantripsKnown).toHaveLength(20);
    }
  });

  it('should have correct spellcasting abilities', () => {
    const abilities: Record<string, string> = {
      bard: 'charisma',
      cleric: 'wisdom',
      druid: 'wisdom',
      paladin: 'charisma',
      ranger: 'wisdom',
      sorcerer: 'charisma',
      warlock: 'charisma',
      wizard: 'intelligence',
    };
    for (const [id, expected] of Object.entries(abilities)) {
      const cls = getClassById(id);
      expect(cls!.spellcasting!.ability).toBe(expected);
    }
  });

  it('should have ritual casting for Bard, Cleric, Druid, Wizard but not others', () => {
    const ritualCasters = ['bard', 'cleric', 'druid', 'wizard'];
    const nonRitualCasters = ['paladin', 'ranger', 'sorcerer', 'warlock'];
    for (const id of ritualCasters) {
      expect(getClassById(id)!.spellcasting!.ritualCasting).toBe(true);
    }
    for (const id of nonRitualCasters) {
      expect(getClassById(id)!.spellcasting!.ritualCasting).toBe(false);
    }
  });
});

describe('Multiclass requirements', () => {
  it('should have multiclass requirements for every class', () => {
    for (const cls of CLASSES) {
      expect(cls.multiclassRequirements).toBeDefined();
      expect(cls.multiclassRequirements!.length).toBeGreaterThan(0);
    }
  });

  it('should require minimum 13 in the relevant ability', () => {
    for (const cls of CLASSES) {
      for (const req of cls.multiclassRequirements!) {
        expect(req.minimum).toBe(13);
      }
    }
  });
});

describe('ASI levels', () => {
  it('should have Fighter with 7 ASI levels (extra at 6 and 14)', () => {
    const fighter = getClassById('fighter');
    expect(fighter!.asiLevels).toHaveLength(7);
    expect(fighter!.asiLevels).toContain(6);
    expect(fighter!.asiLevels).toContain(14);
  });

  it('should have Rogue with 6 ASI levels (extra at 10)', () => {
    const rogue = getClassById('rogue');
    expect(rogue!.asiLevels).toHaveLength(6);
    expect(rogue!.asiLevels).toContain(10);
  });

  it('should have standard 5 ASI levels for other classes', () => {
    const standardClasses = ['barbarian', 'bard', 'cleric', 'druid', 'monk', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'];
    for (const id of standardClasses) {
      const cls = getClassById(id);
      expect(cls!.asiLevels).toHaveLength(5);
    }
  });
});

describe('getClassById', () => {
  it('should return a class for valid IDs', () => {
    expect(getClassById('barbarian')).toBeDefined();
    expect(getClassById('wizard')).toBeDefined();
  });

  it('should return undefined for invalid IDs', () => {
    expect(getClassById('artificer')).toBeUndefined();
    expect(getClassById('')).toBeUndefined();
  });
});

describe('Subclass levels', () => {
  it('should have Cleric with subclass at level 1', () => {
    expect(getClassById('cleric')!.subclassLevel).toBe(1);
  });

  it('should have Sorcerer with subclass at level 1', () => {
    expect(getClassById('sorcerer')!.subclassLevel).toBe(1);
  });

  it('should have Warlock with subclass at level 1', () => {
    expect(getClassById('warlock')!.subclassLevel).toBe(1);
  });

  it('should have Druid with subclass at level 2', () => {
    expect(getClassById('druid')!.subclassLevel).toBe(2);
  });

  it('should have Wizard with subclass at level 2', () => {
    expect(getClassById('wizard')!.subclassLevel).toBe(2);
  });

  it('should have Fighter/Barbarian/Bard/Monk/Paladin/Ranger/Rogue at level 3', () => {
    const level3 = ['barbarian', 'bard', 'fighter', 'monk', 'paladin', 'ranger', 'rogue'];
    for (const id of level3) {
      expect(getClassById(id)!.subclassLevel).toBe(3);
    }
  });
});
