import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RollHistoryList } from '../RollHistoryList'
import { RollHistoryEntry } from '../RollHistoryEntry'
import type { DiceRoll } from '@/stores/diceStore'

function createMockRoll(overrides: Partial<DiceRoll> = {}): DiceRoll {
  return {
    id: '1',
    dice: [{ type: 'd20', count: 1 }],
    results: [15],
    modifier: 3,
    total: 18,
    label: 'Stealth Check',
    timestamp: new Date('2026-01-15T10:30:00'),
    ...overrides,
  }
}

describe('RollHistoryList', () => {
  const defaultProps = {
    rolls: [] as DiceRoll[],
    onReroll: vi.fn(),
    onClear: vi.fn(),
  }

  it('renders the history section', () => {
    render(<RollHistoryList {...defaultProps} />)
    expect(screen.getByTestId('roll-history')).toBeInTheDocument()
  })

  it('shows empty state when no rolls', () => {
    render(<RollHistoryList {...defaultProps} />)
    expect(screen.getByTestId('history-empty')).toBeInTheDocument()
    expect(screen.getByText('No rolls yet')).toBeInTheDocument()
  })

  it('shows roll count in the header', () => {
    const rolls = [createMockRoll(), createMockRoll({ id: '2' })]
    render(<RollHistoryList {...defaultProps} rolls={rolls} />)
    expect(screen.getByTestId('history-count')).toHaveTextContent('(2)')
  })

  it('renders entries for each roll', () => {
    const rolls = [
      createMockRoll({ id: '1' }),
      createMockRoll({ id: '2', total: 10, results: [7] }),
    ]
    render(<RollHistoryList {...defaultProps} rolls={rolls} />)
    const entries = screen.getAllByTestId('roll-history-entry')
    expect(entries).toHaveLength(2)
  })

  it('shows clear button when rolls exist', () => {
    render(<RollHistoryList {...defaultProps} rolls={[createMockRoll()]} />)
    expect(screen.getByTestId('clear-history-btn')).toBeInTheDocument()
  })

  it('does not show clear button when no rolls', () => {
    render(<RollHistoryList {...defaultProps} />)
    expect(screen.queryByTestId('clear-history-btn')).not.toBeInTheDocument()
  })

  it('calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(
      <RollHistoryList {...defaultProps} rolls={[createMockRoll()]} onClear={onClear} />
    )
    await user.click(screen.getByTestId('clear-history-btn'))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('collapses and expands the history list', async () => {
    const user = userEvent.setup()
    render(<RollHistoryList {...defaultProps} rolls={[createMockRoll()]} />)

    // Initially expanded
    expect(screen.getByTestId('history-list')).toBeInTheDocument()

    // Collapse
    await user.click(screen.getByTestId('history-toggle'))
    expect(screen.queryByTestId('history-list')).not.toBeInTheDocument()

    // Expand
    await user.click(screen.getByTestId('history-toggle'))
    expect(screen.getByTestId('history-list')).toBeInTheDocument()
  })
})

describe('RollHistoryEntry', () => {
  it('renders the total', () => {
    const roll = createMockRoll()
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)
    expect(screen.getByTestId('history-total')).toHaveTextContent('18')
  })

  it('renders the label when present', () => {
    const roll = createMockRoll({ label: 'Athletics Check' })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)
    expect(screen.getByTestId('history-label')).toHaveTextContent('Athletics Check')
  })

  it('renders the dice expression', () => {
    const roll = createMockRoll()
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)
    expect(screen.getByTestId('history-expression')).toHaveTextContent('1d20')
  })

  it('renders the individual results', () => {
    const roll = createMockRoll({ results: [15] })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)
    expect(screen.getByTestId('history-results')).toHaveTextContent('[15]')
  })

  it('renders the timestamp', () => {
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

  it('calls onReroll when Enter is pressed', async () => {
    const user = userEvent.setup()
    const onReroll = vi.fn()
    const roll = createMockRoll()
    render(<RollHistoryEntry roll={roll} onReroll={onReroll} />)

    screen.getByTestId('roll-history-entry').focus()
    await user.keyboard('{Enter}')
    expect(onReroll).toHaveBeenCalledWith(roll)
  })

  it('shows advantage badge when advantage is true', () => {
    const roll = createMockRoll({ advantage: true })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)
    expect(screen.getByText('ADV')).toBeInTheDocument()
  })

  it('shows disadvantage badge when disadvantage is true', () => {
    const roll = createMockRoll({ disadvantage: true })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)
    expect(screen.getByText('DIS')).toBeInTheDocument()
  })

  it('applies critical styling for nat 20 rolls', () => {
    const roll = createMockRoll({ results: [20], total: 23 })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)
    const total = screen.getByTestId('history-total')
    expect(total.className).toContain('text-accent-gold')
  })

  it('applies fumble styling for nat 1 rolls', () => {
    const roll = createMockRoll({ results: [1], total: 4 })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)
    const total = screen.getByTestId('history-total')
    expect(total.className).toContain('text-damage-red')
  })

  it('shows modifier in results when non-zero', () => {
    const roll = createMockRoll({ modifier: 5 })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)
    expect(screen.getByTestId('history-results').textContent).toContain('+5')
  })

  it('shows negative modifier correctly', () => {
    const roll = createMockRoll({ modifier: -2 })
    render(<RollHistoryEntry roll={roll} onReroll={vi.fn()} />)
    expect(screen.getByTestId('history-expression').textContent).toContain('- 2')
  })
})
