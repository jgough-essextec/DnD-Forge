/**
 * ModeToggle Component (Story 20.1)
 *
 * Prominent toggle button for switching between View and Edit modes
 * on the character sheet. Displays Eye icon for View mode and Pencil
 * icon for Edit mode, with active styling (gold highlight) and a
 * 200ms cross-fade transition between modes.
 *
 * Also shows a dismissable first-time help banner when entering edit mode.
 */

import { useState, useEffect } from 'react'
import { Eye, Pencil, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEditModeContext } from './EditModeContext'
import { isMacPlatform, EDIT_MODE_HELP_DISMISSED_KEY } from '@/hooks/useEditMode'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface ModeToggleProps {
  /** Additional CSS classes */
  className?: string
}

export function ModeToggle({ className }: ModeToggleProps) {
  const { isEditing, isDirty, toggleMode } = useEditModeContext()

  const [showHelp, setShowHelp] = useState(false)

  // Show first-time help banner when entering edit mode
  useEffect(() => {
    if (isEditing) {
      const dismissed = localStorage.getItem(EDIT_MODE_HELP_DISMISSED_KEY)
      if (!dismissed) {
        setShowHelp(true)
      }
    } else {
      setShowHelp(false)
    }
  }, [isEditing])

  const dismissHelp = () => {
    setShowHelp(false)
    localStorage.setItem(EDIT_MODE_HELP_DISMISSED_KEY, 'true')
  }

  const modKey = isMacPlatform() ? 'Cmd' : 'Ctrl'

  return (
    <div className={cn('relative', className)}>
      {/* Mode Toggle Button */}
      <button
        type="button"
        onClick={toggleMode}
        aria-label={isEditing ? 'Switch to view mode' : 'Switch to edit mode'}
        aria-pressed={isEditing}
        title={`${isEditing ? 'View Mode' : 'Edit Mode'} (${modKey}+E)`}
        className={cn(
          'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
          isEditing
            ? 'bg-amber-600/20 text-amber-400 border border-amber-500/40 hover:bg-amber-600/30'
            : 'bg-slate-700/50 text-slate-300 border border-slate-600/40 hover:bg-slate-700/70'
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isEditing ? (
            <motion.span
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              <span>Editing</span>
            </motion.span>
          ) : (
            <motion.span
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              <span>Viewing</span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Unsaved changes indicator */}
      {isEditing && isDirty && (
        <div
          className="flex items-center gap-1.5 mt-1 text-xs text-amber-400"
          role="status"
          aria-live="polite"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Unsaved changes</span>
        </div>
      )}

      {/* First-time help banner */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-full right-0 mt-2 z-50',
              'w-72 rounded-lg p-3',
              'bg-amber-900/90 border border-amber-500/30',
              'text-sm text-amber-100 shadow-lg'
            )}
            role="alert"
          >
            <div className="flex items-start gap-2">
              <p className="flex-1">
                You are now editing. Changes auto-save. Click any value to modify it.
              </p>
              <button
                type="button"
                onClick={dismissHelp}
                aria-label="Dismiss help banner"
                className="shrink-0 rounded p-0.5 hover:bg-amber-800/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
