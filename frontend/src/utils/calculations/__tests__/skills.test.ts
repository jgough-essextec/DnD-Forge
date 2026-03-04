// =============================================================================
// Story 4.2 -- Skill & Proficiency Calculations Tests
// Comprehensive test suite for skill modifiers, proficiency bonus,
// passive scores, and skill proficiency source checks.
// =============================================================================

import { describe, it, expect } from 'vitest';
import type { AbilityScores, SkillName, SkillProficiency } from '@/types';
import { SKILL_NAMES } from '@/types';
import {
  getProficiencyBonus,
  getSkillModifier,
  getAllSkillModifiers,
  getPassiveScore,
  isSkillProficient,
} from '../skills';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeScores(
  str: number,
  dex: number,
  con: number,
  int: number,
  wis: number,
  cha: number,
): AbilityScores {
  return {
    strength: str,
    dexterity: dex,
    constitution: con,
    intelligence: int,
    wisdom: wis,
    charisma: cha,
  };
}

function makeProf(
  skill: SkillName,
  proficient: boolean,
  expertise: boolean = false,
): SkillProficiency {
  return { skill, proficient, expertise };
}

// ---------------------------------------------------------------------------
// getProficiencyBonus
// ---------------------------------------------------------------------------

describe('getProficiencyBonus', () => {
  it('should return +2 for level 1', () => {
    expect(getProficiencyBonus(1)).toBe(2);
  });

  it('should return +2 for level 4', () => {
    expect(getProficiencyBonus(4)).toBe(2);
  });

  it('should return +3 for level 5', () => {
    expect(getProficiencyBonus(5)).toBe(3);
  });

  it('should return +3 for level 8', () => {
    expect(getProficiencyBonus(8)).toBe(3);
  });

  it('should return +4 for level 9', () => {
    expect(getProficiencyBonus(9)).toBe(4);
  });

  it('should return +4 for level 12', () => {
    expect(getProficiencyBonus(12)).toBe(4);
  });

  it('should return +5 for level 13', () => {
    expect(getProficiencyBonus(13)).toBe(5);
  });

  it('should return +5 for level 16', () => {
    expect(getProficiencyBonus(16)).toBe(5);
  });

  it('should return +6 for level 17', () => {
    expect(getProficiencyBonus(17)).toBe(6);
  });

  it('should return +6 for level 20', () => {
    expect(getProficiencyBonus(20)).toBe(6);
  });

  it('should throw RangeError for level 0', () => {
    expect(() => getProficiencyBonus(0)).toThrow(RangeError);
  });

  it('should throw RangeError for level 21', () => {
    expect(() => getProficiencyBonus(21)).toThrow(RangeError);
  });

  it('should throw RangeError for negative level', () => {
    expect(() => getProficiencyBonus(-1)).toThrow(RangeError);
  });

  it('should return correct values for all levels 1-20', () => {
    const expected = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6];
    for (let level = 1; level <= 20; level++) {
      expect(getProficiencyBonus(level)).toBe(expected[level - 1]);
    }
  });
});

// ---------------------------------------------------------------------------
// getSkillModifier
// ---------------------------------------------------------------------------

describe('getSkillModifier', () => {
  it('should return only ability modifier when not proficient', () => {
    const prof = makeProf('athletics', false);
    // STR 14 -> modifier +2
    expect(getSkillModifier(14, prof, 1)).toBe(2);
  });

  it('should return ability modifier + proficiency when proficient at level 1', () => {
    const prof = makeProf('athletics', true);
    // STR 14 -> modifier +2, proficiency at level 1 = +2
    expect(getSkillModifier(14, prof, 1)).toBe(4);
  });

  it('should return ability modifier + proficiency when proficient at level 5', () => {
    const prof = makeProf('athletics', true);
    // STR 14 -> modifier +2, proficiency at level 5 = +3
    expect(getSkillModifier(14, prof, 5)).toBe(5);
  });

  it('should return ability modifier + double proficiency for expertise at level 1', () => {
    const prof = makeProf('stealth', true, true);
    // DEX 16 -> modifier +3, expertise at level 1 = +2 * 2 = +4
    expect(getSkillModifier(16, prof, 1)).toBe(7);
  });

  it('should return ability modifier + double proficiency for expertise at level 5', () => {
    const prof = makeProf('stealth', true, true);
    // DEX 16 -> modifier +3, expertise at level 5 = +3 * 2 = +6
    expect(getSkillModifier(16, prof, 5)).toBe(9);
  });

  it('should return ability modifier + double proficiency for expertise at level 17', () => {
    const prof = makeProf('stealth', true, true);
    // DEX 20 -> modifier +5, expertise at level 17 = +6 * 2 = +12
    expect(getSkillModifier(20, prof, 17)).toBe(17);
  });

  it('should handle negative ability modifiers without proficiency', () => {
    const prof = makeProf('athletics', false);
    // STR 8 -> modifier -1
    expect(getSkillModifier(8, prof, 1)).toBe(-1);
  });

  it('should handle negative ability modifiers with proficiency', () => {
    const prof = makeProf('athletics', true);
    // STR 8 -> modifier -1, proficiency at level 1 = +2
    expect(getSkillModifier(8, prof, 1)).toBe(1);
  });

  it('should handle score 10 (modifier 0) without proficiency', () => {
    const prof = makeProf('perception', false);
    expect(getSkillModifier(10, prof, 1)).toBe(0);
  });

  it('should handle score 10 (modifier 0) with proficiency at level 1', () => {
    const prof = makeProf('perception', true);
    expect(getSkillModifier(10, prof, 1)).toBe(2);
  });

  it('should handle score 10 with expertise at level 1', () => {
    const prof = makeProf('perception', true, true);
    // modifier 0 + 2*2 = 4
    expect(getSkillModifier(10, prof, 1)).toBe(4);
  });

  it('should treat expertise flag as doubling proficiency even at higher levels', () => {
    const prof = makeProf('perception', true, true);
    // WIS 12 -> modifier +1, expertise at level 9 = +4 * 2 = +8
    expect(getSkillModifier(12, prof, 9)).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// getAllSkillModifiers
// ---------------------------------------------------------------------------

describe('getAllSkillModifiers', () => {
  const scores = makeScores(14, 16, 12, 10, 13, 8);

  it('should return correct modifiers for all 18 skills with no proficiencies', () => {
    const result = getAllSkillModifiers(scores, [], 1);

    // Check that all 18 skills are present
    expect(Object.keys(result).length).toBe(18);

    // Athletics -> STR 14 -> +2
    expect(result['athletics']).toBe(2);
    // Acrobatics -> DEX 16 -> +3
    expect(result['acrobatics']).toBe(3);
    // Arcana -> INT 10 -> 0
    expect(result['arcana']).toBe(0);
    // Perception -> WIS 13 -> +1
    expect(result['perception']).toBe(1);
    // Deception -> CHA 8 -> -1
    expect(result['deception']).toBe(-1);
  });

  it('should add proficiency bonus for proficient skills', () => {
    const proficiencies: SkillProficiency[] = [
      makeProf('athletics', true),
      makeProf('perception', true),
    ];
    const result = getAllSkillModifiers(scores, proficiencies, 1);

    // Athletics -> STR 14 (+2) + proficiency (+2) = +4
    expect(result['athletics']).toBe(4);
    // Perception -> WIS 13 (+1) + proficiency (+2) = +3
    expect(result['perception']).toBe(3);
    // Arcana -> still just ability mod
    expect(result['arcana']).toBe(0);
  });

  it('should double proficiency bonus for expertise skills', () => {
    const proficiencies: SkillProficiency[] = [
      makeProf('stealth', true, true),
    ];
    const result = getAllSkillModifiers(scores, proficiencies, 1);

    // Stealth -> DEX 16 (+3) + expertise (2*2=4) = +7
    expect(result['stealth']).toBe(7);
  });

  it('should correctly map all 18 skills to their abilities', () => {
    const uniformScores = makeScores(10, 10, 10, 10, 10, 10);
    const result = getAllSkillModifiers(uniformScores, [], 1);

    for (const skill of SKILL_NAMES) {
      expect(result[skill]).toBe(0);
    }
  });

  it('should verify all 18 skill-ability mappings produce expected modifiers', () => {
    // Each ability has a distinct score so we can verify the mapping
    const distinctScores = makeScores(16, 14, 12, 10, 8, 6);
    const result = getAllSkillModifiers(distinctScores, [], 1);

    // STR skills: athletics -> +3
    expect(result['athletics']).toBe(3);

    // DEX skills: acrobatics, sleight-of-hand, stealth -> +2
    expect(result['acrobatics']).toBe(2);
    expect(result['sleight-of-hand']).toBe(2);
    expect(result['stealth']).toBe(2);

    // CON has no skills

    // INT skills: arcana, history, investigation, nature, religion -> 0
    expect(result['arcana']).toBe(0);
    expect(result['history']).toBe(0);
    expect(result['investigation']).toBe(0);
    expect(result['nature']).toBe(0);
    expect(result['religion']).toBe(0);

    // WIS skills: animal-handling, insight, medicine, perception, survival -> -1
    expect(result['animal-handling']).toBe(-1);
    expect(result['insight']).toBe(-1);
    expect(result['medicine']).toBe(-1);
    expect(result['perception']).toBe(-1);
    expect(result['survival']).toBe(-1);

    // CHA skills: deception, intimidation, performance, persuasion -> -2
    expect(result['deception']).toBe(-2);
    expect(result['intimidation']).toBe(-2);
    expect(result['performance']).toBe(-2);
    expect(result['persuasion']).toBe(-2);
  });

  it('should handle a mix of proficient and expertise skills at higher levels', () => {
    const proficiencies: SkillProficiency[] = [
      makeProf('perception', true),
      makeProf('stealth', true, true),
      makeProf('athletics', true),
    ];
    // Level 9: proficiency = +4
    const result = getAllSkillModifiers(scores, proficiencies, 9);

    // Perception -> WIS 13 (+1) + 4 = +5
    expect(result['perception']).toBe(5);
    // Stealth -> DEX 16 (+3) + 4*2 = +11
    expect(result['stealth']).toBe(11);
    // Athletics -> STR 14 (+2) + 4 = +6
    expect(result['athletics']).toBe(6);
    // Arcana -> INT 10 (0) no prof = 0
    expect(result['arcana']).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getPassiveScore
// ---------------------------------------------------------------------------

describe('getPassiveScore', () => {
  it('should return 10 + skill modifier with no bonuses', () => {
    expect(getPassiveScore(3)).toBe(13);
  });

  it('should return 10 + 0 for modifier 0', () => {
    expect(getPassiveScore(0)).toBe(10);
  });

  it('should return 10 + negative modifier', () => {
    expect(getPassiveScore(-2)).toBe(8);
  });

  it('should add +5 for advantage', () => {
    expect(getPassiveScore(3, 5)).toBe(18);
  });

  it('should subtract -5 for disadvantage', () => {
    expect(getPassiveScore(3, -5)).toBe(8);
  });

  it('should handle combined bonuses and penalties', () => {
    // modifier +3, bonus +2 from some other source
    expect(getPassiveScore(3, 2)).toBe(15);
  });

  it('should handle 0 bonus explicitly', () => {
    expect(getPassiveScore(5, 0)).toBe(15);
  });

  it('should calculate typical passive perception: WIS 14 proficient at level 1', () => {
    // WIS 14 modifier = +2, proficiency at level 1 = +2, total skill mod = +4
    // Passive = 10 + 4 = 14
    expect(getPassiveScore(4)).toBe(14);
  });

  it('should calculate passive perception with advantage for Observant feat', () => {
    // Skill mod +4 + Observant bonus +5
    expect(getPassiveScore(4, 5)).toBe(19);
  });

  it('should handle large negative modifiers', () => {
    // modifier -5 (score 1, no proficiency)
    expect(getPassiveScore(-5)).toBe(5);
  });

  it('should handle large positive modifiers with expertise', () => {
    // DEX 20 (+5) + expertise at level 17 (+12) = modifier 17
    expect(getPassiveScore(17)).toBe(27);
  });
});

// ---------------------------------------------------------------------------
// isSkillProficient
// ---------------------------------------------------------------------------

describe('isSkillProficient', () => {
  const emptySources = {
    classSkills: [] as SkillName[],
    raceSkills: [] as SkillName[],
    backgroundSkills: [] as SkillName[],
    featSkills: [] as SkillName[],
  };

  it('should return false when skill is not in any source', () => {
    expect(isSkillProficient('athletics', emptySources)).toBe(false);
  });

  it('should return true when skill is from class', () => {
    expect(
      isSkillProficient('athletics', {
        ...emptySources,
        classSkills: ['athletics'],
      }),
    ).toBe(true);
  });

  it('should return true when skill is from race', () => {
    expect(
      isSkillProficient('perception', {
        ...emptySources,
        raceSkills: ['perception'],
      }),
    ).toBe(true);
  });

  it('should return true when skill is from background', () => {
    expect(
      isSkillProficient('stealth', {
        ...emptySources,
        backgroundSkills: ['stealth'],
      }),
    ).toBe(true);
  });

  it('should return true when skill is from feat', () => {
    expect(
      isSkillProficient('insight', {
        ...emptySources,
        featSkills: ['insight'],
      }),
    ).toBe(true);
  });

  it('should return true when skill is from multiple sources', () => {
    expect(
      isSkillProficient('perception', {
        classSkills: ['perception'],
        raceSkills: ['perception'],
        backgroundSkills: [],
        featSkills: [],
      }),
    ).toBe(true);
  });

  it('should correctly check different skills from different sources', () => {
    const sources = {
      classSkills: ['athletics', 'intimidation'] as SkillName[],
      raceSkills: ['perception'] as SkillName[],
      backgroundSkills: ['stealth', 'deception'] as SkillName[],
      featSkills: ['insight'] as SkillName[],
    };

    expect(isSkillProficient('athletics', sources)).toBe(true);
    expect(isSkillProficient('intimidation', sources)).toBe(true);
    expect(isSkillProficient('perception', sources)).toBe(true);
    expect(isSkillProficient('stealth', sources)).toBe(true);
    expect(isSkillProficient('deception', sources)).toBe(true);
    expect(isSkillProficient('insight', sources)).toBe(true);
    expect(isSkillProficient('arcana', sources)).toBe(false);
    expect(isSkillProficient('history', sources)).toBe(false);
  });

  it('should handle all sources being populated', () => {
    const sources = {
      classSkills: ['athletics'] as SkillName[],
      raceSkills: ['perception'] as SkillName[],
      backgroundSkills: ['stealth'] as SkillName[],
      featSkills: ['insight'] as SkillName[],
    };

    expect(isSkillProficient('athletics', sources)).toBe(true);
    expect(isSkillProficient('perception', sources)).toBe(true);
    expect(isSkillProficient('stealth', sources)).toBe(true);
    expect(isSkillProficient('insight', sources)).toBe(true);
    expect(isSkillProficient('arcana', sources)).toBe(false);
  });
});
