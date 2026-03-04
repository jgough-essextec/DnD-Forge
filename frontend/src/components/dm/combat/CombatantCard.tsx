/**
 * CombatantCard (Story 35.3, 35.4)
 *
 * Individual combatant display in the initiative order list.
 * Shows initiative, name, type icon, AC, HP bar, conditions, and notes.
 * Supports inline HP editing, condition management, and death saves.
 */

import { useState } from 'react'
import {
  Swords,
  Skull,
  User,
  Shield,
  Heart,
  Castle,
  AlertTriangle,
  X,
  Dices,
  Clock,
} from 'lucide-react'
import type { CombatCombatant } from '@/utils/combat'
import { getHPColor, getHPPercentage, getConcentrationDC } from '@/utils/combat'
import CombatantHPEditor from './CombatantHPEditor'
import { CONDITION_DEFINITIONS } from '@/data/conditions'
import type { Condition } from '@/types/core'

interface CombatantCardProps {
  combatant: CombatCombatant
  isCurrentTurn: boolean
  isPastTurn: boolean
  onDamage: (id: string, amount: number) => void
  onHeal: (id: string, amount: number) => void
  onSetTempHp: (id: string, amount: number) => void
  onAddCondition: (id: string, condition: string) => void
  onRemoveCondition: (id: string, condition: string) => void
  onToggleConcentration: (id: string) => void
  onRemove: (id: string) => void
  onSkip: (id: string) => void
  onReady: (id: string) => void
  onDeathSave: (id: string, success: boolean) => void
  showActions?: boolean
}

const TYPE_ICONS = {
  player: Swords,
  monster: Skull,
  npc: User,
  lair: Castle,
} as const

const TYPE_BG = {
  player: 'bg-blue-900/20',
  monster: 'bg-red-900/20',
  npc: 'bg-purple-900/20',
  lair: 'bg-amber-900/20',
} as const

export default function CombatantCard({
  combatant,
  isCurrentTurn,
  isPastTurn,
  onDamage,
  onHeal,
  onSetTempHp,
  onAddCondition,
  onRemoveCondition,
  onToggleConcentration,
  onRemove,
  onSkip,
  onReady,
  onDeathSave,
  showActions = true,
}: CombatantCardProps) {
  const [showHPEditor, setShowHPEditor] = useState(false)
  const [showConditionPicker, setShowConditionPicker] = useState(false)
  const [concentrationDamage, setConcentrationDamage] = useState<number | null>(null)

  const TypeIcon = TYPE_ICONS[combatant.type]
  const hpColor = getHPColor(combatant.hp, combatant.maxHp)
  const hpPercent = getHPPercentage(combatant.hp, combatant.maxHp)
  const isAtZeroHp = combatant.hp === 0
  const showDeathSaves = isAtZeroHp && combatant.type === 'player'

  const handleDamage = (amount: number) => {
    onDamage(combatant.id, amount)
    // Check concentration
    if (combatant.isConcentrating && amount > 0) {
      setConcentrationDamage(amount)
    }
  }

  const handleHeal = (amount: number) => {
    onHeal(combatant.id, amount)
  }

  const handleSetTempHp = (amount: number) => {
    onSetTempHp(combatant.id, amount)
  }

  return (
    <div
      className={`
        relative rounded-lg border-2 transition-all duration-200
        ${isCurrentTurn ? 'border-accent-gold bg-accent-gold/10 shadow-lg shadow-accent-gold/20' : 'border-parchment/10'}
        ${isPastTurn && !isCurrentTurn ? 'opacity-60' : ''}
        ${combatant.isDefeated ? 'opacity-50' : ''}
        ${combatant.isSkipped ? 'opacity-40' : ''}
        ${TYPE_BG[combatant.type]}
        p-3
      `}
      data-testid={`combatant-card-${combatant.id}`}
    >
      {/* Current turn indicator */}
      {isCurrentTurn && (
        <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-accent-gold text-primary text-xs font-bold rounded">
          CURRENT TURN
        </div>
      )}

      {/* Ready badge */}
      {combatant.isReadied && (
        <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded flex items-center gap-1">
          <Clock className="w-3 h-3" />
          READY
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Initiative number */}
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary-light/40 border border-parchment/20">
          <span className={`text-sm font-bold ${isCurrentTurn ? 'text-accent-gold' : 'text-parchment/80'}`}>
            {combatant.initiative || '—'}
          </span>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <TypeIcon className={`w-4 h-4 flex-shrink-0 ${
              combatant.type === 'player' ? 'text-blue-400' :
              combatant.type === 'monster' ? 'text-red-400' :
              combatant.type === 'lair' ? 'text-amber-400' :
              'text-purple-400'
            }`} />
            <span
              className={`font-medium truncate ${
                isCurrentTurn ? 'text-accent-gold font-bold' : 'text-parchment'
              } ${combatant.isDefeated || combatant.isSkipped ? 'line-through' : ''}`}
            >
              {combatant.name}
            </span>
          </div>

          {/* Stats row */}
          {combatant.type !== 'lair' && (
            <div className="flex items-center gap-3 mt-1">
              {/* AC */}
              <div className="flex items-center gap-1 text-xs text-parchment/60">
                <Shield className="w-3 h-3" />
                <span>{combatant.ac}</span>
              </div>

              {/* HP Bar - clickable */}
              <button
                onClick={() => setShowHPEditor(!showHPEditor)}
                className="flex-1 flex items-center gap-1.5 group cursor-pointer"
                aria-label={`Edit HP for ${combatant.name}: ${combatant.hp}/${combatant.maxHp}`}
              >
                <Heart className="w-3 h-3 text-parchment/60 flex-shrink-0" />
                <div className="flex-1 h-2 bg-primary-light/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${hpColor} transition-all duration-300 rounded-full`}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
                <span className="text-xs text-parchment/60 tabular-nums min-w-[3rem] text-right">
                  {combatant.hp}/{combatant.maxHp}
                  {combatant.tempHp > 0 && (
                    <span className="text-blue-400"> +{combatant.tempHp}</span>
                  )}
                </span>
              </button>
            </div>
          )}

          {/* Conditions — touch-target-expanded remove buttons */}
          {combatant.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {combatant.conditions.map((condName) => {
                const condDef = CONDITION_DEFINITIONS[condName as Condition]
                return (
                  <button
                    key={condName}
                    onClick={() => onRemoveCondition(combatant.id, condName)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border min-h-[44px] min-w-[44px] touch-manipulation ${
                      condDef ? condDef.color : 'text-gray-400 bg-gray-500/15 border-gray-500/30'
                    } hover:opacity-70 transition-opacity`}
                    title={`Remove ${condName}`}
                  >
                    {condName}
                    <X className="w-3 h-3" />
                  </button>
                )
              })}
            </div>
          )}

          {/* Concentration badge */}
          {combatant.isConcentrating && (
            <button
              onClick={() => onToggleConcentration(combatant.id)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-1 rounded text-[10px] font-medium text-yellow-400 bg-yellow-500/15 border border-yellow-500/30 hover:opacity-70 transition-opacity"
            >
              Concentrating
              <X className="w-2.5 h-2.5" />
            </button>
          )}

          {/* Concentration check reminder */}
          {concentrationDamage !== null && (
            <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-500/30 rounded text-xs text-yellow-300">
              <div className="flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Concentration check! DC {getConcentrationDC(concentrationDamage)}
              </div>
              <button
                onClick={() => setConcentrationDamage(null)}
                className="mt-1 px-2 py-0.5 bg-yellow-700/40 rounded text-[10px] hover:bg-yellow-700/60 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Death saves for PCs at 0 HP */}
          {showDeathSaves && (
            <div className="mt-2 p-2 bg-red-900/30 border border-red-500/30 rounded" data-testid="death-saves">
              <div className="text-xs text-red-300 font-medium mb-1.5">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {combatant.name} is making death saves!
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-green-400">Saves:</span>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 ${
                        i < combatant.deathSaves.successes
                          ? 'bg-green-500 border-green-400'
                          : 'bg-transparent border-parchment/30'
                      }`}
                      data-testid={`death-save-success-${i}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-red-400">Fails:</span>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 ${
                        i < combatant.deathSaves.failures
                          ? 'bg-red-500 border-red-400'
                          : 'bg-transparent border-parchment/30'
                      }`}
                      data-testid={`death-save-failure-${i}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onDeathSave(combatant.id, true)}
                  className="flex-1 px-2 py-2 bg-green-800/40 text-green-300 border border-green-500/30 rounded text-xs font-medium hover:bg-green-800/60 transition-colors min-h-[44px] touch-manipulation"
                >
                  Success
                </button>
                <button
                  onClick={() => onDeathSave(combatant.id, false)}
                  className="flex-1 px-2 py-2 bg-red-800/40 text-red-300 border border-red-500/30 rounded text-xs font-medium hover:bg-red-800/60 transition-colors min-h-[44px] touch-manipulation"
                >
                  Failure
                </button>
                <button
                  onClick={() => onDeathSave(combatant.id, true)}
                  className="px-3 py-2 bg-primary-light/30 text-parchment/60 border border-parchment/20 rounded hover:bg-primary-light/50 transition-colors min-h-[44px] min-w-[44px] touch-manipulation flex items-center justify-center"
                  title="Roll 1d20 death save"
                >
                  <Dices className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {showActions && !combatant.isDefeated && (
          <div className="flex-shrink-0 flex flex-col gap-1">
            <button
              onClick={() => setShowConditionPicker(!showConditionPicker)}
              className="px-2 py-1 text-[10px] text-parchment/50 bg-primary-light/20 rounded hover:bg-primary-light/40 transition-colors"
              title="Add condition"
            >
              +Cond
            </button>
            <button
              onClick={() => onToggleConcentration(combatant.id)}
              className="px-2 py-1 text-[10px] text-parchment/50 bg-primary-light/20 rounded hover:bg-primary-light/40 transition-colors"
              title="Toggle concentration"
            >
              Conc
            </button>
            <button
              onClick={() => onSkip(combatant.id)}
              className="px-2 py-1 text-[10px] text-parchment/50 bg-primary-light/20 rounded hover:bg-primary-light/40 transition-colors"
              title={combatant.isSkipped ? 'Unskip turn' : 'Skip turn'}
            >
              {combatant.isSkipped ? 'Unskip' : 'Skip'}
            </button>
            <button
              onClick={() => onReady(combatant.id)}
              className="px-2 py-1 text-[10px] text-parchment/50 bg-primary-light/20 rounded hover:bg-primary-light/40 transition-colors"
              title={combatant.isReadied ? 'Unready' : 'Ready action'}
            >
              {combatant.isReadied ? 'Unready' : 'Ready'}
            </button>
            <button
              onClick={() => onRemove(combatant.id)}
              className="px-2 py-1 text-[10px] text-red-400/60 bg-red-900/10 rounded hover:bg-red-900/30 transition-colors"
              title="Remove from combat"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* HP Editor (inline, below main content) */}
      {showHPEditor && combatant.type !== 'lair' && (
        <div className="mt-3">
          <CombatantHPEditor
            currentHp={combatant.hp}
            maxHp={combatant.maxHp}
            tempHp={combatant.tempHp}
            isCurrentTurn={isCurrentTurn}
            onDamage={handleDamage}
            onHeal={handleHeal}
            onSetTempHp={handleSetTempHp}
            onClose={() => setShowHPEditor(false)}
          />
        </div>
      )}

      {/* Condition Picker */}
      {showConditionPicker && (
        <div className="mt-3 p-2 bg-primary border border-parchment/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-parchment/70 font-medium">Add Condition</span>
            <button
              onClick={() => setShowConditionPicker(false)}
              className="text-parchment/40 hover:text-parchment/70"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {Object.values(CONDITION_DEFINITIONS).map((cond) => (
              <button
                key={cond.id}
                onClick={() => {
                  onAddCondition(combatant.id, cond.id)
                  setShowConditionPicker(false)
                }}
                disabled={combatant.conditions.includes(cond.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                  combatant.conditions.includes(cond.id)
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:opacity-80 cursor-pointer'
                } ${cond.color}`}
              >
                {cond.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
