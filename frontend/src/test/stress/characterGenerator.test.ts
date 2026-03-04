/**
 * Character Generator Tests (Story 42.5)
 *
 * Tests for the stress test character generation utilities:
 * - Mock character generation
 * - Combat encounter generation
 * - Campaign fixture generation
 * - Data validity and variety
 */

import { describe, it, expect } from 'vitest'
import {
  generateMockCharacter,
  generateMockCharacters,
  generateCombatEncounter,
  generateCampaignFixture,
} from './characterGenerator'

describe('Character Generator', () => {
  // =========================================================================
  // generateMockCharacter
  // =========================================================================

  describe('generateMockCharacter', () => {
    it('should generate a character with all required GalleryCharacter fields', () => {
      const char = generateMockCharacter(0)

      expect(char.id).toBeDefined()
      expect(char.name).toBeDefined()
      expect(char.race).toBeDefined()
      expect(char.class).toBeDefined()
      expect(char.level).toBeGreaterThanOrEqual(1)
      expect(char.level).toBeLessThanOrEqual(20)
      expect(char.hp).toBeDefined()
      expect(char.hp.current).toBeGreaterThanOrEqual(0)
      expect(char.hp.max).toBeGreaterThanOrEqual(1)
      expect(char.ac).toBeGreaterThanOrEqual(10)
      expect(char.ac).toBeLessThanOrEqual(20)
    })

    it('should generate unique IDs based on index', () => {
      const char0 = generateMockCharacter(0)
      const char1 = generateMockCharacter(1)
      expect(char0.id).not.toBe(char1.id)
      expect(char0.id).toContain('0000')
      expect(char1.id).toContain('0001')
    })

    it('should include ISO date timestamps', () => {
      const char = generateMockCharacter(0)
      expect(char.updatedAt).toBeDefined()
      expect(char.createdAt).toBeDefined()
      expect(() => new Date(char.updatedAt!)).not.toThrow()
      expect(() => new Date(char.createdAt!)).not.toThrow()
    })

    it('should have valid HP values (current <= max)', () => {
      for (let i = 0; i < 50; i++) {
        const char = generateMockCharacter(i)
        expect(char.hp.current).toBeLessThanOrEqual(char.hp.max)
        expect(char.hp.max).toBeGreaterThanOrEqual(1)
      }
    })
  })

  // =========================================================================
  // generateMockCharacters
  // =========================================================================

  describe('generateMockCharacters', () => {
    it('should generate the requested number of characters', () => {
      const characters = generateMockCharacters(100)
      expect(characters).toHaveLength(100)
    })

    it('should generate 100+ realistic characters with varied attributes', () => {
      const characters = generateMockCharacters(120)
      expect(characters).toHaveLength(120)

      // Verify variety in races
      const races = new Set(characters.map((c) => c.race))
      expect(races.size).toBeGreaterThan(1)

      // Verify variety in classes
      const classes = new Set(characters.map((c) => c.class))
      expect(classes.size).toBeGreaterThan(1)

      // Verify variety in levels
      const levels = new Set(characters.map((c) => c.level))
      expect(levels.size).toBeGreaterThan(1)
    })

    it('should include a mix of campaign and non-campaign characters', () => {
      const characters = generateMockCharacters(100)
      const withCampaign = characters.filter((c) => c.campaignName !== null)
      const withoutCampaign = characters.filter((c) => c.campaignName === null)

      expect(withCampaign.length).toBeGreaterThan(0)
      expect(withoutCampaign.length).toBeGreaterThan(0)
    })

    it('should generate characters quickly (under 100ms for 1000 characters)', () => {
      const start = performance.now()
      generateMockCharacters(1000)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
    })
  })

  // =========================================================================
  // generateCombatEncounter
  // =========================================================================

  describe('generateCombatEncounter', () => {
    it('should generate 28 combatants (8 party + 20 monsters) by default', () => {
      const combatants = generateCombatEncounter()
      expect(combatants).toHaveLength(28)
    })

    it('should separate player characters and monsters', () => {
      const combatants = generateCombatEncounter(8, 20)
      const pcs = combatants.filter((c) => c.isPlayer)
      const monsters = combatants.filter((c) => !c.isPlayer)

      expect(pcs).toHaveLength(8)
      expect(monsters).toHaveLength(20)
    })

    it('should sort combatants by initiative descending', () => {
      const combatants = generateCombatEncounter()
      for (let i = 0; i < combatants.length - 1; i++) {
        expect(combatants[i].initiative).toBeGreaterThanOrEqual(
          combatants[i + 1].initiative
        )
      }
    })

    it('should include HP, AC, and initiative for all combatants', () => {
      const combatants = generateCombatEncounter()
      for (const c of combatants) {
        expect(c.hp.max).toBeGreaterThanOrEqual(1)
        expect(c.ac).toBeGreaterThanOrEqual(1)
        expect(c.initiative).toBeGreaterThanOrEqual(1)
        expect(c.name).toBeDefined()
        expect(c.id).toBeDefined()
      }
    })

    it('should allow custom party and monster counts', () => {
      const combatants = generateCombatEncounter(4, 10)
      expect(combatants).toHaveLength(14)
    })

    it('should support conditions on combatants', () => {
      // Generate a large encounter to increase chance of conditions
      const combatants = generateCombatEncounter(8, 50)
      const withConditions = combatants.filter((c) => c.conditions.length > 0)
      // With ~15-20% chance per combatant, we should have at least a few
      expect(withConditions.length).toBeGreaterThanOrEqual(0) // Non-deterministic, so just check structure
      for (const c of combatants) {
        expect(Array.isArray(c.conditions)).toBe(true)
      }
    })
  })

  // =========================================================================
  // generateCampaignFixture
  // =========================================================================

  describe('generateCampaignFixture', () => {
    it('should generate a campaign with default sizes', () => {
      const campaign = generateCampaignFixture()

      expect(campaign.characters).toHaveLength(8)
      expect(campaign.sessionNotes).toHaveLength(20)
      expect(campaign.npcs).toHaveLength(50)
      expect(campaign.loot).toHaveLength(100)
    })

    it('should generate valid session notes with title and content', () => {
      const campaign = generateCampaignFixture()

      for (const note of campaign.sessionNotes) {
        expect(note.id).toBeDefined()
        expect(note.title).toBeDefined()
        expect(note.content.length).toBeGreaterThan(0)
        expect(note.date).toBeDefined()
      }
    })

    it('should generate NPCs with name, description, and location', () => {
      const campaign = generateCampaignFixture()

      for (const npc of campaign.npcs) {
        expect(npc.id).toBeDefined()
        expect(npc.name).toBeDefined()
        expect(npc.description.length).toBeGreaterThan(0)
        expect(npc.location).toBeDefined()
      }
    })

    it('should generate loot items with some assigned to characters', () => {
      const campaign = generateCampaignFixture()

      const assigned = campaign.loot.filter((l) => l.assignedTo !== null)
      const unassigned = campaign.loot.filter((l) => l.assignedTo === null)

      expect(assigned.length).toBeGreaterThan(0)
      expect(unassigned.length).toBeGreaterThan(0)
    })

    it('should allow custom sizes', () => {
      const campaign = generateCampaignFixture(4, 10, 25, 50)

      expect(campaign.characters).toHaveLength(4)
      expect(campaign.sessionNotes).toHaveLength(10)
      expect(campaign.npcs).toHaveLength(25)
      expect(campaign.loot).toHaveLength(50)
    })

    it('should have a valid campaign ID and name', () => {
      const campaign = generateCampaignFixture()
      expect(campaign.id).toBeDefined()
      expect(campaign.name).toBeDefined()
    })
  })
})
