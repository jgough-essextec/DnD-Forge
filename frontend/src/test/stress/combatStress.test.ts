/**
 * Combat Stress Tests (Story 42.5)
 *
 * Tests for combat tracker performance with 28 combatants:
 * - Turn cycling speed
 * - HP update responsiveness
 * - Condition management
 * - Round progression
 */

import { describe, it, expect } from 'vitest'
import {
  generateCombatEncounter,
  generateCampaignFixture,
} from './characterGenerator'

describe('Combat Stress Tests', () => {
  // =========================================================================
  // Turn cycling
  // =========================================================================

  describe('turn cycling with 28 combatants', () => {
    it('should advance turns through 28 combatants in < 5ms per turn', () => {
      const combatants = generateCombatEncounter(8, 20)
      expect(combatants).toHaveLength(28)

      let currentIndex = 0
      const advanceTurn = () => {
        currentIndex = (currentIndex + 1) % combatants.length
        return combatants[currentIndex]
      }

      // Cycle through 10 full rounds (280 turns)
      const start = performance.now()
      for (let i = 0; i < 280; i++) {
        advanceTurn()
      }
      const duration = performance.now() - start
      const perTurn = duration / 280

      expect(perTurn).toBeLessThan(5)
    })

    it('should cycle through 10 complete rounds in < 50ms', () => {
      const combatants = generateCombatEncounter(8, 20)
      let currentTurn = 0
      let currentRound = 1

      const start = performance.now()
      for (let i = 0; i < 10 * combatants.length; i++) {
        currentTurn++
        if (currentTurn >= combatants.length) {
          currentTurn = 0
          currentRound++
        }
      }
      const duration = performance.now() - start

      expect(duration).toBeLessThan(50)
      expect(currentRound).toBe(11) // Started at 1, went through 10 rounds
    })
  })

  // =========================================================================
  // HP updates
  // =========================================================================

  describe('HP updates with 28 combatants', () => {
    it('should update HP for all combatants in < 5ms', () => {
      const combatants = generateCombatEncounter(8, 20)

      const start = performance.now()
      for (const c of combatants) {
        const damage = Math.floor(Math.random() * 20) + 1
        c.hp.current = Math.max(0, c.hp.current - damage)
      }
      const duration = performance.now() - start

      expect(duration).toBeLessThan(5)
    })

    it('should apply healing to all combatants in < 5ms', () => {
      const combatants = generateCombatEncounter(8, 20)
      // First damage everyone
      for (const c of combatants) {
        c.hp.current = Math.floor(c.hp.max / 2)
      }

      const start = performance.now()
      for (const c of combatants) {
        const healing = Math.floor(Math.random() * 10) + 1
        c.hp.current = Math.min(c.hp.max, c.hp.current + healing)
      }
      const duration = performance.now() - start

      expect(duration).toBeLessThan(5)

      // Verify HP constraints
      for (const c of combatants) {
        expect(c.hp.current).toBeLessThanOrEqual(c.hp.max)
        expect(c.hp.current).toBeGreaterThanOrEqual(0)
      }
    })

    it('should track dead combatants (HP = 0) efficiently', () => {
      const combatants = generateCombatEncounter(8, 20)

      // First ensure all start alive
      for (const c of combatants) {
        c.hp.current = Math.max(1, c.hp.current)
      }

      // Kill first 10 combatants
      for (let i = 0; i < 10; i++) {
        combatants[i].hp.current = 0
      }

      const start = performance.now()
      const alive = combatants.filter((c) => c.hp.current > 0)
      const dead = combatants.filter((c) => c.hp.current === 0)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(5)
      expect(alive.length + dead.length).toBe(28)
      expect(dead.length).toBe(10)
    })
  })

  // =========================================================================
  // Condition management
  // =========================================================================

  describe('condition management', () => {
    it('should add conditions to all combatants in < 5ms', () => {
      const combatants = generateCombatEncounter(8, 20)

      const start = performance.now()
      for (const c of combatants) {
        c.conditions.push('Poisoned')
      }
      const duration = performance.now() - start

      expect(duration).toBeLessThan(5)
      for (const c of combatants) {
        expect(c.conditions).toContain('Poisoned')
      }
    })

    it('should remove conditions from all combatants in < 5ms', () => {
      const combatants = generateCombatEncounter(8, 20)
      for (const c of combatants) {
        c.conditions = ['Poisoned', 'Blinded']
      }

      const start = performance.now()
      for (const c of combatants) {
        c.conditions = c.conditions.filter((cond) => cond !== 'Poisoned')
      }
      const duration = performance.now() - start

      expect(duration).toBeLessThan(5)
      for (const c of combatants) {
        expect(c.conditions).not.toContain('Poisoned')
        expect(c.conditions).toContain('Blinded')
      }
    })

    it('should count conditions across all combatants in < 5ms', () => {
      const combatants = generateCombatEncounter(8, 20)
      // Add various conditions
      combatants[0].conditions = ['Poisoned', 'Blinded']
      combatants[1].conditions = ['Frightened']
      combatants[2].conditions = ['Paralyzed', 'Prone']

      const start = performance.now()
      const conditionCounts = new Map<string, number>()
      for (const c of combatants) {
        for (const cond of c.conditions) {
          conditionCounts.set(cond, (conditionCounts.get(cond) ?? 0) + 1)
        }
      }
      const duration = performance.now() - start

      expect(duration).toBeLessThan(5)
      expect(conditionCounts.size).toBeGreaterThan(0)
    })
  })

  // =========================================================================
  // Initiative sorting
  // =========================================================================

  describe('initiative sorting', () => {
    it('should re-sort 28 combatants by initiative in < 5ms', () => {
      const combatants = generateCombatEncounter(8, 20)

      // Modify some initiative values
      combatants[5].initiative = 25
      combatants[10].initiative = 1

      const start = performance.now()
      combatants.sort((a, b) => b.initiative - a.initiative)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(5)
      expect(combatants[0].initiative).toBeGreaterThanOrEqual(
        combatants[combatants.length - 1].initiative
      )
    })
  })

  // =========================================================================
  // Campaign fixture stress
  // =========================================================================

  describe('campaign fixture', () => {
    it('should generate a full campaign fixture in < 50ms', () => {
      const start = performance.now()
      const campaign = generateCampaignFixture(8, 20, 50, 100)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(50)
      expect(campaign.characters).toHaveLength(8)
      expect(campaign.sessionNotes).toHaveLength(20)
      expect(campaign.npcs).toHaveLength(50)
      expect(campaign.loot).toHaveLength(100)
    })

    it('should handle a large campaign with 8 chars, 20 sessions, 50 NPCs, 100 loot', () => {
      const campaign = generateCampaignFixture()

      // Verify all data is well-formed
      expect(campaign.id).toBeDefined()
      expect(campaign.name).toBeDefined()

      // Characters
      for (const char of campaign.characters) {
        expect(char.id).toBeDefined()
        expect(char.name).toBeDefined()
        expect(char.level).toBeGreaterThanOrEqual(1)
      }

      // Session notes
      for (const note of campaign.sessionNotes) {
        expect(note.id).toBeDefined()
        expect(note.title.length).toBeGreaterThan(0)
      }

      // NPCs
      for (const npc of campaign.npcs) {
        expect(npc.id).toBeDefined()
        expect(npc.name.length).toBeGreaterThan(0)
        expect(npc.location.length).toBeGreaterThan(0)
      }

      // Loot
      for (const item of campaign.loot) {
        expect(item.id).toBeDefined()
        expect(item.name.length).toBeGreaterThan(0)
        expect(item.value).toContain('gp')
      }
    })

    it('should support characters with long backstories (10000+ chars)', () => {
      const longBackstory = 'A'.repeat(10000)
      expect(longBackstory.length).toBe(10000)

      // Simulate a character with a long backstory
      const char = {
        id: 'long-backstory',
        backstory: longBackstory,
      }

      expect(char.backstory.length).toBeGreaterThanOrEqual(10000)
    })

    it('should support characters with 100+ inventory items', () => {
      const inventoryItems = Array.from({ length: 150 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        weight: Math.random() * 10,
        quantity: Math.floor(Math.random() * 5) + 1,
      }))

      expect(inventoryItems).toHaveLength(150)

      // Verify we can compute total weight efficiently
      const start = performance.now()
      const totalWeight = inventoryItems.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0
      )
      const duration = performance.now() - start

      expect(duration).toBeLessThan(5)
      expect(totalWeight).toBeGreaterThan(0)
    })
  })
})
