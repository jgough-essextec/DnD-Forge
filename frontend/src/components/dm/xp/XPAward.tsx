/**
 * XPAward (Story 37.1)
 *
 * Modal component for awarding XP to campaign characters.
 * Supports two modes:
 * - "Award to All": same XP to every character
 * - "Award Individually": per-character XP amounts
 *
 * Features pre-award preview showing level-up detection,
 * optional reason/source field, and XP threshold reference.
 */

import { useState, useMemo, useCallback } from 'react'
import { X, Award, Users, User, Sparkles, Loader2 } from 'lucide-react'
import type { Character } from '@/types/character'
import { buildLevelUpPreviews } from '@/utils/xp'
import { XPThresholdTable } from './XPThresholdTable'

type AwardMode = 'all' | 'individual'

interface XPAwardProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Close callback */
  onClose: () => void
  /** Characters in the campaign */
  characters: Character[]
  /** Callback to apply XP. Receives map of characterId -> xpAmount and optional reason. */
  onApply: (
    xpAmounts: Record<string, number>,
    reason: string,
  ) => Promise<void>
}

export function XPAward({
  isOpen,
  onClose,
  characters,
  onApply,
}: XPAwardProps) {
  const [mode, setMode] = useState<AwardMode>('all')
  const [globalXP, setGlobalXP] = useState<string>('')
  const [individualXP, setIndividualXP] = useState<Record<string, string>>({})
  const [reason, setReason] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  // Build XP amounts map based on mode
  const xpAmounts = useMemo(() => {
    const amounts: Record<string, number> = {}
    if (mode === 'all') {
      const xp = parseInt(globalXP, 10) || 0
      for (const char of characters) {
        amounts[char.id] = xp
      }
    } else {
      for (const char of characters) {
        amounts[char.id] = parseInt(individualXP[char.id] ?? '0', 10) || 0
      }
    }
    return amounts
  }, [mode, globalXP, individualXP, characters])

  // Build previews
  const previews = useMemo(
    () => buildLevelUpPreviews(characters, xpAmounts),
    [characters, xpAmounts],
  )

  const hasAnyXP = useMemo(
    () => Object.values(xpAmounts).some((v) => v > 0),
    [xpAmounts],
  )

  const levelUpCount = useMemo(
    () => previews.filter((p) => p.willLevelUp).length,
    [previews],
  )

  const handleApply = useCallback(async () => {
    if (!hasAnyXP) return
    setIsApplying(true)
    try {
      await onApply(xpAmounts, reason)
      onClose()
    } finally {
      setIsApplying(false)
    }
  }, [hasAnyXP, xpAmounts, reason, onApply, onClose])

  const handleIndividualXPChange = useCallback(
    (charId: string, value: string) => {
      setIndividualXP((prev) => ({ ...prev, [charId]: value }))
    },
    [],
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-label="Award XP"
      data-testid="xp-award-modal"
    >
      <div className="bg-bg-secondary border border-parchment/20 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-parchment/10">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-accent-gold" />
            <h2 className="font-heading text-xl text-accent-gold">Award XP</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-parchment/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-parchment/60" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2" role="radiogroup" aria-label="Award mode">
            <button
              role="radio"
              aria-checked={mode === 'all'}
              onClick={() => setMode('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                mode === 'all'
                  ? 'bg-accent-gold/10 border-accent-gold/30 text-accent-gold'
                  : 'bg-bg-primary border-parchment/10 text-parchment/60 hover:border-parchment/30'
              }`}
              data-testid="mode-all"
            >
              <Users className="w-4 h-4" />
              Award to All
            </button>
            <button
              role="radio"
              aria-checked={mode === 'individual'}
              onClick={() => setMode('individual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                mode === 'individual'
                  ? 'bg-accent-gold/10 border-accent-gold/30 text-accent-gold'
                  : 'bg-bg-primary border-parchment/10 text-parchment/60 hover:border-parchment/30'
              }`}
              data-testid="mode-individual"
            >
              <User className="w-4 h-4" />
              Award Individually
            </button>
          </div>

          {/* XP Input */}
          {mode === 'all' && (
            <div>
              <label
                htmlFor="global-xp"
                className="block text-sm text-parchment/70 mb-1"
              >
                XP Amount (to each character)
              </label>
              <input
                id="global-xp"
                type="number"
                min="0"
                value={globalXP}
                onChange={(e) => setGlobalXP(e.target.value)}
                placeholder="Enter XP amount..."
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment placeholder-parchment/30 focus:outline-none focus:border-accent-gold/50 font-mono"
                aria-label="XP amount for all characters"
                data-testid="global-xp-input"
              />
            </div>
          )}

          {/* Reason/Source */}
          <div>
            <label
              htmlFor="xp-reason"
              className="block text-sm text-parchment/70 mb-1"
            >
              Reason / Source (optional)
            </label>
            <input
              id="xp-reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='e.g., "Goblin encounter", "Rescued the merchant"'
              className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment placeholder-parchment/30 focus:outline-none focus:border-accent-gold/50 text-sm"
              aria-label="XP reason or source"
              data-testid="xp-reason-input"
            />
          </div>

          {/* Pre-Award Preview */}
          <div>
            <h3 className="text-sm font-medium text-parchment/70 mb-2">
              Preview
            </h3>
            <div
              className="rounded-lg border border-parchment/10 bg-bg-primary overflow-hidden"
              data-testid="xp-preview"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-parchment/10">
                    <th className="px-3 py-2 text-left text-parchment/50 font-medium">
                      Character
                    </th>
                    <th className="px-3 py-2 text-right text-parchment/50 font-medium">
                      Current XP
                    </th>
                    {mode === 'individual' && (
                      <th className="px-3 py-2 text-right text-parchment/50 font-medium">
                        XP to Add
                      </th>
                    )}
                    <th className="px-3 py-2 text-right text-parchment/50 font-medium">
                      {mode === 'all' ? '+ XP' : 'New Total'}
                    </th>
                    <th className="px-3 py-2 text-left text-parchment/50 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previews.map((preview) => (
                    <tr
                      key={preview.characterId}
                      className={`border-b border-parchment/5 ${
                        preview.willLevelUp
                          ? 'bg-accent-gold/5'
                          : ''
                      }`}
                      data-testid={`preview-row-${preview.characterId}`}
                    >
                      <td className="px-3 py-2 text-parchment">
                        {preview.characterName}
                        <span className="text-parchment/40 text-xs ml-1">
                          Lv.{preview.currentLevel}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-parchment/70 font-mono">
                        {preview.currentXP.toLocaleString()}
                      </td>
                      {mode === 'individual' && (
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min="0"
                            value={individualXP[preview.characterId] ?? ''}
                            onChange={(e) =>
                              handleIndividualXPChange(
                                preview.characterId,
                                e.target.value,
                              )
                            }
                            placeholder="0"
                            className="w-20 px-2 py-1 rounded bg-bg-secondary border border-parchment/20 text-parchment text-right font-mono text-xs focus:outline-none focus:border-accent-gold/50"
                            aria-label={`XP for ${preview.characterName}`}
                            data-testid={`individual-xp-${preview.characterId}`}
                          />
                        </td>
                      )}
                      <td className="px-3 py-2 text-right font-mono">
                        {mode === 'all' ? (
                          <span className="text-green-400">
                            +{preview.xpToAdd.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-parchment">
                            {preview.newTotal.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {preview.willLevelUp ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-medium text-accent-gold"
                            data-testid={`level-up-indicator-${preview.characterId}`}
                          >
                            <Sparkles className="w-3 h-3" />
                            Level {preview.newLevel}!
                          </span>
                        ) : preview.currentLevel >= 20 ? (
                          <span className="text-xs text-parchment/40">
                            Max Level
                          </span>
                        ) : (
                          <span className="text-xs text-parchment/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {levelUpCount > 0 && (
              <div
                className="mt-2 px-3 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/20"
                data-testid="level-up-summary"
              >
                <p className="text-sm text-accent-gold flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  {levelUpCount} character{levelUpCount !== 1 ? 's' : ''} will
                  level up!
                </p>
                <ul className="mt-1 space-y-0.5">
                  {previews
                    .filter((p) => p.willLevelUp)
                    .map((p) => (
                      <li
                        key={p.characterId}
                        className="text-xs text-accent-gold/80"
                      >
                        {p.characterName} will advance to Level {p.newLevel}!
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {/* XP Threshold Reference (collapsible) */}
          <XPThresholdTable />

          {/* Apply Button */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-parchment/20 text-parchment/60 hover:bg-parchment/10 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!hasAnyXP || isApplying}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Apply XP"
              data-testid="apply-xp-button"
            >
              {isApplying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Award className="w-4 h-4" />
              )}
              {isApplying ? 'Applying...' : 'Apply XP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
