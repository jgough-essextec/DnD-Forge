/**
 * PactMagicTracker Component (Story 28.2)
 *
 * Separate section for Warlock Pact Magic with purple accent color.
 * Displays all slots at the same level with clickable circles and
 * a short rest recovery button. Optionally displays Mystic Arcanum
 * for high-level Warlocks.
 */

import { cn } from '@/lib/utils'
import { formatSpellLevel } from '@/utils/spell-slots'
import type { PactMagic } from '@/types/spell'

export interface PactMagicTrackerProps {
  /** Pact Magic data */
  pactMagic: PactMagic
  /** Called with slot index when a circle is clicked */
  onToggleSlot: (slotIndex: number) => void
  /** Called when short rest recovery is triggered */
  onShortRestRecover: () => void
  /** Called when a Mystic Arcanum is used */
  onUseMysticArcanum?: (level: number) => void
  /** Called when a Mystic Arcanum is reset */
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
  const hasExpendedSlots = pactMagic.usedSlots > 0

  // Gather Mystic Arcanum entries sorted by level
  const arcanumEntries = Object.entries(pactMagic.mysticArcanum)
    .map(([level, data]) => ({ level: Number(level), ...data }))
    .sort((a, b) => a.level - b.level)

  return (
    <div
      className="p-4 rounded-lg border bg-purple-950/20 border-purple-500/30 space-y-3"
      data-testid="pact-magic-tracker"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-serif font-semibold text-purple-300">
          Pact Magic Slots
        </h3>
        <span className="text-xs text-purple-400 italic">
          Short Rest Recovery
        </span>
      </div>

      {/* Slot format description */}
      <div
        className="text-xs text-purple-300/80 font-medium"
        data-testid="pact-magic-format"
      >
        {pactMagic.totalSlots} x {formatSpellLevel(pactMagic.slotLevel)} Level Slots
      </div>

      {/* Slot circles */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {Array.from({ length: pactMagic.totalSlots }, (_, i) => {
            const isExpended = i < pactMagic.usedSlots
            return (
              <button
                key={i}
                type="button"
                onClick={() => onToggleSlot(i)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-all',
                  'hover:scale-110 cursor-pointer',
                  isExpended
                    ? 'bg-purple-950/40 border-purple-500/40'
                    : 'bg-purple-400/80 border-purple-300',
                )}
                aria-label={`Pact slot ${i + 1} (${isExpended ? 'expended' : 'available'})`}
                data-testid={`pact-slot-${i}`}
              />
            )
          })}
        </div>
        <span className="text-xs text-purple-300/60 tabular-nums">
          {available}/{pactMagic.totalSlots}
        </span>
      </div>

      {/* Short Rest Recovery button */}
      <button
        type="button"
        onClick={onShortRestRecover}
        disabled={!hasExpendedSlots}
        className={cn(
          'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
          hasExpendedSlots
            ? 'bg-purple-950/30 border-purple-500/40 text-purple-300 hover:bg-purple-950/50 cursor-pointer'
            : 'bg-parchment/5 border-parchment/20 text-parchment/30 cursor-not-allowed',
        )}
        data-testid="pact-short-rest"
        aria-label="Short rest: recover pact magic slots"
      >
        Short Rest (Recover Pact Slots)
      </button>

      {/* Mystic Arcanum */}
      {arcanumEntries.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-purple-500/20">
          <h4 className="text-xs font-semibold text-purple-300/70 uppercase tracking-wider">
            Mystic Arcanum
          </h4>
          <div className="space-y-1.5">
            {arcanumEntries.map(({ level, spellId, used }) => (
              <div
                key={level}
                className="flex items-center gap-2"
                data-testid={`arcanum-level-${level}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (used) {
                      onResetMysticArcanum?.(level)
                    } else {
                      onUseMysticArcanum?.(level)
                    }
                  }}
                  className={cn(
                    'w-4 h-4 rounded-full border-2 transition-all',
                    'hover:scale-110 cursor-pointer',
                    used
                      ? 'bg-purple-950/40 border-purple-500/40'
                      : 'bg-purple-400/80 border-purple-300',
                  )}
                  aria-label={`${formatSpellLevel(level)} level Mystic Arcanum (${used ? 'used' : 'available'})`}
                />
                <span className="text-xs text-purple-300/60">
                  {formatSpellLevel(level)} - {spellId}
                </span>
                {used && (
                  <span className="text-xs text-purple-400/40 italic ml-auto">used</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
