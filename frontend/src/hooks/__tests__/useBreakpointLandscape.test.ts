/**
 * Landscape and Orientation Change Tests (Story 44.4)
 *
 * Verifies that the useBreakpoint hook correctly detects landscape
 * orientation and handles orientation changes without losing state.
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBreakpoint } from '@/hooks/useBreakpoint'

describe('useBreakpoint — Landscape Mode (Story 44.4)', () => {
  let changeHandlers: Map<string, Set<(event: MediaQueryListEvent) => void>>

  function mockMatchMedia(width: number, height: number) {
    changeHandlers = new Map()

    Object.defineProperty(window, 'innerWidth', { writable: true, value: width })
    Object.defineProperty(window, 'innerHeight', { writable: true, value: height })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: evaluateQuery(query, width, height),
        media: query,
        onchange: null,
        addEventListener: vi.fn((_event: string, handler: (event: MediaQueryListEvent) => void) => {
          const existing = changeHandlers.get(query) ?? new Set()
          existing.add(handler)
          changeHandlers.set(query, existing)
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  }

  function evaluateQuery(query: string, width: number, height: number): boolean {
    if (query.includes('orientation: landscape')) return width > height
    if (query.includes('max-width: 640px')) return width <= 640
    if (query.includes('min-width: 641px') && query.includes('max-width: 1024px'))
      return width >= 641 && width <= 1024
    return false
  }

  function simulateResize(newWidth: number, newHeight: number) {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: newWidth })
    Object.defineProperty(window, 'innerHeight', { writable: true, value: newHeight })

    for (const [, handlers] of changeHandlers) {
      for (const handler of handlers) {
        handler({} as MediaQueryListEvent)
      }
    }
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('detects landscape mobile (640x360)', () => {
    mockMatchMedia(640, 360)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.isLandscape).toBe(true)
    expect(result.current.isMobile).toBe(true)
    expect(result.current.width).toBe(640)
  })

  it('detects landscape tablet (1024x768)', () => {
    mockMatchMedia(1024, 768)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.isLandscape).toBe(true)
    expect(result.current.isTablet).toBe(true)
    expect(result.current.width).toBe(1024)
  })

  it('preserves breakpoint info after portrait-to-landscape rotation', () => {
    // Start in portrait mobile
    mockMatchMedia(360, 640)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.isMobile).toBe(true)
    expect(result.current.isLandscape).toBe(false)

    // Rotate to landscape — width becomes 640, height becomes 360
    act(() => {
      simulateResize(640, 360)
    })

    expect(result.current.isLandscape).toBe(true)
    // 640px is still mobile breakpoint
    expect(result.current.isMobile).toBe(true)
  })

  it('preserves breakpoint info after landscape-to-portrait rotation', () => {
    // Start in landscape tablet
    mockMatchMedia(1024, 768)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.isLandscape).toBe(true)
    expect(result.current.isTablet).toBe(true)

    // Rotate to portrait — width becomes 768, height becomes 1024
    act(() => {
      simulateResize(768, 1024)
    })

    expect(result.current.isLandscape).toBe(false)
    expect(result.current.isTablet).toBe(true)
  })

  it('detects breakpoint change when rotation crosses threshold', () => {
    // Portrait mobile at 390x844
    mockMatchMedia(390, 844)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.isMobile).toBe(true)

    // Landscape: 844x390 — now tablet width
    act(() => {
      simulateResize(844, 390)
    })

    expect(result.current.isTablet).toBe(true)
    expect(result.current.isLandscape).toBe(true)
  })
})
