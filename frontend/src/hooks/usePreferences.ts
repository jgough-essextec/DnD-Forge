import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPreferences, updatePreferences } from '@/api/preferences'
import type { UserPreferences } from '@/api/preferences'

export const PREFERENCES_KEY = ['preferences'] as const

/**
 * Query hook for fetching the current user's preferences.
 */
export function usePreferences() {
  return useQuery({
    queryKey: PREFERENCES_KEY,
    queryFn: getPreferences,
  })
}

/**
 * Mutation hook for updating the current user's preferences.
 * Invalidates the preferences cache on success.
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<UserPreferences>) => updatePreferences(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PREFERENCES_KEY })
    },
  })
}
