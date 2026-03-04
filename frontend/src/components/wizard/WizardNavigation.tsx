/**
 * WizardNavigation - Fixed bottom bar with Back / Next navigation.
 *
 * - "Back" is disabled on step 0.
 * - "Next" is disabled when the current step fails validation.
 *   A tooltip shows why when disabled.
 * - The final step shows "Save Character" instead of "Next".
 */

import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWizardStore } from '@/stores/wizardStore'
import {
  WIZARD_STEPS,
  getNextStep,
  getPrevStep,
  getVisibleSteps,
} from '@/components/wizard/wizardSteps'
import type { StepValidation } from '@/components/wizard/types'

interface WizardNavigationProps {
  validation: StepValidation
  onSave?: () => void
}

export function WizardNavigation({ validation, onSave }: WizardNavigationProps) {
  const currentStep = useWizardStore((s) => s.currentStep)
  const setStep = useWizardStore((s) => s.setStep)
  const classSelection = useWizardStore((s) => s.classSelection)
  const classId = classSelection?.classId ?? null

  const visibleSteps = getVisibleSteps(classId)
  const lastVisibleStep = visibleSteps[visibleSteps.length - 1]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === lastVisibleStep.id

  const disabledReason =
    !validation.valid && validation.errors.length > 0
      ? validation.errors[0]
      : null

  function handleBack() {
    if (isFirstStep) return
    const prev = getPrevStep(currentStep, classId)
    setStep(prev)
  }

  function handleNext() {
    if (!validation.valid) return
    if (isLastStep) {
      onSave?.()
      return
    }
    const next = getNextStep(currentStep, classId)
    setStep(next)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-parchment/10 bg-bg-secondary/95 backdrop-blur-sm sm:relative sm:border-t-0 sm:bg-transparent sm:backdrop-blur-none">
      <div className="flex items-center justify-between px-4 py-3 sm:px-0 sm:pt-6">
        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          disabled={isFirstStep}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
            isFirstStep
              ? 'text-parchment/20 cursor-not-allowed'
              : 'text-parchment hover:bg-parchment/5'
          )}
          aria-label="Go to previous step"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {/* Step indicator (mobile) */}
        <span className="text-xs text-parchment/40 sm:hidden">
          {currentStep + 1} / {WIZARD_STEPS.length}
        </span>

        {/* Next / Save button */}
        <div className="relative group">
          <button
            type="button"
            onClick={handleNext}
            disabled={!validation.valid}
            className={cn(
              'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
              validation.valid
                ? 'bg-accent-gold text-bg-primary hover:bg-accent-gold/90'
                : 'bg-accent-gold/20 text-accent-gold/40 cursor-not-allowed'
            )}
            aria-label={isLastStep ? 'Save character' : 'Go to next step'}
          >
            {isLastStep ? (
              <>
                <Save className="h-4 w-4" />
                Save Character
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Disabled tooltip */}
          {disabledReason && (
            <div
              className="absolute bottom-full right-0 mb-2 hidden group-hover:block"
              role="tooltip"
            >
              <div className="rounded-lg bg-bg-primary border border-parchment/10 px-3 py-2 text-xs text-parchment/70 shadow-lg max-w-60">
                {disabledReason}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
