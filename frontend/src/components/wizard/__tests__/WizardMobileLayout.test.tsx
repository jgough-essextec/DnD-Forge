/**
 * Wizard Mobile Layout Tests (Story 44.1)
 *
 * Verifies that the creation wizard renders correctly on mobile:
 * - Horizontal progress bar (not sidebar) on mobile
 * - Sticky Back/Next buttons at bottom
 * - Desktop sidebar is hidden on mobile
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WizardProgress } from '@/components/wizard/WizardProgress'
import { WizardNavigation } from '@/components/wizard/WizardNavigation'

// Mock the wizard store
vi.mock('@/stores/wizardStore', () => ({
  useWizardStore: vi.fn((selector) => {
    const state = {
      currentStep: 1,
      setStep: vi.fn(),
      classSelection: null,
    }
    return selector(state)
  }),
}))

describe('Wizard — Mobile Layout (Story 44.1)', () => {
  describe('WizardProgress', () => {
    it('renders desktop sidebar with hidden md:flex classes', () => {
      render(<WizardProgress />)

      // Two nav elements: desktop + mobile
      const navs = screen.getAllByRole('navigation', { name: 'Wizard progress' })
      expect(navs.length).toBe(2)

      const desktopNav = navs[0]
      // Desktop sidebar should be hidden on mobile
      expect(desktopNav.className).toContain('hidden')
      expect(desktopNav.className).toContain('md:flex')
    })

    it('renders mobile horizontal bar with flex md:hidden classes', () => {
      render(<WizardProgress />)

      const navs = screen.getAllByRole('navigation', { name: 'Wizard progress' })
      const mobileNav = navs[1]

      // Mobile bar should be visible on mobile
      expect(mobileNav.className).toContain('flex')
      expect(mobileNav.className).toContain('md:hidden')
    })

    it('mobile bar has horizontal overflow scroll', () => {
      render(<WizardProgress />)

      const navs = screen.getAllByRole('navigation', { name: 'Wizard progress' })
      const mobileNav = navs[1]

      expect(mobileNav.className).toContain('overflow-x-auto')
    })
  })

  describe('WizardNavigation', () => {
    it('renders with fixed bottom positioning for mobile', () => {
      render(
        <WizardNavigation validation={{ valid: true, errors: [] }} />,
      )

      // The navigation wrapper should be fixed at bottom on mobile
      const navWrapper = screen.getByLabelText('Go to previous step').closest('div')!.parentElement
      expect(navWrapper).toBeTruthy()
      expect(navWrapper!.className).toContain('fixed')
      expect(navWrapper!.className).toContain('bottom-0')
    })

    it('renders with relative positioning on desktop via sm: classes', () => {
      render(
        <WizardNavigation validation={{ valid: true, errors: [] }} />,
      )

      const navWrapper = screen.getByLabelText('Go to previous step').closest('div')!.parentElement
      expect(navWrapper).toBeTruthy()
      expect(navWrapper!.className).toContain('sm:relative')
    })
  })
})
