/**
 * HP Tracker Utilities (Epic 27)
 *
 * Pure functions for D&D 5e hit point management including damage application
 * with resistance/vulnerability/immunity, healing, temporary HP, massive damage,
 * and death save processing.
 */

import type { DamageType } from '@/types/core'
import type { DeathSaves } from '@/types/combat'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DamageRelation = 'resistance' | 'vulnerability' | 'immunity'

export interface ApplyDamageResult {
  newCurrent: number
  newTemp: number
  overflow: number
  instantDeath: boolean
  effectiveDamage: number
  damageRelation: DamageRelation | null
}

export interface ApplyHealingResult {
  newCurrent: number
  actualHealing: number
  stabilized: boolean
}

export interface HPEvent {
  id: string
  type: 'damage' | 'healing'
  amount: number
  effectiveAmount: number
  damageType?: DamageType
  damageRelation?: DamageRelation | null
  source?: string
  timestamp: number
}

// ---------------------------------------------------------------------------
// Damage Application
// ---------------------------------------------------------------------------

/**
 * Apply damage following strict D&D 5e rules:
 * 1. Apply resistance/vulnerability/immunity if damage type is specified
 * 2. Subtract from temp HP first
 * 3. Remaining damage subtracts from current HP (floor at 0)
 * 4. Check for massive damage instant death
 */
export function applyDamage(
  current: number,
  temp: number,
  max: number,
  amount: number,
  damageType?: DamageType,
  resistances?: DamageType[],
  vulnerabilities?: DamageType[],
  immunities?: DamageType[],
): ApplyDamageResult {
  if (amount <= 0) {
    return {
      newCurrent: current,
      newTemp: temp,
      overflow: 0,
      instantDeath: false,
      effectiveDamage: 0,
      damageRelation: null,
    }
  }

  let effectiveDamage = amount
  let damageRelation: DamageRelation | null = null

  // Apply resistance/vulnerability/immunity if damage type is specified
  if (damageType) {
    if (immunities?.includes(damageType)) {
      damageRelation = 'immunity'
      effectiveDamage = 0
    } else if (resistances?.includes(damageType)) {
      damageRelation = 'resistance'
      effectiveDamage = Math.floor(amount / 2)
    } else if (vulnerabilities?.includes(damageType)) {
      damageRelation = 'vulnerability'
      effectiveDamage = amount * 2
    }
  }

  if (effectiveDamage === 0) {
    return {
      newCurrent: current,
      newTemp: temp,
      overflow: 0,
      instantDeath: false,
      effectiveDamage: 0,
      damageRelation,
    }
  }

  let remainingDamage = effectiveDamage
  let newTemp = temp
  let newCurrent = current

  // Subtract from temp HP first
  if (newTemp > 0) {
    if (remainingDamage >= newTemp) {
      remainingDamage -= newTemp
      newTemp = 0
    } else {
      newTemp -= remainingDamage
      remainingDamage = 0
    }
  }

  // Subtract from current HP
  if (remainingDamage > 0) {
    newCurrent = Math.max(0, newCurrent - remainingDamage)
  }

  // Calculate overflow (damage past 0 HP)
  const damageToCurrentHp = effectiveDamage - (temp - newTemp)
  const overflow = damageToCurrentHp > current ? damageToCurrentHp - current : 0

  // Check massive damage instant death
  const instantDeath = newCurrent === 0 && overflow >= max

  return {
    newCurrent,
    newTemp,
    overflow,
    instantDeath,
    effectiveDamage,
    damageRelation,
  }
}

// ---------------------------------------------------------------------------
// Healing
// ---------------------------------------------------------------------------

/**
 * Apply healing: adds to current HP, capped at max HP.
 * If healing from 0 HP, the character is stabilized.
 */
export function applyHealing(
  current: number,
  max: number,
  amount: number,
): ApplyHealingResult {
  if (amount <= 0) {
    return {
      newCurrent: current,
      actualHealing: 0,
      stabilized: false,
    }
  }

  const wasAtZero = current === 0
  const newCurrent = Math.min(max, current + amount)
  const actualHealing = newCurrent - current

  return {
    newCurrent,
    actualHealing,
    stabilized: wasAtZero && newCurrent > 0,
  }
}

// ---------------------------------------------------------------------------
// Temporary HP
// ---------------------------------------------------------------------------

/**
 * Set temporary HP following D&D 5e non-stacking rule:
 * Temp HP don't stack -- keep the higher value.
 */
export function setTempHP(currentTemp: number, newTemp: number): number {
  if (newTemp <= 0) return currentTemp
  return Math.max(currentTemp, newTemp)
}

// ---------------------------------------------------------------------------
// Massive Damage
// ---------------------------------------------------------------------------

/**
 * Check if a damage amount triggers the massive damage instant death rule.
 * Instant death occurs when remaining damage after reaching 0 HP >= max HP.
 */
export function checkMassiveDamage(damage: number, maxHP: number): boolean {
  return damage >= maxHP
}

// ---------------------------------------------------------------------------
// Death Save Processing
// ---------------------------------------------------------------------------

/**
 * Process damage taken while at 0 HP (adds death save failures).
 * A critical hit adds 2 failures instead of 1.
 */
export function processDeathSaveDamage(
  deathSaves: DeathSaves,
  isCritical: boolean,
): DeathSaves {
  const failuresToAdd = isCritical ? 2 : 1
  const newFailures = Math.min(3, deathSaves.failures + failuresToAdd) as 0 | 1 | 2 | 3

  return {
    successes: deathSaves.successes,
    failures: newFailures,
    stable: false,
  }
}

// ---------------------------------------------------------------------------
// Death Save Roll Processing
// ---------------------------------------------------------------------------

/**
 * Process a death saving throw roll result.
 * - Nat 20: regain 1 HP, reset saves
 * - Nat 1: 2 failures
 * - >= 10: 1 success
 * - < 10: 1 failure
 *
 * Returns updated death saves and whether the character regains HP.
 */
export function processDeathSaveRoll(
  deathSaves: DeathSaves,
  roll: number,
): { deathSaves: DeathSaves; regainHP: boolean } {
  if (roll === 20) {
    return {
      deathSaves: { successes: 0, failures: 0, stable: false },
      regainHP: true,
    }
  }

  let newSuccesses = deathSaves.successes
  let newFailures = deathSaves.failures

  if (roll === 1) {
    newFailures = Math.min(3, deathSaves.failures + 2) as 0 | 1 | 2 | 3
  } else if (roll >= 10) {
    newSuccesses = Math.min(3, deathSaves.successes + 1) as 0 | 1 | 2 | 3
  } else {
    newFailures = Math.min(3, deathSaves.failures + 1) as 0 | 1 | 2 | 3
  }

  return {
    deathSaves: {
      successes: newSuccesses,
      failures: newFailures,
      stable: newSuccesses >= 3,
    },
    regainHP: false,
  }
}

// ---------------------------------------------------------------------------
// HP Event Helpers
// ---------------------------------------------------------------------------

let eventIdCounter = 0

/**
 * Create an HP event log entry for damage.
 */
export function createDamageEvent(
  amount: number,
  effectiveAmount: number,
  damageType?: DamageType,
  damageRelation?: DamageRelation | null,
): HPEvent {
  return {
    id: `hp-event-${++eventIdCounter}`,
    type: 'damage',
    amount,
    effectiveAmount,
    damageType,
    damageRelation,
    timestamp: Date.now(),
  }
}

/**
 * Create an HP event log entry for healing.
 */
export function createHealingEvent(
  amount: number,
  effectiveAmount: number,
  source?: string,
): HPEvent {
  return {
    id: `hp-event-${++eventIdCounter}`,
    type: 'healing',
    amount,
    effectiveAmount,
    source,
    timestamp: Date.now(),
  }
}

/**
 * Format an HP event for display in the mini-history.
 */
export function formatHPEvent(event: HPEvent): string {
  if (event.type === 'damage') {
    const typeLabel = event.damageType ?? ''
    const relationLabel =
      event.damageRelation === 'resistance'
        ? ` (resisted from ${event.amount})`
        : event.damageRelation === 'vulnerability'
          ? ` (vulnerable from ${event.amount})`
          : event.damageRelation === 'immunity'
            ? ' (immune)'
            : ''
    return `-${event.effectiveAmount}${typeLabel ? ` ${typeLabel}` : ''}${relationLabel}`
  }

  const sourceLabel = event.source ? ` (${event.source})` : ''
  return `+${event.effectiveAmount} healing${sourceLabel}`
}
