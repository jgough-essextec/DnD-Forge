/**
 * EditModeContext (Story 20.1)
 *
 * React context providing edit mode state to all character sheet children.
 * Wraps the useEditMode hook and exposes mode state, dirty flag,
 * and character data to descendant components.
 */

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import {
  useEditMode,
  type UseEditModeReturn,
  type UseEditModeOptions,
} from '@/hooks/useEditMode'
import type { Character } from '@/types/character'

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

export interface EditModeContextValue extends UseEditModeReturn {
  /** The character data being viewed/edited */
  character: Character | null
}

const EditModeContext = createContext<EditModeContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface EditModeProviderProps {
  children: ReactNode
  character: Character | null
  options?: UseEditModeOptions
}

export function EditModeProvider({
  children,
  character,
  options = {},
}: EditModeProviderProps) {
  const editMode = useEditMode({
    characterId: character?.id,
    ...options,
  })

  return (
    <EditModeContext.Provider value={{ ...editMode, character }}>
      {children}
    </EditModeContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Consumer hook
// ---------------------------------------------------------------------------

/**
 * Access the edit mode context from a descendant component.
 * Throws if used outside an EditModeProvider.
 */
export function useEditModeContext(): EditModeContextValue {
  const context = useContext(EditModeContext)
  if (!context) {
    throw new Error(
      'useEditModeContext must be used within an EditModeProvider'
    )
  }
  return context
}
