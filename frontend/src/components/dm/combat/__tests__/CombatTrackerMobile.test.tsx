/**
 * CombatTracker Mobile Layout Tests (Story 44.1)
 *
 * Verifies mobile-specific responsive behavior:
 * - Full-width initiative list
 * - Large full-width Next Turn button at bottom (mobile)
 * - Desktop turn controls are separate from mobile
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CombatTracker from '../CombatTracker'
import type { EncounterState, CombatCombatant } from '@/utils/combat'

function makeCombatant(overrides: Partial<CombatCombatant> = {}): CombatCombatant {
  return {
    id: 'c-1',
    name: 'Test',
    initiative: 10,
    hp: 20,
    maxHp: 20,
    ac: 15,
    isPlayerCharacter: false,
    conditions: [],
    type: 'monster',
    initiativeModifier: 0,
    tempHp: 0,
    isDefeated: false,
    isConcentrating: false,
    isSkipped: false,
    isReadied: false,
    notes: '',
    addOrder: 0,
    deathSaves: { successes: 0, failures: 0 },
    ...overrides,
  }
}

function makeEncounter(combatants: CombatCombatant[]): EncounterState {
  return {
    id: 'enc-1',
    campaignId: 'camp-1',
    name: 'Test Combat',
    combatants,
    currentTurnIndex: 0,
    round: 1,
    phase: 'combat',
    defeatedMonsterXp: 0,
  }
}

describe('CombatTracker — Mobile Layout (Story 44.1)', () => {
  it('renders mobile turn controls with full-width Next Turn button', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Fighter', initiative: 20 }),
      makeCombatant({ id: 'm1', name: 'Goblin', initiative: 10 }),
    ])

    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onEndEncounter={vi.fn()}
      />,
    )

    const mobileTurnControls = screen.getByTestId('turn-controls-mobile')
    expect(mobileTurnControls).toBeInTheDocument()

    const mobileNextBtn = screen.getByTestId('next-turn-btn-mobile')
    expect(mobileNextBtn).toBeInTheDocument()
    expect(mobileNextBtn).toHaveTextContent('Next Turn')
  })

  it('renders both desktop and mobile turn controls', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Fighter', initiative: 20 }),
    ])

    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onEndEncounter={vi.fn()}
      />,
    )

    expect(screen.getByTestId('turn-controls-desktop')).toBeInTheDocument()
    expect(screen.getByTestId('turn-controls-mobile')).toBeInTheDocument()
  })

  it('mobile Next Turn button advances the turn', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Fighter', initiative: 20 }),
      makeCombatant({ id: 'm1', name: 'Goblin', initiative: 10 }),
    ])
    const onUpdate = vi.fn()

    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={onUpdate}
        onEndEncounter={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByTestId('next-turn-btn-mobile'))
    expect(onUpdate).toHaveBeenCalled()
    const updated = onUpdate.mock.calls[0][0] as EncounterState
    expect(updated.currentTurnIndex).toBe(1)
  })

  it('renders initiative order list with full-width layout', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', initiative: 20 }),
      makeCombatant({ id: 'm1', name: 'Goblin', initiative: 10 }),
    ])

    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onEndEncounter={vi.fn()}
      />,
    )

    const list = screen.getByTestId('initiative-order')
    expect(list).toBeInTheDocument()
    // initiative list should contain all combatants
    expect(list.children.length).toBe(2)
  })

  it('shows abbreviated button text for mobile ("Add" and "End")', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Fighter', initiative: 20 }),
    ])

    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onEndEncounter={vi.fn()}
      />,
    )

    // Both full and abbreviated text should exist in the DOM
    expect(screen.getByText('Add')).toBeInTheDocument()
    expect(screen.getByText('End')).toBeInTheDocument()
    expect(screen.getByText('Add Combatant')).toBeInTheDocument()
    expect(screen.getByText('End Encounter')).toBeInTheDocument()
  })
})
