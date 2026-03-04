import { useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * Determines navigation direction based on route depth.
 * Deeper routes (more segments) = forward, shallower = back.
 */
export function getRouteDepth(pathname: string): number {
  return pathname.split('/').filter(Boolean).length
}

/**
 * Wraps page content with framer-motion AnimatePresence for smooth
 * slide-in transitions. Slide-in from right for forward navigation,
 * slide-in from left for back navigation.
 *
 * Respects prefers-reduced-motion: when active, transitions are instant.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const prevDepthRef = useRef(getRouteDepth(location.pathname))
  const shouldReduceMotion = useFramerReducedMotion()

  // Also check the in-app class
  const appReduceMotion =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('reduce-motion')

  const reduceMotion = shouldReduceMotion || appReduceMotion

  const currentDepth = getRouteDepth(location.pathname)
  const direction = currentDepth >= prevDepthRef.current ? 1 : -1
  prevDepthRef.current = currentDepth

  // When reduced motion is active, render without animation
  if (reduceMotion) {
    return <div key={location.pathname}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: direction * 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction * -40 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
