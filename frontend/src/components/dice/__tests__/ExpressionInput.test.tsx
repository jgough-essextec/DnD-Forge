import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExpressionInput } from '../ExpressionInput'

describe('ExpressionInput', () => {
  const defaultProps = {
    onRoll: vi.fn(),
    recentExpressions: [] as string[],
  }

  it('renders the input field and roll button', () => {
    render(<ExpressionInput {...defaultProps} />)
    expect(screen.getByTestId('expression-field')).toBeInTheDocument()
    expect(screen.getByTestId('roll-expression-btn')).toBeInTheDocument()
  })

  it('has correct aria-label on the input', () => {
    render(<ExpressionInput {...defaultProps} />)
    expect(screen.getByLabelText('Custom dice expression')).toBeInTheDocument()
  })

  it('has placeholder text', () => {
    render(<ExpressionInput {...defaultProps} />)
    expect(screen.getByPlaceholderText('e.g. 2d6+3')).toBeInTheDocument()
  })

  it('calls onRoll with valid expression when Roll button is clicked', async () => {
    const user = userEvent.setup()
    const onRoll = vi.fn()
    render(<ExpressionInput {...defaultProps} onRoll={onRoll} />)

    const input = screen.getByTestId('expression-field')
    await user.type(input, '2d6+3')
    await user.click(screen.getByTestId('roll-expression-btn'))

    expect(onRoll).toHaveBeenCalledWith('2d6+3')
  })

  it('calls onRoll with valid expression on Enter key', async () => {
    const user = userEvent.setup()
    const onRoll = vi.fn()
    render(<ExpressionInput {...defaultProps} onRoll={onRoll} />)

    const input = screen.getByTestId('expression-field')
    await user.type(input, '1d20{enter}')

    expect(onRoll).toHaveBeenCalledWith('1d20')
  })

  it('shows error for invalid expression', async () => {
    const user = userEvent.setup()
    const onRoll = vi.fn()
    render(<ExpressionInput {...defaultProps} onRoll={onRoll} />)

    const input = screen.getByTestId('expression-field')
    await user.type(input, 'invalid')
    await user.click(screen.getByTestId('roll-expression-btn'))

    expect(screen.getByTestId('expression-error')).toBeInTheDocument()
    expect(screen.getByText('Invalid dice expression')).toBeInTheDocument()
    expect(onRoll).not.toHaveBeenCalled()
  })

  it('clears the input after a valid roll', async () => {
    const user = userEvent.setup()
    render(<ExpressionInput {...defaultProps} onRoll={vi.fn()} />)

    const input = screen.getByTestId('expression-field') as HTMLInputElement
    await user.type(input, '1d20')
    await user.click(screen.getByTestId('roll-expression-btn'))

    expect(input.value).toBe('')
  })

  it('clears error when user types again', async () => {
    const user = userEvent.setup()
    render(<ExpressionInput {...defaultProps} onRoll={vi.fn()} />)

    const input = screen.getByTestId('expression-field')
    await user.type(input, 'bad')
    await user.click(screen.getByTestId('roll-expression-btn'))
    expect(screen.getByTestId('expression-error')).toBeInTheDocument()

    await user.type(input, '1')
    expect(screen.queryByTestId('expression-error')).not.toBeInTheDocument()
  })

  it('does not call onRoll on empty input', async () => {
    const user = userEvent.setup()
    const onRoll = vi.fn()
    render(<ExpressionInput {...defaultProps} onRoll={onRoll} />)

    await user.click(screen.getByTestId('roll-expression-btn'))
    expect(onRoll).not.toHaveBeenCalled()
  })
})
