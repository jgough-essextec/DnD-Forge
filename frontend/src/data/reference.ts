/**
 * SRD Reference Tables & Constants (Story 3.7)
 *
 * Static game rule tables, conditions, skills, languages, spell slot
 * progression, XP thresholds, proficiency bonuses, and other reference data.
 * Source: D&D 5e SRD (OGL 1.0a)
 */

import type { Condition, SkillName, AbilityName, Language } from '@/types';

// ---------------------------------------------------------------------------
// Conditions (15 standard D&D 5e conditions)
// ---------------------------------------------------------------------------

export interface ConditionData {
  readonly id: Condition;
  readonly name: string;
  readonly description: string;
  readonly mechanicalEffects: readonly string[];
  readonly hasLevels: boolean;
}

/**
 * All 15 D&D 5e conditions with full descriptions and mechanical effects.
 * Exhaustion is the only condition with cumulative levels (1-6).
 */
export const CONDITIONS_DATA = [
  {
    id: 'blinded',
    name: 'Blinded',
    description: 'A blinded creature can\'t see and automatically fails any ability check that requires sight.',
    mechanicalEffects: [
      'Cannot see',
      'Automatically fails ability checks that require sight',
      'Attack rolls have disadvantage',
      'Attack rolls against the creature have advantage',
    ],
    hasLevels: false,
  },
  {
    id: 'charmed',
    name: 'Charmed',
    description: 'A charmed creature can\'t attack the charmer or target the charmer with harmful abilities or magical effects.',
    mechanicalEffects: [
      'Cannot attack the charmer',
      'Cannot target the charmer with harmful abilities or magical effects',
      'The charmer has advantage on ability checks to interact socially with the creature',
    ],
    hasLevels: false,
  },
  {
    id: 'deafened',
    name: 'Deafened',
    description: 'A deafened creature can\'t hear and automatically fails any ability check that requires hearing.',
    mechanicalEffects: [
      'Cannot hear',
      'Automatically fails ability checks that require hearing',
    ],
    hasLevels: false,
  },
  {
    id: 'exhaustion',
    name: 'Exhaustion',
    description: 'Exhaustion is measured in six levels. An effect can give a creature one or more levels of exhaustion. If an already exhausted creature suffers another effect that causes exhaustion, its current level of exhaustion increases by the amount specified in the effect\'s description. Effects are cumulative.',
    mechanicalEffects: [
      'Level 1: Disadvantage on ability checks',
      'Level 2: Speed halved',
      'Level 3: Disadvantage on attack rolls and saving throws',
      'Level 4: Hit point maximum halved',
      'Level 5: Speed reduced to 0',
      'Level 6: Death',
    ],
    hasLevels: true,
  },
  {
    id: 'frightened',
    name: 'Frightened',
    description: 'A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.',
    mechanicalEffects: [
      'Disadvantage on ability checks while source of fear is in line of sight',
      'Disadvantage on attack rolls while source of fear is in line of sight',
      'Cannot willingly move closer to the source of fear',
    ],
    hasLevels: false,
  },
  {
    id: 'grappled',
    name: 'Grappled',
    description: 'A grappled creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed.',
    mechanicalEffects: [
      'Speed becomes 0',
      'Cannot benefit from any bonus to speed',
      'Condition ends if grappler is incapacitated',
      'Condition ends if an effect removes the grappled creature from the grappler\'s reach',
    ],
    hasLevels: false,
  },
  {
    id: 'incapacitated',
    name: 'Incapacitated',
    description: 'An incapacitated creature can\'t take actions or reactions.',
    mechanicalEffects: [
      'Cannot take actions',
      'Cannot take reactions',
    ],
    hasLevels: false,
  },
  {
    id: 'invisible',
    name: 'Invisible',
    description: 'An invisible creature is impossible to see without the aid of magic or a special sense. For the purpose of hiding, the creature is heavily obscured. The creature\'s location can be detected by any noise it makes or any tracks it leaves.',
    mechanicalEffects: [
      'Impossible to see without magic or special senses',
      'Heavily obscured for the purpose of hiding',
      'Attack rolls have advantage',
      'Attack rolls against the creature have disadvantage',
    ],
    hasLevels: false,
  },
  {
    id: 'paralyzed',
    name: 'Paralyzed',
    description: 'A paralyzed creature is incapacitated and can\'t move or speak.',
    mechanicalEffects: [
      'Incapacitated (cannot take actions or reactions)',
      'Cannot move or speak',
      'Automatically fails Strength and Dexterity saving throws',
      'Attack rolls against the creature have advantage',
      'Any attack that hits the creature is a critical hit if the attacker is within 5 feet',
    ],
    hasLevels: false,
  },
  {
    id: 'petrified',
    name: 'Petrified',
    description: 'A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.',
    mechanicalEffects: [
      'Transformed to solid substance (usually stone)',
      'Weight multiplied by 10',
      'Ceases aging',
      'Incapacitated (cannot take actions or reactions)',
      'Cannot move or speak',
      'Unaware of surroundings',
      'Attack rolls against the creature have advantage',
      'Automatically fails Strength and Dexterity saving throws',
      'Resistance to all damage',
      'Immune to poison and disease (existing poison/disease suspended)',
    ],
    hasLevels: false,
  },
  {
    id: 'poisoned',
    name: 'Poisoned',
    description: 'A poisoned creature has disadvantage on attack rolls and ability checks.',
    mechanicalEffects: [
      'Disadvantage on attack rolls',
      'Disadvantage on ability checks',
    ],
    hasLevels: false,
  },
  {
    id: 'prone',
    name: 'Prone',
    description: 'A prone creature\'s only movement option is to crawl, unless it stands up and thereby ends the condition.',
    mechanicalEffects: [
      'Only movement option is to crawl',
      'Disadvantage on attack rolls',
      'Attack rolls against the creature have advantage if attacker is within 5 feet',
      'Attack rolls against the creature have disadvantage if attacker is more than 5 feet away',
      'Standing up costs half of movement speed',
    ],
    hasLevels: false,
  },
  {
    id: 'restrained',
    name: 'Restrained',
    description: 'A restrained creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed.',
    mechanicalEffects: [
      'Speed becomes 0',
      'Cannot benefit from any bonus to speed',
      'Attack rolls against the creature have advantage',
      'The creature\'s attack rolls have disadvantage',
      'Disadvantage on Dexterity saving throws',
    ],
    hasLevels: false,
  },
  {
    id: 'stunned',
    name: 'Stunned',
    description: 'A stunned creature is incapacitated, can\'t move, and can speak only falteringly.',
    mechanicalEffects: [
      'Incapacitated (cannot take actions or reactions)',
      'Cannot move',
      'Can speak only falteringly',
      'Automatically fails Strength and Dexterity saving throws',
      'Attack rolls against the creature have advantage',
    ],
    hasLevels: false,
  },
  {
    id: 'unconscious',
    name: 'Unconscious',
    description: 'An unconscious creature is incapacitated, can\'t move or speak, and is unaware of its surroundings.',
    mechanicalEffects: [
      'Incapacitated (cannot take actions or reactions)',
      'Cannot move or speak',
      'Unaware of surroundings',
      'Drops whatever it is holding and falls prone',
      'Automatically fails Strength and Dexterity saving throws',
      'Attack rolls against the creature have advantage',
      'Any attack that hits the creature is a critical hit if the attacker is within 5 feet',
    ],
    hasLevels: false,
  },
] as const satisfies readonly ConditionData[];

// ---------------------------------------------------------------------------
// Skills (18 standard skills)
// ---------------------------------------------------------------------------

export interface SkillData {
  readonly id: SkillName;
  readonly name: string;
  readonly ability: AbilityName;
  readonly description: string;
}

/**
 * All 18 D&D 5e skills with their associated ability scores and descriptions.
 */
export const SKILLS_DATA = [
  {
    id: 'acrobatics',
    name: 'Acrobatics',
    ability: 'dexterity',
    description: 'Your Dexterity (Acrobatics) check covers your attempt to stay on your feet in a tricky situation, such as when you\'re trying to run across a sheet of ice, balance on a tightrope, or stay upright on a rocking ship\'s deck.',
  },
  {
    id: 'animal-handling',
    name: 'Animal Handling',
    ability: 'wisdom',
    description: 'When there is any question whether you can calm down a domesticated animal, keep a mount from getting spooked, or intuit an animal\'s intentions, the DM might call for a Wisdom (Animal Handling) check.',
  },
  {
    id: 'arcana',
    name: 'Arcana',
    ability: 'intelligence',
    description: 'Your Intelligence (Arcana) check measures your ability to recall lore about spells, magic items, eldritch symbols, magical traditions, the planes of existence, and the inhabitants of those planes.',
  },
  {
    id: 'athletics',
    name: 'Athletics',
    ability: 'strength',
    description: 'Your Strength (Athletics) check covers difficult situations you encounter while climbing, jumping, or swimming.',
  },
  {
    id: 'deception',
    name: 'Deception',
    ability: 'charisma',
    description: 'Your Charisma (Deception) check determines whether you can convincingly hide the truth, whether through verbal or action. This deception can encompass everything from misleading others through ambiguity to telling outright lies.',
  },
  {
    id: 'history',
    name: 'History',
    ability: 'intelligence',
    description: 'Your Intelligence (History) check measures your ability to recall lore about historical events, legendary people, ancient kingdoms, past disputes, recent wars, and lost civilizations.',
  },
  {
    id: 'insight',
    name: 'Insight',
    ability: 'wisdom',
    description: 'Your Wisdom (Insight) check decides whether you can determine the true intentions of a creature, such as when searching out a lie or predicting someone\'s next move.',
  },
  {
    id: 'intimidation',
    name: 'Intimidation',
    ability: 'charisma',
    description: 'When you attempt to influence someone through overt threats, hostile actions, and physical violence, the DM might ask you to make a Charisma (Intimidation) check.',
  },
  {
    id: 'investigation',
    name: 'Investigation',
    ability: 'intelligence',
    description: 'When you look around for clues and make deductions based on those clues, you make an Intelligence (Investigation) check.',
  },
  {
    id: 'medicine',
    name: 'Medicine',
    ability: 'wisdom',
    description: 'A Wisdom (Medicine) check lets you try to stabilize a dying companion or diagnose an illness.',
  },
  {
    id: 'nature',
    name: 'Nature',
    ability: 'intelligence',
    description: 'Your Intelligence (Nature) check measures your ability to recall lore about terrain, plants and animals, the weather, and natural cycles.',
  },
  {
    id: 'perception',
    name: 'Perception',
    ability: 'wisdom',
    description: 'Your Wisdom (Perception) check lets you spot, hear, or otherwise detect the presence of something. It measures your general awareness of your surroundings and the keenness of your senses.',
  },
  {
    id: 'performance',
    name: 'Performance',
    ability: 'charisma',
    description: 'Your Charisma (Performance) check determines how well you can delight an audience with music, dance, acting, storytelling, or some other form of entertainment.',
  },
  {
    id: 'persuasion',
    name: 'Persuasion',
    ability: 'charisma',
    description: 'When you attempt to influence someone or a group of people with tact, social graces, or good nature, the DM might ask you to make a Charisma (Persuasion) check.',
  },
  {
    id: 'religion',
    name: 'Religion',
    ability: 'intelligence',
    description: 'Your Intelligence (Religion) check measures your ability to recall lore about deities, rites and prayers, religious hierarchies, holy symbols, and the practices of secret cults.',
  },
  {
    id: 'sleight-of-hand',
    name: 'Sleight of Hand',
    ability: 'dexterity',
    description: 'Whenever you attempt an act of legerdemain or manual trickery, such as planting something on someone else or concealing an object on your person, make a Dexterity (Sleight of Hand) check.',
  },
  {
    id: 'stealth',
    name: 'Stealth',
    ability: 'dexterity',
    description: 'Make a Dexterity (Stealth) check when you attempt to conceal yourself from enemies, slink past guards, slip away without being noticed, or sneak up on someone without being seen or heard.',
  },
  {
    id: 'survival',
    name: 'Survival',
    ability: 'wisdom',
    description: 'The DM might ask you to make a Wisdom (Survival) check to follow tracks, hunt wild game, guide your group through frozen wastelands, identify signs that owlbears live nearby, predict the weather, or avoid quicksand and other natural hazards.',
  },
] as const satisfies readonly SkillData[];

// ---------------------------------------------------------------------------
// Languages
// ---------------------------------------------------------------------------

export interface LanguageData {
  readonly id: Language;
  readonly name: string;
  readonly type: 'standard' | 'exotic';
  readonly script: string | null;
  readonly typicalSpeakers: string;
}

/**
 * All 16 D&D 5e SRD languages with script and typical speaker information.
 */
export const LANGUAGES_DATA = [
  // Standard languages
  { id: 'common', name: 'Common', type: 'standard', script: 'Common', typicalSpeakers: 'Humans' },
  { id: 'dwarvish', name: 'Dwarvish', type: 'standard', script: 'Dwarvish', typicalSpeakers: 'Dwarves' },
  { id: 'elvish', name: 'Elvish', type: 'standard', script: 'Elvish', typicalSpeakers: 'Elves' },
  { id: 'giant', name: 'Giant', type: 'standard', script: 'Dwarvish', typicalSpeakers: 'Ogres, Giants' },
  { id: 'gnomish', name: 'Gnomish', type: 'standard', script: 'Dwarvish', typicalSpeakers: 'Gnomes' },
  { id: 'goblin', name: 'Goblin', type: 'standard', script: 'Dwarvish', typicalSpeakers: 'Goblinoids' },
  { id: 'halfling', name: 'Halfling', type: 'standard', script: 'Common', typicalSpeakers: 'Halflings' },
  { id: 'orc', name: 'Orc', type: 'standard', script: 'Dwarvish', typicalSpeakers: 'Orcs' },

  // Exotic languages
  { id: 'abyssal', name: 'Abyssal', type: 'exotic', script: 'Infernal', typicalSpeakers: 'Demons' },
  { id: 'celestial', name: 'Celestial', type: 'exotic', script: 'Celestial', typicalSpeakers: 'Celestials' },
  { id: 'draconic', name: 'Draconic', type: 'exotic', script: 'Draconic', typicalSpeakers: 'Dragons, Dragonborn' },
  { id: 'deep-speech', name: 'Deep Speech', type: 'exotic', script: null, typicalSpeakers: 'Aboleths, Cloakers' },
  { id: 'infernal', name: 'Infernal', type: 'exotic', script: 'Infernal', typicalSpeakers: 'Devils' },
  { id: 'primordial', name: 'Primordial', type: 'exotic', script: 'Dwarvish', typicalSpeakers: 'Elementals' },
  { id: 'sylvan', name: 'Sylvan', type: 'exotic', script: 'Elvish', typicalSpeakers: 'Fey creatures' },
  { id: 'undercommon', name: 'Undercommon', type: 'exotic', script: 'Elvish', typicalSpeakers: 'Underdark traders' },
] as const satisfies readonly LanguageData[];

// ---------------------------------------------------------------------------
// Proficiency Bonus by Level
// ---------------------------------------------------------------------------

/**
 * Proficiency bonus by character level (index 0 = level 1).
 * Formula: Math.ceil(level / 4) + 1
 */
export const PROFICIENCY_BONUS_BY_LEVEL = [
  // Levels  1- 4: +2
  2, 2, 2, 2,
  // Levels  5- 8: +3
  3, 3, 3, 3,
  // Levels  9-12: +4
  4, 4, 4, 4,
  // Levels 13-16: +5
  5, 5, 5, 5,
  // Levels 17-20: +6
  6, 6, 6, 6,
] as const;

/**
 * Get the proficiency bonus for a given character level.
 * @param level Character level (1-20)
 * @returns Proficiency bonus (+2 to +6)
 */
export function getProficiencyBonus(level: number): number {
  if (level < 1 || level > 20) {
    throw new RangeError(`Level must be between 1 and 20, got ${level}`);
  }
  return PROFICIENCY_BONUS_BY_LEVEL[level - 1];
}

// ---------------------------------------------------------------------------
// Experience Point Thresholds
// ---------------------------------------------------------------------------

/**
 * Cumulative XP required to reach each level (index 0 = level 1).
 * Level 1 requires 0 XP. Level 20 requires 355,000 XP.
 */
export const XP_THRESHOLDS = [
  0,       // Level 1
  300,     // Level 2
  900,     // Level 3
  2700,    // Level 4
  6500,    // Level 5
  14000,   // Level 6
  23000,   // Level 7
  34000,   // Level 8
  48000,   // Level 9
  64000,   // Level 10
  85000,   // Level 11
  100000,  // Level 12
  120000,  // Level 13
  140000,  // Level 14
  165000,  // Level 15
  195000,  // Level 16
  225000,  // Level 17
  265000,  // Level 18
  305000,  // Level 19
  355000,  // Level 20
] as const;

/**
 * Get the level for a given XP total.
 * @param xp Total experience points
 * @returns Character level (1-20)
 */
export function getLevelForXP(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

// ---------------------------------------------------------------------------
// Ability Score Modifier Table
// ---------------------------------------------------------------------------

/**
 * Ability score modifier lookup table (score 1 through 30).
 * Index 0 = score 1, index 29 = score 30.
 * Formula: Math.floor((score - 10) / 2)
 */
export const ABILITY_SCORE_MODIFIERS = [
  -5, // 1
  -4, // 2
  -4, // 3
  -3, // 4
  -3, // 5
  -2, // 6
  -2, // 7
  -1, // 8
  -1, // 9
   0, // 10
   0, // 11
   1, // 12
   1, // 13
   2, // 14
   2, // 15
   3, // 16
   3, // 17
   4, // 18
   4, // 19
   5, // 20
   5, // 21
   6, // 22
   6, // 23
   7, // 24
   7, // 25
   8, // 26
   8, // 27
   9, // 28
   9, // 29
  10, // 30
] as const;

/**
 * Get the ability modifier for a given ability score.
 * @param score Ability score (1-30)
 * @returns Modifier (-5 to +10)
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// ---------------------------------------------------------------------------
// Point Buy Cost Table
// ---------------------------------------------------------------------------

/**
 * Point buy cost for each ability score value (8-15).
 * Total budget: 27 points. Scores below 8 or above 15 are not allowed.
 * Key = ability score, Value = cumulative cost in points.
 */
export const POINT_BUY_COSTS: Readonly<Record<number, number>> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
} as const;

/** Total point buy budget */
export const POINT_BUY_BUDGET = 27 as const;

/** Minimum ability score in point buy */
export const POINT_BUY_MIN = 8 as const;

/** Maximum ability score in point buy */
export const POINT_BUY_MAX = 15 as const;

// ---------------------------------------------------------------------------
// Standard Array
// ---------------------------------------------------------------------------

/** The standard array for ability score assignment. */
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

// ---------------------------------------------------------------------------
// Carrying Capacity & Encumbrance
// ---------------------------------------------------------------------------

/** Multiplier for carrying capacity: STR score x this = max weight in lbs */
export const CARRY_CAPACITY_MULTIPLIER = 15 as const;

/** Multiplier for push/drag/lift: STR score x this = max weight in lbs */
export const PUSH_DRAG_LIFT_MULTIPLIER = 30 as const;

/** Multiplier for encumbered threshold (variant rule): STR score x this */
export const ENCUMBERED_MULTIPLIER = 5 as const;

/** Multiplier for heavily encumbered threshold (variant rule): STR score x this */
export const HEAVILY_ENCUMBERED_MULTIPLIER = 10 as const;

// ---------------------------------------------------------------------------
// Currency Conversion Rates
// ---------------------------------------------------------------------------

/**
 * Currency conversion rates expressed in copper pieces (CP) as the base unit.
 * To convert X of denomination A to denomination B:
 *   result = X * CURRENCY_RATES[A] / CURRENCY_RATES[B]
 *
 * Note: Also exported from types/equipment.ts as CURRENCY_CONVERSION_RATES.
 * This is a convenience re-export for consumers importing from data/.
 */
export const CURRENCY_RATES = {
  pp: 1000,
  gp: 100,
  ep: 50,
  sp: 10,
  cp: 1,
} as const;

// ---------------------------------------------------------------------------
// Spell Slot Progression Tables
// ---------------------------------------------------------------------------

/**
 * Full caster spell slot progression (Bard, Cleric, Druid, Sorcerer, Wizard).
 * Index 0 = level 1. Each entry is [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th].
 */
export const FULL_CASTER_SPELL_SLOTS: readonly (readonly number[])[] = [
  /* 1  */ [2, 0, 0, 0, 0, 0, 0, 0, 0],
  /* 2  */ [3, 0, 0, 0, 0, 0, 0, 0, 0],
  /* 3  */ [4, 2, 0, 0, 0, 0, 0, 0, 0],
  /* 4  */ [4, 3, 0, 0, 0, 0, 0, 0, 0],
  /* 5  */ [4, 3, 2, 0, 0, 0, 0, 0, 0],
  /* 6  */ [4, 3, 3, 0, 0, 0, 0, 0, 0],
  /* 7  */ [4, 3, 3, 1, 0, 0, 0, 0, 0],
  /* 8  */ [4, 3, 3, 2, 0, 0, 0, 0, 0],
  /* 9  */ [4, 3, 3, 3, 1, 0, 0, 0, 0],
  /* 10 */ [4, 3, 3, 3, 2, 0, 0, 0, 0],
  /* 11 */ [4, 3, 3, 3, 2, 1, 0, 0, 0],
  /* 12 */ [4, 3, 3, 3, 2, 1, 0, 0, 0],
  /* 13 */ [4, 3, 3, 3, 2, 1, 1, 0, 0],
  /* 14 */ [4, 3, 3, 3, 2, 1, 1, 0, 0],
  /* 15 */ [4, 3, 3, 3, 2, 1, 1, 1, 0],
  /* 16 */ [4, 3, 3, 3, 2, 1, 1, 1, 0],
  /* 17 */ [4, 3, 3, 3, 2, 1, 1, 1, 1],
  /* 18 */ [4, 3, 3, 3, 3, 1, 1, 1, 1],
  /* 19 */ [4, 3, 3, 3, 3, 2, 1, 1, 1],
  /* 20 */ [4, 3, 3, 3, 3, 2, 2, 1, 1],
] as const;

/**
 * Half caster spell slot progression (Paladin, Ranger).
 * Index 0 = level 1 (no slots until level 2).
 * Each entry is [1st, 2nd, 3rd, 4th, 5th].
 */
export const HALF_CASTER_SPELL_SLOTS: readonly (readonly number[])[] = [
  /* 1  */ [0, 0, 0, 0, 0],
  /* 2  */ [2, 0, 0, 0, 0],
  /* 3  */ [3, 0, 0, 0, 0],
  /* 4  */ [3, 0, 0, 0, 0],
  /* 5  */ [4, 2, 0, 0, 0],
  /* 6  */ [4, 2, 0, 0, 0],
  /* 7  */ [4, 3, 0, 0, 0],
  /* 8  */ [4, 3, 0, 0, 0],
  /* 9  */ [4, 3, 2, 0, 0],
  /* 10 */ [4, 3, 2, 0, 0],
  /* 11 */ [4, 3, 3, 0, 0],
  /* 12 */ [4, 3, 3, 0, 0],
  /* 13 */ [4, 3, 3, 1, 0],
  /* 14 */ [4, 3, 3, 1, 0],
  /* 15 */ [4, 3, 3, 2, 0],
  /* 16 */ [4, 3, 3, 2, 0],
  /* 17 */ [4, 3, 3, 3, 1],
  /* 18 */ [4, 3, 3, 3, 1],
  /* 19 */ [4, 3, 3, 3, 2],
  /* 20 */ [4, 3, 3, 3, 2],
] as const;

/**
 * Third caster spell slot progression (Eldritch Knight, Arcane Trickster).
 * Index 0 = level 1 (no slots until level 3).
 * Each entry is [1st, 2nd, 3rd, 4th].
 */
export const THIRD_CASTER_SPELL_SLOTS: readonly (readonly number[])[] = [
  /* 1  */ [0, 0, 0, 0],
  /* 2  */ [0, 0, 0, 0],
  /* 3  */ [2, 0, 0, 0],
  /* 4  */ [3, 0, 0, 0],
  /* 5  */ [3, 0, 0, 0],
  /* 6  */ [3, 0, 0, 0],
  /* 7  */ [4, 2, 0, 0],
  /* 8  */ [4, 2, 0, 0],
  /* 9  */ [4, 2, 0, 0],
  /* 10 */ [4, 3, 0, 0],
  /* 11 */ [4, 3, 0, 0],
  /* 12 */ [4, 3, 0, 0],
  /* 13 */ [4, 3, 2, 0],
  /* 14 */ [4, 3, 2, 0],
  /* 15 */ [4, 3, 2, 0],
  /* 16 */ [4, 3, 3, 0],
  /* 17 */ [4, 3, 3, 0],
  /* 18 */ [4, 3, 3, 0],
  /* 19 */ [4, 3, 3, 1],
  /* 20 */ [4, 3, 3, 1],
] as const;

/**
 * Pact Magic (Warlock) spell slot progression.
 * Index 0 = level 1. Each entry is { slots, slotLevel }.
 */
export const PACT_MAGIC_SLOTS: readonly { readonly slots: number; readonly slotLevel: number }[] = [
  /* 1  */ { slots: 1, slotLevel: 1 },
  /* 2  */ { slots: 2, slotLevel: 1 },
  /* 3  */ { slots: 2, slotLevel: 2 },
  /* 4  */ { slots: 2, slotLevel: 2 },
  /* 5  */ { slots: 2, slotLevel: 3 },
  /* 6  */ { slots: 2, slotLevel: 3 },
  /* 7  */ { slots: 2, slotLevel: 4 },
  /* 8  */ { slots: 2, slotLevel: 4 },
  /* 9  */ { slots: 2, slotLevel: 5 },
  /* 10 */ { slots: 2, slotLevel: 5 },
  /* 11 */ { slots: 3, slotLevel: 5 },
  /* 12 */ { slots: 3, slotLevel: 5 },
  /* 13 */ { slots: 3, slotLevel: 5 },
  /* 14 */ { slots: 3, slotLevel: 5 },
  /* 15 */ { slots: 3, slotLevel: 5 },
  /* 16 */ { slots: 3, slotLevel: 5 },
  /* 17 */ { slots: 4, slotLevel: 5 },
  /* 18 */ { slots: 4, slotLevel: 5 },
  /* 19 */ { slots: 4, slotLevel: 5 },
  /* 20 */ { slots: 4, slotLevel: 5 },
] as const;

// ---------------------------------------------------------------------------
// Starting Gold by Class (duplicate from equipment.ts for convenience)
// ---------------------------------------------------------------------------

/**
 * Starting gold dice formulas by class ID.
 * Provided here in the reference module for consumers who import from data/reference.
 */
export const STARTING_GOLD_BY_CLASS: Readonly<Record<string, string>> = {
  barbarian: '2d4 x 10',
  bard: '5d4 x 10',
  cleric: '5d4 x 10',
  druid: '2d4 x 10',
  fighter: '5d4 x 10',
  monk: '5d4',
  paladin: '5d4 x 10',
  ranger: '5d4 x 10',
  rogue: '4d4 x 10',
  sorcerer: '3d4 x 10',
  warlock: '4d4 x 10',
  wizard: '4d4 x 10',
} as const;

// ---------------------------------------------------------------------------
// Lookup Helpers
// ---------------------------------------------------------------------------

/** Look up a condition by ID. Returns undefined if not found. */
export function getConditionById(id: string): ConditionData | undefined {
  return CONDITIONS_DATA.find((c) => c.id === id);
}

/** Look up a skill by ID. Returns undefined if not found. */
export function getSkillById(id: string): SkillData | undefined {
  return SKILLS_DATA.find((s) => s.id === id);
}

/** Look up a language by ID. Returns undefined if not found. */
export function getLanguageById(id: string): LanguageData | undefined {
  return LANGUAGES_DATA.find((l) => l.id === id);
}

/** Get all standard languages. */
export function getStandardLanguages(): readonly LanguageData[] {
  return LANGUAGES_DATA.filter((l) => l.type === 'standard');
}

/** Get all exotic languages. */
export function getExoticLanguages(): readonly LanguageData[] {
  return LANGUAGES_DATA.filter((l) => l.type === 'exotic');
}
