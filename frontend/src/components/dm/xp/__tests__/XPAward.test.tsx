/**
 * XPAward Component Tests (Story 37.1)
 *
 * Functional tests for the XP Award modal component including
 * mode switching, previews, level-up detection, and apply flow.
 */

import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { XPAward } from '../XPAward'
import type { Character } from '@/types/character'

// Minimal character fixtures
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
  makeCharacter({
    id: 'c1',
    name: 'Thorin',
    level: 1,
    experiencePoints: 200,
  }),
  makeCharacter({
    id: 'c2',
    name: 'Legolas',
    level: 4,
    experiencePoints: 6000,
  }),
  makeCharacter({
    id: 'c3',
    name: 'Gandalf',
    level: 20,
    experiencePoints: 400000,
  }),
]

describe('XPAward', () => {
  it('should not render when isOpen is false', () => {
    renderWithProviders(
      <XPAward
        isOpen={false}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )
    expect(screen.queryByTestId('xp-award-modal')).not.toBeInTheDocument()
  })

  it('should render the XP Award modal when open', () => {
    renderWithProviders(
      <XPAward
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )
    expect(screen.getByTestId('xp-award-modal')).toBeInTheDocument()
    expect(screen.getByText('Award XP')).toBeInTheDocument()
  })

  it('should toggle between "Award to All" and "Award Individually" modes', () => {
    renderWithProviders(
      <XPAward
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    // Default mode is "all"
    const allButton = screen.getByTestId('mode-all')
    const individualButton = screen.getByTestId('mode-individual')

    expect(allButton).toHaveAttribute('aria-checked', 'true')
    expect(individualButton).toHaveAttribute('aria-checked', 'false')

    // Switch to individual
    fireEvent.click(individualButton)
    expect(individualButton).toHaveAttribute('aria-checked', 'true')
    expect(allButton).toHaveAttribute('aria-checked', 'false')
  })

  it('should display numeric XP input and optional reason/source field', () => {
    renderWithProviders(
      <XPAward
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    expect(screen.getByTestId('global-xp-input')).toBeInTheDocument()
    expect(screen.getByTestId('xp-reason-input')).toBeInTheDocument()
  })

  it('should show pre-award preview with current XP, XP to add, new total, and level-up status per character', () => {
    renderWithProviders(
      <XPAward
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    // Preview table should exist
    expect(screen.getByTestId('xp-preview')).toBeInTheDocument()

    // All character names should be visible
    expect(screen.getByText('Thorin')).toBeInTheDocument()
    expect(screen.getByText('Legolas')).toBeInTheDocument()
    expect(screen.getByText('Gandalf')).toBeInTheDocument()
  })

  it('should highlight characters crossing level threshold', () => {
    renderWithProviders(
      <XPAward
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    // Enter XP that causes Thorin to level up (200 + 200 = 400, crosses 300 for level 2)
    const xpInput = screen.getByTestId('global-xp-input')
    fireEvent.change(xpInput, { target: { value: '200' } })

    // Thorin should show level-up indicator
    expect(screen.getByTestId('level-up-indicator-c1')).toBeInTheDocument()
    expect(screen.getByText('Level 2!')).toBeInTheDocument()
  })

  it('should highlight multiple characters crossing level thresholds', () => {
    renderWithProviders(
      <XPAward
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    // Enter XP that causes both Thorin (200+700=900 -> L3) and Legolas (6000+700=6700 -> L5) to level up
    const xpInput = screen.getByTestId('global-xp-input')
    fireEvent.change(xpInput, { target: { value: '700' } })

    expect(screen.getByTestId('level-up-indicator-c1')).toBeInTheDocument()
    expect(screen.getByTestId('level-up-indicator-c2')).toBeInTheDocument()
    expect(screen.getByTestId('level-up-summary')).toBeInTheDocument()
  })

  it('should persist XP to each character on "Apply" click', async () => {
    const mockApply = vi.fn().mockResolvedValue(undefined)
    const mockClose = vi.fn()

    renderWithProviders(
      <XPAward
        isOpen={true}
        onClose={mockClose}
        characters={mockCharacters}
        onApply={mockApply}
      />
    )

    // Enter XP amount
    fireEvent.change(screen.getByTestId('global-xp-input'), {
      target: { value: '100' },
    })

    // Click Apply
    fireEvent.click(screen.getByTestId('apply-xp-button'))

    await waitFor(() => {
      expect(mockApply).toHaveBeenCalledWith(
        { c1: 100, c2: 100, c3: 100 },
        ''
      )
    })
  })

  it('should pass reason to onApply callback', async () => {
    const mockApply = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <XPAward
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={mockApply}
      />
    )

    fireEvent.change(screen.getByTestId('global-xp-input'), {
      target: { value: '100' },
    })
    fireEvent.change(screen.getByTestId('xp-reason-input'), {
      target: { value: 'Goblin encounter' },
    })
    fireEvent.click(screen.getByTestId('apply-xp-button'))

    await waitFor(() => {
      expect(mockApply).toHaveBeenCalledWith(
        expect.any(Object),
        'Goblin encounter'
      )
    })
  })

  it('should disable Apply button when no XP is entered', () => {
    renderWithProviders(
      <XPAward
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    expect(screen.getByTestId('apply-xp-button')).toBeDisabled()
  })

  it('should display XP threshold table as inline reference', () => {
    renderWithProviders(
      <XPAward
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    expect(screen.getByTestId('xp-threshold-table')).toBeInTheDocument()
    expect(screen.getByText('XP Threshold Reference')).toBeInTheDocument()
  })

  it('should show individual XP inputs when in individual mode', () => {
    renderWithProviders(
      <XPAward
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    // Switch to individual mode
    fireEvent.click(screen.getByTestId('mode-individual'))

    // Should show per-character inputs
    expect(screen.getByTestId('individual-xp-c1')).toBeInTheDocument()
    expect(screen.getByTestId('individual-xp-c2')).toBeInTheDocument()
    expect(screen.getByTestId('individual-xp-c3')).toBeInTheDocument()
  })

  it('should allow different XP amounts per character in individual mode', async () => {
    const mockApply = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <XPAward
        isOpen={true}
        onClose={vi.fn()}
        characters={mockCharacters}
        onApply={mockApply}
      />
    )

    // Switch to individual mode
    fireEvent.click(screen.getByTestId('mode-individual'))

    // Set different amounts
    fireEvent.change(screen.getByTestId('individual-xp-c1'), {
      target: { value: '100' },
    })
    fireEvent.change(screen.getByTestId('individual-xp-c2'), {
      target: { value: '500' },
    })

    fireEvent.click(screen.getByTestId('apply-xp-button'))

    await waitFor(() => {
      expect(mockApply).toHaveBeenCalledWith(
        { c1: 100, c2: 500, c3: 0 },
        ''
      )
    })
  })

  it('should close modal on cancel', () => {
    const mockClose = vi.fn()

    renderWithProviders(
      <XPAward
        isOpen={true}
        onClose={mockClose}
        characters={mockCharacters}
        onApply={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockClose).toHaveBeenCalled()
  })
})
