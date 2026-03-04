/**
 * SkeletonText (Story 46.1)
 *
 * Animated text placeholder lines. Renders a configurable number of
 * grey bars that simulate text content loading.
 */

import { Skeleton } from './Skeleton'
import { cn } from '@/lib/utils'

export interface SkeletonTextProps {
  /** Number of text lines to render (default 3) */
  lines?: number
  /** Additional class on the wrapper */
  className?: string
}

/**
 * Renders placeholder text lines with slightly varied widths
 * for a more natural loading appearance.
 */
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  // Last line is shorter for a natural paragraph look
  const lineWidths = Array.from({ length: lines }, (_, i) =>
    i === lines - 1 ? 'w-3/4' : 'w-full',
  )

  return (
    <div className={cn('space-y-2', className)}>
      {lineWidths.map((w, i) => (
        <Skeleton key={i} variant="text" className={w} />
      ))}
    </div>
  )
}
