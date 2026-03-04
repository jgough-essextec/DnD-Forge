// =============================================================================
// Tests for GameTermTooltip
// =============================================================================

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameTermTooltip } from '@/components/shared/GameTermTooltip'

describe('GameTermTooltip', () => {
  it('renders children with tooltip trigger styling', () => {
    render(
      <GameTermTooltip termId="proficiency-bonus">
        <span>Proficiency Bonus</span>
      </GameTermTooltip>,
    )

    expect(screen.getByText('Proficiency Bonus')).toBeInTheDocument()
    // The trigger span should have a dotted underline class
    const trigger = screen.getByText('Proficiency Bonus').closest('[tabindex]')
    expect(trigger).toBeInTheDocument()
  })

  it('shows tooltip with definition on hover', async () => {
    const user = userEvent.setup()

    render(
      <GameTermTooltip termId="proficiency-bonus">
        <span>Proficiency Bonus</span>
      </GameTermTooltip>,
    )

    const trigger = screen.getByText('Proficiency Bonus').closest('[tabindex]') as HTMLElement
    await user.hover(trigger)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    // The tooltip should contain the term definition
    expect(screen.getByRole('tooltip')).toHaveTextContent(/bonus/i)
  })

  it('has accessible aria-describedby when tooltip is visible', async () => {
    const user = userEvent.setup()

    render(
      <GameTermTooltip termId="proficiency-bonus">
        <span>Proficiency Bonus</span>
      </GameTermTooltip>,
    )

    const trigger = screen.getByText('Proficiency Bonus').closest('[tabindex]') as HTMLElement
    await user.hover(trigger)

    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-describedby')
    })

    const tooltipId = trigger.getAttribute('aria-describedby')!
    const tooltip = document.getElementById(tooltipId)
    expect(tooltip).toBeInTheDocument()
  })
})
