/**
 * SlotSummary Component (Story 28.1)
 *
 * Compact summary showing slot availability per level with color coding.
 * Example: "Slots: 3/4 (1st) | 2/3 (2nd) | 1/2 (3rd)"
 * Green if slots available, yellow if low, red if all used.
 */

import { cn } from '@/lib/utils'
import { getSlotStatusColor } from '@/utils/spell-slots'

export interface SlotSummaryProps {
  /** Maximum slots by level (e.g., { 1: 4, 2: 3, 3: 2 }) */
  maxSlots: Record<number, number>
  /** Used slots by level */
  usedSlots: Record<number, number>
}

export function SlotSummary({ maxSlots, usedSlots }: SlotSummaryProps) {
  const levels = Object.keys(maxSlots)
    .map(Number)
    .filter(level => (maxSlots[level] ?? 0) > 0)
    .sort((a, b) => a - b)

  if (levels.length === 0) return null

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
      data-testid="slot-summary"
    >
      <span className="text-parchment/50 font-semibold uppercase tracking-wider">
        Slots
      </span>
      {levels.map(level => {
        const total = maxSlots[level] ?? 0
        const used = usedSlots[level] ?? 0
        const available = Math.max(0, total - used)
        const color = getSlotStatusColor(available, total)

        return (
          <span
            key={level}
            className={cn('font-medium tabular-nums', color)}
            data-testid={`summary-level-${level}`}
          >
            {available}/{total}
          </span>
        )
      })}
    </div>
  )
}
