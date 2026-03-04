/**
 * Browser Compatibility Tests (Epic 45, Story 45.1)
 *
 * Tests for feature detection functions, CSS property support checks,
 * browser detection, compatibility reporting, and polyfill recommendations.
 */

import { describe, it, expect } from 'vitest'
import {
  hasCryptoGetRandomValues,
  hasResizeObserver,
  hasIntersectionObserver,
  hasStructuredClone,
  hasClipboardAPI,
  hasFetchAPI,
  hasAbortController,
  hasURLAPI,
  supportsCSSProperty,
  supportsBackdropFilter,
  supportsFlexGap,
  supportsContainerQueries,
  supportsHasSelector,
  supportsCSSNesting,
  supportsCSSCustomProperties,
  detectBrowser,
  getCompatibilityReport,
  getPolyfillRecommendations,
} from '@/utils/browserCompat'
import type { BrowserInfo, CompatibilityReport, PolyfillRecommendation } from '@/utils/browserCompat'

// ---------------------------------------------------------------------------
// Feature Detection Tests
// ---------------------------------------------------------------------------

describe('Feature Detection: Critical APIs', () => {
  it('detects crypto.getRandomValues availability', () => {
    const result = hasCryptoGetRandomValues()
    // jsdom should have crypto available
    expect(typeof result).toBe('boolean')
    expect(result).toBe(true)
  })

  it('detects Fetch API availability', () => {
    const result = hasFetchAPI()
    expect(typeof result).toBe('boolean')
    expect(result).toBe(true)
  })

  it('detects AbortController availability', () => {
    const result = hasAbortController()
    expect(typeof result).toBe('boolean')
    expect(result).toBe(true)
  })

  it('detects structuredClone availability', () => {
    const result = hasStructuredClone()
    expect(typeof result).toBe('boolean')
    expect(result).toBe(true)
  })

  it('detects URL API availability', () => {
    const result = hasURLAPI()
    expect(typeof result).toBe('boolean')
    expect(result).toBe(true)
  })
})

describe('Feature Detection: Observer APIs', () => {
  it('detects ResizeObserver availability', () => {
    const result = hasResizeObserver()
    expect(typeof result).toBe('boolean')
  })

  it('detects IntersectionObserver availability', () => {
    const result = hasIntersectionObserver()
    expect(typeof result).toBe('boolean')
  })
})

describe('Feature Detection: Clipboard API', () => {
  it('returns a boolean for clipboard availability', () => {
    const result = hasClipboardAPI()
    expect(typeof result).toBe('boolean')
  })
})

// ---------------------------------------------------------------------------
// CSS Feature Detection Tests
// ---------------------------------------------------------------------------

describe('CSS Feature Detection', () => {
  it('supportsCSSProperty returns boolean for known properties', () => {
    // display is universally supported
    const result = supportsCSSProperty('display', 'flex')
    expect(typeof result).toBe('boolean')
  })

  it('supportsCSSProperty returns boolean for unknown properties', () => {
    const result = supportsCSSProperty('nonexistent-property-xyz', 'value')
    expect(result).toBe(false)
  })

  it('supportsBackdropFilter returns boolean', () => {
    const result = supportsBackdropFilter()
    expect(typeof result).toBe('boolean')
  })

  it('supportsFlexGap returns boolean', () => {
    const result = supportsFlexGap()
    expect(typeof result).toBe('boolean')
  })

  it('supportsContainerQueries returns boolean', () => {
    const result = supportsContainerQueries()
    expect(typeof result).toBe('boolean')
  })

  it('supportsHasSelector returns boolean', () => {
    const result = supportsHasSelector()
    expect(typeof result).toBe('boolean')
  })

  it('supportsCSSNesting returns boolean', () => {
    const result = supportsCSSNesting()
    expect(typeof result).toBe('boolean')
  })

  it('supportsCSSCustomProperties returns boolean', () => {
    const result = supportsCSSCustomProperties()
    expect(typeof result).toBe('boolean')
  })
})

// ---------------------------------------------------------------------------
// Browser Detection Tests
// ---------------------------------------------------------------------------

describe('Browser Detection', () => {
  it('detects Chrome from user agent string', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    const info: BrowserInfo = detectBrowser(ua)
    expect(info.name).toBe('Chrome')
    expect(info.version).toBe('120.0.0.0')
    expect(info.engine).toBe('Blink')
    expect(info.isMobile).toBe(false)
    expect(info.isSupported).toBe(true)
  })

  it('detects Firefox from user agent string', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
    const info = detectBrowser(ua)
    expect(info.name).toBe('Firefox')
    expect(info.version).toBe('120.0')
    expect(info.engine).toBe('Gecko')
    expect(info.isMobile).toBe(false)
    expect(info.isSupported).toBe(true)
  })

  it('detects Safari from user agent string', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
    const info = detectBrowser(ua)
    expect(info.name).toBe('Safari')
    expect(info.version).toBe('17.1')
    expect(info.engine).toBe('WebKit')
    expect(info.isMobile).toBe(false)
    expect(info.isSupported).toBe(true)
  })

  it('detects Edge from user agent string', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    const info = detectBrowser(ua)
    expect(info.name).toBe('Edge')
    expect(info.version).toBe('120.0.0.0')
    expect(info.engine).toBe('Blink')
    expect(info.isMobile).toBe(false)
    expect(info.isSupported).toBe(true)
  })

  it('detects mobile Chrome on Android', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    const info = detectBrowser(ua)
    expect(info.name).toBe('Chrome')
    expect(info.isMobile).toBe(true)
    expect(info.isSupported).toBe(true)
  })

  it('detects iOS Safari', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
    const info = detectBrowser(ua)
    expect(info.name).toBe('Safari')
    expect(info.isMobile).toBe(true)
    expect(info.isSupported).toBe(true)
  })

  it('marks old Chrome as unsupported', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.0.0 Safari/537.36'
    const info = detectBrowser(ua)
    expect(info.name).toBe('Chrome')
    expect(info.isSupported).toBe(false)
  })

  it('marks old Safari as unsupported', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15'
    const info = detectBrowser(ua)
    expect(info.name).toBe('Safari')
    expect(info.isSupported).toBe(false)
  })

  it('returns Unknown for unrecognized user agents', () => {
    const info = detectBrowser('SomeRandomBot/1.0')
    expect(info.name).toBe('Unknown')
    expect(info.isSupported).toBe(false)
  })

  it('handles empty user agent string', () => {
    const info = detectBrowser('')
    expect(info.name).toBe('Unknown')
    expect(info.version).toBe('unknown')
  })
})

// ---------------------------------------------------------------------------
// Compatibility Report Tests
// ---------------------------------------------------------------------------

describe('Compatibility Report', () => {
  it('returns a complete report with all fields', () => {
    const report: CompatibilityReport = getCompatibilityReport()
    expect(report).toHaveProperty('cryptoRandom')
    expect(report).toHaveProperty('resizeObserver')
    expect(report).toHaveProperty('intersectionObserver')
    expect(report).toHaveProperty('structuredClone')
    expect(report).toHaveProperty('clipboardAPI')
    expect(report).toHaveProperty('fetchAPI')
    expect(report).toHaveProperty('abortController')
    expect(report).toHaveProperty('urlAPI')
    expect(report).toHaveProperty('backdropFilter')
    expect(report).toHaveProperty('flexGap')
    expect(report).toHaveProperty('containerQueries')
    expect(report).toHaveProperty('hasSelector')
    expect(report).toHaveProperty('cssNesting')
    expect(report).toHaveProperty('cssCustomProperties')
    expect(report).toHaveProperty('browser')
    expect(report).toHaveProperty('allCriticalSupported')
  })

  it('all report values are booleans except browser', () => {
    const report = getCompatibilityReport()
    const booleanKeys = [
      'cryptoRandom',
      'resizeObserver',
      'intersectionObserver',
      'structuredClone',
      'clipboardAPI',
      'fetchAPI',
      'abortController',
      'urlAPI',
      'backdropFilter',
      'flexGap',
      'containerQueries',
      'hasSelector',
      'cssNesting',
      'cssCustomProperties',
      'allCriticalSupported',
    ] as const

    for (const key of booleanKeys) {
      expect(typeof report[key]).toBe('boolean')
    }
  })

  it('browser info has the correct shape', () => {
    const report = getCompatibilityReport()
    expect(report.browser).toHaveProperty('name')
    expect(report.browser).toHaveProperty('version')
    expect(report.browser).toHaveProperty('engine')
    expect(report.browser).toHaveProperty('isMobile')
    expect(report.browser).toHaveProperty('isSupported')
  })

  it('accepts a custom user agent for browser detection', () => {
    const report = getCompatibilityReport(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    )
    expect(report.browser.name).toBe('Chrome')
    expect(report.browser.version).toBe('120.0.0.0')
  })

  it('allCriticalSupported is true when crypto, fetch, and structuredClone are all available', () => {
    const report = getCompatibilityReport()
    // In jsdom all three should be available
    if (report.cryptoRandom && report.fetchAPI && report.structuredClone) {
      expect(report.allCriticalSupported).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// Polyfill Recommendations Tests
// ---------------------------------------------------------------------------

describe('Polyfill Recommendations', () => {
  it('returns an array of recommendations', () => {
    const recs: PolyfillRecommendation[] = getPolyfillRecommendations()
    expect(Array.isArray(recs)).toBe(true)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('each recommendation has the correct shape', () => {
    const recs = getPolyfillRecommendations()
    for (const rec of recs) {
      expect(rec).toHaveProperty('feature')
      expect(rec).toHaveProperty('available')
      expect(rec).toHaveProperty('recommendation')
      expect(rec).toHaveProperty('priority')
      expect(typeof rec.feature).toBe('string')
      expect(typeof rec.available).toBe('boolean')
      expect(typeof rec.recommendation).toBe('string')
      expect(['critical', 'recommended', 'optional']).toContain(rec.priority)
    }
  })

  it('includes critical features (crypto and fetch)', () => {
    const recs = getPolyfillRecommendations()
    const critical = recs.filter((r) => r.priority === 'critical')
    expect(critical.length).toBeGreaterThanOrEqual(2)
    const features = critical.map((r) => r.feature)
    expect(features).toContain('crypto.getRandomValues')
    expect(features).toContain('Fetch API')
  })

  it('includes recommended features', () => {
    const recs = getPolyfillRecommendations()
    const recommended = recs.filter((r) => r.priority === 'recommended')
    expect(recommended.length).toBeGreaterThanOrEqual(2)
  })

  it('includes optional features', () => {
    const recs = getPolyfillRecommendations()
    const optional = recs.filter((r) => r.priority === 'optional')
    expect(optional.length).toBeGreaterThanOrEqual(1)
  })
})
