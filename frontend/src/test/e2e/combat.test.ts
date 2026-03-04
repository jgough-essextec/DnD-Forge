/**
 * E2E Integration Test: Combat Flow (Epic 45, Story 45.2)
 *
 * Tests the combat tracker flow:
 * - Create encounter with combatants (players + monsters)
 * - Roll initiative and sort by initiative order
 * - Advance turns and track rounds
 * - Apply damage/healing in combat context
 * - Defeat tracking and XP calculation
 * - Turn insertion and removal
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  createEncounterState,
  createPlayerCombatant,
  createMonsterCombatant,
  createMultipleCombatants,
  sortByInitiative,
  nextTurn,
  previousTurn,
  applyCombatDamage,
  applyCombatHealing,
  calculateTotalXP,
  calculateXPPerCharacter,
  getXPForCR,
  getHPColor,
  getHPPercentage,
  getConcentrationDC,
  insertCombatant,
  removeCombatant,
  areTied,
  findTiedGroups,
  resetCombatantIdCounter,
  duplicateCombatant,
  getNextIncrementedName,
} from '@/utils/combat'
import type { CombatCombatant } from '@/utils/combat'

beforeEach(() => {
  resetCombatantIdCounter()
})

// ---------------------------------------------------------------------------
// Create Encounter and Combatants
// ---------------------------------------------------------------------------

describe('Combat: Encounter Setup', () => {
  it('creates an encounter state in setup phase', () => {
    const encounter = createEncounterState('enc-001', 'camp-001', 'Goblin Ambush')
    expect(encounter.id).toBe('enc-001')
    expect(encounter.campaignId).toBe('camp-001')
    expect(encounter.name).toBe('Goblin Ambush')
    expect(encounter.combatants).toHaveLength(0)
    expect(encounter.round).toBe(1)
    expect(encounter.phase).toBe('setup')
  })

  it('creates player combatants with correct fields', () => {
    const player = createPlayerCombatant(
      'char-001', 'Thorn Ironforge', 18, 52, 52, 1, [], 0,
    )
    expect(player.name).toBe('Thorn Ironforge')
    expect(player.type).toBe('player')
    expect(player.isPlayerCharacter).toBe(true)
    expect(player.ac).toBe(18)
    expect(player.hp).toBe(52)
    expect(player.maxHp).toBe(52)
    expect(player.initiative).toBe(0) // not yet rolled
    expect(player.isDefeated).toBe(false)
  })

  it('creates monster combatants', () => {
    const goblin = createMonsterCombatant(
      'Goblin', 15, 7, 2, 0, 0.25,
    )
    expect(goblin.name).toBe('Goblin')
    expect(goblin.type).toBe('monster')
    expect(goblin.isPlayerCharacter).toBe(false)
    expect(goblin.cr).toBe(0.25)
  })

  it('creates multiple combatants with numbered names', () => {
    const goblins = createMultipleCombatants(
      'Goblin', 15, 7, 2, 3, 0, 0.25, 'goblin-group',
    )
    expect(goblins).toHaveLength(3)
    expect(goblins[0].name).toBe('Goblin 1')
    expect(goblins[1].name).toBe('Goblin 2')
    expect(goblins[2].name).toBe('Goblin 3')
    expect(goblins.every((g) => g.groupId === 'goblin-group')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Initiative Sorting
// ---------------------------------------------------------------------------

describe('Combat: Initiative Sorting', () => {
  it('sorts combatants by initiative (highest first)', () => {
    const combatants: CombatCombatant[] = [
      { ...createPlayerCombatant('c1', 'A', 10, 10, 10, 1, [], 0), initiative: 10 },
      { ...createMonsterCombatant('B', 10, 10, 2, 1), initiative: 18 },
      { ...createPlayerCombatant('c2', 'C', 10, 10, 10, 0, [], 2), initiative: 15 },
    ]

    const sorted = sortByInitiative(combatants)
    expect(sorted[0].name).toBe('B')  // 18
    expect(sorted[1].name).toBe('C')  // 15
    expect(sorted[2].name).toBe('A')  // 10
  })

  it('breaks ties by initiative modifier (higher first)', () => {
    const combatants: CombatCombatant[] = [
      { ...createPlayerCombatant('c1', 'Slow', 10, 10, 10, 0, [], 0), initiative: 15, initiativeModifier: 0 },
      { ...createPlayerCombatant('c2', 'Quick', 10, 10, 10, 3, [], 1), initiative: 15, initiativeModifier: 3 },
    ]

    const sorted = sortByInitiative(combatants)
    expect(sorted[0].name).toBe('Quick') // higher modifier
  })

  it('detects tied combatants', () => {
    const a: CombatCombatant = { ...createPlayerCombatant('c1', 'A', 10, 10, 10, 1, [], 0), initiative: 15 }
    const b: CombatCombatant = { ...createPlayerCombatant('c2', 'B', 10, 10, 10, 1, [], 1), initiative: 15 }
    expect(areTied(a, b)).toBe(true)
  })

  it('finds tied groups', () => {
    const combatants: CombatCombatant[] = [
      { ...createPlayerCombatant('c1', 'A', 10, 10, 10, 1, [], 0), initiative: 15 },
      { ...createMonsterCombatant('B', 10, 10, 2, 1), initiative: 15 },
      { ...createPlayerCombatant('c2', 'C', 10, 10, 10, 0, [], 2), initiative: 10 },
    ]

    const groups = findTiedGroups(combatants)
    expect(groups).toHaveLength(1) // one group of 2 tied at 15
    expect(groups[0]).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// Turn Advancement
// ---------------------------------------------------------------------------

describe('Combat: Turn Management', () => {
  it('advances to next turn', () => {
    const combatants = [
      { ...createPlayerCombatant('c1', 'A', 10, 10, 10, 1, [], 0), initiative: 18 },
      { ...createMonsterCombatant('B', 10, 10, 2, 1), initiative: 15 },
      { ...createPlayerCombatant('c2', 'C', 10, 10, 10, 0, [], 2), initiative: 10 },
    ]

    const result = nextTurn(combatants, 0, 1)
    expect(result.turnIndex).toBe(1)
    expect(result.round).toBe(1)
  })

  it('wraps around to start and increments round', () => {
    const combatants = [
      { ...createPlayerCombatant('c1', 'A', 10, 10, 10, 1, [], 0), initiative: 18 },
      { ...createMonsterCombatant('B', 10, 10, 2, 1), initiative: 15 },
    ]

    const result = nextTurn(combatants, 1, 1)
    expect(result.turnIndex).toBe(0)
    expect(result.round).toBe(2)
  })

  it('skips defeated combatants', () => {
    const combatants = [
      { ...createPlayerCombatant('c1', 'A', 10, 10, 10, 1, [], 0), initiative: 18 },
      { ...createMonsterCombatant('B', 10, 10, 2, 1), initiative: 15, isDefeated: true },
      { ...createPlayerCombatant('c2', 'C', 10, 10, 10, 0, [], 2), initiative: 10 },
    ]

    const result = nextTurn(combatants, 0, 1)
    expect(result.turnIndex).toBe(2) // skips index 1 (defeated)
  })

  it('goes back to previous turn', () => {
    const combatants = [
      { ...createPlayerCombatant('c1', 'A', 10, 10, 10, 1, [], 0), initiative: 18 },
      { ...createMonsterCombatant('B', 10, 10, 2, 1), initiative: 15 },
    ]

    const result = previousTurn(combatants, 1, 1)
    expect(result.turnIndex).toBe(0)
    expect(result.round).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Combat Damage and Healing
// ---------------------------------------------------------------------------

describe('Combat: Damage and Healing', () => {
  it('applies damage to combatant (temp HP first)', () => {
    const goblin = { ...createMonsterCombatant('Goblin', 15, 7, 2, 0), tempHp: 3 }
    const damaged = applyCombatDamage(goblin, 5)
    expect(damaged.tempHp).toBe(0) // 3 temp absorbed
    expect(damaged.hp).toBe(5)     // 2 remaining to regular HP
  })

  it('marks monster as defeated at 0 HP', () => {
    const goblin = createMonsterCombatant('Goblin', 15, 7, 2, 0)
    const defeated = applyCombatDamage(goblin, 10)
    expect(defeated.hp).toBe(0)
    expect(defeated.isDefeated).toBe(true)
    expect(defeated.conditions).toContain('unconscious')
  })

  it('player characters are not auto-defeated at 0 HP', () => {
    const player = createPlayerCombatant('c1', 'Hero', 18, 10, 44, 1, [], 0)
    const downed = applyCombatDamage(player, 15)
    expect(downed.hp).toBe(0)
    expect(downed.isDefeated).toBe(false) // PCs make death saves
  })

  it('heals a combatant up to max HP', () => {
    const wounded = { ...createPlayerCombatant('c1', 'Hero', 18, 20, 44, 1, [], 0) }
    const healed = applyCombatHealing(wounded, 30)
    expect(healed.hp).toBe(44) // capped at max
  })

  it('healing from 0 removes unconscious condition', () => {
    const unconscious = {
      ...createPlayerCombatant('c1', 'Hero', 18, 0, 44, 1, ['unconscious'], 0),
      hp: 0,
    }
    const healed = applyCombatHealing(unconscious, 5)
    expect(healed.hp).toBe(5)
    expect(healed.conditions).not.toContain('unconscious')
  })
})

// ---------------------------------------------------------------------------
// XP Calculation
// ---------------------------------------------------------------------------

describe('Combat: XP Calculation', () => {
  it('calculates XP for a given CR', () => {
    expect(getXPForCR(0.25)).toBe(50)
    expect(getXPForCR(1)).toBe(200)
    expect(getXPForCR(5)).toBe(1800)
    expect(getXPForCR(10)).toBe(5900)
  })

  it('calculates total XP from defeated monsters', () => {
    const defeated = [
      { cr: 0.25 },
      { cr: 0.25 },
      { cr: 1 },
    ]
    const total = calculateTotalXP(defeated)
    expect(total).toBe(50 + 50 + 200)
  })

  it('distributes XP evenly among characters', () => {
    const xpPerChar = calculateXPPerCharacter(300, 4)
    expect(xpPerChar).toBe(75)
  })

  it('returns 0 XP per character when no characters', () => {
    expect(calculateXPPerCharacter(300, 0)).toBe(0)
  })

  it('uses loggedXp when available', () => {
    const defeated = [
      { cr: 1, loggedXp: 500 }, // override CR-based XP
    ]
    const total = calculateTotalXP(defeated)
    expect(total).toBe(500) // uses loggedXp, not CR
  })
})

// ---------------------------------------------------------------------------
// Combatant Insertion / Removal
// ---------------------------------------------------------------------------

describe('Combat: Insert and Remove Combatants', () => {
  it('inserts combatant at correct initiative position', () => {
    const combatants: CombatCombatant[] = [
      { ...createPlayerCombatant('c1', 'A', 10, 10, 10, 1, [], 0), initiative: 20 },
      { ...createMonsterCombatant('B', 10, 10, 2, 1), initiative: 10 },
    ]
    const newCombatant = { ...createMonsterCombatant('C', 10, 10, 2, 2), initiative: 15 }

    const result = insertCombatant(combatants, newCombatant, 0)
    expect(result.combatants).toHaveLength(3)
    expect(result.combatants[1].name).toBe('C') // between 20 and 10
  })

  it('removes combatant and adjusts turn index', () => {
    const combatants: CombatCombatant[] = [
      { ...createPlayerCombatant('c1', 'A', 10, 10, 10, 1, [], 0), initiative: 20 },
      { ...createMonsterCombatant('B', 10, 10, 2, 1), initiative: 15 },
      { ...createPlayerCombatant('c2', 'C', 10, 10, 10, 0, [], 2), initiative: 10 },
    ]

    const result = removeCombatant(combatants, combatants[0].id, 1)
    expect(result.combatants).toHaveLength(2)
    expect(result.turnIndex).toBe(0) // adjusted down
  })

  it('duplicates a combatant with incremented name', () => {
    const goblin = createMonsterCombatant('Goblin', 15, 7, 2, 0)
    const dup = duplicateCombatant(goblin, ['Goblin'], 1)
    expect(dup.name).toBe('Goblin 2')
    expect(dup.hp).toBe(goblin.maxHp) // full HP
  })

  it('getNextIncrementedName handles existing numbered names', () => {
    expect(getNextIncrementedName('Goblin', ['Goblin', 'Goblin 2'])).toBe('Goblin 3')
    expect(getNextIncrementedName('Goblin', ['Goblin'])).toBe('Goblin 2')
  })
})

// ---------------------------------------------------------------------------
// HP Display Helpers
// ---------------------------------------------------------------------------

describe('Combat: HP Display Helpers', () => {
  it('getHPColor returns green for > 50%', () => {
    expect(getHPColor(30, 44)).toBe('bg-green-500')
  })

  it('getHPColor returns yellow for 25-50%', () => {
    expect(getHPColor(15, 44)).toBe('bg-yellow-500')
  })

  it('getHPColor returns red for <= 25%', () => {
    expect(getHPColor(5, 44)).toBe('bg-red-500')
  })

  it('getHPPercentage computes correctly', () => {
    expect(getHPPercentage(22, 44)).toBe(50)
    expect(getHPPercentage(44, 44)).toBe(100)
    expect(getHPPercentage(0, 44)).toBe(0)
  })

  it('getConcentrationDC is at least 10', () => {
    expect(getConcentrationDC(5)).toBe(10)
    expect(getConcentrationDC(30)).toBe(15)
    expect(getConcentrationDC(40)).toBe(20)
  })
})
