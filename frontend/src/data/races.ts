// =============================================================================
// Story 3.1 -- Race Data Files
// Complete D&D 5e SRD race data for all 9 races with subraces.
// Source: 5e-bits/5e-database (OGL 1.0a)
// =============================================================================

import type { Race } from '@/types';

export const races: readonly Race[] = [
  // ---------------------------------------------------------------------------
  // DWARF
  // ---------------------------------------------------------------------------
  {
    id: 'dwarf',
    name: 'Dwarf',
    description:
      'Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal. Though they stand well under 5 feet tall, dwarves are so broad and compact that they can weigh as much as a human standing nearly two feet taller.',
    abilityScoreIncrease: { constitution: 2 },
    age: 'Dwarves mature at the same rate as humans, but they are considered young until they reach the age of 50. On average, they live about 350 years.',
    size: 'medium',
    speed: 25,
    senses: [{ type: 'darkvision', range: 60 }],
    traits: [
      {
        id: 'dwarven-resilience',
        name: 'Dwarven Resilience',
        description:
          'You have advantage on saving throws against poison, and you have resistance against poison damage.',
        mechanicalEffect: {
          type: 'resistance',
          damageType: 'poison',
          description: 'Resistance to poison damage',
        },
      },
      {
        id: 'dwarven-combat-training',
        name: 'Dwarven Combat Training',
        description:
          'You have proficiency with the battleaxe, handaxe, light hammer, and warhammer.',
      },
      {
        id: 'stonecunning',
        name: 'Stonecunning',
        description:
          'Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check, instead of your normal proficiency bonus.',
        mechanicalEffect: {
          type: 'proficiencyModifier',
          modifier: 'double',
          description: 'Double proficiency on History checks related to stonework',
        },
      },
      {
        id: 'dwarven-toughness-speed',
        name: 'Dwarven Armor Speed',
        description:
          'Your speed is not reduced by wearing heavy armor.',
        mechanicalEffect: {
          type: 'custom',
          value: 'speed-not-reduced-by-heavy-armor',
          description: 'Speed is not reduced by wearing heavy armor',
        },
      },
    ],
    languages: ['common', 'dwarvish'],
    proficiencies: ['battleaxe', 'handaxe', 'light hammer', 'warhammer'],
    resistances: [{ damageType: 'poison', type: 'resistance' }],
    subraces: [
      {
        id: 'hill-dwarf',
        name: 'Hill Dwarf',
        description:
          'As a hill dwarf, you have keen senses, deep intuition, and a resilience that few other folk can match.',
        abilityScoreIncrease: { wisdom: 1 },
        traits: [
          {
            id: 'dwarven-toughness',
            name: 'Dwarven Toughness',
            description:
              'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.',
            mechanicalEffect: {
              type: 'custom',
              value: 'bonus-hp-per-level-1',
              description: '+1 HP per level',
            },
          },
        ],
      },
      {
        id: 'mountain-dwarf',
        name: 'Mountain Dwarf',
        description:
          'As a mountain dwarf, you are strong and hardy, accustomed to a difficult life in rugged terrain.',
        abilityScoreIncrease: { strength: 2 },
        traits: [
          {
            id: 'dwarven-armor-training',
            name: 'Dwarven Armor Training',
            description: 'You have proficiency with light and medium armor.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // ELF
  // ---------------------------------------------------------------------------
  {
    id: 'elf',
    name: 'Elf',
    description:
      'Elves are a magical people of otherworldly grace, living in the world but not entirely part of it. They live in places of ethereal beauty, in the midst of ancient forests or in silvery spires glittering with faerie light.',
    abilityScoreIncrease: { dexterity: 2 },
    age: 'Although elves reach physical maturity at about the same age as humans, the elven understanding of adulthood goes beyond physical growth to encompass worldly experience. An elf typically claims adulthood around the age of 100 and can live to be 750 years old.',
    size: 'medium',
    speed: 30,
    senses: [{ type: 'darkvision', range: 60 }],
    traits: [
      {
        id: 'keen-senses',
        name: 'Keen Senses',
        description: 'You have proficiency in the Perception skill.',
        mechanicalEffect: {
          type: 'skillProficiency',
          skill: 'perception',
          description: 'Proficiency in Perception',
        },
      },
      {
        id: 'fey-ancestry',
        name: 'Fey Ancestry',
        description:
          'You have advantage on saving throws against being charmed, and magic cannot put you to sleep.',
        mechanicalEffect: {
          type: 'advantage',
          condition: 'saving throws against being charmed',
          description: 'Advantage on saves vs charm; immune to magical sleep',
        },
      },
      {
        id: 'trance',
        name: 'Trance',
        description:
          'Elves do not need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day. After resting in this way, you gain the same benefit that a human does from 8 hours of sleep.',
      },
    ],
    languages: ['common', 'elvish'],
    proficiencies: ['longsword', 'shortsword', 'shortbow', 'longbow'],
    subraces: [
      {
        id: 'high-elf',
        name: 'High Elf',
        description:
          'As a high elf, you have a keen mind and a mastery of at least the basics of magic.',
        abilityScoreIncrease: { intelligence: 1 },
        additionalLanguages: [],
        traits: [
          {
            id: 'elf-weapon-training',
            name: 'Elf Weapon Training',
            description:
              'You have proficiency with the longsword, shortsword, shortbow, and longbow.',
          },
          {
            id: 'high-elf-cantrip',
            name: 'Cantrip',
            description:
              'You know one cantrip of your choice from the wizard spell list. Intelligence is your spellcasting ability for it.',
            mechanicalEffect: {
              type: 'custom',
              value: 'choose-wizard-cantrip-1',
              description: 'Choose one cantrip from the wizard spell list',
            },
          },
          {
            id: 'high-elf-extra-language',
            name: 'Extra Language',
            description:
              'You can speak, read, and write one extra language of your choice.',
          },
        ],
        innateSpellcasting: {
          ability: 'intelligence',
          spells: [],
        },
      },
      {
        id: 'wood-elf',
        name: 'Wood Elf',
        description:
          'As a wood elf, you have keen senses and intuition, and your fleet feet carry you quickly and stealthily through your native forests.',
        abilityScoreIncrease: { wisdom: 1 },
        traits: [
          {
            id: 'elf-weapon-training-wood',
            name: 'Elf Weapon Training',
            description:
              'You have proficiency with the longsword, shortsword, shortbow, and longbow.',
          },
          {
            id: 'fleet-of-foot',
            name: 'Fleet of Foot',
            description: 'Your base walking speed increases to 35 feet.',
            mechanicalEffect: {
              type: 'speedModifier',
              value: 5,
              description: 'Base walking speed is 35 feet (+5 from base elf speed)',
            },
          },
          {
            id: 'mask-of-the-wild',
            name: 'Mask of the Wild',
            description:
              'You can attempt to hide even when you are only lightly obscured by foliage, heavy rain, falling snow, mist, and other natural phenomena.',
          },
        ],
      },
      {
        id: 'dark-elf',
        name: 'Dark Elf (Drow)',
        description:
          'Descended from an earlier subrace of elves, the drow were banished from the surface world for following the goddess Lolth down the path of evil and corruption.',
        abilityScoreIncrease: { charisma: 1 },
        senses: [{ type: 'darkvision', range: 120 }],
        traits: [
          {
            id: 'superior-darkvision',
            name: 'Superior Darkvision',
            description:
              'Your darkvision has a radius of 120 feet.',
            mechanicalEffect: {
              type: 'senseGrant',
              sense: 'darkvision',
              range: 120,
              description: 'Darkvision extended to 120 feet',
            },
          },
          {
            id: 'sunlight-sensitivity',
            name: 'Sunlight Sensitivity',
            description:
              'You have disadvantage on attack rolls and on Wisdom (Perception) checks that rely on sight when you, the target of your attack, or whatever you are trying to perceive is in direct sunlight.',
            mechanicalEffect: {
              type: 'custom',
              value: 'sunlight-sensitivity',
              description: 'Disadvantage on attack rolls and Perception checks in direct sunlight',
            },
          },
          {
            id: 'drow-magic',
            name: 'Drow Magic',
            description:
              'You know the dancing lights cantrip. When you reach 3rd level, you can cast the faerie fire spell once per day. When you reach 5th level, you can also cast the darkness spell once per day. Charisma is your spellcasting ability for these spells.',
          },
        ],
        innateSpellcasting: {
          ability: 'charisma',
          spells: [
            { spellId: 'dancing-lights', levelRequired: 1, atWill: true },
            { spellId: 'faerie-fire', levelRequired: 3, usesPerLongRest: 1 },
            { spellId: 'darkness', levelRequired: 5, usesPerLongRest: 1 },
          ],
        },
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // HALFLING
  // ---------------------------------------------------------------------------
  {
    id: 'halfling',
    name: 'Halfling',
    description:
      'The comforts of home are the goals of most halflings\' lives: a place to settle in peace and quiet, far from marauding monsters and clashing armies. Others form nomadic bands that travel constantly, lured by the open road and the wide horizon.',
    abilityScoreIncrease: { dexterity: 2 },
    age: 'A halfling reaches adulthood at the age of 20 and generally lives into the middle of his or her second century.',
    size: 'small',
    speed: 25,
    senses: [],
    traits: [
      {
        id: 'lucky',
        name: 'Lucky',
        description:
          'When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.',
        mechanicalEffect: {
          type: 'custom',
          value: 'reroll-natural-1',
          description: 'Reroll natural 1s on attack rolls, ability checks, and saving throws',
        },
      },
      {
        id: 'brave',
        name: 'Brave',
        description: 'You have advantage on saving throws against being frightened.',
        mechanicalEffect: {
          type: 'advantage',
          condition: 'saving throws against being frightened',
          description: 'Advantage on saves vs frightened',
        },
      },
      {
        id: 'halfling-nimbleness',
        name: 'Halfling Nimbleness',
        description:
          'You can move through the space of any creature that is of a size larger than yours.',
      },
    ],
    languages: ['common', 'halfling'],
    subraces: [
      {
        id: 'lightfoot-halfling',
        name: 'Lightfoot',
        description:
          'As a lightfoot halfling, you can easily hide from notice, even using other people as cover. Lightfoots are more prone to wanderlust than other halflings.',
        abilityScoreIncrease: { charisma: 1 },
        traits: [
          {
            id: 'naturally-stealthy',
            name: 'Naturally Stealthy',
            description:
              'You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you.',
          },
        ],
      },
      {
        id: 'stout-halfling',
        name: 'Stout',
        description:
          'As a stout halfling, you are hardier than average and have some resistance to poison. Some say that stouts have dwarven blood.',
        abilityScoreIncrease: { constitution: 1 },
        traits: [
          {
            id: 'stout-resilience',
            name: 'Stout Resilience',
            description:
              'You have advantage on saving throws against poison, and you have resistance against poison damage.',
            mechanicalEffect: {
              type: 'resistance',
              damageType: 'poison',
              description: 'Resistance to poison damage',
            },
          },
        ],
        resistances: [{ damageType: 'poison', type: 'resistance' }],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // HUMAN
  // ---------------------------------------------------------------------------
  {
    id: 'human',
    name: 'Human',
    description:
      'In the reckonings of most worlds, humans are the youngest of the common races, late to arrive on the world scene and short-lived in comparison to dwarves, elves, and dragons. Whatever drives them, humans are the innovators, the achievers, and the pioneers of the worlds.',
    abilityScoreIncrease: {
      strength: 1,
      dexterity: 1,
      constitution: 1,
      intelligence: 1,
      wisdom: 1,
      charisma: 1,
    },
    age: 'Humans reach adulthood in their late teens and live less than a century.',
    size: 'medium',
    speed: 30,
    senses: [],
    traits: [],
    languages: ['common'],
    languageChoices: 1,
    subraces: [
      {
        id: 'variant-human',
        name: 'Variant Human',
        description:
          'If your campaign uses the optional feat rules, your Dungeon Master might allow variant traits which replace the standard human ability score increases.',
        abilityScoreIncrease: {},
        traits: [
          {
            id: 'variant-human-ability',
            name: 'Ability Score Increase',
            description:
              'Two different ability scores of your choice increase by 1.',
            mechanicalEffect: {
              type: 'custom',
              value: 'choose-two-ability-scores-plus-1',
              description: '+1 to two different ability scores of your choice',
            },
          },
          {
            id: 'variant-human-skill',
            name: 'Skills',
            description:
              'You gain proficiency in one skill of your choice.',
            mechanicalEffect: {
              type: 'custom',
              value: 'choose-skill-proficiency-1',
              description: 'Gain proficiency in one skill of your choice',
            },
          },
          {
            id: 'variant-human-feat',
            name: 'Feat',
            description:
              'You gain one feat of your choice.',
            mechanicalEffect: {
              type: 'custom',
              value: 'choose-feat-1',
              description: 'Gain one feat of your choice',
            },
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // DRAGONBORN
  // ---------------------------------------------------------------------------
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    description:
      'Born of dragons, as their name proclaims, the dragonborn walk proudly through a world that greets them with fearful incomprehension. Shaped by draconic gods or the dragons themselves, dragonborn originally hatched from dragon eggs as a unique race.',
    abilityScoreIncrease: { strength: 2, charisma: 1 },
    age: 'Young dragonborn grow quickly. They walk hours after hatching, attain the size and development of a 10-year-old human child by the age of 3, and reach adulthood by 15. They live to be around 80.',
    size: 'medium',
    speed: 30,
    senses: [],
    traits: [
      {
        id: 'breath-weapon',
        name: 'Breath Weapon',
        description:
          'You can use your action to exhale destructive energy. Your draconic ancestry determines the size, shape, and damage type of the exhalation. When you use your breath weapon, each creature in the area of the exhalation must make a saving throw, the type of which is determined by your draconic ancestry. The DC for this saving throw equals 8 + your Constitution modifier + your proficiency bonus. A creature takes 2d6 damage on a failed save, and half as much damage on a successful one. The damage increases to 3d6 at 6th level, 4d6 at 11th level, and 5d6 at 16th level. After you use your breath weapon, you cannot use it again until you complete a short or long rest.',
        mechanicalEffect: {
          type: 'custom',
          value: 'breath-weapon-scaling:2d6/3d6/4d6/5d6@1/6/11/16',
          description: 'Breath weapon: 2d6 at 1st, 3d6 at 6th, 4d6 at 11th, 5d6 at 16th level',
        },
      },
      {
        id: 'damage-resistance-draconic',
        name: 'Damage Resistance',
        description:
          'You have resistance to the damage type associated with your draconic ancestry.',
        mechanicalEffect: {
          type: 'custom',
          value: 'resistance-by-draconic-ancestry',
          description: 'Resistance to the damage type of your draconic ancestry',
        },
      },
      {
        id: 'draconic-ancestry',
        name: 'Draconic Ancestry',
        description:
          'You have draconic ancestry. Choose one type of dragon from the Draconic Ancestry table. Your breath weapon and damage resistance are determined by the dragon type. Black: Acid, 5x30ft line (DEX save). Blue: Lightning, 5x30ft line (DEX save). Brass: Fire, 5x30ft line (DEX save). Bronze: Lightning, 5x30ft line (DEX save). Copper: Acid, 5x30ft line (DEX save). Gold: Fire, 15ft cone (DEX save). Green: Poison, 15ft cone (CON save). Red: Fire, 15ft cone (DEX save). Silver: Cold, 15ft cone (CON save). White: Cold, 15ft cone (CON save).',
        mechanicalEffect: {
          type: 'custom',
          value: 'draconic-ancestry-choice:black|blue|brass|bronze|copper|gold|green|red|silver|white',
          description: 'Choose one of 10 draconic ancestry types',
        },
      },
    ],
    languages: ['common', 'draconic'],
    subraces: [],
  },

  // ---------------------------------------------------------------------------
  // GNOME
  // ---------------------------------------------------------------------------
  {
    id: 'gnome',
    name: 'Gnome',
    description:
      'A constant hum of busy activity pervades the warrens and neighborhoods where gnomes form their close-knit communities. Louder sounds punctuate the hum: a crunch of grinding gears here, a minor explosion there, a yelp of surprise or triumph, and especially bursts of laughter.',
    abilityScoreIncrease: { intelligence: 2 },
    age: 'Gnomes mature at the same rate humans do, and most are expected to settle down into an adult life by around age 40. They can live 350 to almost 500 years.',
    size: 'small',
    speed: 25,
    senses: [{ type: 'darkvision', range: 60 }],
    traits: [
      {
        id: 'gnome-cunning',
        name: 'Gnome Cunning',
        description:
          'You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.',
        mechanicalEffect: {
          type: 'advantage',
          condition: 'Intelligence, Wisdom, and Charisma saving throws against magic',
          description: 'Advantage on INT/WIS/CHA saves vs magic',
        },
      },
    ],
    languages: ['common', 'gnomish'],
    subraces: [
      {
        id: 'forest-gnome',
        name: 'Forest Gnome',
        description:
          'As a forest gnome, you have a natural knack for illusion and an inherent quickness and stealth.',
        abilityScoreIncrease: { dexterity: 1 },
        traits: [
          {
            id: 'natural-illusionist',
            name: 'Natural Illusionist',
            description:
              'You know the minor illusion cantrip. Intelligence is your spellcasting ability for it.',
          },
          {
            id: 'speak-with-small-beasts',
            name: 'Speak with Small Beasts',
            description:
              'Through sounds and gestures, you can communicate simple ideas with Small or smaller beasts.',
          },
        ],
        innateSpellcasting: {
          ability: 'intelligence',
          spells: [
            { spellId: 'minor-illusion', levelRequired: 1, atWill: true },
          ],
        },
      },
      {
        id: 'rock-gnome',
        name: 'Rock Gnome',
        description:
          'As a rock gnome, you have a natural inventiveness and hardiness beyond that of other gnomes.',
        abilityScoreIncrease: { constitution: 1 },
        traits: [
          {
            id: 'artificers-lore',
            name: "Artificer's Lore",
            description:
              'Whenever you make an Intelligence (History) check related to magic items, alchemical objects, or technological devices, you can add twice your proficiency bonus, instead of any proficiency bonus you normally apply.',
            mechanicalEffect: {
              type: 'proficiencyModifier',
              modifier: 'double',
              description: 'Double proficiency on History checks for magic items, alchemy, or tech',
            },
          },
          {
            id: 'tinker',
            name: 'Tinker',
            description:
              'You have proficiency with artisan\'s tools (tinker\'s tools). Using those tools, you can spend 1 hour and 10 gp worth of materials to construct a Tiny clockwork device (AC 5, 1 hp). The device ceases to function after 24 hours (unless you spend 1 hour repairing it to keep it functioning), or when you use your action to dismantle it. You can have up to three such devices active at a time. Options: Clockwork Toy, Fire Starter, Music Box.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // HALF-ELF
  // ---------------------------------------------------------------------------
  {
    id: 'half-elf',
    name: 'Half-Elf',
    description:
      'Walking in two worlds but truly belonging to neither, half-elves combine what some say are the best qualities of their elf and human parents: human curiosity, inventiveness, and ambition tempered by the refined senses, love of nature, and artistic tastes of the elves.',
    abilityScoreIncrease: { charisma: 2 },
    abilityBonusChoices: [
      {
        choose: 2,
        from: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom'],
        bonus: 1,
      },
    ],
    age: 'Half-elves mature at the same rate humans do and reach adulthood around the age of 20. They live much longer than humans, however, often exceeding 180 years.',
    size: 'medium',
    speed: 30,
    senses: [{ type: 'darkvision', range: 60 }],
    traits: [
      {
        id: 'half-elf-fey-ancestry',
        name: 'Fey Ancestry',
        description:
          'You have advantage on saving throws against being charmed, and magic cannot put you to sleep.',
        mechanicalEffect: {
          type: 'advantage',
          condition: 'saving throws against being charmed',
          description: 'Advantage on saves vs charm; immune to magical sleep',
        },
      },
      {
        id: 'half-elf-skill-versatility',
        name: 'Skill Versatility',
        description: 'You gain proficiency in two skills of your choice.',
        mechanicalEffect: {
          type: 'custom',
          value: 'choose-skill-proficiency-2',
          description: 'Gain proficiency in two skills of your choice',
        },
      },
    ],
    languages: ['common', 'elvish'],
    languageChoices: 1,
    subraces: [],
  },

  // ---------------------------------------------------------------------------
  // HALF-ORC
  // ---------------------------------------------------------------------------
  {
    id: 'half-orc',
    name: 'Half-Orc',
    description:
      'Whether united under the leadership of a mighty warlock or having fought to a standstill after years of conflict, orc and human tribes sometimes form alliances, joining forces into a larger horde to the terror of civilized lands nearby.',
    abilityScoreIncrease: { strength: 2, constitution: 1 },
    age: 'Half-orcs mature a little faster than humans, reaching adulthood around age 14. They age noticeably faster and rarely live longer than 75 years.',
    size: 'medium',
    speed: 30,
    senses: [{ type: 'darkvision', range: 60 }],
    traits: [
      {
        id: 'menacing',
        name: 'Menacing',
        description: 'You gain proficiency in the Intimidation skill.',
        mechanicalEffect: {
          type: 'skillProficiency',
          skill: 'intimidation',
          description: 'Proficiency in Intimidation',
        },
      },
      {
        id: 'relentless-endurance',
        name: 'Relentless Endurance',
        description:
          'When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. You cannot use this feature again until you finish a long rest.',
        mechanicalEffect: {
          type: 'custom',
          value: 'relentless-endurance',
          description: 'Drop to 1 HP instead of 0, once per long rest',
        },
      },
      {
        id: 'savage-attacks',
        name: 'Savage Attacks',
        description:
          'When you score a critical hit with a melee weapon attack, you can roll one of the weapon\'s damage dice one additional time and add it to the extra damage of the critical hit.',
        mechanicalEffect: {
          type: 'custom',
          value: 'savage-attacks',
          description: 'Extra damage die on melee critical hits',
        },
      },
    ],
    languages: ['common', 'orc'],
    subraces: [],
  },

  // ---------------------------------------------------------------------------
  // TIEFLING
  // ---------------------------------------------------------------------------
  {
    id: 'tiefling',
    name: 'Tiefling',
    description:
      'To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling.',
    abilityScoreIncrease: { charisma: 2, intelligence: 1 },
    age: 'Tieflings mature at the same rate as humans but live a few years longer.',
    size: 'medium',
    speed: 30,
    senses: [{ type: 'darkvision', range: 60 }],
    traits: [
      {
        id: 'hellish-resistance',
        name: 'Hellish Resistance',
        description: 'You have resistance to fire damage.',
        mechanicalEffect: {
          type: 'resistance',
          damageType: 'fire',
          description: 'Resistance to fire damage',
        },
      },
      {
        id: 'infernal-legacy',
        name: 'Infernal Legacy',
        description:
          'You know the thaumaturgy cantrip. When you reach 3rd level, you can cast the hellish rebuke spell as a 2nd-level spell once per day. When you reach 5th level, you can also cast the darkness spell once per day. Charisma is your spellcasting ability for these spells.',
      },
    ],
    languages: ['common', 'infernal'],
    resistances: [{ damageType: 'fire', type: 'resistance' }],
    innateSpellcasting: {
      ability: 'charisma',
      spells: [
        { spellId: 'thaumaturgy', levelRequired: 1, atWill: true },
        { spellId: 'hellish-rebuke', levelRequired: 3, usesPerLongRest: 1 },
        { spellId: 'darkness', levelRequired: 5, usesPerLongRest: 1 },
      ],
    },
    subraces: [],
  },
] as const satisfies readonly Race[];
