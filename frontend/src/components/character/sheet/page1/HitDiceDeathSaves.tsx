/**
 * HitDiceDeathSaves (Story 17.7)
 *
 * Displays hit dice tracking and death saving throws with roll button.
 * Supports manual circle toggling and auto-roll with critical handling.
 */

import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { Dices, Skull, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HitDiceDeathSaves() {
  const { character, editableCharacter, updateField } = useCharacterSheet()

  const displayCharacter = character ? { ...character, ...editableCharacter } : null

  if (!displayCharacter) {
    return null
  }

  // Get hit die type for first class
  const primaryClass = displayCharacter.classes[0]
  const hitDieType = getHitDieForClass(primaryClass?.classId ?? 'fighter')
  const hitDiceTotal = displayCharacter.hitDiceTotal[0] ?? 1
  const hitDiceUsed = displayCharacter.hitDiceUsed[0] ?? 0

  const deathSaves = displayCharacter.deathSaves

  const handleHitDiceChange = (delta: number) => {
    const newUsed = Math.max(0, Math.min(hitDiceTotal, hitDiceUsed + delta))
    updateField('hitDiceUsed', [newUsed, ...displayCharacter.hitDiceUsed.slice(1)])
  }

  const handleDeathSaveRoll = () => {
    const roll = Math.floor(Math.random() * 20) + 1
    let newSuccesses = deathSaves.successes
    let newFailures = deathSaves.failures

    if (roll === 20) {
      // Critical success: restore 1 HP
      updateField('hpCurrent', 1)
      updateField('deathSaves', { successes: 0, failures: 0, stable: false })
      return
    } else if (roll === 1) {
      // Critical failure: 2 failures
      newFailures = Math.min(3, deathSaves.failures + 2) as 0 | 1 | 2 | 3
    } else if (roll >= 10) {
      // Success
      newSuccesses = Math.min(3, deathSaves.successes + 1) as 0 | 1 | 2 | 3
    } else {
      // Failure
      newFailures = Math.min(3, deathSaves.failures + 1) as 0 | 1 | 2 | 3
    }

    updateField('deathSaves', {
      successes: newSuccesses,
      failures: newFailures,
      stable: newSuccesses >= 3,
    })
  }

  const handleToggleSuccess = (index: number) => {
    const newSuccesses = deathSaves.successes === index + 1 ? index : index + 1
    updateField('deathSaves', {
      ...deathSaves,
      successes: newSuccesses as 0 | 1 | 2 | 3,
    })
  }

  const handleToggleFailure = (index: number) => {
    const newFailures = deathSaves.failures === index + 1 ? index : index + 1
    updateField('deathSaves', {
      ...deathSaves,
      failures: newFailures as 0 | 1 | 2 | 3,
    })
  }

  const handleResetDeathSaves = () => {
    updateField('deathSaves', { successes: 0, failures: 0, stable: false })
  }

  return (
    <div
      className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-4 space-y-4"
      data-testid="hit-dice-death-saves"
    >
      {/* Hit Dice */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-parchment/60 font-semibold">
            Hit Dice
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleHitDiceChange(-1)}
              disabled={hitDiceUsed === 0}
              className="p-1 rounded hover:bg-bg-primary/50 text-parchment/60 hover:text-parchment transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Spend hit die"
            >
              <Dices className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleHitDiceChange(1)}
              disabled={hitDiceUsed >= hitDiceTotal}
              className="p-1 rounded hover:bg-bg-primary/50 text-parchment/60 hover:text-parchment transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Restore hit die"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="text-center">
          <span className="text-sm text-parchment">
            Used: <span className="font-semibold">{hitDiceUsed}</span> / Total:{' '}
            <span className="font-semibold">
              {hitDiceTotal}d{hitDieType}
            </span>
          </span>
        </div>
      </div>

      {/* Death Saves */}
      <div className="pt-3 border-t border-parchment/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Skull className="w-4 h-4 text-parchment/60" />
            <span className="text-xs uppercase tracking-wider text-parchment/60 font-semibold">
              Death Saves
            </span>
          </div>
          {(deathSaves.successes > 0 || deathSaves.failures > 0) && (
            <button
              onClick={handleResetDeathSaves}
              className="text-xs text-parchment/50 hover:text-parchment transition-colors"
              aria-label="Reset death saves"
            >
              Reset
            </button>
          )}
        </div>

        {/* Successes */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-healing-green w-20">Successes:</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((index) => (
              <button
                key={`success-${index}`}
                onClick={() => handleToggleSuccess(index)}
                className={cn(
                  'w-6 h-6 rounded-full border-2 transition-colors',
                  deathSaves.successes > index
                    ? 'bg-healing-green border-healing-green'
                    : 'bg-transparent border-parchment/30 hover:border-healing-green/50'
                )}
                aria-label={`Death save success ${index + 1}`}
                data-testid={`death-save-success-${index}`}
              />
            ))}
          </div>
        </div>

        {/* Failures */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-damage-red w-20">Failures:</span>
          <div className="flex gap-1">
            {[0, 1, 2].map((index) => (
              <button
                key={`failure-${index}`}
                onClick={() => handleToggleFailure(index)}
                className={cn(
                  'w-6 h-6 rounded-full border-2 transition-colors',
                  deathSaves.failures > index
                    ? 'bg-damage-red border-damage-red'
                    : 'bg-transparent border-parchment/30 hover:border-damage-red/50'
                )}
                aria-label={`Death save failure ${index + 1}`}
                data-testid={`death-save-failure-${index}`}
              />
            ))}
          </div>
        </div>

        {/* Roll Button */}
        {displayCharacter.hpCurrent === 0 && (
          <button
            onClick={handleDeathSaveRoll}
            className="w-full bg-accent-gold/20 border border-accent-gold/50 text-accent-gold rounded py-2 hover:bg-accent-gold/30 transition-colors font-semibold text-sm"
            aria-label="Roll death save"
          >
            Roll Death Save
          </button>
        )}

        {/* Status Indicators */}
        {deathSaves.successes >= 3 && (
          <div className="flex items-center gap-2 justify-center mt-2 text-healing-green text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">Stabilized</span>
          </div>
        )}
        {deathSaves.failures >= 3 && (
          <div className="flex items-center gap-2 justify-center mt-2 text-damage-red text-sm">
            <XCircle className="w-4 h-4" />
            <span className="font-semibold">Dead</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get hit die type for a class
function getHitDieForClass(classId: string): number {
  const hitDiceMap: Record<string, number> = {
    barbarian: 12,
    fighter: 10,
    paladin: 10,
    ranger: 10,
    bard: 8,
    cleric: 8,
    druid: 8,
    monk: 8,
    rogue: 8,
    warlock: 8,
    sorcerer: 6,
    wizard: 6,
  }
  return hitDiceMap[classId] ?? 8
}
