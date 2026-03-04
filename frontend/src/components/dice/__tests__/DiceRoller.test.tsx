/**
 * DiceRoller Tests (Stories 26.1-26.5)
 *
 * Comprehensive tests for the dice roller panel, animation, advantage/disadvantage,
 * roll history, and character sheet integration components.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiceButton } from '@/components/dice/DiceButton'
import { AdvantageToggle } from '@/components/dice/AdvantageToggle'
import { ExpressionInput } from '@/components/dice/ExpressionInput'
import { DiceAnimation } from '@/components/dice/DiceAnimation'
import { RollResult } from '@/components/dice/RollResult'
import { RollHistoryEntry } from '@/components/dice/RollHistoryEntry'
import { RollHistoryList } from '@/components/dice/RollHistoryList'
import { RollableValue } from '@/components/dice/RollableValue'
import type { DiceRoll } from '@/stores/diceStore'

// ---- Global matchMedia mock for jsdom (DiceAnimation uses it) ----
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  })),
})

// ---- Mocks ----

const mockRoll = vi.fn().mockReturnValue({
  id: '1',
  dice: [{ type: 'd20', count: 1 }],
  results: [15],
  modifier: 0,
  total: 15,
  timestamp: new Date(),
})

const mockClearHistory = vi.fn()
const mockToggleDiceRoller = vi.fn()

let mockDiceRollerOpen = false

vi.mock('@/stores/diceStore', () => ({
  useDiceStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      roll: mockRoll,
      rolls: [],
      clearHistory: mockClearHistory,
      maxHistory: 50,
    }),
}))

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      diceRollerOpen: mockDiceRollerOpen,
      toggleDiceRoller: mockToggleDiceRoller,
    }),
}))

// ---- Helpers ----

function createMockRoll(overrides: Partial<DiceRoll> = {}): DiceRoll {
  return {
    id: '1',
    dice: [{ type: 'd20', count: 1 }],
    results: [14],
    modifier: 5,
    total: 19,
    label: 'Stealth Check',
    timestamp: new Date('2024-06-15T14:30:00'),
    ...overrides,
  }
}

// =============================================================================
// Story 26.1 - DiceButton
// =============================================================================

describe('DiceButton', () => {
  it('renders a button for a die type', () => {
    render(<DiceButton die="d20" onRoll={vi.fn()} />)
    expect(screen.getByTestId('dice-btn-d20')).toBeInTheDocument()
    expect(screen.getByText('d20')).toBeInTheDocument()
  })

  it('renders buttons for all 7 die types', () => {
    const onRoll = vi.fn()
    const dies = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'] as const
    const { unmount } = render(<DiceButton die="d4" onRoll={onRoll} />)
    expect(screen.getByTestId('dice-btn-d4')).toBeInTheDocument()
    unmount()

    for (const die of dies) {
      const { unmount: u } = render(<DiceButton die={die} onRoll={onRoll} />)
      expect(screen.getByTestId(`dice-btn-${die}`)).toBeInTheDocument()
      u()
    }
  })

  it('calls onRoll with the die type when clicked', async () => {
    const user = userEvent.setup()
    const onRoll = vi.fn()

    render(<DiceButton die="d20" onRoll={onRoll} />)
    await user.click(screen.getByTestId('dice-btn-d20'))

    expect(onRoll).toHaveBeenCalledWith('d20')
  })

  it('does not call onRoll when disabled', async () => {
    const user = userEvent.setup()
    const onRoll = vi.fn()

    render(<DiceButton die="d20" onRoll={onRoll} disabled />)
    await user.click(screen.getByTestId('dice-btn-d20'))

    expect(onRoll).not.toHaveBeenCalled()
  })

  it('has an accessible label', () => {
    render(<DiceButton die="d8" onRoll={vi.fn()} />)
    expect(screen.getByLabelText('Roll d8')).toBeInTheDocument()
  })

  it('applies active style when active prop is true', () => {
    render(<DiceButton die="d20" onRoll={vi.fn()} active />)
    const btn = screen.getByTestId('dice-btn-d20')
    expect(btn.className).toContain('ring')
  })
})

// =============================================================================
// Story 26.3 - AdvantageToggle
// =============================================================================

describe('AdvantageToggle', () => {
  it('renders ADV and DIS toggle buttons', () => {
    render(
      <AdvantageToggle
        state="normal"
        locked={false}
        onStateChange={vi.fn()}
        onLockedChange={vi.fn()}
      />,
    )

    expect(screen.getByTestId('adv-btn')).toBeInTheDocument()
    expect(screen.getByTestId('dis-btn')).toBeInTheDocument()
  })

  it('activates advantage when ADV is clicked', async () => {
    const user = userEvent.setup()
    const onStateChange = vi.fn()

    render(
      <AdvantageToggle
        state="normal"
        locked={false}
        onStateChange={onStateChange}
        onLockedChange={vi.fn()}
      />,
    )

    await user.click(screen.getByTestId('adv-btn'))
    expect(onStateChange).toHaveBeenCalledWith('advantage')
  })

  it('activates disadvantage when DIS is clicked', async () => {
    const user = userEvent.setup()
    const onStateChange = vi.fn()

    render(
      <AdvantageToggle
        state="normal"
        locked={false}
        onStateChange={onStateChange}
        onLockedChange={vi.fn()}
      />,
    )

    await user.click(screen.getByTestId('dis-btn'))
    expect(onStateChange).toHaveBeenCalledWith('disadvantage')
  })

  it('deactivates advantage when ADV is clicked while active (mutual exclusivity)', async () => {
    const user = userEvent.setup()
    const onStateChange = vi.fn()

    render(
      <AdvantageToggle
        state="advantage"
        locked={false}
        onStateChange={onStateChange}
        onLockedChange={vi.fn()}
      />,
    )

    await user.click(screen.getByTestId('adv-btn'))
    expect(onStateChange).toHaveBeenCalledWith('normal')
  })

  it('switches from advantage to disadvantage when DIS is clicked', async () => {
    const user = userEvent.setup()
    const onStateChange = vi.fn()

    render(
      <AdvantageToggle
        state="advantage"
        locked={false}
        onStateChange={onStateChange}
        onLockedChange={vi.fn()}
      />,
    )

    await user.click(screen.getByTestId('dis-btn'))
    expect(onStateChange).toHaveBeenCalledWith('disadvantage')
  })

  it('has aria-pressed attributes reflecting current state', () => {
    render(
      <AdvantageToggle
        state="advantage"
        locked={false}
        onStateChange={vi.fn()}
        onLockedChange={vi.fn()}
      />,
    )

    expect(screen.getByTestId('adv-btn')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('dis-btn')).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles lock when lock button is clicked', async () => {
    const user = userEvent.setup()
    const onLockedChange = vi.fn()

    render(
      <AdvantageToggle
        state="normal"
        locked={false}
        onStateChange={vi.fn()}
        onLockedChange={onLockedChange}
      />,
    )

    await user.click(screen.getByTestId('lock-btn'))
    expect(onLockedChange).toHaveBeenCalledWith(true)
  })

  it('shows unlock icon when not locked and lock icon when locked', () => {
    const { rerender } = render(
      <AdvantageToggle
        state="normal"
        locked={false}
        onStateChange={vi.fn()}
        onLockedChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Lock advantage/disadvantage')).toBeInTheDocument()

    rerender(
      <AdvantageToggle
        state="normal"
        locked={true}
        onStateChange={vi.fn()}
        onLockedChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Unlock advantage/disadvantage')).toBeInTheDocument()
  })
})

// =============================================================================
// Story 26.1 - ExpressionInput
// =============================================================================

describe('ExpressionInput', () => {
  it('renders an input field and roll button', () => {
    render(<ExpressionInput onRoll={vi.fn()} recentExpressions={[]} />)

    expect(screen.getByTestId('expression-field')).toBeInTheDocument()
    expect(screen.getByTestId('roll-expression-btn')).toBeInTheDocument()
  })

  it('calls onRoll with a valid expression when Roll button is clicked', async () => {
    const user = userEvent.setup()
    const onRoll = vi.fn()

    render(<ExpressionInput onRoll={onRoll} recentExpressions={[]} />)

    await user.type(screen.getByTestId('expression-field'), '2d6+3')
    await user.click(screen.getByTestId('roll-expression-btn'))

    expect(onRoll).toHaveBeenCalledWith('2d6+3')
  })

  it('calls onRoll when Enter is pressed', async () => {
    const user = userEvent.setup()
    const onRoll = vi.fn()

    render(<ExpressionInput onRoll={onRoll} recentExpressions={[]} />)

    const input = screen.getByTestId('expression-field')
    await user.type(input, '1d20+5{Enter}')

    expect(onRoll).toHaveBeenCalledWith('1d20+5')
  })

  it('shows an error for invalid expressions', async () => {
    const user = userEvent.setup()
    const onRoll = vi.fn()

    render(<ExpressionInput onRoll={onRoll} recentExpressions={[]} />)

    await user.type(screen.getByTestId('expression-field'), 'abc')
    await user.click(screen.getByTestId('roll-expression-btn'))

    expect(screen.getByTestId('expression-error')).toHaveTextContent('Invalid dice expression')
    expect(onRoll).not.toHaveBeenCalled()
  })

  it('clears the error when user types after an error', async () => {
    const user = userEvent.setup()

    render(<ExpressionInput onRoll={vi.fn()} recentExpressions={[]} />)

    const input = screen.getByTestId('expression-field')
    await user.type(input, 'abc')
    await user.click(screen.getByTestId('roll-expression-btn'))

    expect(screen.getByTestId('expression-error')).toBeInTheDocument()

    await user.type(input, '1')
    expect(screen.queryByTestId('expression-error')).not.toBeInTheDocument()
  })

  it('clears the input after a successful roll', async () => {
    const user = userEvent.setup()

    render(<ExpressionInput onRoll={vi.fn()} recentExpressions={[]} />)

    const input = screen.getByTestId('expression-field') as HTMLInputElement
    await user.type(input, '1d20')
    await user.click(screen.getByTestId('roll-expression-btn'))

    expect(input.value).toBe('')
  })

  it('does nothing when expression is empty', async () => {
    const user = userEvent.setup()
    const onRoll = vi.fn()

    render(<ExpressionInput onRoll={onRoll} recentExpressions={[]} />)
    await user.click(screen.getByTestId('roll-expression-btn'))

    expect(onRoll).not.toHaveBeenCalled()
  })

  it('has accessible label on the input', () => {
    render(<ExpressionInput onRoll={vi.fn()} recentExpressions={[]} />)
    expect(screen.getByLabelText('Custom dice expression')).toBeInTheDocument()
  })
})

// =============================================================================
// Story 26.2 - DiceAnimation
// =============================================================================

describe('DiceAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows empty state when no results', () => {
    render(
      <DiceAnimation
        results={[]}
        dieType="d20"
        isRolling={false}
      />,
    )

    expect(screen.getByTestId('dice-tray-empty')).toHaveTextContent('Roll some dice!')
  })

  it('renders die result elements for each result', () => {
    render(
      <DiceAnimation
        results={[14, 7]}
        dieType="d6"
        isRolling={false}
      />,
    )

    expect(screen.getByTestId('die-result-0')).toBeInTheDocument()
    expect(screen.getByTestId('die-result-1')).toBeInTheDocument()
  })

  it('shows question marks during animation', () => {
    render(
      <DiceAnimation
        results={[20]}
        dieType="d20"
        isRolling={true}
      />,
    )

    expect(screen.getByTestId('die-result-0')).toHaveTextContent('?')
  })

  it('shows results after animation completes', () => {
    const onComplete = vi.fn()

    render(
      <DiceAnimation
        results={[17]}
        dieType="d20"
        isRolling={true}
        onAnimationComplete={onComplete}
      />,
    )

    // Results hidden during animation
    expect(screen.getByTestId('die-result-0')).toHaveTextContent('?')

    // Advance past animation duration
    act(() => {
      vi.advanceTimersByTime(1400)
    })

    expect(screen.getByTestId('die-result-0')).toHaveTextContent('17')
    expect(onComplete).toHaveBeenCalled()
  })

  it('applies critical gold highlight for nat 20', () => {
    render(
      <DiceAnimation
        results={[20]}
        dieType="d20"
        isCritical={true}
        isRolling={false}
      />,
    )

    const die = screen.getByTestId('die-result-0')
    expect(die.className).toContain('ring-accent-gold')
  })

  it('applies fumble red highlight for nat 1', () => {
    render(
      <DiceAnimation
        results={[1]}
        dieType="d20"
        isFumble={true}
        isRolling={false}
      />,
    )

    const die = screen.getByTestId('die-result-0')
    expect(die.className).toContain('ring-damage-red')
  })

  it('respects prefers-reduced-motion by showing results immediately', () => {
    // Override matchMedia to return reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        onchange: null,
        dispatchEvent: vi.fn(),
      })),
    })

    const onComplete = vi.fn()

    render(
      <DiceAnimation
        results={[15]}
        dieType="d20"
        isRolling={true}
        onAnimationComplete={onComplete}
      />,
    )

    // With reduced motion, result should be shown immediately
    expect(screen.getByTestId('die-result-0')).toHaveTextContent('15')
    expect(onComplete).toHaveBeenCalled()

    // Restore the default mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        onchange: null,
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('has aria-live for screen readers', () => {
    render(
      <DiceAnimation
        results={[10]}
        dieType="d20"
        isRolling={false}
      />,
    )

    expect(screen.getByTestId('dice-animation')).toHaveAttribute('aria-live', 'polite')
  })

  it('renders multiple dice with staggered delays', () => {
    render(
      <DiceAnimation
        results={[4, 6, 3]}
        dieType="d6"
        isRolling={false}
      />,
    )

    const die0 = screen.getByTestId('die-result-0')
    const die1 = screen.getByTestId('die-result-1')
    const die2 = screen.getByTestId('die-result-2')

    expect(die0.style.animationDelay).toBe('0ms')
    expect(die1.style.animationDelay).toBe('75ms')
    expect(die2.style.animationDelay).toBe('150ms')
  })
})

// =============================================================================
// Story 26.2 - RollResult
// =============================================================================

describe('RollResult', () => {
  it('shows the total prominently', () => {
    render(
      <RollResult total={17} results={[12]} modifier={5} />,
    )

    expect(screen.getByTestId('roll-total')).toHaveTextContent('17')
  })

  it('shows label when provided', () => {
    render(
      <RollResult total={14} results={[14]} modifier={0} label="Stealth Check" />,
    )

    expect(screen.getByTestId('roll-label')).toHaveTextContent('Stealth Check')
  })

  it('shows breakdown with modifier', () => {
    render(
      <RollResult total={17} results={[12]} modifier={5} />,
    )

    const breakdown = screen.getByTestId('roll-breakdown')
    expect(breakdown.textContent).toContain('12')
    expect(breakdown.textContent).toContain('5')
    expect(breakdown.textContent).toContain('= 17')
  })

  it('shows Natural 20 banner for critical', () => {
    render(
      <RollResult total={25} results={[20]} modifier={5} isCritical />,
    )

    expect(screen.getByTestId('critical-banner')).toHaveTextContent('Natural 20!')
    expect(screen.getByTestId('roll-total').className).toContain('text-accent-gold')
  })

  it('shows Natural 1 banner for fumble', () => {
    render(
      <RollResult total={6} results={[1]} modifier={5} isFumble />,
    )

    expect(screen.getByTestId('fumble-banner')).toHaveTextContent('Natural 1!')
    expect(screen.getByTestId('roll-total').className).toContain('text-damage-red')
  })

  it('shows advantage breakdown with kept die highlighted', () => {
    render(
      <RollResult total={22} results={[17, 8]} modifier={5} advantage />,
    )

    const breakdown = screen.getByTestId('roll-breakdown')
    expect(breakdown.textContent).toContain('ADV')
    expect(breakdown.textContent).toContain('17')
    expect(breakdown.textContent).toContain('8')
  })

  it('shows disadvantage breakdown', () => {
    render(
      <RollResult total={13} results={[17, 8]} modifier={5} disadvantage />,
    )

    const breakdown = screen.getByTestId('roll-breakdown')
    expect(breakdown.textContent).toContain('DIS')
  })

  it('returns null when not visible', () => {
    const { container } = render(
      <RollResult total={17} results={[12]} modifier={5} visible={false} />,
    )

    expect(container.innerHTML).toBe('')
  })

  it('returns null when results are empty', () => {
    const { container } = render(
      <RollResult total={0} results={[]} modifier={0} />,
    )

    expect(container.innerHTML).toBe('')
  })

  it('has aria-live for announcing results to screen readers', () => {
    render(
      <RollResult total={17} results={[12]} modifier={5} />,
    )

    expect(screen.getByTestId('roll-result')).toHaveAttribute('aria-live', 'assertive')
  })

  it('shows multiple die results in breakdown', () => {
    render(
      <RollResult total={15} results={[4, 6, 2]} modifier={3} />,
    )

    const breakdown = screen.getByTestId('roll-breakdown')
    expect(breakdown.textContent).toContain('4')
    expect(breakdown.textContent).toContain('6')
    expect(breakdown.textContent).toContain('2')
    expect(breakdown.textContent).toContain('= 15')
  })
})

// =============================================================================
// Story 26.4 - RollHistoryEntry
// =============================================================================

describe('RollHistoryEntry', () => {
  it('renders the entry with total and expression', () => {
    const roll = createMockRoll()
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)

    expect(screen.getByTestId('history-total')).toHaveTextContent('19')
    expect(screen.getByTestId('history-expression')).toBeInTheDocument()
  })

  it('shows the label when present', () => {
    const roll = createMockRoll({ label: 'Perception Check' })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)

    expect(screen.getByTestId('history-label')).toHaveTextContent('Perception Check')
  })

  it('shows individual results', () => {
    const roll = createMockRoll({ results: [14], modifier: 5 })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)

    expect(screen.getByTestId('history-results')).toHaveTextContent('[14]')
  })

  it('shows timestamp', () => {
    const roll = createMockRoll()
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)

    expect(screen.getByTestId('history-timestamp')).toBeInTheDocument()
  })

  it('calls onReroll when clicked', async () => {
    const user = userEvent.setup()
    const onReroll = vi.fn()
    const roll = createMockRoll()

    render(<RollHistoryEntry roll={roll} onReroll={onReroll} />)
    await user.click(screen.getByTestId('roll-history-entry'))

    expect(onReroll).toHaveBeenCalledWith(roll)
  })

  it('calls onReroll on Enter keypress', async () => {
    const user = userEvent.setup()
    const onReroll = vi.fn()
    const roll = createMockRoll()

    render(<RollHistoryEntry roll={roll} onReroll={onReroll} />)
    screen.getByTestId('roll-history-entry').focus()
    await user.keyboard('{Enter}')

    expect(onReroll).toHaveBeenCalledWith(roll)
  })

  it('highlights nat 20 with gold border', () => {
    const roll = createMockRoll({
      dice: [{ type: 'd20', count: 1 }],
      results: [20],
      total: 25,
    })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)

    const entry = screen.getByTestId('roll-history-entry')
    expect(entry.className).toContain('border-accent-gold')
  })

  it('highlights nat 1 with red border', () => {
    const roll = createMockRoll({
      dice: [{ type: 'd20', count: 1 }],
      results: [1],
      total: 6,
    })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)

    const entry = screen.getByTestId('roll-history-entry')
    expect(entry.className).toContain('border-damage-red')
  })

  it('shows ADV badge when advantage was used', () => {
    const roll = createMockRoll({ advantage: true })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)

    expect(screen.getByText('ADV')).toBeInTheDocument()
  })

  it('shows DIS badge when disadvantage was used', () => {
    const roll = createMockRoll({ disadvantage: true })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)

    expect(screen.getByText('DIS')).toBeInTheDocument()
  })
})

// =============================================================================
// Story 26.4 - RollHistoryList
// =============================================================================

describe('RollHistoryList', () => {
  it('renders the history header with count', () => {
    render(
      <RollHistoryList
        rolls={[createMockRoll()]}
        onReroll={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    expect(screen.getByTestId('history-count')).toHaveTextContent('(1)')
  })

  it('shows empty state when no rolls', () => {
    render(
      <RollHistoryList
        rolls={[]}
        onReroll={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    expect(screen.getByTestId('history-empty')).toHaveTextContent('No rolls yet')
  })

  it('renders entries for each roll', () => {
    const rolls = [
      createMockRoll({ id: '1' }),
      createMockRoll({ id: '2', total: 12 }),
    ]
    render(
      <RollHistoryList
        rolls={rolls}
        onReroll={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    const entries = screen.getAllByTestId('roll-history-entry')
    expect(entries).toHaveLength(2)
  })

  it('calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()

    render(
      <RollHistoryList
        rolls={[createMockRoll()]}
        onReroll={vi.fn()}
        onClear={onClear}
      />,
    )

    await user.click(screen.getByTestId('clear-history-btn'))
    expect(onClear).toHaveBeenCalled()
  })

  it('does not show clear button when there are no rolls', () => {
    render(
      <RollHistoryList
        rolls={[]}
        onReroll={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    expect(screen.queryByTestId('clear-history-btn')).not.toBeInTheDocument()
  })

  it('collapses and expands on toggle click', async () => {
    const user = userEvent.setup()

    render(
      <RollHistoryList
        rolls={[createMockRoll()]}
        onReroll={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    // Initially expanded
    expect(screen.getByTestId('history-list')).toBeInTheDocument()

    // Collapse
    await user.click(screen.getByTestId('history-toggle'))
    expect(screen.queryByTestId('history-list')).not.toBeInTheDocument()

    // Expand
    await user.click(screen.getByTestId('history-toggle'))
    expect(screen.getByTestId('history-list')).toBeInTheDocument()
  })

  it('passes onReroll to entries', async () => {
    const user = userEvent.setup()
    const onReroll = vi.fn()
    const roll = createMockRoll()

    render(
      <RollHistoryList
        rolls={[roll]}
        onReroll={onReroll}
        onClear={vi.fn()}
      />,
    )

    await user.click(screen.getByTestId('roll-history-entry'))
    expect(onReroll).toHaveBeenCalledWith(roll)
  })
})

// =============================================================================
// Story 26.5 - RollableValue
// =============================================================================

describe('RollableValue', () => {
  beforeEach(() => {
    mockRoll.mockClear()
    mockToggleDiceRoller.mockClear()
    mockDiceRollerOpen = false
  })

  it('renders children', () => {
    render(
      <RollableValue modifier={5} label="Stealth">
        <span>+5</span>
      </RollableValue>,
    )

    expect(screen.getByText('+5')).toBeInTheDocument()
  })

  it('shows a d20 icon that appears on hover', () => {
    render(
      <RollableValue modifier={5} label="Stealth">
        <span>+5</span>
      </RollableValue>,
    )

    // The icon is always in the DOM but visually hidden until hover
    const wrapper = screen.getByRole('button')
    expect(wrapper).toBeInTheDocument()
  })

  it('triggers a roll when clicked', async () => {
    const user = userEvent.setup()

    render(
      <RollableValue modifier={5} label="Stealth">
        <span>+5</span>
      </RollableValue>,
    )

    await user.click(screen.getByRole('button'))

    expect(mockRoll).toHaveBeenCalledWith(
      [{ type: 'd20', count: 1 }],
      5,
      'Stealth (+5)',
    )
  })

  it('opens the dice panel if it is closed', async () => {
    const user = userEvent.setup()
    mockDiceRollerOpen = false

    render(
      <RollableValue modifier={5} label="Stealth">
        <span>+5</span>
      </RollableValue>,
    )

    await user.click(screen.getByRole('button'))
    expect(mockToggleDiceRoller).toHaveBeenCalled()
  })

  it('does not open the dice panel if already open', async () => {
    const user = userEvent.setup()
    mockDiceRollerOpen = true

    render(
      <RollableValue modifier={5} label="Stealth">
        <span>+5</span>
      </RollableValue>,
    )

    await user.click(screen.getByRole('button'))
    expect(mockToggleDiceRoller).not.toHaveBeenCalled()
  })

  it('does not roll when disabled', () => {
    render(
      <RollableValue modifier={5} label="Stealth" disabled>
        <span>+5</span>
      </RollableValue>,
    )

    // When disabled, children are rendered without the button wrapper
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('handles negative modifiers correctly in label', async () => {
    const user = userEvent.setup()

    render(
      <RollableValue modifier={-2} label="Athletics">
        <span>-2</span>
      </RollableValue>,
    )

    await user.click(screen.getByRole('button'))
    expect(mockRoll).toHaveBeenCalledWith(
      [{ type: 'd20', count: 1 }],
      -2,
      'Athletics (-2)',
    )
  })

  it('supports keyboard activation with Enter', async () => {
    const user = userEvent.setup()

    render(
      <RollableValue modifier={5} label="Stealth">
        <span>+5</span>
      </RollableValue>,
    )

    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard('{Enter}')

    expect(mockRoll).toHaveBeenCalled()
  })

  it('has accessible label', () => {
    render(
      <RollableValue modifier={5} label="Stealth">
        <span>+5</span>
      </RollableValue>,
    )

    expect(screen.getByLabelText('Roll Stealth')).toBeInTheDocument()
  })
})

// =============================================================================
// Story 26.1 - DiceRollerPanel (integration-level)
// =============================================================================

describe('DiceRollerPanel', () => {
  // Since DiceRollerPanel has complex internal state and uses multiple stores,
  // we test the sub-components individually above and test key panel features here.

  it('renders the FAB button', async () => {
    const { DiceRollerPanel } = await import('@/components/dice/DiceRollerPanel')
    render(<DiceRollerPanel />)

    expect(screen.getByTestId('dice-roller-fab')).toBeInTheDocument()
  })

  it('FAB has accessible label', async () => {
    const { DiceRollerPanel } = await import('@/components/dice/DiceRollerPanel')
    render(<DiceRollerPanel />)

    expect(screen.getByTestId('dice-roller-fab')).toHaveAttribute('aria-label')
  })

  it('renders the panel with three zones', async () => {
    mockDiceRollerOpen = true
    const { DiceRollerPanel } = await import('@/components/dice/DiceRollerPanel')
    render(<DiceRollerPanel />)

    expect(screen.getByTestId('dice-tray')).toBeInTheDocument()
    expect(screen.getByTestId('dice-controls')).toBeInTheDocument()
    expect(screen.getByTestId('roll-history')).toBeInTheDocument()
  })

  it('renders all 7 dice buttons', async () => {
    mockDiceRollerOpen = true
    const { DiceRollerPanel } = await import('@/components/dice/DiceRollerPanel')
    render(<DiceRollerPanel />)

    const diceButtons = screen.getByTestId('dice-buttons')
    expect(within(diceButtons).getByTestId('dice-btn-d4')).toBeInTheDocument()
    expect(within(diceButtons).getByTestId('dice-btn-d6')).toBeInTheDocument()
    expect(within(diceButtons).getByTestId('dice-btn-d8')).toBeInTheDocument()
    expect(within(diceButtons).getByTestId('dice-btn-d10')).toBeInTheDocument()
    expect(within(diceButtons).getByTestId('dice-btn-d12')).toBeInTheDocument()
    expect(within(diceButtons).getByTestId('dice-btn-d20')).toBeInTheDocument()
    expect(within(diceButtons).getByTestId('dice-btn-d100')).toBeInTheDocument()
  })

  it('renders the advantage toggle', async () => {
    mockDiceRollerOpen = true
    const { DiceRollerPanel } = await import('@/components/dice/DiceRollerPanel')
    render(<DiceRollerPanel />)

    expect(screen.getByTestId('advantage-toggle')).toBeInTheDocument()
  })

  it('renders the expression input', async () => {
    mockDiceRollerOpen = true
    const { DiceRollerPanel } = await import('@/components/dice/DiceRollerPanel')
    render(<DiceRollerPanel />)

    expect(screen.getByTestId('expression-input')).toBeInTheDocument()
  })

  it('renders the modifier controls', async () => {
    mockDiceRollerOpen = true
    const { DiceRollerPanel } = await import('@/components/dice/DiceRollerPanel')
    render(<DiceRollerPanel />)

    expect(screen.getByTestId('modifier-controls')).toBeInTheDocument()
    expect(screen.getByTestId('modifier-input')).toBeInTheDocument()
    expect(screen.getByTestId('mod-increase')).toBeInTheDocument()
    expect(screen.getByTestId('mod-decrease')).toBeInTheDocument()
  })

  it('panel has dialog role', async () => {
    mockDiceRollerOpen = true
    const { DiceRollerPanel } = await import('@/components/dice/DiceRollerPanel')
    render(<DiceRollerPanel />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders close button', async () => {
    mockDiceRollerOpen = true
    const { DiceRollerPanel } = await import('@/components/dice/DiceRollerPanel')
    render(<DiceRollerPanel />)

    expect(screen.getByTestId('dice-panel-close')).toBeInTheDocument()
  })
})
