// =============================================================================
// Tests for CountSelector
// =============================================================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CountSelector } from '@/components/shared/CountSelector'

interface TestSkill {
  id: string
  name: string
  desc: string
}

const skills: TestSkill[] = [
  { id: 'athletics', name: 'Athletics', desc: 'Strength-based' },
  { id: 'acrobatics', name: 'Acrobatics', desc: 'Dexterity-based' },
  { id: 'stealth', name: 'Stealth', desc: 'Dexterity-based' },
  { id: 'perception', name: 'Perception', desc: 'Wisdom-based' },
]

const defaultProps = {
  items: skills,
  selectedItems: [] as TestSkill[],
  onSelectionChange: vi.fn(),
  getKey: (s: TestSkill) => s.id,
  getLabel: (s: TestSkill) => s.name,
  getDescription: (s: TestSkill) => s.desc,
  maxSelections: 2,
}

describe('CountSelector', () => {
  it('renders items with labels and descriptions', () => {
    render(<CountSelector {...defaultProps} />)

    expect(screen.getByText('Athletics')).toBeInTheDocument()
    expect(screen.getByText('Stealth')).toBeInTheDocument()
    expect(screen.getByText('Strength-based')).toBeInTheDocument()
  })

  it('shows "N of M selected" counter', () => {
    render(
      <CountSelector
        {...defaultProps}
        selectedItems={[skills[0]]}
      />,
    )

    expect(screen.getByTestId('selection-count')).toHaveTextContent('1')
    expect(screen.getByText(/of 2 selected/)).toBeInTheDocument()
  })

  it('calls onSelectionChange when item is toggled', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()

    render(
      <CountSelector
        {...defaultProps}
        onSelectionChange={onSelectionChange}
      />,
    )

    await user.click(screen.getByLabelText('Athletics'))
    expect(onSelectionChange).toHaveBeenCalledWith([skills[0]])
  })

  it('disables unchecked items when maxSelections is reached', () => {
    render(
      <CountSelector
        {...defaultProps}
        selectedItems={[skills[0], skills[1]]}
      />,
    )

    // Stealth and Perception should be disabled (not selected, max reached)
    const stealthCheckbox = screen.getByLabelText('Stealth')
    expect(stealthCheckbox).toBeDisabled()

    // Selected items should not be disabled (can uncheck)
    const athleticsCheckbox = screen.getByLabelText('Athletics')
    expect(athleticsCheckbox).not.toBeDisabled()
  })

  it('clears all selections when Clear All is clicked', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()

    render(
      <CountSelector
        {...defaultProps}
        selectedItems={[skills[0]]}
        onSelectionChange={onSelectionChange}
      />,
    )

    await user.click(screen.getByText('Clear All'))
    expect(onSelectionChange).toHaveBeenCalledWith([])
  })
})
