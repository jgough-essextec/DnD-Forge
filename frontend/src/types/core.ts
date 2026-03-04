// =============================================================================
// Story 2.1 -- Core Ability & Skill Types
// D&D 5e foundational types: abilities, skills, alignments, dice, conditions, etc.
// =============================================================================

// -- Ability Names (6 core abilities) -----------------------------------------

export type AbilityName =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma';

export const ABILITY_NAMES = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
] as const satisfies readonly AbilityName[];

// -- Ability Scores -----------------------------------------------------------

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

// -- Skill Names (18 skills) --------------------------------------------------

export type SkillName =
  | 'acrobatics'
  | 'animal-handling'
  | 'arcana'
  | 'athletics'
  | 'deception'
  | 'history'
  | 'insight'
  | 'intimidation'
  | 'investigation'
  | 'medicine'
  | 'nature'
  | 'perception'
  | 'performance'
  | 'persuasion'
  | 'religion'
  | 'sleight-of-hand'
  | 'stealth'
  | 'survival';

export const SKILL_NAMES = [
  'acrobatics',
  'animal-handling',
  'arcana',
  'athletics',
  'deception',
  'history',
  'insight',
  'intimidation',
  'investigation',
  'medicine',
  'nature',
  'perception',
  'performance',
  'persuasion',
  'religion',
  'sleight-of-hand',
  'stealth',
  'survival',
] as const satisfies readonly SkillName[];

// -- Skill-to-Ability Mapping -------------------------------------------------

export const SKILL_ABILITY_MAP: Record<SkillName, AbilityName> = {
  'acrobatics': 'dexterity',
  'animal-handling': 'wisdom',
  'arcana': 'intelligence',
  'athletics': 'strength',
  'deception': 'charisma',
  'history': 'intelligence',
  'insight': 'wisdom',
  'intimidation': 'charisma',
  'investigation': 'intelligence',
  'medicine': 'wisdom',
  'nature': 'intelligence',
  'perception': 'wisdom',
  'performance': 'charisma',
  'persuasion': 'charisma',
  'religion': 'intelligence',
  'sleight-of-hand': 'dexterity',
  'stealth': 'dexterity',
  'survival': 'wisdom',
} as const satisfies Record<SkillName, AbilityName>;

// -- Skill Proficiency --------------------------------------------------------

export interface SkillProficiency {
  skill: SkillName;
  proficient: boolean;
  expertise: boolean;
}

// -- Saving Throw -------------------------------------------------------------

export interface SavingThrow {
  ability: AbilityName;
  proficient: boolean;
}

// -- Passive Score ------------------------------------------------------------

export interface PassiveScore {
  skill: SkillName;
  value: number;
}

// -- Alignment ----------------------------------------------------------------

export type Alignment =
  | 'lawful-good'
  | 'neutral-good'
  | 'chaotic-good'
  | 'lawful-neutral'
  | 'true-neutral'
  | 'chaotic-neutral'
  | 'lawful-evil'
  | 'neutral-evil'
  | 'chaotic-evil'
  | 'unaligned';

export const ALIGNMENTS = [
  'lawful-good',
  'neutral-good',
  'chaotic-good',
  'lawful-neutral',
  'true-neutral',
  'chaotic-neutral',
  'lawful-evil',
  'neutral-evil',
  'chaotic-evil',
  'unaligned',
] as const satisfies readonly Alignment[];

// -- Size ---------------------------------------------------------------------

export type Size =
  | 'tiny'
  | 'small'
  | 'medium'
  | 'large'
  | 'huge'
  | 'gargantuan';

export const SIZES = [
  'tiny',
  'small',
  'medium',
  'large',
  'huge',
  'gargantuan',
] as const satisfies readonly Size[];

// -- Dice Types ---------------------------------------------------------------

export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export const DIE_TYPES = [
  'd4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100',
] as const satisfies readonly DieType[];

export interface Dice {
  count: number;
  die: DieType;
  modifier?: number;
}

// -- Damage Types -------------------------------------------------------------

export type DamageType =
  | 'acid'
  | 'bludgeoning'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'piercing'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'slashing'
  | 'thunder';

export const DAMAGE_TYPES = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder',
] as const satisfies readonly DamageType[];

// -- Conditions (15 standard conditions) --------------------------------------

export type Condition =
  | 'blinded'
  | 'charmed'
  | 'deafened'
  | 'frightened'
  | 'grappled'
  | 'incapacitated'
  | 'invisible'
  | 'paralyzed'
  | 'petrified'
  | 'poisoned'
  | 'prone'
  | 'restrained'
  | 'stunned'
  | 'unconscious'
  | 'exhaustion';

export const CONDITIONS = [
  'blinded',
  'charmed',
  'deafened',
  'frightened',
  'grappled',
  'incapacitated',
  'invisible',
  'paralyzed',
  'petrified',
  'poisoned',
  'prone',
  'restrained',
  'stunned',
  'unconscious',
  'exhaustion',
] as const satisfies readonly Condition[];

// -- Languages ----------------------------------------------------------------

export type Language =
  | 'common'
  | 'dwarvish'
  | 'elvish'
  | 'giant'
  | 'gnomish'
  | 'goblin'
  | 'halfling'
  | 'orc'
  | 'abyssal'
  | 'celestial'
  | 'draconic'
  | 'deep-speech'
  | 'infernal'
  | 'primordial'
  | 'sylvan'
  | 'undercommon';

export const LANGUAGES = [
  'common',
  'dwarvish',
  'elvish',
  'giant',
  'gnomish',
  'goblin',
  'halfling',
  'orc',
  'abyssal',
  'celestial',
  'draconic',
  'deep-speech',
  'infernal',
  'primordial',
  'sylvan',
  'undercommon',
] as const satisfies readonly Language[];

// -- Currency -----------------------------------------------------------------

export interface Currency {
  cp: number;  // copper pieces
  sp: number;  // silver pieces
  ep: number;  // electrum pieces
  gp: number;  // gold pieces
  pp: number;  // platinum pieces
}

// -- Proficiency Type ---------------------------------------------------------

export type ProficiencyType =
  | 'armor'
  | 'weapon'
  | 'tool'
  | 'skill'
  | 'saving-throw'
  | 'language';

export const PROFICIENCY_TYPES = [
  'armor',
  'weapon',
  'tool',
  'skill',
  'saving-throw',
  'language',
] as const satisfies readonly ProficiencyType[];

// -- Type Guards --------------------------------------------------------------

export function isAbilityName(value: string): value is AbilityName {
  return (ABILITY_NAMES as readonly string[]).includes(value);
}

export function isSkillName(value: string): value is SkillName {
  return (SKILL_NAMES as readonly string[]).includes(value);
}

export function isAlignment(value: string): value is Alignment {
  return (ALIGNMENTS as readonly string[]).includes(value);
}

export function isSize(value: string): value is Size {
  return (SIZES as readonly string[]).includes(value);
}

export function isDieType(value: string): value is DieType {
  return (DIE_TYPES as readonly string[]).includes(value);
}

export function isDamageType(value: string): value is DamageType {
  return (DAMAGE_TYPES as readonly string[]).includes(value);
}

export function isCondition(value: string): value is Condition {
  return (CONDITIONS as readonly string[]).includes(value);
}

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

export function isProficiencyType(value: string): value is ProficiencyType {
  return (PROFICIENCY_TYPES as readonly string[]).includes(value);
}
