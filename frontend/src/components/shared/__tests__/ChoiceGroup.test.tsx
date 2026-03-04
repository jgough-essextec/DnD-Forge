// =============================================================================
// Tests for ChoiceGroup
// =============================================================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChoiceGroup } from '@/components/shared/ChoiceGroup'

const options = [
  { value: 'standard-array', label: 'Standard Array', description: 'Use the fixed set 15, 14, 13, 12, 10, 8' },
  { value: 'point-buy', label: 'Point Buy', description: 'Spend 27 points on ability scores' },
  { value: 'roll', label: 'Roll 4d6', description: 'Roll four d6, drop lowest' },
  { value: 'disabled-opt', label: 'Disabled', disabled: true },
]

const defaultProps = {
  options,
  selectedValue: null as string | null,
  onSelect: vi.fn(),
  label: 'Ability Score Method',
}

describe('ChoiceGroup', () => {
  it('renders options with labels and descriptions', () => {
    render(<ChoiceGroup {...defaultProps} />)

    expect(screen.getByText('Standard Array')).toBeInTheDocument()
    expect(screen.getByText('Point Buy')).toBeInTheDocument()
    expect(screen.getByText('Use the fixed set 15, 14, 13, 12, 10, 8')).toBeInTheDocument()
  })

  it('has ARIA radiogroup role and radio roles', () => {
    render(<ChoiceGroup {...defaultProps} />)

    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-label', 'Ability Score Method')
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(4)
  })

  it('calls onSelect when an option is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<ChoiceGroup {...defaultProps} onSelect={onSelect} />)

    await user.click(screen.getByText('Point Buy'))
    expect(onSelect).toHaveBeenCalledWith('point-buy')
  })

  it('marks selected option with aria-checked', () => {
    render(
      <ChoiceGroup
        {...defaultProps}
        selectedValue="point-buy"
      />,
    )

    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveAttribute('aria-checked', 'false')
    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    expect(radios[2]).toHaveAttribute('aria-checked', 'false')
  })
})
