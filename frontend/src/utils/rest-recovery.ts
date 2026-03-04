/**
 * Rest Recovery Utilities (Epic 30 -- Short Rest & Long Rest Automation)
 *
 * Pure functions for computing class feature usage tracking, rest result
 * summaries for UI display, and feature recovery mappings for D&D 5e.
 * These functions build on top of the existing rest.ts calculation layer
 * to provide display-oriented data structures.
 */

import type { Character } from '@/types/character'
import type { AbilityScores } from '@/types/core'
import { getClassById } from '@/data/classes'
import { getAbilityModifier } from '@/data/reference'
import { getExhaustionLevel } from '@/utils/conditions'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FeatureUsage {
  featureId: string
  name: string
  maxUses: number | null // null = unlimited
  usesRemaining: number
  recoversOn: 'short_rest' | 'long_rest' | 'special' | null
}

export interface RestResult {
  hpBefore: number
  hpAfter: number
  hitDiceSpent: number
  hitDiceRecovered: number
  slotsRecovered: boolean
  featuresRecovered: FeatureUsage[]
  exhaustionBefore: number
  exhaustionAfter: number
  deathSavesReset: boolean
  conditionsCleared: string[]
}

// ---------------------------------------------------------------------------
// Feature Recovery Mapping
// ---------------------------------------------------------------------------

/**
 * Feature recovery configuration by feature ID.
 * Maps feature IDs to their recovery type, max uses calculation, and any
 * special rules (like Bardic Inspiration switching at Bard 5).
 */
interface FeatureRecoveryConfig {
  recoveryType: 'short_rest' | 'long_rest' | 'special'
  getMaxUses: (classLevel: number, abilityScores: AbilityScores) => number | null
}

const FEATURE_RECOVERY_MAP: Record<string, FeatureRecoveryConfig> = {
  // Short Rest features
  'second-wind': {
    recoveryType: 'short_rest',
    getMaxUses: () => 1,
  },
  'action-surge': {
    recoveryType: 'short_rest',
    getMaxUses: (level) => (level >= 17 ? 2 : 1),
  },
  'channel-divinity': {
    recoveryType: 'short_rest',
    getMaxUses: (level) => {
      if (level >= 18) return 3
      if (level >= 6) return 2
      return 1
    },
  },
  'wild-shape': {
    recoveryType: 'short_rest',
    getMaxUses: () => 2,
  },
  'ki': {
    recoveryType: 'short_rest',
    getMaxUses: (level) => level,
  },

  // Long Rest features
  'rage': {
    recoveryType: 'long_rest',
    getMaxUses: (level) => {
      if (level >= 20) return null // unlimited at 20
      if (level >= 17) return 6
      if (level >= 12) return 5
      if (level >= 6) return 4
      if (level >= 3) return 3
      return 2
    },
  },
  'lay-on-hands': {
    recoveryType: 'long_rest',
    getMaxUses: (level) => level * 5,
  },
  'font-of-magic': {
    recoveryType: 'long_rest',
    getMaxUses: (level) => level,
  },
  'divine-sense': {
    recoveryType: 'long_rest',
    getMaxUses: (_level, abilityScores) =>
      1 + Math.max(0, getAbilityModifier(abilityScores.charisma)),
  },
  'arcane-recovery': {
    recoveryType: 'long_rest',
    getMaxUses: () => 1,
  },

  // Bardic Inspiration: recovery type switches at Bard 5
  'bardic-inspiration': {
    recoveryType: 'long_rest', // default; overridden by getFeatureRecoveryType
    getMaxUses: (_level, abilityScores) =>
      Math.max(1, getAbilityModifier(abilityScores.charisma)),
  },
}

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Build a list of feature usages with tracking data from a character's class data.
 * Extracts all limited-use features from the character's classes and computes
 * their max uses, current uses, and recovery type.
 */
export function getCharacterFeatureUsages(character: Character): FeatureUsage[] {
  const usages: FeatureUsage[] = []

  for (let classIdx = 0; classIdx < character.classes.length; classIdx++) {
    const classSel = character.classes[classIdx]
    const classData = getClassById(classSel.classId)
    if (!classData) continue

    for (const [levelStr, features] of Object.entries(classData.features)) {
      const featureLevel = parseInt(levelStr, 10)
      if (featureLevel > classSel.level) continue

      for (const feature of features) {
        // Only track features that have a recharge type (limited use)
        if (!feature.recharge || feature.recharge === 'none') continue

        const config = FEATURE_RECOVERY_MAP[feature.id]
        const maxUses = config
          ? config.getMaxUses(classSel.level, character.abilityScores)
          : feature.usesPerRecharge ?? null

        const recoveryType = getFeatureRecoveryType(
          feature.id,
          classSel.classId,
          classSel.level,
        )

        const usesRemaining = feature.currentUses ?? maxUses ?? 0

        usages.push({
          featureId: feature.id,
          name: feature.name,
          maxUses,
          usesRemaining: typeof usesRemaining === 'number' ? usesRemaining : 0,
          recoversOn: recoveryType,
        })
      }
    }
  }

  return usages
}

/**
 * Get the maximum uses for a feature at a given level.
 * Handles scaling features like Rage (scales with Barbarian level),
 * Ki Points (= Monk level), and ability-score-dependent features.
 */
export function getFeatureMaxUses(
  featureId: string,
  _classId: string,
  classLevel: number,
  abilityScores: AbilityScores,
): number | null {
  const config = FEATURE_RECOVERY_MAP[featureId]
  if (!config) return null
  return config.getMaxUses(classLevel, abilityScores)
}

/**
 * Get the recovery type for a feature.
 * Handles special cases like Bardic Inspiration which switches from
 * long rest to short rest recovery at Bard level 5.
 */
export function getFeatureRecoveryType(
  featureId: string,
  classId: string,
  classLevel: number,
): 'short_rest' | 'long_rest' | 'special' | null {
  // Special case: Bardic Inspiration switches to short rest at Bard 5
  if (featureId === 'bardic-inspiration' && classId === 'bard') {
    return classLevel >= 5 ? 'short_rest' : 'long_rest'
  }

  const config = FEATURE_RECOVERY_MAP[featureId]
  if (!config) return null
  return config.recoveryType
}

/**
 * Compute short rest results for UI display.
 * Takes the character state and hit dice spending choices and returns
 * a complete rest result summary suitable for display.
 *
 * @param character - The current character state
 * @param hitDiceSpent - Array of { classIndex, rolled } indicating which
 *   dice were spent and what value was rolled (including CON mod)
 */
export function applyShortRestUI(
  character: Character,
  hitDiceSpent: { classIndex: number; rolled: number }[],
): RestResult {
  const hpBefore = character.hpCurrent

  // Calculate total HP recovered from hit dice spending
  let totalHpRecovered = 0
  for (const die of hitDiceSpent) {
    totalHpRecovered += die.rolled
  }

  const hpAfter = Math.min(character.hpMax, hpBefore + totalHpRecovered)

  // Determine which features recover on short rest
  const allFeatures = getCharacterFeatureUsages(character)
  const featuresRecovered = allFeatures.filter(
    (f) => f.recoversOn === 'short_rest',
  )

  // Restore feature uses for recovered features
  const restoredFeatures = featuresRecovered.map((f) => ({
    ...f,
    usesRemaining: f.maxUses ?? 0,
  }))

  const exhaustionLevel = getExhaustionLevel(character.conditions)

  return {
    hpBefore,
    hpAfter,
    hitDiceSpent: hitDiceSpent.length,
    hitDiceRecovered: 0, // Short rest does not recover hit dice
    slotsRecovered: hasWarlockPactMagic(character),
    featuresRecovered: restoredFeatures,
    exhaustionBefore: exhaustionLevel,
    exhaustionAfter: exhaustionLevel, // Short rest does not affect exhaustion
    deathSavesReset: false,
    conditionsCleared: [],
  }
}

/**
 * Compute long rest results for UI display.
 * Takes the character state and conditions to clear and returns
 * a complete rest result summary.
 *
 * @param character - The current character state
 * @param conditionsToClear - Array of condition names to clear during the rest
 */
export function applyLongRestUI(
  character: Character,
  conditionsToClear: string[],
): RestResult {
  const hpBefore = character.hpCurrent
  const hpAfter = character.hpMax

  // Hit dice recovery: recover up to half total (min 1)
  const totalHitDice = character.hitDiceTotal.reduce((sum, d) => sum + d, 0)
  const totalUsed = character.hitDiceUsed.reduce((sum, d) => sum + d, 0)
  const maxRecoverable = Math.max(1, Math.floor(totalHitDice / 2))
  const hitDiceRecovered = Math.min(maxRecoverable, totalUsed)

  // All features recover on long rest (both short and long rest features)
  const allFeatures = getCharacterFeatureUsages(character)
  const featuresRecovered = allFeatures.filter(
    (f) => f.recoversOn === 'short_rest' || f.recoversOn === 'long_rest',
  )

  const restoredFeatures = featuresRecovered.map((f) => ({
    ...f,
    usesRemaining: f.maxUses ?? 0,
  }))

  const exhaustionBefore = getExhaustionLevel(character.conditions)
  const exhaustionAfter = Math.max(0, exhaustionBefore - 1)

  return {
    hpBefore,
    hpAfter,
    hitDiceSpent: 0,
    hitDiceRecovered,
    slotsRecovered: character.spellcasting !== null,
    featuresRecovered: restoredFeatures,
    exhaustionBefore,
    exhaustionAfter,
    deathSavesReset: true,
    conditionsCleared: conditionsToClear,
  }
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

/**
 * Check if the character has Warlock pact magic (for short rest slot recovery).
 */
function hasWarlockPactMagic(character: Character): boolean {
  return (
    character.spellcasting !== null &&
    character.spellcasting.pactMagic !== undefined
  )
}
