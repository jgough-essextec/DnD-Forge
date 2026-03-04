/**
 * CharacterSheet Tests (Epic 24)
 *
 * Tests for the main character sheet component including:
 * - Tab navigation renders and switches
 * - Correct layout classes applied
 * - Mobile section ordering
 * - Print button rendering
 * - Floating action bar
 * - Collapsible mobile sections
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Character } from '@/types/character'
import type { DerivedStats } from '@/hooks/useCharacterCalculations'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockCharacterSheetContext = {
  character: null as Character | null,
  isLoading: false,
  error: null,
  editableCharacter: {},
  updateField: vi.fn(),
  setEditableCharacter: vi.fn(),
  editMode: {
    isEditing: false,
    isDirty: false,
    setDirty: vi.fn(),
    toggleMode: vi.fn(),
    enterEditMode: vi.fn(),
    exitEditMode: vi.fn(),
  },
  saveStatus: 'idle' as const,
  lastSavedAt: null,
  hasPendingChanges: false,
  saveNow: vi.fn(),
  retrySave: vi.fn(),
  undoRedo: {
    canUndo: false,
    canRedo: false,
    undo: vi.fn(),
    redo: vi.fn(),
    pushSnapshot: vi.fn(),
    clear: vi.fn(),
  },
  derivedStats: {} as DerivedStats,
}

vi.mock('@/components/character/CharacterSheetProvider', () => ({
  CharacterSheetProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-provider">{children}</div>
  ),
  useCharacterSheet: () => mockCharacterSheetContext,
}))

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      [key: string]: unknown
    }) => {
      const safeProps: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(props)) {
        if (
          key !== 'initial' &&
          key !== 'animate' &&
          key !== 'exit' &&
          key !== 'transition' &&
          key !== 'whileHover' &&
          key !== 'whileTap'
        ) {
          safeProps[key] = value
        }
      }
      return <div {...safeProps}>{children}</div>
    },
  },
}))

// Mock the page layouts as simple divs to avoid deep dependency chains
vi.mock('../page1/Page1Layout', () => ({
  Page1Layout: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="page1-layout">
      <div data-testid="page1-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {children}
      </div>
    </div>
  ),
}))

vi.mock('../page2/Page2Layout', () => ({
  Page2Layout: () => <div data-testid="page2-layout">Page 2 Content</div>,
}))

vi.mock('../page3/Page3Layout', () => ({
  Page3Layout: () => <div data-testid="page3-layout">Page 3 Content</div>,
}))

// Mock individual page1 components
vi.mock('../page1/AbilityScoresPanel', () => ({
  AbilityScoresPanel: () => <div data-testid="ability-scores-panel">Ability Scores</div>,
}))

vi.mock('../page1/SavingThrowsList', () => ({
  SavingThrowsList: () => <div data-testid="saving-throws-list">Saving Throws</div>,
}))

vi.mock('../page1/SkillsList', () => ({
  SkillsList: () => <div data-testid="skills-list">Skills</div>,
}))

vi.mock('../page1/CombatStatsBlock', () => ({
  CombatStatsBlock: () => <div data-testid="combat-stats-block">Combat Stats</div>,
}))

vi.mock('../page1/HitPointsBlock', () => ({
  HitPointsBlock: () => <div data-testid="hit-points-block">Hit Points</div>,
}))

vi.mock('../page1/HitDiceDeathSaves', () => ({
  HitDiceDeathSaves: () => <div data-testid="hit-dice-death-saves">Hit Dice Death Saves</div>,
}))

vi.mock('../page1/AttacksSection', () => ({
  AttacksSection: () => <div data-testid="attacks-section">Attacks</div>,
}))

vi.mock('../page1/PersonalityFeatures', () => ({
  PersonalityFeatures: () => <div data-testid="personality-features">Personality Features</div>,
}))

vi.mock('../page1/ProficiencyBonusDisplay', () => ({
  ProficiencyBonusDisplay: () => <div data-testid="proficiency-bonus-display">Prof Bonus</div>,
}))

// Import after mocks
import { CharacterSheet } from '../CharacterSheet'
import { PrintButton } from '../PrintButton'
import { FloatingActionBar } from '../FloatingActionBar'

// ---------------------------------------------------------------------------
// Test data factories
// ---------------------------------------------------------------------------

const createMockCharacter = (): Character => ({
  id: 'char-1',
  name: 'Thorin Ironforge',
  playerName: 'Test Player',
  avatarUrl: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  version: 1,
  race: {
    raceId: 'dwarf',
    subraceId: 'mountain-dwarf',
  },
  classes: [
    {
      classId: 'fighter',
      level: 1,
      subclassId: undefined,
      chosenSkills: ['athletics', 'perception'],
      hpRolls: [],
    },
  ],
  background: {
    backgroundId: 'soldier',
    characterIdentity: { name: 'Thorin Ironforge' },
    characterPersonality: {
      personalityTraits: ['I face problems head-on.', 'I always have a plan.'],
      ideal: 'Responsibility.',
      bond: 'I would still lay down my life.',
      flaw: 'I have little respect.',
    },
  },
  alignment: 'lawful-good',
  baseAbilityScores: {
    strength: 16, dexterity: 12, constitution: 15,
    intelligence: 10, wisdom: 13, charisma: 8,
  },
  abilityScores: {
    strength: 16, dexterity: 12, constitution: 17,
    intelligence: 10, wisdom: 13, charisma: 8,
  },
  abilityScoreMethod: 'standard',
  level: 1,
  experiencePoints: 150,
  hpMax: 13,
  hpCurrent: 13,
  tempHp: 0,
  hitDiceTotal: [1],
  hitDiceUsed: [0],
  speed: { walk: 25 },
  deathSaves: { successes: 0, failures: 0, stable: false },
  combatStats: {
    armorClass: { base: 16, dexModifier: 1, shieldBonus: 0, otherBonuses: [], formula: '10 + 5 + 1' },
    initiative: 1,
    speed: { walk: 25 },
    hitPoints: { maximum: 13, current: 13, temporary: 0, hitDice: { total: [], used: [] } },
    attacks: [],
    savingThrows: { strength: 5, constitution: 5 },
  },
  proficiencies: {
    armor: ['Light armor'],
    weapons: ['Simple weapons'],
    tools: [],
    languages: ['common', 'dwarvish'],
    skills: [
      { skill: 'athletics', proficient: true, expertise: false },
      { skill: 'perception', proficient: true, expertise: false },
    ],
    savingThrows: ['strength', 'constitution'],
  },
  inventory: [],
  currency: { cp: 0, sp: 0, gp: 50, pp: 0, ep: 0 },
  attunedItems: [],
  spellcasting: null,
  features: ['second-wind'],
  feats: [],
  description: {
    name: 'Thorin Ironforge', age: '45', height: "4'6\"", weight: '180',
    eyes: 'Brown', skin: 'Tan', hair: 'Black', appearance: '', backstory: '',
    alliesAndOrgs: '', treasure: '',
  },
  personality: {
    personalityTraits: ['I face problems head-on.', 'I always have a plan.'],
    ideal: 'Responsibility.',
    bond: 'I would still lay down my life.',
    flaw: 'I have little respect.',
  },
  conditions: [],
  inspiration: false,
  campaignId: null,
  isArchived: false,
})

const createMockDerivedStats = (): DerivedStats => ({
  effectiveAbilityScores: {
    strength: 16, dexterity: 12, constitution: 17,
    intelligence: 10, wisdom: 13, charisma: 8,
  },
  abilityModifiers: {
    strength: 3, dexterity: 1, constitution: 3,
    intelligence: 0, wisdom: 1, charisma: -1,
  },
  proficiencyBonus: 2,
  armorClass: 16,
  initiative: 1,
  hpMax: 13,
  skillModifiers: {
    acrobatics: 1, 'animal-handling': 1, arcana: 0, athletics: 5,
    deception: -1, history: 0, insight: 1, intimidation: -1,
    investigation: 0, medicine: 1, nature: 0, perception: 3,
    performance: -1, persuasion: -1, religion: 0, 'sleight-of-hand': 1,
    stealth: 1, survival: 1,
  },
  savingThrows: {
    strength: 5, dexterity: 1, constitution: 5,
    intelligence: 0, wisdom: 1, charisma: -1,
  },
  passivePerception: 13,
  passiveInvestigation: 10,
  passiveInsight: 11,
  spellSaveDC: null,
  spellAttackBonus: null,
  spellSlots: {},
  cantripsKnown: 0,
  spellsPrepared: 0,
  meleeAttackBonus: 5,
  rangedAttackBonus: 3,
  inventoryWeight: 0,
  carryingCapacity: 240,
  isEncumbered: false,
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CharacterSheet', () => {
  beforeEach(() => {
    mockCharacterSheetContext.character = createMockCharacter()
    mockCharacterSheetContext.editableCharacter = {}
    mockCharacterSheetContext.derivedStats = createMockDerivedStats()
    mockCharacterSheetContext.editMode.isEditing = false
    mockCharacterSheetContext.isLoading = false
    mockCharacterSheetContext.error = null
    vi.clearAllMocks()
  })

  // =========================================================================
  // Tab navigation
  // =========================================================================

  describe('Tab Navigation', () => {
    it('renders all three tabs', () => {
      render(<CharacterSheet characterId="char-1" />)
      expect(screen.getByTestId('tab-core')).toBeInTheDocument()
      expect(screen.getByTestId('tab-backstory')).toBeInTheDocument()
      expect(screen.getByTestId('tab-spellcasting')).toBeInTheDocument()
    })

    it('renders tabs with correct labels', () => {
      render(<CharacterSheet characterId="char-1" />)
      expect(screen.getByText('Core Stats')).toBeInTheDocument()
      expect(screen.getByText('Backstory & Details')).toBeInTheDocument()
      expect(screen.getByText('Spellcasting')).toBeInTheDocument()
    })

    it('starts on Core Stats tab by default', () => {
      render(<CharacterSheet characterId="char-1" />)
      const coreTab = screen.getByTestId('tab-core')
      expect(coreTab).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('panel-core')).toBeInTheDocument()
    })

    it('switches to Backstory tab on click', async () => {
      const user = userEvent.setup()
      render(<CharacterSheet characterId="char-1" />)

      await user.click(screen.getByTestId('tab-backstory'))

      expect(screen.getByTestId('tab-backstory')).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('tab-core')).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByTestId('panel-backstory')).toBeInTheDocument()
    })

    it('switches to Spellcasting tab on click', async () => {
      const user = userEvent.setup()
      render(<CharacterSheet characterId="char-1" />)

      await user.click(screen.getByTestId('tab-spellcasting'))

      expect(screen.getByTestId('tab-spellcasting')).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('panel-spellcasting')).toBeInTheDocument()
    })

    it('tabs have correct ARIA roles', () => {
      render(<CharacterSheet characterId="char-1" />)
      const tablist = screen.getByRole('tablist')
      expect(tablist).toBeInTheDocument()

      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(3)
    })

    it('tabs have aria-controls linking to panels', () => {
      render(<CharacterSheet characterId="char-1" />)
      const coreTab = screen.getByTestId('tab-core')
      expect(coreTab).toHaveAttribute('aria-controls', 'panel-core')
    })

    it('supports initialTab prop', () => {
      render(<CharacterSheet characterId="char-1" initialTab="backstory" />)
      expect(screen.getByTestId('tab-backstory')).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('panel-backstory')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Page rendering
  // =========================================================================

  describe('Page Rendering', () => {
    it('renders Page 1 content on Core Stats tab', () => {
      render(<CharacterSheet characterId="char-1" />)
      expect(screen.getByTestId('core-stats-page')).toBeInTheDocument()
      expect(screen.getByTestId('page1-layout')).toBeInTheDocument()
    })

    it('renders Page 2 content on Backstory tab', async () => {
      const user = userEvent.setup()
      render(<CharacterSheet characterId="char-1" />)

      await user.click(screen.getByTestId('tab-backstory'))

      expect(screen.getByTestId('backstory-page')).toBeInTheDocument()
      expect(screen.getByTestId('page2-layout')).toBeInTheDocument()
    })

    it('renders Page 3 content on Spellcasting tab', async () => {
      const user = userEvent.setup()
      render(<CharacterSheet characterId="char-1" />)

      await user.click(screen.getByTestId('tab-spellcasting'))

      expect(screen.getByTestId('spellcasting-page')).toBeInTheDocument()
      expect(screen.getByTestId('page3-layout')).toBeInTheDocument()
    })

    it('wraps content in CharacterSheetProvider', () => {
      render(<CharacterSheet characterId="char-1" />)
      expect(screen.getByTestId('mock-provider')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Layout classes
  // =========================================================================

  describe('Layout Classes', () => {
    it('Page 1 left column has correct responsive classes', () => {
      render(<CharacterSheet characterId="char-1" />)
      const leftCol = screen.getByTestId('left-column')
      expect(leftCol.className).toContain('order-2')
      expect(leftCol.className).toContain('md:order-1')
      expect(leftCol.className).toContain('lg:order-1')
      expect(leftCol.className).toContain('lg:col-span-4')
    })

    it('Page 1 center column has correct responsive classes', () => {
      render(<CharacterSheet characterId="char-1" />)
      const centerCol = screen.getByTestId('center-column')
      expect(centerCol.className).toContain('order-1')
      expect(centerCol.className).toContain('md:order-2')
      expect(centerCol.className).toContain('lg:order-2')
      expect(centerCol.className).toContain('lg:col-span-4')
    })

    it('Page 1 right column has correct responsive classes', () => {
      render(<CharacterSheet characterId="char-1" />)
      const rightCol = screen.getByTestId('right-column')
      expect(rightCol.className).toContain('order-3')
      expect(rightCol.className).toContain('lg:order-3')
      expect(rightCol.className).toContain('lg:col-span-4')
    })
  })

  // =========================================================================
  // Mobile section ordering
  // =========================================================================

  describe('Mobile Section Ordering', () => {
    it('combat stats column is order-1 (first on mobile)', () => {
      render(<CharacterSheet characterId="char-1" />)
      const centerCol = screen.getByTestId('center-column')
      expect(centerCol.className).toContain('order-1')
    })

    it('ability scores column is order-2 on mobile', () => {
      render(<CharacterSheet characterId="char-1" />)
      const leftCol = screen.getByTestId('left-column')
      expect(leftCol.className).toContain('order-2')
    })

    it('personality column is order-3 on mobile', () => {
      render(<CharacterSheet characterId="char-1" />)
      const rightCol = screen.getByTestId('right-column')
      expect(rightCol.className).toContain('order-3')
    })

    it('renders mobile compact ability scores section', () => {
      render(<CharacterSheet characterId="char-1" />)
      expect(screen.getByTestId('mobile-ability-scores')).toBeInTheDocument()
    })

    it('renders compact 3-column ability score grid for mobile', () => {
      render(<CharacterSheet characterId="char-1" />)
      const compact = screen.getByTestId('ability-scores-compact')
      expect(compact.className).toContain('grid-cols-3')
    })

    it('shows all 6 ability abbreviations in compact mode', () => {
      render(<CharacterSheet characterId="char-1" />)
      const compact = screen.getByTestId('ability-scores-compact')
      expect(within(compact).getByText('STR')).toBeInTheDocument()
      expect(within(compact).getByText('DEX')).toBeInTheDocument()
      expect(within(compact).getByText('CON')).toBeInTheDocument()
      expect(within(compact).getByText('INT')).toBeInTheDocument()
      expect(within(compact).getByText('WIS')).toBeInTheDocument()
      expect(within(compact).getByText('CHA')).toBeInTheDocument()
    })

    it('shows modifier values in compact mode', () => {
      render(<CharacterSheet characterId="char-1" />)
      const compact = screen.getByTestId('ability-scores-compact')
      // STR and CON both have +3 modifier
      const modElements = within(compact).getAllByText('+3', { exact: false })
      expect(modElements.length).toBeGreaterThanOrEqual(1)
    })
  })

  // =========================================================================
  // Collapsible sections
  // =========================================================================

  describe('Collapsible Mobile Sections', () => {
    it('renders collapsible skills section', () => {
      render(<CharacterSheet characterId="char-1" />)
      expect(screen.getByTestId('collapsible-skills')).toBeInTheDocument()
    })

    it('skills section shows proficient count header', () => {
      render(<CharacterSheet characterId="char-1" />)
      const collapsible = screen.getByTestId('collapsible-skills')
      expect(within(collapsible).getByText(/Skills \(2 proficient\)/)).toBeInTheDocument()
    })

    it('skills section is collapsed by default', () => {
      render(<CharacterSheet characterId="char-1" />)
      const collapsible = screen.getByTestId('collapsible-skills')
      const button = within(collapsible).getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('skills section expands on click', async () => {
      const user = userEvent.setup()
      render(<CharacterSheet characterId="char-1" />)

      const collapsible = screen.getByTestId('collapsible-skills')
      const button = within(collapsible).getByRole('button')
      await user.click(button)

      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('renders collapsible personality section', () => {
      render(<CharacterSheet characterId="char-1" />)
      expect(screen.getByTestId('collapsible-personality')).toBeInTheDocument()
    })

    it('personality section is collapsed by default', () => {
      render(<CharacterSheet characterId="char-1" />)
      const collapsible = screen.getByTestId('collapsible-personality')
      const button = within(collapsible).getByRole('button')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })
  })

  // =========================================================================
  // Loading and error states
  // =========================================================================

  describe('Loading and Error States', () => {
    it('shows loading state', () => {
      mockCharacterSheetContext.isLoading = true
      mockCharacterSheetContext.character = null
      render(<CharacterSheet characterId="char-1" />)
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Loading character...')).toBeInTheDocument()
    })

    it('shows error state when character fails to load', () => {
      ;(mockCharacterSheetContext as any).error = new Error('Not found')
      mockCharacterSheetContext.character = null
      render(<CharacterSheet characterId="char-1" />)
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Failed to load character.')).toBeInTheDocument()
    })
  })

  // =========================================================================
  // Touch targets
  // =========================================================================

  describe('Touch Targets', () => {
    it('tab buttons have minimum 44px height (touch-manipulation)', () => {
      render(<CharacterSheet characterId="char-1" />)
      const tabs = screen.getAllByRole('tab')
      for (const tab of tabs) {
        expect(tab.className).toContain('min-h-[44px]')
        expect(tab.className).toContain('touch-manipulation')
      }
    })
  })
})

// ===========================================================================
// PrintButton
// ===========================================================================

describe('PrintButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders print button', () => {
    render(<PrintButton />)
    expect(screen.getByTestId('print-button')).toBeInTheDocument()
  })

  it('has accessible label', () => {
    render(<PrintButton />)
    expect(screen.getByLabelText('Print character sheet')).toBeInTheDocument()
  })

  it('calls window.print on click', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<PrintButton />)

    fireEvent.click(screen.getByTestId('print-button'))

    expect(printSpy).toHaveBeenCalledOnce()
    printSpy.mockRestore()
  })

  it('has print:hidden class to hide in print', () => {
    render(<PrintButton />)
    expect(screen.getByTestId('print-button').className).toContain('print:hidden')
  })
})

// ===========================================================================
// FloatingActionBar
// ===========================================================================

describe('FloatingActionBar', () => {
  beforeEach(() => {
    mockCharacterSheetContext.character = createMockCharacter()
    mockCharacterSheetContext.editableCharacter = {}
    mockCharacterSheetContext.derivedStats = createMockDerivedStats()
    mockCharacterSheetContext.editMode.isEditing = false
    vi.clearAllMocks()
  })

  it('renders the floating action bar', () => {
    render(<FloatingActionBar />)
    expect(screen.getByTestId('floating-action-bar')).toBeInTheDocument()
  })

  it('has sm:hidden class (mobile only)', () => {
    render(<FloatingActionBar />)
    expect(screen.getByTestId('floating-action-bar').className).toContain('sm:hidden')
  })

  it('has print:hidden class', () => {
    render(<FloatingActionBar />)
    expect(screen.getByTestId('floating-action-bar').className).toContain('print:hidden')
  })

  it('renders Roll d20 button', () => {
    render(<FloatingActionBar />)
    expect(screen.getByLabelText('Roll d20')).toBeInTheDocument()
  })

  it('renders HP +/- button', () => {
    render(<FloatingActionBar />)
    expect(screen.getByLabelText('Adjust hit points')).toBeInTheDocument()
  })

  it('renders Spell Slots button', () => {
    render(<FloatingActionBar />)
    expect(screen.getByLabelText('Spell slots')).toBeInTheDocument()
  })

  it('renders Edit toggle button', () => {
    render(<FloatingActionBar />)
    expect(screen.getByLabelText('Switch to edit mode')).toBeInTheDocument()
  })

  it('shows View label when in edit mode', () => {
    mockCharacterSheetContext.editMode.isEditing = true
    render(<FloatingActionBar />)
    expect(screen.getByText('View')).toBeInTheDocument()
  })

  it('calls enableEdit when Edit button clicked', async () => {
    const user = userEvent.setup()
    render(<FloatingActionBar />)

    await user.click(screen.getByLabelText('Switch to edit mode'))

    expect(mockCharacterSheetContext.editMode.enterEditMode).toHaveBeenCalled()
  })

  it('calls disableEdit when in edit mode and View clicked', async () => {
    mockCharacterSheetContext.editMode.isEditing = true
    const user = userEvent.setup()
    render(<FloatingActionBar />)

    await user.click(screen.getByLabelText('Switch to view mode'))

    expect(mockCharacterSheetContext.editMode.exitEditMode).toHaveBeenCalled()
  })
})
