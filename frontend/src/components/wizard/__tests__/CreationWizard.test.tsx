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

  it('renders the race step when currentStep is 1', () => {
    useWizardStore.getState().setStep(1)
    renderWithProviders(<CreationWizard />)
    // The real RaceStep renders its heading
    expect(screen.getByRole('heading', { name: 'Choose Your Race' })).toBeInTheDocument()
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

  it('renders placeholder only for the review step (others are now real)', () => {
    // Review step (7) is the only remaining placeholder
    useWizardStore.getState().setStep(7)
    const { unmount } = renderWithProviders(<CreationWizard />)
    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument()
    expect(screen.getByText('Coming in Round 7')).toBeInTheDocument()
    unmount()
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
