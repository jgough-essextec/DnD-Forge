/**
 * SessionAbilityRow Tests (Epic 32 - Story 32.1)
 *
 * Tests for the pinned skill/save ability row in the session view.
 * Verifies display of skill names, modifiers, proficiency dots,
 * and roll interactions.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SessionAbilityRow } from '../SessionAbilityRow'
import type { SkillName, AbilityName } from '@/types/core'

// ---------------------------------------------------------------------------
// Mock stores (needed by RollableValue)
// ---------------------------------------------------------------------------

const mockRoll = vi.fn()

vi.mock('@/stores/diceStore', () => ({
  useDiceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ roll: mockRoll }),
}))

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ diceRollerOpen: false, toggleDiceRoller: vi.fn() }),
}))

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const skillModifiers: Record<SkillName, number> = {
  acrobatics: 2,
  'animal-handling': 1,
  arcana: 0,
  athletics: 5,
  deception: -1,
  history: 0,
  insight: 3,
  intimidation: -1,
  investigation: 0,
  medicine: 1,
  nature: 0,
  perception: 5,
  performance: -1,
  persuasion: -1,
  religion: 0,
  'sleight-of-hand': 2,
  stealth: 2,
  survival: 1,
}

const savingThrows: Record<AbilityName, number> = {
  strength: 6,
  dexterity: 2,
  constitution: 5,
  intelligence: 0,
  wisdom: 1,
  charisma: -1,
}

const proficientSkills: SkillName[] = ['athletics', 'perception']
const proficientSaves: AbilityName[] = ['strength', 'constitution']

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SessionAbilityRow', () => {
  it('renders the ability row container', () => {
    render(
      <SessionAbilityRow
        pinnedSkills={['perception', 'athletics', 'stealth']}
        skillModifiers={skillModifiers}
        savingThrows={savingThrows}
        proficientSkills={proficientSkills}
        proficientSaves={proficientSaves}
      />,
    )
    expect(screen.getByTestId('session-ability-row')).toBeInTheDocument()
  })

  it('renders pinned skill labels', () => {
    render(
      <SessionAbilityRow
        pinnedSkills={['perception', 'athletics']}
        skillModifiers={skillModifiers}
        savingThrows={savingThrows}
        proficientSkills={proficientSkills}
        proficientSaves={proficientSaves}
      />,
    )
    expect(screen.getByText('Perception')).toBeInTheDocument()
    expect(screen.getByText('Athletics')).toBeInTheDocument()
  })

  it('displays formatted modifier values', () => {
    render(
      <SessionAbilityRow
        pinnedSkills={['athletics', 'deception']}
        skillModifiers={skillModifiers}
        savingThrows={savingThrows}
        proficientSkills={proficientSkills}
        proficientSaves={proficientSaves}
      />,
    )
    expect(screen.getByText('+5')).toBeInTheDocument()
    expect(screen.getByText('-1')).toBeInTheDocument()
  })

  it('shows proficiency dot for proficient skills', () => {
    render(
      <SessionAbilityRow
        pinnedSkills={['athletics', 'stealth']}
        skillModifiers={skillModifiers}
        savingThrows={savingThrows}
        proficientSkills={proficientSkills}
        proficientSaves={proficientSaves}
      />,
    )
    // Athletics is proficient, stealth is not
    expect(screen.getByTestId('proficiency-dot-athletics')).toBeInTheDocument()
    expect(screen.queryByTestId('proficiency-dot-stealth')).not.toBeInTheDocument()
  })

  it('renders saving throws when pinned', () => {
    render(
      <SessionAbilityRow
        pinnedSkills={['save-strength', 'save-wisdom']}
        skillModifiers={skillModifiers}
        savingThrows={savingThrows}
        proficientSkills={proficientSkills}
        proficientSaves={proficientSaves}
      />,
    )
    expect(screen.getByText('STR Save')).toBeInTheDocument()
    expect(screen.getByText('WIS Save')).toBeInTheDocument()
    // STR save is proficient
    expect(screen.getByTestId('proficiency-dot-save-strength')).toBeInTheDocument()
  })
})
