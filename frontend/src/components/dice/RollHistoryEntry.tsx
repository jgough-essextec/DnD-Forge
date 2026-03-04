/**
 * RollHistoryEntry (Story 26.4)
 *
 * A single entry in the roll history list. Shows label, dice expression,
 * individual results, total, and timestamp. Color-coded for criticals.
 * Click to re-roll the same expression.
 */

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { DiceRoll } from '@/stores/diceStore'

interface RollHistoryEntryProps {
  roll: DiceRoll
  onReroll: (roll: DiceRoll) => void
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatExpression(roll: DiceRoll): string {
  const parts = roll.dice.map((d) => `${d.count}${d.type}`)
  let expr = parts.join(' + ')
  if (roll.modifier > 0) expr += ` + ${roll.modifier}`
  else if (roll.modifier < 0) expr += ` - ${Math.abs(roll.modifier)}`
  return expr
}

/**
 * Detect if any d20 in the roll was a natural 20 or natural 1.
 */
function detectCritical(roll: DiceRoll): { isCrit: boolean; isFumble: boolean } {
  const hasD20 = roll.dice.some((d) => d.type === 'd20')
  if (!hasD20) return { isCrit: false, isFumble: false }

  let d20Index = 0
  for (const d of roll.dice) {
    if (d.type === 'd20') {
      const d20Result = roll.results[d20Index]
      return {
        isCrit: d20Result === 20,
        isFumble: d20Result === 1,
      }
    }
    d20Index += d.count
  }
  return { isCrit: false, isFumble: false }
}

export function RollHistoryEntry({ roll, onReroll }: RollHistoryEntryProps) {
  const { isCrit, isFumble } = detectCritical(roll)

  const handleClick = useCallback(() => {
    onReroll(roll)
  }, [roll, onReroll])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onReroll(roll)
      }
    },
    [roll, onReroll],
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Re-roll ${roll.label ?? formatExpression(roll)}: total ${roll.total}`}
      data-testid="roll-history-entry"
      className={cn(
        'px-3 py-2 rounded-lg border cursor-pointer transition-all',
        'hover:bg-bg-primary/50',
        isCrit && 'border-accent-gold/50 bg-accent-gold/5',
        isFumble && 'border-damage-red/50 bg-damage-red/5',
        !isCrit && !isFumble && 'border-parchment/10 bg-transparent',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          {roll.label && (
            <div className="text-xs text-parchment/60 truncate" data-testid="history-label">
              {roll.label}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-parchment/80" data-testid="history-expression">
              {formatExpression(roll)}
            </span>
            {(roll.advantage || roll.disadvantage) && (
              <span
                className={cn(
                  'text-[10px] font-bold uppercase px-1 rounded',
                  roll.advantage && 'bg-accent-gold/20 text-accent-gold',
                  roll.disadvantage && 'bg-damage-red/20 text-damage-red',
                )}
              >
                {roll.advantage ? 'ADV' : 'DIS'}
              </span>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div
            className={cn(
              'text-lg font-bold font-heading',
              isCrit && 'text-accent-gold',
              isFumble && 'text-damage-red',
              !isCrit && !isFumble && 'text-parchment',
            )}
            data-testid="history-total"
          >
            {roll.total}
          </div>
          <div className="text-[10px] text-parchment/40" data-testid="history-timestamp">
            {formatTimestamp(roll.timestamp)}
          </div>
        </div>
      </div>

      {/* Individual results */}
      <div className="text-[11px] text-parchment/40 font-mono mt-1" data-testid="history-results">
        [{roll.results.join(', ')}]
        {roll.modifier !== 0 && (
          <span>
            {' '}{roll.modifier > 0 ? '+' : ''}{roll.modifier}
          </span>
        )}
      </div>
    </div>
  )
}
