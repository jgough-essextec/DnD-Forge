// =============================================================================
// Story 41.2 -- Accessibility Utilities
// Screen reader announcer and accessibility helper functions.
// =============================================================================

type AnnouncePriority = 'polite' | 'assertive'

const ANNOUNCER_ID = 'sr-announcer'
const ASSERTIVE_ID = 'sr-announcer-assertive'

/**
 * Ensure the singleton live region elements exist in the DOM.
 * Creates two visually-hidden elements: one polite and one assertive.
 */
function ensureLiveRegions(): { polite: HTMLElement; assertive: HTMLElement } {
  let polite = document.getElementById(ANNOUNCER_ID)
  let assertive = document.getElementById(ASSERTIVE_ID)

  if (!polite) {
    polite = document.createElement('div')
    polite.id = ANNOUNCER_ID
    polite.setAttribute('role', 'status')
    polite.setAttribute('aria-live', 'polite')
    polite.setAttribute('aria-atomic', 'true')
    Object.assign(polite.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    })
    document.body.appendChild(polite)
  }

  if (!assertive) {
    assertive = document.createElement('div')
    assertive.id = ASSERTIVE_ID
    assertive.setAttribute('role', 'alert')
    assertive.setAttribute('aria-live', 'assertive')
    assertive.setAttribute('aria-atomic', 'true')
    Object.assign(assertive.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    })
    document.body.appendChild(assertive)
  }

  return { polite, assertive }
}

/**
 * Announce a message to screen readers via an aria-live region.
 *
 * @param message - The text to announce
 * @param priority - 'polite' (default) or 'assertive'
 */
export function announce(
  message: string,
  priority: AnnouncePriority = 'polite'
): void {
  const regions = ensureLiveRegions()
  const target = priority === 'assertive' ? regions.assertive : regions.polite

  // Clear and re-set to ensure screen readers pick up the change
  target.textContent = ''

  // Use requestAnimationFrame to ensure the clear is processed first
  requestAnimationFrame(() => {
    target.textContent = message
  })
}

/**
 * Remove the live region elements from the DOM.
 * Useful for cleanup in tests.
 */
export function cleanupLiveRegions(): void {
  const polite = document.getElementById(ANNOUNCER_ID)
  const assertive = document.getElementById(ASSERTIVE_ID)
  polite?.remove()
  assertive?.remove()
}

/**
 * Calculate the contrast ratio between two colors.
 * Colors should be provided as hex strings (e.g., '#1a1a2e').
 *
 * @returns The contrast ratio (e.g., 11.2)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1)
  const lum2 = getRelativeLuminance(hex2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Calculate relative luminance of a hex color per WCAG 2.1.
 */
function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  const [r, g, b] = rgb.map((c) => {
    const sRGB = c / 255
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Convert a hex color string to RGB array.
 */
function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '')
  return [
    parseInt(cleaned.substring(0, 2), 16),
    parseInt(cleaned.substring(2, 4), 16),
    parseInt(cleaned.substring(4, 6), 16),
  ]
}

/**
 * Check if a contrast ratio meets WCAG 2.1 AA requirements.
 *
 * @param ratio - The contrast ratio
 * @param isLargeText - Whether the text is large (>= 18pt or >= 14pt bold)
 * @returns true if the ratio meets AA requirements
 */
export function meetsContrastAA(
  ratio: number,
  isLargeText: boolean = false
): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5
}
