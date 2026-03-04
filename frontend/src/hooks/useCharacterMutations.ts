import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCharacter, updateCharacter, deleteCharacter } from '@/api/characters'
import { CHARACTERS_KEY, CHARACTER_KEY } from './useCharacters'
import type { Character, CreateCharacterData } from '@/types/character'

/**
 * Mutation hook for creating a new character.
 * Invalidates the characters list on success.
 */
export function useCreateCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCharacterData) => createCharacter(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHARACTERS_KEY })
    },
  })
}

/**
 * Mutation hook for updating an existing character.
 * Invalidates both the characters list and the individual character query on success.
 */
export function useUpdateCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Character> }) =>
      updateCharacter(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: CHARACTERS_KEY })
      void queryClient.invalidateQueries({ queryKey: CHARACTER_KEY(variables.id) })
    },
  })
}

/**
 * Mutation hook for deleting a character.
 * Invalidates the characters list on success.
 */
export function useDeleteCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCharacter(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHARACTERS_KEY })
    },
  })
}
