/**
 * Equipment & Inventory Type Tests (Story 2.4)
 *
 * Type assertion tests that verify all equipment types compile correctly
 * and that constant values are accurate.
 */

import { describe, it, expect } from 'vitest';
import type {
  WeaponProperty,
  DamageDice,
  CurrencyUnit,
  CurrencyAmount,
  Weapon,
  Armor,
  EquipmentItem,
  EquipmentPack,
  StartingEquipmentOption,
  StartingEquipmentChoice,
  InventoryItem,
  Encumbrance,
} from '../equipment';
import {
  WEAPON_PROPERTIES,
  WEAPON_CATEGORIES,
  CURRENCY_CONVERSION_RATES,
  ARMOR_TYPES,
  ARMOR_CATEGORIES,
  EQUIPMENT_CATEGORIES,
} from '../equipment';

// ---------------------------------------------------------------------------
// Helper: compile-time type assertion (value is never used at runtime)
// ---------------------------------------------------------------------------
function assertType<_T>(_value: _T): void {
  // no-op; purely for compile-time verification
}

// ---------------------------------------------------------------------------
// WeaponProperty
// ---------------------------------------------------------------------------
describe('WeaponProperty', () => {
  it('should define WeaponProperty union with all 10 weapon properties', () => {
    expect(WEAPON_PROPERTIES).toHaveLength(10);
    expect(WEAPON_PROPERTIES).toContain('ammunition');
    expect(WEAPON_PROPERTIES).toContain('finesse');
    expect(WEAPON_PROPERTIES).toContain('heavy');
    expect(WEAPON_PROPERTIES).toContain('light');
    expect(WEAPON_PROPERTIES).toContain('loading');
    expect(WEAPON_PROPERTIES).toContain('reach');
    expect(WEAPON_PROPERTIES).toContain('special');
    expect(WEAPON_PROPERTIES).toContain('thrown');
    expect(WEAPON_PROPERTIES).toContain('two-handed');
    expect(WEAPON_PROPERTIES).toContain('versatile');
  });

  it('should accept valid WeaponProperty values', () => {
    const prop: WeaponProperty = 'finesse';
    assertType<WeaponProperty>(prop);
  });
});

// ---------------------------------------------------------------------------
// WeaponCategory
// ---------------------------------------------------------------------------
describe('WeaponCategory', () => {
  it('should define WeaponCategory with 4 categories', () => {
    expect(WEAPON_CATEGORIES).toHaveLength(4);
    expect(WEAPON_CATEGORIES).toContain('simple-melee');
    expect(WEAPON_CATEGORIES).toContain('simple-ranged');
    expect(WEAPON_CATEGORIES).toContain('martial-melee');
    expect(WEAPON_CATEGORIES).toContain('martial-ranged');
  });
});

// ---------------------------------------------------------------------------
// DamageDice
// ---------------------------------------------------------------------------
describe('DamageDice', () => {
  it('should define DamageDice with optional versatileDie for versatile weapons', () => {
    // Longsword: 1d8 slashing, versatile 1d10
    const longswordDamage: DamageDice = {
      count: 1,
      die: 'd8',
      type: 'slashing',
      versatileDie: 'd10',
    };
    assertType<DamageDice>(longswordDamage);
    expect(longswordDamage.count).toBe(1);
    expect(longswordDamage.die).toBe('d8');
    expect(longswordDamage.type).toBe('slashing');
    expect(longswordDamage.versatileDie).toBe('d10');
  });

  it('should allow DamageDice without versatileDie', () => {
    const greatswordDamage: DamageDice = {
      count: 2,
      die: 'd6',
      type: 'slashing',
    };
    assertType<DamageDice>(greatswordDamage);
    expect(greatswordDamage.versatileDie).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Weapon
// ---------------------------------------------------------------------------
describe('Weapon', () => {
  it('should define Weapon interface with category, damage, properties, and optional range', () => {
    // Longbow: martial ranged weapon
    const longbow: Weapon = {
      id: 'longbow',
      name: 'Longbow',
      category: 'martial-ranged',
      damage: { count: 1, die: 'd8', type: 'piercing' },
      properties: ['ammunition', 'heavy', 'two-handed'],
      weight: 2,
      cost: { amount: 50, unit: 'gp' },
      range: { normal: 150, long: 600 },
    };
    assertType<Weapon>(longbow);
    expect(longbow.category).toBe('martial-ranged');
    expect(longbow.range).toEqual({ normal: 150, long: 600 });
    expect(longbow.properties).toContain('ammunition');
  });

  it('should allow Weapon without range (melee weapons)', () => {
    const longsword: Weapon = {
      id: 'longsword',
      name: 'Longsword',
      category: 'martial-melee',
      damage: { count: 1, die: 'd8', type: 'slashing', versatileDie: 'd10' },
      properties: ['versatile'],
      weight: 3,
      cost: { amount: 15, unit: 'gp' },
    };
    assertType<Weapon>(longsword);
    expect(longsword.range).toBeUndefined();
  });

  it('should allow Weapon with special property description', () => {
    const net: Weapon = {
      id: 'net',
      name: 'Net',
      category: 'martial-ranged',
      damage: { count: 0, die: 'd4', type: 'bludgeoning' },
      properties: ['special', 'thrown'],
      weight: 3,
      cost: { amount: 1, unit: 'gp' },
      range: { normal: 5, long: 15 },
      special: 'A Large or smaller creature hit by a net is restrained until freed.',
    };
    assertType<Weapon>(net);
    expect(net.special).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Armor
// ---------------------------------------------------------------------------
describe('Armor', () => {
  it('should define ArmorType with all 13 armor types plus none', () => {
    expect(ARMOR_TYPES).toHaveLength(13);
    expect(ARMOR_TYPES).toContain('none');
    expect(ARMOR_TYPES).toContain('padded');
    expect(ARMOR_TYPES).toContain('leather');
    expect(ARMOR_TYPES).toContain('studded-leather');
    expect(ARMOR_TYPES).toContain('plate');
  });

  it('should define ArmorCategory with light, medium, heavy, shield', () => {
    expect(ARMOR_CATEGORIES).toHaveLength(4);
    expect(ARMOR_CATEGORIES).toContain('light');
    expect(ARMOR_CATEGORIES).toContain('medium');
    expect(ARMOR_CATEGORIES).toContain('heavy');
    expect(ARMOR_CATEGORIES).toContain('shield');
  });

  it('should define Armor interface with baseAC, dexCap (null for uncapped), stealthDisadvantage, and strengthRequirement', () => {
    const plateArmor: Armor = {
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
    };
    assertType<Armor>(plateArmor);
    expect(plateArmor.baseAC).toBe(18);
    expect(plateArmor.dexCap).toBe(0);
    expect(plateArmor.stealthDisadvantage).toBe(true);
    expect(plateArmor.strengthRequirement).toBe(15);
  });

  it('should define Armor.dexCap as null for light armor, +2 for medium, 0 for heavy', () => {
    // Light armor: dexCap = null (no maximum DEX bonus)
    const leather: Armor = {
      id: 'leather',
      name: 'Leather',
      type: 'leather',
      category: 'light',
      baseAC: 11,
      dexCap: null,
      stealthDisadvantage: false,
      weight: 10,
      cost: { amount: 10, unit: 'gp' },
    };
    expect(leather.dexCap).toBeNull();

    // Medium armor: dexCap = 2 (typical max DEX bonus for medium armor)
    const breastplate: Armor = {
      id: 'breastplate',
      name: 'Breastplate',
      type: 'breastplate',
      category: 'medium',
      baseAC: 14,
      dexCap: 2,
      stealthDisadvantage: false,
      weight: 20,
      cost: { amount: 400, unit: 'gp' },
    };
    expect(breastplate.dexCap).toBe(2);

    // Heavy armor: dexCap = 0 (DEX does not contribute to AC)
    const chainMail: Armor = {
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
    };
    expect(chainMail.dexCap).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------
describe('Currency', () => {
  it('should define CurrencyUnit with all 5 denominations', () => {
    const units: CurrencyUnit[] = ['cp', 'sp', 'ep', 'gp', 'pp'];
    expect(units).toHaveLength(5);
    units.forEach((unit) => assertType<CurrencyUnit>(unit));
  });

  it('should define CurrencyAmount with amount and unit', () => {
    const cost: CurrencyAmount = { amount: 50, unit: 'gp' };
    assertType<CurrencyAmount>(cost);
    expect(cost.amount).toBe(50);
    expect(cost.unit).toBe('gp');
  });

  it('should define CURRENCY_CONVERSION_RATES with correct CP base values (pp=1000, gp=100, ep=50, sp=10, cp=1)', () => {
    expect(CURRENCY_CONVERSION_RATES.pp).toBe(1000);
    expect(CURRENCY_CONVERSION_RATES.gp).toBe(100);
    expect(CURRENCY_CONVERSION_RATES.ep).toBe(50);
    expect(CURRENCY_CONVERSION_RATES.sp).toBe(10);
    expect(CURRENCY_CONVERSION_RATES.cp).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// EquipmentCategory
// ---------------------------------------------------------------------------
describe('EquipmentCategory', () => {
  it('should define EquipmentCategory with all categories', () => {
    expect(EQUIPMENT_CATEGORIES).toHaveLength(8);
    expect(EQUIPMENT_CATEGORIES).toContain('weapon');
    expect(EQUIPMENT_CATEGORIES).toContain('armor');
    expect(EQUIPMENT_CATEGORIES).toContain('shield');
    expect(EQUIPMENT_CATEGORIES).toContain('adventuring-gear');
    expect(EQUIPMENT_CATEGORIES).toContain('tool');
    expect(EQUIPMENT_CATEGORIES).toContain('mount');
    expect(EQUIPMENT_CATEGORIES).toContain('trade-good');
    expect(EQUIPMENT_CATEGORIES).toContain('pack');
  });
});

// ---------------------------------------------------------------------------
// EquipmentItem
// ---------------------------------------------------------------------------
describe('EquipmentItem', () => {
  it('should define EquipmentItem with quantity, isEquipped, and optional isAttuned fields', () => {
    const rope: EquipmentItem = {
      id: 'rope-hempen',
      name: 'Rope, Hempen (50 feet)',
      category: 'adventuring-gear',
      description: 'A 50-foot length of hempen rope.',
      weight: 10,
      cost: { amount: 1, unit: 'gp' },
      quantity: 1,
      isEquipped: false,
    };
    assertType<EquipmentItem>(rope);
    expect(rope.isAttuned).toBeUndefined();
    expect(rope.requiresAttunement).toBeUndefined();
  });

  it('should allow EquipmentItem with attunement fields', () => {
    const magicItem: EquipmentItem = {
      id: 'cloak-of-protection',
      name: 'Cloak of Protection',
      category: 'adventuring-gear',
      description: 'A magic cloak that grants +1 to AC and saving throws.',
      weight: 1,
      cost: { amount: 0, unit: 'gp' },
      quantity: 1,
      isEquipped: true,
      isAttuned: true,
      requiresAttunement: true,
      properties: { acBonus: 1, savingThrowBonus: 1 },
    };
    assertType<EquipmentItem>(magicItem);
    expect(magicItem.isAttuned).toBe(true);
    expect(magicItem.requiresAttunement).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// EquipmentPack
// ---------------------------------------------------------------------------
describe('EquipmentPack', () => {
  it('should define EquipmentPack with contents list', () => {
    const explorersPack: EquipmentPack = {
      id: 'explorers-pack',
      name: "Explorer's Pack",
      cost: { amount: 10, unit: 'gp' },
      contents: [
        'backpack',
        'bedroll',
        'mess-kit',
        'tinderbox',
        'torch',
        'torch',
        'torch',
        'torch',
        'torch',
        'torch',
        'torch',
        'torch',
        'torch',
        'torch',
        'rations',
        'waterskin',
        'rope-hempen',
      ],
    };
    assertType<EquipmentPack>(explorersPack);
    expect(explorersPack.contents.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// StartingEquipmentChoice
// ---------------------------------------------------------------------------
describe('StartingEquipmentChoice', () => {
  it('should define StartingEquipmentChoice with choose-from-options pattern', () => {
    // "Choose 1: (a) a martial weapon, or (b) two handaxes"
    const choice: StartingEquipmentChoice = {
      choose: 1,
      options: ['longsword', ['handaxe', 'handaxe']],
    };
    assertType<StartingEquipmentChoice>(choice);
    expect(choice.choose).toBe(1);
    expect(choice.options).toHaveLength(2);
  });

  it('should allow single-item and multi-item options', () => {
    const option1: StartingEquipmentOption = 'shield';
    const option2: StartingEquipmentOption = ['light-crossbow', 'crossbow-bolt-20'];
    assertType<StartingEquipmentOption>(option1);
    assertType<StartingEquipmentOption>(option2);
  });
});

// ---------------------------------------------------------------------------
// Encumbrance
// ---------------------------------------------------------------------------
describe('Encumbrance', () => {
  it('should define Encumbrance interface with currentWeight, carryCapacity, and threshold booleans', () => {
    // STR 15 character carrying 80 lbs
    const enc: Encumbrance = {
      currentWeight: 80,
      carryCapacity: 225, // 15 * 15
      pushDragLift: 450, // 15 * 30
      encumbered: true, // > STR*5 = 75
      heavilyEncumbered: false, // < STR*10 = 150
    };
    assertType<Encumbrance>(enc);
    expect(enc.currentWeight).toBe(80);
    expect(enc.carryCapacity).toBe(225);
    expect(enc.pushDragLift).toBe(450);
    expect(enc.encumbered).toBe(true);
    expect(enc.heavilyEncumbered).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// InventoryItem
// ---------------------------------------------------------------------------
describe('InventoryItem', () => {
  it('should define InventoryItem with equipped/carried state and attunement', () => {
    const item: InventoryItem = {
      id: 'inv-1',
      equipmentId: 'longsword',
      name: 'Longsword',
      category: 'weapon',
      quantity: 1,
      weight: 3,
      isEquipped: true,
      isAttuned: false,
      requiresAttunement: false,
    };
    assertType<InventoryItem>(item);
    expect(item.isEquipped).toBe(true);
    expect(item.isAttuned).toBe(false);
  });
});
