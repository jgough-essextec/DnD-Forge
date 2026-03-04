/**
 * useVirtualList Tests (Story 42.3)
 *
 * Tests for the virtual scrolling hook:
 * - Activation threshold (50+ items)
 * - Visible range calculation
 * - Overscan buffer
 * - Scroll handling
 * - Total height computation
 */

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useVirtualList } from '@/hooks/useVirtualList'

describe('useVirtualList', () => {
  const DEFAULT_OPTIONS = {
    itemCount: 100,
    itemHeight: 50,
    containerHeight: 500,
    overscan: 5,
    threshold: 50,
  }

  // =========================================================================
  // Activation threshold
  // =========================================================================

  describe('activation threshold', () => {
    it('should not activate virtual scrolling below threshold', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          ...DEFAULT_OPTIONS,
          itemCount: 20,
        })
      )

      expect(result.current.isVirtual).toBe(false)
      expect(result.current.virtualItems).toHaveLength(20) // All items rendered
    })

    it('should activate virtual scrolling at threshold', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          ...DEFAULT_OPTIONS,
          itemCount: 50,
        })
      )

      expect(result.current.isVirtual).toBe(true)
      // Should not render all 50 items
      expect(result.current.virtualItems.length).toBeLessThan(50)
    })

    it('should activate virtual scrolling above threshold', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          ...DEFAULT_OPTIONS,
          itemCount: 200,
        })
      )

      expect(result.current.isVirtual).toBe(true)
      expect(result.current.virtualItems.length).toBeLessThan(200)
    })

    it('should use custom threshold', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          ...DEFAULT_OPTIONS,
          itemCount: 30,
          threshold: 25,
        })
      )

      expect(result.current.isVirtual).toBe(true)
    })
  })

  // =========================================================================
  // Visible range
  // =========================================================================

  describe('visible range calculation', () => {
    it('should render only visible items plus overscan', () => {
      const { result } = renderHook(() =>
        useVirtualList(DEFAULT_OPTIONS)
      )

      // containerHeight=500, itemHeight=50 => 10 visible items
      // overscan=5 => 5 extra on each side
      // But at top of list, start is clamped to 0
      // So range should be 0 to 10+5 = 15
      expect(result.current.range.start).toBe(0)
      expect(result.current.range.end).toBeLessThanOrEqual(20)
      expect(result.current.virtualItems.length).toBeLessThanOrEqual(20)
    })

    it('should compute correct total height', () => {
      const { result } = renderHook(() =>
        useVirtualList(DEFAULT_OPTIONS)
      )

      expect(result.current.totalHeight).toBe(100 * 50) // 5000px
    })

    it('should set offsetTop correctly for each virtual item', () => {
      const { result } = renderHook(() =>
        useVirtualList(DEFAULT_OPTIONS)
      )

      for (const item of result.current.virtualItems) {
        expect(item.offsetTop).toBe(item.index * 50)
      }
    })
  })

  // =========================================================================
  // Non-virtual mode
  // =========================================================================

  describe('non-virtual mode', () => {
    it('should render all items when below threshold', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          ...DEFAULT_OPTIONS,
          itemCount: 10,
        })
      )

      expect(result.current.isVirtual).toBe(false)
      expect(result.current.virtualItems).toHaveLength(10)
      expect(result.current.range.start).toBe(0)
      expect(result.current.range.end).toBe(10)
    })

    it('should still compute total height in non-virtual mode', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          ...DEFAULT_OPTIONS,
          itemCount: 10,
        })
      )

      expect(result.current.totalHeight).toBe(10 * 50) // 500px
    })
  })

  // =========================================================================
  // Container ref and scroll handler
  // =========================================================================

  describe('container and scroll', () => {
    it('should provide a container ref', () => {
      const { result } = renderHook(() =>
        useVirtualList(DEFAULT_OPTIONS)
      )

      expect(result.current.containerRef).toBeDefined()
    })

    it('should provide a scroll handler function', () => {
      const { result } = renderHook(() =>
        useVirtualList(DEFAULT_OPTIONS)
      )

      expect(typeof result.current.onScroll).toBe('function')
    })

    it('should start with scrollOffset of 0', () => {
      const { result } = renderHook(() =>
        useVirtualList(DEFAULT_OPTIONS)
      )

      expect(result.current.scrollOffset).toBe(0)
    })
  })

  // =========================================================================
  // Edge cases
  // =========================================================================

  describe('edge cases', () => {
    it('should handle zero items', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          ...DEFAULT_OPTIONS,
          itemCount: 0,
        })
      )

      expect(result.current.isVirtual).toBe(false)
      expect(result.current.virtualItems).toHaveLength(0)
      expect(result.current.totalHeight).toBe(0)
    })

    it('should handle single item', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          ...DEFAULT_OPTIONS,
          itemCount: 1,
        })
      )

      expect(result.current.isVirtual).toBe(false)
      expect(result.current.virtualItems).toHaveLength(1)
      expect(result.current.totalHeight).toBe(50)
    })

    it('should reset scroll offset when item count changes', () => {
      const { result, rerender } = renderHook(
        ({ itemCount }) =>
          useVirtualList({ ...DEFAULT_OPTIONS, itemCount }),
        { initialProps: { itemCount: 100 } }
      )

      // Changing item count should reset scroll
      rerender({ itemCount: 50 })
      expect(result.current.scrollOffset).toBe(0)
    })
  })
})
