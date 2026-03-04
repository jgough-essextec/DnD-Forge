// =============================================================================
// Story 14.1-14.5 -- SpellStep
// Main spellcasting step for the character creation wizard.
// Conditionally shown for spellcasting classes at level 1.
// Orchestrates cantrip selection, spell selection, and validation.
// =============================================================================

import { useMemo, useCallback, useEffect, useState } from 'react'
import type { WizardStepProps, StepValidation } from '@/components/wizard/types'
import { useWizardStore } from '@/stores/wizardStore'
import { CLASSES } from '@/data/classes'
import { SPELLS } from '@/data/spells'
import { getCantripsKnown, getSpellsKnownOrPrepared, getSpellSlots, getPactMagicSlots } from '@/utils/calculations/spellcasting'
import type { AbilityName } from '@/types/core'
import { CantripSelector } from './CantripSelector'
import { SpellSelector, type CastingSystem } from './SpellSelector'

// -- Helpers ------------------------------------------------------------------

/**
 * Determine the casting system for a class.
 */
function getCastingSystem(classId: string): CastingSystem | null {
  const cls = CLASSES.find((c) => c.id === classId)
  if (!cls?.spellcasting) return null

  const { type, spellsKnownOrPrepared } = cls.spellcasting

  // Warlock uses pact magic, which is a "known" system
  if (type === 'pact') return 'known'

  // Wizard is a special prepared caster with a spellbook
  if (classId === 'wizard') return 'spellbook'

  // Known vs prepared
  if (spellsKnownOrPrepared === 'known') return 'known'
  if (spellsKnownOrPrepared === 'prepared') return 'prepared'

  return null
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

// -- Validation ---------------------------------------------------------------

export interface SpellStepState {
  selectedCantripIds: string[]
  selectedSpellIds: string[]
  preparedSpellIds: string[]
}

export function validateSpellStep(
  state: SpellStepState,
  classId: string,
  abilityModifier: number,
): StepValidation {
  const errors: string[] = []
  const cls = CLASSES.find((c) => c.id === classId)
  if (!cls?.spellcasting) return { valid: true, errors: [] }

  const castingSystem = getCastingSystem(classId)
  if (!castingSystem) return { valid: true, errors: [] }

  // Validate cantrip count
  const requiredCantrips = getCantripsKnown(classId, 1)
  if (state.selectedCantripIds.length !== requiredCantrips) {
    errors.push(`Select exactly ${requiredCantrips} cantrips (${state.selectedCantripIds.length} selected)`)
  }

  // Validate selected cantrips are on the class list
  const classCantrips = SPELLS.filter((s) => s.level === 0 && s.classes.includes(classId))
  const validCantripIds = new Set(classCantrips.map((s) => s.id))
  for (const id of state.selectedCantripIds) {
    if (!validCantripIds.has(id)) {
      errors.push(`Cantrip "${id}" is not on the ${classId} spell list`)
    }
  }

  // Validate spell count
  if (castingSystem === 'known') {
    const requiredSpells = getSpellsKnownOrPrepared({
      classId,
      level: 1,
      abilityModifier,
      preparedCaster: false,
    })
    if (state.selectedSpellIds.length !== requiredSpells) {
      errors.push(`Select exactly ${requiredSpells} spells (${state.selectedSpellIds.length} selected)`)
    }
  } else if (castingSystem === 'prepared') {
    const maxPrepared = getSpellsKnownOrPrepared({
      classId,
      level: 1,
      abilityModifier,
      preparedCaster: true,
    })
    if (state.selectedSpellIds.length === 0) {
      errors.push('Select at least 1 prepared spell')
    } else if (state.selectedSpellIds.length > maxPrepared) {
      errors.push(`Too many prepared spells (${state.selectedSpellIds.length} selected, max ${maxPrepared})`)
    }
  } else if (castingSystem === 'spellbook') {
    // Wizard: 6 spellbook spells
    if (state.selectedSpellIds.length !== 6) {
      errors.push(`Select exactly 6 spells for your spellbook (${state.selectedSpellIds.length} selected)`)
    }
    // Wizard: prepared from spellbook
    const maxPrepared = getSpellsKnownOrPrepared({
      classId: 'wizard',
      level: 1,
      abilityModifier,
      preparedCaster: true,
    })
    if (state.preparedSpellIds.length === 0) {
      errors.push('Prepare at least 1 spell from your spellbook')
    } else if (state.preparedSpellIds.length > maxPrepared) {
      errors.push(`Too many prepared spells (${state.preparedSpellIds.length} prepared, max ${maxPrepared})`)
    }
    // Validate prepared spells are in the spellbook
    const spellbookSet = new Set(state.selectedSpellIds)
    for (const id of state.preparedSpellIds) {
      if (!spellbookSet.has(id)) {
        errors.push(`Prepared spell "${id}" is not in your spellbook`)
      }
    }
  }

  // Validate selected spells are on the class list
  const classSpells = SPELLS.filter((s) => s.level === 1 && s.classes.includes(classId))
  const validSpellIds = new Set(classSpells.map((s) => s.id))
  for (const id of state.selectedSpellIds) {
    if (!validSpellIds.has(id)) {
      errors.push(`Spell "${id}" is not on the ${classId} spell list`)
    }
  }

  // Check for duplicates
  const cantripSet = new Set(state.selectedCantripIds)
  if (cantripSet.size !== state.selectedCantripIds.length) {
    errors.push('Duplicate cantrip selections found')
  }
  const spellSet = new Set(state.selectedSpellIds)
  if (spellSet.size !== state.selectedSpellIds.length) {
    errors.push('Duplicate spell selections found')
  }

  return { valid: errors.length === 0, errors }
}

// -- Component ----------------------------------------------------------------

export function SpellStep({ onValidationChange }: WizardStepProps) {
  const classSelection = useWizardStore((s) => s.classSelection)
  const abilityScores = useWizardStore((s) => s.abilityScores)
  const spellSelections = useWizardStore((s) => s.spellSelections)
  const setSpells = useWizardStore((s) => s.setSpells)

  // Parse stored spell selections (format: "cantrip:id" or "spell:id" or "prepared:id")
  const [selectedCantripIds, setSelectedCantripIds] = useState<string[]>(() => {
    return spellSelections
      .filter((s) => s.startsWith('cantrip:'))
      .map((s) => s.replace('cantrip:', ''))
  })

  const [selectedSpellIds, setSelectedSpellIds] = useState<string[]>(() => {
    return spellSelections
      .filter((s) => s.startsWith('spell:'))
      .map((s) => s.replace('spell:', ''))
  })

  const [preparedSpellIds, setPreparedSpellIds] = useState<string[]>(() => {
    return spellSelections
      .filter((s) => s.startsWith('prepared:'))
      .map((s) => s.replace('prepared:', ''))
  })

  const classId = classSelection?.classId ?? null
  const cls = useMemo(() => {
    if (!classId) return null
    return CLASSES.find((c) => c.id === classId) ?? null
  }, [classId])

  const castingSystem = useMemo(() => {
    if (!classId) return null
    return getCastingSystem(classId)
  }, [classId])

  // Get spellcasting ability and modifier
  const spellcastingAbility = cls?.spellcasting?.ability ?? 'intelligence'
  const abilityModifier = useMemo(() => {
    if (!abilityScores || !spellcastingAbility) return 0
    const score = abilityScores[spellcastingAbility as AbilityName] ?? 10
    return getAbilityModifier(score)
  }, [abilityScores, spellcastingAbility])

  // Calculate limits
  const maxCantrips = useMemo(() => {
    if (!classId) return 0
    return getCantripsKnown(classId, 1)
  }, [classId])

  const maxSpells = useMemo(() => {
    if (!classId || !castingSystem) return 0
    if (castingSystem === 'spellbook') return 6
    if (castingSystem === 'known') {
      return getSpellsKnownOrPrepared({
        classId,
        level: 1,
        abilityModifier,
        preparedCaster: false,
      })
    }
    // Prepared caster
    return getSpellsKnownOrPrepared({
      classId,
      level: 1,
      abilityModifier,
      preparedCaster: true,
    })
  }, [classId, castingSystem, abilityModifier])

  const maxPrepared = useMemo(() => {
    if (castingSystem !== 'spellbook') return 0
    return getSpellsKnownOrPrepared({
      classId: classId!,
      level: 1,
      abilityModifier,
      preparedCaster: true,
    })
  }, [classId, castingSystem, abilityModifier])

  // Spell slot info for display
  const slotInfo = useMemo(() => {
    if (!classId || !cls?.spellcasting) return null
    if (cls.spellcasting.type === 'pact') {
      const pact = getPactMagicSlots(1)
      return { type: 'pact' as const, slotLevel: pact.slotLevel, numSlots: pact.numSlots }
    }
    const slots = getSpellSlots(cls.spellcasting.type as 'full' | 'half' | 'third', 1)
    return { type: 'standard' as const, slots }
  }, [classId, cls])

  // Spell save DC and attack bonus
  const spellSaveDC = 8 + 2 + abilityModifier // 8 + proficiency(2) + modifier
  const spellAttackBonus = 2 + abilityModifier

  // Persist to store whenever selections change
  useEffect(() => {
    const allSelections: string[] = [
      ...selectedCantripIds.map((id) => `cantrip:${id}`),
      ...selectedSpellIds.map((id) => `spell:${id}`),
      ...preparedSpellIds.map((id) => `prepared:${id}`),
    ]
    setSpells(allSelections)
  }, [selectedCantripIds, selectedSpellIds, preparedSpellIds, setSpells])

  // Validate and report
  useEffect(() => {
    if (!classId || !castingSystem || !onValidationChange) return

    const validation = validateSpellStep(
      { selectedCantripIds, selectedSpellIds, preparedSpellIds },
      classId,
      abilityModifier,
    )
    onValidationChange(validation)
  }, [selectedCantripIds, selectedSpellIds, preparedSpellIds, classId, castingSystem, abilityModifier, onValidationChange])

  // No class or non-caster
  if (!classId || !cls || !castingSystem) {
    return (
      <div className="text-center py-12 text-parchment/60" data-testid="no-spellcasting">
        <p>No spellcasting class selected. This step will be skipped.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8" data-testid="spell-step">
      {/* Spellcasting Summary */}
      <div className="rounded-lg border border-parchment/10 bg-parchment/5 p-4 space-y-3" data-testid="spellcasting-summary">
        <h2 className="text-lg font-heading font-semibold text-parchment">
          Spellcasting — {cls.name}
        </h2>
        <p className="text-sm text-parchment/70" data-testid="spell-summary-text">
          As a level 1 {cls.name}, you can choose {maxCantrips} cantrip{maxCantrips !== 1 ? 's' : ''}{' '}
          and {castingSystem === 'spellbook' ? `${maxSpells} spellbook` : maxSpells} level 1 spell{maxSpells !== 1 ? 's' : ''}.
          Your spellcasting ability is {capitalizeFirst(spellcastingAbility)}.
        </p>

        {/* Spellcasting stats */}
        <div className="flex items-center gap-6 text-sm" data-testid="spellcasting-stats">
          <div>
            <span className="text-parchment/50 text-xs block">Spell Save DC</span>
            <span className="text-parchment font-semibold">{spellSaveDC}</span>
          </div>
          <div>
            <span className="text-parchment/50 text-xs block">Spell Attack</span>
            <span className="text-parchment font-semibold">
              {spellAttackBonus >= 0 ? '+' : ''}{spellAttackBonus}
            </span>
          </div>
          <div>
            <span className="text-parchment/50 text-xs block">Spell Slots</span>
            <span className="text-parchment font-semibold">
              {slotInfo?.type === 'pact'
                ? `${slotInfo.numSlots} (Pact, Lv${slotInfo.slotLevel})`
                : slotInfo?.slots[1]
                  ? `${slotInfo.slots[1]} 1st-level`
                  : '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Cantrip Selection */}
      <CantripSelector
        classId={classId}
        maxCantrips={maxCantrips}
        selectedCantripIds={selectedCantripIds}
        onSelectionChange={setSelectedCantripIds}
      />

      {/* Spell Selection */}
      <SpellSelector
        classId={classId}
        castingSystem={castingSystem}
        maxSpells={maxSpells}
        maxPrepared={maxPrepared}
        selectedSpellIds={selectedSpellIds}
        onSpellSelectionChange={setSelectedSpellIds}
        preparedSpellIds={preparedSpellIds}
        onPreparedChange={setPreparedSpellIds}
        abilityName={spellcastingAbility}
        abilityModifier={abilityModifier}
      />
    </div>
  )
}
