/**
 * TreasureSection Component (Story 18.5)
 *
 * Displays and manages non-currency treasure items:
 * - Gems
 * - Art objects
 * - Magic items (non-equipment)
 * - Quest items
 * - Other valuables
 *
 * Features:
 * - Freeform text block for simple tracking
 * - Optional structured entries with name, GP value, and description (future enhancement)
 *
 * In view mode: rendered text
 * In edit mode: editable textarea
 */

import { cn } from '@/lib/utils'
import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import type { CharacterDescription } from '@/types/background'

export interface TreasureSectionProps {
  className?: string
}

export function TreasureSection({ className }: TreasureSectionProps) {
  const { character, editableCharacter, updateField, editMode } = useCharacterSheet()

  const currentDescription = (editableCharacter.description ?? character?.description) as CharacterDescription | undefined
  const treasureText = currentDescription?.treasure ?? ''

  const handleTreasureChange = (value: string) => {
    const updatedDescription: CharacterDescription = {
      name: currentDescription?.name ?? character?.name ?? '',
      age: currentDescription?.age ?? '',
      height: currentDescription?.height ?? '',
      weight: currentDescription?.weight ?? '',
      eyes: currentDescription?.eyes ?? '',
      skin: currentDescription?.skin ?? '',
      hair: currentDescription?.hair ?? '',
      appearance: currentDescription?.appearance ?? '',
      backstory: currentDescription?.backstory ?? '',
      alliesAndOrgs: currentDescription?.alliesAndOrgs ?? '',
      treasure: value,
    }
    updateField('description', updatedDescription)
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4 rounded-lg bg-secondary border border-accent-gold/20',
        className
      )}
      data-testid="treasure-section"
      aria-label="Treasure"
    >
      {/* Header */}
      <h3 className="text-base font-semibold text-accent-gold">
        Treasure & Valuables
      </h3>

      {/* Treasure Text Area */}
      {editMode.isEditing ? (
        <textarea
          id="treasure-text"
          value={treasureText}
          onChange={(e) => handleTreasureChange(e.target.value)}
          className="px-3 py-2 min-h-[100px] text-sm bg-primary border border-accent-gold/30 rounded focus:border-accent-gold outline-none text-parchment resize-y"
          placeholder="Gems, art objects, magic items, quest items, and other valuables..."
          aria-label="Treasure"
          data-testid="treasure-input"
        />
      ) : (
        <div
          className="px-3 py-2 min-h-[100px] text-sm text-parchment whitespace-pre-wrap"
          data-testid="treasure-display"
        >
          {treasureText || (
            <span className="text-parchment/40 italic">
              No treasure recorded yet
            </span>
          )}
        </div>
      )}

      {/* Optional hint text */}
      {editMode.isEditing && (
        <div className="text-xs text-parchment/40">
          List gems, art objects, magic items, quest items, and other valuables.
        </div>
      )}
    </div>
  )
}
