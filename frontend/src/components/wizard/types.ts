/**
 * Wizard step validation and prop interfaces.
 *
 * Each wizard step component accepts WizardStepProps so the parent
 * CreationWizard can track per-step validation status.
 */

export interface StepValidation {
  valid: boolean
  errors: string[]
}

export interface WizardStepProps {
  onValidationChange?: (validation: StepValidation) => void
}
