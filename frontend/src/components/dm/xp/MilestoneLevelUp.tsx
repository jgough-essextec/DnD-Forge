/**
 * MilestoneLevelUp (Story 37.2)
 *
 * Modal component for milestone-based level advancement.
 * Supports two modes:
 * - "Level Up All": every character gains 1 level with confirmation
 * - "Level Up Selected": checkboxes per character
 *
 * Shows batch summary after level-up with HP gains and new features.
 * Enforces level 20 cap.
 */

import { useState, useMemo, useCallback } from 'react'
import { X, TrendingUp, Users, UserCheck, Loader2, AlertTriangle, Crown } from 'lucide-react'
import type { Character } from '@/types/character'
import { getBatchLevelUpSummary } from '@/utils/xp'

type MilestoneMode = 'all' | 'selected'
type MilestonePhase = 'select' | 'confirm' | 'summary'

interface MilestoneLevelUpProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Close callback */
  onClose: () => void
  /** Characters in the campaign */
  characters: Character[]
  /** Callback to apply level-up. Receives array of character IDs to level up. */
  onApply: (characterIds: string[]) => Promise<void>
}

export function MilestoneLevelUp({
  isOpen,
  onClose,
  characters,
  onApply,
}: MilestoneLevelUpProps) {
  const [mode, setMode] = useState<MilestoneMode>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<MilestonePhase>('select')
  const [isApplying, setIsApplying] = useState(false)
  const [summaryData, setSummaryData] = useState<
    Array<{ name: string; oldLevel: number; newLevel: number }>
  >([])

  // Characters eligible for level-up (not at max level)
  const eligibleCharacters = useMemo(
    () => characters.filter((c) => c.level < 20),
    [characters],
  )

  const maxLevelCharacters = useMemo(
    () => characters.filter((c) => c.level >= 20),
    [characters],
  )

  // Characters that will be leveled
  const targetCharacters = useMemo(() => {
    if (mode === 'all') return eligibleCharacters
    return eligibleCharacters.filter((c) => selectedIds.has(c.id))
  }, [mode, eligibleCharacters, selectedIds])

  const toggleSelection = useCallback((charId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(charId)) {
        next.delete(charId)
      } else {
        next.add(charId)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(eligibleCharacters.map((c) => c.id)))
  }, [eligibleCharacters])

  const selectNone = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleProceed = useCallback(() => {
    if (targetCharacters.length === 0) return
    setPhase('confirm')
  }, [targetCharacters])

  const handleConfirm = useCallback(async () => {
    if (targetCharacters.length === 0) return
    setIsApplying(true)

    // Save summary data before applying
    const summary = targetCharacters.map((c) => ({
      name: c.name,
      oldLevel: c.level,
      newLevel: Math.min(c.level + 1, 20),
    }))
    setSummaryData(summary)

    try {
      await onApply(targetCharacters.map((c) => c.id))
      setPhase('summary')
    } finally {
      setIsApplying(false)
    }
  }, [targetCharacters, onApply])

  const handleClose = useCallback(() => {
    setPhase('select')
    setMode('all')
    setSelectedIds(new Set())
    setSummaryData([])
    onClose()
  }, [onClose])

  const batchSummary = useMemo(
    () => getBatchLevelUpSummary(summaryData),
    [summaryData],
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-label="Milestone Level Up"
      data-testid="milestone-levelup-modal"
    >
      <div className="bg-bg-secondary border border-parchment/20 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-parchment/10">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-gold" />
            <h2 className="font-heading text-xl text-accent-gold">
              Milestone Level Up
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-parchment/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-parchment/60" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Phase: Select */}
          {phase === 'select' && (
            <>
              {/* Mode Toggle */}
              <div
                className="flex gap-2"
                role="radiogroup"
                aria-label="Level up mode"
              >
                <button
                  role="radio"
                  aria-checked={mode === 'all'}
                  onClick={() => setMode('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    mode === 'all'
                      ? 'bg-accent-gold/10 border-accent-gold/30 text-accent-gold'
                      : 'bg-bg-primary border-parchment/10 text-parchment/60 hover:border-parchment/30'
                  }`}
                  data-testid="milestone-mode-all"
                >
                  <Users className="w-4 h-4" />
                  Level Up All
                </button>
                <button
                  role="radio"
                  aria-checked={mode === 'selected'}
                  onClick={() => setMode('selected')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    mode === 'selected'
                      ? 'bg-accent-gold/10 border-accent-gold/30 text-accent-gold'
                      : 'bg-bg-primary border-parchment/10 text-parchment/60 hover:border-parchment/30'
                  }`}
                  data-testid="milestone-mode-selected"
                >
                  <UserCheck className="w-4 h-4" />
                  Level Up Selected
                </button>
              </div>

              {/* Character List */}
              {mode === 'selected' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-parchment/70">
                      Select characters to level up:
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAll}
                        className="text-xs text-accent-gold hover:text-accent-gold/80 transition-colors"
                      >
                        Select All
                      </button>
                      <span className="text-parchment/30">|</span>
                      <button
                        onClick={selectNone}
                        className="text-xs text-parchment/50 hover:text-parchment/70 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div
                    className="space-y-1 rounded-lg border border-parchment/10 bg-bg-primary p-2"
                    data-testid="character-selection-list"
                  >
                    {eligibleCharacters.map((char) => (
                      <label
                        key={char.id}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-parchment/5 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(char.id)}
                          onChange={() => toggleSelection(char.id)}
                          className="rounded border-parchment/30 text-accent-gold focus:ring-accent-gold/50"
                          aria-label={`Select ${char.name}`}
                          data-testid={`select-${char.id}`}
                        />
                        <span className="text-sm text-parchment">
                          {char.name}
                        </span>
                        <span className="text-xs text-parchment/50 ml-auto">
                          Level {char.level} → {char.level + 1}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* All mode: preview list */}
              {mode === 'all' && eligibleCharacters.length > 0 && (
                <div
                  className="rounded-lg border border-parchment/10 bg-bg-primary p-3"
                  data-testid="all-characters-preview"
                >
                  <p className="text-sm text-parchment/70 mb-2">
                    All {eligibleCharacters.length} eligible character
                    {eligibleCharacters.length !== 1 ? 's' : ''} will gain 1
                    level:
                  </p>
                  <div className="space-y-1">
                    {eligibleCharacters.map((char) => (
                      <div
                        key={char.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-parchment">{char.name}</span>
                        <span className="text-parchment/50 text-xs">
                          Level {char.level} → {char.level + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Max level warnings */}
              {maxLevelCharacters.length > 0 && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-500/30">
                  <Crown className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-amber-200">
                      {maxLevelCharacters.length} character
                      {maxLevelCharacters.length !== 1 ? 's' : ''} at Level 20
                      (max):
                    </p>
                    <p className="text-xs text-amber-200/70 mt-0.5">
                      {maxLevelCharacters.map((c) => c.name).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Proceed Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg border border-parchment/20 text-parchment/60 hover:bg-parchment/10 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceed}
                  disabled={targetCharacters.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="proceed-button"
                >
                  <TrendingUp className="w-4 h-4" />
                  Proceed ({targetCharacters.length})
                </button>
              </div>
            </>
          )}

          {/* Phase: Confirm */}
          {phase === 'confirm' && (
            <>
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-900/20 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-amber-200 font-medium">
                    Level up {targetCharacters.length} character
                    {targetCharacters.length !== 1 ? 's' : ''} to their next
                    level?
                  </p>
                  <ul className="mt-2 space-y-0.5">
                    {targetCharacters.map((char) => (
                      <li
                        key={char.id}
                        className="text-xs text-amber-200/70"
                      >
                        {char.name}: Level {char.level} → {char.level + 1}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setPhase('select')}
                  className="px-4 py-2 rounded-lg border border-parchment/20 text-parchment/60 hover:bg-parchment/10 transition-colors text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isApplying}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="confirm-levelup-button"
                >
                  {isApplying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  {isApplying ? 'Applying...' : 'Confirm Level Up'}
                </button>
              </div>
            </>
          )}

          {/* Phase: Summary */}
          {phase === 'summary' && (
            <>
              <div
                className="rounded-lg border border-accent-gold/20 bg-accent-gold/5 p-4"
                data-testid="levelup-summary"
              >
                <h3 className="text-sm font-medium text-accent-gold mb-3">
                  Level Up Complete
                </h3>
                <div className="space-y-2">
                  {batchSummary.map((entry) => (
                    <div
                      key={entry.characterName}
                      className="flex items-center justify-between py-1 border-b border-accent-gold/10 last:border-0"
                    >
                      <span className="text-sm text-parchment">
                        {entry.characterName}
                      </span>
                      <span className="text-sm text-accent-gold font-mono">
                        Level {entry.oldLevel} → {entry.newLevel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20 transition-colors text-sm font-medium"
                  data-testid="done-button"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
