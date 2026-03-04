// =============================================================================
// Story 16.1 -- DetailSlidePanel
// Slide-in side panel with framer-motion animations, backdrop, focus trap,
// and responsive mobile bottom sheet.
// =============================================================================

import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DetailSlidePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function DetailSlidePanel({
  isOpen,
  onClose,
  title,
  children,
}: DetailSlidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Handle Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      document.addEventListener('keydown', handleKeyDown)

      // Focus the panel after animation starts
      const timer = setTimeout(() => {
        panelRef.current?.focus()
      }, 100)

      // Prevent body scroll
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
        clearTimeout(timer)
        previousFocusRef.current?.focus()
      }
    }
  }, [isOpen, handleKeyDown])

  // Focus trap: keep focus within panel
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !panelRef.current) return

    const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            data-testid="panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60"
            aria-hidden="true"
          />

          {/* Desktop: Slide from right / Mobile: Slide from bottom */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            onKeyDown={handleTabKey}
            // Desktop animation
            initial={{ x: '100%', y: 0 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: '100%', y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50 bg-bg-primary border-l border-parchment/10',
              'flex flex-col overflow-hidden',
              'focus:outline-none',
              // Desktop: right panel
              'hidden sm:flex sm:right-0 sm:top-0 sm:h-full sm:w-96 lg:w-[400px]',
            )}
          >
            <PanelContent title={title} onClose={onClose}>
              {children}
            </PanelContent>
          </motion.div>

          {/* Mobile: Bottom sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            onKeyDown={handleTabKey}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50 bg-bg-primary border-t border-parchment/10',
              'flex flex-col overflow-hidden rounded-t-2xl',
              'focus:outline-none',
              // Mobile: bottom sheet
              'sm:hidden inset-x-0 bottom-0 max-h-[80vh]',
            )}
          >
            <PanelContent title={title} onClose={onClose}>
              {children}
            </PanelContent>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function PanelContent({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-parchment/10">
        <h2 className="text-lg font-heading font-semibold text-parchment">
          {title}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className={cn(
            'p-1 rounded-lg text-parchment/60 hover:text-parchment',
            'hover:bg-parchment/10 transition-colors',
          )}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {children}
      </div>
    </>
  )
}
