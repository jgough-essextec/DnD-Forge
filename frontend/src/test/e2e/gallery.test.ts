/**
 * E2E Integration Test: Gallery Flow (Epic 45, Story 45.2)
 *
 * Tests the character gallery functionality:
 * - Loading gallery with multiple characters from API
 * - Search/filter by name, class, race, level range
 * - Sorting by various criteria
 * - Delete with API call verification
 */

import { describe, it, expect } from 'vitest'
import {
  filterCharacters,
  sortCharacters,
  duplicateCharacterName,
  formatRelativeTime,
  getClassCounts,
  getRaceCounts,
  DEFAULT_FILTERS,
} from '@/utils/gallery'
import type { GalleryCharacter, GalleryFilters } from '@/utils/gallery'

const BASE_URL = 'http://localhost:8000/api'

// ---------------------------------------------------------------------------
// Mock gallery data
// ---------------------------------------------------------------------------

const mockGallery: GalleryCharacter[] = [
  {
    id: 'char-001',
    name: 'Thorn Ironforge',
    race: 'Dwarf',
    class: 'Fighter',
    level: 5,
    hp: { current: 44, max: 52 },
    ac: 18,
    updatedAt: '2026-03-01T12:00:00Z',
    createdAt: '2026-01-15T10:00:00Z',
    isArchived: false,
  },
  {
    id: 'char-002',
    name: 'Elara Nightwhisper',
    race: 'Elf',
    class: 'Wizard',
    level: 3,
    hp: { current: 18, max: 18 },
    ac: 12,
    updatedAt: '2026-03-02T08:00:00Z',
    createdAt: '2026-02-01T09:00:00Z',
    isArchived: false,
  },
  {
    id: 'char-003',
    name: 'Bran Oakheart',
    race: 'Human',
    class: 'Cleric',
    level: 8,
    hp: { current: 64, max: 64 },
    ac: 16,
    updatedAt: '2026-02-28T15:00:00Z',
    createdAt: '2025-12-01T11:00:00Z',
    isArchived: false,
  },
  {
    id: 'char-004',
    name: 'Kira Shadowstep',
    race: 'Halfling',
    class: 'Rogue',
    level: 12,
    hp: { current: 78, max: 78 },
    ac: 15,
    updatedAt: '2026-03-03T10:00:00Z',
    createdAt: '2025-11-20T14:00:00Z',
    isArchived: false,
  },
  {
    id: 'char-005',
    name: 'Archived Hero',
    race: 'Human',
    class: 'Barbarian',
    level: 1,
    hp: { current: 12, max: 12 },
    ac: 14,
    updatedAt: '2025-06-01T00:00:00Z',
    createdAt: '2025-06-01T00:00:00Z',
    isArchived: true,
  },
]

// ---------------------------------------------------------------------------
// Load Gallery from API
// ---------------------------------------------------------------------------

describe('Gallery: Load Characters from API', () => {
  it('fetches character list from API', async () => {
    const response = await fetch(`${BASE_URL}/characters/`)
    expect(response.ok).toBe(true)

    const characters = await response.json()
    expect(Array.isArray(characters)).toBe(true)
    expect(characters.length).toBeGreaterThan(0)
  })

  it('each character has required gallery fields', async () => {
    const response = await fetch(`${BASE_URL}/characters/`)
    const characters = await response.json()

    for (const char of characters) {
      expect(char).toHaveProperty('id')
      expect(char).toHaveProperty('name')
      expect(char).toHaveProperty('race')
      expect(char).toHaveProperty('class')
      expect(char).toHaveProperty('level')
      expect(char).toHaveProperty('hp')
      expect(char).toHaveProperty('ac')
    }
  })
})

// ---------------------------------------------------------------------------
// Search and Filter
// ---------------------------------------------------------------------------

describe('Gallery: Search by Name', () => {
  it('filters by name substring (case-insensitive)', () => {
    const filters: GalleryFilters = { ...DEFAULT_FILTERS, search: 'thorn' }
    const results = filterCharacters(mockGallery, filters)
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Thorn Ironforge')
  })

  it('empty search returns all non-archived characters', () => {
    const filters: GalleryFilters = { ...DEFAULT_FILTERS, search: '' }
    const results = filterCharacters(mockGallery, filters)
    expect(results).toHaveLength(4) // 5 total - 1 archived
  })

  it('no match returns empty array', () => {
    const filters: GalleryFilters = { ...DEFAULT_FILTERS, search: 'nonexistent' }
    const results = filterCharacters(mockGallery, filters)
    expect(results).toHaveLength(0)
  })
})

describe('Gallery: Filter by Class', () => {
  it('filters by single class', () => {
    const filters: GalleryFilters = { ...DEFAULT_FILTERS, classes: ['Fighter'] }
    const results = filterCharacters(mockGallery, filters)
    expect(results).toHaveLength(1)
    expect(results[0].class).toBe('Fighter')
  })

  it('filters by multiple classes (OR logic)', () => {
    const filters: GalleryFilters = { ...DEFAULT_FILTERS, classes: ['Fighter', 'Wizard'] }
    const results = filterCharacters(mockGallery, filters)
    expect(results).toHaveLength(2)
  })
})

describe('Gallery: Filter by Race', () => {
  it('filters by race', () => {
    const filters: GalleryFilters = { ...DEFAULT_FILTERS, races: ['Elf'] }
    const results = filterCharacters(mockGallery, filters)
    expect(results).toHaveLength(1)
    expect(results[0].race).toBe('Elf')
  })

  it('filters by multiple races', () => {
    const filters: GalleryFilters = { ...DEFAULT_FILTERS, races: ['Human', 'Dwarf'] }
    const results = filterCharacters(mockGallery, filters)
    expect(results).toHaveLength(2)
  })
})

describe('Gallery: Filter by Level Range', () => {
  it('filters by tier 1 (levels 1-4)', () => {
    const filters: GalleryFilters = { ...DEFAULT_FILTERS, levelRanges: ['1-4'] }
    const results = filterCharacters(mockGallery, filters)
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Elara Nightwhisper')
  })

  it('filters by tier 2 (levels 5-10)', () => {
    const filters: GalleryFilters = { ...DEFAULT_FILTERS, levelRanges: ['5-10'] }
    const results = filterCharacters(mockGallery, filters)
    expect(results).toHaveLength(2) // Level 5 and Level 8
  })

  it('filters by multiple tiers', () => {
    const filters: GalleryFilters = { ...DEFAULT_FILTERS, levelRanges: ['1-4', '11-16'] }
    const results = filterCharacters(mockGallery, filters)
    expect(results).toHaveLength(2) // Level 3 and Level 12
  })
})

describe('Gallery: Archived Characters', () => {
  it('hides archived characters by default', () => {
    const results = filterCharacters(mockGallery, DEFAULT_FILTERS)
    expect(results.every((c) => !c.isArchived)).toBe(true)
  })

  it('shows archived characters when showArchived is true', () => {
    const filters: GalleryFilters = { ...DEFAULT_FILTERS, showArchived: true }
    const results = filterCharacters(mockGallery, filters)
    expect(results).toHaveLength(5)
  })
})

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

describe('Gallery: Sorting', () => {
  it('sorts by name A-Z', () => {
    const sorted = sortCharacters(mockGallery, 'nameAZ')
    expect(sorted[0].name).toBe('Archived Hero')
    expect(sorted[sorted.length - 1].name).toBe('Thorn Ironforge')
  })

  it('sorts by name Z-A', () => {
    const sorted = sortCharacters(mockGallery, 'nameZA')
    expect(sorted[0].name).toBe('Thorn Ironforge')
  })

  it('sorts by level high to low', () => {
    const sorted = sortCharacters(mockGallery, 'levelHighLow')
    expect(sorted[0].level).toBe(12)
    expect(sorted[sorted.length - 1].level).toBe(1)
  })

  it('sorts by level low to high', () => {
    const sorted = sortCharacters(mockGallery, 'levelLowHigh')
    expect(sorted[0].level).toBe(1)
    expect(sorted[sorted.length - 1].level).toBe(12)
  })

  it('sorts by last edited (most recent first)', () => {
    const sorted = sortCharacters(mockGallery, 'lastEdited')
    expect(sorted[0].name).toBe('Kira Shadowstep') // March 3
  })

  it('sorts by date created (newest first)', () => {
    const sorted = sortCharacters(mockGallery, 'createdNewest')
    expect(sorted[0].name).toBe('Elara Nightwhisper') // Feb 1
  })
})

// ---------------------------------------------------------------------------
// Delete Character
// ---------------------------------------------------------------------------

describe('Gallery: Delete Character', () => {
  it('deletes a character via API', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/`, {
      method: 'DELETE',
    })
    expect(response.status).toBe(204)
  })

  it('returns 404 for non-existent character delete', async () => {
    const response = await fetch(`${BASE_URL}/characters/nonexistent/`, {
      method: 'DELETE',
    })
    expect(response.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

describe('Gallery: Utility Functions', () => {
  it('duplicateCharacterName appends (Copy)', () => {
    expect(duplicateCharacterName('Gandalf')).toBe('Gandalf (Copy)')
  })

  it('duplicateCharacterName increments copy counter', () => {
    expect(duplicateCharacterName('Gandalf (Copy)')).toBe('Gandalf (Copy 2)')
    expect(duplicateCharacterName('Gandalf (Copy 2)')).toBe('Gandalf (Copy 3)')
  })

  it('formatRelativeTime formats correctly', () => {
    const now = new Date('2026-03-04T12:00:00Z')
    expect(formatRelativeTime('2026-03-04T11:59:30Z', now)).toBe('Just now')
    expect(formatRelativeTime('2026-03-04T11:00:00Z', now)).toBe('1 hour ago')
    expect(formatRelativeTime('2026-03-03T12:00:00Z', now)).toBe('Yesterday')
  })

  it('getClassCounts returns class counts', () => {
    const counts = getClassCounts(mockGallery)
    expect(counts.length).toBeGreaterThan(0)
    const fighterCount = counts.find((c) => c.value === 'Fighter')
    expect(fighterCount?.label).toContain('Fighter')
  })

  it('getRaceCounts returns race counts', () => {
    const counts = getRaceCounts(mockGallery)
    expect(counts.length).toBeGreaterThan(0)
  })
})
