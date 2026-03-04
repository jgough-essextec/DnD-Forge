/**
 * EmptyState (Story 46.2)
 *
 * Reusable empty-state component with icon, title, description,
 * and optional CTA button. Used across all zero-content views
 * for a consistent experience.
 */

import type { ReactNode, ComponentType } from 'react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  /** Lucide icon component to render */
  icon: ComponentType<{ className?: string }>
  /** Primary heading text */
  title: string
  /** Descriptive text below the title */
  description?: string
  /** CTA button text */
  actionLabel?: string
  /** CTA button click handler */
  onAction?: () => void
  /** Additional content below the CTA */
  children?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className,
      )}
      data-testid="empty-state"
    >
      <div className="mb-4 rounded-full bg-parchment/5 p-4">
        <Icon className="h-10 w-10 text-parchment/40" />
      </div>

      <h3 className="font-heading text-lg text-parchment mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-parchment/50 max-w-xs mb-4">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg',
            'bg-accent-gold text-bg-primary font-semibold text-sm',
            'hover:bg-accent-gold/90 transition-colors',
            'shadow-lg shadow-accent-gold/20',
          )}
          data-testid="empty-state-cta"
        >
          {actionLabel}
        </button>
      )}

      {children}
    </div>
  )
}
