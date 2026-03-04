/**
 * PartyComposition component tests (Story 34.5)
 */

import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { PartyComposition } from '../PartyComposition'
import type { Character } from '@/types/character'
import type { SkillName, AbilityName, Language } from '@/types/core'

// ---------------------------------------------------------------------------
// Test Character Factory
// ---------------------------------------------------------------------------

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-001',
    name: 'Fighter',
    playerName: 'Player',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human' },
    classes: [{ classId: 'fighter', level: 5, chosenSkills: [], hpRolls: [] }],
    background: { backgroundId: 'soldier' } as Character['background'],
    alignment: 'lawful-good',
    baseAbilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 0,
    hpMax: 52,
    hpCurrent: 52,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 18, dexModifier: 2, shieldBonus: 2, otherBonuses: [], formula: '16 + 2' },
      initiative: 2,
      speed: { walk: 30 },
      hitPoints: { maximum: 52, current: 52, temporary: 0, hitDice: { total: [{ count: 5, die: 'd10' }], used: [0] } },
      attacks: [],
      savingThrows: { strength: 6, constitution: 5 },
    },
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: ['common'] as Language[],
      skills: [
        { skill: 'athletics' as SkillName, proficient: true, expertise: false },
        { skill: 'perception' as SkillName, proficient: true, expertise: false },
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

function makeCleric(overrides: Partial<Character> = {}): Character {
  return makeCharacter({
    id: 'char-cleric',
    name: 'Cleric',
    classes: [{ classId: 'cleric', level: 5, chosenSkills: [], hpRolls: [] }],
    abilityScores: { strength: 14, dexterity: 10, constitution: 14, intelligence: 10, wisdom: 18, charisma: 12 },
    ...overrides,
  })
}

function makeWizard(overrides: Partial<Character> = {}): Character {
  return makeCharacter({
    id: 'char-wizard',
    name: 'Wizard',
    classes: [{ classId: 'wizard', level: 5, chosenSkills: [], hpRolls: [] }],
    abilityScores: { strength: 8, dexterity: 14, constitution: 12, intelligence: 18, wisdom: 12, charisma: 10 },
    ...overrides,
  })
}

function makeRogue(overrides: Partial<Character> = {}): Character {
  return makeCharacter({
    id: 'char-rogue',
    name: 'Rogue',
    classes: [{ classId: 'rogue', level: 5, chosenSkills: [], hpRolls: [] }],
    abilityScores: { strength: 10, dexterity: 18, constitution: 12, intelligence: 14, wisdom: 10, charisma: 14 },
    ...overrides,
  })
}

describe('PartyComposition', () => {
  it('should render the composition container', () => {
    render(<PartyComposition characters={[makeCharacter()]} />)
    expect(screen.getByTestId('party-composition')).toBeInTheDocument()
  })

  it('should render the title', () => {
    render(<PartyComposition characters={[makeCharacter()]} />)
    expect(screen.getByText('Party Strengths & Potential Gaps')).toBeInTheDocument()
  })

  it('should render all 7 role cards', () => {
    render(<PartyComposition characters={[makeCharacter()]} />)
    expect(screen.getByTestId('role-card-Tank/Defender')).toBeInTheDocument()
    expect(screen.getByTestId('role-card-Melee Striker')).toBeInTheDocument()
    expect(screen.getByTestId('role-card-Ranged Striker')).toBeInTheDocument()
    expect(screen.getByTestId('role-card-Healer/Support')).toBeInTheDocument()
    expect(screen.getByTestId('role-card-Controller')).toBeInTheDocument()
    expect(screen.getByTestId('role-card-Utility/Skill Monkey')).toBeInTheDocument()
    expect(screen.getByTestId('role-card-Face (Social)')).toBeInTheDocument()
  })

  it('should show fighter as Tank/Defender and Melee Striker', () => {
    render(<PartyComposition characters={[makeCharacter()]} />)
    const tankCard = screen.getByTestId('role-card-Tank/Defender')
    expect(within(tankCard).getByText('Fighter')).toBeInTheDocument()
    const meleeCard = screen.getByTestId('role-card-Melee Striker')
    expect(within(meleeCard).getByText('Fighter')).toBeInTheDocument()
  })

  it('should show "No coverage" for roles without characters', () => {
    render(<PartyComposition characters={[makeCharacter()]} />)
    const healerCard = screen.getByTestId('role-card-Healer/Support')
    expect(within(healerCard).getByText('No coverage')).toBeInTheDocument()
  })

  it('should show coverage indicators', () => {
    render(<PartyComposition characters={[makeCharacter()]} />)
    // Tank/Defender has primary coverage
    const tankCard = screen.getByTestId('role-card-Tank/Defender')
    expect(within(tankCard).getByTitle('Covered (primary)')).toBeInTheDocument()

    // Ranged Striker has secondary coverage (from fighter)
    const rangedCard = screen.getByTestId('role-card-Ranged Striker')
    expect(within(rangedCard).getByTitle('Partially covered (secondary)')).toBeInTheDocument()

    // Healer has no coverage
    const healerCard = screen.getByTestId('role-card-Healer/Support')
    expect(within(healerCard).getByTitle('Not covered')).toBeInTheDocument()
  })

  it('should show cleric as primary Healer/Support', () => {
    render(<PartyComposition characters={[makeCharacter(), makeCleric()]} />)
    const healerCard = screen.getByTestId('role-card-Healer/Support')
    expect(within(healerCard).getByText('Cleric')).toBeInTheDocument()
    expect(within(healerCard).getByTitle('Covered (primary)')).toBeInTheDocument()
  })

  it('should show wizard as primary Controller', () => {
    render(<PartyComposition characters={[makeWizard()]} />)
    const controllerCard = screen.getByTestId('role-card-Controller')
    expect(within(controllerCard).getByText('Wizard')).toBeInTheDocument()
  })

  it('should show rogue as primary Utility/Skill Monkey', () => {
    render(<PartyComposition characters={[makeRogue()]} />)
    const utilityCard = screen.getByTestId('role-card-Utility/Skill Monkey')
    expect(within(utilityCard).getByText('Rogue')).toBeInTheDocument()
  })

  it('should display party callouts', () => {
    // Fighter only party: should have "no healer" warning
    render(<PartyComposition characters={[makeCharacter()]} />)
    const callouts = screen.getByTestId('party-callouts')
    expect(callouts).toBeInTheDocument()
    expect(screen.getByText('No one has healing magic')).toBeInTheDocument()
  })

  it('should show warning callout type for missing healing', () => {
    render(<PartyComposition characters={[makeCharacter()]} />)
    expect(screen.getByTestId('callout-warning')).toBeInTheDocument()
  })

  it('should not show "no healer" warning when party has cleric', () => {
    render(<PartyComposition characters={[makeCharacter(), makeCleric()]} />)
    expect(screen.queryByText('No one has healing magic')).not.toBeInTheDocument()
  })

  it('should handle balanced party with all roles covered', () => {
    const party = [
      makeCharacter({ name: 'Tank' }),
      makeCleric({ name: 'Healer' }),
      makeWizard({ name: 'Caster' }),
      makeRogue({ name: 'Skills' }),
    ]
    render(<PartyComposition characters={party} />)

    // Tank/Defender should be covered
    const tankCard = screen.getByTestId('role-card-Tank/Defender')
    expect(within(tankCard).getByTitle('Covered (primary)')).toBeInTheDocument()

    // Healer should be covered
    const healerCard = screen.getByTestId('role-card-Healer/Support')
    expect(within(healerCard).getByTitle('Covered (primary)')).toBeInTheDocument()

    // Controller should be covered by wizard
    const controllerCard = screen.getByTestId('role-card-Controller')
    expect(within(controllerCard).getByTitle('Covered (primary)')).toBeInTheDocument()
  })

  it('should display role descriptions', () => {
    render(<PartyComposition characters={[makeCharacter()]} />)
    const tankCard = screen.getByTestId('role-card-Tank/Defender')
    expect(within(tankCard).getByText(/high AC and HP/i)).toBeInTheDocument()
  })
})
