/**
 * Skeleton primitive (Story 46.1)
 *
 * Base skeleton component with pulse animation that respects
 * the reduced-motion preference. All other skeleton components
 * compose this primitive.
 */

import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
  /** Width — Tailwind class or inline style */
  width?: string
  /** Height — Tailwind class or inline style */
  height?: string
  /** Border radius variant */
  variant?: 'rectangular' | 'circular' | 'text'
  /** Override aria-label */
  'aria-label'?: string
}

/**
 * Base skeleton building block. Renders a grey pulsing rectangle
 * that automatically disables animation when reduced motion is active
 * (via the .reduce-motion class on <html>).
 */
export function Skeleton({
  className,
  width,
  height,
  variant = 'rectangular',
  'aria-label': ariaLabel,
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      aria-label={ariaLabel}
      className={cn(
        'bg-parchment/10',
        // Pulse animation — disabled by .reduce-motion ancestor
        'animate-pulse reduce-motion:animate-none',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded h-4',
        variant === 'rectangular' && 'rounded-lg',
        width,
        height,
        className,
      )}
    />
  )
}
