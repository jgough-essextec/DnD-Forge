// =============================================================================
// Story 14.2 -- CantripSelector
// Cantrip selection component with card grid, class-specific count,
// and racial cantrip pre-locking.
// =============================================================================

import { useMemo, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { SPELLS } from '@/data/spells'
import type { Spell } from '@/types/spell'
import { SelectableCardGrid } from '@/components/shared/SelectableCardGrid'
import { DetailSlidePanel } from '@/components/shared/DetailSlidePanel'
import { SpellDetailCard, formatCastingTime, formatRange } from './SpellDetailCard'

// -- Props --------------------------------------------------------------------

interface CantripSelectorProps {
  classId: string
  maxCantrips: number
  selectedCantripIds: string[]
  onSelectionChange: (cantripIds: string[]) => void
  racialCantripIds?: string[]
}

// -- Component ----------------------------------------------------------------

export function CantripSelector({
  classId,
  maxCantrips,
  selectedCantripIds,
  onSelectionChange,
  racialCantripIds = [],
}: CantripSelectorProps) {
  const [detailSpell, setDetailSpell] = useState<Spell | null>(null)

  // Get cantrips available to this class
  const availableCantrips = useMemo(() => {
    return SPELLS.filter(
      (s) => s.level === 0 && s.classes.includes(classId),
    ).sort((a, b) => a.name.localeCompare(b.name))
  }, [classId])

  // Separate racial cantrips from selectable ones
  const racialCantrips = useMemo(() => {
    return SPELLS.filter(
      (s) => s.level === 0 && racialCantripIds.includes(s.id),
    )
  }, [racialCantripIds])

  const selectedCantrips = useMemo(() => {
    return availableCantrips.filter((s) => selectedCantripIds.includes(s.id))
  }, [availableCantrips, selectedCantripIds])

  const handleSelect = useCallback(
    (spell: Spell) => {
      // Don't allow deselecting racial cantrips
      if (racialCantripIds.includes(spell.id)) return

      const isSelected = selectedCantripIds.includes(spell.id)
      if (isSelected) {
        onSelectionChange(selectedCantripIds.filter((id) => id !== spell.id))
      } else if (selectedCantripIds.length < maxCantrips) {
        onSelectionChange([...selectedCantripIds, spell.id])
      }
    },
    [selectedCantripIds, maxCantrips, racialCantripIds, onSelectionChange],
  )

  const selectedCount = selectedCantripIds.length
  const isComplete = selectedCount === maxCantrips

  return (
    <div className="space-y-4">
      {/* Section header with counter */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-heading font-semibold text-parchment">
          Cantrips
        </h3>
        <span
          className={cn(
            'text-sm font-medium',
            isComplete ? 'text-green-400' : 'text-parchment/60',
          )}
          data-testid="cantrip-counter"
        >
          {selectedCount} of {maxCantrips} selected
        </span>
      </div>

      <p className="text-sm text-parchment/60">
        Cantrips are at-will spells you can cast unlimited times. Select {maxCantrips} cantrip{maxCantrips !== 1 ? 's' : ''} from your class list.
      </p>

      {/* Racial cantrips (locked) */}
      {racialCantrips.length > 0 && (
        <div className="space-y-2" data-testid="racial-cantrips">
          <p className="text-xs font-medium text-parchment/50 uppercase tracking-wider">
            Racial Cantrips (always known)
          </p>
          {racialCantrips.map((spell) => (
            <div
              key={spell.id}
              className="flex items-center gap-3 rounded-lg border border-parchment/20 bg-parchment/5 p-3 opacity-80"
              data-testid={`racial-cantrip-${spell.id}`}
            >
              <span className="text-sm font-medium text-parchment">{spell.name}</span>
              <span className="ml-auto rounded-full border border-accent-gold/30 bg-accent-gold/10 px-2 py-0.5 text-xs text-accent-gold">
                From Race
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Selectable cantrip grid */}
      <SelectableCardGrid<Spell>
        items={availableCantrips}
        selectedItems={selectedCantrips}
        onSelect={handleSelect}
        getKey={(spell) => spell.id}
        multiSelect
        columns={{ sm: 1, md: 2, lg: 3 }}
        renderCard={(spell, isSelected) => (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-parchment">
                {spell.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDetailSpell(spell)
                }}
                className="text-xs text-accent-gold hover:text-accent-gold/80 transition-colors"
                aria-label={`View details for ${spell.name}`}
              >
                Details
              </button>
            </div>
            <p className="text-xs text-parchment/50 capitalize">{spell.school}</p>
            <div className="flex items-center gap-3 text-xs text-parchment/40">
              <span>{formatCastingTime(spell)}</span>
              <span>{formatRange(spell)}</span>
            </div>
            <p className="text-xs text-parchment/60 line-clamp-2">
              {spell.description}
            </p>
            {isSelected && (
              <span className="sr-only">Selected</span>
            )}
          </div>
        )}
      />

      {/* Detail panel */}
      <DetailSlidePanel
        isOpen={detailSpell !== null}
        onClose={() => setDetailSpell(null)}
        title={detailSpell?.name ?? 'Spell Details'}
      >
        {detailSpell && <SpellDetailCard spell={detailSpell} />}
      </DetailSlidePanel>
    </div>
  )
}
