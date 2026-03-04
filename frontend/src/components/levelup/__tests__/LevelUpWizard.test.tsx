/**
 * LevelUpWizard Tests (Story 31.1)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LevelUpWizard } from '../LevelUpWizard'
import type { Character } from '@/types/character'

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test-1',
    name: 'Test Hero',
    playerName: 'Tester',
    avatarUrl: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human', chosenAbilityBonuses: [], chosenLanguages: [] },
    classes: [{ classId: 'fighter', level: 1, chosenSkills: ['athletics', 'perception'], hpRolls: [] }],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: 'Test Hero' },
      characterPersonality: { personalityTraits: ['Brave', 'Loyal'], ideal: 'Honor', bond: 'Comrades', flaw: 'Reckless' },
    },
    alignment: 'lawful-good',
    baseAbilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScoreMethod: 'standard',
    level: 1,
    experiencePoints: 300,
    hpMax: 12,
    hpCurrent: 12,
    tempHp: 0,
    hitDiceTotal: [1],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 10, dexModifier: 2, shieldBonus: 0, otherBonuses: [], formula: '10 + DEX' },
      initiative: 2,
      speed: { walk: 30 },
      hitPoints: { maximum: 12, current: 12, temporary: 0, hitDice: { total: [{ count: 1, die: 'd10' }], used: [0] } },
      attacks: [],
      savingThrows: {},
    },
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: [],
      tools: [],
      languages: ['common'],
      skills: [],
      savingThrows: ['strength', 'constitution'],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: ['fighting-style-fighter', 'second-wind'],
    feats: [],
    description: { name: 'Test Hero', age: '25', height: '6\'0"', weight: '180 lbs', eyes: 'Brown', skin: 'Tan', hair: 'Black', appearance: '', backstory: '', alliesAndOrgs: '', treasure: '' },
    personality: { personalityTraits: ['Brave', 'Loyal'], ideal: 'Honor', bond: 'Comrades', flaw: 'Reckless' },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    ...overrides,
  } as Character
}

describe('LevelUpWizard', () => {
  it('renders the wizard modal', () => {
    render(
      <LevelUpWizard
        character={makeCharacter()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByTestId('level-up-wizard')).toBeInTheDocument()
  })

  it('shows the overview step initially', () => {
    render(
      <LevelUpWizard
        character={makeCharacter()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByTestId('level-up-overview')).toBeInTheDocument()
  })

  it('shows step indicators for all required steps', () => {
    render(
      <LevelUpWizard
        character={makeCharacter()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByTestId('step-indicator-overview')).toBeInTheDocument()
    expect(screen.getByTestId('step-indicator-hp')).toBeInTheDocument()
    expect(screen.getByTestId('step-indicator-review')).toBeInTheDocument()
  })

  it('navigates to the next step when Next is clicked', async () => {
    render(
      <LevelUpWizard
        character={makeCharacter()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('wizard-next-button'))
    await waitFor(() => {
      expect(screen.getByTestId('hp-increase-step')).toBeInTheDocument()
    })
  })

  it('navigates back when Back is clicked', async () => {
    render(
      <LevelUpWizard
        character={makeCharacter()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    // Go to HP step
    fireEvent.click(screen.getByTestId('wizard-next-button'))
    await waitFor(() => {
      expect(screen.getByTestId('hp-increase-step')).toBeInTheDocument()
    })

    // Go back
    fireEvent.click(screen.getByTestId('wizard-back-button'))
    await waitFor(() => {
      expect(screen.getByTestId('level-up-overview')).toBeInTheDocument()
    })
  })

  it('calls onCancel when close button is clicked', () => {
    const onCancel = vi.fn()
    render(
      <LevelUpWizard
        character={makeCharacter()}
        onComplete={vi.fn()}
        onCancel={onCancel}
      />,
    )
    fireEvent.click(screen.getByTestId('wizard-close-button'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('has dialog role and aria-modal', () => {
    render(
      <LevelUpWizard
        character={makeCharacter()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('disables Next button on HP step when no HP selected', async () => {
    render(
      <LevelUpWizard
        character={makeCharacter()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    // Navigate to HP step
    fireEvent.click(screen.getByTestId('wizard-next-button'))
    await waitFor(() => {
      expect(screen.getByTestId('hp-increase-step')).toBeInTheDocument()
    })
    // Next button should be disabled (no HP chosen yet)
    const nextButton = screen.getByTestId('wizard-next-button')
    expect(nextButton).toHaveClass('cursor-not-allowed')
  })

  it('shows the correct level transition in overview', () => {
    render(
      <LevelUpWizard
        character={makeCharacter()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByText('Level 2')).toBeInTheDocument()
  })

  it('shows features step for Fighter L1 to L2 (has Action Surge)', () => {
    render(
      <LevelUpWizard
        character={makeCharacter()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    // Check features step indicator exists
    expect(screen.getByTestId('step-indicator-features')).toBeInTheDocument()
  })
})
