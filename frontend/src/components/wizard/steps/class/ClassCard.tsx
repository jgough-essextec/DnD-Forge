// =============================================================================
// Story 10.1 -- ClassCard
// Individual class card for the SelectableCardGrid.
// Shows class name, hit die, description, key features, role tag, and
// visual selected state.
// =============================================================================

import { cn } from '@/lib/utils'
import type { CharacterClass } from '@/types/class'

// -- Role archetype definitions -----------------------------------------------

export type RoleTag = 'Striker' | 'Tank' | 'Healer' | 'Spellcaster' | 'Support' | 'Utility'

export const CLASS_ROLE_TAGS: Record<string, RoleTag[]> = {
  barbarian: ['Striker', 'Tank'],
  bard: ['Support', 'Spellcaster'],
  cleric: ['Healer', 'Support'],
  druid: ['Spellcaster', 'Support'],
  fighter: ['Striker', 'Tank'],
  monk: ['Striker'],
  paladin: ['Tank', 'Healer'],
  ranger: ['Striker', 'Utility'],
  rogue: ['Striker', 'Utility'],
  sorcerer: ['Spellcaster'],
  warlock: ['Spellcaster'],
  wizard: ['Spellcaster', 'Utility'],
}

const ROLE_TAG_COLORS: Record<RoleTag, string> = {
  Striker: 'bg-red-500/20 text-red-400 border-red-500/30',
  Tank: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Healer: 'bg-green-500/20 text-green-400 border-green-500/30',
  Spellcaster: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Support: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Utility: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
}

// -- Ability abbreviation helper ----------------------------------------------

const ABILITY_ABBREV: Record<string, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

// -- Component ----------------------------------------------------------------

interface ClassCardProps {
  characterClass: CharacterClass
  isSelected: boolean
}

export function ClassCard({ characterClass, isSelected }: ClassCardProps) {
  const roles = CLASS_ROLE_TAGS[characterClass.id] ?? []
  const primaryAbilities = characterClass.primaryAbility
    .map((a) => ABILITY_ABBREV[a] ?? a.toUpperCase())
    .join(' / ')

  return (
    <div className="flex flex-col gap-2">
      {/* Header: Name + Hit Die */}
      <div className="flex items-start justify-between gap-2">
        <h3
          className={cn(
            'text-base font-heading font-semibold',
            isSelected ? 'text-accent-gold' : 'text-parchment',
          )}
        >
          {characterClass.name}
        </h3>
        <span
          className={cn(
            'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold border',
            'bg-parchment/10 border-parchment/20 text-parchment/80',
          )}
          title={`Hit Die: d${characterClass.hitDie}`}
        >
          d{characterClass.hitDie}
        </span>
      </div>

      {/* Role Tags */}
      <div className="flex flex-wrap gap-1">
        {roles.map((role) => (
          <span
            key={role}
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold border',
              ROLE_TAG_COLORS[role],
            )}
          >
            {role}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-xs text-parchment/60 line-clamp-2">
        {characterClass.description}
      </p>

      {/* Primary Ability */}
      <div className="flex items-center gap-2 text-xs text-parchment/70">
        <span className="font-medium">Primary:</span>
        <span className="font-semibold text-parchment/90">{primaryAbilities}</span>
      </div>

      {/* Armor/Weapon summary */}
      <div className="text-[10px] text-parchment/50">
        {characterClass.proficiencies.armor.length > 0
          ? characterClass.proficiencies.armor.join(', ') + ' armor'
          : 'No armor'}
      </div>
    </div>
  )
}
