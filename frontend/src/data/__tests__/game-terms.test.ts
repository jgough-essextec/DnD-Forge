// =============================================================================
// Tests for Game Terms Dictionary
// =============================================================================

import { describe, it, expect } from 'vitest'
import { GAME_TERMS, getGameTerm, searchGameTerms } from '@/data/game-terms'

describe('Game Terms Dictionary', () => {
  it('contains approximately 50 terms', () => {
    const count = Object.keys(GAME_TERMS).length
    expect(count).toBeGreaterThanOrEqual(48)
    expect(count).toBeLessThanOrEqual(55)
  })

  it('getGameTerm returns the correct term by id', () => {
    const term = getGameTerm('proficiency-bonus')
    expect(term).toBeDefined()
    expect(term!.term).toBe('Proficiency Bonus')
    expect(term!.definition).toContain('bonus')
    expect(term!.category).toBe('general')
  })

  it('getGameTerm returns undefined for an unknown id', () => {
    const term = getGameTerm('nonexistent-term')
    expect(term).toBeUndefined()
  })

  it('searchGameTerms filters terms by query', () => {
    const results = searchGameTerms('saving throw')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((r) => r.term === 'Saving Throw')).toBe(true)
  })
})
