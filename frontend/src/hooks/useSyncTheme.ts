import { useEffect } from 'react'
import { usePreferences } from './usePreferences'
import { useUIStore } from '@/stores/uiStore'

/**
 * Hook that synchronizes the theme from server-side preferences
 * to the local UI store on data arrival.
 */
export function useSyncTheme(): void {
  const { data: preferences } = usePreferences()
  const setTheme = useUIStore((state) => state.setTheme)

  useEffect(() => {
    if (preferences?.theme) {
      setTheme(preferences.theme)
    }
  }, [preferences?.theme, setTheme])
}
