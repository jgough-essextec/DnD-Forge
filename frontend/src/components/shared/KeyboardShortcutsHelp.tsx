// =============================================================================
// Story 41.1 -- KeyboardShortcutsHelp
// Modal dialog listing all available keyboard shortcuts, grouped by context.
// Triggered by the ? key.
// =============================================================================

import { useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DEFAULT_SHORTCUT_DEFINITIONS,
  type ShortcutDefinition,
} from '@/hooks/useKeyboardShortcuts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface KeyboardShortcutsHelpProps {
  /** Whether the dialog is open */
  isOpen: boolean
  /** Called when the dialog should close */
  onClose: () => void
  /** Additional shortcuts to display beyond the defaults */
  extraShortcuts?: ShortcutDefinition[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a key for display (e.g., 'Escape' -> 'Esc', '/' -> '/') */
function formatKey(key: string): string {
  const keyMap: Record<string, string> = {
    Escape: 'Esc',
    ' ': 'Space',
    ArrowUp: '\u2191',
    ArrowDown: '\u2193',
    ArrowLeft: '\u2190',
    ArrowRight: '\u2192',
  }
  return keyMap[key] ?? key.toUpperCase()
}

/** Group shortcuts by their group property */
function groupShortcuts(
  shortcuts: ShortcutDefinition[]
): Record<string, ShortcutDefinition[]> {
  const groups: Record<string, ShortcutDefinition[]> = {}
  for (const shortcut of shortcuts) {
    const group = shortcut.group
    if (!groups[group]) groups[group] = []
    groups[group].push(shortcut)
  }
  return groups
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
  extraShortcuts = [],
}: KeyboardShortcutsHelpProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Store the element that had focus before the dialog opened
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      // Focus the close button on next frame
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus()
      })
    } else if (previousFocusRef.current) {
      // Return focus to the triggering element
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isOpen])

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }

      // Focus trap: Tab/Shift+Tab stays within the dialog
      if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusableElements || focusableElements.length === 0) return

        const first = focusableElements[0]
        const last = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [onClose]
  )

  if (!isOpen) return null

  const allShortcuts = [...DEFAULT_SHORTCUT_DEFINITIONS, ...extraShortcuts]
  const grouped = groupShortcuts(allShortcuts)

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      data-testid="keyboard-shortcuts-backdrop"
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto',
          'rounded-xl border border-parchment/20 bg-bg-secondary shadow-2xl',
          'p-6'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="keyboard-shortcuts-title"
            className="font-heading text-xl text-accent-gold"
          >
            Keyboard Shortcuts
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close keyboard shortcuts dialog"
            className={cn(
              'rounded-lg p-2 text-parchment/60 transition-colors',
              'hover:text-parchment hover:bg-parchment/10',
              'focus:outline-none focus:ring-2 focus:ring-accent-gold'
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shortcut groups */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, shortcuts]) => (
            <div key={group}>
              <h3 className="text-sm font-semibold text-parchment/80 uppercase tracking-wider mb-3">
                {group}
              </h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut) => (
                  <div
                    key={`${shortcut.group}-${shortcut.key}`}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-parchment/70">
                      {shortcut.description}
                    </span>
                    <kbd
                      className={cn(
                        'inline-flex items-center justify-center min-w-[28px] px-2 py-1',
                        'rounded border border-parchment/30 bg-bg-primary',
                        'text-xs font-mono text-parchment/90'
                      )}
                    >
                      {shortcut.ctrlOrCmd && (
                        <span className="mr-1">
                          {typeof navigator !== 'undefined' &&
                          /Mac/i.test(navigator.platform || '')
                            ? '\u2318'
                            : 'Ctrl+'}
                        </span>
                      )}
                      {shortcut.shift && <span className="mr-1">Shift+</span>}
                      {shortcut.alt && <span className="mr-1">Alt+</span>}
                      {formatKey(shortcut.key)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-xs text-parchment/40 text-center">
          Shortcuts are disabled when typing in text fields
        </p>
      </div>
    </div>
  )
}
