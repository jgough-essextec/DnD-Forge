/**
 * Tests for ShortRestModal component (Story 30.1)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ShortRestModal } from '../ShortRestModal'
import type { Character } from '@/types/character'
import type { AbilityScores } from '@/types/core'

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

const BASE_ABILITY_SCORES: AbilityScores = {
  strength: 10,
  dexterity: 14,
  constitution: 14,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test-char',
    name: 'Test Character',
    playerName: 'Tester',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human' },
    classes: [{ classId: 'fighter', level: 5, chosenSkills: [], hpRolls: [] }],
    background: { backgroundId: 'soldier' },
    alignment: 'true-neutral',
    baseAbilityScores: BASE_ABILITY_SCORES,
    abilityScores: BASE_ABILITY_SCORES,
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 6500,
    hpMax: 44,
    hpCurrent: 30,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [2],
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 10, dexModifier: 2, shieldBonus: 0, otherBonuses: [], formula: '10 + DEX' },
      initiative: 2,
      speed: { walk: 30 },
      hitPoints: { maximum: 44, current: 30, temporary: 0, hitDice: { total: [{ count: 5, die: 'd10' }], used: [2] } },
      attacks: [],
      savingThrows: {},
    },
    speed: { walk: 30 },
    proficiencies: { armor: [], weapons: [], tools: [], languages: ['common'], skills: [], savingThrows: [] },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
    feats: [],
    description: { age: '', height: '', weight: '', eyes: '', skin: '', hair: '', appearance: '' },
    personality: { personalityTraits: '', ideals: '', bonds: '', flaws: '' },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    ...overrides,
  } as unknown as Character
}

describe('ShortRestModal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <ShortRestModal
        isOpen={false}
        onClose={vi.fn()}
        character={makeCharacter()}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.queryByTestId('short-rest-modal')).not.toBeInTheDocument()
  })

  it('renders modal with Short Rest title when open', () => {
    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter()}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByTestId('short-rest-modal')).toBeInTheDocument()
    expect(screen.getByText('Short Rest')).toBeInTheDocument()
  })

  it('shows duration note about 1 hour', () => {
    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter()}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByText(/at least 1 hour/)).toBeInTheDocument()
  })

  it('starts on the hit dice step', () => {
    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter()}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByTestId('step-hit-dice')).toBeInTheDocument()
  })

  it('shows available hit dice for each class', () => {
    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter({
          hitDiceTotal: [5],
          hitDiceUsed: [2],
        })}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByTestId('hit-die-class-0')).toBeInTheDocument()
    expect(screen.getByText('Fighter')).toBeInTheDocument()
    expect(screen.getByText('(3/5 available)')).toBeInTheDocument()
  })

  it('has a Take Average toggle', () => {
    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter()}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByTestId('take-average-toggle')).toBeInTheDocument()
    expect(screen.getByText('Take Average (no rolling)')).toBeInTheDocument()
  })

  it('navigates through steps with Next and Back buttons', () => {
    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter()}
        onFinish={vi.fn()}
      />,
    )

    // Start on step 1
    expect(screen.getByTestId('step-hit-dice')).toBeInTheDocument()

    // Go to step 2
    fireEvent.click(screen.getByTestId('step-next-button'))
    expect(screen.getByTestId('step-features')).toBeInTheDocument()

    // Go to step 3
    fireEvent.click(screen.getByTestId('step-next-button'))
    expect(screen.getByTestId('step-summary')).toBeInTheDocument()

    // Go back to step 2
    fireEvent.click(screen.getByTestId('step-back-button'))
    expect(screen.getByTestId('step-features')).toBeInTheDocument()
  })

  it('shows recovered features on step 2 for Fighter', () => {
    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter()}
        onFinish={vi.fn()}
      />,
    )

    // Navigate to features step
    fireEvent.click(screen.getByTestId('step-next-button'))

    expect(screen.getByTestId('step-features')).toBeInTheDocument()
    expect(screen.getByText('Second Wind')).toBeInTheDocument()
    expect(screen.getByText('Action Surge')).toBeInTheDocument()
  })

  it('shows Arcane Recovery prompt for Wizard', () => {
    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter({
          classes: [{ classId: 'wizard', level: 3, chosenSkills: [], hpRolls: [] }],
        })}
        onFinish={vi.fn()}
      />,
    )

    // Navigate to features step
    fireEvent.click(screen.getByTestId('step-next-button'))

    expect(screen.getByTestId('arcane-recovery-prompt')).toBeInTheDocument()
  })

  it('calls onFinish with RestResult when Finish Short Rest is clicked', () => {
    const onFinish = vi.fn()

    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter()}
        onFinish={onFinish}
      />,
    )

    // Navigate to summary
    fireEvent.click(screen.getByTestId('step-next-button'))
    fireEvent.click(screen.getByTestId('step-next-button'))

    // Click finish
    fireEvent.click(screen.getByTestId('finish-rest-button'))

    expect(onFinish).toHaveBeenCalledTimes(1)
    const result = onFinish.mock.calls[0][0]
    expect(result).toHaveProperty('hpBefore')
    expect(result).toHaveProperty('hpAfter')
    expect(result).toHaveProperty('hitDiceSpent')
    expect(result).toHaveProperty('featuresRecovered')
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()

    render(
      <ShortRestModal
        isOpen={true}
        onClose={onClose}
        character={makeCharacter()}
        onFinish={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows multiclass hit dice separately', () => {
    render(
      <ShortRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter({
          classes: [
            { classId: 'fighter', level: 3, chosenSkills: [], hpRolls: [] },
            { classId: 'wizard', level: 2, chosenSkills: [], hpRolls: [] },
          ],
          hitDiceTotal: [3, 2],
          hitDiceUsed: [1, 0],
        })}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByTestId('hit-die-class-0')).toBeInTheDocument()
    expect(screen.getByTestId('hit-die-class-1')).toBeInTheDocument()
    expect(screen.getByText('Fighter')).toBeInTheDocument()
    expect(screen.getByText('Wizard')).toBeInTheDocument()
  })
})
