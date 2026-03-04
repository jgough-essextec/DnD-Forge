// =============================================================================
// Story 2.3 -- Class & Subclass Types
// D&D 5e class types: classes, subclasses, features, proficiencies,
// spellcasting, fighting styles, etc.
// =============================================================================

import type { AbilityName, DamageType, SkillName } from './core';
import type { MechanicalEffect } from './race';

// Re-export MechanicalEffect so consumers can import from either module
export type { MechanicalEffect } from './race';

// -- Hit Die ------------------------------------------------------------------

export type HitDie = 4 | 6 | 8 | 10 | 12;

export const HIT_DIE_VALUES = [4, 6, 8, 10, 12] as const satisfies readonly HitDie[];

// -- Armor Category -----------------------------------------------------------

export type ArmorCategory = 'light' | 'medium' | 'heavy' | 'shields';

export const ARMOR_CATEGORIES = [
  'light',
  'medium',
  'heavy',
  'shields',
] as const satisfies readonly ArmorCategory[];

// -- Weapon Category ----------------------------------------------------------

export type WeaponCategory =
  | 'simple melee'
  | 'simple ranged'
  | 'martial melee'
  | 'martial ranged';

export const WEAPON_CATEGORIES = [
  'simple melee',
  'simple ranged',
  'martial melee',
  'martial ranged',
] as const satisfies readonly WeaponCategory[];

// -- Fighting Style -----------------------------------------------------------

export type FightingStyle =
  | 'archery'
  | 'defense'
  | 'dueling'
  | 'great-weapon-fighting'
  | 'protection'
  | 'two-weapon-fighting';

export const FIGHTING_STYLES = [
  'archery',
  'defense',
  'dueling',
  'great-weapon-fighting',
  'protection',
  'two-weapon-fighting',
] as const satisfies readonly FightingStyle[];

// -- Spellcasting Type --------------------------------------------------------

export type SpellcastingType = 'full' | 'half' | 'third' | 'pact' | 'none';

export const SPELLCASTING_TYPES = [
  'full',
  'half',
  'third',
  'pact',
  'none',
] as const satisfies readonly SpellcastingType[];

// -- Spell Slots (levels 1-9) -------------------------------------------------

export interface SpellSlots {
  1?: number;
  2?: number;
  3?: number;
  4?: number;
  5?: number;
  6?: number;
  7?: number;
  8?: number;
  9?: number;
}

/** Spell slot progression: one SpellSlots entry per character level (20 total). */
export type SpellSlotProgression = [
  SpellSlots, SpellSlots, SpellSlots, SpellSlots, SpellSlots,
  SpellSlots, SpellSlots, SpellSlots, SpellSlots, SpellSlots,
  SpellSlots, SpellSlots, SpellSlots, SpellSlots, SpellSlots,
  SpellSlots, SpellSlots, SpellSlots, SpellSlots, SpellSlots,
];

// -- Class Spellcasting -------------------------------------------------------

export interface SpellcastingInfo {
  type: SpellcastingType;
  ability: AbilityName;
  /** Number of cantrips known at each character level (index 0 = level 1). */
  cantripsKnown: number[];
  spellsKnownOrPrepared: 'known' | 'prepared';
  /** For "known" casters: number of spells known at each level. */
  spellsKnownByLevel?: number[];
  ritualCasting: boolean;
  spellListId: string;
  focusType?: string;
  spellSlots?: SpellSlotProgression;
}

// -- Recharge Type ------------------------------------------------------------

export type RechargeType = 'shortRest' | 'longRest' | 'none';

// -- Class Feature ------------------------------------------------------------

export interface ClassFeature {
  id: string;
  name: string;
  description: string;
  level: number;
  recharge?: RechargeType;
  usesPerRecharge?: number;
  currentUses?: number;
  mechanicalEffect?: MechanicalEffect;
}

// -- Subclass Feature ---------------------------------------------------------

export interface SubclassFeature {
  id: string;
  name: string;
  description: string;
  level: number;
  recharge?: RechargeType;
  usesPerRecharge?: number;
  currentUses?: number;
  mechanicalEffect?: MechanicalEffect;
}

// -- Skill Choice (choose N from a list) --------------------------------------

export interface SkillChoice {
  choose: number;
  from: SkillName[];
}

// -- Class Proficiencies ------------------------------------------------------

export interface ClassProficiencies {
  armor: ArmorCategory[];
  weapons: (WeaponCategory | string)[];
  tools: string[];
  savingThrows: [AbilityName, AbilityName];
  skillChoices: SkillChoice;
}

// -- ASI Levels ---------------------------------------------------------------

/** Standard ASI levels for most classes. */
export const STANDARD_ASI_LEVELS = [4, 8, 12, 16, 19] as const;

/** Fighter gets extra ASIs at levels 6 and 14. */
export const FIGHTER_ASI_LEVELS = [4, 6, 8, 12, 14, 16, 19] as const;

/** Rogue gets an extra ASI at level 10. */
export const ROGUE_ASI_LEVELS = [4, 8, 10, 12, 16, 19] as const;

export type ASILevel = number;

// -- Multiclass Requirements --------------------------------------------------

export interface MulticlassRequirement {
  ability: AbilityName;
  minimum: number;
}

// -- Starting Equipment -------------------------------------------------------

export interface StartingEquipmentChoice {
  description: string;
  options: string[][];
}

// -- Subclass -----------------------------------------------------------------

export interface Subclass {
  id: string;
  name: string;
  classId: string;
  description: string;
  features: Record<number, SubclassFeature[]>;
  spellList?: string[];
}

// -- Character Class ----------------------------------------------------------

export interface CharacterClass {
  id: string;
  name: string;
  description: string;
  hitDie: HitDie;
  primaryAbility: AbilityName[];
  proficiencies: ClassProficiencies;
  features: Record<number, ClassFeature[]>;
  subclassLevel: number;
  subclassName: string;         // e.g., "Primal Path", "College", "Domain"
  subclasses: Subclass[];
  spellcasting?: SpellcastingInfo;
  asiLevels: ASILevel[];
  startingEquipment: StartingEquipmentChoice[];
  startingGoldDice?: string;    // e.g., "5d4 x 10"
  multiclassRequirements?: MulticlassRequirement[];
}

// -- Class Selection (wizard state: what the player chose) --------------------

export interface ClassSelection {
  classId: string;
  subclassId?: string;
  level: number;
  chosenSkills: SkillName[];
  chosenFightingStyle?: FightingStyle;
  chosenExpertise?: SkillName[];
  hpRolls: number[];            // index 0 = level 2 roll, etc. (level 1 is always max)
}

// -- Type Guards --------------------------------------------------------------

export function isHitDie(value: number): value is HitDie {
  return (HIT_DIE_VALUES as readonly number[]).includes(value);
}

export function isFightingStyle(value: string): value is FightingStyle {
  return (FIGHTING_STYLES as readonly string[]).includes(value);
}

export function isSpellcastingType(value: string): value is SpellcastingType {
  return (SPELLCASTING_TYPES as readonly string[]).includes(value);
}

export function isArmorCategory(value: string): value is ArmorCategory {
  return (ARMOR_CATEGORIES as readonly string[]).includes(value);
}

export function isWeaponCategory(value: string): value is WeaponCategory {
  return (WEAPON_CATEGORIES as readonly string[]).includes(value);
}

export function isClassSelection(value: unknown): value is ClassSelection {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['classId'] === 'string' &&
    typeof obj['level'] === 'number' &&
    Array.isArray(obj['chosenSkills']) &&
    Array.isArray(obj['hpRolls'])
  );
}

// -- Mechanical Effect Type Guard (re-export convenience) ---------------------

export function isMechanicalEffectType(
  value: unknown,
  type: MechanicalEffect['type'],
): boolean {
  if (typeof value !== 'object' || value === null) return false;
  return (value as Record<string, unknown>)['type'] === type;
}

// -- Helper: get damage type for bonusDamage effect ---------------------------

export function getBonusDamageDamageType(
  effect: MechanicalEffect,
): DamageType | undefined {
  if (effect.type === 'bonusDamage') {
    return effect.damageType;
  }
  return undefined;
}
