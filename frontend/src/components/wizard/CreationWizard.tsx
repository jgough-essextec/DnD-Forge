/**
 * CreationWizard - Top-level wizard controller component.
 *
 * Reads the current step from wizardStore and renders the matching
 * step component. Step transitions are animated with framer-motion
 * AnimatePresence (slide-left when advancing, slide-right when going back).
 *
 * Includes the WizardProgress sidebar/bar and the WizardNavigation footer.
 */

import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWizardStore } from '@/stores/wizardStore'
import { WIZARD_STEPS } from '@/components/wizard/wizardSteps'
import { WizardProgress } from '@/components/wizard/WizardProgress'
import { WizardNavigation } from '@/components/wizard/WizardNavigation'
import { IntroStep } from '@/components/wizard/steps/IntroStep'
import { FreeformCreation } from '@/components/wizard/FreeformCreation'
import { RaceStep } from '@/components/wizard/steps/race/RaceStep'
import { ClassStep } from '@/components/wizard/steps/class'
import { AbilityScoreStep } from '@/components/wizard/steps/abilities'
import { BackgroundStep } from '@/components/wizard/steps/background/BackgroundStep'
import { EquipmentStep } from '@/components/wizard/steps/equipment/EquipmentStep'
import { SpellStep } from '@/components/wizard/steps/spells/SpellStep'
import { ReviewStep } from '@/components/wizard/steps/review'
import type { StepValidation } from '@/components/wizard/types'

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
}

export function CreationWizard() {
  const currentStep = useWizardStore((s) => s.currentStep)
  const setStep = useWizardStore((s) => s.setStep)
  const prevStepRef = useRef(currentStep)

  const [mode, setMode] = useState<'guided' | 'freeform'>('guided')
  const [validation, setValidation] = useState<StepValidation>({
    valid: true,
    errors: [],
  })

  // Track animation direction: positive = forward, negative = backward
  const direction = currentStep >= prevStepRef.current ? 1 : -1
  prevStepRef.current = currentStep

  const handleValidationChange = useCallback((v: StepValidation) => {
    setValidation(v)
  }, [])

  const handleSelectFreeform = useCallback(() => {
    setMode('freeform')
  }, [])

  const handleSwitchToGuided = useCallback(() => {
    setMode('guided')
    setStep(0)
  }, [setStep])

  // Freeform mode: render the freeform creation view
  if (mode === 'freeform') {
    return <FreeformCreation onSwitchToGuided={handleSwitchToGuided} />
  }

  // Guided mode: render the wizard step
  const currentStepDef = WIZARD_STEPS.find((s) => s.id === currentStep)

  function renderStep() {
    if (!currentStepDef) return null

    switch (currentStepDef.name) {
      case 'intro':
        return (
          <IntroStep
            onValidationChange={handleValidationChange}
            onSelectFreeform={handleSelectFreeform}
          />
        )
      case 'race':
        return (
          <RaceStep
            onValidationChange={handleValidationChange}
          />
        )
      case 'class':
        return (
          <ClassStep
            onValidationChange={handleValidationChange}
          />
        )
      case 'abilities':
        return (
          <AbilityScoreStep
            onValidationChange={handleValidationChange}
          />
        )
      case 'background':
        return (
          <BackgroundStep
            onValidationChange={handleValidationChange}
          />
        )
      case 'equipment':
        return (
          <EquipmentStep
            onValidationChange={handleValidationChange}
          />
        )
      case 'spells':
        return (
          <SpellStep
            onValidationChange={handleValidationChange}
          />
        )
      case 'review':
        return (
          <ReviewStep
            onValidationChange={handleValidationChange}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
      {/* Progress sidebar (desktop) / top bar (mobile) */}
      <WizardProgress />

      {/* Step content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation (hidden on intro step since it has its own buttons) */}
        {currentStep > 0 && (
          <WizardNavigation validation={validation} />
        )}
      </div>
    </div>
  )
}
