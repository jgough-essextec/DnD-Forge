// =============================================================================
// Story 16.2 -- StepHelp
// Collapsible help panel with step-specific guidance and tips.
// =============================================================================

import { useState } from 'react'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StepHelpProps {
  stepName: string
  helpText: string
  tips?: string[]
}

export function StepHelp({ stepName, helpText, tips }: StepHelpProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-parchment/15 bg-bg-secondary/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`step-help-${stepName}`}
        className={cn(
          'flex items-center gap-2 w-full px-4 py-3 text-left',
          'text-sm text-parchment/70 hover:text-parchment transition-colors',
        )}
      >
        <HelpCircle className="h-4 w-4 flex-shrink-0 text-accent-gold/70" />
        <span className="flex-1 font-medium">Need Help?</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isExpanded && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={`step-help-${stepName}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <p className="text-sm text-parchment/70 leading-relaxed">
                {helpText}
              </p>

              {tips && tips.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-accent-gold/80 mb-1.5">
                    Tips:
                  </p>
                  <ul className="space-y-1">
                    {tips.map((tip, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-xs text-parchment/60"
                      >
                        <span className="text-accent-gold/60 mt-0.5">*</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
