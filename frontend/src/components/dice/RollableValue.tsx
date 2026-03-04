/**
 * RollableValue (Story 26.5)
 *
 * Wrapper component for character sheet values that are clickable to roll.
 * Shows a subtle d20 icon on hover. Clicking triggers a roll via the dice store
 * with the correct modifier and label.
 */

import { useCallback } from 'react'
import { Dice5 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDiceStore } from '@/stores/diceStore'
import { useUIStore } from '@/stores/uiStore'

interface RollableValueProps {
  /** The modifier to apply to the d20 roll */
  modifier: number
  /** Label for the roll (e.g., "Stealth Check (+7)") */
  label: string
  /** Child elements to wrap */
  children: React.ReactNode
  /** Whether the rollable is disabled (e.g., in edit mode) */
  disabled?: boolean
  /** Optional custom class */
  className?: string
}

export function RollableValue({
  modifier,
  label,
  children,
  disabled = false,
  className,
}: RollableValueProps) {
  const roll = useDiceStore((s) => s.roll)
  const diceRollerOpen = useUIStore((s) => s.diceRollerOpen)
  const toggleDiceRoller = useUIStore((s) => s.toggleDiceRoller)

  const handleRoll = useCallback(() => {
    if (disabled) return

    // Open the dice panel if not already open
    if (!diceRollerOpen) {
      toggleDiceRoller()
    }

    // Roll 1d20 + modifier with the label
    const modSign = modifier >= 0 ? `+${modifier}` : `${modifier}`
    roll(
      [{ type: 'd20', count: 1 }],
      modifier,
      `${label} (${modSign})`,
    )
  }, [disabled, diceRollerOpen, toggleDiceRoller, roll, modifier, label])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleRoll()
      }
    },
    [disabled, handleRoll],
  )

  if (disabled) {
    return <>{children}</>
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleRoll}
      onKeyDown={handleKeyDown}
      aria-label={`Roll ${label}`}
      data-testid={`rollable-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className={cn(
        'inline-flex items-center gap-1 cursor-pointer group',
        'hover:text-accent-gold transition-colors',
        className,
      )}
    >
      {children}
      <Dice5
        className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity text-accent-gold"
        aria-hidden="true"
      />
    </span>
  )
}
