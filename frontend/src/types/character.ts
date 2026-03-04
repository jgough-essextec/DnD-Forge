/**
 * Character Master Type (Story 2.8)
 *
 * The master Character interface that aggregates all sub-types from stories
 * 2.1-2.7 into the primary entity stored in the database and managed by
 * Zustand stores.
 */

import type {
  AbilityName,
  AbilityScores,
  Alignment,
  Currency,
  Language,
} from './core';
import type { RaceSelection } from './race';
import type { ClassSelection } from './class';
import type { InventoryItem } from './equipment';
import type { SpellcastingData } from './spell';
import type {
  BackgroundSelection,
  CharacterDescription,
  CharacterPersonality,
  FeatSelection,
} from './background';
import type {
  CombatStats,
  ConditionInstance,
  DeathSaves,
  Speed,
} from './combat';
import type { SkillProficiency } from './core';

// ---------------------------------------------------------------------------
// Ability Score Method
// ---------------------------------------------------------------------------

/**
 * The method used to determine ability scores during character creation.
 * - standard: Standard Array [15, 14, 13, 12, 10, 8]
 * - pointBuy: 27 points, scores 8-15
 * - rolled: 4d6 drop lowest
 */
export type AbilityScoreMethod = 'standard' | 'pointBuy' | 'rolled';

// ---------------------------------------------------------------------------
// Character (master interface)
// ---------------------------------------------------------------------------

/**
 * The master Character entity that aggregates all sub-types.
 *
 * This is the primary data structure stored in the database and managed
 * by the application state stores. It includes every field needed by the
 * character sheet, creation wizard, and calculation engine.
 */
export interface Character {
  // -- Identity ---------------------------------------------------------------
  /** UUID primary key */
  id: string;
  /** Display name of the character */
  name: string;
  /** Name of the player who owns this character */
  playerName: string;
  /** URL to the character's avatar image */
  avatarUrl: string | null;
  /** ISO 8601 timestamp of creation */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
  /** Optimistic concurrency version number, incremented on every save */
  version: number;

  // -- Core Choices -----------------------------------------------------------
  /** Race and subrace selection (from Story 2.2) */
  race: RaceSelection;
  /**
   * Class selections (from Story 2.3).
   * Array to support multiclassing. For single-class characters, this array
   * has one element. The character's total level is the sum of all class levels.
   */
  classes: ClassSelection[];
  /** Background selection (from Story 2.6) */
  background: BackgroundSelection;
  /** Character alignment */
  alignment: Alignment;

  // -- Ability Scores ---------------------------------------------------------
  /** Base ability scores before racial bonuses and other modifiers */
  baseAbilityScores: AbilityScores;
  /** Fully computed ability scores with all bonuses applied */
  abilityScores: AbilityScores;
  /** The method used to determine ability scores */
  abilityScoreMethod: AbilityScoreMethod;
  /** Raw dice rolls, if the rolled method was used */
  abilityScoreRolls?: number[];

  // -- Level & XP -------------------------------------------------------------
  /** Total character level (sum of all class levels) */
  level: number;
  /** Current experience points */
  experiencePoints: number;

  // -- Combat Stats -----------------------------------------------------------
  /** Maximum hit points */
  hpMax: number;
  /** Current hit points */
  hpCurrent: number;
  /** Temporary hit points */
  tempHp: number;
  /** Total hit dice available (by class) */
  hitDiceTotal: number[];
  /** Hit dice already spent (by class) */
  hitDiceUsed: number[];
  /**
   * Optional manual AC override for edge cases the calculation engine
   * cannot account for.
   */
  armorClassOverride?: number;
  /**
   * Optional manual initiative bonus override for edge cases.
   */
  initiativeBonus?: number;
  /** Movement speeds (from Story 2.7) */
  speed: Speed;
  /** Death saving throw progress (from Story 2.7) */
  deathSaves: DeathSaves;
  /** Aggregate combat statistics (from Story 2.7) */
  combatStats: CombatStats;

  // -- Proficiencies ----------------------------------------------------------
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: Language[];
    skills: SkillProficiency[];
    savingThrows: AbilityName[];
  };

  // -- Equipment & Inventory --------------------------------------------------
  /** Items in the character's inventory (from Story 2.4) */
  inventory: InventoryItem[];
  /** Currency held (from Story 2.1) */
  currency: Currency;
  /** IDs of attuned magic items (maximum 3, enforced at runtime) */
  attunedItems: string[];

  // -- Spellcasting -----------------------------------------------------------
  /** Spellcasting data, null for non-casters (from Story 2.5) */
  spellcasting: SpellcastingData | null;

  // -- Features, Traits, Feats ------------------------------------------------
  /** Feature IDs accumulated from class, race, and feat sources */
  features: string[];
  /** Feat selections made during level-ups (from Story 2.6) */
  feats: FeatSelection[];

  // -- Personality & Description ----------------------------------------------
  /** Physical description and identity details (from Story 2.6) */
  description: CharacterDescription;
  /** Personality traits, ideal, bond, flaw (from Story 2.6) */
  personality: CharacterPersonality;

  // -- Conditions -------------------------------------------------------------
  /** Currently active conditions (from Story 2.7) */
  conditions: ConditionInstance[];

  // -- Inspiration ------------------------------------------------------------
  /** Whether the character currently has inspiration (granted by DM) */
  inspiration: boolean;

  // -- Meta -------------------------------------------------------------------
  /** ID of the campaign this character belongs to, if any */
  campaignId: string | null;
  /** Soft delete flag */
  isArchived: boolean;
  /** DM-only notes visible only to the campaign DM */
  dmNotes?: string;
}

// ---------------------------------------------------------------------------
// CharacterSummary (gallery card projection)
// ---------------------------------------------------------------------------

/**
 * Lightweight projection of Character for gallery card rendering.
 * Contains only the fields needed to display a character card.
 */
export interface CharacterSummary {
  id: string;
  name: string;
  /** Display name of the race */
  race: string;
  /** Display name of the primary class (or multiclass summary) */
  class: string;
  level: number;
  /** Current / maximum hit points for the HP bar */
  hp: { current: number; max: number };
  /** Calculated armor class */
  ac: number;
  avatarUrl?: string;
}

// ---------------------------------------------------------------------------
// CharacterExport (JSON import/export)
// ---------------------------------------------------------------------------

/**
 * Character data extended with a format version string for JSON
 * import/export compatibility across application versions.
 */
export interface CharacterExport extends Character {
  /** Semantic version of the export format (e.g. "1.0.0") */
  formatVersion: string;
}

// ---------------------------------------------------------------------------
// CharacterValidation
// ---------------------------------------------------------------------------

/**
 * A single validation issue found on a character.
 * - error: must be fixed before the character is valid
 * - warning: informational, does not block saving
 */
export interface CharacterValidationEntry {
  field: string;
  severity: 'error' | 'warning';
  message: string;
}

/** An array of validation results for a character */
export type CharacterValidation = CharacterValidationEntry[];

// ---------------------------------------------------------------------------
// CreateCharacterData (API creation payload)
// ---------------------------------------------------------------------------

/**
 * The data sent to the API when creating a new character.
 * Omits server-generated fields (id, createdAt, updatedAt, version)
 * and computed fields (abilityScores, combatStats, level).
 */
export type CreateCharacterData = Omit<
  Character,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'version'
  | 'abilityScores'
  | 'combatStats'
  | 'level'
>;

// ---------------------------------------------------------------------------
// UpdateCharacterData (partial API update payload)
// ---------------------------------------------------------------------------

/**
 * Partial update payload for an existing character.
 * Every field is optional except `id` and `version` (needed for
 * optimistic concurrency control).
 */
export type UpdateCharacterData = Partial<
  Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'version'>
> & {
  id: string;
  version: number;
};
