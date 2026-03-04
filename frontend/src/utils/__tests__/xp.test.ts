/**
 * XP Utility Tests (Story 37.1, 37.3)
 *
 * Unit tests for all XP utility functions including threshold lookups,
 * progress calculations, level-up detection, and formatting.
 */

import { describe, it, expect } from 'vitest'
import {
  XP_THRESHOLDS,
  getXPForNextLevel,
  getXPProgress,
  wouldLevelUp,
  getNewLevelAfterXP,
  formatXPProgress,
  isNearNextLevel,
  getBatchLevelUpSummary,
  buildLevelUpPreviews,
  formatXPTooltip,
} from '@/utils/xp'

describe('XP_THRESHOLDS', () => {
  it('should have 20 entries (one per level)', () => {
    expect(XP_THRESHOLDS).toHaveLength(20)
  })

  it('should match SRD XP table values', () => {
    expect(XP_THRESHOLDS[0]).toBe(0)      // Level 1
    expect(XP_THRESHOLDS[1]).toBe(300)     // Level 2
    expect(XP_THRESHOLDS[2]).toBe(900)     // Level 3
    expect(XP_THRESHOLDS[3]).toBe(2700)    // Level 4
    expect(XP_THRESHOLDS[4]).toBe(6500)    // Level 5
    expect(XP_THRESHOLDS[5]).toBe(14000)   // Level 6
    expect(XP_THRESHOLDS[6]).toBe(23000)   // Level 7
    expect(XP_THRESHOLDS[7]).toBe(34000)   // Level 8
    expect(XP_THRESHOLDS[8]).toBe(48000)   // Level 9
    expect(XP_THRESHOLDS[9]).toBe(64000)   // Level 10
    expect(XP_THRESHOLDS[10]).toBe(85000)  // Level 11
    expect(XP_THRESHOLDS[11]).toBe(100000) // Level 12
    expect(XP_THRESHOLDS[12]).toBe(120000) // Level 13
    expect(XP_THRESHOLDS[13]).toBe(140000) // Level 14
    expect(XP_THRESHOLDS[14]).toBe(165000) // Level 15
    expect(XP_THRESHOLDS[15]).toBe(195000) // Level 16
    expect(XP_THRESHOLDS[16]).toBe(225000) // Level 17
    expect(XP_THRESHOLDS[17]).toBe(265000) // Level 18
    expect(XP_THRESHOLDS[18]).toBe(305000) // Level 19
    expect(XP_THRESHOLDS[19]).toBe(355000) // Level 20
  })

  it('should be monotonically increasing', () => {
    for (let i = 1; i < XP_THRESHOLDS.length; i++) {
      expect(XP_THRESHOLDS[i]).toBeGreaterThan(XP_THRESHOLDS[i - 1])
    }
  })
})

describe('getXPForNextLevel', () => {
  it('should return XP threshold for next level', () => {
    expect(getXPForNextLevel(1)).toBe(300)      // Level 1 -> 2 needs 300
    expect(getXPForNextLevel(4)).toBe(6500)     // Level 4 -> 5 needs 6500
    expect(getXPForNextLevel(19)).toBe(355000)  // Level 19 -> 20 needs 355000
  })

  it('should return 0 for level 20 (max)', () => {
    expect(getXPForNextLevel(20)).toBe(0)
  })

  it('should return 0 for invalid levels', () => {
    expect(getXPForNextLevel(0)).toBe(0)
    expect(getXPForNextLevel(-1)).toBe(0)
    expect(getXPForNextLevel(21)).toBe(0)
  })
})

describe('getXPProgress', () => {
  it('should calculate progress for level 1 character with 0 XP', () => {
    const progress = getXPProgress(0, 1)
    expect(progress.current).toBe(0)
    expect(progress.threshold).toBe(300)
    expect(progress.percentage).toBe(0)
    expect(progress.isMaxLevel).toBe(false)
  })

  it('should calculate progress for level 1 character with 150 XP', () => {
    const progress = getXPProgress(150, 1)
    expect(progress.current).toBe(150)
    expect(progress.threshold).toBe(300)
    expect(progress.percentage).toBe(50)
    expect(progress.isMaxLevel).toBe(false)
  })

  it('should calculate progress at exactly the threshold', () => {
    const progress = getXPProgress(300, 1)
    expect(progress.current).toBe(300)
    expect(progress.threshold).toBe(300)
    expect(progress.percentage).toBe(100)
  })

  it('should calculate progress for mid-level character', () => {
    // Level 5 threshold is 6500, level 6 is 14000
    // At 10000 XP: 10000 - 6500 = 3500 into level 5, threshold = 14000 - 6500 = 7500
    const progress = getXPProgress(10000, 5)
    expect(progress.current).toBe(3500)
    expect(progress.threshold).toBe(7500)
    expect(progress.percentage).toBe(46)
    expect(progress.isMaxLevel).toBe(false)
  })

  it('should return max level info for level 20', () => {
    const progress = getXPProgress(400000, 20)
    expect(progress.isMaxLevel).toBe(true)
    expect(progress.percentage).toBe(100)
  })
})

describe('wouldLevelUp', () => {
  it('should detect level-up when XP crosses threshold', () => {
    // Level 1 with 200 XP, adding 200 -> 400, crosses 300 for level 2
    const result = wouldLevelUp(200, 200, 1)
    expect(result).toBe(2)
  })

  it('should return null when XP does not cross threshold', () => {
    const result = wouldLevelUp(100, 50, 1)
    expect(result).toBeNull()
  })

  it('should detect multi-level jump', () => {
    // Level 1 with 0 XP, adding 3000 -> crosses level 2 (300) and 3 (900) into level 4 (2700)
    const result = wouldLevelUp(0, 3000, 1)
    expect(result).toBe(4)
  })

  it('should return null for level 20 characters', () => {
    const result = wouldLevelUp(400000, 10000, 20)
    expect(result).toBeNull()
  })

  it('should detect level-up at exact threshold', () => {
    const result = wouldLevelUp(0, 300, 1)
    expect(result).toBe(2)
  })
})

describe('getNewLevelAfterXP', () => {
  it('should return level 1 for 0 XP', () => {
    expect(getNewLevelAfterXP(0, 0)).toBe(1)
  })

  it('should return level 2 for 300 XP', () => {
    expect(getNewLevelAfterXP(0, 300)).toBe(2)
  })

  it('should return level 3 for 900 XP', () => {
    expect(getNewLevelAfterXP(0, 900)).toBe(3)
  })

  it('should handle large XP values', () => {
    expect(getNewLevelAfterXP(0, 500000)).toBe(20)
  })

  it('should handle adding XP to existing total', () => {
    expect(getNewLevelAfterXP(250, 50)).toBe(2)
  })

  it('should cap at level 20', () => {
    expect(getNewLevelAfterXP(355000, 100000)).toBe(20)
  })
})

describe('formatXPProgress', () => {
  it('should format progress for level 1 with 150 XP', () => {
    const result = formatXPProgress(150, 1)
    expect(result).toBe('150 / 300 (50%)')
  })

  it('should format progress for level 5 with 10000 XP', () => {
    const result = formatXPProgress(10000, 5)
    expect(result).toContain('3,500')
    expect(result).toContain('7,500')
    expect(result).toContain('46%')
  })

  it('should return MAX LEVEL for level 20', () => {
    expect(formatXPProgress(400000, 20)).toBe('MAX LEVEL')
  })
})

describe('isNearNextLevel', () => {
  it('should return true when within 20% of next level', () => {
    // Level 1, threshold is 300. 80% of 300 = 240. At 250, should be near.
    expect(isNearNextLevel(250, 1)).toBe(true)
  })

  it('should return false when far from next level', () => {
    expect(isNearNextLevel(50, 1)).toBe(false)
  })

  it('should return false for level 20', () => {
    expect(isNearNextLevel(400000, 20)).toBe(false)
  })

  it('should respect custom threshold', () => {
    // Level 1, threshold 300. At 150 (50%), custom threshold 0.6 means >= 40% is near
    expect(isNearNextLevel(150, 1, 0.6)).toBe(true)
    expect(isNearNextLevel(100, 1, 0.6)).toBe(false)
  })
})

describe('getBatchLevelUpSummary', () => {
  it('should generate summary entries', () => {
    const chars = [
      { name: 'Aragorn', oldLevel: 4, newLevel: 5 },
      { name: 'Gandalf', oldLevel: 9, newLevel: 10 },
    ]
    const summary = getBatchLevelUpSummary(chars)
    expect(summary).toHaveLength(2)
    expect(summary[0].summary).toBe('Aragorn: Level 4 -> 5')
    expect(summary[1].summary).toBe('Gandalf: Level 9 -> 10')
  })

  it('should handle empty array', () => {
    expect(getBatchLevelUpSummary([])).toHaveLength(0)
  })
})

describe('buildLevelUpPreviews', () => {
  const characters = [
    { id: 'c1', name: 'Fighter', experiencePoints: 250, level: 1 },
    { id: 'c2', name: 'Wizard', experiencePoints: 6000, level: 4 },
    { id: 'c3', name: 'MaxChar', experiencePoints: 400000, level: 20 },
  ]

  it('should build previews with level-up detection', () => {
    const xpAmounts = { c1: 100, c2: 700, c3: 1000 }
    const previews = buildLevelUpPreviews(characters, xpAmounts)

    expect(previews).toHaveLength(3)

    // Fighter: 250 + 100 = 350, crosses 300 -> level 2
    expect(previews[0].willLevelUp).toBe(true)
    expect(previews[0].newLevel).toBe(2)
    expect(previews[0].newTotal).toBe(350)

    // Wizard: 6000 + 700 = 6700, crosses 6500 -> level 5
    expect(previews[1].willLevelUp).toBe(true)
    expect(previews[1].newLevel).toBe(5)

    // MaxChar: level 20, no level up possible
    expect(previews[2].willLevelUp).toBe(false)
    expect(previews[2].newLevel).toBe(20)
  })

  it('should handle zero XP amounts', () => {
    const xpAmounts = { c1: 0, c2: 0, c3: 0 }
    const previews = buildLevelUpPreviews(characters, xpAmounts)
    expect(previews.every((p) => !p.willLevelUp)).toBe(true)
  })

  it('should distribute equal XP to all characters in "Award to All" mode', () => {
    const globalXP = 500
    const amounts: Record<string, number> = {}
    for (const char of characters) {
      amounts[char.id] = globalXP
    }
    const previews = buildLevelUpPreviews(characters, amounts)
    // All should receive 500 XP
    for (const preview of previews) {
      expect(preview.xpToAdd).toBe(500)
    }
  })

  it('should allow different XP amounts per character in "Award Individually" mode', () => {
    const amounts = { c1: 100, c2: 500, c3: 0 }
    const previews = buildLevelUpPreviews(characters, amounts)
    expect(previews[0].xpToAdd).toBe(100)
    expect(previews[1].xpToAdd).toBe(500)
    expect(previews[2].xpToAdd).toBe(0)
  })
})

describe('formatXPTooltip', () => {
  it('should format tooltip for XP progress', () => {
    const tooltip = formatXPTooltip(150, 1)
    expect(tooltip).toContain('150')
    expect(tooltip).toContain('300')
    expect(tooltip).toContain('50%')
  })

  it('should return MAX LEVEL for level 20', () => {
    expect(formatXPTooltip(400000, 20)).toBe('MAX LEVEL')
  })
})
