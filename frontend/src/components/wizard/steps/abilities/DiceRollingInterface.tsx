// =============================================================================
// Story 11.4 -- DiceRollingInterface
// Two-phase rolling interface: Phase 1 rolls 4d6 drop lowest six times,
// Phase 2 assigns the results to abilities.
// =============================================================================

import { useState, useCallback, useMemo, useRef } from 'react'
import type { AbilityScores, AbilityName } from '@/types/core'
import { ABILITY_NAMES } from '@/types/core'
import { rollAbilityScore } from '@/utils/dice'
import { getModifier } from '@/utils/calculations/ability'
import { cn } from '@/lib/utils'

interface DiceRollingInterfaceProps {
  scores: AbilityScores
  onScoresChange: (scores: AbilityScores) => void
  racialBonuses: Partial<AbilityScores>
}

interface RollResult {
  rolls: number[]
  dropped: number
  total: number
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

// -- Die Face Component --

function DieFace({
  value,
  isDropped,
  isRolling,
}: {
  value: number
  isDropped: boolean
  isRolling: boolean
}) {
  return (
    <div
      data-testid={`die-face-${value}`}
      className={cn(
        'w-10 h-10 rounded-md flex items-center justify-center',
        'text-lg font-bold border-2 transition-all',
        isRolling && 'animate-bounce',
        isDropped
          ? 'border-red-400/30 bg-red-400/5 text-red-400/40 line-through'
          : 'border-parchment/30 bg-bg-secondary text-parchment',
      )}
    >
      {value}
    </div>
  )
}

// -- Roll Slot Component --

function RollSlot({
  index,
  result,
  isRolling,
  onRoll,
}: {
  index: number
  result: RollResult | null
  isRolling: boolean
  onRoll: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all',
        result
          ? 'border-parchment/20 bg-bg-secondary'
          : 'border-dashed border-parchment/15 bg-bg-secondary/50',
      )}
      data-testid={`roll-slot-${index}`}
    >
      <span className="text-sm text-parchment/40 w-8">#{index + 1}</span>

      {result ? (
        <>
          <div className="flex gap-1">
            {result.rolls.map((die, dIdx) => (
              <DieFace
                key={dIdx}
                value={die}
                isDropped={die === result.dropped && !result.rolls.slice(0, dIdx).some(
                  (prev, pIdx) => prev === result.dropped && result.rolls.indexOf(result.dropped) === pIdx
                )}
                isRolling={false}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-parchment/40">Total:</span>
            <span className="text-xl font-bold text-accent-gold" data-testid={`roll-total-${index}`}>
              {result.total}
            </span>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between flex-1">
          <span className="text-sm text-parchment/30 italic">
            {isRolling ? 'Rolling...' : 'Not rolled'}
          </span>
          {!isRolling && (
            <button
              onClick={onRoll}
              data-testid={`roll-button-${index}`}
              className={cn(
                'text-sm px-3 py-1.5 rounded-md',
                'bg-accent-gold/10 text-accent-gold border border-accent-gold/30',
                'hover:bg-accent-gold/20 transition-colors',
              )}
            >
              Roll
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function DiceRollingInterface({
  scores,
  onScoresChange,
  racialBonuses,
}: DiceRollingInterfaceProps) {
  const [rollResults, setRollResults] = useState<(RollResult | null)[]>(
    Array(6).fill(null),
  )
  const [rollingIndex, setRollingIndex] = useState<number | null>(null)
  const [isRollingAll, setIsRollingAll] = useState(false)
  const [showRerollConfirm, setShowRerollConfirm] = useState(false)
  const [selectedRollValue, setSelectedRollValue] = useState<number | null>(null)
  const rollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allRolled = useMemo(
    () => rollResults.every((r) => r !== null),
    [rollResults],
  )

  const rollTotals = useMemo(
    () => rollResults.filter((r): r is RollResult => r !== null).map((r) => r.total),
    [rollResults],
  )

  // Which totals are still unassigned
  const assignedValues = useMemo(() => {
    return ABILITY_NAMES.map((a) => scores[a]).filter((v) => v > 0)
  }, [scores])

  const unassignedTotals = useMemo(() => {
    const used = [...assignedValues]
    return rollTotals.filter((v) => {
      const idx = used.indexOf(v)
      if (idx >= 0) {
        used.splice(idx, 1)
        return false
      }
      return true
    })
  }, [rollTotals, assignedValues])

  const assignedCount = ABILITY_NAMES.filter((a) => scores[a] > 0).length

  // Roll a single slot
  const rollSingle = useCallback(
    (index: number) => {
      const result = rollAbilityScore()
      // Mark the lowest die correctly
      const sortedRolls = [...result.rolls].sort((a, b) => a - b)
      const dropped = sortedRolls[0]

      setRollResults((prev) => {
        const next = [...prev]
        next[index] = {
          rolls: result.rolls,
          dropped,
          total: result.total,
        }
        return next
      })
    },
    [],
  )

  const handleRollSingle = useCallback(
    (index: number) => {
      setRollingIndex(index)
      // Brief delay for drama
      setTimeout(() => {
        rollSingle(index)
        setRollingIndex(null)
      }, 300)
    },
    [rollSingle],
  )

  // Roll all at once with sequential delays
  const rollAll = useCallback(() => {
    setIsRollingAll(true)
    const newResults: (RollResult | null)[] = Array(6).fill(null)

    const rollNext = (index: number) => {
      if (index >= 6) {
        setIsRollingAll(false)
        return
      }

      setRollingIndex(index)
      rollTimeoutRef.current = setTimeout(() => {
        const result = rollAbilityScore()
        const sortedRolls = [...result.rolls].sort((a, b) => a - b)
        const dropped = sortedRolls[0]

        newResults[index] = {
          rolls: result.rolls,
          dropped,
          total: result.total,
        }

        setRollResults([...newResults])
        setRollingIndex(null)
        rollNext(index + 1)
      }, 400)
    }

    rollNext(0)
  }, [])

  // Reroll all
  const handleRerollAll = useCallback(() => {
    if (rollResults.some((r) => r !== null)) {
      setShowRerollConfirm(true)
    } else {
      rollAll()
    }
  }, [rollResults, rollAll])

  const confirmReroll = useCallback(() => {
    setRollResults(Array(6).fill(null))
    onScoresChange({
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    })
    setSelectedRollValue(null)
    setShowRerollConfirm(false)
    // Start rolling after reset
    setTimeout(() => rollAll(), 100)
  }, [onScoresChange, rollAll])

  // Assignment (Phase 2) -- click-to-assign
  const handleRollValueSelect = useCallback(
    (value: number) => {
      setSelectedRollValue((prev) => (prev === value ? null : value))
    },
    [],
  )

  const handleSlotAssign = useCallback(
    (ability: AbilityName) => {
      if (selectedRollValue === null) return
      const newScores = { ...scores }

      // Check if this value is in another slot, swap if so
      const sourceSlot = ABILITY_NAMES.find(
        (a) => a !== ability && newScores[a] === selectedRollValue,
      )
      if (sourceSlot) {
        newScores[sourceSlot] = newScores[ability]
      }

      newScores[ability] = selectedRollValue
      onScoresChange(newScores)
      setSelectedRollValue(null)
    },
    [selectedRollValue, scores, onScoresChange],
  )

  const clearSlot = useCallback(
    (ability: AbilityName) => {
      const newScores = { ...scores }
      newScores[ability] = 0
      onScoresChange(newScores)
    },
    [scores, onScoresChange],
  )

  const resetAssignments = useCallback(() => {
    onScoresChange({
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    })
    setSelectedRollValue(null)
  }, [onScoresChange])

  return (
    <div className="space-y-4" data-testid="dice-rolling-interface">
      {/* Phase 1: Rolling */}
      {!allRolled && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-parchment/70 uppercase tracking-wider">
              Roll Your Scores
            </h4>
            <div className="flex gap-2">
              <button
                onClick={rollAll}
                disabled={isRollingAll || allRolled}
                data-testid="roll-all-button"
                className={cn(
                  'text-sm px-3 py-1.5 rounded-md',
                  'bg-accent-gold text-bg-primary font-medium',
                  'hover:bg-accent-gold/90 transition-colors',
                  (isRollingAll || allRolled) && 'opacity-50 cursor-not-allowed',
                )}
              >
                Roll All
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {rollResults.map((result, idx) => (
              <RollSlot
                key={idx}
                index={idx}
                result={result}
                isRolling={rollingIndex === idx}
                onRoll={() => handleRollSingle(idx)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Phase 2: Assignment */}
      {allRolled && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-parchment/70 uppercase tracking-wider">
              Assign Your Rolls
            </h4>
            <div className="flex gap-2">
              <button
                onClick={resetAssignments}
                className={cn(
                  'text-sm px-3 py-1 rounded-md',
                  'text-parchment/50 hover:text-parchment',
                  'border border-parchment/20 hover:border-parchment/40',
                  'transition-colors',
                )}
                data-testid="reset-assignments-button"
              >
                Reset Assignments
              </button>
              <button
                onClick={handleRerollAll}
                data-testid="reroll-all-button"
                className={cn(
                  'text-sm px-3 py-1 rounded-md',
                  'text-red-400/70 hover:text-red-400',
                  'border border-red-400/20 hover:border-red-400/40',
                  'transition-colors',
                )}
              >
                Reroll All
              </button>
            </div>
          </div>

          {/* Completion indicator */}
          <p className="text-sm text-parchment/60 mb-3" data-testid="assignment-count">
            {assignedCount} of 6 assigned
          </p>

          {/* Available roll values */}
          <div className="mb-4">
            <p className="text-xs text-parchment/50 mb-2 uppercase tracking-wider">
              Available Rolls
            </p>
            <div className="flex flex-wrap gap-2" data-testid="roll-pool">
              {unassignedTotals.map((value, idx) => (
                <button
                  key={`roll-${value}-${idx}`}
                  onClick={() => handleRollValueSelect(value)}
                  data-testid={`roll-chip-${value}`}
                  className={cn(
                    'flex items-center justify-center w-14 h-14 rounded-lg',
                    'text-xl font-bold font-heading',
                    'border-2 transition-all select-none cursor-pointer',
                    selectedRollValue === value
                      ? 'border-accent-gold bg-accent-gold/20 text-accent-gold shadow-[0_0_12px_rgba(232,180,48,0.3)]'
                      : 'border-parchment/30 bg-bg-secondary text-parchment hover:border-parchment/50',
                  )}
                >
                  {value}
                </button>
              ))}
              {unassignedTotals.length === 0 && (
                <span className="text-sm text-parchment/30 italic py-4">
                  All values assigned
                </span>
              )}
            </div>
          </div>

          {/* Ability Slots */}
          <div className="space-y-2" data-testid="ability-slots">
            {ABILITY_NAMES.map((ability) => {
              const assignedScore = scores[ability]
              const bonus = racialBonuses[ability] ?? 0
              const total = assignedScore + bonus
              const modifier = assignedScore > 0 ? getModifier(total) : null

              return (
                <div
                  key={ability}
                  onClick={() => handleSlotAssign(ability)}
                  data-testid={`ability-slot-${ability}`}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border-2 transition-all min-h-[56px]',
                    'cursor-pointer',
                    selectedRollValue !== null && assignedScore === 0
                      ? 'border-accent-gold/50 bg-accent-gold/5'
                      : assignedScore > 0
                        ? 'border-parchment/30 bg-bg-secondary'
                        : 'border-dashed border-parchment/20 bg-bg-secondary/50',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-parchment/60 uppercase tracking-wider w-8">
                      {ABILITY_LABELS[ability]}
                    </span>

                    {assignedScore > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-parchment">
                          {assignedScore}
                        </span>
                        {bonus !== 0 && (
                          <span className="text-xs text-accent-gold/80">
                            {bonus > 0 ? '+' : ''}{bonus}
                          </span>
                        )}
                        {bonus !== 0 && (
                          <span className="text-sm text-parchment/50">
                            = {total}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-parchment/30 italic">
                        Not assigned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {modifier !== null && (
                      <span
                        className={cn(
                          'text-sm font-mono font-semibold px-2 py-0.5 rounded',
                          modifier >= 0
                            ? 'text-emerald-400 bg-emerald-400/10'
                            : 'text-red-400 bg-red-400/10',
                        )}
                      >
                        {formatModifier(modifier)}
                      </span>
                    )}
                    {assignedScore > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          clearSlot(ability)
                        }}
                        className="text-xs text-parchment/30 hover:text-parchment/60 transition-colors px-1"
                        aria-label={`Clear ${ability} assignment`}
                      >
                        x
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Rolled totals summary (visible in Phase 1) */}
      {!allRolled && rollResults.some((r) => r !== null) && (
        <div className="text-xs text-parchment/40 mt-2">
          Rolled so far:{' '}
          {rollResults
            .filter((r): r is RollResult => r !== null)
            .map((r) => r.total)
            .join(', ')}
        </div>
      )}

      {/* Reroll Confirmation Dialog */}
      {showRerollConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          data-testid="reroll-confirm-dialog"
        >
          <div className="bg-bg-primary border border-parchment/20 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h4 className="text-lg font-heading font-semibold text-parchment mb-2">
              Reroll All?
            </h4>
            <p className="text-sm text-parchment/70 mb-6">
              Are you sure? Your current rolls will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRerollConfirm(false)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md',
                  'border border-parchment/20 text-parchment/70',
                  'hover:bg-parchment/10 transition-colors',
                )}
              >
                Cancel
              </button>
              <button
                onClick={confirmReroll}
                data-testid="confirm-reroll-button"
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md',
                  'bg-red-500/80 text-white',
                  'hover:bg-red-500 transition-colors',
                )}
              >
                Reroll All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
