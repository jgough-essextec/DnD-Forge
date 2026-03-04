/**
 * HP Tracker Utility Tests (Epic 27)
 *
 * Unit tests for pure HP management functions covering damage application,
 * healing, temporary HP, massive damage, death saves, and event logging.
 */

import { describe, it, expect } from 'vitest'
import {
  applyDamage,
  applyHealing,
  setTempHP,
  checkMassiveDamage,
  processDeathSaveDamage,
  processDeathSaveRoll,
  createDamageEvent,
  createHealingEvent,
  formatHPEvent,
} from '../hp-tracker'

// =============================================================================
// applyDamage
// =============================================================================

describe('applyDamage', () => {
  it('should apply damage to temp HP first, then current HP', () => {
    // 10 temp HP + 30 HP, 15 damage = 0 temp HP, 25 HP
    const result = applyDamage(30, 10, 40, 15)
    expect(result.newTemp).toBe(0)
    expect(result.newCurrent).toBe(25)
    expect(result.effectiveDamage).toBe(15)
  })

  it('should only deplete temp HP when damage is less than temp HP', () => {
    const result = applyDamage(30, 10, 40, 7)
    expect(result.newTemp).toBe(3)
    expect(result.newCurrent).toBe(30)
  })

  it('should clamp current HP at 0 (no negative HP)', () => {
    const result = applyDamage(10, 0, 20, 25)
    expect(result.newCurrent).toBe(0)
    expect(result.overflow).toBe(15)
  })

  it('should detect massive damage instant death (overflow >= max HP)', () => {
    // Character has 10 HP, 0 temp, max 20. Takes 30 damage.
    // After 0 HP, overflow = 20, which equals max HP => instant death
    const result = applyDamage(10, 0, 20, 30)
    expect(result.newCurrent).toBe(0)
    expect(result.overflow).toBe(20)
    expect(result.instantDeath).toBe(true)
  })

  it('should NOT trigger instant death when overflow < max HP', () => {
    // 10 HP, 0 temp, max 20, takes 25 damage => overflow = 15, < max 20
    const result = applyDamage(10, 0, 20, 25)
    expect(result.newCurrent).toBe(0)
    expect(result.overflow).toBe(15)
    expect(result.instantDeath).toBe(false)
  })

  it('should halve damage for resistance (round down)', () => {
    // 7 fire damage with fire resistance = 3 (floor of 3.5)
    const result = applyDamage(30, 0, 30, 7, 'fire', ['fire'])
    expect(result.effectiveDamage).toBe(3)
    expect(result.newCurrent).toBe(27)
    expect(result.damageRelation).toBe('resistance')
  })

  it('should round down resistance damage for odd values', () => {
    // 3 fire with resistance = 1 (floor of 1.5)
    const result = applyDamage(30, 0, 30, 3, 'fire', ['fire'])
    expect(result.effectiveDamage).toBe(1)
  })

  it('should double damage for vulnerability', () => {
    // 7 fire with vulnerability = 14
    const result = applyDamage(30, 0, 30, 7, 'fire', [], ['fire'])
    expect(result.effectiveDamage).toBe(14)
    expect(result.newCurrent).toBe(16)
    expect(result.damageRelation).toBe('vulnerability')
  })

  it('should set damage to 0 for immunity', () => {
    const result = applyDamage(30, 0, 30, 100, 'fire', [], [], ['fire'])
    expect(result.effectiveDamage).toBe(0)
    expect(result.newCurrent).toBe(30)
    expect(result.damageRelation).toBe('immunity')
  })

  it('should not apply resistance/vulnerability without a damage type', () => {
    const result = applyDamage(30, 0, 30, 10, undefined, ['fire'], ['cold'])
    expect(result.effectiveDamage).toBe(10)
    expect(result.damageRelation).toBeNull()
  })

  it('should not apply resistance for unrelated damage types', () => {
    // Has fire resistance, takes cold damage
    const result = applyDamage(30, 0, 30, 10, 'cold', ['fire'])
    expect(result.effectiveDamage).toBe(10)
    expect(result.damageRelation).toBeNull()
  })

  it('should return no change for 0 damage', () => {
    const result = applyDamage(30, 5, 35, 0)
    expect(result.newCurrent).toBe(30)
    expect(result.newTemp).toBe(5)
    expect(result.effectiveDamage).toBe(0)
  })

  it('should return no change for negative damage', () => {
    const result = applyDamage(30, 5, 35, -5)
    expect(result.newCurrent).toBe(30)
    expect(result.newTemp).toBe(5)
  })

  it('should handle massive damage with temp HP buffer', () => {
    // 5 HP, 5 temp, max 10, takes 25 damage
    // Effective: 25. Temp absorbs 5, remaining 20 > 5 HP => current = 0
    // overflow = 20 - 5 = 15, which >= max 10 => instant death
    const result = applyDamage(5, 5, 10, 25)
    expect(result.newCurrent).toBe(0)
    expect(result.newTemp).toBe(0)
    expect(result.instantDeath).toBe(true)
  })

  it('should handle damage when already at 0 HP', () => {
    const result = applyDamage(0, 0, 20, 10)
    expect(result.newCurrent).toBe(0)
    expect(result.overflow).toBe(10)
  })

  it('should apply resistance with temp HP', () => {
    // 20 HP, 5 temp, takes 10 fire with resistance => 5 effective
    // Temp absorbs all 5 => temp = 0, HP = 20
    const result = applyDamage(20, 5, 25, 10, 'fire', ['fire'])
    expect(result.effectiveDamage).toBe(5)
    expect(result.newTemp).toBe(0)
    expect(result.newCurrent).toBe(20)
  })

  it('should handle immunity checking before resistance', () => {
    // If both immune and resistant to fire, immunity takes precedence
    const result = applyDamage(30, 0, 30, 10, 'fire', ['fire'], [], ['fire'])
    expect(result.effectiveDamage).toBe(0)
    expect(result.damageRelation).toBe('immunity')
  })
})

// =============================================================================
// applyHealing
// =============================================================================

describe('applyHealing', () => {
  it('should add healing to current HP', () => {
    const result = applyHealing(20, 30, 5)
    expect(result.newCurrent).toBe(25)
    expect(result.actualHealing).toBe(5)
  })

  it('should cap healing at max HP (cannot overheal)', () => {
    const result = applyHealing(28, 30, 10)
    expect(result.newCurrent).toBe(30)
    expect(result.actualHealing).toBe(2)
  })

  it('should return 0 actual healing when at max HP', () => {
    const result = applyHealing(30, 30, 5)
    expect(result.newCurrent).toBe(30)
    expect(result.actualHealing).toBe(0)
  })

  it('should stabilize when healing from 0 HP', () => {
    const result = applyHealing(0, 30, 8)
    expect(result.newCurrent).toBe(8)
    expect(result.actualHealing).toBe(8)
    expect(result.stabilized).toBe(true)
  })

  it('should not stabilize when healing from non-zero HP', () => {
    const result = applyHealing(5, 30, 8)
    expect(result.stabilized).toBe(false)
  })

  it('should return no change for 0 healing', () => {
    const result = applyHealing(20, 30, 0)
    expect(result.newCurrent).toBe(20)
    expect(result.actualHealing).toBe(0)
  })

  it('should return no change for negative healing', () => {
    const result = applyHealing(20, 30, -5)
    expect(result.newCurrent).toBe(20)
    expect(result.actualHealing).toBe(0)
  })
})

// =============================================================================
// setTempHP
// =============================================================================

describe('setTempHP', () => {
  it('should keep higher value when new temp HP is set and existing is present', () => {
    // Current: 10, new: 5 => keep 10
    expect(setTempHP(10, 5)).toBe(10)
  })

  it('should replace temp HP when new value exceeds current', () => {
    // Current: 5, new: 10 => take 10
    expect(setTempHP(5, 10)).toBe(10)
  })

  it('should set temp HP when current is 0', () => {
    expect(setTempHP(0, 8)).toBe(8)
  })

  it('should return current when new value is 0', () => {
    expect(setTempHP(5, 0)).toBe(5)
  })

  it('should return current when new value is negative', () => {
    expect(setTempHP(5, -3)).toBe(5)
  })

  it('should keep equal values', () => {
    expect(setTempHP(10, 10)).toBe(10)
  })
})

// =============================================================================
// checkMassiveDamage
// =============================================================================

describe('checkMassiveDamage', () => {
  it('should return true when damage equals max HP', () => {
    expect(checkMassiveDamage(20, 20)).toBe(true)
  })

  it('should return true when damage exceeds max HP', () => {
    expect(checkMassiveDamage(30, 20)).toBe(true)
  })

  it('should return false when damage is less than max HP', () => {
    expect(checkMassiveDamage(15, 20)).toBe(false)
  })

  it('should return false for 0 damage', () => {
    expect(checkMassiveDamage(0, 20)).toBe(false)
  })
})

// =============================================================================
// processDeathSaveDamage
// =============================================================================

describe('processDeathSaveDamage', () => {
  it('should add 1 failure for normal damage at 0 HP', () => {
    const result = processDeathSaveDamage(
      { successes: 1, failures: 0, stable: false },
      false,
    )
    expect(result.failures).toBe(1)
    expect(result.successes).toBe(1)
  })

  it('should add 2 failures for critical hit at 0 HP', () => {
    const result = processDeathSaveDamage(
      { successes: 1, failures: 0, stable: false },
      true,
    )
    expect(result.failures).toBe(2)
  })

  it('should cap failures at 3', () => {
    const result = processDeathSaveDamage(
      { successes: 0, failures: 2, stable: false },
      true,
    )
    expect(result.failures).toBe(3)
  })

  it('should set stable to false when taking damage', () => {
    const result = processDeathSaveDamage(
      { successes: 2, failures: 1, stable: true },
      false,
    )
    expect(result.stable).toBe(false)
  })

  it('should preserve successes when taking damage', () => {
    const result = processDeathSaveDamage(
      { successes: 2, failures: 1, stable: false },
      false,
    )
    expect(result.successes).toBe(2)
    expect(result.failures).toBe(2)
  })
})

// =============================================================================
// processDeathSaveRoll
// =============================================================================

describe('processDeathSaveRoll', () => {
  it('should reset saves and regain HP on natural 20', () => {
    const result = processDeathSaveRoll(
      { successes: 1, failures: 2, stable: false },
      20,
    )
    expect(result.deathSaves.successes).toBe(0)
    expect(result.deathSaves.failures).toBe(0)
    expect(result.regainHP).toBe(true)
  })

  it('should add 2 failures on natural 1', () => {
    const result = processDeathSaveRoll(
      { successes: 0, failures: 0, stable: false },
      1,
    )
    expect(result.deathSaves.failures).toBe(2)
    expect(result.regainHP).toBe(false)
  })

  it('should add 1 success on roll >= 10', () => {
    const result = processDeathSaveRoll(
      { successes: 0, failures: 0, stable: false },
      10,
    )
    expect(result.deathSaves.successes).toBe(1)
    expect(result.deathSaves.failures).toBe(0)
  })

  it('should add 1 failure on roll < 10 (not nat 1)', () => {
    const result = processDeathSaveRoll(
      { successes: 0, failures: 0, stable: false },
      9,
    )
    expect(result.deathSaves.successes).toBe(0)
    expect(result.deathSaves.failures).toBe(1)
  })

  it('should set stable to true when reaching 3 successes', () => {
    const result = processDeathSaveRoll(
      { successes: 2, failures: 1, stable: false },
      15,
    )
    expect(result.deathSaves.successes).toBe(3)
    expect(result.deathSaves.stable).toBe(true)
  })

  it('should cap failures at 3 on nat 1 with 2 existing failures', () => {
    const result = processDeathSaveRoll(
      { successes: 0, failures: 2, stable: false },
      1,
    )
    expect(result.deathSaves.failures).toBe(3)
  })

  it('should treat roll of exactly 10 as success', () => {
    const result = processDeathSaveRoll(
      { successes: 0, failures: 0, stable: false },
      10,
    )
    expect(result.deathSaves.successes).toBe(1)
  })

  it('should treat roll of 19 as success', () => {
    const result = processDeathSaveRoll(
      { successes: 0, failures: 0, stable: false },
      19,
    )
    expect(result.deathSaves.successes).toBe(1)
  })

  it('should treat roll of 2 as failure', () => {
    const result = processDeathSaveRoll(
      { successes: 0, failures: 0, stable: false },
      2,
    )
    expect(result.deathSaves.failures).toBe(1)
  })
})

// =============================================================================
// createDamageEvent / createHealingEvent
// =============================================================================

describe('createDamageEvent', () => {
  it('should create a damage event with correct fields', () => {
    const event = createDamageEvent(10, 5, 'fire', 'resistance')
    expect(event.type).toBe('damage')
    expect(event.amount).toBe(10)
    expect(event.effectiveAmount).toBe(5)
    expect(event.damageType).toBe('fire')
    expect(event.damageRelation).toBe('resistance')
    expect(event.id).toMatch(/^hp-event-/)
    expect(event.timestamp).toBeGreaterThan(0)
  })

  it('should create a damage event without damage type', () => {
    const event = createDamageEvent(10, 10)
    expect(event.damageType).toBeUndefined()
    expect(event.damageRelation).toBeUndefined()
  })
})

describe('createHealingEvent', () => {
  it('should create a healing event with correct fields', () => {
    const event = createHealingEvent(10, 8, 'Cure Wounds')
    expect(event.type).toBe('healing')
    expect(event.amount).toBe(10)
    expect(event.effectiveAmount).toBe(8)
    expect(event.source).toBe('Cure Wounds')
  })

  it('should create a healing event without source', () => {
    const event = createHealingEvent(5, 5)
    expect(event.source).toBeUndefined()
  })
})

// =============================================================================
// formatHPEvent
// =============================================================================

describe('formatHPEvent', () => {
  it('should format damage event with type annotation', () => {
    const event = createDamageEvent(10, 10, 'slashing')
    const formatted = formatHPEvent(event)
    expect(formatted).toBe('-10 slashing')
  })

  it('should format damage event with resistance annotation', () => {
    const event = createDamageEvent(8, 4, 'fire', 'resistance')
    const formatted = formatHPEvent(event)
    expect(formatted).toBe('-4 fire (resisted from 8)')
  })

  it('should format damage event with vulnerability annotation', () => {
    const event = createDamageEvent(5, 10, 'cold', 'vulnerability')
    const formatted = formatHPEvent(event)
    expect(formatted).toBe('-10 cold (vulnerable from 5)')
  })

  it('should format damage event with immunity annotation', () => {
    const event = createDamageEvent(10, 0, 'poison', 'immunity')
    const formatted = formatHPEvent(event)
    expect(formatted).toBe('-0 poison (immune)')
  })

  it('should format damage event without type', () => {
    const event = createDamageEvent(7, 7)
    const formatted = formatHPEvent(event)
    expect(formatted).toBe('-7')
  })

  it('should format healing event', () => {
    const event = createHealingEvent(12, 12)
    const formatted = formatHPEvent(event)
    expect(formatted).toBe('+12 healing')
  })

  it('should format healing event with source', () => {
    const event = createHealingEvent(8, 8, 'Potion')
    const formatted = formatHPEvent(event)
    expect(formatted).toBe('+8 healing (Potion)')
  })
})
