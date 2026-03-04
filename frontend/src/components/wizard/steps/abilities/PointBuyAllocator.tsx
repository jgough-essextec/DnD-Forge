// =============================================================================
// Story 11.3 -- PointBuyAllocator
// Interactive Point Buy allocator with 27-point budget, increment/decrement
// controls, real-time cost tracking, and quick presets.
// =============================================================================

import { useMemo, useCallback } from 'react'
import type { AbilityScores, AbilityName } from '@/types/core'
import { ABILITY_NAMES } from '@/types/core'
import {
  POINT_BUY_COSTS,
  POINT_BUY_BUDGET,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
} from '@/data/reference'
import { getModifier } from '@/utils/calculations/ability'
import { cn } from '@/lib/utils'

interface PointBuyAllocatorProps {
  scores: AbilityScores
  onScoresChange: (scores: AbilityScores) => void
  racialBonuses: Partial<AbilityScores>
}

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

/** Get marginal cost of incrementing from current score to current + 1. */
function getMarginalCost(score: number): number {
  if (score >= POINT_BUY_MAX) return 0
  return POINT_BUY_COSTS[score + 1] - POINT_BUY_COSTS[score]
}

/** Get marginal refund of decrementing from current score to current - 1. */
function getMarginalRefund(score: number): number {
  if (score <= POINT_BUY_MIN) return 0
  return POINT_BUY_COSTS[score] - POINT_BUY_COSTS[score - 1]
}

// -- Quick Presets --

interface Preset {
  label: string
  description: string
  values: AbilityScores
}

const PRESETS: Preset[] = [
  {
    label: 'Balanced',
    description: '13, 13, 13, 12, 12, 12 (27 pts)',
    values: {
      strength: 13,
      dexterity: 13,
      constitution: 13,
      intelligence: 12,
      wisdom: 12,
      charisma: 12,
    },
  },
  {
    label: 'Min-Max',
    description: '15, 15, 15, 8, 8, 8 (27 pts)',
    values: {
      strength: 8,
      dexterity: 15,
      constitution: 15,
      intelligence: 8,
      wisdom: 8,
      charisma: 15,
    },
  },
  {
    label: 'MAD Build',
    description: '15, 14, 13, 12, 10, 8 (27 pts)',
    values: {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    },
  },
]

export function PointBuyAllocator({
  scores,
  onScoresChange,
  racialBonuses,
}: PointBuyAllocatorProps) {
  const pointsUsed = useMemo(() => {
    let total = 0
    for (const ability of ABILITY_NAMES) {
      const score = scores[ability]
      if (score >= POINT_BUY_MIN && score <= POINT_BUY_MAX) {
        total += POINT_BUY_COSTS[score]
      }
    }
    return total
  }, [scores])

  const pointsRemaining = POINT_BUY_BUDGET - pointsUsed

  const increment = useCallback(
    (ability: AbilityName) => {
      const current = scores[ability]
      if (current >= POINT_BUY_MAX) return
      const cost = getMarginalCost(current)
      if (cost > pointsRemaining) return
      onScoresChange({ ...scores, [ability]: current + 1 })
    },
    [scores, pointsRemaining, onScoresChange],
  )

  const decrement = useCallback(
    (ability: AbilityName) => {
      const current = scores[ability]
      if (current <= POINT_BUY_MIN) return
      onScoresChange({ ...scores, [ability]: current - 1 })
    },
    [scores, onScoresChange],
  )

  const applyPreset = useCallback(
    (preset: Preset) => {
      onScoresChange(preset.values)
    },
    [onScoresChange],
  )

  const resetAll = useCallback(() => {
    onScoresChange({
      strength: 8,
      dexterity: 8,
      constitution: 8,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    })
  }, [onScoresChange])

  return (
    <div className="space-y-4" data-testid="point-buy-allocator">
      {/* Points Remaining */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-parchment/60">Points Remaining:</span>
          <span
            data-testid="points-remaining"
            className={cn(
              'text-lg font-bold font-mono',
              pointsRemaining > 0 && 'text-emerald-400',
              pointsRemaining === 0 && 'text-accent-gold',
              pointsRemaining < 0 && 'text-red-400',
            )}
          >
            {pointsRemaining}
          </span>
          <span className="text-sm text-parchment/40">/ {POINT_BUY_BUDGET}</span>
        </div>
        <button
          onClick={resetAll}
          className={cn(
            'text-sm px-3 py-1 rounded-md',
            'text-parchment/50 hover:text-parchment',
            'border border-parchment/20 hover:border-parchment/40',
            'transition-colors',
          )}
          data-testid="reset-button"
        >
          Reset
        </button>
      </div>

      {/* Points warning */}
      {pointsRemaining > 0 && pointsRemaining < POINT_BUY_BUDGET && (
        <p className="text-xs text-amber-400/70" data-testid="points-warning">
          You have {pointsRemaining} point{pointsRemaining !== 1 ? 's' : ''} remaining to spend.
        </p>
      )}

      {/* Ability Rows */}
      <div className="space-y-2" data-testid="ability-rows">
        {ABILITY_NAMES.map((ability) => {
          const score = scores[ability]
          const bonus = racialBonuses[ability] ?? 0
          const total = score + bonus
          const modifier = getModifier(total)
          const cost = POINT_BUY_COSTS[score] ?? 0
          const canIncrement =
            score < POINT_BUY_MAX && getMarginalCost(score) <= pointsRemaining
          const canDecrement = score > POINT_BUY_MIN
          const nextCost = score < POINT_BUY_MAX ? getMarginalCost(score) : 0

          return (
            <div
              key={ability}
              className="flex items-center gap-2 p-2 rounded-lg bg-bg-secondary border border-parchment/10"
              data-testid={`ability-row-${ability}`}
            >
              {/* Ability Label */}
              <span className="text-sm font-semibold text-parchment/60 uppercase tracking-wider w-10">
                {ABILITY_LABELS[ability]}
              </span>

              {/* Decrement */}
              <button
                onClick={() => decrement(ability)}
                disabled={!canDecrement}
                aria-label={`Decrease ${ability}`}
                data-testid={`decrement-${ability}`}
                className={cn(
                  'w-8 h-8 rounded-md flex items-center justify-center text-lg font-bold',
                  'border transition-colors',
                  canDecrement
                    ? 'border-parchment/30 text-parchment hover:bg-parchment/10 hover:border-parchment/50'
                    : 'border-parchment/10 text-parchment/20 cursor-not-allowed',
                )}
              >
                -
              </button>

              {/* Score Display */}
              <span
                className="text-lg font-bold text-parchment w-8 text-center"
                data-testid={`score-${ability}`}
              >
                {score}
              </span>

              {/* Increment */}
              <button
                onClick={() => increment(ability)}
                disabled={!canIncrement}
                aria-label={`Increase ${ability}`}
                data-testid={`increment-${ability}`}
                className={cn(
                  'w-8 h-8 rounded-md flex items-center justify-center text-lg font-bold',
                  'border transition-colors',
                  canIncrement
                    ? 'border-parchment/30 text-parchment hover:bg-parchment/10 hover:border-parchment/50'
                    : 'border-parchment/10 text-parchment/20 cursor-not-allowed',
                )}
              >
                +
              </button>

              {/* Cost info */}
              <span className="text-xs text-parchment/40 w-14 text-center">
                Cost: {cost}
              </span>

              {/* Next increment cost hint */}
              {nextCost > 0 && canIncrement && (
                <span className="text-xs text-parchment/30 w-12">
                  (+{nextCost})
                </span>
              )}
              {!canIncrement && score < POINT_BUY_MAX && (
                <span className="text-xs text-parchment/20 w-12">
                  (+{nextCost})
                </span>
              )}
              {score >= POINT_BUY_MAX && (
                <span className="text-xs text-parchment/20 w-12">max</span>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Racial Bonus */}
              {bonus !== 0 && (
                <span
                  className="text-xs text-accent-gold/80"
                  data-testid={`racial-bonus-${ability}`}
                >
                  {bonus > 0 ? '+' : ''}{bonus}
                </span>
              )}

              {/* Total (if racial bonus) */}
              {bonus !== 0 && (
                <span className="text-sm text-parchment/50">= {total}</span>
              )}

              {/* Modifier */}
              <span
                className={cn(
                  'text-sm font-mono font-semibold px-2 py-0.5 rounded min-w-[36px] text-center',
                  modifier >= 0
                    ? 'text-emerald-400 bg-emerald-400/10'
                    : 'text-red-400 bg-red-400/10',
                )}
              >
                {formatModifier(modifier)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Quick Presets */}
      <div>
        <p className="text-xs text-parchment/50 mb-2 uppercase tracking-wider">
          Quick Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              data-testid={`preset-${preset.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={cn(
                'text-xs px-3 py-1.5 rounded-md',
                'border border-parchment/20 text-parchment/60',
                'hover:border-accent-gold/40 hover:text-parchment',
                'transition-colors',
              )}
              title={preset.description}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
