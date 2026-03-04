/**
 * SubclassStep Tests (Story 31.4)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SubclassStep } from '../SubclassStep'
import type { LevelUpChanges } from '@/utils/levelup'

function makeChanges(classId: string = 'fighter', newClassLevel: number = 3): LevelUpChanges {
  return {
    newLevel: newClassLevel,
    hpIncrease: 0,
    newFeatures: [],
    isSubclassLevel: true,
    isASILevel: false,
    hitDieType: 10,
    averageHP: 6,
    classId,
    newClassLevel,
  }
}

describe('SubclassStep', () => {
  it('renders the subclass step', () => {
    render(
      <SubclassStep
        changes={makeChanges()}
        selectedSubclassId={null}
        onSubclassChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('subclass-step')).toBeInTheDocument()
  })

  it('shows the correct subclass name for the class', () => {
    render(
      <SubclassStep
        changes={makeChanges('fighter')}
        selectedSubclassId={null}
        onSubclassChange={vi.fn()}
      />,
    )
    // Fighter uses "Martial Archetype"
    expect(screen.getByText(/Martial Archetype/)).toBeInTheDocument()
  })

  it('shows subclass options for Cleric (SRD: Life Domain)', () => {
    render(
      <SubclassStep
        changes={makeChanges('cleric', 1)}
        selectedSubclassId={null}
        onSubclassChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('subclass-option-life-domain')).toBeInTheDocument()
    expect(screen.getByText('Life Domain')).toBeInTheDocument()
  })

  it('calls onSubclassChange when an option is clicked', () => {
    const onSubclassChange = vi.fn()
    render(
      <SubclassStep
        changes={makeChanges('cleric', 1)}
        selectedSubclassId={null}
        onSubclassChange={onSubclassChange}
      />,
    )
    fireEvent.click(screen.getByTestId('subclass-option-life-domain'))
    expect(onSubclassChange).toHaveBeenCalledWith('life-domain')
  })

  it('shows selected state for chosen subclass', () => {
    render(
      <SubclassStep
        changes={makeChanges('cleric', 1)}
        selectedSubclassId="life-domain"
        onSubclassChange={vi.fn()}
      />,
    )
    const option = screen.getByTestId('subclass-option-life-domain')
    expect(option).toHaveAttribute('aria-checked', 'true')
  })

  it('shows no options message when class has no SRD subclasses', () => {
    render(
      <SubclassStep
        changes={makeChanges('fighter', 3)}
        selectedSubclassId={null}
        onSubclassChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('no-subclass-options')).toBeInTheDocument()
  })
})
