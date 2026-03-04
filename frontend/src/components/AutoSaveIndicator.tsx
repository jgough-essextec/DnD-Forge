import { useEffect, useState } from 'react'
import type { AutoSaveStatus } from '@/hooks/useAutoSave'

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus
  lastSavedAt: Date | null
  onRetry?: () => void
}

/**
 * Visual indicator for auto-save status.
 * - Shows "Saving..." with a spinner during mutation
 * - Shows "Saved" with a checkmark on success (fades after 3s)
 * - Shows "Error saving" with a retry button on failure
 */
export function AutoSaveIndicator({
  status,
  lastSavedAt,
  onRetry,
}: AutoSaveIndicatorProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (status === 'saving' || status === 'error') {
      setVisible(true)
    } else if (status === 'saved') {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [status])

  if (!visible) return null

  return (
    <div
      className="inline-flex items-center gap-2 text-sm"
      role="status"
      aria-live="polite"
    >
      {status === 'saving' && (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Saving...</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <svg
            className="h-4 w-4 text-green-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>
            Saved
            {lastSavedAt && (
              <span className="ml-1 text-xs opacity-60">
                at {lastSavedAt.toLocaleTimeString()}
              </span>
            )}
          </span>
        </>
      )}

      {status === 'error' && (
        <>
          <svg
            className="h-4 w-4 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>Error saving</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="ml-1 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          )}
        </>
      )}
    </div>
  )
}
