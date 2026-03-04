/**
 * DiceAnimation (Story 26.2)
 *
 * CSS 3D transform animated die display. Each die type has a distinct color.
 * Supports tumble + settle animation sequence, critical highlights (nat 20 gold
 * glow, nat 1 red flash), and prefers-reduced-motion (instant results).
 *
 * Animation duration: ~1s tumble, 0.3s settle.
 */

import { useEffect, useState, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { DieType } from '@/types/core'

interface DiceAnimationProps {
  /** Results to display, one per die rolled */
  results: number[]
  /** The type of die being rolled */
  dieType: DieType
  /** Whether the result is a nat 20 (d20 only) */
  isCritical?: boolean
  /** Whether the result is a nat 1 (d20 only) */
  isFumble?: boolean
  /** Whether animation is currently playing */
  isRolling: boolean
  /** Called when the animation completes */
  onAnimationComplete?: () => void
}

const DIE_BG_COLORS: Record<DieType, string> = {
  d4: 'bg-healing-green/80',
  d6: 'bg-parchment/80',
  d8: 'bg-spell-blue/80',
  d10: 'bg-purple-500/80',
  d12: 'bg-damage-red/80',
  d20: 'bg-accent-gold/80',
  d100: 'bg-parchment/60',
}

const DIE_TEXT_COLORS: Record<DieType, string> = {
  d4: 'text-bg-primary',
  d6: 'text-bg-primary',
  d8: 'text-white',
  d10: 'text-white',
  d12: 'text-white',
  d20: 'text-bg-primary',
  d100: 'text-bg-primary',
}

/**
 * Checks whether the user prefers reduced motion.
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}

export function DiceAnimation({
  results,
  dieType,
  isCritical = false,
  isFumble = false,
  isRolling,
  onAnimationComplete,
}: DiceAnimationProps) {
  const prefersReduced = usePrefersReducedMotion()
  const [showResult, setShowResult] = useState(!isRolling)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Generate stable random rotation values per animation trigger
  const rotations = useMemo(() => {
    return results.map(() => ({
      x: Math.random() * 720 - 360,
      y: Math.random() * 720 - 360,
      z: Math.random() * 360 - 180,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRolling, results.length])

  useEffect(() => {
    if (isRolling) {
      if (prefersReduced) {
        // Skip animation, show results immediately with fade
        setShowResult(true)
        setAnimating(false)
        onAnimationComplete?.()
      } else {
        setShowResult(false)
        setAnimating(true)

        // Tumble for 1s, then settle for 0.3s
        timerRef.current = setTimeout(() => {
          setAnimating(false)
          setShowResult(true)
          onAnimationComplete?.()
        }, 1300)
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isRolling, prefersReduced, onAnimationComplete])

  if (results.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-32 text-parchment/30 text-sm"
        data-testid="dice-tray-empty"
      >
        Roll some dice!
      </div>
    )
  }

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-3 py-4 min-h-[8rem]"
      data-testid="dice-animation"
      aria-live="polite"
    >
      {results.map((result, index) => (
        <div
          key={`${index}-${result}`}
          className={cn(
            'relative flex items-center justify-center',
            'w-14 h-14 rounded-lg font-bold text-xl',
            DIE_BG_COLORS[dieType],
            DIE_TEXT_COLORS[dieType],
            // Critical highlights
            showResult && isCritical && 'ring-2 ring-accent-gold shadow-[0_0_16px_rgba(232,180,48,0.6)]',
            showResult && isFumble && 'ring-2 ring-damage-red shadow-[0_0_16px_rgba(192,57,43,0.6)]',
          )}
          style={{
            animationDelay: `${index * 75}ms`,
            ...(animating
              ? {
                  transform: `rotateX(${rotations[index]?.x ?? 0}deg) rotateY(${rotations[index]?.y ?? 0}deg) rotateZ(${rotations[index]?.z ?? 0}deg)`,
                  transition: 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }
              : showResult
                ? {
                    transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
                    transition: 'transform 0.3s ease-out',
                  }
                : {}),
          }}
          data-testid={`die-result-${index}`}
        >
          {showResult ? result : '?'}
        </div>
      ))}
    </div>
  )
}
