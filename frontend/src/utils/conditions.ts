/**
 * Conditions Utility Functions (Epic 29 -- Conditions Tracker)
 *
 * Pure functions for managing condition state on a character:
 * adding, removing, querying, and computing exhaustion levels.
 */

import type { Condition } from '@/types/core'
import type { ConditionInstance } from '@/types/combat'
import { CONDITIONS_DATA } from '@/data/reference'
import { EXHAUSTION_LEVEL_EFFECTS } from '@/data/conditions'

// ---------------------------------------------------------------------------
// Condition Management
// ---------------------------------------------------------------------------

/**
 * Add a condition to the list. Conditions do not stack (except exhaustion).
 * If the condition is already present (and not exhaustion), returns the
 * original array unchanged.
 *
 * For exhaustion, if already present, increments the level by 1 (up to 6).
 */
export function addCondition(
  conditions: ConditionInstance[],
  newCondition: ConditionInstance,
): ConditionInstance[] {
  if (newCondition.condition === 'exhaustion') {
    const existing = conditions.find((c) => c.condition === 'exhaustion')
    if (existing) {
      const currentLevel = existing.exhaustionLevel ?? 1
      if (currentLevel >= 6) return conditions
      const nextLevel = (currentLevel + 1) as 1 | 2 | 3 | 4 | 5 | 6
      return conditions.map((c) =>
        c.condition === 'exhaustion'
          ? { ...c, exhaustionLevel: nextLevel }
          : c,
      )
    }
    // New exhaustion -- ensure it has a level
    return [
      ...conditions,
      { ...newCondition, exhaustionLevel: newCondition.exhaustionLevel ?? 1 },
    ]
  }

  // Non-exhaustion: no stacking
  if (hasCondition(conditions, newCondition.condition)) {
    return conditions
  }
  return [...conditions, newCondition]
}

/**
 * Remove a condition from the list.
 * For exhaustion, decrements the level by 1. If at level 1, removes entirely.
 */
export function removeCondition(
  conditions: ConditionInstance[],
  conditionType: Condition,
): ConditionInstance[] {
  if (conditionType === 'exhaustion') {
    const existing = conditions.find((c) => c.condition === 'exhaustion')
    if (!existing) return conditions
    const currentLevel = existing.exhaustionLevel ?? 1
    if (currentLevel <= 1) {
      return conditions.filter((c) => c.condition !== 'exhaustion')
    }
    const nextLevel = (currentLevel - 1) as 1 | 2 | 3 | 4 | 5 | 6
    return conditions.map((c) =>
      c.condition === 'exhaustion'
        ? { ...c, exhaustionLevel: nextLevel }
        : c,
    )
  }
  return conditions.filter((c) => c.condition !== conditionType)
}

/**
 * Check if a condition is currently active.
 */
export function hasCondition(
  conditions: ConditionInstance[],
  conditionType: Condition,
): boolean {
  return conditions.some((c) => c.condition === conditionType)
}

// ---------------------------------------------------------------------------
// Exhaustion
// ---------------------------------------------------------------------------

/**
 * Get the current exhaustion level (0 if no exhaustion).
 */
export function getExhaustionLevel(conditions: ConditionInstance[]): number {
  const exhaustion = conditions.find((c) => c.condition === 'exhaustion')
  if (!exhaustion) return 0
  return exhaustion.exhaustionLevel ?? 1
}

/**
 * Set the exhaustion level directly (0 removes exhaustion, 1-6 sets it).
 */
export function setExhaustionLevel(
  conditions: ConditionInstance[],
  level: number,
): ConditionInstance[] {
  if (level <= 0) {
    return conditions.filter((c) => c.condition !== 'exhaustion')
  }
  const clampedLevel = Math.min(6, Math.max(1, level)) as 1 | 2 | 3 | 4 | 5 | 6
  const existing = conditions.find((c) => c.condition === 'exhaustion')
  if (existing) {
    return conditions.map((c) =>
      c.condition === 'exhaustion'
        ? { ...c, exhaustionLevel: clampedLevel }
        : c,
    )
  }
  return [...conditions, { condition: 'exhaustion', exhaustionLevel: clampedLevel }]
}

/**
 * Increment exhaustion by 1 level (up to 6).
 */
export function incrementExhaustion(
  conditions: ConditionInstance[],
): ConditionInstance[] {
  const current = getExhaustionLevel(conditions)
  if (current >= 6) return conditions
  return setExhaustionLevel(conditions, current + 1)
}

/**
 * Decrement exhaustion by 1 level. Removes exhaustion if at level 1.
 */
export function decrementExhaustion(
  conditions: ConditionInstance[],
): ConditionInstance[] {
  const current = getExhaustionLevel(conditions)
  if (current <= 0) return conditions
  return setExhaustionLevel(conditions, current - 1)
}

// ---------------------------------------------------------------------------
// Condition Effect Text
// ---------------------------------------------------------------------------

/**
 * Get the full description/effects of a condition from SRD data.
 */
export function getConditionEffects(condition: Condition): string {
  const data = CONDITIONS_DATA.find((c) => c.id === condition)
  if (!data) return ''
  return data.mechanicalEffects.join('. ')
}

/**
 * Get cumulative exhaustion effects up to a given level.
 * Returns an array of effect descriptions for levels 1 through the given level.
 */
export function getExhaustionEffects(level: number): string[] {
  if (level <= 0) return []
  const clampedLevel = Math.min(6, level)
  return EXHAUSTION_LEVEL_EFFECTS.slice(0, clampedLevel) as string[]
}

// ---------------------------------------------------------------------------
// Condition Modifiers (Story 29.3)
// ---------------------------------------------------------------------------

export type RollType =
  | 'attack_rolls'
  | 'ability_checks'
  | 'strength_saves'
  | 'dexterity_saves'
  | 'saving_throws'
  | 'sight_checks'
  | 'hearing_checks'

export interface BannerMessage {
  text: string
  severity: 'critical' | 'warning' | 'info'
  condition: Condition
}

export interface ConditionModifiers {
  disadvantageOn: RollType[]
  advantageOn: RollType[]
  autoFailOn: RollType[]
  speedOverride: number | null
  hpMaxModifier: number
  banners: BannerMessage[]
}

/**
 * Compute all active mechanical modifiers from a list of active conditions.
 * Returns a structured object the display layer can consume.
 */
export function getConditionModifiers(
  conditions: ConditionInstance[],
): ConditionModifiers {
  const result: ConditionModifiers = {
    disadvantageOn: [],
    advantageOn: [],
    autoFailOn: [],
    speedOverride: null,
    hpMaxModifier: 1,
    banners: [],
  }

  if (!conditions || conditions.length === 0) return result

  const disadSet = new Set<RollType>()
  const advSet = new Set<RollType>()
  const failSet = new Set<RollType>()

  for (const ci of conditions) {
    switch (ci.condition) {
      case 'blinded':
        disadSet.add('attack_rolls')
        failSet.add('sight_checks')
        break

      case 'charmed':
        // No direct mechanical modifiers for the player
        break

      case 'deafened':
        failSet.add('hearing_checks')
        break

      case 'frightened':
        disadSet.add('ability_checks')
        disadSet.add('attack_rolls')
        break

      case 'grappled':
        result.speedOverride = 0
        break

      case 'incapacitated':
        result.banners.push({
          text: 'Cannot take actions or reactions',
          severity: 'warning',
          condition: 'incapacitated',
        })
        break

      case 'invisible':
        advSet.add('attack_rolls')
        break

      case 'paralyzed':
        failSet.add('strength_saves')
        failSet.add('dexterity_saves')
        result.banners.push({
          text: 'PARALYZED -- Cannot move, speak, or take actions. Auto-fail STR/DEX saves.',
          severity: 'critical',
          condition: 'paralyzed',
        })
        break

      case 'petrified':
        failSet.add('strength_saves')
        failSet.add('dexterity_saves')
        result.banners.push({
          text: 'PETRIFIED -- Transformed to stone. Cannot move, speak, or perceive.',
          severity: 'critical',
          condition: 'petrified',
        })
        break

      case 'poisoned':
        disadSet.add('attack_rolls')
        disadSet.add('ability_checks')
        break

      case 'prone':
        disadSet.add('attack_rolls')
        break

      case 'restrained':
        result.speedOverride = 0
        disadSet.add('dexterity_saves')
        disadSet.add('attack_rolls')
        break

      case 'stunned':
        failSet.add('strength_saves')
        failSet.add('dexterity_saves')
        result.banners.push({
          text: 'STUNNED -- Cannot move or take actions. Auto-fail STR/DEX saves.',
          severity: 'critical',
          condition: 'stunned',
        })
        break

      case 'unconscious':
        failSet.add('strength_saves')
        failSet.add('dexterity_saves')
        result.banners.push({
          text: 'UNCONSCIOUS -- Cannot move, speak, or perceive. Auto-fail STR/DEX saves.',
          severity: 'critical',
          condition: 'unconscious',
        })
        break

      case 'exhaustion': {
        const level = ci.exhaustionLevel ?? 1
        // Level 1: disadvantage on ability checks
        if (level >= 1) {
          disadSet.add('ability_checks')
        }
        // Level 2: speed halved (-1 as sentinel; display layer interprets)
        if (level >= 2 && level < 5) {
          if (result.speedOverride === null) {
            result.speedOverride = -1 // sentinel for "halved"
          }
        }
        // Level 3: disadvantage on attacks and saves
        if (level >= 3) {
          disadSet.add('attack_rolls')
          disadSet.add('saving_throws')
        }
        // Level 4: HP max halved
        if (level >= 4) {
          result.hpMaxModifier = 0.5
        }
        // Level 5: speed reduced to 0
        if (level >= 5) {
          result.speedOverride = 0
        }
        // Level 6: death
        if (level >= 6) {
          result.banners.push({
            text: 'EXHAUSTION LEVEL 6 -- Your character dies from exhaustion!',
            severity: 'critical',
            condition: 'exhaustion',
          })
        }
        break
      }
    }
  }

  result.disadvantageOn = Array.from(disadSet)
  result.advantageOn = Array.from(advSet)
  result.autoFailOn = Array.from(failSet)

  return result
}
