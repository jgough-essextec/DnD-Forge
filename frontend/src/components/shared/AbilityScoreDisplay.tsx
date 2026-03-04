// =============================================================================
// Story 16.3 -- AbilityScoreDisplay
// Classic D&D ability score block with modifier, score, abbreviation, and
// optional racial bonus.
// =============================================================================

import { getModifier } from '@/utils/calculations/ability'
import { cn } from '@/lib/utils'

interface AbilityScoreDisplayProps {
  ability: string
  score: number
  modifier: number
  racialBonus?: number
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

function formatModifier(mod: number): string {
  if (mod >= 0) return `+${mod}`
  return `${mod}`
}

const SIZE_CLASSES = {
  sm: {
    container: 'w-16 py-2 px-1',
    modifier: 'text-lg',
    score: 'text-xs',
    ability: 'text-[10px]',
    bonus: 'text-[9px]',
  },
  md: {
    container: 'w-20 py-3 px-2',
    modifier: 'text-xl',
    score: 'text-sm',
    ability: 'text-xs',
    bonus: 'text-[10px]',
  },
  lg: {
    container: 'w-24 py-4 px-3',
    modifier: 'text-2xl',
    score: 'text-base',
    ability: 'text-sm',
    bonus: 'text-xs',
  },
} as const

export function AbilityScoreDisplay({
  ability,
  score,
  modifier,
  racialBonus,
  onClick,
  size = 'md',
}: AbilityScoreDisplayProps) {
  const sizeClasses = SIZE_CLASSES[size]
  // Use the provided modifier or compute it; the spec says to use getModifier
  const _computedModifier = getModifier(score)
  // Prefer the passed modifier prop
  const displayModifier = modifier ?? _computedModifier

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
      aria-label={`${ability} score ${score}, modifier ${formatModifier(displayModifier)}`}
      className={cn(
        'flex flex-col items-center rounded-lg border-2 border-parchment/30',
        'bg-bg-secondary text-center transition-all',
        sizeClasses.container,
        onClick && 'cursor-pointer hover:border-accent-gold/50 hover:shadow-[0_0_8px_rgba(232,180,48,0.2)]',
        'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
      )}
    >
      {/* Modifier (large, prominent) */}
      <span
        className={cn(
          'font-bold font-heading leading-tight',
          sizeClasses.modifier,
          displayModifier >= 0 ? 'text-healing-green' : 'text-damage-red',
        )}
        data-testid="modifier-display"
      >
        {formatModifier(displayModifier)}
      </span>

      {/* Divider */}
      <hr className="w-3/4 border-parchment/20 my-1" />

      {/* Total Score */}
      <span
        className={cn('font-semibold text-parchment', sizeClasses.score)}
        data-testid="score-display"
      >
        {score}
      </span>

      {/* Ability Abbreviation */}
      <span
        className={cn(
          'uppercase tracking-wider text-parchment/60 font-medium',
          sizeClasses.ability,
        )}
      >
        {ability}
      </span>

      {/* Racial Bonus (if any) */}
      {racialBonus !== undefined && racialBonus !== 0 && (
        <span
          className={cn(
            'text-accent-gold/80 mt-0.5',
            sizeClasses.bonus,
          )}
          data-testid="racial-bonus"
        >
          ({racialBonus > 0 ? '+' : ''}{racialBonus})
        </span>
      )}
    </div>
  )
}
