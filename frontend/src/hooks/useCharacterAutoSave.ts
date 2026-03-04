/**
 * useCharacterAutoSave Hook (Story 20.2)
 *
 * Auto-saves character data with a configurable debounce (default 500ms).
 * Uses the existing useUpdateCharacter mutation for PATCH /api/characters/:id.
 *
 * Features:
 * - Configurable debounce interval
 * - Save status tracking: idle | saving | saved | error
 * - lastSavedAt timestamp
 * - beforeunload handler warning on unsaved changes
 * - Emergency sessionStorage backup on save failure
 * - Retry logic on error (up to 3 attempts)
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useUpdateCharacter } from './useCharacterMutations'
import type { Character } from '@/types/character'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CharacterAutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface UseCharacterAutoSaveOptions {
  /** Debounce interval in milliseconds (default: 500) */
  debounceMs?: number
  /** Maximum retry attempts on failure (default: 3) */
  maxRetries?: number
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean
}

export interface UseCharacterAutoSaveReturn {
  /** Current save status */
  status: CharacterAutoSaveStatus
  /** Timestamp of last successful save */
  lastSavedAt: Date | null
  /** Manually trigger a save */
  saveNow: () => void
  /** Manually retry a failed save */
  retry: () => void
  /** Whether there are pending unsaved changes */
  hasPendingChanges: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_DEBOUNCE_MS = 500
const DEFAULT_MAX_RETRIES = 3
const EMERGENCY_SAVE_KEY_PREFIX = 'dnd-forge-emergency-save-'

// ---------------------------------------------------------------------------
// Emergency save helpers
// ---------------------------------------------------------------------------

/**
 * Serialize character data for sessionStorage emergency backup.
 */
export function serializeForEmergencySave(
  characterId: string,
  data: Partial<Character>
): string {
  return JSON.stringify({
    characterId,
    data,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Save character data to sessionStorage as an emergency backup.
 */
function emergencySave(characterId: string, data: Partial<Character>): void {
  try {
    const key = `${EMERGENCY_SAVE_KEY_PREFIX}${characterId}`
    sessionStorage.setItem(key, serializeForEmergencySave(characterId, data))
  } catch {
    // sessionStorage may be full or unavailable; nothing we can do
  }
}

/**
 * Clear emergency backup for a character.
 */
function clearEmergencySave(characterId: string): void {
  try {
    sessionStorage.removeItem(`${EMERGENCY_SAVE_KEY_PREFIX}${characterId}`)
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCharacterAutoSave(
  characterId: string,
  characterData: Partial<Character>,
  options: UseCharacterAutoSaveOptions = {}
): UseCharacterAutoSaveReturn {
  const {
    debounceMs = DEFAULT_DEBOUNCE_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    enabled = true,
  } = options

  const [status, setStatus] = useState<CharacterAutoSaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)

  const updateCharacter = useUpdateCharacter()
  const mutateRef = useRef(updateCharacter.mutateAsync)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousDataRef = useRef<string>('')
  const retryCountRef = useRef(0)
  const pendingDataRef = useRef<Partial<Character>>({})
  const abortRef = useRef(false)
  const statusRef = useRef<CharacterAutoSaveStatus>('idle')
  const maxRetriesRef = useRef(maxRetries)

  // Keep refs in sync
  useEffect(() => {
    mutateRef.current = updateCharacter.mutateAsync
  }, [updateCharacter.mutateAsync])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    maxRetriesRef.current = maxRetries
  }, [maxRetries])

  const performSave = useCallback(
    async (data: Partial<Character>) => {
      if (!characterId || abortRef.current) return

      setStatus('saving')
      setHasPendingChanges(false)

      try {
        await mutateRef.current({ id: characterId, data })

        if (!abortRef.current) {
          setStatus('saved')
          setLastSavedAt(new Date())
          retryCountRef.current = 0
          clearEmergencySave(characterId)
        }
      } catch {
        if (abortRef.current) return

        // Emergency backup
        emergencySave(characterId, data)

        if (retryCountRef.current < maxRetriesRef.current) {
          retryCountRef.current++
          // Exponential backoff: 1s, 2s, 4s
          const backoffMs = Math.pow(2, retryCountRef.current - 1) * 1000
          timerRef.current = setTimeout(() => {
            void performSave(data)
          }, backoffMs)
        } else {
          setStatus('error')
          setHasPendingChanges(true)
        }
      }
    },
    [characterId]
  )

  // Serialize character data for comparison (stable dep for useEffect)
  const serializedData = JSON.stringify(characterData)

  // Keep a ref to the latest data for use in the timer callback
  const characterDataRef = useRef(characterData)
  useEffect(() => {
    characterDataRef.current = characterData
  }, [characterData])

  // Watch for data changes and debounce saves
  useEffect(() => {
    if (!enabled || !characterId) return

    // Skip if data hasn't changed
    if (serializedData === previousDataRef.current) return
    previousDataRef.current = serializedData

    // Skip empty / default case
    if (serializedData === '{}') return

    // Store pending data for manual saves and retries
    pendingDataRef.current = characterDataRef.current
    setHasPendingChanges(true)

    // Reset retry count on new changes
    retryCountRef.current = 0

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      void performSave(characterDataRef.current)
    }, debounceMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedData, characterId, debounceMs, enabled, performSave])

  // Manual save
  const saveNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    void performSave(pendingDataRef.current)
  }, [performSave])

  // Retry failed save
  const retry = useCallback(() => {
    retryCountRef.current = 0
    void performSave(pendingDataRef.current)
  }, [performSave])

  // beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (statusRef.current === 'saving' || hasPendingChanges) {
        e.preventDefault()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasPendingChanges])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return {
    status,
    lastSavedAt,
    saveNow,
    retry,
    hasPendingChanges,
  }
}
