/**
 * Wizard Step Registry
 *
 * Defines the ordered steps for the character creation wizard, along
 * with helper functions for conditional step skipping (e.g. non-caster
 * classes skip the Spells step).
 */

export interface WizardStepDef {
  id: number
  name: string
  label: string
  description: string
  isConditional?: boolean
}

export const WIZARD_STEPS: WizardStepDef[] = [
  { id: 0, name: 'intro', label: 'Get Started', description: 'Choose creation mode' },
  { id: 1, name: 'race', label: 'Race', description: 'Choose your race' },
  { id: 2, name: 'class', label: 'Class', description: 'Choose your class' },
  { id: 3, name: 'abilities', label: 'Abilities', description: 'Set ability scores' },
  { id: 4, name: 'background', label: 'Background', description: 'Background & personality' },
  { id: 5, name: 'equipment', label: 'Equipment', description: 'Choose equipment' },
  { id: 6, name: 'spells', label: 'Spells', description: 'Choose spells', isConditional: true },
  { id: 7, name: 'review', label: 'Review', description: 'Review & save' },
]

/**
 * Non-caster class IDs that always skip the spellcasting step.
 * Paladin and Ranger are half-casters that get spells at level 2,
 * not level 1, so they also skip at L1 character creation.
 */
export const NON_CASTER_CLASSES = ['fighter', 'barbarian', 'monk', 'rogue']

/** Classes that only gain spellcasting at level 2+ (skip at L1). */
const DELAYED_CASTER_CLASSES = ['paladin', 'ranger']

/**
 * Returns true if the spellcasting step should be skipped for
 * the given class. A null classId means no class selected yet,
 * in which case we do not skip (the step is shown as available).
 */
export function shouldSkipSpellcasting(classId: string | null): boolean {
  if (classId === null) return false
  return NON_CASTER_CLASSES.includes(classId) || DELAYED_CASTER_CLASSES.includes(classId)
}

/**
 * Returns the list of visible wizard steps, filtering out
 * the spellcasting step for non-caster classes.
 */
export function getVisibleSteps(classId: string | null): WizardStepDef[] {
  return WIZARD_STEPS.filter((step) => {
    if (step.name === 'spells' && shouldSkipSpellcasting(classId)) {
      return false
    }
    return true
  })
}

/**
 * Returns the next step id, skipping the spellcasting step
 * when appropriate for non-caster classes.
 */
export function getNextStep(currentStep: number, classId: string | null): number {
  const maxStep = WIZARD_STEPS[WIZARD_STEPS.length - 1].id
  if (currentStep >= maxStep) return currentStep

  const nextStep = currentStep + 1
  const stepDef = WIZARD_STEPS.find((s) => s.id === nextStep)
  if (stepDef?.name === 'spells' && shouldSkipSpellcasting(classId)) {
    return nextStep + 1
  }
  return nextStep
}

/**
 * Returns the previous step id, skipping the spellcasting step
 * when appropriate for non-caster classes.
 */
export function getPrevStep(currentStep: number, classId: string | null): number {
  if (currentStep <= 0) return 0

  const prevStep = currentStep - 1
  const stepDef = WIZARD_STEPS.find((s) => s.id === prevStep)
  if (stepDef?.name === 'spells' && shouldSkipSpellcasting(classId)) {
    return prevStep - 1
  }
  return prevStep
}
