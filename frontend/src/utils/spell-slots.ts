/**
 * Spell Slot Utility Functions (Epic 28)
 *
 * Pure functions for D&D 5e spell slot management including:
 * - Standard spell slot expend/restore (Stories 28.1)
 * - Warlock Pact Magic slot management (Story 28.2)
 * - Wizard Arcane Recovery (Story 28.3)
 * - Casting availability checks with upcasting support
 */

import type { PactMagic, Spell } from '@/types/spell'

// ---------------------------------------------------------------------------
// Standard Spell Slot Management (Story 28.1)
// ---------------------------------------------------------------------------

/**
 * Increment used count for a spell level by 1.
 * Returns a new record with the updated count.
 */
export function expendSlot(
  usedSlots: Record<number, number>,
  level: number,
): Record<number, number> {
  const current = usedSlots[level] ?? 0
  return { ...usedSlots, [level]: current + 1 }
}

/**
 * Decrement used count for a spell level by 1, floored at 0.
 * Returns a new record with the updated count.
 */
export function restoreSlot(
  usedSlots: Record<number, number>,
  level: number,
): Record<number, number> {
  const current = usedSlots[level] ?? 0
  return { ...usedSlots, [level]: Math.max(0, current - 1) }
}

/**
 * Set all used slot counts to 0 (long rest recovery).
 * Returns a new record with every level set to 0.
 */
export function restoreAllSlots(
  usedSlots: Record<number, number>,
): Record<number, number> {
  const result: Record<number, number> = {}
  for (const key of Object.keys(usedSlots)) {
    result[Number(key)] = 0
  }
  return result
}

/**
 * Calculate remaining (available) slots per level.
 */
export function getAvailableSlots(
  totalSlots: Record<number, number>,
  usedSlots: Record<number, number>,
): Record<number, number> {
  const result: Record<number, number> = {}
  for (const key of Object.keys(totalSlots)) {
    const level = Number(key)
    const total = totalSlots[level] ?? 0
    const used = usedSlots[level] ?? 0
    result[level] = Math.max(0, total - used)
  }
  return result
}

/**
 * Check if any slots are available at the given level or higher (for upcasting).
 */
export function canCastAtLevel(
  usedSlots: Record<number, number>,
  totalSlots: Record<number, number>,
  level: number,
): boolean {
  for (let l = level; l <= 9; l++) {
    const total = totalSlots[l] ?? 0
    const used = usedSlots[l] ?? 0
    if (total > 0 && used < total) return true
  }
  return false
}

/**
 * Get all spell levels at or above a given spell level that have available slots.
 * Used for presenting upcasting options.
 */
export function getAvailableCastingLevels(
  spellLevel: number,
  usedSlots: Record<number, number>,
  totalSlots: Record<number, number>,
): number[] {
  const levels: number[] = []
  for (let l = spellLevel; l <= 9; l++) {
    const total = totalSlots[l] ?? 0
    const used = usedSlots[l] ?? 0
    if (total > 0 && used < total) {
      levels.push(l)
    }
  }
  return levels
}

// ---------------------------------------------------------------------------
// Warlock Pact Magic (Story 28.2)
// ---------------------------------------------------------------------------

/**
 * Expend a Pact Magic slot. Increments usedSlots by 1, capped at totalSlots.
 * Returns a new PactMagic object.
 */
export function expendPactSlot(pactMagic: PactMagic): PactMagic {
  return {
    ...pactMagic,
    usedSlots: Math.min(pactMagic.totalSlots, pactMagic.usedSlots + 1),
  }
}

/**
 * Restore all Pact Magic slots (short rest recovery).
 * Resets usedSlots to 0. Does NOT reset Mystic Arcanum.
 */
export function restorePactSlots(pactMagic: PactMagic): PactMagic {
  return {
    ...pactMagic,
    usedSlots: 0,
  }
}

/**
 * Check if any Pact Magic slots are available.
 */
export function canUsePactSlot(pactMagic: PactMagic): boolean {
  return pactMagic.usedSlots < pactMagic.totalSlots
}

// ---------------------------------------------------------------------------
// Wizard Arcane Recovery (Story 28.3)
// ---------------------------------------------------------------------------

/**
 * Calculate the Arcane Recovery budget for a Wizard.
 * Budget = ceil(wizardLevel / 2).
 * Returns 0 for invalid (zero or negative) levels.
 */
export function getArcaneRecoveryBudget(wizardLevel: number): number {
  if (wizardLevel <= 0) return 0
  return Math.ceil(wizardLevel / 2)
}

/**
 * Validate an Arcane Recovery selection.
 * Each entry in the selections array is a spell level to recover.
 * Rules:
 * - Sum of all levels must be <= budget
 * - No slot level >= 6 or < 1
 */
export function validateArcaneRecovery(
  selections: number[],
  budget: number,
): boolean {
  if (selections.length === 0) return true
  const total = selections.reduce((sum, level) => sum + level, 0)
  if (total > budget) return false
  return selections.every(level => level >= 1 && level <= 5)
}

/**
 * Apply Arcane Recovery to used spell slots.
 * Each entry in selections is a spell level to recover one slot of.
 * Used counts are decremented but never below 0.
 */
export function applyArcaneRecovery(
  usedSlots: Record<number, number>,
  _maxSlots: Record<number, number>,
  selections: number[],
): Record<number, number> {
  const result = { ...usedSlots }
  for (const level of selections) {
    const current = result[level] ?? 0
    result[level] = Math.max(0, current - 1)
  }
  return result
}

// ---------------------------------------------------------------------------
// Ritual Casting
// ---------------------------------------------------------------------------

/**
 * Check if a spell can be cast as a ritual (has the ritual tag).
 */
export function isRitualCastable(spell: Spell): boolean {
  return spell.ritual
}

// ---------------------------------------------------------------------------
// Display Helpers
// ---------------------------------------------------------------------------

/**
 * Get a Tailwind color class based on slot availability ratio.
 * - >50% available: emerald (green)
 * - 1-50% available: yellow
 * - 0% available: red
 * - 0 total: muted parchment
 */
export function getSlotStatusColor(available: number, total: number): string {
  if (total === 0) return 'text-parchment/50'
  if (available === 0) return 'text-red-400'
  const ratio = available / total
  if (ratio > 0.5) return 'text-emerald-400'
  return 'text-yellow-400'
}

/**
 * Format a spell level number into its ordinal string.
 * e.g., 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th"
 */
export function formatSpellLevel(level: number): string {
  if (level === 1) return '1st'
  if (level === 2) return '2nd'
  if (level === 3) return '3rd'
  return `${level}th`
}
