/**
 * AbilityScoresPanel (Story 17.2)
 *
 * Displays all 6 ability scores with modifiers in classic vertical layout.
 * Uses the AbilityScoreDisplay shared component from Phase 2.
 */

import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { AbilityScoreDisplay } from '@/components/shared/AbilityScoreDisplay'
import { ABILITY_NAMES } from '@/types/core'
import type { AbilityName } from '@/types/core'

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

export function AbilityScoresPanel() {
  const { character, editableCharacter, updateField, editMode, derivedStats } =
    useCharacterSheet()

  const displayCharacter = character ? { ...character, ...editableCharacter } : null

  if (!displayCharacter) {
    return null
  }

  const handleScoreChange = (ability: AbilityName, newScore: number) => {
    const updatedBaseScores = {
      ...displayCharacter.baseAbilityScores,
      [ability]: newScore,
    }
    updateField('baseAbilityScores', updatedBaseScores)
  }

  return (
    <div className="space-y-3" data-testid="ability-scores-panel">
      {ABILITY_NAMES.map((ability) => {
        const baseScore = displayCharacter.baseAbilityScores[ability]
        const effectiveScore = derivedStats.effectiveAbilityScores[ability]
        const modifier = derivedStats.abilityModifiers[ability]
        const racialBonus = effectiveScore - baseScore

        return (
          <div key={ability} className="flex items-center gap-2">
            <AbilityScoreDisplay
              ability={ABILITY_LABELS[ability]}
              score={effectiveScore}
              modifier={modifier}
              racialBonus={racialBonus !== 0 ? racialBonus : undefined}
              size="md"
            />
            {editMode.isEditing && (
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`base-${ability}`}
                  className="text-xs text-parchment/60"
                >
                  Base:
                </label>
                <input
                  id={`base-${ability}`}
                  type="number"
                  min="3"
                  max="20"
                  value={baseScore}
                  onChange={(e) =>
                    handleScoreChange(ability, parseInt(e.target.value) || 8)
                  }
                  className="w-16 bg-bg-primary border border-parchment/30 rounded px-2 py-1 text-parchment text-sm focus:outline-none focus:border-accent-gold"
                  aria-label={`Base ${ability} score`}
                  data-testid={`base-${ability}-input`}
                />
                {racialBonus !== 0 && (
                  <span className="text-xs text-accent-gold/80">
                    +{racialBonus} racial
                  </span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
