/**
 * DeathSaveTracker Tests (Story 27.3)
 *
 * Tests for the enhanced death save tracker including dice roll integration,
 * manual toggle, stabilize functionality, damage-at-zero processing,
 * and status indicators.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeathSaveTracker } from '../DeathSaveTracker'

// Mock the diceStore
vi.mock('@/stores/diceStore', () => ({
  useDiceStore: () => ({
    roll: vi.fn().mockReturnValue({ results: [10], total: 10 }),
  }),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps = {
  deathSaves: { successes: 0 as const, failures: 0 as const, stable: false },
  hpCurrent: 0,
  onUpdateDeathSaves: vi.fn(),
  onRegainHP: vi.fn(),
}

function renderTracker(overrides = {}) {
  return render(<DeathSaveTracker {...defaultProps} {...overrides} />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DeathSaveTracker', () => {
  it('renders when character is at 0 HP', () => {
    renderTracker({ hpCurrent: 0 })
    expect(screen.getByTestId('death-save-tracker')).toBeInTheDocument()
  })

  it('does not render when character has HP and no death save progress', () => {
    renderTracker({
      hpCurrent: 10,
      deathSaves: { successes: 0, failures: 0, stable: false },
    })
    expect(screen.queryByTestId('death-save-tracker')).not.toBeInTheDocument()
  })

  it('renders success and failure circles', () => {
    renderTracker()
    expect(screen.getByTestId('death-save-success-0')).toBeInTheDocument()
    expect(screen.getByTestId('death-save-success-1')).toBeInTheDocument()
    expect(screen.getByTestId('death-save-success-2')).toBeInTheDocument()
    expect(screen.getByTestId('death-save-failure-0')).toBeInTheDocument()
    expect(screen.getByTestId('death-save-failure-1')).toBeInTheDocument()
    expect(screen.getByTestId('death-save-failure-2')).toBeInTheDocument()
  })

  it('shows roll death save button when at 0 HP and not dead/stable', () => {
    renderTracker({ hpCurrent: 0 })
    expect(screen.getByTestId('roll-death-save')).toBeInTheDocument()
  })

  it('shows stabilize button when at 0 HP and not dead/stable', () => {
    renderTracker({ hpCurrent: 0 })
    expect(screen.getByTestId('stabilize-button')).toBeInTheDocument()
  })

  it('toggles success circles on click', async () => {
    const onUpdateDeathSaves = vi.fn()
    const user = userEvent.setup()
    renderTracker({ onUpdateDeathSaves })

    await user.click(screen.getByTestId('death-save-success-0'))
    expect(onUpdateDeathSaves).toHaveBeenCalledWith(
      expect.objectContaining({ successes: 1 }),
    )
  })

  it('toggles failure circles on click', async () => {
    const onUpdateDeathSaves = vi.fn()
    const user = userEvent.setup()
    renderTracker({ onUpdateDeathSaves })

    await user.click(screen.getByTestId('death-save-failure-0'))
    expect(onUpdateDeathSaves).toHaveBeenCalledWith(
      expect.objectContaining({ failures: 1 }),
    )
  })

  it('shows stabilized status when 3 successes', () => {
    renderTracker({
      deathSaves: { successes: 3, failures: 0, stable: true },
      hpCurrent: 0,
    })
    expect(screen.getByTestId('stabilized-status')).toBeInTheDocument()
  })

  it('shows dead status when 3 failures', () => {
    renderTracker({
      deathSaves: { successes: 0, failures: 3, stable: false },
      hpCurrent: 0,
    })
    expect(screen.getByTestId('dead-status')).toBeInTheDocument()
  })

  it('shows damage-at-zero buttons', () => {
    renderTracker({ hpCurrent: 0 })
    expect(screen.getByTestId('damage-at-zero')).toBeInTheDocument()
    expect(screen.getByTestId('critical-at-zero')).toBeInTheDocument()
  })

  it('processes damage at zero HP (normal hit)', async () => {
    const onUpdateDeathSaves = vi.fn()
    const user = userEvent.setup()
    renderTracker({ hpCurrent: 0, onUpdateDeathSaves })

    await user.click(screen.getByTestId('damage-at-zero'))
    expect(onUpdateDeathSaves).toHaveBeenCalledWith(
      expect.objectContaining({ failures: 1 }),
    )
  })

  it('processes critical hit at zero HP (2 failures)', async () => {
    const onUpdateDeathSaves = vi.fn()
    const user = userEvent.setup()
    renderTracker({ hpCurrent: 0, onUpdateDeathSaves })

    await user.click(screen.getByTestId('critical-at-zero'))
    expect(onUpdateDeathSaves).toHaveBeenCalledWith(
      expect.objectContaining({ failures: 2 }),
    )
  })

  it('resets death saves when reset button is clicked', async () => {
    const onUpdateDeathSaves = vi.fn()
    const user = userEvent.setup()
    renderTracker({
      hpCurrent: 0,
      deathSaves: { successes: 1, failures: 1, stable: false },
      onUpdateDeathSaves,
    })

    await user.click(screen.getByTestId('reset-death-saves'))
    expect(onUpdateDeathSaves).toHaveBeenCalledWith({
      successes: 0,
      failures: 0,
      stable: false,
    })
  })

  it('stabilizes character when stabilize button is clicked', async () => {
    const onUpdateDeathSaves = vi.fn()
    const user = userEvent.setup()
    renderTracker({ hpCurrent: 0, onUpdateDeathSaves })

    await user.click(screen.getByTestId('stabilize-button'))
    expect(onUpdateDeathSaves).toHaveBeenCalledWith(
      expect.objectContaining({ successes: 3, stable: true }),
    )
  })
})
