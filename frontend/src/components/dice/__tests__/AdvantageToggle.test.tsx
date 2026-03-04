import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdvantageToggle } from '../AdvantageToggle'

describe('AdvantageToggle', () => {
  const defaultProps = {
    state: 'normal' as const,
    locked: false,
    onStateChange: vi.fn(),
    onLockedChange: vi.fn(),
  }

  it('renders the advantage and disadvantage buttons', () => {
    render(<AdvantageToggle {...defaultProps} />)
    expect(screen.getByTestId('adv-btn')).toBeInTheDocument()
    expect(screen.getByTestId('dis-btn')).toBeInTheDocument()
  })

  it('renders the lock button', () => {
    render(<AdvantageToggle {...defaultProps} />)
    expect(screen.getByTestId('lock-btn')).toBeInTheDocument()
  })

  it('has correct aria-labels', () => {
    render(<AdvantageToggle {...defaultProps} />)
    expect(screen.getByLabelText('Toggle advantage')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle disadvantage')).toBeInTheDocument()
    expect(screen.getByLabelText('Lock advantage/disadvantage')).toBeInTheDocument()
  })

  it('calls onStateChange with "advantage" when ADV is clicked from normal', async () => {
    const user = userEvent.setup()
    const onStateChange = vi.fn()
    render(<AdvantageToggle {...defaultProps} onStateChange={onStateChange} />)

    await user.click(screen.getByTestId('adv-btn'))
    expect(onStateChange).toHaveBeenCalledWith('advantage')
  })

  it('calls onStateChange with "normal" when ADV is clicked while already advantage', async () => {
    const user = userEvent.setup()
    const onStateChange = vi.fn()
    render(
      <AdvantageToggle {...defaultProps} state="advantage" onStateChange={onStateChange} />
    )

    await user.click(screen.getByTestId('adv-btn'))
    expect(onStateChange).toHaveBeenCalledWith('normal')
  })

  it('calls onStateChange with "disadvantage" when DIS is clicked from normal', async () => {
    const user = userEvent.setup()
    const onStateChange = vi.fn()
    render(<AdvantageToggle {...defaultProps} onStateChange={onStateChange} />)

    await user.click(screen.getByTestId('dis-btn'))
    expect(onStateChange).toHaveBeenCalledWith('disadvantage')
  })

  it('calls onStateChange with "normal" when DIS is clicked while already disadvantage', async () => {
    const user = userEvent.setup()
    const onStateChange = vi.fn()
    render(
      <AdvantageToggle {...defaultProps} state="disadvantage" onStateChange={onStateChange} />
    )

    await user.click(screen.getByTestId('dis-btn'))
    expect(onStateChange).toHaveBeenCalledWith('normal')
  })

  it('shows ADV button as active when advantage state', () => {
    render(<AdvantageToggle {...defaultProps} state="advantage" />)
    expect(screen.getByTestId('adv-btn')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('dis-btn')).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows DIS button as active when disadvantage state', () => {
    render(<AdvantageToggle {...defaultProps} state="disadvantage" />)
    expect(screen.getByTestId('adv-btn')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByTestId('dis-btn')).toHaveAttribute('aria-pressed', 'true')
  })

  it('toggles lock when lock button is clicked', async () => {
    const user = userEvent.setup()
    const onLockedChange = vi.fn()
    render(<AdvantageToggle {...defaultProps} onLockedChange={onLockedChange} />)

    await user.click(screen.getByTestId('lock-btn'))
    expect(onLockedChange).toHaveBeenCalledWith(true)
  })

  it('shows unlock label when locked is true', () => {
    render(<AdvantageToggle {...defaultProps} locked />)
    expect(screen.getByLabelText('Unlock advantage/disadvantage')).toBeInTheDocument()
  })
})
