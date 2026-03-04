/**
 * ConditionCard (Story 29.1)
 *
 * Individual condition display with icon, name, effects tooltip, and remove button.
 * Rendered as a colored badge/chip. Clicking opens a popover with full effects
 * and a remove button.
 */

import { useState } from 'react'
import {
  EyeOff,
  Heart,
  EarOff,
  Ghost,
  Grip,
  Ban,
  Eye,
  Zap,
  Mountain,
  Skull,
  ArrowDown,
  Lock,
  Stars,
  Moon,
  Battery,
  X,
} from 'lucide-react'
import type { Condition } from '@/types/core'
import type { ConditionInstance } from '@/types/combat'
import { cn } from '@/lib/utils'
import {
  getConditionBadgeClasses,
  getConditionDisplayName,
  CONDITION_DEFINITIONS,
} from '@/data/conditions'
import { getConditionEffects, getExhaustionEffects } from '@/utils/conditions'

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

const ICON_COMPONENTS: Record<Condition, React.ComponentType<{ className?: string; size?: number }>> = {
  blinded: EyeOff,
  charmed: Heart,
  deafened: EarOff,
  frightened: Ghost,
  grappled: Grip,
  incapacitated: Ban,
  invisible: Eye,
  paralyzed: Zap,
  petrified: Mountain,
  poisoned: Skull,
  prone: ArrowDown,
  restrained: Lock,
  stunned: Stars,
  unconscious: Moon,
  exhaustion: Battery,
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ConditionCardProps {
  instance: ConditionInstance
  onRemove?: (condition: Condition) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConditionCard({ instance, onRemove }: ConditionCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { condition } = instance
  const Icon = ICON_COMPONENTS[condition]
  const displayName = getConditionDisplayName(condition)
  const badgeClasses = getConditionBadgeClasses(condition)
  const def = CONDITION_DEFINITIONS[condition]

  const isExhaustion = condition === 'exhaustion'
  const exhaustionLevel = instance.exhaustionLevel ?? 1

  const label = isExhaustion
    ? `${displayName} ${exhaustionLevel}`
    : displayName

  const effectsText = isExhaustion
    ? getExhaustionEffects(exhaustionLevel).map((e: string, i: number) => `Level ${i + 1}: ${e}`).join('\n')
    : getConditionEffects(condition)

  const isDeathLevel = isExhaustion && exhaustionLevel >= 6

  return (
    <div className="relative inline-block" data-testid={`condition-card-${condition}`}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
          'transition-colors cursor-pointer',
          'hover:opacity-80',
          badgeClasses,
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`${label} condition`}
        aria-expanded={isOpen}
      >
        <Icon size={14} />
        <span>{label}</span>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 top-full left-0 mt-2 w-72 rounded-lg border p-3',
            'bg-surface-dark shadow-lg',
            def.color.split(' ').find((c: string) => c.startsWith('border-')) ?? 'border-parchment/20',
          )}
          role="dialog"
          aria-label={`${label} details`}
          data-testid={`condition-popover-${condition}`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon size={16} className={def.color.split(' ').find((c: string) => c.startsWith('text-')) ?? ''} />
              <h4 className={cn('font-semibold text-sm', def.color.split(' ').find((c: string) => c.startsWith('text-')) ?? '')}>
                {label}
              </h4>
            </div>
            <button
              type="button"
              className="text-parchment/50 hover:text-parchment transition-colors p-0.5"
              onClick={() => setIsOpen(false)}
              aria-label="Close popover"
            >
              <X size={14} />
            </button>
          </div>

          {instance.source && (
            <p className="text-xs text-parchment/60 mb-1">
              Source: {instance.source}
            </p>
          )}
          {instance.duration && (
            <p className="text-xs text-parchment/60 mb-1">
              Duration: {instance.duration}
            </p>
          )}

          <div className="text-xs text-parchment/80 whitespace-pre-line mb-3">
            {effectsText}
          </div>

          {isDeathLevel && (
            <div
              className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/30 rounded px-2 py-1 mb-3"
              role="alert"
              data-testid="exhaustion-death-warning"
            >
              Level 6: Death -- Your character dies from exhaustion!
            </div>
          )}

          {onRemove && (
            <button
              type="button"
              className={cn(
                'w-full text-xs font-medium py-1.5 px-3 rounded border',
                'transition-colors hover:opacity-80',
                'bg-red-500/10 text-red-400 border-red-500/30',
              )}
              onClick={() => {
                onRemove(condition)
                setIsOpen(false)
              }}
              data-testid={`remove-condition-${condition}`}
            >
              Remove {isExhaustion ? '(decrement by 1)' : displayName}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
