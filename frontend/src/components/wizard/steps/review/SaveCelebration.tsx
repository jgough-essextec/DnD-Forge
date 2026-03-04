/**
 * SaveCelebration - Success celebration overlay after saving a character.
 *
 * Shows a themed "Your adventurer is ready!" splash with the character's
 * name, race, and class. Auto-navigates after 3 seconds or on click.
 */

import { useEffect } from 'react'
import { motion } from 'framer-motion'

interface SaveCelebrationProps {
  characterName: string
  raceName: string
  className: string
  onDismiss: () => void
}

export function SaveCelebration({
  characterName,
  raceName,
  className,
  onDismiss,
}: SaveCelebrationProps) {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/90 backdrop-blur-sm"
      onClick={onDismiss}
      role="dialog"
      aria-label="Character saved successfully"
      data-testid="save-celebration"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 15 }}
        className="text-center max-w-md mx-auto px-8"
      >
        {/* Decorative stars */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="text-4xl mb-4"
        >
          <span className="text-accent-gold" aria-hidden="true">&#9733; &#9733; &#9733;</span>
        </motion.div>

        <h2
          className="font-heading text-3xl md:text-4xl text-accent-gold mb-2"
          data-testid="celebration-title"
        >
          Your Adventurer is Ready!
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-parchment/90 font-heading mb-1"
          data-testid="celebration-character-name"
        >
          {characterName}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-parchment/60 mb-6"
        >
          {raceName} {className}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-parchment/40 text-sm"
        >
          Click anywhere or wait to continue...
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
