/**
 * useCharacterCalculations Hook (Story 20.4)
 *
 * Wraps the Phase 1 calculation engine with React reactivity.
 * Takes mutable character data as input and outputs all computed
 * derived values (AC, HP, initiative, skill modifiers, saves,
 * spell save DC, spell attack, passive scores, attack bonuses,
 * carrying capacity, proficiency bonus).
 *
 * Recalculates on character data change with 300ms debounce.
 * Uses useMemo for expensive computations.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Character } from '@/types/character'
import type { AbilityName, AbilityScores, SkillName } from '@/types/core'
import { ABILITY_NAMES } from '@/types/core'
import { getModifier, getEffectiveAbilityScores } from '@/utils/calculations/ability'
import {
  getProficiencyBonus,
  getCharacterAllSkillModifiers,
  getAllSavingThrows,
  getCharacterPassiveScore,
} from '@/utils/calculations/skills'
import {
  getArmorClass,
  getInitiativeModifier,
  getMaxHitPoints,
  getAttackBonus,
} from '@/utils/calculations/combat'
import {
  getSpellSaveDC,
  getSpellAttackBonus,
  getSpellSlots,
  getCantripsKnown,
  getSpellsKnownOrPrepared,
} from '@/utils/calculations/spellcasting'
import { getTotalInventoryWeight } from '@/utils/calculations/currency'
import { getClassById } from '@/data/classes'
import { CARRY_CAPACITY_MULTIPLIER } from '@/data/reference'

// ---------------------------------------------------------------------------
// Derived stats type
// ---------------------------------------------------------------------------

export interface DerivedStats {
  /** Effective ability scores with all bonuses applied */
  effectiveAbilityScores: AbilityScores
  /** Ability modifiers for each ability */
  abilityModifiers: Record<AbilityName, number>
  /** Proficiency bonus based on total level */
  proficiencyBonus: number
  /** Armor class */
  armorClass: number
  /** Initiative modifier */
  initiative: number
  /** Maximum hit points */
  hpMax: number
  /** All 18 skill modifiers */
  skillModifiers: Record<SkillName, number>
  /** All 6 saving throw modifiers */
  savingThrows: Record<AbilityName, number>
  /** Passive Perception */
  passivePerception: number
  /** Passive Investigation */
  passiveInvestigation: number
  /** Passive Insight */
  passiveInsight: number
  /** Spell save DC (null for non-casters) */
  spellSaveDC: number | null
  /** Spell attack bonus (null for non-casters) */
  spellAttackBonus: number | null
  /** Spell slots by level */
  spellSlots: Record<number, number>
  /** Number of cantrips known */
  cantripsKnown: number
  /** Number of spells known/prepared */
  spellsPrepared: number
  /** Melee attack bonus (STR-based) */
  meleeAttackBonus: number
  /** Ranged attack bonus (DEX-based) */
  rangedAttackBonus: number
  /** Total inventory weight in lbs */
  inventoryWeight: number
  /** Carrying capacity in lbs (STR x 15) */
  carryingCapacity: number
  /** Whether the character is encumbered */
  isEncumbered: boolean
}

// ---------------------------------------------------------------------------
// Empty / default derived stats
// ---------------------------------------------------------------------------

const EMPTY_ABILITY_SCORES: AbilityScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

function createEmptyModifiers(): Record<AbilityName, number> {
  const result = {} as Record<AbilityName, number>
  for (const ability of ABILITY_NAMES) {
    result[ability] = 0
  }
  return result
}

const EMPTY_SKILL_MODIFIERS = {} as Record<SkillName, number>

export const EMPTY_DERIVED_STATS: DerivedStats = {
  effectiveAbilityScores: EMPTY_ABILITY_SCORES,
  abilityModifiers: createEmptyModifiers(),
  proficiencyBonus: 2,
  armorClass: 10,
  initiative: 0,
  hpMax: 1,
  skillModifiers: EMPTY_SKILL_MODIFIERS,
  savingThrows: createEmptyModifiers(),
  passivePerception: 10,
  passiveInvestigation: 10,
  passiveInsight: 10,
  spellSaveDC: null,
  spellAttackBonus: null,
  spellSlots: {},
  cantripsKnown: 0,
  spellsPrepared: 0,
  meleeAttackBonus: 2,
  rangedAttackBonus: 2,
  inventoryWeight: 0,
  carryingCapacity: 150,
  isEncumbered: false,
}

// ---------------------------------------------------------------------------
// Calculation function (pure, extracted for testing)
// ---------------------------------------------------------------------------

/**
 * Compute all derived stats from a character. Pure function,
 * usable both inside and outside of React.
 */
export function computeDerivedStats(character: Character): DerivedStats {
  // 1. Effective ability scores
  const effectiveAbilityScores = getEffectiveAbilityScores(character)

  // 2. Ability modifiers
  const abilityModifiers = {} as Record<AbilityName, number>
  for (const ability of ABILITY_NAMES) {
    abilityModifiers[ability] = getModifier(effectiveAbilityScores[ability])
  }

  // 3. Proficiency bonus
  const level = character.level || 1
  const proficiencyBonus = getProficiencyBonus(Math.max(1, Math.min(20, level)))

  // 4. Build a "computed character" with effective ability scores for skill calculations
  const computedCharacter: Character = {
    ...character,
    abilityScores: effectiveAbilityScores,
  }

  // 5. Skill modifiers
  const skillModifiers = getCharacterAllSkillModifiers(computedCharacter)

  // 6. Saving throws
  const savingThrows = getAllSavingThrows(computedCharacter)

  // 7. AC
  const dexMod = abilityModifiers.dexterity
  const armorClass = character.armorClassOverride ?? getArmorClass({
    dexModifier: dexMod,
    conModifier: abilityModifiers.constitution,
    wisModifier: abilityModifiers.wisdom,
  })

  // 8. Initiative
  const initiativeBonusOverride = character.initiativeBonus ?? 0
  const initiative = getInitiativeModifier(dexMod, initiativeBonusOverride)

  // 9. HP max
  const primaryClass = character.classes?.[0]
  const hitDie = primaryClass?.hitDie ?? 8
  const hpMax = getMaxHitPoints({
    hitDie,
    level,
    conModifier: abilityModifiers.constitution,
  })

  // 10. Passive scores
  const passivePerception = getCharacterPassiveScore(computedCharacter, 'perception')
  const passiveInvestigation = getCharacterPassiveScore(computedCharacter, 'investigation')
  const passiveInsight = getCharacterPassiveScore(computedCharacter, 'insight')

  // 11. Spellcasting (find primary caster class)
  let spellSaveDC: number | null = null
  let spellAttackBonusVal: number | null = null
  let spellSlots: Record<number, number> = {}
  let cantripsKnown = 0
  let spellsPrepared = 0

  if (character.classes) {
    for (const classSel of character.classes) {
      const classData = getClassById(classSel.classId)
      if (classData?.spellcasting) {
        const spellAbility = classData.spellcasting.ability
        const spellMod = abilityModifiers[spellAbility]

        spellSaveDC = getSpellSaveDC(spellMod, proficiencyBonus)
        spellAttackBonusVal = getSpellAttackBonus(spellMod, proficiencyBonus)

        // Determine caster type from the class spellcasting type
        const casterTypeMap: Record<string, 'full' | 'half' | 'third' | 'pact'> = {
          full: 'full',
          half: 'half',
          third: 'third',
          pact: 'pact',
        }
        const casterType = casterTypeMap[classData.spellcasting.type] ?? 'full'
        spellSlots = getSpellSlots(casterType, classSel.level)
        cantripsKnown = getCantripsKnown(classSel.classId, classSel.level)

        const isPreparedCaster = classData.spellcasting.spellsKnownOrPrepared === 'prepared'
        spellsPrepared = getSpellsKnownOrPrepared({
          classId: classSel.classId,
          level: classSel.level,
          abilityModifier: spellMod,
          preparedCaster: isPreparedCaster,
        })

        // Use the first caster class found
        break
      }
    }
  }

  // 12. Attack bonuses
  const meleeAttackBonus = getAttackBonus(
    abilityModifiers.strength,
    proficiencyBonus
  )
  const rangedAttackBonus = getAttackBonus(
    abilityModifiers.dexterity,
    proficiencyBonus
  )

  // 13. Inventory and carrying capacity
  const inventoryWeight = getTotalInventoryWeight(character.inventory ?? [])
  const carryingCapacity = effectiveAbilityScores.strength * CARRY_CAPACITY_MULTIPLIER
  const isEncumbered = inventoryWeight > carryingCapacity

  return {
    effectiveAbilityScores,
    abilityModifiers,
    proficiencyBonus,
    armorClass,
    initiative,
    hpMax,
    skillModifiers,
    savingThrows,
    passivePerception,
    passiveInvestigation,
    passiveInsight,
    spellSaveDC,
    spellAttackBonus: spellAttackBonusVal,
    spellSlots,
    cantripsKnown,
    spellsPrepared,
    meleeAttackBonus,
    rangedAttackBonus,
    inventoryWeight,
    carryingCapacity,
    isEncumbered,
  }
}

// ---------------------------------------------------------------------------
// Dependency map for partial recalculation categorization
// ---------------------------------------------------------------------------

export type ChangeCategory = 'ability' | 'level' | 'equipment' | 'spell' | 'full'

/**
 * Determine which category of change occurred by comparing old and new
 * character data. Used for dependency mapping.
 */
export function detectChangeCategory(
  prev: Partial<Character>,
  next: Partial<Character>
): ChangeCategory {
  // Check ability score changes
  if (prev.baseAbilityScores && next.baseAbilityScores) {
    for (const ability of ABILITY_NAMES) {
      if (
        prev.baseAbilityScores[ability] !== next.baseAbilityScores[ability]
      ) {
        return 'ability'
      }
    }
  }

  // Check level changes
  if (prev.level !== next.level) return 'level'

  // Check equipment changes
  if (JSON.stringify(prev.inventory) !== JSON.stringify(next.inventory)) {
    return 'equipment'
  }

  // Check spell changes
  if (JSON.stringify(prev.spellcasting) !== JSON.stringify(next.spellcasting)) {
    return 'spell'
  }

  return 'full'
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseCharacterCalculationsOptions {
  /** Debounce interval in milliseconds (default: 300) */
  debounceMs?: number
  /** Whether calculations are enabled (default: true) */
  enabled?: boolean
}

export function useCharacterCalculations(
  character: Character | null,
  options: UseCharacterCalculationsOptions = {}
): DerivedStats {
  const { debounceMs = 300, enabled = true } = options

  const [debouncedCharacter, setDebouncedCharacter] = useState<Character | null>(
    character
  )
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce character changes
  useEffect(() => {
    if (!enabled || !character) {
      setDebouncedCharacter(character)
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setDebouncedCharacter(character)
    }, debounceMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [character, debounceMs, enabled])

  // Compute derived stats from the debounced character
  const derivedStats = useMemo(() => {
    if (!debouncedCharacter) return EMPTY_DERIVED_STATS

    try {
      return computeDerivedStats(debouncedCharacter)
    } catch {
      // If calculation engine throws, return empty stats
      return EMPTY_DERIVED_STATS
    }
  }, [debouncedCharacter])

  return derivedStats
}
