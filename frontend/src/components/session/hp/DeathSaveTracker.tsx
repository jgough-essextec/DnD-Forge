/**
 * DeathSaveTracker (Story 27.3)
 *
 * Enhanced death save interface with dice integration, auto-detection
 * when HP drops to 0, nat 20/1 handling, stabilize button, and
 * damage-at-zero processing.
 */

import { useState, useCallback } from 'react'
import type { DeathSaves } from '@/types/combat'
import { cn } from '@/lib/utils'
import { Skull, CheckCircle2, XCircle, Shield, Dices } from 'lucide-react'
import { processDeathSaveRoll, processDeathSaveDamage } from '@/utils/hp-tracker'
import { useDiceStore } from '@/stores/diceStore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DeathSaveTrackerProps {
  deathSaves: DeathSaves
  hpCurrent: number
  onUpdateDeathSaves: (saves: DeathSaves) => void
  onRegainHP: (hp: number) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DeathSaveTracker({
  deathSaves,
  hpCurrent,
  onUpdateDeathSaves,
  onRegainHP,
}: DeathSaveTrackerProps) {
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [rollAnimation, setRollAnimation] = useState(false)
  const diceStore = useDiceStore()

  const isAtZero = hpCurrent === 0
  const isDead = deathSaves.failures >= 3
  const isStabilized = deathSaves.stable || deathSaves.successes >= 3

  // Roll death save via dice engine
  const handleRollDeathSave = useCallback(() => {
    const diceResult = diceStore.roll(
      [{ type: 'd20', count: 1 }],
      0,
      'Death Save',
    )
    const roll = diceResult.results[0]

    setLastRoll(roll)
    setRollAnimation(true)
    setTimeout(() => setRollAnimation(false), 1000)

    const result = processDeathSaveRoll(deathSaves, roll)
    onUpdateDeathSaves(result.deathSaves)

    if (result.regainHP) {
      onRegainHP(1)
    }
  }, [deathSaves, diceStore, onUpdateDeathSaves, onRegainHP])

  // Manual toggle for success circles
  const handleToggleSuccess = useCallback((index: number) => {
    const newSuccesses = deathSaves.successes === index + 1 ? index : index + 1
    onUpdateDeathSaves({
      ...deathSaves,
      successes: newSuccesses as 0 | 1 | 2 | 3,
      stable: newSuccesses >= 3,
    })
  }, [deathSaves, onUpdateDeathSaves])

  // Manual toggle for failure circles
  const handleToggleFailure = useCallback((index: number) => {
    const newFailures = deathSaves.failures === index + 1 ? index : index + 1
    onUpdateDeathSaves({
      ...deathSaves,
      failures: newFailures as 0 | 1 | 2 | 3,
    })
  }, [deathSaves, onUpdateDeathSaves])

  // DM stabilize button
  const handleStabilize = useCallback(() => {
    onUpdateDeathSaves({
      successes: 3,
      failures: deathSaves.failures,
      stable: true,
    })
  }, [deathSaves.failures, onUpdateDeathSaves])

  // Reset death saves
  const handleReset = useCallback(() => {
    onUpdateDeathSaves({ successes: 0, failures: 0, stable: false })
    setLastRoll(null)
  }, [onUpdateDeathSaves])

  // Process damage while at 0 HP
  const handleDamageAtZero = useCallback((isCritical: boolean) => {
    const result = processDeathSaveDamage(deathSaves, isCritical)
    onUpdateDeathSaves(result)
  }, [deathSaves, onUpdateDeathSaves])

  // Don't render if character is not at 0 HP and has no death save progress
  if (!isAtZero && deathSaves.successes === 0 && deathSaves.failures === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-4 space-y-3',
        isDead
          ? 'border-damage-red/50 bg-damage-red/5'
          : isStabilized
            ? 'border-healing-green/50 bg-healing-green/5'
            : 'border-yellow-500/50 bg-yellow-500/5',
      )}
      data-testid="death-save-tracker"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skull className={cn(
            'w-5 h-5',
            isDead ? 'text-damage-red' : 'text-parchment/60',
          )} />
          <span className="text-sm font-heading font-semibold text-parchment">
            Death Saves
          </span>
          {isAtZero && !isDead && !isStabilized && (
            <span className="text-xs text-yellow-400 animate-pulse">
              UNCONSCIOUS
            </span>
          )}
        </div>

        {(deathSaves.successes > 0 || deathSaves.failures > 0) && (
          <button
            onClick={handleReset}
            className="text-xs text-parchment/50 hover:text-parchment transition-colors"
            aria-label="Reset death saves"
            data-testid="reset-death-saves"
            type="button"
          >
            Reset
          </button>
        )}
      </div>

      {/* Success circles */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-healing-green w-16">Successes</span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((index) => (
            <button
              key={`success-${index}`}
              onClick={() => handleToggleSuccess(index)}
              className={cn(
                'w-7 h-7 rounded-full border-2 transition-all duration-200',
                deathSaves.successes > index
                  ? 'bg-healing-green border-healing-green scale-110'
                  : 'bg-transparent border-parchment/30 hover:border-healing-green/50',
              )}
              aria-label={`Death save success ${index + 1}`}
              data-testid={`death-save-success-${index}`}
              type="button"
            />
          ))}
        </div>
      </div>

      {/* Failure circles */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-damage-red w-16">Failures</span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((index) => (
            <button
              key={`failure-${index}`}
              onClick={() => handleToggleFailure(index)}
              className={cn(
                'w-7 h-7 rounded-full border-2 transition-all duration-200',
                deathSaves.failures > index
                  ? 'bg-damage-red border-damage-red scale-110'
                  : 'bg-transparent border-parchment/30 hover:border-damage-red/50',
              )}
              aria-label={`Death save failure ${index + 1}`}
              data-testid={`death-save-failure-${index}`}
              type="button"
            />
          ))}
        </div>
      </div>

      {/* Last roll display */}
      {lastRoll !== null && (
        <div
          className={cn(
            'text-center text-lg font-heading font-bold transition-transform',
            rollAnimation && 'scale-125',
            lastRoll === 20
              ? 'text-accent-gold'
              : lastRoll === 1
                ? 'text-damage-red'
                : lastRoll >= 10
                  ? 'text-healing-green'
                  : 'text-damage-red',
          )}
          data-testid="last-roll-display"
        >
          Rolled: {lastRoll}
          {lastRoll === 20 && ' - Natural 20! Regain 1 HP!'}
          {lastRoll === 1 && ' - Natural 1! Two failures!'}
        </div>
      )}

      {/* Action buttons */}
      {isAtZero && !isDead && !isStabilized && (
        <div className="space-y-2">
          {/* Roll Death Save */}
          <button
            onClick={handleRollDeathSave}
            className="w-full flex items-center justify-center gap-2 bg-accent-gold/20 border border-accent-gold/50 text-accent-gold rounded-lg py-2.5 hover:bg-accent-gold/30 transition-colors font-semibold text-sm"
            aria-label="Roll death save"
            data-testid="roll-death-save"
            type="button"
          >
            <Dices className="w-4 h-4" />
            Roll Death Save
          </button>

          {/* Stabilize (DM) */}
          <button
            onClick={handleStabilize}
            className="w-full flex items-center justify-center gap-2 bg-healing-green/10 border border-healing-green/30 text-healing-green rounded-lg py-2 hover:bg-healing-green/20 transition-colors text-sm"
            aria-label="Stabilize character"
            data-testid="stabilize-button"
            type="button"
          >
            <Shield className="w-4 h-4" />
            Stabilize (DM)
          </button>

          {/* Damage at zero buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleDamageAtZero(false)}
              className="flex-1 bg-damage-red/10 border border-damage-red/30 text-damage-red rounded py-1.5 hover:bg-damage-red/20 transition-colors text-xs"
              aria-label="Take damage at zero HP"
              data-testid="damage-at-zero"
              type="button"
            >
              Hit (+1 fail)
            </button>
            <button
              onClick={() => handleDamageAtZero(true)}
              className="flex-1 bg-damage-red/10 border border-damage-red/30 text-damage-red rounded py-1.5 hover:bg-damage-red/20 transition-colors text-xs"
              aria-label="Take critical hit at zero HP"
              data-testid="critical-at-zero"
              type="button"
            >
              Crit (+2 fail)
            </button>
          </div>
        </div>
      )}

      {/* Status Indicators */}
      {isStabilized && !isDead && (
        <div className="flex items-center gap-2 justify-center text-healing-green text-sm" data-testid="stabilized-status">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">Stabilized</span>
        </div>
      )}
      {isDead && (
        <div className="flex items-center gap-2 justify-center text-damage-red text-sm" data-testid="dead-status">
          <XCircle className="w-5 h-5" />
          <span className="font-semibold">Dead</span>
        </div>
      )}
    </div>
  )
}
