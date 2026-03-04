/**
 * Currency & Inventory Calculation Functions (Story 4.6)
 *
 * Pure functions for currency conversion, wealth calculation,
 * inventory weight tracking, and starting gold rolling.
 */

import type { Currency } from '@/types/core';
import type { CurrencyUnit } from '@/types/equipment';
import { CURRENCY_CONVERSION_RATES } from '@/types/equipment';
import type { InventoryItem } from '@/types/equipment';
import { STARTING_GOLD_BY_CLASS } from '@/data/reference';
import { rollStartingGold as diceRollStartingGold } from '@/utils/dice';

// ---------------------------------------------------------------------------
// Currency Conversion
// ---------------------------------------------------------------------------

/**
 * Convert an amount from one currency denomination to another.
 *
 * Uses copper pieces as the base unit for conversion:
 *   result = amount * RATES[from] / RATES[to]
 *
 * @param amount The amount to convert
 * @param from Source currency denomination
 * @param to Target currency denomination
 * @returns The converted amount (may be fractional)
 */
export function convertCurrency(
  amount: number,
  from: CurrencyUnit,
  to: CurrencyUnit,
): number {
  if (amount === 0) return 0;

  const fromRate = CURRENCY_CONVERSION_RATES[from];
  const toRate = CURRENCY_CONVERSION_RATES[to];

  return (amount * fromRate) / toRate;
}

// ---------------------------------------------------------------------------
// Total Wealth
// ---------------------------------------------------------------------------

/**
 * Calculate the total wealth of a currency pouch in gold piece equivalents.
 *
 * Formula: (PP * 10) + GP + (EP * 0.5) + (SP * 0.1) + (CP * 0.01)
 *
 * @param currency The currency holdings
 * @returns Total wealth in gold pieces
 */
export function getTotalWealth(currency: Currency): number {
  return (
    currency.pp * 10 +
    currency.gp +
    currency.ep * 0.5 +
    currency.sp * 0.1 +
    currency.cp * 0.01
  );
}

// ---------------------------------------------------------------------------
// Inventory Weight
// ---------------------------------------------------------------------------

/**
 * Calculate the total weight of all items in an inventory.
 *
 * Formula: sum(weight * quantity) for each item.
 *
 * @param items Array of inventory items
 * @returns Total weight in pounds
 */
export function getTotalInventoryWeight(items: InventoryItem[]): number {
  return items.reduce((total, item) => total + item.weight * item.quantity, 0);
}

// ---------------------------------------------------------------------------
// Starting Gold
// ---------------------------------------------------------------------------

/**
 * Roll starting gold for a given class.
 *
 * Looks up the class's starting gold dice formula from reference data and
 * rolls it using the dice engine. The formula is in the format "NdM x X"
 * (e.g. "5d4 x 10") which gets normalized to "NdMxX" for the dice engine.
 *
 * @param classId The class identifier (e.g. "fighter", "wizard")
 * @param randomSource Optional injectable random source for deterministic testing
 * @returns The rolled starting gold amount in GP
 * @throws Error if the classId has no starting gold formula
 */
export function rollStartingGold(
  classId: string,
  randomSource?: () => number,
): number {
  const formula = STARTING_GOLD_BY_CLASS[classId];
  if (!formula) {
    throw new Error(`No starting gold formula found for class: ${classId}`);
  }

  // Normalize "5d4 x 10" -> "5d4x10" for the dice engine
  const normalized = formula.replace(/\s+/g, '');

  return diceRollStartingGold(normalized, randomSource);
}
