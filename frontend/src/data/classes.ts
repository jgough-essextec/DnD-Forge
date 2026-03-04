// =============================================================================
// Story 3.2 -- Class Data Files
// Complete D&D 5e SRD class data for all 12 classes.
// Features limited to levels 1-3. Spell slot progressions are in reference.ts.
// Source: 5e-bits/5e-database (OGL 1.0a)
// =============================================================================

import type {
  CharacterClass,
  SpellcastingInfo,
} from '@/types/class';

import {
  STANDARD_ASI_LEVELS,
  FIGHTER_ASI_LEVELS,
  ROGUE_ASI_LEVELS,
} from '@/types/class';

// -- Helper: create spellcasting info -----------------------------------------

function fullCaster(
  ability: SpellcastingInfo['ability'],
  cantrips: number[],
  mode: 'known' | 'prepared',
  spellListId: string,
  ritual: boolean,
  focusType?: string,
  spellsKnownByLevel?: number[],
): SpellcastingInfo {
  return {
    type: 'full',
    ability,
    cantripsKnown: cantrips,
    spellsKnownOrPrepared: mode,
    ritualCasting: ritual,
    spellListId,
    focusType,
    ...(spellsKnownByLevel ? { spellsKnownByLevel } : {}),
  };
}

function halfCaster(
  ability: SpellcastingInfo['ability'],
  cantrips: number[],
  mode: 'known' | 'prepared',
  spellListId: string,
  ritual: boolean,
  focusType?: string,
  spellsKnownByLevel?: number[],
): SpellcastingInfo {
  return {
    type: 'half',
    ability,
    cantripsKnown: cantrips,
    spellsKnownOrPrepared: mode,
    ritualCasting: ritual,
    spellListId,
    focusType,
    ...(spellsKnownByLevel ? { spellsKnownByLevel } : {}),
  };
}

// =============================================================================
// CLASSES
// =============================================================================

export const CLASSES: readonly CharacterClass[] = [
  // ---------------------------------------------------------------------------
  // BARBARIAN
  // ---------------------------------------------------------------------------
  {
    id: 'barbarian',
    name: 'Barbarian',
    description: 'A fierce warrior who channels primal rage to fuel savage attacks and incredible resilience.',
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
        {
          id: 'rage',
          name: 'Rage',
          description: 'Enter a rage as a bonus action for bonus damage and resistance to physical damage. 2 uses per long rest at level 1.',
          level: 1,
          recharge: 'longRest',
          usesPerRecharge: 2,
        },
        {
          id: 'unarmored-defense-barbarian',
          name: 'Unarmored Defense',
          description: 'While not wearing armor, AC equals 10 + DEX mod + CON mod.',
          level: 1,
          mechanicalEffect: {
            type: 'acCalculation',
            formula: '10 + dexterity + constitution',
            description: 'AC = 10 + DEX mod + CON mod while unarmored',
          },
        },
      ],
      2: [
        {
          id: 'reckless-attack',
          name: 'Reckless Attack',
          description: 'Gain advantage on STR melee attacks this turn, but attacks against you have advantage until your next turn.',
          level: 2,
        },
        {
          id: 'danger-sense',
          name: 'Danger Sense',
          description: 'Advantage on DEX saving throws against effects you can see.',
          level: 2,
          mechanicalEffect: {
            type: 'advantage',
            condition: 'DEX saves against visible effects',
            description: 'Advantage on DEX saves against effects you can see',
          },
        },
      ],
      3: [
        {
          id: 'primal-path',
          name: 'Primal Path',
          description: 'Choose a Primal Path subclass.',
          level: 3,
        },
      ],
    },
    subclassLevel: 3,
    subclassName: 'Primal Path',
    subclasses: [],
    asiLevels: [...STANDARD_ASI_LEVELS],
    startingEquipment: [
      { description: 'Weapon choice', options: [['Greataxe'], ['Any martial melee weapon']] },
      { description: 'Secondary weapon', options: [['2 Handaxes'], ['Any simple weapon']] },
      { description: 'Pack', options: [["Explorer's pack", '4 Javelins']] },
    ],
    startingGoldDice: '2d4 x 10',
    multiclassRequirements: [{ ability: 'strength', minimum: 13 }],
  },

  // ---------------------------------------------------------------------------
  // BARD
  // ---------------------------------------------------------------------------
  {
    id: 'bard',
    name: 'Bard',
    description: 'A master of song, speech, and magic who inspires allies and manipulates foes.',
    hitDie: 8,
    primaryAbility: ['charisma'],
    proficiencies: {
      armor: ['light'],
      weapons: ['simple melee', 'simple ranged'],
      tools: ['Three musical instruments of your choice'],
      savingThrows: ['dexterity', 'charisma'],
      skillChoices: {
        choose: 3,
        from: [
          'acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception',
          'history', 'insight', 'intimidation', 'investigation', 'medicine',
          'nature', 'perception', 'performance', 'persuasion', 'religion',
          'sleight-of-hand', 'stealth', 'survival',
        ],
      },
    },
    spellcasting: fullCaster(
      'charisma',
      [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      'known',
      'bard',
      true,
      'Musical instrument',
      [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
    ),
    features: {
      1: [
        {
          id: 'bardic-inspiration',
          name: 'Bardic Inspiration',
          description: 'Grant a d6 inspiration die to an ally as a bonus action. Uses equal to CHA mod per long rest.',
          level: 1,
          recharge: 'longRest',
        },
        {
          id: 'spellcasting-bard',
          name: 'Spellcasting',
          description: 'Cast bard spells using CHA as your spellcasting ability.',
          level: 1,
        },
      ],
      2: [
        {
          id: 'jack-of-all-trades',
          name: 'Jack of All Trades',
          description: 'Add half your proficiency bonus to any ability check that does not already include your proficiency bonus.',
          level: 2,
        },
        {
          id: 'song-of-rest',
          name: 'Song of Rest',
          description: 'During a short rest, allies who spend Hit Dice regain an extra 1d6 HP.',
          level: 2,
        },
      ],
      3: [
        {
          id: 'bard-college',
          name: 'Bard College',
          description: 'Choose a Bard College subclass.',
          level: 3,
        },
        {
          id: 'expertise-bard',
          name: 'Expertise',
          description: 'Choose two skill proficiencies to double your proficiency bonus for.',
          level: 3,
        },
      ],
    },
    subclassLevel: 3,
    subclassName: 'Bard College',
    subclasses: [],
    asiLevels: [...STANDARD_ASI_LEVELS],
    startingEquipment: [
      { description: 'Weapon choice', options: [['Rapier'], ['Longsword'], ['Any simple weapon']] },
      { description: 'Pack', options: [["Diplomat's pack"], ["Entertainer's pack"]] },
      { description: 'Instrument', options: [['Lute'], ['Any musical instrument']] },
      { description: 'Armor', options: [['Leather armor', 'Dagger']] },
    ],
    startingGoldDice: '5d4 x 10',
    multiclassRequirements: [{ ability: 'charisma', minimum: 13 }],
  },

  // ---------------------------------------------------------------------------
  // CLERIC
  // ---------------------------------------------------------------------------
  {
    id: 'cleric',
    name: 'Cleric',
    description: 'A divine spellcaster who wields the power of a deity to heal allies and smite foes.',
    hitDie: 8,
    primaryAbility: ['wisdom'],
    proficiencies: {
      armor: ['light', 'medium', 'shields'],
      weapons: ['simple melee', 'simple ranged'],
      tools: [],
      savingThrows: ['wisdom', 'charisma'],
      skillChoices: {
        choose: 2,
        from: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
      },
    },
    spellcasting: fullCaster(
      'wisdom',
      [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      'prepared',
      'cleric',
      true,
      'Holy symbol',
    ),
    features: {
      1: [
        {
          id: 'spellcasting-cleric',
          name: 'Spellcasting',
          description: 'Cast cleric spells using WIS as your spellcasting ability. Prepare spells from the full cleric list.',
          level: 1,
        },
        {
          id: 'divine-domain',
          name: 'Divine Domain',
          description: 'Choose a Divine Domain subclass at 1st level.',
          level: 1,
        },
      ],
      2: [
        {
          id: 'channel-divinity',
          name: 'Channel Divinity',
          description: 'Gain the Turn Undead option plus one domain option. 1 use per short/long rest.',
          level: 2,
          recharge: 'shortRest',
          usesPerRecharge: 1,
        },
        {
          id: 'turn-undead',
          name: 'Channel Divinity: Turn Undead',
          description: 'Undead within 30 ft must make a WIS save or be turned for 1 minute.',
          level: 2,
        },
      ],
    },
    subclassLevel: 1,
    subclassName: 'Divine Domain',
    subclasses: [],
    asiLevels: [...STANDARD_ASI_LEVELS],
    startingEquipment: [
      { description: 'Weapon choice', options: [['Mace'], ['Warhammer (if proficient)']] },
      { description: 'Armor choice', options: [['Scale mail'], ['Leather armor'], ['Chain mail (if proficient)']] },
      { description: 'Secondary weapon', options: [['Light crossbow, 20 bolts'], ['Any simple weapon']] },
      { description: 'Pack', options: [["Priest's pack"], ["Explorer's pack"]] },
      { description: 'Standard gear', options: [['Shield', 'Holy symbol']] },
    ],
    startingGoldDice: '5d4 x 10',
    multiclassRequirements: [{ ability: 'wisdom', minimum: 13 }],
  },

  // ---------------------------------------------------------------------------
  // DRUID
  // ---------------------------------------------------------------------------
  {
    id: 'druid',
    name: 'Druid',
    description: 'A priest of nature who draws magic from the natural world and can transform into beasts.',
    hitDie: 8,
    primaryAbility: ['wisdom'],
    proficiencies: {
      armor: ['light', 'medium', 'shields'],
      weapons: ['simple melee', 'simple ranged'],
      tools: ['Herbalism kit'],
      savingThrows: ['intelligence', 'wisdom'],
      skillChoices: {
        choose: 2,
        from: ['arcana', 'animal-handling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
      },
    },
    spellcasting: fullCaster(
      'wisdom',
      [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      'prepared',
      'druid',
      true,
      'Druidic focus',
    ),
    features: {
      1: [
        {
          id: 'druidic',
          name: 'Druidic',
          description: 'You know Druidic, the secret language of druids.',
          level: 1,
        },
        {
          id: 'spellcasting-druid',
          name: 'Spellcasting',
          description: 'Cast druid spells using WIS as your spellcasting ability. Prepare spells from the full druid list.',
          level: 1,
        },
      ],
      2: [
        {
          id: 'wild-shape',
          name: 'Wild Shape',
          description: 'Transform into a beast you have seen. Max CR 1/4, no flying/swimming. 2 uses per short rest.',
          level: 2,
          recharge: 'shortRest',
          usesPerRecharge: 2,
        },
        {
          id: 'druid-circle',
          name: 'Druid Circle',
          description: 'Choose a Druid Circle subclass.',
          level: 2,
        },
      ],
    },
    subclassLevel: 2,
    subclassName: 'Druid Circle',
    subclasses: [],
    asiLevels: [...STANDARD_ASI_LEVELS],
    startingEquipment: [
      { description: 'Armor choice', options: [['Wooden shield'], ['Any simple weapon']] },
      { description: 'Weapon choice', options: [['Scimitar'], ['Any simple melee weapon']] },
      { description: 'Standard gear', options: [['Leather armor', "Explorer's pack", 'Druidic focus']] },
    ],
    startingGoldDice: '2d4 x 10',
    multiclassRequirements: [{ ability: 'wisdom', minimum: 13 }],
  },

  // ---------------------------------------------------------------------------
  // FIGHTER
  // ---------------------------------------------------------------------------
  {
    id: 'fighter',
    name: 'Fighter',
    description: 'A master of martial combat skilled with a variety of weapons and armor.',
    hitDie: 10,
    primaryAbility: ['strength', 'dexterity'],
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple melee', 'simple ranged', 'martial melee', 'martial ranged'],
      tools: [],
      savingThrows: ['strength', 'constitution'],
      skillChoices: {
        choose: 2,
        from: ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
      },
    },
    features: {
      1: [
        {
          id: 'fighting-style-fighter',
          name: 'Fighting Style',
          description: 'Choose a fighting style: Archery, Defense, Dueling, Great Weapon Fighting, Protection, or Two-Weapon Fighting.',
          level: 1,
        },
        {
          id: 'second-wind',
          name: 'Second Wind',
          description: 'Regain 1d10 + fighter level HP as a bonus action. 1 use per short rest.',
          level: 1,
          recharge: 'shortRest',
          usesPerRecharge: 1,
        },
      ],
      2: [
        {
          id: 'action-surge',
          name: 'Action Surge',
          description: 'Take one additional action on your turn. 1 use per short rest.',
          level: 2,
          recharge: 'shortRest',
          usesPerRecharge: 1,
        },
      ],
      3: [
        {
          id: 'martial-archetype',
          name: 'Martial Archetype',
          description: 'Choose a Martial Archetype subclass.',
          level: 3,
        },
      ],
    },
    subclassLevel: 3,
    subclassName: 'Martial Archetype',
    subclasses: [],
    asiLevels: [...FIGHTER_ASI_LEVELS],
    startingEquipment: [
      { description: 'Armor choice', options: [['Chain mail'], ['Leather armor, Longbow, 20 arrows']] },
      { description: 'Weapon choice', options: [['A martial weapon and a shield'], ['Two martial weapons']] },
      { description: 'Ranged weapon', options: [['Light crossbow, 20 bolts'], ['2 Handaxes']] },
      { description: 'Pack', options: [["Dungeoneer's pack"], ["Explorer's pack"]] },
    ],
    startingGoldDice: '5d4 x 10',
    multiclassRequirements: [{ ability: 'strength', minimum: 13 }],
  },

  // ---------------------------------------------------------------------------
  // MONK
  // ---------------------------------------------------------------------------
  {
    id: 'monk',
    name: 'Monk',
    description: 'A martial artist who harnesses the power of ki to perform extraordinary feats.',
    hitDie: 8,
    primaryAbility: ['dexterity', 'wisdom'],
    proficiencies: {
      armor: [],
      weapons: ['simple melee', 'simple ranged'],
      tools: ["One type of artisan's tools or one musical instrument"],
      savingThrows: ['strength', 'dexterity'],
      skillChoices: {
        choose: 2,
        from: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
      },
    },
    features: {
      1: [
        {
          id: 'unarmored-defense-monk',
          name: 'Unarmored Defense',
          description: 'While not wearing armor, AC equals 10 + DEX mod + WIS mod.',
          level: 1,
          mechanicalEffect: {
            type: 'acCalculation',
            formula: '10 + dexterity + wisdom',
            description: 'AC = 10 + DEX mod + WIS mod while unarmored',
          },
        },
        {
          id: 'martial-arts',
          name: 'Martial Arts',
          description: 'Use DEX for unarmed/monk weapon attacks. Unarmed damage is 1d4. Bonus action unarmed strike after Attack action.',
          level: 1,
        },
      ],
      2: [
        {
          id: 'ki',
          name: 'Ki',
          description: 'Gain ki points equal to monk level. Spend ki for Flurry of Blows, Patient Defense, or Step of the Wind.',
          level: 2,
          recharge: 'shortRest',
        },
        {
          id: 'unarmored-movement',
          name: 'Unarmored Movement',
          description: 'Speed increases by 10 ft while not wearing armor or wielding a shield.',
          level: 2,
          mechanicalEffect: {
            type: 'speedModifier',
            value: 10,
            description: '+10 ft speed while unarmored',
          },
        },
      ],
      3: [
        {
          id: 'monastic-tradition',
          name: 'Monastic Tradition',
          description: 'Choose a Monastic Tradition subclass.',
          level: 3,
        },
        {
          id: 'deflect-missiles',
          name: 'Deflect Missiles',
          description: 'Use your reaction to reduce ranged weapon damage by 1d10 + DEX mod + monk level.',
          level: 3,
        },
      ],
    },
    subclassLevel: 3,
    subclassName: 'Monastic Tradition',
    subclasses: [],
    asiLevels: [...STANDARD_ASI_LEVELS],
    startingEquipment: [
      { description: 'Weapon choice', options: [['Shortsword'], ['Any simple weapon']] },
      { description: 'Pack', options: [["Dungeoneer's pack"], ["Explorer's pack"]] },
      { description: 'Standard gear', options: [['10 Darts']] },
    ],
    startingGoldDice: '5d4',
    multiclassRequirements: [
      { ability: 'dexterity', minimum: 13 },
      { ability: 'wisdom', minimum: 13 },
    ],
  },

  // ---------------------------------------------------------------------------
  // PALADIN
  // ---------------------------------------------------------------------------
  {
    id: 'paladin',
    name: 'Paladin',
    description: 'A holy warrior bound by a sacred oath to fight evil and protect the innocent.',
    hitDie: 10,
    primaryAbility: ['strength', 'charisma'],
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple melee', 'simple ranged', 'martial melee', 'martial ranged'],
      tools: [],
      savingThrows: ['wisdom', 'charisma'],
      skillChoices: {
        choose: 2,
        from: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
      },
    },
    spellcasting: halfCaster(
      'charisma',
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      'prepared',
      'paladin',
      false,
      'Holy symbol',
    ),
    features: {
      1: [
        {
          id: 'divine-sense',
          name: 'Divine Sense',
          description: 'Detect celestials, fiends, and undead within 60 ft. 1 + CHA mod uses per long rest.',
          level: 1,
          recharge: 'longRest',
        },
        {
          id: 'lay-on-hands',
          name: 'Lay on Hands',
          description: 'Heal HP from a pool of paladin level x 5. Can also cure disease or neutralize poison for 5 HP.',
          level: 1,
          recharge: 'longRest',
        },
      ],
      2: [
        {
          id: 'fighting-style-paladin',
          name: 'Fighting Style',
          description: 'Choose a fighting style: Defense, Dueling, Great Weapon Fighting, or Protection.',
          level: 2,
        },
        {
          id: 'spellcasting-paladin',
          name: 'Spellcasting',
          description: 'Cast paladin spells using CHA as your spellcasting ability. Prepare spells from the paladin list.',
          level: 2,
        },
        {
          id: 'divine-smite',
          name: 'Divine Smite',
          description: 'Expend a spell slot on a hit to deal 2d8 extra radiant damage (+1d8 per slot above 1st, max 5d8). +1d8 vs undead/fiends.',
          level: 2,
        },
      ],
      3: [
        {
          id: 'divine-health',
          name: 'Divine Health',
          description: 'Immune to disease.',
          level: 3,
          mechanicalEffect: {
            type: 'conditionImmunity',
            condition: 'disease',
            description: 'Immune to disease',
          },
        },
        {
          id: 'sacred-oath',
          name: 'Sacred Oath',
          description: 'Choose a Sacred Oath subclass.',
          level: 3,
        },
      ],
    },
    subclassLevel: 3,
    subclassName: 'Sacred Oath',
    subclasses: [],
    asiLevels: [...STANDARD_ASI_LEVELS],
    startingEquipment: [
      { description: 'Weapon choice', options: [['A martial weapon and a shield'], ['Two martial weapons']] },
      { description: 'Melee weapon', options: [['5 Javelins'], ['Any simple melee weapon']] },
      { description: 'Pack', options: [["Priest's pack"], ["Explorer's pack"]] },
      { description: 'Standard gear', options: [['Chain mail', 'Holy symbol']] },
    ],
    startingGoldDice: '5d4 x 10',
    multiclassRequirements: [
      { ability: 'strength', minimum: 13 },
      { ability: 'charisma', minimum: 13 },
    ],
  },

  // ---------------------------------------------------------------------------
  // RANGER
  // ---------------------------------------------------------------------------
  {
    id: 'ranger',
    name: 'Ranger',
    description: 'A warrior of the wilderness who uses nature magic and martial skill to hunt threats.',
    hitDie: 10,
    primaryAbility: ['dexterity', 'wisdom'],
    proficiencies: {
      armor: ['light', 'medium', 'shields'],
      weapons: ['simple melee', 'simple ranged', 'martial melee', 'martial ranged'],
      tools: [],
      savingThrows: ['strength', 'dexterity'],
      skillChoices: {
        choose: 3,
        from: ['animal-handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
      },
    },
    spellcasting: halfCaster(
      'wisdom',
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      'known',
      'ranger',
      false,
      undefined,
      [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
    ),
    features: {
      1: [
        {
          id: 'favored-enemy',
          name: 'Favored Enemy',
          description: 'Choose a type of favored enemy. Advantage on WIS (Survival) to track and INT checks to recall info about them.',
          level: 1,
        },
        {
          id: 'natural-explorer',
          name: 'Natural Explorer',
          description: 'Choose a favored terrain. Gain travel and exploration benefits in that terrain.',
          level: 1,
        },
      ],
      2: [
        {
          id: 'fighting-style-ranger',
          name: 'Fighting Style',
          description: 'Choose a fighting style: Archery, Defense, Dueling, or Two-Weapon Fighting.',
          level: 2,
        },
        {
          id: 'spellcasting-ranger',
          name: 'Spellcasting',
          description: 'Cast ranger spells using WIS as your spellcasting ability.',
          level: 2,
        },
      ],
      3: [
        {
          id: 'ranger-archetype',
          name: 'Ranger Archetype',
          description: 'Choose a Ranger Archetype subclass.',
          level: 3,
        },
        {
          id: 'primeval-awareness',
          name: 'Primeval Awareness',
          description: 'Expend a spell slot to sense aberrations, celestials, dragons, elementals, fey, fiends, and undead within 1 mile.',
          level: 3,
        },
      ],
    },
    subclassLevel: 3,
    subclassName: 'Ranger Archetype',
    subclasses: [],
    asiLevels: [...STANDARD_ASI_LEVELS],
    startingEquipment: [
      { description: 'Armor choice', options: [['Scale mail'], ['Leather armor']] },
      { description: 'Weapon choice', options: [['2 Shortswords'], ['2 simple melee weapons']] },
      { description: 'Pack', options: [["Dungeoneer's pack"], ["Explorer's pack"]] },
      { description: 'Standard gear', options: [['Longbow', 'Quiver of 20 arrows']] },
    ],
    startingGoldDice: '5d4 x 10',
    multiclassRequirements: [
      { ability: 'dexterity', minimum: 13 },
      { ability: 'wisdom', minimum: 13 },
    ],
  },

  // ---------------------------------------------------------------------------
  // ROGUE
  // ---------------------------------------------------------------------------
  {
    id: 'rogue',
    name: 'Rogue',
    description: 'A scoundrel who uses stealth and trickery to overcome obstacles and defeat enemies.',
    hitDie: 8,
    primaryAbility: ['dexterity'],
    proficiencies: {
      armor: ['light'],
      weapons: ['simple melee', 'simple ranged'],
      tools: ["Thieves' tools"],
      savingThrows: ['dexterity', 'intelligence'],
      skillChoices: {
        choose: 4,
        from: [
          'acrobatics', 'athletics', 'deception', 'insight', 'intimidation',
          'investigation', 'perception', 'performance', 'persuasion',
          'sleight-of-hand', 'stealth',
        ],
      },
    },
    features: {
      1: [
        {
          id: 'expertise-rogue',
          name: 'Expertise',
          description: 'Choose two skill proficiencies or one skill and thieves\' tools to double proficiency bonus.',
          level: 1,
        },
        {
          id: 'sneak-attack',
          name: 'Sneak Attack',
          description: 'Deal extra 1d6 damage once per turn with a finesse/ranged weapon when you have advantage or an ally is adjacent to the target.',
          level: 1,
        },
        {
          id: 'thieves-cant',
          name: "Thieves' Cant",
          description: 'You know thieves\' cant, a secret mix of dialect, jargon, and code.',
          level: 1,
        },
      ],
      2: [
        {
          id: 'cunning-action',
          name: 'Cunning Action',
          description: 'Use a bonus action to Dash, Disengage, or Hide.',
          level: 2,
        },
      ],
      3: [
        {
          id: 'roguish-archetype',
          name: 'Roguish Archetype',
          description: 'Choose a Roguish Archetype subclass.',
          level: 3,
        },
      ],
    },
    subclassLevel: 3,
    subclassName: 'Roguish Archetype',
    subclasses: [],
    asiLevels: [...ROGUE_ASI_LEVELS],
    startingEquipment: [
      { description: 'Weapon choice', options: [['Rapier'], ['Shortsword']] },
      { description: 'Secondary weapon', options: [['Shortbow, Quiver of 20 arrows'], ['Shortsword']] },
      { description: 'Pack', options: [["Burglar's pack"], ["Dungeoneer's pack"], ["Explorer's pack"]] },
      { description: 'Standard gear', options: [['Leather armor', '2 Daggers', "Thieves' tools"]] },
    ],
    startingGoldDice: '4d4 x 10',
    multiclassRequirements: [{ ability: 'dexterity', minimum: 13 }],
  },

  // ---------------------------------------------------------------------------
  // SORCERER
  // ---------------------------------------------------------------------------
  {
    id: 'sorcerer',
    name: 'Sorcerer',
    description: 'A spellcaster who draws on inherent magic from a gift or bloodline.',
    hitDie: 6,
    primaryAbility: ['charisma'],
    proficiencies: {
      armor: [],
      weapons: ['simple melee', 'simple ranged'],
      tools: [],
      savingThrows: ['constitution', 'charisma'],
      skillChoices: {
        choose: 2,
        from: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
      },
    },
    spellcasting: fullCaster(
      'charisma',
      [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
      'known',
      'sorcerer',
      false,
      'Arcane focus',
      [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
    ),
    features: {
      1: [
        {
          id: 'spellcasting-sorcerer',
          name: 'Spellcasting',
          description: 'Cast sorcerer spells using CHA as your spellcasting ability.',
          level: 1,
        },
        {
          id: 'sorcerous-origin',
          name: 'Sorcerous Origin',
          description: 'Choose a Sorcerous Origin subclass at 1st level.',
          level: 1,
        },
      ],
      2: [
        {
          id: 'font-of-magic',
          name: 'Font of Magic',
          description: 'Gain sorcery points equal to sorcerer level. Convert between sorcery points and spell slots.',
          level: 2,
          recharge: 'longRest',
        },
      ],
      3: [
        {
          id: 'metamagic',
          name: 'Metamagic',
          description: 'Choose 2 Metamagic options to modify your spells (e.g., Twinned, Quickened, Subtle).',
          level: 3,
        },
      ],
    },
    subclassLevel: 1,
    subclassName: 'Sorcerous Origin',
    subclasses: [],
    asiLevels: [...STANDARD_ASI_LEVELS],
    startingEquipment: [
      { description: 'Weapon choice', options: [['Light crossbow, 20 bolts'], ['Any simple weapon']] },
      { description: 'Focus', options: [['Component pouch'], ['Arcane focus']] },
      { description: 'Pack', options: [["Dungeoneer's pack"], ["Explorer's pack"]] },
      { description: 'Standard gear', options: [['2 Daggers']] },
    ],
    startingGoldDice: '3d4 x 10',
    multiclassRequirements: [{ ability: 'charisma', minimum: 13 }],
  },

  // ---------------------------------------------------------------------------
  // WARLOCK
  // ---------------------------------------------------------------------------
  {
    id: 'warlock',
    name: 'Warlock',
    description: 'A wielder of magic derived from a bargain with an extraplanar entity.',
    hitDie: 8,
    primaryAbility: ['charisma'],
    proficiencies: {
      armor: ['light'],
      weapons: ['simple melee', 'simple ranged'],
      tools: [],
      savingThrows: ['wisdom', 'charisma'],
      skillChoices: {
        choose: 2,
        from: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
      },
    },
    spellcasting: {
      type: 'pact',
      ability: 'charisma',
      cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      spellsKnownOrPrepared: 'known',
      spellsKnownByLevel: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
      ritualCasting: false,
      spellListId: 'warlock',
      focusType: 'Arcane focus',
    },
    features: {
      1: [
        {
          id: 'otherworldly-patron',
          name: 'Otherworldly Patron',
          description: 'Choose an Otherworldly Patron subclass at 1st level.',
          level: 1,
        },
        {
          id: 'pact-magic',
          name: 'Pact Magic',
          description: 'Cast warlock spells using CHA. Spell slots are all the same level and recover on short rest.',
          level: 1,
        },
      ],
      2: [
        {
          id: 'eldritch-invocations',
          name: 'Eldritch Invocations',
          description: 'Gain 2 eldritch invocations that grant special abilities or modify your spells.',
          level: 2,
        },
      ],
      3: [
        {
          id: 'pact-boon',
          name: 'Pact Boon',
          description: 'Choose a Pact Boon: Pact of the Chain, Pact of the Blade, or Pact of the Tome.',
          level: 3,
        },
      ],
    },
    subclassLevel: 1,
    subclassName: 'Otherworldly Patron',
    subclasses: [],
    asiLevels: [...STANDARD_ASI_LEVELS],
    startingEquipment: [
      { description: 'Weapon choice', options: [['Light crossbow, 20 bolts'], ['Any simple weapon']] },
      { description: 'Focus', options: [['Component pouch'], ['Arcane focus']] },
      { description: 'Pack', options: [["Scholar's pack"], ["Dungeoneer's pack"]] },
      { description: 'Standard gear', options: [['Leather armor', 'Any simple weapon', '2 Daggers']] },
    ],
    startingGoldDice: '4d4 x 10',
    multiclassRequirements: [{ ability: 'charisma', minimum: 13 }],
  },

  // ---------------------------------------------------------------------------
  // WIZARD
  // ---------------------------------------------------------------------------
  {
    id: 'wizard',
    name: 'Wizard',
    description: 'A scholarly magic-user who commands arcane spells through rigorous study and practice.',
    hitDie: 6,
    primaryAbility: ['intelligence'],
    proficiencies: {
      armor: [],
      weapons: ['simple melee', 'simple ranged'],
      tools: [],
      savingThrows: ['intelligence', 'wisdom'],
      skillChoices: {
        choose: 2,
        from: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
      },
    },
    spellcasting: fullCaster(
      'intelligence',
      [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      'prepared',
      'wizard',
      true,
      'Arcane focus',
    ),
    features: {
      1: [
        {
          id: 'spellcasting-wizard',
          name: 'Spellcasting',
          description: 'Cast wizard spells using INT as your spellcasting ability. Learn spells by copying them into your spellbook.',
          level: 1,
        },
        {
          id: 'arcane-recovery',
          name: 'Arcane Recovery',
          description: 'Once per day during a short rest, recover spell slots with a combined level equal to half wizard level (rounded up).',
          level: 1,
          recharge: 'longRest',
          usesPerRecharge: 1,
        },
      ],
      2: [
        {
          id: 'arcane-tradition',
          name: 'Arcane Tradition',
          description: 'Choose an Arcane Tradition subclass.',
          level: 2,
        },
      ],
    },
    subclassLevel: 2,
    subclassName: 'Arcane Tradition',
    subclasses: [],
    asiLevels: [...STANDARD_ASI_LEVELS],
    startingEquipment: [
      { description: 'Weapon choice', options: [['Quarterstaff'], ['Dagger']] },
      { description: 'Focus', options: [['Component pouch'], ['Arcane focus']] },
      { description: 'Pack', options: [["Scholar's pack"], ["Explorer's pack"]] },
      { description: 'Standard gear', options: [['Spellbook']] },
    ],
    startingGoldDice: '4d4 x 10',
    multiclassRequirements: [{ ability: 'intelligence', minimum: 13 }],
  },
] as const satisfies readonly CharacterClass[];

// -- Helper Functions ---------------------------------------------------------

/** Look up a class by its id string. */
export function getClassById(id: string): CharacterClass | undefined {
  return CLASSES.find((c) => c.id === id);
}

/** Get all class ids. */
export function getClassIds(): string[] {
  return CLASSES.map((c) => c.id);
}
