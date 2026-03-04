/**
 * useDebounce Tests (Story 42.3)
 *
 * Tests for the debounce hook:
 * - Value debouncing with configurable delay
 * - Callback debouncing with cancel support
 * - Default 150ms delay for gallery/spell/skill search
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce, useDebouncedCallback } from '@/hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // =========================================================================
  // Value debouncing
  // =========================================================================

  describe('useDebounce (value)', () => {
    it('should return the initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('hello'))
      expect(result.current).toBe('hello')
    })

    it('should debounce value changes by default 150ms', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value),
        { initialProps: { value: 'a' } }
      )

      rerender({ value: 'ab' })
      expect(result.current).toBe('a') // Not yet updated

      act(() => {
        vi.advanceTimersByTime(100) // Only 100ms
      })
      expect(result.current).toBe('a') // Still not updated

      act(() => {
        vi.advanceTimersByTime(50) // Now 150ms total
      })
      expect(result.current).toBe('ab') // Updated
    })

    it('should use custom delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'start', delay: 300 } }
      )

      rerender({ value: 'end', delay: 300 })

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current).toBe('start')

      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(result.current).toBe('end')
    })

    it('should reset the timer on rapid value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 150),
        { initialProps: { value: 'a' } }
      )

      rerender({ value: 'ab' })
      act(() => {
        vi.advanceTimersByTime(100)
      })

      rerender({ value: 'abc' })
      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(result.current).toBe('a') // Timer was reset

      act(() => {
        vi.advanceTimersByTime(50)
      })
      expect(result.current).toBe('abc') // 150ms since last change
    })

    it('should debounce gallery search by 150ms', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 150),
        { initialProps: { value: '' } }
      )

      rerender({ value: 'G' })
      rerender({ value: 'Ga' })
      rerender({ value: 'Gan' })
      rerender({ value: 'Gand' })
      rerender({ value: 'Ganda' })
      rerender({ value: 'Gandal' })
      rerender({ value: 'Gandalf' })

      act(() => {
        vi.advanceTimersByTime(149)
      })
      expect(result.current).toBe('') // Still the initial empty string

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(result.current).toBe('Gandalf') // Only final value
    })
  })

  // =========================================================================
  // Callback debouncing
  // =========================================================================

  describe('useDebouncedCallback', () => {
    it('should debounce callback invocations', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useDebouncedCallback(callback, 150))

      act(() => {
        result.current.debouncedFn('a')
        result.current.debouncedFn('b')
        result.current.debouncedFn('c')
      })

      expect(callback).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(150)
      })
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('c') // Only last call
    })

    it('should cancel pending invocations', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useDebouncedCallback(callback, 150))

      act(() => {
        result.current.debouncedFn('test')
      })

      act(() => {
        result.current.cancel()
      })

      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(callback).not.toHaveBeenCalled()
    })

    it('should use default 150ms delay', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useDebouncedCallback(callback))

      act(() => {
        result.current.debouncedFn()
      })

      act(() => {
        vi.advanceTimersByTime(149)
      })
      expect(callback).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should clean up on unmount', () => {
      const callback = vi.fn()
      const { result, unmount } = renderHook(() =>
        useDebouncedCallback(callback, 150)
      )

      act(() => {
        result.current.debouncedFn('test')
      })

      unmount()

      act(() => {
        vi.advanceTimersByTime(200)
      })
      // Should not throw or call callback after unmount
    })
  })
})
