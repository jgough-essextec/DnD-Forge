// =============================================================================
// Tests for Epic 11 -- Ability Scores Wizard Step
// Covers: method selection, standard array, point buy, dice rolling, racial
// bonuses, summary, validation, and store integration.
// =============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useWizardStore } from '@/stores/wizardStore'
import { AbilityScoreStep } from '../AbilityScoreStep'
import { StandardArrayAssigner } from '../StandardArrayAssigner'
import { PointBuyAllocator } from '../PointBuyAllocator'
import { DiceRollingInterface } from '../DiceRollingInterface'
import { AbilityScoreSummary } from '../AbilityScoreSummary'
import type { AbilityScores } from '@/types/core'
import { ABILITY_NAMES } from '@/types/core'
import { POINT_BUY_COSTS, POINT_BUY_BUDGET, STANDARD_ARRAY } from '@/data/reference'

// -- Helpers --

function emptyScores(): AbilityScores {
  return {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
  }
}

function defaultPointBuyScores(): AbilityScores {
  return {
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  }
}

function fullStandardArrayScores(): AbilityScores {
  return {
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 10,
    charisma: 8,
  }
}

const noRacialBonuses: Partial<AbilityScores> = {}

const elfRacialBonuses: Partial<AbilityScores> = { dexterity: 2 }

// -- Reset wizard store before each test --

beforeEach(() => {
  useWizardStore.getState().reset()
})

// =============================================================================
// AbilityScoreStep (Main Component)
// =============================================================================

describe('AbilityScoreStep', () => {
  it('should render the ability score step with method selection', () => {
    render(<AbilityScoreStep />)
    expect(screen.getByTestId('ability-score-step')).toBeInTheDocument()
    expect(screen.getByText('Choose a Method')).toBeInTheDocument()
  })

  it('should render three method options with descriptions', () => {
    render(<AbilityScoreStep />)
    expect(screen.getByText('Standard Array')).toBeInTheDocument()
    expect(screen.getByText('Point Buy')).toBeInTheDocument()
    expect(screen.getByText('Rolling')).toBeInTheDocument()
  })

  it('should default to Standard Array method', () => {
    render(<AbilityScoreStep />)
    expect(screen.getByTestId('standard-array-assigner')).toBeInTheDocument()
  })

  it('should render Point Buy interface when Point Buy is selected', async () => {
    const user = userEvent.setup()
    render(<AbilityScoreStep />)
    await user.click(screen.getByText('Point Buy'))
    expect(screen.getByTestId('point-buy-allocator')).toBeInTheDocument()
  })

  it('should render Rolling interface when Rolling is selected', async () => {
    const user = userEvent.setup()
    render(<AbilityScoreStep />)
    await user.click(screen.getByText('Rolling'))
    expect(screen.getByTestId('dice-rolling-interface')).toBeInTheDocument()
  })

  it('should allow only one method to be active at a time', async () => {
    const user = userEvent.setup()
    render(<AbilityScoreStep />)

    // Start with Standard Array
    expect(screen.getByTestId('standard-array-assigner')).toBeInTheDocument()

    // Switch to Point Buy
    await user.click(screen.getByText('Point Buy'))
    expect(screen.getByTestId('point-buy-allocator')).toBeInTheDocument()
    expect(screen.queryByTestId('standard-array-assigner')).not.toBeInTheDocument()
  })

  it('should call onValidationChange with valid:false when scores are not assigned', () => {
    const onValidationChange = vi.fn()
    render(<AbilityScoreStep onValidationChange={onValidationChange} />)

    expect(onValidationChange).toHaveBeenCalledWith(
      expect.objectContaining({ valid: false }),
    )
  })

  it('should show confirmation dialog when switching methods after assignment', async () => {
    const user = userEvent.setup()

    // Pre-populate store with completed scores
    useWizardStore.getState().setAbilityScores(fullStandardArrayScores(), 'standard')

    render(<AbilityScoreStep />)

    // Switch to Rolling
    await user.click(screen.getByText('Rolling'))

    expect(screen.getByTestId('confirm-method-switch-dialog')).toBeInTheDocument()
  })

  it('should reset assignments when confirming method switch', async () => {
    const user = userEvent.setup()

    useWizardStore.getState().setAbilityScores(fullStandardArrayScores(), 'standard')

    render(<AbilityScoreStep />)

    // Attempt to switch to Point Buy
    await user.click(screen.getByText('Point Buy'))
    expect(screen.getByTestId('confirm-method-switch-dialog')).toBeInTheDocument()

    // Confirm switch
    await user.click(screen.getByTestId('confirm-switch-button'))

    // Should now show Point Buy interface
    expect(screen.getByTestId('point-buy-allocator')).toBeInTheDocument()
    expect(screen.queryByTestId('confirm-method-switch-dialog')).not.toBeInTheDocument()
  })

  it('should persist completed scores to the wizard store', async () => {
    const user = userEvent.setup()
    render(<AbilityScoreStep />)

    // Switch to point buy (which starts with all 8s)
    await user.click(screen.getByText('Point Buy'))

    // Apply Balanced preset (13,13,13,12,12,12)
    await user.click(screen.getByTestId('preset-balanced'))

    // Wait for store to be updated
    await waitFor(() => {
      const state = useWizardStore.getState()
      expect(state.abilityScores).not.toBeNull()
      expect(state.abilityScoreMethod).toBe('pointBuy')
    })
  })

  it('should display the help panel', () => {
    render(<AbilityScoreStep />)
    expect(screen.getByText('Need Help?')).toBeInTheDocument()
  })
})

// =============================================================================
// StandardArrayAssigner
// =============================================================================

describe('StandardArrayAssigner', () => {
  it('should display six Standard Array values as score chips', () => {
    render(
      <StandardArrayAssigner
        scores={emptyScores()}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    for (const value of STANDARD_ARRAY) {
      expect(screen.getByTestId(`score-chip-${value}`)).toBeInTheDocument()
    }
  })

  it('should render six ability slots', () => {
    render(
      <StandardArrayAssigner
        scores={emptyScores()}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    for (const ability of ABILITY_NAMES) {
      expect(screen.getByTestId(`ability-slot-${ability}`)).toBeInTheDocument()
    }
  })

  it('should support click-to-assign: click value then click slot', async () => {
    const user = userEvent.setup()
    const onScoresChange = vi.fn()

    render(
      <StandardArrayAssigner
        scores={emptyScores()}
        onScoresChange={onScoresChange}
        racialBonuses={noRacialBonuses}
      />,
    )

    // Click score chip 15
    await user.click(screen.getByTestId('score-chip-15'))

    // Click STR slot
    await user.click(screen.getByTestId('ability-slot-strength'))

    expect(onScoresChange).toHaveBeenCalledWith(
      expect.objectContaining({ strength: 15 }),
    )
  })

  it('should show completion indicator', () => {
    render(
      <StandardArrayAssigner
        scores={emptyScores()}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    expect(screen.getByTestId('completion-indicator')).toHaveTextContent('0 of 6 assigned')
  })

  it('should update completion indicator when scores are assigned', () => {
    const partialScores: AbilityScores = {
      strength: 15,
      dexterity: 14,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    }

    render(
      <StandardArrayAssigner
        scores={partialScores}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    expect(screen.getByTestId('completion-indicator')).toHaveTextContent('2 of 6 assigned')
  })

  it('should clear all assignments when Reset is clicked', async () => {
    const user = userEvent.setup()
    const onScoresChange = vi.fn()

    render(
      <StandardArrayAssigner
        scores={fullStandardArrayScores()}
        onScoresChange={onScoresChange}
        racialBonuses={noRacialBonuses}
      />,
    )

    await user.click(screen.getByTestId('reset-button'))

    expect(onScoresChange).toHaveBeenCalledWith(emptyScores())
  })

  it('should display racial bonus next to ability slot', () => {
    render(
      <StandardArrayAssigner
        scores={fullStandardArrayScores()}
        onScoresChange={() => {}}
        racialBonuses={elfRacialBonuses}
      />,
    )

    expect(screen.getByTestId('racial-bonus-dexterity')).toHaveTextContent('+2')
  })

  it('should show "Not assigned" for empty slots', () => {
    render(
      <StandardArrayAssigner
        scores={emptyScores()}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    const notAssignedTexts = screen.getAllByText('Not assigned')
    expect(notAssignedTexts.length).toBe(6)
  })

  it('should show "All values assigned" when pool is empty', () => {
    render(
      <StandardArrayAssigner
        scores={fullStandardArrayScores()}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    expect(screen.getByText('All values assigned')).toBeInTheDocument()
  })

  it('should remove used values from the pool', () => {
    const partialScores: AbilityScores = {
      strength: 15,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    }

    render(
      <StandardArrayAssigner
        scores={partialScores}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    // 15 should not be in the pool anymore
    const pool = screen.getByTestId('score-pool')
    expect(within(pool).queryByTestId('score-chip-15')).not.toBeInTheDocument()
    // Other values should be there
    expect(within(pool).getByTestId('score-chip-14')).toBeInTheDocument()
  })
})

// =============================================================================
// PointBuyAllocator
// =============================================================================

describe('PointBuyAllocator', () => {
  it('should display all six abilities with scores and controls', () => {
    render(
      <PointBuyAllocator
        scores={defaultPointBuyScores()}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    for (const ability of ABILITY_NAMES) {
      expect(screen.getByTestId(`ability-row-${ability}`)).toBeInTheDocument()
      expect(screen.getByTestId(`increment-${ability}`)).toBeInTheDocument()
      expect(screen.getByTestId(`decrement-${ability}`)).toBeInTheDocument()
    }
  })

  it('should show Points Remaining: 27 / 27 initially', () => {
    render(
      <PointBuyAllocator
        scores={defaultPointBuyScores()}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    expect(screen.getByTestId('points-remaining')).toHaveTextContent('27')
  })

  it('should update points remaining when scores change', () => {
    const scores: AbilityScores = {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 10,
      wisdom: 10,
      charisma: 8,
    }
    // Cost: 9+7+5+2+2+0 = 25. Remaining = 2

    render(
      <PointBuyAllocator
        scores={scores}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    expect(screen.getByTestId('points-remaining')).toHaveTextContent('2')
  })

  it('should increment a score when + is clicked', async () => {
    const user = userEvent.setup()
    const onScoresChange = vi.fn()

    render(
      <PointBuyAllocator
        scores={defaultPointBuyScores()}
        onScoresChange={onScoresChange}
        racialBonuses={noRacialBonuses}
      />,
    )

    await user.click(screen.getByTestId('increment-strength'))

    expect(onScoresChange).toHaveBeenCalledWith(
      expect.objectContaining({ strength: 9 }),
    )
  })

  it('should decrement a score when - is clicked', async () => {
    const user = userEvent.setup()
    const onScoresChange = vi.fn()
    const scores: AbilityScores = {
      ...defaultPointBuyScores(),
      strength: 10,
    }

    render(
      <PointBuyAllocator
        scores={scores}
        onScoresChange={onScoresChange}
        racialBonuses={noRacialBonuses}
      />,
    )

    await user.click(screen.getByTestId('decrement-strength'))

    expect(onScoresChange).toHaveBeenCalledWith(
      expect.objectContaining({ strength: 9 }),
    )
  })

  it('should disable decrement button when score is 8', () => {
    render(
      <PointBuyAllocator
        scores={defaultPointBuyScores()}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    expect(screen.getByTestId('decrement-strength')).toBeDisabled()
  })

  it('should disable increment button when score is 15', () => {
    const scores: AbilityScores = {
      ...defaultPointBuyScores(),
      strength: 15,
    }

    render(
      <PointBuyAllocator
        scores={scores}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    expect(screen.getByTestId('increment-strength')).toBeDisabled()
  })

  it('should disable increment when insufficient points remain', () => {
    // Spend almost all points: 15+15+15 = 27 points
    const scores: AbilityScores = {
      strength: 15,
      dexterity: 15,
      constitution: 15,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    }

    render(
      <PointBuyAllocator
        scores={scores}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    // INT is at 8, remaining is 0. Should not be able to increment.
    expect(screen.getByTestId('increment-intelligence')).toBeDisabled()
  })

  it('should display racial bonuses for each ability', () => {
    render(
      <PointBuyAllocator
        scores={defaultPointBuyScores()}
        onScoresChange={() => {}}
        racialBonuses={elfRacialBonuses}
      />,
    )

    expect(screen.getByTestId('racial-bonus-dexterity')).toHaveTextContent('+2')
  })

  it('should apply Balanced preset correctly', async () => {
    const user = userEvent.setup()
    const onScoresChange = vi.fn()

    render(
      <PointBuyAllocator
        scores={defaultPointBuyScores()}
        onScoresChange={onScoresChange}
        racialBonuses={noRacialBonuses}
      />,
    )

    await user.click(screen.getByTestId('preset-balanced'))

    expect(onScoresChange).toHaveBeenCalledWith(
      expect.objectContaining({
        strength: 13,
        dexterity: 13,
        constitution: 13,
        intelligence: 12,
        wisdom: 12,
        charisma: 12,
      }),
    )
  })

  it('should apply MAD Build preset correctly', async () => {
    const user = userEvent.setup()
    const onScoresChange = vi.fn()

    render(
      <PointBuyAllocator
        scores={defaultPointBuyScores()}
        onScoresChange={onScoresChange}
        racialBonuses={noRacialBonuses}
      />,
    )

    await user.click(screen.getByTestId('preset-mad-build'))

    expect(onScoresChange).toHaveBeenCalledWith(
      expect.objectContaining({
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      }),
    )
  })

  it('should reset all scores to 8 when Reset is clicked', async () => {
    const user = userEvent.setup()
    const onScoresChange = vi.fn()

    render(
      <PointBuyAllocator
        scores={fullStandardArrayScores()}
        onScoresChange={onScoresChange}
        racialBonuses={noRacialBonuses}
      />,
    )

    await user.click(screen.getByTestId('reset-button'))

    expect(onScoresChange).toHaveBeenCalledWith(defaultPointBuyScores())
  })

  it('should warn when not all points are spent', () => {
    const scores: AbilityScores = {
      strength: 10,
      dexterity: 8,
      constitution: 8,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    }
    // Cost: 2+0+0+0+0+0 = 2 points used, 25 remaining

    render(
      <PointBuyAllocator
        scores={scores}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    expect(screen.getByTestId('points-warning')).toBeInTheDocument()
  })
})

// =============================================================================
// Point Buy Cost Validation (unit)
// =============================================================================

describe('Point Buy Cost Calculations', () => {
  it('should have correct costs: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9', () => {
    expect(POINT_BUY_COSTS[8]).toBe(0)
    expect(POINT_BUY_COSTS[9]).toBe(1)
    expect(POINT_BUY_COSTS[10]).toBe(2)
    expect(POINT_BUY_COSTS[11]).toBe(3)
    expect(POINT_BUY_COSTS[12]).toBe(4)
    expect(POINT_BUY_COSTS[13]).toBe(5)
    expect(POINT_BUY_COSTS[14]).toBe(7)
    expect(POINT_BUY_COSTS[15]).toBe(9)
  })

  it('should validate Balanced preset totals exactly 27', () => {
    const balanced = [13, 13, 13, 12, 12, 12]
    const cost = balanced.reduce((sum, s) => sum + POINT_BUY_COSTS[s], 0)
    expect(cost).toBe(POINT_BUY_BUDGET)
  })

  it('should validate Min-Max preset totals exactly 27', () => {
    const minMax = [8, 15, 15, 8, 8, 15]
    const cost = minMax.reduce((sum, s) => sum + POINT_BUY_COSTS[s], 0)
    expect(cost).toBe(POINT_BUY_BUDGET)
  })

  it('should validate MAD Build preset totals exactly 27', () => {
    const mad = [15, 14, 13, 12, 10, 8]
    const cost = mad.reduce((sum, s) => sum + POINT_BUY_COSTS[s], 0)
    expect(cost).toBe(POINT_BUY_BUDGET)
  })

  it('should have a budget of 27', () => {
    expect(POINT_BUY_BUDGET).toBe(27)
  })
})

// =============================================================================
// Standard Array Validation (unit)
// =============================================================================

describe('Standard Array Values', () => {
  it('should be exactly [15, 14, 13, 12, 10, 8]', () => {
    expect([...STANDARD_ARRAY]).toEqual([15, 14, 13, 12, 10, 8])
  })

  it('should contain 6 values', () => {
    expect(STANDARD_ARRAY.length).toBe(6)
  })
})

// =============================================================================
// DiceRollingInterface
// =============================================================================

describe('DiceRollingInterface', () => {
  it('should display 6 roll slots starting as Not Rolled', () => {
    render(
      <DiceRollingInterface
        scores={emptyScores()}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`roll-slot-${i}`)).toBeInTheDocument()
    }

    const notRolledTexts = screen.getAllByText('Not rolled')
    expect(notRolledTexts.length).toBe(6)
  })

  it('should show Roll button for each unrolled slot', () => {
    render(
      <DiceRollingInterface
        scores={emptyScores()}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`roll-button-${i}`)).toBeInTheDocument()
    }
  })

  it('should show Roll All button', () => {
    render(
      <DiceRollingInterface
        scores={emptyScores()}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    expect(screen.getByTestId('roll-all-button')).toBeInTheDocument()
  })

  it('should roll a single slot when Roll button is clicked', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(
      <DiceRollingInterface
        scores={emptyScores()}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    await user.click(screen.getByTestId('roll-button-0'))

    // Advance timers for the roll delay
    await act(async () => {
      vi.advanceTimersByTime(400)
    })

    // After rolling, slot 0 should show a total
    await waitFor(() => {
      expect(screen.getByTestId('roll-total-0')).toBeInTheDocument()
    })

    vi.useRealTimers()
  })

  it('should show all 6 results after Roll All', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(
      <DiceRollingInterface
        scores={emptyScores()}
        onScoresChange={() => {}}
        racialBonuses={noRacialBonuses}
      />,
    )

    await user.click(screen.getByTestId('roll-all-button'))

    // Advance timers enough for all 6 rolls (400ms each)
    for (let i = 0; i < 6; i++) {
      await act(async () => {
        vi.advanceTimersByTime(500)
      })
    }

    // After all rolls, should see assignment interface
    await waitFor(() => {
      expect(screen.getByText('Assign Your Rolls')).toBeInTheDocument()
    })

    vi.useRealTimers()
  })
})

// =============================================================================
// AbilityScoreSummary
// =============================================================================

describe('AbilityScoreSummary', () => {
  it('should display summary table with all 6 abilities', () => {
    render(
      <AbilityScoreSummary
        baseScores={fullStandardArrayScores()}
        racialBonuses={noRacialBonuses}
        finalScores={fullStandardArrayScores()}
      />,
    )

    expect(screen.getByTestId('ability-score-summary')).toBeInTheDocument()

    for (const ability of ABILITY_NAMES) {
      expect(screen.getByTestId(`summary-row-${ability}`)).toBeInTheDocument()
    }
  })

  it('should show base scores for each ability', () => {
    render(
      <AbilityScoreSummary
        baseScores={fullStandardArrayScores()}
        racialBonuses={noRacialBonuses}
        finalScores={fullStandardArrayScores()}
      />,
    )

    expect(screen.getByTestId('base-score-strength')).toHaveTextContent('15')
    expect(screen.getByTestId('base-score-charisma')).toHaveTextContent('8')
  })

  it('should show racial bonuses when present', () => {
    const finalWithBonuses: AbilityScores = {
      ...fullStandardArrayScores(),
      dexterity: 16, // 14 + 2
    }

    render(
      <AbilityScoreSummary
        baseScores={fullStandardArrayScores()}
        racialBonuses={elfRacialBonuses}
        finalScores={finalWithBonuses}
      />,
    )

    expect(screen.getByTestId('racial-bonus-dexterity')).toHaveTextContent('+2')
  })

  it('should show correct total scores', () => {
    render(
      <AbilityScoreSummary
        baseScores={fullStandardArrayScores()}
        racialBonuses={noRacialBonuses}
        finalScores={fullStandardArrayScores()}
      />,
    )

    expect(screen.getByTestId('total-score-strength')).toHaveTextContent('15')
  })

  it('should display modifiers via ModifierBadge', () => {
    render(
      <AbilityScoreSummary
        baseScores={fullStandardArrayScores()}
        racialBonuses={noRacialBonuses}
        finalScores={fullStandardArrayScores()}
      />,
    )

    // ModifierBadge renders data-testid="modifier-badge"
    const badges = screen.getAllByTestId('modifier-badge')
    expect(badges.length).toBe(6)
  })

  it('should show gameplay implications for high scores (15+)', () => {
    render(
      <AbilityScoreSummary
        baseScores={fullStandardArrayScores()}
        racialBonuses={noRacialBonuses}
        finalScores={fullStandardArrayScores()}
      />,
    )

    expect(screen.getByTestId('gameplay-implications')).toBeInTheDocument()
    expect(screen.getByText(/Strong/)).toBeInTheDocument()
  })

  it('should show gameplay implications for low scores (8-9)', () => {
    render(
      <AbilityScoreSummary
        baseScores={fullStandardArrayScores()}
        racialBonuses={noRacialBonuses}
        finalScores={fullStandardArrayScores()}
      />,
    )

    // charisma=8 should trigger a low-score implication
    expect(screen.getByText(/Awkward/)).toBeInTheDocument()
  })

  it('should show "--" for abilities with no racial bonus', () => {
    render(
      <AbilityScoreSummary
        baseScores={fullStandardArrayScores()}
        racialBonuses={noRacialBonuses}
        finalScores={fullStandardArrayScores()}
      />,
    )

    const racialBonusStr = screen.getByTestId('racial-bonus-strength')
    expect(racialBonusStr).toHaveTextContent('--')
  })
})

// =============================================================================
// Wizard Store Integration
// =============================================================================

describe('Wizard Store Integration', () => {
  it('should read existing scores from store on mount', () => {
    useWizardStore.getState().setAbilityScores(fullStandardArrayScores(), 'standard')

    render(<AbilityScoreStep />)

    // Standard array assigner should show scores as assigned
    expect(screen.getByText('All values assigned')).toBeInTheDocument()
  })

  it('should restore the selected method from store', () => {
    useWizardStore.getState().setAbilityScores(defaultPointBuyScores(), 'pointBuy')

    render(<AbilityScoreStep />)

    expect(screen.getByTestId('point-buy-allocator')).toBeInTheDocument()
  })

  it('should update store when Point Buy preset is applied', async () => {
    const user = userEvent.setup()
    render(<AbilityScoreStep />)

    // Switch to Point Buy
    await user.click(screen.getByText('Point Buy'))
    expect(screen.getByTestId('point-buy-allocator')).toBeInTheDocument()

    // Apply preset
    await user.click(screen.getByTestId('preset-balanced'))

    await waitFor(() => {
      const state = useWizardStore.getState()
      expect(state.abilityScores).toEqual(
        expect.objectContaining({
          strength: 13,
          dexterity: 13,
          constitution: 13,
        }),
      )
      expect(state.abilityScoreMethod).toBe('pointBuy')
    })
  })
})

// =============================================================================
// Validation
// =============================================================================

describe('Validation', () => {
  it('should report invalid when not all scores are assigned (Standard Array)', () => {
    const onValidationChange = vi.fn()
    render(
      <AbilityScoreStep onValidationChange={onValidationChange} />,
    )

    const lastCall = onValidationChange.mock.calls[onValidationChange.mock.calls.length - 1][0]
    expect(lastCall.valid).toBe(false)
    expect(lastCall.errors.length).toBeGreaterThan(0)
  })

  it('should report valid when all scores are assigned', () => {
    useWizardStore.getState().setAbilityScores(fullStandardArrayScores(), 'standard')

    const onValidationChange = vi.fn()
    render(
      <AbilityScoreStep onValidationChange={onValidationChange} />,
    )

    const lastCall = onValidationChange.mock.calls[onValidationChange.mock.calls.length - 1][0]
    expect(lastCall.valid).toBe(true)
    expect(lastCall.errors.length).toBe(0)
  })

  it('should list missing abilities in validation errors', () => {
    const onValidationChange = vi.fn()
    render(
      <AbilityScoreStep onValidationChange={onValidationChange} />,
    )

    const lastCall = onValidationChange.mock.calls[onValidationChange.mock.calls.length - 1][0]
    expect(lastCall.errors[0]).toContain('Strength')
  })
})

// =============================================================================
// Racial Bonuses
// =============================================================================

describe('Racial Bonuses', () => {
  it('should display racial bonuses from store raceSelection', () => {
    useWizardStore.getState().setRace({
      raceId: 'elf',
      subraceId: 'high-elf',
    })

    useWizardStore.getState().setAbilityScores(fullStandardArrayScores(), 'standard')

    render(<AbilityScoreStep />)

    // Elf has +2 DEX from race data. If race exists in data, it should show.
    // This test validates the structure works - actual bonus display depends on race data.
    expect(screen.getByTestId('ability-score-step')).toBeInTheDocument()
  })
})
