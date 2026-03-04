/**
 * HitPointsBlock (Story 17.6)
 *
 * Displays HP max, current HP, and temporary HP with visual health bar.
 * Includes quick damage/heal controls and color-coded health status.
 */

import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { Heart, Plus, Minus, Skull } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function HitPointsBlock() {
  const { character, editableCharacter, updateField, editMode, derivedStats } =
    useCharacterSheet()
  const [showDamageModal, setShowDamageModal] = useState(false)
  const [showHealModal, setShowHealModal] = useState(false)
  const [damageAmount, setDamageAmount] = useState('')
  const [healAmount, setHealAmount] = useState('')

  const displayCharacter = character ? { ...character, ...editableCharacter } : null

  if (!displayCharacter) {
    return null
  }

  const hpMax = derivedStats.hpMax
  const hpCurrent = displayCharacter.hpCurrent
  const tempHp = displayCharacter.tempHp

  const hpPercentage = hpMax > 0 ? (hpCurrent / hpMax) * 100 : 0

  const getHealthColor = (percentage: number) => {
    if (percentage === 0) return 'text-gray-800'
    if (percentage <= 24) return 'text-damage-red'
    if (percentage <= 74) return 'text-yellow-500'
    return 'text-healing-green'
  }

  const getBarColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-800'
    if (percentage <= 24) return 'bg-damage-red'
    if (percentage <= 74) return 'bg-yellow-500'
    return 'bg-healing-green'
  }

  const applyDamage = () => {
    const damage = parseInt(damageAmount) || 0
    if (damage <= 0) return

    let remainingDamage = damage
    let newTempHp = tempHp
    let newCurrentHp = hpCurrent

    // Apply to temp HP first
    if (newTempHp > 0) {
      if (remainingDamage >= newTempHp) {
        remainingDamage -= newTempHp
        newTempHp = 0
      } else {
        newTempHp -= remainingDamage
        remainingDamage = 0
      }
    }

    // Apply remaining to current HP
    if (remainingDamage > 0) {
      newCurrentHp = Math.max(0, newCurrentHp - remainingDamage)
    }

    updateField('tempHp', newTempHp)
    updateField('hpCurrent', newCurrentHp)
    setDamageAmount('')
    setShowDamageModal(false)
  }

  const applyHealing = () => {
    const healing = parseInt(healAmount) || 0
    if (healing <= 0) return

    const newHp = Math.min(hpMax, hpCurrent + healing)
    updateField('hpCurrent', newHp)
    setHealAmount('')
    setShowHealModal(false)
  }

  return (
    <div
      className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-4"
      data-testid="hit-points-block"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-damage-red" />
          <span className="text-xs uppercase tracking-wider text-parchment/60 font-semibold">
            Hit Points
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowDamageModal(true)}
            className="p-1 rounded hover:bg-bg-primary/50 text-parchment/60 hover:text-damage-red transition-colors"
            aria-label="Take damage"
            title="Take damage"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowHealModal(true)}
            className="p-1 rounded hover:bg-bg-primary/50 text-parchment/60 hover:text-healing-green transition-colors"
            aria-label="Heal"
            title="Heal"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current HP Display */}
      <div className="flex items-baseline gap-2 justify-center mb-2">
        {hpCurrent === 0 && <Skull className="w-6 h-6 text-gray-800" />}
        <div className={cn('text-5xl font-heading font-bold', getHealthColor(hpPercentage))}>
          {hpCurrent}
        </div>
        <div className="text-2xl text-parchment/50 font-semibold">
          / {hpMax}
        </div>
      </div>

      {/* HP Bar */}
      <div className="relative h-3 bg-bg-primary/50 rounded-full overflow-hidden mb-3">
        <div
          className={cn('h-full transition-all duration-300', getBarColor(hpPercentage))}
          style={{ width: `${Math.min(hpPercentage, 100)}%` }}
        />
      </div>

      {/* Temp HP */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-parchment/60 uppercase tracking-wider">
          Temp HP
        </span>
        {editMode.isEditing || tempHp > 0 ? (
          <input
            type="number"
            value={tempHp}
            onChange={(e) => updateField('tempHp', parseInt(e.target.value) || 0)}
            className="w-16 bg-blue-500/10 border border-blue-400/30 rounded px-2 py-1 text-blue-300 text-sm text-right focus:outline-none focus:border-blue-400"
            aria-label="Temporary hit points"
          />
        ) : (
          <span className="text-sm text-parchment/40">0</span>
        )}
      </div>

      {tempHp > 0 && (
        <div className="text-xs text-blue-300 bg-blue-500/10 rounded px-2 py-1 text-center">
          {tempHp} temporary HP active
        </div>
      )}

      {/* Max HP Override */}
      {editMode.isEditing && (
        <div className="mt-3 pt-3 border-t border-parchment/10">
          <label className="text-xs text-parchment/60 mb-1 block">
            Max HP Override:
          </label>
          <input
            type="number"
            value={displayCharacter.hpMax}
            onChange={(e) => updateField('hpMax', parseInt(e.target.value) || 1)}
            className="w-full bg-bg-primary border border-parchment/30 rounded px-2 py-1 text-parchment text-sm focus:outline-none focus:border-accent-gold"
            aria-label="Max HP override"
          />
        </div>
      )}

      {/* Damage Modal */}
      {showDamageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary border-2 border-parchment/30 rounded-lg p-4 w-64">
            <h3 className="text-lg font-heading text-parchment mb-3">Take Damage</h3>
            <input
              type="number"
              value={damageAmount}
              onChange={(e) => setDamageAmount(e.target.value)}
              placeholder="Amount"
              className="w-full bg-bg-primary border border-parchment/30 rounded px-3 py-2 text-parchment mb-3 focus:outline-none focus:border-accent-gold"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={applyDamage}
                className="flex-1 bg-damage-red text-white rounded py-2 hover:bg-damage-red/80 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setShowDamageModal(false)
                  setDamageAmount('')
                }}
                className="flex-1 bg-parchment/10 text-parchment rounded py-2 hover:bg-parchment/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Heal Modal */}
      {showHealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary border-2 border-parchment/30 rounded-lg p-4 w-64">
            <h3 className="text-lg font-heading text-parchment mb-3">Heal</h3>
            <input
              type="number"
              value={healAmount}
              onChange={(e) => setHealAmount(e.target.value)}
              placeholder="Amount"
              className="w-full bg-bg-primary border border-parchment/30 rounded px-3 py-2 text-parchment mb-3 focus:outline-none focus:border-accent-gold"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={applyHealing}
                className="flex-1 bg-healing-green text-white rounded py-2 hover:bg-healing-green/80 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setShowHealModal(false)
                  setHealAmount('')
                }}
                className="flex-1 bg-parchment/10 text-parchment rounded py-2 hover:bg-parchment/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
