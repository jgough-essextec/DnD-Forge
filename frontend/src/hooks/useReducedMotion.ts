// =============================================================================
// Story 41.4 -- useReducedMotion Hook
// Detects system prefers-reduced-motion preference and provides an in-app
// toggle override. Returns true when reduced motion should be active.
// =============================================================================

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { usePreferences, useUpdatePreferences } from '@/hooks/usePreferences'

// ---------------------------------------------------------------------------
// System preference detection via useSyncExternalStore
// ---------------------------------------------------------------------------

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function getSystemPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function subscribeToMotionPreference(callback: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {}
  }
  const mql = window.matchMedia(REDUCED_MOTION_QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

/**
 * Hook that detects the system prefers-reduced-motion media query.
 * Returns true if the system preference is set to reduce motion.
 */
export function useSystemReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    getSystemPrefersReducedMotion,
    () => false // server snapshot
  )
}

// ---------------------------------------------------------------------------
// Combined hook: system preference + in-app toggle
// ---------------------------------------------------------------------------

export interface UseReducedMotionReturn {
  /** Whether reduced motion is currently active (system OR in-app) */
  prefersReducedMotion: boolean
  /** The system-level preference */
  systemPreference: boolean
  /** The in-app override value (null = follow system) */
  appOverride: boolean | null
  /** Toggle the in-app override */
  toggleAppOverride: () => void
  /** Set the in-app override explicitly */
  setAppOverride: (value: boolean | null) => void
}

/**
 * Combined reduced motion hook that merges system preference with in-app toggle.
 *
 * Priority: in-app toggle (if set) overrides system preference.
 * The in-app value is persisted to the preferences API.
 */
export function useReducedMotion(): UseReducedMotionReturn {
  const systemPreference = useSystemReducedMotion()
  const { data: preferences } = usePreferences()
  const updatePrefs = useUpdatePreferences()

  // Local state for the in-app override
  const [appOverride, setAppOverrideLocal] = useState<boolean | null>(null)

  // Sync from API preferences on load
  useEffect(() => {
    if (preferences?.reducedMotion !== undefined) {
      setAppOverrideLocal(preferences.reducedMotion)
    }
  }, [preferences])

  // Apply CSS class on the document element
  useEffect(() => {
    const active = appOverride ?? systemPreference
    if (active) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
  }, [appOverride, systemPreference])

  const setAppOverride = useCallback(
    (value: boolean | null) => {
      setAppOverrideLocal(value)
      if (value !== null) {
        updatePrefs.mutate({ reducedMotion: value } as Partial<import('@/api/preferences').UserPreferences>)
      }
    },
    [updatePrefs]
  )

  const toggleAppOverride = useCallback(() => {
    const current = appOverride ?? systemPreference
    setAppOverride(!current)
  }, [appOverride, systemPreference, setAppOverride])

  return {
    prefersReducedMotion: appOverride ?? systemPreference,
    systemPreference,
    appOverride,
    toggleAppOverride,
    setAppOverride,
  }
}
