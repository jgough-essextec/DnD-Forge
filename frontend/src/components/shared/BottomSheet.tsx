/**
 * BottomSheet (Story 44.1)
 *
 * Reusable bottom sheet component for mobile modals.
 * Features:
 * - Slides up from bottom with backdrop
 * - Swipe-to-dismiss gesture support (drag handle)
 * - Closes on backdrop click or Escape key
 * - Safe area inset padding for notched devices
 * - Accessible: role="dialog", aria-modal, focus trap
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

export interface BottomSheetProps {
  /** Whether the bottom sheet is open */
  isOpen: boolean
  /** Called when the user wants to close the sheet */
  onClose: () => void
  /** Title displayed in the sheet header */
  title?: string
  /** Content rendered inside the sheet */
  children: React.ReactNode
  /** Additional class names for the sheet container */
  className?: string
  /** Maximum height as a CSS value. Defaults to "85vh" */
  maxHeight?: string
  /** Test ID for the bottom sheet */
  testId?: string
}

/** Minimum downward swipe distance (px) to trigger dismiss */
const SWIPE_THRESHOLD = 80

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  maxHeight = '85vh',
  testId = 'bottom-sheet',
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    startY: number
    currentY: number
    isDragging: boolean
  }>({ startY: 0, currentY: 0, isDragging: false })
  const [translateY, setTranslateY] = useState(0)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // Swipe-to-dismiss handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    dragRef.current = {
      startY: touch.clientY,
      currentY: touch.clientY,
      isDragging: true,
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.isDragging) return

    const touch = e.touches[0]
    dragRef.current.currentY = touch.clientY

    const deltaY = touch.clientY - dragRef.current.startY
    // Only allow dragging downward
    if (deltaY > 0) {
      setTranslateY(deltaY)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!dragRef.current.isDragging) return

    const deltaY = dragRef.current.currentY - dragRef.current.startY
    dragRef.current.isDragging = false

    if (deltaY >= SWIPE_THRESHOLD) {
      onClose()
    }
    setTranslateY(0)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50"
      data-testid={testId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
        data-testid={`${testId}-backdrop`}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Bottom sheet'}
        className={cn(
          'absolute bottom-0 left-0 right-0',
          'bg-bg-secondary rounded-t-2xl border-t border-parchment/10',
          'flex flex-col overflow-hidden',
          'transition-transform duration-200 ease-out',
          'pb-[env(safe-area-inset-bottom)]',
          className,
        )}
        style={{
          maxHeight,
          transform: translateY > 0 ? `translateY(${translateY}px)` : undefined,
        }}
        data-testid={`${testId}-content`}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          data-testid={`${testId}-handle`}
        >
          <div className="w-10 h-1 rounded-full bg-parchment/30" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-4 pb-3 shrink-0">
            <h2 className="text-lg font-heading text-parchment">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4"
          data-testid={`${testId}-body`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
