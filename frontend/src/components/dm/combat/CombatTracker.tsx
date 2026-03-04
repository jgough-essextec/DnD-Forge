/**
 * CombatTracker (Story 35.3)
 *
 * Main combat tracker view with initiative order list, turn cycling,
 * round counter, and combatant management.
 */

import { useState, useCallback } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Flag,
  Swords,
} from 'lucide-react'
import type { CombatCombatant, EncounterState } from '@/utils/combat'
import {
  nextTurn,
  previousTurn,
  removeCombatant,
  insertCombatant,
  applyCombatDamage,
  applyCombatHealing,
  sortByInitiative,
  getXPForCR,
} from '@/utils/combat'
import { setTempHP } from '@/utils/hp-tracker'
import CombatantCard from './CombatantCard'
import AddCombatantForm from './AddCombatantForm'

interface CombatTrackerProps {
  encounter: EncounterState
  onUpdateEncounter: (encounter: EncounterState) => void
  onEndEncounter: () => void
}

export default function CombatTracker({
  encounter,
  onUpdateEncounter,
  onEndEncounter,
}: CombatTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [joinMessage, setJoinMessage] = useState<string | null>(null)

  const sorted = sortByInitiative(encounter.combatants)
  const currentCombatant = sorted[encounter.currentTurnIndex]

  const updateCombatants = useCallback(
    (combatants: CombatCombatant[]) => {
      onUpdateEncounter({
        ...encounter,
        combatants,
      })
    },
    [encounter, onUpdateEncounter],
  )

  const updateCombatant = useCallback(
    (id: string, updater: (c: CombatCombatant) => CombatCombatant) => {
      updateCombatants(
        encounter.combatants.map((c) => (c.id === id ? updater(c) : c)),
      )
    },
    [encounter.combatants, updateCombatants],
  )

  // Turn management
  const handleNextTurn = () => {
    const result = nextTurn(sorted, encounter.currentTurnIndex, encounter.round)
    onUpdateEncounter({
      ...encounter,
      currentTurnIndex: result.turnIndex,
      round: result.round,
      combatants: encounter.combatants,
    })
  }

  const handlePrevTurn = () => {
    const result = previousTurn(sorted, encounter.currentTurnIndex, encounter.round)
    onUpdateEncounter({
      ...encounter,
      currentTurnIndex: result.turnIndex,
      round: result.round,
      combatants: encounter.combatants,
    })
  }

  // HP management
  const handleDamage = (id: string, amount: number) => {
    updateCombatant(id, (c) => applyCombatDamage(c, amount))
  }

  const handleHeal = (id: string, amount: number) => {
    updateCombatant(id, (c) => applyCombatHealing(c, amount))
  }

  const handleSetTempHp = (id: string, amount: number) => {
    updateCombatant(id, (c) => ({
      ...c,
      tempHp: setTempHP(c.tempHp, amount),
    }))
  }

  // Condition management
  const handleAddCondition = (id: string, condition: string) => {
    updateCombatant(id, (c) => ({
      ...c,
      conditions: c.conditions.includes(condition)
        ? c.conditions
        : [...c.conditions, condition],
    }))
  }

  const handleRemoveCondition = (id: string, condition: string) => {
    updateCombatant(id, (c) => ({
      ...c,
      conditions: c.conditions.filter((cond) => cond !== condition),
    }))
  }

  const handleToggleConcentration = (id: string) => {
    updateCombatant(id, (c) => ({
      ...c,
      isConcentrating: !c.isConcentrating,
    }))
  }

  // Combat actions
  const handleRemoveCombatant = (id: string) => {
    const combatant = encounter.combatants.find((c) => c.id === id)
    const result = removeCombatant(sorted, id, encounter.currentTurnIndex)

    // Log XP if removing a monster
    let xpToAdd = 0
    if (combatant && (combatant.type === 'monster' || combatant.type === 'npc') && combatant.cr !== undefined) {
      xpToAdd = getXPForCR(combatant.cr)
    }

    onUpdateEncounter({
      ...encounter,
      combatants: encounter.combatants.filter((c) => c.id !== id),
      currentTurnIndex: result.turnIndex,
      defeatedMonsterXp: encounter.defeatedMonsterXp + xpToAdd,
    })
  }

  const handleSkip = (id: string) => {
    updateCombatant(id, (c) => ({
      ...c,
      isSkipped: !c.isSkipped,
    }))
  }

  const handleReady = (id: string) => {
    updateCombatant(id, (c) => ({
      ...c,
      isReadied: !c.isReadied,
    }))
  }

  const handleDeathSave = (id: string, success: boolean) => {
    updateCombatant(id, (c) => {
      const saves = { ...c.deathSaves }
      if (success) {
        saves.successes = Math.min(3, saves.successes + 1)
      } else {
        saves.failures = Math.min(3, saves.failures + 1)
      }
      return { ...c, deathSaves: saves }
    })
  }

  // Mid-combat add
  const handleAddMidCombat = (newCombatants: CombatCombatant[]) => {
    let currentCombatantList = encounter.combatants

    for (const newCombatant of newCombatants) {
      const result = insertCombatant(
        sortByInitiative(currentCombatantList),
        newCombatant,
        encounter.currentTurnIndex,
      )
      currentCombatantList = [...currentCombatantList, newCombatant]

      const actsText = result.actsThisRound ? 'acts this round' : 'acts next round'
      setJoinMessage(
        `${newCombatant.name} joins at initiative ${newCombatant.initiative} -- ${actsText}!`,
      )
    }

    onUpdateEncounter({
      ...encounter,
      combatants: currentCombatantList,
    })
    setShowAddForm(false)

    // Clear message after 5 seconds
    setTimeout(() => setJoinMessage(null), 5000)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-accent-gold" />
            <h2 className="text-xl font-heading text-accent-gold">
              {encounter.name || 'Combat'}
            </h2>
          </div>
          {/* Round counter */}
          <div className="px-4 py-1.5 bg-accent-gold/10 border border-accent-gold/30 rounded-lg">
            <span className="text-sm text-accent-gold font-bold">
              Round {encounter.round}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-parchment/60 bg-primary-light/20 rounded hover:bg-primary-light/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Combatant
          </button>
          <button
            onClick={onEndEncounter}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded hover:bg-red-900/30 transition-colors"
          >
            <Flag className="w-4 h-4" />
            End Encounter
          </button>
        </div>
      </div>

      {/* Turn indicator */}
      {currentCombatant && (
        <div className="mb-4 p-3 bg-accent-gold/10 border border-accent-gold/30 rounded-lg text-center">
          <span className="text-accent-gold font-heading">
            Round {encounter.round} &mdash; {currentCombatant.name}&apos;s Turn
          </span>
        </div>
      )}

      {/* Join message */}
      {joinMessage && (
        <div className="mb-3 p-2 bg-green-900/20 border border-green-500/30 rounded text-sm text-green-300 text-center">
          {joinMessage}
        </div>
      )}

      {/* Mid-combat add form */}
      {showAddForm && (
        <div className="mb-4 p-4 bg-primary-light/10 border border-parchment/10 rounded-lg">
          <AddCombatantForm
            onAdd={handleAddMidCombat}
            existingCount={encounter.combatants.length}
            showLairAction
          />
        </div>
      )}

      {/* Turn controls */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <button
          onClick={handlePrevTurn}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-parchment/60 bg-primary-light/20 rounded-lg hover:bg-primary-light/40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Turn
        </button>
        <button
          onClick={handleNextTurn}
          className="flex items-center gap-1.5 px-6 py-2.5 text-sm bg-accent-gold text-primary font-bold rounded-lg hover:bg-accent-gold/90 transition-colors"
        >
          Next Turn
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Initiative order list */}
      <div className="flex-1 overflow-y-auto space-y-2" data-testid="initiative-order">
        {sorted.map((combatant, index) => (
          <CombatantCard
            key={combatant.id}
            combatant={combatant}
            isCurrentTurn={index === encounter.currentTurnIndex}
            isPastTurn={index < encounter.currentTurnIndex}
            onDamage={handleDamage}
            onHeal={handleHeal}
            onSetTempHp={handleSetTempHp}
            onAddCondition={handleAddCondition}
            onRemoveCondition={handleRemoveCondition}
            onToggleConcentration={handleToggleConcentration}
            onRemove={handleRemoveCombatant}
            onSkip={handleSkip}
            onReady={handleReady}
            onDeathSave={handleDeathSave}
          />
        ))}
      </div>
    </div>
  )
}
