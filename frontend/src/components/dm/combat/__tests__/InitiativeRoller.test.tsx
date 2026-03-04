/**
 * InitiativeRoller Tests (Story 35.2)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import InitiativeRoller from '../InitiativeRoller'
import type { EncounterState, CombatCombatant } from '@/utils/combat'

function makeCombatant(overrides: Partial<CombatCombatant> = {}): CombatCombatant {
  return {
    id: 'c-1',
    name: 'Test',
    initiative: 0,
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
    name: 'Test Encounter',
    combatants,
    currentTurnIndex: 0,
    round: 1,
    phase: 'initiative',
    defeatedMonsterXp: 0,
  }
}

describe('InitiativeRoller', () => {
  it('should render initiative roller screen with all combatants', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', type: 'player' }),
      makeCombatant({ id: 'm1', name: 'Goblin', type: 'monster' }),
    ])
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByText('Roll Initiative')).toBeInTheDocument()
    expect(screen.getByText('Aragorn')).toBeInTheDocument()
    expect(screen.getByText('Goblin')).toBeInTheDocument()
  })

  it('should render editable initiative fields for each combatant', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn' }),
    ])
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    const input = screen.getByLabelText('Initiative for Aragorn')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'number')
  })

  it('should show "Roll All" button', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Test' }),
    ])
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByText('Roll All')).toBeInTheDocument()
  })

  it('should roll all initiatives when "Roll All" is clicked', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', initiativeModifier: 2 }),
      makeCombatant({ id: 'm1', name: 'Goblin', initiativeModifier: 1 }),
    ])
    const onUpdate = vi.fn()
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={onUpdate}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Roll All'))
    expect(onUpdate).toHaveBeenCalled()
    const updated = onUpdate.mock.calls[0][0] as EncounterState
    // All combatants should have initiative > 0 after roll
    for (const c of updated.combatants) {
      expect(c.initiative).toBeGreaterThan(0)
    }
  })

  it('should accept manual override of initiative value', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn' }),
    ])
    const onUpdate = vi.fn()
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={onUpdate}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    const input = screen.getByLabelText('Initiative for Aragorn')
    fireEvent.change(input, { target: { value: '18' } })
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should disable "Confirm Order" when not all combatants have initiative', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', initiative: 0 }),
    ])
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    const button = screen.getByText('Confirm Order & Begin Combat')
    expect(button).toBeDisabled()
  })

  it('should enable "Confirm Order" when all combatants have initiative', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', initiative: 15 }),
      makeCombatant({ id: 'm1', name: 'Goblin', initiative: 10 }),
    ])
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    const button = screen.getByText('Confirm Order & Begin Combat')
    expect(button).not.toBeDisabled()
  })

  it('should call onConfirmOrder when confirm button is clicked', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', initiative: 15 }),
      makeCombatant({ id: 'm1', initiative: 10 }),
    ])
    const onConfirm = vi.fn()
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onConfirmOrder={onConfirm}
        onBack={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Confirm Order & Begin Combat'))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('should show "Tie" indicator on tied combatants', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', initiative: 15 }),
      makeCombatant({ id: 'm1', name: 'Goblin', initiative: 15 }),
    ])
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    const ties = screen.getAllByText('Tie')
    expect(ties.length).toBe(2)
  })

  it('should show initiative order preview when rolls are made', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', initiative: 20 }),
      makeCombatant({ id: 'm1', name: 'Goblin', initiative: 10 }),
    ])
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByText('Initiative Order Preview')).toBeInTheDocument()
  })

  it('should show auto-roll monsters toggle', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Player', type: 'player' }),
    ])
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByText('Auto-roll monsters, manual for players')).toBeInTheDocument()
  })

  it('should show "Roll Monsters" when auto-roll toggle is enabled', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Player', type: 'player' }),
      makeCombatant({ id: 'm1', name: 'Goblin', type: 'monster' }),
    ])
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    // The checkbox is the input inside the label
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(screen.getByText('Roll Monsters')).toBeInTheDocument()
  })

  it('should show individual Roll buttons for each combatant', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', type: 'player' }),
      makeCombatant({ id: 'm1', name: 'Goblin', type: 'monster' }),
    ])
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    const rollButtons = screen.getAllByText('Roll')
    expect(rollButtons.length).toBe(2)
  })

  it('should roll initiative for individual combatant on Roll click', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', name: 'Aragorn', type: 'player', initiativeModifier: 2 }),
    ])
    const onUpdate = vi.fn()
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={onUpdate}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Roll'))
    expect(onUpdate).toHaveBeenCalled()
  })

  it('should show Back to Setup button', () => {
    const enc = makeEncounter([])
    const onBack = vi.fn()
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onConfirmOrder={vi.fn()}
        onBack={onBack}
      />,
    )
    fireEvent.click(screen.getByText('Back to Setup'))
    expect(onBack).toHaveBeenCalled()
  })

  it('should not show Roll button for lair action combatants', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'l1', name: 'Lair Action', type: 'lair', initiative: 20 }),
    ])
    render(
      <InitiativeRoller
        encounter={enc}
        onUpdateEncounter={vi.fn()}
        onConfirmOrder={vi.fn()}
        onBack={vi.fn()}
      />,
    )
    expect(screen.queryByText('Roll')).not.toBeInTheDocument()
  })
})
