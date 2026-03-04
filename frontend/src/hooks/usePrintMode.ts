/**
 * usePrintMode Hook (Epic 40 - Story 40.1)
 *
 * Provides print mode detection and ink-saving mode management.
 *
 * - `isPrinting`: true when the browser is in print mode (detected via matchMedia)
 * - `inkSaving`: boolean for ink-saving mode preference (persisted in localStorage)
 * - `setInkSaving`: toggle ink-saving mode
 * - `triggerPrint`: calls window.print() with optional ink-saving class applied to <body>
 */

import { useState, useEffect, useCallback } from 'react'

const INK_SAVING_KEY = 'dnd-forge-ink-saving'

/**
 * Read ink-saving preference from localStorage.
 */
function getStoredInkSaving(): boolean {
  try {
    return localStorage.getItem(INK_SAVING_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Persist ink-saving preference to localStorage.
 */
function storeInkSaving(value: boolean): void {
  try {
    localStorage.setItem(INK_SAVING_KEY, String(value))
  } catch {
    // localStorage may be unavailable in some environments
  }
}

export function usePrintMode() {
  const [isPrinting, setIsPrinting] = useState(false)
  const [inkSaving, setInkSavingState] = useState(getStoredInkSaving)

  // Listen for print media query changes
  useEffect(() => {
    // Guard: matchMedia may not be available in some test environments (jsdom)
    if (typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('print')

    const handleChange = (e: MediaQueryListEvent) => {
      setIsPrinting(e.matches)
    }

    // Set initial value
    setIsPrinting(mediaQuery.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Sync ink-saving class on <body> whenever the preference or print state changes
  useEffect(() => {
    if (inkSaving) {
      document.body.classList.add('ink-saving')
    } else {
      document.body.classList.remove('ink-saving')
    }
  }, [inkSaving])

  const setInkSaving = useCallback((value: boolean) => {
    setInkSavingState(value)
    storeInkSaving(value)
  }, [])

  const toggleInkSaving = useCallback(() => {
    setInkSavingState((prev) => {
      const next = !prev
      storeInkSaving(next)
      return next
    })
  }, [])

  const triggerPrint = useCallback(() => {
    window.print()
  }, [])

  return {
    isPrinting,
    inkSaving,
    setInkSaving,
    toggleInkSaving,
    triggerPrint,
  }
}
