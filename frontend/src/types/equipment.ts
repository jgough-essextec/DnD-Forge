/**
 * Equipment & Inventory Types (Story 2.4)
 *
 * Types covering all equipment categories, weapon properties, armor formulas,
 * currency, and inventory management for D&D 5e SRD.
 */

import type { DieType, DamageType, Currency } from './core';

// ---------------------------------------------------------------------------
// Weapon Types
// ---------------------------------------------------------------------------

/** All 10 weapon properties from the SRD */
export const WEAPON_PROPERTIES = [
  'ammunition',
  'finesse',
  'heavy',
  'light',
  'loading',
  'reach',
  'special',
  'thrown',
  'two-handed',
  'versatile',
] as const;

export type WeaponProperty = (typeof WEAPON_PROPERTIES)[number];

/** Weapon category: simple/martial crossed with melee/ranged */
export const WEAPON_CATEGORIES = [
  'simple-melee',
  'simple-ranged',
  'martial-melee',
  'martial-ranged',
] as const;

export type WeaponCategory = (typeof WEAPON_CATEGORIES)[number];

/**
 * Damage dice for a weapon.
 * Includes the damage type and an optional versatile die for versatile weapons
 * (e.g., longsword: 1d8 slashing / 1d10 two-handed).
 */
export interface DamageDice {
  readonly count: number;
  readonly die: DieType;
  readonly type: DamageType;
  /** Alternate damage die when used two-handed (versatile weapons only) */
  readonly versatileDie?: DieType;
}

/** Currency denomination */
export type CurrencyUnit = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';

/** A cost expressed in a single denomination */
export interface CurrencyAmount {
  readonly amount: number;
  readonly unit: CurrencyUnit;
}

/**
 * Conversion rates for all currency denominations, expressed in copper pieces (CP)
 * as the base unit. To convert X of denomination A to denomination B:
 *   result = X * CURRENCY_CONVERSION_RATES[A] / CURRENCY_CONVERSION_RATES[B]
 */
export const CURRENCY_CONVERSION_RATES: Readonly<Record<CurrencyUnit, number>> = {
  pp: 1000,
  gp: 100,
  ep: 50,
  sp: 10,
  cp: 1,
} as const;

/** A weapon from the SRD equipment list */
export interface Weapon {
  readonly id: string;
  readonly name: string;
  readonly category: WeaponCategory;
  readonly damage: DamageDice;
  readonly properties: readonly WeaponProperty[];
  readonly weight: number;
  readonly cost: CurrencyAmount;
  /** Normal and long range in feet (ranged and thrown weapons only) */
  readonly range?: {
    readonly normal: number;
    readonly long: number;
  };
  /** Special rule description (for weapons with the 'special' property) */
  readonly special?: string;
}

// ---------------------------------------------------------------------------
// Armor Types
// ---------------------------------------------------------------------------

/** Specific armor types from the SRD */
export const ARMOR_TYPES = [
  'none',
  'padded',
  'leather',
  'studded-leather',
  'hide',
  'chain-shirt',
  'scale-mail',
  'breastplate',
  'half-plate',
  'ring-mail',
  'chain-mail',
  'splint',
  'plate',
] as const;

export type ArmorType = (typeof ARMOR_TYPES)[number];

/** Armor weight category */
export const ARMOR_CATEGORIES = ['light', 'medium', 'heavy', 'shield'] as const;

export type ArmorCategory = (typeof ARMOR_CATEGORIES)[number];

/**
 * An armor item from the SRD.
 *
 * dexCap rules:
 * - `null` for light armor (no maximum DEX bonus)
 * - A positive number for medium armor (typically +2)
 * - `0` for heavy armor (DEX does not contribute to AC)
 */
export interface Armor {
  readonly id: string;
  readonly name: string;
  readonly type: ArmorType;
  readonly category: ArmorCategory;
  readonly baseAC: number;
  /**
   * Maximum DEX modifier that can be added to AC.
   * null = uncapped (light armor), 0 = no DEX contribution (heavy armor),
   * positive number = cap (medium armor, typically 2).
   */
  readonly dexCap: number | null;
  readonly stealthDisadvantage: boolean;
  readonly strengthRequirement?: number;
  readonly weight: number;
  readonly cost: CurrencyAmount;
}

// ---------------------------------------------------------------------------
// General Equipment
// ---------------------------------------------------------------------------

/** Top-level equipment categories */
export const EQUIPMENT_CATEGORIES = [
  'weapon',
  'armor',
  'shield',
  'adventuring-gear',
  'tool',
  'mount',
  'trade-good',
  'pack',
] as const;

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

/**
 * A general equipment item in the SRD.
 * Uses Record<string, unknown> for item-specific properties to accommodate
 * the wide variety of adventuring gear.
 */
export interface EquipmentItem {
  readonly id: string;
  readonly name: string;
  readonly category: EquipmentCategory;
  readonly description: string;
  readonly weight: number;
  readonly cost: CurrencyAmount;
  readonly quantity: number;
  readonly isEquipped: boolean;
  readonly isAttuned?: boolean;
  readonly requiresAttunement?: boolean;
  readonly properties?: Readonly<Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// Equipment Packs
// ---------------------------------------------------------------------------

/** Pre-built equipment packs (explorer's pack, dungeoneer's pack, etc.) */
export interface EquipmentPack {
  readonly id: string;
  readonly name: string;
  readonly cost: CurrencyAmount;
  readonly contents: readonly string[];
}

// ---------------------------------------------------------------------------
// Starting Equipment Choices
// ---------------------------------------------------------------------------

/**
 * A single option in a starting equipment choice.
 * Can be a single item ID or a group of item IDs (received together).
 */
export type StartingEquipmentOption = string | readonly string[];

/**
 * A starting equipment choice group.
 * The player picks `choose` number of options from the list.
 * Each option may be a single item or a bundle of items.
 *
 * Example: "Choose 1: (a) a martial weapon, or (b) two simple weapons"
 *   { choose: 1, options: ["longsword", ["handaxe", "handaxe"]] }
 */
export interface StartingEquipmentChoice {
  readonly choose: number;
  readonly options: readonly StartingEquipmentOption[];
}

// ---------------------------------------------------------------------------
// Inventory Management
// ---------------------------------------------------------------------------

/** An item in a character's inventory with equipped/carried state */
export interface InventoryItem {
  readonly id: string;
  readonly equipmentId: string;
  readonly name: string;
  readonly category: EquipmentCategory;
  readonly quantity: number;
  readonly weight: number;
  readonly isEquipped: boolean;
  readonly isAttuned: boolean;
  readonly requiresAttunement: boolean;
}

/**
 * Encumbrance tracking using the variant encumbrance rule.
 *
 * Thresholds (based on STR score):
 * - carryCapacity: STR x 15 (max weight in pounds)
 * - pushDragLift: STR x 30
 * - encumbered at STR x 5 (-10 speed)
 * - heavilyEncumbered at STR x 10 (-20 speed, disadvantage on STR/DEX/CON)
 */
export interface Encumbrance {
  readonly currentWeight: number;
  readonly carryCapacity: number;
  readonly pushDragLift: number;
  readonly encumbered: boolean;
  readonly heavilyEncumbered: boolean;
}

// ---------------------------------------------------------------------------
// Re-export Currency from core for convenience
// ---------------------------------------------------------------------------

export type { Currency };
