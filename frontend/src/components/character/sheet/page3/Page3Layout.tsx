/**
 * Page3Layout Component (Story 19.1 - Epic 19)
 *
 * Container for Page 3 of the character sheet (Spellcasting page).
 * Conditionally rendered only for spellcasting characters.
 * Shows placeholder message for non-casters with info about when they might gain spellcasting.
 */

import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { SpellcastingHeader } from './SpellcastingHeader'
import { CantripsSection } from './CantripsSection'
import { SpellSlotsAndLists } from './SpellSlotsAndLists'
import { DomainSpells } from './DomainSpells'
import { getClassById } from '@/data/classes'

export function Page3Layout() {
  const { character, editableCharacter } = useCharacterSheet()

  // Get the active character data (editableCharacter overrides character)
  const activeCharacter = character
    ? { ...character, ...editableCharacter }
    : null

  // Non-spellcaster: show placeholder
  if (!activeCharacter?.spellcasting) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[400px] text-center px-6"
        data-testid="non-caster-placeholder"
      >
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-serif text-parchment">
            No Spellcasting Abilities
          </h2>
          <p className="text-parchment/70 text-sm leading-relaxed">
            This character does not currently have spellcasting abilities.
          </p>
          {activeCharacter && (
            <NonCasterInfo character={activeCharacter} />
          )}
        </div>
      </div>
    )
  }

  // Spellcaster: show full spellcasting page
  return (
    <div
      className="flex flex-col gap-6 p-6 max-w-6xl mx-auto"
      data-testid="page3-spellcasting"
    >
      {/* Header with spellcasting stats */}
      <SpellcastingHeader />

      {/* Domain/Subclass spells (if any) */}
      <DomainSpells />

      {/* Cantrips section */}
      <CantripsSection />

      {/* Spell slots and spell lists by level (1-9) */}
      <SpellSlotsAndLists />
    </div>
  )
}

/**
 * NonCasterInfo
 * Shows information about when the character might gain spellcasting abilities
 */
function NonCasterInfo({ character }: { character: any }) {
  const primaryClass = character.classes?.[0]
  if (!primaryClass) return null

  const classData = getClassById(primaryClass.classId)
  if (!classData) return null

  // Check for subclasses that gain spellcasting
  const futureSpellcasting: Record<string, { level: number; subclass: string }> = {
    'fighter': { level: 3, subclass: 'Eldritch Knight' },
    'rogue': { level: 3, subclass: 'Arcane Trickster' },
  }

  const info = futureSpellcasting[classData.id]
  if (info && primaryClass.level < info.level) {
    return (
      <p className="text-xs text-parchment/60 italic">
        {classData.name}s can gain spellcasting as {info.subclass} at level {info.level}.
      </p>
    )
  }

  return null
}
