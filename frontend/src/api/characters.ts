import { api } from '@/lib/api'
import type { Character, CharacterSummary, CreateCharacterData } from '@/types/character'

/**
 * Fetch all characters for the current user (gallery view).
 */
export async function getCharacters(): Promise<CharacterSummary[]> {
  const response = await api.get<CharacterSummary[]>('/characters/')
  return response.data
}

/**
 * Fetch a single character by ID (full detail).
 */
export async function getCharacter(id: string): Promise<Character> {
  const response = await api.get<Character>(`/characters/${id}/`)
  return response.data
}

/**
 * Create a new character.
 */
export async function createCharacter(data: CreateCharacterData): Promise<Character> {
  const response = await api.post<Character>('/characters/', data)
  return response.data
}

/**
 * Partially update an existing character.
 */
export async function updateCharacter(id: string, data: Partial<Character>): Promise<Character> {
  const response = await api.patch<Character>(`/characters/${id}/`, data)
  return response.data
}

/**
 * Delete a character by ID.
 */
export async function deleteCharacter(id: string): Promise<void> {
  await api.delete(`/characters/${id}/`)
}
