/**
 * DiceRollerPanel (Story 26.1)
 *
 * Persistent, toggleable dice roller panel. On desktop: slide-out right panel
 * (~320px wide). On mobile: bottom sheet overlay. Toggled via a d20 FAB
 * in the bottom-right corner.
 *
 * Three zones: dice tray (animation), quick-roll buttons + controls, roll history.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { Dice5, X, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
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

export function DiceRollerPanel() {
  const diceRollerOpen = useUIStore((s) => s.diceRollerOpen)
  const toggleDiceRoller = useUIStore((s) => s.toggleDiceRoller)

  const storeRoll = useDiceStore((s) => s.roll)
  const rolls = useDiceStore((s) => s.rolls)
  const clearHistory = useDiceStore((s) => s.clearHistory)

  // Local panel state
  const [modifier, setModifier] = useState(0)
  const [advantageState, setAdvantageState] = useState<AdvantageState>('normal')
  const [advantageLocked, setAdvantageLocked] = useState(false)
  const [isRolling, setIsRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState<LastRollDisplay | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [recentExpressions, setRecentExpressions] = useState<string[]>([])

  const panelRef = useRef<HTMLDivElement>(null)

  // Close panel on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && diceRollerOpen) {
        toggleDiceRoller()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [diceRollerOpen, toggleDiceRoller])

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

      // Reset advantage if not locked
      if (!advantageLocked) {
        setAdvantageState('normal')
      }

      // Reset modifier after roll
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

        // Add to recent expressions
        setRecentExpressions((prev) => {
          const filtered = prev.filter((e) => e !== expression)
          return [expression, ...filtered].slice(0, 10)
        })

        performRoll([{ type: dieType, count: parsed.count }], parsed.modifier, expression)
      } catch {
        // Invalid expression - handled by ExpressionInput
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
    <>
      {/* FAB - always visible */}
      <button
        onClick={toggleDiceRoller}
        aria-label={diceRollerOpen ? 'Close dice roller' : 'Open dice roller'}
        data-testid="dice-roller-fab"
        className={cn(
          'fixed z-50 bottom-20 right-4 sm:bottom-6 sm:right-6',
          'w-14 h-14 rounded-full shadow-lg',
          'flex items-center justify-center',
          'bg-accent-gold text-bg-primary',
          'hover:bg-accent-gold/90 transition-all',
          'focus:outline-none focus:ring-2 focus:ring-accent-gold/50 focus:ring-offset-2 focus:ring-offset-bg-primary',
          diceRollerOpen && 'rotate-12',
        )}
      >
        <Dice5 className="h-7 w-7" />
      </button>

      {/* Backdrop for mobile */}
      {diceRollerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={toggleDiceRoller}
          data-testid="dice-panel-backdrop"
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Dice Roller"
        aria-modal={diceRollerOpen}
        data-testid="dice-roller-panel"
        className={cn(
          'fixed z-50 transition-transform duration-300 ease-in-out',
          'flex flex-col bg-bg-secondary border-parchment/10',
          // Desktop: right slide-out
          'sm:top-0 sm:right-0 sm:h-full sm:w-80 sm:border-l',
          diceRollerOpen ? 'sm:translate-x-0' : 'sm:translate-x-full',
          // Mobile: bottom sheet
          'bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto',
          'max-h-[80vh] sm:max-h-full',
          'rounded-t-2xl sm:rounded-none border-t sm:border-t-0',
          diceRollerOpen ? 'translate-y-0 sm:translate-y-0' : 'translate-y-full sm:translate-y-0',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-parchment/10 shrink-0">
          <h2 className="font-heading text-lg text-accent-gold">Dice Roller</h2>
          <button
            onClick={toggleDiceRoller}
            aria-label="Close dice roller"
            data-testid="dice-panel-close"
            className="p-1 text-parchment/50 hover:text-parchment transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Zone 1: Dice Tray / Animation */}
        <div className="px-4 border-b border-parchment/10 shrink-0" data-testid="dice-tray">
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

        {/* Zone 2: Quick-roll buttons + controls */}
        <div className="px-4 py-3 border-b border-parchment/10 space-y-3 shrink-0" data-testid="dice-controls">
          {/* Advantage toggle */}
          <AdvantageToggle
            state={advantageState}
            locked={advantageLocked}
            onStateChange={setAdvantageState}
            onLockedChange={setAdvantageLocked}
          />

          {/* Die buttons */}
          <div className="flex flex-wrap gap-2 justify-center" data-testid="dice-buttons">
            {DIE_TYPES.map((die) => (
              <DiceButton
                key={die}
                die={die}
                onRoll={handleDieClick}
              />
            ))}
          </div>

          {/* Modifier input */}
          <div className="flex items-center justify-center gap-2" data-testid="modifier-controls">
            <span className="text-xs text-parchment/60 uppercase tracking-wider">Mod</span>
            <button
              onClick={handleModifierDecrement}
              aria-label="Decrease modifier"
              data-testid="mod-decrease"
              className="w-7 h-7 rounded flex items-center justify-center border border-parchment/20 text-parchment/60 hover:text-parchment hover:border-parchment/40 transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              value={modifier}
              onChange={handleModifierChange}
              aria-label="Modifier value"
              data-testid="modifier-input"
              className="w-14 text-center py-1 rounded border border-parchment/20 bg-bg-primary text-parchment font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent-gold/50"
            />
            <button
              onClick={handleModifierIncrement}
              aria-label="Increase modifier"
              data-testid="mod-increase"
              className="w-7 h-7 rounded flex items-center justify-center border border-parchment/20 text-parchment/60 hover:text-parchment hover:border-parchment/40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Custom expression */}
          <ExpressionInput
            onRoll={handleExpressionRoll}
            recentExpressions={recentExpressions}
          />
        </div>

        {/* Zone 3: Roll History */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <RollHistoryList
            rolls={rolls}
            onReroll={handleReroll}
            onClear={clearHistory}
          />
        </div>
      </div>
    </>
  )
}
