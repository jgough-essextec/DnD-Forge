/**
 * WelcomeModal (Story 46.6)
 *
 * First-run 3-step intro modal:
 *   1. Create characters with the guided wizard
 *   2. Use them at the table with dice, HP, and spell tracking
 *   3. DMs can manage campaigns and run combat
 *
 * "Get Started" dismissal is stored in preferences so the modal
 * does not appear on subsequent visits.
 */

import { useState, useCallback } from 'react'
import {
  Wand2,
  Dice5,
  Shield,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Step data
// ---------------------------------------------------------------------------

interface WelcomeStep {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

const WELCOME_STEPS: WelcomeStep[] = [
  {
    icon: Wand2,
    title: 'Create Characters',
    description:
      'Build your hero with a guided wizard. Choose your race, class, abilities, and equipment step by step.',
  },
  {
    icon: Dice5,
    title: 'Use at the Table',
    description:
      'Roll dice, track HP, manage spell slots, and handle conditions during your sessions.',
  },
  {
    icon: Shield,
    title: 'Manage Campaigns',
    description:
      'DMs can create campaigns, track NPCs, manage loot, run combat encounters, and keep session notes.',
  },
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WelcomeModalProps {
  /** Whether the modal is visible */
  isOpen: boolean
  /** Called when the user dismisses the modal */
  onDismiss: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WelcomeModal({ isOpen, onDismiss }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = useCallback(() => {
    if (currentStep < WELCOME_STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  const handleGetStarted = useCallback(() => {
    setCurrentStep(0)
    onDismiss()
  }, [onDismiss])

  if (!isOpen) return null

  const step = WELCOME_STEPS[currentStep]
  const StepIcon = step.icon
  const isLastStep = currentStep === WELCOME_STEPS.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm"
      data-testid="welcome-modal"
    >
      <div className="w-full max-w-md mx-4 rounded-xl border border-parchment/10 bg-bg-secondary shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center">
          <h1 className="font-heading text-2xl text-accent-gold mb-1">
            Welcome to D&D Character Forge!
          </h1>
          <p className="text-sm text-parchment/50">
            Everything you need for your D&D adventures.
          </p>
        </div>

        {/* Step content */}
        <div className="px-8 py-6 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-accent-gold/10 flex items-center justify-center">
            <StepIcon className="h-7 w-7 text-accent-gold" />
          </div>

          <h2 className="font-heading text-lg text-parchment mb-2">
            {step.title}
          </h2>
          <p className="text-sm text-parchment/60 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 pb-4">
          {WELCOME_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={cn(
                'h-2 rounded-full transition-all',
                i === currentStep
                  ? 'w-6 bg-accent-gold'
                  : 'w-2 bg-parchment/20 hover:bg-parchment/30',
              )}
              aria-label={`Go to step ${i + 1}`}
              aria-current={i === currentStep ? 'step' : undefined}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn(
              'inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition-colors',
              currentStep === 0
                ? 'text-parchment/20 cursor-not-allowed'
                : 'text-parchment/60 hover:text-parchment',
            )}
            data-testid="welcome-back-btn"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {isLastStep ? (
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent-gold text-bg-primary font-semibold text-sm hover:bg-accent-gold/90 transition-colors shadow-lg shadow-accent-gold/20"
              data-testid="welcome-get-started-btn"
            >
              Get Started
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1 px-6 py-2.5 rounded-lg bg-accent-gold text-bg-primary font-semibold text-sm hover:bg-accent-gold/90 transition-colors shadow-lg shadow-accent-gold/20"
              data-testid="welcome-next-btn"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Skip link */}
        <div className="px-8 pb-4 text-center">
          <button
            onClick={handleGetStarted}
            className="text-xs text-parchment/30 hover:text-parchment/50 transition-colors"
            data-testid="welcome-skip-btn"
          >
            Skip intro
          </button>
        </div>
      </div>
    </div>
  )
}
