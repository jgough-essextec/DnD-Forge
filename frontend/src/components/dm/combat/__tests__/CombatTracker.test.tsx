/**
 * CombatTracker Tests (Story 35.3)
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

describe('CombatTracker', () => {
  it('should render combat tracker with round counter', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', initiative: 20, type: 'player' }),
      makeCombatant({ id: 'm1', name: 'Goblin', initiative: 10, type: 'monster' }),
    ])
    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onEndEncounter={vi.fn()}
      />,
    )
    expect(screen.getByText('Round 1')).toBeInTheDocument()
  })

  it('should show combatants sorted by initiative', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'm1', name: 'Goblin', initiative: 10, addOrder: 1 }),
      makeCombatant({ id: 'p1', name: 'Aragorn', initiative: 20, addOrder: 0 }),
    ])
    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onEndEncounter={vi.fn()}
      />,
    )
    const list = screen.getByTestId('initiative-order')
    const cards = list.children
    // Aragorn (20) should be first, Goblin (10) second
    expect(cards[0]).toHaveTextContent('Aragorn')
    expect(cards[1]).toHaveTextContent('Goblin')
  })

  it('should highlight current turn combatant with "CURRENT TURN" label', () => {
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
    expect(screen.getByText('CURRENT TURN')).toBeInTheDocument()
  })

  it('should display turn indicator with combatant name', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', initiative: 20 }),
    ])
    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onEndEncounter={vi.fn()}
      />,
    )
    expect(screen.getByText(/Aragorn's Turn/)).toBeInTheDocument()
  })

  it('should advance turn on "Next Turn" click', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', initiative: 20 }),
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
    fireEvent.click(screen.getByText('Next Turn'))
    expect(onUpdate).toHaveBeenCalled()
    const updated = onUpdate.mock.calls[0][0] as EncounterState
    expect(updated.currentTurnIndex).toBe(1)
  })

  it('should increment round when cycling past last combatant', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', initiative: 20 }),
    ])
    enc.currentTurnIndex = 0
    const onUpdate = vi.fn()
    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={onUpdate}
        onEndEncounter={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Next Turn'))
    expect(onUpdate).toHaveBeenCalled()
    const updated = onUpdate.mock.calls[0][0] as EncounterState
    expect(updated.round).toBe(2)
  })

  it('should go back on "Previous Turn" click', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', initiative: 20 }),
      makeCombatant({ id: 'm1', name: 'Goblin', initiative: 10 }),
    ])
    enc.currentTurnIndex = 1
    const onUpdate = vi.fn()
    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={onUpdate}
        onEndEncounter={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Previous Turn'))
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should show "End Encounter" button', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', initiative: 20 }),
    ])
    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onEndEncounter={vi.fn()}
      />,
    )
    expect(screen.getByText('End Encounter')).toBeInTheDocument()
  })

  it('should call onEndEncounter when End Encounter is clicked', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', initiative: 20 }),
    ])
    const onEnd = vi.fn()
    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onEndEncounter={onEnd}
      />,
    )
    fireEvent.click(screen.getByText('End Encounter'))
    expect(onEnd).toHaveBeenCalled()
  })

  it('should show "Add Combatant" button for mid-combat additions', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', initiative: 20 }),
    ])
    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onEndEncounter={vi.fn()}
      />,
    )
    expect(screen.getByText('Add Combatant')).toBeInTheDocument()
  })

  it('should show encounter name', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', initiative: 20 }),
    ])
    enc.name = 'Goblin Ambush'
    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onEndEncounter={vi.fn()}
      />,
    )
    expect(screen.getByText('Goblin Ambush')).toBeInTheDocument()
  })

  it('should display each combatant with initiative number, name, and AC', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', initiative: 20, ac: 18, type: 'player' }),
    ])
    render(
      <CombatTracker
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onEndEncounter={vi.fn()}
      />,
    )
    expect(screen.getByText('Aragorn')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
  })
})
