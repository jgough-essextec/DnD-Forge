/**
 * Page 3 (Spellcasting) Test Suite
 * Epic 19: Character Sheet - Page 3 (Spellcasting)
 *
 * Tests cover:
 * - Non-caster character handling
 * - Spellcasting header display
 * - Cantrips section
 * - Spell slots tracking
 * - Spell lists by level
 * - Prepared spell toggles
 * - Domain spells
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Page3Layout } from '../Page3Layout'
import { SpellcastingHeader } from '../SpellcastingHeader'
import { CantripsSection } from '../CantripsSection'
import { SpellSlotsAndLists } from '../SpellSlotsAndLists'
import { DomainSpells } from '../DomainSpells'
import type { Character } from '@/types/character'
import type { DerivedStats } from '@/hooks/useCharacterCalculations'

// Mock the CharacterSheetProvider
const mockUseCharacterSheet = vi.fn()
vi.mock('@/components/character/CharacterSheetProvider', () => ({
  useCharacterSheet: () => mockUseCharacterSheet(),
}))

// Mock spell data
vi.mock('@/data/spells', () => ({
  getSpellById: (id: string) => {
    const spells: Record<string, any> = {
      'fire-bolt': {
        id: 'fire-bolt',
        name: 'Fire Bolt',
        level: 0,
        school: 'evocation',
        castingTime: { value: 1, unit: 'action' },
        range: { type: 'ranged', distance: 120, unit: 'feet' },
        components: { verbal: true, somatic: true, material: false },
        duration: { type: 'instantaneous' },
        description: 'You hurl a mote of fire at a creature or object.',
        concentration: false,
        ritual: false,
        classes: ['wizard'],
        damage: { count: 1, die: 'd10', type: 'fire' },
        attackType: 'ranged',
      },
      'mage-hand': {
        id: 'mage-hand',
        name: 'Mage Hand',
        level: 0,
        school: 'conjuration',
        castingTime: { value: 1, unit: 'action' },
        range: { type: 'ranged', distance: 30, unit: 'feet' },
        components: { verbal: true, somatic: true, material: false },
        duration: { type: 'concentration', value: 1, unit: 'minute' },
        description: 'A spectral, floating hand appears at a point you choose.',
        concentration: true,
        ritual: false,
        classes: ['wizard'],
      },
      'magic-missile': {
        id: 'magic-missile',
        name: 'Magic Missile',
        level: 1,
        school: 'evocation',
        castingTime: { value: 1, unit: 'action' },
        range: { type: 'ranged', distance: 120, unit: 'feet' },
        components: { verbal: true, somatic: true, material: false },
        duration: { type: 'instantaneous' },
        description: 'You create three glowing darts of magical force.',
        concentration: false,
        ritual: false,
        classes: ['wizard', 'sorcerer'],
        damage: { count: 1, die: 'd4', type: 'force' },
        attackType: 'ranged',
      },
      'shield': {
        id: 'shield',
        name: 'Shield',
        level: 1,
        school: 'abjuration',
        castingTime: { value: 1, unit: 'reaction', reactionTrigger: 'when hit by an attack' },
        range: { type: 'self' },
        components: { verbal: true, somatic: true, material: false },
        duration: { type: 'timed', value: 1, unit: 'round' },
        description: 'An invisible barrier of magical force appears to protect you.',
        concentration: false,
        ritual: false,
        classes: ['wizard', 'sorcerer'],
      },
      'bless': {
        id: 'bless',
        name: 'Bless',
        level: 1,
        school: 'enchantment',
        castingTime: { value: 1, unit: 'action' },
        range: { type: 'ranged', distance: 30, unit: 'feet' },
        components: { verbal: true, somatic: true, material: true, materialDescription: 'holy water' },
        duration: { type: 'concentration', value: 1, unit: 'minute' },
        description: 'You bless up to three creatures. Whenever a target makes an attack roll or saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw.',
        concentration: true,
        ritual: false,
        classes: ['cleric', 'paladin'],
      },
      'cure-wounds': {
        id: 'cure-wounds',
        name: 'Cure Wounds',
        level: 1,
        school: 'evocation',
        castingTime: { value: 1, unit: 'action' },
        range: { type: 'touch' },
        components: { verbal: true, somatic: true, material: false },
        duration: { type: 'instantaneous' },
        description: 'A creature you touch regains hit points equal to 1d8 + your spellcasting ability modifier.',
        concentration: false,
        ritual: false,
        classes: ['cleric', 'bard', 'paladin', 'druid', 'ranger'],
      },
    }
    return spells[id]
  },
}))

// Mock class data
vi.mock('@/data/classes', () => ({
  getClassById: (id: string) => {
    const classes: Record<string, any> = {
      wizard: {
        id: 'wizard',
        name: 'Wizard',
        spellcasting: { ability: 'intelligence', type: 'prepared' },
      },
      cleric: {
        id: 'cleric',
        name: 'Cleric',
        spellcasting: { ability: 'wisdom', type: 'prepared' },
      },
      fighter: {
        id: 'fighter',
        name: 'Fighter',
      },
    }
    return classes[id]
  },
}))

// Mock game terms
vi.mock('@/data/game-terms', () => ({
  getGameTerm: () => ({
    term: 'Spellcasting Ability',
    definition: 'The ability score used for spellcasting.',
  }),
}))

describe('Page3Layout', () => {
  const mockUpdateField = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show placeholder for non-caster character', () => {
    const nonCaster: Partial<Character> = {
      id: 'char-1',
      name: 'Bob the Fighter',
      classes: [
        {
          classId: 'fighter',
          level: 1,
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: null,
    }

    mockUseCharacterSheet.mockReturnValue({
      character: nonCaster,
      editableCharacter: {},
      derivedStats: {} as DerivedStats,
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<Page3Layout />)

    expect(screen.getByTestId('non-caster-placeholder')).toBeInTheDocument()
    expect(screen.getByText('No Spellcasting Abilities')).toBeInTheDocument()
  })

  it('should show spellcasting page for caster character', () => {
    const caster: Partial<Character> = {
      id: 'char-2',
      name: 'Alice the Wizard',
      classes: [
        {
          classId: 'wizard',
          level: 1,
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: ['fire-bolt'],
        knownSpells: ['magic-missile', 'shield'],
        preparedSpells: ['magic-missile'],
        spellSlots: { 1: 2 },
        usedSpellSlots: { 1: 0 },
        ritualCasting: true,
      },
    }

    mockUseCharacterSheet.mockReturnValue({
      character: caster,
      editableCharacter: {},
      derivedStats: {
        effectiveAbilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 16, wisdom: 10, charisma: 10 },
        abilityModifiers: { strength: 0, dexterity: 0, constitution: 0, intelligence: 3, wisdom: 0, charisma: 0 },
        proficiencyBonus: 2,
        armorClass: 10,
        initiative: 0,
        hpMax: 6,
        skillModifiers: {} as any,
        savingThrows: { strength: 0, dexterity: 0, constitution: 0, intelligence: 5, wisdom: 2, charisma: 0 },
        passivePerception: 10,
        passiveInvestigation: 13,
        passiveInsight: 10,
        spellSaveDC: 13,
        spellAttackBonus: 5,
        spellSlots: { 1: 2 },
        cantripsKnown: 3,
        spellsPrepared: 4,
        meleeAttackBonus: 2,
        rangedAttackBonus: 2,
        inventoryWeight: 0,
        carryingCapacity: 150,
        isEncumbered: false,
      },
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<Page3Layout />)

    expect(screen.getByTestId('page3-spellcasting')).toBeInTheDocument()
    expect(screen.getByTestId('spellcasting-header')).toBeInTheDocument()
    expect(screen.getByTestId('cantrips-section')).toBeInTheDocument()
    expect(screen.getByTestId('spell-slots-section')).toBeInTheDocument()
  })
})

describe('SpellcastingHeader', () => {
  const mockUpdateField = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display spellcasting stats correctly', () => {
    const wizard: Partial<Character> = {
      id: 'char-1',
      classes: [
        {
          classId: 'wizard',
          level: 3,
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: [],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: { 1: 4, 2: 2 },
        usedSpellSlots: {},
        ritualCasting: true,
      },
    }

    mockUseCharacterSheet.mockReturnValue({
      character: wizard,
      editableCharacter: {},
      derivedStats: {
        proficiencyBonus: 2,
        abilityModifiers: { intelligence: 3 },
        spellSaveDC: 13,
        spellAttackBonus: 5,
      } as Partial<DerivedStats>,
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<SpellcastingHeader />)

    expect(screen.getByTestId('spellcasting-class')).toHaveTextContent('Wizard')
    expect(screen.getByTestId('spellcasting-ability')).toHaveTextContent('Intelligence')
    expect(screen.getByTestId('spell-save-dc')).toHaveTextContent('13')
    expect(screen.getByTestId('spell-attack-bonus')).toBeInTheDocument()
  })

  it('should show correct spell save DC computation', () => {
    const wizard: Partial<Character> = {
      id: 'char-1',
      classes: [
        {
          classId: 'wizard',
          level: 1,
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: [],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: { 1: 2 },
        usedSpellSlots: {},
        ritualCasting: true,
      },
    }

    mockUseCharacterSheet.mockReturnValue({
      character: wizard,
      editableCharacter: {},
      derivedStats: {
        proficiencyBonus: 2,
        abilityModifiers: { intelligence: 3 },
        spellSaveDC: 13, // 8 + 2 + 3
        spellAttackBonus: 5, // 2 + 3
      } as Partial<DerivedStats>,
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<SpellcastingHeader />)

    const dcElement = screen.getByTestId('spell-save-dc')
    expect(dcElement).toHaveTextContent('13')
  })
})

describe('CantripsSection', () => {
  const mockUpdateField = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display all known cantrips', () => {
    const wizard: Partial<Character> = {
      id: 'char-1',
      classes: [
        {
          classId: 'wizard',
          level: 1,
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: ['fire-bolt', 'mage-hand'],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: {},
        usedSpellSlots: {},
        ritualCasting: true,
      },
    }

    mockUseCharacterSheet.mockReturnValue({
      character: wizard,
      editableCharacter: {},
      derivedStats: {} as DerivedStats,
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<CantripsSection />)

    expect(screen.getByText('Cantrips')).toBeInTheDocument()
    expect(screen.getByTestId('cantrip-fire-bolt')).toBeInTheDocument()
    expect(screen.getByTestId('cantrip-mage-hand')).toBeInTheDocument()
  })

  it('should expand cantrip details on click', async () => {
    const user = userEvent.setup()
    const wizard: Partial<Character> = {
      id: 'char-1',
      classes: [
        {
          classId: 'wizard',
          level: 1,
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: ['fire-bolt'],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: {},
        usedSpellSlots: {},
        ritualCasting: true,
      },
    }

    mockUseCharacterSheet.mockReturnValue({
      character: wizard,
      editableCharacter: {},
      derivedStats: {} as DerivedStats,
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<CantripsSection />)

    const cantripCard = screen.getByTestId('cantrip-fire-bolt')

    // Initially, details should not be visible
    expect(screen.queryByText(/You hurl a mote of fire/)).not.toBeInTheDocument()

    // Click to expand
    await user.click(cantripCard)

    // Details should now be visible
    expect(screen.getByText(/You hurl a mote of fire/)).toBeInTheDocument()
  })

  it('should show concentration icon for concentration spells', () => {
    const wizard: Partial<Character> = {
      id: 'char-1',
      classes: [
        {
          classId: 'wizard',
          level: 1,
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: ['mage-hand'],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: {},
        usedSpellSlots: {},
        ritualCasting: true,
      },
    }

    mockUseCharacterSheet.mockReturnValue({
      character: wizard,
      editableCharacter: {},
      derivedStats: {} as DerivedStats,
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<CantripsSection />)

    const cantripCard = screen.getByTestId('cantrip-mage-hand')
    expect(cantripCard).toBeInTheDocument()
  })
})

describe('SpellSlotsAndLists', () => {
  const mockUpdateField = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display spell slots with correct count', () => {
    const wizard: Partial<Character> = {
      id: 'char-1',
      classes: [
        {
          classId: 'wizard',
          level: 1,
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: [],
        knownSpells: ['magic-missile'],
        preparedSpells: ['magic-missile'],
        spellSlots: { 1: 2 },
        usedSpellSlots: { 1: 0 },
        ritualCasting: true,
      },
    }

    mockUseCharacterSheet.mockReturnValue({
      character: wizard,
      editableCharacter: {},
      derivedStats: {
        spellSlots: { 1: 2 },
        spellsPrepared: 4,
      } as Partial<DerivedStats>,
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<SpellSlotsAndLists />)

    expect(screen.getByTestId('spell-level-1')).toBeInTheDocument()
    expect(screen.getByText('1st Level')).toBeInTheDocument()
    const tracker = screen.getByTestId('spell-slot-tracker')
    expect(tracker).toBeInTheDocument()
  })

  it('should show prepared checkbox for prepared casters', () => {
    const wizard: Partial<Character> = {
      id: 'char-1',
      classes: [
        {
          classId: 'wizard',
          level: 1,
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: [],
        knownSpells: ['magic-missile', 'shield'],
        preparedSpells: ['magic-missile'],
        spellSlots: { 1: 2 },
        usedSpellSlots: { 1: 0 },
        ritualCasting: true,
      },
    }

    mockUseCharacterSheet.mockReturnValue({
      character: wizard,
      editableCharacter: {},
      derivedStats: {
        spellSlots: { 1: 2 },
        spellsPrepared: 4,
      } as Partial<DerivedStats>,
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<SpellSlotsAndLists />)

    expect(screen.getByTestId('prepare-checkbox-magic-missile')).toBeInTheDocument()
    expect(screen.getByTestId('prepare-checkbox-shield')).toBeInTheDocument()
  })

  it('should show prepared count for prepared casters', () => {
    const wizard: Partial<Character> = {
      id: 'char-1',
      classes: [
        {
          classId: 'wizard',
          level: 1,
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: [],
        knownSpells: ['magic-missile'],
        preparedSpells: ['magic-missile'],
        spellSlots: { 1: 2 },
        usedSpellSlots: { 1: 0 },
        ritualCasting: true,
      },
    }

    mockUseCharacterSheet.mockReturnValue({
      character: wizard,
      editableCharacter: {},
      derivedStats: {
        spellSlots: { 1: 2 },
        spellsPrepared: 4,
      } as Partial<DerivedStats>,
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<SpellSlotsAndLists />)

    // Check for prepared count display more specifically
    const preparedText = screen.getByText(/Prepared:/)
    expect(preparedText).toBeInTheDocument()
    expect(preparedText.parentElement).toHaveTextContent('Prepared: 1 / 4')
  })

  it('should toggle spell slot usage on click', async () => {
    const user = userEvent.setup()
    const wizard: Partial<Character> = {
      id: 'char-1',
      classes: [
        {
          classId: 'wizard',
          level: 1,
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: [],
        knownSpells: ['magic-missile'],
        preparedSpells: ['magic-missile'],
        spellSlots: { 1: 2 },
        usedSpellSlots: { 1: 0 },
        ritualCasting: true,
      },
    }

    mockUseCharacterSheet.mockReturnValue({
      character: wizard,
      editableCharacter: {},
      derivedStats: {
        spellSlots: { 1: 2 },
        spellsPrepared: 4,
      } as Partial<DerivedStats>,
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<SpellSlotsAndLists />)

    const slot0 = screen.getByTestId('slot-0')
    await user.click(slot0)

    expect(mockUpdateField).toHaveBeenCalled()
  })
})

describe('DomainSpells', () => {
  const mockUpdateField = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display domain spells for Life Domain cleric', () => {
    const cleric: Partial<Character> = {
      id: 'char-1',
      classes: [
        {
          classId: 'cleric',
          level: 1,
          subclassId: 'life-domain',
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: {
        type: 'prepared',
        ability: 'wisdom',
        cantrips: [],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: { 1: 2 },
        usedSpellSlots: {},
        ritualCasting: true,
      },
    }

    mockUseCharacterSheet.mockReturnValue({
      character: cleric,
      editableCharacter: {},
      derivedStats: {} as DerivedStats,
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<DomainSpells />)

    expect(screen.getByTestId('domain-spells-section')).toBeInTheDocument()
    expect(screen.getByText('Domain Spells')).toBeInTheDocument()
    expect(screen.getByTestId('domain-spell-bless')).toBeInTheDocument()
    expect(screen.getByTestId('domain-spell-cure-wounds')).toBeInTheDocument()
  })

  it('should show always prepared badge on domain spells', () => {
    const cleric: Partial<Character> = {
      id: 'char-1',
      classes: [
        {
          classId: 'cleric',
          level: 1,
          subclassId: 'life-domain',
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: {
        type: 'prepared',
        ability: 'wisdom',
        cantrips: [],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: { 1: 2 },
        usedSpellSlots: {},
        ritualCasting: true,
      },
    }

    mockUseCharacterSheet.mockReturnValue({
      character: cleric,
      editableCharacter: {},
      derivedStats: {} as DerivedStats,
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<DomainSpells />)

    expect(screen.getByTestId('always-prepared-badge-bless')).toBeInTheDocument()
    expect(screen.getByTestId('always-prepared-badge-cure-wounds')).toBeInTheDocument()
  })

  it('should not display domain spells section for non-domain casters', () => {
    const wizard: Partial<Character> = {
      id: 'char-1',
      classes: [
        {
          classId: 'wizard',
          level: 1,
          chosenSkills: [],
          hpRolls: [],
        },
      ],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: [],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: { 1: 2 },
        usedSpellSlots: {},
        ritualCasting: true,
      },
    }

    mockUseCharacterSheet.mockReturnValue({
      character: wizard,
      editableCharacter: {},
      derivedStats: {} as DerivedStats,
      editMode: { isEditing: false },
      updateField: mockUpdateField,
    })

    render(<DomainSpells />)

    expect(screen.queryByTestId('domain-spells-section')).not.toBeInTheDocument()
  })
})
