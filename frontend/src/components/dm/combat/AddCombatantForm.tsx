/**
 * AddCombatantForm (Story 35.1, 35.5)
 *
 * Form for adding monster/NPC combatants to an encounter.
 * Used both in encounter setup and mid-combat addition.
 */

import { useState } from 'react'
import { Skull, User, Plus, Copy } from 'lucide-react'
import {
  createMonsterCombatant,
  createMultipleCombatants,
  createLairAction,
} from '@/utils/combat'
import type { CombatCombatant } from '@/utils/combat'

interface AddCombatantFormProps {
  onAdd: (combatants: CombatCombatant[]) => void
  existingCount: number
  showLairAction?: boolean
}

export default function AddCombatantForm({
  onAdd,
  existingCount,
  showLairAction = false,
}: AddCombatantFormProps) {
  const [name, setName] = useState('')
  const [ac, setAc] = useState(10)
  const [maxHp, setMaxHp] = useState(10)
  const [initiativeModifier, setInitiativeModifier] = useState(0)
  const [cr, setCr] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [combatantType, setCombatantType] = useState<'monster' | 'npc'>('monster')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const parsedCr = cr ? parseFloat(cr) : undefined
    const groupId = quantity > 1 ? `group-${Date.now()}` : undefined

    if (quantity > 1) {
      const combatants = createMultipleCombatants(
        name.trim(),
        ac,
        maxHp,
        initiativeModifier,
        quantity,
        existingCount,
        parsedCr,
        groupId,
      )
      onAdd(combatants)
    } else {
      const combatant = createMonsterCombatant(
        name.trim(),
        ac,
        maxHp,
        initiativeModifier,
        existingCount,
        parsedCr,
        combatantType,
        groupId,
      )
      onAdd([combatant])
    }

    // Reset form
    setName('')
    setAc(10)
    setMaxHp(10)
    setInitiativeModifier(0)
    setCr('')
    setQuantity(1)
  }

  const handleAddLairAction = () => {
    const lair = createLairAction('Lair Action', 20, existingCount)
    onAdd([lair])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-heading text-accent-gold">Add Combatant</h3>
      </div>

      {/* Type selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setCombatantType('monster')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            combatantType === 'monster'
              ? 'bg-red-900/40 text-red-300 border border-red-500/50'
              : 'bg-primary-light/30 text-parchment/60 border border-transparent hover:bg-primary-light/50'
          }`}
        >
          <Skull className="w-4 h-4" />
          Monster
        </button>
        <button
          type="button"
          onClick={() => setCombatantType('npc')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            combatantType === 'npc'
              ? 'bg-purple-900/40 text-purple-300 border border-purple-500/50'
              : 'bg-primary-light/30 text-parchment/60 border border-transparent hover:bg-primary-light/50'
          }`}
        >
          <User className="w-4 h-4" />
          NPC
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name */}
        <div>
          <label htmlFor="combatant-name" className="block text-sm text-parchment/70 mb-1">
            Name *
          </label>
          <input
            id="combatant-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Goblin"
            className="w-full px-3 py-2 bg-primary-light/30 border border-parchment/20 rounded text-parchment placeholder-parchment/40 focus:border-accent-gold focus:outline-none"
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label htmlFor="combatant-ac" className="block text-sm text-parchment/70 mb-1">
              AC
            </label>
            <input
              id="combatant-ac"
              type="number"
              value={ac}
              onChange={(e) => setAc(parseInt(e.target.value) || 0)}
              min={0}
              className="w-full px-3 py-2 bg-primary-light/30 border border-parchment/20 rounded text-parchment text-center focus:border-accent-gold focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="combatant-hp" className="block text-sm text-parchment/70 mb-1">
              HP
            </label>
            <input
              id="combatant-hp"
              type="number"
              value={maxHp}
              onChange={(e) => setMaxHp(parseInt(e.target.value) || 1)}
              min={1}
              className="w-full px-3 py-2 bg-primary-light/30 border border-parchment/20 rounded text-parchment text-center focus:border-accent-gold focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="combatant-init-mod" className="block text-sm text-parchment/70 mb-1">
              Init Mod
            </label>
            <input
              id="combatant-init-mod"
              type="number"
              value={initiativeModifier}
              onChange={(e) => setInitiativeModifier(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-primary-light/30 border border-parchment/20 rounded text-parchment text-center focus:border-accent-gold focus:outline-none"
            />
          </div>
        </div>

        {/* CR and Quantity row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="combatant-cr" className="block text-sm text-parchment/70 mb-1">
              CR (optional)
            </label>
            <input
              id="combatant-cr"
              type="text"
              value={cr}
              onChange={(e) => setCr(e.target.value)}
              placeholder="e.g. 1/4"
              className="w-full px-3 py-2 bg-primary-light/30 border border-parchment/20 rounded text-parchment placeholder-parchment/40 text-center focus:border-accent-gold focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="combatant-quantity" className="block text-sm text-parchment/70 mb-1">
              Quantity
            </label>
            <input
              id="combatant-quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={20}
              className="w-full px-3 py-2 bg-primary-light/30 border border-parchment/20 rounded text-parchment text-center focus:border-accent-gold focus:outline-none"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent-gold/20 text-accent-gold border border-accent-gold/40 rounded font-medium hover:bg-accent-gold/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {quantity > 1 ? `Add ${quantity} ${name || 'Combatants'}` : 'Add Combatant'}
          </button>
        </div>
      </form>

      {/* Quick duplicate - shown when there are already combatants */}
      {existingCount > 0 && (
        <button
          type="button"
          onClick={() => {
            if (name.trim()) {
              handleSubmit(new Event('submit') as unknown as React.FormEvent)
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-light/20 text-parchment/60 border border-parchment/10 rounded text-sm hover:bg-primary-light/30 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          Add Another
        </button>
      )}

      {/* Lair action button */}
      {showLairAction && (
        <button
          type="button"
          onClick={handleAddLairAction}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-900/20 text-purple-300 border border-purple-500/30 rounded text-sm hover:bg-purple-900/30 transition-colors"
          data-testid="add-lair-action"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Lair Action (Init 20)
        </button>
      )}
    </div>
  )
}
