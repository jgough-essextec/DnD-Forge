/**
 * PartyStatsGrid Tablet Layout Tests (Story 44.2)
 *
 * Verifies tablet-specific responsive behavior:
 * - Less important columns are hidden on narrower widths
 * - All columns visible at desktop breakpoint
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PartyStatsGrid } from '@/components/dm/dashboard/PartyStatsGrid'
import type { Character } from '@/types/character'

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-1',
    name: 'Aragorn',
    level: 5,
    race: 'human',
    subrace: null,
    classes: [{ classId: 'fighter', level: 5, subclassId: null }],
    abilityScores: {
      strength: 18,
      dexterity: 14,
      constitution: 16,
      intelligence: 10,
      wisdom: 12,
      charisma: 10,
    },
    hpMax: 44,
    hpCurrent: 44,
    tempHp: 0,
    proficiencies: {
      skills: [],
      savingThrows: [],
      tools: [],
      weapons: [],
      armor: [],
      languages: ['common'],
    },
    background: 'soldier',
    alignment: 'lawful-good',
    experiencePoints: 6500,
    speed: { walk: 30 },
    conditions: [],
    equipment: [],
    spellcasting: null,
    combatStats: null,
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    backstory: '',
    appearance: {},
    isArchived: false,
    ...overrides,
  } as unknown as Character
}

describe('PartyStatsGrid — Tablet Layout (Story 44.2)', () => {
  const renderGrid = (characters: Character[]) =>
    render(
      <MemoryRouter>
        <PartyStatsGrid characters={characters} />
      </MemoryRouter>,
    )

  it('renders the party stats grid', () => {
    renderGrid([makeCharacter()])
    expect(screen.getByTestId('party-stats-grid')).toBeInTheDocument()
  })

  it('shows core columns (Name, Race, Class/Level, AC, HP, Passive Perception)', () => {
    renderGrid([makeCharacter()])
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Race')).toBeInTheDocument()
    expect(screen.getByText('Class / Level')).toBeInTheDocument()
    expect(screen.getByText('AC')).toBeInTheDocument()
    expect(screen.getByText('HP')).toBeInTheDocument()
    expect(screen.getByText('Passive Perception')).toBeInTheDocument()
  })

  it('hides Speed column at narrow widths via hidden lg:table-cell classes', () => {
    renderGrid([makeCharacter()])

    // Find the Speed header
    const speedHeader = screen.getByText('Speed').closest('th')
    expect(speedHeader).toBeTruthy()
    expect(speedHeader!.className).toContain('hidden')
    expect(speedHeader!.className).toContain('lg:table-cell')
  })

  it('hides Spell Save DC column at narrow widths via hidden lg:table-cell classes', () => {
    renderGrid([makeCharacter()])

    const spellDCHeader = screen.getByText('Spell Save DC').closest('th')
    expect(spellDCHeader).toBeTruthy()
    expect(spellDCHeader!.className).toContain('hidden')
    expect(spellDCHeader!.className).toContain('lg:table-cell')
  })

  it('hides Initiative column at narrow widths via hidden lg:table-cell classes', () => {
    renderGrid([makeCharacter()])

    const initHeader = screen.getByText('Initiative').closest('th')
    expect(initHeader).toBeTruthy()
    expect(initHeader!.className).toContain('hidden')
    expect(initHeader!.className).toContain('lg:table-cell')
  })

  it('hides Conditions column at narrow widths via hidden lg:table-cell classes', () => {
    renderGrid([makeCharacter()])

    const condHeader = screen.getByText('Conditions').closest('th')
    expect(condHeader).toBeTruthy()
    expect(condHeader!.className).toContain('hidden')
    expect(condHeader!.className).toContain('lg:table-cell')
  })

  it('hides Level Progress column at narrow widths via hidden md:table-cell classes', () => {
    renderGrid([makeCharacter()])

    const lpHeader = screen.getByText('Level Progress').closest('th')
    expect(lpHeader).toBeTruthy()
    expect(lpHeader!.className).toContain('hidden')
    expect(lpHeader!.className).toContain('md:table-cell')
  })
})
