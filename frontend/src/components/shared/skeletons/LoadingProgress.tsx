/**
 * LoadingProgress (Story 46.1)
 *
 * Determinate progress bar used for SRD data loading and
 * PDF generation. Shows a label, a progress bar, and an
 * optional status message.
 */

import { cn } from '@/lib/utils'

export interface LoadingProgressProps {
  /** Progress value from 0 to 100 */
  progress: number
  /** Label displayed above the bar */
  label?: string
  /** Status message below the bar (e.g., "Page 2 of 3...") */
  statusMessage?: string
  /** Whether to show as a modal overlay */
  modal?: boolean
  className?: string
}

export function LoadingProgress({
  progress,
  label = 'Loading...',
  statusMessage,
  modal = false,
  className,
}: LoadingProgressProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  const content = (
    <div
      className={cn('w-full max-w-sm', className)}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      data-testid="loading-progress"
    >
      <p className="text-sm text-parchment font-medium mb-2">{label}</p>
      <div className="h-2 rounded-full bg-parchment/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent-gold transition-[width] duration-300 ease-out reduce-motion:transition-none"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {statusMessage && (
        <p className="text-xs text-parchment/50 mt-1.5">{statusMessage}</p>
      )}
      <p className="text-xs text-parchment/40 mt-1 text-right">
        {Math.round(clampedProgress)}%
      </p>
    </div>
  )

  if (modal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm"
        data-testid="loading-progress-modal"
      >
        <div className="rounded-xl border border-parchment/10 bg-bg-secondary p-8 shadow-xl">
          {content}
        </div>
      </div>
    )
  }

  return content
}
