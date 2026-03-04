/**
 * PartyStatsGrid component tests (Story 34.2)
 */

import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PartyStatsGrid } from '../PartyStatsGrid'
import type { Character } from '@/types/character'
import type { SkillName, AbilityName, Language } from '@/types/core'

// ---------------------------------------------------------------------------
// Test Character Factory
// ---------------------------------------------------------------------------

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-001',
    name: 'Thorn Ironforge',
    playerName: 'Player One',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'dwarf', subraceId: 'hill-dwarf' },
    classes: [{ classId: 'fighter', level: 5, chosenSkills: ['athletics', 'perception'], hpRolls: [] }],
    background: { backgroundId: 'soldier' } as Character['background'],
    alignment: 'lawful-good',
    baseAbilityScores: { strength: 16, dexterity: 12, constitution: 16, intelligence: 10, wisdom: 14, charisma: 8 },
    abilityScores: { strength: 16, dexterity: 12, constitution: 16, intelligence: 10, wisdom: 14, charisma: 8 },
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 6500,
    hpMax: 52,
    hpCurrent: 44,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [0],
    speed: { walk: 25 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 18, dexModifier: 1, shieldBonus: 2, otherBonuses: [], formula: '16 + 2' },
      initiative: 1,
      speed: { walk: 25 },
      hitPoints: { maximum: 52, current: 44, temporary: 0, hitDice: { total: [{ count: 5, die: 'd10' }], used: [0] } },
      attacks: [],
      savingThrows: { strength: 6, constitution: 5 },
    },
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple melee', 'martial melee'],
      tools: [],
      languages: ['common', 'dwarvish'] as Language[],
      skills: [
        { skill: 'athletics' as SkillName, proficient: true, expertise: false },
        { skill: 'perception' as SkillName, proficient: true, expertise: false },
      ],
      savingThrows: ['strength', 'constitution'] as AbilityName[],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 },
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

const fighter = makeCharacter()

const wizard = makeCharacter({
  id: 'char-002',
  name: 'Elara Nightwhisper',
  race: { raceId: 'elf', subraceId: 'high-elf' },
  classes: [{ classId: 'wizard', level: 3, chosenSkills: ['arcana'], hpRolls: [] }],
  abilityScores: { strength: 8, dexterity: 14, constitution: 12, intelligence: 18, wisdom: 12, charisma: 10 },
  level: 3,
  hpMax: 18,
  hpCurrent: 18,
  tempHp: 5,
  speed: { walk: 30 },
  combatStats: {
    armorClass: { base: 12, dexModifier: 2, shieldBonus: 0, otherBonuses: [], formula: '10 + 2' },
    initiative: 2,
    speed: { walk: 30 },
    hitPoints: { maximum: 18, current: 18, temporary: 5, hitDice: { total: [{ count: 3, die: 'd6' }], used: [0] } },
    attacks: [],
    savingThrows: { intelligence: 6, wisdom: 3 },
  },
  spellcasting: {
    maxPrepared: 7,
    spellSlots: {},
    slotsUsed: {},
    preparedSpellIds: [],
    knownCantrips: [],
  } as unknown as Character['spellcasting'],
  proficiencies: {
    armor: [],
    weapons: [],
    tools: [],
    languages: ['common', 'elvish'] as Language[],
    skills: [
      { skill: 'arcana' as SkillName, proficient: true, expertise: false },
    ],
    savingThrows: ['intelligence', 'wisdom'] as AbilityName[],
  },
  conditions: [],
})

const deadCharacter = makeCharacter({
  id: 'char-003',
  name: 'Fallen Hero',
  hpCurrent: 0,
  hpMax: 40,
  conditions: [{ condition: 'unconscious' }],
})

const conditionCharacter = makeCharacter({
  id: 'char-004',
  name: 'Cursed One',
  conditions: [
    { condition: 'poisoned' },
    { condition: 'frightened' },
  ],
})

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

// ===========================================================================
// Tests
// ===========================================================================

describe('PartyStatsGrid', () => {
  it('should render the grid with all column headers', () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Race')).toBeInTheDocument()
    expect(screen.getByText('Class / Level')).toBeInTheDocument()
    expect(screen.getByText('AC')).toBeInTheDocument()
    expect(screen.getByText('HP')).toBeInTheDocument()
    expect(screen.getByText('Speed')).toBeInTheDocument()
    expect(screen.getByText('Passive Perception')).toBeInTheDocument()
    expect(screen.getByText('Spell Save DC')).toBeInTheDocument()
    expect(screen.getByText('Initiative')).toBeInTheDocument()
    expect(screen.getByText('Conditions')).toBeInTheDocument()
  })

  it('should render character name as a clickable link', () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    const nameBtn = screen.getByRole('button', { name: 'Thorn Ironforge' })
    expect(nameBtn).toBeInTheDocument()
  })

  it('should render character race', () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    expect(screen.getByText('Hill Dwarf')).toBeInTheDocument()
  })

  it('should render character class and level', () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    expect(screen.getByText('Fighter')).toBeInTheDocument()
    expect(screen.getByText('Lv.5')).toBeInTheDocument()
  })

  it('should render AC value', () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    expect(screen.getByText('18')).toBeInTheDocument()
  })

  it('should render HP current/max', () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    expect(screen.getByText('44/52')).toBeInTheDocument()
  })

  it('should render HP progress bar with correct color for high HP (green)', () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    const hpCell = screen.getByTestId(`hp-cell-${fighter.id}`)
    const bar = hpCell.querySelector('[role="progressbar"]')
    expect(bar).toBeInTheDocument()
    // 44/52 = ~85% -> green
    const fill = bar?.querySelector('div')
    expect(fill?.className).toContain('bg-green-500')
  })

  it('should render skull icon at 0 HP', () => {
    renderWithRouter(<PartyStatsGrid characters={[deadCharacter]} />)
    const hpCell = screen.getByTestId(`hp-cell-${deadCharacter.id}`)
    expect(within(hpCell).getByLabelText('0 HP')).toBeInTheDocument()
  })

  it('should render blue temp HP badge when present', () => {
    renderWithRouter(<PartyStatsGrid characters={[wizard]} />)
    expect(screen.getByText('+5')).toBeInTheDocument()
  })

  it('should render speed', () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    expect(screen.getByText('25 ft')).toBeInTheDocument()
  })

  it('should show "---" for spell save DC on non-casters', () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    expect(screen.getByText('---')).toBeInTheDocument()
  })

  it('should render initiative modifier', () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    // DEX 12 = +1
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('should render conditions as badges', () => {
    renderWithRouter(<PartyStatsGrid characters={[conditionCharacter]} />)
    expect(screen.getByText('Poisoned')).toBeInTheDocument()
    expect(screen.getByText('Frightened')).toBeInTheDocument()
  })

  it('should render "None" when character has no conditions', () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    expect(screen.getByText('None')).toBeInTheDocument()
  })

  it('should sort by name when Name header is clicked', async () => {
    const chars = [
      makeCharacter({ id: '1', name: 'Zara' }),
      makeCharacter({ id: '2', name: 'Alpha' }),
    ]
    renderWithRouter(<PartyStatsGrid characters={chars} />)

    // Default sort is name ascending
    const rows = screen.getAllByTestId(/party-row-/)
    expect(rows[0]).toHaveAttribute('data-testid', 'party-row-2') // Alpha
    expect(rows[1]).toHaveAttribute('data-testid', 'party-row-1') // Zara
  })

  it('should toggle sort direction when same header is clicked twice', async () => {
    const chars = [
      makeCharacter({ id: '1', name: 'Alpha' }),
      makeCharacter({ id: '2', name: 'Zara' }),
    ]
    renderWithRouter(<PartyStatsGrid characters={chars} />)

    // Default sort: Name ascending -> Alpha (1), Zara (2)
    let rows = screen.getAllByTestId(/party-row-/)
    expect(rows[0]).toHaveAttribute('data-testid', 'party-row-1')

    // Click Name again to toggle to descending -> Zara (2), Alpha (1)
    await userEvent.click(screen.getByText('Name'))

    rows = screen.getAllByTestId(/party-row-/)
    expect(rows[0]).toHaveAttribute('data-testid', 'party-row-2')
  })

  it('should display sort indicator on active column', async () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    // Name is the default sorted column
    expect(screen.getByLabelText('Sorted ascending')).toBeInTheDocument()
  })

  it('should expand row on chevron click', async () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)

    const expandBtn = screen.getByLabelText(`Expand details for ${fighter.name}`)
    await userEvent.click(expandBtn)

    expect(screen.getByTestId(`expanded-row-${fighter.id}`)).toBeInTheDocument()
    expect(screen.getByText('Ability Scores')).toBeInTheDocument()
    expect(screen.getByText('Proficient Skills')).toBeInTheDocument()
    expect(screen.getByText('Languages')).toBeInTheDocument()
  })

  it('should collapse row on second chevron click', async () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)

    const expandBtn = screen.getByLabelText(`Expand details for ${fighter.name}`)
    await userEvent.click(expandBtn)
    expect(screen.getByTestId(`expanded-row-${fighter.id}`)).toBeInTheDocument()

    const collapseBtn = screen.getByLabelText(`Collapse details for ${fighter.name}`)
    await userEvent.click(collapseBtn)
    expect(screen.queryByTestId(`expanded-row-${fighter.id}`)).not.toBeInTheDocument()
  })

  it('should show proficient skills in expanded row', async () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    await userEvent.click(screen.getByLabelText(`Expand details for ${fighter.name}`))
    expect(screen.getByText('Athletics')).toBeInTheDocument()
    expect(screen.getByText('Perception')).toBeInTheDocument()
  })

  it('should show languages in expanded row', async () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter]} />)
    await userEvent.click(screen.getByLabelText(`Expand details for ${fighter.name}`))
    expect(screen.getByText('Common')).toBeInTheDocument()
    expect(screen.getByText('Dwarvish')).toBeInTheDocument()
  })

  it('should render multiple characters', () => {
    renderWithRouter(<PartyStatsGrid characters={[fighter, wizard]} />)
    expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
    expect(screen.getByText('Elara Nightwhisper')).toBeInTheDocument()
  })

  it('should render with HP bar at red when HP is below 25%', () => {
    const lowHpChar = makeCharacter({ id: 'low', hpCurrent: 5, hpMax: 52 })
    renderWithRouter(<PartyStatsGrid characters={[lowHpChar]} />)
    const hpCell = screen.getByTestId('hp-cell-low')
    const bar = hpCell.querySelector('[role="progressbar"]')
    const fill = bar?.querySelector('div')
    expect(fill?.className).toContain('bg-red-500')
  })

  it('should render with HP bar at yellow when HP is 25-50%', () => {
    const midHpChar = makeCharacter({ id: 'mid', hpCurrent: 15, hpMax: 52 })
    renderWithRouter(<PartyStatsGrid characters={[midHpChar]} />)
    const hpCell = screen.getByTestId('hp-cell-mid')
    const bar = hpCell.querySelector('[role="progressbar"]')
    const fill = bar?.querySelector('div')
    expect(fill?.className).toContain('bg-yellow-500')
  })
})
