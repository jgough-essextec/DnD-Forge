/**
 * useCampaignCharacters hook (Epic 34)
 *
 * Fetches full Character data for all characters in a campaign.
 * Uses useQueries to batch-fetch individual character details.
 */

import { useQueries } from '@tanstack/react-query'
import { getCharacter } from '@/api/characters'
import { CHARACTER_KEY } from '@/hooks/useCharacters'
import type { Character } from '@/types/character'

/**
 * Fetch full Character objects for all character IDs in a campaign.
 *
 * @param characterIds - Array of character IDs to fetch
 * @returns Object with characters array, loading state, and error state
 */
export function useCampaignCharacters(characterIds: string[]) {
  const results = useQueries({
    queries: characterIds.map((id) => ({
      queryKey: CHARACTER_KEY(id),
      queryFn: () => getCharacter(id),
      enabled: !!id,
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.isError)
  const characters: Character[] = results
    .map((r) => r.data)
    .filter((c): c is Character => c !== undefined)

  return { characters, isLoading, isError }
}
