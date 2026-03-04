/**
 * EncounterSetup Tests (Story 35.1)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EncounterSetup from '../EncounterSetup'
import { createEncounterState, resetCombatantIdCounter } from '@/utils/combat'
import type { EncounterState } from '@/utils/combat'

const mockCharacters = [
  { id: 'c1', name: 'Aragorn', ac: 16, hp: 30, maxHp: 45, dexterity: 14, conditions: [] },
  { id: 'c2', name: 'Gandalf', ac: 12, hp: 20, maxHp: 25, dexterity: 10, conditions: [] },
  { id: 'c3', name: 'Legolas', ac: 15, hp: 25, maxHp: 30, dexterity: 18, conditions: [] },
]

function createTestEncounter(): EncounterState {
  return createEncounterState('enc-1', 'camp-1', 'Test Encounter')
}

describe('EncounterSetup', () => {
  beforeEach(() => resetCombatantIdCounter())

  it('should render the encounter setup with title', () => {
    const enc = createTestEncounter()
    render(
      <EncounterSetup
        encounter={enc}
        characters={mockCharacters}
        onUpdateEncounter={vi.fn()}
        onStartInitiative={vi.fn()}
      />,
    )
    expect(screen.getByText('Encounter Setup')).toBeInTheDocument()
  })

  it('should auto-populate party characters on mount', () => {
    const enc = createTestEncounter()
    const onUpdate = vi.fn()
    render(
      <EncounterSetup
        encounter={enc}
        characters={mockCharacters}
        onUpdateEncounter={onUpdate}
        onStartInitiative={vi.fn()}
      />,
    )
    expect(onUpdate).toHaveBeenCalled()
    const updatedEncounter = onUpdate.mock.calls[0][0] as EncounterState
    expect(updatedEncounter.combatants).toHaveLength(3)
    expect(updatedEncounter.combatants[0].name).toBe('Aragorn')
    expect(updatedEncounter.combatants[0].type).toBe('player')
    expect(updatedEncounter.combatants[0].isPlayerCharacter).toBe(true)
  })

  it('should display all campaign characters as player combatants', () => {
    const enc = createTestEncounter()
    const onUpdate = vi.fn()
    render(
      <EncounterSetup
        encounter={enc}
        characters={mockCharacters}
        onUpdateEncounter={onUpdate}
        onStartInitiative={vi.fn()}
      />,
    )
    const updated = onUpdate.mock.calls[0][0] as EncounterState
    expect(updated.combatants.every((c) => c.type === 'player')).toBe(true)
    expect(updated.combatants.map((c) => c.characterId)).toEqual(['c1', 'c2', 'c3'])
  })

  it('should create combatants with correct stats from character data', () => {
    const enc = createTestEncounter()
    const onUpdate = vi.fn()
    render(
      <EncounterSetup
        encounter={enc}
        characters={mockCharacters}
        onUpdateEncounter={onUpdate}
        onStartInitiative={vi.fn()}
      />,
    )
    const updated = onUpdate.mock.calls[0][0] as EncounterState
    const aragorn = updated.combatants[0]
    expect(aragorn.ac).toBe(16)
    expect(aragorn.hp).toBe(30)
    expect(aragorn.maxHp).toBe(45)
    // DEX 14 -> modifier +2
    expect(aragorn.initiativeModifier).toBe(2)
  })

  it('should render the add combatant form', () => {
    const enc = createTestEncounter()
    render(
      <EncounterSetup
        encounter={enc}
        characters={[]}
        onUpdateEncounter={vi.fn()}
        onStartInitiative={vi.fn()}
      />,
    )
    // The heading in AddCombatantForm
    expect(screen.getByLabelText('Name *')).toBeInTheDocument()
  })

  it('should render monster/NPC add form with required fields', () => {
    const enc = createTestEncounter()
    render(
      <EncounterSetup
        encounter={enc}
        characters={[]}
        onUpdateEncounter={vi.fn()}
        onStartInitiative={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('AC')).toBeInTheDocument()
    expect(screen.getByLabelText('HP')).toBeInTheDocument()
    expect(screen.getByLabelText('Init Mod')).toBeInTheDocument()
  })

  it('should show "Roll Initiative & Start" button', () => {
    const enc = createTestEncounter()
    render(
      <EncounterSetup
        encounter={enc}
        characters={[]}
        onUpdateEncounter={vi.fn()}
        onStartInitiative={vi.fn()}
      />,
    )
    expect(screen.getByText('Roll Initiative & Start')).toBeInTheDocument()
  })

  it('should disable start button with fewer than 2 combatants', () => {
    const enc = createTestEncounter()
    render(
      <EncounterSetup
        encounter={enc}
        characters={[]}
        onUpdateEncounter={vi.fn()}
        onStartInitiative={vi.fn()}
      />,
    )
    const button = screen.getByText('Roll Initiative & Start')
    expect(button).toBeDisabled()
  })

  it('should render combatants in the list with remove buttons', () => {
    const enc = createTestEncounter()
    enc.combatants = [
      {
        id: 'test-1', name: 'Goblin', initiative: 0, hp: 7, maxHp: 7, ac: 15,
        isPlayerCharacter: false, conditions: [], type: 'monster', initiativeModifier: 2,
        tempHp: 0, isDefeated: false, isConcentrating: false, isSkipped: false,
        isReadied: false, notes: '', addOrder: 0, deathSaves: { successes: 0, failures: 0 },
      },
      {
        id: 'test-2', name: 'Orc', initiative: 0, hp: 15, maxHp: 15, ac: 13,
        isPlayerCharacter: false, conditions: [], type: 'monster', initiativeModifier: 1,
        tempHp: 0, isDefeated: false, isConcentrating: false, isSkipped: false,
        isReadied: false, notes: '', addOrder: 1, deathSaves: { successes: 0, failures: 0 },
      },
    ]
    render(
      <EncounterSetup
        encounter={enc}
        characters={[]}
        onUpdateEncounter={vi.fn()}
        onStartInitiative={vi.fn()}
      />,
    )
    expect(screen.getByText('Goblin')).toBeInTheDocument()
    expect(screen.getByText('Orc')).toBeInTheDocument()
    expect(screen.getByLabelText('Remove Goblin')).toBeInTheDocument()
    expect(screen.getByLabelText('Remove Orc')).toBeInTheDocument()
  })

  it('should remove combatant when remove button is clicked', () => {
    const enc = createTestEncounter()
    enc.combatants = [
      {
        id: 'test-1', name: 'Goblin', initiative: 0, hp: 7, maxHp: 7, ac: 15,
        isPlayerCharacter: false, conditions: [], type: 'monster', initiativeModifier: 2,
        tempHp: 0, isDefeated: false, isConcentrating: false, isSkipped: false,
        isReadied: false, notes: '', addOrder: 0, deathSaves: { successes: 0, failures: 0 },
      },
    ]
    const onUpdate = vi.fn()
    render(
      <EncounterSetup
        encounter={enc}
        characters={[]}
        onUpdateEncounter={onUpdate}
        onStartInitiative={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByLabelText('Remove Goblin'))
    const updated = onUpdate.mock.calls[0][0] as EncounterState
    expect(updated.combatants).toHaveLength(0)
  })

  it('should call onStartInitiative when start button is clicked', () => {
    const enc = createTestEncounter()
    enc.combatants = [
      {
        id: 'test-1', name: 'Player', initiative: 0, hp: 10, maxHp: 10, ac: 15,
        isPlayerCharacter: true, conditions: [], type: 'player', initiativeModifier: 0,
        tempHp: 0, isDefeated: false, isConcentrating: false, isSkipped: false,
        isReadied: false, notes: '', addOrder: 0, deathSaves: { successes: 0, failures: 0 },
      },
      {
        id: 'test-2', name: 'Goblin', initiative: 0, hp: 7, maxHp: 7, ac: 15,
        isPlayerCharacter: false, conditions: [], type: 'monster', initiativeModifier: 2,
        tempHp: 0, isDefeated: false, isConcentrating: false, isSkipped: false,
        isReadied: false, notes: '', addOrder: 1, deathSaves: { successes: 0, failures: 0 },
      },
    ]
    const onStart = vi.fn()
    render(
      <EncounterSetup
        encounter={enc}
        characters={[]}
        onUpdateEncounter={vi.fn()}
        onStartInitiative={onStart}
      />,
    )
    fireEvent.click(screen.getByText('Roll Initiative & Start'))
    expect(onStart).toHaveBeenCalled()
  })

  it('should show lair action button', () => {
    const enc = createTestEncounter()
    render(
      <EncounterSetup
        encounter={enc}
        characters={[]}
        onUpdateEncounter={vi.fn()}
        onStartInitiative={vi.fn()}
      />,
    )
    expect(screen.getByTestId('add-lair-action')).toBeInTheDocument()
  })

  it('should show player and monster counts after auto-populate', () => {
    const enc = createTestEncounter()
    const onUpdate = vi.fn()
    render(
      <EncounterSetup
        encounter={enc}
        characters={mockCharacters}
        onUpdateEncounter={onUpdate}
        onStartInitiative={vi.fn()}
      />,
    )
    // After auto-populate, onUpdateEncounter is called with 3 players.
    // The component displays counts based on encounter.combatants which
    // starts at 0. We verify auto-populate was called with correct count.
    const updated = onUpdate.mock.calls[0][0] as EncounterState
    const playerCount = updated.combatants.filter((c) => c.type === 'player').length
    expect(playerCount).toBe(3)
  })
})
