/**
 * SlotCircleRow Component (Story 28.1)
 *
 * A row of clickable circles representing spell slots for a single spell level.
 * Filled (gold) = available, empty (gray outline) = expended.
 * Level label on left, available/total count on right.
 */

import { cn } from '@/lib/utils'

export interface SlotCircleRowProps {
  /** Spell level (1-9) */
  level: number
  /** Total number of slots at this level */
  total: number
  /** Number of slots currently used/expended */
  used: number
  /** Called with the slot index when a circle is clicked */
  onToggle: (slotIndex: number) => void
  /** Optional label displayed to the left (e.g., "1st") */
  label?: string
}

export function SlotCircleRow({
  level,
  total,
  used,
  onToggle,
  label,
}: SlotCircleRowProps) {
  const available = Math.max(0, total - used)

  return (
    <div
      className="flex items-center gap-3"
      data-testid={`slot-row-level-${level}`}
    >
      {/* Level label */}
      {label && (
        <span className="text-xs font-semibold text-parchment/70 w-8 text-right">
          {label}
        </span>
      )}

      {/* Slot circles — padded for 44px touch targets */}
      <div className="flex gap-0.5">
        {Array.from({ length: total }, (_, i) => {
          const isExpended = i < used
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(i)}
              className={cn(
                'flex items-center justify-center',
                'min-w-[44px] min-h-[44px] touch-manipulation',
              )}
              aria-label={`Level ${level} slot ${i + 1} (${isExpended ? 'expended' : 'available'})`}
              data-testid={`slot-circle-${level}-${i}`}
            >
              <span
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-all block',
                  'hover:scale-110',
                  isExpended
                    ? 'bg-parchment/20 border-parchment/40'
                    : 'bg-accent-gold/80 border-accent-gold',
                )}
              />
            </button>
          )
        })}
      </div>

      {/* Available/total count */}
      <span className="text-xs text-parchment/60 ml-auto tabular-nums">
        {available}/{total}
      </span>
    </div>
  )
}
