/**
 * ExhaustionTracker (Story 29.3)
 *
 * Special exhaustion level tracker (1-6 levels) with cumulative effects.
 * Shows increment/decrement buttons, level indicator, and effect descriptions.
 * Visual warning at dangerous levels (4+).
 */

import { Battery, Plus, Minus, AlertTriangle, SkullIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EXHAUSTION_LEVEL_EFFECTS } from '@/data/conditions'
import { getExhaustionEffects } from '@/utils/conditions'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ExhaustionTrackerProps {
  level: number
  onSetLevel: (level: number) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExhaustionTracker({ level, onSetLevel }: ExhaustionTrackerProps) {
  const effects = getExhaustionEffects(level)
  const isDangerous = level >= 4
  const isDeath = level >= 6

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        isDeath
          ? 'border-red-500/50 bg-red-500/10'
          : isDangerous
            ? 'border-orange-500/40 bg-orange-500/5'
            : 'border-parchment/20 bg-surface-darker',
      )}
      data-testid="exhaustion-tracker"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Battery size={18} className={isDangerous ? 'text-red-400' : 'text-orange-400'} />
          <h3 className={cn(
            'text-sm font-semibold',
            isDeath ? 'text-red-400' : isDangerous ? 'text-orange-400' : 'text-parchment',
          )}>
            Exhaustion
          </h3>
          {isDangerous && !isDeath && (
            <AlertTriangle size={14} className="text-orange-400" data-testid="exhaustion-warning-icon" />
          )}
          {isDeath && (
            <SkullIcon size={14} className="text-red-400" data-testid="exhaustion-death-icon" />
          )}
        </div>

        {/* Level Stepper */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-md border border-parchment/30 text-parchment/60 hover:text-parchment hover:border-parchment/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => onSetLevel(level - 1)}
            disabled={level <= 0}
            aria-label="Decrease exhaustion level"
            data-testid="exhaustion-decrease"
          >
            <Minus size={14} />
          </button>

          <div className="flex items-center gap-1">
            <span
              className={cn(
                'text-xl font-bold font-mono min-w-[1.5rem] text-center',
                isDeath
                  ? 'text-red-400'
                  : isDangerous
                    ? 'text-orange-400'
                    : level > 0
                      ? 'text-parchment'
                      : 'text-parchment/40',
              )}
              data-testid="exhaustion-level"
            >
              {level}
            </span>
            <span className="text-xs text-parchment/40">/ 6</span>
          </div>

          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-md border border-parchment/30 text-parchment/60 hover:text-parchment hover:border-parchment/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => onSetLevel(level + 1)}
            disabled={level >= 6}
            aria-label="Increase exhaustion level"
            data-testid="exhaustion-increase"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Level bars visualization */}
      <div className="flex gap-1 mb-3" data-testid="exhaustion-bars">
        {Array.from({ length: 6 }, (_, i) => {
          const barLevel = i + 1
          const isFilled = barLevel <= level
          const barDangerous = barLevel >= 4
          return (
            <div
              key={barLevel}
              className={cn(
                'flex-1 h-2 rounded-full transition-colors',
                isFilled
                  ? barDangerous
                    ? barLevel >= 6
                      ? 'bg-red-500'
                      : 'bg-orange-500'
                    : 'bg-orange-400/60'
                  : 'bg-parchment/10',
              )}
              aria-label={`Exhaustion level ${barLevel}${isFilled ? ' (active)' : ''}`}
            />
          )
        })}
      </div>

      {/* Effects list */}
      {level > 0 && (
        <div className="space-y-1.5" data-testid="exhaustion-effects-list">
          {EXHAUSTION_LEVEL_EFFECTS.map((effect, i) => {
            const effectLevel = i + 1
            const isActiveEffect = effectLevel <= level
            return (
              <div
                key={effectLevel}
                className={cn(
                  'flex items-start gap-2 text-xs',
                  isActiveEffect ? 'text-parchment' : 'text-parchment/30',
                )}
                data-testid={`exhaustion-effect-${effectLevel}`}
              >
                <span className={cn(
                  'font-mono font-bold min-w-[1rem]',
                  isActiveEffect
                    ? effectLevel >= 6
                      ? 'text-red-400'
                      : effectLevel >= 4
                        ? 'text-orange-400'
                        : 'text-parchment'
                    : 'text-parchment/30',
                )}>
                  {effectLevel}
                </span>
                <span className={cn(
                  isActiveEffect && effectLevel >= 6 && 'text-red-400 font-bold',
                  isActiveEffect && effectLevel >= 4 && effectLevel < 6 && 'text-orange-400',
                )}>
                  {effect}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* No exhaustion placeholder */}
      {level === 0 && (
        <p className="text-xs text-parchment/40 italic" data-testid="no-exhaustion-placeholder">
          No exhaustion. Use the + button to add exhaustion levels.
        </p>
      )}

      {/* Active effects summary */}
      {level > 0 && effects.length > 0 && (
        <div
          className={cn(
            'mt-3 pt-3 border-t',
            isDeath ? 'border-red-500/30' : 'border-parchment/10',
          )}
          data-testid="exhaustion-active-summary"
        >
          <p className="text-xs text-parchment/50 mb-1">Active effects:</p>
          <p className={cn(
            'text-xs',
            isDangerous ? 'text-orange-400' : 'text-parchment/70',
          )}>
            {effects.join('; ')}
          </p>
        </div>
      )}

      {/* Death warning */}
      {isDeath && (
        <div
          className="mt-3 p-2 rounded bg-red-500/15 border border-red-500/40 text-center"
          role="alert"
          data-testid="exhaustion-death-banner"
        >
          <p className="text-sm font-bold text-red-400">
            Your character dies from exhaustion!
          </p>
        </div>
      )}
    </div>
  )
}
