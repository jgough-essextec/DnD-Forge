// @ts-nocheck — Test fixtures use partial Character objects that don't fully satisfy the interface
// =============================================================================
// Story 4.2 -- Skill & Proficiency Calculations Tests
// Comprehensive test suite for skill modifiers, proficiency bonus,
// passive scores, and skill proficiency source checks.
// =============================================================================

import { describe, it, expect } from 'vitest';
import type { AbilityScores, Character, SkillName, SkillProficiency } from '@/types';
import { ABILITY_NAMES, SKILL_NAMES } from '@/types';
import {
  getProficiencyBonus,
  getSkillModifier,
  getAllSkillModifiers,
  getPassiveScore,
  isSkillProficient,
  hasJackOfAllTrades,
  hasRemarkableAthlete,
  getCharacterSkillModifier,
  getSavingThrowModifier,
  getCharacterPassiveScore,
  getCharacterAllSkillModifiers,
  getAllSavingThrows,
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

// ---------------------------------------------------------------------------
// Character Factory Helper
// ---------------------------------------------------------------------------

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const defaults: Character = {
    id: 'test-char-1',
    name: 'Test Character',
    playerName: 'Test Player',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human' },
    classes: [{ classId: 'fighter', level: 5, chosenSkills: ['athletics'], hpRolls: [7, 8, 6, 7] }],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: 'Test' },
      characterPersonality: {
        personalityTraits: ['Brave', 'Loyal'],
        ideal: 'Honor',
        bond: 'Duty',
        flaw: 'Stubborn',
      },
    },
    alignment: 'true-neutral',
    baseAbilityScores: makeScores(15, 14, 13, 12, 10, 8),
    abilityScores: makeScores(15, 14, 13, 12, 10, 8),
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 6500,
    hpMax: 44,
    hpCurrent: 44,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0 },
    combatStats: {
      armorClass: 16,
      initiative: 2,
      proficiencyBonus: 3,
      passivePerception: 10,
      passiveInsight: 10,
      passiveInvestigation: 10,
    },
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple melee', 'martial melee'],
      tools: [],
      languages: ['common'],
      skills: [
        makeProf('athletics', true),
        makeProf('perception', true),
      ],
      savingThrows: ['strength', 'constitution'],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
    feats: [],
    description: {
      name: 'Test',
      age: '25',
      height: '6ft',
      weight: '180lbs',
      eyes: 'brown',
      skin: 'tan',
      hair: 'black',
      appearance: '',
      backstory: '',
      alliesAndOrgs: '',
      treasure: '',
    },
    personality: {
      personalityTraits: ['Brave', 'Loyal'],
      ideal: 'Honor',
      bond: 'Duty',
      flaw: 'Stubborn',
    },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
  };

  return { ...defaults, ...overrides };
}

// ---------------------------------------------------------------------------
// hasJackOfAllTrades
// ---------------------------------------------------------------------------

describe('hasJackOfAllTrades', () => {
  it('should return false for a non-Bard character', () => {
    const character = makeCharacter({
      classes: [{ classId: 'fighter', level: 5, chosenSkills: [], hpRolls: [] }],
    });
    expect(hasJackOfAllTrades(character)).toBe(false);
  });

  it('should return false for a Bard at level 1', () => {
    const character = makeCharacter({
      classes: [{ classId: 'bard', level: 1, chosenSkills: [], hpRolls: [] }],
    });
    expect(hasJackOfAllTrades(character)).toBe(false);
  });

  it('should return true for a Bard at level 2', () => {
    const character = makeCharacter({
      classes: [{ classId: 'bard', level: 2, chosenSkills: [], hpRolls: [6] }],
    });
    expect(hasJackOfAllTrades(character)).toBe(true);
  });

  it('should return true for a Bard at level 10', () => {
    const character = makeCharacter({
      classes: [{ classId: 'bard', level: 10, chosenSkills: [], hpRolls: [] }],
    });
    expect(hasJackOfAllTrades(character)).toBe(true);
  });

  it('should return true for a multiclass character with Bard 2+', () => {
    const character = makeCharacter({
      classes: [
        { classId: 'fighter', level: 3, chosenSkills: [], hpRolls: [] },
        { classId: 'bard', level: 2, chosenSkills: [], hpRolls: [6] },
      ],
    });
    expect(hasJackOfAllTrades(character)).toBe(true);
  });

  it('should return false for multiclass with Bard 1', () => {
    const character = makeCharacter({
      classes: [
        { classId: 'fighter', level: 3, chosenSkills: [], hpRolls: [] },
        { classId: 'bard', level: 1, chosenSkills: [], hpRolls: [] },
      ],
    });
    expect(hasJackOfAllTrades(character)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// hasRemarkableAthlete
// ---------------------------------------------------------------------------

describe('hasRemarkableAthlete', () => {
  it('should return false for a non-Fighter', () => {
    const character = makeCharacter({
      classes: [{ classId: 'bard', level: 10, chosenSkills: [], hpRolls: [] }],
    });
    expect(hasRemarkableAthlete(character)).toBe(false);
  });

  it('should return false for a Fighter without Champion subclass', () => {
    const character = makeCharacter({
      classes: [{ classId: 'fighter', level: 10, chosenSkills: [], hpRolls: [] }],
    });
    expect(hasRemarkableAthlete(character)).toBe(false);
  });

  it('should return false for a Champion Fighter below level 7', () => {
    const character = makeCharacter({
      classes: [{
        classId: 'fighter', subclassId: 'champion', level: 6,
        chosenSkills: [], hpRolls: [],
      }],
    });
    expect(hasRemarkableAthlete(character)).toBe(false);
  });

  it('should return true for a Champion Fighter at level 7', () => {
    const character = makeCharacter({
      classes: [{
        classId: 'fighter', subclassId: 'champion', level: 7,
        chosenSkills: [], hpRolls: [],
      }],
    });
    expect(hasRemarkableAthlete(character)).toBe(true);
  });

  it('should return true for a Champion Fighter at level 20', () => {
    const character = makeCharacter({
      classes: [{
        classId: 'fighter', subclassId: 'champion', level: 20,
        chosenSkills: [], hpRolls: [],
      }],
    });
    expect(hasRemarkableAthlete(character)).toBe(true);
  });

  it('should return true for multiclass with Champion Fighter 7+', () => {
    const character = makeCharacter({
      classes: [
        { classId: 'rogue', level: 3, chosenSkills: [], hpRolls: [] },
        { classId: 'fighter', subclassId: 'champion', level: 7, chosenSkills: [], hpRolls: [] },
      ],
    });
    expect(hasRemarkableAthlete(character)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getCharacterSkillModifier
// ---------------------------------------------------------------------------

describe('getCharacterSkillModifier', () => {
  it('should return ability modifier for non-proficient skill', () => {
    // Level 5, STR 15 (mod +2), not proficient in athletics
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(15, 14, 13, 12, 10, 8),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: ['strength', 'constitution'],
      },
    });

    // Athletics -> STR -> mod +2
    expect(getCharacterSkillModifier(character, 'athletics')).toBe(2);
  });

  it('should add proficiency bonus for proficient skill', () => {
    // Level 5 (prof +3), STR 15 (mod +2), proficient in athletics
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(15, 14, 13, 12, 10, 8),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [makeProf('athletics', true)],
        savingThrows: ['strength', 'constitution'],
      },
    });

    // Athletics -> +2 (mod) + +3 (prof) = +5
    expect(getCharacterSkillModifier(character, 'athletics')).toBe(5);
  });

  it('should double proficiency for expertise', () => {
    // Level 5 (prof +3), DEX 16 (mod +3), expertise in stealth
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(10, 16, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [makeProf('stealth', true, true)],
        savingThrows: [],
      },
    });

    // Stealth -> +3 (mod) + 3*2 (expertise) = +9
    expect(getCharacterSkillModifier(character, 'stealth')).toBe(9);
  });

  it('should add half proficiency (floor) for Jack of All Trades on non-proficient skills', () => {
    // Bard level 2, level 5 total (prof +3), WIS 10 (mod 0), not proficient in survival
    const character = makeCharacter({
      level: 5,
      classes: [{ classId: 'bard', level: 5, chosenSkills: [], hpRolls: [] }],
      abilityScores: makeScores(10, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: [],
      },
    });

    // Survival -> WIS mod 0 + floor(3/2) = 0 + 1 = 1
    expect(getCharacterSkillModifier(character, 'survival')).toBe(1);
  });

  it('should NOT add JoAT bonus to proficient skills', () => {
    const character = makeCharacter({
      level: 5,
      classes: [{ classId: 'bard', level: 5, chosenSkills: [], hpRolls: [] }],
      abilityScores: makeScores(10, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [makeProf('perception', true)],
        savingThrows: [],
      },
    });

    // Perception -> WIS mod 0 + prof 3 = 3 (not 3 + 1)
    expect(getCharacterSkillModifier(character, 'perception')).toBe(3);
  });

  it('should add half proficiency (ceil) for Remarkable Athlete on STR/DEX/CON skills', () => {
    // Champion Fighter level 7, total level 7 (prof +3), STR 10 (mod 0)
    const character = makeCharacter({
      level: 7,
      classes: [{
        classId: 'fighter', subclassId: 'champion', level: 7,
        chosenSkills: [], hpRolls: [],
      }],
      abilityScores: makeScores(10, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: [],
      },
    });

    // Athletics (STR) -> mod 0 + ceil(3/2) = 0 + 2 = 2
    expect(getCharacterSkillModifier(character, 'athletics')).toBe(2);
    // Acrobatics (DEX) -> mod 0 + ceil(3/2) = 0 + 2 = 2
    expect(getCharacterSkillModifier(character, 'acrobatics')).toBe(2);
  });

  it('should NOT apply Remarkable Athlete to INT/WIS/CHA skills', () => {
    const character = makeCharacter({
      level: 7,
      classes: [{
        classId: 'fighter', subclassId: 'champion', level: 7,
        chosenSkills: [], hpRolls: [],
      }],
      abilityScores: makeScores(10, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: [],
      },
    });

    // Arcana (INT) -> mod 0, no Remarkable Athlete
    expect(getCharacterSkillModifier(character, 'arcana')).toBe(0);
    // Perception (WIS) -> mod 0, no Remarkable Athlete
    expect(getCharacterSkillModifier(character, 'perception')).toBe(0);
    // Persuasion (CHA) -> mod 0, no Remarkable Athlete
    expect(getCharacterSkillModifier(character, 'persuasion')).toBe(0);
  });

  it('should prefer Remarkable Athlete over Jack of All Trades for STR/DEX/CON', () => {
    // Multiclass: Bard 2 / Champion Fighter 7 = level 9 (prof +4)
    const character = makeCharacter({
      level: 9,
      classes: [
        { classId: 'bard', level: 2, chosenSkills: [], hpRolls: [] },
        { classId: 'fighter', subclassId: 'champion', level: 7, chosenSkills: [], hpRolls: [] },
      ],
      abilityScores: makeScores(10, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: [],
      },
    });

    // Athletics (STR): Remarkable Athlete = ceil(4/2) = 2
    // JoAT would give floor(4/2) = 2, but RA takes priority (ceil vs floor)
    expect(getCharacterSkillModifier(character, 'athletics')).toBe(2);
  });

  it('should apply JoAT to INT/WIS/CHA even with Remarkable Athlete for multiclass', () => {
    // Multiclass: Bard 2 / Champion Fighter 7 = level 9 (prof +4)
    const character = makeCharacter({
      level: 9,
      classes: [
        { classId: 'bard', level: 2, chosenSkills: [], hpRolls: [] },
        { classId: 'fighter', subclassId: 'champion', level: 7, chosenSkills: [], hpRolls: [] },
      ],
      abilityScores: makeScores(10, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: [],
      },
    });

    // Arcana (INT): RA does not apply, JoAT gives floor(4/2) = 2
    expect(getCharacterSkillModifier(character, 'arcana')).toBe(2);
  });

  it('should handle level 1 Bard without JoAT', () => {
    const character = makeCharacter({
      level: 1,
      classes: [{ classId: 'bard', level: 1, chosenSkills: [], hpRolls: [] }],
      abilityScores: makeScores(10, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: [],
      },
    });

    // No JoAT at level 1, just ability mod
    expect(getCharacterSkillModifier(character, 'athletics')).toBe(0);
  });

  it('should handle high-level expertise correctly', () => {
    // Level 17 (prof +6), DEX 20 (mod +5), expertise in stealth
    const character = makeCharacter({
      level: 17,
      classes: [{ classId: 'rogue', level: 17, chosenSkills: [], hpRolls: [] }],
      abilityScores: makeScores(10, 20, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [makeProf('stealth', true, true)],
        savingThrows: [],
      },
    });

    // Stealth -> +5 (mod) + 6*2 (expertise) = +17
    expect(getCharacterSkillModifier(character, 'stealth')).toBe(17);
  });
});

// ---------------------------------------------------------------------------
// getSavingThrowModifier (Character-level)
// ---------------------------------------------------------------------------

describe('getSavingThrowModifier', () => {
  it('should return ability modifier when not proficient', () => {
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(15, 14, 13, 12, 10, 8),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: ['strength', 'constitution'],
      },
    });

    // WIS 10 (mod 0), not proficient
    expect(getSavingThrowModifier(character, 'wisdom')).toBe(0);
    // CHA 8 (mod -1), not proficient
    expect(getSavingThrowModifier(character, 'charisma')).toBe(-1);
  });

  it('should add proficiency bonus when proficient', () => {
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(15, 14, 13, 12, 10, 8),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: ['strength', 'constitution'],
      },
    });

    // STR 15 (mod +2) + prof +3 = +5
    expect(getSavingThrowModifier(character, 'strength')).toBe(5);
    // CON 13 (mod +1) + prof +3 = +4
    expect(getSavingThrowModifier(character, 'constitution')).toBe(4);
  });

  it('should handle level 1 with proficiency', () => {
    const character = makeCharacter({
      level: 1,
      abilityScores: makeScores(14, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: ['strength'],
      },
    });

    // STR 14 (mod +2) + prof +2 = +4
    expect(getSavingThrowModifier(character, 'strength')).toBe(4);
  });

  it('should handle level 20 with proficiency', () => {
    const character = makeCharacter({
      level: 20,
      abilityScores: makeScores(20, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: ['strength'],
      },
    });

    // STR 20 (mod +5) + prof +6 = +11
    expect(getSavingThrowModifier(character, 'strength')).toBe(11);
  });

  it('should handle low ability score with proficiency', () => {
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(8, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: ['strength'],
      },
    });

    // STR 8 (mod -1) + prof +3 = +2
    expect(getSavingThrowModifier(character, 'strength')).toBe(2);
  });

  it('should return negative value for low score without proficiency', () => {
    const character = makeCharacter({
      level: 1,
      abilityScores: makeScores(10, 10, 10, 10, 10, 6),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: [],
      },
    });

    // CHA 6 (mod -2), not proficient
    expect(getSavingThrowModifier(character, 'charisma')).toBe(-2);
  });
});

// ---------------------------------------------------------------------------
// getCharacterPassiveScore
// ---------------------------------------------------------------------------

describe('getCharacterPassiveScore', () => {
  it('should return 10 + skill modifier', () => {
    // Level 5 (prof +3), WIS 14 (mod +2), proficient in perception
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(10, 10, 10, 10, 14, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [makeProf('perception', true)],
        savingThrows: [],
      },
    });

    // Perception -> mod +2 + prof +3 = +5
    // Passive = 10 + 5 = 15
    expect(getCharacterPassiveScore(character, 'perception')).toBe(15);
  });

  it('should add +5 for advantage', () => {
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(10, 10, 10, 10, 14, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [makeProf('perception', true)],
        savingThrows: [],
      },
    });

    // 10 + 5 + 5 = 20
    expect(getCharacterPassiveScore(character, 'perception', 'advantage')).toBe(20);
  });

  it('should subtract 5 for disadvantage', () => {
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(10, 10, 10, 10, 14, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [makeProf('perception', true)],
        savingThrows: [],
      },
    });

    // 10 + 5 - 5 = 10
    expect(getCharacterPassiveScore(character, 'perception', 'disadvantage')).toBe(10);
  });

  it('should handle non-proficient skill', () => {
    const character = makeCharacter({
      level: 1,
      abilityScores: makeScores(10, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: [],
      },
    });

    // Perception -> WIS mod 0, no prof
    // Passive = 10 + 0 = 10
    expect(getCharacterPassiveScore(character, 'perception')).toBe(10);
  });

  it('should include Jack of All Trades in passive score', () => {
    // Bard level 5 (prof +3), WIS 10, not proficient in perception
    const character = makeCharacter({
      level: 5,
      classes: [{ classId: 'bard', level: 5, chosenSkills: [], hpRolls: [] }],
      abilityScores: makeScores(10, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: [],
      },
    });

    // Perception -> WIS mod 0 + JoAT floor(3/2) = 1
    // Passive = 10 + 1 = 11
    expect(getCharacterPassiveScore(character, 'perception')).toBe(11);
  });

  it('should handle expertise in passive score', () => {
    // Level 5 (prof +3), WIS 14 (mod +2), expertise in perception
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(10, 10, 10, 10, 14, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [makeProf('perception', true, true)],
        savingThrows: [],
      },
    });

    // Perception -> mod +2 + expertise 3*2=6 = +8
    // Passive = 10 + 8 = 18
    expect(getCharacterPassiveScore(character, 'perception')).toBe(18);
  });
});

// ---------------------------------------------------------------------------
// getCharacterAllSkillModifiers
// ---------------------------------------------------------------------------

describe('getCharacterAllSkillModifiers', () => {
  it('should return all 18 skills', () => {
    const character = makeCharacter({
      level: 1,
      abilityScores: makeScores(10, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: [],
      },
    });

    const result = getCharacterAllSkillModifiers(character);
    expect(Object.keys(result).length).toBe(18);
    for (const skill of SKILL_NAMES) {
      expect(result[skill]).toBe(0);
    }
  });

  it('should reflect proficiencies in the results', () => {
    // Level 5 (prof +3), distinct scores
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(16, 14, 12, 10, 8, 6),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [
          makeProf('athletics', true),
          makeProf('stealth', true, true),
        ],
        savingThrows: [],
      },
    });

    const result = getCharacterAllSkillModifiers(character);

    // Athletics -> STR 16 (+3) + prof +3 = +6
    expect(result['athletics']).toBe(6);
    // Stealth -> DEX 14 (+2) + expertise 3*2=6 = +8
    expect(result['stealth']).toBe(8);
    // Acrobatics -> DEX 14 (+2) no prof = +2
    expect(result['acrobatics']).toBe(2);
    // Deception -> CHA 6 (-2) no prof = -2
    expect(result['deception']).toBe(-2);
  });

  it('should include Jack of All Trades for a Bard', () => {
    const character = makeCharacter({
      level: 5,
      classes: [{ classId: 'bard', level: 5, chosenSkills: [], hpRolls: [] }],
      abilityScores: makeScores(10, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [makeProf('performance', true)],
        savingThrows: [],
      },
    });

    const result = getCharacterAllSkillModifiers(character);

    // Performance (proficient) -> mod 0 + prof 3 = 3
    expect(result['performance']).toBe(3);
    // Athletics (not proficient) -> mod 0 + JoAT floor(3/2) = 1
    expect(result['athletics']).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getAllSavingThrows
// ---------------------------------------------------------------------------

describe('getAllSavingThrows', () => {
  it('should return all 6 saving throws', () => {
    const character = makeCharacter({
      level: 1,
      abilityScores: makeScores(10, 10, 10, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: [],
      },
    });

    const result = getAllSavingThrows(character);
    expect(Object.keys(result).length).toBe(6);
    for (const ability of ABILITY_NAMES) {
      expect(result[ability]).toBe(0);
    }
  });

  it('should add proficiency bonus for proficient saves', () => {
    // Level 5 (prof +3), STR 14 (mod +2), CON 12 (mod +1)
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(14, 10, 12, 10, 10, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: ['strength', 'constitution'],
      },
    });

    const result = getAllSavingThrows(character);

    // STR 14 (mod +2) + prof +3 = +5
    expect(result['strength']).toBe(5);
    // CON 12 (mod +1) + prof +3 = +4
    expect(result['constitution']).toBe(4);
    // DEX 10 (mod 0), not proficient
    expect(result['dexterity']).toBe(0);
    // WIS 10 (mod 0), not proficient
    expect(result['wisdom']).toBe(0);
  });

  it('should handle Wizard saves (INT + WIS)', () => {
    // Level 5 (prof +3), INT 16 (mod +3), WIS 14 (mod +2)
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(8, 10, 10, 16, 14, 10),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: ['intelligence', 'wisdom'],
      },
    });

    const result = getAllSavingThrows(character);

    expect(result['intelligence']).toBe(6); // +3 + +3
    expect(result['wisdom']).toBe(5); // +2 + +3
    expect(result['strength']).toBe(-1); // -1, no prof
  });

  it('should handle level 20 with max proficiency', () => {
    const character = makeCharacter({
      level: 20,
      abilityScores: makeScores(20, 20, 20, 20, 20, 20),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'],
      },
    });

    const result = getAllSavingThrows(character);

    // All abilities 20 (mod +5) + prof +6 = +11
    for (const ability of ABILITY_NAMES) {
      expect(result[ability]).toBe(11);
    }
  });

  it('should handle no proficient saves', () => {
    const character = makeCharacter({
      level: 5,
      abilityScores: makeScores(14, 12, 10, 8, 16, 6),
      proficiencies: {
        armor: [], weapons: [], tools: [], languages: ['common'],
        skills: [],
        savingThrows: [],
      },
    });

    const result = getAllSavingThrows(character);

    expect(result['strength']).toBe(2); // mod +2
    expect(result['dexterity']).toBe(1); // mod +1
    expect(result['constitution']).toBe(0); // mod 0
    expect(result['intelligence']).toBe(-1); // mod -1
    expect(result['wisdom']).toBe(3); // mod +3
    expect(result['charisma']).toBe(-2); // mod -2
  });
});
