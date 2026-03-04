// =============================================================================
// Story 16.3 -- ModifierBadge
// Displays +N or -N with color-coded gradient based on value.
// =============================================================================

import { cn } from '@/lib/utils'

interface ModifierBadgeProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
  showSign?: boolean
}

function formatValue(value: number, showSign: boolean): string {
  if (!showSign) return `${value}`
  if (value >= 0) return `+${value}`
  return `${value}`
}

function getColorClass(value: number): string {
  if (value <= -3) return 'text-red-500'
  if (value <= -1) return 'text-red-400'
  if (value === 0) return 'text-parchment/50'
  if (value <= 2) return 'text-emerald-400'
  return 'text-accent-gold'
}

function getBgClass(value: number): string {
  if (value <= -3) return 'bg-red-500/10'
  if (value <= -1) return 'bg-red-400/10'
  if (value === 0) return 'bg-parchment/5'
  if (value <= 2) return 'bg-emerald-400/10'
  return 'bg-accent-gold/10'
}

const SIZE_CLASSES = {
  sm: 'text-xs px-1.5 py-0.5 min-w-[28px]',
  md: 'text-sm px-2 py-0.5 min-w-[32px]',
  lg: 'text-base px-2.5 py-1 min-w-[40px]',
} as const

export function ModifierBadge({
  value,
  size = 'md',
  showSign = true,
}: ModifierBadgeProps) {
  return (
    <span
      data-testid="modifier-badge"
      className={cn(
        'inline-flex items-center justify-center rounded font-mono font-semibold',
        SIZE_CLASSES[size],
        getColorClass(value),
        getBgClass(value),
      )}
    >
      {formatValue(value, showSign)}
    </span>
  )
}
