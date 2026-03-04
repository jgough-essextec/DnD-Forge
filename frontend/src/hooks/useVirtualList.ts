/**
 * useVirtualList Hook (Story 42.3)
 *
 * Lightweight virtual scrolling hook for rendering large lists efficiently.
 * Only renders items that are visible in the viewport plus an overscan buffer.
 *
 * Activates when list exceeds the threshold (default: 50 items).
 * Falls back to rendering all items when below the threshold.
 *
 * This hook provides the windowing infrastructure without requiring
 * external dependencies like react-window or @tanstack/virtual.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VirtualListOptions {
  /** Total number of items in the list */
  itemCount: number
  /** Height of each item in pixels */
  itemHeight: number
  /** Height of the viewport container in pixels */
  containerHeight: number
  /** Number of items to render outside the visible area (default: 5) */
  overscan?: number
  /** Minimum item count before virtual scrolling activates (default: 50) */
  threshold?: number
}

export interface VirtualItem {
  /** Index of the item in the original list */
  index: number
  /** Offset from the top of the scrollable area in pixels */
  offsetTop: number
}

export interface VirtualListResult {
  /** Whether virtual scrolling is active */
  isVirtual: boolean
  /** The items currently in the render window */
  virtualItems: VirtualItem[]
  /** Total height of the scrollable area in pixels */
  totalHeight: number
  /** Ref to attach to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Handler to attach to the container's onScroll event */
  onScroll: () => void
  /** Current scroll offset in pixels */
  scrollOffset: number
  /** Range of rendered item indices [start, end) */
  range: { start: number; end: number }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useVirtualList(options: VirtualListOptions): VirtualListResult {
  const {
    itemCount,
    itemHeight,
    containerHeight,
    overscan = 5,
    threshold = 50,
  } = options

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollOffset, setScrollOffset] = useState(0)

  const isVirtual = itemCount >= threshold

  // Calculate visible range
  const { start, end, virtualItems, totalHeight } = useMemo(() => {
    const total = itemCount * itemHeight

    if (!isVirtual) {
      // Render all items
      const items: VirtualItem[] = Array.from({ length: itemCount }, (_, i) => ({
        index: i,
        offsetTop: i * itemHeight,
      }))
      return { start: 0, end: itemCount, virtualItems: items, totalHeight: total }
    }

    // Calculate visible range with overscan
    const visibleStart = Math.floor(scrollOffset / itemHeight)
    const visibleEnd = Math.ceil((scrollOffset + containerHeight) / itemHeight)

    const rangeStart = Math.max(0, visibleStart - overscan)
    const rangeEnd = Math.min(itemCount, visibleEnd + overscan)

    const items: VirtualItem[] = []
    for (let i = rangeStart; i < rangeEnd; i++) {
      items.push({
        index: i,
        offsetTop: i * itemHeight,
      })
    }

    return { start: rangeStart, end: rangeEnd, virtualItems: items, totalHeight: total }
  }, [itemCount, itemHeight, containerHeight, scrollOffset, overscan, isVirtual])

  // Scroll handler
  const onScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollOffset(containerRef.current.scrollTop)
    }
  }, [])

  // Reset scroll when item count changes significantly
  useEffect(() => {
    setScrollOffset(0)
  }, [itemCount])

  return {
    isVirtual,
    virtualItems,
    totalHeight,
    containerRef,
    onScroll,
    scrollOffset,
    range: { start, end },
  }
}
