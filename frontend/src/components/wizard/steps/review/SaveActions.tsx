/**
 * SaveActions - Save action buttons and logic for the review step.
 *
 * Provides "Save Character", "Save & Create Another", and "Go Back & Edit"
 * buttons. Handles API mutation, loading state, error handling, celebration,
 * and JSON export fallback.
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useWizardStore } from '@/stores/wizardStore'
import { useCreateCharacter } from '@/hooks/useCharacterMutations'
import { transformWizardToPayload } from '@/utils/transformWizardToPayload'
import { cn } from '@/lib/utils'
import { useValidationState } from './ValidationSummary'
import { SaveCelebration } from './SaveCelebration'
import type { ReviewData } from './useReviewData'

interface SaveActionsProps {
  data: ReviewData
  onGoBack?: () => void
}

export function SaveActions({ data, onGoBack }: SaveActionsProps) {
  const navigate = useNavigate()
  const createCharacter = useCreateCharacter()
  const reset = useWizardStore((s) => s.reset)
  const setStep = useWizardStore((s) => s.setStep)

  const { hasErrors, errorCount } = useValidationState()

  const [showCelebration, setShowCelebration] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [createAnotherAfterSave, setCreateAnotherAfterSave] = useState(false)

  // Get the current wizard state for transform
  const wizardState = useWizardStore.getState()

  const handleSave = useCallback(
    async (createAnother = false) => {
      setSaveError(null)
      setCreateAnotherAfterSave(createAnother)

      try {
        const payload = transformWizardToPayload(useWizardStore.getState())
        await createCharacter.mutateAsync(payload)
        setShowCelebration(true)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred while saving.'
        setSaveError(message)
      }
    },
    [createCharacter],
  )

  const handleCelebrationDismiss = useCallback(() => {
    setShowCelebration(false)
    reset()

    if (createAnotherAfterSave) {
      setStep(0)
    } else {
      navigate('/characters')
    }
  }, [reset, setStep, navigate, createAnotherAfterSave])

  const handleGoBack = useCallback(() => {
    if (onGoBack) {
      onGoBack()
    }
  }, [onGoBack])

  const handleExportJSON = useCallback(() => {
    try {
      const payload = transformWizardToPayload(useWizardStore.getState())
      const json = JSON.stringify(payload, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.characterName || 'character'}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // Silently fail on export error
    }
  }, [data.characterName])

  const handleRetry = useCallback(() => {
    setSaveError(null)
    void handleSave(createAnotherAfterSave)
  }, [handleSave, createAnotherAfterSave])

  const isSaving = createCharacter.isPending

  return (
    <>
      <div className="space-y-3" data-testid="save-actions">
        {/* Error message */}
        {saveError && (
          <div
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm"
            data-testid="save-error"
          >
            <div className="text-red-400 font-medium mb-1">Failed to save character</div>
            <p className="text-red-400/80 mb-3">{saveError}</p>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="px-3 py-1.5 rounded bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
                data-testid="retry-button"
              >
                Retry
              </button>
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 rounded bg-parchment/10 text-parchment/70 text-xs font-medium hover:bg-parchment/20 transition-colors"
                data-testid="export-json-button"
              >
                Export as JSON
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Save Character (primary) */}
          <div className="relative group flex-1">
            <button
              onClick={() => void handleSave(false)}
              disabled={hasErrors || isSaving}
              className={cn(
                'w-full px-6 py-3 rounded-lg font-heading font-semibold text-base transition-all',
                hasErrors
                  ? 'bg-parchment/10 text-parchment/30 cursor-not-allowed'
                  : 'bg-accent-gold text-bg-primary hover:bg-accent-gold/90 shadow-lg shadow-accent-gold/20',
                isSaving && 'opacity-70',
              )}
              data-testid="save-button"
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full" />
                  Saving...
                </span>
              ) : (
                'Save Character'
              )}
            </button>
            {/* Disabled tooltip */}
            {hasErrors && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded bg-bg-primary border border-parchment/20 text-xs text-parchment/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                data-testid="save-disabled-tooltip"
              >
                Fix {errorCount} error{errorCount > 1 ? 's' : ''} before saving
              </div>
            )}
          </div>

          {/* Save & Create Another */}
          <button
            onClick={() => void handleSave(true)}
            disabled={hasErrors || isSaving}
            className={cn(
              'px-6 py-3 rounded-lg font-medium text-sm transition-all border',
              hasErrors
                ? 'border-parchment/10 text-parchment/30 cursor-not-allowed'
                : 'border-accent-gold/30 text-accent-gold hover:bg-accent-gold/10',
              isSaving && 'opacity-70',
            )}
            data-testid="save-create-another-button"
          >
            Save & Create Another
          </button>

          {/* Go Back & Edit */}
          <button
            onClick={handleGoBack}
            className="px-6 py-3 rounded-lg font-medium text-sm text-parchment/60 hover:text-parchment/80 hover:bg-parchment/5 transition-all border border-parchment/10"
            data-testid="go-back-button"
          >
            Go Back & Edit
          </button>
        </div>
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <SaveCelebration
            characterName={data.characterName}
            raceName={data.raceName}
            className={data.className}
            onDismiss={handleCelebrationDismiss}
          />
        )}
      </AnimatePresence>
    </>
  )
}
