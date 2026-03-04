/**
 * ASIFeatStep Tests (Story 31.5)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ASIFeatStep } from '../ASIFeatStep'
import type { Character } from '@/types/character'
import type { LevelUpChanges } from '@/utils/levelup'

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
    classes: [{ classId: 'fighter', level: 3, chosenSkills: ['athletics', 'perception'], hpRolls: [6, 5] }],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: 'Test Hero' },
      characterPersonality: { personalityTraits: ['Brave', 'Loyal'], ideal: 'Honor', bond: 'Comrades', flaw: 'Reckless' },
    },
    alignment: 'lawful-good',
    baseAbilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScoreMethod: 'standard',
    level: 3,
    experiencePoints: 2700,
    hpMax: 28,
    hpCurrent: 28,
    tempHp: 0,
    hitDiceTotal: [3],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 10, dexModifier: 2, shieldBonus: 0, otherBonuses: [], formula: '10 + DEX' },
      initiative: 2, speed: { walk: 30 },
      hitPoints: { maximum: 28, current: 28, temporary: 0, hitDice: { total: [{ count: 3, die: 'd10' }], used: [0] } },
      attacks: [], savingThrows: {},
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
    features: [],
    feats: [],
    description: { name: 'Test Hero', age: '25', height: '', weight: '', eyes: '', skin: '', hair: '', appearance: '', backstory: '', alliesAndOrgs: '', treasure: '' },
    personality: { personalityTraits: ['Brave', 'Loyal'], ideal: 'Honor', bond: 'Comrades', flaw: 'Reckless' },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    ...overrides,
  } as Character
}

function makeChanges(): LevelUpChanges {
  return {
    newLevel: 4,
    hpIncrease: 0,
    newFeatures: [],
    isSubclassLevel: false,
    isASILevel: true,
    hitDieType: 10,
    averageHP: 6,
    classId: 'fighter',
    newClassLevel: 4,
  }
}

describe('ASIFeatStep', () => {
  it('renders the ASI/feat step', () => {
    render(
      <ASIFeatStep
        character={makeCharacter()}
        changes={makeChanges()}
        onASIChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('asi-feat-step')).toBeInTheDocument()
  })

  it('shows ASI and Feat mode toggle buttons', () => {
    render(
      <ASIFeatStep
        character={makeCharacter()}
        changes={makeChanges()}
        onASIChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('asi-mode-button')).toBeInTheDocument()
    expect(screen.getByTestId('feat-mode-button')).toBeInTheDocument()
  })

  it('defaults to ASI mode', () => {
    render(
      <ASIFeatStep
        character={makeCharacter()}
        changes={makeChanges()}
        onASIChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('asi-mode-button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows +2 to One and +1/+1 distribution buttons in ASI mode', () => {
    render(
      <ASIFeatStep
        character={makeCharacter()}
        changes={makeChanges()}
        onASIChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('asi-single-button')).toBeInTheDocument()
    expect(screen.getByTestId('asi-split-button')).toBeInTheDocument()
  })

  it('shows ability score grid', () => {
    render(
      <ASIFeatStep
        character={makeCharacter()}
        changes={makeChanges()}
        onASIChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('ability-score-grid')).toBeInTheDocument()
  })

  it('calls onASIChange when selecting +2 to STR', () => {
    const onASIChange = vi.fn()
    render(
      <ASIFeatStep
        character={makeCharacter()}
        changes={makeChanges()}
        onASIChange={onASIChange}
      />,
    )
    fireEvent.click(screen.getByTestId('ability-strength'))
    expect(onASIChange).toHaveBeenCalledWith('asi', [{ ability: 'strength', amount: 2 }])
  })

  it('switches to feat mode and shows feat list', async () => {
    render(
      <ASIFeatStep
        character={makeCharacter()}
        changes={makeChanges()}
        onASIChange={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('feat-mode-button'))
    await waitFor(() => {
      expect(screen.getByTestId('feat-list')).toBeInTheDocument()
    })
  })

  it('shows feats in the feat list', async () => {
    render(
      <ASIFeatStep
        character={makeCharacter()}
        changes={makeChanges()}
        onASIChange={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('feat-mode-button'))
    await waitFor(() => {
      expect(screen.getByTestId('feat-option-alert')).toBeInTheDocument()
    })
  })

  it('calls onASIChange with feat when selecting a feat', async () => {
    const onASIChange = vi.fn()
    render(
      <ASIFeatStep
        character={makeCharacter()}
        changes={makeChanges()}
        onASIChange={onASIChange}
      />,
    )
    fireEvent.click(screen.getByTestId('feat-mode-button'))
    await waitFor(() => {
      expect(screen.getByTestId('feat-option-alert')).toBeInTheDocument()
    })
    // Reset the spy to clear the mode-switch call
    onASIChange.mockClear()
    fireEvent.click(screen.getByTestId('feat-option-alert'))
    expect(onASIChange).toHaveBeenCalledWith('feat', undefined, { featId: 'alert' })
  })

  it('shows ASI preview after selecting an ability', () => {
    render(
      <ASIFeatStep
        character={makeCharacter()}
        changes={makeChanges()}
        onASIChange={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('ability-strength'))
    expect(screen.getByTestId('asi-preview')).toBeInTheDocument()
  })
})
