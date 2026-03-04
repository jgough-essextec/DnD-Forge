// =============================================================================
// Story 4.6 -- Currency & Inventory Calculation Tests
// Comprehensive test suite for currency conversion, total wealth calculation,
// inventory weight tracking, and starting gold rolling.
// =============================================================================

import { describe, it, expect } from 'vitest';
import type { Currency } from '@/types/core';
import type { InventoryItem } from '@/types/equipment';
import {
  convertCurrency,
  getTotalWealth,
  getTotalInventoryWeight,
  rollStartingGold,
} from '../currency';

// ---------------------------------------------------------------------------
// convertCurrency
// ---------------------------------------------------------------------------

describe('convertCurrency', () => {
  it('should convert 1 GP to 100 CP', () => {
    expect(convertCurrency(1, 'gp', 'cp')).toBe(100);
  });

  it('should convert 100 CP to 1 GP', () => {
    expect(convertCurrency(100, 'cp', 'gp')).toBe(1);
  });

  it('should convert 1 PP to 10 GP', () => {
    expect(convertCurrency(1, 'pp', 'gp')).toBe(10);
  });

  it('should convert 10 GP to 1 PP', () => {
    expect(convertCurrency(10, 'gp', 'pp')).toBe(1);
  });

  it('should convert 1 GP to 10 SP', () => {
    expect(convertCurrency(1, 'gp', 'sp')).toBe(10);
  });

  it('should convert 10 SP to 1 GP', () => {
    expect(convertCurrency(10, 'sp', 'gp')).toBe(1);
  });

  it('should convert 1 GP to 2 EP', () => {
    expect(convertCurrency(1, 'gp', 'ep')).toBe(2);
  });

  it('should convert 2 EP to 1 GP', () => {
    expect(convertCurrency(2, 'ep', 'gp')).toBe(1);
  });

  it('should convert 1 PP to 1000 CP', () => {
    expect(convertCurrency(1, 'pp', 'cp')).toBe(1000);
  });

  it('should return 0 when converting 0', () => {
    expect(convertCurrency(0, 'gp', 'cp')).toBe(0);
  });

  it('should handle same-denomination conversion', () => {
    expect(convertCurrency(5, 'gp', 'gp')).toBe(5);
  });

  it('should handle fractional conversions', () => {
    // 1 CP to GP = 0.01
    expect(convertCurrency(1, 'cp', 'gp')).toBeCloseTo(0.01);
  });

  it('should convert 5 SP to 50 CP', () => {
    expect(convertCurrency(5, 'sp', 'cp')).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// getTotalWealth
// ---------------------------------------------------------------------------

describe('getTotalWealth', () => {
  it('should return 0 for empty currency', () => {
    const currency: Currency = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    expect(getTotalWealth(currency)).toBe(0);
  });

  it('should calculate GP correctly', () => {
    const currency: Currency = { cp: 0, sp: 0, ep: 0, gp: 100, pp: 0 };
    expect(getTotalWealth(currency)).toBe(100);
  });

  it('should calculate PP as 10 GP each', () => {
    const currency: Currency = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 5 };
    expect(getTotalWealth(currency)).toBe(50);
  });

  it('should calculate EP as 0.5 GP each', () => {
    const currency: Currency = { cp: 0, sp: 0, ep: 4, gp: 0, pp: 0 };
    expect(getTotalWealth(currency)).toBe(2);
  });

  it('should calculate SP as 0.1 GP each', () => {
    const currency: Currency = { cp: 0, sp: 10, ep: 0, gp: 0, pp: 0 };
    expect(getTotalWealth(currency)).toBe(1);
  });

  it('should calculate CP as 0.01 GP each', () => {
    const currency: Currency = { cp: 100, sp: 0, ep: 0, gp: 0, pp: 0 };
    expect(getTotalWealth(currency)).toBe(1);
  });

  it('should sum all denominations correctly', () => {
    // 1PP (10) + 5GP (5) + 2EP (1) + 10SP (1) + 50CP (0.5) = 17.5
    const currency: Currency = { cp: 50, sp: 10, ep: 2, gp: 5, pp: 1 };
    expect(getTotalWealth(currency)).toBeCloseTo(17.5);
  });

  it('should handle large values', () => {
    const currency: Currency = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 1000 };
    expect(getTotalWealth(currency)).toBe(10000);
  });
});

// ---------------------------------------------------------------------------
// getTotalInventoryWeight
// ---------------------------------------------------------------------------

describe('getTotalInventoryWeight', () => {
  function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
    return {
      id: 'item-1',
      equipmentId: 'eq-1',
      name: 'Test Item',
      category: 'adventuring-gear',
      quantity: 1,
      weight: 1,
      isEquipped: false,
      isAttuned: false,
      requiresAttunement: false,
      ...overrides,
    };
  }

  it('should return 0 for empty inventory', () => {
    expect(getTotalInventoryWeight([])).toBe(0);
  });

  it('should return weight for a single item', () => {
    expect(getTotalInventoryWeight([makeItem({ weight: 5 })])).toBe(5);
  });

  it('should multiply weight by quantity', () => {
    expect(
      getTotalInventoryWeight([makeItem({ weight: 2, quantity: 3 })]),
    ).toBe(6);
  });

  it('should sum weights of multiple items', () => {
    const items = [
      makeItem({ id: '1', weight: 5, quantity: 1 }),
      makeItem({ id: '2', weight: 3, quantity: 2 }),
      makeItem({ id: '3', weight: 1, quantity: 10 }),
    ];
    // 5 + 6 + 10 = 21
    expect(getTotalInventoryWeight(items)).toBe(21);
  });

  it('should handle zero-weight items', () => {
    expect(
      getTotalInventoryWeight([makeItem({ weight: 0, quantity: 100 })]),
    ).toBe(0);
  });

  it('should handle zero-quantity items', () => {
    expect(
      getTotalInventoryWeight([makeItem({ weight: 10, quantity: 0 })]),
    ).toBe(0);
  });

  it('should handle fractional weights', () => {
    expect(
      getTotalInventoryWeight([makeItem({ weight: 0.5, quantity: 3 })]),
    ).toBeCloseTo(1.5);
  });
});

// ---------------------------------------------------------------------------
// rollStartingGold
// ---------------------------------------------------------------------------

describe('rollStartingGold', () => {
  // Use a deterministic random source that always returns 0.5
  // This means each die roll returns: min + floor(0.5 * range) = 1 + floor(0.5 * 4) = 3 for d4
  const midRandom = () => 0.5;

  it('should roll starting gold for Fighter (5d4 x 10)', () => {
    // midRandom on d4: 1 + floor(0.5 * 4) = 3, so 5 * 3 * 10 = 150
    const result = rollStartingGold('fighter', midRandom);
    expect(result).toBe(150);
  });

  it('should roll starting gold for Barbarian (2d4 x 10)', () => {
    // 2 * 3 * 10 = 60
    const result = rollStartingGold('barbarian', midRandom);
    expect(result).toBe(60);
  });

  it('should roll starting gold for Monk (5d4, no multiplier)', () => {
    // 5 * 3 = 15
    const result = rollStartingGold('monk', midRandom);
    expect(result).toBe(15);
  });

  it('should roll starting gold for Rogue (4d4 x 10)', () => {
    // 4 * 3 * 10 = 120
    const result = rollStartingGold('rogue', midRandom);
    expect(result).toBe(120);
  });

  it('should roll starting gold for Sorcerer (3d4 x 10)', () => {
    // 3 * 3 * 10 = 90
    const result = rollStartingGold('sorcerer', midRandom);
    expect(result).toBe(90);
  });

  it('should roll minimum with min random source', () => {
    // Always returns 0 -> each d4 = 1, so fighter: 5 * 1 * 10 = 50
    const minRandom = () => 0;
    expect(rollStartingGold('fighter', minRandom)).toBe(50);
  });

  it('should roll maximum with max random source', () => {
    // Returns just below 1 -> each d4 = 4, so fighter: 5 * 4 * 10 = 200
    const maxRandom = () => 0.99;
    expect(rollStartingGold('fighter', maxRandom)).toBe(200);
  });

  it('should throw for unknown class', () => {
    expect(() => rollStartingGold('unknown-class')).toThrow(
      'No starting gold formula found for class: unknown-class',
    );
  });
});
