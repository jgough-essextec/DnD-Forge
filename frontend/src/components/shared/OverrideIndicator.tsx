/**
 * OverrideIndicator (Story 46.5)
 *
 * Visual indicator for manually overridden fields.
 * Shows a "broken chain" icon with a tooltip displaying the
 * computed value and a click-to-reset action.
 */

import { useState } from 'react'
import { Unlink } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface OverrideIndicatorProps {
  /** The system-computed value to show in the tooltip */
  computedValue: number
  /** Label for the field (e.g., "AC", "Initiative") */
  fieldLabel: string
  /** Called when the user clicks to reset to computed */
  onReset: () => void
  className?: string
}

export function OverrideIndicator({
  computedValue,
  fieldLabel,
  onReset,
  className,
}: OverrideIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className={cn('relative inline-flex', className)}>
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onClick={onReset}
        className="p-0.5 rounded text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
        aria-label={`${fieldLabel} is manually set. Calculated value: ${computedValue}. Click to reset.`}
        data-testid="override-indicator"
      >
        <Unlink className="h-3.5 w-3.5" />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap rounded-lg border border-parchment/20 bg-bg-secondary px-3 py-2 shadow-lg"
          role="tooltip"
          data-testid="override-tooltip"
        >
          <p className="text-xs text-parchment/80">
            This value is manually set.
          </p>
          <p className="text-xs text-parchment/60">
            Calculated value: <span className="text-accent-gold">{computedValue}</span>
          </p>
          <p className="text-xs text-parchment/40 mt-1">Click to reset.</p>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 rotate-45 border-r border-b border-parchment/20 bg-bg-secondary" />
          </div>
        </div>
      )}
    </div>
  )
}
