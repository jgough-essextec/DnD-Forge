// =============================================================================
// Story 41.1 -- useKeyboardShortcuts Hook
// Registers keyboard shortcuts for common actions. Shortcuts are suppressed
// when the active element is an input, textarea, select, or contenteditable.
// =============================================================================

import { useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KeyboardShortcut {
  /** The key to match (case-insensitive for letter keys) */
  key: string
  /** Human-readable description of the shortcut */
  description: string
  /** Context/group for display in the help dialog */
  group: string
  /** Handler invoked when the shortcut fires */
  handler: () => void
  /** Whether Ctrl/Cmd modifier is required */
  ctrlOrCmd?: boolean
  /** Whether Shift modifier is required */
  shift?: boolean
  /** Whether Alt modifier is required */
  alt?: boolean
}

export interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled (default: true) */
  enabled?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if the currently focused element is a text input where typing
 * should not trigger shortcuts.
 */
export function isTypingTarget(element: Element | null): boolean {
  if (!element) return false
  const tagName = element.tagName.toLowerCase()
  if (tagName === 'input') {
    const inputType = (element as HTMLInputElement).type.toLowerCase()
    // Allow shortcuts for non-text input types
    const textTypes = [
      'text',
      'search',
      'email',
      'password',
      'url',
      'tel',
      'number',
    ]
    return textTypes.includes(inputType)
  }
  if (tagName === 'textarea') return true
  if (tagName === 'select') return true
  if (
    (element as HTMLElement).isContentEditable ||
    (element as HTMLElement).contentEditable === 'true'
  )
    return true
  return false
}

// ---------------------------------------------------------------------------
// Default shortcuts definition
// ---------------------------------------------------------------------------

export interface ShortcutDefinition {
  key: string
  description: string
  group: string
  ctrlOrCmd?: boolean
  shift?: boolean
  alt?: boolean
}

/**
 * The 9 default keyboard shortcuts as defined in the specification.
 */
export const DEFAULT_SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  { key: 'd', description: 'Open dice roller', group: 'Global' },
  { key: 'r', description: 'Quick roll d20', group: 'Global' },
  { key: 'e', description: 'Toggle edit mode', group: 'Character Sheet' },
  { key: 's', description: 'Short rest', group: 'Character Sheet' },
  { key: 'l', description: 'Long rest', group: 'Character Sheet' },
  { key: 'n', description: 'Next turn', group: 'Combat' },
  { key: '/', description: 'Focus search input', group: 'Global' },
  { key: 'Escape', description: 'Close modal/panel', group: 'Global' },
  { key: '?', description: 'Show keyboard shortcuts', group: 'Global' },
]

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook that registers keyboard shortcut listeners on the window.
 *
 * Shortcuts do NOT fire when the user is typing in an input, textarea,
 * select, or contenteditable element.
 *
 * @param shortcuts - Array of shortcut definitions with handlers
 * @param options - Configuration options
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
): void {
  const { enabled = true } = options
  const shortcutsRef = useRef(shortcuts)

  // Keep shortcuts ref up to date without causing re-renders
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(event: KeyboardEvent) {
      // Don't fire shortcuts when typing in inputs
      if (isTypingTarget(document.activeElement)) return

      for (const shortcut of shortcutsRef.current) {
        const keyMatch =
          event.key.toLowerCase() === shortcut.key.toLowerCase() ||
          event.key === shortcut.key

        if (!keyMatch) continue

        // Check modifier keys
        if (shortcut.ctrlOrCmd) {
          const isMac =
            typeof navigator !== 'undefined' &&
            /Mac|iPhone|iPad|iPod/i.test(
              navigator.platform || navigator.userAgent
            )
          const modifierPressed = isMac ? event.metaKey : event.ctrlKey
          if (!modifierPressed) continue
        }

        if (shortcut.shift && !event.shiftKey) continue
        if (shortcut.alt && !event.altKey) continue

        // If no modifiers required, make sure Ctrl/Meta aren't pressed
        // (to avoid hijacking browser shortcuts)
        if (
          !shortcut.ctrlOrCmd &&
          (event.ctrlKey || event.metaKey) &&
          shortcut.key !== 'Escape'
        ) {
          continue
        }

        event.preventDefault()
        shortcut.handler()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}

// ---------------------------------------------------------------------------
// Page-specific shortcut registration helper
// ---------------------------------------------------------------------------

/**
 * Creates a shortcut from a definition and a handler.
 * Convenience function for building shortcut arrays.
 */
export function createShortcut(
  definition: ShortcutDefinition,
  handler: () => void
): KeyboardShortcut {
  return { ...definition, handler }
}
