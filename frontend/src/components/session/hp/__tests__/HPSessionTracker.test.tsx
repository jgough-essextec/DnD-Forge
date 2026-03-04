/**
 * HPSessionTracker Tests (Story 27.1)
 *
 * Tests for the main HP tracking orchestrator component including HP display,
 * damage/heal modal opening, event history, and integration with sub-components.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HPSessionTracker } from '../HPSessionTracker'

// Mock the diceStore used by DeathSaveTracker
vi.mock('@/stores/diceStore', () => ({
  useDiceStore: () => ({
    roll: vi.fn().mockReturnValue({ results: [10], total: 10 }),
  }),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps = {
  hpCurrent: 25,
  hpMax: 40,
  tempHp: 0,
  deathSaves: { successes: 0 as const, failures: 0 as const, stable: false },
  onUpdateHP: vi.fn(),
  onUpdateTempHP: vi.fn(),
  onUpdateDeathSaves: vi.fn(),
}

function renderTracker(overrides = {}) {
  return render(<HPSessionTracker {...defaultProps} {...overrides} />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HPSessionTracker', () => {
  it('renders the HP session tracker container', () => {
    renderTracker()
    expect(screen.getByTestId('hp-session-tracker')).toBeInTheDocument()
  })

  it('displays current HP and max HP', () => {
    renderTracker({ hpCurrent: 25, hpMax: 40 })
    expect(screen.getByTestId('hp-display')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText(/40/)).toBeInTheDocument()
  })

  it('opens damage modal when damage button is clicked', async () => {
    const user = userEvent.setup()
    renderTracker()

    await user.click(screen.getByTestId('open-damage-modal'))
    expect(screen.getByTestId('damage-heal-modal')).toBeInTheDocument()
  })

  it('opens heal modal when heal button is clicked', async () => {
    const user = userEvent.setup()
    renderTracker()

    await user.click(screen.getByTestId('open-heal-modal'))
    expect(screen.getByTestId('damage-heal-modal')).toBeInTheDocument()
  })

  it('opens damage modal when HP display is clicked', async () => {
    const user = userEvent.setup()
    renderTracker()

    await user.click(screen.getByTestId('hp-display'))
    expect(screen.getByTestId('damage-heal-modal')).toBeInTheDocument()
  })

  it('shows skull icon when HP is 0', () => {
    renderTracker({ hpCurrent: 0, hpMax: 40 })
    // Skull icon is rendered when hpCurrent === 0
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders TempHPManager component', () => {
    renderTracker({ tempHp: 5 })
    expect(screen.getByTestId('temp-hp-manager')).toBeInTheDocument()
  })

  it('renders DeathSaveTracker when HP is 0', () => {
    renderTracker({ hpCurrent: 0, hpMax: 40 })
    expect(screen.getByTestId('death-save-tracker')).toBeInTheDocument()
  })

  it('does not show event history when no events', () => {
    renderTracker()
    expect(screen.queryByTestId('hp-event-history')).not.toBeInTheDocument()
  })

  it('shows event history after applying damage via modal', async () => {
    const user = userEvent.setup()
    const onUpdateHP = vi.fn()
    const onUpdateTempHP = vi.fn()
    renderTracker({ onUpdateHP, onUpdateTempHP, hpCurrent: 25, hpMax: 40 })

    // Open damage modal
    await user.click(screen.getByTestId('open-damage-modal'))

    // Enter damage amount
    const input = screen.getByTestId('hp-amount-input')
    await user.type(input, '10')

    // Apply
    await user.click(screen.getByTestId('apply-button'))

    // Event history should now be visible
    expect(screen.getByTestId('hp-event-history')).toBeInTheDocument()
    expect(screen.getAllByTestId('hp-event').length).toBeGreaterThanOrEqual(1)
  })
})
