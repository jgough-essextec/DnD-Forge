// =============================================================================
// Story 41.3 -- useHighContrast Hook
// Manages high contrast mode toggle with API persistence.
// Applies/removes the .high-contrast CSS class on the document element.
// =============================================================================

import { useCallback, useEffect, useState } from 'react'
import { usePreferences, useUpdatePreferences } from '@/hooks/usePreferences'

export interface UseHighContrastReturn {
  /** Whether high contrast mode is currently active */
  highContrast: boolean
  /** Toggle high contrast mode on/off */
  toggleHighContrast: () => void
  /** Set high contrast mode explicitly */
  setHighContrast: (value: boolean) => void
}

/**
 * Hook for managing high contrast mode.
 *
 * - Reads initial value from user preferences API
 * - Applies .high-contrast CSS class on document element
 * - Persists changes back to the API
 */
export function useHighContrast(): UseHighContrastReturn {
  const { data: preferences } = usePreferences()
  const updatePrefs = useUpdatePreferences()
  const [highContrast, setHighContrastLocal] = useState(false)

  // Sync from API preferences on load
  useEffect(() => {
    if (preferences?.highContrast !== undefined) {
      setHighContrastLocal(preferences.highContrast)
    }
  }, [preferences])

  // Apply/remove CSS class on document element
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [highContrast])

  const setHighContrast = useCallback(
    (value: boolean) => {
      setHighContrastLocal(value)
      updatePrefs.mutate({ highContrast: value } as Partial<import('@/api/preferences').UserPreferences>)
    },
    [updatePrefs]
  )

  const toggleHighContrast = useCallback(() => {
    setHighContrast(!highContrast)
  }, [highContrast, setHighContrast])

  return {
    highContrast,
    toggleHighContrast,
    setHighContrast,
  }
}
