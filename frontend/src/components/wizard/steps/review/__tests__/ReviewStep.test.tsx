/**
 * Comprehensive tests for the Review & Finalize wizard step (Epic 15).
 *
 * Covers all 4 stories:
 * - 15.1: Character Sheet Preview (Page 1/2/3)
 * - 15.2: Validation Summary
 * - 15.3: Save & Character Assembly
 * - 15.4: Quick Edit from Review
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ReviewStep } from '../ReviewStep'
import { ValidationSummary } from '../ValidationSummary'
import { SaveCelebration } from '../SaveCelebration'
import { InlineNameEdit } from '../InlineNameEdit'
import { EditableSection } from '../EditableSection'
import { CharacterPreviewPage1 } from '../CharacterPreviewPage1'
import { CharacterPreviewPage2 } from '../CharacterPreviewPage2'
import { CharacterPreviewPage3 } from '../CharacterPreviewPage3'
import type { ReviewData } from '../useReviewData'
import type { RaceSelection } from '@/types/race'
import type { ClassSelection } from '@/types/class'
import type { AbilityScores } from '@/types/core'
import type { BackgroundSelection } from '@/types/background'
import type { InventoryItem } from '@/types/equipment'

// =============================================================================
// Mock wizard store
// =============================================================================

let mockWizardState: Record<string, unknown> = {}
const mockSetStep = vi.fn()
const mockSetCharacterName = vi.fn()
const mockReset = vi.fn()

vi.mock('@/stores/wizardStore', () => ({
  useWizardStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) => selector(mockWizardState),
    {
      getState: () => mockWizardState,
    },
  ),
}))

// =============================================================================
// Mock react-router-dom
// =============================================================================

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// =============================================================================
// Mock useCreateCharacter
// =============================================================================

const mockMutateAsync = vi.fn()

vi.mock('@/hooks/useCharacterMutations', () => ({
  useCreateCharacter: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    isError: false,
    error: null,
  }),
}))

// =============================================================================
// Mock step components (for QuickEditModal)
// =============================================================================

vi.mock('@/components/wizard/steps/race/RaceStep', () => ({
  RaceStep: () => <div data-testid="mock-race-step">Race Step Content</div>,
}))

vi.mock('@/components/wizard/steps/class', () => ({
  ClassStep: () => <div data-testid="mock-class-step">Class Step Content</div>,
}))

vi.mock('@/components/wizard/steps/abilities', () => ({
  AbilityScoreStep: () => <div data-testid="mock-abilities-step">Abilities Step Content</div>,
}))

vi.mock('@/components/wizard/steps/background/BackgroundStep', () => ({
  BackgroundStep: () => <div data-testid="mock-background-step">Background Step Content</div>,
}))

vi.mock('@/components/wizard/steps/equipment/EquipmentStep', () => ({
  EquipmentStep: () => <div data-testid="mock-equipment-step">Equipment Step Content</div>,
}))

vi.mock('@/components/wizard/steps/spells/SpellStep', () => ({
  SpellStep: () => <div data-testid="mock-spells-step">Spells Step Content</div>,
}))

// =============================================================================
// Test Fixtures
// =============================================================================

function createFighterWizardState() {
  return {
    currentStep: 7,
    characterName: 'Aldric Stoneshield',
    raceSelection: {
      raceId: 'human',
    } as RaceSelection,
    classSelection: {
      classId: 'fighter',
      level: 1,
      chosenSkills: ['athletics', 'perception'],
      hpRolls: [],
    } as ClassSelection,
    abilityScores: {
      strength: 15,
      dexterity: 13,
      constitution: 14,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    } as AbilityScores,
    abilityScoreMethod: 'standard' as const,
    backgroundSelection: {
      backgroundId: 'soldier',
      characterIdentity: {
        name: 'Aldric Stoneshield',
        age: '28',
        height: '6\'1"',
        weight: '210 lbs',
        eyes: 'Brown',
        skin: 'Tan',
        hair: 'Black',
      },
      characterPersonality: {
        personalityTraits: [
          'I always have a plan for what to do when things go wrong.',
          'I am always calm, no matter what the situation.',
        ] as [string, string],
        ideal: 'Greater Good. Our lot is to lay down our lives in defense of others.',
        bond: 'I fight for those who cannot fight for themselves.',
        flaw: 'I have a weakness for the vices of the city.',
      },
    } as BackgroundSelection,
    equipmentSelections: [
      {
        id: 'inv-1',
        equipmentId: 'chain-mail',
        name: 'Chain Mail',
        category: 'armor' as const,
        quantity: 1,
        weight: 55,
        isEquipped: true,
        isAttuned: false,
        requiresAttunement: false,
      },
      {
        id: 'inv-2',
        equipmentId: 'longsword',
        name: 'Longsword',
        category: 'weapon' as const,
        quantity: 1,
        weight: 3,
        isEquipped: true,
        isAttuned: false,
        requiresAttunement: false,
      },
      {
        id: 'inv-3',
        equipmentId: 'shield',
        name: 'Shield',
        category: 'shield' as const,
        quantity: 1,
        weight: 6,
        isEquipped: true,
        isAttuned: false,
        requiresAttunement: false,
      },
    ] as InventoryItem[],
    spellSelections: [] as string[],
    isComplete: false,
    setStep: mockSetStep,
    setCharacterName: mockSetCharacterName,
    setRace: vi.fn(),
    setClass: vi.fn(),
    setAbilityScores: vi.fn(),
    setBackground: vi.fn(),
    setEquipment: vi.fn(),
    setSpells: vi.fn(),
    reset: mockReset,
  }
}

function createWizardWizardState() {
  return {
    currentStep: 7,
    characterName: 'Elyndra Starweave',
    raceSelection: {
      raceId: 'elf',
      subraceId: 'high-elf',
    } as RaceSelection,
    classSelection: {
      classId: 'wizard',
      level: 1,
      chosenSkills: ['arcana', 'investigation'],
      hpRolls: [],
    } as ClassSelection,
    abilityScores: {
      strength: 8,
      dexterity: 14,
      constitution: 13,
      intelligence: 15,
      wisdom: 12,
      charisma: 10,
    } as AbilityScores,
    abilityScoreMethod: 'standard' as const,
    backgroundSelection: {
      backgroundId: 'sage',
      characterIdentity: {
        name: 'Elyndra Starweave',
        age: '175',
        height: '5\'8"',
        weight: '120 lbs',
        eyes: 'Silver',
        skin: 'Pale',
        hair: 'Silver',
      },
      characterPersonality: {
        personalityTraits: [
          'I use polysyllabic words that convey the impression of great erudition.',
          'I am horribly, horribly awkward in social situations.',
        ] as [string, string],
        ideal: 'Knowledge. The path to power and self-improvement is through knowledge.',
        bond: 'I have an ancient text that holds terrible secrets that must not fall into the wrong hands.',
        flaw: 'I overlook obvious solutions in favor of complicated ones.',
      },
    } as BackgroundSelection,
    equipmentSelections: [
      {
        id: 'inv-1',
        equipmentId: 'quarterstaff',
        name: 'Quarterstaff',
        category: 'weapon' as const,
        quantity: 1,
        weight: 4,
        isEquipped: true,
        isAttuned: false,
        requiresAttunement: false,
      },
    ] as InventoryItem[],
    spellSelections: ['fire-bolt', 'mage-hand', 'light', 'magic-missile', 'shield', 'detect-magic'],
    isComplete: false,
    setStep: mockSetStep,
    setCharacterName: mockSetCharacterName,
    setRace: vi.fn(),
    setClass: vi.fn(),
    setAbilityScores: vi.fn(),
    setBackground: vi.fn(),
    setEquipment: vi.fn(),
    setSpells: vi.fn(),
    reset: mockReset,
  }
}

function createIncompleteWizardState() {
  return {
    currentStep: 7,
    characterName: '',
    raceSelection: null,
    classSelection: null,
    abilityScores: null,
    abilityScoreMethod: null,
    backgroundSelection: null,
    equipmentSelections: [],
    spellSelections: [],
    isComplete: false,
    setStep: mockSetStep,
    setCharacterName: mockSetCharacterName,
    setRace: vi.fn(),
    setClass: vi.fn(),
    setAbilityScores: vi.fn(),
    setBackground: vi.fn(),
    setEquipment: vi.fn(),
    setSpells: vi.fn(),
    reset: mockReset,
  }
}

// =============================================================================
// Helpers
// =============================================================================

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function createMockReviewData(overrides: Partial<ReviewData> = {}): ReviewData {
  return {
    characterName: 'Aldric Stoneshield',
    raceName: 'Human',
    subraceName: null,
    className: 'Fighter',
    subclassName: null,
    backgroundName: 'Soldier',
    alignment: 'True Neutral',
    level: 1,
    raceData: null,
    classData: null,
    backgroundData: null,
    baseAbilityScores: { strength: 15, dexterity: 13, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    effectiveAbilityScores: { strength: 16, dexterity: 13, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityModifiers: { strength: 3, dexterity: 1, constitution: 2, intelligence: 0, wisdom: 1, charisma: -1 },
    racialBonuses: { strength: 1 },
    proficiencyBonus: 2,
    armorClass: 16,
    initiative: 1,
    speed: 30,
    hpMax: 12,
    hitDie: '1d10',
    savingThrowProficiencies: ['strength', 'constitution'],
    savingThrowModifiers: { strength: 5, dexterity: 1, constitution: 4, intelligence: 0, wisdom: 1, charisma: -1 },
    skillProficiencies: ['athletics', 'perception'],
    skillModifiers: {
      'acrobatics': 1, 'animal-handling': 1, 'arcana': 0, 'athletics': 5,
      'deception': -1, 'history': 0, 'insight': 1, 'intimidation': -1,
      'investigation': 0, 'medicine': 1, 'nature': 0, 'perception': 3,
      'performance': -1, 'persuasion': -1, 'religion': 0, 'sleight-of-hand': 1,
      'stealth': 1, 'survival': 1,
    },
    passivePerception: 13,
    armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
    weaponProficiencies: ['simple melee', 'simple ranged', 'martial melee', 'martial ranged'],
    toolProficiencies: [],
    languages: ['common'],
    personalityTraits: ['I always have a plan.', 'I am always calm.'],
    ideal: 'Greater Good.',
    bond: 'I fight for others.',
    flaw: 'I have a weakness.',
    description: {
      age: '28', height: '6\'1"', weight: '210 lbs',
      eyes: 'Brown', skin: 'Tan', hair: 'Black',
      appearance: '', backstory: '', alliesAndOrgs: '',
    },
    equipment: [
      { name: 'Chain Mail', quantity: 1, weight: 55, isEquipped: true },
      { name: 'Longsword', quantity: 1, weight: 3, isEquipped: true },
      { name: 'Shield', quantity: 1, weight: 6, isEquipped: true },
    ],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    totalWeight: 64,
    isCaster: false,
    spellcastingAbility: null,
    spellSaveDC: 0,
    spellAttackBonus: 0,
    spellSlots: {},
    selectedSpells: [],
    cantrips: [],
    levelSpells: [],
    features: [
      { name: 'Second Wind', description: 'You have a limited well of stamina.', source: 'Fighter' },
    ],
    attacks: [
      { name: 'Longsword', attackBonus: 5, damage: '1d8+3', damageType: 'slashing' },
    ],
    ...overrides,
  }
}

function createCasterReviewData(overrides: Partial<ReviewData> = {}): ReviewData {
  return createMockReviewData({
    characterName: 'Elyndra Starweave',
    raceName: 'Elf',
    subraceName: 'High Elf',
    className: 'Wizard',
    backgroundName: 'Sage',
    effectiveAbilityScores: { strength: 8, dexterity: 16, constitution: 13, intelligence: 17, wisdom: 12, charisma: 10 },
    abilityModifiers: { strength: -1, dexterity: 3, constitution: 1, intelligence: 3, wisdom: 1, charisma: 0 },
    racialBonuses: { dexterity: 2, intelligence: 1 },
    armorClass: 13,
    initiative: 3,
    speed: 30,
    hpMax: 7,
    hitDie: '1d6',
    savingThrowProficiencies: ['intelligence', 'wisdom'],
    savingThrowModifiers: { strength: -1, dexterity: 3, constitution: 1, intelligence: 5, wisdom: 3, charisma: 0 },
    skillProficiencies: ['arcana', 'investigation', 'history', 'religion'],
    isCaster: true,
    spellcastingAbility: 'intelligence',
    spellSaveDC: 13,
    spellAttackBonus: 5,
    spellSlots: { 1: 2 },
    cantrips: [
      { id: 'fire-bolt', name: 'Fire Bolt', level: 0, school: 'evocation', castingTime: { value: 1, unit: 'action' as const }, range: { type: 'ranged' as const, distance: 120, unit: 'feet' as const }, components: { verbal: true, somatic: true, material: false }, duration: { type: 'instantaneous' as const }, description: 'You hurl a mote of fire at a creature or object.', concentration: false, ritual: false, classes: ['sorcerer', 'wizard'] },
      { id: 'mage-hand', name: 'Mage Hand', level: 0, school: 'conjuration', castingTime: { value: 1, unit: 'action' as const }, range: { type: 'ranged' as const, distance: 30, unit: 'feet' as const }, components: { verbal: true, somatic: true, material: false }, duration: { type: 'concentration' as const, value: 1, unit: 'minute' as const }, description: 'A spectral, floating hand appears.', concentration: true, ritual: false, classes: ['bard', 'sorcerer', 'warlock', 'wizard'] },
    ],
    levelSpells: [
      { id: 'magic-missile', name: 'Magic Missile', level: 1, school: 'evocation', castingTime: { value: 1, unit: 'action' as const }, range: { type: 'ranged' as const, distance: 120, unit: 'feet' as const }, components: { verbal: true, somatic: true, material: false }, duration: { type: 'instantaneous' as const }, description: 'You create three glowing darts of magical force.', concentration: false, ritual: false, classes: ['sorcerer', 'wizard'] },
      { id: 'shield', name: 'Shield', level: 1, school: 'abjuration', castingTime: { value: 1, unit: 'reaction' as const }, range: { type: 'self' as const }, components: { verbal: true, somatic: true, material: false }, duration: { type: 'timed' as const, value: 1, unit: 'round' as const }, description: 'An invisible barrier of magical force appears.', concentration: false, ritual: false, classes: ['sorcerer', 'wizard'] },
    ],
    attacks: [
      { name: 'Quarterstaff', attackBonus: 1, damage: '1d6-1', damageType: 'bludgeoning' },
    ],
    equipment: [
      { name: 'Quarterstaff', quantity: 1, weight: 4, isEquipped: true },
    ],
    totalWeight: 4,
    features: [
      { name: 'Arcane Recovery', description: 'You can regain some expended spell slots.', source: 'Wizard' },
    ],
    ...overrides,
  })
}

// =============================================================================
// Story 15.1 — Character Sheet Preview Tests
// =============================================================================

describe('Story 15.1 — Character Sheet Preview', () => {
  describe('CharacterPreviewPage1 (Core Stats)', () => {
    it('should render character header with name, class, race, background', () => {
      const data = createMockReviewData()
      render(<CharacterPreviewPage1 data={data} />)

      const header = screen.getByTestId('character-header')
      expect(header).toBeInTheDocument()
      expect(within(header).getByText('Aldric Stoneshield')).toBeInTheDocument()
      expect(within(header).getByText(/Level 1.*Fighter/)).toBeInTheDocument()
      expect(within(header).getByText('Human')).toBeInTheDocument()
      expect(within(header).getByText('Soldier')).toBeInTheDocument()
    })

    it('should render all 6 ability scores with modifiers', () => {
      const data = createMockReviewData()
      render(<CharacterPreviewPage1 data={data} />)

      const section = screen.getByTestId('ability-scores-section')
      expect(section).toBeInTheDocument()
      // Check for ability abbreviations
      expect(screen.getByText('STR')).toBeInTheDocument()
      expect(screen.getByText('DEX')).toBeInTheDocument()
      expect(screen.getByText('CON')).toBeInTheDocument()
      expect(screen.getByText('INT')).toBeInTheDocument()
      expect(screen.getByText('WIS')).toBeInTheDocument()
      expect(screen.getByText('CHA')).toBeInTheDocument()
    })

    it('should render saving throws with proficiency indicators', () => {
      const data = createMockReviewData()
      render(<CharacterPreviewPage1 data={data} />)

      const section = screen.getByTestId('saving-throws-section')
      expect(section).toBeInTheDocument()
      // Fighter has STR and CON save proficiency
      const profDots = within(section).getAllByTestId('proficiency-dot-proficient')
      expect(profDots.length).toBe(2)
    })

    it('should render all 18 skills with modifiers', () => {
      const data = createMockReviewData()
      render(<CharacterPreviewPage1 data={data} />)

      const section = screen.getByTestId('skills-section')
      expect(section).toBeInTheDocument()
      expect(screen.getByText('Athletics')).toBeInTheDocument()
      expect(screen.getByText('Perception')).toBeInTheDocument()
      expect(screen.getByText('Stealth')).toBeInTheDocument()
    })

    it('should render AC, initiative, and speed', () => {
      const data = createMockReviewData()
      render(<CharacterPreviewPage1 data={data} />)

      expect(screen.getByTestId('ac-value')).toHaveTextContent('16')
      expect(screen.getByTestId('initiative-value')).toHaveTextContent('+1')
      expect(screen.getByTestId('speed-value')).toHaveTextContent('30')
    })

    it('should render HP max', () => {
      const data = createMockReviewData()
      render(<CharacterPreviewPage1 data={data} />)

      expect(screen.getByTestId('hp-value')).toHaveTextContent('12')
    })

    it('should render attacks section with weapon details', () => {
      const data = createMockReviewData()
      render(<CharacterPreviewPage1 data={data} />)

      const section = screen.getByTestId('attacks-section')
      expect(within(section).getByText('Longsword')).toBeInTheDocument()
      expect(within(section).getByText(/\+5 to hit/)).toBeInTheDocument()
    })

    it('should render personality traits, ideals, bonds, flaws', () => {
      const data = createMockReviewData()
      render(<CharacterPreviewPage1 data={data} />)

      const section = screen.getByTestId('personality-section')
      expect(within(section).getByText('I always have a plan.')).toBeInTheDocument()
      expect(within(section).getByText('Greater Good.')).toBeInTheDocument()
      expect(within(section).getByText('I fight for others.')).toBeInTheDocument()
      expect(within(section).getByText('I have a weakness.')).toBeInTheDocument()
    })

    it('should render features list', () => {
      const data = createMockReviewData()
      render(<CharacterPreviewPage1 data={data} />)

      const section = screen.getByTestId('features-section')
      expect(within(section).getByText('Second Wind')).toBeInTheDocument()
      expect(within(section).getByText('(Fighter)')).toBeInTheDocument()
    })

    it('should show spellcasting summary for casters', () => {
      const data = createCasterReviewData()
      render(<CharacterPreviewPage1 data={data} />)

      const summary = screen.getByTestId('spellcasting-summary')
      expect(summary).toBeInTheDocument()
      expect(screen.getByTestId('spell-save-dc')).toHaveTextContent('13')
      expect(screen.getByTestId('spell-attack-bonus')).toHaveTextContent('+5')
    })

    it('should NOT show spellcasting summary for non-casters', () => {
      const data = createMockReviewData({ isCaster: false })
      render(<CharacterPreviewPage1 data={data} />)

      expect(screen.queryByTestId('spellcasting-summary')).not.toBeInTheDocument()
    })

    it('should display passive Perception', () => {
      const data = createMockReviewData({ passivePerception: 13 })
      render(<CharacterPreviewPage1 data={data} />)

      const label = screen.getByText('Passive Perception')
      expect(label).toBeInTheDocument()
      // The passive perception value is next to its label
      const container = label.closest('div')!
      expect(container).toHaveTextContent('13')
    })
  })

  describe('CharacterPreviewPage2 (Backstory & Details)', () => {
    it('should render appearance fields', () => {
      const data = createMockReviewData()
      render(<CharacterPreviewPage2 data={data} />)

      const section = screen.getByTestId('appearance-section')
      expect(within(section).getByText('28')).toBeInTheDocument()
      expect(within(section).getByText('Brown')).toBeInTheDocument()
      expect(within(section).getByText('Black')).toBeInTheDocument()
    })

    it('should render equipment inventory', () => {
      const data = createMockReviewData()
      render(<CharacterPreviewPage2 data={data} />)

      const section = screen.getByTestId('equipment-section')
      expect(within(section).getByText('Chain Mail')).toBeInTheDocument()
      expect(within(section).getByText('Longsword')).toBeInTheDocument()
      expect(within(section).getByText('Shield')).toBeInTheDocument()
    })

    it('should display total weight', () => {
      const data = createMockReviewData({ totalWeight: 64 })
      render(<CharacterPreviewPage2 data={data} />)

      expect(screen.getByTestId('total-weight')).toHaveTextContent('64.0 lb')
    })

    it('should render currency display', () => {
      const data = createMockReviewData()
      render(<CharacterPreviewPage2 data={data} />)

      expect(screen.getByTestId('currency-section')).toBeInTheDocument()
    })

    it('should render proficiencies section with languages', () => {
      const data = createMockReviewData({ languages: ['common', 'dwarvish'] })
      render(<CharacterPreviewPage2 data={data} />)

      expect(screen.getByTestId('proficiencies-section')).toBeInTheDocument()
      expect(screen.getByText(/common, dwarvish/i)).toBeInTheDocument()
    })

    it('should show empty backstory placeholder', () => {
      const data = createMockReviewData()
      render(<CharacterPreviewPage2 data={data} />)

      expect(screen.getByText('No backstory written yet.')).toBeInTheDocument()
    })
  })

  describe('CharacterPreviewPage3 (Spellcasting)', () => {
    it('should render spellcasting header with class and ability', () => {
      const data = createCasterReviewData()
      render(<CharacterPreviewPage3 data={data} />)

      expect(screen.getByTestId('spellcasting-class')).toHaveTextContent('Wizard')
      expect(screen.getByTestId('spellcasting-ability')).toHaveTextContent('intelligence')
    })

    it('should render spell save DC and attack bonus', () => {
      const data = createCasterReviewData()
      render(<CharacterPreviewPage3 data={data} />)

      expect(screen.getByTestId('spell-dc')).toHaveTextContent('13')
      expect(screen.getByTestId('spell-attack')).toHaveTextContent('+5')
    })

    it('should render cantrips', () => {
      const data = createCasterReviewData()
      render(<CharacterPreviewPage3 data={data} />)

      const section = screen.getByTestId('cantrips-section')
      expect(within(section).getByText('Fire Bolt')).toBeInTheDocument()
      expect(within(section).getByText('Mage Hand')).toBeInTheDocument()
    })

    it('should render spell slots', () => {
      const data = createCasterReviewData()
      render(<CharacterPreviewPage3 data={data} />)

      const section = screen.getByTestId('spell-slots-section')
      expect(within(section).getByText('2')).toBeInTheDocument()
      expect(within(section).getByText('1st Level')).toBeInTheDocument()
    })

    it('should render known spells with school and description', () => {
      const data = createCasterReviewData()
      render(<CharacterPreviewPage3 data={data} />)

      const section = screen.getByTestId('level-spells-section')
      expect(within(section).getByText('Magic Missile')).toBeInTheDocument()
      expect(within(section).getByText('Shield')).toBeInTheDocument()
      expect(within(section).getByText(/evocation/i)).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    beforeEach(() => {
      mockWizardState = createWizardWizardState()
    })

    it('should render Core Stats, Backstory, and Spellcasting tabs for casters', () => {
      renderWithProviders(<ReviewStep />)

      expect(screen.getByTestId('tab-core')).toBeInTheDocument()
      expect(screen.getByTestId('tab-backstory')).toBeInTheDocument()
      expect(screen.getByTestId('tab-spellcasting')).toBeInTheDocument()
    })

    it('should NOT show Spellcasting tab for non-casters', () => {
      mockWizardState = createFighterWizardState()
      renderWithProviders(<ReviewStep />)

      expect(screen.getByTestId('tab-core')).toBeInTheDocument()
      expect(screen.getByTestId('tab-backstory')).toBeInTheDocument()
      expect(screen.queryByTestId('tab-spellcasting')).not.toBeInTheDocument()
    })

    it('should switch between tabs on click', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ReviewStep />)

      // Initially on Core Stats
      expect(screen.getByTestId('preview-page-1')).toBeInTheDocument()

      // Click Backstory tab
      await user.click(screen.getByTestId('tab-backstory'))
      expect(screen.getByTestId('preview-page-2')).toBeInTheDocument()
      expect(screen.queryByTestId('preview-page-1')).not.toBeInTheDocument()
    })
  })
})

// =============================================================================
// Story 15.2 — Validation Summary Tests
// =============================================================================

describe('Story 15.2 — Validation Summary', () => {
  it('should show errors for incomplete character state', () => {
    mockWizardState = createIncompleteWizardState()
    renderWithProviders(<ValidationSummary />)

    expect(screen.getByTestId('validation-summary')).toBeInTheDocument()
    expect(screen.getByTestId('validation-count')).toHaveTextContent(/error/)
  })

  it('should show errors in red', () => {
    mockWizardState = createIncompleteWizardState()
    renderWithProviders(<ValidationSummary />)

    // Expand if collapsed
    const toggle = screen.getByTestId('validation-toggle')
    if (screen.queryByTestId('validation-details') === null) {
      toggle.click()
    }

    const errors = screen.getAllByTestId('validation-error')
    expect(errors.length).toBeGreaterThan(0)
  })

  it('should show warnings in yellow for missing optional fields', async () => {
    const state = createFighterWizardState()
    mockWizardState = {
      ...state,
      characterName: '',
      equipmentSelections: [],
    }
    const user = userEvent.setup()
    renderWithProviders(<ValidationSummary />)

    // Expand
    const toggle = screen.getByTestId('validation-toggle')
    await user.click(toggle)

    const warnings = screen.queryAllByTestId('validation-warning')
    expect(warnings.length).toBeGreaterThan(0)
  })

  it('should show celebratory message when fully valid', () => {
    mockWizardState = createFighterWizardState()
    renderWithProviders(<ValidationSummary />)

    expect(screen.getByTestId('validation-count')).toHaveTextContent(
      /ready for adventure/i,
    )
  })

  it('should show Fix buttons that navigate to relevant steps', async () => {
    mockWizardState = createIncompleteWizardState()
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    renderWithProviders(<ValidationSummary onNavigateToStep={onNavigate} />)

    // The validation summary for an incomplete state should auto-expand
    // because hasErrors is true at initial render. But the isExpanded state
    // uses useState(hasErrors). Let's ensure it's expanded by clicking toggle.
    const toggle = screen.getByTestId('validation-toggle')
    // First check if already expanded
    if (!screen.queryByTestId('validation-details')) {
      await user.click(toggle)
    }

    const fixButtons = screen.getAllByTestId('fix-button')
    expect(fixButtons.length).toBeGreaterThan(0)

    await user.click(fixButtons[0])
    expect(onNavigate).toHaveBeenCalled()
  })

  it('should be collapsible', async () => {
    mockWizardState = createFighterWizardState()
    const user = userEvent.setup()
    renderWithProviders(<ValidationSummary />)

    const toggle = screen.getByTestId('validation-toggle')
    // Toggle open
    await user.click(toggle)
    expect(screen.getByTestId('validation-details')).toBeInTheDocument()

    // Toggle close
    await user.click(toggle)
    expect(screen.queryByTestId('validation-details')).not.toBeInTheDocument()
  })

  it('should display error count in summary', () => {
    mockWizardState = createIncompleteWizardState()
    renderWithProviders(<ValidationSummary />)

    // Should have multiple errors for missing race, class, abilities, background
    const countText = screen.getByTestId('validation-count').textContent
    expect(countText).toMatch(/\d+ error/)
  })
})

// =============================================================================
// Story 15.3 — Save & Character Assembly Tests
// =============================================================================

describe('Story 15.3 — Save & Character Assembly', () => {
  beforeEach(() => {
    mockWizardState = createFighterWizardState()
    mockMutateAsync.mockReset()
    mockNavigate.mockReset()
    mockReset.mockReset()
    mockSetStep.mockReset()
  })

  it('should disable Save button when validation errors exist', () => {
    mockWizardState = createIncompleteWizardState()
    renderWithProviders(<ReviewStep />)

    const saveButton = screen.getByTestId('save-button')
    expect(saveButton).toBeDisabled()
  })

  it('should enable Save button when no validation errors', () => {
    renderWithProviders(<ReviewStep />)

    const saveButton = screen.getByTestId('save-button')
    expect(saveButton).not.toBeDisabled()
  })

  it('should show tooltip when save is disabled', () => {
    mockWizardState = createIncompleteWizardState()
    renderWithProviders(<ReviewStep />)

    expect(screen.getByTestId('save-disabled-tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('save-disabled-tooltip')).toHaveTextContent(/Fix.*error/)
  })

  it('should call API mutation on Save Character click', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'new-char-001' })
    const user = userEvent.setup()
    renderWithProviders(<ReviewStep />)

    await user.click(screen.getByTestId('save-button'))

    expect(mockMutateAsync).toHaveBeenCalledTimes(1)
  })

  it('should show celebration on successful save', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'new-char-001' })
    const user = userEvent.setup()
    renderWithProviders(<ReviewStep />)

    await user.click(screen.getByTestId('save-button'))

    await waitFor(() => {
      expect(screen.getByTestId('save-celebration')).toBeInTheDocument()
    })
    expect(screen.getByTestId('celebration-title')).toHaveTextContent('Your Adventurer is Ready!')
  })

  it('should show character name in celebration', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'new-char-001' })
    const user = userEvent.setup()
    renderWithProviders(<ReviewStep />)

    await user.click(screen.getByTestId('save-button'))

    await waitFor(() => {
      expect(screen.getByTestId('celebration-character-name')).toHaveTextContent('Aldric Stoneshield')
    })
  })

  it('should show error message with retry on save failure', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()
    renderWithProviders(<ReviewStep />)

    await user.click(screen.getByTestId('save-button'))

    await waitFor(() => {
      expect(screen.getByTestId('save-error')).toBeInTheDocument()
    })
    expect(screen.getByText('Network error')).toBeInTheDocument()
    expect(screen.getByTestId('retry-button')).toBeInTheDocument()
  })

  it('should show JSON export fallback on save failure', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Server error'))
    const user = userEvent.setup()
    renderWithProviders(<ReviewStep />)

    await user.click(screen.getByTestId('save-button'))

    await waitFor(() => {
      expect(screen.getByTestId('export-json-button')).toBeInTheDocument()
    })
  })

  it('should render Save & Create Another button', () => {
    renderWithProviders(<ReviewStep />)

    expect(screen.getByTestId('save-create-another-button')).toBeInTheDocument()
  })

  it('should render Go Back & Edit button', () => {
    renderWithProviders(<ReviewStep />)

    expect(screen.getByTestId('go-back-button')).toBeInTheDocument()
  })

  it('should navigate back on Go Back & Edit click', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ReviewStep />)

    await user.click(screen.getByTestId('go-back-button'))

    expect(mockSetStep).toHaveBeenCalled()
  })
})

// =============================================================================
// Story 15.4 — Quick Edit from Review Tests
// =============================================================================

describe('Story 15.4 — Quick Edit from Review', () => {
  beforeEach(() => {
    mockWizardState = createFighterWizardState()
  })

  describe('EditableSection', () => {
    it('should render children without edit button when no onEdit', () => {
      render(
        <EditableSection stepId={1} label="Race">
          <div data-testid="child-content">Content</div>
        </EditableSection>,
      )

      expect(screen.getByTestId('child-content')).toBeInTheDocument()
      expect(screen.queryByTestId('edit-button-1')).not.toBeInTheDocument()
    })

    it('should render edit button when onEdit provided', () => {
      const onEdit = vi.fn()
      render(
        <EditableSection stepId={3} label="Ability Scores" onEdit={onEdit}>
          <div>Content</div>
        </EditableSection>,
      )

      expect(screen.getByTestId('edit-button-3')).toBeInTheDocument()
    })

    it('should call onEdit with correct step id', async () => {
      const onEdit = vi.fn()
      const user = userEvent.setup()
      render(
        <EditableSection stepId={3} label="Ability Scores" onEdit={onEdit}>
          <div>Content</div>
        </EditableSection>,
      )

      await user.click(screen.getByTestId('edit-button-3'))
      expect(onEdit).toHaveBeenCalledWith(3)
    })
  })

  describe('InlineNameEdit', () => {
    it('should display character name', () => {
      mockWizardState = createFighterWizardState()
      renderWithProviders(<InlineNameEdit />)

      expect(screen.getByTestId('inline-name-display')).toHaveTextContent('Aldric Stoneshield')
    })

    it('should show input on click', async () => {
      mockWizardState = createFighterWizardState()
      const user = userEvent.setup()
      renderWithProviders(<InlineNameEdit />)

      await user.click(screen.getByTestId('inline-name-display'))

      expect(screen.getByTestId('inline-name-input')).toBeInTheDocument()
    })

    it('should display "Unnamed Adventurer" when name is empty', () => {
      mockWizardState = { ...createFighterWizardState(), characterName: '' }
      renderWithProviders(<InlineNameEdit />)

      expect(screen.getByTestId('inline-name-display')).toHaveTextContent('Unnamed Adventurer')
    })

    it('should save name on Enter key', async () => {
      mockWizardState = createFighterWizardState()
      const user = userEvent.setup()
      renderWithProviders(<InlineNameEdit />)

      await user.click(screen.getByTestId('inline-name-display'))
      const input = screen.getByTestId('inline-name-input')
      await user.clear(input)
      await user.type(input, 'New Name{Enter}')

      expect(mockSetCharacterName).toHaveBeenCalledWith('New Name')
    })
  })

  describe('QuickEditModal', () => {
    it('should open modal with correct step component when edit icon is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ReviewStep />)

      // Find an edit button (step 3 = abilities)
      const editButton = screen.getByTestId('edit-button-3')
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByTestId('quick-edit-modal')).toBeInTheDocument()
      })
      expect(screen.getByTestId('mock-abilities-step')).toBeInTheDocument()
    })

    it('should close modal on Cancel click', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ReviewStep />)

      // Open modal
      const editButton = screen.getByTestId('edit-button-3')
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByTestId('quick-edit-modal')).toBeInTheDocument()
      })

      // Cancel
      await user.click(screen.getByTestId('modal-cancel-button'))

      await waitFor(() => {
        expect(screen.queryByTestId('quick-edit-modal')).not.toBeInTheDocument()
      })
    })

    it('should close modal on Save Changes click', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ReviewStep />)

      // Open modal
      const editButton = screen.getByTestId('edit-button-3')
      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByTestId('quick-edit-modal')).toBeInTheDocument()
      })

      // Save
      await user.click(screen.getByTestId('modal-save-button'))

      await waitFor(() => {
        expect(screen.queryByTestId('quick-edit-modal')).not.toBeInTheDocument()
      })
    })
  })
})

// =============================================================================
// SaveCelebration Tests
// =============================================================================

describe('SaveCelebration', () => {
  it('should render character name and details', () => {
    const onDismiss = vi.fn()
    render(
      <SaveCelebration
        characterName="Aldric"
        raceName="Human"
        className="Fighter"
        onDismiss={onDismiss}
      />,
    )

    expect(screen.getByTestId('celebration-title')).toHaveTextContent('Your Adventurer is Ready!')
    expect(screen.getByTestId('celebration-character-name')).toHaveTextContent('Aldric')
    expect(screen.getByText('Human Fighter')).toBeInTheDocument()
  })

  it('should call onDismiss on click', async () => {
    const onDismiss = vi.fn()
    const user = userEvent.setup()
    render(
      <SaveCelebration
        characterName="Aldric"
        raceName="Human"
        className="Fighter"
        onDismiss={onDismiss}
      />,
    )

    await user.click(screen.getByTestId('save-celebration'))
    expect(onDismiss).toHaveBeenCalled()
  })

  it('should auto-dismiss after timeout', async () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(
      <SaveCelebration
        characterName="Aldric"
        raceName="Human"
        className="Fighter"
        onDismiss={onDismiss}
      />,
    )

    vi.advanceTimersByTime(3000)
    expect(onDismiss).toHaveBeenCalled()
    vi.useRealTimers()
  })
})

// =============================================================================
// Integration: ReviewStep renders correctly
// =============================================================================

describe('ReviewStep Integration', () => {
  it('should render the full review step with all sections', () => {
    mockWizardState = createFighterWizardState()
    renderWithProviders(<ReviewStep />)

    expect(screen.getByTestId('review-step')).toBeInTheDocument()
    expect(screen.getByTestId('review-header')).toBeInTheDocument()
    expect(screen.getByTestId('validation-summary')).toBeInTheDocument()
    expect(screen.getByTestId('preview-tabs')).toBeInTheDocument()
    expect(screen.getByTestId('preview-content')).toBeInTheDocument()
    expect(screen.getByTestId('save-actions')).toBeInTheDocument()
  })

  it('should report validation state via onValidationChange', () => {
    mockWizardState = createFighterWizardState()
    const onValidationChange = vi.fn()
    renderWithProviders(<ReviewStep onValidationChange={onValidationChange} />)

    expect(onValidationChange).toHaveBeenCalledWith(
      expect.objectContaining({ valid: true, errors: [] }),
    )
  })

  it('should report invalid state for incomplete characters', () => {
    mockWizardState = createIncompleteWizardState()
    const onValidationChange = vi.fn()
    renderWithProviders(<ReviewStep onValidationChange={onValidationChange} />)

    expect(onValidationChange).toHaveBeenCalledWith(
      expect.objectContaining({ valid: false }),
    )
  })
})
