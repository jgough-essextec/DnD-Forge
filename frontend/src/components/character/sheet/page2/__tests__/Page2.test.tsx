/**
 * Page 2 Component Tests (Stories 18.1-18.5)
 *
 * Comprehensive tests for all Page 2 sections:
 * - AppearanceSection (18.1)
 * - BackstorySection (18.2)
 * - EquipmentSection (18.3)
 * - CurrencySection (18.4)
 * - TreasureSection (18.5)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Character } from '@/types/character'
import type { CharacterSheetContextValue } from '@/components/character/CharacterSheetProvider'
import { CharacterSheetProvider } from '@/components/character/CharacterSheetProvider'
import { Page2Layout } from '../Page2Layout'
import { AppearanceSection } from '../AppearanceSection'
import { BackstorySection } from '../BackstorySection'
import { EquipmentSection } from '../EquipmentSection'
import { CurrencySection } from '../CurrencySection'
import { TreasureSection } from '../TreasureSection'

// Mock the hooks
vi.mock('@/hooks/useCharacters', () => ({
  useCharacter: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@/hooks/useEditMode', () => ({
  useEditMode: () => ({
    isEditing: false,
    isDirty: false,
    setDirty: vi.fn(),
  }),
}))

vi.mock('@/hooks/useCharacterAutoSave', () => ({
  useCharacterAutoSave: () => ({
    status: 'idle' as const,
    lastSavedAt: null,
    hasPendingChanges: false,
    saveNow: vi.fn(),
    retry: vi.fn(),
  }),
}))

vi.mock('@/hooks/useUndoRedo', () => ({
  useUndoRedo: () => ({
    canUndo: false,
    canRedo: false,
    undo: vi.fn(),
    redo: vi.fn(),
    pushSnapshot: vi.fn(),
    clear: vi.fn(),
  }),
}))

vi.mock('@/hooks/useCharacterCalculations', () => ({
  useCharacterCalculations: () => ({
    effectiveAbilityScores: { strength: 14, dexterity: 12, constitution: 13, intelligence: 10, wisdom: 11, charisma: 8 },
    abilityModifiers: { strength: 2, dexterity: 1, constitution: 1, intelligence: 0, wisdom: 0, charisma: -1 },
    proficiencyBonus: 2,
    armorClass: 14,
    initiative: 1,
    hpMax: 10,
    skillModifiers: {},
    savingThrows: { strength: 2, dexterity: 1, constitution: 1, intelligence: 0, wisdom: 0, charisma: -1 },
    passivePerception: 10,
    passiveInvestigation: 10,
    passiveInsight: 10,
    spellSaveDC: null,
    spellAttackBonus: null,
    spellSlots: {},
    cantripsKnown: 0,
    spellsPrepared: 0,
    meleeAttackBonus: 4,
    rangedAttackBonus: 3,
    inventoryWeight: 25.5,
    carryingCapacity: 210,
    isEncumbered: false,
  }),
  EMPTY_DERIVED_STATS: {
    effectiveAbilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    abilityModifiers: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 },
    proficiencyBonus: 2,
    armorClass: 10,
    initiative: 0,
    hpMax: 1,
    skillModifiers: {},
    savingThrows: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 },
    passivePerception: 10,
    passiveInvestigation: 10,
    passiveInsight: 10,
    spellSaveDC: null,
    spellAttackBonus: null,
    spellSlots: {},
    cantripsKnown: 0,
    spellsPrepared: 0,
    meleeAttackBonus: 2,
    rangedAttackBonus: 2,
    inventoryWeight: 0,
    carryingCapacity: 150,
    isEncumbered: false,
  },
}))

// Mock character data helper
const createMockCharacter = (overrides?: Partial<Character>): Character => ({
  id: 'test-char-1',
  name: 'Test Character',
  playerName: 'Test Player',
  avatarUrl: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  version: 1,
  race: {
    raceId: 'human',
    subraceId: null,
    chosenAbilityScoreIncreases: { strength: 1, charisma: 1 },
  },
  classes: [
    {
      classId: 'fighter',
      level: 1,
      hitDie: 10,
      subclassId: null,
      chosenSkillProficiencies: ['athletics', 'intimidation'],
    },
  ],
  background: {
    backgroundId: 'soldier',
    characterIdentity: {
      name: 'Test Character',
      age: '25',
      height: '6ft',
      weight: '180 lbs',
      eyes: 'Blue',
      skin: 'Fair',
      hair: 'Brown',
      appearance: 'A battle-scarred warrior with a stern expression.',
    },
    characterPersonality: {
      personalityTraits: ['I am always polite and respectful.', 'I face problems head-on.'],
      ideal: 'Greater Good',
      bond: 'I protect those who cannot protect themselves.',
      flaw: 'I have a weakness for the vices of the city.',
    },
  },
  alignment: 'lawful-good',
  baseAbilityScores: { strength: 16, dexterity: 14, constitution: 15, intelligence: 10, wisdom: 12, charisma: 8 },
  abilityScores: { strength: 17, dexterity: 14, constitution: 15, intelligence: 10, wisdom: 12, charisma: 9 },
  abilityScoreMethod: 'standard',
  level: 1,
  experiencePoints: 0,
  hpMax: 13,
  hpCurrent: 13,
  tempHp: 0,
  hitDiceTotal: [10],
  hitDiceUsed: [0],
  speed: { walk: 30, fly: 0, swim: 0, climb: 0, burrow: 0 },
  deathSaves: { successes: 0, failures: 0 },
  combatStats: {
    armorClass: 14,
    initiative: 2,
    speed: 30,
    proficiencyBonus: 2,
    passivePerception: 11,
  },
  proficiencies: {
    armor: ['light', 'medium', 'heavy', 'shields'],
    weapons: ['simple', 'martial'],
    tools: [],
    languages: ['common'],
    skills: [
      { skill: 'athletics', proficient: true, expertise: false },
      { skill: 'intimidation', proficient: true, expertise: false },
    ],
    savingThrows: ['strength', 'constitution'],
  },
  inventory: [
    {
      id: 'item-1',
      equipmentId: 'longsword',
      name: 'Longsword',
      category: 'weapon',
      quantity: 1,
      weight: 3,
      isEquipped: true,
      isAttuned: false,
      requiresAttunement: false,
    },
    {
      id: 'item-2',
      equipmentId: 'chain-mail',
      name: 'Chain Mail',
      category: 'armor',
      quantity: 1,
      weight: 55,
      isEquipped: true,
      isAttuned: false,
      requiresAttunement: false,
    },
    {
      id: 'item-3',
      equipmentId: 'rope',
      name: 'Rope (50 ft)',
      category: 'adventuring-gear',
      quantity: 1,
      weight: 10,
      isEquipped: false,
      isAttuned: false,
      requiresAttunement: false,
    },
  ],
  currency: { cp: 50, sp: 25, ep: 0, gp: 10, pp: 0 },
  attunedItems: [],
  spellcasting: null,
  features: ['second-wind', 'fighting-style-defense'],
  feats: [],
  description: {
    name: 'Test Character',
    age: '25',
    height: '6ft',
    weight: '180 lbs',
    eyes: 'Blue',
    skin: 'Fair',
    hair: 'Brown',
    appearance: 'A battle-scarred warrior with a stern expression.',
    backstory:
      '# Early Life\n\nBorn in a small village, I learned to fight at a young age.\n\n**Training**: Joined the army at 16.\n\n*Quest for justice*: Now I seek to right wrongs.',
    alliesAndOrgs: 'Member of the City Guard. Friendly with the local blacksmith.',
    treasure: 'A silver locket from my mother. A map to an ancient ruin.',
  },
  personality: {
    personalityTraits: ['I am always polite and respectful.', 'I face problems head-on.'],
    ideal: 'Greater Good',
    bond: 'I protect those who cannot protect themselves.',
    flaw: 'I have a weakness for the vices of the city.',
  },
  conditions: [],
  inspiration: false,
  campaignId: null,
  isArchived: false,
  ...overrides,
})

// Helper to render with mocked context
function renderWithMockContext(
  ui: React.ReactElement,
  contextOverrides?: Partial<CharacterSheetContextValue>
) {
  const mockContext: CharacterSheetContextValue = {
    character: createMockCharacter(),
    isLoading: false,
    error: null,
    editableCharacter: {},
    updateField: vi.fn(),
    setEditableCharacter: vi.fn(),
    editMode: {
      isEditing: false,
      isDirty: false,
      setDirty: vi.fn(),
    },
    saveStatus: 'idle',
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
    derivedStats: {
      effectiveAbilityScores: { strength: 14, dexterity: 12, constitution: 13, intelligence: 10, wisdom: 11, charisma: 8 },
      abilityModifiers: { strength: 2, dexterity: 1, constitution: 1, intelligence: 0, wisdom: 0, charisma: -1 },
      proficiencyBonus: 2,
      armorClass: 14,
      initiative: 1,
      hpMax: 10,
      skillModifiers: {},
      savingThrows: { strength: 2, dexterity: 1, constitution: 1, intelligence: 0, wisdom: 0, charisma: -1 },
      passivePerception: 10,
      passiveInvestigation: 10,
      passiveInsight: 10,
      spellSaveDC: null,
      spellAttackBonus: null,
      spellSlots: {},
      cantripsKnown: 0,
      spellsPrepared: 0,
      meleeAttackBonus: 4,
      rangedAttackBonus: 3,
      inventoryWeight: 68,
      carryingCapacity: 210,
      isEncumbered: false,
    },
    ...contextOverrides,
  }

  // Mock useCharacterSheet to return our mock context
  vi.doMock('@/components/character/CharacterSheetProvider', () => ({
    useCharacterSheet: () => mockContext,
    CharacterSheetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }))

  return { ...render(ui), mockContext }
}

describe('Page2Layout', () => {
  it('should render the Page 2 layout container', () => {
    renderWithMockContext(<Page2Layout />)
    expect(screen.getByTestId('page2-layout')).toBeInTheDocument()
  })

  it('should render all sections', () => {
    renderWithMockContext(<Page2Layout />)
    expect(screen.getByTestId('appearance-section')).toBeInTheDocument()
    expect(screen.getByTestId('backstory-section')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-section')).toBeInTheDocument()
    expect(screen.getByTestId('currency-section')).toBeInTheDocument()
    expect(screen.getByTestId('treasure-section')).toBeInTheDocument()
  })
})

describe('AppearanceSection', () => {
  it('should render character name', () => {
    renderWithMockContext(<AppearanceSection />)
    expect(screen.getByTestId('appearance-name-display')).toHaveTextContent('Test Character')
  })

  it('should render all physical detail fields', () => {
    renderWithMockContext(<AppearanceSection />)
    expect(screen.getByTestId('appearance-age-display')).toHaveTextContent('25')
    expect(screen.getByTestId('appearance-height-display')).toHaveTextContent('6ft')
    expect(screen.getByTestId('appearance-weight-display')).toHaveTextContent('180 lbs')
    expect(screen.getByTestId('appearance-eyes-display')).toHaveTextContent('Blue')
    expect(screen.getByTestId('appearance-skin-display')).toHaveTextContent('Fair')
    expect(screen.getByTestId('appearance-hair-display')).toHaveTextContent('Brown')
  })

  it('should render appearance notes', () => {
    renderWithMockContext(<AppearanceSection />)
    expect(screen.getByTestId('appearance-notes-display')).toHaveTextContent('A battle-scarred warrior')
  })

  it('should render allies and organizations', () => {
    renderWithMockContext(<AppearanceSection />)
    expect(screen.getByTestId('allies-orgs-display')).toHaveTextContent('Member of the City Guard')
  })

  it('should show empty states for missing fields', () => {
    const character = createMockCharacter({
      description: {
        name: 'Test',
        age: '',
        height: '',
        weight: '',
        eyes: '',
        skin: '',
        hair: '',
        appearance: '',
        backstory: '',
        alliesAndOrgs: '',
        treasure: '',
      },
    })
    renderWithMockContext(<AppearanceSection />, { character })
    expect(screen.getByTestId('appearance-age-display')).toHaveTextContent('—')
  })

  it('should render edit inputs in edit mode', () => {
    renderWithMockContext(<AppearanceSection />, {
      editMode: { isEditing: true, isDirty: false, setDirty: vi.fn() },
    })
    expect(screen.getByTestId('appearance-name-input')).toBeInTheDocument()
    expect(screen.getByTestId('appearance-age-input')).toBeInTheDocument()
    expect(screen.getByTestId('appearance-notes-input')).toBeInTheDocument()
    expect(screen.getByTestId('allies-orgs-input')).toBeInTheDocument()
  })
})

describe('BackstorySection', () => {
  it('should render backstory with markdown-lite formatting', () => {
    renderWithMockContext(<BackstorySection />)
    const backstoryDisplay = screen.getByTestId('backstory-display')
    expect(backstoryDisplay.innerHTML).toContain('<h3')
    expect(backstoryDisplay.innerHTML).toContain('<strong')
    expect(backstoryDisplay.innerHTML).toContain('<em')
  })

  it('should render additional features list', () => {
    renderWithMockContext(<BackstorySection />)
    expect(screen.getByTestId('additional-features-list')).toBeInTheDocument()
    expect(screen.getByTestId('feature-item-0')).toHaveTextContent('second-wind')
    expect(screen.getByTestId('feature-item-1')).toHaveTextContent('fighting-style-defense')
  })

  it('should show empty state when no backstory', () => {
    const character = createMockCharacter({
      description: { ...createMockCharacter().description, backstory: '' },
    })
    renderWithMockContext(<BackstorySection />, { character })
    expect(screen.getByText(/No backstory written yet/i)).toBeInTheDocument()
  })

  it('should render edit textarea in edit mode', () => {
    renderWithMockContext(<BackstorySection />, {
      editMode: { isEditing: true, isDirty: false, setDirty: vi.fn() },
    })
    expect(screen.getByTestId('backstory-input')).toBeInTheDocument()
  })

  it('should show character count in edit mode', () => {
    renderWithMockContext(<BackstorySection />, {
      editMode: { isEditing: true, isDirty: false, setDirty: vi.fn() },
    })
    expect(screen.getByTestId('backstory-character-count')).toBeInTheDocument()
  })

  it('should show warning when backstory exceeds 5000 characters', () => {
    const longBackstory = 'a'.repeat(5001)
    const character = createMockCharacter({
      description: { ...createMockCharacter().description, backstory: longBackstory },
    })
    renderWithMockContext(<BackstorySection />, {
      character,
      editMode: { isEditing: true, isDirty: false, setDirty: vi.fn() },
    })
    expect(screen.getByText(/over 5,000/i)).toBeInTheDocument()
  })
})

describe('EquipmentSection', () => {
  it('should render equipment table with all items', () => {
    renderWithMockContext(<EquipmentSection />)
    expect(screen.getByTestId('equipment-table')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-row-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-row-item-2')).toBeInTheDocument()
    expect(screen.getByTestId('equipment-row-item-3')).toBeInTheDocument()
  })

  it('should display item name, quantity, and weight', () => {
    renderWithMockContext(<EquipmentSection />)
    expect(screen.getByText('Longsword')).toBeInTheDocument()
    expect(screen.getByText('Chain Mail')).toBeInTheDocument()
  })

  it('should show total weight and carrying capacity', () => {
    renderWithMockContext(<EquipmentSection />)
    expect(screen.getByTestId('total-weight')).toHaveTextContent('68.0 lb')
    expect(screen.getByTestId('carrying-capacity')).toHaveTextContent('210 lb')
  })

  it('should show encumbrance indicator', () => {
    renderWithMockContext(<EquipmentSection />)
    expect(screen.getByTestId('encumbrance-indicator')).toHaveTextContent('Normal')
  })

  it('should show encumbered state when weight exceeds threshold', () => {
    renderWithMockContext(<EquipmentSection />, {
      derivedStats: {
        ...createMockCharacter().combatStats,
        inventoryWeight: 85,
        carryingCapacity: 150,
        isEncumbered: true,
        effectiveAbilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
        abilityModifiers: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 },
        proficiencyBonus: 2,
        armorClass: 10,
        initiative: 0,
        hpMax: 10,
        skillModifiers: {},
        savingThrows: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 },
        passivePerception: 10,
        passiveInvestigation: 10,
        passiveInsight: 10,
        spellSaveDC: null,
        spellAttackBonus: null,
        spellSlots: {},
        cantripsKnown: 0,
        spellsPrepared: 0,
        meleeAttackBonus: 2,
        rangedAttackBonus: 2,
      },
    })
    expect(screen.getByTestId('encumbrance-indicator')).toHaveTextContent('Encumbered')
  })

  it('should show attunement counter', () => {
    renderWithMockContext(<EquipmentSection />)
    expect(screen.getByTestId('attunement-counter')).toHaveTextContent('0 / 3')
  })

  it('should show empty state when no equipment', () => {
    const character = createMockCharacter({ inventory: [] })
    renderWithMockContext(<EquipmentSection />, { character })
    expect(screen.getByText(/No equipment in inventory/i)).toBeInTheDocument()
  })
})

describe('CurrencySection', () => {
  it('should render all 5 currency denominations', () => {
    renderWithMockContext(<CurrencySection />)
    expect(screen.getByTestId('currency-cp')).toBeInTheDocument()
    expect(screen.getByTestId('currency-sp')).toBeInTheDocument()
    expect(screen.getByTestId('currency-ep')).toBeInTheDocument()
    expect(screen.getByTestId('currency-gp')).toBeInTheDocument()
    expect(screen.getByTestId('currency-pp')).toBeInTheDocument()
  })

  it('should display correct currency values', () => {
    renderWithMockContext(<CurrencySection />)
    expect(screen.getByTestId('currency-input-cp')).toHaveValue(50)
    expect(screen.getByTestId('currency-input-sp')).toHaveValue(25)
    expect(screen.getByTestId('currency-input-gp')).toHaveValue(10)
  })

  it('should calculate total wealth in GP equivalent', () => {
    renderWithMockContext(<CurrencySection />)
    // 50 CP = 0.5 GP, 25 SP = 2.5 GP, 10 GP = 10 GP
    // Total = 0.5 + 2.5 + 10 = 13 GP
    expect(screen.getByTestId('total-wealth-gp')).toHaveTextContent('13.00 GP')
  })

  it('should render increment/decrement buttons for each denomination', () => {
    renderWithMockContext(<CurrencySection />)
    expect(screen.getByTestId('currency-increase-cp')).toBeInTheDocument()
    expect(screen.getByTestId('currency-decrease-cp')).toBeInTheDocument()
  })

  it('should render auto-convert toggle', () => {
    renderWithMockContext(<CurrencySection />)
    expect(screen.getByTestId('auto-convert-toggle')).toBeInTheDocument()
  })

  it('should show zero currency for empty state', () => {
    const character = createMockCharacter({
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    })
    renderWithMockContext(<CurrencySection />, { character })
    expect(screen.getByTestId('total-wealth-gp')).toHaveTextContent('0.00 GP')
  })
})

describe('TreasureSection', () => {
  it('should render treasure text content', () => {
    renderWithMockContext(<TreasureSection />)
    expect(screen.getByTestId('treasure-display')).toHaveTextContent('A silver locket')
  })

  it('should show empty state when no treasure', () => {
    const character = createMockCharacter({
      description: { ...createMockCharacter().description, treasure: '' },
    })
    renderWithMockContext(<TreasureSection />, { character })
    expect(screen.getByText(/No treasure recorded yet/i)).toBeInTheDocument()
  })

  it('should render edit textarea in edit mode', () => {
    renderWithMockContext(<TreasureSection />, {
      editMode: { isEditing: true, isDirty: false, setDirty: vi.fn() },
    })
    expect(screen.getByTestId('treasure-input')).toBeInTheDocument()
  })
})
