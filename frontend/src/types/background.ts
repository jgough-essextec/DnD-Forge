/**
 * Background & Personality Types (Story 2.6)
 *
 * Types for D&D 5e backgrounds, personality characteristics, character
 * description, feats, and the wizard-state selections that tie them together.
 */

import type { AbilityName, Alignment, SkillName } from './core';

// ---------------------------------------------------------------------------
// Background Feature
// ---------------------------------------------------------------------------

/** A non-combat narrative ability granted by a background */
export interface BackgroundFeature {
  name: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Personality Characteristics
// ---------------------------------------------------------------------------

/**
 * A single entry in a background's personality-characteristic table.
 * Generic enough for personality traits, ideals, bonds, and flaws.
 */
export interface PersonalityTrait {
  id: string;
  text: string;
}

/**
 * An ideal entry that extends PersonalityTrait with alignment tags.
 * Ideals in D&D 5e are tied to one or more alignments
 * (e.g. "Charity. I always try to help those in need. (Good)").
 */
export interface Ideal {
  description: string;
  alignments: Alignment[];
}

/**
 * The suggested characteristics tables provided by a background.
 * Personality traits use a d8 table; ideals, bonds, and flaws each use a d6 table.
 */
export interface SuggestedCharacteristics {
  personalityTraits: string[];
  ideals: Ideal[];
  bonds: string[];
  flaws: string[];
}

/**
 * A convenience grouping of all four personality-characteristic arrays
 * as plain strings (used in simpler contexts where alignment tags are not needed).
 */
export interface PersonalityTraits {
  traits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

/**
 * A D&D 5e background definition.
 *
 * Every background grants skill proficiencies, optional tool proficiencies,
 * languages (fixed list or a number to choose), starting equipment, a
 * narrative feature, and suggested personality characteristics.
 *
 * `languages` is a union type because some backgrounds grant specific
 * languages (string[]) while others let the player choose a number of
 * languages ({ choose: number }).
 */
export interface Background {
  id: string;
  name: string;
  description: string;
  skillProficiencies: SkillName[];
  toolProficiencies: string[];
  languages: { choose: number } | string[];
  equipment: string[];
  feature: BackgroundFeature;
  personalityTraits: PersonalityTrait[];
  ideals: PersonalityTrait[];
  bonds: PersonalityTrait[];
  flaws: PersonalityTrait[];
  suggestedCharacteristics?: SuggestedCharacteristics;
}

// ---------------------------------------------------------------------------
// Character Identity & Personality (player-facing description)
// ---------------------------------------------------------------------------

/**
 * Physical description and identity details for a character.
 * All fields are strings to allow freeform input — e.g. age can be
 * "250 years" or "young adult" because D&D races have vastly different
 * lifespans.
 */
export interface CharacterIdentity {
  name: string;
  age?: string;
  height?: string;
  weight?: string;
  eyes?: string;
  skin?: string;
  hair?: string;
  appearance?: string;
}

/**
 * Extended character description that includes backstory and narrative details.
 * This is the full set of description fields stored on a character sheet.
 */
export interface CharacterDescription {
  name: string;
  age: string;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;
  appearance: string;
  backstory: string;
  alliesAndOrgs: string;
  treasure: string;
}

/**
 * The personality selections a player makes for their character.
 * D&D 5e characters choose two personality traits, one ideal, one bond,
 * and one flaw.
 */
export interface CharacterPersonality {
  personalityTraits: [string, string];
  ideal: string;
  bond: string;
  flaw: string;
}

// ---------------------------------------------------------------------------
// Background Selection (wizard state)
// ---------------------------------------------------------------------------

/**
 * Captures all player choices made during the background step of character
 * creation.
 *
 * `chosenSkillProficiencies` is used when the player needs to replace a
 * background skill that overlaps with a class skill.
 */
export interface BackgroundSelection {
  backgroundId: string;
  chosenSkillProficiencies?: SkillName[];
  chosenToolProficiencies?: string[];
  chosenLanguages?: string[];
  characterIdentity: CharacterIdentity;
  characterPersonality: CharacterPersonality;
}

// ---------------------------------------------------------------------------
// Feats
// ---------------------------------------------------------------------------

/** Prerequisites that must be met before a feat can be taken */
export interface FeatPrerequisite {
  minAbilityScore?: Partial<Record<AbilityName, number>>;
  race?: string;
  armorProficiency?: boolean;
  spellcasting?: boolean;
}

/**
 * A D&D 5e feat — an optional feature a character can take instead of
 * (or in addition to) an ability score increase.
 */
export interface Feat {
  id: string;
  name: string;
  description: string;
  prerequisite?: FeatPrerequisite;
  abilityScoreIncrease?: Partial<Record<AbilityName, number>>;
  mechanicalEffects: string[];
}

/** The player's feat selection during character creation or level-up */
export interface FeatSelection {
  featId: string;
  chosenAbility?: AbilityName;
}
