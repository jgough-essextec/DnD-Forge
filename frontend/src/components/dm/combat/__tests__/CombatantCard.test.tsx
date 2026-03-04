/**
 * CombatantCard Tests (Story 35.3, 35.4)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CombatantCard from '../CombatantCard'
import type { CombatCombatant } from '@/utils/combat'

function makeCombatant(overrides: Partial<CombatCombatant> = {}): CombatCombatant {
  return {
    id: 'c-1',
    name: 'Goblin',
    initiative: 15,
    hp: 7,
    maxHp: 7,
    ac: 15,
    isPlayerCharacter: false,
    conditions: [],
    type: 'monster',
    initiativeModifier: 2,
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

const defaultHandlers = {
  onDamage: vi.fn(),
  onHeal: vi.fn(),
  onSetTempHp: vi.fn(),
  onAddCondition: vi.fn(),
  onRemoveCondition: vi.fn(),
  onToggleConcentration: vi.fn(),
  onRemove: vi.fn(),
  onSkip: vi.fn(),
  onReady: vi.fn(),
  onDeathSave: vi.fn(),
}

describe('CombatantCard', () => {
  it('should render combatant name, initiative, and AC', () => {
    render(
      <CombatantCard
        combatant={makeCombatant({ name: 'Goblin', initiative: 18, ac: 15 })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    expect(screen.getByText('Goblin')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument() // initiative
    expect(screen.getByText('15')).toBeInTheDocument() // AC
  })

  it('should show "CURRENT TURN" label when it is the current turn', () => {
    render(
      <CombatantCard
        combatant={makeCombatant()}
        isCurrentTurn={true}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    expect(screen.getByText('CURRENT TURN')).toBeInTheDocument()
  })

  it('should not show "CURRENT TURN" when not current', () => {
    render(
      <CombatantCard
        combatant={makeCombatant()}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    expect(screen.queryByText('CURRENT TURN')).not.toBeInTheDocument()
  })

  it('should display HP bar with correct text', () => {
    render(
      <CombatantCard
        combatant={makeCombatant({ hp: 5, maxHp: 10 })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    expect(screen.getByText('5/10')).toBeInTheDocument()
  })

  it('should display temp HP when present', () => {
    render(
      <CombatantCard
        combatant={makeCombatant({ hp: 10, maxHp: 20, tempHp: 5 })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    expect(screen.getByText('+5')).toBeInTheDocument()
  })

  it('should open HP editor when HP bar is clicked', () => {
    render(
      <CombatantCard
        combatant={makeCombatant()}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    const hpButton = screen.getByLabelText(/Edit HP for/)
    fireEvent.click(hpButton)
    expect(screen.getByTestId('hp-editor')).toBeInTheDocument()
  })

  it('should display conditions as badges', () => {
    render(
      <CombatantCard
        combatant={makeCombatant({ conditions: ['poisoned', 'prone'] })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    expect(screen.getByText('poisoned')).toBeInTheDocument()
    expect(screen.getByText('prone')).toBeInTheDocument()
  })

  it('should remove condition when condition badge is clicked', () => {
    const onRemoveCondition = vi.fn()
    render(
      <CombatantCard
        combatant={makeCombatant({ id: 'c-1', conditions: ['poisoned'] })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
        onRemoveCondition={onRemoveCondition}
      />,
    )
    fireEvent.click(screen.getByTitle('Remove poisoned'))
    expect(onRemoveCondition).toHaveBeenCalledWith('c-1', 'poisoned')
  })

  it('should show "Concentrating" badge when concentrating', () => {
    render(
      <CombatantCard
        combatant={makeCombatant({ isConcentrating: true })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    expect(screen.getByText('Concentrating')).toBeInTheDocument()
  })

  it('should show "READY" badge when readied', () => {
    render(
      <CombatantCard
        combatant={makeCombatant({ isReadied: true })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    expect(screen.getByText('READY')).toBeInTheDocument()
  })

  it('should apply strikethrough to defeated combatants', () => {
    render(
      <CombatantCard
        combatant={makeCombatant({ isDefeated: true, name: 'DeadGoblin' })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    const nameEl = screen.getByText('DeadGoblin')
    expect(nameEl.className).toContain('line-through')
  })

  it('should apply strikethrough to skipped combatants', () => {
    render(
      <CombatantCard
        combatant={makeCombatant({ isSkipped: true, name: 'Skipped' })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    const nameEl = screen.getByText('Skipped')
    expect(nameEl.className).toContain('line-through')
  })

  it('should show death saves for player at 0 HP', () => {
    render(
      <CombatantCard
        combatant={makeCombatant({
          hp: 0,
          maxHp: 20,
          type: 'player',
          name: 'Aragorn',
          isPlayerCharacter: true,
        })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    expect(screen.getByTestId('death-saves')).toBeInTheDocument()
    expect(screen.getByText(/Aragorn is making death saves!/)).toBeInTheDocument()
  })

  it('should NOT show death saves for monster at 0 HP', () => {
    render(
      <CombatantCard
        combatant={makeCombatant({ hp: 0, maxHp: 20, type: 'monster' })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    expect(screen.queryByTestId('death-saves')).not.toBeInTheDocument()
  })

  it('should call onDeathSave with success when Success button is clicked', () => {
    const onDeathSave = vi.fn()
    render(
      <CombatantCard
        combatant={makeCombatant({
          id: 'p1',
          hp: 0,
          maxHp: 20,
          type: 'player',
        })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
        onDeathSave={onDeathSave}
      />,
    )
    fireEvent.click(screen.getByText('Success'))
    expect(onDeathSave).toHaveBeenCalledWith('p1', true)
  })

  it('should call onDeathSave with failure when Failure button is clicked', () => {
    const onDeathSave = vi.fn()
    render(
      <CombatantCard
        combatant={makeCombatant({
          id: 'p1',
          hp: 0,
          maxHp: 20,
          type: 'player',
        })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
        onDeathSave={onDeathSave}
      />,
    )
    fireEvent.click(screen.getByText('Failure'))
    expect(onDeathSave).toHaveBeenCalledWith('p1', false)
  })

  it('should call onRemove when Remove button is clicked', () => {
    const onRemove = vi.fn()
    render(
      <CombatantCard
        combatant={makeCombatant({ id: 'c-1' })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
        onRemove={onRemove}
      />,
    )
    fireEvent.click(screen.getByTitle('Remove from combat'))
    expect(onRemove).toHaveBeenCalledWith('c-1')
  })

  it('should call onSkip when Skip button is clicked', () => {
    const onSkip = vi.fn()
    render(
      <CombatantCard
        combatant={makeCombatant({ id: 'c-1' })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
        onSkip={onSkip}
      />,
    )
    fireEvent.click(screen.getByTitle('Skip turn'))
    expect(onSkip).toHaveBeenCalledWith('c-1')
  })

  it('should call onReady when Ready button is clicked', () => {
    const onReady = vi.fn()
    render(
      <CombatantCard
        combatant={makeCombatant({ id: 'c-1' })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
        onReady={onReady}
      />,
    )
    fireEvent.click(screen.getByTitle('Ready action'))
    expect(onReady).toHaveBeenCalledWith('c-1')
  })

  it('should not show action buttons for defeated combatants', () => {
    render(
      <CombatantCard
        combatant={makeCombatant({ isDefeated: true })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    expect(screen.queryByTitle('Remove from combat')).not.toBeInTheDocument()
  })

  it('should not show stats row for lair action combatants', () => {
    render(
      <CombatantCard
        combatant={makeCombatant({ type: 'lair', name: 'Lair Action' })}
        isCurrentTurn={false}
        isPastTurn={false}
        {...defaultHandlers}
      />,
    )
    // Lair actions should not show the HP bar / AC
    expect(screen.queryByLabelText(/Edit HP/)).not.toBeInTheDocument()
  })
})
