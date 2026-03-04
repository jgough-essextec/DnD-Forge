/**
 * AdvantageToggle (Story 26.3)
 *
 * Tri-state toggle for Normal / Advantage / Disadvantage.
 * Mutual exclusivity: activating one deactivates the other.
 * Supports a "lock" mode to persist state across rolls.
 */

import { useCallback } from 'react'
import { Lock, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AdvantageState = 'normal' | 'advantage' | 'disadvantage'

interface AdvantageToggleProps {
  state: AdvantageState
  locked: boolean
  onStateChange: (state: AdvantageState) => void
  onLockedChange: (locked: boolean) => void
}

export function AdvantageToggle({
  state,
  locked,
  onStateChange,
  onLockedChange,
}: AdvantageToggleProps) {
  const handleAdvantage = useCallback(() => {
    onStateChange(state === 'advantage' ? 'normal' : 'advantage')
  }, [state, onStateChange])

  const handleDisadvantage = useCallback(() => {
    onStateChange(state === 'disadvantage' ? 'normal' : 'disadvantage')
  }, [state, onStateChange])

  const handleLockToggle = useCallback(() => {
    onLockedChange(!locked)
  }, [locked, onLockedChange])

  return (
    <div className="flex items-center gap-2" data-testid="advantage-toggle">
      <button
        onClick={handleAdvantage}
        aria-label="Toggle advantage"
        aria-pressed={state === 'advantage'}
        data-testid="adv-btn"
        className={cn(
          'px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all',
          'border focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
          state === 'advantage'
            ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/60'
            : 'bg-transparent text-parchment/50 border-parchment/20 hover:text-parchment/80 hover:border-parchment/40',
        )}
      >
        ADV
      </button>

      <button
        onClick={handleDisadvantage}
        aria-label="Toggle disadvantage"
        aria-pressed={state === 'disadvantage'}
        data-testid="dis-btn"
        className={cn(
          'px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all',
          'border focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
          state === 'disadvantage'
            ? 'bg-damage-red/20 text-damage-red border-damage-red/60'
            : 'bg-transparent text-parchment/50 border-parchment/20 hover:text-parchment/80 hover:border-parchment/40',
        )}
      >
        DIS
      </button>

      <button
        onClick={handleLockToggle}
        aria-label={locked ? 'Unlock advantage/disadvantage' : 'Lock advantage/disadvantage'}
        data-testid="lock-btn"
        className={cn(
          'p-1.5 rounded transition-all',
          'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
          locked
            ? 'text-accent-gold'
            : 'text-parchment/40 hover:text-parchment/60',
        )}
      >
        {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
