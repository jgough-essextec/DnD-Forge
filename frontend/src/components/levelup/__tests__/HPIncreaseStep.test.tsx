/**
 * HPIncreaseStep Tests (Story 31.2)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HPIncreaseStep } from '../HPIncreaseStep'
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
    description: { name: 'Test Hero', age: '25', height: '6\'0"', weight: '180', eyes: '', skin: '', hair: '', appearance: '', backstory: '', alliesAndOrgs: '', treasure: '' },
    personality: { personalityTraits: ['Brave', 'Loyal'], ideal: 'Honor', bond: 'Comrades', flaw: 'Reckless' },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
  } as Character
}

function makeChanges(): LevelUpChanges {
  return {
    newLevel: 2,
    hpIncrease: 0,
    newFeatures: [],
    isSubclassLevel: false,
    isASILevel: false,
    hitDieType: 10,
    averageHP: 6,
    classId: 'fighter',
    newClassLevel: 2,
  }
}

describe('HPIncreaseStep', () => {
  it('renders the HP increase step', () => {
    render(
      <HPIncreaseStep
        character={makeCharacter()}
        changes={makeChanges()}
        onHPChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('hp-increase-step')).toBeInTheDocument()
  })

  it('shows roll and average buttons', () => {
    render(
      <HPIncreaseStep
        character={makeCharacter()}
        changes={makeChanges()}
        onHPChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('hp-roll-button')).toBeInTheDocument()
    expect(screen.getByTestId('hp-average-button')).toBeInTheDocument()
  })

  it('shows correct hit die type in roll button', () => {
    render(
      <HPIncreaseStep
        character={makeCharacter()}
        changes={makeChanges()}
        onHPChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Roll d10')).toBeInTheDocument()
  })

  it('shows average value in average button', () => {
    render(
      <HPIncreaseStep
        character={makeCharacter()}
        changes={makeChanges()}
        onHPChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Take Average (6)')).toBeInTheDocument()
  })

  it('calls onHPChange when taking average', () => {
    const onHPChange = vi.fn()
    render(
      <HPIncreaseStep
        character={makeCharacter()}
        changes={makeChanges()}
        onHPChange={onHPChange}
      />,
    )
    fireEvent.click(screen.getByTestId('hp-average-button'))
    // Average of d10 = 6, CON mod = +2, total = 8
    expect(onHPChange).toHaveBeenCalledWith(8)
  })

  it('displays result after taking average', () => {
    render(
      <HPIncreaseStep
        character={makeCharacter()}
        changes={makeChanges()}
        onHPChange={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByTestId('hp-average-button'))
    expect(screen.getByTestId('hp-result')).toBeInTheDocument()
  })

  it('calls onHPChange when rolling', async () => {
    const onHPChange = vi.fn()
    render(
      <HPIncreaseStep
        character={makeCharacter()}
        changes={makeChanges()}
        onHPChange={onHPChange}
      />,
    )
    fireEvent.click(screen.getByTestId('hp-roll-button'))

    // Wait for the rolling animation timeout (600ms) to complete
    await waitFor(
      () => {
        expect(onHPChange).toHaveBeenCalled()
      },
      { timeout: 2000 },
    )
  })

  it('shows HP result with correct format for d8 class', () => {
    const changes = { ...makeChanges(), hitDieType: 8, averageHP: 5 }
    render(
      <HPIncreaseStep
        character={makeCharacter()}
        changes={changes}
        onHPChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Roll d8')).toBeInTheDocument()
    expect(screen.getByText('Take Average (5)')).toBeInTheDocument()
  })
})
