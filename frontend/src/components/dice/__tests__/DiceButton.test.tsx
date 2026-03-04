import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiceButton } from '../DiceButton'
import type { DieType } from '@/types/core'

describe('DiceButton', () => {
  const defaultProps = {
    die: 'd20' as DieType,
    onRoll: vi.fn(),
  }

  it('renders the die label', () => {
    render(<DiceButton {...defaultProps} />)
    expect(screen.getByText('d20')).toBeInTheDocument()
  })

  it('renders with the correct data-testid', () => {
    render(<DiceButton {...defaultProps} />)
    expect(screen.getByTestId('dice-btn-d20')).toBeInTheDocument()
  })

  it('calls onRoll with the die type when clicked', async () => {
    const user = userEvent.setup()
    const onRoll = vi.fn()
    render(<DiceButton {...defaultProps} onRoll={onRoll} />)
    await user.click(screen.getByTestId('dice-btn-d20'))
    expect(onRoll).toHaveBeenCalledWith('d20')
  })

  it('has correct aria-label', () => {
    render(<DiceButton {...defaultProps} />)
    expect(screen.getByLabelText('Roll d20')).toBeInTheDocument()
  })

  it('does not call onRoll when disabled', async () => {
    const user = userEvent.setup()
    const onRoll = vi.fn()
    render(<DiceButton {...defaultProps} onRoll={onRoll} disabled />)
    await user.click(screen.getByTestId('dice-btn-d20'))
    expect(onRoll).not.toHaveBeenCalled()
  })

  it('renders each die type correctly', () => {
    const dieTypes: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']
    for (const die of dieTypes) {
      const { unmount } = render(<DiceButton die={die} onRoll={vi.fn()} />)
      expect(screen.getByText(die)).toBeInTheDocument()
      expect(screen.getByTestId(`dice-btn-${die}`)).toBeInTheDocument()
      unmount()
    }
  })

  it('applies active ring class when active prop is true', () => {
    render(<DiceButton {...defaultProps} active />)
    const button = screen.getByTestId('dice-btn-d20')
    expect(button.className).toContain('ring-2')
  })

  it('applies disabled styling when disabled', () => {
    render(<DiceButton {...defaultProps} disabled />)
    const button = screen.getByTestId('dice-btn-d20')
    expect(button).toBeDisabled()
  })
})
