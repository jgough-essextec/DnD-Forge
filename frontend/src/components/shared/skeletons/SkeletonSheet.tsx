/**
 * SkeletonSheet (Story 46.1)
 *
 * Matches the character sheet three-page layout with skeleton
 * placeholders for ability score blocks, text areas, and stat bars.
 */

import { Skeleton } from './Skeleton'
import { SkeletonText } from './SkeletonText'
import { cn } from '@/lib/utils'

export interface SkeletonSheetProps {
  className?: string
}

export function SkeletonSheet({ className }: SkeletonSheetProps) {
  return (
    <div
      className={cn('space-y-6 p-4 sm:p-6', className)}
      aria-busy="true"
      aria-label="Loading character sheet"
      role="status"
      data-testid="skeleton-sheet"
    >
      {/* Header: name + level bar */}
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="h-16 w-16 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/3 h-6" />
          <Skeleton variant="text" className="w-1/4 h-4" />
        </div>
      </div>

      {/* Ability scores grid — 6 blocks */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-parchment/10 bg-bg-secondary p-3 flex flex-col items-center gap-1"
          >
            <Skeleton variant="text" className="w-2/3 h-3" />
            <Skeleton variant="text" className="w-1/2 h-6" />
            <Skeleton variant="text" className="w-1/3 h-3" />
          </div>
        ))}
      </div>

      {/* Combat stats row */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-5 w-1/3" />
          <SkeletonText lines={4} />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-1/3" />
          <SkeletonText lines={4} />
        </div>
      </div>
    </div>
  )
}
