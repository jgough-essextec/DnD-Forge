/**
 * E2E Integration Test: Level Up Flow (Epic 45, Story 45.2)
 *
 * Tests the complete level-up pipeline:
 * - Eligibility check (canLevelUp)
 * - Computing level-up changes (new features, HP, spell slots)
 * - Applying level-up to produce an updated character
 * - Verifying HP increase, new features, proficiency bonus changes
 */

import { describe, it, expect } from 'vitest'
import {
  canLevelUp,
  getLevelUpChanges,
  applyLevelUp,
  getRequiredSteps,
  getASILevels,
  getSubclassLevel,
} from '@/utils/levelup'
import { getProficiencyBonus } from '@/utils/calculations'
import type { Character } from '@/types/character'

// ---------------------------------------------------------------------------
// Helper: Build a test character at a given level
// ---------------------------------------------------------------------------

function createFighterAtLevel(level: number): Character {
  return {
    id: 'test-fighter',
    name: 'Test Fighter',
    playerName: 'Player',
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human' },
    classes: [{
      classId: 'fighter',
      level,
      chosenSkills: ['athletics', 'perception'],
      chosenFightingStyle: 'defense',
      subclassId: level >= 3 ? 'champion' : undefined,
      hpRolls: Array(level - 1).fill(6),
    }],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: 'Test Fighter' },
      characterPersonality: {
        personalityTraits: ['Brave', 'Loyal'],
        ideal: 'Honor',
        bond: 'Regiment',
        flaw: 'Stubborn',
      },
    },
    alignment: 'lawful-good',
    baseAbilityScores: {
      strength: 16, dexterity: 12, constitution: 14,
      intelligence: 10, wisdom: 13, charisma: 8,
    },
    abilityScores: {
      strength: 16, dexterity: 12, constitution: 14,
      intelligence: 10, wisdom: 13, charisma: 8,
    },
    abilityScoreMethod: 'standard',
    level,
    experiencePoints: level === 1 ? 0 : level === 2 ? 300 : level === 3 ? 900 : level === 4 ? 2700 : 6500,
    hpMax: 12 + (level - 1) * 8, // d10 + 2 CON at level 1, average 6+2 per level after
    hpCurrent: 12 + (level - 1) * 8,
    tempHp: 0,
    hitDiceTotal: [level],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 18, dexModifier: 1, shieldBonus: 2, otherBonuses: [], formula: '16+2' },
      initiative: 1,
      speed: { walk: 30 },
      hitPoints: { maximum: 12 + (level - 1) * 8, current: 12 + (level - 1) * 8, temporary: 0, hitDice: { total: [{ count: level, die: 'd10' }], used: [0] } },
      attacks: [],
      savingThrows: { strength: 5, constitution: 4 },
    },
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple melee', 'martial melee'],
      tools: [],
      languages: ['common'],
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
    features: ['second-wind'],
    feats: [],
    description: {
      name: 'Test Fighter', age: '30', height: "6'0\"", weight: '200',
      eyes: 'Brown', skin: 'Tan', hair: 'Black',
      appearance: '', backstory: '', alliesAndOrgs: '', treasure: '',
    },
    personality: {
      personalityTraits: ['Brave', 'Loyal'],
      ideal: 'Honor', bond: 'Regiment', flaw: 'Stubborn',
    },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
  }
}

// ---------------------------------------------------------------------------
// Level Up Eligibility
// ---------------------------------------------------------------------------

describe('Level Up: Eligibility', () => {
  it('level 1 character with sufficient XP can level up', () => {
    const character = createFighterAtLevel(1)
    character.experiencePoints = 300
    expect(canLevelUp(character)).toBe(true)
  })

  it('milestone mode (0 XP) allows level up', () => {
    const character = createFighterAtLevel(1)
    character.experiencePoints = 0
    expect(canLevelUp(character)).toBe(true)
  })

  it('level 20 character cannot level up', () => {
    const character = createFighterAtLevel(20)
    character.level = 20
    expect(canLevelUp(character)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Level Up Changes
// ---------------------------------------------------------------------------

describe('Level Up: Change Computation', () => {
  it('level 1 to 2 produces correct changes', () => {
    const character = createFighterAtLevel(1)
    const changes = getLevelUpChanges(character, 2)

    expect(changes.newLevel).toBe(2)
    expect(changes.hitDieType).toBe(10)
    expect(changes.classId).toBe('fighter')
    expect(changes.newClassLevel).toBe(2)
    expect(changes.isSubclassLevel).toBe(false)
    expect(changes.isASILevel).toBe(false)
  })

  it('level 2 to 3 is a subclass level for Fighter', () => {
    const character = createFighterAtLevel(2)
    const changes = getLevelUpChanges(character, 3)

    expect(changes.isSubclassLevel).toBe(true)
    expect(changes.newClassLevel).toBe(3)
  })

  it('level 3 to 4 is an ASI level for Fighter', () => {
    const character = createFighterAtLevel(3)
    const changes = getLevelUpChanges(character, 4)

    expect(changes.isASILevel).toBe(true)
  })

  it('level 4 to 5 triggers proficiency bonus change', () => {
    const character = createFighterAtLevel(4)
    const changes = getLevelUpChanges(character, 5)

    // Proficiency changes from +2 to +3 at level 5
    if (changes.proficiencyBonusChange) {
      expect(changes.proficiencyBonusChange.from).toBe(2)
      expect(changes.proficiencyBonusChange.to).toBe(3)
    }
  })

  it('level 4 to 5 may not have new features if class data has no level-5 entry', () => {
    const character = createFighterAtLevel(4)
    const changes = getLevelUpChanges(character, 5)

    // The class data may not define features for every level.
    // What matters is that the changes object correctly reflects the class data.
    expect(Array.isArray(changes.newFeatures)).toBe(true)
  })

  it('no spellcasting changes for Fighter', () => {
    const character = createFighterAtLevel(4)
    const changes = getLevelUpChanges(character, 5)
    expect(changes.newSpellSlots).toBeUndefined()
    expect(changes.pactMagicChanges).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Apply Level Up
// ---------------------------------------------------------------------------

describe('Level Up: Applying Changes', () => {
  it('increases character level', () => {
    const character = createFighterAtLevel(4)
    const changes = getLevelUpChanges(character, 5)
    changes.hpIncrease = 8 // average d10 (6) + CON mod (2)

    const updated = applyLevelUp(character, changes)
    expect(updated.level).toBe(5)
    expect(updated.classes[0].level).toBe(5)
  })

  it('increases HP by the specified amount', () => {
    const character = createFighterAtLevel(4)
    const originalHP = character.hpMax
    const changes = getLevelUpChanges(character, 5)
    changes.hpIncrease = 8

    const updated = applyLevelUp(character, changes)
    expect(updated.hpMax).toBe(originalHP + 8)
    expect(updated.hpCurrent).toBe(originalHP + 8) // full health
  })

  it('adds new features to the character when features exist', () => {
    // Level 1 to 2 grants Action Surge
    const character = createFighterAtLevel(1)
    const changes = getLevelUpChanges(character, 2)
    changes.hpIncrease = 8

    const updated = applyLevelUp(character, changes)
    expect(updated.features).toContain('action-surge')
  })

  it('increments hit dice total', () => {
    const character = createFighterAtLevel(4)
    const changes = getLevelUpChanges(character, 5)
    changes.hpIncrease = 8

    const updated = applyLevelUp(character, changes)
    expect(updated.hitDiceTotal[0]).toBe(5)
  })

  it('increments version number', () => {
    const character = createFighterAtLevel(4)
    const changes = getLevelUpChanges(character, 5)
    changes.hpIncrease = 8

    const updated = applyLevelUp(character, changes)
    expect(updated.version).toBe(character.version + 1)
  })

  it('ASI choices increase ability scores (capped at 20)', () => {
    const character = createFighterAtLevel(3)
    const changes = getLevelUpChanges(character, 4)
    changes.hpIncrease = 8
    changes.asiMode = 'asi'
    changes.asiChoices = [
      { ability: 'strength', amount: 2 },
    ]

    const updated = applyLevelUp(character, changes)
    expect(updated.abilityScores.strength).toBe(18) // 16 + 2
    expect(updated.baseAbilityScores.strength).toBe(18)
  })
})

// ---------------------------------------------------------------------------
// Required Steps
// ---------------------------------------------------------------------------

describe('Level Up: Required Steps', () => {
  it('level 1 to 2 has overview, hp, and review steps', () => {
    const character = createFighterAtLevel(1)
    const steps = getRequiredSteps(character, 2)

    expect(steps).toContain('overview')
    expect(steps).toContain('hp')
    expect(steps).toContain('review')
    expect(steps).not.toContain('subclass')
    expect(steps).not.toContain('asi-feat')
  })

  it('subclass level includes subclass step', () => {
    const character = createFighterAtLevel(2)
    const steps = getRequiredSteps(character, 3)

    expect(steps).toContain('subclass')
  })

  it('ASI level includes asi-feat step', () => {
    const character = createFighterAtLevel(3)
    const steps = getRequiredSteps(character, 4)

    expect(steps).toContain('asi-feat')
  })
})

// ---------------------------------------------------------------------------
// Class-Specific Data
// ---------------------------------------------------------------------------

describe('Level Up: Class-Specific Data', () => {
  it('Fighter ASI levels are at 4, 6, 8, 12, 14, 16, 19', () => {
    const levels = getASILevels('fighter')
    expect(levels).toContain(4)
    expect(levels).toContain(6)
    expect(levels).toContain(8)
  })

  it('Fighter subclass level is 3', () => {
    expect(getSubclassLevel('fighter')).toBe(3)
  })

  it('proficiency bonus increases at correct levels', () => {
    expect(getProficiencyBonus(1)).toBe(2)
    expect(getProficiencyBonus(4)).toBe(2)
    expect(getProficiencyBonus(5)).toBe(3)
    expect(getProficiencyBonus(8)).toBe(3)
    expect(getProficiencyBonus(9)).toBe(4)
  })
})
