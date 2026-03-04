/**
 * CastSpellPrompt Component (Story 28.1)
 *
 * When casting a spell, prompts the user to choose a slot level.
 * Shows available slots at each valid level (base and higher for upcasting).
 * Offers ritual casting option if the spell has the ritual tag.
 * Shows override option when no slots are available.
 */

import { cn } from '@/lib/utils'
import { getAvailableCastingLevels, formatSpellLevel } from '@/utils/spell-slots'
import type { Spell } from '@/types/spell'

export interface CastSpellPromptProps {
  /** The spell being cast */
  spell: Spell
  /** Maximum slots by level */
  maxSlots: Record<number, number>
  /** Used slots by level */
  usedSlots: Record<number, number>
  /** Called with the chosen slot level */
  onCastWithSlot: (slotLevel: number) => void
  /** Called when casting as a ritual (no slot used) */
  onCastAsRitual: () => void
  /** Called when the prompt is cancelled */
  onCancel: () => void
  /** Called when casting without available slots (override) */
  onOverrideCast: () => void
}

export function CastSpellPrompt({
  spell,
  maxSlots,
  usedSlots,
  onCastWithSlot,
  onCastAsRitual,
  onCancel,
  onOverrideCast,
}: CastSpellPromptProps) {
  // Cantrips don't need slots
  if (spell.level === 0) return null

  const availableLevels = getAvailableCastingLevels(spell.level, usedSlots, maxSlots)

  // Also gather all levels that have total slots >= spell level for display
  const allCastableLevels = Object.keys(maxSlots)
    .map(Number)
    .filter(l => l >= spell.level && (maxSlots[l] ?? 0) > 0)
    .sort((a, b) => a - b)

  const hasAvailableSlots = availableLevels.length > 0

  return (
    <div
      className="rounded-lg border-2 border-accent-gold/40 bg-bg-secondary p-4 space-y-3"
      data-testid="cast-spell-prompt"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-serif font-semibold text-accent-gold">
          Cast {spell.name}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-parchment/50 hover:text-parchment/80 transition-colors cursor-pointer"
          data-testid="cancel-cast"
          aria-label="Cancel casting"
        >
          Cancel
        </button>
      </div>

      {/* Available slot level buttons */}
      {hasAvailableSlots && (
        <div className="space-y-1.5">
          <span className="text-xs text-parchment/50">Choose a spell slot:</span>
          <div className="flex flex-wrap gap-2">
            {allCastableLevels.map(level => {
              const total = maxSlots[level] ?? 0
              const used = usedSlots[level] ?? 0
              const available = total - used
              const isAvailable = available > 0
              const isUpcast = level > spell.level

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onCastWithSlot(level)}
                  disabled={!isAvailable}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                    isAvailable
                      ? 'bg-accent-gold/10 border-accent-gold/40 text-accent-gold hover:bg-accent-gold/20 cursor-pointer'
                      : 'bg-parchment/5 border-parchment/20 text-parchment/30 cursor-not-allowed',
                  )}
                  data-testid={`cast-at-level-${level}`}
                  aria-label={`Cast at ${formatSpellLevel(level)} level${isUpcast ? ' (upcast)' : ''}`}
                >
                  {formatSpellLevel(level)}
                  {isUpcast && (
                    <span className="ml-1 text-parchment/40">(upcast)</span>
                  )}
                  <span className="ml-1.5 text-parchment/40">
                    [{available}/{total}]
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* No slots warning */}
      {!hasAvailableSlots && (
        <div className="space-y-2">
          <p
            className="text-xs text-red-400"
            data-testid="no-slots-warning"
          >
            No spell slots available at {formatSpellLevel(spell.level)} level or higher.
          </p>
          <button
            type="button"
            onClick={onOverrideCast}
            className="px-3 py-1.5 rounded-lg border bg-red-950/20 border-red-500/30 text-xs font-medium text-red-300 hover:bg-red-950/40 transition-all cursor-pointer"
            data-testid="override-cast-button"
          >
            Cast Anyway (DM Override)
          </button>
        </div>
      )}

      {/* Ritual casting option */}
      {spell.ritual && (
        <button
          type="button"
          onClick={onCastAsRitual}
          className="w-full px-3 py-1.5 rounded-lg border bg-purple-950/20 border-purple-500/30 text-xs font-medium text-purple-300 hover:bg-purple-950/40 transition-all cursor-pointer"
          data-testid="cast-as-ritual"
          aria-label={`Cast ${spell.name} as a ritual`}
        >
          Cast as Ritual (+10 minutes, no slot used)
        </button>
      )}
    </div>
  )
}
