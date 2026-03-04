/**
 * SaveStatusIndicator Component (Story 20.2)
 *
 * Displays the current auto-save status with appropriate visual indicators:
 * - "Saved" (green check)
 * - "Saving..." (spinner)
 * - "Unsaved changes" (yellow dot)
 * - "Save failed" (red X + retry button)
 */

import { Check, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CharacterAutoSaveStatus } from '@/hooks/useCharacterAutoSave'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SaveStatusIndicatorProps {
  /** Current save status from useCharacterAutoSave */
  status: CharacterAutoSaveStatus
  /** Whether there are pending unsaved changes */
  hasPendingChanges: boolean
  /** Timestamp of last successful save */
  lastSavedAt: Date | null
  /** Callback to retry a failed save */
  onRetry?: () => void
  /** Additional CSS classes */
  className?: string
}

// ---------------------------------------------------------------------------
// Time formatting helper
// ---------------------------------------------------------------------------

function formatLastSaved(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)

  if (diffSeconds < 5) return 'just now'
  if (diffSeconds < 60) return `${diffSeconds}s ago`

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  return date.toLocaleTimeString()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SaveStatusIndicator({
  status,
  hasPendingChanges,
  lastSavedAt,
  onRetry,
  className,
}: SaveStatusIndicatorProps) {
  // Determine display state: pending changes override idle/saved status
  const displayStatus = hasPendingChanges && status !== 'saving' && status !== 'error'
    ? 'pending'
    : status

  return (
    <div
      className={cn('flex items-center gap-2 text-sm', className)}
      role="status"
      aria-live="polite"
      aria-label="Save status"
    >
      {displayStatus === 'saved' && (
        <>
          <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <span className="text-emerald-400">
            Saved{lastSavedAt ? ` ${formatLastSaved(lastSavedAt)}` : ''}
          </span>
        </>
      )}

      {displayStatus === 'saving' && (
        <>
          <Loader2
            className="h-4 w-4 text-slate-400 animate-spin"
            aria-hidden="true"
          />
          <span className="text-slate-400">Saving...</span>
        </>
      )}

      {displayStatus === 'pending' && (
        <>
          <span
            className="inline-block h-2 w-2 rounded-full bg-amber-400"
            aria-hidden="true"
          />
          <span className="text-amber-400">Unsaved changes</span>
        </>
      )}

      {displayStatus === 'error' && (
        <>
          <AlertCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
          <span className="text-red-400">Save failed</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={cn(
                'ml-1 rounded px-2 py-0.5 text-xs font-medium',
                'bg-red-500/20 text-red-300 border border-red-500/30',
                'hover:bg-red-500/30 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-red-500/50'
              )}
              aria-label="Retry save"
            >
              Retry
            </button>
          )}
        </>
      )}

      {displayStatus === 'idle' && (
        <span className="text-slate-500">Ready</span>
      )}
    </div>
  )
}
