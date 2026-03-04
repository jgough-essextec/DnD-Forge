/**
 * E2E Integration Test: Session Play Flow (Epic 45, Story 45.2)
 *
 * Tests the core session play mechanics:
 * - Damage application (temp HP absorbed first)
 * - Spell slot expenditure
 * - Condition management (add/remove/query)
 * - Short rest recovery (hit dice, features)
 * - Long rest full recovery (HP, slots, conditions, exhaustion)
 */

import { describe, it, expect } from 'vitest'
import {
  applyDamage,
  applyHealing,
  setTempHP,
  processDeathSaveRoll,
  processDeathSaveDamage,
} from '@/utils/hp-tracker'
import {
  expendSlot,
  restoreSlot,
  restoreAllSlots,
  getAvailableSlots,
  canCastAtLevel,
} from '@/utils/spell-slots'
import {
  addCondition,
  removeCondition,
  hasCondition,
  getExhaustionLevel,
  incrementExhaustion,
  decrementExhaustion,
} from '@/utils/conditions'
import {
  applyShortRestUI,
  applyLongRestUI,
} from '@/utils/rest-recovery'
import type { ConditionInstance, DeathSaves } from '@/types/combat'
import type { Character } from '@/types/character'

// ---------------------------------------------------------------------------
// Helper: Build a test character
// ---------------------------------------------------------------------------

function createTestFighter(): Character {
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
      level: 5,
      chosenSkills: ['athletics', 'perception'],
      chosenFightingStyle: 'defense',
      hpRolls: [7, 6, 8, 5],
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
    level: 5,
    experiencePoints: 6500,
    hpMax: 44,
    hpCurrent: 44,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 18, dexModifier: 1, shieldBonus: 2, otherBonuses: [], formula: '16 + 2' },
      initiative: 1,
      speed: { walk: 30 },
      hitPoints: { maximum: 44, current: 44, temporary: 0, hitDice: { total: [{ count: 5, die: 'd10' }], used: [0] } },
      attacks: [],
      savingThrows: { strength: 6, constitution: 5 },
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
    features: ['second-wind', 'action-surge', 'extra-attack'],
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
// Damage Application
// ---------------------------------------------------------------------------

describe('Session Play: Damage Application', () => {
  it('reduces current HP by damage amount', () => {
    const result = applyDamage(44, 0, 44, 10)
    expect(result.newCurrent).toBe(34)
    expect(result.newTemp).toBe(0)
    expect(result.effectiveDamage).toBe(10)
  })

  it('absorbs damage through temp HP first', () => {
    const result = applyDamage(44, 8, 44, 12)
    expect(result.newTemp).toBe(0) // 8 temp HP absorbed
    expect(result.newCurrent).toBe(40) // remaining 4 damage to current
    expect(result.effectiveDamage).toBe(12)
  })

  it('temp HP partially absorbs damage', () => {
    const result = applyDamage(44, 5, 44, 3)
    expect(result.newTemp).toBe(2) // 5 - 3 = 2 remaining
    expect(result.newCurrent).toBe(44) // no damage to current
  })

  it('HP cannot go below 0', () => {
    const result = applyDamage(10, 0, 44, 50)
    expect(result.newCurrent).toBe(0)
    expect(result.overflow).toBeGreaterThan(0)
  })

  it('applies resistance (halves damage)', () => {
    const result = applyDamage(44, 0, 44, 10, 'fire', ['fire'])
    expect(result.effectiveDamage).toBe(5)
    expect(result.damageRelation).toBe('resistance')
    expect(result.newCurrent).toBe(39)
  })

  it('applies vulnerability (doubles damage)', () => {
    const result = applyDamage(44, 0, 44, 10, 'fire', [], ['fire'])
    expect(result.effectiveDamage).toBe(20)
    expect(result.damageRelation).toBe('vulnerability')
    expect(result.newCurrent).toBe(24)
  })

  it('applies immunity (no damage)', () => {
    const result = applyDamage(44, 0, 44, 10, 'fire', [], [], ['fire'])
    expect(result.effectiveDamage).toBe(0)
    expect(result.damageRelation).toBe('immunity')
    expect(result.newCurrent).toBe(44)
  })

  it('detects massive damage instant death', () => {
    // 100 damage to character with max 44 HP starting at 20 HP
    const result = applyDamage(20, 0, 44, 64)
    expect(result.newCurrent).toBe(0)
    expect(result.instantDeath).toBe(true) // overflow (44) >= maxHP (44)
  })

  it('zero damage does nothing', () => {
    const result = applyDamage(44, 5, 44, 0)
    expect(result.newCurrent).toBe(44)
    expect(result.newTemp).toBe(5)
    expect(result.effectiveDamage).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Healing
// ---------------------------------------------------------------------------

describe('Session Play: Healing', () => {
  it('heals up to max HP', () => {
    const result = applyHealing(30, 44, 20)
    expect(result.newCurrent).toBe(44) // capped at max
    expect(result.actualHealing).toBe(14)
  })

  it('healing from 0 stabilizes', () => {
    const result = applyHealing(0, 44, 5)
    expect(result.newCurrent).toBe(5)
    expect(result.stabilized).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Temporary HP
// ---------------------------------------------------------------------------

describe('Session Play: Temporary HP', () => {
  it('temp HP takes the higher value (no stacking)', () => {
    expect(setTempHP(5, 10)).toBe(10)
    expect(setTempHP(10, 5)).toBe(10)
    expect(setTempHP(7, 7)).toBe(7)
  })
})

// ---------------------------------------------------------------------------
// Spell Slot Expenditure
// ---------------------------------------------------------------------------

describe('Session Play: Spell Slots', () => {
  const totalSlots: Record<number, number> = { 1: 4, 2: 3, 3: 2 }
  const usedSlots: Record<number, number> = { 1: 0, 2: 0, 3: 0 }

  it('expending a slot increments used count', () => {
    const updated = expendSlot(usedSlots, 1)
    expect(updated[1]).toBe(1)
    expect(updated[2]).toBe(0)
  })

  it('restoring a slot decrements used count', () => {
    const used = { 1: 2, 2: 1, 3: 0 }
    const updated = restoreSlot(used, 1)
    expect(updated[1]).toBe(1)
  })

  it('restore does not go below 0', () => {
    const updated = restoreSlot(usedSlots, 1)
    expect(updated[1]).toBe(0)
  })

  it('restoreAllSlots resets all to 0', () => {
    const used = { 1: 3, 2: 2, 3: 1 }
    const restored = restoreAllSlots(used)
    expect(restored[1]).toBe(0)
    expect(restored[2]).toBe(0)
    expect(restored[3]).toBe(0)
  })

  it('getAvailableSlots computes remaining correctly', () => {
    const used = { 1: 2, 2: 1, 3: 0 }
    const available = getAvailableSlots(totalSlots, used)
    expect(available[1]).toBe(2)
    expect(available[2]).toBe(2)
    expect(available[3]).toBe(2)
  })

  it('canCastAtLevel checks availability at or above level', () => {
    const used = { 1: 4, 2: 3, 3: 0 } // level 1 and 2 exhausted
    expect(canCastAtLevel(used, totalSlots, 1)).toBe(true) // can upcast to 3
    expect(canCastAtLevel(used, totalSlots, 3)).toBe(true)
    const fullyUsed = { 1: 4, 2: 3, 3: 2 }
    expect(canCastAtLevel(fullyUsed, totalSlots, 1)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Condition Management
// ---------------------------------------------------------------------------

describe('Session Play: Conditions', () => {
  it('adds a condition to the list', () => {
    const conditions: ConditionInstance[] = []
    const updated = addCondition(conditions, { condition: 'poisoned' })
    expect(updated).toHaveLength(1)
    expect(hasCondition(updated, 'poisoned')).toBe(true)
  })

  it('conditions do not stack (except exhaustion)', () => {
    const conditions: ConditionInstance[] = [{ condition: 'poisoned' }]
    const updated = addCondition(conditions, { condition: 'poisoned' })
    expect(updated).toHaveLength(1)
  })

  it('removes a condition', () => {
    const conditions: ConditionInstance[] = [
      { condition: 'poisoned' },
      { condition: 'blinded' },
    ]
    const updated = removeCondition(conditions, 'poisoned')
    expect(updated).toHaveLength(1)
    expect(hasCondition(updated, 'poisoned')).toBe(false)
    expect(hasCondition(updated, 'blinded')).toBe(true)
  })

  it('exhaustion stacks up to level 6', () => {
    let conditions: ConditionInstance[] = []
    conditions = addCondition(conditions, { condition: 'exhaustion', exhaustionLevel: 1 })
    expect(getExhaustionLevel(conditions)).toBe(1)

    conditions = addCondition(conditions, { condition: 'exhaustion' })
    expect(getExhaustionLevel(conditions)).toBe(2)

    conditions = incrementExhaustion(conditions)
    expect(getExhaustionLevel(conditions)).toBe(3)
  })

  it('exhaustion decrements and removes at level 0', () => {
    let conditions: ConditionInstance[] = [{ condition: 'exhaustion', exhaustionLevel: 2 }]
    conditions = decrementExhaustion(conditions)
    expect(getExhaustionLevel(conditions)).toBe(1)

    conditions = decrementExhaustion(conditions)
    expect(getExhaustionLevel(conditions)).toBe(0)
    expect(hasCondition(conditions, 'exhaustion')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Short Rest Recovery
// ---------------------------------------------------------------------------

describe('Session Play: Short Rest', () => {
  it('recovers HP from hit dice spending', () => {
    const character = createTestFighter()
    character.hpCurrent = 20 // damaged

    const result = applyShortRestUI(character, [
      { classIndex: 0, rolled: 8 }, // d10 + CON mod
    ])

    expect(result.hpBefore).toBe(20)
    expect(result.hpAfter).toBe(28)
    expect(result.hitDiceSpent).toBe(1)
    expect(result.hitDiceRecovered).toBe(0) // short rest does not recover dice
    expect(result.slotsRecovered).toBe(false) // not a warlock
  })

  it('HP recovery is capped at max HP', () => {
    const character = createTestFighter()
    character.hpCurrent = 40

    const result = applyShortRestUI(character, [
      { classIndex: 0, rolled: 10 },
    ])

    expect(result.hpAfter).toBe(44) // capped at max
  })

  it('recovers short rest features', () => {
    const character = createTestFighter()
    const result = applyShortRestUI(character, [])

    // Fighter has Second Wind and Action Surge as short-rest features
    const featureIds = result.featuresRecovered.map((f) => f.featureId)
    expect(featureIds).toContain('second-wind')
    expect(featureIds).toContain('action-surge')
  })
})

// ---------------------------------------------------------------------------
// Long Rest Full Recovery
// ---------------------------------------------------------------------------

describe('Session Play: Long Rest', () => {
  it('restores HP to maximum', () => {
    const character = createTestFighter()
    character.hpCurrent = 10

    const result = applyLongRestUI(character, [])
    expect(result.hpBefore).toBe(10)
    expect(result.hpAfter).toBe(44)
  })

  it('recovers half of total hit dice', () => {
    const character = createTestFighter()
    character.hitDiceUsed = [4] // 4 of 5 dice spent

    const result = applyLongRestUI(character, [])
    expect(result.hitDiceRecovered).toBe(2) // floor(5 / 2) = 2
  })

  it('resets death saves', () => {
    const character = createTestFighter()
    const result = applyLongRestUI(character, [])
    expect(result.deathSavesReset).toBe(true)
  })

  it('reduces exhaustion by 1 level', () => {
    const character = createTestFighter()
    character.conditions = [{ condition: 'exhaustion', exhaustionLevel: 3 }]

    const result = applyLongRestUI(character, [])
    expect(result.exhaustionBefore).toBe(3)
    expect(result.exhaustionAfter).toBe(2)
  })

  it('recovers all features (short and long rest)', () => {
    const character = createTestFighter()
    const result = applyLongRestUI(character, [])

    const featureIds = result.featuresRecovered.map((f) => f.featureId)
    expect(featureIds).toContain('second-wind')
    expect(featureIds).toContain('action-surge')
  })
})

// ---------------------------------------------------------------------------
// Death Saves
// ---------------------------------------------------------------------------

describe('Session Play: Death Saves', () => {
  it('natural 20 regains 1 HP and resets saves', () => {
    const saves: DeathSaves = { successes: 1, failures: 2, stable: false }
    const result = processDeathSaveRoll(saves, 20)
    expect(result.regainHP).toBe(true)
    expect(result.deathSaves.successes).toBe(0)
    expect(result.deathSaves.failures).toBe(0)
  })

  it('natural 1 adds 2 failures', () => {
    const saves: DeathSaves = { successes: 0, failures: 0, stable: false }
    const result = processDeathSaveRoll(saves, 1)
    expect(result.deathSaves.failures).toBe(2)
    expect(result.regainHP).toBe(false)
  })

  it('roll >= 10 adds 1 success', () => {
    const saves: DeathSaves = { successes: 0, failures: 0, stable: false }
    const result = processDeathSaveRoll(saves, 10)
    expect(result.deathSaves.successes).toBe(1)
  })

  it('roll < 10 (not 1) adds 1 failure', () => {
    const saves: DeathSaves = { successes: 0, failures: 0, stable: false }
    const result = processDeathSaveRoll(saves, 5)
    expect(result.deathSaves.failures).toBe(1)
  })

  it('3 successes stabilize the character', () => {
    const saves: DeathSaves = { successes: 2, failures: 1, stable: false }
    const result = processDeathSaveRoll(saves, 15)
    expect(result.deathSaves.successes).toBe(3)
    expect(result.deathSaves.stable).toBe(true)
  })

  it('damage at 0 HP adds failure (critical adds 2)', () => {
    const saves: DeathSaves = { successes: 0, failures: 0, stable: false }
    const result = processDeathSaveDamage(saves, false)
    expect(result.failures).toBe(1)

    const critResult = processDeathSaveDamage(saves, true)
    expect(critResult.failures).toBe(2)
  })
})
