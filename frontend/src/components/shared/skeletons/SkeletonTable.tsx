/**
 * SkeletonTable (Story 46.1)
 *
 * Matches data table layouts with skeleton header row and
 * configurable body rows. Used for campaign dashboard party grid,
 * loot table, etc.
 */

import { Skeleton } from './Skeleton'
import { cn } from '@/lib/utils'

export interface SkeletonTableProps {
  /** Number of columns (default 4) */
  columns?: number
  /** Number of body rows (default 3) */
  rows?: number
  className?: string
}

export function SkeletonTable({
  columns = 4,
  rows = 3,
  className,
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 border-parchment/10 bg-bg-secondary overflow-hidden',
        className,
      )}
      aria-busy="true"
      aria-label="Loading table"
      role="status"
      data-testid="skeleton-table"
    >
      {/* Header row */}
      <div className="flex gap-3 px-4 py-3 border-b border-parchment/10 bg-bg-primary/30">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`header-${i}`}
            variant="text"
            className={cn('h-4', i === 0 ? 'flex-[2]' : 'flex-1')}
          />
        ))}
      </div>

      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="flex gap-3 px-4 py-3 border-b border-parchment/5"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={`cell-${rowIdx}-${colIdx}`}
              variant="text"
              className={cn('h-4', colIdx === 0 ? 'flex-[2]' : 'flex-1')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
