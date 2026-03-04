/**
 * NewFeaturesStep Tests (Story 31.3)
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NewFeaturesStep } from '../NewFeaturesStep'
import type { LevelUpChanges } from '@/utils/levelup'

function makeChanges(overrides: Partial<LevelUpChanges> = {}): LevelUpChanges {
  return {
    newLevel: 2,
    hpIncrease: 8,
    newFeatures: [
      { id: 'action-surge', name: 'Action Surge', description: 'Take one additional action.', hasChoices: false },
    ],
    isSubclassLevel: false,
    isASILevel: false,
    hitDieType: 10,
    averageHP: 6,
    classId: 'fighter',
    newClassLevel: 2,
    ...overrides,
  }
}

describe('NewFeaturesStep', () => {
  it('renders the new features step', () => {
    render(<NewFeaturesStep changes={makeChanges()} />)
    expect(screen.getByTestId('new-features-step')).toBeInTheDocument()
  })

  it('displays feature names', () => {
    render(<NewFeaturesStep changes={makeChanges()} />)
    expect(screen.getByText('Action Surge')).toBeInTheDocument()
  })

  it('displays feature descriptions', () => {
    render(<NewFeaturesStep changes={makeChanges()} />)
    expect(screen.getByText('Take one additional action.')).toBeInTheDocument()
  })

  it('shows Choice badge for features with choices', () => {
    const changes = makeChanges({
      newFeatures: [
        { id: 'fighting-style-fighter', name: 'Fighting Style', description: 'Choose a style', hasChoices: true },
      ],
    })
    render(<NewFeaturesStep changes={changes} />)
    expect(screen.getByText('Choice')).toBeInTheDocument()
  })

  it('shows proficiency bonus change when present', () => {
    const changes = makeChanges({
      proficiencyBonusChange: { from: 2, to: 3 },
    })
    render(<NewFeaturesStep changes={changes} />)
    expect(screen.getByTestId('proficiency-bonus-change')).toBeInTheDocument()
  })

  it('shows no features message when empty and no prof bonus', () => {
    const changes = makeChanges({ newFeatures: [], proficiencyBonusChange: undefined })
    render(<NewFeaturesStep changes={changes} />)
    expect(screen.getByTestId('no-new-features')).toBeInTheDocument()
  })

  it('renders multiple features correctly', () => {
    const changes = makeChanges({
      newFeatures: [
        { id: 'feat-a', name: 'Feature A', description: 'Desc A', hasChoices: false },
        { id: 'feat-b', name: 'Feature B', description: 'Desc B', hasChoices: false },
        { id: 'feat-c', name: 'Feature C', description: 'Desc C', hasChoices: true },
      ],
    })
    render(<NewFeaturesStep changes={changes} />)
    expect(screen.getByText('Feature A')).toBeInTheDocument()
    expect(screen.getByText('Feature B')).toBeInTheDocument()
    expect(screen.getByText('Feature C')).toBeInTheDocument()
  })

  it('uses data-testid for each feature', () => {
    const changes = makeChanges({
      newFeatures: [
        { id: 'action-surge', name: 'Action Surge', description: 'Desc', hasChoices: false },
      ],
    })
    render(<NewFeaturesStep changes={changes} />)
    expect(screen.getByTestId('feature-action-surge')).toBeInTheDocument()
  })
})
