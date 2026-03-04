/**
 * PrintButton (Story 24.4)
 *
 * Button to print the character sheet using window.print().
 * Shown in the sheet header. Hidden in print media.
 */

import { Printer } from 'lucide-react'

export function PrintButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <button
      onClick={handlePrint}
      className="ml-auto flex items-center gap-2 rounded-lg border border-parchment/20 px-3 py-2 text-sm text-parchment/70 transition-colors hover:border-accent-gold/30 hover:text-parchment min-h-[44px] touch-manipulation print:hidden"
      aria-label="Print character sheet"
      data-testid="print-button"
    >
      <Printer className="h-4 w-4" />
      <span className="hidden sm:inline">Print Sheet</span>
    </button>
  )
}
