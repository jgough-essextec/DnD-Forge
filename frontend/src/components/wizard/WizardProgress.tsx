/**
 * WizardProgress - Step progress indicator for the creation wizard.
 *
 * Desktop (>=768px): Vertical sidebar on the left.
 * Mobile (<768px): Horizontal scrollable bar at the top.
 *
 * - Completed steps show a checkmark and are clickable.
 * - Current step is highlighted with accent-gold.
 * - Future steps are dimmed and not clickable.
 * - Spellcasting step shows "N/A" badge for non-caster classes.
 */

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWizardStore } from '@/stores/wizardStore'
import { WIZARD_STEPS, shouldSkipSpellcasting } from '@/components/wizard/wizardSteps'

export function WizardProgress() {
  const currentStep = useWizardStore((s) => s.currentStep)
  const setStep = useWizardStore((s) => s.setStep)
  const classSelection = useWizardStore((s) => s.classSelection)
  const classId = classSelection?.classId ?? null

  function handleStepClick(stepId: number) {
    if (stepId < currentStep) {
      setStep(stepId)
    }
  }

  return (
    <>
      {/* Desktop: vertical sidebar */}
      <nav
        className="hidden md:flex flex-col gap-1 w-56 shrink-0 py-4 pr-4 border-r border-parchment/10"
        aria-label="Wizard progress"
      >
        {WIZARD_STEPS.map((step) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isFuture = step.id > currentStep
          const isSpellNA =
            step.name === 'spells' && shouldSkipSpellcasting(classId)

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => handleStepClick(step.id)}
              disabled={isFuture || isCurrent || isSpellNA}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                isCompleted &&
                  !isSpellNA &&
                  'text-parchment hover:bg-parchment/5 cursor-pointer',
                isCurrent && 'bg-accent-gold/10 text-accent-gold font-medium',
                isFuture && !isSpellNA && 'text-parchment/30 cursor-not-allowed',
                isSpellNA && 'text-parchment/20 cursor-not-allowed'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Step number / check indicator */}
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  isCompleted && !isSpellNA && 'bg-healing-green/20 text-healing-green',
                  isCurrent && 'bg-accent-gold/20 text-accent-gold',
                  isFuture && !isSpellNA && 'bg-parchment/10 text-parchment/30',
                  isSpellNA && 'bg-parchment/5 text-parchment/20'
                )}
              >
                {isCompleted && !isSpellNA ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id + 1
                )}
              </span>

              {/* Step label and optional N/A badge */}
              <span className="flex flex-col leading-tight">
                <span>{step.label}</span>
                {isSpellNA && (
                  <span className="text-xs text-parchment/30 mt-0.5">N/A</span>
                )}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Mobile: horizontal bar */}
      <nav
        className="flex md:hidden items-center gap-2 overflow-x-auto px-4 py-3 border-b border-parchment/10 scrollbar-none"
        aria-label="Wizard progress"
      >
        {WIZARD_STEPS.map((step) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isFuture = step.id > currentStep
          const isSpellNA =
            step.name === 'spells' && shouldSkipSpellcasting(classId)

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => handleStepClick(step.id)}
              disabled={isFuture || isCurrent || isSpellNA}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors shrink-0',
                isCompleted &&
                  !isSpellNA &&
                  'bg-healing-green/10 text-healing-green',
                isCurrent && 'bg-accent-gold/15 text-accent-gold font-medium',
                isFuture && !isSpellNA && 'text-parchment/30',
                isSpellNA && 'text-parchment/20'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isCompleted && !isSpellNA ? (
                <Check className="h-3 w-3" />
              ) : null}
              <span>{step.label}</span>
              {isSpellNA && (
                <span className="text-[10px] text-parchment/30 ml-0.5">
                  N/A
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </>
  )
}
