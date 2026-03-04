import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiceRollerPanel } from '../DiceRollerPanel'

// Mock matchMedia for jsdom (used by DiceAnimation)
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

// Mock the stores
let mockDiceRollerOpen = false
const mockToggleDiceRoller = vi.fn()
const mockStoreRoll = vi.fn().mockReturnValue({
  id: '1',
  dice: [{ type: 'd20', count: 1 }],
  results: [15],
  modifier: 0,
  total: 15,
  timestamp: new Date(),
})
const mockClearHistory = vi.fn()

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      diceRollerOpen: mockDiceRollerOpen,
      toggleDiceRoller: mockToggleDiceRoller,
    }),
}))

vi.mock('@/stores/diceStore', () => ({
  useDiceStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      roll: mockStoreRoll,
      rolls: [],
      clearHistory: mockClearHistory,
    }),
}))

describe('DiceRollerPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDiceRollerOpen = false
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the FAB button', () => {
    render(<DiceRollerPanel />)
    expect(screen.getByTestId('dice-roller-fab')).toBeInTheDocument()
  })

  it('FAB has correct aria-label when panel is closed', () => {
    mockDiceRollerOpen = false
    render(<DiceRollerPanel />)
    expect(screen.getByLabelText('Open dice roller')).toBeInTheDocument()
  })

  it('FAB has correct aria-label when panel is open', () => {
    mockDiceRollerOpen = true
    render(<DiceRollerPanel />)
    const fab = screen.getByTestId('dice-roller-fab')
    expect(fab).toHaveAttribute('aria-label', 'Close dice roller')
  })

  it('calls toggleDiceRoller when FAB is clicked', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    render(<DiceRollerPanel />)

    await user.click(screen.getByTestId('dice-roller-fab'))
    expect(mockToggleDiceRoller).toHaveBeenCalled()
  })

  it('renders the panel element', () => {
    render(<DiceRollerPanel />)
    expect(screen.getByTestId('dice-roller-panel')).toBeInTheDocument()
  })

  it('panel has dialog role', () => {
    render(<DiceRollerPanel />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders close button', () => {
    render(<DiceRollerPanel />)
    expect(screen.getByTestId('dice-panel-close')).toBeInTheDocument()
  })

  it('calls toggleDiceRoller when close button is clicked', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    render(<DiceRollerPanel />)

    await user.click(screen.getByTestId('dice-panel-close'))
    expect(mockToggleDiceRoller).toHaveBeenCalled()
  })

  it('renders dice buttons for all die types', () => {
    render(<DiceRollerPanel />)
    expect(screen.getByTestId('dice-buttons')).toBeInTheDocument()
    expect(screen.getByTestId('dice-btn-d4')).toBeInTheDocument()
    expect(screen.getByTestId('dice-btn-d6')).toBeInTheDocument()
    expect(screen.getByTestId('dice-btn-d8')).toBeInTheDocument()
    expect(screen.getByTestId('dice-btn-d10')).toBeInTheDocument()
    expect(screen.getByTestId('dice-btn-d12')).toBeInTheDocument()
    expect(screen.getByTestId('dice-btn-d20')).toBeInTheDocument()
    expect(screen.getByTestId('dice-btn-d100')).toBeInTheDocument()
  })

  it('renders modifier controls', () => {
    render(<DiceRollerPanel />)
    expect(screen.getByTestId('modifier-controls')).toBeInTheDocument()
    expect(screen.getByTestId('modifier-input')).toBeInTheDocument()
    expect(screen.getByTestId('mod-increase')).toBeInTheDocument()
    expect(screen.getByTestId('mod-decrease')).toBeInTheDocument()
  })

  it('renders the advantage toggle', () => {
    render(<DiceRollerPanel />)
    expect(screen.getByTestId('advantage-toggle')).toBeInTheDocument()
  })

  it('renders the expression input', () => {
    render(<DiceRollerPanel />)
    expect(screen.getByTestId('expression-input')).toBeInTheDocument()
  })

  it('renders the roll history section', () => {
    render(<DiceRollerPanel />)
    expect(screen.getByTestId('roll-history')).toBeInTheDocument()
  })

  it('renders the dice tray area', () => {
    render(<DiceRollerPanel />)
    expect(screen.getByTestId('dice-tray')).toBeInTheDocument()
  })

  it('renders controls section', () => {
    render(<DiceRollerPanel />)
    expect(screen.getByTestId('dice-controls')).toBeInTheDocument()
  })

  it('closes panel on Escape key press', () => {
    mockDiceRollerOpen = true
    render(<DiceRollerPanel />)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(mockToggleDiceRoller).toHaveBeenCalled()
  })

  it('does not close on Escape when panel is already closed', () => {
    mockDiceRollerOpen = false
    render(<DiceRollerPanel />)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(mockToggleDiceRoller).not.toHaveBeenCalled()
  })
})
