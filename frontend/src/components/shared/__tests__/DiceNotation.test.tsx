// =============================================================================
// Tests for DiceNotation
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiceNotation } from '@/components/shared/DiceNotation'

// Mock the dice store
const mockRoll = vi.fn().mockReturnValue({ total: 14 })

vi.mock('@/stores/diceStore', () => ({
  useDiceStore: (selector: (state: { roll: typeof mockRoll }) => unknown) =>
    selector({ roll: mockRoll }),
}))

describe('DiceNotation', () => {
  beforeEach(() => {
    mockRoll.mockClear()
    mockRoll.mockReturnValue({ total: 14 })
  })

  it('renders the notation text', () => {
    render(<DiceNotation notation="2d6+3" />)

    expect(screen.getByTestId('dice-notation')).toHaveTextContent('2d6+3')
  })

  it('renders a clickable button with accessible label', () => {
    render(<DiceNotation notation="1d20" label="Attack Roll" />)

    expect(screen.getByLabelText('Roll Attack Roll: 1d20')).toBeInTheDocument()
  })

  it('calls dice store roll on click', async () => {
    const user = userEvent.setup()

    render(<DiceNotation notation="2d6+3" label="Longsword damage" />)

    await user.click(screen.getByTestId('dice-notation'))
    expect(mockRoll).toHaveBeenCalledWith(
      [{ type: 'd6', count: 2 }],
      3,
      'Longsword damage',
    )
  })

  it('calls custom onClick instead of dice store when provided', async () => {
    const user = userEvent.setup()
    const customClick = vi.fn()

    render(<DiceNotation notation="1d8+2" onClick={customClick} />)

    await user.click(screen.getByTestId('dice-notation'))
    expect(customClick).toHaveBeenCalled()
    expect(mockRoll).not.toHaveBeenCalled()
  })
})
