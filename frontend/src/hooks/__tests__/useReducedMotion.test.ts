import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSystemReducedMotion } from '@/hooks/useReducedMotion'

// ---------------------------------------------------------------------------
// Mock matchMedia
// ---------------------------------------------------------------------------

function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: { matches: boolean }) => void> = []

  const mql = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: vi.fn((_event: string, listener: (e: { matches: boolean }) => void) => {
      listeners.push(listener)
    }),
    removeEventListener: vi.fn((_event: string, listener: (e: { matches: boolean }) => void) => {
      const idx = listeners.indexOf(listener)
      if (idx >= 0) listeners.splice(idx, 1)
    }),
  }

  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql))

  return {
    mql,
    simulate(newMatches: boolean) {
      mql.matches = newMatches
      listeners.forEach((fn) => fn({ matches: newMatches }))
    },
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useSystemReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.documentElement.classList.remove('reduce-motion')
  })

  it('should detect system prefers-reduced-motion preference via window.matchMedia', () => {
    mockMatchMedia(true)

    const { result } = renderHook(() => useSystemReducedMotion())
    expect(result.current).toBe(true)
  })

  it('should return false when system does not prefer reduced motion', () => {
    mockMatchMedia(false)

    const { result } = renderHook(() => useSystemReducedMotion())
    expect(result.current).toBe(false)
  })

  it('should update when system preference changes', () => {
    const { simulate } = mockMatchMedia(false)

    const { result } = renderHook(() => useSystemReducedMotion())
    expect(result.current).toBe(false)

    act(() => {
      simulate(true)
    })

    expect(result.current).toBe(true)
  })

  it('should update back to false when system preference reverts', () => {
    const { simulate } = mockMatchMedia(true)

    const { result } = renderHook(() => useSystemReducedMotion())
    expect(result.current).toBe(true)

    act(() => {
      simulate(false)
    })

    expect(result.current).toBe(false)
  })

  it('should clean up event listener on unmount', () => {
    const { mql } = mockMatchMedia(false)

    const { unmount } = renderHook(() => useSystemReducedMotion())

    unmount()

    expect(mql.removeEventListener).toHaveBeenCalled()
  })
})

describe('reduce-motion CSS class', () => {
  afterEach(() => {
    document.documentElement.classList.remove('reduce-motion')
  })

  it('should be applicable to the document element', () => {
    document.documentElement.classList.add('reduce-motion')
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(
      true
    )
  })

  it('should be removable from the document element', () => {
    document.documentElement.classList.add('reduce-motion')
    document.documentElement.classList.remove('reduce-motion')
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(
      false
    )
  })
})
