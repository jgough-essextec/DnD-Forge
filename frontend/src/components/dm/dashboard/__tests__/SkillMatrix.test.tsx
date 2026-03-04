/**
 * SkillMatrix component tests (Story 34.3)
 */

import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkillMatrix } from '../SkillMatrix'
import type { Character } from '@/types/character'
import type { SkillName, AbilityName, Language } from '@/types/core'

// ---------------------------------------------------------------------------
// Test Character Factory
// ---------------------------------------------------------------------------

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-001',
    name: 'Fighter',
    playerName: 'Player One',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human' },
    classes: [{ classId: 'fighter', level: 5, chosenSkills: ['athletics'], hpRolls: [] }],
    background: { backgroundId: 'soldier' } as Character['background'],
    alignment: 'lawful-good',
    baseAbilityScores: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScores: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 6500,
    hpMax: 52,
    hpCurrent: 44,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: null,
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: ['common'] as Language[],
      skills: [
        { skill: 'athletics' as SkillName, proficient: true, expertise: false },
      ],
      savingThrows: ['strength', 'constitution'] as AbilityName[],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
    feats: [],
    description: { name: 'Fighter' } as Character['description'],
    personality: { personalityTraits: [], ideal: '', bond: '', flaw: '' },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    ...overrides,
  } as Character
}

function makeRogue(overrides: Partial<Character> = {}): Character {
  return makeCharacter({
    id: 'char-002',
    name: 'Rogue',
    classes: [{ classId: 'rogue', level: 5, chosenSkills: ['stealth'], chosenExpertise: ['stealth'], hpRolls: [] }],
    abilityScores: { strength: 10, dexterity: 18, constitution: 12, intelligence: 14, wisdom: 10, charisma: 14 },
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: ['common'] as Language[],
      skills: [
        { skill: 'stealth' as SkillName, proficient: true, expertise: true },
        { skill: 'acrobatics' as SkillName, proficient: true, expertise: false },
      ],
      savingThrows: ['dexterity', 'intelligence'] as AbilityName[],
    },
    ...overrides,
  })
}

describe('SkillMatrix', () => {
  it('should render the skill matrix container', () => {
    render(<SkillMatrix characters={[makeCharacter()]} />)
    expect(screen.getByTestId('skill-matrix')).toBeInTheDocument()
  })

  it('should render character names as column headers', () => {
    render(<SkillMatrix characters={[makeCharacter(), makeRogue()]} />)
    // Character name appears as column header; class name also appears below it.
    // Use getAllByText since "Fighter" matches both name and class display.
    expect(screen.getAllByText('Fighter').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Rogue').length).toBeGreaterThanOrEqual(1)
  })

  it('should render all 18 skill rows', () => {
    render(<SkillMatrix characters={[makeCharacter()]} />)
    expect(screen.getByText('Athletics')).toBeInTheDocument()
    expect(screen.getByText('Stealth')).toBeInTheDocument()
    expect(screen.getByText('Arcana')).toBeInTheDocument()
    expect(screen.getByText('Perception')).toBeInTheDocument()
    expect(screen.getByText('Persuasion')).toBeInTheDocument()
  })

  it('should group skills by ability score', () => {
    render(<SkillMatrix characters={[makeCharacter()]} />)
    expect(screen.getByTestId('skill-group-strength')).toHaveTextContent('STR')
    expect(screen.getByTestId('skill-group-dexterity')).toHaveTextContent('DEX')
    expect(screen.getByTestId('skill-group-intelligence')).toHaveTextContent('INT')
    expect(screen.getByTestId('skill-group-wisdom')).toHaveTextContent('WIS')
    expect(screen.getByTestId('skill-group-charisma')).toHaveTextContent('CHA')
  })

  it('should display skill modifier values', () => {
    render(<SkillMatrix characters={[makeCharacter()]} />)
    // Athletics: STR 16 (+3) + proficiency bonus 3 = +6
    const athleticsRow = screen.getByTestId('skill-row-athletics')
    expect(within(athleticsRow).getByText('+6')).toBeInTheDocument()
  })

  it('should display proficiency dots', () => {
    render(<SkillMatrix characters={[makeCharacter()]} />)
    // Athletics is proficient
    const cell = screen.getByTestId('skill-cell-athletics-char-001')
    expect(within(cell).getByTitle('Proficient')).toBeInTheDocument()
  })

  it('should display expertise dots for expertise skills', () => {
    render(<SkillMatrix characters={[makeRogue()]} />)
    // Stealth is expertise
    const cell = screen.getByTestId('skill-cell-stealth-char-002')
    expect(within(cell).getByTitle('Expertise')).toBeInTheDocument()
  })

  it('should display non-proficient dots', () => {
    render(<SkillMatrix characters={[makeCharacter()]} />)
    // Arcana is not proficient for fighter
    const cell = screen.getByTestId('skill-cell-arcana-char-001')
    expect(within(cell).getByTitle('Not proficient')).toBeInTheDocument()
  })

  it('should highlight highest modifier with gold background', () => {
    const fighter = makeCharacter()
    const rogue = makeRogue()
    render(<SkillMatrix characters={[fighter, rogue]} />)

    // Stealth: Fighter has DEX 12 (mod +1), Rogue has DEX 18 (mod +4) + expertise (6) = +10
    // Rogue should be best
    const rogueStealthCell = screen.getByTestId('skill-cell-stealth-char-002')
    expect(rogueStealthCell.className).toContain('bg-accent-gold/20')

    // Fighter's stealth cell should not be highlighted
    const fighterStealthCell = screen.getByTestId('skill-cell-stealth-char-001')
    expect(fighterStealthCell.className).not.toContain('bg-accent-gold/20')
  })

  it('should filter skills by search text', async () => {
    render(<SkillMatrix characters={[makeCharacter()]} />)

    const searchInput = screen.getByLabelText('Filter skills')
    await userEvent.type(searchInput, 'stealth')

    expect(screen.getByText('Stealth')).toBeInTheDocument()
    expect(screen.queryByText('Athletics')).not.toBeInTheDocument()
    expect(screen.queryByText('Arcana')).not.toBeInTheDocument()
  })

  it('should show "No skills match" message when filter has no matches', async () => {
    render(<SkillMatrix characters={[makeCharacter()]} />)

    const searchInput = screen.getByLabelText('Filter skills')
    await userEvent.type(searchInput, 'zzzznonexistent')

    expect(screen.getByText(/no skills match/i)).toBeInTheDocument()
  })

  it('should toggle "Show only proficient" checkbox', async () => {
    render(<SkillMatrix characters={[makeCharacter()]} />)

    const checkbox = screen.getByRole('checkbox', { name: /show only proficient/i })
    expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    // Non-proficient skills should show "--" instead of modifier
    const arcanaCell = screen.getByTestId('skill-cell-arcana-char-001')
    expect(within(arcanaCell).getByText('--')).toBeInTheDocument()
  })

  it('should render the search input', () => {
    render(<SkillMatrix characters={[makeCharacter()]} />)
    expect(screen.getByLabelText('Filter skills')).toBeInTheDocument()
  })
})
