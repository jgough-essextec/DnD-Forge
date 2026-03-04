import { useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * Determines navigation direction based on route depth.
 * Deeper routes (more segments) = forward, shallower = back.
 */
function getRouteDepth(pathname: string): number {
  return pathname.split('/').filter(Boolean).length
}

/**
 * Wraps page content with framer-motion AnimatePresence for smooth
 * slide-in transitions. Slide-in from right for forward navigation,
 * slide-in from left for back navigation.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const prevDepthRef = useRef(getRouteDepth(location.pathname))

  const currentDepth = getRouteDepth(location.pathname)
  const direction = currentDepth >= prevDepthRef.current ? 1 : -1
  prevDepthRef.current = currentDepth

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
