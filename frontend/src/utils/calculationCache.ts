/**
 * Calculation Engine Cache (Story 42.3)
 *
 * Memoization layer for the character calculation engine.
 * Caches computed DerivedStats keyed on characterId + lastModified timestamp.
 * Automatically invalidates when character data changes.
 */

import type { DerivedStats } from '@/hooks/useCharacterCalculations'
import type { Character } from '@/types/character'
import { computeDerivedStats } from '@/hooks/useCharacterCalculations'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CacheEntry {
  key: string
  stats: DerivedStats
  timestamp: number
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const DEFAULT_MAX_SIZE = 50
const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * LRU-ish calculation cache for derived character stats.
 */
export class CalculationCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize: number
  private ttlMs: number

  constructor(maxSize = DEFAULT_MAX_SIZE, ttlMs = DEFAULT_TTL_MS) {
    this.maxSize = maxSize
    this.ttlMs = ttlMs
  }

  /**
   * Build a cache key from character ID and last-modified timestamp.
   */
  static buildKey(characterId: string, lastModified: string): string {
    return `${characterId}-${lastModified}`
  }

  /**
   * Get cached derived stats for a character, or compute and cache them.
   */
  getOrCompute(character: Character): DerivedStats {
    const key = CalculationCache.buildKey(character.id, character.updatedAt)

    // Check cache
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.ttlMs) {
      return cached.stats
    }

    // Compute fresh
    const stats = computeDerivedStats(character)

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, { key, stats, timestamp: Date.now() })
    return stats
  }

  /**
   * Check if a cache entry exists for the given key.
   */
  has(characterId: string, lastModified: string): boolean {
    const key = CalculationCache.buildKey(characterId, lastModified)
    const entry = this.cache.get(key)
    if (!entry) return false
    if (Date.now() - entry.timestamp >= this.ttlMs) {
      this.cache.delete(key)
      return false
    }
    return true
  }

  /**
   * Invalidate a specific character's cache entry.
   */
  invalidate(characterId: string): void {
    for (const [key] of this.cache) {
      if (key.startsWith(`${characterId}-`)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get the current cache size.
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * Clear the entire cache.
   */
  clear(): void {
    this.cache.clear()
  }
}

/** Singleton cache instance for the application */
export const calculationCache = new CalculationCache()
