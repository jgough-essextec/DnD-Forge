/**
 * Combat & Game Mechanic Types (Story 2.7)
 *
 * Types for conditions, combat, initiative, attacks, armor class, hit points,
 * death saves, rests, action economy, encounters, and session tracking.
 */

import type {
  AbilityName,
  Condition,
  DamageType,
  Dice,
  DieType,
} from './core';

// ---------------------------------------------------------------------------
// Condition Tracking
// ---------------------------------------------------------------------------

/**
 * An active condition on a creature, with optional metadata.
 *
 * When `condition` is 'exhaustion', `exhaustionLevel` tracks the severity
 * (1-6) with cumulative penalties. For all other conditions the level field
 * is omitted.
 */
export interface ConditionInstance {
  condition: Condition;
  exhaustionLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  source?: string;
  duration?: string;
}

// ---------------------------------------------------------------------------
// Death Saves
// ---------------------------------------------------------------------------

/**
 * Tracks death saving throw progress when a character is at 0 HP.
 *
 * - 3 successes = stabilise
 * - 3 failures = death
 * - Natural 20 = regain 1 HP (resets counters)
 * - Natural 1 = 2 failures
 */
export interface DeathSaves {
  successes: 0 | 1 | 2 | 3;
  failures: 0 | 1 | 2 | 3;
  stable: boolean;
}

// ---------------------------------------------------------------------------
// Movement / Speed
// ---------------------------------------------------------------------------

/**
 * All movement types a creature may have.
 * Every creature has a walk speed; others are optional.
 */
export interface Speed {
  walk: number;
  fly?: number;
  swim?: number;
  climb?: number;
  burrow?: number;
}

// ---------------------------------------------------------------------------
// Attacks & Damage
// ---------------------------------------------------------------------------

/** The four attack delivery methods in D&D 5e */
export type AttackType =
  | 'melee-weapon'
  | 'ranged-weapon'
  | 'melee-spell'
  | 'ranged-spell';

/** A single damage component of an attack (e.g. 2d6 slashing + 1) */
export interface DamageRoll {
  dice: Dice;
  damageType: DamageType;
  bonus?: number;
}

/**
 * A pre-calculated attack action ready for display.
 *
 * The raw data comes from weapon + character stats processed through the
 * calculation engine.
 */
export interface Attack {
  name: string;
  attackType: AttackType;
  attackBonus: number;
  abilityModifier: AbilityName;
  proficient: boolean;
  damageRolls: DamageRoll[];
  range?: string;
  reach?: string;
  properties?: string[];
}

// ---------------------------------------------------------------------------
// Armor Class
// ---------------------------------------------------------------------------

/** Breakdown of how a character's AC is calculated */
export interface ArmorClassCalculation {
  base: number;
  dexModifier: number;
  shieldBonus: number;
  otherBonuses: number[];
  formula: string;
}

// ---------------------------------------------------------------------------
// Hit Points & Hit Dice
// ---------------------------------------------------------------------------

/** A pool of hit dice available for spending during short rests */
export interface HitDicePool {
  total: Dice[];
  used: number[];
}

/** Complete hit-point state for a character */
export interface HitPoints {
  maximum: number;
  current: number;
  temporary: number;
  hitDice: HitDicePool;
}

// ---------------------------------------------------------------------------
// Combat Stats (aggregate)
// ---------------------------------------------------------------------------

/** Aggregate combat statistics displayed on the character sheet */
export interface CombatStats {
  armorClass: ArmorClassCalculation;
  initiative: number;
  speed: Speed;
  hitPoints: HitPoints;
  attacks: Attack[];
  savingThrows: Partial<Record<AbilityName, number>>;
}

// ---------------------------------------------------------------------------
// Initiative & Encounters
// ---------------------------------------------------------------------------

/** Modifiers and flags that affect a character's initiative roll */
export interface InitiativeRoll {
  dexModifier: number;
  bonus: number;
  advantage: boolean;
}

/**
 * A single entry in an initiative tracker — can be a player character or
 * an NPC / monster.
 */
export interface InitiativeEntry {
  id: string;
  name: string;
  initiative: number;
  isPlayer: boolean;
  characterId?: string;
  hp?: number;
  maxHp?: number;
  ac?: number;
  conditions: ConditionInstance[];
}

/**
 * A combat encounter tracked by the DM initiative tracker.
 * `currentTurnIndex` points into the sorted `entries` array.
 */
export interface Encounter {
  id: string;
  campaignId: string;
  entries: InitiativeEntry[];
  currentTurnIndex: number;
  round: number;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Rests
// ---------------------------------------------------------------------------

/** The two rest types in D&D 5e */
export type RestType = 'short' | 'long';

/** The outcome of completing a rest */
export interface RestResult {
  hpRecovered: number;
  hitDiceRecovered: number;
  slotsRecovered: number;
  featuresRecovered: string[];
}

// ---------------------------------------------------------------------------
// Action Economy
// ---------------------------------------------------------------------------

/** The five categories of action in a combat round */
export type ActionType =
  | 'action'
  | 'bonus-action'
  | 'reaction'
  | 'movement'
  | 'free';

/** Resources available to a character during a single combat round */
export interface ActionEconomy {
  actions: number;
  bonusActions: number;
  reactions: number;
  movement: number;
}

/** A record of actions taken during a single combat turn */
export interface CombatTurn {
  round: number;
  initiative: number;
  actions: ActionType[];
}

// ---------------------------------------------------------------------------
// Constant arrays (for runtime validation / dropdowns)
// ---------------------------------------------------------------------------

/** All attack types as a const array for runtime use */
export const ATTACK_TYPES = [
  'melee-weapon',
  'ranged-weapon',
  'melee-spell',
  'ranged-spell',
] as const;

/** All rest types as a const array for runtime use */
export const REST_TYPES = ['short', 'long'] as const;

/** All action types as a const array for runtime use */
export const ACTION_TYPES = [
  'action',
  'bonus-action',
  'reaction',
  'movement',
  'free',
] as const;

/** Exhaustion level descriptions (cumulative) */
export const EXHAUSTION_EFFECTS = [
  'Disadvantage on ability checks',
  'Speed halved',
  'Disadvantage on attack rolls and saving throws',
  'Hit point maximum halved',
  'Speed reduced to 0',
  'Death',
] as const;

/** All standard die types as a const array */
export const DIE_TYPES: readonly DieType[] = [
  'd4',
  'd6',
  'd8',
  'd10',
  'd12',
  'd20',
  'd100',
] as const;
