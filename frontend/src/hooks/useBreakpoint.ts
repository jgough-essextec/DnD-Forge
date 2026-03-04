import { useEffect, useState, useMemo } from 'react'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

interface BreakpointInfo {
  /** Current breakpoint category */
  breakpoint: Breakpoint
  /** Current viewport width in pixels */
  width: number
  /** True if viewport <= 640px */
  isMobile: boolean
  /** True if viewport is between 641px and 1024px */
  isTablet: boolean
  /** True if viewport >= 1025px */
  isDesktop: boolean
  /** True if viewport is in landscape orientation (width > height) */
  isLandscape: boolean
}

const MOBILE_MAX = 640
const TABLET_MAX = 1024

function getBreakpoint(width: number): Breakpoint {
  if (width <= MOBILE_MAX) return 'mobile'
  if (width <= TABLET_MAX) return 'tablet'
  return 'desktop'
}

/**
 * Hook that tracks the current viewport breakpoint with finer control
 * than useIsMobile. Returns the breakpoint category, exact width,
 * boolean helpers, and landscape detection.
 *
 * Breakpoints:
 * - mobile: <= 640px
 * - tablet: 641px - 1024px
 * - desktop: > 1024px
 */
export function useBreakpoint(): BreakpointInfo {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 }
    }
    return { width: window.innerWidth, height: window.innerHeight }
  })

  useEffect(() => {
    // Use matchMedia for breakpoint thresholds (efficient, no resize spam)
    const mqlMobile = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`)
    const mqlTablet = window.matchMedia(
      `(min-width: ${MOBILE_MAX + 1}px) and (max-width: ${TABLET_MAX}px)`,
    )
    const mqlLandscape = window.matchMedia('(orientation: landscape)')

    const update = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }

    // Sync on mount
    update()

    mqlMobile.addEventListener('change', update)
    mqlTablet.addEventListener('change', update)
    mqlLandscape.addEventListener('change', update)

    return () => {
      mqlMobile.removeEventListener('change', update)
      mqlTablet.removeEventListener('change', update)
      mqlLandscape.removeEventListener('change', update)
    }
  }, [])

  return useMemo(() => {
    const { width, height } = dimensions
    const breakpoint = getBreakpoint(width)

    return {
      breakpoint,
      width,
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop',
      isLandscape: width > height,
    }
  }, [dimensions])
}
