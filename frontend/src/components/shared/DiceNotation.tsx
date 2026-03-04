// =============================================================================
// Story 16.3 -- DiceNotation
// Styled dice notation display with click-to-roll integration.
// =============================================================================

import { useState, useCallback } from 'react'
import { Dice5 } from 'lucide-react'
import { parseDiceNotation } from '@/utils/dice'
import { useDiceStore } from '@/stores/diceStore'
import type { DieType } from '@/types/core'
import { cn } from '@/lib/utils'

interface DiceNotationProps {
  notation: string
  label?: string
  onClick?: () => void
}

export function DiceNotation({ notation, label, onClick }: DiceNotationProps) {
  const [rollResult, setRollResult] = useState<number | null>(null)
  const roll = useDiceStore((s) => s.roll)

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick()
      return
    }

    try {
      const parsed = parseDiceNotation(notation)
      const dieType = `d${parsed.sides}` as DieType
      const result = roll(
        [{ type: dieType, count: parsed.count }],
        parsed.modifier,
        label ?? notation,
      )

      setRollResult(result.total)

      // Clear the result popup after 2 seconds
      setTimeout(() => {
        setRollResult(null)
      }, 2000)
    } catch {
      // If notation is invalid, do nothing
    }
  }, [notation, label, onClick, roll])

  return (
    <span className="relative inline-flex items-center">
      <button
        onClick={handleClick}
        aria-label={label ? `Roll ${label}: ${notation}` : `Roll ${notation}`}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded',
          'bg-bg-secondary border border-parchment/20',
          'text-sm font-mono text-accent-gold hover:text-accent-gold/80',
          'hover:border-accent-gold/40 hover:bg-accent-gold/5',
          'transition-all cursor-pointer',
          'focus:outline-none focus:ring-1 focus:ring-accent-gold/50',
        )}
      >
        <Dice5 className="h-3.5 w-3.5" />
        <span data-testid="dice-notation">{notation}</span>
      </button>

      {/* Result popup */}
      {rollResult !== null && (
        <span
          data-testid="roll-result"
          className={cn(
            'absolute -top-8 left-1/2 -translate-x-1/2',
            'px-2 py-1 rounded bg-accent-gold text-bg-primary',
            'text-xs font-bold whitespace-nowrap',
            'animate-bounce shadow-lg',
          )}
        >
          {rollResult}
        </span>
      )}
    </span>
  )
}
