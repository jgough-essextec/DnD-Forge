/**
 * DiceButton (Story 26.1)
 *
 * A quick-roll button for a single die type. Each die type has a distinct color:
 * d4 green, d6 white, d8 blue, d10 purple, d12 red, d20 gold, d100 parchment.
 */

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { DieType } from '@/types/core'

const DIE_COLORS: Record<DieType, { bg: string; text: string; border: string; hover: string }> = {
  d4: { bg: 'bg-healing-green/15', text: 'text-healing-green', border: 'border-healing-green/40', hover: 'hover:bg-healing-green/25' },
  d6: { bg: 'bg-parchment/15', text: 'text-parchment', border: 'border-parchment/40', hover: 'hover:bg-parchment/25' },
  d8: { bg: 'bg-spell-blue/15', text: 'text-spell-blue', border: 'border-spell-blue/40', hover: 'hover:bg-spell-blue/25' },
  d10: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/40', hover: 'hover:bg-purple-500/25' },
  d12: { bg: 'bg-damage-red/15', text: 'text-damage-red', border: 'border-damage-red/40', hover: 'hover:bg-damage-red/25' },
  d20: { bg: 'bg-accent-gold/15', text: 'text-accent-gold', border: 'border-accent-gold/40', hover: 'hover:bg-accent-gold/25' },
  d100: { bg: 'bg-parchment/10', text: 'text-parchment/80', border: 'border-parchment/30', hover: 'hover:bg-parchment/20' },
}

const DIE_LABELS: Record<DieType, string> = {
  d4: 'd4',
  d6: 'd6',
  d8: 'd8',
  d10: 'd10',
  d12: 'd12',
  d20: 'd20',
  d100: 'd100',
}

interface DiceButtonProps {
  die: DieType
  onRoll: (die: DieType) => void
  disabled?: boolean
  active?: boolean
}

export function DiceButton({ die, onRoll, disabled = false, active = false }: DiceButtonProps) {
  const colors = DIE_COLORS[die]

  const handleClick = useCallback(() => {
    if (!disabled) {
      onRoll(die)
    }
  }, [die, onRoll, disabled])

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Roll ${DIE_LABELS[die]}`}
      data-testid={`dice-btn-${die}`}
      className={cn(
        'flex flex-col items-center justify-center gap-1',
        'w-12 h-12 rounded-lg border transition-all duration-150',
        'font-mono text-sm font-bold',
        'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
        colors.bg,
        colors.text,
        colors.border,
        colors.hover,
        active && 'ring-2 ring-accent-gold',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      {DIE_LABELS[die]}
    </button>
  )
}
