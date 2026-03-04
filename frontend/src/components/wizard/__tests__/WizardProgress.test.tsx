import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { WizardProgress } from '@/components/wizard/WizardProgress'
import { useWizardStore } from '@/stores/wizardStore'
import type { ClassSelection } from '@/types/class'

describe('WizardProgress', () => {
  beforeEach(() => {
    useWizardStore.getState().reset()
  })

  it('shows all step labels', () => {
    renderWithProviders(<WizardProgress />)
    const expectedLabels = [
      'Get Started',
      'Race',
      'Class',
      'Abilities',
      'Background',
      'Equipment',
      'Spells',
      'Review',
    ]
    for (const label of expectedLabels) {
      // Each label appears in both desktop and mobile nav
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1)
    }
  })

  it('highlights the current step', () => {
    useWizardStore.getState().setStep(2)
    renderWithProviders(<WizardProgress />)
    const currentStepButtons = screen.getAllByRole('button', { current: 'step' })
    expect(currentStepButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('allows clicking completed steps to navigate back', async () => {
    const user = userEvent.setup()
    useWizardStore.getState().setStep(3)
    renderWithProviders(<WizardProgress />)

    // Step 1 (Race) should be clickable since it's completed (step index 1 < 3)
    const raceButtons = screen.getAllByRole('button', { name: /Race/i })
    const enabledRaceButton = raceButtons.find((btn) => !btn.hasAttribute('disabled'))
    expect(enabledRaceButton).toBeTruthy()

    await user.click(enabledRaceButton!)
    expect(useWizardStore.getState().currentStep).toBe(1)
  })

  it('disables future steps (not clickable)', () => {
    useWizardStore.getState().setStep(1)
    renderWithProviders(<WizardProgress />)

    // All buttons for "Equipment" (step 5) should be disabled
    const equipmentButtons = screen.getAllByRole('button', { name: /Equipment/i })
    for (const btn of equipmentButtons) {
      expect(btn).toBeDisabled()
    }
  })

  it('shows N/A badge on Spells step for non-caster class', () => {
    useWizardStore.getState().setStep(2)
    useWizardStore.getState().setClass({
      classId: 'fighter',
      level: 1,
      chosenSkills: [],
      hpRolls: [],
    } as ClassSelection)

    renderWithProviders(<WizardProgress />)
    expect(screen.getAllByText('N/A').length).toBeGreaterThanOrEqual(1)
  })

  it('does not show N/A badge on Spells step for caster class', () => {
    useWizardStore.getState().setStep(2)
    useWizardStore.getState().setClass({
      classId: 'wizard',
      level: 1,
      chosenSkills: [],
      hpRolls: [],
    } as ClassSelection)

    renderWithProviders(<WizardProgress />)
    expect(screen.queryByText('N/A')).not.toBeInTheDocument()
  })
})
