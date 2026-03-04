/**
 * TempHPManager Tests (Story 27.2)
 *
 * Tests for the temporary HP management component including display,
 * non-stacking enforcement, HP bar overlay, and input handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TempHPManager } from '../TempHPManager'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps = {
  tempHp: 0,
  hpCurrent: 25,
  hpMax: 40,
  onSetTempHP: vi.fn(),
}

function renderManager(overrides = {}) {
  return render(<TempHPManager {...defaultProps} {...overrides} />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TempHPManager', () => {
  it('renders the temp HP manager container', () => {
    renderManager()
    expect(screen.getByTestId('temp-hp-manager')).toBeInTheDocument()
  })

  it('displays the HP bar', () => {
    renderManager()
    expect(screen.getByTestId('hp-bar-with-temp')).toBeInTheDocument()
    expect(screen.getByTestId('hp-bar-regular')).toBeInTheDocument()
  })

  it('shows temp HP bar overlay when temp HP > 0', () => {
    renderManager({ tempHp: 10 })
    expect(screen.getByTestId('temp-hp-bar-overlay')).toBeInTheDocument()
  })

  it('does not show temp HP bar overlay when temp HP is 0', () => {
    renderManager({ tempHp: 0 })
    expect(screen.queryByTestId('temp-hp-bar-overlay')).not.toBeInTheDocument()
  })

  it('shows temp HP value when temp HP > 0', () => {
    renderManager({ tempHp: 8 })
    expect(screen.getByTestId('temp-hp-display')).toHaveTextContent('8')
  })

  it('shows "Set" text when temp HP is 0', () => {
    renderManager({ tempHp: 0 })
    expect(screen.getByTestId('temp-hp-display')).toHaveTextContent('Set')
  })

  it('opens input when display is clicked', async () => {
    const user = userEvent.setup()
    renderManager({ tempHp: 0 })

    await user.click(screen.getByTestId('temp-hp-display'))
    expect(screen.getByTestId('temp-hp-input')).toBeInTheDocument()
  })

  it('calls onSetTempHP with the higher value (non-stacking rule)', async () => {
    const onSetTempHP = vi.fn()
    const user = userEvent.setup()
    // Current temp: 10, trying to set 5 -> should keep 10
    renderManager({ tempHp: 10, onSetTempHP })

    await user.click(screen.getByTestId('temp-hp-display'))
    const input = screen.getByTestId('temp-hp-input')
    await user.type(input, '5')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSetTempHP).toHaveBeenCalledWith(10)
  })

  it('sets temp HP when new value is higher', async () => {
    const onSetTempHP = vi.fn()
    const user = userEvent.setup()
    renderManager({ tempHp: 5, onSetTempHP })

    await user.click(screen.getByTestId('temp-hp-display'))
    const input = screen.getByTestId('temp-hp-input')
    await user.type(input, '15')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSetTempHP).toHaveBeenCalledWith(15)
  })

  it('shows active temp HP indicator when temp HP > 0', () => {
    renderManager({ tempHp: 8 })
    expect(screen.getByText(/8 temporary HP active/)).toBeInTheDocument()
  })

  it('cancels input on Escape key', async () => {
    const user = userEvent.setup()
    renderManager({ tempHp: 0 })

    await user.click(screen.getByTestId('temp-hp-display'))
    expect(screen.getByTestId('temp-hp-input')).toBeInTheDocument()

    fireEvent.keyDown(screen.getByTestId('temp-hp-input'), { key: 'Escape' })
    expect(screen.queryByTestId('temp-hp-input')).not.toBeInTheDocument()
  })
})
