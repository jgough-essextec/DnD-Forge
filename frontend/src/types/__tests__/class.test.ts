// =============================================================================
// Tests for Story 2.3 -- Class & Subclass Types
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  HIT_DIE_VALUES,
  ARMOR_CATEGORIES,
  WEAPON_CATEGORIES,
  FIGHTING_STYLES,
  SPELLCASTING_TYPES,
  STANDARD_ASI_LEVELS,
  FIGHTER_ASI_LEVELS,
  ROGUE_ASI_LEVELS,
  isHitDie,
  isFightingStyle,
  isSpellcastingType,
  isArmorCategory,
  isWeaponCategory,
  isClassSelection,
  isMechanicalEffectType,
  getBonusDamageDamageType,
} from '../class';
import type {
  HitDie,
  ArmorCategory,
  WeaponCategory,
  FightingStyle,
  SpellcastingType,
  SpellSlots,
  SpellSlotProgression,
  SpellcastingInfo,
  RechargeType,
  ClassFeature,
  SubclassFeature,
  SkillChoice,
  ClassProficiencies,
  Subclass,
  CharacterClass,
  ClassSelection,
} from '../class';
import type { MechanicalEffect } from '../race';

// -- HitDie -------------------------------------------------------------------

describe('HitDie', () => {
  it('should define HitDie type with values 4, 6, 8, 10, 12', () => {
    expect(HIT_DIE_VALUES).toEqual([4, 6, 8, 10, 12]);
    expect(HIT_DIE_VALUES).toHaveLength(5);
  });

  it('should allow valid hit die values', () => {
    const values: HitDie[] = [4, 6, 8, 10, 12];
    for (const v of values) {
      expect(HIT_DIE_VALUES).toContain(v);
    }
  });
});

// -- ArmorCategory ------------------------------------------------------------

describe('ArmorCategory', () => {
  it('should define ArmorCategory with light, medium, heavy, shields', () => {
    expect(ARMOR_CATEGORIES).toHaveLength(4);
    const expected: ArmorCategory[] = ['light', 'medium', 'heavy', 'shields'];
    for (const cat of expected) {
      expect(ARMOR_CATEGORIES).toContain(cat);
    }
  });
});

// -- WeaponCategory -----------------------------------------------------------

describe('WeaponCategory', () => {
  it('should define WeaponCategory with 4 standard categories', () => {
    expect(WEAPON_CATEGORIES).toHaveLength(4);
    const expected: WeaponCategory[] = [
      'simple melee', 'simple ranged', 'martial melee', 'martial ranged',
    ];
    for (const cat of expected) {
      expect(WEAPON_CATEGORIES).toContain(cat);
    }
  });
});

// -- FightingStyle ------------------------------------------------------------

describe('FightingStyle', () => {
  it('should define FightingStyle union with all 6 styles', () => {
    expect(FIGHTING_STYLES).toHaveLength(6);
    const expected: FightingStyle[] = [
      'archery', 'defense', 'dueling',
      'great-weapon-fighting', 'protection', 'two-weapon-fighting',
    ];
    for (const style of expected) {
      expect(FIGHTING_STYLES).toContain(style);
    }
  });
});

// -- SpellcastingType ---------------------------------------------------------

describe('SpellcastingType', () => {
  it('should define SpellcastingType supporting all values (full, half, third, pact, none)', () => {
    expect(SPELLCASTING_TYPES).toHaveLength(5);
    const expected: SpellcastingType[] = ['full', 'half', 'third', 'pact', 'none'];
    for (const type of expected) {
      expect(SPELLCASTING_TYPES).toContain(type);
    }
  });
});

// -- SpellSlots and SpellSlotProgression --------------------------------------

describe('SpellSlotProgression', () => {
  it('should define SpellSlotProgression as 20-element array', () => {
    const emptySlots: SpellSlots = {};
    const progression: SpellSlotProgression = [
      { 1: 2 },                              // level 1
      { 1: 3 },                              // level 2
      { 1: 4, 2: 2 },                        // level 3
      { 1: 4, 2: 3 },                        // level 4
      { 1: 4, 2: 3, 3: 2 },                  // level 5
      { 1: 4, 2: 3, 3: 3 },                  // level 6
      { 1: 4, 2: 3, 3: 3, 4: 1 },            // level 7
      { 1: 4, 2: 3, 3: 3, 4: 2 },            // level 8
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },      // level 9
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },      // level 10
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 }, // level 11
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 }, // level 12
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 }, // level 13
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 }, // level 14
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 }, // level 15
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 }, // level 16
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 }, // level 17
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 }, // level 18
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 }, // level 19
      { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 }, // level 20
    ];
    expect(progression).toHaveLength(20);
    expect(progression[0][1]).toBe(2);   // level 1 has 2 first-level slots
    expect(progression[4][3]).toBe(2);   // level 5 has 2 third-level slots

    // Verify it is truly a 20-element tuple
    const _typeCheck: SpellSlotProgression = progression;
    void _typeCheck;
    void emptySlots;
  });
});

// -- SpellcastingInfo ---------------------------------------------------------

describe('SpellcastingInfo', () => {
  it('should define ClassSpellcasting supporting all SpellcastingType values', () => {
    const wizardSpellcasting: SpellcastingInfo = {
      type: 'full',
      ability: 'intelligence',
      cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      spellsKnownOrPrepared: 'prepared',
      ritualCasting: true,
      spellListId: 'wizard',
      focusType: 'arcane focus',
    };
    expect(wizardSpellcasting.type).toBe('full');
    expect(wizardSpellcasting.ability).toBe('intelligence');
    expect(wizardSpellcasting.cantripsKnown).toHaveLength(20);
    expect(wizardSpellcasting.spellsKnownOrPrepared).toBe('prepared');
    expect(wizardSpellcasting.ritualCasting).toBe(true);
  });

  it('should support pact magic (Warlock)', () => {
    const warlockSpellcasting: SpellcastingInfo = {
      type: 'pact',
      ability: 'charisma',
      cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      spellsKnownOrPrepared: 'known',
      spellsKnownByLevel: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
      ritualCasting: false,
      spellListId: 'warlock',
    };
    expect(warlockSpellcasting.type).toBe('pact');
    expect(warlockSpellcasting.spellsKnownByLevel).toHaveLength(20);
  });

  it('should support half casters (Paladin, Ranger)', () => {
    const paladinSpellcasting: SpellcastingInfo = {
      type: 'half',
      ability: 'charisma',
      cantripsKnown: [],
      spellsKnownOrPrepared: 'prepared',
      ritualCasting: false,
      spellListId: 'paladin',
      focusType: 'holy symbol',
    };
    expect(paladinSpellcasting.type).toBe('half');
    expect(paladinSpellcasting.focusType).toBe('holy symbol');
  });

  it('should support non-caster type', () => {
    const noneSpellcasting: SpellcastingInfo = {
      type: 'none',
      ability: 'intelligence',
      cantripsKnown: [],
      spellsKnownOrPrepared: 'known',
      ritualCasting: false,
      spellListId: '',
    };
    expect(noneSpellcasting.type).toBe('none');
  });
});

// -- ClassFeature -------------------------------------------------------------

describe('ClassFeature', () => {
  it('should define Feature interface with recharge (shortRest/longRest/none) and usage counting', () => {
    const rechargeTypes: RechargeType[] = ['shortRest', 'longRest', 'none'];
    for (const recharge of rechargeTypes) {
      const feature: ClassFeature = {
        id: `test-${recharge}`,
        name: 'Test Feature',
        description: 'A test feature',
        level: 1,
        recharge,
        usesPerRecharge: 3,
        currentUses: 2,
      };
      expect(feature.recharge).toBe(recharge);
    }
  });

  it('should support optional mechanicalEffect', () => {
    const rage: ClassFeature = {
      id: 'rage',
      name: 'Rage',
      description: 'In battle, you fight with primal ferocity.',
      level: 1,
      recharge: 'longRest',
      usesPerRecharge: 2,
      mechanicalEffect: {
        type: 'bonusDamage',
        dice: '2',
        damageType: 'bludgeoning',
        description: 'Rage bonus damage',
      },
    };
    expect(rage.mechanicalEffect).toBeDefined();
    expect(rage.mechanicalEffect!.type).toBe('bonusDamage');
  });

  it('should support features without recharge or uses', () => {
    const extraAttack: ClassFeature = {
      id: 'extra-attack',
      name: 'Extra Attack',
      description: 'You can attack twice when you take the Attack action.',
      level: 5,
    };
    expect(extraAttack.recharge).toBeUndefined();
    expect(extraAttack.usesPerRecharge).toBeUndefined();
  });
});

// -- SubclassFeature ----------------------------------------------------------

describe('SubclassFeature', () => {
  it('should define SubclassFeature with same structure as ClassFeature', () => {
    const feature: SubclassFeature = {
      id: 'frenzy',
      name: 'Frenzy',
      description: 'You can go into a frenzy when you rage.',
      level: 3,
      recharge: 'longRest',
      mechanicalEffect: {
        type: 'extraAttack',
        count: 1,
        description: 'Bonus action melee attack while raging',
      },
    };
    expect(feature.level).toBe(3);
    expect(feature.mechanicalEffect!.type).toBe('extraAttack');
  });
});

// -- SkillChoice --------------------------------------------------------------

describe('SkillChoice', () => {
  it('should define ClassProficiencies with skillChoices using choose-from pattern', () => {
    const rogueSkillChoice: SkillChoice = {
      choose: 4,
      from: [
        'acrobatics', 'athletics', 'deception', 'insight',
        'intimidation', 'investigation', 'perception', 'performance',
        'persuasion', 'sleight-of-hand', 'stealth',
      ],
    };
    expect(rogueSkillChoice.choose).toBe(4);
    expect(rogueSkillChoice.from).toHaveLength(11);
  });
});

// -- ClassProficiencies -------------------------------------------------------

describe('ClassProficiencies', () => {
  it('should define ClassProficiencies with armor, weapons, tools, savingThrows, and skillChoices', () => {
    const fighterProfs: ClassProficiencies = {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple melee', 'simple ranged', 'martial melee', 'martial ranged'],
      tools: [],
      savingThrows: ['strength', 'constitution'],
      skillChoices: {
        choose: 2,
        from: ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
      },
    };
    expect(fighterProfs.armor).toHaveLength(4);
    expect(fighterProfs.weapons).toHaveLength(4);
    expect(fighterProfs.savingThrows).toEqual(['strength', 'constitution']);
    expect(fighterProfs.skillChoices.choose).toBe(2);
  });

  it('should support specific weapon names as strings', () => {
    const monkProfs: ClassProficiencies = {
      armor: [],
      weapons: ['simple melee', 'simple ranged', 'shortsword'],
      tools: [],
      savingThrows: ['strength', 'dexterity'],
      skillChoices: {
        choose: 2,
        from: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
      },
    };
    expect(monkProfs.weapons).toContain('shortsword');
  });
});

// -- ASI Levels ---------------------------------------------------------------

describe('ASI Levels', () => {
  it('should define ASILevel arrays correctly for standard (4,8,12,16,19)', () => {
    expect(Array.from(STANDARD_ASI_LEVELS)).toEqual([4, 8, 12, 16, 19]);
  });

  it('should define ASILevel arrays correctly for Fighter (4,6,8,12,14,16,19)', () => {
    expect(Array.from(FIGHTER_ASI_LEVELS)).toEqual([4, 6, 8, 12, 14, 16, 19]);
  });

  it('should define ASILevel arrays correctly for Rogue (4,8,10,12,16,19)', () => {
    expect(Array.from(ROGUE_ASI_LEVELS)).toEqual([4, 8, 10, 12, 16, 19]);
  });

  it('should have Fighter with more ASI levels than standard', () => {
    expect(FIGHTER_ASI_LEVELS.length).toBeGreaterThan(STANDARD_ASI_LEVELS.length);
  });

  it('should have Rogue with more ASI levels than standard', () => {
    expect(ROGUE_ASI_LEVELS.length).toBeGreaterThan(STANDARD_ASI_LEVELS.length);
  });
});

// -- Subclass -----------------------------------------------------------------

describe('Subclass', () => {
  it('should define Subclass with features as Record<number, SubclassFeature[]>', () => {
    const berserker: Subclass = {
      id: 'berserker',
      name: 'Path of the Berserker',
      classId: 'barbarian',
      description: 'For some barbarians, rage is a means to an end.',
      features: {
        3: [{
          id: 'frenzy',
          name: 'Frenzy',
          description: 'You can go into a frenzy when you rage.',
          level: 3,
        }],
        6: [{
          id: 'mindless-rage',
          name: 'Mindless Rage',
          description: 'You cannot be charmed or frightened while raging.',
          level: 6,
        }],
      },
    };
    expect(berserker.features[3]).toHaveLength(1);
    expect(berserker.features[6]).toHaveLength(1);
    expect(berserker.classId).toBe('barbarian');
  });

  it('should support optional spellList', () => {
    const lifeDomain: Subclass = {
      id: 'life-domain',
      name: 'Life Domain',
      classId: 'cleric',
      description: 'The Life domain focuses on vibrant positive energy.',
      features: {},
      spellList: ['bless', 'cure-wounds', 'lesser-restoration', 'spiritual-weapon'],
    };
    expect(lifeDomain.spellList).toHaveLength(4);
  });
});

// -- CharacterClass -----------------------------------------------------------

describe('CharacterClass', () => {
  it('should define Class interface with features as Record<number, Feature[]>', () => {
    const barbarian: CharacterClass = {
      id: 'barbarian',
      name: 'Barbarian',
      description: 'A fierce warrior of primitive background.',
      hitDie: 12,
      primaryAbility: ['strength'],
      proficiencies: {
        armor: ['light', 'medium', 'shields'],
        weapons: ['simple melee', 'simple ranged', 'martial melee', 'martial ranged'],
        tools: [],
        savingThrows: ['strength', 'constitution'],
        skillChoices: {
          choose: 2,
          from: ['animal-handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
        },
      },
      features: {
        1: [
          { id: 'rage', name: 'Rage', description: 'In battle, you fight with primal ferocity.', level: 1, recharge: 'longRest', usesPerRecharge: 2 },
          { id: 'unarmored-defense', name: 'Unarmored Defense', description: 'While not wearing armor, AC = 10 + DEX + CON.', level: 1 },
        ],
        2: [
          { id: 'reckless-attack', name: 'Reckless Attack', description: 'You throw aside all concern for defense to attack with fierce desperation.', level: 2 },
          { id: 'danger-sense', name: 'Danger Sense', description: 'Advantage on DEX saving throws you can see.', level: 2 },
        ],
        5: [
          { id: 'extra-attack', name: 'Extra Attack', description: 'You can attack twice.', level: 5 },
          { id: 'fast-movement', name: 'Fast Movement', description: 'Speed increases by 10 feet while not wearing heavy armor.', level: 5 },
        ],
      },
      subclassLevel: 3,
      subclassName: 'Primal Path',
      subclasses: [],
      asiLevels: [4, 8, 12, 16, 19],
      startingEquipment: [
        { description: 'A greataxe or any martial melee weapon', options: [['greataxe'], ['martial melee weapon']] },
        { description: 'Two handaxes or any simple weapon', options: [['handaxe', 'handaxe'], ['simple weapon']] },
      ],
      startingGoldDice: '2d4 x 10',
    };
    expect(barbarian.hitDie).toBe(12);
    expect(barbarian.features[1]).toHaveLength(2);
    expect(barbarian.features[5]).toHaveLength(2);
    expect(barbarian.subclassLevel).toBe(3);
    expect(barbarian.asiLevels).toEqual([4, 8, 12, 16, 19]);
  });

  it('should support optional spellcasting (Wizard)', () => {
    const wizard: CharacterClass = {
      id: 'wizard',
      name: 'Wizard',
      description: 'A scholarly magic-user.',
      hitDie: 6,
      primaryAbility: ['intelligence'],
      proficiencies: {
        armor: [],
        weapons: ['dagger', 'dart', 'sling', 'quarterstaff', 'light crossbow'],
        tools: [],
        savingThrows: ['intelligence', 'wisdom'],
        skillChoices: {
          choose: 2,
          from: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
        },
      },
      features: {},
      subclassLevel: 2,
      subclassName: 'Arcane Tradition',
      subclasses: [],
      spellcasting: {
        type: 'full',
        ability: 'intelligence',
        cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
        spellsKnownOrPrepared: 'prepared',
        ritualCasting: true,
        spellListId: 'wizard',
        focusType: 'arcane focus',
      },
      asiLevels: [4, 8, 12, 16, 19],
      startingEquipment: [],
    };
    expect(wizard.spellcasting).toBeDefined();
    expect(wizard.spellcasting!.type).toBe('full');
    expect(wizard.spellcasting!.ability).toBe('intelligence');
  });

  it('should support optional multiclassRequirements', () => {
    const paladin: Partial<CharacterClass> = {
      id: 'paladin',
      name: 'Paladin',
      multiclassRequirements: [
        { ability: 'strength', minimum: 13 },
        { ability: 'charisma', minimum: 13 },
      ],
    };
    expect(paladin.multiclassRequirements).toHaveLength(2);
  });
});

// -- ClassSelection -----------------------------------------------------------

describe('ClassSelection', () => {
  it('should define ClassSelection with classId, level, chosenSkills, and hpRolls', () => {
    const selection: ClassSelection = {
      classId: 'barbarian',
      level: 5,
      chosenSkills: ['athletics', 'perception'],
      hpRolls: [9, 7, 11, 8],  // levels 2-5
    };
    expect(selection.classId).toBe('barbarian');
    expect(selection.level).toBe(5);
    expect(selection.chosenSkills).toHaveLength(2);
    expect(selection.hpRolls).toHaveLength(4);
  });

  it('should support optional subclassId', () => {
    const selection: ClassSelection = {
      classId: 'barbarian',
      subclassId: 'berserker',
      level: 3,
      chosenSkills: ['athletics', 'survival'],
      hpRolls: [10, 8],
    };
    expect(selection.subclassId).toBe('berserker');
  });

  it('should support optional chosenFightingStyle', () => {
    const selection: ClassSelection = {
      classId: 'fighter',
      level: 1,
      chosenSkills: ['athletics', 'perception'],
      chosenFightingStyle: 'defense',
      hpRolls: [],
    };
    expect(selection.chosenFightingStyle).toBe('defense');
  });

  it('should support optional chosenExpertise (Rogue)', () => {
    const selection: ClassSelection = {
      classId: 'rogue',
      level: 1,
      chosenSkills: ['stealth', 'sleight-of-hand', 'acrobatics', 'deception'],
      chosenExpertise: ['stealth', 'sleight-of-hand'],
      hpRolls: [],
    };
    expect(selection.chosenExpertise).toHaveLength(2);
  });
});

// -- Type Guards --------------------------------------------------------------

describe('Type Guards', () => {
  describe('isHitDie', () => {
    it('should return true for valid hit die values', () => {
      expect(isHitDie(4)).toBe(true);
      expect(isHitDie(6)).toBe(true);
      expect(isHitDie(8)).toBe(true);
      expect(isHitDie(10)).toBe(true);
      expect(isHitDie(12)).toBe(true);
    });

    it('should return false for invalid hit die values', () => {
      expect(isHitDie(3)).toBe(false);
      expect(isHitDie(20)).toBe(false);
      expect(isHitDie(0)).toBe(false);
    });
  });

  describe('isFightingStyle', () => {
    it('should return true for valid fighting styles', () => {
      expect(isFightingStyle('archery')).toBe(true);
      expect(isFightingStyle('defense')).toBe(true);
      expect(isFightingStyle('great-weapon-fighting')).toBe(true);
    });

    it('should return false for invalid fighting styles', () => {
      expect(isFightingStyle('brawling')).toBe(false);
      expect(isFightingStyle('')).toBe(false);
    });
  });

  describe('isSpellcastingType', () => {
    it('should return true for valid spellcasting types', () => {
      expect(isSpellcastingType('full')).toBe(true);
      expect(isSpellcastingType('pact')).toBe(true);
      expect(isSpellcastingType('none')).toBe(true);
    });

    it('should return false for invalid spellcasting types', () => {
      expect(isSpellcastingType('epic')).toBe(false);
    });
  });

  describe('isArmorCategory', () => {
    it('should return true for valid armor categories', () => {
      expect(isArmorCategory('light')).toBe(true);
      expect(isArmorCategory('shields')).toBe(true);
    });

    it('should return false for invalid armor categories', () => {
      expect(isArmorCategory('plate')).toBe(false);
    });
  });

  describe('isWeaponCategory', () => {
    it('should return true for valid weapon categories', () => {
      expect(isWeaponCategory('simple melee')).toBe(true);
      expect(isWeaponCategory('martial ranged')).toBe(true);
    });

    it('should return false for invalid weapon categories', () => {
      expect(isWeaponCategory('exotic')).toBe(false);
    });
  });

  describe('isClassSelection', () => {
    it('should return true for valid ClassSelection objects', () => {
      expect(isClassSelection({
        classId: 'fighter',
        level: 1,
        chosenSkills: ['athletics'],
        hpRolls: [],
      })).toBe(true);
    });

    it('should return false for null', () => {
      expect(isClassSelection(null)).toBe(false);
    });

    it('should return false for objects missing required fields', () => {
      expect(isClassSelection({ classId: 'fighter' })).toBe(false);
      expect(isClassSelection({ classId: 'fighter', level: 1 })).toBe(false);
    });
  });

  describe('isMechanicalEffectType', () => {
    it('should return true when type matches', () => {
      const effect: MechanicalEffect = {
        type: 'bonusDamage',
        dice: '2d6',
        damageType: 'fire',
        description: 'Sneak Attack',
      };
      expect(isMechanicalEffectType(effect, 'bonusDamage')).toBe(true);
    });

    it('should return false when type does not match', () => {
      const effect: MechanicalEffect = {
        type: 'resistance',
        damageType: 'fire',
        description: 'Fire resistance',
      };
      expect(isMechanicalEffectType(effect, 'bonusDamage')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isMechanicalEffectType(null, 'bonusDamage')).toBe(false);
    });
  });

  describe('getBonusDamageDamageType', () => {
    it('should return damage type for bonusDamage effects', () => {
      const effect: MechanicalEffect = {
        type: 'bonusDamage',
        dice: '2d6',
        damageType: 'fire',
        description: 'Sneak Attack',
      };
      expect(getBonusDamageDamageType(effect)).toBe('fire');
    });

    it('should return undefined for non-bonusDamage effects', () => {
      const effect: MechanicalEffect = {
        type: 'resistance',
        damageType: 'fire',
        description: 'Fire resistance',
      };
      expect(getBonusDamageDamageType(effect)).toBeUndefined();
    });
  });
});
