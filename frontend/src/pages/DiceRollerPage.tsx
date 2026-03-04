/**
 * DiceRollerPage (Story 26.1)
 *
 * Full-page version of the dice roller. Renders the DiceRollerPanel
 * inline on the page (not as a slide-out) for users who navigate to /dice.
 */

import { useState, useCallback } from 'react'
import { Dice5, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDiceStore } from '@/stores/diceStore'
import type { DiceRoll } from '@/stores/diceStore'
import type { DieType } from '@/types/core'
import { DIE_TYPES } from '@/types/core'
import { parseDiceNotation } from '@/utils/dice'
import { DiceButton } from '@/components/dice/DiceButton'
import { DiceAnimation } from '@/components/dice/DiceAnimation'
import { RollResult } from '@/components/dice/RollResult'
import { RollHistoryList } from '@/components/dice/RollHistoryList'
import { AdvantageToggle } from '@/components/dice/AdvantageToggle'
import { ExpressionInput } from '@/components/dice/ExpressionInput'
import type { AdvantageState } from '@/components/dice/AdvantageToggle'

interface LastRollDisplay {
  results: number[]
  total: number
  modifier: number
  dieType: DieType
  isCritical: boolean
  isFumble: boolean
  label?: string
  advantage: boolean
  disadvantage: boolean
}

export default function DiceRollerPage() {
  const storeRoll = useDiceStore((s) => s.roll)
  const rolls = useDiceStore((s) => s.rolls)
  const clearHistory = useDiceStore((s) => s.clearHistory)

  const [modifier, setModifier] = useState(0)
  const [advantageState, setAdvantageState] = useState<AdvantageState>('normal')
  const [advantageLocked, setAdvantageLocked] = useState(false)
  const [isRolling, setIsRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState<LastRollDisplay | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [recentExpressions, setRecentExpressions] = useState<string[]>([])

  const performRoll = useCallback(
    (dice: { type: DieType; count: number }[], mod: number, label?: string) => {
      const isAdv = advantageState === 'advantage'
      const isDis = advantageState === 'disadvantage'

      const result = storeRoll(dice, mod, label, isAdv, isDis)

      const primaryDie = dice[0]?.type ?? 'd20'
      const hasD20 = dice.some((d) => d.type === 'd20')
      const d20Result = hasD20 ? result.results[0] : null

      setLastRoll({
        results: result.results,
        total: result.total,
        modifier: mod,
        dieType: primaryDie,
        isCritical: hasD20 && d20Result === 20,
        isFumble: hasD20 && d20Result === 1,
        label,
        advantage: isAdv,
        disadvantage: isDis,
      })

      setIsRolling(true)
      setShowResult(false)

      if (!advantageLocked) {
        setAdvantageState('normal')
      }

      setModifier(0)
    },
    [advantageState, advantageLocked, storeRoll],
  )

  const handleDieClick = useCallback(
    (die: DieType) => {
      performRoll([{ type: die, count: 1 }], modifier)
    },
    [modifier, performRoll],
  )

  const handleExpressionRoll = useCallback(
    (expression: string) => {
      try {
        const parsed = parseDiceNotation(expression)
        const dieType = `d${parsed.sides}` as DieType

        setRecentExpressions((prev) => {
          const filtered = prev.filter((e) => e !== expression)
          return [expression, ...filtered].slice(0, 10)
        })

        performRoll([{ type: dieType, count: parsed.count }], parsed.modifier, expression)
      } catch {
        // Invalid expression
      }
    },
    [performRoll],
  )

  const handleReroll = useCallback(
    (roll: DiceRoll) => {
      performRoll(roll.dice, roll.modifier, roll.label)
    },
    [performRoll],
  )

  const handleAnimationComplete = useCallback(() => {
    setIsRolling(false)
    setShowResult(true)
  }, [])

  const handleModifierIncrement = useCallback(() => {
    setModifier((prev) => prev + 1)
  }, [])

  const handleModifierDecrement = useCallback(() => {
    setModifier((prev) => prev - 1)
  }, [])

  const handleModifierChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    setModifier(isNaN(val) ? 0 : val)
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-6" data-testid="dice-roller-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Dice5 className="h-8 w-8 text-accent-gold" />
        <h1 className="font-heading text-3xl text-accent-gold">Dice Roller</h1>
      </div>

      {/* Dice Tray */}
      <div className="rounded-xl border border-parchment/10 bg-bg-secondary p-4 mb-6">
        <DiceAnimation
          results={lastRoll?.results ?? []}
          dieType={lastRoll?.dieType ?? 'd20'}
          isCritical={lastRoll?.isCritical}
          isFumble={lastRoll?.isFumble}
          isRolling={isRolling}
          onAnimationComplete={handleAnimationComplete}
        />
        <RollResult
          total={lastRoll?.total ?? 0}
          results={lastRoll?.results ?? []}
          modifier={lastRoll?.modifier ?? 0}
          advantage={lastRoll?.advantage}
          disadvantage={lastRoll?.disadvantage}
          label={lastRoll?.label}
          isCritical={lastRoll?.isCritical}
          isFumble={lastRoll?.isFumble}
          visible={showResult}
        />
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-parchment/10 bg-bg-secondary p-4 mb-6 space-y-4">
        {/* Advantage toggle */}
        <div className="flex justify-center">
          <AdvantageToggle
            state={advantageState}
            locked={advantageLocked}
            onStateChange={setAdvantageState}
            onLockedChange={setAdvantageLocked}
          />
        </div>

        {/* Die buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {DIE_TYPES.map((die) => (
            <DiceButton
              key={die}
              die={die}
              onRoll={handleDieClick}
            />
          ))}
        </div>

        {/* Modifier */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm text-parchment/60">Modifier</span>
          <button
            onClick={handleModifierDecrement}
            aria-label="Decrease modifier"
            className={cn(
              'w-8 h-8 rounded flex items-center justify-center',
              'border border-parchment/20 text-parchment/60',
              'hover:text-parchment hover:border-parchment/40 transition-colors',
            )}
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            value={modifier}
            onChange={handleModifierChange}
            aria-label="Modifier value"
            className="w-16 text-center py-1.5 rounded border border-parchment/20 bg-bg-primary text-parchment font-mono text-base focus:outline-none focus:ring-1 focus:ring-accent-gold/50"
          />
          <button
            onClick={handleModifierIncrement}
            aria-label="Increase modifier"
            className={cn(
              'w-8 h-8 rounded flex items-center justify-center',
              'border border-parchment/20 text-parchment/60',
              'hover:text-parchment hover:border-parchment/40 transition-colors',
            )}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Expression input */}
        <ExpressionInput
          onRoll={handleExpressionRoll}
          recentExpressions={recentExpressions}
        />
      </div>

      {/* History */}
      <div className="rounded-xl border border-parchment/10 bg-bg-secondary overflow-hidden">
        <RollHistoryList
          rolls={rolls}
          onReroll={handleReroll}
          onClear={clearHistory}
        />
      </div>
    </div>
  )
}
