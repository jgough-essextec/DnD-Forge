/**
 * DiceRollerPanel Tablet Layout Tests (Story 44.2)
 *
 * Verifies tablet-specific responsive behavior:
 * - Side panel at 30% width on tablet
 * - Fixed 320px width on desktop
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DiceRollerPanel } from '@/components/dice/DiceRollerPanel'
import { useUIStore } from '@/stores/uiStore'

// Mock matchMedia for DiceAnimation's prefers-reduced-motion check
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock the dice store
vi.mock('@/stores/diceStore', () => ({
  useDiceStore: vi.fn((selector) => {
    const state = {
      roll: vi.fn().mockReturnValue({ results: [10], total: 10 }),
      rolls: [],
      clearHistory: vi.fn(),
    }
    return selector(state)
  }),
}))

describe('DiceRollerPanel — Tablet Layout (Story 44.2)', () => {
  beforeEach(() => {
    // Reset UI store state
    useUIStore.getState().diceRollerOpen = false
  })

  it('renders the dice roller panel with responsive width classes', () => {
    // Open the dice roller
    useUIStore.setState({ diceRollerOpen: true })

    render(<DiceRollerPanel />)

    const panel = screen.getByTestId('dice-roller-panel')
    // Should have tablet-responsive width classes
    expect(panel.className).toContain('sm:w-[30vw]')
    expect(panel.className).toContain('sm:min-w-[280px]')
    expect(panel.className).toContain('sm:max-w-[380px]')
  })

  it('renders with desktop fixed width override', () => {
    useUIStore.setState({ diceRollerOpen: true })

    render(<DiceRollerPanel />)

    const panel = screen.getByTestId('dice-roller-panel')
    // Desktop override should reset to fixed 320px
    expect(panel.className).toContain('lg:w-80')
  })

  it('has modifier input with inputmode="numeric"', () => {
    useUIStore.setState({ diceRollerOpen: true })

    render(<DiceRollerPanel />)

    const modInput = screen.getByTestId('modifier-input')
    expect(modInput).toHaveAttribute('inputmode', 'numeric')
  })
})
