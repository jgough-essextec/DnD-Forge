import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = '(max-width: 640px)'

/**
 * Hook that tracks whether the current viewport matches mobile breakpoint.
 * Uses window.matchMedia for efficient resize detection.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(MOBILE_BREAKPOINT).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT)

    const handler = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    mql.addEventListener('change', handler)
    // Sync in case the initial value was wrong (SSR)
    setIsMobile(mql.matches)

    return () => {
      mql.removeEventListener('change', handler)
    }
  }, [])

  return isMobile
}
