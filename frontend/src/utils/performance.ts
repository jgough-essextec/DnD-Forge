/**
 * Performance Utilities (Story 42.4)
 *
 * Helpers for measuring and reporting performance metrics:
 * - measurePerformance: timing wrapper for critical operations
 * - reportWebVitals: Web Vitals reporting utility
 * - PerformanceMonitor: aggregate performance tracking
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PerformanceMeasurement {
  /** Name / label for the measurement */
  name: string
  /** Duration in milliseconds */
  duration: number
  /** Start timestamp (performance.now) */
  startTime: number
  /** End timestamp (performance.now) */
  endTime: number
}

export interface WebVitalsMetric {
  /** Metric name (FCP, LCP, CLS, INP, TTFB) */
  name: string
  /** Metric value */
  value: number
  /** Rating: good, needs-improvement, poor */
  rating: 'good' | 'needs-improvement' | 'poor'
}

export type WebVitalsCallback = (metric: WebVitalsMetric) => void

// ---------------------------------------------------------------------------
// Performance thresholds (from Core Web Vitals)
// ---------------------------------------------------------------------------

export const WEB_VITALS_THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 },
} as const

// ---------------------------------------------------------------------------
// measurePerformance
// ---------------------------------------------------------------------------

/**
 * Measure the execution time of a synchronous or asynchronous operation.
 *
 * @param name - Label for the measurement
 * @param fn - The function to measure
 * @returns The result of the function plus the measurement data
 *
 * @example
 * const { result, measurement } = await measurePerformance('computeStats', () => {
 *   return computeDerivedStats(character)
 * })
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<{ result: T; measurement: PerformanceMeasurement }> {
  const startTime = performance.now()
  const result = await fn()
  const endTime = performance.now()
  const duration = endTime - startTime

  const measurement: PerformanceMeasurement = {
    name,
    duration,
    startTime,
    endTime,
  }

  return { result, measurement }
}

/**
 * Measure the execution time of a synchronous operation.
 * Useful when you don't want to deal with promises.
 */
export function measureSync<T>(
  name: string,
  fn: () => T
): { result: T; measurement: PerformanceMeasurement } {
  const startTime = performance.now()
  const result = fn()
  const endTime = performance.now()
  const duration = endTime - startTime

  const measurement: PerformanceMeasurement = {
    name,
    duration,
    startTime,
    endTime,
  }

  return { result, measurement }
}

// ---------------------------------------------------------------------------
// rateMetric
// ---------------------------------------------------------------------------

/**
 * Rate a Web Vitals metric value against thresholds.
 */
export function rateMetric(
  name: keyof typeof WEB_VITALS_THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name]
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

// ---------------------------------------------------------------------------
// reportWebVitals
// ---------------------------------------------------------------------------

/**
 * Report Web Vitals using the Performance Observer API.
 * Listens for paint, layout-shift, and interaction entries.
 *
 * @param callback - Called with each metric as it becomes available
 * @returns Cleanup function to disconnect observers
 */
export function reportWebVitals(callback: WebVitalsCallback): () => void {
  const observers: PerformanceObserver[] = []

  if (typeof PerformanceObserver === 'undefined') {
    return () => {}
  }

  // FCP (First Contentful Paint)
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          callback({
            name: 'FCP',
            value: entry.startTime,
            rating: rateMetric('FCP', entry.startTime),
          })
        }
      }
    })
    fcpObserver.observe({ type: 'paint', buffered: true })
    observers.push(fcpObserver)
  } catch {
    // Observer not supported
  }

  // LCP (Largest Contentful Paint)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        callback({
          name: 'LCP',
          value: lastEntry.startTime,
          rating: rateMetric('LCP', lastEntry.startTime),
        })
      }
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
    observers.push(lcpObserver)
  } catch {
    // Observer not supported
  }

  // CLS (Cumulative Layout Shift)
  try {
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as PerformanceEntry & {
          hadRecentInput?: boolean
          value?: number
        }
        if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
          clsValue += layoutShiftEntry.value
          callback({
            name: 'CLS',
            value: clsValue,
            rating: rateMetric('CLS', clsValue),
          })
        }
      }
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })
    observers.push(clsObserver)
  } catch {
    // Observer not supported
  }

  return () => {
    for (const observer of observers) {
      observer.disconnect()
    }
  }
}

// ---------------------------------------------------------------------------
// PerformanceMonitor
// ---------------------------------------------------------------------------

/**
 * Aggregate performance monitor that collects measurements over time.
 * Useful for tracking performance across multiple operations.
 */
export class PerformanceMonitor {
  private measurements: PerformanceMeasurement[] = []
  private maxEntries: number

  constructor(maxEntries = 1000) {
    this.maxEntries = maxEntries
  }

  /**
   * Record a measurement.
   */
  record(measurement: PerformanceMeasurement): void {
    this.measurements.push(measurement)
    if (this.measurements.length > this.maxEntries) {
      this.measurements = this.measurements.slice(-this.maxEntries)
    }
  }

  /**
   * Measure a function and record the result.
   */
  measure<T>(name: string, fn: () => T): T {
    const { result, measurement } = measureSync(name, fn)
    this.record(measurement)
    return result
  }

  /**
   * Get all recorded measurements.
   */
  getAll(): readonly PerformanceMeasurement[] {
    return this.measurements
  }

  /**
   * Get measurements filtered by name.
   */
  getByName(name: string): PerformanceMeasurement[] {
    return this.measurements.filter((m) => m.name === name)
  }

  /**
   * Get statistics for measurements with a given name.
   */
  getStats(name: string): {
    count: number
    mean: number
    min: number
    max: number
    p50: number
    p95: number
    p99: number
  } | null {
    const entries = this.getByName(name)
    if (entries.length === 0) return null

    const durations = entries.map((e) => e.duration).sort((a, b) => a - b)
    const count = durations.length
    const mean = durations.reduce((sum, d) => sum + d, 0) / count
    const min = durations[0]
    const max = durations[count - 1]

    const percentile = (p: number) => {
      const idx = Math.ceil((p / 100) * count) - 1
      return durations[Math.max(0, idx)]
    }

    return {
      count,
      mean,
      min,
      max,
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
    }
  }

  /**
   * Clear all recorded measurements.
   */
  clear(): void {
    this.measurements = []
  }
}
