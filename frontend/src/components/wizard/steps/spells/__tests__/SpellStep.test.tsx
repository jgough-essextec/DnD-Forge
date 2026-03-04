// =============================================================================
// Comprehensive tests for Epic 14 -- Spellcasting Wizard Step
// Covers cantrip selection, spell selection for different casting systems,
// spell detail display, filtering, validation, and store integration.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpellStep, validateSpellStep, type SpellStepState } from '../SpellStep'
import { SpellDetailCard, formatSpellLevel, formatCastingTime, formatRange, formatDuration, formatComponents } from '../SpellDetailCard'
import { SpellFilterBar, DEFAULT_SPELL_FILTERS, type SpellFilters } from '../SpellFilterBar'
import { CantripSelector } from '../CantripSelector'
import { SpellSelector } from '../SpellSelector'
import { SPELLS, getSpellsByClass } from '@/data/spells'
import { CLASSES } from '@/data/classes'
import { getCantripsKnown, getSpellsKnownOrPrepared } from '@/utils/calculations/spellcasting'
import type { Spell } from '@/types/spell'

// -- Store Mock ---------------------------------------------------------------

const mockSetSpells = vi.fn()
const mockState = {
  classSelection: null as { classId: string; level: number; chosenSkills: string[]; hpRolls: number[] } | null,
  abilityScores: null as Record<string, number> | null,
  spellSelections: [] as string[],
  setSpells: mockSetSpells,
}

vi.mock('@/stores/wizardStore', () => ({
  useWizardStore: (selector: (s: typeof mockState) => unknown) => selector(mockState),
}))

function setMockStore(overrides: Partial<typeof mockState>) {
  Object.assign(mockState, overrides)
}

beforeEach(() => {
  vi.clearAllMocks()
  setMockStore({
    classSelection: null,
    abilityScores: null,
    spellSelections: [],
  })
})

// -- Test Data ----------------------------------------------------------------

const wizardClass = CLASSES.find((c) => c.id === 'wizard')!
const clericClass = CLASSES.find((c) => c.id === 'cleric')!
const bardClass = CLASSES.find((c) => c.id === 'bard')!
const sorcererClass = CLASSES.find((c) => c.id === 'sorcerer')!
const warlockClass = CLASSES.find((c) => c.id === 'warlock')!
const druidClass = CLASSES.find((c) => c.id === 'druid')!

const wizardCantrips = SPELLS.filter((s) => s.level === 0 && s.classes.includes('wizard'))
const clericCantrips = SPELLS.filter((s) => s.level === 0 && s.classes.includes('cleric'))
const bardCantrips = SPELLS.filter((s) => s.level === 0 && s.classes.includes('bard'))
const sorcererCantrips = SPELLS.filter((s) => s.level === 0 && s.classes.includes('sorcerer'))
const warlockCantrips = SPELLS.filter((s) => s.level === 0 && s.classes.includes('warlock'))

const wizardSpells = SPELLS.filter((s) => s.level === 1 && s.classes.includes('wizard'))
const clericSpells = SPELLS.filter((s) => s.level === 1 && s.classes.includes('cleric'))
const bardSpells = SPELLS.filter((s) => s.level === 1 && s.classes.includes('bard'))

// Sample spell for detail card testing
const sampleSpell: Spell = SPELLS.find((s) => s.id === 'magic-missile') ?? SPELLS.find((s) => s.level === 1)!
const ritualSpell = SPELLS.find((s) => s.ritual && s.level === 1)
const concentrationSpell = SPELLS.find((s) => s.concentration && s.level === 1)
const materialSpell = SPELLS.find((s) => s.components.material && s.components.materialDescription)

// =============================================================================
// 1. SpellDetailCard Tests
// =============================================================================

describe('SpellDetailCard', () => {
  it('displays spell name and level', () => {
    render(<SpellDetailCard spell={sampleSpell} />)

    expect(screen.getByText(sampleSpell.name)).toBeInTheDocument()
    expect(screen.getByTestId('spell-level')).toHaveTextContent(formatSpellLevel(sampleSpell.level))
  })

  it('displays spell school badge', () => {
    render(<SpellDetailCard spell={sampleSpell} />)

    const schoolBadge = screen.getByTestId('spell-school')
    const expectedSchool = sampleSpell.school.charAt(0).toUpperCase() + sampleSpell.school.slice(1)
    expect(schoolBadge).toHaveTextContent(expectedSchool)
  })

  it('displays casting time, range, duration, and components', () => {
    render(<SpellDetailCard spell={sampleSpell} />)

    expect(screen.getByTestId('casting-time')).toHaveTextContent(formatCastingTime(sampleSpell))
    expect(screen.getByTestId('spell-range')).toHaveTextContent(formatRange(sampleSpell))
    expect(screen.getByTestId('spell-duration')).toHaveTextContent(formatDuration(sampleSpell))
    expect(screen.getByTestId('spell-components')).toHaveTextContent(formatComponents(sampleSpell))
  })

  it('shows full description in non-compact mode', () => {
    render(<SpellDetailCard spell={sampleSpell} />)

    expect(screen.getByTestId('spell-description')).toHaveTextContent(sampleSpell.description)
  })

  it('hides description in compact mode', () => {
    render(<SpellDetailCard spell={sampleSpell} compact />)

    expect(screen.queryByTestId('spell-description')).not.toBeInTheDocument()
  })

  it('shows concentration badge when applicable', () => {
    if (!concentrationSpell) return
    render(<SpellDetailCard spell={concentrationSpell} />)

    expect(screen.getByTestId('concentration-badge')).toBeInTheDocument()
  })

  it('shows ritual badge when applicable', () => {
    if (!ritualSpell) return
    render(<SpellDetailCard spell={ritualSpell} />)

    expect(screen.getByTestId('ritual-badge')).toBeInTheDocument()
  })

  it('shows material component description when present', () => {
    if (!materialSpell) return
    render(<SpellDetailCard spell={materialSpell} />)

    expect(screen.getByTestId('spell-components')).toHaveTextContent(
      materialSpell.components.materialDescription!,
    )
  })

  it('displays classes list', () => {
    render(<SpellDetailCard spell={sampleSpell} />)

    const classesEl = screen.getByTestId('spell-classes')
    for (const cls of sampleSpell.classes) {
      const capitalized = cls.charAt(0).toUpperCase() + cls.slice(1)
      expect(classesEl).toHaveTextContent(capitalized)
    }
  })

  it('shows higher level description when applicable', () => {
    const spellWithHigher = SPELLS.find((s) => s.higherLevelDescription)
    if (!spellWithHigher) return
    render(<SpellDetailCard spell={spellWithHigher} />)

    expect(screen.getByTestId('higher-levels')).toHaveTextContent(
      spellWithHigher.higherLevelDescription!,
    )
  })
})

// =============================================================================
// 2. Format Helper Tests
// =============================================================================

describe('Spell format helpers', () => {
  it('formatSpellLevel returns correct labels', () => {
    expect(formatSpellLevel(0)).toBe('Cantrip')
    expect(formatSpellLevel(1)).toBe('1st Level')
    expect(formatSpellLevel(2)).toBe('2nd Level')
    expect(formatSpellLevel(3)).toBe('3rd Level')
  })

  it('formatCastingTime formats correctly', () => {
    expect(formatCastingTime({
      ...sampleSpell,
      castingTime: { value: 1, unit: 'action' },
    })).toBe('1 action')
    expect(formatCastingTime({
      ...sampleSpell,
      castingTime: { value: 1, unit: 'bonus-action' },
    })).toBe('1 bonus action')
    expect(formatCastingTime({
      ...sampleSpell,
      castingTime: { value: 10, unit: 'minute' },
    })).toBe('10 minutes')
  })

  it('formatRange handles all range types', () => {
    expect(formatRange({ ...sampleSpell, range: { type: 'self' } })).toBe('Self')
    expect(formatRange({ ...sampleSpell, range: { type: 'touch' } })).toBe('Touch')
    expect(formatRange({ ...sampleSpell, range: { type: 'ranged', distance: 120, unit: 'feet' } })).toBe('120 feet')
  })

  it('formatDuration handles all duration types', () => {
    expect(formatDuration({ ...sampleSpell, duration: { type: 'instantaneous' } })).toBe('Instantaneous')
    expect(formatDuration({
      ...sampleSpell,
      duration: { type: 'concentration', value: 1, unit: 'hour' },
    })).toBe('Concentration, up to 1 hour')
    expect(formatDuration({
      ...sampleSpell,
      duration: { type: 'timed', value: 10, unit: 'minute' },
    })).toBe('10 minutes')
  })

  it('formatComponents returns correct string', () => {
    expect(formatComponents({
      ...sampleSpell,
      components: { verbal: true, somatic: true, material: false },
    })).toBe('V, S')
    expect(formatComponents({
      ...sampleSpell,
      components: { verbal: true, somatic: true, material: true },
    })).toBe('V, S, M')
  })
})

// =============================================================================
// 3. SpellFilterBar Tests
// =============================================================================

describe('SpellFilterBar', () => {
  it('renders search input and filter controls', () => {
    const onFiltersChange = vi.fn()
    render(
      <SpellFilterBar
        filters={DEFAULT_SPELL_FILTERS}
        onFiltersChange={onFiltersChange}
      />,
    )

    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByLabelText('School')).toBeInTheDocument()
    expect(screen.getByLabelText('Casting Time')).toBeInTheDocument()
  })

  it('shows level filter by default', () => {
    const onFiltersChange = vi.fn()
    render(
      <SpellFilterBar
        filters={DEFAULT_SPELL_FILTERS}
        onFiltersChange={onFiltersChange}
      />,
    )

    expect(screen.getByLabelText('Level')).toBeInTheDocument()
  })

  it('hides level filter when showLevelFilter is false', () => {
    const onFiltersChange = vi.fn()
    render(
      <SpellFilterBar
        filters={DEFAULT_SPELL_FILTERS}
        onFiltersChange={onFiltersChange}
        showLevelFilter={false}
      />,
    )

    expect(screen.queryByLabelText('Level')).not.toBeInTheDocument()
  })

  it('shows concentration and ritual toggles', () => {
    const onFiltersChange = vi.fn()
    render(
      <SpellFilterBar
        filters={DEFAULT_SPELL_FILTERS}
        onFiltersChange={onFiltersChange}
      />,
    )

    expect(screen.getByLabelText('Concentration')).toBeInTheDocument()
    expect(screen.getByLabelText('Ritual')).toBeInTheDocument()
  })
})

// =============================================================================
// 4. CantripSelector Tests
// =============================================================================

describe('CantripSelector', () => {
  it('shows cantrips available to the selected class', () => {
    render(
      <CantripSelector
        classId="wizard"
        maxCantrips={3}
        selectedCantripIds={[]}
        onSelectionChange={vi.fn()}
      />,
    )

    // Wizard cantrips should appear
    for (const cantrip of wizardCantrips.slice(0, 3)) {
      expect(screen.getByText(cantrip.name)).toBeInTheDocument()
    }
  })

  it('displays correct cantrip counter', () => {
    render(
      <CantripSelector
        classId="wizard"
        maxCantrips={3}
        selectedCantripIds={[wizardCantrips[0].id]}
        onSelectionChange={vi.fn()}
      />,
    )

    expect(screen.getByTestId('cantrip-counter')).toHaveTextContent('1 of 3 selected')
  })

  it('calls onSelectionChange when cantrip is selected', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()

    render(
      <CantripSelector
        classId="wizard"
        maxCantrips={3}
        selectedCantripIds={[]}
        onSelectionChange={onSelectionChange}
      />,
    )

    await user.click(screen.getByText(wizardCantrips[0].name))
    expect(onSelectionChange).toHaveBeenCalledWith([wizardCantrips[0].id])
  })

  it('does not allow selecting more than maxCantrips', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    const threeSelected = wizardCantrips.slice(0, 3).map((s) => s.id)

    render(
      <CantripSelector
        classId="wizard"
        maxCantrips={3}
        selectedCantripIds={threeSelected}
        onSelectionChange={onSelectionChange}
      />,
    )

    // Try to select a 4th cantrip
    if (wizardCantrips[3]) {
      await user.click(screen.getByText(wizardCantrips[3].name))
      expect(onSelectionChange).not.toHaveBeenCalled()
    }
  })

  it('allows deselecting a selected cantrip', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()

    render(
      <CantripSelector
        classId="wizard"
        maxCantrips={3}
        selectedCantripIds={[wizardCantrips[0].id]}
        onSelectionChange={onSelectionChange}
      />,
    )

    await user.click(screen.getByText(wizardCantrips[0].name))
    expect(onSelectionChange).toHaveBeenCalledWith([])
  })

  it('displays racial cantrips as locked with "From Race" label', () => {
    const thaumaturgy = SPELLS.find((s) => s.id === 'thaumaturgy')
    if (!thaumaturgy) return

    render(
      <CantripSelector
        classId="cleric"
        maxCantrips={3}
        selectedCantripIds={[]}
        onSelectionChange={vi.fn()}
        racialCantripIds={['thaumaturgy']}
      />,
    )

    const racialSection = screen.getByTestId('racial-cantrips')
    expect(racialSection).toBeInTheDocument()
    expect(within(racialSection).getByText('Thaumaturgy')).toBeInTheDocument()
    expect(within(racialSection).getByText('From Race')).toBeInTheDocument()
  })

  it('returns correct cantrip counts per class', () => {
    expect(getCantripsKnown('bard', 1)).toBe(2)
    expect(getCantripsKnown('cleric', 1)).toBe(3)
    expect(getCantripsKnown('druid', 1)).toBe(2)
    expect(getCantripsKnown('sorcerer', 1)).toBe(4)
    expect(getCantripsKnown('warlock', 1)).toBe(2)
    expect(getCantripsKnown('wizard', 1)).toBe(3)
  })

  it('shows cantrips only from the correct class spell list', () => {
    const clericCantripSet = new Set(clericCantrips.map((s) => s.id))
    const wizardCantripSet = new Set(wizardCantrips.map((s) => s.id))

    // Verify these are different lists
    const clericOnly = clericCantrips.filter((s) => !wizardCantripSet.has(s.id))
    if (clericOnly.length > 0) {
      render(
        <CantripSelector
          classId="wizard"
          maxCantrips={3}
          selectedCantripIds={[]}
          onSelectionChange={vi.fn()}
        />,
      )

      // Cleric-only cantrips should not appear for wizard
      expect(screen.queryByText(clericOnly[0].name)).not.toBeInTheDocument()
    }
  })
})

// =============================================================================
// 5. SpellSelector Tests
// =============================================================================

describe('SpellSelector', () => {
  it('shows level 1 spells for the selected class', () => {
    render(
      <SpellSelector
        classId="wizard"
        castingSystem="known"
        maxSpells={6}
        selectedSpellIds={[]}
        onSpellSelectionChange={vi.fn()}
        abilityName="intelligence"
        abilityModifier={3}
      />,
    )

    // Check that some wizard spells are visible
    for (const spell of wizardSpells.slice(0, 3)) {
      expect(screen.getByText(spell.name)).toBeInTheDocument()
    }
  })

  it('shows correct spell counter for known casters', () => {
    render(
      <SpellSelector
        classId="bard"
        castingSystem="known"
        maxSpells={4}
        selectedSpellIds={[bardSpells[0].id]}
        onSpellSelectionChange={vi.fn()}
        abilityName="charisma"
        abilityModifier={3}
      />,
    )

    expect(screen.getByTestId('spell-counter')).toHaveTextContent('1 of 4 selected')
  })

  it('displays known caster instructions', () => {
    render(
      <SpellSelector
        classId="bard"
        castingSystem="known"
        maxSpells={4}
        selectedSpellIds={[]}
        onSpellSelectionChange={vi.fn()}
        abilityName="charisma"
        abilityModifier={3}
      />,
    )

    expect(screen.getByTestId('known-caster-info')).toHaveTextContent(
      'Choose 4 spells to learn',
    )
  })

  it('displays prepared caster instructions with formula', () => {
    render(
      <SpellSelector
        classId="cleric"
        castingSystem="prepared"
        maxSpells={4}
        selectedSpellIds={[]}
        onSpellSelectionChange={vi.fn()}
        abilityName="wisdom"
        abilityModifier={3}
      />,
    )

    expect(screen.getByTestId('prepared-caster-info')).toBeInTheDocument()
    expect(screen.getByTestId('prepared-formula')).toHaveTextContent('Wisdom modifier (+3)')
    expect(screen.getByTestId('prepared-formula')).toHaveTextContent('= 4 spells')
  })

  it('displays wizard spellbook instructions', () => {
    render(
      <SpellSelector
        classId="wizard"
        castingSystem="spellbook"
        maxSpells={6}
        maxPrepared={4}
        selectedSpellIds={[]}
        onSpellSelectionChange={vi.fn()}
        abilityName="intelligence"
        abilityModifier={3}
      />,
    )

    expect(screen.getByTestId('spellbook-info')).toHaveTextContent(
      'Choose 6 spells for your spellbook',
    )
  })

  it('shows Warlock pact magic explanation', () => {
    render(
      <SpellSelector
        classId="warlock"
        castingSystem="known"
        maxSpells={2}
        selectedSpellIds={[]}
        onSpellSelectionChange={vi.fn()}
        abilityName="charisma"
        abilityModifier={3}
      />,
    )

    expect(screen.getByTestId('pact-magic-info')).toHaveTextContent('Pact Magic')
    expect(screen.getByTestId('pact-magic-info')).toHaveTextContent('short rest')
  })

  it('calls onSpellSelectionChange when spell is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <SpellSelector
        classId="wizard"
        castingSystem="known"
        maxSpells={6}
        selectedSpellIds={[]}
        onSpellSelectionChange={onChange}
        abilityName="intelligence"
        abilityModifier={3}
      />,
    )

    await user.click(screen.getByText(wizardSpells[0].name))
    expect(onChange).toHaveBeenCalledWith([wizardSpells[0].id])
  })

  it('does not allow selecting more than maxSpells', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const twoSelected = wizardSpells.slice(0, 2).map((s) => s.id)

    render(
      <SpellSelector
        classId="wizard"
        castingSystem="known"
        maxSpells={2}
        selectedSpellIds={twoSelected}
        onSpellSelectionChange={onChange}
        abilityName="intelligence"
        abilityModifier={3}
      />,
    )

    if (wizardSpells[2]) {
      await user.click(screen.getByText(wizardSpells[2].name))
      expect(onChange).not.toHaveBeenCalled()
    }
  })

  it('shows prepared spells section for wizard spellbook', () => {
    const spellbookIds = wizardSpells.slice(0, 6).map((s) => s.id)

    render(
      <SpellSelector
        classId="wizard"
        castingSystem="spellbook"
        maxSpells={6}
        maxPrepared={4}
        selectedSpellIds={spellbookIds}
        onSpellSelectionChange={vi.fn()}
        preparedSpellIds={[]}
        onPreparedChange={vi.fn()}
        abilityName="intelligence"
        abilityModifier={3}
      />,
    )

    expect(screen.getByText('Prepare Spells from Spellbook')).toBeInTheDocument()
    expect(screen.getByTestId('prepared-counter')).toHaveTextContent('0 of 4 prepared')
  })
})

// =============================================================================
// 6. Validation Tests
// =============================================================================

describe('validateSpellStep', () => {
  it('returns valid:true when all selections are correct for known caster (Bard)', () => {
    const state: SpellStepState = {
      selectedCantripIds: bardCantrips.slice(0, 2).map((s) => s.id),
      selectedSpellIds: bardSpells.slice(0, 4).map((s) => s.id),
      preparedSpellIds: [],
    }
    const result = validateSpellStep(state, 'bard', 3)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns valid:false when cantrip count is wrong', () => {
    const state: SpellStepState = {
      selectedCantripIds: bardCantrips.slice(0, 1).map((s) => s.id),
      selectedSpellIds: bardSpells.slice(0, 4).map((s) => s.id),
      preparedSpellIds: [],
    }
    const result = validateSpellStep(state, 'bard', 3)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('cantrips'))).toBe(true)
  })

  it('returns valid:false when known spell count is wrong for Sorcerer', () => {
    const sorcererSpells = SPELLS.filter((s) => s.level === 1 && s.classes.includes('sorcerer'))
    const state: SpellStepState = {
      selectedCantripIds: sorcererCantrips.slice(0, 4).map((s) => s.id),
      selectedSpellIds: sorcererSpells.slice(0, 1).map((s) => s.id), // only 1, needs 2
      preparedSpellIds: [],
    }
    const result = validateSpellStep(state, 'sorcerer', 3)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('spells'))).toBe(true)
  })

  it('returns valid:false when wizard spellbook does not have 6 spells', () => {
    const state: SpellStepState = {
      selectedCantripIds: wizardCantrips.slice(0, 3).map((s) => s.id),
      selectedSpellIds: wizardSpells.slice(0, 4).map((s) => s.id), // only 4, needs 6
      preparedSpellIds: wizardSpells.slice(0, 2).map((s) => s.id),
    }
    const result = validateSpellStep(state, 'wizard', 3)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('6 spells'))).toBe(true)
  })

  it('returns valid:false when prepared spell count exceeds limit', () => {
    const state: SpellStepState = {
      selectedCantripIds: clericCantrips.slice(0, 3).map((s) => s.id),
      selectedSpellIds: clericSpells.slice(0, 10).map((s) => s.id), // way too many
      preparedSpellIds: [],
    }
    const result = validateSpellStep(state, 'cleric', 3) // max = 3+1=4
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Too many'))).toBe(true)
  })

  it('returns valid:false for duplicate cantrip selections', () => {
    const state: SpellStepState = {
      selectedCantripIds: [bardCantrips[0].id, bardCantrips[0].id],
      selectedSpellIds: bardSpells.slice(0, 4).map((s) => s.id),
      preparedSpellIds: [],
    }
    const result = validateSpellStep(state, 'bard', 3)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true)
  })

  it('returns valid:false when spell is not on class spell list', () => {
    // Find a spell that is on wizard list but not bard list
    const wizardOnly = wizardSpells.find((s) => !s.classes.includes('bard'))
    if (!wizardOnly) return

    const state: SpellStepState = {
      selectedCantripIds: bardCantrips.slice(0, 2).map((s) => s.id),
      selectedSpellIds: [wizardOnly.id, ...bardSpells.slice(0, 3).map((s) => s.id)],
      preparedSpellIds: [],
    }
    const result = validateSpellStep(state, 'bard', 3)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('not on the bard spell list'))).toBe(true)
  })

  it('returns valid:true for non-spellcasting classes', () => {
    const state: SpellStepState = {
      selectedCantripIds: [],
      selectedSpellIds: [],
      preparedSpellIds: [],
    }
    const result = validateSpellStep(state, 'fighter', 0)
    expect(result.valid).toBe(true)
  })

  it('validates wizard prepared spells must be from spellbook', () => {
    const spellbookIds = wizardSpells.slice(0, 6).map((s) => s.id)
    const nonSpellbookSpell = wizardSpells[6]
    if (!nonSpellbookSpell) return

    const state: SpellStepState = {
      selectedCantripIds: wizardCantrips.slice(0, 3).map((s) => s.id),
      selectedSpellIds: spellbookIds,
      preparedSpellIds: [nonSpellbookSpell.id],
    }
    const result = validateSpellStep(state, 'wizard', 3)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('not in your spellbook'))).toBe(true)
  })

  it('returns valid:true for complete wizard selections', () => {
    const spellbookIds = wizardSpells.slice(0, 6).map((s) => s.id)
    const preparedIds = wizardSpells.slice(0, 4).map((s) => s.id) // INT mod 3 + 1 = 4

    const state: SpellStepState = {
      selectedCantripIds: wizardCantrips.slice(0, 3).map((s) => s.id),
      selectedSpellIds: spellbookIds,
      preparedSpellIds: preparedIds,
    }
    const result = validateSpellStep(state, 'wizard', 3)
    expect(result.valid).toBe(true)
  })

  it('returns valid:false when wizard has no prepared spells', () => {
    const spellbookIds = wizardSpells.slice(0, 6).map((s) => s.id)

    const state: SpellStepState = {
      selectedCantripIds: wizardCantrips.slice(0, 3).map((s) => s.id),
      selectedSpellIds: spellbookIds,
      preparedSpellIds: [],
    }
    const result = validateSpellStep(state, 'wizard', 3)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Prepare at least 1'))).toBe(true)
  })

  it('returns valid:true for complete Warlock selections', () => {
    const warlockSpells = SPELLS.filter((s) => s.level === 1 && s.classes.includes('warlock'))
    const state: SpellStepState = {
      selectedCantripIds: warlockCantrips.slice(0, 2).map((s) => s.id),
      selectedSpellIds: warlockSpells.slice(0, 2).map((s) => s.id),
      preparedSpellIds: [],
    }
    const result = validateSpellStep(state, 'warlock', 3)
    expect(result.valid).toBe(true)
  })

  it('enforces minimum 1 prepared spell for prepared casters with low ability modifier', () => {
    // With modifier -1, max prepared = max(1, -1 + 1) = 1
    const state: SpellStepState = {
      selectedCantripIds: clericCantrips.slice(0, 3).map((s) => s.id),
      selectedSpellIds: [],
      preparedSpellIds: [],
    }
    const result = validateSpellStep(state, 'cleric', -1)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('at least 1'))).toBe(true)
  })

  it('returns correct known spell counts for each class', () => {
    expect(getSpellsKnownOrPrepared({ classId: 'bard', level: 1, abilityModifier: 3, preparedCaster: false })).toBe(4)
    expect(getSpellsKnownOrPrepared({ classId: 'sorcerer', level: 1, abilityModifier: 3, preparedCaster: false })).toBe(2)
    expect(getSpellsKnownOrPrepared({ classId: 'warlock', level: 1, abilityModifier: 3, preparedCaster: false })).toBe(2)
  })

  it('computes prepared spell count as ability mod + level (min 1)', () => {
    expect(getSpellsKnownOrPrepared({ classId: 'cleric', level: 1, abilityModifier: 3, preparedCaster: true })).toBe(4)
    expect(getSpellsKnownOrPrepared({ classId: 'cleric', level: 1, abilityModifier: 0, preparedCaster: true })).toBe(1)
    expect(getSpellsKnownOrPrepared({ classId: 'cleric', level: 1, abilityModifier: -1, preparedCaster: true })).toBe(1)
  })
})

// =============================================================================
// 7. SpellStep Integration Tests
// =============================================================================

describe('SpellStep (integration)', () => {
  it('shows "no spellcasting" message when no class is selected', () => {
    setMockStore({ classSelection: null })
    render(<SpellStep />)

    expect(screen.getByTestId('no-spellcasting')).toBeInTheDocument()
  })

  it('renders spellcasting summary for Wizard', () => {
    setMockStore({
      classSelection: { classId: 'wizard', level: 1, chosenSkills: [], hpRolls: [] },
      abilityScores: {
        strength: 10, dexterity: 14, constitution: 12,
        intelligence: 16, wisdom: 12, charisma: 8,
      },
    })
    render(<SpellStep />)

    expect(screen.getByTestId('spell-step')).toBeInTheDocument()
    expect(screen.getByTestId('spellcasting-summary')).toBeInTheDocument()
    expect(screen.getByTestId('spell-summary-text')).toHaveTextContent('Wizard')
    expect(screen.getByTestId('spell-summary-text')).toHaveTextContent('3 cantrips')
    expect(screen.getByTestId('spell-summary-text')).toHaveTextContent('Intelligence')
  })

  it('renders spellcasting summary for Cleric', () => {
    setMockStore({
      classSelection: { classId: 'cleric', level: 1, chosenSkills: [], hpRolls: [] },
      abilityScores: {
        strength: 10, dexterity: 12, constitution: 14,
        intelligence: 10, wisdom: 16, charisma: 12,
      },
    })
    render(<SpellStep />)

    expect(screen.getByTestId('spell-summary-text')).toHaveTextContent('Cleric')
    expect(screen.getByTestId('spell-summary-text')).toHaveTextContent('3 cantrips')
    expect(screen.getByTestId('spell-summary-text')).toHaveTextContent('Wisdom')
  })

  it('displays spell save DC and attack bonus', () => {
    setMockStore({
      classSelection: { classId: 'wizard', level: 1, chosenSkills: [], hpRolls: [] },
      abilityScores: {
        strength: 10, dexterity: 14, constitution: 12,
        intelligence: 16, wisdom: 12, charisma: 8,
      },
    })
    render(<SpellStep />)

    const stats = screen.getByTestId('spellcasting-stats')
    // DC = 8 + 2 (prof) + 3 (INT mod) = 13
    expect(within(stats).getByText('13')).toBeInTheDocument()
    // Attack = 2 (prof) + 3 (INT mod) = +5
    expect(within(stats).getByText('+5')).toBeInTheDocument()
  })

  it('displays spell slot info for standard casters', () => {
    setMockStore({
      classSelection: { classId: 'cleric', level: 1, chosenSkills: [], hpRolls: [] },
      abilityScores: {
        strength: 10, dexterity: 12, constitution: 14,
        intelligence: 10, wisdom: 16, charisma: 12,
      },
    })
    render(<SpellStep />)

    const stats = screen.getByTestId('spellcasting-stats')
    expect(within(stats).getByText(/1st-level/)).toBeInTheDocument()
  })

  it('calls onValidationChange with validation result', () => {
    const onValidationChange = vi.fn()
    setMockStore({
      classSelection: { classId: 'bard', level: 1, chosenSkills: [], hpRolls: [] },
      abilityScores: {
        strength: 10, dexterity: 14, constitution: 12,
        intelligence: 10, wisdom: 10, charisma: 16,
      },
    })

    render(<SpellStep onValidationChange={onValidationChange} />)

    // Should be called with invalid result (no spells selected)
    expect(onValidationChange).toHaveBeenCalled()
    const lastCall = onValidationChange.mock.calls[onValidationChange.mock.calls.length - 1][0]
    expect(lastCall.valid).toBe(false)
    expect(lastCall.errors.length).toBeGreaterThan(0)
  })

  it('persists selections to store via setSpells', async () => {
    const user = userEvent.setup()
    setMockStore({
      classSelection: { classId: 'wizard', level: 1, chosenSkills: [], hpRolls: [] },
      abilityScores: {
        strength: 10, dexterity: 14, constitution: 12,
        intelligence: 16, wisdom: 12, charisma: 8,
      },
    })

    render(<SpellStep />)

    // Select a cantrip
    await user.click(screen.getByText(wizardCantrips[0].name))

    // setSpells should be called with the cantrip prefixed
    expect(mockSetSpells).toHaveBeenCalled()
    const lastCall = mockSetSpells.mock.calls[mockSetSpells.mock.calls.length - 1][0]
    expect(lastCall).toContain(`cantrip:${wizardCantrips[0].id}`)
  })

  it('renders Sorcerer with 4 cantrip slots and 2 known spells', () => {
    setMockStore({
      classSelection: { classId: 'sorcerer', level: 1, chosenSkills: [], hpRolls: [] },
      abilityScores: {
        strength: 10, dexterity: 14, constitution: 14,
        intelligence: 10, wisdom: 10, charisma: 16,
      },
    })
    render(<SpellStep />)

    expect(screen.getByTestId('spell-summary-text')).toHaveTextContent('4 cantrips')
    expect(screen.getByTestId('spell-summary-text')).toHaveTextContent('2')
  })

  it('renders Warlock with pact magic slot info', () => {
    setMockStore({
      classSelection: { classId: 'warlock', level: 1, chosenSkills: [], hpRolls: [] },
      abilityScores: {
        strength: 10, dexterity: 14, constitution: 12,
        intelligence: 10, wisdom: 10, charisma: 16,
      },
    })
    render(<SpellStep />)

    const stats = screen.getByTestId('spellcasting-stats')
    expect(within(stats).getByText(/Pact/)).toBeInTheDocument()
  })

  it('restores spell selections from store on render', () => {
    setMockStore({
      classSelection: { classId: 'wizard', level: 1, chosenSkills: [], hpRolls: [] },
      abilityScores: {
        strength: 10, dexterity: 14, constitution: 12,
        intelligence: 16, wisdom: 12, charisma: 8,
      },
      spellSelections: [
        `cantrip:${wizardCantrips[0].id}`,
        `spell:${wizardSpells[0].id}`,
      ],
    })
    render(<SpellStep />)

    // The cantrip counter should show 1 selected
    expect(screen.getByTestId('cantrip-counter')).toHaveTextContent('1 of 3 selected')
  })
})

// =============================================================================
// 8. SRD Data Integrity Tests
// =============================================================================

describe('SRD spell data integrity', () => {
  it('has cantrips for all level-1 caster classes', () => {
    const casterClasses = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard']
    for (const classId of casterClasses) {
      const cantrips = SPELLS.filter((s) => s.level === 0 && s.classes.includes(classId))
      expect(cantrips.length).toBeGreaterThan(0)
    }
  })

  it('has level 1 spells for all level-1 caster classes', () => {
    const casterClasses = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard']
    for (const classId of casterClasses) {
      const spells = SPELLS.filter((s) => s.level === 1 && s.classes.includes(classId))
      expect(spells.length).toBeGreaterThan(0)
    }
  })

  it('all spells have required fields', () => {
    for (const spell of SPELLS) {
      expect(spell.id).toBeTruthy()
      expect(spell.name).toBeTruthy()
      expect(spell.school).toBeTruthy()
      expect(spell.classes.length).toBeGreaterThan(0)
      expect(typeof spell.concentration).toBe('boolean')
      expect(typeof spell.ritual).toBe('boolean')
    }
  })

  it('each caster class has spellcasting info defined', () => {
    const casterClasses = ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard']
    for (const classId of casterClasses) {
      const cls = CLASSES.find((c) => c.id === classId)
      expect(cls?.spellcasting).toBeDefined()
      expect(cls?.spellcasting?.ability).toBeTruthy()
      expect(cls?.spellcasting?.cantripsKnown.length).toBeGreaterThan(0)
    }
  })
})
