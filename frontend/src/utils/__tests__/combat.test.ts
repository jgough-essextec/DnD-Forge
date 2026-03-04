/**
 * Combat Utility Functions Tests (Epic 35)
 *
 * Unit tests for initiative sorting, turn management, XP calculation,
 * combatant creation, HP management, and encounter state.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  sortByInitiative,
  areTied,
  findTiedGroups,
  nextTurn,
  previousTurn,
  removeCombatant,
  insertCombatant,
  applyCombatDamage,
  applyCombatHealing,
  getConcentrationDC,
  getXPForCR,
  calculateTotalXP,
  calculateXPPerCharacter,
  wouldLevelUp,
  getLevelForXP,
  getHPColor,
  getHPPercentage,
  createPlayerCombatant,
  createMonsterCombatant,
  createLairAction,
  duplicateCombatant,
  createMultipleCombatants,
  getNextIncrementedName,
  createEncounterState,
  resetCombatantIdCounter,
} from '@/utils/combat'
import type { CombatCombatant } from '@/utils/combat'

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

function makeCombatant(overrides: Partial<CombatCombatant> = {}): CombatCombatant {
  return {
    id: overrides.id ?? 'c-1',
    name: overrides.name ?? 'Test',
    initiative: overrides.initiative ?? 10,
    hp: overrides.hp ?? 20,
    maxHp: overrides.maxHp ?? 20,
    ac: overrides.ac ?? 15,
    isPlayerCharacter: overrides.isPlayerCharacter ?? false,
    conditions: overrides.conditions ?? [],
    type: overrides.type ?? 'monster',
    initiativeModifier: overrides.initiativeModifier ?? 0,
    tempHp: overrides.tempHp ?? 0,
    isDefeated: overrides.isDefeated ?? false,
    isConcentrating: overrides.isConcentrating ?? false,
    isSkipped: overrides.isSkipped ?? false,
    isReadied: overrides.isReadied ?? false,
    notes: overrides.notes ?? '',
    addOrder: overrides.addOrder ?? 0,
    deathSaves: overrides.deathSaves ?? { successes: 0, failures: 0 },
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Initiative Sorting
// ---------------------------------------------------------------------------

describe('sortByInitiative', () => {
  it('should sort combatants by initiative in descending order', () => {
    const combatants = [
      makeCombatant({ id: 'a', initiative: 5 }),
      makeCombatant({ id: 'b', initiative: 20 }),
      makeCombatant({ id: 'c', initiative: 12 }),
    ]
    const sorted = sortByInitiative(combatants)
    expect(sorted.map((c) => c.id)).toEqual(['b', 'c', 'a'])
  })

  it('should break ties by initiative modifier (higher goes first)', () => {
    const combatants = [
      makeCombatant({ id: 'a', initiative: 15, initiativeModifier: 1 }),
      makeCombatant({ id: 'b', initiative: 15, initiativeModifier: 3 }),
    ]
    const sorted = sortByInitiative(combatants)
    expect(sorted.map((c) => c.id)).toEqual(['b', 'a'])
  })

  it('should break further ties by add order (earlier added goes first)', () => {
    const combatants = [
      makeCombatant({ id: 'a', initiative: 15, initiativeModifier: 2, addOrder: 2 }),
      makeCombatant({ id: 'b', initiative: 15, initiativeModifier: 2, addOrder: 0 }),
      makeCombatant({ id: 'c', initiative: 15, initiativeModifier: 2, addOrder: 1 }),
    ]
    const sorted = sortByInitiative(combatants)
    expect(sorted.map((c) => c.id)).toEqual(['b', 'c', 'a'])
  })

  it('should not mutate the original array', () => {
    const combatants = [
      makeCombatant({ id: 'a', initiative: 5 }),
      makeCombatant({ id: 'b', initiative: 20 }),
    ]
    const original = [...combatants]
    sortByInitiative(combatants)
    expect(combatants[0].id).toBe(original[0].id)
  })

  it('should handle empty array', () => {
    expect(sortByInitiative([])).toEqual([])
  })

  it('should handle single combatant', () => {
    const combatants = [makeCombatant({ id: 'solo', initiative: 10 })]
    const sorted = sortByInitiative(combatants)
    expect(sorted).toHaveLength(1)
    expect(sorted[0].id).toBe('solo')
  })
})

describe('areTied', () => {
  it('should return true for combatants with same initiative', () => {
    const a = makeCombatant({ initiative: 15 })
    const b = makeCombatant({ initiative: 15 })
    expect(areTied(a, b)).toBe(true)
  })

  it('should return false for different initiatives', () => {
    const a = makeCombatant({ initiative: 15 })
    const b = makeCombatant({ initiative: 10 })
    expect(areTied(a, b)).toBe(false)
  })

  it('should return false when initiative is 0 (unrolled)', () => {
    const a = makeCombatant({ initiative: 0 })
    const b = makeCombatant({ initiative: 0 })
    expect(areTied(a, b)).toBe(false)
  })
})

describe('findTiedGroups', () => {
  it('should find groups of tied combatants', () => {
    const combatants = [
      makeCombatant({ id: 'a', initiative: 15 }),
      makeCombatant({ id: 'b', initiative: 15 }),
      makeCombatant({ id: 'c', initiative: 10 }),
    ]
    const groups = findTiedGroups(combatants)
    expect(groups).toHaveLength(1)
    expect(groups[0].map((c) => c.id)).toContain('a')
    expect(groups[0].map((c) => c.id)).toContain('b')
  })

  it('should return empty array when no ties', () => {
    const combatants = [
      makeCombatant({ id: 'a', initiative: 15 }),
      makeCombatant({ id: 'b', initiative: 10 }),
      makeCombatant({ id: 'c', initiative: 5 }),
    ]
    expect(findTiedGroups(combatants)).toEqual([])
  })

  it('should ignore combatants with 0 initiative', () => {
    const combatants = [
      makeCombatant({ id: 'a', initiative: 0 }),
      makeCombatant({ id: 'b', initiative: 0 }),
    ]
    expect(findTiedGroups(combatants)).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Turn Management
// ---------------------------------------------------------------------------

describe('nextTurn', () => {
  it('should advance to the next combatant', () => {
    const combatants = [
      makeCombatant({ id: 'a' }),
      makeCombatant({ id: 'b' }),
      makeCombatant({ id: 'c' }),
    ]
    const result = nextTurn(combatants, 0, 1)
    expect(result.turnIndex).toBe(1)
    expect(result.round).toBe(1)
  })

  it('should increment round when wrapping past last combatant', () => {
    const combatants = [
      makeCombatant({ id: 'a' }),
      makeCombatant({ id: 'b' }),
    ]
    const result = nextTurn(combatants, 1, 1)
    expect(result.turnIndex).toBe(0)
    expect(result.round).toBe(2)
  })

  it('should skip defeated combatants', () => {
    const combatants = [
      makeCombatant({ id: 'a' }),
      makeCombatant({ id: 'b', isDefeated: true }),
      makeCombatant({ id: 'c' }),
    ]
    const result = nextTurn(combatants, 0, 1)
    expect(result.turnIndex).toBe(2)
  })

  it('should handle all combatants defeated', () => {
    const combatants = [
      makeCombatant({ id: 'a', isDefeated: true }),
      makeCombatant({ id: 'b', isDefeated: true }),
    ]
    const result = nextTurn(combatants, 0, 1)
    expect(result.turnIndex).toBe(0)
    expect(result.round).toBe(1)
  })
})

describe('previousTurn', () => {
  it('should go back to the previous combatant', () => {
    const combatants = [
      makeCombatant({ id: 'a' }),
      makeCombatant({ id: 'b' }),
      makeCombatant({ id: 'c' }),
    ]
    const result = previousTurn(combatants, 2, 1)
    expect(result.turnIndex).toBe(1)
    expect(result.round).toBe(1)
  })

  it('should not go below round 1 turn 0', () => {
    const combatants = [
      makeCombatant({ id: 'a' }),
      makeCombatant({ id: 'b' }),
    ]
    const result = previousTurn(combatants, 0, 1)
    expect(result.turnIndex).toBe(0)
    expect(result.round).toBe(1)
  })

  it('should decrement round when going back past index 0', () => {
    const combatants = [
      makeCombatant({ id: 'a' }),
      makeCombatant({ id: 'b' }),
    ]
    const result = previousTurn(combatants, 0, 2)
    expect(result.turnIndex).toBe(1)
    expect(result.round).toBe(1)
  })

  it('should skip defeated combatants going backwards', () => {
    const combatants = [
      makeCombatant({ id: 'a' }),
      makeCombatant({ id: 'b', isDefeated: true }),
      makeCombatant({ id: 'c' }),
    ]
    const result = previousTurn(combatants, 2, 1)
    expect(result.turnIndex).toBe(0)
  })
})

describe('removeCombatant', () => {
  it('should remove a combatant from the list', () => {
    const combatants = [
      makeCombatant({ id: 'a' }),
      makeCombatant({ id: 'b' }),
      makeCombatant({ id: 'c' }),
    ]
    const result = removeCombatant(combatants, 'b', 0)
    expect(result.combatants).toHaveLength(2)
    expect(result.combatants.find((c) => c.id === 'b')).toBeUndefined()
  })

  it('should adjust turn index when removing before current turn', () => {
    const combatants = [
      makeCombatant({ id: 'a' }),
      makeCombatant({ id: 'b' }),
      makeCombatant({ id: 'c' }),
    ]
    const result = removeCombatant(combatants, 'a', 2)
    expect(result.turnIndex).toBe(1)
  })

  it('should cap turn index at list length when removing current', () => {
    const combatants = [
      makeCombatant({ id: 'a' }),
      makeCombatant({ id: 'b' }),
    ]
    const result = removeCombatant(combatants, 'b', 1)
    expect(result.turnIndex).toBe(0)
  })

  it('should return original if combatant not found', () => {
    const combatants = [makeCombatant({ id: 'a' })]
    const result = removeCombatant(combatants, 'nonexistent', 0)
    expect(result.combatants).toHaveLength(1)
    expect(result.turnIndex).toBe(0)
  })
})

describe('insertCombatant', () => {
  it('should insert a combatant at the correct initiative position', () => {
    const combatants = [
      makeCombatant({ id: 'a', initiative: 20 }),
      makeCombatant({ id: 'b', initiative: 10 }),
    ]
    const newCombatant = makeCombatant({ id: 'new', initiative: 15 })
    const result = insertCombatant(combatants, newCombatant, 0)
    expect(result.combatants[1].id).toBe('new')
  })

  it('should determine if new combatant acts this round', () => {
    const combatants = [
      makeCombatant({ id: 'a', initiative: 20 }),
      makeCombatant({ id: 'b', initiative: 10 }),
    ]
    // Current turn is index 0 (initiative 20), new combatant has initiative 15
    const newCombatant = makeCombatant({ id: 'new', initiative: 15 })
    const result = insertCombatant(combatants, newCombatant, 0)
    expect(result.actsThisRound).toBe(true)
  })

  it('should not act this round if inserted before current turn', () => {
    const combatants = [
      makeCombatant({ id: 'a', initiative: 20 }),
      makeCombatant({ id: 'b', initiative: 10 }),
    ]
    // Current turn is index 1, new combatant has higher initiative
    const newCombatant = makeCombatant({ id: 'new', initiative: 25 })
    const result = insertCombatant(combatants, newCombatant, 1)
    expect(result.actsThisRound).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// HP & Damage
// ---------------------------------------------------------------------------

describe('applyCombatDamage', () => {
  it('should reduce HP by damage amount', () => {
    const combatant = makeCombatant({ hp: 20, maxHp: 20 })
    const result = applyCombatDamage(combatant, 5)
    expect(result.hp).toBe(15)
  })

  it('should apply damage to temp HP first', () => {
    const combatant = makeCombatant({ hp: 20, maxHp: 20, tempHp: 5 })
    const result = applyCombatDamage(combatant, 3)
    expect(result.tempHp).toBe(2)
    expect(result.hp).toBe(20)
  })

  it('should overflow temp HP damage to regular HP', () => {
    const combatant = makeCombatant({ hp: 20, maxHp: 20, tempHp: 3 })
    const result = applyCombatDamage(combatant, 8)
    expect(result.tempHp).toBe(0)
    expect(result.hp).toBe(15)
  })

  it('should clamp HP at 0', () => {
    const combatant = makeCombatant({ hp: 5, maxHp: 20 })
    const result = applyCombatDamage(combatant, 100)
    expect(result.hp).toBe(0)
  })

  it('should mark monster as defeated at 0 HP', () => {
    const combatant = makeCombatant({ hp: 5, maxHp: 20, type: 'monster' })
    const result = applyCombatDamage(combatant, 5)
    expect(result.isDefeated).toBe(true)
  })

  it('should auto-apply unconscious condition to defeated monsters', () => {
    const combatant = makeCombatant({ hp: 5, maxHp: 20, type: 'monster' })
    const result = applyCombatDamage(combatant, 5)
    expect(result.conditions).toContain('unconscious')
  })

  it('should NOT mark player as defeated at 0 HP', () => {
    const combatant = makeCombatant({ hp: 5, maxHp: 20, type: 'player' })
    const result = applyCombatDamage(combatant, 5)
    expect(result.isDefeated).toBe(false)
  })

  it('should not apply negative damage', () => {
    const combatant = makeCombatant({ hp: 20, maxHp: 20 })
    const result = applyCombatDamage(combatant, -5)
    expect(result.hp).toBe(20)
  })

  it('should not apply zero damage', () => {
    const combatant = makeCombatant({ hp: 20, maxHp: 20 })
    const result = applyCombatDamage(combatant, 0)
    expect(result.hp).toBe(20)
  })
})

describe('applyCombatHealing', () => {
  it('should increase HP by heal amount', () => {
    const combatant = makeCombatant({ hp: 10, maxHp: 20 })
    const result = applyCombatHealing(combatant, 5)
    expect(result.hp).toBe(15)
  })

  it('should cap HP at maxHp', () => {
    const combatant = makeCombatant({ hp: 18, maxHp: 20 })
    const result = applyCombatHealing(combatant, 10)
    expect(result.hp).toBe(20)
  })

  it('should remove unconscious condition when healed from 0', () => {
    const combatant = makeCombatant({ hp: 0, maxHp: 20, conditions: ['unconscious'] })
    const result = applyCombatHealing(combatant, 5)
    expect(result.conditions).not.toContain('unconscious')
  })

  it('should reset death saves when healed from 0', () => {
    const combatant = makeCombatant({
      hp: 0,
      maxHp: 20,
      deathSaves: { successes: 2, failures: 1 },
    })
    const result = applyCombatHealing(combatant, 5)
    expect(result.deathSaves).toEqual({ successes: 0, failures: 0 })
  })

  it('should not apply negative healing', () => {
    const combatant = makeCombatant({ hp: 10, maxHp: 20 })
    const result = applyCombatHealing(combatant, -5)
    expect(result.hp).toBe(10)
  })
})

describe('getConcentrationDC', () => {
  it('should return 10 for damage < 20', () => {
    expect(getConcentrationDC(5)).toBe(10)
    expect(getConcentrationDC(10)).toBe(10)
    expect(getConcentrationDC(19)).toBe(10)
  })

  it('should return floor(damage/2) for damage >= 20', () => {
    expect(getConcentrationDC(20)).toBe(10)
    expect(getConcentrationDC(22)).toBe(11)
    expect(getConcentrationDC(40)).toBe(20)
    expect(getConcentrationDC(50)).toBe(25)
  })

  it('should handle damage of exactly 21', () => {
    expect(getConcentrationDC(21)).toBe(10)
  })
})

// ---------------------------------------------------------------------------
// XP Calculations
// ---------------------------------------------------------------------------

describe('getXPForCR', () => {
  it('should return correct XP for standard CRs', () => {
    expect(getXPForCR(0)).toBe(10)
    expect(getXPForCR(1)).toBe(200)
    expect(getXPForCR(5)).toBe(1800)
    expect(getXPForCR(10)).toBe(5900)
    expect(getXPForCR(20)).toBe(25000)
  })

  it('should handle fractional CRs as strings', () => {
    expect(getXPForCR('1/8')).toBe(25)
    expect(getXPForCR('1/4')).toBe(50)
    expect(getXPForCR('1/2')).toBe(100)
  })

  it('should handle fractional CRs as decimals', () => {
    expect(getXPForCR(0.125)).toBe(25)
    expect(getXPForCR(0.25)).toBe(50)
    expect(getXPForCR(0.5)).toBe(100)
  })

  it('should return 0 for unknown CR', () => {
    expect(getXPForCR('999')).toBe(0)
  })
})

describe('calculateTotalXP', () => {
  it('should sum XP from defeated monsters by CR', () => {
    const defeated = [
      { cr: 1 },
      { cr: 2 },
      { cr: 0.5 },
    ]
    expect(calculateTotalXP(defeated)).toBe(200 + 450 + 100)
  })

  it('should use loggedXp when available', () => {
    const defeated = [
      { cr: 1, loggedXp: 500 },
      { cr: 2 },
    ]
    expect(calculateTotalXP(defeated)).toBe(500 + 450)
  })

  it('should return 0 for empty array', () => {
    expect(calculateTotalXP([])).toBe(0)
  })

  it('should handle monsters without CR', () => {
    const defeated = [{ cr: undefined }]
    expect(calculateTotalXP(defeated)).toBe(0)
  })
})

describe('calculateXPPerCharacter', () => {
  it('should divide XP evenly', () => {
    expect(calculateXPPerCharacter(1000, 4)).toBe(250)
  })

  it('should floor the result', () => {
    expect(calculateXPPerCharacter(1000, 3)).toBe(333)
  })

  it('should return 0 for 0 characters', () => {
    expect(calculateXPPerCharacter(1000, 0)).toBe(0)
  })

  it('should return full XP for 1 character', () => {
    expect(calculateXPPerCharacter(1000, 1)).toBe(1000)
  })
})

describe('wouldLevelUp', () => {
  it('should return true when XP crosses threshold', () => {
    expect(wouldLevelUp(200, 100, 1)).toBe(true) // 300 needed for level 2
  })

  it('should return false when XP does not cross threshold', () => {
    expect(wouldLevelUp(0, 100, 1)).toBe(false) // 300 needed
  })

  it('should return false at level 20', () => {
    expect(wouldLevelUp(400000, 100000, 20)).toBe(false)
  })
})

describe('getLevelForXP', () => {
  it('should return level 1 for 0 XP', () => {
    expect(getLevelForXP(0)).toBe(1)
  })

  it('should return level 2 at 300 XP', () => {
    expect(getLevelForXP(300)).toBe(2)
  })

  it('should return level 5 at 6500 XP', () => {
    expect(getLevelForXP(6500)).toBe(5)
  })

  it('should return level 20 at 355000 XP', () => {
    expect(getLevelForXP(355000)).toBe(20)
  })
})

// ---------------------------------------------------------------------------
// HP Color/Percentage Helpers
// ---------------------------------------------------------------------------

describe('getHPColor', () => {
  it('should return green when > 50%', () => {
    expect(getHPColor(15, 20)).toBe('bg-green-500')
  })

  it('should return yellow between 25% and 50%', () => {
    expect(getHPColor(8, 20)).toBe('bg-yellow-500')
  })

  it('should return red below 25%', () => {
    expect(getHPColor(3, 20)).toBe('bg-red-500')
  })

  it('should return gray for 0 maxHp', () => {
    expect(getHPColor(0, 0)).toBe('bg-gray-500')
  })
})

describe('getHPPercentage', () => {
  it('should return correct percentage', () => {
    expect(getHPPercentage(10, 20)).toBe(50)
  })

  it('should clamp at 100', () => {
    expect(getHPPercentage(30, 20)).toBe(100)
  })

  it('should return 0 for 0 maxHp', () => {
    expect(getHPPercentage(0, 0)).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Combatant Creation
// ---------------------------------------------------------------------------

describe('createPlayerCombatant', () => {
  beforeEach(() => resetCombatantIdCounter())

  it('should create a player combatant with correct fields', () => {
    const c = createPlayerCombatant('char-1', 'Aragorn', 16, 30, 45, 2, [], 0)
    expect(c.name).toBe('Aragorn')
    expect(c.type).toBe('player')
    expect(c.isPlayerCharacter).toBe(true)
    expect(c.characterId).toBe('char-1')
    expect(c.ac).toBe(16)
    expect(c.hp).toBe(30)
    expect(c.maxHp).toBe(45)
    expect(c.initiativeModifier).toBe(2)
    expect(c.initiative).toBe(0)
    expect(c.tempHp).toBe(0)
    expect(c.isDefeated).toBe(false)
    expect(c.addOrder).toBe(0)
  })

  it('should include existing conditions', () => {
    const c = createPlayerCombatant('char-1', 'Test', 10, 10, 10, 0, ['poisoned', 'prone'], 0)
    expect(c.conditions).toEqual(['poisoned', 'prone'])
  })
})

describe('createMonsterCombatant', () => {
  beforeEach(() => resetCombatantIdCounter())

  it('should create a monster combatant with correct fields', () => {
    const c = createMonsterCombatant('Goblin', 15, 7, 2, 0, 0.25)
    expect(c.name).toBe('Goblin')
    expect(c.type).toBe('monster')
    expect(c.isPlayerCharacter).toBe(false)
    expect(c.cr).toBe(0.25)
    expect(c.hp).toBe(7)
    expect(c.maxHp).toBe(7)
  })

  it('should create NPC type when specified', () => {
    const c = createMonsterCombatant('Shopkeeper', 10, 5, 0, 0, undefined, 'npc')
    expect(c.type).toBe('npc')
  })
})

describe('createLairAction', () => {
  beforeEach(() => resetCombatantIdCounter())

  it('should create a lair action combatant', () => {
    const c = createLairAction('Acid Drip', 20, 0)
    expect(c.name).toBe('Acid Drip')
    expect(c.type).toBe('lair')
    expect(c.initiative).toBe(20)
    expect(c.notes).toBe('Lair Action')
  })
})

describe('duplicateCombatant', () => {
  beforeEach(() => resetCombatantIdCounter())

  it('should create a copy with incremented name', () => {
    const original = createMonsterCombatant('Goblin', 15, 7, 2, 0, 0.25)
    const dupe = duplicateCombatant(original, ['Goblin'], 1)
    expect(dupe.name).toBe('Goblin 2')
    expect(dupe.id).not.toBe(original.id)
    expect(dupe.hp).toBe(original.maxHp)
    expect(dupe.addOrder).toBe(1)
  })

  it('should handle existing numbered names', () => {
    const original = createMonsterCombatant('Goblin 1', 15, 7, 2, 0)
    const dupe = duplicateCombatant(original, ['Goblin 1', 'Goblin 2'], 2)
    expect(dupe.name).toBe('Goblin 3')
  })
})

describe('getNextIncrementedName', () => {
  it('should return "Name 2" for first duplicate', () => {
    expect(getNextIncrementedName('Goblin', ['Goblin'])).toBe('Goblin 2')
  })

  it('should return "Name 3" when 1 and 2 exist', () => {
    expect(getNextIncrementedName('Goblin', ['Goblin', 'Goblin 2'])).toBe('Goblin 3')
  })

  it('should handle names with existing numbers', () => {
    expect(getNextIncrementedName('Goblin 1', ['Goblin 1', 'Goblin 2'])).toBe('Goblin 3')
  })

  it('should handle single existing name', () => {
    expect(getNextIncrementedName('Orc', ['Orc'])).toBe('Orc 2')
  })
})

describe('createMultipleCombatants', () => {
  beforeEach(() => resetCombatantIdCounter())

  it('should create the specified number of combatants', () => {
    const combatants = createMultipleCombatants('Goblin', 15, 7, 2, 4, 0, 0.25)
    expect(combatants).toHaveLength(4)
  })

  it('should auto-number the names', () => {
    const combatants = createMultipleCombatants('Goblin', 15, 7, 2, 3, 0)
    expect(combatants[0].name).toBe('Goblin 1')
    expect(combatants[1].name).toBe('Goblin 2')
    expect(combatants[2].name).toBe('Goblin 3')
  })

  it('should give each combatant a unique ID', () => {
    const combatants = createMultipleCombatants('Goblin', 15, 7, 2, 3, 0)
    const ids = combatants.map((c) => c.id)
    expect(new Set(ids).size).toBe(3)
  })

  it('should set sequential add orders', () => {
    const combatants = createMultipleCombatants('Orc', 13, 15, 1, 2, 5)
    expect(combatants[0].addOrder).toBe(5)
    expect(combatants[1].addOrder).toBe(6)
  })

  it('should share the same group ID', () => {
    const combatants = createMultipleCombatants('Goblin', 15, 7, 2, 3, 0, 0.25, 'group-1')
    expect(combatants.every((c) => c.groupId === 'group-1')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Encounter State
// ---------------------------------------------------------------------------

describe('createEncounterState', () => {
  it('should create a new encounter state', () => {
    const state = createEncounterState('enc-1', 'camp-1', 'Ambush')
    expect(state.id).toBe('enc-1')
    expect(state.campaignId).toBe('camp-1')
    expect(state.name).toBe('Ambush')
    expect(state.combatants).toEqual([])
    expect(state.currentTurnIndex).toBe(0)
    expect(state.round).toBe(1)
    expect(state.phase).toBe('setup')
    expect(state.defeatedMonsterXp).toBe(0)
  })
})
