/**
 * DamageTypeSelector (Story 27.1)
 *
 * Quick-select grid of D&D 5e damage types with icons.
 * Shows all 13 damage types as selectable buttons with visual indicators
 * for resistance, vulnerability, and immunity.
 */

import { DAMAGE_TYPES } from '@/types/core'
import type { DamageType } from '@/types/core'
import { cn } from '@/lib/utils'
import {
  Flame,
  Snowflake,
  Zap,
  Skull,
  Swords,
  Droplets,
  Wind,
  Shield,
  Sparkles,
  Sun,
  Brain,
  Target,
  Crosshair,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ---------------------------------------------------------------------------
// Damage type icon mapping
// ---------------------------------------------------------------------------

const DAMAGE_TYPE_ICONS: Record<DamageType, LucideIcon> = {
  acid: Droplets,
  bludgeoning: Shield,
  cold: Snowflake,
  fire: Flame,
  force: Sparkles,
  lightning: Zap,
  necrotic: Skull,
  piercing: Target,
  poison: Crosshair,
  psychic: Brain,
  radiant: Sun,
  slashing: Swords,
  thunder: Wind,
}

const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  acid: 'Acid',
  bludgeoning: 'Bludg.',
  cold: 'Cold',
  fire: 'Fire',
  force: 'Force',
  lightning: 'Lght.',
  necrotic: 'Necro.',
  piercing: 'Pierce',
  poison: 'Poison',
  psychic: 'Psychic',
  radiant: 'Radiant',
  slashing: 'Slash',
  thunder: 'Thunder',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DamageTypeSelectorProps {
  selected: DamageType | null
  onSelect: (type: DamageType | null) => void
  resistances?: DamageType[]
  vulnerabilities?: DamageType[]
  immunities?: DamageType[]
}

export function DamageTypeSelector({
  selected,
  onSelect,
  resistances = [],
  vulnerabilities = [],
  immunities = [],
}: DamageTypeSelectorProps) {
  const getRelationBadge = (type: DamageType) => {
    if (immunities.includes(type)) return { label: 'IMM', className: 'text-gray-400' }
    if (resistances.includes(type)) return { label: 'RES', className: 'text-blue-400' }
    if (vulnerabilities.includes(type)) return { label: 'VUL', className: 'text-red-400' }
    return null
  }

  return (
    <div data-testid="damage-type-selector">
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
        {DAMAGE_TYPES.map((type) => {
          const Icon = DAMAGE_TYPE_ICONS[type]
          const isSelected = selected === type
          const badge = getRelationBadge(type)

          return (
            <button
              key={type}
              onClick={() => onSelect(isSelected ? null : type)}
              className={cn(
                'flex flex-col items-center gap-0.5 p-1.5 rounded-md border transition-colors text-xs',
                isSelected
                  ? 'border-accent-gold bg-accent-gold/20 text-accent-gold'
                  : 'border-parchment/20 bg-bg-primary/30 text-parchment/60 hover:border-parchment/40 hover:text-parchment/80',
              )}
              aria-label={`${type} damage type`}
              aria-pressed={isSelected}
              data-testid={`damage-type-${type}`}
              title={type}
              type="button"
            >
              <Icon className="w-4 h-4" />
              <span className="leading-tight">{DAMAGE_TYPE_LABELS[type]}</span>
              {badge && (
                <span className={cn('text-[10px] font-bold', badge.className)}>
                  {badge.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {selected && (
        <button
          onClick={() => onSelect(null)}
          className="mt-2 text-xs text-parchment/50 hover:text-parchment/80 transition-colors"
          type="button"
        >
          Clear damage type
        </button>
      )}
    </div>
  )
}
