/**
 * Comprehensive tests for the Background & Personality wizard step.
 *
 * Covers: background browsing/selection, skill overlap detection,
 * personality trait selection (table pick + custom), random roll,
 * character description fields, alignment selection, validation,
 * and integration with the wizard store.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BackgroundStep } from '../BackgroundStep'
import { BackgroundSelector, detectSkillOverlaps, getReplacementSkills } from '../BackgroundSelector'
import { PersonalityEditor } from '../PersonalityEditor'
import type { PersonalityState } from '../PersonalityEditor'
import { CharacterDescription } from '../CharacterDescription'
import type { DescriptionState } from '../CharacterDescription'
import { BACKGROUNDS } from '@/data/backgrounds'
import type { Background } from '@/types/background'
import type { SkillName } from '@/types/core'

// ---------------------------------------------------------------------------
// Mock wizard store
// ---------------------------------------------------------------------------

const mockSetBackground = vi.fn()
const mockStoreState = {
  backgroundSelection: null as ReturnType<typeof import('@/stores/wizardStore').useWizardStore.getState>['backgroundSelection'],
  classSelection: null as ReturnType<typeof import('@/stores/wizardStore').useWizardStore.getState>['classSelection'],
  characterName: 'Test Hero',
  setBackground: mockSetBackground,
}

vi.mock('@/stores/wizardStore', () => ({
  useWizardStore: (selector?: (state: typeof mockStoreState) => unknown) => {
    if (typeof selector === 'function') {
      return selector(mockStoreState)
    }
    return mockStoreState
  },
}))

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

const allBackgrounds = BACKGROUNDS as Background[]
const acolyteBackground = allBackgrounds.find((bg) => bg.id === 'acolyte')!
const criminalBackground = allBackgrounds.find((bg) => bg.id === 'criminal')!
const sageBackground = allBackgrounds.find((bg) => bg.id === 'sage')!

function getDefaultPersonality(): PersonalityState {
  return {
    traits: ['', ''],
    ideal: '',
    bond: '',
    flaw: '',
  }
}

function getDefaultDescription(): DescriptionState {
  return {
    alignment: null,
    identity: {
      name: 'Test Hero',
      age: '',
      height: '',
      weight: '',
      eyes: '',
      hair: '',
      skin: '',
      appearance: '',
    },
    backstory: '',
    faith: '',
  }
}

// ---------------------------------------------------------------------------
// Unit Tests: Skill Overlap Detection
// ---------------------------------------------------------------------------

describe('detectSkillOverlaps', () => {
  it('should detect skill overlap between background and class skills', () => {
    const bgSkills: SkillName[] = ['deception', 'stealth']
    const classSkills: SkillName[] = ['stealth', 'perception', 'acrobatics']
    const overlaps = detectSkillOverlaps(bgSkills, classSkills)
    expect(overlaps).toEqual(['stealth'])
  })

  it('should return empty array when no overlap exists', () => {
    const bgSkills: SkillName[] = ['insight', 'religion']
    const classSkills: SkillName[] = ['stealth', 'perception']
    const overlaps = detectSkillOverlaps(bgSkills, classSkills)
    expect(overlaps).toEqual([])
  })

  it('should detect multiple overlaps', () => {
    const bgSkills: SkillName[] = ['stealth', 'deception']
    const classSkills: SkillName[] = ['stealth', 'deception', 'acrobatics']
    const overlaps = detectSkillOverlaps(bgSkills, classSkills)
    expect(overlaps).toEqual(['stealth', 'deception'])
  })

  it('should handle empty class skills', () => {
    const bgSkills: SkillName[] = ['insight', 'religion']
    const overlaps = detectSkillOverlaps(bgSkills, [])
    expect(overlaps).toEqual([])
  })
})

describe('getReplacementSkills', () => {
  it('should exclude existing skills and background skills from replacement options', () => {
    const existing: SkillName[] = ['stealth', 'perception']
    const bgSkills: SkillName[] = ['deception', 'stealth']
    const replacements = getReplacementSkills(existing, bgSkills, {})
    expect(replacements).not.toContain('stealth')
    expect(replacements).not.toContain('perception')
    expect(replacements).not.toContain('deception')
    expect(replacements).toContain('athletics')
    expect(replacements).toContain('insight')
  })

  it('should exclude already-chosen replacements', () => {
    const existing: SkillName[] = ['stealth']
    const bgSkills: SkillName[] = ['deception', 'stealth']
    const currentReplacements: Record<string, SkillName | null> = {
      stealth: 'athletics',
    }
    const available = getReplacementSkills(existing, bgSkills, currentReplacements)
    expect(available).not.toContain('athletics')
  })
})

// ---------------------------------------------------------------------------
// BackgroundSelector Component Tests
// ---------------------------------------------------------------------------

describe('BackgroundSelector', () => {
  const defaultProps = {
    selectedBackground: null as Background | null,
    onSelect: vi.fn(),
    classSkills: [] as SkillName[],
    skillReplacements: {} as Record<string, SkillName | null>,
    onSkillReplacementChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display all SRD backgrounds in a selectable grid', () => {
    render(<BackgroundSelector {...defaultProps} />)
    for (const bg of allBackgrounds) {
      expect(screen.getByText(bg.name)).toBeInTheDocument()
    }
  })

  it('should show skill proficiencies on each background card', () => {
    render(<BackgroundSelector {...defaultProps} />)
    // Acolyte has Insight and Religion
    expect(screen.getByText('Insight, Religion')).toBeInTheDocument()
  })

  it('should show feature name on each background card', () => {
    render(<BackgroundSelector {...defaultProps} />)
    expect(screen.getByText('Shelter of the Faithful')).toBeInTheDocument()
  })

  it('should call onSelect when a background card is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<BackgroundSelector {...defaultProps} onSelect={onSelect} />)
    await user.click(screen.getByText('Acolyte'))
    expect(onSelect).toHaveBeenCalledWith(acolyteBackground)
  })

  it('should allow selecting only one background at a time', () => {
    render(
      <BackgroundSelector
        {...defaultProps}
        selectedBackground={acolyteBackground}
      />,
    )
    const options = screen.getAllByRole('option')
    const selectedOptions = options.filter(
      (opt) => opt.getAttribute('aria-selected') === 'true',
    )
    expect(selectedOptions).toHaveLength(1)
  })

  it('should filter backgrounds when searching', async () => {
    const user = userEvent.setup()
    render(<BackgroundSelector {...defaultProps} />)

    const search = screen.getByLabelText('Search backgrounds')
    await user.type(search, 'criminal')

    expect(screen.getByText('Criminal')).toBeInTheDocument()
    expect(screen.queryByText('Acolyte')).not.toBeInTheDocument()
  })

  it('should show empty state when no backgrounds match search', async () => {
    const user = userEvent.setup()
    render(<BackgroundSelector {...defaultProps} />)

    const search = screen.getByLabelText('Search backgrounds')
    await user.type(search, 'zzzznotabackground')

    expect(
      screen.getByText('No backgrounds match your search.'),
    ).toBeInTheDocument()
  })

  it('should show skill overlap warning when background overlaps with class skills', () => {
    render(
      <BackgroundSelector
        {...defaultProps}
        selectedBackground={criminalBackground}
        classSkills={['stealth', 'acrobatics']}
      />,
    )
    expect(screen.getByText('Skill Overlap Detected')).toBeInTheDocument()
  })

  it('should show replacement skill picker for each overlap', () => {
    render(
      <BackgroundSelector
        {...defaultProps}
        selectedBackground={criminalBackground}
        classSkills={['stealth', 'acrobatics']}
      />,
    )
    expect(
      screen.getByLabelText('Replacement for Stealth'),
    ).toBeInTheDocument()
  })

  it('should not show overlap warning when no overlaps exist', () => {
    render(
      <BackgroundSelector
        {...defaultProps}
        selectedBackground={acolyteBackground}
        classSkills={['stealth', 'acrobatics']}
      />,
    )
    expect(screen.queryByText('Skill Overlap Detected')).not.toBeInTheDocument()
  })

  it('should show View Details button on each card', () => {
    render(<BackgroundSelector {...defaultProps} />)
    const detailButtons = screen.getAllByText('View Details')
    expect(detailButtons.length).toBeGreaterThanOrEqual(allBackgrounds.length)
  })

  it('should show tool proficiencies on cards that have them', () => {
    render(<BackgroundSelector {...defaultProps} />)
    // Criminal has tool proficiencies including Thieves' tools
    // The tools are joined by comma so we use a substring matcher
    const toolTexts = screen.getAllByText(/Thieves' tools/)
    expect(toolTexts.length).toBeGreaterThan(0)
  })

  it('should show language info for backgrounds with language choices', () => {
    render(<BackgroundSelector {...defaultProps} />)
    // Multiple backgrounds have {choose: 2} languages (Acolyte, Sage, etc.)
    const languageTexts = screen.getAllByText('Choose 2 languages')
    expect(languageTexts.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// PersonalityEditor Component Tests
// ---------------------------------------------------------------------------

describe('PersonalityEditor', () => {
  const defaultProps = {
    background: acolyteBackground,
    personality: getDefaultPersonality(),
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display four personality sections', () => {
    render(<PersonalityEditor {...defaultProps} />)
    expect(screen.getByText('Personality Traits')).toBeInTheDocument()
    expect(screen.getByText('Ideal')).toBeInTheDocument()
    expect(screen.getByText('Bond')).toBeInTheDocument()
    expect(screen.getByText('Flaw')).toBeInTheDocument()
  })

  it('should show background personality trait entries as selectable options', () => {
    render(<PersonalityEditor {...defaultProps} />)
    // First personality trait of Acolyte
    expect(
      screen.getByText(acolyteBackground.personalityTraits[0].text),
    ).toBeInTheDocument()
  })

  it('should allow selecting a personality trait from the table', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PersonalityEditor {...defaultProps} onChange={onChange} />)

    const traitText = acolyteBackground.personalityTraits[0].text
    await user.click(screen.getByText(traitText))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        traits: expect.arrayContaining([traitText]),
      }),
    )
  })

  it('should allow selecting an ideal from the table', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PersonalityEditor {...defaultProps} onChange={onChange} />)

    const idealText = acolyteBackground.ideals[0].text
    await user.click(screen.getByText(idealText))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ideal: idealText,
      }),
    )
  })

  it('should allow selecting a bond from the table', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PersonalityEditor {...defaultProps} onChange={onChange} />)

    const bondText = acolyteBackground.bonds[0].text
    await user.click(screen.getByText(bondText))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        bond: bondText,
      }),
    )
  })

  it('should allow selecting a flaw from the table', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PersonalityEditor {...defaultProps} onChange={onChange} />)

    const flawText = acolyteBackground.flaws[0].text
    await user.click(screen.getByText(flawText))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        flaw: flawText,
      }),
    )
  })

  it('should show Roll button for each personality section', () => {
    render(<PersonalityEditor {...defaultProps} />)
    const rollButtons = screen.getAllByText('Roll')
    expect(rollButtons).toHaveLength(4) // traits, ideal, bond, flaw
  })

  it('should randomly select from the table when Roll is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PersonalityEditor {...defaultProps} onChange={onChange} />)

    const rollButtons = screen.getAllByText('Roll')
    // Click roll for personality traits
    await user.click(rollButtons[0])

    expect(onChange).toHaveBeenCalled()
    const call = onChange.mock.calls[0][0]
    // Should have selected traits from the table
    expect(call.traits.some((t: string) => t !== '')).toBe(true)
  })

  it('should show Randomize All button', () => {
    render(<PersonalityEditor {...defaultProps} />)
    expect(screen.getByText('Randomize All')).toBeInTheDocument()
  })

  it('should populate all four sections when Randomize All is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PersonalityEditor {...defaultProps} onChange={onChange} />)

    await user.click(screen.getByText('Randomize All'))

    expect(onChange).toHaveBeenCalled()
    const call = onChange.mock.calls[0][0]
    expect(call.traits[0]).toBeTruthy()
    expect(call.traits[1]).toBeTruthy()
    expect(call.ideal).toBeTruthy()
    expect(call.bond).toBeTruthy()
    expect(call.flaw).toBeTruthy()
  })

  it('should show Custom button for each section', () => {
    render(<PersonalityEditor {...defaultProps} />)
    const customButtons = screen.getAllByText('Custom')
    expect(customButtons).toHaveLength(4)
  })

  it('should show custom text input when Custom button is clicked', async () => {
    const user = userEvent.setup()
    render(<PersonalityEditor {...defaultProps} />)

    const customButtons = screen.getAllByText('Custom')
    await user.click(customButtons[0]) // Click custom for traits

    expect(
      screen.getByPlaceholderText(/write a custom personality trait/i),
    ).toBeInTheDocument()
  })

  it('should allow adding custom text entry', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PersonalityEditor {...defaultProps} onChange={onChange} />)

    // Switch to custom mode for traits
    const customButtons = screen.getAllByText('Custom')
    await user.click(customButtons[0])

    const input = screen.getByPlaceholderText(/write a custom personality trait/i)
    await user.type(input, 'I am very brave')
    await user.click(screen.getByText('Add'))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        traits: expect.arrayContaining(['I am very brave']),
      }),
    )
  })

  it('should display the background name context', () => {
    render(<PersonalityEditor {...defaultProps} />)
    expect(screen.getByText('Acolyte')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// CharacterDescription Component Tests
// ---------------------------------------------------------------------------

describe('CharacterDescription', () => {
  const defaultProps = {
    description: getDefaultDescription(),
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display alignment selector as a 3x3 grid', () => {
    render(<CharacterDescription {...defaultProps} />)
    const radioGroup = screen.getByRole('radiogroup', { name: 'Alignment' })
    expect(radioGroup).toBeInTheDocument()
    expect(screen.getByText('Lawful Good')).toBeInTheDocument()
    expect(screen.getByText('True Neutral')).toBeInTheDocument()
    expect(screen.getByText('Chaotic Evil')).toBeInTheDocument()
  })

  it('should allow selecting an alignment', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CharacterDescription {...defaultProps} onChange={onChange} />)

    await user.click(screen.getByText('Chaotic Good'))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        alignment: 'chaotic-good',
      }),
    )
  })

  it('should toggle alignment off when clicking the same one', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const desc = { ...getDefaultDescription(), alignment: 'chaotic-good' as const }
    render(<CharacterDescription description={desc} onChange={onChange} />)

    await user.click(screen.getByText('Chaotic Good'))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        alignment: null,
      }),
    )
  })

  it('should show Unaligned option', () => {
    render(<CharacterDescription {...defaultProps} />)
    expect(screen.getByText('Unaligned')).toBeInTheDocument()
  })

  it('should display physical description fields: age, height, weight', () => {
    render(<CharacterDescription {...defaultProps} />)
    expect(screen.getByLabelText('Age')).toBeInTheDocument()
    expect(screen.getByLabelText('Height')).toBeInTheDocument()
    expect(screen.getByLabelText('Weight')).toBeInTheDocument()
  })

  it('should display appearance fields: eyes, hair, skin', () => {
    render(<CharacterDescription {...defaultProps} />)
    expect(screen.getByLabelText('Eyes')).toBeInTheDocument()
    expect(screen.getByLabelText('Hair')).toBeInTheDocument()
    expect(screen.getByLabelText('Skin')).toBeInTheDocument()
  })

  it('should display faith/deity field', () => {
    render(<CharacterDescription {...defaultProps} />)
    expect(screen.getByLabelText(/faith/i)).toBeInTheDocument()
  })

  it('should display backstory textarea', () => {
    render(<CharacterDescription {...defaultProps} />)
    expect(screen.getByLabelText('Backstory')).toBeInTheDocument()
  })

  it('should display appearance notes textarea', () => {
    render(<CharacterDescription {...defaultProps} />)
    expect(screen.getByLabelText('Appearance notes')).toBeInTheDocument()
  })

  it('should update identity fields when typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CharacterDescription {...defaultProps} onChange={onChange} />)

    await user.type(screen.getByLabelText('Age'), '2')

    // Each keystroke calls onChange with the new character appended to the
    // current state. Since this is a controlled component that doesn't
    // re-render with updated props in isolation, we verify a single keystroke.
    expect(onChange).toHaveBeenCalled()
    const firstCall = onChange.mock.calls[0][0]
    expect(firstCall.identity.age).toBe('2')
  })

  it('should update backstory when typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CharacterDescription {...defaultProps} onChange={onChange} />)

    await user.type(screen.getByLabelText('Backstory'), 'A')

    expect(onChange).toHaveBeenCalled()
    const firstCall = onChange.mock.calls[0][0]
    expect(firstCall.backstory).toBe('A')
  })
})

// ---------------------------------------------------------------------------
// BackgroundStep Integration Tests
// ---------------------------------------------------------------------------

describe('BackgroundStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStoreState.backgroundSelection = null
    mockStoreState.classSelection = null
    mockStoreState.characterName = 'Test Hero'
  })

  it('should render the background step with help panel', () => {
    render(<BackgroundStep />)
    expect(screen.getByText('Need Help?')).toBeInTheDocument()
    expect(screen.getByText('Choose Your Background')).toBeInTheDocument()
  })

  it('should display all backgrounds initially', () => {
    render(<BackgroundStep />)
    for (const bg of allBackgrounds) {
      expect(screen.getByText(bg.name)).toBeInTheDocument()
    }
  })

  it('should not show personality editor until a background is selected', () => {
    render(<BackgroundStep />)
    expect(screen.queryByText('Personality Characteristics')).not.toBeInTheDocument()
  })

  it('should show personality editor after selecting a background', async () => {
    const user = userEvent.setup()
    render(<BackgroundStep />)

    await user.click(screen.getByText('Acolyte'))

    expect(screen.getByText('Personality Characteristics')).toBeInTheDocument()
  })

  it('should show character description after selecting a background', async () => {
    const user = userEvent.setup()
    render(<BackgroundStep />)

    await user.click(screen.getByText('Acolyte'))

    expect(screen.getByText('Character Description')).toBeInTheDocument()
  })

  it('should report validation error when no background is selected', () => {
    const onValidationChange = vi.fn()
    render(<BackgroundStep onValidationChange={onValidationChange} />)

    expect(onValidationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        valid: false,
        errors: expect.arrayContaining(['Please select a background']),
      }),
    )
  })

  it('should report validation error for missing personality traits after selection', async () => {
    const user = userEvent.setup()
    const onValidationChange = vi.fn()
    render(<BackgroundStep onValidationChange={onValidationChange} />)

    await user.click(screen.getByText('Acolyte'))

    // After selecting background, should still fail (no traits chosen)
    const lastCall =
      onValidationChange.mock.calls[onValidationChange.mock.calls.length - 1][0]
    expect(lastCall.valid).toBe(false)
    expect(lastCall.errors).toContain(
      'Please choose at least one personality trait',
    )
  })

  it('should call setBackground on the store when background is selected', async () => {
    const user = userEvent.setup()
    render(<BackgroundStep />)

    await user.click(screen.getByText('Acolyte'))

    expect(mockSetBackground).toHaveBeenCalled()
    const lastCall = mockSetBackground.mock.calls[mockSetBackground.mock.calls.length - 1][0]
    expect(lastCall.backgroundId).toBe('acolyte')
  })

  it('should detect skill overlap when class skills conflict with background', async () => {
    const user = userEvent.setup()
    mockStoreState.classSelection = {
      classId: 'rogue',
      level: 1,
      chosenSkills: ['stealth', 'perception', 'acrobatics', 'deception'],
      hpRolls: [],
    }

    render(<BackgroundStep />)

    // Criminal background grants deception + stealth, which overlap with rogue
    await user.click(screen.getByText('Criminal'))

    expect(screen.getByText('Skill Overlap Detected')).toBeInTheDocument()
  })

  it('should require replacement skills for all overlaps before validating', async () => {
    const user = userEvent.setup()
    const onValidationChange = vi.fn()
    mockStoreState.classSelection = {
      classId: 'rogue',
      level: 1,
      chosenSkills: ['stealth', 'acrobatics'],
      hpRolls: [],
    }

    render(<BackgroundStep onValidationChange={onValidationChange} />)

    await user.click(screen.getByText('Criminal'))

    // Should show validation error about unresolved overlaps
    const lastCall =
      onValidationChange.mock.calls[onValidationChange.mock.calls.length - 1][0]
    expect(lastCall.valid).toBe(false)
    expect(lastCall.errors).toContain(
      'Please choose replacement skills for all skill overlaps',
    )
  })

  it('should reset personality when changing backgrounds', async () => {
    const user = userEvent.setup()
    render(<BackgroundStep />)

    // Select Acolyte
    await user.click(screen.getByText('Acolyte'))
    expect(screen.getByText('Personality Characteristics')).toBeInTheDocument()

    // Select a trait
    await user.click(
      screen.getByText(acolyteBackground.personalityTraits[0].text),
    )

    // Now switch to Criminal
    await user.click(screen.getByText('Criminal'))

    // Should not show Acolyte traits anymore in selected state
    // (the criminal traits should now be showing)
    expect(
      screen.getByText(criminalBackground.personalityTraits[0].text),
    ).toBeInTheDocument()
  })

  it('should set background to null when none selected', () => {
    render(<BackgroundStep />)
    // On initial render with no selection, setBackground(null) should be called
    expect(mockSetBackground).toHaveBeenCalledWith(null)
  })
})
