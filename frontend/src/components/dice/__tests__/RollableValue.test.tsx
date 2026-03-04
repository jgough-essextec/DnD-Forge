import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RollableValue } from '../RollableValue'

// Mock the stores
const mockRoll = vi.fn()
const mockToggleDiceRoller = vi.fn()
let mockDiceRollerOpen = false

vi.mock('@/stores/diceStore', () => ({
  useDiceStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ roll: mockRoll }),
}))

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      diceRollerOpen: mockDiceRollerOpen,
      toggleDiceRoller: mockToggleDiceRoller,
    }),
}))

describe('RollableValue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDiceRollerOpen = false
  })

  it('renders children', () => {
    render(
      <RollableValue modifier={3} label="Athletics">
        <span>+3</span>
      </RollableValue>
    )
    expect(screen.getByText('+3')).toBeInTheDocument()
  })

  it('has correct aria-label', () => {
    render(
      <RollableValue modifier={3} label="Athletics">
        <span>+3</span>
      </RollableValue>
    )
    expect(screen.getByLabelText('Roll Athletics')).toBeInTheDocument()
  })

  it('calls roll with correct modifier when clicked', async () => {
    const user = userEvent.setup()
    render(
      <RollableValue modifier={5} label="Stealth">
        <span>+5</span>
      </RollableValue>
    )

    await user.click(screen.getByLabelText('Roll Stealth'))
    expect(mockRoll).toHaveBeenCalledWith(
      [{ type: 'd20', count: 1 }],
      5,
      'Stealth (+5)',
    )
  })

  it('shows negative modifier correctly in label', async () => {
    const user = userEvent.setup()
    render(
      <RollableValue modifier={-1} label="Intelligence Save">
        <span>-1</span>
      </RollableValue>
    )

    await user.click(screen.getByLabelText('Roll Intelligence Save'))
    expect(mockRoll).toHaveBeenCalledWith(
      [{ type: 'd20', count: 1 }],
      -1,
      'Intelligence Save (-1)',
    )
  })

  it('opens dice roller panel if not already open', async () => {
    const user = userEvent.setup()
    mockDiceRollerOpen = false
    render(
      <RollableValue modifier={2} label="Perception">
        <span>+2</span>
      </RollableValue>
    )

    await user.click(screen.getByLabelText('Roll Perception'))
    expect(mockToggleDiceRoller).toHaveBeenCalled()
  })

  it('does not toggle dice roller if already open', async () => {
    const user = userEvent.setup()
    mockDiceRollerOpen = true
    render(
      <RollableValue modifier={2} label="Perception">
        <span>+2</span>
      </RollableValue>
    )

    await user.click(screen.getByLabelText('Roll Perception'))
    expect(mockToggleDiceRoller).not.toHaveBeenCalled()
  })

  it('does nothing when disabled', async () => {
    const user = userEvent.setup()
    render(
      <RollableValue modifier={3} label="Athletics" disabled>
        <span>+3</span>
      </RollableValue>
    )

    await user.click(screen.getByText('+3'))
    expect(mockRoll).not.toHaveBeenCalled()
  })

  it('renders just children without wrapper when disabled', () => {
    render(
      <RollableValue modifier={3} label="Athletics" disabled>
        <span>+3</span>
      </RollableValue>
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('responds to Enter key', async () => {
    const user = userEvent.setup()
    render(
      <RollableValue modifier={4} label="Arcana">
        <span>+4</span>
      </RollableValue>
    )

    const button = screen.getByLabelText('Roll Arcana')
    button.focus()
    await user.keyboard('{Enter}')
    expect(mockRoll).toHaveBeenCalled()
  })

  it('responds to Space key', async () => {
    const user = userEvent.setup()
    render(
      <RollableValue modifier={4} label="Arcana">
        <span>+4</span>
      </RollableValue>
    )

    const button = screen.getByLabelText('Roll Arcana')
    button.focus()
    await user.keyboard(' ')
    expect(mockRoll).toHaveBeenCalled()
  })

  it('has tabIndex 0 for keyboard navigation', () => {
    render(
      <RollableValue modifier={3} label="Athletics">
        <span>+3</span>
      </RollableValue>
    )
    expect(screen.getByLabelText('Roll Athletics')).toHaveAttribute('tabindex', '0')
  })
})
