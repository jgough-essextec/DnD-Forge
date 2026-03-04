/**
 * DataLoader Utility (Story 42.2)
 *
 * Tiered SRD data loading system that lazy-loads game data on demand.
 * - Tier 1 (always loaded, ~50KB): core reference tables, race/class names
 * - Tier 2 (on demand, ~200KB): full race details, class features, equipment
 * - Tier 3 (on demand, ~500KB): spells
 * - Tier 4 (on demand, ~300KB): backgrounds, feats
 *
 * Features:
 * - Dynamic import() for lazy tiers
 * - In-memory cache for instant subsequent access
 * - Request deduplication for concurrent loads
 * - requestIdleCallback for preloading anticipated navigation
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DataTier = 1 | 2 | 3 | 4

export type DataModule =
  | 'reference'
  | 'races'
  | 'classes'
  | 'equipment'
  | 'spells'
  | 'backgrounds'
  | 'feats'
  | 'conditions'

export interface DataLoaderState {
  /** Which modules have been loaded */
  loaded: Set<DataModule>
  /** Which modules are currently loading */
  loading: Set<DataModule>
  /** Cached module data */
  cache: Map<DataModule, unknown>
}

/** Map data modules to their loading tiers */
export const MODULE_TIERS: Record<DataModule, DataTier> = {
  reference: 1,
  conditions: 1,
  races: 2,
  classes: 2,
  equipment: 2,
  spells: 3,
  backgrounds: 4,
  feats: 4,
}

/** Modules that belong to each tier */
export const TIER_MODULES: Record<DataTier, DataModule[]> = {
  1: ['reference', 'conditions'],
  2: ['races', 'classes', 'equipment'],
  3: ['spells'],
  4: ['backgrounds', 'feats'],
}

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

const state: DataLoaderState = {
  loaded: new Set<DataModule>(),
  loading: new Set<DataModule>(),
  cache: new Map<DataModule, unknown>(),
}

/** In-flight promises for request deduplication */
const inflight = new Map<DataModule, Promise<unknown>>()

// ---------------------------------------------------------------------------
// Dynamic import map
// ---------------------------------------------------------------------------

const importers: Record<DataModule, () => Promise<unknown>> = {
  reference: () => import('@/data/reference'),
  conditions: () => import('@/data/conditions'),
  races: () => import('@/data/races'),
  classes: () => import('@/data/classes'),
  equipment: () => import('@/data/equipment'),
  spells: () => import('@/data/spells'),
  backgrounds: () => import('@/data/backgrounds'),
  feats: () => import('@/data/feats'),
}

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

/**
 * Load a specific data module. Returns cached data if already loaded.
 * Deduplicates concurrent requests for the same module.
 */
export async function loadModule<T = unknown>(module: DataModule): Promise<T> {
  // Return from cache if available
  if (state.cache.has(module)) {
    return state.cache.get(module) as T
  }

  // Deduplicate in-flight requests
  if (inflight.has(module)) {
    return inflight.get(module) as Promise<T>
  }

  state.loading.add(module)

  const promise = importers[module]()
    .then((mod) => {
      const data = mod as T
      state.cache.set(module, data)
      state.loaded.add(module)
      state.loading.delete(module)
      inflight.delete(module)
      return data
    })
    .catch((err) => {
      state.loading.delete(module)
      inflight.delete(module)
      throw err
    })

  inflight.set(module, promise)
  return promise as Promise<T>
}

/**
 * Load all modules in a given tier.
 */
export async function loadTier(tier: DataTier): Promise<void> {
  const modules = TIER_MODULES[tier]
  await Promise.all(modules.map((m) => loadModule(m)))
}

/**
 * Check if a module has been loaded and cached.
 */
export function isModuleLoaded(module: DataModule): boolean {
  return state.loaded.has(module)
}

/**
 * Check if a module is currently loading.
 */
export function isModuleLoading(module: DataModule): boolean {
  return state.loading.has(module)
}

/**
 * Get cached data for a module, or undefined if not yet loaded.
 */
export function getCachedModule<T = unknown>(module: DataModule): T | undefined {
  return state.cache.get(module) as T | undefined
}

/**
 * Get the current loader state (for testing and debugging).
 */
export function getLoaderState(): Readonly<DataLoaderState> {
  return state
}

// ---------------------------------------------------------------------------
// Preloading
// ---------------------------------------------------------------------------

/**
 * Preload modules using requestIdleCallback to avoid blocking the main thread.
 * Falls back to setTimeout if requestIdleCallback is not available.
 */
export function preloadModules(modules: DataModule[]): void {
  const unloaded = modules.filter((m) => !state.loaded.has(m) && !inflight.has(m))
  if (unloaded.length === 0) return

  const scheduleIdle =
    typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? window.requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 1)

  scheduleIdle(() => {
    for (const module of unloaded) {
      loadModule(module).catch(() => {
        // Silently ignore preload failures
      })
    }
  })
}

/**
 * Preload Tier 2 data (for wizard navigation).
 */
export function preloadWizardData(): void {
  preloadModules(['races', 'classes', 'equipment'])
}

/**
 * Preload Tier 3 spell data (for caster character sheets).
 */
export function preloadSpellData(): void {
  preloadModules(['spells'])
}

/**
 * Preload all SRD data tiers.
 */
export function preloadAllData(): void {
  preloadModules([
    'reference',
    'conditions',
    'races',
    'classes',
    'equipment',
    'spells',
    'backgrounds',
    'feats',
  ])
}

// ---------------------------------------------------------------------------
// Reset (for testing)
// ---------------------------------------------------------------------------

/**
 * Reset all loader state. Only intended for use in tests.
 */
export function resetLoaderState(): void {
  state.loaded.clear()
  state.loading.clear()
  state.cache.clear()
  inflight.clear()
}
