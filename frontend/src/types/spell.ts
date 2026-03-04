/**
 * Spell & Spellcasting Types (Story 2.5)
 *
 * Types covering the three spellcasting systems (prepared, known, pact magic),
 * spell properties, concentration tracking, and ritual casting for D&D 5e SRD.
 */

import type { AbilityName } from './core';
import type { CurrencyAmount, DamageDice } from './equipment';

// ---------------------------------------------------------------------------
// Spell Schools & Levels
// ---------------------------------------------------------------------------

/** The 8 schools of magic in D&D 5e */
export const SPELL_SCHOOLS = [
  'abjuration',
  'conjuration',
  'divination',
  'enchantment',
  'evocation',
  'illusion',
  'necromancy',
  'transmutation',
] as const;

export type SpellSchool = (typeof SPELL_SCHOOLS)[number];

/** Spell level 0-9, where 0 represents a cantrip */
export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// ---------------------------------------------------------------------------
// Casting Time
// ---------------------------------------------------------------------------

/** Units of casting time */
export type CastingTimeUnit = 'action' | 'bonus-action' | 'reaction' | 'minute' | 'hour';

/**
 * How long it takes to cast a spell.
 * For reactions, the reactionTrigger describes when the spell can be cast.
 */
export interface CastingTime {
  readonly value: number;
  readonly unit: CastingTimeUnit;
  /** Describes the trigger condition for reaction spells */
  readonly reactionTrigger?: string;
}

// ---------------------------------------------------------------------------
// Spell Range
// ---------------------------------------------------------------------------

/** The type of range for a spell */
export type SpellRangeType = 'self' | 'touch' | 'ranged' | 'sight' | 'unlimited';

/** Distance unit for spell ranges */
export type SpellDistanceUnit = 'feet' | 'miles';

/** Area-of-effect shape */
export type SpellAreaShape = 'cone' | 'cube' | 'cylinder' | 'line' | 'sphere';

/**
 * Spell range definition.
 * For ranged spells, distance and unit specify how far.
 * For area-of-effect spells, shape and areaSize describe the affected area.
 */
export interface SpellRange {
  readonly type: SpellRangeType;
  readonly distance?: number;
  readonly unit?: SpellDistanceUnit;
  readonly shape?: SpellAreaShape;
  readonly areaSize?: number;
}

// ---------------------------------------------------------------------------
// Spell Duration
// ---------------------------------------------------------------------------

/** Duration type categories */
export type SpellDurationType = 'instantaneous' | 'concentration' | 'timed' | 'until-dispelled';

/** Duration time unit */
export type SpellDurationUnit = 'round' | 'minute' | 'hour' | 'day';

/**
 * How long a spell's effect lasts.
 * - instantaneous: one-time effect
 * - concentration: requires active focus, has a time limit
 * - timed: lasts for a set duration without concentration
 * - until-dispelled: lasts indefinitely until actively ended
 */
export interface SpellDuration {
  readonly type: SpellDurationType;
  readonly value?: number;
  readonly unit?: SpellDurationUnit;
}

// ---------------------------------------------------------------------------
// Spell Components
// ---------------------------------------------------------------------------

/**
 * The components required to cast a spell.
 * Material components may have a gold cost and may be consumed on casting.
 */
export interface SpellComponents {
  readonly verbal: boolean;
  readonly somatic: boolean;
  readonly material: boolean;
  readonly materialDescription?: string;
  readonly materialCost?: CurrencyAmount;
  readonly materialConsumed?: boolean;
}

// ---------------------------------------------------------------------------
// Spell Damage & Healing
// ---------------------------------------------------------------------------

/**
 * Damage dealt by a spell, with scaling at higher levels.
 * diceAtLevel maps spell level (or character level for cantrips) to damage dice strings.
 */
export interface SpellDamage {
  readonly damageType: string;
  readonly diceAtLevel: Readonly<Record<number, string>>;
}

/**
 * Healing provided by a spell, with scaling at higher levels.
 * diceAtLevel maps spell level to healing dice strings.
 */
export interface SpellHealing {
  readonly diceAtLevel: Readonly<Record<number, string>>;
}

// ---------------------------------------------------------------------------
// Spell Definition
// ---------------------------------------------------------------------------

/**
 * A complete spell from the SRD.
 * This interface can represent any SRD spell including cantrips, ritual spells,
 * concentration spells, and spells that scale at higher levels.
 */
export interface Spell {
  readonly id: string;
  readonly name: string;
  readonly level: SpellLevel;
  readonly school: SpellSchool;
  readonly castingTime: CastingTime;
  readonly range: SpellRange;
  readonly components: SpellComponents;
  readonly duration: SpellDuration;
  readonly description: string;
  /** Description of what changes when cast at a higher spell slot level */
  readonly higherLevelDescription?: string;
  readonly ritual: boolean;
  readonly concentration: boolean;
  /** Class names that have this spell on their spell list */
  readonly classes: readonly string[];
  readonly damage?: DamageDice;
  /** The ability score used for the saving throw against this spell */
  readonly savingThrow?: AbilityName;
  /** Whether this is a melee or ranged spell attack */
  readonly attackType?: 'melee' | 'ranged';
}

// ---------------------------------------------------------------------------
// Spell Slots
// ---------------------------------------------------------------------------

/**
 * Spell slot counts by level (1-9).
 * Keys are spell level numbers, values are the number of slots available.
 */
export type SpellSlots = Readonly<Record<number, number>>;

/**
 * Tracks used spell slots, mirroring the SpellSlots structure.
 * Keys are spell level numbers, values are the number of slots used.
 */
export type UsedSpellSlots = Readonly<Record<number, number>>;

/** A single spell slot with its usage tracking */
export interface SpellSlot {
  readonly level: number;
  readonly total: number;
  readonly used: number;
}

// ---------------------------------------------------------------------------
// Spellcasting Systems
// ---------------------------------------------------------------------------

/** The three spellcasting paradigms in D&D 5e */
export type SpellcastingType = 'prepared' | 'known' | 'pact-magic';

/**
 * Warlock's Pact Magic system.
 * Pact Magic slots are always cast at the highest available level
 * and recharge on a short rest. Mystic Arcanum provides additional
 * high-level spell slots (one per level 6-9, each usable once per long rest).
 */
export interface PactMagic {
  readonly slotLevel: number;
  readonly totalSlots: number;
  readonly usedSlots: number;
  readonly mysticArcanum: Readonly<Record<number, {
    readonly spellId: string;
    readonly used: boolean;
  }>>;
}

/**
 * Complete spellcasting data for a character.
 * Supports all three spellcasting systems: prepared, known, and pact magic.
 */
export interface SpellcastingData {
  readonly type: SpellcastingType;
  readonly ability: AbilityName;
  readonly cantrips: readonly string[];
  readonly knownSpells: readonly string[];
  readonly preparedSpells: readonly string[];
  readonly spellSlots: SpellSlots;
  readonly usedSpellSlots: UsedSpellSlots;
  /** Warlock-specific pact magic data (tracked separately from standard spell slots) */
  readonly pactMagic?: PactMagic;
  /** ID of the currently concentrated-on spell, if any */
  readonly activeConcentration?: string;
  readonly ritualCasting: boolean;
}

// ---------------------------------------------------------------------------
// Spell Selection (Character Building)
// ---------------------------------------------------------------------------

/** Tracks a character's spell selections during character creation/leveling */
export interface SpellSelection {
  readonly selectedCantrips: readonly string[];
  readonly selectedSpells: readonly string[];
  readonly preparedSpells: readonly string[];
}

/** A spell known by a character, with its source and preparation state */
export interface KnownSpell {
  readonly spellId: string;
  readonly prepared: boolean;
  readonly source: 'class' | 'race' | 'feat' | 'item';
}

// ---------------------------------------------------------------------------
// Multiclass Spell Slot Table
// ---------------------------------------------------------------------------

/**
 * Multiclass spell slot table.
 * Index 0 = combined caster level 0 (no spellcasting), indices 1-20 = combined caster levels.
 * Each entry is an array of spell slot counts for levels 1st through 9th.
 *
 * Combined caster level is calculated by summing:
 * - Full casters (Bard, Cleric, Druid, Sorcerer, Wizard): full class level
 * - Half casters (Paladin, Ranger): floor(class level / 2)
 * - Third casters (Eldritch Knight, Arcane Trickster): floor(class level / 3)
 * - Warlock (Pact Magic): NOT included (tracked separately)
 */
export const MULTICLASS_SPELL_SLOT_TABLE: readonly (readonly number[])[] = [
  //          1st 2nd 3rd 4th 5th 6th 7th 8th 9th
  /* 0  */ [  0,  0,  0,  0,  0,  0,  0,  0,  0],
  /* 1  */ [  2,  0,  0,  0,  0,  0,  0,  0,  0],
  /* 2  */ [  3,  0,  0,  0,  0,  0,  0,  0,  0],
  /* 3  */ [  4,  2,  0,  0,  0,  0,  0,  0,  0],
  /* 4  */ [  4,  3,  0,  0,  0,  0,  0,  0,  0],
  /* 5  */ [  4,  3,  2,  0,  0,  0,  0,  0,  0],
  /* 6  */ [  4,  3,  3,  0,  0,  0,  0,  0,  0],
  /* 7  */ [  4,  3,  3,  1,  0,  0,  0,  0,  0],
  /* 8  */ [  4,  3,  3,  2,  0,  0,  0,  0,  0],
  /* 9  */ [  4,  3,  3,  3,  1,  0,  0,  0,  0],
  /* 10 */ [  4,  3,  3,  3,  2,  0,  0,  0,  0],
  /* 11 */ [  4,  3,  3,  3,  2,  1,  0,  0,  0],
  /* 12 */ [  4,  3,  3,  3,  2,  1,  0,  0,  0],
  /* 13 */ [  4,  3,  3,  3,  2,  1,  1,  0,  0],
  /* 14 */ [  4,  3,  3,  3,  2,  1,  1,  0,  0],
  /* 15 */ [  4,  3,  3,  3,  2,  1,  1,  1,  0],
  /* 16 */ [  4,  3,  3,  3,  2,  1,  1,  1,  0],
  /* 17 */ [  4,  3,  3,  3,  2,  1,  1,  1,  1],
  /* 18 */ [  4,  3,  3,  3,  3,  1,  1,  1,  1],
  /* 19 */ [  4,  3,  3,  3,  3,  2,  1,  1,  1],
  /* 20 */ [  4,  3,  3,  3,  3,  2,  2,  1,  1],
] as const;
