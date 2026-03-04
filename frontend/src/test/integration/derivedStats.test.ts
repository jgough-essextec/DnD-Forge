/**
 * Derived Stat Computation Integration Tests
 *
 * Verifies that the calculation engine produces correct derived stats
 * (AC, HP, spell save DC, proficiency bonus, skill modifiers, saving throws,
 * attack bonuses) for various class/race combinations at level 1.
 */

import { describe, it, expect } from 'vitest';

import {
  getModifier,
  getArmorClass,
  getMaxHitPoints,
  getAttackBonus,
  getDamageBonus,
  getInitiativeModifier,
  getProficiencyBonus,
  getAllSkillModifiers,
  getAllSavingThrows,
  getSavingThrowBonus,
  getSkillModifier,
  getSpellSaveDC,
  getSpellAttackBonus,
} from '@/utils/calculations';

import { CLASSES } from '@/data/classes';
import { races } from '@/data/races';
import type { AbilityScores, SkillProficiency, SkillName, AbilityName } from '@/types/core';
import type { Character } from '@/types/character';
import type { ArmorClassParams, MaxHitPointsParams } from '@/utils/calculations';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

/** Standard ability scores for a Human Fighter: STR-focused build */
const FIGHTER_ABILITY_SCORES: AbilityScores = {
  strength: 16,   // 15 base + 1 human racial
  dexterity: 13,  // 12 base + 1 human racial
  constitution: 14, // 13 base + 1 human racial
  intelligence: 9, // 8 base + 1 human racial
  wisdom: 11,      // 10 base + 1 human racial
  charisma: 11,    // 10 base + 1 human racial -- standard array uses 10 twice for 10 and 14 positions
};

/** Standard ability scores for a High Elf Wizard: INT-focused build */
const WIZARD_ABILITY_SCORES: AbilityScores = {
  strength: 8,
  dexterity: 14,   // 12 base + 2 elf racial
  constitution: 14, // 14 base
  intelligence: 16, // 15 base + 1 high elf racial
  wisdom: 12,       // 12 base
  charisma: 10,
};

// ---------------------------------------------------------------------------
// Armor Class Tests
// ---------------------------------------------------------------------------

describe('Armor Class Calculations', () => {
  it('Level 1 Human Fighter with Chain Mail + Shield returns AC 18', () => {
    // Chain Mail: baseAC=16, category=heavy, dexCap=0
    // Shield adds +2
    // Total = 16 + 2 = 18
    const ac = getArmorClass({
      armor: { baseAC: 16, category: 'heavy', dexCap: 0 },
      shield: true,
      dexModifier: getModifier(FIGHTER_ABILITY_SCORES.dexterity), // +1
    });
    expect(ac).toBe(18);
  });

  it('Level 1 Human Fighter with Chain Mail only returns AC 16', () => {
    const ac = getArmorClass({
      armor: { baseAC: 16, category: 'heavy', dexCap: 0 },
      shield: false,
      dexModifier: getModifier(FIGHTER_ABILITY_SCORES.dexterity),
    });
    expect(ac).toBe(16);
  });

  it('Level 1 Human Fighter with Leather Armor returns AC 12', () => {
    // Leather: baseAC=11, category=light, dexCap=null (uncapped)
    // AC = 11 + DEX mod (1) = 12
    const ac = getArmorClass({
      armor: { baseAC: 11, category: 'light', dexCap: null },
      shield: false,
      dexModifier: getModifier(FIGHTER_ABILITY_SCORES.dexterity),
    });
    expect(ac).toBe(12);
  });

  it('Level 1 High Elf Wizard unarmored returns AC 12', () => {
    // Unarmored: 10 + DEX mod (2) = 12
    const ac = getArmorClass({
      dexModifier: getModifier(WIZARD_ABILITY_SCORES.dexterity), // +2
    });
    expect(ac).toBe(12);
  });

  it('Barbarian Unarmored Defense formula uses DEX + CON', () => {
    // Barbarian Unarmored Defense: 10 + DEX mod + CON mod
    const ac = getArmorClass({
      dexModifier: 2,
      conModifier: 3,
      specialFormula: 'barbarian-unarmored',
    });
    expect(ac).toBe(15); // 10 + 2 + 3
  });

  it('Monk Unarmored Defense formula uses DEX + WIS', () => {
    // Monk Unarmored Defense: 10 + DEX mod + WIS mod
    const ac = getArmorClass({
      dexModifier: 3,
      wisModifier: 2,
      specialFormula: 'monk-unarmored',
    });
    expect(ac).toBe(15); // 10 + 3 + 2
  });

  it('Defense fighting style adds +1 when wearing armor', () => {
    const ac = getArmorClass({
      armor: { baseAC: 16, category: 'heavy', dexCap: 0 },
      shield: true,
      dexModifier: 1,
      defenseFightingStyle: true,
    });
    // 16 (chain mail) + 2 (shield) + 1 (defense) = 19
    expect(ac).toBe(19);
  });

  it('Defense fighting style does NOT add +1 when unarmored', () => {
    const ac = getArmorClass({
      dexModifier: 2,
      defenseFightingStyle: true,
    });
    // 10 + 2 = 12, no +1 because not wearing armor
    expect(ac).toBe(12);
  });

  it('Medium armor caps DEX bonus at +2', () => {
    // Scale Mail: baseAC=14, category=medium, dexCap=2
    const ac = getArmorClass({
      armor: { baseAC: 14, category: 'medium', dexCap: 2 },
      dexModifier: 4, // High DEX but capped at 2
    });
    expect(ac).toBe(16); // 14 + 2 (capped)
  });
});

// ---------------------------------------------------------------------------
// Hit Points Tests
// ---------------------------------------------------------------------------

describe('Hit Point Calculations', () => {
  it('Level 1 Human Fighter (d10, CON 14) has 12 HP', () => {
    // Fighter hit die = d10 = 10 at level 1
    // CON modifier = +2 (from score of 14)
    // Total = 10 + 2 = 12
    const hp = getMaxHitPoints({
      hitDie: 10,
      level: 1,
      conModifier: getModifier(FIGHTER_ABILITY_SCORES.constitution), // +2
    });
    expect(hp).toBe(12);
  });

  it('Level 1 High Elf Wizard (d6, CON 14) has 8 HP', () => {
    // Wizard hit die = d6 = 6 at level 1
    // CON modifier = +2 (from score of 14)
    // Total = 6 + 2 = 8
    const hp = getMaxHitPoints({
      hitDie: 6,
      level: 1,
      conModifier: getModifier(WIZARD_ABILITY_SCORES.constitution), // +2
    });
    expect(hp).toBe(8);
  });

  it('Level 1 Barbarian (d12, CON 16) has 15 HP', () => {
    const hp = getMaxHitPoints({
      hitDie: 12,
      level: 1,
      conModifier: 3, // CON 16
    });
    expect(hp).toBe(15); // 12 + 3
  });

  it('Level 2 Fighter with rolled HP uses roll value', () => {
    const hp = getMaxHitPoints({
      hitDie: 10,
      level: 2,
      conModifier: 2,
      hpRolls: [7], // rolled 7 for level 2
    });
    // Level 1: 10 + 2 = 12
    // Level 2: 7 + 2 = 9
    // Total: 12 + 9 = 21
    expect(hp).toBe(21);
  });

  it('Level 2 Fighter without rolls uses average HP', () => {
    const hp = getMaxHitPoints({
      hitDie: 10,
      level: 2,
      conModifier: 2,
    });
    // Level 1: 10 + 2 = 12
    // Level 2: average(d10) = floor(10/2) + 1 = 6, plus CON +2 = 8
    // Total: 12 + 8 = 20
    expect(hp).toBe(20);
  });

  it('Tough feat adds +2 per level', () => {
    const hp = getMaxHitPoints({
      hitDie: 10,
      level: 1,
      conModifier: 2,
      toughFeat: true,
    });
    // 10 + 2 + 2 (tough) = 14
    expect(hp).toBe(14);
  });

  it('Minimum 1 HP per level even with negative CON', () => {
    const hp = getMaxHitPoints({
      hitDie: 6,
      level: 1,
      conModifier: -5, // CON 1
    });
    // max(1, 6 + (-5)) = max(1, 1) = 1
    expect(hp).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Spell Save DC & Spell Attack Bonus Tests
// ---------------------------------------------------------------------------

describe('Spellcasting Stat Calculations', () => {
  it('Level 1 High Elf Wizard with INT 16 has spell save DC 13', () => {
    // DC = 8 + proficiency bonus + INT modifier
    // = 8 + 2 + 3 = 13
    const dc = getSpellSaveDC(
      getModifier(WIZARD_ABILITY_SCORES.intelligence), // +3
      getProficiencyBonus(1), // +2
    );
    expect(dc).toBe(13);
  });

  it('Level 1 High Elf Wizard with INT 16 has spell attack bonus +5', () => {
    // Attack bonus = proficiency bonus + INT modifier
    // = 2 + 3 = 5
    const bonus = getSpellAttackBonus(
      getModifier(WIZARD_ABILITY_SCORES.intelligence), // +3
      getProficiencyBonus(1), // +2
    );
    expect(bonus).toBe(5);
  });

  it('Level 5 Cleric with WIS 18 has spell save DC 15', () => {
    // DC = 8 + 3 (prof at L5) + 4 (WIS mod) = 15
    const dc = getSpellSaveDC(getModifier(18), getProficiencyBonus(5));
    expect(dc).toBe(15);
  });
});

// ---------------------------------------------------------------------------
// Proficiency Bonus Tests
// ---------------------------------------------------------------------------

describe('Proficiency Bonus', () => {
  it('is +2 at level 1 for all classes', () => {
    for (const cls of CLASSES) {
      // Every class at level 1 has proficiency bonus +2
      expect(getProficiencyBonus(1)).toBe(2);
    }
  });

  it('scales correctly from +2 to +6 across levels', () => {
    expect(getProficiencyBonus(1)).toBe(2);
    expect(getProficiencyBonus(4)).toBe(2);
    expect(getProficiencyBonus(5)).toBe(3);
    expect(getProficiencyBonus(8)).toBe(3);
    expect(getProficiencyBonus(9)).toBe(4);
    expect(getProficiencyBonus(12)).toBe(4);
    expect(getProficiencyBonus(13)).toBe(5);
    expect(getProficiencyBonus(16)).toBe(5);
    expect(getProficiencyBonus(17)).toBe(6);
    expect(getProficiencyBonus(20)).toBe(6);
  });

  it('throws RangeError for level 0 or level 21', () => {
    expect(() => getProficiencyBonus(0)).toThrow(RangeError);
    expect(() => getProficiencyBonus(21)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// Skill Modifier Tests
// ---------------------------------------------------------------------------

describe('Skill Modifier Calculations', () => {
  it('computes correct modifier for proficient skill', () => {
    // Athletics with STR 16 (mod +3), proficient at level 1 (prof +2)
    const mod = getSkillModifier(
      16,
      { skill: 'athletics', proficient: true, expertise: false },
      1,
    );
    expect(mod).toBe(5); // 3 + 2
  });

  it('computes correct modifier for non-proficient skill', () => {
    // Arcana with INT 9 (mod -1), not proficient
    const mod = getSkillModifier(
      9,
      { skill: 'arcana', proficient: false, expertise: false },
      1,
    );
    expect(mod).toBe(-1); // just ability modifier
  });

  it('computes correct modifier for expertise skill', () => {
    // Stealth with DEX 16 (mod +3), expertise at level 1 (prof +2, doubled = +4)
    const mod = getSkillModifier(
      16,
      { skill: 'stealth', proficient: true, expertise: true },
      1,
    );
    expect(mod).toBe(7); // 3 + 2*2
  });

  it('getAllSkillModifiers returns all 18 skills', () => {
    const proficiencies: SkillProficiency[] = [
      { skill: 'athletics', proficient: true, expertise: false },
      { skill: 'intimidation', proficient: true, expertise: false },
    ];

    const mods = getAllSkillModifiers(FIGHTER_ABILITY_SCORES, proficiencies, 1);

    // Should have all 18 skills
    expect(Object.keys(mods).length).toBe(18);

    // Athletics: STR 16 (mod +3) + prof +2 = +5
    expect(mods['athletics']).toBe(5);
    // Intimidation: CHA 11 (mod +0) + prof +2 = +2
    expect(mods['intimidation']).toBe(2);
    // Acrobatics: DEX 13 (mod +1), not proficient = +1
    expect(mods['acrobatics']).toBe(1);
    // Arcana: INT 9 (mod -1), not proficient = -1
    expect(mods['arcana']).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// Saving Throw Tests
// ---------------------------------------------------------------------------

describe('Saving Throw Calculations', () => {
  it('Fighter proficient in STR and CON saves', () => {
    // STR save: STR 16 (mod +3) + prof +2 = +5
    const strSave = getSavingThrowBonus(
      FIGHTER_ABILITY_SCORES.strength,
      true, // proficient
      1,
    );
    expect(strSave).toBe(5);

    // CON save: CON 14 (mod +2) + prof +2 = +4
    const conSave = getSavingThrowBonus(
      FIGHTER_ABILITY_SCORES.constitution,
      true,
      1,
    );
    expect(conSave).toBe(4);
  });

  it('Fighter not proficient in DEX save', () => {
    // DEX save: DEX 13 (mod +1), not proficient = +1
    const dexSave = getSavingThrowBonus(
      FIGHTER_ABILITY_SCORES.dexterity,
      false,
      1,
    );
    expect(dexSave).toBe(1);
  });

  it('Wizard proficient in INT and WIS saves', () => {
    // INT save: INT 16 (mod +3) + prof +2 = +5
    const intSave = getSavingThrowBonus(
      WIZARD_ABILITY_SCORES.intelligence,
      true,
      1,
    );
    expect(intSave).toBe(5);

    // WIS save: WIS 12 (mod +1) + prof +2 = +3
    const wisSave = getSavingThrowBonus(
      WIZARD_ABILITY_SCORES.wisdom,
      true,
      1,
    );
    expect(wisSave).toBe(3);
  });

  it('getAllSavingThrows returns all 6 abilities', () => {
    // Build a minimal character for getAllSavingThrows
    const character = buildMinimalCharacter({
      abilityScores: FIGHTER_ABILITY_SCORES,
      savingThrows: ['strength', 'constitution'],
      level: 1,
    });

    const saves = getAllSavingThrows(character);
    expect(Object.keys(saves).length).toBe(6);

    // Proficient saves
    expect(saves.strength).toBe(5);  // +3 mod + 2 prof
    expect(saves.constitution).toBe(4); // +2 mod + 2 prof

    // Non-proficient saves
    expect(saves.dexterity).toBe(1);  // +1 mod
    expect(saves.intelligence).toBe(-1); // -1 mod
    expect(saves.wisdom).toBe(0);     // +0 mod
    expect(saves.charisma).toBe(0);   // +0 mod
  });
});

// ---------------------------------------------------------------------------
// Attack Bonus Tests
// ---------------------------------------------------------------------------

describe('Attack Bonus Calculations', () => {
  it('melee attack with STR 16, proficient at level 1', () => {
    // Attack bonus = STR mod (+3) + proficiency bonus (+2) = +5
    const bonus = getAttackBonus(
      getModifier(FIGHTER_ABILITY_SCORES.strength), // +3
      getProficiencyBonus(1), // +2
    );
    expect(bonus).toBe(5);
  });

  it('ranged attack with DEX 14, proficient at level 1', () => {
    // Attack bonus = DEX mod (+2) + proficiency bonus (+2) = +4
    const bonus = getAttackBonus(
      getModifier(WIZARD_ABILITY_SCORES.dexterity), // +2
      getProficiencyBonus(1), // +2
    );
    expect(bonus).toBe(4);
  });

  it('archery fighting style adds +2 to ranged attacks', () => {
    // DEX mod (+1) + prof (+2) + archery (+2) = +5
    const bonus = getAttackBonus(
      getModifier(FIGHTER_ABILITY_SCORES.dexterity), // +1
      getProficiencyBonus(1), // +2
      2, // archery fighting style
    );
    expect(bonus).toBe(5);
  });

  it('damage bonus equals ability modifier only', () => {
    const dmg = getDamageBonus(getModifier(FIGHTER_ABILITY_SCORES.strength));
    expect(dmg).toBe(3); // STR mod +3
  });

  it('dueling fighting style adds +2 to damage', () => {
    const dmg = getDamageBonus(
      getModifier(FIGHTER_ABILITY_SCORES.strength),
      2, // dueling
    );
    expect(dmg).toBe(5); // 3 + 2
  });
});

// ---------------------------------------------------------------------------
// Initiative Tests
// ---------------------------------------------------------------------------

describe('Initiative Calculations', () => {
  it('initiative equals DEX modifier for standard characters', () => {
    const init = getInitiativeModifier(
      getModifier(FIGHTER_ABILITY_SCORES.dexterity), // +1
    );
    expect(init).toBe(1);
  });

  it('Alert feat adds +5 to initiative', () => {
    const init = getInitiativeModifier(
      getModifier(FIGHTER_ABILITY_SCORES.dexterity), // +1
      5, // Alert feat
    );
    expect(init).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// All 12 Classes Produce Valid Stats at Level 1
// ---------------------------------------------------------------------------

describe('All 12 classes produce valid derived stats at level 1', () => {
  // Map class IDs to their saving throw abilities (for verification)
  const classSavingThrows: Record<string, [AbilityName, AbilityName]> = {
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

  const defaultScores: AbilityScores = {
    strength: 14,
    dexterity: 14,
    constitution: 14,
    intelligence: 14,
    wisdom: 14,
    charisma: 14,
  };

  for (const cls of CLASSES) {
    describe(`${cls.name} (${cls.id})`, () => {
      it('has a positive proficiency bonus at level 1', () => {
        expect(getProficiencyBonus(1)).toBe(2);
      });

      it('computes valid max HP at level 1', () => {
        const hp = getMaxHitPoints({
          hitDie: cls.hitDie,
          level: 1,
          conModifier: getModifier(defaultScores.constitution), // +2
        });
        // HP should be hit die + CON mod, minimum 1
        expect(hp).toBe(cls.hitDie + 2);
        expect(hp).toBeGreaterThan(0);
      });

      it('computes valid saving throw bonuses', () => {
        const saves = classSavingThrows[cls.id];
        expect(saves).toBeDefined();

        if (saves) {
          // Proficient saving throw: ability mod (+2) + prof (+2) = +4
          const profSave = getSavingThrowBonus(
            defaultScores[saves[0]],
            true,
            1,
          );
          expect(profSave).toBe(4);

          // Non-proficient saving throw: just ability mod (+2)
          // Find an ability NOT in saving throws for this class
          const allAbilities: AbilityName[] = [
            'strength', 'dexterity', 'constitution',
            'intelligence', 'wisdom', 'charisma',
          ];
          const nonProfAbility = allAbilities.find(
            (a) => !saves.includes(a),
          )!;
          const nonProfSave = getSavingThrowBonus(
            defaultScores[nonProfAbility],
            false,
            1,
          );
          expect(nonProfSave).toBe(2); // just ability mod
        }
      });

      it('computes valid skill modifiers', () => {
        const proficiencies: SkillProficiency[] = [];
        const mods = getAllSkillModifiers(defaultScores, proficiencies, 1);

        // All 18 skills should be present
        expect(Object.keys(mods).length).toBe(18);

        // All non-proficient with 14 in every stat: each mod should be +2
        for (const [, mod] of Object.entries(mods)) {
          expect(mod).toBe(2);
        }
      });

      it('computes a valid attack bonus with proficiency', () => {
        const primaryAbility = cls.primaryAbility[0];
        const abilityMod = getModifier(defaultScores[primaryAbility]);
        const attackBonus = getAttackBonus(abilityMod, getProficiencyBonus(1));
        // Should be ability mod + prof bonus = 2 + 2 = 4
        expect(attackBonus).toBe(4);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// Helper: Build a minimal Character object for character-level functions
// ---------------------------------------------------------------------------

function buildMinimalCharacter(params: {
  abilityScores: AbilityScores;
  savingThrows: AbilityName[];
  level: number;
  classId?: string;
  skills?: SkillProficiency[];
}): Character {
  return {
    id: 'test-character',
    name: 'Test Character',
    playerName: 'Test Player',
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human' },
    classes: [{
      classId: params.classId ?? 'fighter',
      level: params.level,
      chosenSkills: [],
      hpRolls: [],
    }],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: 'Test Character' },
      characterPersonality: {
        personalityTraits: ['Brave', 'Loyal'],
        ideal: 'Honor',
        bond: 'My unit',
        flaw: 'Stubborn',
      },
    },
    alignment: 'true-neutral',
    baseAbilityScores: params.abilityScores,
    abilityScores: params.abilityScores,
    abilityScoreMethod: 'standard',
    level: params.level,
    experiencePoints: 0,
    hpMax: 12,
    hpCurrent: 12,
    tempHp: 0,
    hitDiceTotal: [1],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 16, dexModifier: 0, shieldBonus: 2, otherBonuses: [], formula: 'chain mail + shield' },
      initiative: 1,
      speed: { walk: 30 },
      hitPoints: { maximum: 12, current: 12, temporary: 0, hitDice: { total: [{ count: 1, die: 'd10' }], used: [0] } },
      attacks: [],
      savingThrows: {},
    },
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: ['common'],
      skills: params.skills ?? [],
      savingThrows: params.savingThrows,
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
    feats: [],
    description: {
      name: 'Test Character',
      age: '',
      height: '',
      weight: '',
      eyes: '',
      skin: '',
      hair: '',
      appearance: '',
      backstory: '',
      alliesAndOrgs: '',
      treasure: '',
    },
    personality: {
      personalityTraits: ['Brave', 'Loyal'],
      ideal: 'Honor',
      bond: 'My unit',
      flaw: 'Stubborn',
    },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
  };
}
