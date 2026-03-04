/**
 * CombatantCard Touch Target Tests (Story 44.3)
 *
 * Verifies that small interactive elements meet the 44x44px minimum:
 * - Condition badge remove buttons
 * - Death save success/failure buttons
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CombatantCard from '../CombatantCard'
import type { CombatCombatant } from '@/utils/combat'

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

const defaultProps = {
  isCurrentTurn: false,
  isPastTurn: false,
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

describe('CombatantCard — Touch Targets (Story 44.3)', () => {
  it('condition badges have 44px min touch targets', () => {
    const combatant = makeCombatant({
      conditions: ['blinded', 'frightened'],
    })

    render(
      <CombatantCard
        combatant={combatant}
        {...defaultProps}
      />,
    )

    // Find condition badge buttons
    const blindedBtn = screen.getByTitle('Remove blinded')
    const frightenedBtn = screen.getByTitle('Remove frightened')

    expect(blindedBtn.className).toContain('min-h-[44px]')
    expect(blindedBtn.className).toContain('min-w-[44px]')
    expect(blindedBtn.className).toContain('touch-manipulation')

    expect(frightenedBtn.className).toContain('min-h-[44px]')
    expect(frightenedBtn.className).toContain('min-w-[44px]')
    expect(frightenedBtn.className).toContain('touch-manipulation')
  })

  it('death save buttons have 44px min touch targets', () => {
    const combatant = makeCombatant({
      id: 'player-1',
      type: 'player',
      hp: 0,
      deathSaves: { successes: 0, failures: 0 },
    })

    render(
      <CombatantCard
        combatant={combatant}
        {...defaultProps}
      />,
    )

    const successBtn = screen.getByText('Success')
    const failureBtn = screen.getByText('Failure')

    expect(successBtn.className).toContain('min-h-[44px]')
    expect(successBtn.className).toContain('touch-manipulation')
    expect(failureBtn.className).toContain('min-h-[44px]')
    expect(failureBtn.className).toContain('touch-manipulation')
  })

  it('death save circles have increased size (w-4 h-4)', () => {
    const combatant = makeCombatant({
      id: 'player-1',
      type: 'player',
      hp: 0,
      deathSaves: { successes: 1, failures: 2 },
    })

    render(
      <CombatantCard
        combatant={combatant}
        {...defaultProps}
      />,
    )

    // Check that death save indicator circles are rendered with data-testid
    const successCircle = screen.getByTestId('death-save-success-0')
    expect(successCircle.className).toContain('w-4')
    expect(successCircle.className).toContain('h-4')
  })
})
