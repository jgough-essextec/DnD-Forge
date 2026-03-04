/**
 * ReviewStep - Main Step 7 container for the Review & Finalize wizard step.
 *
 * Accepts WizardStepProps. Reads all wizard state and computes derived stats
 * using the calculation engine via useReviewData. Layout:
 * - InlineNameEdit at top
 * - ValidationSummary
 * - Tabbed 3-page preview (Core Stats / Backstory / Spellcasting)
 * - SaveActions at bottom
 *
 * Spellcasting tab hidden for non-casters.
 * Reports validation via onValidationChange (valid when no errors).
 */

import { useState, useCallback, useEffect } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { cn } from '@/lib/utils'
import type { WizardStepProps } from '@/components/wizard/types'
import { getPrevStep } from '@/components/wizard/wizardSteps'
import { useReviewData } from './useReviewData'
import { useValidationState } from './ValidationSummary'
import { InlineNameEdit } from './InlineNameEdit'
import { ValidationSummary } from './ValidationSummary'
import { CharacterPreviewPage1 } from './CharacterPreviewPage1'
import { CharacterPreviewPage2 } from './CharacterPreviewPage2'
import { CharacterPreviewPage3 } from './CharacterPreviewPage3'
import { SaveActions } from './SaveActions'
import { QuickEditModal } from './QuickEditModal'

type PreviewTab = 'core' | 'backstory' | 'spellcasting'

export function ReviewStep({ onValidationChange }: WizardStepProps) {
  const data = useReviewData()
  const { hasErrors, errors } = useValidationState()
  const setStep = useWizardStore((s) => s.setStep)
  const classSelection = useWizardStore((s) => s.classSelection)

  const [activeTab, setActiveTab] = useState<PreviewTab>('core')
  const [editingStepId, setEditingStepId] = useState<number | null>(null)

  // Report validation to parent wizard
  useEffect(() => {
    onValidationChange?.({
      valid: !hasErrors,
      errors,
    })
  }, [hasErrors, errors, onValidationChange])

  const handleNavigateToStep = useCallback(
    (stepId: number) => {
      setStep(stepId)
    },
    [setStep],
  )

  const handleEditSection = useCallback((stepId: number) => {
    setEditingStepId(stepId)
  }, [])

  const handleCloseModal = useCallback(() => {
    setEditingStepId(null)
  }, [])

  const handleGoBack = useCallback(() => {
    const prevStep = getPrevStep(7, classSelection?.classId ?? null)
    setStep(prevStep)
  }, [setStep, classSelection])

  const tabs: Array<{ id: PreviewTab; label: string; visible: boolean }> = [
    { id: 'core', label: 'Core Stats', visible: true },
    { id: 'backstory', label: 'Backstory & Details', visible: true },
    { id: 'spellcasting', label: 'Spellcasting', visible: data.isCaster },
  ]

  const visibleTabs = tabs.filter((t) => t.visible)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6" data-testid="review-step">
      {/* Header with inline name edit */}
      <div className="flex items-center gap-4" data-testid="review-header">
        <InlineNameEdit />
      </div>

      {/* Validation Summary */}
      <ValidationSummary onNavigateToStep={handleNavigateToStep} />

      {/* Tab Navigation */}
      <div className="flex border-b border-parchment/20" role="tablist" data-testid="preview-tabs">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-accent-gold text-accent-gold'
                : 'border-transparent text-parchment/50 hover:text-parchment/70 hover:border-parchment/20',
            )}
            data-testid={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div data-testid="preview-content">
        {activeTab === 'core' && (
          <CharacterPreviewPage1 data={data} onEditSection={handleEditSection} />
        )}
        {activeTab === 'backstory' && (
          <CharacterPreviewPage2 data={data} onEditSection={handleEditSection} />
        )}
        {activeTab === 'spellcasting' && data.isCaster && (
          <CharacterPreviewPage3 data={data} onEditSection={handleEditSection} />
        )}
      </div>

      {/* Save Actions */}
      <SaveActions data={data} onGoBack={handleGoBack} />

      {/* Quick Edit Modal */}
      {editingStepId !== null && (
        <QuickEditModal stepId={editingStepId} onClose={handleCloseModal} />
      )}
    </div>
  )
}
