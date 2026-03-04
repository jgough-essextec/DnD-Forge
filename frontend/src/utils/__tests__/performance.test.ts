/**
 * Performance Utilities Tests (Story 42.4)
 *
 * Tests for measurement helpers and Web Vitals reporting.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  measurePerformance,
  measureSync,
  rateMetric,
  reportWebVitals,
  PerformanceMonitor,
  WEB_VITALS_THRESHOLDS,
} from '@/utils/performance'

describe('Performance Utilities', () => {
  // =========================================================================
  // measurePerformance
  // =========================================================================

  describe('measurePerformance', () => {
    it('should measure async function duration', async () => {
      const { result, measurement } = await measurePerformance(
        'test-async',
        async () => {
          return 42
        }
      )

      expect(result).toBe(42)
      expect(measurement.name).toBe('test-async')
      expect(measurement.duration).toBeGreaterThanOrEqual(0)
      expect(measurement.startTime).toBeLessThan(measurement.endTime)
    })

    it('should measure sync function duration', async () => {
      const { result, measurement } = await measurePerformance(
        'test-sync',
        () => 'hello'
      )

      expect(result).toBe('hello')
      expect(measurement.name).toBe('test-sync')
      expect(measurement.duration).toBeGreaterThanOrEqual(0)
    })

    it('should include start and end timestamps', async () => {
      const before = performance.now()
      const { measurement } = await measurePerformance('timing', () => null)
      const after = performance.now()

      expect(measurement.startTime).toBeGreaterThanOrEqual(before)
      expect(measurement.endTime).toBeLessThanOrEqual(after)
    })
  })

  // =========================================================================
  // measureSync
  // =========================================================================

  describe('measureSync', () => {
    it('should measure synchronous function and return result', () => {
      const { result, measurement } = measureSync('sync-test', () => {
        let sum = 0
        for (let i = 0; i < 1000; i++) sum += i
        return sum
      })

      expect(result).toBe(499500)
      expect(measurement.name).toBe('sync-test')
      expect(measurement.duration).toBeGreaterThanOrEqual(0)
    })

    it('should capture accurate start and end times', () => {
      const { measurement } = measureSync('timing', () => 'done')
      expect(measurement.endTime).toBeGreaterThanOrEqual(measurement.startTime)
      expect(measurement.duration).toBe(measurement.endTime - measurement.startTime)
    })
  })

  // =========================================================================
  // rateMetric
  // =========================================================================

  describe('rateMetric', () => {
    it('should rate FCP as good when below threshold', () => {
      expect(rateMetric('FCP', 1000)).toBe('good')
    })

    it('should rate FCP as needs-improvement when between thresholds', () => {
      expect(rateMetric('FCP', 2000)).toBe('needs-improvement')
    })

    it('should rate FCP as poor when above threshold', () => {
      expect(rateMetric('FCP', 5000)).toBe('poor')
    })

    it('should rate LCP correctly', () => {
      expect(rateMetric('LCP', 2000)).toBe('good')
      expect(rateMetric('LCP', 3000)).toBe('needs-improvement')
      expect(rateMetric('LCP', 5000)).toBe('poor')
    })

    it('should rate CLS correctly', () => {
      expect(rateMetric('CLS', 0.05)).toBe('good')
      expect(rateMetric('CLS', 0.15)).toBe('needs-improvement')
      expect(rateMetric('CLS', 0.3)).toBe('poor')
    })

    it('should rate INP correctly', () => {
      expect(rateMetric('INP', 100)).toBe('good')
      expect(rateMetric('INP', 300)).toBe('needs-improvement')
      expect(rateMetric('INP', 600)).toBe('poor')
    })

    it('should rate values exactly at the good threshold as good', () => {
      expect(rateMetric('FCP', WEB_VITALS_THRESHOLDS.FCP.good)).toBe('good')
    })

    it('should rate values exactly at the poor threshold as needs-improvement', () => {
      expect(rateMetric('FCP', WEB_VITALS_THRESHOLDS.FCP.poor)).toBe('needs-improvement')
    })
  })

  // =========================================================================
  // reportWebVitals
  // =========================================================================

  describe('reportWebVitals', () => {
    it('should return a cleanup function', () => {
      const callback = vi.fn()
      const cleanup = reportWebVitals(callback)
      expect(typeof cleanup).toBe('function')
      cleanup()
    })

    it('should handle environments without PerformanceObserver', () => {
      const originalPO = globalThis.PerformanceObserver
      // @ts-expect-error - intentionally removing for test
      delete globalThis.PerformanceObserver

      const callback = vi.fn()
      const cleanup = reportWebVitals(callback)
      expect(typeof cleanup).toBe('function')
      cleanup()

      globalThis.PerformanceObserver = originalPO
    })
  })

  // =========================================================================
  // PerformanceMonitor
  // =========================================================================

  describe('PerformanceMonitor', () => {
    let monitor: PerformanceMonitor

    beforeEach(() => {
      monitor = new PerformanceMonitor()
    })

    it('should record measurements', () => {
      monitor.record({
        name: 'test',
        duration: 10,
        startTime: 0,
        endTime: 10,
      })
      expect(monitor.getAll()).toHaveLength(1)
    })

    it('should measure a function and record the result', () => {
      const result = monitor.measure('add', () => 2 + 2)
      expect(result).toBe(4)
      expect(monitor.getAll()).toHaveLength(1)
      expect(monitor.getAll()[0].name).toBe('add')
    })

    it('should filter measurements by name', () => {
      monitor.record({ name: 'a', duration: 10, startTime: 0, endTime: 10 })
      monitor.record({ name: 'b', duration: 20, startTime: 10, endTime: 30 })
      monitor.record({ name: 'a', duration: 15, startTime: 30, endTime: 45 })

      expect(monitor.getByName('a')).toHaveLength(2)
      expect(monitor.getByName('b')).toHaveLength(1)
      expect(monitor.getByName('c')).toHaveLength(0)
    })

    it('should compute statistics for named measurements', () => {
      monitor.record({ name: 'op', duration: 10, startTime: 0, endTime: 10 })
      monitor.record({ name: 'op', duration: 20, startTime: 10, endTime: 30 })
      monitor.record({ name: 'op', duration: 30, startTime: 30, endTime: 60 })

      const stats = monitor.getStats('op')
      expect(stats).not.toBeNull()
      expect(stats!.count).toBe(3)
      expect(stats!.mean).toBe(20)
      expect(stats!.min).toBe(10)
      expect(stats!.max).toBe(30)
    })

    it('should return null stats for unknown names', () => {
      expect(monitor.getStats('unknown')).toBeNull()
    })

    it('should compute percentiles correctly', () => {
      // Add 100 measurements with durations 1-100
      for (let i = 1; i <= 100; i++) {
        monitor.record({ name: 'perf', duration: i, startTime: 0, endTime: i })
      }

      const stats = monitor.getStats('perf')
      expect(stats).not.toBeNull()
      expect(stats!.count).toBe(100)
      expect(stats!.p50).toBe(50)
      expect(stats!.p95).toBe(95)
      expect(stats!.p99).toBe(99)
    })

    it('should evict oldest entries when exceeding maxEntries', () => {
      const smallMonitor = new PerformanceMonitor(5)
      for (let i = 0; i < 10; i++) {
        smallMonitor.record({
          name: `entry-${i}`,
          duration: i,
          startTime: 0,
          endTime: i,
        })
      }
      // Should only keep the last 5
      const all = smallMonitor.getAll()
      expect(all.length).toBeLessThanOrEqual(5)
    })

    it('should clear all measurements', () => {
      monitor.record({ name: 'a', duration: 10, startTime: 0, endTime: 10 })
      monitor.record({ name: 'b', duration: 20, startTime: 10, endTime: 30 })
      monitor.clear()
      expect(monitor.getAll()).toHaveLength(0)
    })
  })
})
