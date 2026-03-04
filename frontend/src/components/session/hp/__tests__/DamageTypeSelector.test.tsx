/**
 * DamageTypeSelector Tests (Story 27.1)
 *
 * Tests for the damage type selector grid including selection,
 * deselection, resistance/vulnerability/immunity badge display,
 * and all 13 damage types rendering.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DamageTypeSelector } from '../DamageTypeSelector'
import { DAMAGE_TYPES } from '@/types/core'
import type { DamageType } from '@/types/core'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps = {
  selected: null as DamageType | null,
  onSelect: vi.fn(),
}

function renderSelector(overrides = {}) {
  return render(<DamageTypeSelector {...defaultProps} {...overrides} />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DamageTypeSelector', () => {
  it('renders all 13 damage types', () => {
    renderSelector()
    for (const type of DAMAGE_TYPES) {
      expect(screen.getByTestId(`damage-type-${type}`)).toBeInTheDocument()
    }
  })

  it('highlights selected damage type', () => {
    renderSelector({ selected: 'fire' })
    const fireButton = screen.getByTestId('damage-type-fire')
    expect(fireButton.className).toContain('border-accent-gold')
  })

  it('calls onSelect when a damage type is clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    renderSelector({ onSelect })

    await user.click(screen.getByTestId('damage-type-fire'))
    expect(onSelect).toHaveBeenCalledWith('fire')
  })

  it('calls onSelect with null when clicking already selected type (toggle off)', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    renderSelector({ selected: 'fire', onSelect })

    await user.click(screen.getByTestId('damage-type-fire'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('shows RES badge for resistant damage types', () => {
    renderSelector({ resistances: ['fire'] })
    const fireButton = screen.getByTestId('damage-type-fire')
    expect(fireButton.textContent).toContain('RES')
  })

  it('shows VUL badge for vulnerable damage types', () => {
    renderSelector({ vulnerabilities: ['cold'] })
    const coldButton = screen.getByTestId('damage-type-cold')
    expect(coldButton.textContent).toContain('VUL')
  })

  it('shows IMM badge for immune damage types', () => {
    renderSelector({ immunities: ['poison'] })
    const poisonButton = screen.getByTestId('damage-type-poison')
    expect(poisonButton.textContent).toContain('IMM')
  })

  it('shows clear button when a type is selected', () => {
    renderSelector({ selected: 'fire' })
    expect(screen.getByText('Clear damage type')).toBeInTheDocument()
  })

  it('does not show clear button when nothing is selected', () => {
    renderSelector({ selected: null })
    expect(screen.queryByText('Clear damage type')).not.toBeInTheDocument()
  })

  it('calls onSelect(null) when clear button is clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    renderSelector({ selected: 'fire', onSelect })

    await user.click(screen.getByText('Clear damage type'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })
})
