/**
 * LanguageCoverage component tests (Story 34.4)
 */

import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageCoverage } from '../LanguageCoverage'
import type { Character } from '@/types/character'
import type { Language } from '@/types/core'

// ---------------------------------------------------------------------------
// Test Character Factory
// ---------------------------------------------------------------------------

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-001',
    name: 'Thorn',
    playerName: 'Player',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human' },
    classes: [{ classId: 'fighter', level: 5, chosenSkills: [], hpRolls: [] }],
    background: { backgroundId: 'soldier' } as Character['background'],
    alignment: 'lawful-good',
    baseAbilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    abilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 0,
    hpMax: 40,
    hpCurrent: 40,
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
      languages: ['common', 'dwarvish'] as Language[],
      skills: [],
      savingThrows: [],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
    feats: [],
    description: { name: 'Thorn' } as Character['description'],
    personality: { personalityTraits: [], ideal: '', bond: '', flaw: '' },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    ...overrides,
  } as Character
}

describe('LanguageCoverage', () => {
  it('should render the language coverage container', () => {
    render(<LanguageCoverage characters={[makeCharacter()]} />)
    expect(screen.getByTestId('language-coverage')).toBeInTheDocument()
  })

  it('should display Common Languages section', () => {
    render(<LanguageCoverage characters={[makeCharacter()]} />)
    expect(screen.getByText('Common Languages')).toBeInTheDocument()
  })

  it('should display Exotic Languages section', () => {
    render(<LanguageCoverage characters={[makeCharacter()]} />)
    expect(screen.getByText('Exotic Languages')).toBeInTheDocument()
  })

  it('should show languages with speaker counts', () => {
    render(<LanguageCoverage characters={[makeCharacter()]} />)
    // Common has 1 speaker, Dwarvish has 1 speaker
    expect(screen.getByLabelText('Common: 1 speaker')).toBeInTheDocument()
    expect(screen.getByLabelText('Dwarvish: 1 speaker')).toBeInTheDocument()
  })

  it('should show language gaps section', () => {
    render(<LanguageCoverage characters={[makeCharacter()]} />)
    expect(screen.getByText('Language Gaps')).toBeInTheDocument()
    const gapsSection = screen.getByTestId('language-gaps')
    // Should list languages with 0 speakers
    expect(gapsSection).toBeInTheDocument()
  })

  it('should show 0 count for languages no one speaks', () => {
    render(<LanguageCoverage characters={[makeCharacter()]} />)
    // Elvish (0) may appear in both Common section and Gaps section
    const elvishBadges = screen.getAllByText(/Elvish \(0\)/)
    expect(elvishBadges.length).toBeGreaterThanOrEqual(1)
  })

  it('should aggregate languages across multiple characters', () => {
    const char1 = makeCharacter({
      id: '1',
      name: 'Char A',
      proficiencies: {
        armor: [], weapons: [], tools: [],
        languages: ['common', 'elvish'] as Language[],
        skills: [], savingThrows: [],
      },
    })
    const char2 = makeCharacter({
      id: '2',
      name: 'Char B',
      proficiencies: {
        armor: [], weapons: [], tools: [],
        languages: ['common', 'elvish', 'draconic'] as Language[],
        skills: [], savingThrows: [],
      },
    })
    render(<LanguageCoverage characters={[char1, char2]} />)
    expect(screen.getByLabelText('Common: 2 speakers')).toBeInTheDocument()
    expect(screen.getByLabelText('Elvish: 2 speakers')).toBeInTheDocument()
    expect(screen.getByLabelText('Draconic: 1 speaker')).toBeInTheDocument()
  })

  it('should expand language badge to show speakers on click', async () => {
    const char = makeCharacter({ name: 'Thorn' })
    render(<LanguageCoverage characters={[char]} />)

    const commonBadge = screen.getByLabelText('Common: 1 speaker')
    await userEvent.click(commonBadge)

    expect(screen.getByTestId('language-speakers-common')).toHaveTextContent('Thorn')
  })

  it('should show tool proficiencies section', () => {
    const char = makeCharacter({
      proficiencies: {
        armor: [], weapons: [],
        tools: ["thieves' tools", 'navigator'],
        languages: ['common'] as Language[],
        skills: [], savingThrows: [],
      },
    })
    render(<LanguageCoverage characters={[char]} />)
    expect(screen.getByText('Tool Proficiencies')).toBeInTheDocument()
    const toolSection = screen.getByTestId('tool-proficiencies')
    expect(within(toolSection).getByText(/thieves' tools/)).toBeInTheDocument()
    expect(within(toolSection).getByText(/navigator/)).toBeInTheDocument()
  })

  it('should show "No tool proficiencies" when none exist', () => {
    render(<LanguageCoverage characters={[makeCharacter()]} />)
    expect(screen.getByText(/no tool proficiencies/i)).toBeInTheDocument()
  })

  it('should expand tool badge to show users on click', async () => {
    const char = makeCharacter({
      name: 'Toolmaker',
      proficiencies: {
        armor: [], weapons: [],
        tools: ['smithing tools'],
        languages: ['common'] as Language[],
        skills: [], savingThrows: [],
      },
    })
    render(<LanguageCoverage characters={[char]} />)

    const toolBadge = screen.getByText(/smithing tools/)
    await userEvent.click(toolBadge)

    expect(screen.getByTestId('tool-users-smithing tools')).toHaveTextContent('Toolmaker')
  })
})
