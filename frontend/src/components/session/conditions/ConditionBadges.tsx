/**
 * ConditionBadges (Story 29.1)
 *
 * Horizontal badge strip displaying all active conditions on the character sheet.
 * Shows color-coded condition chips that can be clicked for details.
 * When no conditions are active, shows a subtle placeholder.
 */

import type { Condition } from '@/types/core'
import type { ConditionInstance } from '@/types/combat'
import { ConditionCard } from './ConditionCard'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ConditionBadgesProps {
  conditions: ConditionInstance[]
  onRemove?: (condition: Condition) => void
  onAddClick?: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConditionBadges({
  conditions,
  onRemove,
  onAddClick,
}: ConditionBadgesProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="condition-badges"
      role="list"
      aria-label="Active conditions"
    >
      {conditions.length === 0 ? (
        <span
          className="text-xs text-parchment/40 italic"
          data-testid="no-conditions-placeholder"
        >
          No conditions
        </span>
      ) : (
        conditions.map((instance) => (
          <div key={instance.condition} role="listitem">
            <ConditionCard
              instance={instance}
              onRemove={onRemove}
            />
          </div>
        ))
      )}

      {onAddClick && (
        <button
          type="button"
          className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-dashed border-parchment/30 text-parchment/50 hover:text-parchment hover:border-parchment/50 transition-colors text-sm"
          onClick={onAddClick}
          aria-label="Add condition"
          data-testid="add-condition-button"
        >
          +
        </button>
      )}
    </div>
  )
}
