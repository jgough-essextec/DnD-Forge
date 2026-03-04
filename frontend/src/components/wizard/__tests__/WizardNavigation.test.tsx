import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { WizardNavigation } from '@/components/wizard/WizardNavigation'
import { useWizardStore } from '@/stores/wizardStore'

describe('WizardNavigation', () => {
  beforeEach(() => {
    useWizardStore.getState().reset()
  })

  it('disables Back button on step 0', () => {
    useWizardStore.getState().setStep(0)
    renderWithProviders(
      <WizardNavigation validation={{ valid: true, errors: [] }} />
    )
    const backButton = screen.getByLabelText('Go to previous step')
    expect(backButton).toBeDisabled()
  })

  it('enables Back button on steps after 0', () => {
    useWizardStore.getState().setStep(2)
    renderWithProviders(
      <WizardNavigation validation={{ valid: true, errors: [] }} />
    )
    const backButton = screen.getByLabelText('Go to previous step')
    expect(backButton).not.toBeDisabled()
  })

  it('shows Next button on non-final steps', () => {
    useWizardStore.getState().setStep(3)
    renderWithProviders(
      <WizardNavigation validation={{ valid: true, errors: [] }} />
    )
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('shows Save Character on the final step', () => {
    useWizardStore.getState().setStep(7)
    renderWithProviders(
      <WizardNavigation validation={{ valid: true, errors: [] }} />
    )
    expect(screen.getByText('Save Character')).toBeInTheDocument()
  })

  it('disables Next button when validation fails', () => {
    useWizardStore.getState().setStep(3)
    renderWithProviders(
      <WizardNavigation
        validation={{ valid: false, errors: ['Please select a race'] }}
      />
    )
    const nextButton = screen.getByLabelText('Go to next step')
    expect(nextButton).toBeDisabled()
  })
})
