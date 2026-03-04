// =============================================================================
// Story 2.2 -- Race & Species Types
// D&D 5e race types: races, subraces, traits, senses, resistances, etc.
// =============================================================================

import type {
  AbilityName,
  AbilityScores,
  DamageType,
  Language,
  Size,
  SkillName,
} from './core';

// -- Mechanical Effect (shared discriminated union) ---------------------------
// Defined here as races and classes both need it. Represents calculable game
// effects such as AC bonuses, extra damage, advantage/disadvantage, etc.

export type MechanicalEffect =
  | { type: 'acCalculation'; formula: string; description: string }
  | { type: 'bonusDamage'; dice: string; damageType: DamageType; description: string }
  | { type: 'proficiencyModifier'; modifier: 'half' | 'double'; description: string }
  | { type: 'fightingStyle'; style: string; description: string }
  | { type: 'resistance'; damageType: DamageType; description: string }
  | { type: 'immunity'; damageType: DamageType; description: string }
  | { type: 'advantage'; condition: string; description: string }
  | { type: 'skillProficiency'; skill: SkillName; description: string }
  | { type: 'speedModifier'; value: number; description: string }
  | { type: 'senseGrant'; sense: SenseType; range: number; description: string }
  | { type: 'conditionImmunity'; condition: string; description: string }
  | { type: 'extraAttack'; count: number; description: string }
  | { type: 'custom'; value: string; description: string };

// -- Type guard for MechanicalEffect ------------------------------------------

export function isMechanicalEffect(value: unknown): value is MechanicalEffect {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['type'] === 'string' &&
    typeof obj['description'] === 'string'
  );
}

// -- Ability Bonus (fixed) ----------------------------------------------------

export interface AbilityBonus {
  abilityName: AbilityName;
  bonus: number;
}

// -- Ability Bonus Choice (e.g., Half-Elf +1 to two of choice) ----------------

export interface AbilityBonusChoice {
  choose: number;
  from: AbilityName[];
  bonus: number;
}

// -- Sense Types --------------------------------------------------------------

export type SenseType =
  | 'darkvision'
  | 'blindsight'
  | 'tremorsense'
  | 'truesight';

export const SENSE_TYPES = [
  'darkvision',
  'blindsight',
  'tremorsense',
  'truesight',
] as const satisfies readonly SenseType[];

export interface Sense {
  type: SenseType;
  range: number; // in feet
}

// -- Resistance ---------------------------------------------------------------

export type ResistanceLevel = 'resistance' | 'immunity' | 'vulnerability';

export interface Resistance {
  damageType: DamageType;
  type: ResistanceLevel;
}

// -- Racial Trait -------------------------------------------------------------

export interface RaceTrait {
  id: string;
  name: string;
  description: string;
  mechanicalEffect?: MechanicalEffect;
}

// -- Innate Spellcasting (e.g., Tiefling Infernal Legacy) ---------------------

export interface InnateSpellcasting {
  ability: AbilityName;
  spells: InnateSpell[];
}

export interface InnateSpell {
  spellId: string;
  levelRequired: number;      // character level required to use (e.g., 3 for hellish rebuke)
  usesPerLongRest?: number;   // typically 1 for racial spells
  atWill?: boolean;           // cantrips are at will
}

// -- Subrace ------------------------------------------------------------------

export interface Subrace {
  id: string;
  name: string;
  description: string;
  abilityScoreIncrease: Partial<AbilityScores>;
  traits: RaceTrait[];
  additionalLanguages?: Language[];
  senses?: Sense[];
  resistances?: Resistance[];
  innateSpellcasting?: InnateSpellcasting;
}

// -- Race ---------------------------------------------------------------------

export interface Race {
  id: string;
  name: string;
  description: string;
  abilityScoreIncrease: Partial<AbilityScores>;
  abilityBonusChoices?: AbilityBonusChoice[];
  age: string;                   // description of typical age range
  size: Size;
  speed: number;                 // walking speed in feet
  senses: Sense[];
  traits: RaceTrait[];
  languages: Language[];
  languageChoices?: number;      // number of extra languages to choose
  subraces: Subrace[];
  proficiencies?: string[];      // armor, weapon, tool proficiency names
  resistances?: Resistance[];
  innateSpellcasting?: InnateSpellcasting;
}

// -- Race Selection (wizard state: what the player chose) ---------------------

export interface RaceSelection {
  raceId: string;
  subraceId?: string;
  chosenAbilityBonuses?: AbilityBonus[];
  chosenLanguages?: Language[];
  chosenCantrip?: string;
  chosenSkills?: SkillName[];
  chosenFeat?: string;            // Variant Human
}

// -- Type guard for Race Selection --------------------------------------------

export function isRaceSelection(value: unknown): value is RaceSelection {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj['raceId'] === 'string';
}
