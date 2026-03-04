import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { FreeformCreation } from '@/components/wizard/FreeformCreation'
import { useWizardStore } from '@/stores/wizardStore'

describe('FreeformCreation', () => {
  beforeEach(() => {
    useWizardStore.getState().reset()
  })

  it('renders all accordion section headers', () => {
    renderWithProviders(
      <FreeformCreation onSwitchToGuided={() => {}} />
    )
    const sections = [
      'Race & Species',
      'Class & Level',
      'Ability Scores',
      'Background & Personality',
      'Equipment & Inventory',
      'Spellcasting',
      'Description',
    ]
    for (const section of sections) {
      expect(screen.getByText(section)).toBeInTheDocument()
    }
  })

  it('expands a section when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <FreeformCreation onSwitchToGuided={() => {}} />
    )
    await user.click(screen.getByText('Race & Species'))
    expect(
      screen.getByText('Race selection coming in Round 7')
    ).toBeInTheDocument()
  })

  it('shows computed stats sidebar', () => {
    renderWithProviders(
      <FreeformCreation onSwitchToGuided={() => {}} />
    )
    expect(screen.getAllByText('Computed Stats').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Armor Class').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Hit Points').length).toBeGreaterThanOrEqual(1)
  })

  it('shows Switch to Guided Mode link', () => {
    renderWithProviders(
      <FreeformCreation onSwitchToGuided={() => {}} />
    )
    expect(screen.getByText('Switch to Guided Mode')).toBeInTheDocument()
  })

  it('shows confirmation dialog when switching to guided mode', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <FreeformCreation onSwitchToGuided={() => {}} />
    )
    await user.click(screen.getByText('Switch to Guided Mode'))
    expect(screen.getByText('Switch to Guided Mode?')).toBeInTheDocument()
  })

  it('calls onSwitchToGuided after confirming the switch dialog', async () => {
    const user = userEvent.setup()
    const onSwitch = vi.fn()
    renderWithProviders(
      <FreeformCreation onSwitchToGuided={onSwitch} />
    )
    await user.click(screen.getByText('Switch to Guided Mode'))
    await user.click(screen.getByText('Switch'))
    expect(onSwitch).toHaveBeenCalledOnce()
  })
})
