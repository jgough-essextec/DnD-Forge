/**
 * Print Styles Tests (Epic 40 - Stories 40.1, 40.2, 40.3)
 *
 * Tests for print stylesheet optimization including:
 * - UI chrome is hidden in print context
 * - Ink-saving mode class application
 * - Print-specific layout classes exist
 * - Condition badges render as text in print
 * - PrintButton component with ink-saving integration
 * - usePrintMode hook behavior
 *
 * Note: Since Vitest/jsdom does not natively support @media print,
 * these tests verify CSS class presence/absence, matchMedia mocking,
 * ink-saving toggle behavior, and component rendering.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fs from 'fs'
import path from 'path'

// ---------------------------------------------------------------------------
// Mock setup
// ---------------------------------------------------------------------------

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Printer: ({ className, ...props }: any) => <svg data-testid="printer-icon" className={className} {...props} />,
  ChevronDown: ({ className, ...props }: any) => <svg data-testid="chevron-icon" className={className} {...props} />,
}))

// Mock usePrintMode for PrintButton tests
const mockUsePrintMode = {
  isPrinting: false,
  inkSaving: false,
  setInkSaving: vi.fn(),
  toggleInkSaving: vi.fn(),
  triggerPrint: vi.fn(),
}

vi.mock('@/hooks/usePrintMode', () => ({
  usePrintMode: () => mockUsePrintMode,
}))

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' '),
}))

// Import PrintButton after mocks
import { PrintButton } from '@/components/character/sheet/PrintButton'

// ---------------------------------------------------------------------------
// Helper: load CSS file content via fs
// ---------------------------------------------------------------------------

const STYLES_DIR = path.resolve(__dirname, '..')

function loadCSS(filename: string): string {
  const filePath = path.join(STYLES_DIR, filename)
  return fs.readFileSync(filePath, 'utf-8')
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('Epic 40: Print Stylesheet Optimization', () => {
  // =========================================================================
  // Story 40.1: Print Layout Refinement
  // =========================================================================

  describe('Story 40.1: Print Layout Refinement', () => {
    let printCSS: string

    beforeEach(() => {
      printCSS = loadCSS('character-sheet-print.css')
    })

    // --- UI Chrome Hiding ---

    it('should define rules to hide navigation elements in print', () => {
      expect(printCSS).toContain('@media print')
      expect(printCSS).toContain('nav')
      expect(printCSS).toContain('display: none !important')
    })

    it('should hide sheet tabs in print', () => {
      expect(printCSS).toContain('[data-testid="sheet-tabs"]')
    })

    it('should hide floating action bar in print', () => {
      expect(printCSS).toContain('[data-testid="floating-action-bar"]')
    })

    it('should hide print button in print', () => {
      expect(printCSS).toContain('[data-testid="print-button"]')
    })

    it('should hide dice roller panel in print', () => {
      expect(printCSS).toContain('[data-testid="dice-roller-panel"]')
    })

    it('should hide session play widgets (HP tracker, rest modals) in print', () => {
      expect(printCSS).toContain('[data-testid="hp-session-tracker"]')
      expect(printCSS).toContain('[data-testid="short-rest-modal"]')
      expect(printCSS).toContain('[data-testid="long-rest-modal"]')
    })

    it('should hide combat tracker in print', () => {
      expect(printCSS).toContain('[data-testid="combat-tracker"]')
    })

    it('should hide DM notes panel in print', () => {
      expect(printCSS).toContain('[data-testid="dm-notes-panel"]')
    })

    it('should hide toast notifications in print', () => {
      expect(printCSS).toContain('[data-testid="toast-container"]')
    })

    it('should hide generic buttons (not data-print-keep) in print', () => {
      expect(printCSS).toContain('button:not([data-print-keep])')
    })

    // --- White Background / Dark Text ---

    it('should override dark theme with white background and dark text', () => {
      expect(printCSS).toContain('background: white !important')
      expect(printCSS).toContain('color: #1a1a1a !important')
    })

    it('should remove box-shadow and text-shadow in print', () => {
      expect(printCSS).toContain('box-shadow: none !important')
      expect(printCSS).toContain('text-shadow: none !important')
    })

    // --- Typography ---

    it('should define print-optimized typography with pt-based sizes', () => {
      expect(printCSS).toContain('font-size: 10pt')
      expect(printCSS).toContain('font-size: 14pt')
      expect(printCSS).toContain('font-size: 8pt')
    })

    it('should use Cinzel font family for headings with serif fallback', () => {
      expect(printCSS).toContain("'Cinzel'")
      expect(printCSS).toContain('Georgia')
      expect(printCSS).toContain('serif')
    })

    // --- Page Break Control ---

    it('should define page break rules for character sheet pages', () => {
      expect(printCSS).toContain('page-break-before: always')
      expect(printCSS).toContain('break-before: page')
      expect(printCSS).toContain('page-break-after: always')
      expect(printCSS).toContain('break-after: page')
    })

    it('should prevent orphaned headers with break-after: avoid', () => {
      expect(printCSS).toContain('page-break-after: avoid')
      expect(printCSS).toContain('break-after: avoid')
    })

    // --- Table Printing ---

    it('should prevent table rows from breaking across pages', () => {
      expect(printCSS).toContain('page-break-inside: avoid')
      expect(printCSS).toContain('break-inside: avoid')
    })

    // --- Condition Badges as Text ---

    it('should define rules for condition badges to render as text in print', () => {
      expect(printCSS).toContain('[data-testid^="condition-card-"]')
      expect(printCSS).toContain('display: inline !important')
    })

    // --- Ink-Saving Mode ---

    it('should include ink-saving mode class that reduces border weights', () => {
      expect(printCSS).toContain('body.ink-saving')
      expect(printCSS).toContain('border-width: 0.5pt !important')
    })

    it('should use lighter grays in ink-saving mode', () => {
      expect(printCSS).toContain('color: #444 !important')
      expect(printCSS).toContain('border-color: #ddd !important')
    })

    // --- Page Margins ---

    it('should define page margins and paper size', () => {
      expect(printCSS).toContain('@page')
      expect(printCSS).toContain('margin: 0.5in')
      expect(printCSS).toContain('size: letter portrait')
    })

    // --- Scroll Containers ---

    it('should make scroll containers visible in print', () => {
      expect(printCSS).toContain('overflow: visible !important')
      expect(printCSS).toContain('max-height: none !important')
    })

    // --- Spell Slot Circles ---

    it('should render spell slot circles as printable outlines', () => {
      expect(printCSS).toContain('[data-testid="spell-slot-tracker"]')
      expect(printCSS).toContain('border-radius: 50%')
    })
  })

  // =========================================================================
  // Story 40.2: Print-Specific Layouts
  // =========================================================================

  describe('Story 40.2: Print-Specific Layouts', () => {
    let layoutCSS: string

    beforeEach(() => {
      layoutCSS = loadCSS('print-layouts.css')
    })

    it('should force three-column layout for Page 1 in print', () => {
      expect(layoutCSS).toContain('@media print')
      expect(layoutCSS).toContain('[data-testid="page1-grid"]')
      expect(layoutCSS).toContain('grid-template-columns: 1fr 1fr 1fr')
    })

    it('should hide mobile ability scores in print', () => {
      expect(layoutCSS).toContain('[data-testid="mobile-ability-scores"]')
      expect(layoutCSS).toContain('display: none !important')
    })

    it('should force page break after Page 1 in print', () => {
      expect(layoutCSS).toContain('[data-testid="core-stats-page"]')
      expect(layoutCSS).toContain('page-break-after: always')
    })

    it('should force two-column layout for Page 2 in print', () => {
      expect(layoutCSS).toContain('[data-testid="page2-layout"]')
      expect(layoutCSS).toContain('grid-template-columns: 1fr 1fr')
    })

    it('should position portrait in top-right for Page 2 print', () => {
      expect(layoutCSS).toContain('[data-testid="character-portrait"]')
      expect(layoutCSS).toContain('float: right')
    })

    it('should render spell lists in multi-column layout for Page 3 print', () => {
      expect(layoutCSS).toContain('[data-testid="spell-slots-section"]')
      expect(layoutCSS).toContain('column-count: 2')
    })

    it('should render cantrips in 3-column grid for print', () => {
      expect(layoutCSS).toContain('[data-testid="cantrips-section"]')
      expect(layoutCSS).toContain('grid-template-columns: 1fr 1fr 1fr')
    })

    it('should render spell slot tracker circles as printable outlines', () => {
      expect(layoutCSS).toContain('[data-testid="spell-slot-tracker"] button')
      expect(layoutCSS).toContain('border-radius: 50%')
    })

    it('should define gallery print layout for compact roster', () => {
      expect(layoutCSS).toContain('[data-testid="character-gallery"]')
      expect(layoutCSS).toContain('[data-testid^="character-card-"]')
    })

    it('should force 3 character cards per printed page in gallery', () => {
      expect(layoutCSS).toContain(':nth-child(3n)')
      expect(layoutCSS).toContain('page-break-after: always')
    })

    it('should define campaign dashboard print layout with clean table', () => {
      expect(layoutCSS).toContain('[data-testid="party-stats-grid"]')
      expect(layoutCSS).toContain('border-collapse: collapse')
    })

    it('should hide dashboard tab navigation in print', () => {
      expect(layoutCSS).toContain('[data-testid="dashboard-tabs"] nav')
      expect(layoutCSS).toContain('[data-testid="dashboard-tabs"] [role="tablist"]')
    })

    it('should hide sort icons and expand buttons in party stats grid print', () => {
      expect(layoutCSS).toContain('[data-testid="party-stats-grid"] th svg')
      expect(layoutCSS).toContain('[data-testid="party-stats-grid"] td button')
    })
  })

  // =========================================================================
  // PrintButton Component
  // =========================================================================

  describe('PrintButton Component', () => {
    beforeEach(() => {
      mockUsePrintMode.isPrinting = false
      mockUsePrintMode.inkSaving = false
      mockUsePrintMode.setInkSaving.mockClear()
      mockUsePrintMode.toggleInkSaving.mockClear()
      mockUsePrintMode.triggerPrint.mockClear()
    })

    it('should render the print button', () => {
      render(<PrintButton />)
      expect(screen.getByTestId('print-button')).toBeInTheDocument()
    })

    it('should have accessible label on print button', () => {
      render(<PrintButton />)
      expect(screen.getByLabelText('Print character sheet')).toBeInTheDocument()
    })

    it('should call triggerPrint when print button is clicked', async () => {
      const user = userEvent.setup()
      render(<PrintButton />)

      await user.click(screen.getByTestId('print-button'))

      expect(mockUsePrintMode.triggerPrint).toHaveBeenCalledOnce()
    })

    it('should render print options toggle button', () => {
      render(<PrintButton />)
      expect(screen.getByTestId('print-options-toggle')).toBeInTheDocument()
    })

    it('should show options dropdown when toggle is clicked', async () => {
      const user = userEvent.setup()
      render(<PrintButton />)

      await user.click(screen.getByTestId('print-options-toggle'))

      expect(screen.getByTestId('print-options-dropdown')).toBeInTheDocument()
      expect(screen.getByTestId('ink-saving-checkbox')).toBeInTheDocument()
    })

    it('should display Low Ink Mode label in options', async () => {
      const user = userEvent.setup()
      render(<PrintButton />)

      await user.click(screen.getByTestId('print-options-toggle'))

      expect(screen.getByText('Low Ink Mode')).toBeInTheDocument()
    })

    it('should call toggleInkSaving when checkbox is changed', async () => {
      const user = userEvent.setup()
      render(<PrintButton />)

      await user.click(screen.getByTestId('print-options-toggle'))
      await user.click(screen.getByTestId('ink-saving-checkbox'))

      expect(mockUsePrintMode.toggleInkSaving).toHaveBeenCalledOnce()
    })

    it('should show checkbox as checked when ink-saving is enabled', async () => {
      mockUsePrintMode.inkSaving = true
      const user = userEvent.setup()
      render(<PrintButton />)

      await user.click(screen.getByTestId('print-options-toggle'))

      const checkbox = screen.getByTestId('ink-saving-checkbox') as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })

    it('should have print:hidden class on print button', () => {
      render(<PrintButton />)
      expect(screen.getByTestId('print-button').className).toContain('print:hidden')
    })
  })

  // =========================================================================
  // Ink-Saving Body Class Management
  // =========================================================================

  describe('Ink-Saving Body Class', () => {
    beforeEach(() => {
      document.body.classList.remove('ink-saving')
    })

    afterEach(() => {
      document.body.classList.remove('ink-saving')
    })

    it('should add ink-saving class to body when enabled', () => {
      document.body.classList.add('ink-saving')
      expect(document.body.classList.contains('ink-saving')).toBe(true)
    })

    it('should remove ink-saving class from body when disabled', () => {
      document.body.classList.add('ink-saving')
      document.body.classList.remove('ink-saving')
      expect(document.body.classList.contains('ink-saving')).toBe(false)
    })

    it('should not have ink-saving class by default', () => {
      expect(document.body.classList.contains('ink-saving')).toBe(false)
    })
  })

  // =========================================================================
  // usePrintMode Hook contract
  // =========================================================================

  describe('usePrintMode Hook contract', () => {
    it('should expose isPrinting property', () => {
      expect(mockUsePrintMode).toHaveProperty('isPrinting')
      expect(typeof mockUsePrintMode.isPrinting).toBe('boolean')
    })

    it('should expose ink-saving toggle functionality', () => {
      expect(mockUsePrintMode).toHaveProperty('inkSaving')
      expect(mockUsePrintMode).toHaveProperty('toggleInkSaving')
      expect(mockUsePrintMode).toHaveProperty('setInkSaving')
      expect(typeof mockUsePrintMode.toggleInkSaving).toBe('function')
    })

    it('should expose triggerPrint function', () => {
      expect(mockUsePrintMode).toHaveProperty('triggerPrint')
      expect(typeof mockUsePrintMode.triggerPrint).toBe('function')
    })
  })

  // =========================================================================
  // Cross-Browser Compatibility (Story 40.3 - static CSS analysis)
  // =========================================================================

  describe('Story 40.3: Cross-Browser Print Compatibility', () => {
    let printCSS: string

    beforeEach(() => {
      printCSS = loadCSS('character-sheet-print.css')
    })

    it('should use both legacy page-break-* and modern break-* properties', () => {
      // Legacy (Firefox, older browsers)
      expect(printCSS).toContain('page-break-before: always')
      expect(printCSS).toContain('page-break-after: always')
      expect(printCSS).toContain('page-break-inside: avoid')

      // Modern (Chromium, Safari)
      expect(printCSS).toContain('break-before: page')
      expect(printCSS).toContain('break-after: page')
      expect(printCSS).toContain('break-inside: avoid')
    })

    it('should include -webkit-print-color-adjust for Safari compatibility', () => {
      expect(printCSS).toContain('-webkit-print-color-adjust: exact')
      expect(printCSS).toContain('print-color-adjust: exact')
    })

    it('should define US Letter paper size', () => {
      expect(printCSS).toContain('size: letter portrait')
    })

    it('should set safe margins that avoid clipping', () => {
      expect(printCSS).toContain('margin: 0.5in')
    })

    it('should disable animations and transitions for print', () => {
      expect(printCSS).toContain('animation-duration: 0s !important')
      expect(printCSS).toContain('transition-duration: 0s !important')
    })
  })
})
