import { create } from 'zustand'
import { rollDice, rollWithAdvantage, rollWithDisadvantage } from '@/utils/dice'
import type { DieType } from '@/types/core'

/**
 * A single dice roll entry in the history.
 */
export interface DiceRoll {
  id: string
  dice: { type: DieType; count: number }[]
  results: number[]
  modifier: number
  total: number
  label?: string
  advantage?: boolean
  disadvantage?: boolean
  timestamp: Date
}

/**
 * Dice store state for tracking roll history.
 */
export interface DiceState {
  rolls: DiceRoll[]
  maxHistory: number
}

export interface DiceActions {
  roll: (
    dice: { type: DieType; count: number }[],
    modifier?: number,
    label?: string,
    advantage?: boolean,
    disadvantage?: boolean
  ) => DiceRoll
  clearHistory: () => void
  removeRoll: (id: string) => void
}

let rollIdCounter = 0

export const useDiceStore = create<DiceState & DiceActions>()((set) => ({
  rolls: [],
  maxHistory: 50,

  roll: (dice, modifier = 0, label, advantage, disadvantage) => {
    const allResults: number[] = []

    for (const d of dice) {
      // Special handling for advantage/disadvantage on d20 rolls
      if (d.type === 'd20' && d.count === 1 && (advantage || disadvantage)) {
        if (advantage && !disadvantage) {
          const advResult = rollWithAdvantage()
          allResults.push(advResult.result)
        } else if (disadvantage && !advantage) {
          const disResult = rollWithDisadvantage()
          allResults.push(disResult.result)
        } else {
          // Both cancel out
          const results = rollDice(d.count, d.type)
          allResults.push(...results)
        }
      } else {
        const results = rollDice(d.count, d.type)
        allResults.push(...results)
      }
    }

    const total = allResults.reduce((sum, v) => sum + v, 0) + modifier

    const newRoll: DiceRoll = {
      id: String(++rollIdCounter),
      dice,
      results: allResults,
      modifier,
      total,
      label,
      advantage,
      disadvantage,
      timestamp: new Date(),
    }

    set((state) => ({
      rolls: [newRoll, ...state.rolls].slice(0, state.maxHistory),
    }))

    return newRoll
  },

  clearHistory: () => set({ rolls: [] }),

  removeRoll: (id) =>
    set((state) => ({
      rolls: state.rolls.filter((r) => r.id !== id),
    })),
}))
