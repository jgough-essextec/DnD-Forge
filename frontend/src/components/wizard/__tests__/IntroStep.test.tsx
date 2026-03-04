import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { IntroStep } from '@/components/wizard/steps/IntroStep'
import { useWizardStore } from '@/stores/wizardStore'
import type { RaceSelection } from '@/types/race'

describe('IntroStep', () => {
  beforeEach(() => {
    useWizardStore.getState().reset()
  })

  it('renders the welcoming header', () => {
    renderWithProviders(
      <IntroStep onSelectFreeform={() => {}} />
    )
    expect(
      screen.getByText("Let's Build Your Adventurer!")
    ).toBeInTheDocument()
  })

  it('shows two mode cards', () => {
    renderWithProviders(
      <IntroStep onSelectFreeform={() => {}} />
    )
    expect(screen.getByText('Guided Creation')).toBeInTheDocument()
    expect(screen.getByText('Freeform Creation')).toBeInTheDocument()
  })

  it('advances to step 1 when Guided Creation is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <IntroStep onSelectFreeform={() => {}} />
    )
    await user.click(screen.getByText('Guided Creation'))
    expect(useWizardStore.getState().currentStep).toBe(1)
  })

  it('calls onSelectFreeform when Freeform Creation is clicked', async () => {
    const user = userEvent.setup()
    const onFreeform = vi.fn()
    renderWithProviders(
      <IntroStep onSelectFreeform={onFreeform} />
    )
    await user.click(screen.getByText('Freeform Creation'))
    expect(onFreeform).toHaveBeenCalledOnce()
  })

  it('persists character name to store', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <IntroStep onSelectFreeform={() => {}} />
    )
    const nameInput = screen.getByLabelText(/Character Name/i)
    await user.type(nameInput, 'Aragorn')
    expect(useWizardStore.getState().characterName).toBe('Aragorn')
  })

  it('shows character name and player name inputs', () => {
    renderWithProviders(
      <IntroStep onSelectFreeform={() => {}} />
    )
    expect(screen.getByLabelText(/Character Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Player Name/i)).toBeInTheDocument()
  })

  it('shows resume banner when store has existing race data', () => {
    useWizardStore.getState().setRace({
      raceId: 'elf',
    } as RaceSelection)
    useWizardStore.getState().setCharacterName('Legolas')

    renderWithProviders(
      <IntroStep onSelectFreeform={() => {}} />
    )
    expect(screen.getByText(/Welcome back!/i)).toBeInTheDocument()
    expect(screen.getByText(/You were building Legolas/i)).toBeInTheDocument()
  })

  it('does not show resume banner when store is fresh', () => {
    renderWithProviders(
      <IntroStep onSelectFreeform={() => {}} />
    )
    expect(screen.queryByText(/Welcome back!/i)).not.toBeInTheDocument()
  })
})
