import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/useIsMobile'

describe('useIsMobile', () => {
  let listeners: Map<string, ((event: MediaQueryListEvent) => void)[]>
  let matchesValue: boolean

  beforeEach(() => {
    listeners = new Map()
    matchesValue = false

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: matchesValue,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_event: string, handler: (event: MediaQueryListEvent) => void) => {
          const existing = listeners.get(query) ?? []
          existing.push(handler)
          listeners.set(query, existing)
        }),
        removeEventListener: vi.fn((_event: string, handler: (event: MediaQueryListEvent) => void) => {
          const existing = listeners.get(query) ?? []
          listeners.set(
            query,
            existing.filter((h) => h !== handler)
          )
        }),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns false when viewport is wider than 640px', () => {
    matchesValue = false
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true when viewport is 640px or narrower', () => {
    matchesValue = true

    // Need to re-mock before rendering
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('updates when viewport changes', () => {
    matchesValue = false
    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    // Simulate viewport resize to mobile
    act(() => {
      const handlers = listeners.get('(max-width: 640px)') ?? []
      for (const handler of handlers) {
        handler({ matches: true } as MediaQueryListEvent)
      }
    })

    expect(result.current).toBe(true)

    // Simulate viewport resize back to desktop
    act(() => {
      const handlers = listeners.get('(max-width: 640px)') ?? []
      for (const handler of handlers) {
        handler({ matches: false } as MediaQueryListEvent)
      }
    })

    expect(result.current).toBe(false)
  })
})
