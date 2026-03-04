import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBreakpoint } from '@/hooks/useBreakpoint'

describe('useBreakpoint', () => {
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
        removeEventListener: vi.fn((_event: string, handler: (event: MediaQueryListEvent) => void) => {
          const existing = changeHandlers.get(query)
          if (existing) existing.delete(handler)
        }),
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

    // Trigger all registered handlers
    for (const [, handlers] of changeHandlers) {
      for (const handler of handlers) {
        handler({} as MediaQueryListEvent)
      }
    }
  }

  beforeEach(() => {
    mockMatchMedia(1200, 800)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns desktop breakpoint for width > 1024', () => {
    mockMatchMedia(1200, 800)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.breakpoint).toBe('desktop')
    expect(result.current.isDesktop).toBe(true)
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
  })

  it('returns tablet breakpoint for width between 641 and 1024', () => {
    mockMatchMedia(768, 1024)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.breakpoint).toBe('tablet')
    expect(result.current.isTablet).toBe(true)
    expect(result.current.isMobile).toBe(false)
    expect(result.current.isDesktop).toBe(false)
  })

  it('returns mobile breakpoint for width <= 640', () => {
    mockMatchMedia(390, 844)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.breakpoint).toBe('mobile')
    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(false)
  })

  it('returns correct width value', () => {
    mockMatchMedia(428, 926)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.width).toBe(428)
  })

  it('detects landscape orientation when width > height', () => {
    mockMatchMedia(640, 360)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.isLandscape).toBe(true)
  })

  it('detects portrait orientation when width <= height', () => {
    mockMatchMedia(390, 844)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.isLandscape).toBe(false)
  })

  it('updates when viewport resizes from desktop to mobile', () => {
    mockMatchMedia(1200, 800)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.breakpoint).toBe('desktop')

    act(() => {
      simulateResize(360, 640)
    })

    expect(result.current.breakpoint).toBe('mobile')
    expect(result.current.isMobile).toBe(true)
  })

  it('updates when viewport resizes from mobile to tablet', () => {
    mockMatchMedia(360, 640)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.breakpoint).toBe('mobile')

    act(() => {
      simulateResize(768, 1024)
    })

    expect(result.current.breakpoint).toBe('tablet')
    expect(result.current.isTablet).toBe(true)
  })

  it('detects orientation change from portrait to landscape', () => {
    mockMatchMedia(390, 844)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.isLandscape).toBe(false)

    act(() => {
      simulateResize(844, 390)
    })

    expect(result.current.isLandscape).toBe(true)
  })

  it('returns mobile at exactly 640px boundary', () => {
    mockMatchMedia(640, 1136)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.breakpoint).toBe('mobile')
    expect(result.current.isMobile).toBe(true)
  })

  it('returns tablet at exactly 1024px boundary', () => {
    mockMatchMedia(1024, 768)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.breakpoint).toBe('tablet')
    expect(result.current.isTablet).toBe(true)
  })

  it('returns desktop at 1025px', () => {
    mockMatchMedia(1025, 768)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.breakpoint).toBe('desktop')
    expect(result.current.isDesktop).toBe(true)
  })

  it('handles smallest common phone width (360px)', () => {
    mockMatchMedia(360, 640)
    const { result } = renderHook(() => useBreakpoint())

    expect(result.current.breakpoint).toBe('mobile')
    expect(result.current.width).toBe(360)
  })
})
