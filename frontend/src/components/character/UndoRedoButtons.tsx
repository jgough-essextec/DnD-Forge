/**
 * UndoRedoButtons Component (Story 20.3)
 *
 * Undo and Redo buttons displayed in the edit mode toolbar.
 * - Disabled when respective stack is empty
 * - Shows undo count badge
 * - Only visible in edit mode
 */

import { Undo2, Redo2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isMacPlatform } from '@/hooks/useEditMode'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface UndoRedoButtonsProps {
  /** Whether undo is available */
  canUndo: boolean
  /** Whether redo is available */
  canRedo: boolean
  /** Number of undo steps available */
  undoCount: number
  /** Number of redo steps available */
  redoCount: number
  /** Callback when undo is clicked */
  onUndo: () => void
  /** Callback when redo is clicked */
  onRedo: () => void
  /** Whether the buttons should be visible (typically tied to isEditing) */
  visible?: boolean
  /** Additional CSS classes */
  className?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UndoRedoButtons({
  canUndo,
  canRedo,
  undoCount,
  redoCount,
  onUndo,
  onRedo,
  visible = true,
  className,
}: UndoRedoButtonsProps) {
  if (!visible) return null

  const modKey = isMacPlatform() ? 'Cmd' : 'Ctrl'

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="toolbar"
      aria-label="Undo and redo"
    >
      {/* Undo button */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        title={`Undo (${modKey}+Z)`}
        aria-label={`Undo${undoCount > 0 ? ` (${undoCount} steps)` : ''}`}
        className={cn(
          'relative flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
          canUndo
            ? 'text-slate-300 hover:bg-slate-700/60 hover:text-slate-100'
            : 'text-slate-600 cursor-not-allowed'
        )}
      >
        <Undo2 className="h-4 w-4" aria-hidden="true" />
        {undoCount > 0 && (
          <span className="text-xs tabular-nums text-slate-400">
            {undoCount}
          </span>
        )}
      </button>

      {/* Redo button */}
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        title={`Redo (${modKey}+Shift+Z)`}
        aria-label={`Redo${redoCount > 0 ? ` (${redoCount} steps)` : ''}`}
        className={cn(
          'relative flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
          canRedo
            ? 'text-slate-300 hover:bg-slate-700/60 hover:text-slate-100'
            : 'text-slate-600 cursor-not-allowed'
        )}
      >
        <Redo2 className="h-4 w-4" aria-hidden="true" />
        {redoCount > 0 && (
          <span className="text-xs tabular-nums text-slate-400">
            {redoCount}
          </span>
        )}
      </button>
    </div>
  )
}
