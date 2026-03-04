/**
 * SessionAttackCard Tests (Epic 32 - Story 32.1)
 *
 * Tests for the compact attack card in the session view,
 * including display of attack/damage data and roll interactions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionAttackCard } from '../SessionAttackCard'
import type { Attack } from '@/types/combat'

// ---------------------------------------------------------------------------
// Mock stores
// ---------------------------------------------------------------------------

const mockRoll = vi.fn()
const mockToggleDiceRoller = vi.fn()

vi.mock('@/stores/diceStore', () => ({
  useDiceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ roll: mockRoll }),
}))

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ diceRollerOpen: false, toggleDiceRoller: mockToggleDiceRoller }),
}))

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const longsword: Attack = {
  name: 'Longsword',
  attackType: 'melee-weapon',
  attackBonus: 7,
  abilityModifier: 'strength',
  proficient: true,
  damageRolls: [
    {
      dice: { count: 1, die: 'd8', modifier: 4 },
      damageType: 'slashing',
    },
  ],
}


// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SessionAttackCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders attack name', () => {
    render(<SessionAttackCard attack={longsword} />)
    expect(screen.getByText('Longsword')).toBeInTheDocument()
  })

  it('displays attack bonus with correct formatting', () => {
    render(<SessionAttackCard attack={longsword} />)
    expect(screen.getByText('+7 to hit')).toBeInTheDocument()
  })

  it('displays damage dice and type', () => {
    render(<SessionAttackCard attack={longsword} />)
    expect(screen.getByText('1d8+4 slashing')).toBeInTheDocument()
  })

  it('calls dice store roll with attack data when attack button is tapped', async () => {
    const user = userEvent.setup()
    render(<SessionAttackCard attack={longsword} />)

    await user.click(screen.getByTestId('attack-roll-longsword'))

    expect(mockToggleDiceRoller).toHaveBeenCalled()
    expect(mockRoll).toHaveBeenCalledWith(
      [{ type: 'd20', count: 1 }],
      7,
      'Longsword Attack (+7)',
    )
  })

  it('calls dice store roll with damage data when damage button is tapped', async () => {
    const user = userEvent.setup()
    render(<SessionAttackCard attack={longsword} />)

    await user.click(screen.getByTestId('damage-roll-longsword'))

    expect(mockRoll).toHaveBeenCalledWith(
      [{ type: 'd8', count: 1 }],
      4,
      'Longsword Damage',
    )
  })
})
