// =============================================================================
// Story 29.3 -- Condition Modifiers
// Aggregates active condition effects into a unified modifier structure
// that the character sheet display can use to show condition impacts.
// =============================================================================

import type { Condition } from '@/types/core'
import type { ConditionInstance } from '@/types/combat'
import { EXHAUSTION_EFFECTS } from '@/types/combat'

// ---------------------------------------------------------------------------
// Condition Modifiers Interface
// ---------------------------------------------------------------------------

export interface ConditionModifiers {
  disadvantageOnAttacks: boolean
  disadvantageOnAbilityChecks: boolean
  disadvantageOnSavingThrows: boolean
  advantageOnAttacks: boolean
  attacksAgainstHaveAdvantage: boolean
  attacksAgainstHaveDisadvantage: boolean
  autoFailStrDexSaves: boolean
  speedZero: boolean
  speedHalved: boolean
  incapacitated: boolean
  cantSpeak: boolean
  hpMaxHalved: boolean
  isDead: boolean
}

// ---------------------------------------------------------------------------
// Default (no modifiers)
// ---------------------------------------------------------------------------

export const EMPTY_CONDITION_MODIFIERS: ConditionModifiers = {
  disadvantageOnAttacks: false,
  disadvantageOnAbilityChecks: false,
  disadvantageOnSavingThrows: false,
  advantageOnAttacks: false,
  attacksAgainstHaveAdvantage: false,
  attacksAgainstHaveDisadvantage: false,
  autoFailStrDexSaves: false,
  speedZero: false,
  speedHalved: false,
  incapacitated: false,
  cantSpeak: false,
  hpMaxHalved: false,
  isDead: false,
}

// ---------------------------------------------------------------------------
// Per-condition modifier definitions
// ---------------------------------------------------------------------------

const CONDITION_MODIFIER_MAP: Record<Condition, Partial<ConditionModifiers>> = {
  blinded: {
    disadvantageOnAttacks: true,
    attacksAgainstHaveAdvantage: true,
  },
  charmed: {
    // Charmed has social effects, not mechanical modifiers on sheet
  },
  deafened: {
    // Deafened only affects hearing-based checks, not general modifiers
  },
  frightened: {
    disadvantageOnAbilityChecks: true,
    disadvantageOnAttacks: true,
  },
  grappled: {
    speedZero: true,
  },
  incapacitated: {
    incapacitated: true,
  },
  invisible: {
    advantageOnAttacks: true,
    attacksAgainstHaveDisadvantage: true,
  },
  paralyzed: {
    incapacitated: true,
    cantSpeak: true,
    autoFailStrDexSaves: true,
    attacksAgainstHaveAdvantage: true,
    speedZero: true,
  },
  petrified: {
    incapacitated: true,
    cantSpeak: true,
    autoFailStrDexSaves: true,
    attacksAgainstHaveAdvantage: true,
    speedZero: true,
  },
  poisoned: {
    disadvantageOnAttacks: true,
    disadvantageOnAbilityChecks: true,
  },
  prone: {
    disadvantageOnAttacks: true,
  },
  restrained: {
    disadvantageOnAttacks: true,
    attacksAgainstHaveAdvantage: true,
    speedZero: true,
  },
  stunned: {
    incapacitated: true,
    autoFailStrDexSaves: true,
    attacksAgainstHaveAdvantage: true,
    speedZero: true,
  },
  unconscious: {
    incapacitated: true,
    cantSpeak: true,
    autoFailStrDexSaves: true,
    attacksAgainstHaveAdvantage: true,
    speedZero: true,
  },
  exhaustion: {
    // Exhaustion is handled separately based on level
  },
}

// ---------------------------------------------------------------------------
// Get Condition Modifiers (aggregate)
// ---------------------------------------------------------------------------

/**
 * Aggregate all active condition effects into a single ConditionModifiers
 * object. Exhaustion effects are applied based on the current level.
 */
export function getConditionModifiers(
  conditions: ConditionInstance[],
): ConditionModifiers {
  const modifiers: ConditionModifiers = { ...EMPTY_CONDITION_MODIFIERS }

  for (const instance of conditions) {
    if (instance.condition === 'exhaustion') {
      // Apply exhaustion effects based on level
      const level = instance.exhaustionLevel ?? 1

      if (level >= 1) {
        modifiers.disadvantageOnAbilityChecks = true
      }
      if (level >= 2) {
        modifiers.speedHalved = true
      }
      if (level >= 3) {
        modifiers.disadvantageOnAttacks = true
        modifiers.disadvantageOnSavingThrows = true
      }
      if (level >= 4) {
        modifiers.hpMaxHalved = true
      }
      if (level >= 5) {
        modifiers.speedZero = true
      }
      if (level >= 6) {
        modifiers.isDead = true
      }
    } else {
      // Apply standard condition modifiers
      const conditionModifiers = CONDITION_MODIFIER_MAP[instance.condition]
      for (const [key, value] of Object.entries(conditionModifiers)) {
        if (value === true) {
          modifiers[key as keyof ConditionModifiers] = true
        }
      }
    }
  }

  return modifiers
}

// ---------------------------------------------------------------------------
// Get Effect Descriptions for a Single Condition
// ---------------------------------------------------------------------------

/**
 * Get a list of human-readable effect descriptions for a single condition.
 * For exhaustion, returns cumulative effects up to the given level.
 */
export function getConditionEffectsDescription(
  condition: Condition,
  exhaustionLevel?: number,
): string[] {
  if (condition === 'exhaustion') {
    const level = exhaustionLevel ?? 1
    const effects: string[] = []
    const clampedLevel = Math.max(0, Math.min(6, level))

    for (let i = 0; i < clampedLevel; i++) {
      effects.push(`Level ${i + 1}: ${EXHAUSTION_EFFECTS[i]}`)
    }

    return effects
  }

  const modifiers = CONDITION_MODIFIER_MAP[condition]
  const descriptions: string[] = []

  if (modifiers.disadvantageOnAttacks) {
    descriptions.push('Disadvantage on attack rolls')
  }
  if (modifiers.disadvantageOnAbilityChecks) {
    descriptions.push('Disadvantage on ability checks')
  }
  if (modifiers.disadvantageOnSavingThrows) {
    descriptions.push('Disadvantage on saving throws')
  }
  if (modifiers.advantageOnAttacks) {
    descriptions.push('Advantage on attack rolls')
  }
  if (modifiers.attacksAgainstHaveAdvantage) {
    descriptions.push('Attacks against you have advantage')
  }
  if (modifiers.attacksAgainstHaveDisadvantage) {
    descriptions.push('Attacks against you have disadvantage')
  }
  if (modifiers.autoFailStrDexSaves) {
    descriptions.push('Automatically fail Strength and Dexterity saving throws')
  }
  if (modifiers.speedZero) {
    descriptions.push('Speed reduced to 0')
  }
  if (modifiers.incapacitated) {
    descriptions.push('Incapacitated (can\'t take actions or reactions)')
  }
  if (modifiers.cantSpeak) {
    descriptions.push('Can\'t speak')
  }

  return descriptions
}
