import { api } from '@/lib/api'

/**
 * User preferences stored on the server.
 */
export interface UserPreferences {
  theme: 'dark' | 'light'
  autoSaveEnabled: boolean
  lastActiveCharacterId: string | null
}

/**
 * Fetch the current user's preferences.
 */
export async function getPreferences(): Promise<UserPreferences> {
  const response = await api.get<UserPreferences>('/preferences/')
  return response.data
}

/**
 * Update the current user's preferences (partial update via PUT).
 */
export async function updatePreferences(
  data: Partial<UserPreferences>
): Promise<UserPreferences> {
  const response = await api.put<UserPreferences>('/preferences/', data)
  return response.data
}
