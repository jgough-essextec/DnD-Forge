/**
 * LevelUpWizard (Story 31.1)
 *
 * Modal multi-step wizard for leveling up a character.
 * Orchestrates all level-up steps, manages state, and handles
 * navigation between steps.
 */

import { useState, useCallback, useMemo } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  getLevelUpChanges,
  getRequiredSteps,
  applyLevelUp,
  type LevelUpChanges,
  type LevelUpStepId,
} from '@/utils/levelup'
import { LevelUpOverview } from './LevelUpOverview'
import { HPIncreaseStep } from './HPIncreaseStep'
import { NewFeaturesStep } from './NewFeaturesStep'
import { SubclassStep } from './SubclassStep'
import { ASIFeatStep } from './ASIFeatStep'
import { SpellProgressionStep } from './SpellProgressionStep'
import { LevelUpReview } from './LevelUpReview'
import type { Character } from '@/types/character'
import type { AbilityName } from '@/types/core'

// -- Step labels --------------------------------------------------------------

const STEP_LABELS: Record<LevelUpStepId, string> = {
  overview: 'Overview',
  hp: 'Hit Points',
  features: 'Features',
  subclass: 'Subclass',
  'asi-feat': 'ASI / Feat',
  spells: 'Spells',
  review: 'Review',
}

// -- Props --------------------------------------------------------------------

interface LevelUpWizardProps {
  character: Character
  onComplete: (updatedCharacter: Character) => void
  onCancel: () => void
}

export function LevelUpWizard({
  character,
  onComplete,
  onCancel,
}: LevelUpWizardProps) {
  const targetLevel = character.level + 1

  // Compute changes and steps
  const initialChanges = useMemo(
    () => getLevelUpChanges(character, targetLevel),
    [character, targetLevel],
  )

  const steps = useMemo(
    () => getRequiredSteps(character, targetLevel),
    [character, targetLevel],
  )

  // State
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [changes, setChanges] = useState<LevelUpChanges>(initialChanges)
  const [isApplying, setIsApplying] = useState(false)
  const [selectedSpells, setSelectedSpells] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  const currentStepId = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  // Navigation
  const goNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((i) => i + 1)
    }
  }, [currentStepIndex, steps.length])

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1)
    }
  }, [currentStepIndex])

  // HP change handler
  const handleHPChange = useCallback((hp: number) => {
    setChanges((prev) => ({ ...prev, hpIncrease: hp }))
    setHasChanges(true)
  }, [])

  // Subclass change handler
  const handleSubclassChange = useCallback(
    (subclassId: string | null) => {
      setChanges((prev) => ({
        ...prev,
        selectedSubclassId: subclassId ?? undefined,
      }))
      setHasChanges(true)
    },
    [],
  )

  // ASI/Feat change handler
  const handleASIChange = useCallback(
    (
      mode: 'asi' | 'feat',
      asiChoices?: { ability: AbilityName; amount: number }[],
      featSelection?: { featId: string; chosenAbility?: AbilityName },
    ) => {
      setChanges((prev) => ({
        ...prev,
        asiMode: mode,
        asiChoices: mode === 'asi' ? asiChoices : undefined,
        selectedFeat:
          mode === 'feat' && featSelection ? featSelection : undefined,
      }))
      setHasChanges(true)
    },
    [],
  )

  // Spell selection handler
  const handleSpellsChange = useCallback((spells: string[]) => {
    setSelectedSpells(spells)
    setChanges((prev) => ({ ...prev, selectedSpells: spells }))
    setHasChanges(true)
  }, [])

  // Apply level up
  const handleApply = useCallback(() => {
    setIsApplying(true)

    // Use setTimeout to allow UI update
    setTimeout(() => {
      const updatedCharacter = applyLevelUp(character, changes)
      onComplete(updatedCharacter)
      setIsApplying(false)
    }, 100)
  }, [character, changes, onComplete])

  // Cancel with confirmation
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      // In a real app, show a confirmation dialog
      // For now, just cancel
      onCancel()
    } else {
      onCancel()
    }
  }, [hasChanges, onCancel])

  // Can advance logic
  const canAdvance = useMemo(() => {
    switch (currentStepId) {
      case 'hp':
        return changes.hpIncrease > 0
      case 'subclass':
        return !!changes.selectedSubclassId
      case 'asi-feat':
        if (changes.asiMode === 'asi') {
          return (changes.asiChoices?.length ?? 0) > 0
        }
        if (changes.asiMode === 'feat') {
          return !!changes.selectedFeat
        }
        return false
      default:
        return true
    }
  }, [currentStepId, changes])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      data-testid="level-up-wizard"
      role="dialog"
      aria-modal="true"
      aria-label="Level Up Wizard"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={cn(
          'relative w-full max-w-lg max-h-[90vh] overflow-hidden',
          'rounded-xl border border-parchment/20 bg-primary shadow-2xl',
          'flex flex-col',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-parchment/15 px-5 py-3">
          <h2 className="font-heading text-lg font-bold text-accent-gold">
            Level Up
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded p-1 text-parchment/40 hover:text-parchment transition-colors focus:outline-none focus:ring-2 focus:ring-accent-gold/50"
            aria-label="Close level up wizard"
            data-testid="wizard-close-button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1 px-5 py-2 border-b border-parchment/10 overflow-x-auto">
          {steps.map((stepId, idx) => (
            <div key={stepId} className="flex items-center">
              <div
                className={cn(
                  'text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors whitespace-nowrap',
                  idx === currentStepIndex
                    ? 'bg-accent-gold/20 text-accent-gold'
                    : idx < currentStepIndex
                      ? 'bg-healing-green/10 text-healing-green/70'
                      : 'text-parchment/30',
                )}
                data-testid={`step-indicator-${stepId}`}
              >
                {STEP_LABELS[stepId]}
              </div>
              {idx < steps.length - 1 && (
                <div className="w-3 h-px bg-parchment/15 mx-0.5" />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepId}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              {currentStepId === 'overview' && (
                <LevelUpOverview character={character} changes={changes} />
              )}
              {currentStepId === 'hp' && (
                <HPIncreaseStep
                  character={character}
                  changes={changes}
                  onHPChange={handleHPChange}
                />
              )}
              {currentStepId === 'features' && (
                <NewFeaturesStep changes={changes} />
              )}
              {currentStepId === 'subclass' && (
                <SubclassStep
                  changes={changes}
                  selectedSubclassId={changes.selectedSubclassId ?? null}
                  onSubclassChange={handleSubclassChange}
                />
              )}
              {currentStepId === 'asi-feat' && (
                <ASIFeatStep
                  character={character}
                  changes={changes}
                  onASIChange={handleASIChange}
                />
              )}
              {currentStepId === 'spells' && (
                <SpellProgressionStep
                  character={character}
                  changes={changes}
                  selectedSpells={selectedSpells}
                  onSpellsChange={handleSpellsChange}
                />
              )}
              {currentStepId === 'review' && (
                <LevelUpReview
                  character={character}
                  changes={changes}
                  onApply={handleApply}
                  onCancel={handleCancel}
                  isApplying={isApplying}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer navigation */}
        {currentStepId !== 'review' && (
          <div className="flex items-center justify-between border-t border-parchment/15 px-5 py-3">
            <button
              type="button"
              onClick={goBack}
              disabled={isFirstStep}
              className={cn(
                'flex items-center gap-1 text-sm text-parchment/60 transition-colors',
                'hover:text-parchment focus:outline-none focus:ring-2 focus:ring-accent-gold/50 rounded px-2 py-1',
                isFirstStep && 'invisible',
              )}
              data-testid="wizard-back-button"
              aria-label="Go to previous step"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <span className="text-xs text-parchment/30">
              {currentStepIndex + 1} / {steps.length}
            </span>

            <button
              type="button"
              onClick={goNext}
              disabled={!canAdvance || isLastStep}
              className={cn(
                'flex items-center gap-1 text-sm font-medium transition-colors',
                'rounded px-3 py-1.5',
                'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
                canAdvance
                  ? 'text-accent-gold hover:bg-accent-gold/10'
                  : 'text-parchment/20 cursor-not-allowed',
              )}
              data-testid="wizard-next-button"
              aria-label="Go to next step"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
