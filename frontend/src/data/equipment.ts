/**
 * SRD Equipment Data (Story 3.4)
 *
 * All SRD weapons, armor, and equipment packs as typed constants.
 * Source: D&D 5e SRD (OGL 1.0a)
 */

import type { Weapon, Armor, EquipmentPack } from '@/types';

// ---------------------------------------------------------------------------
// Weapons
// ---------------------------------------------------------------------------

/**
 * All SRD weapons across 4 categories:
 * - Simple Melee (10)
 * - Simple Ranged (4)
 * - Martial Melee (18)
 * - Martial Ranged (5)
 *
 * Total: 37 weapons
 */
export const WEAPONS = [
  // ---- Simple Melee Weapons ----
  {
    id: 'club',
    name: 'Club',
    category: 'simple-melee',
    damage: { count: 1, die: 'd4', type: 'bludgeoning' },
    properties: ['light'],
    weight: 2,
    cost: { amount: 1, unit: 'sp' },
  },
  {
    id: 'dagger',
    name: 'Dagger',
    category: 'simple-melee',
    damage: { count: 1, die: 'd4', type: 'piercing' },
    properties: ['finesse', 'light', 'thrown'],
    weight: 1,
    cost: { amount: 2, unit: 'gp' },
    range: { normal: 20, long: 60 },
  },
  {
    id: 'greatclub',
    name: 'Greatclub',
    category: 'simple-melee',
    damage: { count: 1, die: 'd8', type: 'bludgeoning' },
    properties: ['two-handed'],
    weight: 10,
    cost: { amount: 2, unit: 'sp' },
  },
  {
    id: 'handaxe',
    name: 'Handaxe',
    category: 'simple-melee',
    damage: { count: 1, die: 'd6', type: 'slashing' },
    properties: ['light', 'thrown'],
    weight: 2,
    cost: { amount: 5, unit: 'gp' },
    range: { normal: 20, long: 60 },
  },
  {
    id: 'javelin',
    name: 'Javelin',
    category: 'simple-melee',
    damage: { count: 1, die: 'd6', type: 'piercing' },
    properties: ['thrown'],
    weight: 2,
    cost: { amount: 5, unit: 'sp' },
    range: { normal: 30, long: 120 },
  },
  {
    id: 'light-hammer',
    name: 'Light Hammer',
    category: 'simple-melee',
    damage: { count: 1, die: 'd4', type: 'bludgeoning' },
    properties: ['light', 'thrown'],
    weight: 2,
    cost: { amount: 2, unit: 'gp' },
    range: { normal: 20, long: 60 },
  },
  {
    id: 'mace',
    name: 'Mace',
    category: 'simple-melee',
    damage: { count: 1, die: 'd6', type: 'bludgeoning' },
    properties: [],
    weight: 4,
    cost: { amount: 5, unit: 'gp' },
  },
  {
    id: 'quarterstaff',
    name: 'Quarterstaff',
    category: 'simple-melee',
    damage: { count: 1, die: 'd6', type: 'bludgeoning', versatileDie: 'd8' },
    properties: ['versatile'],
    weight: 4,
    cost: { amount: 2, unit: 'sp' },
  },
  {
    id: 'sickle',
    name: 'Sickle',
    category: 'simple-melee',
    damage: { count: 1, die: 'd4', type: 'slashing' },
    properties: ['light'],
    weight: 2,
    cost: { amount: 1, unit: 'gp' },
  },
  {
    id: 'spear',
    name: 'Spear',
    category: 'simple-melee',
    damage: { count: 1, die: 'd6', type: 'piercing', versatileDie: 'd8' },
    properties: ['thrown', 'versatile'],
    weight: 3,
    cost: { amount: 1, unit: 'gp' },
    range: { normal: 20, long: 60 },
  },

  // ---- Simple Ranged Weapons ----
  {
    id: 'light-crossbow',
    name: 'Light Crossbow',
    category: 'simple-ranged',
    damage: { count: 1, die: 'd8', type: 'piercing' },
    properties: ['ammunition', 'loading', 'two-handed'],
    weight: 5,
    cost: { amount: 25, unit: 'gp' },
    range: { normal: 80, long: 320 },
  },
  {
    id: 'dart',
    name: 'Dart',
    category: 'simple-ranged',
    damage: { count: 1, die: 'd4', type: 'piercing' },
    properties: ['finesse', 'thrown'],
    weight: 0.25,
    cost: { amount: 5, unit: 'cp' },
    range: { normal: 20, long: 60 },
  },
  {
    id: 'shortbow',
    name: 'Shortbow',
    category: 'simple-ranged',
    damage: { count: 1, die: 'd6', type: 'piercing' },
    properties: ['ammunition', 'two-handed'],
    weight: 2,
    cost: { amount: 25, unit: 'gp' },
    range: { normal: 80, long: 320 },
  },
  {
    id: 'sling',
    name: 'Sling',
    category: 'simple-ranged',
    damage: { count: 1, die: 'd4', type: 'bludgeoning' },
    properties: ['ammunition'],
    weight: 0,
    cost: { amount: 1, unit: 'sp' },
    range: { normal: 30, long: 120 },
  },

  // ---- Martial Melee Weapons ----
  {
    id: 'battleaxe',
    name: 'Battleaxe',
    category: 'martial-melee',
    damage: { count: 1, die: 'd8', type: 'slashing', versatileDie: 'd10' },
    properties: ['versatile'],
    weight: 4,
    cost: { amount: 10, unit: 'gp' },
  },
  {
    id: 'flail',
    name: 'Flail',
    category: 'martial-melee',
    damage: { count: 1, die: 'd8', type: 'bludgeoning' },
    properties: [],
    weight: 2,
    cost: { amount: 10, unit: 'gp' },
  },
  {
    id: 'glaive',
    name: 'Glaive',
    category: 'martial-melee',
    damage: { count: 1, die: 'd10', type: 'slashing' },
    properties: ['heavy', 'reach', 'two-handed'],
    weight: 6,
    cost: { amount: 20, unit: 'gp' },
  },
  {
    id: 'greataxe',
    name: 'Greataxe',
    category: 'martial-melee',
    damage: { count: 1, die: 'd12', type: 'slashing' },
    properties: ['heavy', 'two-handed'],
    weight: 7,
    cost: { amount: 30, unit: 'gp' },
  },
  {
    id: 'greatsword',
    name: 'Greatsword',
    category: 'martial-melee',
    damage: { count: 2, die: 'd6', type: 'slashing' },
    properties: ['heavy', 'two-handed'],
    weight: 6,
    cost: { amount: 50, unit: 'gp' },
  },
  {
    id: 'halberd',
    name: 'Halberd',
    category: 'martial-melee',
    damage: { count: 1, die: 'd10', type: 'slashing' },
    properties: ['heavy', 'reach', 'two-handed'],
    weight: 6,
    cost: { amount: 20, unit: 'gp' },
  },
  {
    id: 'lance',
    name: 'Lance',
    category: 'martial-melee',
    damage: { count: 1, die: 'd12', type: 'piercing' },
    properties: ['reach', 'special'],
    weight: 6,
    cost: { amount: 10, unit: 'gp' },
    special: 'You have disadvantage when you use a lance to attack a target within 5 feet of you. Also, a lance requires two hands to wield when you aren\'t mounted.',
  },
  {
    id: 'longsword',
    name: 'Longsword',
    category: 'martial-melee',
    damage: { count: 1, die: 'd8', type: 'slashing', versatileDie: 'd10' },
    properties: ['versatile'],
    weight: 3,
    cost: { amount: 15, unit: 'gp' },
  },
  {
    id: 'maul',
    name: 'Maul',
    category: 'martial-melee',
    damage: { count: 2, die: 'd6', type: 'bludgeoning' },
    properties: ['heavy', 'two-handed'],
    weight: 10,
    cost: { amount: 10, unit: 'gp' },
  },
  {
    id: 'morningstar',
    name: 'Morningstar',
    category: 'martial-melee',
    damage: { count: 1, die: 'd8', type: 'piercing' },
    properties: [],
    weight: 4,
    cost: { amount: 15, unit: 'gp' },
  },
  {
    id: 'pike',
    name: 'Pike',
    category: 'martial-melee',
    damage: { count: 1, die: 'd10', type: 'piercing' },
    properties: ['heavy', 'reach', 'two-handed'],
    weight: 18,
    cost: { amount: 5, unit: 'gp' },
  },
  {
    id: 'rapier',
    name: 'Rapier',
    category: 'martial-melee',
    damage: { count: 1, die: 'd8', type: 'piercing' },
    properties: ['finesse'],
    weight: 2,
    cost: { amount: 25, unit: 'gp' },
  },
  {
    id: 'scimitar',
    name: 'Scimitar',
    category: 'martial-melee',
    damage: { count: 1, die: 'd6', type: 'slashing' },
    properties: ['finesse', 'light'],
    weight: 3,
    cost: { amount: 25, unit: 'gp' },
  },
  {
    id: 'shortsword',
    name: 'Shortsword',
    category: 'martial-melee',
    damage: { count: 1, die: 'd6', type: 'piercing' },
    properties: ['finesse', 'light'],
    weight: 2,
    cost: { amount: 10, unit: 'gp' },
  },
  {
    id: 'trident',
    name: 'Trident',
    category: 'martial-melee',
    damage: { count: 1, die: 'd6', type: 'piercing', versatileDie: 'd8' },
    properties: ['thrown', 'versatile'],
    weight: 4,
    cost: { amount: 5, unit: 'gp' },
    range: { normal: 20, long: 60 },
  },
  {
    id: 'war-pick',
    name: 'War Pick',
    category: 'martial-melee',
    damage: { count: 1, die: 'd8', type: 'piercing' },
    properties: [],
    weight: 2,
    cost: { amount: 5, unit: 'gp' },
  },
  {
    id: 'warhammer',
    name: 'Warhammer',
    category: 'martial-melee',
    damage: { count: 1, die: 'd8', type: 'bludgeoning', versatileDie: 'd10' },
    properties: ['versatile'],
    weight: 2,
    cost: { amount: 15, unit: 'gp' },
  },
  {
    id: 'whip',
    name: 'Whip',
    category: 'martial-melee',
    damage: { count: 1, die: 'd4', type: 'slashing' },
    properties: ['finesse', 'reach'],
    weight: 3,
    cost: { amount: 2, unit: 'gp' },
  },

  // ---- Martial Ranged Weapons ----
  {
    id: 'blowgun',
    name: 'Blowgun',
    category: 'martial-ranged',
    damage: { count: 1, die: 'd4', type: 'piercing' },
    properties: ['ammunition', 'loading'],
    weight: 1,
    cost: { amount: 10, unit: 'gp' },
    range: { normal: 25, long: 100 },
  },
  {
    id: 'hand-crossbow',
    name: 'Hand Crossbow',
    category: 'martial-ranged',
    damage: { count: 1, die: 'd6', type: 'piercing' },
    properties: ['ammunition', 'light', 'loading'],
    weight: 3,
    cost: { amount: 75, unit: 'gp' },
    range: { normal: 30, long: 120 },
  },
  {
    id: 'heavy-crossbow',
    name: 'Heavy Crossbow',
    category: 'martial-ranged',
    damage: { count: 1, die: 'd10', type: 'piercing' },
    properties: ['ammunition', 'heavy', 'loading', 'two-handed'],
    weight: 18,
    cost: { amount: 50, unit: 'gp' },
    range: { normal: 100, long: 400 },
  },
  {
    id: 'longbow',
    name: 'Longbow',
    category: 'martial-ranged',
    damage: { count: 1, die: 'd8', type: 'piercing' },
    properties: ['ammunition', 'heavy', 'two-handed'],
    weight: 2,
    cost: { amount: 50, unit: 'gp' },
    range: { normal: 150, long: 600 },
  },
  {
    id: 'net',
    name: 'Net',
    category: 'martial-ranged',
    damage: { count: 0, die: 'd4', type: 'bludgeoning' },
    properties: ['special', 'thrown'],
    weight: 3,
    cost: { amount: 1, unit: 'gp' },
    range: { normal: 5, long: 15 },
    special: 'A Large or smaller creature hit by a net is restrained until it is freed. A net has no effect on creatures that are formless, or creatures that are Huge or larger. A creature can use its action to make a DC 10 Strength check, freeing itself or another creature within its reach on a success. Dealing 5 slashing damage to the net (AC 10) also frees the creature without harming it, ending the effect and destroying the net.',
  },
] as const satisfies readonly Weapon[];

// ---------------------------------------------------------------------------
// Armor
// ---------------------------------------------------------------------------

/**
 * All SRD armor (13 types + shield).
 *
 * dexCap rules:
 *   null  = uncapped (light armor)
 *   2     = medium armor cap
 *   0     = no DEX contribution (heavy armor)
 *
 * Shield is modeled as category 'shield' with baseAC 2 (bonus).
 */
export const ARMOR = [
  // ---- Light Armor ----
  {
    id: 'padded',
    name: 'Padded',
    type: 'padded',
    category: 'light',
    baseAC: 11,
    dexCap: null,
    stealthDisadvantage: true,
    weight: 8,
    cost: { amount: 5, unit: 'gp' },
  },
  {
    id: 'leather',
    name: 'Leather',
    type: 'leather',
    category: 'light',
    baseAC: 11,
    dexCap: null,
    stealthDisadvantage: false,
    weight: 10,
    cost: { amount: 10, unit: 'gp' },
  },
  {
    id: 'studded-leather',
    name: 'Studded Leather',
    type: 'studded-leather',
    category: 'light',
    baseAC: 12,
    dexCap: null,
    stealthDisadvantage: false,
    weight: 13,
    cost: { amount: 45, unit: 'gp' },
  },

  // ---- Medium Armor ----
  {
    id: 'hide',
    name: 'Hide',
    type: 'hide',
    category: 'medium',
    baseAC: 12,
    dexCap: 2,
    stealthDisadvantage: false,
    weight: 12,
    cost: { amount: 10, unit: 'gp' },
  },
  {
    id: 'chain-shirt',
    name: 'Chain Shirt',
    type: 'chain-shirt',
    category: 'medium',
    baseAC: 13,
    dexCap: 2,
    stealthDisadvantage: false,
    weight: 20,
    cost: { amount: 50, unit: 'gp' },
  },
  {
    id: 'scale-mail',
    name: 'Scale Mail',
    type: 'scale-mail',
    category: 'medium',
    baseAC: 14,
    dexCap: 2,
    stealthDisadvantage: true,
    weight: 45,
    cost: { amount: 50, unit: 'gp' },
  },
  {
    id: 'breastplate',
    name: 'Breastplate',
    type: 'breastplate',
    category: 'medium',
    baseAC: 14,
    dexCap: 2,
    stealthDisadvantage: false,
    weight: 20,
    cost: { amount: 400, unit: 'gp' },
  },
  {
    id: 'half-plate',
    name: 'Half Plate',
    type: 'half-plate',
    category: 'medium',
    baseAC: 15,
    dexCap: 2,
    stealthDisadvantage: true,
    weight: 40,
    cost: { amount: 750, unit: 'gp' },
  },

  // ---- Heavy Armor ----
  {
    id: 'ring-mail',
    name: 'Ring Mail',
    type: 'ring-mail',
    category: 'heavy',
    baseAC: 14,
    dexCap: 0,
    stealthDisadvantage: true,
    weight: 40,
    cost: { amount: 30, unit: 'gp' },
  },
  {
    id: 'chain-mail',
    name: 'Chain Mail',
    type: 'chain-mail',
    category: 'heavy',
    baseAC: 16,
    dexCap: 0,
    stealthDisadvantage: true,
    strengthRequirement: 13,
    weight: 55,
    cost: { amount: 75, unit: 'gp' },
  },
  {
    id: 'splint',
    name: 'Splint',
    type: 'splint',
    category: 'heavy',
    baseAC: 17,
    dexCap: 0,
    stealthDisadvantage: true,
    strengthRequirement: 15,
    weight: 60,
    cost: { amount: 200, unit: 'gp' },
  },
  {
    id: 'plate',
    name: 'Plate',
    type: 'plate',
    category: 'heavy',
    baseAC: 18,
    dexCap: 0,
    stealthDisadvantage: true,
    strengthRequirement: 15,
    weight: 65,
    cost: { amount: 1500, unit: 'gp' },
  },

  // ---- Shield ----
  {
    id: 'shield',
    name: 'Shield',
    type: 'none',
    category: 'shield',
    baseAC: 2,
    dexCap: null,
    stealthDisadvantage: false,
    weight: 6,
    cost: { amount: 10, unit: 'gp' },
  },
] as const satisfies readonly Armor[];

// ---------------------------------------------------------------------------
// Equipment Packs
// ---------------------------------------------------------------------------

/**
 * The 7 SRD equipment packs available during character creation.
 * Contents are listed as human-readable item descriptions.
 */
export const EQUIPMENT_PACKS = [
  {
    id: 'burglars-pack',
    name: "Burglar's Pack",
    cost: { amount: 16, unit: 'gp' },
    contents: [
      'Backpack',
      '1,000 ball bearings',
      '10 feet of string',
      'Bell',
      '5 candles',
      'Crowbar',
      'Hammer',
      '10 pitons',
      'Hooded lantern',
      '2 flasks of oil',
      '5 days rations',
      'Tinderbox',
      'Waterskin',
      '50 feet of hempen rope',
    ],
  },
  {
    id: 'diplomats-pack',
    name: "Diplomat's Pack",
    cost: { amount: 39, unit: 'gp' },
    contents: [
      'Chest',
      '2 cases for maps and scrolls',
      'Fine clothes',
      'Bottle of ink',
      'Ink pen',
      'Lamp',
      '2 flasks of oil',
      '5 sheets of paper',
      'Vial of perfume',
      'Sealing wax',
      'Soap',
    ],
  },
  {
    id: 'dungeoneers-pack',
    name: "Dungeoneer's Pack",
    cost: { amount: 12, unit: 'gp' },
    contents: [
      'Backpack',
      'Crowbar',
      'Hammer',
      '10 pitons',
      '10 torches',
      'Tinderbox',
      '10 days of rations',
      'Waterskin',
      '50 feet of hempen rope',
    ],
  },
  {
    id: 'entertainers-pack',
    name: "Entertainer's Pack",
    cost: { amount: 40, unit: 'gp' },
    contents: [
      'Backpack',
      'Bedroll',
      '2 costumes',
      '5 candles',
      '5 days of rations',
      'Waterskin',
      'Disguise kit',
    ],
  },
  {
    id: 'explorers-pack',
    name: "Explorer's Pack",
    cost: { amount: 10, unit: 'gp' },
    contents: [
      'Backpack',
      'Bedroll',
      'Mess kit',
      'Tinderbox',
      '10 torches',
      '10 days of rations',
      'Waterskin',
      '50 feet of hempen rope',
    ],
  },
  {
    id: 'priests-pack',
    name: "Priest's Pack",
    cost: { amount: 19, unit: 'gp' },
    contents: [
      'Backpack',
      'Blanket',
      '10 candles',
      'Tinderbox',
      'Alms box',
      '2 blocks of incense',
      'Censer',
      'Vestments',
      '2 days of rations',
      'Waterskin',
    ],
  },
  {
    id: 'scholars-pack',
    name: "Scholar's Pack",
    cost: { amount: 40, unit: 'gp' },
    contents: [
      'Backpack',
      'Book of lore',
      'Bottle of ink',
      'Ink pen',
      '10 sheets of parchment',
      'Little bag of sand',
      'Small knife',
    ],
  },
] as const satisfies readonly EquipmentPack[];

// ---------------------------------------------------------------------------
// Starting Gold by Class
// ---------------------------------------------------------------------------

/**
 * Starting gold dice formulas by class ID.
 * Used as an alternative to starting equipment packs during character creation.
 * The multiplier is applied to the total roll result.
 */
export interface StartingGoldFormula {
  readonly classId: string;
  readonly dice: string;
  readonly diceCount: number;
  readonly dieType: string;
  readonly multiplier: number;
  readonly average: number;
}

export const STARTING_GOLD = [
  { classId: 'barbarian', dice: '2d4 x 10', diceCount: 2, dieType: 'd4', multiplier: 10, average: 50 },
  { classId: 'bard', dice: '5d4 x 10', diceCount: 5, dieType: 'd4', multiplier: 10, average: 125 },
  { classId: 'cleric', dice: '5d4 x 10', diceCount: 5, dieType: 'd4', multiplier: 10, average: 125 },
  { classId: 'druid', dice: '2d4 x 10', diceCount: 2, dieType: 'd4', multiplier: 10, average: 50 },
  { classId: 'fighter', dice: '5d4 x 10', diceCount: 5, dieType: 'd4', multiplier: 10, average: 125 },
  { classId: 'monk', dice: '5d4', diceCount: 5, dieType: 'd4', multiplier: 1, average: 13 },
  { classId: 'paladin', dice: '5d4 x 10', diceCount: 5, dieType: 'd4', multiplier: 10, average: 125 },
  { classId: 'ranger', dice: '5d4 x 10', diceCount: 5, dieType: 'd4', multiplier: 10, average: 125 },
  { classId: 'rogue', dice: '4d4 x 10', diceCount: 4, dieType: 'd4', multiplier: 10, average: 100 },
  { classId: 'sorcerer', dice: '3d4 x 10', diceCount: 3, dieType: 'd4', multiplier: 10, average: 75 },
  { classId: 'warlock', dice: '4d4 x 10', diceCount: 4, dieType: 'd4', multiplier: 10, average: 100 },
  { classId: 'wizard', dice: '4d4 x 10', diceCount: 4, dieType: 'd4', multiplier: 10, average: 100 },
] as const satisfies readonly StartingGoldFormula[];

// ---------------------------------------------------------------------------
// Lookup Helpers
// ---------------------------------------------------------------------------

/** Look up a weapon by ID. Returns undefined if not found. */
export function getWeaponById(id: string): Weapon | undefined {
  return WEAPONS.find((w) => w.id === id);
}

/** Look up an armor item by ID. Returns undefined if not found. */
export function getArmorById(id: string): Armor | undefined {
  return ARMOR.find((a) => a.id === id);
}

/** Look up an equipment pack by ID. Returns undefined if not found. */
export function getEquipmentPackById(id: string): EquipmentPack | undefined {
  return EQUIPMENT_PACKS.find((p) => p.id === id);
}

/** Get all weapons in a given category. */
export function getWeaponsByCategory(category: Weapon['category']): readonly Weapon[] {
  return WEAPONS.filter((w) => w.category === category);
}

/** Get all armor in a given category. */
export function getArmorByCategory(category: Armor['category']): readonly Armor[] {
  return ARMOR.filter((a) => a.category === category);
}
