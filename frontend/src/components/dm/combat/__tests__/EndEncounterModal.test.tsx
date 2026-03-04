/**
 * EndEncounterModal Tests (Story 35.6)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EndEncounterModal from '../EndEncounterModal'
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

function makeEncounter(combatants: CombatCombatant[], round = 3): EncounterState {
  return {
    id: 'enc-1',
    campaignId: 'camp-1',
    name: 'Test Combat',
    combatants,
    currentTurnIndex: 0,
    round,
    phase: 'combat',
    defeatedMonsterXp: 0,
  }
}

const defaultParty = [
  { id: 'p1', name: 'Aragorn', currentXP: 1000, level: 3 },
  { id: 'p2', name: 'Gandalf', currentXP: 800, level: 3 },
  { id: 'p3', name: 'Legolas', currentXP: 900, level: 3 },
]

describe('EndEncounterModal', () => {
  it('should render "Encounter Complete" title', () => {
    const enc = makeEncounter([])
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('Encounter Complete')).toBeInTheDocument()
  })

  it('should display rounds elapsed', () => {
    const enc = makeEncounter([], 5)
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Rounds')).toBeInTheDocument()
  })

  it('should display defeated monsters count', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'm1', name: 'Goblin 1', type: 'monster', isDefeated: true, cr: 0.25 }),
      makeCombatant({ id: 'm2', name: 'Goblin 2', type: 'monster', isDefeated: true, cr: 0.25 }),
      makeCombatant({ id: 'p1', name: 'Aragorn', type: 'player', isDefeated: false }),
    ])
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Defeated')).toBeInTheDocument()
  })

  it('should show defeated monsters with XP values', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'm1', name: 'Goblin', type: 'monster', isDefeated: true, cr: 0.25 }),
    ])
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('Goblin')).toBeInTheDocument()
    expect(screen.getByText('50 XP')).toBeInTheDocument()
  })

  it('should calculate total XP from defeated monsters', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'm1', name: 'Goblin', type: 'monster', isDefeated: true, cr: 0.25 }),
      makeCombatant({ id: 'm2', name: 'Orc', type: 'monster', isDefeated: true, cr: 0.5 }),
    ])
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    // Total: 50 + 100 = 150, divided by 3 = 50 each
    const xpLabels = screen.getAllByText('+50 XP')
    expect(xpLabels.length).toBe(3) // one per party member
  })

  it('should show per-character XP preview', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'm1', type: 'monster', isDefeated: true, cr: 1 }),
    ])
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={[
          { id: 'p1', name: 'Aragorn', currentXP: 100, level: 1 },
          { id: 'p2', name: 'Gandalf', currentXP: 100, level: 1 },
        ]}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    // CR 1 = 200 XP, 2 members = 100 each
    expect(screen.getByText('Aragorn')).toBeInTheDocument()
    expect(screen.getByText('Gandalf')).toBeInTheDocument()
    expect(screen.getAllByText('+100 XP')).toHaveLength(2)
  })

  it('should allow excluding characters from XP split', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'm1', type: 'monster', isDefeated: true, cr: 2 }),
    ])
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={[
          { id: 'p1', name: 'Aragorn', currentXP: 0, level: 1 },
          { id: 'p2', name: 'Gandalf', currentXP: 0, level: 1 },
        ]}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    // CR 2 = 450 XP, 2 members = 225 each
    const aragornCheckbox = screen.getByLabelText('Include Aragorn in XP split')
    fireEvent.click(aragornCheckbox)
    // Now only Gandalf gets XP: 450 / 1 = 450
    expect(screen.getByText('+450 XP')).toBeInTheDocument()
  })

  it('should show milestone toggle option', () => {
    const enc = makeEncounter([])
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('Award Milestone Level Instead')).toBeInTheDocument()
  })

  it('should show milestone message when milestone is toggled', () => {
    const enc = makeEncounter([])
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Award Milestone Level Instead'))
    expect(screen.getByText('All eligible party members will advance one level.')).toBeInTheDocument()
  })

  it('should hide XP distribution when milestone is toggled', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'm1', type: 'monster', isDefeated: true, cr: 1 }),
    ])
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Award Milestone Level Instead'))
    expect(screen.queryByText('XP Distribution')).not.toBeInTheDocument()
  })

  it('should call onApply with XP distribution when Apply & Save is clicked', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'm1', type: 'monster', isDefeated: true, cr: 1 }),
    ])
    const onApply = vi.fn()
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={onApply}
        onClose={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Apply & Save'))
    expect(onApply).toHaveBeenCalled()
    const xpDist = onApply.mock.calls[0][0] as Record<string, number>
    expect(Object.keys(xpDist)).toHaveLength(3)
    expect(onApply.mock.calls[0][1]).toBe(false) // not milestone
  })

  it('should call onApply with milestone flag when milestone is toggled', () => {
    const enc = makeEncounter([])
    const onApply = vi.fn()
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={onApply}
        onClose={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Award Milestone Level Instead'))
    fireEvent.click(screen.getByText('Apply Milestone'))
    expect(onApply).toHaveBeenCalledWith(expect.any(Object), true)
  })

  it('should call onClose when Cancel is clicked', () => {
    const enc = makeEncounter([])
    const onClose = vi.fn()
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={vi.fn()}
        onClose={onClose}
      />,
    )
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should call onClose when X button is clicked', () => {
    const enc = makeEncounter([])
    const onClose = vi.fn()
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={vi.fn()}
        onClose={onClose}
      />,
    )
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should show surviving PCs count', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'p1', type: 'player', isDefeated: false }),
      makeCombatant({ id: 'p2', type: 'player', isDefeated: false }),
      makeCombatant({ id: 'm1', type: 'monster', isDefeated: true }),
    ])
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('Surviving PCs')).toBeInTheDocument()
  })

  it('should highlight characters that would level up', () => {
    // Level 1 needs 300 XP to reach level 2
    const enc = makeEncounter([
      makeCombatant({ id: 'm1', type: 'monster', isDefeated: true, cr: 2 }),
    ])
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={[
          { id: 'p1', name: 'Newbie', currentXP: 200, level: 1 },
        ]}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    // CR 2 = 450 XP, 1 member = 450 XP. 200 + 450 = 650 > 300
    expect(screen.getByText('Level 2!')).toBeInTheDocument()
  })

  it('should allow manual XP adjustment', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'm1', type: 'monster', isDefeated: true, cr: 1 }),
    ])
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={[
          { id: 'p1', name: 'Hero', currentXP: 0, level: 1 },
        ]}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    // CR 1 = 200 XP base, add 100 bonus
    const adjustInput = screen.getByLabelText('Adjust:')
    fireEvent.change(adjustInput, { target: { value: '100' } })
    // 200 + 100 = 300 XP / 1 member = 300 XP
    expect(screen.getByText('+300 XP')).toBeInTheDocument()
  })

  it('should include previously logged XP from mid-combat removals', () => {
    const enc = makeEncounter([])
    enc.defeatedMonsterXp = 500
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={[
          { id: 'p1', name: 'Hero', currentXP: 0, level: 1 },
        ]}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('Previously logged')).toBeInTheDocument()
    expect(screen.getByText('500 XP')).toBeInTheDocument()
  })

  it('should show CR for defeated monsters when available', () => {
    const enc = makeEncounter([
      makeCombatant({ id: 'm1', name: 'Dragon', type: 'monster', isDefeated: true, cr: 5 }),
    ])
    render(
      <EndEncounterModal
        encounter={enc}
        partyMembers={defaultParty}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('CR 5')).toBeInTheDocument()
    expect(screen.getByText('1,800 XP')).toBeInTheDocument()
  })
})
