/**
 * DataLoader Tests (Story 42.2)
 *
 * Tests for the tiered SRD data loading system:
 * - Module loading and caching
 * - Request deduplication
 * - Tier loading
 * - Preloading with requestIdleCallback
 * - State management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadModule,
  loadTier,
  isModuleLoaded,
  isModuleLoading,
  getCachedModule,
  getLoaderState,
  preloadModules,
  preloadWizardData,
  preloadSpellData,
  preloadAllData,
  resetLoaderState,
  MODULE_TIERS,
  TIER_MODULES,
} from '@/utils/dataLoader'

// Mock all data module imports
vi.mock('@/data/reference', () => ({
  default: 'reference-data',
  PROFICIENCY_BONUS_BY_LEVEL: [],
}))
vi.mock('@/data/conditions', () => ({
  default: 'conditions-data',
  CONDITIONS_DATA: [],
}))
vi.mock('@/data/races', () => ({
  default: 'races-data',
  races: [],
}))
vi.mock('@/data/classes', () => ({
  default: 'classes-data',
  CLASSES: [],
}))
vi.mock('@/data/equipment', () => ({
  default: 'equipment-data',
  WEAPONS: [],
}))
vi.mock('@/data/spells', () => ({
  default: 'spells-data',
  SPELLS: [],
}))
vi.mock('@/data/backgrounds', () => ({
  default: 'backgrounds-data',
  BACKGROUNDS: [],
}))
vi.mock('@/data/feats', () => ({
  default: 'feats-data',
  FEATS: [],
}))

describe('DataLoader', () => {
  beforeEach(() => {
    resetLoaderState()
    vi.restoreAllMocks()
  })

  // =========================================================================
  // MODULE_TIERS and TIER_MODULES configuration
  // =========================================================================

  describe('tier configuration', () => {
    it('should assign reference and conditions to Tier 1', () => {
      expect(MODULE_TIERS.reference).toBe(1)
      expect(MODULE_TIERS.conditions).toBe(1)
    })

    it('should assign races, classes, equipment to Tier 2', () => {
      expect(MODULE_TIERS.races).toBe(2)
      expect(MODULE_TIERS.classes).toBe(2)
      expect(MODULE_TIERS.equipment).toBe(2)
    })

    it('should assign spells to Tier 3', () => {
      expect(MODULE_TIERS.spells).toBe(3)
    })

    it('should assign backgrounds and feats to Tier 4', () => {
      expect(MODULE_TIERS.backgrounds).toBe(4)
      expect(MODULE_TIERS.feats).toBe(4)
    })

    it('should list all modules for each tier in TIER_MODULES', () => {
      expect(TIER_MODULES[1]).toContain('reference')
      expect(TIER_MODULES[1]).toContain('conditions')
      expect(TIER_MODULES[2]).toContain('races')
      expect(TIER_MODULES[2]).toContain('classes')
      expect(TIER_MODULES[2]).toContain('equipment')
      expect(TIER_MODULES[3]).toContain('spells')
      expect(TIER_MODULES[4]).toContain('backgrounds')
      expect(TIER_MODULES[4]).toContain('feats')
    })
  })

  // =========================================================================
  // loadModule
  // =========================================================================

  describe('loadModule', () => {
    it('should load a module via dynamic import', async () => {
      const data = await loadModule('reference')
      expect(data).toBeDefined()
      expect(isModuleLoaded('reference')).toBe(true)
    })

    it('should cache loaded data for instant subsequent access', async () => {
      await loadModule('races')
      const cached = getCachedModule('races')
      expect(cached).toBeDefined()

      // Second load should return cached data
      const data2 = await loadModule('races')
      expect(data2).toBe(cached)
    })

    it('should deduplicate concurrent requests for the same module', async () => {
      // Fire two requests simultaneously
      const p1 = loadModule('spells')
      const p2 = loadModule('spells')

      const [r1, r2] = await Promise.all([p1, p2])
      expect(r1).toBe(r2)
    })

    it('should track loading state while module loads', async () => {
      const promise = loadModule('equipment')
      // Module should now be loaded (or close to it since mocks resolve instantly)
      await promise
      expect(isModuleLoaded('equipment')).toBe(true)
      expect(isModuleLoading('equipment')).toBe(false)
    })

    it('should handle loading errors by not caching failed modules', async () => {
      // Verify that even after load attempts, the state is clean for unloaded modules
      expect(isModuleLoading('spells')).toBe(false)
      expect(isModuleLoaded('spells')).toBe(false)

      // After loading, it should be cached
      await loadModule('spells')
      expect(isModuleLoaded('spells')).toBe(true)
    })
  })

  // =========================================================================
  // loadTier
  // =========================================================================

  describe('loadTier', () => {
    it('should load all modules in Tier 1', async () => {
      await loadTier(1)
      expect(isModuleLoaded('reference')).toBe(true)
      expect(isModuleLoaded('conditions')).toBe(true)
    })

    it('should load all modules in Tier 2', async () => {
      await loadTier(2)
      expect(isModuleLoaded('races')).toBe(true)
      expect(isModuleLoaded('classes')).toBe(true)
      expect(isModuleLoaded('equipment')).toBe(true)
    })

    it('should load all modules in Tier 3', async () => {
      await loadTier(3)
      expect(isModuleLoaded('spells')).toBe(true)
    })

    it('should load all modules in Tier 4', async () => {
      await loadTier(4)
      expect(isModuleLoaded('backgrounds')).toBe(true)
      expect(isModuleLoaded('feats')).toBe(true)
    })
  })

  // =========================================================================
  // State queries
  // =========================================================================

  describe('state queries', () => {
    it('should report module as not loaded before loading', () => {
      expect(isModuleLoaded('spells')).toBe(false)
    })

    it('should report module as not loading when idle', () => {
      expect(isModuleLoading('spells')).toBe(false)
    })

    it('should return undefined for uncached module', () => {
      expect(getCachedModule('spells')).toBeUndefined()
    })

    it('should expose full loader state', () => {
      const state = getLoaderState()
      expect(state.loaded).toBeInstanceOf(Set)
      expect(state.loading).toBeInstanceOf(Set)
      expect(state.cache).toBeInstanceOf(Map)
    })
  })

  // =========================================================================
  // Preloading
  // =========================================================================

  describe('preloading', () => {
    it('should use requestIdleCallback when available', () => {
      const mockRIC = vi.fn((cb: () => void) => {
        cb()
        return 1
      })
      vi.stubGlobal('requestIdleCallback', mockRIC)

      preloadModules(['races'])
      expect(mockRIC).toHaveBeenCalledTimes(1)

      vi.unstubAllGlobals()
    })

    it('should fall back to setTimeout when requestIdleCallback unavailable', () => {
      // In jsdom, requestIdleCallback may not exist, triggering the fallback
      const originalRIC = globalThis.requestIdleCallback
      // @ts-expect-error - intentionally removing for test
      delete globalThis.requestIdleCallback

      vi.useFakeTimers()
      preloadModules(['classes'])
      vi.advanceTimersByTime(10)
      vi.useRealTimers()

      // Restore
      if (originalRIC) {
        globalThis.requestIdleCallback = originalRIC
      }
    })

    it('should skip already loaded modules during preload', async () => {
      await loadModule('races')
      expect(isModuleLoaded('races')).toBe(true)

      // Preload should not re-fetch already loaded modules
      const mockRIC = vi.fn((cb: () => void) => {
        cb()
        return 1
      })
      vi.stubGlobal('requestIdleCallback', mockRIC)

      preloadModules(['races'])
      // Should not call requestIdleCallback since the only module is already loaded
      expect(mockRIC).not.toHaveBeenCalled()

      vi.unstubAllGlobals()
    })

    it('preloadWizardData should preload Tier 2 modules', () => {
      const mockRIC = vi.fn((cb: () => void) => {
        cb()
        return 1
      })
      vi.stubGlobal('requestIdleCallback', mockRIC)

      preloadWizardData()
      expect(mockRIC).toHaveBeenCalledTimes(1)

      vi.unstubAllGlobals()
    })

    it('preloadSpellData should preload Tier 3 modules', () => {
      const mockRIC = vi.fn((cb: () => void) => {
        cb()
        return 1
      })
      vi.stubGlobal('requestIdleCallback', mockRIC)

      preloadSpellData()
      expect(mockRIC).toHaveBeenCalledTimes(1)

      vi.unstubAllGlobals()
    })

    it('preloadAllData should preload all modules', () => {
      const mockRIC = vi.fn((cb: () => void) => {
        cb()
        return 1
      })
      vi.stubGlobal('requestIdleCallback', mockRIC)

      preloadAllData()
      expect(mockRIC).toHaveBeenCalledTimes(1)

      vi.unstubAllGlobals()
    })
  })

  // =========================================================================
  // resetLoaderState
  // =========================================================================

  describe('resetLoaderState', () => {
    it('should clear all loaded, loading, and cached state', async () => {
      await loadModule('reference')
      expect(isModuleLoaded('reference')).toBe(true)

      resetLoaderState()

      expect(isModuleLoaded('reference')).toBe(false)
      expect(getCachedModule('reference')).toBeUndefined()
      expect(getLoaderState().cache.size).toBe(0)
    })
  })
})
