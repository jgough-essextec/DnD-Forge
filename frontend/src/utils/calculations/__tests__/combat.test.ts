/**
 * Combat Stat Calculations Tests (Story 4.3)
 *
 * Unit tests covering AC for every armor type, unarmored defense variants,
 * shield, Defense fighting style, Medium Armor Master, initiative, speed,
 * HP calculations, attack/damage bonuses, and proficiency bonus.
 */

import { describe, it, expect } from 'vitest';
import {
  getArmorClass,
  getInitiativeModifier,
  getSpeed,
  getMaxHitPoints,
  getAttackBonus,
  getDamageBonus,
  getProficiencyBonus,
  getAverageHPRoll,
} from '../combat';

// ===========================================================================
// getProficiencyBonus
// ===========================================================================

describe('getProficiencyBonus', () => {
  it('should return +2 for levels 1-4', () => {
    expect(getProficiencyBonus(1)).toBe(2);
    expect(getProficiencyBonus(2)).toBe(2);
    expect(getProficiencyBonus(3)).toBe(2);
    expect(getProficiencyBonus(4)).toBe(2);
  });

  it('should return +3 for levels 5-8', () => {
    expect(getProficiencyBonus(5)).toBe(3);
    expect(getProficiencyBonus(6)).toBe(3);
    expect(getProficiencyBonus(7)).toBe(3);
    expect(getProficiencyBonus(8)).toBe(3);
  });

  it('should return +4 for levels 9-12', () => {
    expect(getProficiencyBonus(9)).toBe(4);
    expect(getProficiencyBonus(12)).toBe(4);
  });

  it('should return +5 for levels 13-16', () => {
    expect(getProficiencyBonus(13)).toBe(5);
    expect(getProficiencyBonus(16)).toBe(5);
  });

  it('should return +6 for levels 17-20', () => {
    expect(getProficiencyBonus(17)).toBe(6);
    expect(getProficiencyBonus(20)).toBe(6);
  });

  it('should clamp below level 1 to +2', () => {
    expect(getProficiencyBonus(0)).toBe(2);
    expect(getProficiencyBonus(-1)).toBe(2);
  });

  it('should clamp above level 20 to +6', () => {
    expect(getProficiencyBonus(21)).toBe(6);
    expect(getProficiencyBonus(100)).toBe(6);
  });
});

// ===========================================================================
// getArmorClass -- Unarmored
// ===========================================================================

describe('getArmorClass', () => {
  describe('unarmored (no armor, no special formula)', () => {
    it('should return AC 10 + DEX mod for a standard unarmored character', () => {
      expect(getArmorClass({ dexModifier: 0 })).toBe(10);
    });

    it('should return AC 12 for unarmored with DEX +2', () => {
      expect(getArmorClass({ dexModifier: 2 })).toBe(12);
    });

    it('should return AC 8 for unarmored with DEX -2', () => {
      expect(getArmorClass({ dexModifier: -2 })).toBe(8);
    });

    it('should return AC 15 for unarmored with DEX +5', () => {
      expect(getArmorClass({ dexModifier: 5 })).toBe(15);
    });
  });

  // -------------------------------------------------------------------------
  // Barbarian Unarmored Defense
  // -------------------------------------------------------------------------
  describe('Barbarian Unarmored Defense (10 + DEX + CON)', () => {
    it('should return AC 10 + DEX + CON for barbarian unarmored', () => {
      expect(getArmorClass({
        dexModifier: 2,
        conModifier: 3,
        specialFormula: 'barbarian-unarmored',
      })).toBe(15); // 10 + 2 + 3
    });

    it('should return AC 12 for barbarian with DEX +1, CON +1', () => {
      expect(getArmorClass({
        dexModifier: 1,
        conModifier: 1,
        specialFormula: 'barbarian-unarmored',
      })).toBe(12);
    });

    it('should return AC 17 for barbarian with DEX +2, CON +5', () => {
      expect(getArmorClass({
        dexModifier: 2,
        conModifier: 5,
        specialFormula: 'barbarian-unarmored',
      })).toBe(17);
    });
  });

  // -------------------------------------------------------------------------
  // Monk Unarmored Defense
  // -------------------------------------------------------------------------
  describe('Monk Unarmored Defense (10 + DEX + WIS)', () => {
    it('should return AC 10 + DEX + WIS for monk unarmored', () => {
      expect(getArmorClass({
        dexModifier: 3,
        wisModifier: 2,
        specialFormula: 'monk-unarmored',
      })).toBe(15); // 10 + 3 + 2
    });

    it('should return AC 20 for monk with max DEX +5, WIS +5', () => {
      expect(getArmorClass({
        dexModifier: 5,
        wisModifier: 5,
        specialFormula: 'monk-unarmored',
      })).toBe(20);
    });
  });

  // -------------------------------------------------------------------------
  // Mage Armor
  // -------------------------------------------------------------------------
  describe('Mage Armor (13 + DEX)', () => {
    it('should return AC 13 + DEX for mage armor', () => {
      expect(getArmorClass({
        dexModifier: 2,
        specialFormula: 'mage-armor',
      })).toBe(15); // 13 + 2
    });

    it('should return AC 13 for mage armor with DEX +0', () => {
      expect(getArmorClass({
        dexModifier: 0,
        specialFormula: 'mage-armor',
      })).toBe(13);
    });

    it('should return AC 18 for mage armor with DEX +5', () => {
      expect(getArmorClass({
        dexModifier: 5,
        specialFormula: 'mage-armor',
      })).toBe(18);
    });
  });

  // -------------------------------------------------------------------------
  // Natural Armor
  // -------------------------------------------------------------------------
  describe('Natural Armor (13 + DEX)', () => {
    it('should return AC 13 + DEX for natural armor', () => {
      expect(getArmorClass({
        dexModifier: 1,
        specialFormula: 'natural-armor',
      })).toBe(14);
    });
  });

  // -------------------------------------------------------------------------
  // Draconic Resilience
  // -------------------------------------------------------------------------
  describe('Draconic Resilience (13 + DEX)', () => {
    it('should return AC 13 + DEX for draconic resilience', () => {
      expect(getArmorClass({
        dexModifier: 3,
        specialFormula: 'draconic-resilience',
      })).toBe(16);
    });
  });

  // -------------------------------------------------------------------------
  // Light Armor
  // -------------------------------------------------------------------------
  describe('light armor (base + full DEX)', () => {
    it('should return 11 + DEX for leather armor', () => {
      expect(getArmorClass({
        armor: { baseAC: 11, category: 'light', dexCap: null },
        dexModifier: 2,
      })).toBe(13);
    });

    it('should return 11 + DEX for padded armor', () => {
      expect(getArmorClass({
        armor: { baseAC: 11, category: 'light', dexCap: null },
        dexModifier: 4,
      })).toBe(15);
    });

    it('should return 12 + DEX for studded leather', () => {
      expect(getArmorClass({
        armor: { baseAC: 12, category: 'light', dexCap: null },
        dexModifier: 3,
      })).toBe(15);
    });

    it('should handle negative DEX mod with light armor', () => {
      expect(getArmorClass({
        armor: { baseAC: 11, category: 'light', dexCap: null },
        dexModifier: -1,
      })).toBe(10);
    });
  });

  // -------------------------------------------------------------------------
  // Medium Armor
  // -------------------------------------------------------------------------
  describe('medium armor (base + DEX capped at +2)', () => {
    it('should return 12 + 2 for hide armor with DEX +3 (capped)', () => {
      expect(getArmorClass({
        armor: { baseAC: 12, category: 'medium', dexCap: 2 },
        dexModifier: 3,
      })).toBe(14); // 12 + 2 (capped from +3)
    });

    it('should return 13 + 1 for chain shirt with DEX +1 (not capped)', () => {
      expect(getArmorClass({
        armor: { baseAC: 13, category: 'medium', dexCap: 2 },
        dexModifier: 1,
      })).toBe(14);
    });

    it('should return 14 + 2 for scale mail with DEX +5 (capped)', () => {
      expect(getArmorClass({
        armor: { baseAC: 14, category: 'medium', dexCap: 2 },
        dexModifier: 5,
      })).toBe(16);
    });

    it('should return 14 + 2 for breastplate with DEX +2 (at cap)', () => {
      expect(getArmorClass({
        armor: { baseAC: 14, category: 'medium', dexCap: 2 },
        dexModifier: 2,
      })).toBe(16);
    });

    it('should return 15 + 2 for half plate with DEX +4 (capped)', () => {
      expect(getArmorClass({
        armor: { baseAC: 15, category: 'medium', dexCap: 2 },
        dexModifier: 4,
      })).toBe(17);
    });

    it('should handle negative DEX mod with medium armor', () => {
      expect(getArmorClass({
        armor: { baseAC: 14, category: 'medium', dexCap: 2 },
        dexModifier: -1,
      })).toBe(13);
    });
  });

  // -------------------------------------------------------------------------
  // Medium Armor Master Feat
  // -------------------------------------------------------------------------
  describe('Medium Armor Master feat (cap raised to +3)', () => {
    it('should allow DEX +3 with medium armor when feat is active', () => {
      expect(getArmorClass({
        armor: { baseAC: 14, category: 'medium', dexCap: 2 },
        dexModifier: 3,
        mediumArmorMasterFeat: true,
      })).toBe(17); // 14 + 3
    });

    it('should still cap at +3 with DEX +5', () => {
      expect(getArmorClass({
        armor: { baseAC: 15, category: 'medium', dexCap: 2 },
        dexModifier: 5,
        mediumArmorMasterFeat: true,
      })).toBe(18); // 15 + 3
    });

    it('should not affect DEX +2 (already under cap)', () => {
      expect(getArmorClass({
        armor: { baseAC: 14, category: 'medium', dexCap: 2 },
        dexModifier: 2,
        mediumArmorMasterFeat: true,
      })).toBe(16); // 14 + 2
    });
  });

  // -------------------------------------------------------------------------
  // Heavy Armor
  // -------------------------------------------------------------------------
  describe('heavy armor (flat base AC, no DEX)', () => {
    it('should return 14 for ring mail regardless of DEX', () => {
      expect(getArmorClass({
        armor: { baseAC: 14, category: 'heavy', dexCap: 0 },
        dexModifier: 5,
      })).toBe(14);
    });

    it('should return 16 for chain mail regardless of DEX', () => {
      expect(getArmorClass({
        armor: { baseAC: 16, category: 'heavy', dexCap: 0 },
        dexModifier: 3,
      })).toBe(16);
    });

    it('should return 17 for splint regardless of negative DEX', () => {
      expect(getArmorClass({
        armor: { baseAC: 17, category: 'heavy', dexCap: 0 },
        dexModifier: -2,
      })).toBe(17);
    });

    it('should return 18 for plate armor', () => {
      expect(getArmorClass({
        armor: { baseAC: 18, category: 'heavy', dexCap: 0 },
        dexModifier: 1,
      })).toBe(18);
    });
  });

  // -------------------------------------------------------------------------
  // Shield
  // -------------------------------------------------------------------------
  describe('shield (+2 bonus)', () => {
    it('should add +2 for shield on top of unarmored AC', () => {
      expect(getArmorClass({
        dexModifier: 2,
        shield: true,
      })).toBe(14); // 10 + 2 + 2
    });

    it('should add +2 for shield on top of light armor', () => {
      expect(getArmorClass({
        armor: { baseAC: 12, category: 'light', dexCap: null },
        dexModifier: 3,
        shield: true,
      })).toBe(17); // 12 + 3 + 2
    });

    it('should add +2 for shield on top of heavy armor', () => {
      expect(getArmorClass({
        armor: { baseAC: 18, category: 'heavy', dexCap: 0 },
        dexModifier: 1,
        shield: true,
      })).toBe(20); // 18 + 2
    });

    it('should add +2 for shield on top of barbarian unarmored', () => {
      expect(getArmorClass({
        dexModifier: 2,
        conModifier: 2,
        specialFormula: 'barbarian-unarmored',
        shield: true,
      })).toBe(16); // 10 + 2 + 2 + 2
    });
  });

  // -------------------------------------------------------------------------
  // Defense Fighting Style
  // -------------------------------------------------------------------------
  describe('Defense fighting style (+1 when wearing armor)', () => {
    it('should add +1 when wearing light armor', () => {
      expect(getArmorClass({
        armor: { baseAC: 12, category: 'light', dexCap: null },
        dexModifier: 3,
        defenseFightingStyle: true,
      })).toBe(16); // 12 + 3 + 1
    });

    it('should add +1 when wearing heavy armor', () => {
      expect(getArmorClass({
        armor: { baseAC: 16, category: 'heavy', dexCap: 0 },
        dexModifier: 0,
        defenseFightingStyle: true,
      })).toBe(17); // 16 + 1
    });

    it('should NOT add +1 when unarmored (no armor)', () => {
      expect(getArmorClass({
        dexModifier: 3,
        defenseFightingStyle: true,
      })).toBe(13); // 10 + 3 (no +1)
    });

    it('should NOT add +1 with special formula and no armor', () => {
      expect(getArmorClass({
        dexModifier: 3,
        conModifier: 2,
        specialFormula: 'barbarian-unarmored',
        defenseFightingStyle: true,
      })).toBe(15); // 10 + 3 + 2 (no +1)
    });
  });

  // -------------------------------------------------------------------------
  // Other Modifiers
  // -------------------------------------------------------------------------
  describe('other modifiers', () => {
    it('should add otherModifiers to AC', () => {
      expect(getArmorClass({
        dexModifier: 2,
        otherModifiers: 1,
      })).toBe(13); // 10 + 2 + 1
    });

    it('should handle negative otherModifiers', () => {
      expect(getArmorClass({
        armor: { baseAC: 16, category: 'heavy', dexCap: 0 },
        dexModifier: 0,
        otherModifiers: -2,
      })).toBe(14);
    });
  });

  // -------------------------------------------------------------------------
  // Formula Selection (highest wins)
  // -------------------------------------------------------------------------
  describe('formula selection (highest base wins)', () => {
    it('should use armor AC when armor is higher than special formula', () => {
      // Chain mail (16) vs barbarian unarmored (10 + 1 + 1 = 12)
      expect(getArmorClass({
        armor: { baseAC: 16, category: 'heavy', dexCap: 0 },
        dexModifier: 1,
        conModifier: 1,
        specialFormula: 'barbarian-unarmored',
      })).toBe(16);
    });

    it('should use special formula when it is higher than armor', () => {
      // Leather (11 + 5 = 16) vs barbarian (10 + 5 + 5 = 20)
      expect(getArmorClass({
        armor: { baseAC: 11, category: 'light', dexCap: null },
        dexModifier: 5,
        conModifier: 5,
        specialFormula: 'barbarian-unarmored',
      })).toBe(20);
    });
  });

  // -------------------------------------------------------------------------
  // Specific Scenario: L5 Fighter, Chain Mail + Shield = AC 18
  // -------------------------------------------------------------------------
  describe('specific scenarios', () => {
    it('should return AC 18 for L5 Fighter with Chain Mail + Shield', () => {
      expect(getArmorClass({
        armor: { baseAC: 16, category: 'heavy', dexCap: 0 },
        dexModifier: 1,
        shield: true,
      })).toBe(18); // 16 + 2
    });

    it('should return AC 19 for L5 Fighter with Chain Mail + Shield + Defense', () => {
      expect(getArmorClass({
        armor: { baseAC: 16, category: 'heavy', dexCap: 0 },
        dexModifier: 1,
        shield: true,
        defenseFightingStyle: true,
      })).toBe(19); // 16 + 2 + 1
    });

    it('should return AC 20 for Plate + Shield', () => {
      expect(getArmorClass({
        armor: { baseAC: 18, category: 'heavy', dexCap: 0 },
        dexModifier: 0,
        shield: true,
      })).toBe(20); // 18 + 2
    });

    it('should return AC 21 for Plate + Shield + Defense fighting style', () => {
      expect(getArmorClass({
        armor: { baseAC: 18, category: 'heavy', dexCap: 0 },
        dexModifier: 0,
        shield: true,
        defenseFightingStyle: true,
      })).toBe(21); // 18 + 2 + 1
    });

    it('should handle combined shield + defense + other modifiers', () => {
      expect(getArmorClass({
        armor: { baseAC: 16, category: 'heavy', dexCap: 0 },
        dexModifier: 1,
        shield: true,
        defenseFightingStyle: true,
        otherModifiers: 1,
      })).toBe(20); // 16 + 2 + 1 + 1
    });
  });
});

// ===========================================================================
// getInitiativeModifier
// ===========================================================================

describe('getInitiativeModifier', () => {
  it('should return just DEX mod with no bonus', () => {
    expect(getInitiativeModifier(3)).toBe(3);
  });

  it('should return DEX mod + bonus', () => {
    expect(getInitiativeModifier(2, 5)).toBe(7); // e.g. Alert feat
  });

  it('should handle negative DEX mod', () => {
    expect(getInitiativeModifier(-1)).toBe(-1);
  });

  it('should handle negative DEX mod with bonus', () => {
    expect(getInitiativeModifier(-1, 5)).toBe(4);
  });

  it('should return 0 when DEX and bonus cancel out', () => {
    expect(getInitiativeModifier(-3, 3)).toBe(0);
  });

  it('should handle Jack of All Trades bonus (half proficiency)', () => {
    // Bard level 5: prof +3, half = +1
    expect(getInitiativeModifier(2, 1)).toBe(3);
  });
});

// ===========================================================================
// getSpeed
// ===========================================================================

describe('getSpeed', () => {
  it('should return base speed with no modifiers', () => {
    expect(getSpeed(30)).toBe(30);
  });

  it('should return base speed with empty modifier array', () => {
    expect(getSpeed(30, [])).toBe(30);
  });

  it('should add positive modifiers', () => {
    expect(getSpeed(30, [10])).toBe(40); // e.g. Barbarian Fast Movement
  });

  it('should handle heavy armor speed penalty', () => {
    expect(getSpeed(30, [-10])).toBe(20);
  });

  it('should handle multiple modifiers', () => {
    expect(getSpeed(30, [10, -10, 10])).toBe(40);
  });

  it('should never go below 0', () => {
    expect(getSpeed(25, [-30])).toBe(0);
  });

  it('should handle races with 25ft base speed', () => {
    expect(getSpeed(25)).toBe(25);
  });

  it('should handle races with 35ft base speed', () => {
    expect(getSpeed(35)).toBe(35);
  });

  it('should correctly apply Mobile feat (+10ft)', () => {
    expect(getSpeed(30, [10])).toBe(40);
  });

  it('should correctly apply multiple class bonuses', () => {
    // Monk unarmored movement (+10) + Mobile feat (+10)
    expect(getSpeed(30, [10, 10])).toBe(50);
  });
});

// ===========================================================================
// getAverageHPRoll
// ===========================================================================

describe('getAverageHPRoll', () => {
  it('should return 4 for d6', () => {
    expect(getAverageHPRoll(6)).toBe(4);
  });

  it('should return 5 for d8', () => {
    expect(getAverageHPRoll(8)).toBe(5);
  });

  it('should return 6 for d10', () => {
    expect(getAverageHPRoll(10)).toBe(6);
  });

  it('should return 7 for d12', () => {
    expect(getAverageHPRoll(12)).toBe(7);
  });
});

// ===========================================================================
// getMaxHitPoints
// ===========================================================================

describe('getMaxHitPoints', () => {
  describe('Level 1 (max die + CON)', () => {
    it('should return max die + CON for L1 Fighter (d10, CON +2)', () => {
      expect(getMaxHitPoints({
        hitDie: 10,
        level: 1,
        conModifier: 2,
      })).toBe(12); // 10 + 2
    });

    it('should return max die + CON for L1 Wizard (d6, CON +1)', () => {
      expect(getMaxHitPoints({
        hitDie: 6,
        level: 1,
        conModifier: 1,
      })).toBe(7); // 6 + 1
    });

    it('should return max die + CON for L1 Barbarian (d12, CON +3)', () => {
      expect(getMaxHitPoints({
        hitDie: 12,
        level: 1,
        conModifier: 3,
      })).toBe(15); // 12 + 3
    });

    it('should return minimum 1 HP for L1 with very negative CON', () => {
      expect(getMaxHitPoints({
        hitDie: 6,
        level: 1,
        conModifier: -10,
      })).toBe(1);
    });
  });

  describe('multi-level using average rolls', () => {
    it('should calculate L5 Fighter d10+CON correctly using average', () => {
      // L1: 10 + 2 = 12
      // L2-5: (6 + 2) * 4 = 32
      // Total: 44
      expect(getMaxHitPoints({
        hitDie: 10,
        level: 5,
        conModifier: 2,
      })).toBe(44);
    });

    it('should calculate L3 Wizard d6+CON correctly using average', () => {
      // L1: 6 + 1 = 7
      // L2-3: (4 + 1) * 2 = 10
      // Total: 17
      expect(getMaxHitPoints({
        hitDie: 6,
        level: 3,
        conModifier: 1,
      })).toBe(17);
    });

    it('should calculate L5 Wizard d6+CON correctly using average', () => {
      // L1: 6 + 2 = 8
      // L2-5: (4 + 2) * 4 = 24
      // Total: 32
      expect(getMaxHitPoints({
        hitDie: 6,
        level: 5,
        conModifier: 2,
      })).toBe(32);
    });

    it('should calculate L10 Barbarian d12+CON correctly using average', () => {
      // L1: 12 + 3 = 15
      // L2-10: (7 + 3) * 9 = 90
      // Total: 105
      expect(getMaxHitPoints({
        hitDie: 12,
        level: 10,
        conModifier: 3,
      })).toBe(105);
    });
  });

  describe('with rolled HP values', () => {
    it('should use provided rolls for levels 2+', () => {
      // L1: 10 + 2 = 12
      // L2: 8 + 2 = 10
      // L3: 7 + 2 = 9
      // Total: 31
      expect(getMaxHitPoints({
        hitDie: 10,
        level: 3,
        conModifier: 2,
        hpRolls: [8, 7],
      })).toBe(31);
    });

    it('should fall back to average when rolls are too short', () => {
      // L1: 10 + 2 = 12
      // L2: 8 + 2 = 10 (rolled)
      // L3: 6 + 2 = 8 (average, since no roll)
      // Total: 30
      expect(getMaxHitPoints({
        hitDie: 10,
        level: 3,
        conModifier: 2,
        hpRolls: [8],
      })).toBe(30);
    });

    it('should enforce minimum 1 HP per level even with bad rolls', () => {
      // L1: max(1, 6 + (-5)) = 1
      // L2: max(1, 1 + (-5)) = 1
      // Total: 2
      expect(getMaxHitPoints({
        hitDie: 6,
        level: 2,
        conModifier: -5,
        hpRolls: [1],
      })).toBe(2);
    });
  });

  describe('with Tough feat', () => {
    it('should add +2 HP per level with Tough feat', () => {
      // L1: 10 + 2 + 2 = 14
      // L2-5: (6 + 2 + 2) * 4 = 40
      // Total: 54
      expect(getMaxHitPoints({
        hitDie: 10,
        level: 5,
        conModifier: 2,
        toughFeat: true,
      })).toBe(54);
    });

    it('should add +2 HP per level for L1 with Tough feat', () => {
      // L1: 6 + 1 + 2 = 9
      expect(getMaxHitPoints({
        hitDie: 6,
        level: 1,
        conModifier: 1,
        toughFeat: true,
      })).toBe(9);
    });
  });

  describe('edge cases', () => {
    it('should return 1 for level 0 or below', () => {
      expect(getMaxHitPoints({
        hitDie: 10,
        level: 0,
        conModifier: 2,
      })).toBe(1);
    });

    it('should handle L1 with CON +0', () => {
      expect(getMaxHitPoints({
        hitDie: 8,
        level: 1,
        conModifier: 0,
      })).toBe(8);
    });

    it('should handle L20 Barbarian with high CON', () => {
      // L1: 12 + 5 = 17
      // L2-20: (7 + 5) * 19 = 228
      // Total: 245
      expect(getMaxHitPoints({
        hitDie: 12,
        level: 20,
        conModifier: 5,
      })).toBe(245);
    });
  });
});

// ===========================================================================
// getAttackBonus
// ===========================================================================

describe('getAttackBonus', () => {
  it('should return ability + proficiency for a proficient attack', () => {
    expect(getAttackBonus(3, 2)).toBe(5);
  });

  it('should return ability + 0 for a non-proficient attack', () => {
    expect(getAttackBonus(3, 0)).toBe(3);
  });

  it('should include bonus (e.g. magic weapon)', () => {
    expect(getAttackBonus(3, 2, 1)).toBe(6);
  });

  it('should handle Archery fighting style (+2 bonus)', () => {
    expect(getAttackBonus(4, 3, 2)).toBe(9);
  });

  it('should handle negative ability modifier', () => {
    expect(getAttackBonus(-1, 2)).toBe(1);
  });

  it('should handle finesse weapon using DEX as ability modifier', () => {
    // STR +1, DEX +4 -- finesse uses higher (DEX +4)
    expect(getAttackBonus(4, 2)).toBe(6);
  });

  it('should handle L5 character with +3 proficiency', () => {
    expect(getAttackBonus(3, 3)).toBe(6);
  });

  it('should handle combined magic weapon + fighting style', () => {
    expect(getAttackBonus(4, 3, 3)).toBe(10); // +1 weapon + archery +2
  });
});

// ===========================================================================
// getDamageBonus
// ===========================================================================

describe('getDamageBonus', () => {
  it('should return just ability modifier with no bonus', () => {
    expect(getDamageBonus(3)).toBe(3);
  });

  it('should include bonus (e.g. magic weapon or Dueling)', () => {
    expect(getDamageBonus(3, 2)).toBe(5);
  });

  it('should handle negative ability modifier', () => {
    expect(getDamageBonus(-1)).toBe(-1);
  });

  it('should handle Dueling fighting style (+2 damage)', () => {
    expect(getDamageBonus(3, 2)).toBe(5);
  });

  it('should handle zero bonus', () => {
    expect(getDamageBonus(4, 0)).toBe(4);
  });

  it('should handle zero ability modifier', () => {
    expect(getDamageBonus(0)).toBe(0);
  });
});
