/**
 * ArcaneRecoveryModal Component (Story 28.3)
 *
 * Modal for Wizard Arcane Recovery during short rest.
 * Shows available slot levels (1-5 only), a budget display,
 * and allows selecting which slots to recover.
 */

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  getArcaneRecoveryBudget,
  formatSpellLevel,
} from '@/utils/spell-slots'

export interface ArcaneRecoveryModalProps {
  /** Wizard class level */
  wizardLevel: number
  /** Maximum slots by level */
  maxSlots: Record<number, number>
  /** Used slots by level */
  usedSlots: Record<number, number>
  /** Whether Arcane Recovery has already been used today */
  usedToday: boolean
  /** Called with flat array of selected levels (e.g., [1, 2]) to recover */
  onConfirm: (selectedSlots: number[]) => void
  /** Called when modal is cancelled */
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
  const [selections, setSelections] = useState<number[]>([])

  const spent = selections.reduce((sum, level) => sum + level, 0)
  const remaining = budget - spent

  // Recoverable levels: 1-5 only, and must have expended slots
  const recoverableLevels = Object.keys(maxSlots)
    .map(Number)
    .filter(level => {
      if (level < 1 || level > 5) return false
      const total = maxSlots[level] ?? 0
      if (total === 0) return false
      const used = usedSlots[level] ?? 0
      return used > 0
    })
    .sort((a, b) => a - b)

  // Count how many of each level have been selected
  const selectionCounts: Record<number, number> = {}
  for (const level of selections) {
    selectionCounts[level] = (selectionCounts[level] ?? 0) + 1
  }

  const handleAdd = useCallback((level: number) => {
    setSelections(prev => [...prev, level])
  }, [])

  const handleRemove = useCallback((level: number) => {
    setSelections(prev => {
      const idx = prev.indexOf(level)
      if (idx === -1) return prev
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
    })
  }, [])

  const handleConfirm = useCallback(() => {
    onConfirm(selections)
  }, [selections, onConfirm])

  // Check if there are no expended slots at all in recoverable range
  const hasNoExpendedSlots = recoverableLevels.length === 0

  return (
    <div
      className="rounded-lg border-2 border-emerald-500/40 bg-bg-secondary p-4 space-y-4"
      data-testid="arcane-recovery-modal"
      role="dialog"
      aria-label="Arcane Recovery"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-serif font-semibold text-emerald-300">
          Arcane Recovery
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-parchment/50 hover:text-parchment/80 transition-colors cursor-pointer"
          data-testid="recovery-cancel"
          aria-label="Cancel Arcane Recovery"
        >
          Cancel
        </button>
      </div>

      {/* Already used today message */}
      {usedToday && (
        <p
          className="text-xs text-yellow-400"
          data-testid="already-used-message"
        >
          Arcane Recovery has already been used today. It resets on a long rest.
        </p>
      )}

      {/* Budget display */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-parchment/60">Recovery Budget:</span>
        <span
          className={cn(
            'font-semibold tabular-nums',
            remaining > 0 ? 'text-emerald-300' : 'text-yellow-400',
          )}
          data-testid="recovery-budget"
        >
          {remaining} / {budget} levels remaining
        </span>
      </div>

      {/* No expended slots message */}
      {hasNoExpendedSlots && !usedToday && (
        <p
          className="text-xs text-parchment/50 italic"
          data-testid="no-expended-message"
        >
          No expended spell slots (1st-5th level) to recover.
        </p>
      )}

      {/* Recoverable slot levels */}
      {!usedToday && recoverableLevels.length > 0 && (
        <div className="space-y-2">
          {recoverableLevels.map(level => {
            const total = maxSlots[level] ?? 0
            const used = usedSlots[level] ?? 0
            const selectedCount = selectionCounts[level] ?? 0
            const canAddMore = selectedCount < used && level <= remaining

            return (
              <div
                key={level}
                className="flex items-center gap-3"
                data-testid={`recovery-level-${level}`}
              >
                <span className="text-xs text-parchment/70 w-8 text-right font-medium">
                  {formatSpellLevel(level)}
                </span>
                <span className="text-xs text-parchment/50 tabular-nums">
                  {used}/{total} expended
                </span>
                <div className="flex items-center gap-1.5 ml-auto">
                  {selectedCount > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRemove(level)}
                        className="w-5 h-5 rounded border border-red-500/40 text-red-400 text-xs flex items-center justify-center hover:bg-red-950/30 transition-all cursor-pointer"
                        data-testid={`recovery-remove-${level}`}
                        aria-label={`Remove one ${formatSpellLevel(level)} level recovery`}
                      >
                        -
                      </button>
                      <span className="text-xs text-emerald-300 font-medium tabular-nums w-4 text-center">
                        {selectedCount}
                      </span>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleAdd(level)}
                    disabled={!canAddMore}
                    className={cn(
                      'w-5 h-5 rounded border text-xs flex items-center justify-center transition-all',
                      canAddMore
                        ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30 cursor-pointer'
                        : 'border-parchment/20 text-parchment/30 cursor-not-allowed',
                    )}
                    data-testid={`recovery-add-${level}`}
                    aria-label={`Add one ${formatSpellLevel(level)} level recovery`}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm button */}
      {!usedToday && (
        <button
          type="button"
          onClick={handleConfirm}
          disabled={selections.length === 0}
          className={cn(
            'w-full px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
            selections.length > 0
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/40 cursor-pointer'
              : 'bg-parchment/5 border-parchment/20 text-parchment/30 cursor-not-allowed',
          )}
          data-testid="recovery-confirm"
          aria-label="Confirm Arcane Recovery"
        >
          Recover Selected Slots
          {selections.length > 0 && (
            <span className="ml-1 text-parchment/40">
              ({spent} level{spent !== 1 ? 's' : ''})
            </span>
          )}
        </button>
      )}
    </div>
  )
}
