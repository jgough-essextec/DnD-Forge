import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RollResult } from '../RollResult'

describe('RollResult', () => {
  const defaultProps = {
    total: 15,
    results: [12],
    modifier: 3,
  }

  it('renders the total', () => {
    render(<RollResult {...defaultProps} />)
    expect(screen.getByTestId('roll-total')).toHaveTextContent('15')
  })

  it('renders the breakdown', () => {
    render(<RollResult {...defaultProps} />)
    expect(screen.getByTestId('roll-breakdown')).toBeInTheDocument()
  })

  it('renders nothing when not visible', () => {
    render(<RollResult {...defaultProps} visible={false} />)
    expect(screen.queryByTestId('roll-result')).not.toBeInTheDocument()
  })

  it('renders nothing when results are empty', () => {
    render(<RollResult total={0} results={[]} modifier={0} />)
    expect(screen.queryByTestId('roll-result')).not.toBeInTheDocument()
  })

  it('shows the label when provided', () => {
    render(<RollResult {...defaultProps} label="Stealth Check" />)
    expect(screen.getByTestId('roll-label')).toHaveTextContent('Stealth Check')
  })

  it('does not show label when not provided', () => {
    render(<RollResult {...defaultProps} />)
    expect(screen.queryByTestId('roll-label')).not.toBeInTheDocument()
  })

  it('shows critical hit banner for natural 20', () => {
    render(<RollResult total={23} results={[20]} modifier={3} isCritical />)
    expect(screen.getByTestId('critical-banner')).toHaveTextContent('Natural 20!')
  })

  it('shows fumble banner for natural 1', () => {
    render(<RollResult total={4} results={[1]} modifier={3} isFumble />)
    expect(screen.getByTestId('fumble-banner')).toHaveTextContent('Natural 1!')
  })

  it('does not show critical or fumble banners for normal rolls', () => {
    render(<RollResult {...defaultProps} />)
    expect(screen.queryByTestId('critical-banner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('fumble-banner')).not.toBeInTheDocument()
  })

  it('shows advantage breakdown when advantage is true', () => {
    render(
      <RollResult
        total={20}
        results={[18, 12]}
        modifier={2}
        advantage
      />
    )
    const breakdown = screen.getByTestId('roll-breakdown')
    expect(breakdown.textContent).toContain('ADV')
  })

  it('shows disadvantage breakdown when disadvantage is true', () => {
    render(
      <RollResult
        total={5}
        results={[3, 15]}
        modifier={2}
        disadvantage
      />
    )
    const breakdown = screen.getByTestId('roll-breakdown')
    expect(breakdown.textContent).toContain('DIS')
  })

  it('displays multiple dice results in brackets', () => {
    render(
      <RollResult total={9} results={[3, 4, 2]} modifier={0} />
    )
    const breakdown = screen.getByTestId('roll-breakdown')
    expect(breakdown.textContent).toContain('3 + 4 + 2')
  })

  it('has assertive aria-live for screen readers', () => {
    render(<RollResult {...defaultProps} />)
    expect(screen.getByTestId('roll-result')).toHaveAttribute('aria-live', 'assertive')
  })
})
