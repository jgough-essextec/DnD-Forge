/**
 * LongRestModal (Story 30.2)
 *
 * Summary modal for long rest flow showing automatic recovery details,
 * hit dice recovery, exhaustion changes, and a conditions checklist
 * for clearing conditions during the rest.
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Moon, X, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Character } from '@/types/character'
import { getClassById } from '@/data/classes'
import { getExhaustionLevel } from '@/utils/conditions'
import {
  applyLongRestUI,
  getCharacterFeatureUsages,
} from '@/utils/rest-recovery'
import type { RestResult, FeatureUsage } from '@/utils/rest-recovery'
import { FeatureUsageList } from './FeatureUsageList'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LongRestModalProps {
  isOpen: boolean
  onClose: () => void
  character: Character
  onFinish: (result: RestResult) => void
  /** ISO timestamp of the last long rest, for 24-hour guard */
  lastLongRestAt?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LongRestModal({
  isOpen,
  onClose,
  character,
  onFinish,
  lastLongRestAt,
}: LongRestModalProps) {
  const [conditionsToClear, setConditionsToClear] = useState<string[]>([])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setConditionsToClear([])
    }
  }, [isOpen])

  // 24-hour guard check
  const showRepeatWarning = useMemo(() => {
    if (!lastLongRestAt) return false
    const last = new Date(lastLongRestAt).getTime()
    const now = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000
    return now - last < twentyFourHours
  }, [lastLongRestAt])

  // Hit dice recovery calculation
  const hitDiceInfo = useMemo(() => {
    const totalHitDice = character.hitDiceTotal.reduce((sum, d) => sum + d, 0)
    const totalUsed = character.hitDiceUsed.reduce((sum, d) => sum + d, 0)
    const maxRecoverable = Math.max(1, Math.floor(totalHitDice / 2))
    const recovered = Math.min(maxRecoverable, totalUsed)

    // Per-class info for display
    const perClass = character.classes.map((classSel, idx) => {
      const classData = getClassById(classSel.classId)
      return {
        className: classData?.name ?? classSel.classId,
        hitDie: classData?.hitDie ?? 8,
        total: character.hitDiceTotal[idx] ?? 0,
        used: character.hitDiceUsed[idx] ?? 0,
      }
    })

    return { totalHitDice, totalUsed, maxRecoverable, recovered, perClass }
  }, [character.classes, character.hitDiceTotal, character.hitDiceUsed])

  // Exhaustion info
  const exhaustionBefore = useMemo(
    () => getExhaustionLevel(character.conditions),
    [character.conditions],
  )
  const exhaustionAfter = Math.max(0, exhaustionBefore - 1)

  // Clearable conditions (non-exhaustion conditions currently on the character)
  const clearableConditions = useMemo(() => {
    return character.conditions
      .filter((c) => c.condition !== 'exhaustion')
      .map((c) => c.condition)
  }, [character.conditions])

  // Feature recovery
  const features = useMemo(
    () => getCharacterFeatureUsages(character),
    [character],
  )

  const recoverableFeatures: FeatureUsage[] = useMemo(
    () =>
      features.filter(
        (f) => f.recoversOn === 'short_rest' || f.recoversOn === 'long_rest',
      ),
    [features],
  )

  // Spell slot info
  const hasSpellSlots = character.spellcasting !== null

  const spellSlotSummary = useMemo(() => {
    if (!character.spellcasting) return null
    const slots = character.spellcasting.usedSpellSlots
    const totalUsed = Object.values(slots).reduce((sum, v) => sum + v, 0)
    return { totalUsed }
  }, [character.spellcasting])

  const toggleCondition = useCallback((condition: string) => {
    setConditionsToClear((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition],
    )
  }, [])

  const handleFinish = useCallback(() => {
    const result = applyLongRestUI(character, conditionsToClear)
    onFinish(result)
    onClose()
  }, [character, conditionsToClear, onFinish, onClose])

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      data-testid="long-rest-modal"
      role="dialog"
      aria-label="Long Rest"
    >
      <div className="bg-bg-secondary border-2 border-parchment/30 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-parchment/20">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-accent-gold" />
            <h2 className="text-lg font-heading text-parchment">Long Rest</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-bg-primary/50 text-parchment/60 hover:text-parchment transition-colors"
            aria-label="Close modal"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duration Note */}
        <div className="px-4 pt-3">
          <p className="text-xs text-parchment/50 italic">
            A long rest takes at least 8 hours
          </p>
        </div>

        {/* 24-hour Warning */}
        {showRepeatWarning && (
          <div
            className="mx-4 mt-3 p-3 rounded-lg border border-yellow-500/40 bg-yellow-500/10 flex items-start gap-2"
            data-testid="repeat-rest-warning"
          >
            <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-500 font-medium">
                Recent Long Rest
              </p>
              <p className="text-xs text-parchment/60 mt-0.5">
                You have taken a long rest within the last 24 hours. Per D&amp;D 5e
                rules, a character cannot benefit from more than one long rest in
                a 24-hour period.
              </p>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Automatic Recovery Summary */}
          <div className="space-y-2 bg-bg-primary/50 rounded-lg p-3 border border-parchment/20">
            <h3 className="text-sm font-semibold text-parchment flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              Automatic Recovery
            </h3>

            {/* HP Recovery */}
            <div className="flex justify-between text-sm" data-testid="hp-recovery">
              <span className="text-parchment/60">HP</span>
              <span className="text-parchment">
                {character.hpCurrent}
                <span className="text-parchment/40">{' -> '}</span>
                <span className="text-healing-green font-semibold">
                  {character.hpMax}
                </span>
                <span className="text-parchment/40"> (full)</span>
              </span>
            </div>

            {/* Temp HP note */}
            {character.tempHp > 0 && (
              <div className="flex justify-between text-sm" data-testid="temp-hp-note">
                <span className="text-parchment/60">Temp HP</span>
                <span className="text-blue-300">
                  {character.tempHp} (persists)
                </span>
              </div>
            )}

            {/* Spell Slots */}
            {hasSpellSlots && (
              <div className="flex justify-between text-sm" data-testid="spell-slot-recovery">
                <span className="text-parchment/60">Spell Slots</span>
                <span className="text-healing-green">
                  {spellSlotSummary && spellSlotSummary.totalUsed > 0
                    ? 'Fully Restored'
                    : 'Already Full'}
                </span>
              </div>
            )}

            {/* Death Saves */}
            <div className="flex justify-between text-sm" data-testid="death-saves-reset">
              <span className="text-parchment/60">Death Saves</span>
              <span className="text-parchment/80">Reset to 0/0</span>
            </div>
          </div>

          {/* Hit Dice Recovery */}
          <div className="bg-bg-primary/50 rounded-lg p-3 border border-parchment/20">
            <h3 className="text-sm font-semibold text-parchment mb-2">
              Hit Dice Recovery
            </h3>
            <p className="text-sm text-parchment" data-testid="hit-dice-recovery">
              Hit Dice: Recovered{' '}
              <span className="text-healing-green font-semibold">
                {hitDiceInfo.recovered}
              </span>{' '}
              of {hitDiceInfo.totalUsed} spent
              {' '}(now{' '}
              {hitDiceInfo.totalHitDice - hitDiceInfo.totalUsed + hitDiceInfo.recovered}/
              {hitDiceInfo.totalHitDice} total)
            </p>
            {hitDiceInfo.perClass.length > 1 && (
              <div className="mt-2 space-y-1">
                {hitDiceInfo.perClass.map((info, i) => (
                  <div key={i} className="text-xs text-parchment/60">
                    {info.className}: d{info.hitDie} ({info.total - info.used}/{info.total})
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exhaustion */}
          {exhaustionBefore > 0 && (
            <div
              className="bg-bg-primary/50 rounded-lg p-3 border border-parchment/20"
              data-testid="exhaustion-change"
            >
              <h3 className="text-sm font-semibold text-parchment mb-2">
                Exhaustion
              </h3>
              <p className="text-sm text-parchment">
                Exhaustion: Level {exhaustionBefore}
                <span className="text-parchment/40">{' -> '}</span>
                <span
                  className={cn(
                    'font-semibold',
                    exhaustionAfter === 0 ? 'text-healing-green' : 'text-yellow-400',
                  )}
                >
                  Level {exhaustionAfter}
                </span>
                {exhaustionAfter === 0 && ' (cleared)'}
              </p>
              <p className="text-xs text-parchment/50 mt-1">
                Requires sufficient food and water
              </p>
            </div>
          )}

          {/* Conditions Checklist */}
          {clearableConditions.length > 0 && (
            <div className="bg-bg-primary/50 rounded-lg p-3 border border-parchment/20">
              <h3 className="text-sm font-semibold text-parchment mb-2">
                Clear Conditions
              </h3>
              <p className="text-xs text-parchment/50 mb-2">
                Select conditions to clear during the long rest
              </p>
              <div className="space-y-1">
                {clearableConditions.map((condition) => (
                  <label
                    key={condition}
                    className="flex items-center gap-2 py-1 cursor-pointer hover:bg-parchment/5 rounded px-1"
                    data-testid={`condition-toggle-${condition}`}
                  >
                    <input
                      type="checkbox"
                      checked={conditionsToClear.includes(condition)}
                      onChange={() => toggleCondition(condition)}
                      className="rounded border-parchment/30 bg-bg-primary text-accent-gold focus:ring-accent-gold"
                    />
                    <span className="text-sm text-parchment capitalize">
                      {condition}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Features Recovered */}
          {recoverableFeatures.length > 0 && (
            <div className="bg-bg-primary/50 rounded-lg p-3 border border-parchment/20">
              <h3 className="text-sm font-semibold text-parchment mb-2">
                Features Recovered
              </h3>
              <FeatureUsageList
                features={recoverableFeatures.map((f) => ({
                  ...f,
                  usesRemaining: f.maxUses ?? 0,
                }))}
                readOnly
              />
            </div>
          )}

          {/* Summary Panel */}
          <div className="bg-bg-primary/50 rounded-lg p-3 border border-accent-gold/30">
            <h3 className="text-sm font-semibold text-accent-gold flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              Rest Summary
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm" data-testid="rest-summary">
              <span className="text-parchment/60">HP</span>
              <span className="text-parchment text-right">
                {character.hpCurrent} {'->'} {character.hpMax}
              </span>

              {hasSpellSlots && (
                <>
                  <span className="text-parchment/60">Spell Slots</span>
                  <span className="text-healing-green text-right">Restored</span>
                </>
              )}

              <span className="text-parchment/60">Hit Dice</span>
              <span className="text-parchment text-right">
                +{hitDiceInfo.recovered} recovered
              </span>

              {exhaustionBefore > 0 && (
                <>
                  <span className="text-parchment/60">Exhaustion</span>
                  <span className="text-parchment text-right">
                    {exhaustionBefore} {'->'} {exhaustionAfter}
                  </span>
                </>
              )}

              <span className="text-parchment/60">Features</span>
              <span className="text-parchment text-right">
                {recoverableFeatures.length} restored
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-0 flex gap-2">
          <button
            type="button"
            onClick={handleFinish}
            className="flex-1 px-4 py-2.5 rounded-lg bg-accent-gold text-bg-primary hover:bg-accent-gold/90 transition-colors text-sm font-semibold"
            data-testid="finish-long-rest-button"
          >
            Finish Long Rest
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-parchment/10 text-parchment hover:bg-parchment/20 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
