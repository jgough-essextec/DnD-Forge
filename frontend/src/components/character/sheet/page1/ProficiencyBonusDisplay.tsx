/**
 * ProficiencyBonusDisplay (Story 17.10)
 *
 * Displays proficiency bonus prominently in a circular badge.
 * Computed from character level using ceil(level/4)+1.
 */

import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { cn } from '@/lib/utils'

export function ProficiencyBonusDisplay() {
  const { derivedStats, character } = useCharacterSheet()

  const proficiencyBonus = derivedStats.proficiencyBonus
  const level = character?.level ?? 1

  return (
    <div
      className="flex items-center gap-3 py-2"
      data-testid="proficiency-bonus-display"
    >
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex items-center justify-center',
            'w-12 h-12 rounded-full',
            'border-2 border-accent-gold/50',
            'bg-bg-secondary',
            'shadow-[0_0_8px_rgba(232,180,48,0.15)]'
          )}
          title={`Proficiency Bonus: +${proficiencyBonus} (Level ${level} character). Added to attacks, saves, and skills you're proficient in.`}
          aria-label={`Proficiency bonus plus ${proficiencyBonus}`}
        >
          <span className="text-xl font-heading font-bold text-accent-gold">
            +{proficiencyBonus}
          </span>
        </div>
        <span className="text-[10px] text-parchment/60 uppercase tracking-wider mt-1">
          Proficiency
        </span>
      </div>
    </div>
  )
}
