/**
 * CombatStatsBlock (Story 17.5)
 *
 * Displays AC, Initiative, and Speed in prominent stat boxes.
 * Supports initiative rolls and manual overrides in edit mode.
 */

import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { Shield, Zap, Footprints } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function CombatStatsBlock() {
  const { character, editableCharacter, updateField, editMode, derivedStats } =
    useCharacterSheet()
  const [initiativeRoll, setInitiativeRoll] = useState<number | null>(null)

  const displayCharacter = character ? { ...character, ...editableCharacter } : null

  if (!displayCharacter) {
    return null
  }

  const handleInitiativeRoll = () => {
    if (editMode.isEditing) return

    const roll = Math.floor(Math.random() * 20) + 1
    const total = roll + derivedStats.initiative

    setInitiativeRoll(total)
    setTimeout(() => {
      setInitiativeRoll(null)
    }, 3000)
  }

  const ac = derivedStats.armorClass
  const initiative = derivedStats.initiative
  const speed = displayCharacter.speed.walk

  return (
    <div
      className="grid grid-cols-3 gap-4"
      data-testid="combat-stats-block"
    >
      {/* Armor Class */}
      <div className="flex flex-col items-center p-4 rounded-lg border-2 border-parchment/20 bg-bg-secondary">
        <Shield className="w-6 h-6 text-accent-gold mb-2" />
        <div className="text-3xl font-heading font-bold text-parchment">
          {ac}
        </div>
        <div className="text-xs uppercase tracking-wider text-parchment/60 mt-1">
          Armor Class
        </div>
        {editMode.isEditing && (
          <div className="mt-2 w-full">
            <label className="text-xs text-parchment/60 mb-1 block">
              Manual Override:
            </label>
            <input
              type="number"
              value={displayCharacter.armorClassOverride ?? ''}
              onChange={(e) =>
                updateField(
                  'armorClassOverride',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="Auto"
              className="w-full bg-bg-primary border border-parchment/30 rounded px-2 py-1 text-parchment text-sm focus:outline-none focus:border-accent-gold"
              aria-label="AC override"
            />
          </div>
        )}
      </div>

      {/* Initiative */}
      <div
        className={cn(
          'flex flex-col items-center p-4 rounded-lg border-2 border-parchment/20 bg-bg-secondary',
          !editMode.isEditing && 'cursor-pointer hover:border-accent-gold/50 transition-colors',
          initiativeRoll && 'bg-accent-gold/10 border-accent-gold/50'
        )}
        onClick={handleInitiativeRoll}
        role={!editMode.isEditing ? 'button' : undefined}
        tabIndex={!editMode.isEditing ? 0 : undefined}
        onKeyDown={
          !editMode.isEditing
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleInitiativeRoll()
                }
              }
            : undefined
        }
        title={
          !editMode.isEditing
            ? `Click to roll initiative: 1d20 + ${initiative}`
            : undefined
        }
      >
        <Zap className="w-6 h-6 text-accent-gold mb-2" />
        <div className="text-3xl font-heading font-bold text-parchment">
          {initiative >= 0 ? '+' : ''}
          {initiative}
        </div>
        <div className="text-xs uppercase tracking-wider text-parchment/60 mt-1">
          Initiative
        </div>
        {initiativeRoll !== null && (
          <div className="text-sm font-bold text-accent-gold mt-2">
            Roll: {initiativeRoll}
          </div>
        )}
        {editMode.isEditing && (
          <div className="mt-2 w-full">
            <label className="text-xs text-parchment/60 mb-1 block">
              Bonus:
            </label>
            <input
              type="number"
              value={displayCharacter.initiativeBonus ?? ''}
              onChange={(e) =>
                updateField(
                  'initiativeBonus',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              placeholder="0"
              className="w-full bg-bg-primary border border-parchment/30 rounded px-2 py-1 text-parchment text-sm focus:outline-none focus:border-accent-gold"
              aria-label="Initiative bonus"
            />
          </div>
        )}
      </div>

      {/* Speed */}
      <div className="flex flex-col items-center p-4 rounded-lg border-2 border-parchment/20 bg-bg-secondary">
        <Footprints className="w-6 h-6 text-accent-gold mb-2" />
        <div className="text-3xl font-heading font-bold text-parchment">
          {speed}
        </div>
        <div className="text-xs uppercase tracking-wider text-parchment/60 mt-1">
          Speed (ft)
        </div>
        {editMode.isEditing && (
          <div className="mt-2 w-full">
            <label className="text-xs text-parchment/60 mb-1 block">
              Walk:
            </label>
            <input
              type="number"
              value={speed}
              onChange={(e) =>
                updateField('speed', {
                  ...displayCharacter.speed,
                  walk: parseInt(e.target.value) || 30,
                })
              }
              className="w-full bg-bg-primary border border-parchment/30 rounded px-2 py-1 text-parchment text-sm focus:outline-none focus:border-accent-gold"
              aria-label="Walking speed"
            />
          </div>
        )}
        {/* Show other movement types if present */}
        {(displayCharacter.speed.fly ||
          displayCharacter.speed.swim ||
          displayCharacter.speed.climb ||
          displayCharacter.speed.burrow) && (
          <div className="mt-2 text-xs text-parchment/70 space-y-0.5">
            {displayCharacter.speed.fly && (
              <div>Fly: {displayCharacter.speed.fly} ft</div>
            )}
            {displayCharacter.speed.swim && (
              <div>Swim: {displayCharacter.speed.swim} ft</div>
            )}
            {displayCharacter.speed.climb && (
              <div>Climb: {displayCharacter.speed.climb} ft</div>
            )}
            {displayCharacter.speed.burrow && (
              <div>Burrow: {displayCharacter.speed.burrow} ft</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
