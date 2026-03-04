/**
 * CantripsSection Component (Story 19.2 - Epic 19)
 *
 * Displays all known cantrips (level 0 spells) at the top of the spell page.
 * Each cantrip shows: name, school icon, casting time, range
 * Clicking expands to show full spell details.
 */

import { useState } from 'react'
import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { getSpellById } from '@/data/spells'
import { cn } from '@/lib/utils'
import type { Spell, SpellSchool } from '@/types/spell'

// School icons and colors
const SCHOOL_CONFIG: Record<SpellSchool, { icon: string; color: string; bg: string }> = {
  abjuration: { icon: '🛡️', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  conjuration: { icon: '✨', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  divination: { icon: '👁️', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  enchantment: { icon: '💫', color: 'text-pink-400', bg: 'bg-pink-400/10' },
  evocation: { icon: '⚡', color: 'text-red-400', bg: 'bg-red-400/10' },
  illusion: { icon: '🌀', color: 'text-purple-300', bg: 'bg-purple-300/10' },
  necromancy: { icon: '💀', color: 'text-green-400', bg: 'bg-green-400/10' },
  transmutation: { icon: '🔄', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
}

export function CantripsSection() {
  const { character, editableCharacter } = useCharacterSheet()
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null)

  const activeCharacter = character
    ? { ...character, ...editableCharacter }
    : null

  if (!activeCharacter?.spellcasting) return null

  const cantrips = activeCharacter.spellcasting.cantrips
    .map(id => getSpellById(id))
    .filter((spell): spell is Spell => spell !== undefined)

  if (cantrips.length === 0) {
    return (
      <section className="space-y-3" data-testid="cantrips-section">
        <h2 className="text-xl font-serif text-accent-gold">Cantrips</h2>
        <p className="text-sm text-parchment/60 italic">No cantrips known</p>
      </section>
    )
  }

  return (
    <section className="space-y-3" data-testid="cantrips-section">
      <h2 className="text-xl font-serif text-accent-gold">
        Cantrips
        <span className="ml-2 text-sm text-parchment/60 font-sans">
          ({cantrips.length})
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cantrips.map(cantrip => (
          <CantripCard
            key={cantrip.id}
            spell={cantrip}
            isExpanded={expandedSpellId === cantrip.id}
            onToggle={() =>
              setExpandedSpellId(prev => prev === cantrip.id ? null : cantrip.id)
            }
          />
        ))}
      </div>
    </section>
  )
}

/**
 * CantripCard
 * Individual cantrip display with expand/collapse for details
 */
interface CantripCardProps {
  spell: Spell
  isExpanded: boolean
  onToggle: () => void
}

function CantripCard({ spell, isExpanded, onToggle }: CantripCardProps) {
  const schoolConfig = SCHOOL_CONFIG[spell.school]
  const castingTimeText = formatCastingTime(spell.castingTime)
  const rangeText = formatRange(spell.range)

  return (
    <div
      className={cn(
        'border rounded-lg p-3 transition-all',
        'bg-bg-secondary border-parchment/20',
        'hover:border-parchment/40 cursor-pointer',
        isExpanded && 'border-accent-gold/60'
      )}
      onClick={onToggle}
      data-testid={`cantrip-${spell.id}`}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <span
          className={cn('text-lg', schoolConfig.bg, 'rounded px-1.5 py-0.5')}
          aria-label={`${spell.school} school`}
        >
          {schoolConfig.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-parchment">
            {spell.name}
          </h3>
          <div className="flex flex-wrap gap-2 mt-1 text-xs text-parchment/60">
            <span className={schoolConfig.color}>
              {spell.school.charAt(0).toUpperCase() + spell.school.slice(1)}
            </span>
            <span>•</span>
            <span>{castingTimeText}</span>
            <span>•</span>
            <span>{rangeText}</span>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-parchment/10 space-y-2">
          <SpellComponents components={spell.components} />
          <SpellDuration duration={spell.duration} />
          <p className="text-sm text-parchment/80 leading-relaxed">
            {spell.description}
          </p>
          {spell.concentration && (
            <div className="flex items-center gap-1 text-xs text-cyan-400">
              <span>⚠️</span>
              <span>Concentration</span>
            </div>
          )}
          {spell.ritual && (
            <div className="flex items-center gap-1 text-xs text-purple-400">
              <span>📜</span>
              <span>Ritual</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * SpellComponents
 * Displays V/S/M component badges
 */
function SpellComponents({ components }: { components: Spell['components'] }) {
  const badges = []
  if (components.verbal) badges.push('V')
  if (components.somatic) badges.push('S')
  if (components.material) badges.push('M')

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-parchment/60">Components:</span>
      <div className="flex gap-1">
        {badges.map(badge => (
          <span
            key={badge}
            className="text-xs font-mono px-1.5 py-0.5 rounded bg-parchment/10 text-parchment"
          >
            {badge}
          </span>
        ))}
      </div>
      {components.materialDescription && (
        <span className="text-xs text-parchment/50 italic">
          ({components.materialDescription})
        </span>
      )}
    </div>
  )
}

/**
 * SpellDuration
 * Displays duration information
 */
function SpellDuration({ duration }: { duration: Spell['duration'] }) {
  let durationText = ''
  if (duration.type === 'instantaneous') {
    durationText = 'Instantaneous'
  } else if (duration.type === 'concentration') {
    durationText = `Concentration, up to ${duration.value} ${duration.unit}${duration.value !== 1 ? 's' : ''}`
  } else if (duration.type === 'timed') {
    durationText = `${duration.value} ${duration.unit}${duration.value !== 1 ? 's' : ''}`
  } else if (duration.type === 'until-dispelled') {
    durationText = 'Until dispelled'
  }

  return (
    <div className="text-xs text-parchment/60">
      <span>Duration: </span>
      <span className="text-parchment">{durationText}</span>
    </div>
  )
}

/**
 * Format casting time for display
 */
function formatCastingTime(castingTime: Spell['castingTime']): string {
  if (castingTime.unit === 'action') return '1 action'
  if (castingTime.unit === 'bonus-action') return '1 bonus action'
  if (castingTime.unit === 'reaction') return '1 reaction'
  return `${castingTime.value} ${castingTime.unit}${castingTime.value !== 1 ? 's' : ''}`
}

/**
 * Format range for display
 */
function formatRange(range: Spell['range']): string {
  if (range.type === 'self') return 'Self'
  if (range.type === 'touch') return 'Touch'
  if (range.type === 'sight') return 'Sight'
  if (range.type === 'unlimited') return 'Unlimited'
  if (range.type === 'ranged' && range.distance && range.unit) {
    return `${range.distance} ${range.unit}`
  }
  return 'Unknown'
}
