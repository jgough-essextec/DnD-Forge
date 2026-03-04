/**
 * DamageHealModal Tests (Story 27.1)
 *
 * Tests for the tabbed damage/heal modal including tab switching,
 * amount input, damage type selection, preview display, keyboard
 * shortcuts, and apply/cancel functionality.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DamageHealModal } from '../DamageHealModal'
import type { DamageType } from '@/types/core'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  initialTab: 'damage' as const,
  hpCurrent: 25,
  hpMax: 40,
  tempHp: 0,
  resistances: [] as DamageType[],
  vulnerabilities: [] as DamageType[],
  immunities: [] as DamageType[],
  onApplyDamage: vi.fn(),
  onApplyHealing: vi.fn(),
}

function renderModal(overrides = {}) {
  return render(<DamageHealModal {...defaultProps} {...overrides} />)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DamageHealModal', () => {
  it('renders nothing when not open', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByTestId('damage-heal-modal')).not.toBeInTheDocument()
  })

  it('renders modal when open', () => {
    renderModal()
    expect(screen.getByTestId('damage-heal-modal')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('opens on damage tab by default when initialTab is damage', () => {
    renderModal({ initialTab: 'damage' })
    const damageTab = screen.getByTestId('tab-damage')
    expect(damageTab.className).toContain('text-damage-red')
  })

  it('opens on heal tab when initialTab is heal', () => {
    renderModal({ initialTab: 'heal' })
    const healTab = screen.getByTestId('tab-heal')
    expect(healTab.className).toContain('text-healing-green')
  })

  it('switches tabs when clicked', async () => {
    const user = userEvent.setup()
    renderModal({ initialTab: 'damage' })

    await user.click(screen.getByTestId('tab-heal'))
    expect(screen.getByTestId('tab-heal').className).toContain('text-healing-green')

    await user.click(screen.getByTestId('tab-damage'))
    expect(screen.getByTestId('tab-damage').className).toContain('text-damage-red')
  })

  it('shows damage type selector on damage tab', () => {
    renderModal({ initialTab: 'damage' })
    expect(screen.getByTestId('damage-type-selector')).toBeInTheDocument()
  })

  it('shows heal source input on heal tab', () => {
    renderModal({ initialTab: 'heal' })
    expect(screen.getByTestId('heal-source-input')).toBeInTheDocument()
  })

  it('shows damage preview when amount is entered', async () => {
    const user = userEvent.setup()
    renderModal({ hpCurrent: 25, hpMax: 40, tempHp: 5 })

    await user.type(screen.getByTestId('hp-amount-input'), '10')
    expect(screen.getByTestId('damage-preview')).toBeInTheDocument()
  })

  it('shows healing preview when amount is entered on heal tab', async () => {
    const user = userEvent.setup()
    renderModal({ initialTab: 'heal', hpCurrent: 20, hpMax: 40 })

    await user.type(screen.getByTestId('hp-amount-input'), '10')
    expect(screen.getByTestId('healing-preview')).toBeInTheDocument()
  })

  it('shows instant death warning for massive damage', async () => {
    const user = userEvent.setup()
    // Current: 5, Max: 10, Damage: 20 (overflow = 15 >= max 10 = instant death)
    renderModal({ hpCurrent: 5, hpMax: 10, tempHp: 0 })

    await user.type(screen.getByTestId('hp-amount-input'), '20')
    expect(screen.getByTestId('instant-death-warning')).toBeInTheDocument()
  })

  it('shows resistance info in damage preview', async () => {
    const user = userEvent.setup()
    renderModal({ hpCurrent: 30, hpMax: 40, resistances: ['fire'] })

    await user.type(screen.getByTestId('hp-amount-input'), '10')
    // Select fire damage type
    await user.click(screen.getByTestId('damage-type-fire'))

    expect(screen.getByTestId('damage-relation-text')).toBeInTheDocument()
    expect(screen.getByTestId('damage-relation-text').textContent).toContain('Resisted')
  })

  it('calls onApplyDamage and closes when apply is clicked', async () => {
    const onApplyDamage = vi.fn()
    const onClose = vi.fn()
    const user = userEvent.setup()

    renderModal({ onApplyDamage, onClose, hpCurrent: 25, hpMax: 40 })

    await user.type(screen.getByTestId('hp-amount-input'), '10')
    await user.click(screen.getByTestId('apply-button'))

    expect(onApplyDamage).toHaveBeenCalledWith(10, 10, undefined, null)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onApplyHealing and closes when apply is clicked on heal tab', async () => {
    const onApplyHealing = vi.fn()
    const onClose = vi.fn()
    const user = userEvent.setup()

    renderModal({ initialTab: 'heal', onApplyHealing, onClose, hpCurrent: 20, hpMax: 40 })

    await user.type(screen.getByTestId('hp-amount-input'), '15')
    await user.click(screen.getByTestId('apply-button'))

    expect(onApplyHealing).toHaveBeenCalledWith(15, 15, undefined)
    expect(onClose).toHaveBeenCalled()
  })

  it('disables apply button when amount is 0', () => {
    renderModal()
    expect(screen.getByTestId('apply-button')).toBeDisabled()
  })

  it('calls onClose when clicking cancel', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderModal({ onClose })

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when pressing Escape', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })

    // Dispatch Escape key event on window
    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    window.dispatchEvent(event)

    expect(onClose).toHaveBeenCalled()
  })

  it('shows stabilized message when healing from 0 HP', async () => {
    const user = userEvent.setup()
    renderModal({ initialTab: 'heal', hpCurrent: 0, hpMax: 40 })

    await user.type(screen.getByTestId('hp-amount-input'), '5')
    expect(screen.getByTestId('stabilized-message')).toBeInTheDocument()
  })
})
