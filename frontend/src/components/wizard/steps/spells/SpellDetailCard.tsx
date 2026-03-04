// =============================================================================
// Story 14.4 -- SpellDetailCard
// Comprehensive spell detail display with header, properties, components,
// description, higher level scaling, and ritual/concentration badges.
// =============================================================================

import { cn } from '@/lib/utils'
import type { Spell } from '@/types/spell'

// -- School of Magic Colors ---------------------------------------------------

const SCHOOL_COLORS: Record<string, string> = {
  abjuration: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  conjuration: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  divination: 'text-gray-300 bg-gray-300/10 border-gray-300/30',
  enchantment: 'text-pink-400 bg-pink-400/10 border-pink-400/30',
  evocation: 'text-red-400 bg-red-400/10 border-red-400/30',
  illusion: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  necromancy: 'text-green-400 bg-green-400/10 border-green-400/30',
  transmutation: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
}

// -- Helpers ------------------------------------------------------------------

function formatSpellLevel(level: number): string {
  if (level === 0) return 'Cantrip'
  if (level === 1) return '1st Level'
  if (level === 2) return '2nd Level'
  if (level === 3) return '3rd Level'
  return `${level}th Level`
}

function formatCastingTime(spell: Spell): string {
  const { value, unit } = spell.castingTime
  const unitLabel = unit === 'bonus-action' ? 'bonus action' : unit
  if (value === 1 && (unit === 'action' || unit === 'bonus-action' || unit === 'reaction')) {
    return `1 ${unitLabel}`
  }
  return `${value} ${unitLabel}${value > 1 ? 's' : ''}`
}

function formatRange(spell: Spell): string {
  const { type, distance, unit } = spell.range
  if (type === 'self') {
    if (spell.range.shape && spell.range.areaSize) {
      return `Self (${spell.range.areaSize}-${unit ?? 'foot'} ${spell.range.shape})`
    }
    return 'Self'
  }
  if (type === 'touch') return 'Touch'
  if (type === 'sight') return 'Sight'
  if (type === 'unlimited') return 'Unlimited'
  if (distance && unit) return `${distance} ${unit}`
  return 'Unknown'
}

function formatDuration(spell: Spell): string {
  const { type, value, unit } = spell.duration
  if (type === 'instantaneous') return 'Instantaneous'
  if (type === 'until-dispelled') return 'Until dispelled'
  if (value && unit) {
    const unitLabel = value === 1 ? unit : `${unit}s`
    if (type === 'concentration') return `Concentration, up to ${value} ${unitLabel}`
    return `${value} ${unitLabel}`
  }
  return type
}

function formatComponents(spell: Spell): string {
  const parts: string[] = []
  if (spell.components.verbal) parts.push('V')
  if (spell.components.somatic) parts.push('S')
  if (spell.components.material) parts.push('M')
  return parts.join(', ')
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// -- Props --------------------------------------------------------------------

interface SpellDetailCardProps {
  spell: Spell
  compact?: boolean
  className?: string
}

// -- Component ----------------------------------------------------------------

export function SpellDetailCard({ spell, compact = false, className }: SpellDetailCardProps) {
  const schoolColor = SCHOOL_COLORS[spell.school] ?? 'text-parchment/60 bg-parchment/10 border-parchment/20'

  return (
    <div className={cn('space-y-3', className)} data-testid={`spell-detail-${spell.id}`}>
      {/* Header: name, level badge, school */}
      <div className="space-y-1">
        <h3 className="text-lg font-heading font-semibold text-parchment">{spell.name}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
              schoolColor,
            )}
            data-testid="spell-school"
          >
            {capitalizeFirst(spell.school)}
          </span>
          <span className="text-xs text-parchment/60" data-testid="spell-level">
            {formatSpellLevel(spell.level)}
          </span>
          {spell.ritual && (
            <span
              className="inline-flex items-center rounded-full border border-accent-gold/30 bg-accent-gold/10 px-2 py-0.5 text-xs font-medium text-accent-gold"
              data-testid="ritual-badge"
            >
              Ritual
            </span>
          )}
          {spell.concentration && (
            <span
              className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-400"
              data-testid="concentration-badge"
            >
              Concentration
            </span>
          )}
        </div>
      </div>

      {/* Properties row */}
      <div className="grid grid-cols-2 gap-2 text-sm" data-testid="spell-properties">
        <div>
          <span className="text-parchment/50 text-xs">Casting Time</span>
          <p className="text-parchment" data-testid="casting-time">{formatCastingTime(spell)}</p>
        </div>
        <div>
          <span className="text-parchment/50 text-xs">Range</span>
          <p className="text-parchment" data-testid="spell-range">{formatRange(spell)}</p>
        </div>
        <div>
          <span className="text-parchment/50 text-xs">Duration</span>
          <p className="text-parchment" data-testid="spell-duration">{formatDuration(spell)}</p>
        </div>
        <div>
          <span className="text-parchment/50 text-xs">Components</span>
          <p className="text-parchment" data-testid="spell-components">
            {formatComponents(spell)}
            {spell.components.material && spell.components.materialDescription && (
              <span className="text-parchment/50 text-xs block">
                ({spell.components.materialDescription})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Description */}
      {!compact && (
        <>
          <div className="border-t border-parchment/10 pt-3">
            <p className="text-sm text-parchment/80 leading-relaxed" data-testid="spell-description">
              {spell.description}
            </p>
          </div>

          {/* Higher Levels */}
          {spell.higherLevelDescription && (
            <div className="border-t border-parchment/10 pt-3">
              <p className="text-xs font-semibold text-parchment/60 mb-1">At Higher Levels</p>
              <p className="text-sm text-parchment/70" data-testid="higher-levels">
                {spell.higherLevelDescription}
              </p>
            </div>
          )}

          {/* Damage / Save info */}
          {spell.damage && (
            <div className="flex items-center gap-3 text-sm" data-testid="spell-damage">
              <span className="text-parchment/50">Damage:</span>
              <span className="text-parchment">
                {spell.damage.count}
                {spell.damage.die} {spell.damage.type}
              </span>
              {spell.savingThrow && (
                <span className="text-parchment/50">
                  ({capitalizeFirst(spell.savingThrow)} save)
                </span>
              )}
            </div>
          )}

          {/* Classes list */}
          <div className="flex items-center gap-2 flex-wrap text-xs" data-testid="spell-classes">
            <span className="text-parchment/50">Classes:</span>
            {spell.classes.map((cls) => (
              <span
                key={cls}
                className="rounded-full border border-parchment/20 bg-parchment/5 px-2 py-0.5 text-parchment/70"
              >
                {capitalizeFirst(cls)}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// -- Export helpers for use in other components --------------------------------

export { formatSpellLevel, formatCastingTime, formatRange, formatDuration, formatComponents }
