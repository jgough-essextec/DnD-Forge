/**
 * Tests for LongRestModal component (Story 30.2)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LongRestModal } from '../LongRestModal'
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
    hpCurrent: 20,
    tempHp: 5,
    hitDiceTotal: [5],
    hitDiceUsed: [3],
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 10, dexModifier: 2, shieldBonus: 0, otherBonuses: [], formula: '10 + DEX' },
      initiative: 2,
      speed: { walk: 30 },
      hitPoints: { maximum: 44, current: 20, temporary: 5, hitDice: { total: [{ count: 5, die: 'd10' }], used: [3] } },
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

describe('LongRestModal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <LongRestModal
        isOpen={false}
        onClose={vi.fn()}
        character={makeCharacter()}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.queryByTestId('long-rest-modal')).not.toBeInTheDocument()
  })

  it('renders modal with Long Rest title when open', () => {
    render(
      <LongRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter()}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByTestId('long-rest-modal')).toBeInTheDocument()
    expect(screen.getByText('Long Rest')).toBeInTheDocument()
  })

  it('shows duration note about 8 hours', () => {
    render(
      <LongRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter()}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByText(/at least 8 hours/)).toBeInTheDocument()
  })

  it('shows HP recovery to max', () => {
    render(
      <LongRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter({ hpCurrent: 20, hpMax: 44 })}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByTestId('hp-recovery')).toBeInTheDocument()
    expect(screen.getByText('(full)')).toBeInTheDocument()
  })

  it('shows temp HP persists message when tempHp > 0', () => {
    render(
      <LongRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter({ tempHp: 5 })}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByTestId('temp-hp-note')).toBeInTheDocument()
    expect(screen.getByText(/persists/)).toBeInTheDocument()
  })

  it('shows death saves reset', () => {
    render(
      <LongRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter()}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByTestId('death-saves-reset')).toBeInTheDocument()
    expect(screen.getByText('Reset to 0/0')).toBeInTheDocument()
  })

  it('shows hit dice recovery information', () => {
    render(
      <LongRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter({
          hitDiceTotal: [8],
          hitDiceUsed: [4],
        })}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByTestId('hit-dice-recovery')).toBeInTheDocument()
  })

  it('shows exhaustion change when character has exhaustion', () => {
    render(
      <LongRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter({
          conditions: [{ condition: 'exhaustion', exhaustionLevel: 3 }],
        })}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByTestId('exhaustion-change')).toBeInTheDocument()
    expect(screen.getByText(/Level 3/)).toBeInTheDocument()
    expect(screen.getByText(/Level 2/)).toBeInTheDocument()
  })

  it('shows conditions checklist for clearable conditions', () => {
    render(
      <LongRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter({
          conditions: [{ condition: 'poisoned' }, { condition: 'frightened' }],
        })}
        onFinish={vi.fn()}
      />,
    )

    expect(screen.getByTestId('condition-toggle-poisoned')).toBeInTheDocument()
    expect(screen.getByTestId('condition-toggle-frightened')).toBeInTheDocument()
  })

  it('shows 24-hour repeat rest warning when applicable', () => {
    const recentTime = new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago

    render(
      <LongRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter()}
        onFinish={vi.fn()}
        lastLongRestAt={recentTime}
      />,
    )

    expect(screen.getByTestId('repeat-rest-warning')).toBeInTheDocument()
    expect(screen.getByText('Recent Long Rest')).toBeInTheDocument()
  })

  it('calls onFinish with RestResult when Finish Long Rest is clicked', () => {
    const onFinish = vi.fn()

    render(
      <LongRestModal
        isOpen={true}
        onClose={vi.fn()}
        character={makeCharacter({
          conditions: [{ condition: 'poisoned' }],
        })}
        onFinish={onFinish}
      />,
    )

    // Toggle poisoned condition to clear it
    fireEvent.click(screen.getByTestId('condition-toggle-poisoned'))

    // Click finish
    fireEvent.click(screen.getByTestId('finish-long-rest-button'))

    expect(onFinish).toHaveBeenCalledTimes(1)
    const result = onFinish.mock.calls[0][0]
    expect(result.hpAfter).toBe(44) // Restored to max
    expect(result.deathSavesReset).toBe(true)
    expect(result.conditionsCleared).toEqual(['poisoned'])
  })
})
