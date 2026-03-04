/**
 * usePrintMode Hook Tests (Epic 40 - Story 40.1)
 *
 * Tests the actual hook implementation for:
 * - Print mode detection via matchMedia
 * - Ink-saving preference persistence in localStorage
 * - Body class management for ink-saving mode
 * - triggerPrint calling window.print()
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePrintMode } from '@/hooks/usePrintMode'

describe('usePrintMode', () => {
  let originalMatchMedia: typeof window.matchMedia
  let listeners: Array<(e: MediaQueryListEvent) => void>

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
    listeners = []

    const mockMql = {
      matches: false,
      media: 'print',
      onchange: null,
      addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          listeners.push(handler)
        }
      }),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }

    window.matchMedia = vi.fn().mockReturnValue(mockMql) as unknown as typeof window.matchMedia

    localStorage.removeItem('dnd-forge-ink-saving')
    document.body.classList.remove('ink-saving')
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    localStorage.removeItem('dnd-forge-ink-saving')
    document.body.classList.remove('ink-saving')
  })

  it('should initialize with isPrinting false when not in print mode', () => {
    const { result } = renderHook(() => usePrintMode())
    expect(result.current.isPrinting).toBe(false)
  })

  it('should initialize with inkSaving false when no preference stored', () => {
    const { result } = renderHook(() => usePrintMode())
    expect(result.current.inkSaving).toBe(false)
  })

  it('should read ink-saving preference from localStorage', () => {
    localStorage.setItem('dnd-forge-ink-saving', 'true')
    const { result } = renderHook(() => usePrintMode())
    expect(result.current.inkSaving).toBe(true)
  })

  it('should persist ink-saving preference to localStorage when toggled', () => {
    const { result } = renderHook(() => usePrintMode())

    act(() => {
      result.current.toggleInkSaving()
    })

    expect(localStorage.getItem('dnd-forge-ink-saving')).toBe('true')
    expect(result.current.inkSaving).toBe(true)
  })

  it('should toggle ink-saving off when called twice', () => {
    const { result } = renderHook(() => usePrintMode())

    act(() => {
      result.current.toggleInkSaving()
    })
    expect(result.current.inkSaving).toBe(true)

    act(() => {
      result.current.toggleInkSaving()
    })
    expect(result.current.inkSaving).toBe(false)
    expect(localStorage.getItem('dnd-forge-ink-saving')).toBe('false')
  })

  it('should add ink-saving class to body when ink-saving is enabled', () => {
    const { result } = renderHook(() => usePrintMode())

    act(() => {
      result.current.setInkSaving(true)
    })

    expect(document.body.classList.contains('ink-saving')).toBe(true)
  })

  it('should remove ink-saving class from body when ink-saving is disabled', () => {
    const { result } = renderHook(() => usePrintMode())

    act(() => {
      result.current.setInkSaving(true)
    })
    expect(document.body.classList.contains('ink-saving')).toBe(true)

    act(() => {
      result.current.setInkSaving(false)
    })
    expect(document.body.classList.contains('ink-saving')).toBe(false)
  })

  it('should call window.print when triggerPrint is invoked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const { result } = renderHook(() => usePrintMode())

    act(() => {
      result.current.triggerPrint()
    })

    expect(printSpy).toHaveBeenCalledOnce()
    printSpy.mockRestore()
  })

  it('should register matchMedia listener for print changes', () => {
    renderHook(() => usePrintMode())
    expect(window.matchMedia).toHaveBeenCalledWith('print')
  })

  it('should provide setInkSaving function to set explicit value', () => {
    const { result } = renderHook(() => usePrintMode())

    act(() => {
      result.current.setInkSaving(true)
    })
    expect(result.current.inkSaving).toBe(true)

    act(() => {
      result.current.setInkSaving(false)
    })
    expect(result.current.inkSaving).toBe(false)
  })
})
