import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModeToggle } from '@/components/character/ModeToggle'
import {
  EditModeProvider,
  type EditModeProviderProps,
} from '@/components/character/EditModeContext'
import { EDIT_MODE_HELP_DISMISSED_KEY } from '@/hooks/useEditMode'
import type { Character } from '@/types/character'

// ---------------------------------------------------------------------------
// Mock character
// ---------------------------------------------------------------------------

const mockCharacter: Character = {
  id: 'char-001',
  name: 'Test Character',
  playerName: 'Player',
  avatarUrl: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  version: 1,
  race: { raceId: 'human', subraceId: null },
  classes: [{ classId: 'fighter', level: 5, subclassId: 'champion', hitDie: 10, skillProficiencies: [] }],
  background: {
    backgroundId: 'soldier',
    characterIdentity: { name: 'Test' },
    characterPersonality: { personalityTraits: [], ideal: '', bond: '', flaw: '' },
  },
  alignment: 'lawful-good',
  baseAbilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  abilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  abilityScoreMethod: 'standard',
  level: 5,
  experiencePoints: 0,
  hpMax: 30,
  hpCurrent: 30,
  tempHp: 0,
  hitDiceTotal: [5],
  hitDiceUsed: [0],
  speed: { walk: 30 },
  deathSaves: { successes: 0, failures: 0, stable: false },
  combatStats: {
    armorClass: { base: 10, formula: '10', modifiers: [] },
    initiative: 0,
    speed: { walk: 30 },
    hitPoints: { current: 30, max: 30, temporary: 0 },
    attacks: [],
    savingThrows: {},
  },
  proficiencies: { armor: [], weapons: [], tools: [], languages: [], skills: [], savingThrows: [] },
  inventory: [],
  currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  attunedItems: [],
  spellcasting: null,
  features: [],
  feats: [],
  description: {
    name: 'Test', age: '', height: '', weight: '', eyes: '', skin: '', hair: '',
    appearance: '', backstory: '', alliesAndOrgs: '', treasure: '',
  },
  personality: { personalityTraits: [], ideal: '', bond: '', flaw: '' },
  conditions: [],
  inspiration: false,
  campaignId: null,
  isArchived: false,
} as unknown as Character

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function renderWithProvider(
  props: Partial<EditModeProviderProps> = {}
) {
  return render(
    <EditModeProvider character={mockCharacter} {...props}>
      <ModeToggle />
    </EditModeProvider>
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ModeToggle', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
    localStorage.removeItem(EDIT_MODE_HELP_DISMISSED_KEY)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.removeItem(EDIT_MODE_HELP_DISMISSED_KEY)
  })

  it('should render mode toggle button with "Viewing" text in view mode', () => {
    renderWithProvider()

    expect(screen.getByText('Viewing')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /switch to edit mode/i })
    ).toBeInTheDocument()
  })

  it('should toggle to edit mode when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    const button = screen.getByRole('button', { name: /switch to edit mode/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Editing')).toBeInTheDocument()
    })
  })

  it('should toggle back to view mode when button is clicked again', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    const button = screen.getByRole('button', { name: /switch to edit mode/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Editing')).toBeInTheDocument()
    })

    const editButton = screen.getByRole('button', { name: /switch to view mode/i })
    await user.click(editButton)

    await waitFor(() => {
      expect(screen.getByText('Viewing')).toBeInTheDocument()
    })
  })

  it('should have aria-pressed attribute reflecting current mode', () => {
    renderWithProvider()

    const button = screen.getByRole('button', { name: /switch to edit mode/i })
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('should show first-time help banner when entering edit mode', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    const button = screen.getByRole('button', { name: /switch to edit mode/i })
    await user.click(button)

    await waitFor(() => {
      expect(
        screen.getByText(/you are now editing/i)
      ).toBeInTheDocument()
    })
  })

  it('should dismiss help banner and not show again', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    // Enter edit mode
    const button = screen.getByRole('button', { name: /switch to edit mode/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/you are now editing/i)).toBeInTheDocument()
    })

    // Dismiss
    const dismissBtn = screen.getByRole('button', { name: /dismiss help/i })
    await user.click(dismissBtn)

    await waitFor(() => {
      expect(screen.queryByText(/you are now editing/i)).not.toBeInTheDocument()
    })

    // Check localStorage
    expect(localStorage.getItem(EDIT_MODE_HELP_DISMISSED_KEY)).toBe('true')
  })

  it('should not show help banner if already dismissed', async () => {
    localStorage.setItem(EDIT_MODE_HELP_DISMISSED_KEY, 'true')

    const user = userEvent.setup()
    renderWithProvider()

    const button = screen.getByRole('button', { name: /switch to edit mode/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Editing')).toBeInTheDocument()
    })

    expect(screen.queryByText(/you are now editing/i)).not.toBeInTheDocument()
  })

  it('should toggle mode on Ctrl+E keyboard shortcut', async () => {
    renderWithProvider()

    expect(screen.getByText('Viewing')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'e', ctrlKey: true })

    await waitFor(() => {
      expect(screen.getByText('Editing')).toBeInTheDocument()
    })
  })

  it('should exit edit mode on Escape key', async () => {
    renderWithProvider()

    // Enter edit mode
    fireEvent.keyDown(window, { key: 'e', ctrlKey: true })
    await waitFor(() => {
      expect(screen.getByText('Editing')).toBeInTheDocument()
    })

    // Exit with Escape
    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => {
      expect(screen.getByText('Viewing')).toBeInTheDocument()
    })
  })

  it('should render with correct styling classes for view mode', () => {
    renderWithProvider()
    const button = screen.getByRole('button', { name: /switch to edit mode/i })
    // View mode should have slate styling (not gold)
    expect(button.className).toContain('bg-slate')
  })

  it('should render with correct styling classes for edit mode', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    const button = screen.getByRole('button', { name: /switch to edit mode/i })
    await user.click(button)

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /switch to view mode/i })
      // Edit mode should have amber/gold styling
      expect(editButton.className).toContain('bg-amber')
    })
  })
})
