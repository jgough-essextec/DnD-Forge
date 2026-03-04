/**
 * CharacterSheetProvider (Story 20.4)
 *
 * Composite context provider that composes all Epic 20 systems:
 * - Fetches character via useCharacter
 * - Provides edit mode context
 * - Provides auto-save
 * - Provides undo/redo
 * - Provides derived calculations
 *
 * Single provider wrapping the character sheet page.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useCharacter } from '@/hooks/useCharacters'
import {
  useEditMode,
  type UseEditModeReturn,
} from '@/hooks/useEditMode'
import {
  useCharacterAutoSave,
  type CharacterAutoSaveStatus,
} from '@/hooks/useCharacterAutoSave'
import {
  useUndoRedo,
  type UseUndoRedoReturn,
} from '@/hooks/useUndoRedo'
import {
  useCharacterCalculations,
  type DerivedStats,
  EMPTY_DERIVED_STATS,
} from '@/hooks/useCharacterCalculations'
import type { Character } from '@/types/character'

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

export interface CharacterSheetContextValue {
  /** The character data (fetched from API) */
  character: Character | null
  /** Whether the character is loading */
  isLoading: boolean
  /** Error from fetching */
  error: Error | null
  /** Local editable character state */
  editableCharacter: Partial<Character>
  /** Update a field on the local editable character */
  updateField: <K extends keyof Character>(field: K, value: Character[K]) => void
  /** Replace the entire editable character state */
  setEditableCharacter: (data: Partial<Character>) => void
  /** Edit mode state and actions */
  editMode: UseEditModeReturn
  /** Auto-save status */
  saveStatus: CharacterAutoSaveStatus
  /** Timestamp of last successful save */
  lastSavedAt: Date | null
  /** Whether there are pending unsaved changes */
  hasPendingChanges: boolean
  /** Manually trigger save */
  saveNow: () => void
  /** Retry a failed save */
  retrySave: () => void
  /** Undo/redo state and actions */
  undoRedo: UseUndoRedoReturn
  /** All computed derived stats */
  derivedStats: DerivedStats
}

const CharacterSheetContext = createContext<CharacterSheetContextValue | null>(
  null
)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface CharacterSheetProviderProps {
  children: ReactNode
  characterId: string
}

export function CharacterSheetProvider({
  children,
  characterId,
}: CharacterSheetProviderProps) {
  // 1. Fetch character data
  const {
    data: character,
    isLoading,
    error,
  } = useCharacter(characterId)

  // 2. Local editable state
  const [editableCharacter, setEditableCharacter] = useState<Partial<Character>>({})
  const prevCharacterRef = useRef<string>('')

  // Sync local state when character is fetched/refetched
  useEffect(() => {
    if (character) {
      const serialized = JSON.stringify(character)
      if (serialized !== prevCharacterRef.current) {
        prevCharacterRef.current = serialized
        setEditableCharacter(character)
      }
    }
  }, [character])

  // 3. Edit mode
  const editMode = useEditMode({
    characterId,
  })

  // Track dirty state: compare editable with original
  useEffect(() => {
    if (!character) return
    const isDirty =
      JSON.stringify(editableCharacter) !== JSON.stringify(character)
    editMode.setDirty(isDirty)
  }, [editableCharacter, character, editMode])

  // 4. Auto-save (only when editing and data has changed from server state)
  const autoSaveData =
    editMode.isEditing && editMode.isDirty ? editableCharacter : {}
  const {
    status: saveStatus,
    lastSavedAt,
    hasPendingChanges,
    saveNow,
    retry: retrySave,
  } = useCharacterAutoSave(characterId, autoSaveData)

  // 5. Undo/redo
  const undoRedo = useUndoRedo({
    enabled: editMode.isEditing,
    onRestore: (state) => {
      setEditableCharacter(state)
    },
  })

  // Push snapshot before auto-save fires (when save status transitions to saving)
  const prevSaveStatusRef = useRef<CharacterAutoSaveStatus>('idle')
  useEffect(() => {
    if (
      prevSaveStatusRef.current !== 'saving' &&
      saveStatus === 'saving' &&
      editMode.isEditing
    ) {
      // Push the current state as a snapshot before saving
      undoRedo.pushSnapshot(editableCharacter)
    }
    prevSaveStatusRef.current = saveStatus
  }, [saveStatus, editableCharacter, editMode.isEditing, undoRedo])

  // 6. Derived calculations
  const fullCharacter =
    character && editableCharacter
      ? ({ ...character, ...editableCharacter } as Character)
      : character ?? null

  const derivedStats = useCharacterCalculations(fullCharacter)

  // 7. Field update helper
  const updateField = useCallback(
    <K extends keyof Character>(field: K, value: Character[K]) => {
      setEditableCharacter((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const contextValue: CharacterSheetContextValue = {
    character: character ?? null,
    isLoading,
    error: error as Error | null,
    editableCharacter,
    updateField,
    setEditableCharacter,
    editMode,
    saveStatus,
    lastSavedAt,
    hasPendingChanges,
    saveNow,
    retrySave,
    undoRedo,
    derivedStats: derivedStats ?? EMPTY_DERIVED_STATS,
  }

  return (
    <CharacterSheetContext.Provider value={contextValue}>
      {children}
    </CharacterSheetContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * Access the character sheet context from a descendant component.
 * Throws if used outside a CharacterSheetProvider.
 */
export function useCharacterSheet(): CharacterSheetContextValue {
  const context = useContext(CharacterSheetContext)
  if (!context) {
    throw new Error(
      'useCharacterSheet must be used within a CharacterSheetProvider'
    )
  }
  return context
}
