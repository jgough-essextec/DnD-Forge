/**
 * RollResult (Story 26.2)
 *
 * Displays the result of a dice roll prominently with modifier breakdown.
 * Shows critical hit/fumble highlights.
 *
 * Format: "Roll: [sum] + [mod] = [total]"
 * Advantage: "ADV: [high] / [low] + [mod] = [total]"
 */

import { cn } from '@/lib/utils'

interface RollResultProps {
  /** The total result including modifier */
  total: number
  /** Individual die results */
  results: number[]
  /** Modifier applied */
  modifier: number
  /** Whether advantage was active */
  advantage?: boolean
  /** Whether disadvantage was active */
  disadvantage?: boolean
  /** Optional label (e.g., "Stealth Check") */
  label?: string
  /** Is a natural 20 */
  isCritical?: boolean
  /** Is a natural 1 */
  isFumble?: boolean
  /** Whether to show the result (for animation timing) */
  visible?: boolean
}

export function RollResult({
  total,
  results,
  modifier,
  advantage = false,
  disadvantage = false,
  label,
  isCritical = false,
  isFumble = false,
  visible = true,
}: RollResultProps) {
  if (!visible || results.length === 0) {
    return null
  }

  const isAdvDis = advantage || disadvantage

  return (
    <div
      className={cn(
        'text-center py-3 transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      data-testid="roll-result"
      aria-live="assertive"
    >
      {label && (
        <div className="text-xs text-parchment/60 uppercase tracking-wider mb-1" data-testid="roll-label">
          {label}
        </div>
      )}

      {/* Total - large display */}
      <div
        className={cn(
          'text-4xl font-heading font-bold',
          isCritical && 'text-accent-gold',
          isFumble && 'text-damage-red',
          !isCritical && !isFumble && 'text-parchment',
        )}
        data-testid="roll-total"
      >
        {total}
      </div>

      {/* Critical / Fumble banner */}
      {isCritical && (
        <div className="text-xs font-bold text-accent-gold uppercase tracking-widest mt-1" data-testid="critical-banner">
          Natural 20!
        </div>
      )}
      {isFumble && (
        <div className="text-xs font-bold text-damage-red uppercase tracking-widest mt-1" data-testid="fumble-banner">
          Natural 1!
        </div>
      )}

      {/* Breakdown */}
      <div className="text-sm text-parchment/60 mt-1 font-mono" data-testid="roll-breakdown">
        {isAdvDis ? (
          <span>
            {advantage ? 'ADV' : 'DIS'}:{' '}
            {results.map((r, i) => {
              const kept = advantage ? r === Math.max(...results) : r === Math.min(...results)
              return (
                <span key={i}>
                  {i > 0 && ' / '}
                  <span
                    className={cn(
                      kept ? (advantage ? 'text-accent-gold font-bold' : 'text-damage-red font-bold') : '',
                      !kept ? 'line-through opacity-50' : '',
                    )}
                  >
                    {r}
                  </span>
                </span>
              )
            })}
            {modifier !== 0 && (
              <span>
                {' '}{modifier > 0 ? '+' : ''}{modifier}
              </span>
            )}
            {' '}= {total}
          </span>
        ) : (
          <span>
            {results.length > 1
              ? `[${results.join(' + ')}]`
              : results[0]}
            {modifier !== 0 && (
              <span>
                {' '}{modifier > 0 ? '+' : ''} {Math.abs(modifier)}
              </span>
            )}
            {(modifier !== 0 || results.length > 1) && ` = ${total}`}
          </span>
        )}
      </div>
    </div>
  )
}
