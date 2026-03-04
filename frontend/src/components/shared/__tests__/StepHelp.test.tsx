// =============================================================================
// Tests for StepHelp
// =============================================================================

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepHelp } from '@/components/shared/StepHelp'

const defaultProps = {
  stepName: 'race-selection',
  helpText: 'Choose your character race. Each race offers unique abilities and traits.',
  tips: [
    'Consider ability score bonuses that complement your class.',
    'Some races grant darkvision, which is useful for dungeon exploration.',
  ],
}

describe('StepHelp', () => {
  it('renders collapsed with "Need Help?" button', () => {
    render(<StepHelp {...defaultProps} />)

    expect(screen.getByText('Need Help?')).toBeInTheDocument()
    // Help text should not be visible initially
    expect(screen.queryByText(defaultProps.helpText)).not.toBeInTheDocument()
  })

  it('expands to show help text on click', async () => {
    const user = userEvent.setup()

    render(<StepHelp {...defaultProps} />)

    await user.click(screen.getByText('Need Help?'))

    expect(screen.getByText(defaultProps.helpText)).toBeInTheDocument()
  })

  it('shows tips when provided', async () => {
    const user = userEvent.setup()

    render(<StepHelp {...defaultProps} />)

    await user.click(screen.getByText('Need Help?'))

    expect(screen.getByText('Tips:')).toBeInTheDocument()
    expect(screen.getByText(defaultProps.tips![0])).toBeInTheDocument()
    expect(screen.getByText(defaultProps.tips![1])).toBeInTheDocument()
  })
})
