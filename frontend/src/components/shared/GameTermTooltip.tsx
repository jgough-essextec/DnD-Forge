// =============================================================================
// Story 16.2 -- GameTermTooltip
// Wraps D&D terms with hover/tap tooltips showing definitions from the
// game terms dictionary.
// =============================================================================

import { useState, useRef, useEffect, useId } from 'react'
import { getGameTerm } from '@/data/game-terms'
import { cn } from '@/lib/utils'

interface GameTermTooltipProps {
  termId: string
  children: React.ReactNode
}

export function GameTermTooltip({ termId, children }: GameTermTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipId = useId()
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const gameTerm = getGameTerm(termId)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
      }
    }
  }, [])

  const showTooltip = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
    setIsVisible(true)
  }

  const hideTooltip = () => {
    hideTimer.current = setTimeout(() => {
      setIsVisible(false)
    }, 150)
  }

  const toggleTooltip = () => {
    setIsVisible((prev) => !prev)
  }

  // Close on click outside (for mobile)
  useEffect(() => {
    if (!isVisible) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isVisible])

  if (!gameTerm) {
    return <>{children}</>
  }

  return (
    <span className="relative inline">
      <span
        ref={triggerRef}
        aria-describedby={isVisible ? tooltipId : undefined}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onClick={toggleTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        tabIndex={0}
        className={cn(
          'cursor-help border-b border-dotted border-accent-gold/60',
          'text-accent-gold/90 hover:text-accent-gold transition-colors',
        )}
      >
        {children}
      </span>

      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          className={cn(
            'absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2',
            'w-64 max-w-[90vw] p-3 rounded-lg',
            'bg-bg-secondary border border-parchment/20 shadow-lg shadow-black/40',
            'text-left',
          )}
        >
          <p className="text-xs font-semibold text-accent-gold mb-1">
            {gameTerm.term}
          </p>
          <p className="text-xs text-parchment/80 leading-relaxed">
            {gameTerm.definition}
          </p>
          {/* Arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bg-secondary" />
        </div>
      )}
    </span>
  )
}
