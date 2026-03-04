/**
 * EncounterSetup (Story 35.1)
 *
 * Encounter setup screen: auto-populate party, add monsters/NPCs,
 * manage combatant list, and transition to initiative rolling.
 */

import { useEffect } from 'react'
import {
  Swords,
  Skull,
  User,
  Shield,
  Heart,
  X,
  Castle,
  Play,
} from 'lucide-react'
import type { CombatCombatant, EncounterState } from '@/utils/combat'
import { createPlayerCombatant, duplicateCombatant } from '@/utils/combat'
import { getModifier } from '@/utils/calculations/ability'
import AddCombatantForm from './AddCombatantForm'

interface CharacterData {
  id: string
  name: string
  ac: number
  hp: number
  maxHp: number
  dexterity: number
  conditions: string[]
}

interface EncounterSetupProps {
  encounter: EncounterState
  characters: CharacterData[]
  onUpdateEncounter: (encounter: EncounterState) => void
  onStartInitiative: () => void
}

const TYPE_ICONS = {
  player: Swords,
  monster: Skull,
  npc: User,
  lair: Castle,
} as const

export default function EncounterSetup({
  encounter,
  characters,
  onUpdateEncounter,
  onStartInitiative,
}: EncounterSetupProps) {
  // Auto-populate party from characters on mount
  useEffect(() => {
    if (encounter.combatants.length === 0 && characters.length > 0) {
      const playerCombatants = characters.map((char, index) =>
        createPlayerCombatant(
          char.id,
          char.name,
          char.ac,
          char.hp,
          char.maxHp,
          getModifier(char.dexterity),
          char.conditions,
          index,
        ),
      )
      onUpdateEncounter({
        ...encounter,
        combatants: playerCombatants,
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddCombatants = (newCombatants: CombatCombatant[]) => {
    onUpdateEncounter({
      ...encounter,
      combatants: [...encounter.combatants, ...newCombatants],
    })
  }

  const handleRemoveCombatant = (id: string) => {
    onUpdateEncounter({
      ...encounter,
      combatants: encounter.combatants.filter((c) => c.id !== id),
    })
  }

  const handleDuplicateCombatant = (combatant: CombatCombatant) => {
    const existingNames = encounter.combatants.map((c) => c.name)
    const dupe = duplicateCombatant(
      combatant,
      existingNames,
      encounter.combatants.length,
    )
    onUpdateEncounter({
      ...encounter,
      combatants: [...encounter.combatants, dupe],
    })
  }

  const hasEnoughCombatants = encounter.combatants.length >= 2
  const playerCount = encounter.combatants.filter((c) => c.type === 'player').length
  const monsterCount = encounter.combatants.filter(
    (c) => c.type === 'monster' || c.type === 'npc',
  ).length

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left panel: Combatant list */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-heading text-accent-gold">Encounter Setup</h2>
            <p className="text-sm text-parchment/60 mt-0.5">
              {playerCount} player{playerCount !== 1 ? 's' : ''} &middot;{' '}
              {monsterCount} monster{monsterCount !== 1 ? 's' : ''}/NPC{monsterCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Combatant list */}
        <div className="space-y-2" data-testid="combatant-list">
          {encounter.combatants.length === 0 ? (
            <div className="text-center py-8 text-parchment/40">
              No combatants yet. Add party members and monsters to begin.
            </div>
          ) : (
            encounter.combatants.map((combatant) => {
              const TypeIcon = TYPE_ICONS[combatant.type]
              return (
                <div
                  key={combatant.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-parchment/10 ${
                    combatant.type === 'player'
                      ? 'bg-blue-900/10'
                      : combatant.type === 'lair'
                        ? 'bg-amber-900/10'
                        : 'bg-red-900/10'
                  }`}
                  data-testid={`setup-combatant-${combatant.id}`}
                >
                  {/* Drag handle placeholder */}
                  <div className="flex-shrink-0 w-5 text-parchment/20 cursor-grab">
                    <span className="text-sm">&#8942;&#8942;</span>
                  </div>

                  {/* Type icon */}
                  <TypeIcon
                    className={`w-4 h-4 flex-shrink-0 ${
                      combatant.type === 'player'
                        ? 'text-blue-400'
                        : combatant.type === 'monster'
                          ? 'text-red-400'
                          : combatant.type === 'lair'
                            ? 'text-amber-400'
                            : 'text-purple-400'
                    }`}
                  />

                  {/* Name */}
                  <span className="flex-1 text-parchment font-medium truncate">
                    {combatant.name}
                  </span>

                  {/* Stats */}
                  {combatant.type !== 'lair' && (
                    <div className="flex items-center gap-3 text-xs text-parchment/50">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {combatant.ac}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {combatant.hp}/{combatant.maxHp}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-accent-gold/50">Init</span>
                        {combatant.initiativeModifier >= 0 ? '+' : ''}
                        {combatant.initiativeModifier}
                      </div>
                    </div>
                  )}

                  {/* Duplicate button (for monsters) */}
                  {combatant.type !== 'player' && combatant.type !== 'lair' && (
                    <button
                      onClick={() => handleDuplicateCombatant(combatant)}
                      className="px-2 py-1 text-xs text-parchment/40 bg-primary-light/20 rounded hover:bg-primary-light/40 transition-colors"
                      title="Duplicate"
                    >
                      +1
                    </button>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveCombatant(combatant.id)}
                    className="text-parchment/30 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${combatant.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Start button */}
        <div className="mt-6">
          <button
            onClick={onStartInitiative}
            disabled={!hasEnoughCombatants}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent-gold text-primary font-bold rounded-lg hover:bg-accent-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            Roll Initiative & Start
          </button>
          {!hasEnoughCombatants && (
            <p className="text-xs text-parchment/40 text-center mt-2">
              Add at least 2 combatants to begin
            </p>
          )}
        </div>
      </div>

      {/* Right panel: Add combatant form */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="bg-primary-light/10 border border-parchment/10 rounded-lg p-4">
          <AddCombatantForm
            onAdd={handleAddCombatants}
            existingCount={encounter.combatants.length}
            showLairAction
          />
        </div>
      </div>
    </div>
  )
}
