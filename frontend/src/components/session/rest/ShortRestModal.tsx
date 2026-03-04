/**
 * ShortRestModal (Story 30.1)
 *
 * Multi-step modal for short rest flow:
 * Step 1: Hit Dice Spending -- spend hit dice to recover HP
 * Step 2: Feature Recovery -- shows auto-recovered short rest features
 * Step 3: Summary -- complete before/after comparison
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Coffee, X, ChevronRight, ChevronLeft, Dices, RefreshCw, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Character } from '@/types/character'
import { getClassById } from '@/data/classes'
import { getAbilityModifier } from '@/data/reference'
import { rollDie } from '@/utils/dice'
import type { DieType } from '@/types/core'
import {
  applyShortRestUI,
  getCharacterFeatureUsages,
} from '@/utils/rest-recovery'
import type { RestResult } from '@/utils/rest-recovery'
// FeatureUsageList is used in the features step for future expansion

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = 'hit-dice' | 'features' | 'summary'

interface HitDieSpendRecord {
  classIndex: number
  className: string
  dieType: string
  rawRoll: number
  conMod: number
  hpGained: number
}

export interface ShortRestModalProps {
  isOpen: boolean
  onClose: () => void
  character: Character
  onFinish: (result: RestResult) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ShortRestModal({
  isOpen,
  onClose,
  character,
  onFinish,
}: ShortRestModalProps) {
  const [step, setStep] = useState<Step>('hit-dice')
  const [takeAverage, setTakeAverage] = useState(false)
  const [spentDice, setSpentDice] = useState<HitDieSpendRecord[]>([])
  const [additionalUsed, setAdditionalUsed] = useState<number[]>([])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('hit-dice')
      setTakeAverage(false)
      setSpentDice([])
      setAdditionalUsed(character.hitDiceUsed.map(() => 0))
    }
  }, [isOpen, character.hitDiceUsed])

  const conMod = useMemo(
    () => getAbilityModifier(character.abilityScores.constitution),
    [character.abilityScores.constitution],
  )

  // Calculate available hit dice per class
  const hitDiceInfo = useMemo(() => {
    return character.classes.map((classSel, idx) => {
      const classData = getClassById(classSel.classId)
      const total = character.hitDiceTotal[idx] ?? 0
      const baseUsed = character.hitDiceUsed[idx] ?? 0
      const extraUsed = additionalUsed[idx] ?? 0
      return {
        classIndex: idx,
        className: classData?.name ?? classSel.classId,
        hitDie: classData?.hitDie ?? 8,
        total,
        used: baseUsed + extraUsed,
        available: total - baseUsed - extraUsed,
      }
    })
  }, [character.classes, character.hitDiceTotal, character.hitDiceUsed, additionalUsed])

  // Calculate total HP recovered
  const totalHpRecovered = useMemo(
    () => spentDice.reduce((sum, d) => sum + d.hpGained, 0),
    [spentDice],
  )

  const currentHp = Math.min(character.hpMax, character.hpCurrent + totalHpRecovered)

  // Feature recovery data
  const features = useMemo(
    () => getCharacterFeatureUsages(character),
    [character],
  )

  const shortRestFeatures = useMemo(
    () => features.filter((f) => f.recoversOn === 'short_rest'),
    [features],
  )

  const handleSpendDie = useCallback(
    (classIndex: number) => {
      const info = hitDiceInfo[classIndex]
      if (info.available <= 0) return

      const dieType = `d${info.hitDie}` as DieType
      let hpGained: number

      if (takeAverage) {
        // Average is ceil(die/2) + CON mod
        const avg = Math.ceil(info.hitDie / 2)
        hpGained = Math.max(0, avg + conMod)
      } else {
        const rawRoll = rollDie(dieType)
        hpGained = Math.max(0, rawRoll + conMod)
      }

      // Check cap against max HP
      const newTotalRecovered = totalHpRecovered + hpGained
      const effectiveHp = Math.min(
        character.hpMax,
        character.hpCurrent + newTotalRecovered,
      )
      const actualGain = effectiveHp - (character.hpCurrent + totalHpRecovered)
      const cappedGain = Math.max(0, actualGain)

      const record: HitDieSpendRecord = {
        classIndex,
        className: info.className,
        dieType: `d${info.hitDie}`,
        rawRoll: takeAverage ? Math.ceil(info.hitDie / 2) : hpGained - conMod + (hpGained === 0 && conMod < 0 ? -conMod - (takeAverage ? Math.ceil(info.hitDie / 2) : 0) : 0),
        conMod,
        hpGained: cappedGain > 0 ? cappedGain : hpGained,
      }

      // Simplify: just use the raw calculation
      record.rawRoll = takeAverage ? Math.ceil(info.hitDie / 2) : rollDie(dieType)
      record.hpGained = Math.max(0, record.rawRoll + conMod)

      setSpentDice((prev) => [...prev, record])
      setAdditionalUsed((prev) => {
        const next = [...prev]
        next[classIndex] = (next[classIndex] ?? 0) + 1
        return next
      })
    },
    [hitDiceInfo, takeAverage, conMod, totalHpRecovered, character.hpMax, character.hpCurrent],
  )

  const handleFinish = useCallback(() => {
    const result = applyShortRestUI(
      character,
      spentDice.map((d) => ({
        classIndex: d.classIndex,
        rolled: d.hpGained,
      })),
    )
    onFinish(result)
    onClose()
  }, [character, spentDice, onFinish, onClose])

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
      data-testid="short-rest-modal"
      role="dialog"
      aria-label="Short Rest"
    >
      <div className="bg-bg-secondary border-2 border-parchment/30 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-parchment/20">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-accent-gold" />
            <h2 className="text-lg font-heading text-parchment">Short Rest</h2>
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
            A short rest takes at least 1 hour of light activity
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          {(['hit-dice', 'features', 'summary'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="w-3 h-3 text-parchment/30" />}
              <span
                className={cn(
                  'text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded',
                  step === s
                    ? 'text-accent-gold bg-accent-gold/10'
                    : 'text-parchment/40',
                )}
              >
                {s === 'hit-dice' ? 'Hit Dice' : s === 'features' ? 'Features' : 'Summary'}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-4 space-y-4">
          {/* Step 1: Hit Dice Spending */}
          {step === 'hit-dice' && (
            <div data-testid="step-hit-dice">
              {/* Take Average Toggle */}
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={takeAverage}
                  onChange={(e) => setTakeAverage(e.target.checked)}
                  className="rounded border-parchment/30 bg-bg-primary text-accent-gold focus:ring-accent-gold"
                  data-testid="take-average-toggle"
                />
                <span className="text-sm text-parchment/80">
                  Take Average (no rolling)
                </span>
              </label>

              {/* HP Status */}
              <div className="text-sm text-parchment mb-3">
                <span className="text-parchment/60">HP: </span>
                <span className="font-semibold">{currentHp}</span>
                <span className="text-parchment/40"> / {character.hpMax}</span>
              </div>

              {/* Hit Dice per Class */}
              {hitDiceInfo.map((info) => (
                <div
                  key={info.classIndex}
                  className="flex items-center justify-between py-2 border-b border-parchment/10 last:border-0"
                  data-testid={`hit-die-class-${info.classIndex}`}
                >
                  <div>
                    <span className="text-sm text-parchment font-medium">
                      {info.className}
                    </span>
                    <span className="text-xs text-parchment/50 ml-2">
                      d{info.hitDie}
                    </span>
                    <span className="text-xs text-parchment/40 ml-1">
                      ({info.available}/{info.total} available)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSpendDie(info.classIndex)}
                    disabled={info.available <= 0 || currentHp >= character.hpMax}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors',
                      info.available > 0 && currentHp < character.hpMax
                        ? 'bg-healing-green/20 text-healing-green hover:bg-healing-green/30 border border-healing-green/40'
                        : 'bg-parchment/10 text-parchment/30 cursor-not-allowed border border-parchment/20',
                    )}
                    aria-label={`Spend ${info.className} hit die`}
                    data-testid={`spend-hit-die-${info.classIndex}`}
                  >
                    <Dices className="w-3.5 h-3.5" />
                    Spend
                  </button>
                </div>
              ))}

              {/* Spending Log */}
              {spentDice.length > 0 && (
                <div className="mt-3 space-y-1" data-testid="spending-log">
                  {spentDice.map((die, i) => (
                    <div key={i} className="text-xs text-parchment/70">
                      Spent 1{die.dieType} + {die.conMod >= 0 ? die.conMod : die.conMod}{' '}
                      = {die.hpGained} HP recovered
                      {i === 0 && spentDice.length === 1 && (
                        <span className="text-parchment/40">
                          {' '}(HP: {character.hpCurrent} {'-> '}{currentHp})
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="text-sm font-medium text-healing-green mt-2">
                    Total: +{totalHpRecovered} HP
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Feature Recovery */}
          {step === 'features' && (
            <div data-testid="step-features">
              {shortRestFeatures.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold text-parchment mb-3 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-accent-gold" />
                    Features Recovered
                  </h3>
                  {shortRestFeatures.map((feature) => (
                    <div
                      key={feature.featureId}
                      className="flex items-center justify-between py-2 border-b border-parchment/10 last:border-0"
                      data-testid={`recovered-feature-${feature.featureId}`}
                    >
                      <span className="text-sm text-parchment">{feature.name}</span>
                      <span className="text-xs text-healing-green">
                        {feature.maxUses !== null
                          ? `${feature.maxUses}/${feature.maxUses}`
                          : 'Unlimited'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-parchment/50 text-center py-4">
                  No short rest features to recover
                </p>
              )}

              {/* Wizard Arcane Recovery check */}
              {character.classes.some((c) => c.classId === 'wizard') && (
                <div
                  className="mt-4 p-3 rounded-lg border border-accent-gold/30 bg-accent-gold/5"
                  data-testid="arcane-recovery-prompt"
                >
                  <p className="text-sm text-accent-gold font-medium">
                    Arcane Recovery Available
                  </p>
                  <p className="text-xs text-parchment/60 mt-1">
                    You can recover spell slots with a combined level equal to
                    half your wizard level (rounded up). Available once per day.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 'summary' && (
            <div data-testid="step-summary">
              <h3 className="text-sm font-semibold text-parchment mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-gold" />
                Short Rest Summary
              </h3>

              <div className="space-y-2 bg-bg-primary/50 rounded-lg p-3 border border-parchment/20">
                {/* HP */}
                <div className="flex justify-between text-sm">
                  <span className="text-parchment/60">HP</span>
                  <span className="text-parchment">
                    {character.hpCurrent}
                    <span className="text-parchment/40">{' -> '}</span>
                    <span className="text-healing-green font-semibold">{currentHp}</span>
                    <span className="text-parchment/40"> / {character.hpMax}</span>
                  </span>
                </div>

                {/* Hit Dice Spent */}
                <div className="flex justify-between text-sm">
                  <span className="text-parchment/60">Hit Dice Spent</span>
                  <span className="text-parchment">{spentDice.length}</span>
                </div>

                {/* Features Recovered */}
                {shortRestFeatures.length > 0 && (
                  <div className="border-t border-parchment/10 pt-2 mt-2">
                    <span className="text-xs text-parchment/60 uppercase tracking-wider">
                      Recovered
                    </span>
                    {shortRestFeatures.map((f) => (
                      <div key={f.featureId} className="text-sm text-parchment mt-1">
                        {f.name}{' '}
                        <span className="text-parchment/40">
                          ({f.maxUses !== null ? `${f.maxUses}/${f.maxUses}` : 'Unlimited'})
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pact Magic */}
                {character.spellcasting?.pactMagic && (
                  <div className="flex justify-between text-sm border-t border-parchment/10 pt-2">
                    <span className="text-parchment/60">Warlock Slots</span>
                    <span className="text-healing-green">Restored</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 pt-0 flex gap-2">
          {step !== 'hit-dice' && (
            <button
              type="button"
              onClick={() => {
                if (step === 'features') setStep('hit-dice')
                else if (step === 'summary') setStep('features')
              }}
              className="flex items-center gap-1 px-4 py-2.5 rounded-lg bg-parchment/10 text-parchment hover:bg-parchment/20 transition-colors text-sm"
              data-testid="step-back-button"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {step !== 'summary' && (
            <button
              type="button"
              onClick={() => {
                if (step === 'hit-dice') setStep('features')
                else if (step === 'features') setStep('summary')
              }}
              className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30 transition-colors text-sm font-medium border border-accent-gold/40"
              data-testid="step-next-button"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 'summary' && (
            <button
              type="button"
              onClick={handleFinish}
              className="flex-1 px-4 py-2.5 rounded-lg bg-accent-gold text-bg-primary hover:bg-accent-gold/90 transition-colors text-sm font-semibold"
              data-testid="finish-rest-button"
            >
              Finish Short Rest
            </button>
          )}

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
