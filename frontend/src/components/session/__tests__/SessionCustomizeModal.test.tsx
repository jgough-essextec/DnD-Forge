/**
 * SessionCustomizeModal Tests (Epic 32 - Story 32.2)
 *
 * Tests for the session view customization modal including:
 * skill list display grouped by ability, pin toggling, max 8 enforcement,
 * and save/load of configuration.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionCustomizeModal } from '../SessionCustomizeModal'
import type { SessionViewConfig } from '@/utils/session-view'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultConfig: SessionViewConfig = {
  pinnedSkills: ['perception', 'athletics', 'stealth'],
  showSpellSlots: true,
  showConditions: true,
  showFeatureUses: true,
}

function renderModal(overrides: Partial<{
  isOpen: boolean
  onClose: () => void
  config: SessionViewConfig
  onSave: (config: SessionViewConfig) => void
}> = {}) {
  const props = {
    isOpen: true,
    onClose: vi.fn(),
    config: defaultConfig,
    onSave: vi.fn(),
    ...overrides,
  }
  return { ...render(<SessionCustomizeModal {...props} />), props }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SessionCustomizeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByTestId('session-customize-modal')).not.toBeInTheDocument()
  })

  it('renders the modal when isOpen is true', () => {
    renderModal()
    expect(screen.getByTestId('session-customize-modal')).toBeInTheDocument()
    expect(screen.getByText('Customize Session View')).toBeInTheDocument()
  })

  it('renders skill list grouped by ability score', () => {
    renderModal()
    expect(screen.getByTestId('group-strength')).toBeInTheDocument()
    expect(screen.getByTestId('group-dexterity')).toBeInTheDocument()
    expect(screen.getByTestId('group-constitution')).toBeInTheDocument()
    expect(screen.getByTestId('group-intelligence')).toBeInTheDocument()
    expect(screen.getByTestId('group-wisdom')).toBeInTheDocument()
    expect(screen.getByTestId('group-charisma')).toBeInTheDocument()
  })

  it('shows current pin count', () => {
    renderModal()
    expect(screen.getByTestId('pin-count')).toHaveTextContent('3/8 pinned')
  })

  it('toggles a pin when clicking a skill option', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    renderModal({ onSave })

    // Click on arcana to pin it (not currently pinned)
    const arcanaOption = screen.getByTestId('pin-option-arcana')
    await user.click(arcanaOption)

    // Pin count should update
    expect(screen.getByTestId('pin-count')).toHaveTextContent('4/8 pinned')
  })

  it('unpins a skill when clicking a pinned skill option', async () => {
    const user = userEvent.setup()
    renderModal()

    // Perception is pinned, click to unpin
    const perceptionOption = screen.getByTestId('pin-option-perception')
    await user.click(perceptionOption)

    expect(screen.getByTestId('pin-count')).toHaveTextContent('2/8 pinned')
  })

  it('enforces max 8 pinned skills', async () => {
    const user = userEvent.setup()
    const config: SessionViewConfig = {
      pinnedSkills: [
        'perception', 'athletics', 'stealth', 'investigation',
        'arcana', 'insight', 'deception', 'persuasion',
      ],
      showSpellSlots: true,
      showConditions: true,
      showFeatureUses: true,
    }
    renderModal({ config })

    expect(screen.getByTestId('pin-count')).toHaveTextContent('8/8 pinned')

    // Try to pin another skill -- should not change count
    const historyOption = screen.getByTestId('pin-option-history')
    await user.click(historyOption)

    expect(screen.getByTestId('pin-count')).toHaveTextContent('8/8 pinned')
  })

  it('calls onSave with updated config when Save is clicked', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    const onClose = vi.fn()
    renderModal({ onSave, onClose })

    // Pin arcana
    await user.click(screen.getByTestId('pin-option-arcana'))

    // Click save
    await user.click(screen.getByTestId('save-customize'))

    expect(onSave).toHaveBeenCalledTimes(1)
    const savedConfig = onSave.mock.calls[0][0] as SessionViewConfig
    expect(savedConfig.pinnedSkills).toContain('arcana')
    expect(savedConfig.pinnedSkills).toContain('perception')
    expect(onClose).toHaveBeenCalled()
  })
})
