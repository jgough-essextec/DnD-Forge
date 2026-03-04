// =============================================================================
// Epic 11 -- AbilityScoreStep
// Main step component for ability score generation in the character creation wizard.
// Supports three methods: Standard Array, Point Buy, and Rolling (4d6 drop lowest).
// =============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react'
import type { AbilityScores } from '@/types/core'
import type { AbilityScoreMethod } from '@/types/character'
import { ABILITY_NAMES } from '@/types/core'
import { useWizardStore } from '@/stores/wizardStore'
import { races } from '@/data/races'
import { ChoiceGroup } from '@/components/shared/ChoiceGroup'
import { StepHelp } from '@/components/shared/StepHelp'
import type { WizardStepProps, StepValidation } from '@/components/wizard/types'
import { StandardArrayAssigner } from './StandardArrayAssigner'
import { PointBuyAllocator } from './PointBuyAllocator'
import { DiceRollingInterface } from './DiceRollingInterface'
import { AbilityScoreSummary } from './AbilityScoreSummary'
import { cn } from '@/lib/utils'

const METHOD_OPTIONS: Array<{
  value: AbilityScoreMethod
  label: string
  description: string
}> = [
  {
    value: 'standard',
    label: 'Standard Array',
    description:
      'Use the pre-set values [15, 14, 13, 12, 10, 8] and assign each to an ability. Balanced and predictable.',
  },
  {
    value: 'pointBuy',
    label: 'Point Buy',
    description:
      'Customize each score from 8 to 15 using 27 points. Full control over your build.',
  },
  {
    value: 'rolled',
    label: 'Rolling',
    description:
      'Roll 4d6, drop the lowest die, six times. The classic method -- exciting but unpredictable!',
  },
]

function emptyScores(): AbilityScores {
  return {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
  }
}

function defaultPointBuyScores(): AbilityScores {
  return {
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  }
}

/** Extract racial ability score bonuses from the wizard store raceSelection. */
function useRacialBonuses(): Partial<AbilityScores> {
  const raceSelection = useWizardStore((s) => s.raceSelection)

  return useMemo(() => {
    const bonuses: Partial<AbilityScores> = {}
    if (!raceSelection) return bonuses

    const raceData = races.find((r) => r.id === raceSelection.raceId)
    if (!raceData) return bonuses

    // Fixed racial ability score increases
    for (const ability of ABILITY_NAMES) {
      const bonus = raceData.abilityScoreIncrease[ability]
      if (bonus !== undefined) {
        bonuses[ability] = (bonuses[ability] ?? 0) + bonus
      }
    }

    // Subrace ability score increases
    if (raceSelection.subraceId) {
      const subrace = raceData.subraces.find(
        (s) => s.id === raceSelection.subraceId,
      )
      if (subrace) {
        for (const ability of ABILITY_NAMES) {
          const bonus = subrace.abilityScoreIncrease[ability]
          if (bonus !== undefined) {
            bonuses[ability] = (bonuses[ability] ?? 0) + bonus
          }
        }
      }
    }

    // Player-chosen ability bonuses (e.g., Half-Elf)
    if (raceSelection.chosenAbilityBonuses) {
      for (const { abilityName, bonus } of raceSelection.chosenAbilityBonuses) {
        bonuses[abilityName] = (bonuses[abilityName] ?? 0) + bonus
      }
    }

    return bonuses
  }, [raceSelection])
}

/** Check whether all 6 ability scores have been assigned (non-zero). */
function areAllScoresAssigned(scores: AbilityScores): boolean {
  return ABILITY_NAMES.every((ability) => scores[ability] > 0)
}

export function AbilityScoreStep({ onValidationChange }: WizardStepProps) {
  const {
    abilityScores: storedScores,
    abilityScoreMethod: storedMethod,
    setAbilityScores,
  } = useWizardStore()

  const [method, setMethod] = useState<AbilityScoreMethod>(
    storedMethod ?? 'standard',
  )
  const [scores, setScores] = useState<AbilityScores>(
    storedScores ?? emptyScores(),
  )
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingMethod, setPendingMethod] = useState<AbilityScoreMethod | null>(
    null,
  )
  const [hasStarted, setHasStarted] = useState(
    storedScores ? areAllScoresAssigned(storedScores) : false,
  )

  const racialBonuses = useRacialBonuses()

  // Validate and report to wizard shell
  const validate = useCallback((): StepValidation => {
    const errors: string[] = []

    if (!areAllScoresAssigned(scores)) {
      const unassigned = ABILITY_NAMES.filter((a) => scores[a] === 0)
      errors.push(
        `Assign scores to all abilities. Missing: ${unassigned
          .map((a) => a.charAt(0).toUpperCase() + a.slice(1))
          .join(', ')}`,
      )
    }

    return { valid: errors.length === 0, errors }
  }, [scores])

  useEffect(() => {
    onValidationChange?.(validate())
  }, [validate, onValidationChange])

  // Persist to store whenever scores change and are complete
  useEffect(() => {
    if (areAllScoresAssigned(scores)) {
      setAbilityScores(scores, method)
    }
  }, [scores, method, setAbilityScores])

  // Method switching with confirmation
  const handleMethodSelect = useCallback(
    (newMethod: AbilityScoreMethod) => {
      if (newMethod === method) return
      if (hasStarted && areAllScoresAssigned(scores)) {
        setPendingMethod(newMethod)
        setShowConfirmDialog(true)
      } else {
        switchMethod(newMethod)
      }
    },
    [method, hasStarted, scores],
  )

  const switchMethod = useCallback((newMethod: AbilityScoreMethod) => {
    setMethod(newMethod)
    if (newMethod === 'pointBuy') {
      setScores(defaultPointBuyScores())
    } else {
      setScores(emptyScores())
    }
    setHasStarted(false)
    setShowConfirmDialog(false)
    setPendingMethod(null)
  }, [])

  const confirmSwitch = useCallback(() => {
    if (pendingMethod) {
      switchMethod(pendingMethod)
    }
  }, [pendingMethod, switchMethod])

  const cancelSwitch = useCallback(() => {
    setShowConfirmDialog(false)
    setPendingMethod(null)
  }, [])

  const handleScoresChange = useCallback((newScores: AbilityScores) => {
    setScores(newScores)
    setHasStarted(true)
  }, [])

  // Compute final scores with racial bonuses
  const finalScores = useMemo(() => {
    const result = { ...scores }
    for (const ability of ABILITY_NAMES) {
      const bonus = racialBonuses[ability] ?? 0
      result[ability] = scores[ability] + bonus
    }
    return result
  }, [scores, racialBonuses])

  const allAssigned = areAllScoresAssigned(scores)

  return (
    <div className="space-y-6" data-testid="ability-score-step">
      {/* Step Help */}
      <StepHelp
        stepName="abilities"
        helpText="Choose how you want to generate your ability scores. Each method has its own advantages."
        tips={[
          'Standard Array is recommended for new players.',
          'Point Buy gives the most control over your build.',
          'Rolling is the most fun but can result in very high or very low scores.',
        ]}
      />

      {/* Method Selection */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-parchment mb-3">
          Choose a Method
        </h3>
        <ChoiceGroup<AbilityScoreMethod>
          options={METHOD_OPTIONS}
          selectedValue={method}
          onSelect={handleMethodSelect}
          label="Ability Score Method"
        />
      </div>

      {/* Method-specific Interface */}
      <div className="mt-6">
        {method === 'standard' && (
          <StandardArrayAssigner
            scores={scores}
            onScoresChange={handleScoresChange}
            racialBonuses={racialBonuses}
          />
        )}
        {method === 'pointBuy' && (
          <PointBuyAllocator
            scores={scores}
            onScoresChange={handleScoresChange}
            racialBonuses={racialBonuses}
          />
        )}
        {method === 'rolled' && (
          <DiceRollingInterface
            scores={scores}
            onScoresChange={handleScoresChange}
            racialBonuses={racialBonuses}
          />
        )}
      </div>

      {/* Summary */}
      {allAssigned && (
        <AbilityScoreSummary
          baseScores={scores}
          racialBonuses={racialBonuses}
          finalScores={finalScores}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          data-testid="confirm-method-switch-dialog"
        >
          <div className="bg-bg-primary border border-parchment/20 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h4 className="text-lg font-heading font-semibold text-parchment mb-2">
              Switch Method?
            </h4>
            <p className="text-sm text-parchment/70 mb-6">
              Switching methods will reset all your current ability score
              assignments. Are you sure you want to continue?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelSwitch}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md',
                  'border border-parchment/20 text-parchment/70',
                  'hover:bg-parchment/10 transition-colors',
                )}
              >
                Cancel
              </button>
              <button
                onClick={confirmSwitch}
                data-testid="confirm-switch-button"
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md',
                  'bg-accent-gold text-bg-primary',
                  'hover:bg-accent-gold/90 transition-colors',
                )}
              >
                Switch Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
