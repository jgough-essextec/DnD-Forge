// =============================================================================
// Tests for Story 2.1 -- Core Ability & Skill Types
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  ABILITY_NAMES,
  SKILL_NAMES,
  SKILL_ABILITY_MAP,
  ALIGNMENTS,
  SIZES,
  DIE_TYPES,
  DAMAGE_TYPES,
  CONDITIONS,
  LANGUAGES,
  PROFICIENCY_TYPES,
  isAbilityName,
  isSkillName,
  isAlignment,
  isSize,
  isDieType,
  isDamageType,
  isCondition,
  isLanguage,
  isProficiencyType,
} from '../core';
import type {
  AbilityName,
  AbilityScores,
  SkillName,
  SkillProficiency,
  SavingThrow,
  PassiveScore,
  Alignment,
  Size,
  DieType,
  Dice,
  DamageType,
  Condition,
  Language,
  Currency,
  ProficiencyType,
} from '../core';

// -- AbilityName --------------------------------------------------------------

describe('AbilityName', () => {
  it('should define AbilityName union type with exactly 6 abilities', () => {
    expect(ABILITY_NAMES).toHaveLength(6);
    expect(ABILITY_NAMES).toEqual([
      'strength',
      'dexterity',
      'constitution',
      'intelligence',
      'wisdom',
      'charisma',
    ]);
  });

  it('should include all six standard D&D abilities', () => {
    const expected: AbilityName[] = [
      'strength', 'dexterity', 'constitution',
      'intelligence', 'wisdom', 'charisma',
    ];
    for (const ability of expected) {
      expect(ABILITY_NAMES).toContain(ability);
    }
  });
});

// -- AbilityScores ------------------------------------------------------------

describe('AbilityScores', () => {
  it('should be instantiable with all 6 ability properties as numbers', () => {
    const scores: AbilityScores = {
      strength: 10,
      dexterity: 14,
      constitution: 12,
      intelligence: 16,
      wisdom: 8,
      charisma: 13,
    };
    expect(scores.strength).toBe(10);
    expect(scores.dexterity).toBe(14);
    expect(scores.constitution).toBe(12);
    expect(scores.intelligence).toBe(16);
    expect(scores.wisdom).toBe(8);
    expect(scores.charisma).toBe(13);
  });
});

// -- SkillName ----------------------------------------------------------------

describe('SkillName', () => {
  it('should define SkillName union type with exactly 18 skills', () => {
    expect(SKILL_NAMES).toHaveLength(18);
  });

  it('should include all 18 standard D&D skills', () => {
    const expected: SkillName[] = [
      'acrobatics', 'animal-handling', 'arcana', 'athletics',
      'deception', 'history', 'insight', 'intimidation',
      'investigation', 'medicine', 'nature', 'perception',
      'performance', 'persuasion', 'religion', 'sleight-of-hand',
      'stealth', 'survival',
    ];
    for (const skill of expected) {
      expect(SKILL_NAMES).toContain(skill);
    }
  });
});

// -- SKILL_ABILITY_MAP --------------------------------------------------------

describe('SKILL_ABILITY_MAP', () => {
  it('should have entries for all 18 skills', () => {
    const keys = Object.keys(SKILL_ABILITY_MAP);
    expect(keys).toHaveLength(18);
    for (const skill of SKILL_NAMES) {
      expect(SKILL_ABILITY_MAP).toHaveProperty(skill);
    }
  });

  it('should be typed as Record<SkillName, AbilityName> with no missing entries', () => {
    // TypeScript enforces completeness at compile time.
    // At runtime, verify every value is a valid AbilityName.
    for (const skill of SKILL_NAMES) {
      const ability = SKILL_ABILITY_MAP[skill];
      expect(ABILITY_NAMES).toContain(ability);
    }
  });

  it('should map acrobatics to dexterity', () => {
    expect(SKILL_ABILITY_MAP['acrobatics']).toBe('dexterity');
  });

  it('should map athletics to strength', () => {
    expect(SKILL_ABILITY_MAP['athletics']).toBe('strength');
  });

  it('should map arcana to intelligence', () => {
    expect(SKILL_ABILITY_MAP['arcana']).toBe('intelligence');
  });

  it('should map animal-handling to wisdom', () => {
    expect(SKILL_ABILITY_MAP['animal-handling']).toBe('wisdom');
  });

  it('should map deception to charisma', () => {
    expect(SKILL_ABILITY_MAP['deception']).toBe('charisma');
  });

  it('should map history to intelligence', () => {
    expect(SKILL_ABILITY_MAP['history']).toBe('intelligence');
  });

  it('should map insight to wisdom', () => {
    expect(SKILL_ABILITY_MAP['insight']).toBe('wisdom');
  });

  it('should map intimidation to charisma', () => {
    expect(SKILL_ABILITY_MAP['intimidation']).toBe('charisma');
  });

  it('should map investigation to intelligence', () => {
    expect(SKILL_ABILITY_MAP['investigation']).toBe('intelligence');
  });

  it('should map medicine to wisdom', () => {
    expect(SKILL_ABILITY_MAP['medicine']).toBe('wisdom');
  });

  it('should map nature to intelligence', () => {
    expect(SKILL_ABILITY_MAP['nature']).toBe('intelligence');
  });

  it('should map perception to wisdom', () => {
    expect(SKILL_ABILITY_MAP['perception']).toBe('wisdom');
  });

  it('should map performance to charisma', () => {
    expect(SKILL_ABILITY_MAP['performance']).toBe('charisma');
  });

  it('should map persuasion to charisma', () => {
    expect(SKILL_ABILITY_MAP['persuasion']).toBe('charisma');
  });

  it('should map religion to intelligence', () => {
    expect(SKILL_ABILITY_MAP['religion']).toBe('intelligence');
  });

  it('should map sleight-of-hand to dexterity', () => {
    expect(SKILL_ABILITY_MAP['sleight-of-hand']).toBe('dexterity');
  });

  it('should map stealth to dexterity', () => {
    expect(SKILL_ABILITY_MAP['stealth']).toBe('dexterity');
  });

  it('should map survival to wisdom', () => {
    expect(SKILL_ABILITY_MAP['survival']).toBe('wisdom');
  });
});

// -- SkillProficiency ---------------------------------------------------------

describe('SkillProficiency', () => {
  it('should define SkillProficiency with proficient and expertise boolean fields', () => {
    const proficient: SkillProficiency = {
      skill: 'athletics',
      proficient: true,
      expertise: false,
    };
    expect(proficient.proficient).toBe(true);
    expect(proficient.expertise).toBe(false);
  });

  it('should support expertise state', () => {
    const expertise: SkillProficiency = {
      skill: 'stealth',
      proficient: true,
      expertise: true,
    };
    expect(expertise.proficient).toBe(true);
    expect(expertise.expertise).toBe(true);
  });

  it('should support non-proficient state', () => {
    const nonProficient: SkillProficiency = {
      skill: 'arcana',
      proficient: false,
      expertise: false,
    };
    expect(nonProficient.proficient).toBe(false);
    expect(nonProficient.expertise).toBe(false);
  });
});

// -- SavingThrow --------------------------------------------------------------

describe('SavingThrow', () => {
  it('should define SavingThrow with ability and proficient fields', () => {
    const save: SavingThrow = { ability: 'dexterity', proficient: true };
    expect(save.ability).toBe('dexterity');
    expect(save.proficient).toBe(true);
  });
});

// -- PassiveScore -------------------------------------------------------------

describe('PassiveScore', () => {
  it('should define PassiveScore supporting any SkillName, not just Perception', () => {
    const passivePerception: PassiveScore = { skill: 'perception', value: 15 };
    const passiveInsight: PassiveScore = { skill: 'insight', value: 12 };
    const passiveInvestigation: PassiveScore = { skill: 'investigation', value: 10 };

    expect(passivePerception.skill).toBe('perception');
    expect(passiveInsight.skill).toBe('insight');
    expect(passiveInvestigation.skill).toBe('investigation');
  });

  it('should accept any skill name for passive score', () => {
    const passiveAthletics: PassiveScore = { skill: 'athletics', value: 14 };
    expect(passiveAthletics.skill).toBe('athletics');
    expect(passiveAthletics.value).toBe(14);
  });
});

// -- Alignment ----------------------------------------------------------------

describe('Alignment', () => {
  it('should define Alignment with all 9 standard alignments plus unaligned', () => {
    expect(ALIGNMENTS).toHaveLength(10);
    const expected: Alignment[] = [
      'lawful-good', 'neutral-good', 'chaotic-good',
      'lawful-neutral', 'true-neutral', 'chaotic-neutral',
      'lawful-evil', 'neutral-evil', 'chaotic-evil',
      'unaligned',
    ];
    for (const alignment of expected) {
      expect(ALIGNMENTS).toContain(alignment);
    }
  });
});

// -- Size ---------------------------------------------------------------------

describe('Size', () => {
  it('should define Size with all 6 size categories', () => {
    expect(SIZES).toHaveLength(6);
    const expected: Size[] = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'];
    for (const size of expected) {
      expect(SIZES).toContain(size);
    }
  });
});

// -- DieType ------------------------------------------------------------------

describe('DieType', () => {
  it('should define DieType with all 7 die types', () => {
    expect(DIE_TYPES).toHaveLength(7);
    const expected: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
    for (const die of expected) {
      expect(DIE_TYPES).toContain(die);
    }
  });
});

// -- Dice ---------------------------------------------------------------------

describe('Dice', () => {
  it('should be instantiable with count, die, and optional modifier', () => {
    const basicDice: Dice = { count: 2, die: 'd6' };
    expect(basicDice.count).toBe(2);
    expect(basicDice.die).toBe('d6');
    expect(basicDice.modifier).toBeUndefined();

    const withModifier: Dice = { count: 1, die: 'd20', modifier: 5 };
    expect(withModifier.modifier).toBe(5);
  });
});

// -- DamageType ---------------------------------------------------------------

describe('DamageType', () => {
  it('should define DamageType with all 13 damage types', () => {
    expect(DAMAGE_TYPES).toHaveLength(13);
    const expected: DamageType[] = [
      'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
      'necrotic', 'piercing', 'poison', 'psychic', 'radiant',
      'slashing', 'thunder',
    ];
    for (const type of expected) {
      expect(DAMAGE_TYPES).toContain(type);
    }
  });
});

// -- Condition ----------------------------------------------------------------

describe('Condition', () => {
  it('should define Condition with all 15 conditions', () => {
    expect(CONDITIONS).toHaveLength(15);
    const expected: Condition[] = [
      'blinded', 'charmed', 'deafened', 'frightened', 'grappled',
      'incapacitated', 'invisible', 'paralyzed', 'petrified',
      'poisoned', 'prone', 'restrained', 'stunned', 'unconscious',
      'exhaustion',
    ];
    for (const condition of expected) {
      expect(CONDITIONS).toContain(condition);
    }
  });
});

// -- Language -----------------------------------------------------------------

describe('Language', () => {
  it('should define Language with all 16 languages', () => {
    expect(LANGUAGES).toHaveLength(16);
    const expected: Language[] = [
      'common', 'dwarvish', 'elvish', 'giant', 'gnomish', 'goblin',
      'halfling', 'orc', 'abyssal', 'celestial', 'draconic',
      'deep-speech', 'infernal', 'primordial', 'sylvan', 'undercommon',
    ];
    for (const lang of expected) {
      expect(LANGUAGES).toContain(lang);
    }
  });
});

// -- Currency -----------------------------------------------------------------

describe('Currency', () => {
  it('should be instantiable with all 5 currency denominations', () => {
    const purse: Currency = { cp: 100, sp: 50, ep: 10, gp: 25, pp: 5 };
    expect(purse.cp).toBe(100);
    expect(purse.sp).toBe(50);
    expect(purse.ep).toBe(10);
    expect(purse.gp).toBe(25);
    expect(purse.pp).toBe(5);
  });
});

// -- ProficiencyType ----------------------------------------------------------

describe('ProficiencyType', () => {
  it('should define ProficiencyType with all 6 proficiency categories', () => {
    expect(PROFICIENCY_TYPES).toHaveLength(6);
    const expected: ProficiencyType[] = [
      'armor', 'weapon', 'tool', 'skill', 'saving-throw', 'language',
    ];
    for (const type of expected) {
      expect(PROFICIENCY_TYPES).toContain(type);
    }
  });
});

// -- Type Guards --------------------------------------------------------------

describe('Type Guards', () => {
  describe('isAbilityName', () => {
    it('should return true for valid ability names', () => {
      expect(isAbilityName('strength')).toBe(true);
      expect(isAbilityName('charisma')).toBe(true);
    });

    it('should return false for invalid ability names', () => {
      expect(isAbilityName('luck')).toBe(false);
      expect(isAbilityName('')).toBe(false);
    });
  });

  describe('isSkillName', () => {
    it('should return true for valid skill names', () => {
      expect(isSkillName('acrobatics')).toBe(true);
      expect(isSkillName('sleight-of-hand')).toBe(true);
    });

    it('should return false for invalid skill names', () => {
      expect(isSkillName('flying')).toBe(false);
      expect(isSkillName('')).toBe(false);
    });
  });

  describe('isAlignment', () => {
    it('should return true for valid alignments', () => {
      expect(isAlignment('lawful-good')).toBe(true);
      expect(isAlignment('unaligned')).toBe(true);
    });

    it('should return false for invalid alignments', () => {
      expect(isAlignment('super-good')).toBe(false);
    });
  });

  describe('isSize', () => {
    it('should return true for valid sizes', () => {
      expect(isSize('medium')).toBe(true);
      expect(isSize('gargantuan')).toBe(true);
    });

    it('should return false for invalid sizes', () => {
      expect(isSize('colossal')).toBe(false);
    });
  });

  describe('isDieType', () => {
    it('should return true for valid die types', () => {
      expect(isDieType('d20')).toBe(true);
      expect(isDieType('d100')).toBe(true);
    });

    it('should return false for invalid die types', () => {
      expect(isDieType('d3')).toBe(false);
    });
  });

  describe('isDamageType', () => {
    it('should return true for valid damage types', () => {
      expect(isDamageType('fire')).toBe(true);
      expect(isDamageType('thunder')).toBe(true);
    });

    it('should return false for invalid damage types', () => {
      expect(isDamageType('wind')).toBe(false);
    });
  });

  describe('isCondition', () => {
    it('should return true for valid conditions', () => {
      expect(isCondition('blinded')).toBe(true);
      expect(isCondition('exhaustion')).toBe(true);
    });

    it('should return false for invalid conditions', () => {
      expect(isCondition('confused')).toBe(false);
    });
  });

  describe('isLanguage', () => {
    it('should return true for valid languages', () => {
      expect(isLanguage('common')).toBe(true);
      expect(isLanguage('draconic')).toBe(true);
    });

    it('should return false for invalid languages', () => {
      expect(isLanguage('klingon')).toBe(false);
    });
  });

  describe('isProficiencyType', () => {
    it('should return true for valid proficiency types', () => {
      expect(isProficiencyType('armor')).toBe(true);
      expect(isProficiencyType('saving-throw')).toBe(true);
    });

    it('should return false for invalid proficiency types', () => {
      expect(isProficiencyType('magic')).toBe(false);
    });
  });
});
