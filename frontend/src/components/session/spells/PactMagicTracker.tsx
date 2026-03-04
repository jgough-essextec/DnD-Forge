/**
 * PactMagicTracker Component (Story 28.2)
 *
 * Warlock-specific Pact Magic section with:
 * - Purple accent styling distinct from standard spell slots
 * - "Pact Magic Slots (Short Rest Recovery)" label
 * - "N x Level M Slots" display format
 * - Clickable slot circles for expend/restore
 * - Short rest recovery button
 * - Mystic Arcanum tracking for 11th+ level Warlocks
 */

import type { PactMagic } from '@/types/spell'
import { cn } from '@/lib/utils'
import { formatSpellLevel } from '@/utils/spell-slots'

export interface PactMagicTrackerProps {
  /** Pact Magic data from the character */
  pactMagic: PactMagic
  /** Called when a Pact Magic slot is toggled (expend/restore) */
  onToggleSlot: (slotIndex: number) => void
  /** Called when short rest recovery restores all Pact Magic slots */
  onShortRestRecover: () => void
  /** Called when a Mystic Arcanum spell is used */
  onUseMysticArcanum?: (level: number) => void
  /** Called when a Mystic Arcanum usage is reset */
  onResetMysticArcanum?: (level: number) => void
}

export function PactMagicTracker({
  pactMagic,
  onToggleSlot,
  onShortRestRecover,
  onUseMysticArcanum,
  onResetMysticArcanum,
}: PactMagicTrackerProps) {
  const available = pactMagic.totalSlots - pactMagic.usedSlots

  const arcanumEntries = pactMagic.mysticArcanum
    ? Object.entries(pactMagic.mysticArcanum)
        .map(([level, data]) => ({ level: Number(level), ...data }))
        .sort((a, b) => a.level - b.level)
    : []

  return (
    <div
      className="p-4 rounded-lg border bg-purple-950/20 border-purple-500/30 space-y-3"
      data-testid="pact-magic-tracker"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif text-purple-300">
          Pact Magic Slots
        </h3>
        <span className="text-xs text-purple-400 italic">
          Short Rest Recovery
        </span>
      </div>

      {/* Slot format: N x Level M Slots */}
      <p
        className="text-sm text-purple-200/80"
        data-testid="pact-magic-format"
      >
        {pactMagic.totalSlots} x {formatSpellLevel(pactMagic.slotLevel)} Level Slots
      </p>

      {/* Clickable slot circles */}
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label={`Pact Magic slots: ${available} of ${pactMagic.totalSlots} available`}
      >
        <div className="flex gap-1.5">
          {Array.from({ length: pactMagic.totalSlots }, (_, i) => {
            const isUsed = i < pactMagic.usedSlots
            return (
              <button
                key={i}
                type="button"
                onClick={() => onToggleSlot(i)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-all',
                  'hover:scale-110 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-400/50',
                  isUsed
                    ? 'bg-parchment/20 border-parchment/40'
                    : 'bg-purple-500/80 border-purple-400',
                )}
                aria-label={`Pact Magic slot ${i + 1}: ${isUsed ? 'expended' : 'available'}. Click to ${isUsed ? 'restore' : 'expend'}.`}
                data-testid={`pact-slot-${i}`}
              />
            )
          })}
        </div>
        <span className="text-xs text-purple-300/60 ml-1">
          {available}/{pactMagic.totalSlots}
        </span>
      </div>

      {/* Short rest recovery button */}
      <button
        type="button"
        onClick={onShortRestRecover}
        disabled={pactMagic.usedSlots === 0}
        className={cn(
          'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
          pactMagic.usedSlots > 0
            ? 'bg-purple-900/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/60 cursor-pointer'
            : 'bg-parchment/5 border-parchment/20 text-parchment/30 cursor-not-allowed',
        )}
        data-testid="pact-short-rest"
      >
        Short Rest Recovery
      </button>

      {/* Mystic Arcanum (if present) */}
      {arcanumEntries.length > 0 && (
        <div className="pt-2 border-t border-purple-500/20 space-y-2">
          <h4 className="text-sm font-semibold text-purple-300/80">
            Mystic Arcanum
          </h4>
          <p className="text-xs text-purple-400/60">Once per long rest each</p>
          <div className="space-y-1">
            {arcanumEntries.map(entry => (
              <div
                key={entry.level}
                className="flex items-center justify-between"
                data-testid={`arcanum-level-${entry.level}`}
              >
                <span className="text-xs text-purple-200/70">
                  {formatSpellLevel(entry.level)} Level
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (entry.used) {
                      onResetMysticArcanum?.(entry.level)
                    } else {
                      onUseMysticArcanum?.(entry.level)
                    }
                  }}
                  className={cn(
                    'w-4 h-4 rounded-full border-2 transition-all cursor-pointer',
                    'hover:scale-110',
                    entry.used
                      ? 'bg-parchment/20 border-parchment/40'
                      : 'bg-purple-500/80 border-purple-400',
                  )}
                  aria-label={`Mystic Arcanum ${formatSpellLevel(entry.level)} level: ${entry.used ? 'used' : 'available'}`}
                  data-testid={`arcanum-toggle-${entry.level}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
