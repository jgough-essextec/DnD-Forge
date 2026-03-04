/**
 * HPIncreaseStep (Story 31.2)
 *
 * Lets the player choose between rolling for HP or taking the average.
 * Shows the dice roll animation (via dice store), CON modifier,
 * minimum-1 enforcement, and the resulting HP change.
 */

import { useState, useCallback } from 'react'
import { Heart, Dices, Calculator } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useDiceStore } from '@/stores/diceStore'
import { getAbilityModifier } from '@/data/reference'
import type { LevelUpChanges } from '@/utils/levelup'
import type { Character } from '@/types/character'
import type { DieType } from '@/types/core'

type HPMethod = 'roll' | 'average' | null

interface HPIncreaseStepProps {
  character: Character
  changes: LevelUpChanges
  onHPChange: (hp: number) => void
}

export function HPIncreaseStep({
  character,
  changes,
  onHPChange,
}: HPIncreaseStepProps) {
  const [method, setMethod] = useState<HPMethod>(null)
  const [rollResult, setRollResult] = useState<number | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const diceRoll = useDiceStore((s) => s.roll)

  const conMod = getAbilityModifier(character.abilityScores.constitution)
  const hitDie = changes.hitDieType

  const computeHP = useCallback(
    (rawRoll: number): number => {
      return Math.max(1, rawRoll + conMod)
    },
    [conMod],
  )

  const handleRoll = useCallback(() => {
    setIsRolling(true)
    setMethod('roll')

    // Animate a brief delay, then roll
    setTimeout(() => {
      const dieType = `d${hitDie}` as DieType
      const result = diceRoll(
        [{ type: dieType, count: 1 }],
        0,
        'Level Up HP',
      )
      const rawRoll = result.results[0]
      setRollResult(rawRoll)
      setIsRolling(false)
      onHPChange(computeHP(rawRoll))
    }, 600)
  }, [hitDie, diceRoll, computeHP, onHPChange])

  const handleAverage = useCallback(() => {
    setMethod('average')
    setRollResult(changes.averageHP)
    onHPChange(computeHP(changes.averageHP))
  }, [changes.averageHP, computeHP, onHPChange])

  const finalHP = rollResult !== null ? computeHP(rollResult) : null
  const newMaxHP = finalHP !== null ? character.hpMax + finalHP : null

  return (
    <div className="space-y-6" data-testid="hp-increase-step">
      <div className="text-center">
        <Heart className="h-8 w-8 text-healing-green mx-auto mb-2" />
        <h3 className="text-lg font-heading font-bold text-parchment">
          Hit Point Increase
        </h3>
        <p className="text-sm text-parchment/60 mt-1">
          Choose how to determine your HP gained for this level.
        </p>
      </div>

      {/* Method selection */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleRoll}
          disabled={isRolling}
          className={cn(
            'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
            method === 'roll'
              ? 'border-accent-gold bg-accent-gold/5'
              : 'border-parchment/20 hover:border-parchment/40',
            isRolling && 'opacity-60 cursor-wait',
          )}
          data-testid="hp-roll-button"
          aria-label={`Roll d${hitDie} for HP`}
        >
          <Dices className="h-6 w-6 text-accent-gold" />
          <span className="text-sm font-semibold text-parchment">
            Roll d{hitDie}
          </span>
          <span className="text-xs text-parchment/50">Try your luck</span>
        </button>

        <button
          type="button"
          onClick={handleAverage}
          disabled={isRolling}
          className={cn(
            'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
            method === 'average'
              ? 'border-accent-gold bg-accent-gold/5'
              : 'border-parchment/20 hover:border-parchment/40',
            isRolling && 'opacity-60 cursor-wait',
          )}
          data-testid="hp-average-button"
          aria-label={`Take average (${changes.averageHP})`}
        >
          <Calculator className="h-6 w-6 text-accent-gold" />
          <span className="text-sm font-semibold text-parchment">
            Take Average ({changes.averageHP})
          </span>
          <span className="text-xs text-parchment/50">Safe and steady</span>
        </button>
      </div>

      {/* Rolling animation */}
      <AnimatePresence mode="wait">
        {isRolling && (
          <motion.div
            key="rolling"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center py-6"
            data-testid="hp-rolling"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Dices className="h-12 w-12 text-accent-gold" />
            </motion.div>
            <p className="text-sm text-parchment/60 mt-2">Rolling...</p>
          </motion.div>
        )}

        {/* Result display */}
        {!isRolling && rollResult !== null && finalHP !== null && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'rounded-lg border border-healing-green/30 bg-healing-green/5 p-4',
            )}
            data-testid="hp-result"
          >
            <div className="text-center space-y-2">
              <p className="text-sm text-parchment/70">
                HP increase:{' '}
                <span className="font-bold text-parchment">
                  d{hitDie}
                  {method === 'roll' ? ` (rolled ${rollResult})` : ` (average ${rollResult})`}
                </span>
                {' + '}
                <span className="font-bold text-parchment">
                  {conMod >= 0 ? `${conMod}` : conMod} (CON)
                </span>
                {' = '}
                <span className="text-lg font-bold text-healing-green">
                  {finalHP} HP
                </span>
              </p>
              <p className="text-sm text-parchment/50">
                New max HP:{' '}
                <span className="text-parchment/70">{character.hpMax}</span>
                {' \u2192 '}
                <span className="font-bold text-healing-green">{newMaxHP}</span>
              </p>
              {finalHP === 1 && rollResult + conMod < 1 && (
                <p className="text-xs text-parchment/40 italic">
                  Minimum 1 HP per level enforced
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
