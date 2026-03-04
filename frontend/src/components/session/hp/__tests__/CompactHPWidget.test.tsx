/**
 * CompactHPWidget Tests (Story 27.3)
 *
 * Tests for the sticky floating mobile HP widget including display,
 * collapse/expand, modal opening, and HP bar rendering.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompactHPWidget } from '../CompactHPWidget'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps = {
  hpCurrent: 25,
  hpMax: 40,
  tempHp: 0,
  ac: 16,
  deathSaves: { successes: 0 as const, failures: 0 as const, stable: false },
  onApplyDamage: vi.fn(),
  onApplyHealing: vi.fn(),
}

function renderWidget(overrides = {}) {
  return render(<CompactHPWidget {...defaultProps} {...overrides} />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CompactHPWidget', () => {
  it('renders the compact HP widget', () => {
    renderWidget()
    expect(screen.getByTestId('compact-hp-widget')).toBeInTheDocument()
  })

  it('displays current HP and max HP', () => {
    renderWidget({ hpCurrent: 25, hpMax: 40 })
    expect(screen.getByTestId('compact-hp-current')).toHaveTextContent('25')
    expect(screen.getByText(/40/)).toBeInTheDocument()
  })

  it('displays AC value', () => {
    renderWidget({ ac: 18 })
    expect(screen.getByTestId('compact-ac-display')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
  })

  it('shows HP bar', () => {
    renderWidget()
    expect(screen.getByTestId('compact-hp-bar')).toBeInTheDocument()
  })

  it('shows temp HP badge when temp HP > 0', () => {
    renderWidget({ tempHp: 5 })
    expect(screen.getByText('+5')).toBeInTheDocument()
  })

  it('does not show temp HP badge when temp HP is 0', () => {
    renderWidget({ tempHp: 0 })
    expect(screen.queryByText('+0')).not.toBeInTheDocument()
  })

  it('collapses to pill when collapse button is clicked', async () => {
    const user = userEvent.setup()
    renderWidget()

    await user.click(screen.getByTestId('collapse-widget'))
    // Should now show the expand button instead
    expect(screen.getByTestId('expand-widget')).toBeInTheDocument()
  })

  it('expands from pill when expand button is clicked', async () => {
    const user = userEvent.setup()
    renderWidget()

    // Collapse first
    await user.click(screen.getByTestId('collapse-widget'))
    expect(screen.getByTestId('expand-widget')).toBeInTheDocument()

    // Expand
    await user.click(screen.getByTestId('expand-widget'))
    expect(screen.getByTestId('collapse-widget')).toBeInTheDocument()
  })

  it('opens damage modal when damage button is clicked', async () => {
    const user = userEvent.setup()
    renderWidget()

    await user.click(screen.getByTestId('quick-damage'))
    expect(screen.getByTestId('damage-heal-modal')).toBeInTheDocument()
  })

  it('opens heal modal when heal button is clicked', async () => {
    const user = userEvent.setup()
    renderWidget()

    await user.click(screen.getByTestId('quick-heal'))
    expect(screen.getByTestId('damage-heal-modal')).toBeInTheDocument()
  })

  it('opens damage modal when HP area is tapped', async () => {
    const user = userEvent.setup()
    renderWidget()

    await user.click(screen.getByTestId('hp-tap-area'))
    expect(screen.getByTestId('damage-heal-modal')).toBeInTheDocument()
  })
})
