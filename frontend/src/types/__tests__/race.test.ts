// =============================================================================
// Tests for Story 2.2 -- Race & Species Types
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  SENSE_TYPES,
  isMechanicalEffect,
  isRaceSelection,
} from '../race';
import type {
  MechanicalEffect,
  AbilityBonus,
  AbilityBonusChoice,
  Sense,
  SenseType,
  Resistance,
  ResistanceLevel,
  RaceTrait,
  InnateSpellcasting,
  InnateSpell,
  Subrace,
  Race,
  RaceSelection,
} from '../race';

// -- MechanicalEffect ---------------------------------------------------------

describe('MechanicalEffect', () => {
  it('should define MechanicalEffect as discriminated union with type field for runtime discrimination', () => {
    const acCalc: MechanicalEffect = {
      type: 'acCalculation',
      formula: '10 + DEX + CON',
      description: 'Unarmored Defense',
    };
    expect(acCalc.type).toBe('acCalculation');

    const bonusDmg: MechanicalEffect = {
      type: 'bonusDamage',
      dice: '2d6',
      damageType: 'fire',
      description: 'Rage damage',
    };
    expect(bonusDmg.type).toBe('bonusDamage');

    const profMod: MechanicalEffect = {
      type: 'proficiencyModifier',
      modifier: 'double',
      description: 'Expertise',
    };
    expect(profMod.type).toBe('proficiencyModifier');
  });

  it('should support resistance type effects', () => {
    const resistance: MechanicalEffect = {
      type: 'resistance',
      damageType: 'poison',
      description: 'Dwarven Resilience',
    };
    expect(resistance.type).toBe('resistance');
  });

  it('should support advantage type effects', () => {
    const advantage: MechanicalEffect = {
      type: 'advantage',
      condition: 'saving throws against being charmed',
      description: 'Fey Ancestry',
    };
    expect(advantage.type).toBe('advantage');
  });

  it('should support skill proficiency effects', () => {
    const skillProf: MechanicalEffect = {
      type: 'skillProficiency',
      skill: 'perception',
      description: 'Keen Senses',
    };
    expect(skillProf.type).toBe('skillProficiency');
  });

  it('should support speed modifier effects', () => {
    const speedMod: MechanicalEffect = {
      type: 'speedModifier',
      value: 5,
      description: 'Fleet of Foot',
    };
    expect(speedMod.type).toBe('speedModifier');
  });

  it('should support custom effects', () => {
    const custom: MechanicalEffect = {
      type: 'custom',
      value: 'reroll natural 1s on attack, ability check, or saving throw',
      description: 'Lucky',
    };
    expect(custom.type).toBe('custom');
  });
});

// -- isMechanicalEffect type guard --------------------------------------------

describe('isMechanicalEffect', () => {
  it('should return true for valid MechanicalEffect objects', () => {
    expect(isMechanicalEffect({
      type: 'resistance',
      damageType: 'fire',
      description: 'Fire resistance',
    })).toBe(true);
  });

  it('should return false for null', () => {
    expect(isMechanicalEffect(null)).toBe(false);
  });

  it('should return false for primitives', () => {
    expect(isMechanicalEffect('string')).toBe(false);
    expect(isMechanicalEffect(42)).toBe(false);
  });

  it('should return false for objects missing type field', () => {
    expect(isMechanicalEffect({ description: 'test' })).toBe(false);
  });

  it('should return false for objects missing description field', () => {
    expect(isMechanicalEffect({ type: 'resistance' })).toBe(false);
  });
});

// -- AbilityBonus -------------------------------------------------------------

describe('AbilityBonus', () => {
  it('should define AbilityBonus with abilityName and bonus', () => {
    const bonus: AbilityBonus = { abilityName: 'constitution', bonus: 2 };
    expect(bonus.abilityName).toBe('constitution');
    expect(bonus.bonus).toBe(2);
  });
});

// -- AbilityBonusChoice -------------------------------------------------------

describe('AbilityBonusChoice', () => {
  it('should define AbilityBonusChoice for Half-Elf style choices', () => {
    const choice: AbilityBonusChoice = {
      choose: 2,
      from: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom'],
      bonus: 1,
    };
    expect(choice.choose).toBe(2);
    expect(choice.from).toHaveLength(5);
    expect(choice.bonus).toBe(1);
  });
});

// -- SenseType ----------------------------------------------------------------

describe('SenseType', () => {
  it('should define SenseType supporting darkvision, blindsight, tremorsense, truesight', () => {
    expect(SENSE_TYPES).toHaveLength(4);
    const expected: SenseType[] = ['darkvision', 'blindsight', 'tremorsense', 'truesight'];
    for (const sense of expected) {
      expect(SENSE_TYPES).toContain(sense);
    }
  });
});

// -- Sense --------------------------------------------------------------------

describe('Sense', () => {
  it('should define Sense interface with type and range', () => {
    const darkvision: Sense = { type: 'darkvision', range: 60 };
    expect(darkvision.type).toBe('darkvision');
    expect(darkvision.range).toBe(60);
  });

  it('should support superior darkvision range', () => {
    const superiorDarkvision: Sense = { type: 'darkvision', range: 120 };
    expect(superiorDarkvision.range).toBe(120);
  });
});

// -- Resistance ---------------------------------------------------------------

describe('Resistance', () => {
  it('should define Resistance interface with damageType and resistance/immunity/vulnerability type', () => {
    const levels: ResistanceLevel[] = ['resistance', 'immunity', 'vulnerability'];
    for (const level of levels) {
      const res: Resistance = { damageType: 'fire', type: level };
      expect(res.type).toBe(level);
    }
  });

  it('should support poison resistance (Dwarven Resilience)', () => {
    const dwarvenRes: Resistance = { damageType: 'poison', type: 'resistance' };
    expect(dwarvenRes.damageType).toBe('poison');
    expect(dwarvenRes.type).toBe('resistance');
  });
});

// -- RacialTrait --------------------------------------------------------------

describe('RaceTrait', () => {
  it('should define RaceTrait with id, name, and description', () => {
    const trait: RaceTrait = {
      id: 'dwarven-resilience',
      name: 'Dwarven Resilience',
      description: 'You have advantage on saving throws against poison.',
    };
    expect(trait.id).toBe('dwarven-resilience');
    expect(trait.name).toBe('Dwarven Resilience');
    expect(trait.mechanicalEffect).toBeUndefined();
  });

  it('should allow RacialTrait to have optional mechanicalEffect', () => {
    const trait: RaceTrait = {
      id: 'dwarven-resilience',
      name: 'Dwarven Resilience',
      description: 'You have advantage on saving throws against poison.',
      mechanicalEffect: {
        type: 'advantage',
        condition: 'saving throws against poison',
        description: 'Dwarven Resilience',
      },
    };
    expect(trait.mechanicalEffect).toBeDefined();
    expect(trait.mechanicalEffect!.type).toBe('advantage');
  });
});

// -- InnateSpellcasting -------------------------------------------------------

describe('InnateSpellcasting', () => {
  it('should define InnateSpellcasting with ability and spells', () => {
    const tieflingCasting: InnateSpellcasting = {
      ability: 'charisma',
      spells: [
        { spellId: 'thaumaturgy', levelRequired: 1, atWill: true },
        { spellId: 'hellish-rebuke', levelRequired: 3, usesPerLongRest: 1 },
        { spellId: 'darkness', levelRequired: 5, usesPerLongRest: 1 },
      ],
    };
    expect(tieflingCasting.ability).toBe('charisma');
    expect(tieflingCasting.spells).toHaveLength(3);
  });

  it('should support at-will cantrips', () => {
    const spell: InnateSpell = {
      spellId: 'thaumaturgy',
      levelRequired: 1,
      atWill: true,
    };
    expect(spell.atWill).toBe(true);
    expect(spell.usesPerLongRest).toBeUndefined();
  });
});

// -- Subrace ------------------------------------------------------------------

describe('Subrace', () => {
  it('should define Subrace interface with own abilityScoreIncrease and traits', () => {
    const hillDwarf: Subrace = {
      id: 'hill-dwarf',
      name: 'Hill Dwarf',
      description: 'As a hill dwarf, you have keen senses, deep intuition, and remarkable resilience.',
      abilityScoreIncrease: { wisdom: 1 },
      traits: [
        {
          id: 'dwarven-toughness',
          name: 'Dwarven Toughness',
          description: 'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.',
        },
      ],
    };
    expect(hillDwarf.id).toBe('hill-dwarf');
    expect(hillDwarf.abilityScoreIncrease.wisdom).toBe(1);
    expect(hillDwarf.traits).toHaveLength(1);
  });

  it('should support optional additionalLanguages', () => {
    const subrace: Subrace = {
      id: 'test-subrace',
      name: 'Test',
      description: 'Test subrace',
      abilityScoreIncrease: {},
      traits: [],
      additionalLanguages: ['elvish'],
    };
    expect(subrace.additionalLanguages).toEqual(['elvish']);
  });

  it('should support optional senses', () => {
    const drow: Subrace = {
      id: 'drow',
      name: 'Dark Elf (Drow)',
      description: 'Descended from an earlier subrace of dark-skinned elves.',
      abilityScoreIncrease: { charisma: 1 },
      traits: [],
      senses: [{ type: 'darkvision', range: 120 }],
    };
    expect(drow.senses).toHaveLength(1);
    expect(drow.senses![0].range).toBe(120);
  });
});

// -- Race ---------------------------------------------------------------------

describe('Race', () => {
  it('should define Race interface with all required fields', () => {
    const dwarf: Race = {
      id: 'dwarf',
      name: 'Dwarf',
      description: 'Bold and hardy, dwarves are known as skilled warriors.',
      abilityScoreIncrease: { constitution: 2 },
      age: 'Dwarves mature at 50 and live to about 350.',
      size: 'medium',
      speed: 25,
      senses: [{ type: 'darkvision', range: 60 }],
      traits: [
        {
          id: 'dwarven-resilience',
          name: 'Dwarven Resilience',
          description: 'Advantage on saving throws vs poison, resistance to poison damage.',
        },
      ],
      languages: ['common', 'dwarvish'],
      subraces: [],
    };
    expect(dwarf.id).toBe('dwarf');
    expect(dwarf.name).toBe('Dwarf');
    expect(dwarf.size).toBe('medium');
    expect(dwarf.speed).toBe(25);
    expect(dwarf.senses).toHaveLength(1);
    expect(dwarf.languages).toContain('common');
    expect(dwarf.languages).toContain('dwarvish');
  });

  it('should support optional abilityBonusChoices (Half-Elf)', () => {
    const halfElf: Race = {
      id: 'half-elf',
      name: 'Half-Elf',
      description: 'Half-elves combine human and elven traits.',
      abilityScoreIncrease: { charisma: 2 },
      abilityBonusChoices: [
        { choose: 2, from: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom'], bonus: 1 },
      ],
      age: 'Half-elves mature at 20 and live to about 180.',
      size: 'medium',
      speed: 30,
      senses: [{ type: 'darkvision', range: 60 }],
      traits: [],
      languages: ['common', 'elvish'],
      languageChoices: 1,
      subraces: [],
    };
    expect(halfElf.abilityBonusChoices).toHaveLength(1);
    expect(halfElf.abilityBonusChoices![0].choose).toBe(2);
    expect(halfElf.languageChoices).toBe(1);
  });

  it('should support optional proficiencies', () => {
    const race: Race = {
      id: 'dwarf',
      name: 'Dwarf',
      description: 'Test',
      abilityScoreIncrease: { constitution: 2 },
      age: 'Test',
      size: 'medium',
      speed: 25,
      senses: [],
      traits: [],
      languages: ['common', 'dwarvish'],
      subraces: [],
      proficiencies: ['battleaxe', 'handaxe', 'light hammer', 'warhammer'],
    };
    expect(race.proficiencies).toHaveLength(4);
  });

  it('should support optional resistances', () => {
    const race: Race = {
      id: 'dwarf',
      name: 'Dwarf',
      description: 'Test',
      abilityScoreIncrease: { constitution: 2 },
      age: 'Test',
      size: 'medium',
      speed: 25,
      senses: [],
      traits: [],
      languages: ['common', 'dwarvish'],
      subraces: [],
      resistances: [{ damageType: 'poison', type: 'resistance' }],
    };
    expect(race.resistances).toHaveLength(1);
  });

  it('should support optional innateSpellcasting (Tiefling)', () => {
    const tiefling: Race = {
      id: 'tiefling',
      name: 'Tiefling',
      description: 'Tieflings carry an infernal legacy.',
      abilityScoreIncrease: { charisma: 2, intelligence: 1 },
      age: 'Same rate as humans.',
      size: 'medium',
      speed: 30,
      senses: [{ type: 'darkvision', range: 60 }],
      traits: [],
      languages: ['common', 'infernal'],
      subraces: [],
      innateSpellcasting: {
        ability: 'charisma',
        spells: [
          { spellId: 'thaumaturgy', levelRequired: 1, atWill: true },
        ],
      },
    };
    expect(tiefling.innateSpellcasting).toBeDefined();
    expect(tiefling.innateSpellcasting!.ability).toBe('charisma');
  });
});

// -- RaceSelection ------------------------------------------------------------

describe('RaceSelection', () => {
  it('should define RaceSelection capturing raceId, subraceId, chosenLanguages, chosenCantrip, chosenSkills', () => {
    const selection: RaceSelection = {
      raceId: 'half-elf',
      chosenAbilityBonuses: [
        { abilityName: 'dexterity', bonus: 1 },
        { abilityName: 'constitution', bonus: 1 },
      ],
      chosenLanguages: ['draconic'],
      chosenSkills: ['perception', 'persuasion'],
    };
    expect(selection.raceId).toBe('half-elf');
    expect(selection.chosenAbilityBonuses).toHaveLength(2);
    expect(selection.chosenLanguages).toEqual(['draconic']);
    expect(selection.chosenSkills).toEqual(['perception', 'persuasion']);
  });

  it('should support minimal selection with just raceId', () => {
    const selection: RaceSelection = { raceId: 'human' };
    expect(selection.raceId).toBe('human');
    expect(selection.subraceId).toBeUndefined();
  });

  it('should support subraceId for races with subraces', () => {
    const selection: RaceSelection = {
      raceId: 'dwarf',
      subraceId: 'hill-dwarf',
    };
    expect(selection.subraceId).toBe('hill-dwarf');
  });

  it('should support chosenCantrip for High Elf', () => {
    const selection: RaceSelection = {
      raceId: 'elf',
      subraceId: 'high-elf',
      chosenCantrip: 'fire-bolt',
    };
    expect(selection.chosenCantrip).toBe('fire-bolt');
  });

  it('should support chosenFeat for Variant Human', () => {
    const selection: RaceSelection = {
      raceId: 'human',
      subraceId: 'variant-human',
      chosenAbilityBonuses: [
        { abilityName: 'dexterity', bonus: 1 },
        { abilityName: 'wisdom', bonus: 1 },
      ],
      chosenSkills: ['perception'],
      chosenFeat: 'alert',
    };
    expect(selection.chosenFeat).toBe('alert');
  });
});

// -- isRaceSelection type guard -----------------------------------------------

describe('isRaceSelection', () => {
  it('should return true for valid RaceSelection objects', () => {
    expect(isRaceSelection({ raceId: 'elf' })).toBe(true);
  });

  it('should return false for null', () => {
    expect(isRaceSelection(null)).toBe(false);
  });

  it('should return false for objects without raceId', () => {
    expect(isRaceSelection({ subraceId: 'hill-dwarf' })).toBe(false);
  });

  it('should return false for primitives', () => {
    expect(isRaceSelection('elf')).toBe(false);
    expect(isRaceSelection(42)).toBe(false);
  });
});
