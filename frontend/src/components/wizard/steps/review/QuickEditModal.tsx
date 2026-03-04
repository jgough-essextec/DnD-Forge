/**
 * QuickEditModal - Modal wrapper for rendering step components
 * for inline editing from the review step.
 *
 * Renders the appropriate step component in a dialog overlay.
 * "Save Changes" and "Cancel" buttons. On save: wizard store
 * updates automatically (step components write to the store directly),
 * close the modal, preview recalculates.
 *
 * Large modal (80% viewport height desktop, full screen mobile).
 * Escape to close and click-outside to close.
 */

import { useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// Step component imports
import { RaceStep } from '@/components/wizard/steps/race/RaceStep'
import { ClassStep } from '@/components/wizard/steps/class'
import { AbilityScoreStep } from '@/components/wizard/steps/abilities'
import { BackgroundStep } from '@/components/wizard/steps/background/BackgroundStep'
import { EquipmentStep } from '@/components/wizard/steps/equipment/EquipmentStep'
import { SpellStep } from '@/components/wizard/steps/spells/SpellStep'

interface QuickEditModalProps {
  /** The wizard step id to render (1=race, 2=class, 3=abilities, 4=background, 5=equipment, 6=spells) */
  stepId: number
  onClose: () => void
}

const STEP_LABELS: Record<number, string> = {
  1: 'Edit Race',
  2: 'Edit Class',
  3: 'Edit Ability Scores',
  4: 'Edit Background',
  5: 'Edit Equipment',
  6: 'Edit Spells',
}

function renderStepComponent(stepId: number) {
  switch (stepId) {
    case 1:
      return <RaceStep />
    case 2:
      return <ClassStep />
    case 3:
      return <AbilityScoreStep />
    case 4:
      return <BackgroundStep />
    case 5:
      return <EquipmentStep />
    case 6:
      return <SpellStep />
    default:
      return <div className="text-parchment/50 p-4">Unknown step</div>
  }
}

export function QuickEditModal({ stepId, onClose }: QuickEditModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Handle click on backdrop (outside the content area)
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only close if clicking the backdrop itself (not the content)
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose],
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={STEP_LABELS[stepId] ?? 'Quick Edit'}
      data-testid="quick-edit-modal"
    >
      <div
        ref={contentRef}
        className={cn(
          'w-full h-full md:w-[90vw] md:h-[85vh] md:max-w-5xl',
          'md:rounded-xl',
          'bg-bg-primary border border-parchment/20',
          'overflow-hidden flex flex-col',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-parchment/20 shrink-0">
          <h2 className="font-heading text-lg text-accent-gold">
            {STEP_LABELS[stepId] ?? 'Edit'}
          </h2>
          <button
            onClick={onClose}
            className="text-parchment/50 hover:text-parchment transition-colors p-1"
            aria-label="Close"
            data-testid="modal-close-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderStepComponent(stepId)}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-parchment/20 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-parchment/60 hover:text-parchment/80 hover:bg-parchment/5 transition-all border border-parchment/10"
            data-testid="modal-cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-gold text-bg-primary hover:bg-accent-gold/90 transition-all"
            data-testid="modal-save-button"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
