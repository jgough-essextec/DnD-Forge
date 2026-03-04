/**
 * Spell Slot Utility Tests (Epic 28)
 *
 * Unit tests for pure spell slot management functions covering:
 * - Standard slot expend/restore
 * - Pact Magic expend/restore
 * - Arcane Recovery budget, validation, and application
 * - Casting checks and availability
 * - Ritual spell detection
 * - Slot summary color coding
 */

import { describe, it, expect } from 'vitest'
import {
  expendSlot,
  restoreSlot,
  restoreAllSlots,
  expendPactSlot,
  restorePactSlots,
  getArcaneRecoveryBudget,
  validateArcaneRecovery,
  applyArcaneRecovery,
  canCastAtLevel,
  getAvailableCastingLevels,
  isRitualCastable,
  getSlotStatusColor,
  formatSpellLevel,
} from '../spell-slots'
import type { PactMagic } from '@/types/spell'
import type { Spell } from '@/types/spell'

// ===========================================================================
// expendSlot
// ===========================================================================

describe('expendSlot', () => {
  it('should increment used count for a level with no prior usage', () => {
    const result = expendSlot({}, 1)
    expect(result[1]).toBe(1)
  })

  it('should increment used count for a level with existing usage', () => {
    const result = expendSlot({ 1: 2, 2: 1 }, 1)
    expect(result[1]).toBe(3)
    expect(result[2]).toBe(1) // other levels unchanged
  })

  it('should not mutate the original object', () => {
    const original = { 1: 2 }
    const result = expendSlot(original, 1)
    expect(original[1]).toBe(2)
    expect(result[1]).toBe(3)
  })

  it('should work for high-level slots (9th)', () => {
    const result = expendSlot({ 9: 0 }, 9)
    expect(result[9]).toBe(1)
  })
})

// ===========================================================================
// restoreSlot
// ===========================================================================

describe('restoreSlot', () => {
  it('should decrement used count by 1', () => {
    const result = restoreSlot({ 1: 3 }, 1)
    expect(result[1]).toBe(2)
  })

  it('should not go below 0', () => {
    const result = restoreSlot({ 1: 0 }, 1)
    expect(result[1]).toBe(0)
  })

  it('should handle restoring a level with no prior usage', () => {
    const result = restoreSlot({}, 1)
    expect(result[1]).toBe(0)
  })

  it('should not affect other levels', () => {
    const result = restoreSlot({ 1: 2, 2: 3 }, 1)
    expect(result[1]).toBe(1)
    expect(result[2]).toBe(3)
  })
})

// ===========================================================================
// restoreAllSlots
// ===========================================================================

describe('restoreAllSlots', () => {
  it('should set all used slots to 0', () => {
    const result = restoreAllSlots({ 1: 3, 2: 2, 3: 1 })
    expect(result[1]).toBe(0)
    expect(result[2]).toBe(0)
    expect(result[3]).toBe(0)
  })

  it('should handle empty slots', () => {
    const result = restoreAllSlots({})
    expect(Object.keys(result)).toHaveLength(0)
  })

  it('should handle already-zero slots', () => {
    const result = restoreAllSlots({ 1: 0, 2: 0 })
    expect(result[1]).toBe(0)
    expect(result[2]).toBe(0)
  })
})

// ===========================================================================
// expendPactSlot
// ===========================================================================

describe('expendPactSlot', () => {
  it('should increment used slots by 1', () => {
    const pact: PactMagic = { slotLevel: 3, totalSlots: 2, usedSlots: 0, mysticArcanum: {} }
    const result = expendPactSlot(pact)
    expect(result.usedSlots).toBe(1)
  })

  it('should not exceed total slots', () => {
    const pact: PactMagic = { slotLevel: 3, totalSlots: 2, usedSlots: 2, mysticArcanum: {} }
    const result = expendPactSlot(pact)
    expect(result.usedSlots).toBe(2)
  })

  it('should not mutate the original', () => {
    const pact: PactMagic = { slotLevel: 3, totalSlots: 2, usedSlots: 0, mysticArcanum: {} }
    expendPactSlot(pact)
    expect(pact.usedSlots).toBe(0)
  })

  it('should preserve other pact magic properties', () => {
    const pact: PactMagic = {
      slotLevel: 5,
      totalSlots: 3,
      usedSlots: 1,
      mysticArcanum: { 6: { spellId: 'mass-suggestion', used: false } },
    }
    const result = expendPactSlot(pact)
    expect(result.slotLevel).toBe(5)
    expect(result.totalSlots).toBe(3)
    expect(result.mysticArcanum[6].spellId).toBe('mass-suggestion')
  })
})

// ===========================================================================
// restorePactSlots
// ===========================================================================

describe('restorePactSlots', () => {
  it('should restore all pact magic slots (set used to 0)', () => {
    const pact: PactMagic = { slotLevel: 3, totalSlots: 2, usedSlots: 2, mysticArcanum: {} }
    const result = restorePactSlots(pact)
    expect(result.usedSlots).toBe(0)
  })

  it('should handle already-full slots', () => {
    const pact: PactMagic = { slotLevel: 3, totalSlots: 2, usedSlots: 0, mysticArcanum: {} }
    const result = restorePactSlots(pact)
    expect(result.usedSlots).toBe(0)
  })

  it('should not reset mystic arcanum (separate from pact slots)', () => {
    const pact: PactMagic = {
      slotLevel: 5,
      totalSlots: 3,
      usedSlots: 3,
      mysticArcanum: { 6: { spellId: 'mass-suggestion', used: true } },
    }
    const result = restorePactSlots(pact)
    expect(result.usedSlots).toBe(0)
    expect(result.mysticArcanum[6].used).toBe(true) // Not reset on short rest
  })
})

// ===========================================================================
// getArcaneRecoveryBudget
// ===========================================================================

describe('getArcaneRecoveryBudget', () => {
  it('should return 1 for Wizard level 1 (ceil(1/2) = 1)', () => {
    expect(getArcaneRecoveryBudget(1)).toBe(1)
  })

  it('should return 1 for Wizard level 2 (ceil(2/2) = 1)', () => {
    expect(getArcaneRecoveryBudget(2)).toBe(1)
  })

  it('should return 2 for Wizard level 3 (ceil(3/2) = 2)', () => {
    expect(getArcaneRecoveryBudget(3)).toBe(2)
  })

  it('should return 3 for Wizard level 5 (ceil(5/2) = 3)', () => {
    expect(getArcaneRecoveryBudget(5)).toBe(3)
  })

  it('should return 5 for Wizard level 10 (ceil(10/2) = 5)', () => {
    expect(getArcaneRecoveryBudget(10)).toBe(5)
  })

  it('should return 10 for Wizard level 20 (ceil(20/2) = 10)', () => {
    expect(getArcaneRecoveryBudget(20)).toBe(10)
  })

  it('should return 0 for invalid level 0', () => {
    expect(getArcaneRecoveryBudget(0)).toBe(0)
  })

  it('should return 0 for negative level', () => {
    expect(getArcaneRecoveryBudget(-1)).toBe(0)
  })
})

// ===========================================================================
// validateArcaneRecovery
// ===========================================================================

describe('validateArcaneRecovery', () => {
  it('should accept empty selection', () => {
    expect(validateArcaneRecovery([], 3)).toBe(true)
  })

  it('should accept selection within budget', () => {
    expect(validateArcaneRecovery([1, 2], 3)).toBe(true) // 1 + 2 = 3 <= 3
  })

  it('should accept selection exactly at budget', () => {
    expect(validateArcaneRecovery([3], 3)).toBe(true)
  })

  it('should reject selection exceeding budget', () => {
    expect(validateArcaneRecovery([2, 2], 3)).toBe(false) // 2 + 2 = 4 > 3
  })

  it('should reject slots of 6th level or higher', () => {
    expect(validateArcaneRecovery([6], 10)).toBe(false)
    expect(validateArcaneRecovery([7], 10)).toBe(false)
    expect(validateArcaneRecovery([8], 10)).toBe(false)
    expect(validateArcaneRecovery([9], 10)).toBe(false)
  })

  it('should accept 5th level slots (max recoverable)', () => {
    expect(validateArcaneRecovery([5], 5)).toBe(true)
  })

  it('should reject slots below level 1', () => {
    expect(validateArcaneRecovery([0], 3)).toBe(false)
  })

  it('should validate complex selections: 2nd + 1st = 3 within budget of 3', () => {
    expect(validateArcaneRecovery([2, 1], 3)).toBe(true)
  })

  it('should validate three 1st-level slots within budget of 3', () => {
    expect(validateArcaneRecovery([1, 1, 1], 3)).toBe(true)
  })
})

// ===========================================================================
// applyArcaneRecovery
// ===========================================================================

describe('applyArcaneRecovery', () => {
  it('should restore selected slots', () => {
    const usedSlots = { 1: 2, 2: 1, 3: 1 }
    const maxSlots = { 1: 4, 2: 3, 3: 2 }
    const result = applyArcaneRecovery(usedSlots, maxSlots, [1, 2])
    expect(result[1]).toBe(1) // 2 - 1 = 1
    expect(result[2]).toBe(0) // 1 - 1 = 0
    expect(result[3]).toBe(1) // unchanged
  })

  it('should not go below 0', () => {
    const usedSlots = { 1: 0 }
    const maxSlots = { 1: 4 }
    const result = applyArcaneRecovery(usedSlots, maxSlots, [1])
    expect(result[1]).toBe(0)
  })

  it('should handle multiple slots at the same level', () => {
    const usedSlots = { 1: 3 }
    const maxSlots = { 1: 4 }
    const result = applyArcaneRecovery(usedSlots, maxSlots, [1, 1])
    expect(result[1]).toBe(1) // 3 - 2 = 1
  })
})

// ===========================================================================
// canCastAtLevel
// ===========================================================================

describe('canCastAtLevel', () => {
  it('should return true when slots are available', () => {
    expect(canCastAtLevel({ 1: 1 }, { 1: 4 }, 1)).toBe(true)
  })

  it('should return false when all slots are used', () => {
    expect(canCastAtLevel({ 1: 4 }, { 1: 4 }, 1)).toBe(false)
  })

  it('should return false when no slots exist at that level', () => {
    expect(canCastAtLevel({}, { 1: 4 }, 5)).toBe(false)
  })

  it('should return true when zero slots are used', () => {
    expect(canCastAtLevel({ 1: 0 }, { 1: 2 }, 1)).toBe(true)
  })

  it('should return true when used slots record is empty', () => {
    expect(canCastAtLevel({}, { 1: 2 }, 1)).toBe(true)
  })
})

// ===========================================================================
// getAvailableCastingLevels
// ===========================================================================

describe('getAvailableCastingLevels', () => {
  it('should return available levels at or above spell level', () => {
    const maxSlots = { 1: 4, 2: 3, 3: 2 }
    const usedSlots = { 1: 4, 2: 1, 3: 0 }
    const result = getAvailableCastingLevels(1, usedSlots, maxSlots)
    // Level 1: 4/4 used - no; Level 2: 1/3 - yes; Level 3: 0/2 - yes
    expect(result).toEqual([2, 3])
  })

  it('should return empty array when no slots available', () => {
    const maxSlots = { 1: 2 }
    const usedSlots = { 1: 2 }
    const result = getAvailableCastingLevels(1, usedSlots, maxSlots)
    expect(result).toEqual([])
  })

  it('should include the base spell level if available', () => {
    const maxSlots = { 1: 4, 2: 3 }
    const usedSlots = { 1: 1 }
    const result = getAvailableCastingLevels(1, usedSlots, maxSlots)
    expect(result).toContain(1)
    expect(result).toContain(2)
  })

  it('should not include levels below the spell level', () => {
    const maxSlots = { 1: 4, 2: 3, 3: 2 }
    const usedSlots = {}
    const result = getAvailableCastingLevels(2, usedSlots, maxSlots)
    expect(result).not.toContain(1)
    expect(result).toContain(2)
    expect(result).toContain(3)
  })
})

// ===========================================================================
// isRitualCastable
// ===========================================================================

describe('isRitualCastable', () => {
  const makeSpell = (ritual: boolean): Spell => ({
    id: 'test-spell',
    name: 'Test Spell',
    level: 1,
    school: 'divination',
    castingTime: { value: 1, unit: 'action' },
    range: { type: 'self' },
    components: { verbal: true, somatic: false, material: false },
    duration: { type: 'instantaneous' },
    description: 'A test spell',
    ritual,
    concentration: false,
    classes: ['wizard'],
  })

  it('should return true for ritual spells', () => {
    expect(isRitualCastable(makeSpell(true))).toBe(true)
  })

  it('should return false for non-ritual spells', () => {
    expect(isRitualCastable(makeSpell(false))).toBe(false)
  })
})

// ===========================================================================
// getSlotStatusColor
// ===========================================================================

describe('getSlotStatusColor', () => {
  it('should return green when >50% available', () => {
    const result = getSlotStatusColor(3, 4) // 75%
    expect(result).toContain('emerald')
  })

  it('should return yellow when exactly 50% available', () => {
    const result = getSlotStatusColor(2, 4) // 50%
    expect(result).toContain('yellow')
  })

  it('should return yellow when <50% but >0% available', () => {
    const result = getSlotStatusColor(1, 4) // 25%
    expect(result).toContain('yellow')
  })

  it('should return red when 0% available', () => {
    const result = getSlotStatusColor(0, 4)
    expect(result).toContain('red')
  })

  it('should return muted color when total is 0', () => {
    const result = getSlotStatusColor(0, 0)
    expect(result).toContain('parchment')
  })
})

// ===========================================================================
// formatSpellLevel
// ===========================================================================

describe('formatSpellLevel', () => {
  it('should format 1 as "1st"', () => {
    expect(formatSpellLevel(1)).toBe('1st')
  })

  it('should format 2 as "2nd"', () => {
    expect(formatSpellLevel(2)).toBe('2nd')
  })

  it('should format 3 as "3rd"', () => {
    expect(formatSpellLevel(3)).toBe('3rd')
  })

  it('should format 4 as "4th"', () => {
    expect(formatSpellLevel(4)).toBe('4th')
  })

  it('should format 9 as "9th"', () => {
    expect(formatSpellLevel(9)).toBe('9th')
  })
})
