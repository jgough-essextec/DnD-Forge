/**
 * Calculation Cache Tests (Story 42.3)
 *
 * Tests for the memoized calculation engine cache:
 * - Cache key generation
 * - Cache hits and misses
 * - TTL expiration
 * - LRU eviction
 * - Character-specific invalidation
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { CalculationCache } from '@/utils/calculationCache'
import type { Character } from '@/types/character'

// Minimal mock character for testing
function createMockCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-1',
    name: 'Test Character',
    playerName: 'Player',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
    version: 1,
    race: { raceId: 'human', raceName: 'Human' },
    classes: [{ classId: 'fighter', className: 'Fighter', level: 5 }],
    background: { backgroundId: 'soldier', backgroundName: 'Soldier' },
    alignment: 'neutral-good',
    baseAbilityScores: {
      strength: 16,
      dexterity: 14,
      constitution: 14,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    },
    abilityScores: {
      strength: 16,
      dexterity: 14,
      constitution: 14,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
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
    deathSaves: { successes: 0, failures: 0 },
    combatStats: { damageDealt: 0, damageTaken: 0, healingDone: 0 },
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple', 'martial'],
      tools: [],
      languages: ['Common'],
      skills: [],
      savingThrows: ['strength', 'constitution'],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
    feats: [],
    description: {
      age: '25',
      height: '6\'0"',
      weight: '180 lbs',
      eyes: 'brown',
      skin: 'tan',
      hair: 'black',
    },
    personality: {
      traits: ['Brave'],
      ideals: ['Justice'],
      bonds: ['My companions'],
      flaws: ['Stubborn'],
    },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    ...overrides,
  } as Character
}

describe('CalculationCache', () => {
  let cache: CalculationCache

  beforeEach(() => {
    cache = new CalculationCache(10, 60000) // 10 entries, 60s TTL
  })

  // =========================================================================
  // Key generation
  // =========================================================================

  describe('buildKey', () => {
    it('should combine characterId and lastModified', () => {
      const key = CalculationCache.buildKey('char-1', '2024-01-01T12:00:00Z')
      expect(key).toBe('char-1-2024-01-01T12:00:00Z')
    })

    it('should produce different keys for different timestamps', () => {
      const key1 = CalculationCache.buildKey('char-1', '2024-01-01T12:00:00Z')
      const key2 = CalculationCache.buildKey('char-1', '2024-01-02T12:00:00Z')
      expect(key1).not.toBe(key2)
    })

    it('should produce different keys for different characters', () => {
      const key1 = CalculationCache.buildKey('char-1', '2024-01-01T12:00:00Z')
      const key2 = CalculationCache.buildKey('char-2', '2024-01-01T12:00:00Z')
      expect(key1).not.toBe(key2)
    })
  })

  // =========================================================================
  // Cache hits and misses
  // =========================================================================

  describe('getOrCompute', () => {
    it('should compute and cache derived stats on first access', () => {
      const character = createMockCharacter()
      const stats = cache.getOrCompute(character)

      expect(stats).toBeDefined()
      expect(stats.proficiencyBonus).toBe(3) // Level 5
      expect(cache.size).toBe(1)
    })

    it('should return cached result on second access with same timestamp', () => {
      const character = createMockCharacter()
      const stats1 = cache.getOrCompute(character)
      const stats2 = cache.getOrCompute(character)

      expect(stats1).toBe(stats2) // Same reference
      expect(cache.size).toBe(1)
    })

    it('should recompute when character updatedAt changes', () => {
      const character = createMockCharacter()
      const stats1 = cache.getOrCompute(character)

      const updatedCharacter = createMockCharacter({
        updatedAt: '2024-01-02T12:00:00Z',
        level: 10,
      })
      const stats2 = cache.getOrCompute(updatedCharacter)

      expect(stats1).not.toBe(stats2)
      expect(cache.size).toBe(2)
    })
  })

  // =========================================================================
  // has()
  // =========================================================================

  describe('has', () => {
    it('should return true for cached entries', () => {
      const character = createMockCharacter()
      cache.getOrCompute(character)

      expect(cache.has('char-1', '2024-01-01T12:00:00Z')).toBe(true)
    })

    it('should return false for uncached entries', () => {
      expect(cache.has('char-1', '2024-01-01T12:00:00Z')).toBe(false)
    })

    it('should return false for expired entries', () => {
      const shortTTLCache = new CalculationCache(10, 0) // 0ms TTL
      const character = createMockCharacter()
      shortTTLCache.getOrCompute(character)

      // The entry should be expired immediately
      expect(shortTTLCache.has('char-1', '2024-01-01T12:00:00Z')).toBe(false)
    })
  })

  // =========================================================================
  // LRU eviction
  // =========================================================================

  describe('eviction', () => {
    it('should evict oldest entry when at capacity', () => {
      const smallCache = new CalculationCache(3, 60000)

      for (let i = 0; i < 4; i++) {
        const character = createMockCharacter({
          id: `char-${i}`,
          updatedAt: `2024-01-0${i + 1}T12:00:00Z`,
        })
        smallCache.getOrCompute(character)
      }

      // Should only have 3 entries (the oldest was evicted)
      expect(smallCache.size).toBe(3)
    })
  })

  // =========================================================================
  // invalidate
  // =========================================================================

  describe('invalidate', () => {
    it('should remove all entries for a specific character', () => {
      const char1v1 = createMockCharacter({
        id: 'char-1',
        updatedAt: '2024-01-01T12:00:00Z',
      })
      const char1v2 = createMockCharacter({
        id: 'char-1',
        updatedAt: '2024-01-02T12:00:00Z',
      })
      const char2 = createMockCharacter({
        id: 'char-2',
        updatedAt: '2024-01-01T12:00:00Z',
      })

      cache.getOrCompute(char1v1)
      cache.getOrCompute(char1v2)
      cache.getOrCompute(char2)
      expect(cache.size).toBe(3)

      cache.invalidate('char-1')
      expect(cache.size).toBe(1)
      expect(cache.has('char-2', '2024-01-01T12:00:00Z')).toBe(true)
    })
  })

  // =========================================================================
  // clear
  // =========================================================================

  describe('clear', () => {
    it('should remove all cached entries', () => {
      const char = createMockCharacter()
      cache.getOrCompute(char)
      expect(cache.size).toBe(1)

      cache.clear()
      expect(cache.size).toBe(0)
    })
  })
})
