// =============================================================================
// Tests for AbilityScoreDisplay
// =============================================================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AbilityScoreDisplay } from '@/components/shared/AbilityScoreDisplay'

describe('AbilityScoreDisplay', () => {
  it('renders modifier, score, and ability label', () => {
    render(
      <AbilityScoreDisplay ability="STR" score={16} modifier={3} />,
    )

    expect(screen.getByTestId('modifier-display')).toHaveTextContent('+3')
    expect(screen.getByTestId('score-display')).toHaveTextContent('16')
    expect(screen.getByText('STR')).toBeInTheDocument()
  })

  it('shows racial bonus when provided', () => {
    render(
      <AbilityScoreDisplay ability="CON" score={14} modifier={2} racialBonus={2} />,
    )

    const bonus = screen.getByTestId('racial-bonus')
    expect(bonus).toHaveTextContent('(+2)')
  })

  it('does not show racial bonus when it is zero', () => {
    render(
      <AbilityScoreDisplay ability="DEX" score={10} modifier={0} racialBonus={0} />,
    )

    expect(screen.queryByTestId('racial-bonus')).not.toBeInTheDocument()
  })

  it('formats negative modifiers correctly', () => {
    render(
      <AbilityScoreDisplay ability="CHA" score={8} modifier={-1} />,
    )

    expect(screen.getByTestId('modifier-display')).toHaveTextContent('-1')
  })

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <AbilityScoreDisplay
        ability="WIS"
        score={14}
        modifier={2}
        onClick={onClick}
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })
})
