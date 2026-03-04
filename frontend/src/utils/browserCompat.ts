/**
 * Browser Compatibility Utilities (Epic 45, Story 45.1)
 *
 * Feature detection functions for key Web APIs used by D&D Character Forge.
 * Provides runtime checks for:
 *   - crypto.getRandomValues (dice engine)
 *   - ResizeObserver (responsive layouts)
 *   - IntersectionObserver (lazy loading, scroll tracking)
 *   - CSS features (backdrop-filter, gap, container queries, :has(), nesting)
 *   - structuredClone (deep copy for state management)
 *
 * Also includes a browser detection utility for documenting known issues,
 * and polyfill/fallback recommendations for unsupported environments.
 */

// ---------------------------------------------------------------------------
// Feature Detection
// ---------------------------------------------------------------------------

/**
 * Check if crypto.getRandomValues is available.
 * Required by the dice engine for cryptographically secure randomness.
 */
export function hasCryptoGetRandomValues(): boolean {
  try {
    return (
      typeof crypto !== 'undefined' &&
      typeof crypto.getRandomValues === 'function'
    )
  } catch {
    return false
  }
}

/**
 * Check if ResizeObserver is available.
 * Used for responsive component layouts and resize tracking.
 */
export function hasResizeObserver(): boolean {
  return typeof ResizeObserver !== 'undefined'
}

/**
 * Check if IntersectionObserver is available.
 * Used for lazy loading images and scroll-based triggers.
 */
export function hasIntersectionObserver(): boolean {
  return typeof IntersectionObserver !== 'undefined'
}

/**
 * Check if structuredClone is available.
 * Used by level-up and other state management for deep copies.
 */
export function hasStructuredClone(): boolean {
  return typeof structuredClone === 'function'
}

/**
 * Check if the Clipboard API is available.
 * Used for copy-to-clipboard features (share links, export data).
 */
export function hasClipboardAPI(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard !== 'undefined' &&
    typeof navigator.clipboard.writeText === 'function'
  )
}

/**
 * Check if the Fetch API is available.
 * Required for all API communication.
 */
export function hasFetchAPI(): boolean {
  return typeof fetch === 'function'
}

/**
 * Check if AbortController is available.
 * Used for request cancellation in React Query.
 */
export function hasAbortController(): boolean {
  return typeof AbortController !== 'undefined'
}

/**
 * Check if the URL API is available.
 * Used for URL parsing and construction.
 */
export function hasURLAPI(): boolean {
  try {
    new URL('https://example.com')
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// CSS Feature Detection
// ---------------------------------------------------------------------------

/**
 * Check if the browser supports a given CSS property (and optionally a value).
 * Uses CSS.supports() when available, falls back to element-based detection.
 */
export function supportsCSSProperty(
  property: string,
  value?: string,
): boolean {
  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
    if (value !== undefined) {
      return CSS.supports(property, value)
    }
    return CSS.supports(property)
  }
  // Fallback: create a temporary element and test the property
  if (typeof document !== 'undefined') {
    const el = document.createElement('div')
    const camelCase = property.replace(/-([a-z])/g, (_, c: string) =>
      c.toUpperCase(),
    )
    if (camelCase in el.style) {
      if (value !== undefined) {
        el.style.setProperty(property, value)
        return el.style.getPropertyValue(property) !== ''
      }
      return true
    }
  }
  return false
}

/**
 * Check if CSS backdrop-filter is supported.
 * Used for modal backdrop blur effects. Safari required -webkit- prefix
 * historically but modern Safari supports unprefixed.
 */
export function supportsBackdropFilter(): boolean {
  return (
    supportsCSSProperty('backdrop-filter', 'blur(10px)') ||
    supportsCSSProperty('-webkit-backdrop-filter', 'blur(10px)')
  )
}

/**
 * Check if CSS gap in flexbox is supported.
 * Safari 14.0 had partial support; Safari 14.1+ supports it fully.
 */
export function supportsFlexGap(): boolean {
  return supportsCSSProperty('gap', '1px')
}

/**
 * Check if CSS container queries are supported.
 */
export function supportsContainerQueries(): boolean {
  return supportsCSSProperty('container-type', 'inline-size')
}

/**
 * Check if CSS :has() selector is supported.
 */
export function supportsHasSelector(): boolean {
  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
    try {
      return CSS.supports('selector(:has(*))') || CSS.supports(':has(*)')
    } catch {
      return false
    }
  }
  return false
}

/**
 * Check if CSS nesting is natively supported.
 */
export function supportsCSSNesting(): boolean {
  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
    try {
      return CSS.supports('selector(&)')
    } catch {
      return false
    }
  }
  return false
}

/**
 * Check if CSS custom properties (variables) are supported.
 */
export function supportsCSSCustomProperties(): boolean {
  return supportsCSSProperty('--test-var', '1')
}

// ---------------------------------------------------------------------------
// Browser Detection (for documentation, not feature gating)
// ---------------------------------------------------------------------------

export interface BrowserInfo {
  name: string
  version: string
  engine: string
  isMobile: boolean
  isSupported: boolean
}

/**
 * Detect the current browser from the user agent string.
 * This should only be used for logging/documentation purposes,
 * never for feature gating (use feature detection instead).
 */
export function detectBrowser(
  userAgent?: string,
): BrowserInfo {
  const ua = userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua)

  // Order matters: check more specific strings first
  if (/Edg\//i.test(ua)) {
    const match = ua.match(/Edg\/([\d.]+)/)
    return {
      name: 'Edge',
      version: match?.[1] ?? 'unknown',
      engine: 'Blink',
      isMobile,
      isSupported: isVersionAtLeast(match?.[1], 90),
    }
  }

  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) {
    const match = ua.match(/Chrome\/([\d.]+)/)
    return {
      name: 'Chrome',
      version: match?.[1] ?? 'unknown',
      engine: 'Blink',
      isMobile,
      isSupported: isVersionAtLeast(match?.[1], 90),
    }
  }

  if (/Firefox\//i.test(ua)) {
    const match = ua.match(/Firefox\/([\d.]+)/)
    return {
      name: 'Firefox',
      version: match?.[1] ?? 'unknown',
      engine: 'Gecko',
      isMobile,
      isSupported: isVersionAtLeast(match?.[1], 90),
    }
  }

  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    const match = ua.match(/Version\/([\d.]+)/)
    return {
      name: 'Safari',
      version: match?.[1] ?? 'unknown',
      engine: 'WebKit',
      isMobile: isMobile || /iPad|iPhone|iPod/i.test(ua),
      isSupported: isVersionAtLeast(match?.[1], 15),
    }
  }

  return {
    name: 'Unknown',
    version: 'unknown',
    engine: 'unknown',
    isMobile,
    isSupported: false,
  }
}

// ---------------------------------------------------------------------------
// Compatibility Report
// ---------------------------------------------------------------------------

export interface CompatibilityReport {
  cryptoRandom: boolean
  resizeObserver: boolean
  intersectionObserver: boolean
  structuredClone: boolean
  clipboardAPI: boolean
  fetchAPI: boolean
  abortController: boolean
  urlAPI: boolean
  backdropFilter: boolean
  flexGap: boolean
  containerQueries: boolean
  hasSelector: boolean
  cssNesting: boolean
  cssCustomProperties: boolean
  browser: BrowserInfo
  allCriticalSupported: boolean
}

/**
 * Run all compatibility checks and return a full report.
 * Critical APIs are: crypto.getRandomValues, fetch, structuredClone.
 */
export function getCompatibilityReport(
  userAgent?: string,
): CompatibilityReport {
  const cryptoRandom = hasCryptoGetRandomValues()
  const fetchAPI = hasFetchAPI()
  const structuredCloneSupported = hasStructuredClone()

  const report: CompatibilityReport = {
    cryptoRandom,
    resizeObserver: hasResizeObserver(),
    intersectionObserver: hasIntersectionObserver(),
    structuredClone: structuredCloneSupported,
    clipboardAPI: hasClipboardAPI(),
    fetchAPI,
    abortController: hasAbortController(),
    urlAPI: hasURLAPI(),
    backdropFilter: supportsBackdropFilter(),
    flexGap: supportsFlexGap(),
    containerQueries: supportsContainerQueries(),
    hasSelector: supportsHasSelector(),
    cssNesting: supportsCSSNesting(),
    cssCustomProperties: supportsCSSCustomProperties(),
    browser: detectBrowser(userAgent),
    allCriticalSupported: cryptoRandom && fetchAPI && structuredCloneSupported,
  }

  return report
}

// ---------------------------------------------------------------------------
// Polyfill / Fallback Recommendations
// ---------------------------------------------------------------------------

export interface PolyfillRecommendation {
  feature: string
  available: boolean
  recommendation: string
  priority: 'critical' | 'recommended' | 'optional'
}

/**
 * Generate polyfill/fallback recommendations based on the current environment.
 */
export function getPolyfillRecommendations(): PolyfillRecommendation[] {
  return [
    {
      feature: 'crypto.getRandomValues',
      available: hasCryptoGetRandomValues(),
      recommendation:
        'Required for dice rolling. No polyfill available -- use Math.random() as a degraded fallback only.',
      priority: 'critical',
    },
    {
      feature: 'ResizeObserver',
      available: hasResizeObserver(),
      recommendation:
        'Install resize-observer-polyfill for older browsers.',
      priority: 'recommended',
    },
    {
      feature: 'IntersectionObserver',
      available: hasIntersectionObserver(),
      recommendation:
        'Install intersection-observer polyfill for older browsers.',
      priority: 'recommended',
    },
    {
      feature: 'structuredClone',
      available: hasStructuredClone(),
      recommendation:
        'Use JSON.parse(JSON.stringify(obj)) as fallback for deep cloning.',
      priority: 'recommended',
    },
    {
      feature: 'Clipboard API',
      available: hasClipboardAPI(),
      recommendation:
        'Fall back to document.execCommand("copy") for older browsers.',
      priority: 'optional',
    },
    {
      feature: 'Fetch API',
      available: hasFetchAPI(),
      recommendation:
        'Install whatwg-fetch polyfill. App uses axios which provides its own transport, so this is optional.',
      priority: 'critical',
    },
    {
      feature: 'AbortController',
      available: hasAbortController(),
      recommendation:
        'Install abortcontroller-polyfill for request cancellation in older browsers.',
      priority: 'recommended',
    },
    {
      feature: 'CSS backdrop-filter',
      available: supportsBackdropFilter(),
      recommendation:
        'Add a solid-color fallback background for modals. Safari may need -webkit-backdrop-filter.',
      priority: 'optional',
    },
  ]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compare a version string to a minimum version number.
 */
function isVersionAtLeast(version: string | undefined, minMajor: number): boolean {
  if (!version) return false
  const major = parseInt(version.split('.')[0], 10)
  return !isNaN(major) && major >= minMajor
}
