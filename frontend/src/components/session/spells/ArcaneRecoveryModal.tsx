/**
 * ArcaneRecoveryModal Component (Story 28.3)
 *
 * Wizard Arcane Recovery modal for selecting spell slots to recover.
 * - Budget: ceil(wizardLevel / 2) total spell slot levels
 * - No 6th-level or higher slots can be recovered
 * - Only expended slots can be selected
 * - Once per day usage tracking
 * - Visual budget countdown
 */

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  getArcaneRecoveryBudget,
  validateArcaneRecovery,
  formatSpellLevel,
} from '@/utils/spell-slots'

export interface ArcaneRecoveryModalProps {
  /** The Wizard's class level */
  wizardLevel: number
  /** Maximum slots by level */
  maxSlots: Record<number, number>
  /** Used slots by level */
  usedSlots: Record<number, number>
  /** Whether Arcane Recovery has been used today */
  usedToday: boolean
  /** Called when the player confirms their slot selection */
  onConfirm: (selectedSlots: number[]) => void
  /** Called when the player cancels */
  onCancel: () => void
}

export function ArcaneRecoveryModal({
  wizardLevel,
  maxSlots,
  usedSlots,
  usedToday,
  onConfirm,
  onCancel,
}: ArcaneRecoveryModalProps) {
  const budget = getArcaneRecoveryBudget(wizardLevel)
  const [selectedSlots, setSelectedSlots] = useState<number[]>([])

  const totalSelected = selectedSlots.reduce((sum, level) => sum + level, 0)
  const budgetRemaining = budget - totalSelected

  // Get levels that have expended slots (only 1-5, not 6+)
  const recoverableLevels = Object.keys(maxSlots)
    .map(Number)
    .filter(level => {
      if (level >= 6) return false
      if (level < 1) return false
      const max = maxSlots[level] ?? 0
      const used = usedSlots[level] ?? 0
      return used > 0 && max > 0
    })
    .sort((a, b) => a - b)

  const getExpendedCount = useCallback(
    (level: number) => usedSlots[level] ?? 0,
    [usedSlots],
  )

  const getSelectedCount = useCallback(
    (level: number) => selectedSlots.filter(l => l === level).length,
    [selectedSlots],
  )

  const canSelectMore = useCallback(
    (level: number) => {
      if (level > budgetRemaining) return false
      const expended = getExpendedCount(level)
      const alreadySelected = getSelectedCount(level)
      return alreadySelected < expended
    },
    [budgetRemaining, getExpendedCount, getSelectedCount],
  )

  const addSlot = useCallback(
    (level: number) => {
      if (!canSelectMore(level)) return
      const newSelected = [...selectedSlots, level]
      if (validateArcaneRecovery(newSelected, budget)) {
        setSelectedSlots(newSelected)
      }
    },
    [selectedSlots, budget, canSelectMore],
  )

  const removeSlot = useCallback(
    (level: number) => {
      const index = selectedSlots.lastIndexOf(level)
      if (index === -1) return
      const newSelected = [...selectedSlots]
      newSelected.splice(index, 1)
      setSelectedSlots(newSelected)
    },
    [selectedSlots],
  )

  const handleConfirm = useCallback(() => {
    if (selectedSlots.length > 0 && validateArcaneRecovery(selectedSlots, budget)) {
      onConfirm(selectedSlots)
    }
  }, [selectedSlots, budget, onConfirm])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      data-testid="arcane-recovery-modal"
      role="dialog"
      aria-label="Arcane Recovery"
    >
      <div className="bg-bg-secondary border border-parchment/30 rounded-xl p-5 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-serif text-accent-gold mb-1">
          Arcane Recovery
        </h3>
        <p className="text-xs text-parchment/50 mb-3">
          1/day, during Short Rest
        </p>

        {usedToday ? (
          <div className="mb-4 p-3 rounded-lg bg-parchment/5 border border-parchment/20">
            <p className="text-sm text-parchment/50" data-testid="already-used-message">
              Arcane Recovery has already been used today. It resets on a long rest.
            </p>
          </div>
        ) : (
          <>
            {/* Budget display */}
            <div
              className="mb-4 p-3 rounded-lg bg-blue-950/20 border border-blue-500/30"
              data-testid="recovery-budget"
            >
              <p className="text-sm text-blue-200">
                Recovery budget:{' '}
                <span className="font-semibold text-blue-300">
                  {budgetRemaining}
                </span>{' '}
                / {budget} levels remaining
              </p>
              <p className="text-xs text-blue-300/50 mt-1">
                No slots of 6th level or higher can be recovered
              </p>
            </div>

            {/* Slot selection */}
            {recoverableLevels.length > 0 ? (
              <div className="space-y-2 mb-4">
                {recoverableLevels.map(level => {
                  const expended = getExpendedCount(level)
                  const selected = getSelectedCount(level)
                  const canAdd = canSelectMore(level)

                  return (
                    <div
                      key={level}
                      className="flex items-center justify-between p-2 rounded-lg bg-parchment/5 border border-parchment/15"
                      data-testid={`recovery-level-${level}`}
                    >
                      <div className="text-sm text-parchment/80">
                        <span className="font-medium">
                          {formatSpellLevel(level)} Level
                        </span>
                        <span className="text-xs text-parchment/50 ml-2">
                          ({expended} expended)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeSlot(level)}
                          disabled={selected === 0}
                          className={cn(
                            'w-6 h-6 rounded flex items-center justify-center text-sm font-bold transition-all',
                            selected > 0
                              ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60 cursor-pointer'
                              : 'bg-parchment/10 text-parchment/30 cursor-not-allowed',
                          )}
                          aria-label={`Remove one ${formatSpellLevel(level)} level slot from recovery`}
                          data-testid={`recovery-remove-${level}`}
                        >
                          -
                        </button>
                        <span
                          className="w-6 text-center text-sm font-semibold text-accent-gold"
                          data-testid={`recovery-count-${level}`}
                        >
                          {selected}
                        </span>
                        <button
                          type="button"
                          onClick={() => addSlot(level)}
                          disabled={!canAdd}
                          className={cn(
                            'w-6 h-6 rounded flex items-center justify-center text-sm font-bold transition-all',
                            canAdd
                              ? 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60 cursor-pointer'
                              : 'bg-parchment/10 text-parchment/30 cursor-not-allowed',
                          )}
                          aria-label={`Add one ${formatSpellLevel(level)} level slot to recovery`}
                          data-testid={`recovery-add-${level}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mb-4 p-3 rounded-lg bg-parchment/5 border border-parchment/15">
                <p className="text-sm text-parchment/50" data-testid="no-expended-message">
                  No expended spell slots of 5th level or lower to recover.
                </p>
              </div>
            )}

            {/* Confirm / Cancel */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={selectedSlots.length === 0}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                  selectedSlots.length > 0
                    ? 'bg-accent-gold/20 border-accent-gold text-accent-gold hover:bg-accent-gold/30 cursor-pointer'
                    : 'bg-parchment/5 border-parchment/20 text-parchment/30 cursor-not-allowed',
                )}
                data-testid="recovery-confirm"
              >
                Recover {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-3 py-2 rounded-lg border border-parchment/20 text-sm text-parchment/60 hover:text-parchment/80 hover:border-parchment/40 transition-all cursor-pointer"
                data-testid="recovery-cancel"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {usedToday && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full mt-3 px-3 py-2 rounded-lg border border-parchment/20 text-sm text-parchment/60 hover:text-parchment/80 hover:border-parchment/40 transition-all cursor-pointer"
            data-testid="recovery-close"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}
