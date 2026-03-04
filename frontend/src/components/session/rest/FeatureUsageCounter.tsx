/**
 * FeatureUsageCounter (Story 30.3)
 *
 * Filled/empty circle indicators for limited-use class features.
 * Filled (gold) = remaining, empty (gray outline) = expended.
 * Clicking a filled circle expends a use; clicking empty recovers one.
 */

import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FeatureUsageCounterProps {
  /** Unique ID for the feature */
  featureId: string
  /** Display name of the feature */
  name: string
  /** Maximum number of uses (null = unlimited) */
  maxUses: number | null
  /** Current remaining uses */
  usesRemaining: number
  /** Called when a use is expended (filled circle clicked) */
  onExpend?: (featureId: string) => void
  /** Called when a use is recovered (empty circle clicked) */
  onRecover?: (featureId: string) => void
  /** Whether the counter is read-only (no click handlers) */
  readOnly?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FeatureUsageCounter({
  featureId,
  name,
  maxUses,
  usesRemaining,
  onExpend,
  onRecover,
  readOnly = false,
}: FeatureUsageCounterProps) {
  if (maxUses === null) {
    // Unlimited uses -- show infinity symbol
    return (
      <div
        className="flex items-center gap-2"
        data-testid={`feature-counter-${featureId}`}
      >
        <span className="text-sm text-parchment font-medium">{name}</span>
        <span
          className="text-accent-gold text-lg"
          aria-label={`${name}: unlimited uses`}
        >
          &infin;
        </span>
      </div>
    )
  }

  const expended = maxUses - usesRemaining

  const handleCircleClick = (index: number) => {
    if (readOnly) return

    // If clicking an expended circle (index < expended), recover
    if (index < expended) {
      onRecover?.(featureId)
    } else {
      // Clicking a filled circle, expend
      onExpend?.(featureId)
    }
  }

  return (
    <div
      className="flex items-center gap-2"
      data-testid={`feature-counter-${featureId}`}
    >
      <span className="text-sm text-parchment font-medium">{name}</span>

      <div
        className="flex gap-1"
        role="group"
        aria-label={`${usesRemaining} of ${maxUses} ${name} uses remaining`}
      >
        {Array.from({ length: maxUses }, (_, i) => {
          const isExpended = i < expended
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleCircleClick(i)}
              disabled={readOnly}
              className={cn(
                'w-4 h-4 rounded-full border-2 transition-all',
                !readOnly && 'hover:scale-110 cursor-pointer',
                readOnly && 'cursor-default',
                isExpended
                  ? 'bg-transparent border-parchment/40'
                  : 'bg-accent-gold/80 border-accent-gold',
              )}
              aria-label={
                isExpended
                  ? `${name} use ${i + 1}: expended`
                  : `${name} use ${i + 1}: available`
              }
              data-testid={`feature-circle-${featureId}-${i}`}
            />
          )
        })}
      </div>

      <span className="text-xs text-parchment/60 tabular-nums">
        {usesRemaining}/{maxUses}
      </span>
    </div>
  )
}
