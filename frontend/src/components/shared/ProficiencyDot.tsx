// =============================================================================
// Story 16.3 -- ProficiencyDot
// Visual indicator for proficiency levels: none, proficient, expertise, half.
// =============================================================================

import { cn } from '@/lib/utils'

type ProficiencyLevel = 'none' | 'proficient' | 'expertise' | 'half'

interface ProficiencyDotProps {
  level: ProficiencyLevel
  size?: 'sm' | 'md'
  label?: string
}

const SIZE_MAP = {
  sm: { outer: 'h-3 w-3', inner: 'h-1.5 w-1.5', ring: 'h-4 w-4' },
  md: { outer: 'h-4 w-4', inner: 'h-2 w-2', ring: 'h-5.5 w-5.5' },
} as const

export function ProficiencyDot({
  level,
  size = 'md',
  label,
}: ProficiencyDotProps) {
  const sizes = SIZE_MAP[size]

  const ariaLabel =
    label ??
    {
      none: 'Not proficient',
      proficient: 'Proficient',
      expertise: 'Expertise',
      half: 'Half proficiency',
    }[level]

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      data-testid={`proficiency-dot-${level}`}
      className="inline-flex items-center justify-center"
    >
      {level === 'none' && (
        <span
          className={cn(
            'rounded-full border-2 border-parchment/30 bg-transparent',
            sizes.outer,
          )}
        />
      )}

      {level === 'proficient' && (
        <span
          className={cn(
            'rounded-full bg-parchment',
            sizes.outer,
          )}
        />
      )}

      {level === 'expertise' && (
        <span
          className={cn(
            'relative rounded-full border-2 border-parchment bg-transparent flex items-center justify-center',
            sizes.outer,
          )}
          style={{
            // Slightly larger outer to make the double circle visible
            width: size === 'md' ? '18px' : '14px',
            height: size === 'md' ? '18px' : '14px',
          }}
        >
          <span
            className={cn(
              'rounded-full bg-parchment',
              sizes.inner,
            )}
          />
        </span>
      )}

      {level === 'half' && (
        <span
          className={cn(
            'rounded-full border-2 border-parchment/30 overflow-hidden relative',
            sizes.outer,
          )}
        >
          <span className="absolute inset-0 bg-parchment" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </span>
      )}
    </span>
  )
}
