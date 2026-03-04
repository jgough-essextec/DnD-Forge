/**
 * SessionView Tests (Epic 32 - Story 32.1)
 *
 * Tests for the compact session mode main view including:
 * all 8 sections, HP bar, quick actions, attacks, spell slots,
 * pinned skills, conditions, features, and interactions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionView } from '../SessionView'
import type { Character } from '@/types/character'
import type { DerivedStats } from '@/hooks/useCharacterCalculations'
import type { SkillName, AbilityName } from '@/types/core'

// ---------------------------------------------------------------------------
// Mock stores
// ---------------------------------------------------------------------------

const mockRoll = vi.fn()
const mockToggleDiceRoller = vi.fn()

vi.mock('@/stores/diceStore', () => ({
  useDiceStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ roll: mockRoll }),
}))

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ diceRollerOpen: false, toggleDiceRoller: mockToggleDiceRoller }),
}))

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

function createSkillModifiers(): Record<SkillName, number> {
  return {
    acrobatics: 2,
    'animal-handling': 1,
    arcana: 0,
    athletics: 5,
    deception: -1,
    history: 0,
    insight: 3,
    intimidation: -1,
    investigation: 0,
    medicine: 1,
    nature: 0,
    perception: 5,
    performance: -1,
    persuasion: -1,
    religion: 0,
    'sleight-of-hand': 2,
    stealth: 2,
    survival: 1,
  }
}

function createSavingThrows(): Record<AbilityName, number> {
  return {
    strength: 6,
    dexterity: 2,
    constitution: 5,
    intelligence: 0,
    wisdom: 1,
    charisma: -1,
  }
}

function createMockDerivedStats(overrides: Partial<DerivedStats> = {}): DerivedStats {
  return {
    effectiveAbilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityModifiers: { strength: 3, dexterity: 2, constitution: 2, intelligence: 0, wisdom: 1, charisma: -1 },
    proficiencyBonus: 3,
    armorClass: 18,
    initiative: 2,
    hpMax: 44,
    skillModifiers: createSkillModifiers(),
    savingThrows: createSavingThrows(),
    passivePerception: 15,
    passiveInvestigation: 10,
    passiveInsight: 13,
    spellSaveDC: null,
    spellAttackBonus: null,
    spellSlots: {},
    cantripsKnown: 0,
    spellsPrepared: 0,
    meleeAttackBonus: 6,
    rangedAttackBonus: 5,
    inventoryWeight: 40,
    carryingCapacity: 240,
    isEncumbered: false,
    ...overrides,
  }
}

function createMockCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test-char-session',
    name: 'Thorn Ironforge',
    playerName: 'Player 1',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'dwarf', name: 'Dwarf' } as unknown as Character['race'],
    classes: [
      {
        classId: 'fighter',
        level: 5,
        chosenSkills: ['athletics', 'perception'],
        hpRolls: [7, 6, 8, 5],
      },
    ],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: 'Thorn Ironforge' },
      characterPersonality: { personalityTraits: ['trait1', 'trait2'], ideal: 'ideal', bond: 'bond', flaw: 'flaw' },
    } as Character['background'],
    alignment: 'lawful-good',
    baseAbilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 6500,
    hpMax: 44,
    hpCurrent: 30,
    tempHp: 5,
    hitDiceTotal: [5],
    hitDiceUsed: [1],
    speed: { walk: 25 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 18, dexModifier: 2, shieldBonus: 2, otherBonuses: [], formula: '16 + 2' },
      initiative: 2,
      speed: { walk: 25 },
      hitPoints: { maximum: 44, current: 30, temporary: 5, hitDice: { total: [{ count: 5, die: 'd10' }], used: [1] } },
      attacks: [
        {
          name: 'Warhammer',
          attackType: 'melee-weapon',
          attackBonus: 6,
          abilityModifier: 'strength',
          proficient: true,
          damageRolls: [{ dice: { count: 1, die: 'd8', modifier: 3 }, damageType: 'bludgeoning' }],
        },
        {
          name: 'Handaxe',
          attackType: 'melee-weapon',
          attackBonus: 6,
          abilityModifier: 'strength',
          proficient: true,
          damageRolls: [{ dice: { count: 1, die: 'd6', modifier: 3 }, damageType: 'slashing' }],
        },
      ],
      savingThrows: { strength: 6, constitution: 5 },
    },
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple melee', 'simple ranged', 'martial melee', 'martial ranged'],
      tools: [],
      languages: ['common', 'dwarvish'],
      skills: [
        { skill: 'athletics', proficient: true, expertise: false },
        { skill: 'perception', proficient: true, expertise: false },
      ],
      savingThrows: ['strength', 'constitution'],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: ['second-wind', 'action-surge'],
    feats: [],
    description: { name: '', age: '', height: '', weight: '', eyes: '', skin: '', hair: '', appearance: '', backstory: '', alliesAndOrgs: '', treasure: '' },
    personality: { personalityTraits: ['trait1', 'trait2'] as [string, string], ideal: 'ideal', bond: 'bond', flaw: 'flaw' },
    conditions: [
      { condition: 'poisoned' },
    ],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    ...overrides,
  } as Character
}

function createCasterCharacter(): Character {
  return createMockCharacter({
    id: 'test-caster',
    name: 'Elara Brightmoon',
    classes: [
      {
        classId: 'wizard',
        level: 5,
        chosenSkills: ['arcana', 'investigation'],
        hpRolls: [4, 3, 5, 4],
      },
    ],
    spellcasting: {
      type: 'prepared',
      ability: 'intelligence',
      cantrips: ['fire-bolt', 'light'],
      knownSpells: [],
      preparedSpells: ['magic-missile', 'shield'],
      spellSlots: { 1: 4, 2: 3, 3: 2 },
      usedSpellSlots: { 1: 1, 2: 0, 3: 0 },
      ritualCasting: true,
    },
    conditions: [],
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SessionView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  // -- Section rendering -----------------------------------------------------

  it('renders the session view container', () => {
    render(
      <SessionView
        character={createMockCharacter()}
        derivedStats={createMockDerivedStats()}
      />,
    )
    expect(screen.getByTestId('session-view')).toBeInTheDocument()
  })

  it('renders the top strip with character name, level, and class', () => {
    render(
      <SessionView
        character={createMockCharacter()}
        derivedStats={createMockDerivedStats()}
      />,
    )
    expect(screen.getByTestId('session-character-name')).toHaveTextContent('Thorn Ironforge')
    expect(screen.getByText(/Level 5/)).toBeInTheDocument()
    expect(screen.getByText(/Fighter/)).toBeInTheDocument()
  })

  it('renders AC and Speed badges', () => {
    render(
      <SessionView
        character={createMockCharacter()}
        derivedStats={createMockDerivedStats()}
      />,
    )
    expect(screen.getByTestId('session-ac-badge')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByTestId('session-speed-badge')).toBeInTheDocument()
    expect(screen.getByText('25ft')).toBeInTheDocument()
  })

  // -- HP Bar ----------------------------------------------------------------

  it('renders HP bar with current and max HP', () => {
    render(
      <SessionView
        character={createMockCharacter()}
        derivedStats={createMockDerivedStats()}
      />,
    )
    expect(screen.getByTestId('session-hp-bar')).toBeInTheDocument()
    expect(screen.getByTestId('session-hp-current')).toHaveTextContent('30')
    expect(screen.getByText('/ 44')).toBeInTheDocument()
  })

  it('shows temp HP when present', () => {
    render(
      <SessionView
        character={createMockCharacter({ tempHp: 5 })}
        derivedStats={createMockDerivedStats()}
      />,
    )
    expect(screen.getByTestId('session-temp-hp')).toHaveTextContent('+5 temp')
  })

  it('calls onHPTap when HP bar is tapped', async () => {
    const user = userEvent.setup()
    const onHPTap = vi.fn()
    render(
      <SessionView
        character={createMockCharacter()}
        derivedStats={createMockDerivedStats()}
        onHPTap={onHPTap}
      />,
    )

    await user.click(screen.getByTestId('session-hp-bar'))
    expect(onHPTap).toHaveBeenCalledTimes(1)
  })

  // -- Quick Actions ---------------------------------------------------------

  it('renders all four quick action buttons', () => {
    render(
      <SessionView
        character={createMockCharacter()}
        derivedStats={createMockDerivedStats()}
      />,
    )
    expect(screen.getByTestId('quick-action-roll-d20')).toBeInTheDocument()
    expect(screen.getByTestId('quick-action-short-rest')).toBeInTheDocument()
    expect(screen.getByTestId('quick-action-long-rest')).toBeInTheDocument()
    expect(screen.getByTestId('quick-action-conditions')).toBeInTheDocument()
  })

  it('triggers d20 roll when Roll d20 is tapped', async () => {
    const user = userEvent.setup()
    render(
      <SessionView
        character={createMockCharacter()}
        derivedStats={createMockDerivedStats()}
      />,
    )

    await user.click(screen.getByTestId('quick-action-roll-d20'))
    expect(mockRoll).toHaveBeenCalledWith(
      [{ type: 'd20', count: 1 }],
      0,
      'Quick d20 Roll',
    )
  })

  it('shows conditions count badge when conditions are active', () => {
    render(
      <SessionView
        character={createMockCharacter({ conditions: [{ condition: 'poisoned' }, { condition: 'blinded' }] })}
        derivedStats={createMockDerivedStats()}
      />,
    )
    expect(screen.getByTestId('conditions-count-badge')).toHaveTextContent('2')
  })

  // -- Attacks Section -------------------------------------------------------

  it('renders attack cards for equipped weapons', () => {
    render(
      <SessionView
        character={createMockCharacter()}
        derivedStats={createMockDerivedStats()}
      />,
    )
    expect(screen.getByTestId('session-attacks')).toBeInTheDocument()
    expect(screen.getByTestId('attack-card-warhammer')).toBeInTheDocument()
    expect(screen.getByTestId('attack-card-handaxe')).toBeInTheDocument()
  })

  // -- Spell Slots -----------------------------------------------------------

  it('shows spell slots for casters', () => {
    render(
      <SessionView
        character={createCasterCharacter()}
        derivedStats={createMockDerivedStats()}
      />,
    )
    expect(screen.getByTestId('session-spell-slots')).toBeInTheDocument()
  })

  it('hides spell slots for non-casters', () => {
    render(
      <SessionView
        character={createMockCharacter()}
        derivedStats={createMockDerivedStats()}
      />,
    )
    expect(screen.queryByTestId('session-spell-slots')).not.toBeInTheDocument()
  })

  // -- Pinned Skills ---------------------------------------------------------

  it('renders key abilities section', () => {
    render(
      <SessionView
        character={createMockCharacter()}
        derivedStats={createMockDerivedStats()}
      />,
    )
    expect(screen.getByTestId('session-key-abilities')).toBeInTheDocument()
    expect(screen.getByTestId('session-ability-row')).toBeInTheDocument()
  })

  // -- Conditions Strip ------------------------------------------------------

  it('renders condition badges', () => {
    render(
      <SessionView
        character={createMockCharacter({ conditions: [{ condition: 'poisoned' }] })}
        derivedStats={createMockDerivedStats()}
      />,
    )
    expect(screen.getByTestId('session-conditions')).toBeInTheDocument()
    expect(screen.getByTestId('condition-badges')).toBeInTheDocument()
  })

  // -- Features with uses ----------------------------------------------------

  it('renders feature usage counters for features with uses', () => {
    // Fighter has Second Wind (1/SR) and Action Surge (1/SR) at level 5
    render(
      <SessionView
        character={createMockCharacter()}
        derivedStats={createMockDerivedStats()}
      />,
    )
    expect(screen.getByTestId('session-features')).toBeInTheDocument()
  })

  // -- Customize button ------------------------------------------------------

  it('opens customize modal when settings button is tapped', async () => {
    const user = userEvent.setup()
    render(
      <SessionView
        character={createMockCharacter()}
        derivedStats={createMockDerivedStats()}
      />,
    )

    await user.click(screen.getByTestId('session-customize-button'))
    expect(screen.getByTestId('session-customize-modal')).toBeInTheDocument()
  })
})
