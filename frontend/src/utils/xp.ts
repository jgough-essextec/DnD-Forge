/**
 * XP Utility Functions (Epic 37)
 *
 * Pure functions for XP tracking, level progress calculation,
 * threshold detection, and formatting. Uses the SRD XP thresholds
 * from data/reference.ts.
 */

import { XP_THRESHOLDS as REF_XP_THRESHOLDS } from '@/data/reference'

// Re-export for convenient access
export const XP_THRESHOLDS = REF_XP_THRESHOLDS

// ---------------------------------------------------------------------------
// XP Progress Types
// ---------------------------------------------------------------------------

export interface XPProgress {
  /** XP accumulated since current level threshold */
  current: number
  /** XP needed from current level threshold to reach next level */
  threshold: number
  /** Percentage progress toward next level (0-100) */
  percentage: number
  /** Whether the character is at the maximum level (20) */
  isMaxLevel: boolean
}

export interface LevelUpPreview {
  characterId: string
  characterName: string
  currentXP: number
  xpToAdd: number
  newTotal: number
  currentLevel: number
  newLevel: number
  willLevelUp: boolean
  levelsGained: number
}

export interface BatchLevelUpEntry {
  characterName: string
  oldLevel: number
  newLevel: number
  summary: string
}

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Get the XP threshold required to reach the next level.
 * @param currentLevel Character's current level (1-20)
 * @returns XP required to reach the next level, or 0 if at max level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel < 1 || currentLevel > 20) return 0
  if (currentLevel >= 20) return 0
  return XP_THRESHOLDS[currentLevel] // index = nextLevel - 1 (e.g., level 1 -> index 1 = 300 for level 2)
}

/**
 * Calculate XP progress toward the next level.
 * @param currentXP The character's current total XP
 * @param currentLevel The character's current level (1-20)
 * @returns XPProgress with current/threshold/percentage/isMaxLevel
 */
export function getXPProgress(currentXP: number, currentLevel: number): XPProgress {
  if (currentLevel >= 20) {
    return {
      current: 0,
      threshold: 0,
      percentage: 100,
      isMaxLevel: true,
    }
  }

  const currentLevelThreshold = XP_THRESHOLDS[currentLevel - 1]
  const nextLevelThreshold = XP_THRESHOLDS[currentLevel]
  const xpIntoCurrentLevel = currentXP - currentLevelThreshold
  const xpNeededForNextLevel = nextLevelThreshold - currentLevelThreshold

  const percentage =
    xpNeededForNextLevel > 0
      ? Math.min(100, Math.floor((xpIntoCurrentLevel / xpNeededForNextLevel) * 100))
      : 100

  return {
    current: xpIntoCurrentLevel,
    threshold: xpNeededForNextLevel,
    percentage,
    isMaxLevel: false,
  }
}

/**
 * Check if adding XP would cause a level up.
 * @param currentXP Current total XP
 * @param xpToAdd Amount of XP to add
 * @param currentLevel Current character level (1-20)
 * @returns The new level if threshold would be crossed, or null if no level up
 */
export function wouldLevelUp(
  currentXP: number,
  xpToAdd: number,
  currentLevel: number,
): number | null {
  if (currentLevel >= 20) return null
  const newXP = currentXP + xpToAdd
  const newLevel = getNewLevelAfterXP(currentXP, xpToAdd)
  if (newLevel > currentLevel) return newLevel
  // Also check if XP meets the threshold even without computing full level
  if (newXP >= XP_THRESHOLDS[currentLevel]) return newLevel
  return null
}

/**
 * Calculate the resulting level after adding XP.
 * @param currentXP Current total XP
 * @param xpToAdd Amount of XP to add
 * @returns The resulting character level (1-20)
 */
export function getNewLevelAfterXP(currentXP: number, xpToAdd: number): number {
  const newXP = currentXP + xpToAdd
  // Walk backwards through thresholds to find highest qualifying level
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (newXP >= XP_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

/**
 * Format XP progress as a display string.
 * @param currentXP Current total XP
 * @param currentLevel Current character level (1-20)
 * @returns Formatted string like "250 / 300 (83%)" or "MAX LEVEL"
 */
export function formatXPProgress(currentXP: number, currentLevel: number): string {
  if (currentLevel >= 20) return 'MAX LEVEL'

  const progress = getXPProgress(currentXP, currentLevel)
  return `${progress.current.toLocaleString()} / ${progress.threshold.toLocaleString()} (${progress.percentage}%)`
}

/**
 * Check if a character is near the next level threshold.
 * @param currentXP Current total XP
 * @param currentLevel Current character level
 * @param threshold Percentage threshold to consider "near" (default 0.2 = 20%)
 * @returns true if within the threshold percentage of the next level
 */
export function isNearNextLevel(
  currentXP: number,
  currentLevel: number,
  threshold: number = 0.2,
): boolean {
  if (currentLevel >= 20) return false

  const progress = getXPProgress(currentXP, currentLevel)
  return progress.percentage >= (1 - threshold) * 100
}

/**
 * Generate a batch level-up summary for multiple characters.
 * @param characters Array of {name, oldLevel, newLevel} entries
 * @returns Array of summary strings per character
 */
export function getBatchLevelUpSummary(
  characters: Array<{ name: string; oldLevel: number; newLevel: number }>,
): BatchLevelUpEntry[] {
  return characters.map((char) => ({
    characterName: char.name,
    oldLevel: char.oldLevel,
    newLevel: char.newLevel,
    summary: `${char.name}: Level ${char.oldLevel} -> ${char.newLevel}`,
  }))
}

/**
 * Build level-up preview data for a set of characters receiving XP.
 * @param characters Array of character data
 * @param xpAmounts Map of characterId -> XP amount to add
 * @returns Array of LevelUpPreview entries
 */
export function buildLevelUpPreviews(
  characters: Array<{
    id: string
    name: string
    experiencePoints: number
    level: number
  }>,
  xpAmounts: Record<string, number>,
): LevelUpPreview[] {
  return characters.map((char) => {
    const xpToAdd = xpAmounts[char.id] ?? 0
    const newTotal = char.experiencePoints + xpToAdd
    const newLevel = getNewLevelAfterXP(char.experiencePoints, xpToAdd)
    const willLevelUp = newLevel > char.level

    return {
      characterId: char.id,
      characterName: char.name,
      currentXP: char.experiencePoints,
      xpToAdd,
      newTotal,
      currentLevel: char.level,
      newLevel,
      willLevelUp,
      levelsGained: newLevel - char.level,
    }
  })
}

/**
 * Format a tooltip for XP progress display.
 * @param currentXP Current total XP
 * @param currentLevel Current character level
 * @returns Tooltip text like "250 / 300 (83%)"
 */
export function formatXPTooltip(currentXP: number, currentLevel: number): string {
  if (currentLevel >= 20) return 'MAX LEVEL'

  const nextThreshold = XP_THRESHOLDS[currentLevel]
  const percentage = getXPProgress(currentXP, currentLevel).percentage
  return `${currentXP.toLocaleString()} / ${nextThreshold.toLocaleString()} (${percentage}%)`
}
