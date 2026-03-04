/**
 * Tests for SRD Equipment Data (Story 3.4)
 */
import { describe, it, expect } from 'vitest';
import {
  WEAPONS,
  ARMOR,
  EQUIPMENT_PACKS,
  STARTING_GOLD,
  getWeaponById,
  getArmorById,
  getEquipmentPackById,
  getWeaponsByCategory,
  getArmorByCategory,
} from '@/data/equipment';

// ---------------------------------------------------------------------------
// Weapons
// ---------------------------------------------------------------------------

describe('WEAPONS', () => {
  it('should export weapons array with all SRD weapons across 4 categories', () => {
    expect(WEAPONS.length).toBe(37);
  });

  it('should have no duplicate weapon IDs', () => {
    const ids = WEAPONS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have 10 simple melee weapons', () => {
    expect(getWeaponsByCategory('simple-melee')).toHaveLength(10);
  });

  it('should have 4 simple ranged weapons', () => {
    expect(getWeaponsByCategory('simple-ranged')).toHaveLength(4);
  });

  it('should have 18 martial melee weapons', () => {
    expect(getWeaponsByCategory('martial-melee')).toHaveLength(18);
  });

  it('should have 5 martial ranged weapons', () => {
    expect(getWeaponsByCategory('martial-ranged')).toHaveLength(5);
  });

  it('should have Club with 1d4 bludgeoning damage and light property', () => {
    const club = getWeaponById('club');
    expect(club).toBeDefined();
    expect(club!.damage.count).toBe(1);
    expect(club!.damage.die).toBe('d4');
    expect(club!.damage.type).toBe('bludgeoning');
    expect(club!.properties).toContain('light');
  });

  it('should have Dagger with finesse, light, and thrown properties', () => {
    const dagger = getWeaponById('dagger');
    expect(dagger).toBeDefined();
    expect(dagger!.damage.count).toBe(1);
    expect(dagger!.damage.die).toBe('d4');
    expect(dagger!.damage.type).toBe('piercing');
    expect(dagger!.properties).toContain('finesse');
    expect(dagger!.properties).toContain('light');
    expect(dagger!.properties).toContain('thrown');
    expect(dagger!.range).toEqual({ normal: 20, long: 60 });
  });

  it('should have Longsword with versatile property and 1d8/1d10 damage dice', () => {
    const longsword = getWeaponById('longsword');
    expect(longsword).toBeDefined();
    expect(longsword!.damage.count).toBe(1);
    expect(longsword!.damage.die).toBe('d8');
    expect(longsword!.damage.type).toBe('slashing');
    expect(longsword!.damage.versatileDie).toBe('d10');
    expect(longsword!.properties).toContain('versatile');
  });

  it('should have Greatsword with 2d6 slashing, heavy, two-handed', () => {
    const greatsword = getWeaponById('greatsword');
    expect(greatsword).toBeDefined();
    expect(greatsword!.damage.count).toBe(2);
    expect(greatsword!.damage.die).toBe('d6');
    expect(greatsword!.damage.type).toBe('slashing');
    expect(greatsword!.properties).toContain('heavy');
    expect(greatsword!.properties).toContain('two-handed');
  });

  it('should have Lance with special property and description', () => {
    const lance = getWeaponById('lance');
    expect(lance).toBeDefined();
    expect(lance!.properties).toContain('special');
    expect(lance!.properties).toContain('reach');
    expect(lance!.special).toBeDefined();
    expect(lance!.special!.length).toBeGreaterThan(0);
  });

  it('should have Net with special property and thrown range', () => {
    const net = getWeaponById('net');
    expect(net).toBeDefined();
    expect(net!.properties).toContain('special');
    expect(net!.properties).toContain('thrown');
    expect(net!.range).toEqual({ normal: 5, long: 15 });
    expect(net!.special).toBeDefined();
  });

  it('should have Longbow with correct range (150/600)', () => {
    const longbow = getWeaponById('longbow');
    expect(longbow).toBeDefined();
    expect(longbow!.range).toEqual({ normal: 150, long: 600 });
    expect(longbow!.properties).toContain('ammunition');
    expect(longbow!.properties).toContain('heavy');
    expect(longbow!.properties).toContain('two-handed');
  });

  it('should have every weapon with a valid cost', () => {
    for (const weapon of WEAPONS) {
      expect(weapon.cost.amount).toBeGreaterThanOrEqual(0);
      expect(['cp', 'sp', 'ep', 'gp', 'pp']).toContain(weapon.cost.unit);
    }
  });

  it('should have every weapon with a non-negative weight', () => {
    for (const weapon of WEAPONS) {
      expect(weapon.weight).toBeGreaterThanOrEqual(0);
    }
  });

  it('should return undefined for non-existent weapon ID', () => {
    expect(getWeaponById('lightsaber')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Armor
// ---------------------------------------------------------------------------

describe('ARMOR', () => {
  it('should have all 12 armor types plus shield (13 total)', () => {
    // 3 light + 5 medium + 4 heavy + 1 shield = 13
    expect(ARMOR.length).toBe(13);
  });

  it('should have no duplicate armor IDs', () => {
    const ids = ARMOR.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have 3 light armor types', () => {
    expect(getArmorByCategory('light')).toHaveLength(3);
  });

  it('should have 5 medium armor types', () => {
    expect(getArmorByCategory('medium')).toHaveLength(5);
  });

  it('should have 4 heavy armor types', () => {
    expect(getArmorByCategory('heavy')).toHaveLength(4);
  });

  it('should have 1 shield', () => {
    expect(getArmorByCategory('shield')).toHaveLength(1);
  });

  it('should have Plate armor with base AC 18, dexCap 0, and STR requirement 15', () => {
    const plate = getArmorById('plate');
    expect(plate).toBeDefined();
    expect(plate!.baseAC).toBe(18);
    expect(plate!.dexCap).toBe(0);
    expect(plate!.strengthRequirement).toBe(15);
    expect(plate!.stealthDisadvantage).toBe(true);
  });

  it('should have Studded Leather with base AC 12 and dexCap null (uncapped)', () => {
    const studdedLeather = getArmorById('studded-leather');
    expect(studdedLeather).toBeDefined();
    expect(studdedLeather!.baseAC).toBe(12);
    expect(studdedLeather!.dexCap).toBeNull();
    expect(studdedLeather!.stealthDisadvantage).toBe(false);
  });

  it('should have Chain Mail with base AC 16, STR 13, and stealth disadvantage', () => {
    const chainMail = getArmorById('chain-mail');
    expect(chainMail).toBeDefined();
    expect(chainMail!.baseAC).toBe(16);
    expect(chainMail!.dexCap).toBe(0);
    expect(chainMail!.strengthRequirement).toBe(13);
    expect(chainMail!.stealthDisadvantage).toBe(true);
  });

  it('should have Leather armor with base AC 11 and no stealth disadvantage', () => {
    const leather = getArmorById('leather');
    expect(leather).toBeDefined();
    expect(leather!.baseAC).toBe(11);
    expect(leather!.dexCap).toBeNull();
    expect(leather!.stealthDisadvantage).toBe(false);
  });

  it('should have Breastplate with base AC 14, dexCap 2, no stealth disadvantage', () => {
    const breastplate = getArmorById('breastplate');
    expect(breastplate).toBeDefined();
    expect(breastplate!.baseAC).toBe(14);
    expect(breastplate!.dexCap).toBe(2);
    expect(breastplate!.stealthDisadvantage).toBe(false);
  });

  it('should have Shield with base AC 2 (bonus)', () => {
    const shield = getArmorById('shield');
    expect(shield).toBeDefined();
    expect(shield!.baseAC).toBe(2);
    expect(shield!.category).toBe('shield');
  });

  it('should have all light armor with dexCap null', () => {
    for (const armor of getArmorByCategory('light')) {
      expect(armor.dexCap).toBeNull();
    }
  });

  it('should have all medium armor with dexCap 2', () => {
    for (const armor of getArmorByCategory('medium')) {
      expect(armor.dexCap).toBe(2);
    }
  });

  it('should have all heavy armor with dexCap 0', () => {
    for (const armor of getArmorByCategory('heavy')) {
      expect(armor.dexCap).toBe(0);
    }
  });

  it('should return undefined for non-existent armor ID', () => {
    expect(getArmorById('mithral')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Equipment Packs
// ---------------------------------------------------------------------------

describe('EQUIPMENT_PACKS', () => {
  it('should have all 7 equipment packs', () => {
    expect(EQUIPMENT_PACKS.length).toBe(7);
  });

  it('should have no duplicate pack IDs', () => {
    const ids = EQUIPMENT_PACKS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have all 7 equipment packs with complete contents', () => {
    const expectedPacks = [
      'burglars-pack',
      'diplomats-pack',
      'dungeoneers-pack',
      'entertainers-pack',
      'explorers-pack',
      'priests-pack',
      'scholars-pack',
    ];
    for (const id of expectedPacks) {
      const pack = getEquipmentPackById(id);
      expect(pack).toBeDefined();
      expect(pack!.contents.length).toBeGreaterThan(0);
      expect(pack!.cost.amount).toBeGreaterThan(0);
    }
  });

  it("should have Explorer's Pack costing 10 gp", () => {
    const pack = getEquipmentPackById('explorers-pack');
    expect(pack).toBeDefined();
    expect(pack!.cost).toEqual({ amount: 10, unit: 'gp' });
  });
});

// ---------------------------------------------------------------------------
// Starting Gold
// ---------------------------------------------------------------------------

describe('STARTING_GOLD', () => {
  it('should have starting gold formulas for all 12 classes', () => {
    expect(STARTING_GOLD.length).toBe(12);
  });

  it('should have no duplicate class IDs', () => {
    const ids = STARTING_GOLD.map((s) => s.classId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have Monk starting gold as 5d4 (no x10 multiplier)', () => {
    const monk = STARTING_GOLD.find((s) => s.classId === 'monk');
    expect(monk).toBeDefined();
    expect(monk!.dice).toBe('5d4');
    expect(monk!.multiplier).toBe(1);
    expect(monk!.diceCount).toBe(5);
  });

  it('should have Barbarian starting gold as 2d4 x 10', () => {
    const barbarian = STARTING_GOLD.find((s) => s.classId === 'barbarian');
    expect(barbarian).toBeDefined();
    expect(barbarian!.dice).toBe('2d4 x 10');
    expect(barbarian!.multiplier).toBe(10);
    expect(barbarian!.diceCount).toBe(2);
  });

  it('should have Fighter starting gold as 5d4 x 10', () => {
    const fighter = STARTING_GOLD.find((s) => s.classId === 'fighter');
    expect(fighter).toBeDefined();
    expect(fighter!.dice).toBe('5d4 x 10');
    expect(fighter!.multiplier).toBe(10);
  });

  it('should have all expected class IDs', () => {
    const expectedClasses = [
      'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk',
      'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard',
    ];
    const actualClasses = STARTING_GOLD.map((s) => s.classId);
    for (const cls of expectedClasses) {
      expect(actualClasses).toContain(cls);
    }
  });
});
