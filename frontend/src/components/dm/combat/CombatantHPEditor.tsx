/**
 * CombatantHPEditor (Story 35.4)
 *
 * Inline HP editing component with damage/heal input and quick buttons.
 * Opens when clicking on a combatant's HP bar.
 */

import { useState } from 'react'
import { Minus, Plus, X, Shield } from 'lucide-react'

interface CombatantHPEditorProps {
  currentHp: number
  maxHp: number
  tempHp: number
  isCurrentTurn: boolean
  onDamage: (amount: number) => void
  onHeal: (amount: number) => void
  onSetTempHp: (amount: number) => void
  onClose: () => void
}

export default function CombatantHPEditor({
  currentHp,
  maxHp,
  tempHp,
  isCurrentTurn,
  onDamage,
  onHeal,
  onSetTempHp,
  onClose,
}: CombatantHPEditorProps) {
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState<'damage' | 'heal' | 'temp'>('damage')

  const handleApply = () => {
    const numAmount = parseInt(amount) || 0
    if (numAmount <= 0) return

    if (mode === 'damage') {
      onDamage(numAmount)
    } else if (mode === 'heal') {
      onHeal(numAmount)
    } else {
      onSetTempHp(numAmount)
    }
    setAmount('')
  }

  const handleQuickDamage = (dmg: number) => {
    onDamage(dmg)
  }

  const handleQuickHeal = (heal: number) => {
    onHeal(heal)
  }

  return (
    <div
      className="bg-primary border border-parchment/20 rounded-lg p-3 shadow-xl space-y-3"
      data-testid="hp-editor"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-parchment/70">
          HP: {currentHp}/{maxHp}
          {tempHp > 0 && (
            <span className="text-blue-400 ml-1">(+{tempHp} temp)</span>
          )}
        </span>
        <button
          onClick={onClose}
          className="text-parchment/40 hover:text-parchment/70 transition-colors"
          aria-label="Close HP editor"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-primary-light/20 rounded p-0.5">
        <button
          onClick={() => setMode('damage')}
          className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            mode === 'damage'
              ? 'bg-red-900/60 text-red-300'
              : 'text-parchment/50 hover:text-parchment/70'
          }`}
        >
          Damage
        </button>
        <button
          onClick={() => setMode('heal')}
          className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            mode === 'heal'
              ? 'bg-green-900/60 text-green-300'
              : 'text-parchment/50 hover:text-parchment/70'
          }`}
        >
          Heal
        </button>
        <button
          onClick={() => setMode('temp')}
          className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            mode === 'temp'
              ? 'bg-blue-900/60 text-blue-300'
              : 'text-parchment/50 hover:text-parchment/70'
          }`}
        >
          <Shield className="w-3 h-3 inline mr-0.5" />
          Temp
        </button>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          min={1}
          className="flex-1 px-3 py-1.5 bg-primary-light/30 border border-parchment/20 rounded text-parchment text-center text-sm placeholder-parchment/40 focus:border-accent-gold focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleApply()
          }}
          data-testid="hp-amount-input"
        />
        <button
          onClick={handleApply}
          disabled={!amount || parseInt(amount) <= 0}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-40 ${
            mode === 'damage'
              ? 'bg-red-700 text-white hover:bg-red-600'
              : mode === 'heal'
                ? 'bg-green-700 text-white hover:bg-green-600'
                : 'bg-blue-700 text-white hover:bg-blue-600'
          }`}
        >
          Apply
        </button>
      </div>

      {/* Quick buttons (shown on current turn or always for damage/heal) */}
      {isCurrentTurn && mode === 'damage' && (
        <div className="flex gap-1.5">
          {[5, 10, 15].map((dmg) => (
            <button
              key={dmg}
              onClick={() => handleQuickDamage(dmg)}
              className="flex-1 flex items-center justify-center gap-0.5 px-2 py-1 bg-red-900/30 text-red-300 border border-red-500/20 rounded text-xs hover:bg-red-900/50 transition-colors"
            >
              <Minus className="w-3 h-3" />
              {dmg}
            </button>
          ))}
        </div>
      )}

      {isCurrentTurn && mode === 'heal' && (
        <div className="flex gap-1.5">
          {[5, 10, 15].map((heal) => (
            <button
              key={heal}
              onClick={() => handleQuickHeal(heal)}
              className="flex-1 flex items-center justify-center gap-0.5 px-2 py-1 bg-green-900/30 text-green-300 border border-green-500/20 rounded text-xs hover:bg-green-900/50 transition-colors"
            >
              <Plus className="w-3 h-3" />
              {heal}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
