/**
 * ValidationSummary - Displays categorized validation results.
 *
 * Runs validateCharacter() equivalent logic on the wizard state,
 * shows errors (red), warnings (yellow), and info (blue) messages.
 * Each message has a "Fix" button that navigates to the relevant step.
 * Collapsible section, expanded when errors exist.
 */

import { useState, useMemo, useCallback } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { cn } from '@/lib/utils'

export interface ValidationMessage {
  severity: 'error' | 'warning' | 'info'
  message: string
  field: string
  /** The wizard step id to navigate to for fixing this issue */
  fixStepId: number | null
}

interface ValidationSummaryProps {
  onNavigateToStep?: (stepId: number) => void
}


const SEVERITY_STYLES = {
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: 'X',
    label: 'Error',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: '!',
    label: 'Warning',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: 'i',
    label: 'Info',
  },
} as const

export function ValidationSummary({ onNavigateToStep }: ValidationSummaryProps) {
  const characterName = useWizardStore((s) => s.characterName)
  const raceSelection = useWizardStore((s) => s.raceSelection)
  const classSelection = useWizardStore((s) => s.classSelection)
  const abilityScores = useWizardStore((s) => s.abilityScores)
  const backgroundSelection = useWizardStore((s) => s.backgroundSelection)
  const equipmentSelections = useWizardStore((s) => s.equipmentSelections)

  const messages = useMemo<ValidationMessage[]>(() => {
    const results: ValidationMessage[] = []

    // Check required fields (errors)
    if (!characterName || characterName.trim() === '') {
      results.push({
        severity: 'warning',
        message: 'No character name set. Will use "Unnamed Adventurer".',
        field: 'name',
        fixStepId: 4,
      })
    }

    if (!raceSelection || !raceSelection.raceId) {
      results.push({
        severity: 'error',
        message: 'Race selection is required.',
        field: 'race',
        fixStepId: 1,
      })
    }

    if (!classSelection || !classSelection.classId) {
      results.push({
        severity: 'error',
        message: 'Class selection is required.',
        field: 'classes',
        fixStepId: 2,
      })
    }

    if (!abilityScores) {
      results.push({
        severity: 'error',
        message: 'Ability scores have not been set.',
        field: 'baseAbilityScores',
        fixStepId: 3,
      })
    }

    if (!backgroundSelection || !backgroundSelection.backgroundId) {
      results.push({
        severity: 'error',
        message: 'Background selection is required.',
        field: 'background',
        fixStepId: 4,
      })
    }

    // Warnings
    if (backgroundSelection?.characterPersonality) {
      const p = backgroundSelection.characterPersonality
      if (!p.personalityTraits[0] && !p.personalityTraits[1]) {
        results.push({
          severity: 'warning',
          message: 'Personality traits are empty. Consider adding them for roleplaying.',
          field: 'personality',
          fixStepId: 4,
        })
      }
      if (!p.ideal) {
        results.push({
          severity: 'warning',
          message: 'No ideal selected.',
          field: 'personality.ideal',
          fixStepId: 4,
        })
      }
      if (!p.bond) {
        results.push({
          severity: 'warning',
          message: 'No bond selected.',
          field: 'personality.bond',
          fixStepId: 4,
        })
      }
      if (!p.flaw) {
        results.push({
          severity: 'warning',
          message: 'No flaw selected.',
          field: 'personality.flaw',
          fixStepId: 4,
        })
      }
    }

    if (equipmentSelections.length === 0) {
      results.push({
        severity: 'warning',
        message: 'No equipment selected. Your character starts with nothing.',
        field: 'equipment',
        fixStepId: 5,
      })
    }

    // Positive info message when everything is valid
    const errorCount = results.filter((r) => r.severity === 'error').length
    if (errorCount === 0) {
      results.push({
        severity: 'info',
        message: 'Your character is complete and ready for adventure!',
        field: 'ready',
        fixStepId: null,
      })
    }

    return results
  }, [characterName, raceSelection, classSelection, abilityScores, backgroundSelection, equipmentSelections])

  const errorCount = messages.filter((m) => m.severity === 'error').length
  const warningCount = messages.filter((m) => m.severity === 'warning').length
  const hasErrors = errorCount > 0

  const [isExpanded, setIsExpanded] = useState(hasErrors)

  const handleFix = useCallback(
    (stepId: number) => {
      onNavigateToStep?.(stepId)
    },
    [onNavigateToStep],
  )

  // Group messages by severity
  const errors = messages.filter((m) => m.severity === 'error')
  const warnings = messages.filter((m) => m.severity === 'warning')
  const infos = messages.filter((m) => m.severity === 'info')

  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        hasErrors ? 'border-red-500/40 bg-red-500/5' : 'border-parchment/20 bg-bg-secondary/50',
      )}
      data-testid="validation-summary"
      role="region"
      aria-label="Validation Summary"
    >
      {/* Header / Toggle */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-3 text-left"
        aria-expanded={isExpanded}
        data-testid="validation-toggle"
      >
        <div className="flex items-center gap-3">
          {hasErrors ? (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
              {errorCount}
            </span>
          ) : (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
              ✓
            </span>
          )}
          <span className="text-sm text-parchment/80" data-testid="validation-count">
            {hasErrors
              ? `${errorCount} error${errorCount > 1 ? 's' : ''}${warningCount > 0 ? `, ${warningCount} warning${warningCount > 1 ? 's' : ''}` : ''}`
              : warningCount > 0
                ? `${warningCount} warning${warningCount > 1 ? 's' : ''}`
                : 'Your character is ready for adventure!'}
          </span>
        </div>
        <span
          className={cn(
            'text-parchment/40 text-sm transition-transform',
            isExpanded ? 'rotate-180' : '',
          )}
        >
          ▼
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2" data-testid="validation-details">
          {errors.map((msg, i) => (
            <ValidationMessageRow key={`error-${i}`} message={msg} onFix={handleFix} />
          ))}
          {warnings.map((msg, i) => (
            <ValidationMessageRow key={`warning-${i}`} message={msg} onFix={handleFix} />
          ))}
          {infos.map((msg, i) => (
            <ValidationMessageRow key={`info-${i}`} message={msg} onFix={handleFix} />
          ))}
        </div>
      )}
    </div>
  )
}

function ValidationMessageRow({
  message,
  onFix,
}: {
  message: ValidationMessage
  onFix: (stepId: number) => void
}) {
  const style = SEVERITY_STYLES[message.severity]

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border px-3 py-2',
        style.bg,
        style.border,
      )}
      data-testid={`validation-${message.severity}`}
    >
      <span
        className={cn(
          'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
          style.bg,
          style.text,
        )}
      >
        {style.icon}
      </span>
      <span className={cn('text-sm flex-1', style.text)}>{message.message}</span>
      {message.fixStepId !== null && (
        <button
          onClick={() => onFix(message.fixStepId!)}
          className="text-xs font-medium text-accent-gold hover:text-accent-gold/80 transition-colors px-2 py-1 rounded bg-accent-gold/10 hover:bg-accent-gold/20"
          data-testid="fix-button"
        >
          Fix
        </button>
      )}
    </div>
  )
}

/**
 * Hook for consuming just the validation state from the summary.
 * Useful for gating the save button.
 */
export function useValidationState() {
  const raceSelection = useWizardStore((s) => s.raceSelection)
  const classSelection = useWizardStore((s) => s.classSelection)
  const abilityScores = useWizardStore((s) => s.abilityScores)
  const backgroundSelection = useWizardStore((s) => s.backgroundSelection)

  return useMemo(() => {
    const errors: string[] = []

    if (!raceSelection || !raceSelection.raceId) {
      errors.push('Race selection is required.')
    }
    if (!classSelection || !classSelection.classId) {
      errors.push('Class selection is required.')
    }
    if (!abilityScores) {
      errors.push('Ability scores have not been set.')
    }
    if (!backgroundSelection || !backgroundSelection.backgroundId) {
      errors.push('Background selection is required.')
    }

    return {
      hasErrors: errors.length > 0,
      errorCount: errors.length,
      errors,
    }
  }, [raceSelection, classSelection, abilityScores, backgroundSelection])
}
