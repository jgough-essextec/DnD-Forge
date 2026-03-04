/**
 * SpellProgressionStep Tests (Story 31.6)
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SpellProgressionStep } from '../SpellProgressionStep'
import type { Character } from '@/types/character'
import type { LevelUpChanges } from '@/utils/levelup'

function makeSpellcaster(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test-1',
    name: 'Wizard',
    playerName: 'Tester',
    avatarUrl: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human', chosenAbilityBonuses: [], chosenLanguages: [] },
    classes: [{ classId: 'wizard', level: 2, chosenSkills: ['arcana', 'history'], hpRolls: [4] }],
    background: {
      backgroundId: 'sage',
      characterIdentity: { name: 'Wizard' },
      characterPersonality: { personalityTraits: ['Curious', 'Bookish'], ideal: 'Knowledge', bond: 'Library', flaw: 'Distracted' },
    },
    alignment: 'neutral-good',
    baseAbilityScores: { strength: 8, dexterity: 14, constitution: 13, intelligence: 16, wisdom: 12, charisma: 10 },
    abilityScores: { strength: 8, dexterity: 14, constitution: 13, intelligence: 16, wisdom: 12, charisma: 10 },
    abilityScoreMethod: 'standard',
    level: 2,
    experiencePoints: 900,
    hpMax: 12,
    hpCurrent: 12,
    tempHp: 0,
    hitDiceTotal: [2],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 10, dexModifier: 2, shieldBonus: 0, otherBonuses: [], formula: '10 + DEX' },
      initiative: 2, speed: { walk: 30 },
      hitPoints: { maximum: 12, current: 12, temporary: 0, hitDice: { total: [{ count: 2, die: 'd6' }], used: [0] } },
      attacks: [], savingThrows: {},
    },
    proficiencies: { armor: [], weapons: [], tools: [], languages: ['common'], skills: [], savingThrows: ['intelligence', 'wisdom'] },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 },
    attunedItems: [],
    spellcasting: {
      type: 'prepared',
      ability: 'intelligence',
      cantrips: ['fire-bolt', 'mage-hand', 'prestidigitation'],
      knownSpells: [],
      preparedSpells: ['magic-missile', 'shield'],
      spellSlots: { 1: 3 },
      usedSpellSlots: {},
      ritualCasting: true,
    },
    features: [],
    feats: [],
    description: { name: 'Wizard', age: '120', height: '', weight: '', eyes: '', skin: '', hair: '', appearance: '', backstory: '', alliesAndOrgs: '', treasure: '' },
    personality: { personalityTraits: ['Curious', 'Bookish'], ideal: 'Knowledge', bond: 'Library', flaw: 'Distracted' },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    ...overrides,
  } as Character
}

function makeChanges(overrides: Partial<LevelUpChanges> = {}): LevelUpChanges {
  return {
    newLevel: 3,
    hpIncrease: 5,
    newFeatures: [],
    isSubclassLevel: false,
    isASILevel: false,
    hitDieType: 6,
    averageHP: 4,
    classId: 'wizard',
    newClassLevel: 3,
    newSpellSlots: { 1: 1, 2: 2 },
    ...overrides,
  }
}

describe('SpellProgressionStep', () => {
  it('renders the spell progression step', () => {
    render(
      <SpellProgressionStep
        character={makeSpellcaster()}
        changes={makeChanges()}
        selectedSpells={[]}
        onSpellsChange={() => {}}
      />,
    )
    expect(screen.getByTestId('spell-progression-step')).toBeInTheDocument()
  })

  it('shows new spell slots', () => {
    render(
      <SpellProgressionStep
        character={makeSpellcaster()}
        changes={makeChanges()}
        selectedSpells={[]}
        onSpellsChange={() => {}}
      />,
    )
    expect(screen.getByTestId('new-spell-slots')).toBeInTheDocument()
    expect(screen.getByTestId('spell-slot-level-1')).toBeInTheDocument()
    expect(screen.getByTestId('spell-slot-level-2')).toBeInTheDocument()
  })

  it('shows pact magic changes for warlock', () => {
    render(
      <SpellProgressionStep
        character={makeSpellcaster({
          classes: [{ classId: 'warlock', subclassId: 'the-fiend', level: 1, chosenSkills: ['arcana', 'deception'], hpRolls: [] }],
        })}
        changes={makeChanges({
          classId: 'warlock',
          pactMagicChanges: { slotLevel: 1, totalSlots: 2 },
          newSpellSlots: undefined,
        })}
        selectedSpells={[]}
        onSpellsChange={() => {}}
      />,
    )
    expect(screen.getByTestId('pact-magic-changes')).toBeInTheDocument()
  })

  it('shows new cantrips section when applicable', () => {
    render(
      <SpellProgressionStep
        character={makeSpellcaster()}
        changes={makeChanges({ newCantripsKnown: 1 })}
        selectedSpells={[]}
        onSpellsChange={() => {}}
      />,
    )
    expect(screen.getByTestId('new-cantrips')).toBeInTheDocument()
  })

  it('shows cantrip scaling notification at level 5', () => {
    render(
      <SpellProgressionStep
        character={makeSpellcaster({ level: 4 })}
        changes={makeChanges({ newLevel: 5, newClassLevel: 5 })}
        selectedSpells={[]}
        onSpellsChange={() => {}}
      />,
    )
    expect(screen.getByTestId('cantrip-scaling')).toBeInTheDocument()
  })

  it('shows wizard spellbook additions', () => {
    render(
      <SpellProgressionStep
        character={makeSpellcaster()}
        changes={makeChanges({ classId: 'wizard' })}
        selectedSpells={[]}
        onSpellsChange={() => {}}
      />,
    )
    expect(screen.getByTestId('wizard-spellbook')).toBeInTheDocument()
  })

  it('shows known caster spell selection for Bard', () => {
    render(
      <SpellProgressionStep
        character={makeSpellcaster({
          classes: [{ classId: 'bard', level: 2, chosenSkills: ['performance', 'persuasion'], hpRolls: [5] }],
        })}
        changes={makeChanges({ classId: 'bard', newSpellsKnown: 1 })}
        selectedSpells={[]}
        onSpellsChange={() => {}}
      />,
    )
    expect(screen.getByTestId('known-caster-spells')).toBeInTheDocument()
  })

  it('shows prepared caster limit for Cleric', () => {
    render(
      <SpellProgressionStep
        character={makeSpellcaster({
          classes: [{ classId: 'cleric', subclassId: 'life-domain', level: 2, chosenSkills: ['insight', 'medicine'], hpRolls: [6] }],
        })}
        changes={makeChanges({ classId: 'cleric' })}
        selectedSpells={[]}
        onSpellsChange={() => {}}
      />,
    )
    expect(screen.getByTestId('prepared-caster-limit')).toBeInTheDocument()
  })
})
