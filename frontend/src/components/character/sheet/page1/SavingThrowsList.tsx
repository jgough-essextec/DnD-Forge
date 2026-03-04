/**
 * SavingThrowsList (Story 17.3)
 *
 * Displays all 6 saving throws with proficiency indicators and computed modifiers.
 * Supports click-to-roll in view mode and proficiency toggle in edit mode.
 */

import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { ProficiencyDot } from '@/components/shared/ProficiencyDot'
import { ModifierBadge } from '@/components/shared/ModifierBadge'
import { ABILITY_NAMES } from '@/types/core'
import type { AbilityName } from '@/types/core'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
}

export function SavingThrowsList() {
  const { character, editableCharacter, updateField, editMode, derivedStats } =
    useCharacterSheet()
  const [rollResults, setRollResults] = useState<Record<string, number | null>>({})

  const displayCharacter = character ? { ...character, ...editableCharacter } : null

  if (!displayCharacter) {
    return null
  }

  const handleSaveRoll = (ability: AbilityName) => {
    if (editMode.isEditing) return

    const modifier = derivedStats.savingThrows[ability]
    const roll = Math.floor(Math.random() * 20) + 1
    const total = roll + modifier

    setRollResults((prev) => ({ ...prev, [ability]: total }))
    setTimeout(() => {
      setRollResults((prev) => ({ ...prev, [ability]: null }))
    }, 3000)
  }

  const handleToggleProficiency = (ability: AbilityName) => {
    const proficiencies = displayCharacter.proficiencies.savingThrows
    const isProficient = proficiencies.includes(ability)

    const updated = isProficient
      ? proficiencies.filter((a) => a !== ability)
      : [...proficiencies, ability]

    updateField('proficiencies', {
      ...displayCharacter.proficiencies,
      savingThrows: updated,
    })
  }

  return (
    <div className="space-y-2" data-testid="saving-throws-list">
      <h3 className="text-xs uppercase tracking-wider text-parchment/60 font-semibold mb-3">
        Saving Throws
      </h3>
      {ABILITY_NAMES.map((ability) => {
        const isProficient =
          displayCharacter.proficiencies.savingThrows.includes(ability)
        const modifier = derivedStats.savingThrows[ability]
        const abilityMod = derivedStats.abilityModifiers[ability]
        const profBonus = derivedStats.proficiencyBonus
        const rollResult = rollResults[ability]

        return (
          <div
            key={ability}
            className={cn(
              'flex items-center gap-2 py-1 px-2 rounded transition-colors',
              !editMode.isEditing &&
                'cursor-pointer hover:bg-bg-secondary/50',
              rollResult && 'bg-accent-gold/10'
            )}
            onClick={() => handleSaveRoll(ability)}
            role={!editMode.isEditing ? 'button' : undefined}
            tabIndex={!editMode.isEditing ? 0 : undefined}
            onKeyDown={
              !editMode.isEditing
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSaveRoll(ability)
                    }
                  }
                : undefined
            }
            data-testid={`save-${ability}`}
            title={
              isProficient
                ? `${ABILITY_LABELS[ability]} Save: ${ability.toUpperCase()} Mod (${abilityMod >= 0 ? '+' : ''}${abilityMod}) + Proficiency (+${profBonus}) = ${modifier >= 0 ? '+' : ''}${modifier}`
                : `${ABILITY_LABELS[ability]} Save: ${ability.toUpperCase()} Mod (${abilityMod >= 0 ? '+' : ''}${abilityMod}) = ${modifier >= 0 ? '+' : ''}${modifier}`
            }
          >
            {editMode.isEditing ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleProficiency(ability)
                }}
                className="flex-shrink-0"
                aria-label={`Toggle ${ability} save proficiency`}
              >
                <ProficiencyDot level={isProficient ? 'proficient' : 'none'} />
              </button>
            ) : (
              <div className="flex-shrink-0">
                <ProficiencyDot level={isProficient ? 'proficient' : 'none'} />
              </div>
            )}
            <ModifierBadge value={modifier} size="sm" />
            <span className="text-sm text-parchment flex-1">
              {ABILITY_LABELS[ability]}
            </span>
            {rollResult !== null && (
              <span className="text-xs font-bold text-accent-gold ml-auto">
                {rollResult}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
