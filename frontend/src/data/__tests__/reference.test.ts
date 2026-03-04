/**
 * Tests for SRD Reference Tables & Constants (Story 3.7)
 */
import { describe, it, expect } from 'vitest';
import {
  CONDITIONS_DATA,
  SKILLS_DATA,
  LANGUAGES_DATA,
  PROFICIENCY_BONUS_BY_LEVEL,
  XP_THRESHOLDS,
  ABILITY_SCORE_MODIFIERS,
  POINT_BUY_COSTS,
  POINT_BUY_BUDGET,
  STANDARD_ARRAY,
  CARRY_CAPACITY_MULTIPLIER,
  PUSH_DRAG_LIFT_MULTIPLIER,
  CURRENCY_RATES,
  FULL_CASTER_SPELL_SLOTS,
  HALF_CASTER_SPELL_SLOTS,
  THIRD_CASTER_SPELL_SLOTS,
  PACT_MAGIC_SLOTS,
  STARTING_GOLD_BY_CLASS,
  getProficiencyBonus,
  getLevelForXP,
  getAbilityModifier,
  getConditionById,
  getSkillById,
  getLanguageById,
  getStandardLanguages,
  getExoticLanguages,
} from '@/data/reference';

// ---------------------------------------------------------------------------
// Conditions
// ---------------------------------------------------------------------------

describe('CONDITIONS_DATA', () => {
  it('should have all 15 conditions', () => {
    expect(CONDITIONS_DATA.length).toBe(15);
  });

  it('should have no duplicate condition IDs', () => {
    const ids = CONDITIONS_DATA.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have Exhaustion with 6 cumulative levels defined', () => {
    const exhaustion = getConditionById('exhaustion');
    expect(exhaustion).toBeDefined();
    expect(exhaustion!.hasLevels).toBe(true);
    expect(exhaustion!.mechanicalEffects).toHaveLength(6);
    expect(exhaustion!.mechanicalEffects[0]).toContain('Level 1');
    expect(exhaustion!.mechanicalEffects[5]).toContain('Level 6');
    expect(exhaustion!.mechanicalEffects[5]).toContain('Death');
  });

  it('should have all expected condition IDs', () => {
    const expectedIds = [
      'blinded', 'charmed', 'deafened', 'exhaustion', 'frightened',
      'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified',
      'poisoned', 'prone', 'restrained', 'stunned', 'unconscious',
    ];
    const actualIds = CONDITIONS_DATA.map((c) => c.id);
    for (const id of expectedIds) {
      expect(actualIds).toContain(id);
    }
  });

  it('should have Blinded with correct mechanical effects', () => {
    const blinded = getConditionById('blinded');
    expect(blinded).toBeDefined();
    expect(blinded!.mechanicalEffects.length).toBeGreaterThan(0);
    expect(blinded!.mechanicalEffects.some((e) => e.includes('Cannot see'))).toBe(true);
    expect(blinded!.mechanicalEffects.some((e) => e.includes('disadvantage'))).toBe(true);
  });

  it('should have CONDITION_EFFECTS as structured data (not just text) for each condition', () => {
    for (const condition of CONDITIONS_DATA) {
      expect(condition.name.length).toBeGreaterThan(0);
      expect(condition.description.length).toBeGreaterThan(0);
      expect(condition.mechanicalEffects.length).toBeGreaterThan(0);
      expect(typeof condition.hasLevels).toBe('boolean');
    }
  });

  it('should have only Exhaustion with hasLevels = true', () => {
    const withLevels = CONDITIONS_DATA.filter((c) => c.hasLevels);
    expect(withLevels).toHaveLength(1);
    expect(withLevels[0].id).toBe('exhaustion');
  });

  it('should return undefined for non-existent condition ID', () => {
    expect(getConditionById('confused')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

describe('SKILLS_DATA', () => {
  it('should have all 18 skills', () => {
    expect(SKILLS_DATA.length).toBe(18);
  });

  it('should have no duplicate skill IDs', () => {
    const ids = SKILLS_DATA.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have each skill mapped to a valid ability', () => {
    const validAbilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    for (const skill of SKILLS_DATA) {
      expect(validAbilities).toContain(skill.ability);
    }
  });

  it('should have Athletics mapped to Strength', () => {
    const athletics = getSkillById('athletics');
    expect(athletics).toBeDefined();
    expect(athletics!.ability).toBe('strength');
  });

  it('should have Arcana mapped to Intelligence', () => {
    const arcana = getSkillById('arcana');
    expect(arcana).toBeDefined();
    expect(arcana!.ability).toBe('intelligence');
  });

  it('should have Perception mapped to Wisdom', () => {
    const perception = getSkillById('perception');
    expect(perception).toBeDefined();
    expect(perception!.ability).toBe('wisdom');
  });

  it('should have Stealth mapped to Dexterity', () => {
    const stealth = getSkillById('stealth');
    expect(stealth).toBeDefined();
    expect(stealth!.ability).toBe('dexterity');
  });

  it('should have every skill with a non-empty description', () => {
    for (const skill of SKILLS_DATA) {
      expect(skill.description.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Languages
// ---------------------------------------------------------------------------

describe('LANGUAGES_DATA', () => {
  it('should have all 16 languages', () => {
    expect(LANGUAGES_DATA.length).toBe(16);
  });

  it('should have no duplicate language IDs', () => {
    const ids = LANGUAGES_DATA.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have 8 standard languages', () => {
    expect(getStandardLanguages()).toHaveLength(8);
  });

  it('should have 8 exotic languages', () => {
    expect(getExoticLanguages()).toHaveLength(8);
  });

  it('should have Common as a standard language', () => {
    const common = getLanguageById('common');
    expect(common).toBeDefined();
    expect(common!.type).toBe('standard');
    expect(common!.script).toBe('Common');
  });

  it('should have Deep Speech with no script', () => {
    const deepSpeech = getLanguageById('deep-speech');
    expect(deepSpeech).toBeDefined();
    expect(deepSpeech!.script).toBeNull();
  });

  it('should have Draconic as an exotic language', () => {
    const draconic = getLanguageById('draconic');
    expect(draconic).toBeDefined();
    expect(draconic!.type).toBe('exotic');
    expect(draconic!.script).toBe('Draconic');
  });
});

// ---------------------------------------------------------------------------
// Proficiency Bonus
// ---------------------------------------------------------------------------

describe('PROFICIENCY_BONUS_BY_LEVEL', () => {
  it('should have 20 entries (levels 1-20)', () => {
    expect(PROFICIENCY_BONUS_BY_LEVEL.length).toBe(20);
  });

  it('should have proficiency bonus +2 for levels 1-4', () => {
    expect(getProficiencyBonus(1)).toBe(2);
    expect(getProficiencyBonus(2)).toBe(2);
    expect(getProficiencyBonus(3)).toBe(2);
    expect(getProficiencyBonus(4)).toBe(2);
  });

  it('should have proficiency bonus +3 for levels 5-8', () => {
    expect(getProficiencyBonus(5)).toBe(3);
    expect(getProficiencyBonus(6)).toBe(3);
    expect(getProficiencyBonus(7)).toBe(3);
    expect(getProficiencyBonus(8)).toBe(3);
  });

  it('should have proficiency bonus +4 for levels 9-12', () => {
    expect(getProficiencyBonus(9)).toBe(4);
    expect(getProficiencyBonus(10)).toBe(4);
    expect(getProficiencyBonus(11)).toBe(4);
    expect(getProficiencyBonus(12)).toBe(4);
  });

  it('should have proficiency bonus +5 for levels 13-16', () => {
    expect(getProficiencyBonus(13)).toBe(5);
    expect(getProficiencyBonus(14)).toBe(5);
    expect(getProficiencyBonus(15)).toBe(5);
    expect(getProficiencyBonus(16)).toBe(5);
  });

  it('should have proficiency bonus +6 for levels 17-20', () => {
    expect(getProficiencyBonus(17)).toBe(6);
    expect(getProficiencyBonus(18)).toBe(6);
    expect(getProficiencyBonus(19)).toBe(6);
    expect(getProficiencyBonus(20)).toBe(6);
  });

  it('should throw for invalid level', () => {
    expect(() => getProficiencyBonus(0)).toThrow();
    expect(() => getProficiencyBonus(21)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// XP Thresholds
// ---------------------------------------------------------------------------

describe('XP_THRESHOLDS', () => {
  it('should have 20 entries (levels 1-20)', () => {
    expect(XP_THRESHOLDS.length).toBe(20);
  });

  it('should have XP thresholds for key levels', () => {
    expect(XP_THRESHOLDS[0]).toBe(0);       // Level 1
    expect(XP_THRESHOLDS[1]).toBe(300);     // Level 2
    expect(XP_THRESHOLDS[2]).toBe(900);     // Level 3
    expect(XP_THRESHOLDS[3]).toBe(2700);    // Level 4
    expect(XP_THRESHOLDS[4]).toBe(6500);    // Level 5
    expect(XP_THRESHOLDS[5]).toBe(14000);   // Level 6
    expect(XP_THRESHOLDS[19]).toBe(355000); // Level 20
  });

  it('should be strictly increasing', () => {
    for (let i = 1; i < XP_THRESHOLDS.length; i++) {
      expect(XP_THRESHOLDS[i]).toBeGreaterThan(XP_THRESHOLDS[i - 1]);
    }
  });

  it('should correctly compute level from XP', () => {
    expect(getLevelForXP(0)).toBe(1);
    expect(getLevelForXP(299)).toBe(1);
    expect(getLevelForXP(300)).toBe(2);
    expect(getLevelForXP(899)).toBe(2);
    expect(getLevelForXP(900)).toBe(3);
    expect(getLevelForXP(355000)).toBe(20);
    expect(getLevelForXP(999999)).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// Ability Score Modifier Table
// ---------------------------------------------------------------------------

describe('ABILITY_SCORE_MODIFIERS', () => {
  it('should have ability score modifier table covering scores 1-30', () => {
    expect(ABILITY_SCORE_MODIFIERS.length).toBe(30);
  });

  it('should return modifier -5 for score 1 and +10 for score 30', () => {
    expect(getAbilityModifier(1)).toBe(-5);
    expect(getAbilityModifier(30)).toBe(10);
  });

  it('should return modifier 0 for score 10 and 11', () => {
    expect(getAbilityModifier(10)).toBe(0);
    expect(getAbilityModifier(11)).toBe(0);
  });

  it('should return modifier +5 for score 20', () => {
    expect(getAbilityModifier(20)).toBe(5);
  });

  it('should match the lookup table for all scores', () => {
    for (let score = 1; score <= 30; score++) {
      expect(getAbilityModifier(score)).toBe(ABILITY_SCORE_MODIFIERS[score - 1]);
    }
  });
});

// ---------------------------------------------------------------------------
// Point Buy
// ---------------------------------------------------------------------------

describe('Point Buy', () => {
  it('should have point buy cost table for scores 8-15', () => {
    expect(POINT_BUY_COSTS[8]).toBe(0);
    expect(POINT_BUY_COSTS[9]).toBe(1);
    expect(POINT_BUY_COSTS[10]).toBe(2);
    expect(POINT_BUY_COSTS[11]).toBe(3);
    expect(POINT_BUY_COSTS[12]).toBe(4);
    expect(POINT_BUY_COSTS[13]).toBe(5);
    expect(POINT_BUY_COSTS[14]).toBe(7);
    expect(POINT_BUY_COSTS[15]).toBe(9);
  });

  it('should have budget of 27 points', () => {
    expect(POINT_BUY_BUDGET).toBe(27);
  });

  it('should have non-linear cost increase (14->15 costs 2 points, 8->9 costs 1)', () => {
    const costFrom14To15 = POINT_BUY_COSTS[15] - POINT_BUY_COSTS[14];
    const costFrom8To9 = POINT_BUY_COSTS[9] - POINT_BUY_COSTS[8];
    expect(costFrom14To15).toBe(2);
    expect(costFrom8To9).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Standard Array
// ---------------------------------------------------------------------------

describe('STANDARD_ARRAY', () => {
  it('should have standard array as [15, 14, 13, 12, 10, 8]', () => {
    expect([...STANDARD_ARRAY]).toEqual([15, 14, 13, 12, 10, 8]);
  });

  it('should have exactly 6 values', () => {
    expect(STANDARD_ARRAY.length).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// Carrying Capacity & Currency
// ---------------------------------------------------------------------------

describe('Carrying Capacity', () => {
  it('should have carry capacity multiplier of 15', () => {
    expect(CARRY_CAPACITY_MULTIPLIER).toBe(15);
  });

  it('should have push/drag/lift multiplier of 30', () => {
    expect(PUSH_DRAG_LIFT_MULTIPLIER).toBe(30);
  });
});

describe('Currency Conversion Rates', () => {
  it('should have currency conversion rates (pp=1000, gp=100, ep=50, sp=10, cp=1)', () => {
    expect(CURRENCY_RATES.pp).toBe(1000);
    expect(CURRENCY_RATES.gp).toBe(100);
    expect(CURRENCY_RATES.ep).toBe(50);
    expect(CURRENCY_RATES.sp).toBe(10);
    expect(CURRENCY_RATES.cp).toBe(1);
  });

  it('should be internally consistent (1 gp = 10 sp = 100 cp)', () => {
    expect(CURRENCY_RATES.gp / CURRENCY_RATES.sp).toBe(10);
    expect(CURRENCY_RATES.gp / CURRENCY_RATES.cp).toBe(100);
    expect(CURRENCY_RATES.pp / CURRENCY_RATES.gp).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Spell Slot Progression
// ---------------------------------------------------------------------------

describe('Spell Slot Progression', () => {
  it('should have full caster spell slots for 20 levels', () => {
    expect(FULL_CASTER_SPELL_SLOTS.length).toBe(20);
  });

  it('should have full caster level 1 with 2 first-level slots', () => {
    expect(FULL_CASTER_SPELL_SLOTS[0][0]).toBe(2);
  });

  it('should have full caster level 20 with correct high-level slots', () => {
    const level20 = FULL_CASTER_SPELL_SLOTS[19];
    expect(level20[0]).toBe(4); // 1st level
    expect(level20[8]).toBe(1); // 9th level
  });

  it('should have half caster spell slots for 20 levels', () => {
    expect(HALF_CASTER_SPELL_SLOTS.length).toBe(20);
  });

  it('should have half caster level 1 with no spell slots', () => {
    expect(HALF_CASTER_SPELL_SLOTS[0].every((s) => s === 0)).toBe(true);
  });

  it('should have half caster level 2 with 2 first-level slots', () => {
    expect(HALF_CASTER_SPELL_SLOTS[1][0]).toBe(2);
  });

  it('should have third caster spell slots for 20 levels', () => {
    expect(THIRD_CASTER_SPELL_SLOTS.length).toBe(20);
  });

  it('should have third caster level 3 with 2 first-level slots', () => {
    expect(THIRD_CASTER_SPELL_SLOTS[2][0]).toBe(2);
  });

  it('should have pact magic slots for 20 levels', () => {
    expect(PACT_MAGIC_SLOTS.length).toBe(20);
  });

  it('should have pact magic level 1 with 1 slot at level 1', () => {
    expect(PACT_MAGIC_SLOTS[0].slots).toBe(1);
    expect(PACT_MAGIC_SLOTS[0].slotLevel).toBe(1);
  });

  it('should have pact magic level 9+ at slot level 5', () => {
    expect(PACT_MAGIC_SLOTS[8].slotLevel).toBe(5);
    expect(PACT_MAGIC_SLOTS[19].slotLevel).toBe(5);
  });

  it('should have pact magic level 17+ with 4 slots', () => {
    expect(PACT_MAGIC_SLOTS[16].slots).toBe(4);
    expect(PACT_MAGIC_SLOTS[19].slots).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// Starting Gold by Class
// ---------------------------------------------------------------------------

describe('STARTING_GOLD_BY_CLASS', () => {
  it('should have starting gold for all 12 classes', () => {
    expect(Object.keys(STARTING_GOLD_BY_CLASS).length).toBe(12);
  });

  it('should have Monk with 5d4 (no multiplier)', () => {
    expect(STARTING_GOLD_BY_CLASS.monk).toBe('5d4');
  });

  it('should have Fighter with 5d4 x 10', () => {
    expect(STARTING_GOLD_BY_CLASS.fighter).toBe('5d4 x 10');
  });

  it('should have Barbarian with 2d4 x 10', () => {
    expect(STARTING_GOLD_BY_CLASS.barbarian).toBe('2d4 x 10');
  });
});
