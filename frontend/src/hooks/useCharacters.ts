import { useQuery } from '@tanstack/react-query'
import { getCharacters, getCharacter } from '@/api/characters'

export const CHARACTERS_KEY = ['characters'] as const
export const CHARACTER_KEY = (id: string) => ['character', id] as const

/**
 * Query hook for fetching all characters (gallery view).
 */
export function useCharacters() {
  return useQuery({
    queryKey: CHARACTERS_KEY,
    queryFn: getCharacters,
  })
}

/**
 * Query hook for fetching a single character by ID.
 * Disabled when id is null or empty.
 */
export function useCharacter(id: string | null) {
  return useQuery({
    queryKey: CHARACTER_KEY(id ?? ''),
    queryFn: () => getCharacter(id!),
    enabled: !!id,
  })
}
