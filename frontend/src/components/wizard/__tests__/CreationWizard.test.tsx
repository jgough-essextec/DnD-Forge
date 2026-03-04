import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { CreationWizard } from '@/components/wizard/CreationWizard'
import { useWizardStore } from '@/stores/wizardStore'

describe('CreationWizard', () => {
  beforeEach(() => {
    useWizardStore.getState().reset()
  })

  it('renders the intro step by default (step 0)', () => {
    renderWithProviders(<CreationWizard />)
    expect(
      screen.getByText("Let's Build Your Adventurer!")
    ).toBeInTheDocument()
  })

  it('renders a placeholder step when currentStep is set to an unbuilt step', () => {
    useWizardStore.getState().setStep(1)
    renderWithProviders(<CreationWizard />)
    // The placeholder renders the step name as an h2 heading
    expect(screen.getByRole('heading', { name: 'Race' })).toBeInTheDocument()
    expect(screen.getByText('Coming in Round 7')).toBeInTheDocument()
  })

  it('shows WizardProgress with step names', () => {
    useWizardStore.getState().setStep(1)
    renderWithProviders(<CreationWizard />)
    expect(screen.getAllByText('Get Started').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Class').length).toBeGreaterThanOrEqual(1)
  })

  it('shows WizardNavigation when not on intro step', () => {
    useWizardStore.getState().setStep(1)
    renderWithProviders(<CreationWizard />)
    expect(screen.getByText('Back')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('hides WizardNavigation on intro step', () => {
    renderWithProviders(<CreationWizard />)
    expect(screen.queryByText('Back')).not.toBeInTheDocument()
  })

  it('renders placeholder for each unbuilt step', () => {
    const unbuiltSteps = [
      { step: 2, name: 'Class' },
      { step: 3, name: 'Abilities' },
      { step: 4, name: 'Background' },
      { step: 5, name: 'Equipment' },
      { step: 6, name: 'Spells' },
      { step: 7, name: 'Review' },
    ]

    for (const { step, name } of unbuiltSteps) {
      useWizardStore.getState().setStep(step)
      const { unmount } = renderWithProviders(<CreationWizard />)
      // The placeholder renders the step name as a heading
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
      unmount()
    }
  })

  it('switches to freeform mode when Freeform Creation is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreationWizard />)
    const freeformButton = screen.getByText('Freeform Creation')
    await user.click(freeformButton)
    expect(screen.getByText('Race & Species')).toBeInTheDocument()
  })

  it('switches back to guided mode from freeform', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreationWizard />)

    // Switch to freeform
    await user.click(screen.getByText('Freeform Creation'))
    expect(screen.getByText('Race & Species')).toBeInTheDocument()

    // Switch back to guided
    await user.click(screen.getByText('Switch to Guided Mode'))
    await user.click(screen.getByText('Switch'))
    expect(
      screen.getByText("Let's Build Your Adventurer!")
    ).toBeInTheDocument()
  })
})
