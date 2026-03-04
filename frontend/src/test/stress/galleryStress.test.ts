/**
 * Gallery Stress Tests (Story 42.5)
 *
 * Tests that verify gallery performance with 100+ characters:
 * - Rendering time
 * - Filter responsiveness
 * - Sort performance
 * - Memory efficiency
 */

import { describe, it, expect } from 'vitest'
import {
  generateMockCharacters,
} from './characterGenerator'
import {
  filterCharacters,
  sortCharacters,
} from '@/utils/gallery'
import type { GalleryFilters, SortOption } from '@/utils/gallery'

describe('Gallery Stress Tests', () => {
  // Generate test data once
  const characters100 = generateMockCharacters(100)
  const characters500 = generateMockCharacters(500)
  const characters1000 = generateMockCharacters(1000)

  // =========================================================================
  // Filtering performance
  // =========================================================================

  describe('filter performance', () => {
    it('should filter 100+ characters by name within 10ms', () => {
      const filters: GalleryFilters = {
        search: 'Gandalf',
        classes: [],
        races: [],
        levelRanges: [],
        showArchived: false,
      }

      const start = performance.now()
      const result = filterCharacters(characters100, filters)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(10)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should filter 500 characters by name within 20ms', () => {
      const filters: GalleryFilters = {
        search: 'the Brave',
        classes: [],
        races: [],
        levelRanges: [],
        showArchived: false,
      }

      const start = performance.now()
      filterCharacters(characters500, filters)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(20)
    })

    it('should filter 100+ characters by class within 10ms', () => {
      const filters: GalleryFilters = {
        search: '',
        classes: ['Fighter'],
        races: [],
        levelRanges: [],
        showArchived: false,
      }

      const start = performance.now()
      const result = filterCharacters(characters100, filters)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(10)
      expect(result.length).toBeLessThanOrEqual(100)
    })

    it('should filter 100+ characters by level range within 10ms', () => {
      const filters: GalleryFilters = {
        search: '',
        classes: [],
        races: [],
        levelRanges: ['1-4'],
        showArchived: false,
      }

      const start = performance.now()
      const result = filterCharacters(characters100, filters)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(10)
      for (const char of result) {
        expect(char.level).toBeGreaterThanOrEqual(1)
        expect(char.level).toBeLessThanOrEqual(4)
      }
    })

    it('should apply combined filters on 100+ characters within 15ms', () => {
      const filters: GalleryFilters = {
        search: 'a',
        classes: ['Fighter', 'Wizard'],
        races: ['Human', 'Elf'],
        levelRanges: ['5-10', '11-16'],
        showArchived: false,
      }

      const start = performance.now()
      filterCharacters(characters100, filters)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(15)
    })
  })

  // =========================================================================
  // Sorting performance
  // =========================================================================

  describe('sort performance', () => {
    const sortOptions: SortOption[] = [
      'lastEdited',
      'nameAZ',
      'nameZA',
      'levelHighLow',
      'levelLowHigh',
      'createdNewest',
      'createdOldest',
    ]

    for (const option of sortOptions) {
      it(`should sort 100+ characters by ${option} within 50ms`, () => {
        const start = performance.now()
        const sorted = sortCharacters(characters100, option)
        const duration = performance.now() - start

        expect(duration).toBeLessThan(50)
        expect(sorted).toHaveLength(100)
      })
    }

    it('should sort 1000 characters by name within 50ms', () => {
      const start = performance.now()
      const sorted = sortCharacters(characters1000, 'nameAZ')
      const duration = performance.now() - start

      expect(duration).toBeLessThan(50)
      expect(sorted).toHaveLength(1000)

      // Verify sorted
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].name.localeCompare(sorted[i + 1].name)).toBeLessThanOrEqual(0)
      }
    })
  })

  // =========================================================================
  // Memory efficiency
  // =========================================================================

  describe('memory efficiency', () => {
    it('should not duplicate character objects during filter', () => {
      const filters: GalleryFilters = {
        search: '',
        classes: [],
        races: [],
        levelRanges: [],
        showArchived: true,
      }

      const result = filterCharacters(characters100, filters)

      // Filtered result should reference the same objects
      for (const char of result) {
        const original = characters100.find((c) => c.id === char.id)
        expect(char).toBe(original)
      }
    })

    it('should create new array during sort without mutating original', () => {
      const originalFirst = characters100[0]
      const sorted = sortCharacters(characters100, 'nameAZ')

      // Should be a new array
      expect(sorted).not.toBe(characters100)
      // Original should be unchanged
      expect(characters100[0]).toBe(originalFirst)
    })
  })

  // =========================================================================
  // Combined filter + sort
  // =========================================================================

  describe('filter + sort combined', () => {
    it('should filter and sort 100+ characters within 20ms', () => {
      const filters: GalleryFilters = {
        search: 'a',
        classes: [],
        races: [],
        levelRanges: [],
        showArchived: false,
      }

      const start = performance.now()
      const filtered = filterCharacters(characters100, filters)
      const sorted = sortCharacters(filtered, 'levelHighLow')
      const duration = performance.now() - start

      expect(duration).toBeLessThan(20)
      expect(sorted.length).toBeLessThanOrEqual(100)
    })
  })
})
