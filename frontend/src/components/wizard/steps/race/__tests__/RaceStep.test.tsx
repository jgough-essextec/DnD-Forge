/**
 * Comprehensive tests for the Race Selection wizard step.
 *
 * Covers: RaceStep, RaceCard, RaceDetailPanel, SubraceSelector,
 * RacialChoicePickers, and validateRaceStep.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RaceStep, validateRaceStep } from '../RaceStep'
import { RaceCard } from '../RaceCard'
import { RaceDetailPanel } from '../RaceDetailPanel'
import type { RacialChoiceState } from '../RaceDetailPanel'
import { SubraceSelector } from '../SubraceSelector'
import {
  HalfElfBonusPicker,
  VariantHumanPicker,
  HighElfCantripPicker,
  DragonbornAncestryPicker,
  LanguagePicker,
  SkillPicker,
} from '../RacialChoicePickers'
import { races } from '@/data/races'
import type { Race, AbilityBonus } from '@/types/race'

// =============================================================================
// Mock the wizard store
// =============================================================================

const mockSetRace = vi.fn()
let mockRaceSelection: ReturnType<typeof import('@/stores/wizardStore').useWizardStore> extends { raceSelection: infer R } ? R : never = null

vi.mock('@/stores/wizardStore', () => ({
  useWizardStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      raceSelection: mockRaceSelection,
      setRace: mockSetRace,
    }),
}))

// =============================================================================
// Helpers
// =============================================================================

function getRace(id: string): Race {
  const race = races.find((r) => r.id === id)
  if (!race) throw new Error(`Race ${id} not found`)
  return race as Race
}

function defaultChoices(): RacialChoiceState {
  return {
    subraceId: null,
    chosenAbilityBonuses: [],
    chosenSkills: [],
    chosenLanguages: [],
    chosenCantrip: null,
    chosenFeat: null,
    dragonbornAncestry: null,
  }
}

// =============================================================================
// RaceCard Tests
// =============================================================================

describe('RaceCard', () => {
  it('should render race name', () => {
    const dwarf = getRace('dwarf')
    render(<RaceCard race={dwarf} isSelected={false} />)
    expect(screen.getByText('Dwarf')).toBeInTheDocument()
  })

  it('should display ability score bonuses as badges', () => {
    const elf = getRace('elf')
    render(<RaceCard race={elf} isSelected={false} />)
    expect(screen.getByText('DEX')).toBeInTheDocument()
  })

  it('should show key trait badges', () => {
    const dwarf = getRace('dwarf')
    render(<RaceCard race={dwarf} isSelected={false} />)
    expect(screen.getByText('Darkvision 60ft')).toBeInTheDocument()
  })

  it('should show size and speed', () => {
    const halfling = getRace('halfling')
    render(<RaceCard race={halfling} isSelected={false} />)
    expect(screen.getByText('Small')).toBeInTheDocument()
    expect(screen.getByText('25 ft')).toBeInTheDocument()
  })

  it('should show subrace count for races with subraces', () => {
    const elf = getRace('elf')
    render(<RaceCard race={elf} isSelected={false} />)
    expect(screen.getByText('3 subraces')).toBeInTheDocument()
  })

  it('should show selected style when isSelected is true', () => {
    const human = getRace('human')
    render(<RaceCard race={human} isSelected={true} />)
    const heading = screen.getByText('Human')
    expect(heading.className).toContain('text-accent-gold')
  })

  it('should not show subraces count for races without subraces', () => {
    const halfOrc = getRace('half-orc')
    render(<RaceCard race={halfOrc} isSelected={false} />)
    expect(screen.queryByText(/subraces/)).not.toBeInTheDocument()
  })
})

// =============================================================================
// SubraceSelector Tests
// =============================================================================

describe('SubraceSelector', () => {
  it('should render subrace options for races with subraces', () => {
    const dwarf = getRace('dwarf')
    render(
      <SubraceSelector
        race={dwarf}
        selectedSubraceId={null}
        onSelectSubrace={vi.fn()}
      />,
    )
    expect(screen.getByText('Hill Dwarf')).toBeInTheDocument()
    expect(screen.getByText('Mountain Dwarf')).toBeInTheDocument()
  })

  it('should render nothing for races without subraces', () => {
    const halfOrc = getRace('half-orc')
    const { container } = render(
      <SubraceSelector
        race={halfOrc}
        selectedSubraceId={null}
        onSelectSubrace={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('should call onSelectSubrace when a subrace is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const dwarf = getRace('dwarf')

    render(
      <SubraceSelector
        race={dwarf}
        selectedSubraceId={null}
        onSelectSubrace={onSelect}
      />,
    )

    await user.click(screen.getByText('Hill Dwarf'))
    expect(onSelect).toHaveBeenCalledWith('hill-dwarf')
  })

  it('should show selected state for chosen subrace', () => {
    const dwarf = getRace('dwarf')
    render(
      <SubraceSelector
        race={dwarf}
        selectedSubraceId="hill-dwarf"
        onSelectSubrace={vi.fn()}
      />,
    )

    const radioGroup = screen.getByRole('radiogroup')
    const radios = within(radioGroup).getAllByRole('radio')
    expect(radios[0]).toHaveAttribute('aria-checked', 'true')
    expect(radios[1]).toHaveAttribute('aria-checked', 'false')
  })

  it('should display subrace bonus info in description', () => {
    const elf = getRace('elf')
    render(
      <SubraceSelector
        race={elf}
        selectedSubraceId={null}
        onSelectSubrace={vi.fn()}
      />,
    )
    expect(screen.getByText(/\+1 INT/)).toBeInTheDocument()
  })
})

// =============================================================================
// HalfElfBonusPicker Tests
// =============================================================================

describe('HalfElfBonusPicker', () => {
  it('should render 5 ability buttons (excluding CHA)', () => {
    render(
      <HalfElfBonusPicker
        selectedBonuses={[]}
        onBonusChange={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Strength +1')).toBeInTheDocument()
    expect(screen.getByLabelText('Dexterity +1')).toBeInTheDocument()
    expect(screen.getByLabelText('Constitution +1')).toBeInTheDocument()
    expect(screen.getByLabelText('Intelligence +1')).toBeInTheDocument()
    expect(screen.getByLabelText('Wisdom +1')).toBeInTheDocument()
  })

  it('should call onBonusChange when an ability is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <HalfElfBonusPicker selectedBonuses={[]} onBonusChange={onChange} />,
    )

    await user.click(screen.getByLabelText('Strength +1'))
    expect(onChange).toHaveBeenCalledWith([
      { abilityName: 'strength', bonus: 1 },
    ])
  })

  it('should disable unselected abilities when 2 are chosen', () => {
    const bonuses: AbilityBonus[] = [
      { abilityName: 'strength', bonus: 1 },
      { abilityName: 'dexterity', bonus: 1 },
    ]

    render(
      <HalfElfBonusPicker
        selectedBonuses={bonuses}
        onBonusChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Constitution +1')).toBeDisabled()
    expect(screen.getByLabelText('Intelligence +1')).toBeDisabled()
    expect(screen.getByLabelText('Wisdom +1')).toBeDisabled()
  })

  it('should allow deselecting a chosen ability', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const bonuses: AbilityBonus[] = [
      { abilityName: 'strength', bonus: 1 },
    ]

    render(
      <HalfElfBonusPicker
        selectedBonuses={bonuses}
        onBonusChange={onChange}
      />,
    )

    await user.click(screen.getByLabelText('Strength +1'))
    expect(onChange).toHaveBeenCalledWith([])
  })
})

// =============================================================================
// VariantHumanPicker Tests
// =============================================================================

describe('VariantHumanPicker', () => {
  const defaultProps = {
    selectedBonuses: [] as AbilityBonus[],
    onBonusChange: vi.fn(),
    selectedSkill: null as string | null,
    onSkillChange: vi.fn(),
    selectedFeat: null as string | null,
    onFeatChange: vi.fn(),
  }

  it('should render ability buttons, skill dropdown, and feat dropdown', () => {
    render(<VariantHumanPicker {...defaultProps} />)
    expect(screen.getByLabelText('Choose a skill proficiency')).toBeInTheDocument()
    expect(screen.getByLabelText('Choose a feat')).toBeInTheDocument()
  })

  it('should render all 6 ability buttons', () => {
    render(<VariantHumanPicker {...defaultProps} />)
    expect(screen.getByLabelText('Strength +1')).toBeInTheDocument()
    expect(screen.getByLabelText('Charisma +1')).toBeInTheDocument()
  })

  it('should call onSkillChange when a skill is selected', async () => {
    const user = userEvent.setup()
    const onSkillChange = vi.fn()

    render(
      <VariantHumanPicker
        {...defaultProps}
        onSkillChange={onSkillChange}
      />,
    )

    await user.selectOptions(
      screen.getByLabelText('Choose a skill proficiency'),
      'athletics',
    )
    expect(onSkillChange).toHaveBeenCalledWith('athletics')
  })

  it('should call onFeatChange when a feat is selected', async () => {
    const user = userEvent.setup()
    const onFeatChange = vi.fn()

    render(
      <VariantHumanPicker
        {...defaultProps}
        onFeatChange={onFeatChange}
      />,
    )

    await user.selectOptions(
      screen.getByLabelText('Choose a feat'),
      'alert',
    )
    expect(onFeatChange).toHaveBeenCalledWith('alert')
  })

  it('should show feat description when a feat is selected', () => {
    render(
      <VariantHumanPicker
        {...defaultProps}
        selectedFeat="alert"
      />,
    )
    expect(screen.getByTestId('feat-description')).toBeInTheDocument()
  })
})

// =============================================================================
// HighElfCantripPicker Tests
// =============================================================================

describe('HighElfCantripPicker', () => {
  it('should render cantrip dropdown', () => {
    render(
      <HighElfCantripPicker
        selectedCantrip={null}
        onCantripChange={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Choose a wizard cantrip')).toBeInTheDocument()
  })

  it('should display wizard cantrips in the dropdown', () => {
    render(
      <HighElfCantripPicker
        selectedCantrip={null}
        onCantripChange={vi.fn()}
      />,
    )
    const select = screen.getByLabelText('Choose a wizard cantrip')
    // Wizard cantrips should include Fire Bolt, Light, Mage Hand, etc.
    const options = within(select as HTMLElement).getAllByRole('option')
    // At least the "Select" placeholder + some cantrips
    expect(options.length).toBeGreaterThan(3)
  })

  it('should call onCantripChange when a cantrip is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <HighElfCantripPicker selectedCantrip={null} onCantripChange={onChange} />,
    )

    await user.selectOptions(
      screen.getByLabelText('Choose a wizard cantrip'),
      'fire-bolt',
    )
    expect(onChange).toHaveBeenCalledWith('fire-bolt')
  })

  it('should show cantrip description when selected', () => {
    render(
      <HighElfCantripPicker
        selectedCantrip="fire-bolt"
        onCantripChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('cantrip-description')).toBeInTheDocument()
  })
})

// =============================================================================
// DragonbornAncestryPicker Tests
// =============================================================================

describe('DragonbornAncestryPicker', () => {
  it('should render all 10 draconic ancestries', () => {
    render(
      <DragonbornAncestryPicker
        selectedAncestry={null}
        onAncestryChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Black Dragon')).toBeInTheDocument()
    expect(screen.getByText('Gold Dragon')).toBeInTheDocument()
    expect(screen.getByText('Silver Dragon')).toBeInTheDocument()

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(10)
  })

  it('should show damage type and breath weapon info', () => {
    render(
      <DragonbornAncestryPicker
        selectedAncestry={null}
        onAncestryChange={vi.fn()}
      />,
    )
    // Multiple ancestries share the same damage type, so use getAllByText
    const acidEntries = screen.getAllByText(/Acid -- 5x30 ft line/)
    expect(acidEntries.length).toBeGreaterThan(0)
    const fireEntries = screen.getAllByText(/Fire -- 15 ft cone/)
    expect(fireEntries.length).toBeGreaterThan(0)
  })

  it('should call onAncestryChange when an ancestry is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <DragonbornAncestryPicker
        selectedAncestry={null}
        onAncestryChange={onChange}
      />,
    )

    await user.click(screen.getByText('Gold Dragon'))
    expect(onChange).toHaveBeenCalledWith('gold')
  })

  it('should show selected state for chosen ancestry', () => {
    render(
      <DragonbornAncestryPicker
        selectedAncestry="red"
        onAncestryChange={vi.fn()}
      />,
    )

    const radios = screen.getAllByRole('radio')
    const redIndex = 7 // Red is 8th in the list (0-indexed)
    expect(radios[redIndex]).toHaveAttribute('aria-checked', 'true')
  })
})

// =============================================================================
// LanguagePicker Tests
// =============================================================================

describe('LanguagePicker', () => {
  it('should render language dropdown excluding known languages', () => {
    render(
      <LanguagePicker
        knownLanguages={['common', 'elvish']}
        selectedLanguages={[]}
        onLanguageChange={vi.fn()}
        maxSelections={1}
      />,
    )
    const select = screen.getByLabelText('Choose an extra language')
    const options = within(select as HTMLElement).getAllByRole('option')
    // Should not include Common or Elvish
    const optionTexts = options.map((o) => o.textContent)
    expect(optionTexts).not.toContain('Common')
    expect(optionTexts).not.toContain('Elvish')
  })

  it('should call onLanguageChange when a language is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <LanguagePicker
        knownLanguages={['common']}
        selectedLanguages={[]}
        onLanguageChange={onChange}
        maxSelections={1}
      />,
    )

    await user.selectOptions(
      screen.getByLabelText('Choose an extra language'),
      'dwarvish',
    )
    expect(onChange).toHaveBeenCalledWith(['dwarvish'])
  })
})

// =============================================================================
// SkillPicker Tests
// =============================================================================

describe('SkillPicker', () => {
  it('should render skill checkboxes', () => {
    render(
      <SkillPicker
        selectedSkills={[]}
        onSkillChange={vi.fn()}
        maxSelections={2}
      />,
    )
    expect(screen.getByText('Athletics')).toBeInTheDocument()
    expect(screen.getByText('Perception')).toBeInTheDocument()
  })

  it('should show selection count', () => {
    render(
      <SkillPicker
        selectedSkills={['athletics']}
        onSkillChange={vi.fn()}
        maxSelections={2}
      />,
    )
    expect(screen.getByTestId('selection-count')).toHaveTextContent('1')
  })
})

// =============================================================================
// RaceDetailPanel Tests
// =============================================================================

describe('RaceDetailPanel', () => {
  it('should display race description', () => {
    const dwarf = getRace('dwarf')
    render(
      <RaceDetailPanel
        race={dwarf}
        choices={defaultChoices()}
        onChoicesChange={vi.fn()}
      />,
    )
    expect(screen.getByText(/Bold and hardy/)).toBeInTheDocument()
  })

  it('should show size, speed, and darkvision badges', () => {
    const dwarf = getRace('dwarf')
    render(
      <RaceDetailPanel
        race={dwarf}
        choices={defaultChoices()}
        onChoicesChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('25 ft')).toBeInTheDocument()
    expect(screen.getByText(/Darkvision 60ft/)).toBeInTheDocument()
  })

  it('should show ability score bonuses', () => {
    const dwarf = getRace('dwarf')
    render(
      <RaceDetailPanel
        race={dwarf}
        choices={defaultChoices()}
        onChoicesChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Constitution')).toBeInTheDocument()
  })

  it('should list racial traits', () => {
    const dwarf = getRace('dwarf')
    render(
      <RaceDetailPanel
        race={dwarf}
        choices={defaultChoices()}
        onChoicesChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Dwarven Resilience')).toBeInTheDocument()
    expect(screen.getByText('Stonecunning')).toBeInTheDocument()
  })

  it('should list languages', () => {
    const dwarf = getRace('dwarf')
    render(
      <RaceDetailPanel
        race={dwarf}
        choices={defaultChoices()}
        onChoicesChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Common')).toBeInTheDocument()
    expect(screen.getByText('Dwarvish')).toBeInTheDocument()
  })

  it('should show proficiencies', () => {
    const dwarf = getRace('dwarf')
    render(
      <RaceDetailPanel
        race={dwarf}
        choices={defaultChoices()}
        onChoicesChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Battleaxe')).toBeInTheDocument()
    expect(screen.getByText('Warhammer')).toBeInTheDocument()
  })

  it('should show subrace selector for races with subraces', () => {
    const dwarf = getRace('dwarf')
    render(
      <RaceDetailPanel
        race={dwarf}
        choices={defaultChoices()}
        onChoicesChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('subrace-selector')).toBeInTheDocument()
  })

  it('should not show subrace selector for races without subraces', () => {
    const halfOrc = getRace('half-orc')
    render(
      <RaceDetailPanel
        race={halfOrc}
        choices={defaultChoices()}
        onChoicesChange={vi.fn()}
      />,
    )
    expect(screen.queryByTestId('subrace-selector')).not.toBeInTheDocument()
  })

  it('should show subrace traits when subrace is selected', () => {
    const dwarf = getRace('dwarf')
    render(
      <RaceDetailPanel
        race={dwarf}
        choices={{ ...defaultChoices(), subraceId: 'hill-dwarf' }}
        onChoicesChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Dwarven Toughness')).toBeInTheDocument()
    // "Hill Dwarf" appears in both the subrace selector and the traits section
    const hillDwarfTexts = screen.getAllByText('Hill Dwarf')
    expect(hillDwarfTexts.length).toBeGreaterThanOrEqual(1)
  })

  it('should show Half-Elf bonus picker and skill picker', () => {
    const halfElf = getRace('half-elf')
    render(
      <RaceDetailPanel
        race={halfElf}
        choices={defaultChoices()}
        onChoicesChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('half-elf-bonus-picker')).toBeInTheDocument()
    expect(screen.getByTestId('skill-picker')).toBeInTheDocument()
  })

  it('should show Dragonborn ancestry picker', () => {
    const dragonborn = getRace('dragonborn')
    render(
      <RaceDetailPanel
        race={dragonborn}
        choices={defaultChoices()}
        onChoicesChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('dragonborn-ancestry-picker')).toBeInTheDocument()
  })

  it('should show Variant Human picker when variant-human subrace is selected', () => {
    const human = getRace('human')
    render(
      <RaceDetailPanel
        race={human}
        choices={{ ...defaultChoices(), subraceId: 'variant-human' }}
        onChoicesChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('variant-human-picker')).toBeInTheDocument()
  })

  it('should show High Elf cantrip picker when high-elf subrace is selected', () => {
    const elf = getRace('elf')
    render(
      <RaceDetailPanel
        race={elf}
        choices={{ ...defaultChoices(), subraceId: 'high-elf' }}
        onChoicesChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('high-elf-cantrip-picker')).toBeInTheDocument()
  })
})

// =============================================================================
// validateRaceStep Tests
// =============================================================================

describe('validateRaceStep', () => {
  it('should return invalid when no race is selected', () => {
    const result = validateRaceStep({ race: null, choices: defaultChoices() })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Please select a race')
  })

  it('should return invalid when race with subraces has no subrace selected', () => {
    const dwarf = getRace('dwarf')
    const result = validateRaceStep({
      race: dwarf,
      choices: defaultChoices(),
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Please select a subrace for your Dwarf')
  })

  it('should return valid for Dwarf with subrace selected', () => {
    const dwarf = getRace('dwarf')
    const result = validateRaceStep({
      race: dwarf,
      choices: { ...defaultChoices(), subraceId: 'hill-dwarf' },
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should return invalid for Dragonborn without ancestry', () => {
    const dragonborn = getRace('dragonborn')
    const result = validateRaceStep({
      race: dragonborn,
      choices: defaultChoices(),
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Please choose a draconic ancestry')
  })

  it('should return valid for Dragonborn with ancestry selected', () => {
    const dragonborn = getRace('dragonborn')
    const result = validateRaceStep({
      race: dragonborn,
      choices: { ...defaultChoices(), dragonbornAncestry: 'gold' },
    })
    expect(result.valid).toBe(true)
  })

  it('should return invalid for Half-Elf without ability bonuses', () => {
    const halfElf = getRace('half-elf')
    const result = validateRaceStep({
      race: halfElf,
      choices: {
        ...defaultChoices(),
        chosenLanguages: ['dwarvish'],
        chosenSkills: ['athletics', 'perception'],
      },
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Please choose 2 ability score bonuses for your Half-Elf',
    )
  })

  it('should return invalid for Half-Elf without skills', () => {
    const halfElf = getRace('half-elf')
    const result = validateRaceStep({
      race: halfElf,
      choices: {
        ...defaultChoices(),
        chosenAbilityBonuses: [
          { abilityName: 'strength', bonus: 1 },
          { abilityName: 'dexterity', bonus: 1 },
        ],
        chosenLanguages: ['dwarvish'],
      },
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Please choose 2 skill proficiencies for your Half-Elf',
    )
  })

  it('should return valid for fully completed Half-Elf', () => {
    const halfElf = getRace('half-elf')
    const result = validateRaceStep({
      race: halfElf,
      choices: {
        ...defaultChoices(),
        chosenAbilityBonuses: [
          { abilityName: 'strength', bonus: 1 },
          { abilityName: 'dexterity', bonus: 1 },
        ],
        chosenSkills: ['athletics', 'perception'],
        chosenLanguages: ['dwarvish'],
      },
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should return invalid for High Elf without cantrip', () => {
    const elf = getRace('elf')
    const result = validateRaceStep({
      race: elf,
      choices: {
        ...defaultChoices(),
        subraceId: 'high-elf',
        chosenLanguages: ['dwarvish'],
      },
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Please choose a wizard cantrip for your High Elf',
    )
  })

  it('should return invalid for High Elf without extra language', () => {
    const elf = getRace('elf')
    const result = validateRaceStep({
      race: elf,
      choices: {
        ...defaultChoices(),
        subraceId: 'high-elf',
        chosenCantrip: 'fire-bolt',
      },
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Please choose an extra language for your High Elf',
    )
  })

  it('should return valid for fully completed High Elf', () => {
    const elf = getRace('elf')
    const result = validateRaceStep({
      race: elf,
      choices: {
        ...defaultChoices(),
        subraceId: 'high-elf',
        chosenCantrip: 'fire-bolt',
        chosenLanguages: ['dwarvish'],
      },
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should return invalid for Variant Human without ability bonuses', () => {
    const human = getRace('human')
    const result = validateRaceStep({
      race: human,
      choices: {
        ...defaultChoices(),
        subraceId: 'variant-human',
        chosenSkills: ['athletics'],
        chosenFeat: 'alert',
      },
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Please choose 2 ability score bonuses for your Variant Human',
    )
  })

  it('should return invalid for Variant Human without skill', () => {
    const human = getRace('human')
    const result = validateRaceStep({
      race: human,
      choices: {
        ...defaultChoices(),
        subraceId: 'variant-human',
        chosenAbilityBonuses: [
          { abilityName: 'strength', bonus: 1 },
          { abilityName: 'dexterity', bonus: 1 },
        ],
        chosenFeat: 'alert',
      },
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Please choose a skill proficiency for your Variant Human',
    )
  })

  it('should return invalid for Variant Human without feat', () => {
    const human = getRace('human')
    const result = validateRaceStep({
      race: human,
      choices: {
        ...defaultChoices(),
        subraceId: 'variant-human',
        chosenAbilityBonuses: [
          { abilityName: 'strength', bonus: 1 },
          { abilityName: 'dexterity', bonus: 1 },
        ],
        chosenSkills: ['athletics'],
      },
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain(
      'Please choose a feat for your Variant Human',
    )
  })

  it('should return valid for fully completed Variant Human', () => {
    const human = getRace('human')
    const result = validateRaceStep({
      race: human,
      choices: {
        ...defaultChoices(),
        subraceId: 'variant-human',
        chosenAbilityBonuses: [
          { abilityName: 'strength', bonus: 1 },
          { abilityName: 'dexterity', bonus: 1 },
        ],
        chosenSkills: ['athletics'],
        chosenFeat: 'alert',
        chosenLanguages: ['dwarvish'], // Human base race has languageChoices: 1
      },
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should return valid for simple races (Half-Orc, Tiefling)', () => {
    const halfOrc = getRace('half-orc')
    const result = validateRaceStep({
      race: halfOrc,
      choices: defaultChoices(),
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should return valid for Tiefling with no extra choices needed', () => {
    const tiefling = getRace('tiefling')
    const result = validateRaceStep({
      race: tiefling,
      choices: defaultChoices(),
    })
    expect(result.valid).toBe(true)
  })

  it('should return invalid for Human (standard) without language choice', () => {
    const human = getRace('human')
    // Standard human has languageChoices: 1 but no subrace selected
    const result = validateRaceStep({
      race: human,
      choices: defaultChoices(),
    })
    // Standard human needs a subrace (since it has subraces array) AND a language
    expect(result.valid).toBe(false)
  })
})

// =============================================================================
// RaceStep Integration Tests
// =============================================================================

describe('RaceStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRaceSelection = null
  })

  it('should render all 9 SRD races', () => {
    render(<RaceStep onValidationChange={vi.fn()} />)
    expect(screen.getByText('Dwarf')).toBeInTheDocument()
    expect(screen.getByText('Elf')).toBeInTheDocument()
    expect(screen.getByText('Halfling')).toBeInTheDocument()
    expect(screen.getByText('Human')).toBeInTheDocument()
    expect(screen.getByText('Dragonborn')).toBeInTheDocument()
    expect(screen.getByText('Gnome')).toBeInTheDocument()
    expect(screen.getByText('Half-Elf')).toBeInTheDocument()
    expect(screen.getByText('Half-Orc')).toBeInTheDocument()
    expect(screen.getByText('Tiefling')).toBeInTheDocument()
  })

  it('should display the step header', () => {
    render(<RaceStep onValidationChange={vi.fn()} />)
    expect(screen.getByText('Choose Your Race')).toBeInTheDocument()
  })

  it('should have search bar', () => {
    render(<RaceStep onValidationChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Search races...')).toBeInTheDocument()
  })

  it('should filter races by search text', async () => {
    const user = userEvent.setup()
    render(<RaceStep onValidationChange={vi.fn()} />)

    const searchInput = screen.getByPlaceholderText('Search races...')
    await user.type(searchInput, 'elf')

    // Wait for debounced search
    await new Promise((r) => setTimeout(r, 400))

    // Elf and Half-Elf should be visible
    expect(screen.getByText('Elf')).toBeInTheDocument()
    expect(screen.getByText('Half-Elf')).toBeInTheDocument()
    // Others should not
    expect(screen.queryByText('Dwarf')).not.toBeInTheDocument()
  })

  it('should filter by darkvision toggle', async () => {
    const user = userEvent.setup()
    render(<RaceStep onValidationChange={vi.fn()} />)

    // Find the darkvision toggle
    const toggle = screen.getByRole('switch', { name: 'Darkvision' })
    await user.click(toggle)

    // Halfling does not have darkvision, so it should be hidden
    expect(screen.queryByText('Halfling')).not.toBeInTheDocument()
    // Dwarf has darkvision
    expect(screen.getByText('Dwarf')).toBeInTheDocument()
  })

  it('should filter by size chip', async () => {
    const user = userEvent.setup()
    render(<RaceStep onValidationChange={vi.fn()} />)

    // Click the Small chip
    const smallChip = screen.getByRole('button', { name: 'Small' })
    await user.click(smallChip)

    // Only small races should be shown
    expect(screen.getByText('Halfling')).toBeInTheDocument()
    expect(screen.getByText('Gnome')).toBeInTheDocument()
    // Medium races hidden
    expect(screen.queryByText('Dwarf')).not.toBeInTheDocument()
    expect(screen.queryByText('Human')).not.toBeInTheDocument()
  })

  it('should show empty state when no races match filters', async () => {
    const user = userEvent.setup()
    render(<RaceStep onValidationChange={vi.fn()} />)

    const searchInput = screen.getByPlaceholderText('Search races...')
    await user.type(searchInput, 'nonexistentrace')
    await new Promise((r) => setTimeout(r, 400))

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText('No races match your filters.')).toBeInTheDocument()
  })

  it('should select a race when clicked and open detail panel', async () => {
    const user = userEvent.setup()
    render(<RaceStep onValidationChange={vi.fn()} />)

    await user.click(screen.getByText('Dwarf'))

    // The detail panel should open (look for dialog role)
    const dialogs = screen.getAllByRole('dialog')
    expect(dialogs.length).toBeGreaterThan(0)
  })

  it('should call onValidationChange with invalid when no race selected', () => {
    const onValidation = vi.fn()
    render(<RaceStep onValidationChange={onValidation} />)

    expect(onValidation).toHaveBeenCalledWith(
      expect.objectContaining({ valid: false }),
    )
  })

  it('should persist selection to wizard store when race is selected', async () => {
    const user = userEvent.setup()
    render(<RaceStep onValidationChange={vi.fn()} />)

    await user.click(screen.getByText('Half-Orc'))

    // Should have called setRace with the selection
    expect(mockSetRace).toHaveBeenCalledWith(
      expect.objectContaining({ raceId: 'half-orc' }),
    )
  })

  it('should report valid for simple races after selection', async () => {
    const user = userEvent.setup()
    const onValidation = vi.fn()
    render(<RaceStep onValidationChange={onValidation} />)

    await user.click(screen.getByText('Half-Orc'))

    // The latest call should be valid
    const lastCall = onValidation.mock.calls[onValidation.mock.calls.length - 1]
    expect(lastCall[0]).toEqual({ valid: true, errors: [] })
  })
})
