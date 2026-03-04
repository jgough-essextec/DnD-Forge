/**
 * RaceCard -- Individual race card for the SelectableCardGrid.
 *
 * Displays race name, brief description, key trait badges,
 * ability score bonuses, size, and speed.
 */

import { cn } from '@/lib/utils'
import { ModifierBadge } from '@/components/shared/ModifierBadge'
import type { Race } from '@/types/race'
import type { AbilityName } from '@/types/core'

interface RaceCardProps {
  race: Race
  isSelected: boolean
}

/** Short labels for ability names */
const ABILITY_SHORT: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

/** Capitalize first letter */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Format ability bonuses for display */
function getAbilityBonusBadges(race: Race): { label: string; value: number }[] {
  const badges: { label: string; value: number }[] = []

  for (const [ability, bonus] of Object.entries(race.abilityScoreIncrease)) {
    if (bonus && bonus !== 0) {
      badges.push({
        label: ABILITY_SHORT[ability as AbilityName],
        value: bonus,
      })
    }
  }

  if (race.abilityBonusChoices) {
    for (const choice of race.abilityBonusChoices) {
      badges.push({
        label: `${choice.choose} Choice`,
        value: choice.bonus,
      })
    }
  }

  return badges
}

/** Get key traits to display as badges (up to 3) */
function getKeyTraits(race: Race): string[] {
  const traits: string[] = []

  // Darkvision
  const darkvision = race.senses.find((s) => s.type === 'darkvision')
  if (darkvision) {
    traits.push(`Darkvision ${darkvision.range}ft`)
  }

  // First 2-3 named traits
  for (const trait of race.traits) {
    if (traits.length >= 3) break
    traits.push(trait.name)
  }

  return traits.slice(0, 3)
}

/** Brief tagline for each race */
function getRaceTagline(race: Race): string {
  // Use first sentence of description for brevity
  const firstSentence = race.description.split('.')[0]
  return firstSentence.length > 80
    ? firstSentence.substring(0, 77) + '...'
    : firstSentence + '.'
}

export function RaceCard({ race, isSelected }: RaceCardProps) {
  const abilityBadges = getAbilityBonusBadges(race)
  const keyTraits = getKeyTraits(race)
  const tagline = getRaceTagline(race)
  const hasSubraces = race.subraces.length > 0

  return (
    <div className="flex flex-col gap-2" data-testid={`race-card-${race.id}`}>
      {/* Race name */}
      <h3
        className={cn(
          'font-heading text-lg font-semibold',
          isSelected ? 'text-accent-gold' : 'text-parchment',
        )}
      >
        {race.name}
      </h3>

      {/* Tagline */}
      <p className="text-xs text-parchment/60 line-clamp-2">{tagline}</p>

      {/* Ability score bonuses */}
      <div className="flex flex-wrap gap-1.5">
        {abilityBadges.map((badge) => (
          <span
            key={badge.label}
            className="inline-flex items-center gap-1 text-xs"
          >
            <span className="text-parchment/70 font-medium">{badge.label}</span>
            <ModifierBadge value={badge.value} size="sm" />
          </span>
        ))}
      </div>

      {/* Key trait badges */}
      <div className="flex flex-wrap gap-1.5">
        {keyTraits.map((trait) => (
          <span
            key={trait}
            className={cn(
              'inline-block rounded-full px-2 py-0.5 text-xs',
              'bg-parchment/10 text-parchment/70 border border-parchment/15',
            )}
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Size / Speed / Subraces */}
      <div className="flex items-center gap-3 text-xs text-parchment/50 mt-auto pt-1">
        <span title="Size">{capitalize(race.size)}</span>
        <span className="text-parchment/20">|</span>
        <span title="Speed">{race.speed} ft</span>
        {hasSubraces && (
          <>
            <span className="text-parchment/20">|</span>
            <span>{race.subraces.length} subraces</span>
          </>
        )}
      </div>
    </div>
  )
}
