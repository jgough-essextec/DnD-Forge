/**
 * LevelProgressBar (Story 37.3)
 *
 * Mini progress bar for the PartyStatsGrid showing XP progress toward
 * the next level. Adapts display based on campaign progression mode:
 * - XP mode: progress bar with tooltip
 * - Milestone mode: "Level N -- Milestone" text
 * - Level 20: "MAX LEVEL" badge
 */

import {
  XP_THRESHOLDS,
  getXPProgress,
  isNearNextLevel,
  formatXPTooltip,
} from '@/utils/xp'
import { Crown } from 'lucide-react'

interface LevelProgressBarProps {
  /** Current total experience points */
  currentXP: number
  /** Current character level (1-20) */
  currentLevel: number
  /** Campaign progression mode */
  mode: 'xp' | 'milestone'
}

export function LevelProgressBar({
  currentXP,
  currentLevel,
  mode,
}: LevelProgressBarProps) {
  // Milestone mode: show simple text
  if (mode === 'milestone') {
    return (
      <span
        className="text-xs text-parchment/60 italic"
        data-testid="milestone-label"
      >
        Level {currentLevel} — Milestone
      </span>
    )
  }

  // Level 20: show MAX LEVEL badge
  if (currentLevel >= 20) {
    return (
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent-gold/20 border border-accent-gold/40"
        data-testid="max-level-badge"
      >
        <Crown className="w-3 h-3 text-accent-gold" />
        <span className="text-xs font-medium text-accent-gold">MAX LEVEL</span>
      </div>
    )
  }

  const progress = getXPProgress(currentXP, currentLevel)
  const nearLevel = isNearNextLevel(currentXP, currentLevel)
  const nextLevelThreshold = currentLevel < 20 ? XP_THRESHOLDS[currentLevel] : Infinity
  const canLevelUp = currentXP >= nextLevelThreshold
  const tooltipText = formatXPTooltip(currentXP, currentLevel)

  // Determine bar color
  let barColorClass = 'bg-green-500'
  if (canLevelUp) {
    barColorClass = 'bg-accent-gold animate-pulse'
  } else if (nearLevel) {
    barColorClass = 'bg-accent-gold'
  }

  return (
    <div
      className="flex flex-col gap-0.5 min-w-[80px]"
      title={tooltipText}
      aria-label={`Level progress: ${tooltipText}`}
    >
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-parchment/50">
          Lv.{currentLevel}
        </span>
        <span className="text-[10px] text-parchment/50">
          {progress.percentage}%
        </span>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-parchment/10"
        role="progressbar"
        aria-valuenow={progress.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={tooltipText}
        data-testid="xp-progress-bar"
      >
        <div
          className={`h-full rounded-full transition-all ${barColorClass}`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  )
}
