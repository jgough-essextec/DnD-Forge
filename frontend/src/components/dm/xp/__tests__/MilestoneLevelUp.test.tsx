/**
 * MilestoneLevelUp Component Tests (Story 37.2)
 *
 * Functional tests for the Milestone Level Up modal component including
 * Level Up All, Level Up Selected, confirmation, and summary flows.
 */

import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { MilestoneLevelUp } from '../MilestoneLevelUp'
import type { Character } from '@/types/character'

function makeCharacter(overrides: Partial<Character> & { id: string; name: string }): Character {
  return {
    playerName: 'Player',
    avatarUrl: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    version: 1,
    race: { raceId: 'human', subraceId: null, choices: [] },
    classes: [{ classId: 'fighter', level: 3, subclassId: null, choices: [], hitDiceUsed: 0, hitDiceTotal: 3 }],
    background: { backgroundId: 'soldier', choices: [] },
    alignment: 'neutral',
    baseAbilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScoreMethod: 'standard',
    level: 3,
    experiencePoints: 800,
    hpMax: 28,
    hpCurrent: 28,
    tempHp: 0,
    hitDiceTotal: [3],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0 },
    combatStats: { armorClass: { base: 16, sources: [] }, initiative: { modifier: 2, advantage: false }, proficiencyBonus: 2 },
    proficiencies: { armor: [], weapons: [], tools: [], languages: ['common'], skills: [], savingThrows: [] },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
    feats: [],
    description: { age: '', height: '', weight: '', eyes: '', skin: '', hair: '', appearance: '' },
    personality: { traits: [], ideals: [], bonds: [], flaws: [] },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    ...overrides,
  } as Character
}

const mockCharacters: Character[] = [
  makeCharacter({ id: 'c1', name: 'Aragorn', level: 4 }),
  makeCharacter({ id: 'c2', name: 'Legolas', level: 7 }),
  makeCharacter({ id: 'c3', name: 'Gandalf', level: 20 }),
  makeCharacter({ id: 'c4', name: 'Frodo', level: 3 }),
]

describe('MilestoneLevelUp', () => {
  it('should not render when isOpen is false', () => {
    renderWithProviders(
      <MilestoneLevelUp
        isOpen={false}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )
    expect(screen.queryByTestId('milestone-levelup-modal')).not.toBeInTheDocument()
  })

  it('should render "Milestone Level Up" button/modal when open', () => {
    renderWithProviders(
      <MilestoneLevelUp
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )
    expect(screen.getByTestId('milestone-levelup-modal')).toBeInTheDocument()
    expect(screen.getByText('Milestone Level Up')).toBeInTheDocument()
  })

  it('should show "Level Up All" and "Level Up Selected" options', () => {
    renderWithProviders(
      <MilestoneLevelUp
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    expect(screen.getByTestId('milestone-mode-all')).toBeInTheDocument()
    expect(screen.getByTestId('milestone-mode-selected')).toBeInTheDocument()
    expect(screen.getByText('Level Up All')).toBeInTheDocument()
    expect(screen.getByText('Level Up Selected')).toBeInTheDocument()
  })

  it('should display all eligible characters preview in "All" mode', () => {
    renderWithProviders(
      <MilestoneLevelUp
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    expect(screen.getByTestId('all-characters-preview')).toBeInTheDocument()
    // 3 eligible characters (not Gandalf at level 20)
    expect(screen.getByText(/3 eligible characters/)).toBeInTheDocument()
    expect(screen.getByText('Aragorn')).toBeInTheDocument()
    expect(screen.getByText('Legolas')).toBeInTheDocument()
    expect(screen.getByText('Frodo')).toBeInTheDocument()
  })

  it('should show max level warning for level 20 characters', () => {
    renderWithProviders(
      <MilestoneLevelUp
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    // Gandalf is level 20
    expect(screen.getByText(/1 character at Level 20/)).toBeInTheDocument()
    expect(screen.getByText('Gandalf')).toBeInTheDocument()
  })

  it('should render checkboxes next to each character for "Level Up Selected" mode', () => {
    renderWithProviders(
      <MilestoneLevelUp
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    // Switch to selected mode
    fireEvent.click(screen.getByTestId('milestone-mode-selected'))

    expect(screen.getByTestId('character-selection-list')).toBeInTheDocument()
    expect(screen.getByTestId('select-c1')).toBeInTheDocument()
    expect(screen.getByTestId('select-c2')).toBeInTheDocument()
    expect(screen.getByTestId('select-c4')).toBeInTheDocument()
    // Gandalf (level 20) should not have a checkbox
    expect(screen.queryByTestId('select-c3')).not.toBeInTheDocument()
  })

  it('should display confirmation dialog for Level Up All', () => {
    renderWithProviders(
      <MilestoneLevelUp
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    // Click Proceed
    fireEvent.click(screen.getByTestId('proceed-button'))

    // Should show confirmation with count
    expect(screen.getByText(/Level up 3 characters/)).toBeInTheDocument()
  })

  it('should level up all eligible characters on confirm', async () => {
    const mockApply = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <MilestoneLevelUp
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={mockApply}
      />
    )

    // Proceed to confirmation
    fireEvent.click(screen.getByTestId('proceed-button'))
    // Confirm
    fireEvent.click(screen.getByTestId('confirm-levelup-button'))

    await waitFor(() => {
      expect(mockApply).toHaveBeenCalledWith(['c1', 'c2', 'c4'])
    })
  })

  it('should select specific characters for level-up in "Selected" mode', async () => {
    const mockApply = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <MilestoneLevelUp
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={mockApply}
      />
    )

    // Switch to selected mode
    fireEvent.click(screen.getByTestId('milestone-mode-selected'))

    // Select only Aragorn and Frodo
    fireEvent.click(screen.getByTestId('select-c1'))
    fireEvent.click(screen.getByTestId('select-c4'))

    // Proceed
    fireEvent.click(screen.getByTestId('proceed-button'))
    // Confirm
    fireEvent.click(screen.getByTestId('confirm-levelup-button'))

    await waitFor(() => {
      expect(mockApply).toHaveBeenCalledWith(['c1', 'c4'])
    })
  })

  it('should display batch summary after level-up', async () => {
    const mockApply = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <MilestoneLevelUp
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={mockApply}
      />
    )

    // Proceed through the flow
    fireEvent.click(screen.getByTestId('proceed-button'))
    fireEvent.click(screen.getByTestId('confirm-levelup-button'))

    await waitFor(() => {
      expect(screen.getByTestId('levelup-summary')).toBeInTheDocument()
    })

    // Summary should show level changes
    expect(screen.getByText('Level Up Complete')).toBeInTheDocument()
    expect(screen.getByTestId('done-button')).toBeInTheDocument()
  })

  it('should prevent leveling a character beyond level 20', () => {
    renderWithProviders(
      <MilestoneLevelUp
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    // Gandalf at level 20 should not appear in eligible list
    const preview = screen.getByTestId('all-characters-preview')
    expect(preview).not.toHaveTextContent('Level 20 → 21')
  })

  it('should disable Proceed button when no characters are selected in Selected mode', () => {
    renderWithProviders(
      <MilestoneLevelUp
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    fireEvent.click(screen.getByTestId('milestone-mode-selected'))

    // No checkboxes selected yet
    expect(screen.getByTestId('proceed-button')).toBeDisabled()
  })

  it('should close modal and reset state on Done', async () => {
    const mockApply = vi.fn().mockResolvedValue(undefined)
    const mockClose = vi.fn()

    renderWithProviders(
      <MilestoneLevelUp
        isOpen={true}
        onClose={mockClose}
        characters={mockCharacters}
        onApply={mockApply}
      />
    )

    // Go through the full flow
    fireEvent.click(screen.getByTestId('proceed-button'))
    fireEvent.click(screen.getByTestId('confirm-levelup-button'))

    await waitFor(() => {
      expect(screen.getByTestId('done-button')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('done-button'))
    expect(mockClose).toHaveBeenCalled()
  })
})
