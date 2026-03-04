/**
 * useEditMode Hook (Story 20.1)
 *
 * Manages the view/edit mode state for the character sheet.
 * Provides toggle, enter/exit functions, dirty state tracking,
 * URL synchronization, and keyboard shortcut handling.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------

/**
 * Detect whether the current platform uses Cmd (macOS) or Ctrl.
 */
export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent)
}

// ---------------------------------------------------------------------------
// Dirty state helper
// ---------------------------------------------------------------------------

/**
 * Determine if there are unsaved changes given a dirty flag.
 */
export function hasUnsavedChanges(isDirty: boolean): boolean {
  return isDirty
}

// ---------------------------------------------------------------------------
// Hook interface
// ---------------------------------------------------------------------------

export interface UseEditModeOptions {
  /** Character ID for URL sync */
  characterId?: string
  /** Callback invoked when requesting to exit edit mode with unsaved changes */
  onConfirmExit?: () => boolean
  /** Called when mode changes */
  onModeChange?: (isEditing: boolean) => void
}

export interface UseEditModeReturn {
  /** Whether edit mode is currently active */
  isEditing: boolean
  /** Whether there are unsaved changes */
  isDirty: boolean
  /** Toggle between view and edit mode */
  toggleMode: () => void
  /** Enter edit mode */
  enterEditMode: () => void
  /** Exit edit mode (checks dirty state) */
  exitEditMode: () => void
  /** Mark state as dirty (unsaved changes exist) */
  setDirty: (dirty: boolean) => void
}

// ---------------------------------------------------------------------------
// First-time help banner localStorage key
// ---------------------------------------------------------------------------

export const EDIT_MODE_HELP_DISMISSED_KEY = 'dnd-forge-edit-help-dismissed'

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useEditMode(options: UseEditModeOptions = {}): UseEditModeReturn {
  const { characterId, onConfirmExit, onModeChange } = options

  // Initialize from URL
  const getInitialMode = (): boolean => {
    if (typeof window === 'undefined') return false
    return window.location.pathname.endsWith('/edit')
  }

  const [isEditing, setIsEditing] = useState(getInitialMode)
  const [isDirty, setDirty] = useState(false)
  const isEditingRef = useRef(isEditing)
  const isDirtyRef = useRef(isDirty)

  // Keep refs in sync for use in event handlers
  useEffect(() => {
    isEditingRef.current = isEditing
  }, [isEditing])

  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])

  // Update URL when mode changes
  useEffect(() => {
    if (typeof window === 'undefined' || !characterId) return

    const basePath = `/character/${characterId}`
    const newPath = isEditing ? `${basePath}/edit` : basePath

    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath)
    }
  }, [isEditing, characterId])

  const enterEditMode = useCallback(() => {
    setIsEditing(true)
    onModeChange?.(true)
  }, [onModeChange])

  const exitEditMode = useCallback(() => {
    if (isDirtyRef.current) {
      // Ask for confirmation if there are unsaved changes
      const shouldExit = onConfirmExit
        ? onConfirmExit()
        : window.confirm('You have unsaved changes. Leave edit mode?')

      if (!shouldExit) return
    }

    setIsEditing(false)
    setDirty(false)
    onModeChange?.(false)
  }, [onConfirmExit, onModeChange])

  const toggleMode = useCallback(() => {
    if (isEditingRef.current) {
      exitEditMode()
    } else {
      enterEditMode()
    }
  }, [enterEditMode, exitEditMode])

  // Keyboard shortcuts: Ctrl+E / Cmd+E to toggle, Escape to exit edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifierKey = isMacPlatform() ? e.metaKey : e.ctrlKey

      // Ctrl+E / Cmd+E: toggle mode
      if (modifierKey && e.key === 'e') {
        e.preventDefault()
        if (isEditingRef.current) {
          exitEditMode()
        } else {
          enterEditMode()
        }
        return
      }

      // Escape: exit edit mode
      if (e.key === 'Escape' && isEditingRef.current) {
        e.preventDefault()
        exitEditMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enterEditMode, exitEditMode])

  return {
    isEditing,
    isDirty,
    toggleMode,
    enterEditMode,
    exitEditMode,
    setDirty,
  }
}
