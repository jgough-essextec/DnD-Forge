/**
 * Spellcasting Calculations Tests (Story 4.4)
 *
 * Unit tests covering spell save DC, spell attack bonus, spell slots
 * (single-class full/half/third, multiclass, pact magic), cantrips known,
 * spells known/prepared, and spell casting eligibility.
 */

import { describe, it, expect } from 'vitest';
import {
  getSpellSaveDC,
  getSpellAttackBonus,
  getSpellSlots,
  getMulticlassSpellSlots,
  getMulticlassCasterLevel,
  getCantripsKnown,
  getSpellsKnownOrPrepared,
  canCastSpell,
  getPactMagicSlots,
} from '../spellcasting';

// ===========================================================================
// getSpellSaveDC
// ===========================================================================

describe('getSpellSaveDC', () => {
  it('should return 8 + proficiency + INT mod for Wizard INT 16 L1', () => {
    // INT 16 = +3 mod, L1 proficiency = +2
    expect(getSpellSaveDC(3, 2)).toBe(13);
  });

  it('should return 8 + proficiency + WIS mod for Cleric WIS 18 L5', () => {
    // WIS 18 = +4 mod, L5 proficiency = +3
    expect(getSpellSaveDC(4, 3)).toBe(15);
  });

  it('should return 8 + proficiency + CHA mod for Bard CHA 16 L1', () => {
    // CHA 16 = +3 mod, L1 proficiency = +2
    expect(getSpellSaveDC(3, 2)).toBe(13);
  });

  it('should return DC 10 for minimum stats (mod 0, prof 2)', () => {
    expect(getSpellSaveDC(0, 2)).toBe(10);
  });

  it('should handle high-level Wizard with INT 20', () => {
    // INT 20 = +5, L17 proficiency = +6
    expect(getSpellSaveDC(5, 6)).toBe(19);
  });

  it('should handle negative ability modifier', () => {
    // INT 8 = -1 mod, L1 proficiency = +2
    expect(getSpellSaveDC(-1, 2)).toBe(9);
  });

  it('should return correct DC for Sorcerer CHA 14 L3', () => {
    // CHA 14 = +2, L3 prof = +2
    expect(getSpellSaveDC(2, 2)).toBe(12);
  });

  it('should return correct DC for Druid WIS 20 L9', () => {
    // WIS 20 = +5, L9 prof = +4
    expect(getSpellSaveDC(5, 4)).toBe(17);
  });
});

// ===========================================================================
// getSpellAttackBonus
// ===========================================================================

describe('getSpellAttackBonus', () => {
  it('should return proficiency + ability modifier', () => {
    expect(getSpellAttackBonus(3, 2)).toBe(5);
  });

  it('should return +5 for Wizard INT 16 L1', () => {
    // INT 16 = +3, prof +2
    expect(getSpellAttackBonus(3, 2)).toBe(5);
  });

  it('should return +7 for Cleric WIS 18 L5', () => {
    // WIS 18 = +4, prof +3
    expect(getSpellAttackBonus(4, 3)).toBe(7);
  });

  it('should return +11 for Wizard INT 20 L17', () => {
    // INT 20 = +5, prof +6
    expect(getSpellAttackBonus(5, 6)).toBe(11);
  });

  it('should handle negative ability modifier', () => {
    expect(getSpellAttackBonus(-1, 2)).toBe(1);
  });

  it('should handle zero ability modifier', () => {
    expect(getSpellAttackBonus(0, 2)).toBe(2);
  });
});

// ===========================================================================
// getSpellSlots -- Full Caster
// ===========================================================================

describe('getSpellSlots', () => {
  describe('full caster', () => {
    it('should return 2 first-level slots at level 1', () => {
      const slots = getSpellSlots('full', 1);
      expect(slots[1]).toBe(2);
      expect(slots[2]).toBeUndefined();
    });

    it('should return 3 first-level slots at level 2', () => {
      const slots = getSpellSlots('full', 2);
      expect(slots[1]).toBe(3);
    });

    it('should return correct slots at level 3 (4/2)', () => {
      const slots = getSpellSlots('full', 3);
      expect(slots[1]).toBe(4);
      expect(slots[2]).toBe(2);
    });

    it('should return correct slots at level 5 (4/3/2)', () => {
      const slots = getSpellSlots('full', 5);
      expect(slots[1]).toBe(4);
      expect(slots[2]).toBe(3);
      expect(slots[3]).toBe(2);
      expect(slots[4]).toBeUndefined();
    });

    it('should return correct slots at level 9 (4/3/3/3/1)', () => {
      const slots = getSpellSlots('full', 9);
      expect(slots[1]).toBe(4);
      expect(slots[2]).toBe(3);
      expect(slots[3]).toBe(3);
      expect(slots[4]).toBe(3);
      expect(slots[5]).toBe(1);
    });

    it('should return correct slots at level 20', () => {
      const slots = getSpellSlots('full', 20);
      expect(slots[1]).toBe(4);
      expect(slots[2]).toBe(3);
      expect(slots[3]).toBe(3);
      expect(slots[4]).toBe(3);
      expect(slots[5]).toBe(3);
      expect(slots[6]).toBe(2);
      expect(slots[7]).toBe(2);
      expect(slots[8]).toBe(1);
      expect(slots[9]).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // Half Caster
  // -------------------------------------------------------------------------
  describe('half caster', () => {
    it('should return no slots at level 1', () => {
      const slots = getSpellSlots('half', 1);
      expect(Object.keys(slots).length).toBe(0);
    });

    it('should return 2 first-level slots at level 2', () => {
      const slots = getSpellSlots('half', 2);
      expect(slots[1]).toBe(2);
    });

    it('should return 4/2 slots at level 5', () => {
      const slots = getSpellSlots('half', 5);
      expect(slots[1]).toBe(4);
      expect(slots[2]).toBe(2);
    });

    it('should return correct slots at level 9 (4/3/2)', () => {
      const slots = getSpellSlots('half', 9);
      expect(slots[1]).toBe(4);
      expect(slots[2]).toBe(3);
      expect(slots[3]).toBe(2);
    });

    it('should return correct slots at level 20 (4/3/3/3/2)', () => {
      const slots = getSpellSlots('half', 20);
      expect(slots[1]).toBe(4);
      expect(slots[2]).toBe(3);
      expect(slots[3]).toBe(3);
      expect(slots[4]).toBe(3);
      expect(slots[5]).toBe(2);
    });
  });

  // -------------------------------------------------------------------------
  // Third Caster
  // -------------------------------------------------------------------------
  describe('third caster', () => {
    it('should return no slots at level 1', () => {
      const slots = getSpellSlots('third', 1);
      expect(Object.keys(slots).length).toBe(0);
    });

    it('should return no slots at level 2', () => {
      const slots = getSpellSlots('third', 2);
      expect(Object.keys(slots).length).toBe(0);
    });

    it('should return 2 first-level slots at level 3', () => {
      const slots = getSpellSlots('third', 3);
      expect(slots[1]).toBe(2);
    });

    it('should return 4/2 slots at level 7', () => {
      const slots = getSpellSlots('third', 7);
      expect(slots[1]).toBe(4);
      expect(slots[2]).toBe(2);
    });

    it('should return correct slots at level 20 (4/3/3/1)', () => {
      const slots = getSpellSlots('third', 20);
      expect(slots[1]).toBe(4);
      expect(slots[2]).toBe(3);
      expect(slots[3]).toBe(3);
      expect(slots[4]).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // Pact Caster
  // -------------------------------------------------------------------------
  describe('pact caster (returns empty, use getPactMagicSlots)', () => {
    it('should return empty for pact caster at any level', () => {
      expect(Object.keys(getSpellSlots('pact', 1)).length).toBe(0);
      expect(Object.keys(getSpellSlots('pact', 10)).length).toBe(0);
      expect(Object.keys(getSpellSlots('pact', 20)).length).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Edge Cases
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    it('should return empty for level 0', () => {
      expect(Object.keys(getSpellSlots('full', 0)).length).toBe(0);
    });

    it('should return empty for level 21', () => {
      expect(Object.keys(getSpellSlots('full', 21)).length).toBe(0);
    });

    it('should return empty for negative level', () => {
      expect(Object.keys(getSpellSlots('full', -1)).length).toBe(0);
    });
  });
});

// ===========================================================================
// getMulticlassCasterLevel
// ===========================================================================

describe('getMulticlassCasterLevel', () => {
  it('should calculate full caster level correctly', () => {
    expect(getMulticlassCasterLevel([{ type: 'full', level: 5 }])).toBe(5);
  });

  it('should calculate half caster level as floor(level/2)', () => {
    expect(getMulticlassCasterLevel([{ type: 'half', level: 4 }])).toBe(2);
  });

  it('should calculate third caster level as floor(level/3)', () => {
    expect(getMulticlassCasterLevel([{ type: 'third', level: 3 }])).toBe(1);
  });

  it('should return 0 for Paladin level 1 (floor(1/2)=0)', () => {
    expect(getMulticlassCasterLevel([{ type: 'half', level: 1 }])).toBe(0);
  });

  it('should return 0 for Eldritch Knight level 2 (floor(2/3)=0)', () => {
    expect(getMulticlassCasterLevel([{ type: 'third', level: 2 }])).toBe(0);
  });

  it('should return 1 for Eldritch Knight level 3 (floor(3/3)=1)', () => {
    expect(getMulticlassCasterLevel([{ type: 'third', level: 3 }])).toBe(1);
  });

  it('should sum Cleric 3 + Wizard 5 = 8', () => {
    expect(getMulticlassCasterLevel([
      { type: 'full', level: 3 },
      { type: 'full', level: 5 },
    ])).toBe(8);
  });

  it('should sum Paladin 4 + Sorcerer 3 = 5', () => {
    // Paladin: floor(4/2) = 2, Sorcerer: 3, total = 5
    expect(getMulticlassCasterLevel([
      { type: 'half', level: 4 },
      { type: 'full', level: 3 },
    ])).toBe(5);
  });

  it('should sum Wizard 3 + Cleric 2 = 5', () => {
    expect(getMulticlassCasterLevel([
      { type: 'full', level: 3 },
      { type: 'full', level: 2 },
    ])).toBe(5);
  });
});

// ===========================================================================
// getMulticlassSpellSlots
// ===========================================================================

describe('getMulticlassSpellSlots', () => {
  it('should return correct slots for Cleric 3 / Wizard 5 (caster level 8)', () => {
    const slots = getMulticlassSpellSlots([
      { type: 'full', level: 3 },
      { type: 'full', level: 5 },
    ]);
    // Caster level 8: 4/3/3/2
    expect(slots[1]).toBe(4);
    expect(slots[2]).toBe(3);
    expect(slots[3]).toBe(3);
    expect(slots[4]).toBe(2);
    expect(slots[5]).toBeUndefined();
  });

  it('should return correct slots for Paladin 4 / Sorcerer 3 (caster level 5)', () => {
    const slots = getMulticlassSpellSlots([
      { type: 'half', level: 4 },
      { type: 'full', level: 3 },
    ]);
    // Paladin caster: floor(4/2) = 2, Sorcerer: 3, total = 5
    // Caster level 5: 4/3/2
    expect(slots[1]).toBe(4);
    expect(slots[2]).toBe(3);
    expect(slots[3]).toBe(2);
  });

  it('should return correct slots for Wizard 3 / Cleric 2 (caster level 5)', () => {
    const slots = getMulticlassSpellSlots([
      { type: 'full', level: 3 },
      { type: 'full', level: 2 },
    ]);
    // Caster level 5: 4/3/2
    expect(slots[1]).toBe(4);
    expect(slots[2]).toBe(3);
    expect(slots[3]).toBe(2);
  });

  it('should return empty for all level 1 half casters (combined 0)', () => {
    const slots = getMulticlassSpellSlots([
      { type: 'half', level: 1 },
    ]);
    expect(Object.keys(slots).length).toBe(0);
  });

  it('should return correct slots for Paladin 2 / Ranger 2 (caster level 2)', () => {
    // Paladin: floor(2/2) = 1, Ranger: floor(2/2) = 1, total = 2
    const slots = getMulticlassSpellSlots([
      { type: 'half', level: 2 },
      { type: 'half', level: 2 },
    ]);
    // Caster level 2: 3
    expect(slots[1]).toBe(3);
  });

  it('should return correct slots for triple class Cleric 2/Wizard 3/Paladin 4', () => {
    // Cleric: 2, Wizard: 3, Paladin: floor(4/2) = 2, total = 7
    const slots = getMulticlassSpellSlots([
      { type: 'full', level: 2 },
      { type: 'full', level: 3 },
      { type: 'half', level: 4 },
    ]);
    // Caster level 7: 4/3/3/1
    expect(slots[1]).toBe(4);
    expect(slots[2]).toBe(3);
    expect(slots[3]).toBe(3);
    expect(slots[4]).toBe(1);
  });

  it('should handle third caster in multiclass', () => {
    // Wizard 5 + Fighter(EK) 3: 5 + floor(3/3) = 6
    const slots = getMulticlassSpellSlots([
      { type: 'full', level: 5 },
      { type: 'third', level: 3 },
    ]);
    // Caster level 6: 4/3/3
    expect(slots[1]).toBe(4);
    expect(slots[2]).toBe(3);
    expect(slots[3]).toBe(3);
  });
});

// ===========================================================================
// getCantripsKnown
// ===========================================================================

describe('getCantripsKnown', () => {
  it('should return 3 cantrips for Wizard at level 1', () => {
    expect(getCantripsKnown('wizard', 1)).toBe(3);
  });

  it('should return 4 cantrips for Wizard at level 4', () => {
    expect(getCantripsKnown('wizard', 4)).toBe(4);
  });

  it('should return 5 cantrips for Wizard at level 10', () => {
    expect(getCantripsKnown('wizard', 10)).toBe(5);
  });

  it('should return 3 cantrips for Cleric at level 1', () => {
    expect(getCantripsKnown('cleric', 1)).toBe(3);
  });

  it('should return 5 cantrips for Cleric at level 10', () => {
    expect(getCantripsKnown('cleric', 10)).toBe(5);
  });

  it('should return 2 cantrips for Bard at level 1', () => {
    expect(getCantripsKnown('bard', 1)).toBe(2);
  });

  it('should return 4 cantrips for Sorcerer at level 1', () => {
    expect(getCantripsKnown('sorcerer', 1)).toBe(4);
  });

  it('should return 6 cantrips for Sorcerer at level 10', () => {
    expect(getCantripsKnown('sorcerer', 10)).toBe(6);
  });

  it('should return 2 cantrips for Warlock at level 1', () => {
    expect(getCantripsKnown('warlock', 1)).toBe(2);
  });

  it('should return 4 cantrips for Warlock at level 10', () => {
    expect(getCantripsKnown('warlock', 10)).toBe(4);
  });

  it('should return 2 cantrips for Druid at level 1', () => {
    expect(getCantripsKnown('druid', 1)).toBe(2);
  });

  it('should return 0 for non-spellcasting class (Barbarian)', () => {
    expect(getCantripsKnown('barbarian', 1)).toBe(0);
  });

  it('should return 0 for non-spellcasting class (Fighter)', () => {
    expect(getCantripsKnown('fighter', 5)).toBe(0);
  });

  it('should return 0 for non-spellcasting class (Rogue)', () => {
    expect(getCantripsKnown('rogue', 3)).toBe(0);
  });

  it('should return 0 for invalid classId', () => {
    expect(getCantripsKnown('invalid', 1)).toBe(0);
  });

  it('should return 0 for level 0', () => {
    expect(getCantripsKnown('wizard', 0)).toBe(0);
  });

  it('should return 0 for Paladin (half caster with 0 cantrips)', () => {
    expect(getCantripsKnown('paladin', 5)).toBe(0);
  });

  it('should return 0 for Ranger (half caster with 0 cantrips)', () => {
    expect(getCantripsKnown('ranger', 5)).toBe(0);
  });
});

// ===========================================================================
// getSpellsKnownOrPrepared
// ===========================================================================

describe('getSpellsKnownOrPrepared', () => {
  describe('prepared casters', () => {
    it('should return WIS mod + level for Cleric WIS 16 L4', () => {
      // WIS 16 = +3, level 4: 3 + 4 = 7
      expect(getSpellsKnownOrPrepared({
        classId: 'cleric',
        level: 4,
        abilityModifier: 3,
        preparedCaster: true,
      })).toBe(7);
    });

    it('should return INT mod + level for Wizard INT 18 L5', () => {
      // INT 18 = +4, level 5: 4 + 5 = 9
      expect(getSpellsKnownOrPrepared({
        classId: 'wizard',
        level: 5,
        abilityModifier: 4,
        preparedCaster: true,
      })).toBe(9);
    });

    it('should return minimum 1 for prepared caster with low ability', () => {
      // WIS 10 = +0, level 1: max(1, 0 + 1) = 1
      expect(getSpellsKnownOrPrepared({
        classId: 'cleric',
        level: 1,
        abilityModifier: 0,
        preparedCaster: true,
      })).toBe(1);
    });

    it('should return minimum 1 for prepared caster with negative ability', () => {
      // WIS 8 = -1, level 1: max(1, -1 + 1) = 1
      expect(getSpellsKnownOrPrepared({
        classId: 'cleric',
        level: 1,
        abilityModifier: -1,
        preparedCaster: true,
      })).toBe(1);
    });

    it('should return CHA mod + level for Paladin CHA 14 L5', () => {
      // CHA 14 = +2, level 5: 2 + 5 = 7
      expect(getSpellsKnownOrPrepared({
        classId: 'paladin',
        level: 5,
        abilityModifier: 2,
        preparedCaster: true,
      })).toBe(7);
    });

    it('should return WIS mod + level for Druid WIS 16 L3', () => {
      // WIS 16 = +3, level 3: 3 + 3 = 6
      expect(getSpellsKnownOrPrepared({
        classId: 'druid',
        level: 3,
        abilityModifier: 3,
        preparedCaster: true,
      })).toBe(6);
    });
  });

  describe('known casters', () => {
    it('should return fixed table value for Bard at level 1 (4 spells)', () => {
      expect(getSpellsKnownOrPrepared({
        classId: 'bard',
        level: 1,
        abilityModifier: 3,
        preparedCaster: false,
      })).toBe(4);
    });

    it('should return fixed table value for Bard at level 5 (8 spells)', () => {
      expect(getSpellsKnownOrPrepared({
        classId: 'bard',
        level: 5,
        abilityModifier: 3,
        preparedCaster: false,
      })).toBe(8);
    });

    it('should return fixed table value for Sorcerer at level 1 (2 spells)', () => {
      expect(getSpellsKnownOrPrepared({
        classId: 'sorcerer',
        level: 1,
        abilityModifier: 3,
        preparedCaster: false,
      })).toBe(2);
    });

    it('should return fixed table value for Sorcerer at level 5 (6 spells)', () => {
      expect(getSpellsKnownOrPrepared({
        classId: 'sorcerer',
        level: 5,
        abilityModifier: 3,
        preparedCaster: false,
      })).toBe(6);
    });

    it('should return fixed table value for Warlock at level 1 (2 spells)', () => {
      expect(getSpellsKnownOrPrepared({
        classId: 'warlock',
        level: 1,
        abilityModifier: 3,
        preparedCaster: false,
      })).toBe(2);
    });

    it('should return fixed table value for Ranger at level 2 (2 spells)', () => {
      expect(getSpellsKnownOrPrepared({
        classId: 'ranger',
        level: 2,
        abilityModifier: 2,
        preparedCaster: false,
      })).toBe(2);
    });

    it('should return 0 for Ranger at level 1 (no spells yet)', () => {
      expect(getSpellsKnownOrPrepared({
        classId: 'ranger',
        level: 1,
        abilityModifier: 2,
        preparedCaster: false,
      })).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should return 0 for level 0', () => {
      expect(getSpellsKnownOrPrepared({
        classId: 'wizard',
        level: 0,
        abilityModifier: 5,
        preparedCaster: true,
      })).toBe(0);
    });

    it('should return 0 for non-caster class used as known', () => {
      expect(getSpellsKnownOrPrepared({
        classId: 'fighter',
        level: 5,
        abilityModifier: 0,
        preparedCaster: false,
      })).toBe(0);
    });
  });
});

// ===========================================================================
// canCastSpell
// ===========================================================================

describe('canCastSpell', () => {
  it('should return true for cantrips (level 0) regardless of slots', () => {
    expect(canCastSpell(0, {})).toBe(true);
  });

  it('should return true when an exact-level slot is available', () => {
    expect(canCastSpell(1, { 1: 2 })).toBe(true);
  });

  it('should return true when a higher-level slot is available', () => {
    expect(canCastSpell(1, { 2: 1 })).toBe(true);
  });

  it('should return false when no slots are available at or above spell level', () => {
    expect(canCastSpell(3, { 1: 2, 2: 1 })).toBe(false);
  });

  it('should return false when all slots at spell level are expended (0)', () => {
    expect(canCastSpell(1, { 1: 0 })).toBe(false);
  });

  it('should return true when slot at level 9 is available for a level 9 spell', () => {
    expect(canCastSpell(9, { 9: 1 })).toBe(true);
  });

  it('should return false when no slots exist at all', () => {
    expect(canCastSpell(1, {})).toBe(false);
  });

  it('should return true for level 2 spell with only level 3 slots available', () => {
    expect(canCastSpell(2, { 3: 2 })).toBe(true);
  });
});

// ===========================================================================
// getPactMagicSlots
// ===========================================================================

describe('getPactMagicSlots', () => {
  it('should return 1 slot at level 1 for Warlock L1', () => {
    const result = getPactMagicSlots(1);
    expect(result.numSlots).toBe(1);
    expect(result.slotLevel).toBe(1);
  });

  it('should return 2 slots at level 1 for Warlock L2', () => {
    const result = getPactMagicSlots(2);
    expect(result.numSlots).toBe(2);
    expect(result.slotLevel).toBe(1);
  });

  it('should return 2 slots at level 2 for Warlock L3', () => {
    const result = getPactMagicSlots(3);
    expect(result.numSlots).toBe(2);
    expect(result.slotLevel).toBe(2);
  });

  it('should return 2 slots at level 3 for Warlock L5', () => {
    const result = getPactMagicSlots(5);
    expect(result.numSlots).toBe(2);
    expect(result.slotLevel).toBe(3);
  });

  it('should return 2 slots at level 4 for Warlock L7', () => {
    const result = getPactMagicSlots(7);
    expect(result.numSlots).toBe(2);
    expect(result.slotLevel).toBe(4);
  });

  it('should return 2 slots at level 5 for Warlock L9', () => {
    const result = getPactMagicSlots(9);
    expect(result.numSlots).toBe(2);
    expect(result.slotLevel).toBe(5);
  });

  it('should return 3 slots at level 5 for Warlock L11', () => {
    const result = getPactMagicSlots(11);
    expect(result.numSlots).toBe(3);
    expect(result.slotLevel).toBe(5);
  });

  it('should return 4 slots at level 5 for Warlock L17', () => {
    const result = getPactMagicSlots(17);
    expect(result.numSlots).toBe(4);
    expect(result.slotLevel).toBe(5);
  });

  it('should return 4 slots at level 5 for Warlock L20', () => {
    const result = getPactMagicSlots(20);
    expect(result.numSlots).toBe(4);
    expect(result.slotLevel).toBe(5);
  });

  it('should return 0 for invalid level 0', () => {
    const result = getPactMagicSlots(0);
    expect(result.numSlots).toBe(0);
    expect(result.slotLevel).toBe(0);
  });

  it('should return 0 for negative level', () => {
    const result = getPactMagicSlots(-1);
    expect(result.numSlots).toBe(0);
    expect(result.slotLevel).toBe(0);
  });

  it('should return 0 for level above 20', () => {
    const result = getPactMagicSlots(21);
    expect(result.numSlots).toBe(0);
    expect(result.slotLevel).toBe(0);
  });

  it('should have slot level 2 at Warlock L4', () => {
    const result = getPactMagicSlots(4);
    expect(result.slotLevel).toBe(2);
  });

  it('should have slot level 3 at Warlock L6', () => {
    const result = getPactMagicSlots(6);
    expect(result.slotLevel).toBe(3);
  });

  it('should have slot level 4 at Warlock L8', () => {
    const result = getPactMagicSlots(8);
    expect(result.slotLevel).toBe(4);
  });

  it('should have slot level 5 at Warlock L10', () => {
    const result = getPactMagicSlots(10);
    expect(result.slotLevel).toBe(5);
  });

  it('should have 3 slots at Warlock L14', () => {
    const result = getPactMagicSlots(14);
    expect(result.numSlots).toBe(3);
  });
});
