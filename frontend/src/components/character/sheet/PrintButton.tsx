/**
 * PrintButton (Story 24.4, Epic 40)
 *
 * Button to print the character sheet using window.print().
 * Includes ink-saving mode toggle that applies the .ink-saving class
 * to the document body during print for reduced ink usage.
 *
 * Shown in the sheet header. Hidden in print media.
 */

import { useState } from 'react'
import { Printer, ChevronDown } from 'lucide-react'
import { usePrintMode } from '@/hooks/usePrintMode'
import { cn } from '@/lib/utils'

export function PrintButton() {
  const [showOptions, setShowOptions] = useState(false)
  const { inkSaving, toggleInkSaving, triggerPrint } = usePrintMode()

  const handlePrint = () => {
    setShowOptions(false)
    triggerPrint()
  }

  return (
    <div className="relative ml-auto" data-testid="print-button-container">
      <div className="flex items-center">
        {/* Main print button */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-l-lg border border-parchment/20 px-3 py-2 text-sm text-parchment/70 transition-colors hover:border-accent-gold/30 hover:text-parchment min-h-[44px] touch-manipulation print:hidden"
          aria-label="Print character sheet"
          data-testid="print-button"
        >
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Print Sheet</span>
        </button>

        {/* Options dropdown toggle */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center rounded-r-lg border border-l-0 border-parchment/20 px-2 py-2 text-sm text-parchment/70 transition-colors hover:border-accent-gold/30 hover:text-parchment min-h-[44px] touch-manipulation print:hidden"
          aria-label="Print options"
          aria-expanded={showOptions}
          data-testid="print-options-toggle"
        >
          <ChevronDown className={cn('h-4 w-4 transition-transform', showOptions && 'rotate-180')} />
        </button>
      </div>

      {/* Print options dropdown */}
      {showOptions && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-parchment/20 bg-bg-secondary p-3 shadow-lg print:hidden"
          data-testid="print-options-dropdown"
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inkSaving}
              onChange={toggleInkSaving}
              className="h-4 w-4 rounded border-parchment/30 accent-accent-gold"
              data-testid="ink-saving-checkbox"
            />
            <span className="text-sm text-parchment/80">Low Ink Mode</span>
          </label>
          <p className="mt-1 text-xs text-parchment/50">
            Reduces borders and decorative elements for ink-efficient printing.
          </p>
        </div>
      )}
    </div>
  )
}
