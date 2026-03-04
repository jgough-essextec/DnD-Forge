/**
 * LevelUpReview Tests (Story 31.7)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LevelUpReview } from '../LevelUpReview'
import type { Character } from '@/types/character'
import type { LevelUpChanges } from '@/utils/levelup'

function makeCharacter(): Character {
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
      initiative: 2, speed: { walk: 30 },
      hitPoints: { maximum: 12, current: 12, temporary: 0, hitDice: { total: [{ count: 1, die: 'd10' }], used: [0] } },
      attacks: [], savingThrows: {},
    },
    proficiencies: { armor: [], weapons: [], tools: [], languages: ['common'], skills: [], savingThrows: ['strength', 'constitution'] },
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
  } as Character
}

function makeChanges(overrides: Partial<LevelUpChanges> = {}): LevelUpChanges {
  return {
    newLevel: 2,
    hpIncrease: 8,
    newFeatures: [
      { id: 'action-surge', name: 'Action Surge', description: 'Extra action', hasChoices: false },
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

describe('LevelUpReview', () => {
  it('renders the review step', () => {
    render(
      <LevelUpReview
        character={makeCharacter()}
        changes={makeChanges()}
        onApply={vi.fn()}
        onCancel={vi.fn()}
        isApplying={false}
      />,
    )
    expect(screen.getByTestId('level-up-review')).toBeInTheDocument()
  })

  it('shows level change', () => {
    render(
      <LevelUpReview
        character={makeCharacter()}
        changes={makeChanges()}
        onApply={vi.fn()}
        onCancel={vi.fn()}
        isApplying={false}
      />,
    )
    expect(screen.getByTestId('review-level')).toBeInTheDocument()
  })

  it('shows HP change', () => {
    render(
      <LevelUpReview
        character={makeCharacter()}
        changes={makeChanges()}
        onApply={vi.fn()}
        onCancel={vi.fn()}
        isApplying={false}
      />,
    )
    expect(screen.getByTestId('review-hp')).toBeInTheDocument()
  })

  it('shows new features', () => {
    render(
      <LevelUpReview
        character={makeCharacter()}
        changes={makeChanges()}
        onApply={vi.fn()}
        onCancel={vi.fn()}
        isApplying={false}
      />,
    )
    expect(screen.getByTestId('review-features')).toBeInTheDocument()
    expect(screen.getByText('Action Surge')).toBeInTheDocument()
  })

  it('calls onApply when Apply button is clicked', () => {
    const onApply = vi.fn()
    render(
      <LevelUpReview
        character={makeCharacter()}
        changes={makeChanges()}
        onApply={onApply}
        onCancel={vi.fn()}
        isApplying={false}
      />,
    )
    fireEvent.click(screen.getByTestId('review-apply-button'))
    expect(onApply).toHaveBeenCalled()
  })

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(
      <LevelUpReview
        character={makeCharacter()}
        changes={makeChanges()}
        onApply={vi.fn()}
        onCancel={onCancel}
        isApplying={false}
      />,
    )
    fireEvent.click(screen.getByTestId('review-cancel-button'))
    expect(onCancel).toHaveBeenCalled()
  })
})
