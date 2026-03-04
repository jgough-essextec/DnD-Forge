import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { updateCharacter } from '@/api/characters'
import { CHARACTER_KEY, CHARACTERS_KEY } from './useCharacters'
import type { Character } from '@/types/character'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveResult {
  status: AutoSaveStatus
  lastSavedAt: Date | null
}

const AUTO_SAVE_DEBOUNCE_MS = 2000

/**
 * Hook that auto-saves character data with a 2-second debounce,
 * optimistic cache updates, and rollback on error.
 */
export function useAutoSave(
  characterId: string,
  characterData: Partial<Character>
): UseAutoSaveResult {
  const [status, setStatus] = useState<AutoSaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const queryClient = useQueryClient()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousDataRef = useRef<string>('')
  const abortRef = useRef(false)

  const save = useCallback(
    async (data: Partial<Character>) => {
      if (!characterId) return

      setStatus('saving')

      // Capture previous cache data for rollback
      const previousCharacter = queryClient.getQueryData<Character>(
        CHARACTER_KEY(characterId)
      )

      // Optimistic update
      if (previousCharacter) {
        queryClient.setQueryData<Character>(CHARACTER_KEY(characterId), {
          ...previousCharacter,
          ...data,
        })
      }

      try {
        await updateCharacter(characterId, data)
        if (!abortRef.current) {
          setStatus('saved')
          setLastSavedAt(new Date())
          void queryClient.invalidateQueries({ queryKey: CHARACTERS_KEY })
          void queryClient.invalidateQueries({ queryKey: CHARACTER_KEY(characterId) })
        }
      } catch {
        if (!abortRef.current) {
          // Rollback on error
          if (previousCharacter) {
            queryClient.setQueryData<Character>(
              CHARACTER_KEY(characterId),
              previousCharacter
            )
          }
          setStatus('error')
        }
      }
    },
    [characterId, queryClient]
  )

  useEffect(() => {
    const serialized = JSON.stringify(characterData)

    // Skip if data hasn't actually changed
    if (serialized === previousDataRef.current) return
    previousDataRef.current = serialized

    // Skip the empty / default case
    if (serialized === '{}') return

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      void save(characterData)
    }, AUTO_SAVE_DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [characterData, save])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return { status, lastSavedAt }
}
