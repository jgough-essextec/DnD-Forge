/**
 * InitiativeRoller (Story 35.2)
 *
 * Transitional screen for rolling initiative for all combatants.
 * Supports "Roll All", individual rolls, manual input, and auto-sort preview.
 */

import { useState, useCallback } from 'react'
import { Dices, ArrowDown, Check, RotateCcw, AlertTriangle } from 'lucide-react'
import type { CombatCombatant, EncounterState } from '@/utils/combat'
import { sortByInitiative, findTiedGroups } from '@/utils/combat'
import { rollInitiative } from '@/utils/dice'

interface InitiativeRollerProps {
  encounter: EncounterState
  onUpdateEncounter: (encounter: EncounterState) => void
  onConfirmOrder: () => void
  onBack: () => void
}

export default function InitiativeRoller({
  encounter,
  onUpdateEncounter,
  onConfirmOrder,
  onBack,
}: InitiativeRollerProps) {
  const [autoRollMonsters, setAutoRollMonsters] = useState(false)

  const sorted = sortByInitiative(encounter.combatants)
  const tiedGroups = findTiedGroups(encounter.combatants)
  const tiedIds = new Set(tiedGroups.flat().map((c) => c.id))

  const allRolled = encounter.combatants.every((c) => c.initiative > 0)

  const updateCombatant = useCallback(
    (id: string, updates: Partial<CombatCombatant>) => {
      onUpdateEncounter({
        ...encounter,
        combatants: encounter.combatants.map((c) =>
          c.id === id ? { ...c, ...updates } : c,
        ),
      })
    },
    [encounter, onUpdateEncounter],
  )

  const rollForCombatant = useCallback(
    (combatant: CombatCombatant) => {
      // Lair actions always have fixed initiative
      if (combatant.type === 'lair') return

      const result = rollInitiative(combatant.initiativeModifier)

      // Apply to all in the same group
      if (combatant.groupId) {
        onUpdateEncounter({
          ...encounter,
          combatants: encounter.combatants.map((c) =>
            c.groupId === combatant.groupId
              ? { ...c, initiative: result.total }
              : c,
          ),
        })
      } else {
        updateCombatant(combatant.id, { initiative: result.total })
      }
    },
    [encounter, onUpdateEncounter, updateCombatant],
  )

  const handleRollAll = useCallback(() => {
    const updatedCombatants = encounter.combatants.map((c) => {
      if (c.type === 'lair') return c
      if (autoRollMonsters && c.type === 'player') return c

      const result = rollInitiative(c.initiativeModifier)
      return { ...c, initiative: result.total }
    })

    // Apply group initiative (same roll for grouped monsters)
    const groupRolls = new Map<string, number>()
    const finalCombatants = updatedCombatants.map((c) => {
      if (!c.groupId) return c
      if (groupRolls.has(c.groupId)) {
        return { ...c, initiative: groupRolls.get(c.groupId)! }
      }
      groupRolls.set(c.groupId, c.initiative)
      return c
    })

    onUpdateEncounter({
      ...encounter,
      combatants: finalCombatants,
    })
  }, [encounter, onUpdateEncounter, autoRollMonsters])

  const handleManualInitiative = (id: string, value: string) => {
    const num = parseInt(value)
    if (!isNaN(num)) {
      updateCombatant(id, { initiative: num })
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading text-accent-gold">Roll Initiative</h2>
          <p className="text-sm text-parchment/60 mt-0.5">
            Roll or enter initiative for each combatant
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 text-sm text-parchment/50 bg-primary-light/20 rounded hover:bg-primary-light/40 transition-colors"
        >
          Back to Setup
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={handleRollAll}
          className="flex items-center gap-2 px-4 py-2 bg-accent-gold/20 text-accent-gold border border-accent-gold/40 rounded-lg font-medium hover:bg-accent-gold/30 transition-colors"
        >
          <Dices className="w-5 h-5" />
          {autoRollMonsters ? 'Roll Monsters' : 'Roll All'}
        </button>

        <label className="flex items-center gap-2 text-sm text-parchment/60 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRollMonsters}
            onChange={(e) => setAutoRollMonsters(e.target.checked)}
            className="rounded border-parchment/30 bg-primary-light/30 text-accent-gold focus:ring-accent-gold"
          />
          Auto-roll monsters, manual for players
        </label>
      </div>

      {/* Combatant list */}
      <div className="space-y-2 mb-6">
        {encounter.combatants.map((combatant) => {
          const isTied = tiedIds.has(combatant.id)

          return (
            <div
              key={combatant.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                combatant.initiative > 0
                  ? 'border-parchment/20 bg-primary-light/10'
                  : 'border-parchment/10 bg-primary-light/5'
              } ${isTied ? 'ring-1 ring-yellow-500/30' : ''}`}
              data-testid={`initiative-row-${combatant.id}`}
            >
              {/* Initiative input */}
              <div className="flex-shrink-0 w-16">
                <input
                  type="number"
                  value={combatant.initiative || ''}
                  onChange={(e) => handleManualInitiative(combatant.id, e.target.value)}
                  placeholder="—"
                  className="w-full px-2 py-1.5 bg-primary-light/30 border border-parchment/20 rounded text-center text-sm text-parchment font-mono focus:border-accent-gold focus:outline-none"
                  aria-label={`Initiative for ${combatant.name}`}
                />
              </div>

              {/* Name and modifier */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium truncate ${
                    combatant.type === 'player' ? 'text-blue-300' :
                    combatant.type === 'lair' ? 'text-amber-300' :
                    'text-red-300'
                  }`}>
                    {combatant.name}
                  </span>
                  <span className="text-xs text-parchment/40">
                    ({combatant.initiativeModifier >= 0 ? '+' : ''}
                    {combatant.initiativeModifier})
                  </span>
                  {isTied && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-medium rounded">
                      <AlertTriangle className="w-3 h-3" />
                      Tie
                    </span>
                  )}
                </div>
                <span className="text-xs text-parchment/40 capitalize">
                  {combatant.type}
                </span>
              </div>

              {/* Roll button */}
              {combatant.type !== 'lair' && (
                <button
                  onClick={() => rollForCombatant(combatant)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-parchment/60 bg-primary-light/20 rounded hover:bg-primary-light/40 hover:text-parchment transition-colors"
                  title="Roll initiative"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Roll
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Sort preview */}
      {encounter.combatants.some((c) => c.initiative > 0) && (
        <div className="mb-6 p-4 bg-primary-light/10 border border-parchment/10 rounded-lg">
          <h3 className="text-sm font-heading text-parchment/70 mb-2 flex items-center gap-2">
            <ArrowDown className="w-4 h-4" />
            Initiative Order Preview
          </h3>
          <ol className="space-y-1">
            {sorted
              .filter((c) => c.initiative > 0)
              .map((combatant, index) => (
                <li
                  key={combatant.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="w-5 text-right text-parchment/40 text-xs">
                    {index + 1}.
                  </span>
                  <span className="font-mono text-accent-gold/80 w-6 text-right">
                    {combatant.initiative}
                  </span>
                  <span className={`${
                    combatant.type === 'player' ? 'text-blue-300' :
                    combatant.type === 'lair' ? 'text-amber-300' :
                    'text-red-300'
                  }`}>
                    {combatant.name}
                  </span>
                </li>
              ))}
          </ol>
        </div>
      )}

      {/* Confirm button */}
      <button
        onClick={onConfirmOrder}
        disabled={!allRolled}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent-gold text-primary font-bold rounded-lg hover:bg-accent-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Check className="w-5 h-5" />
        Confirm Order & Begin Combat
      </button>
      {!allRolled && (
        <p className="text-xs text-parchment/40 text-center mt-2">
          All combatants must have initiative before starting combat
        </p>
      )}
    </div>
  )
}
