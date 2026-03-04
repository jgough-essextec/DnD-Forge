/**
 * SkeletonCard (Story 46.1)
 *
 * Matches the CharacterCard layout with avatar circle, name bar,
 * class/level bar, and stat blocks. Used in the gallery while
 * characters load from the API.
 */

import { Skeleton } from './Skeleton'
import { SkeletonText } from './SkeletonText'
import { cn } from '@/lib/utils'

export interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 border-parchment/10 bg-bg-secondary p-4 space-y-3',
        className,
      )}
      data-testid="skeleton-card"
    >
      {/* Avatar + name row */}
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="h-10 w-10 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton variant="text" className="w-2/3 h-4" />
          <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>

      {/* Stat blocks row */}
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>

      {/* Bottom text area */}
      <SkeletonText lines={2} />
    </div>
  )
}
