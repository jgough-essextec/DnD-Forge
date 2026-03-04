/**
 * useUndoRedo Hook (Story 20.3)
 *
 * State-based undo/redo system for the character sheet.
 * Each snapshot is a full character state object.
 *
 * Features:
 * - Max 50 snapshots (configurable)
 * - pushSnapshot, undo, redo operations
 * - New changes after undo clear the redo stack
 * - Clears stacks on mode exit or navigation away
 * - Keyboard shortcuts: Ctrl+Z / Cmd+Z (undo), Ctrl+Shift+Z / Cmd+Shift+Z (redo)
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { isMacPlatform } from './useEditMode'
import type { Character } from '@/types/character'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseUndoRedoOptions {
  /** Maximum number of snapshots to keep (default: 50) */
  maxSnapshots?: number
  /** Whether undo/redo is active (typically tied to edit mode) */
  enabled?: boolean
  /** Callback when undo/redo restores a state */
  onRestore?: (state: Partial<Character>) => void
}

export interface UseUndoRedoReturn {
  /** Push a snapshot onto the undo stack (called before auto-save) */
  pushSnapshot: (state: Partial<Character>) => void
  /** Undo the last change, restoring previous state */
  undo: () => void
  /** Redo the last undone change */
  redo: () => void
  /** Whether undo is available */
  canUndo: boolean
  /** Whether redo is available */
  canRedo: boolean
  /** Number of undo steps available */
  undoCount: number
  /** Number of redo steps available */
  redoCount: number
  /** Clear both undo and redo stacks */
  clearHistory: () => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MAX_SNAPSHOTS = 50

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUndoRedo(
  options: UseUndoRedoOptions = {}
): UseUndoRedoReturn {
  const {
    maxSnapshots = DEFAULT_MAX_SNAPSHOTS,
    enabled = true,
    onRestore,
  } = options

  const [undoStack, setUndoStack] = useState<Partial<Character>[]>([])
  const [redoStack, setRedoStack] = useState<Partial<Character>[]>([])

  // Keep refs for keyboard handler access
  const undoStackRef = useRef(undoStack)
  const redoStackRef = useRef(redoStack)
  const onRestoreRef = useRef(onRestore)
  const enabledRef = useRef(enabled)

  useEffect(() => {
    undoStackRef.current = undoStack
  }, [undoStack])

  useEffect(() => {
    redoStackRef.current = redoStack
  }, [redoStack])

  useEffect(() => {
    onRestoreRef.current = onRestore
  }, [onRestore])

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const pushSnapshot = useCallback(
    (state: Partial<Character>) => {
      if (!enabled) return

      setUndoStack((prev) => {
        const next = [...prev, state]
        // Enforce max depth, discard oldest
        if (next.length > maxSnapshots) {
          return next.slice(next.length - maxSnapshots)
        }
        return next
      })
      // New changes clear the redo stack
      setRedoStack([])
    },
    [enabled, maxSnapshots]
  )

  const undo = useCallback(() => {
    if (!enabledRef.current) return

    setUndoStack((prev) => {
      if (prev.length === 0) return prev

      const newStack = [...prev]
      const snapshot = newStack.pop()!

      // Push current state onto redo stack
      // The onRestore callback will provide the "current" state to redo
      setRedoStack((redoPrev) => [...redoPrev, snapshot])

      // Restore the previous snapshot
      onRestoreRef.current?.(snapshot)

      return newStack
    })
  }, [])

  const redo = useCallback(() => {
    if (!enabledRef.current) return

    setRedoStack((prev) => {
      if (prev.length === 0) return prev

      const newStack = [...prev]
      const snapshot = newStack.pop()!

      // Push current state back onto undo stack
      setUndoStack((undoPrev) => [...undoPrev, snapshot])

      // Restore the redo snapshot
      onRestoreRef.current?.(snapshot)

      return newStack
    })
  }, [])

  const clearHistory = useCallback(() => {
    setUndoStack([])
    setRedoStack([])
  }, [])

  // Clear stacks when disabled (e.g., exiting edit mode)
  useEffect(() => {
    if (!enabled) {
      clearHistory()
    }
  }, [enabled, clearHistory])

  // Keyboard shortcuts: Ctrl+Z / Cmd+Z, Ctrl+Shift+Z / Cmd+Shift+Z
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const modifierKey = isMacPlatform() ? e.metaKey : e.ctrlKey

      if (!modifierKey || e.key !== 'z') return

      e.preventDefault()

      if (e.shiftKey) {
        // Redo: Ctrl+Shift+Z / Cmd+Shift+Z
        if (redoStackRef.current.length > 0) {
          redo()
        }
      } else {
        // Undo: Ctrl+Z / Cmd+Z
        if (undoStackRef.current.length > 0) {
          undo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, undo, redo])

  return {
    pushSnapshot,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    undoCount: undoStack.length,
    redoCount: redoStack.length,
    clearHistory,
  }
}
