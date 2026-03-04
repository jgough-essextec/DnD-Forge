/**
 * SubclassStep (Story 31.4)
 *
 * Conditional step for subclass selection. Appears only at the class's
 * designated subclass level. Reuses the SubclassSelector pattern from
 * the creation wizard.
 */

import { Swords } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getClassById } from '@/data/classes'
import {
  SRD_SUBCLASSES,
  type SrdSubclassOption,
} from '@/components/wizard/steps/class/SubclassSelector'
import type { LevelUpChanges } from '@/utils/levelup'

interface SubclassStepProps {
  changes: LevelUpChanges
  selectedSubclassId: string | null
  onSubclassChange: (subclassId: string | null) => void
}

export function SubclassStep({
  changes,
  selectedSubclassId,
  onSubclassChange,
}: SubclassStepProps) {
  const classData = getClassById(changes.classId)
  const subclassName = classData?.subclassName ?? 'Subclass'
  const subclassOptions: SrdSubclassOption[] =
    SRD_SUBCLASSES[changes.classId] ?? []

  return (
    <div className="space-y-6" data-testid="subclass-step">
      <div className="text-center">
        <Swords className="h-8 w-8 text-accent-gold mx-auto mb-2" />
        <h3 className="text-lg font-heading font-bold text-parchment">
          Choose Your {subclassName}
        </h3>
        <p className="text-sm text-parchment/60 mt-1">
          At level {changes.newClassLevel}, you choose your specialization path.
        </p>
      </div>

      {subclassOptions.length > 0 ? (
        <div className="space-y-3" role="radiogroup" aria-label={`Select ${subclassName}`}>
          {subclassOptions.map((sub) => {
            const isSelected = selectedSubclassId === sub.id
            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSubclassChange(sub.id)}
                  className={cn(
                    'w-full text-left rounded-lg border-2 p-4 transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
                    isSelected
                      ? 'border-accent-gold bg-accent-gold/5'
                      : 'border-parchment/20 hover:border-parchment/40',
                  )}
                  data-testid={`subclass-option-${sub.id}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'flex-shrink-0 mt-0.5 h-5 w-5 rounded-full border-2',
                        'flex items-center justify-center transition-colors',
                        isSelected
                          ? 'border-accent-gold'
                          : 'border-parchment/40',
                      )}
                    >
                      {isSelected && (
                        <span className="h-2.5 w-2.5 rounded-full bg-accent-gold" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-parchment">
                        {sub.name}
                      </span>
                      <p className="text-xs text-parchment/60 mt-1">
                        {sub.description}
                      </p>
                      <p className="text-xs text-parchment/40 mt-2 italic">
                        Key Features: {sub.features}
                      </p>
                    </div>
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div
          className={cn(
            'rounded-lg border border-parchment/15 bg-parchment/5 p-6',
            'text-center',
          )}
          data-testid="no-subclass-options"
        >
          <p className="text-sm text-parchment/50">
            No SRD subclass options are available for this class. Your DM may
            provide homebrew options.
          </p>
        </div>
      )}
    </div>
  )
}
