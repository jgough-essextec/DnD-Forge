// =============================================================================
// Story 14.3 -- SpellSelector
// Level 1+ spell selection component with support for three casting systems:
// known casters, prepared casters, and wizard spellbook.
// =============================================================================

import { useMemo, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { SPELLS } from '@/data/spells'
import type { Spell } from '@/types/spell'
import { SelectableCardGrid } from '@/components/shared/SelectableCardGrid'
import { DetailSlidePanel } from '@/components/shared/DetailSlidePanel'
import { SpellDetailCard, formatCastingTime, formatRange } from './SpellDetailCard'
import { SpellFilterBar, DEFAULT_SPELL_FILTERS, type SpellFilters } from './SpellFilterBar'

// -- Types --------------------------------------------------------------------

export type CastingSystem = 'known' | 'prepared' | 'spellbook'

interface SpellSelectorProps {
  classId: string
  castingSystem: CastingSystem
  /** For known casters: exact number of spells to learn */
  maxSpells: number
  /** For wizard/prepared: prepared spell limit */
  maxPrepared?: number
  /** Spell IDs currently selected (known spells or spellbook spells) */
  selectedSpellIds: string[]
  onSpellSelectionChange: (spellIds: string[]) => void
  /** For wizard: prepared spell IDs from the spellbook */
  preparedSpellIds?: string[]
  onPreparedChange?: (spellIds: string[]) => void
  /** Spellcasting ability name for display */
  abilityName: string
  /** Ability modifier for prepared count display */
  abilityModifier: number
}

// -- Component ----------------------------------------------------------------

export function SpellSelector({
  classId,
  castingSystem,
  maxSpells,
  maxPrepared = 0,
  selectedSpellIds,
  onSpellSelectionChange,
  preparedSpellIds = [],
  onPreparedChange,
  abilityName,
  abilityModifier,
}: SpellSelectorProps) {
  const [detailSpell, setDetailSpell] = useState<Spell | null>(null)
  const [filters, setFilters] = useState<SpellFilters>(DEFAULT_SPELL_FILTERS)

  // Get level 1 spells available to this class
  const availableSpells = useMemo(() => {
    return SPELLS.filter(
      (s) => s.level === 1 && s.classes.includes(classId),
    ).sort((a, b) => a.name.localeCompare(b.name))
  }, [classId])

  // Apply filters
  const filteredSpells = useMemo(() => {
    return availableSpells.filter((spell) => {
      if (filters.search) {
        const search = filters.search.toLowerCase()
        if (!spell.name.toLowerCase().includes(search) && !spell.description.toLowerCase().includes(search)) {
          return false
        }
      }
      if (filters.school && spell.school !== filters.school) return false
      if (filters.castingTime && spell.castingTime.unit !== filters.castingTime) return false
      if (filters.concentration && !spell.concentration) return false
      if (filters.ritual && !spell.ritual) return false
      return true
    })
  }, [availableSpells, filters])

  const selectedSpells = useMemo(() => {
    return availableSpells.filter((s) => selectedSpellIds.includes(s.id))
  }, [availableSpells, selectedSpellIds])

  // For wizard: spellbook spells for preparing from
  const spellbookSpells = useMemo(() => {
    if (castingSystem !== 'spellbook') return []
    return availableSpells.filter((s) => selectedSpellIds.includes(s.id))
  }, [castingSystem, availableSpells, selectedSpellIds])

  const preparedSpells = useMemo(() => {
    return spellbookSpells.filter((s) => preparedSpellIds.includes(s.id))
  }, [spellbookSpells, preparedSpellIds])

  // Handle spell selection
  const handleSelectSpell = useCallback(
    (spell: Spell) => {
      const isSelected = selectedSpellIds.includes(spell.id)
      if (isSelected) {
        onSpellSelectionChange(selectedSpellIds.filter((id) => id !== spell.id))
        // If wizard and deselecting from spellbook, also remove from prepared
        if (castingSystem === 'spellbook' && onPreparedChange) {
          onPreparedChange(preparedSpellIds.filter((id) => id !== spell.id))
        }
      } else if (selectedSpellIds.length < maxSpells) {
        onSpellSelectionChange([...selectedSpellIds, spell.id])
      }
    },
    [selectedSpellIds, maxSpells, castingSystem, preparedSpellIds, onSpellSelectionChange, onPreparedChange],
  )

  // Handle prepared spell toggle (for wizard spellbook)
  const handleTogglePrepared = useCallback(
    (spell: Spell) => {
      if (!onPreparedChange) return
      const isPrepared = preparedSpellIds.includes(spell.id)
      if (isPrepared) {
        onPreparedChange(preparedSpellIds.filter((id) => id !== spell.id))
      } else if (preparedSpellIds.length < maxPrepared) {
        onPreparedChange([...preparedSpellIds, spell.id])
      }
    },
    [preparedSpellIds, maxPrepared, onPreparedChange],
  )

  const selectedCount = selectedSpellIds.length
  const isSpellsComplete = selectedCount === maxSpells
  const isPreparedComplete = castingSystem === 'spellbook'
    ? preparedSpellIds.length > 0 && preparedSpellIds.length <= maxPrepared
    : true

  return (
    <div className="space-y-6">
      {/* System-specific header */}
      <SystemHeader
        castingSystem={castingSystem}
        classId={classId}
        maxSpells={maxSpells}
        maxPrepared={maxPrepared}
        selectedCount={selectedCount}
        preparedCount={preparedSpellIds.length}
        isComplete={isSpellsComplete}
        abilityName={abilityName}
        abilityModifier={abilityModifier}
      />

      {/* Filter bar */}
      <SpellFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        showLevelFilter={false}
      />

      {/* Spell grid */}
      <SelectableCardGrid<Spell>
        items={filteredSpells}
        selectedItems={selectedSpells}
        onSelect={handleSelectSpell}
        getKey={(spell) => spell.id}
        multiSelect
        columns={{ sm: 1, md: 2, lg: 3 }}
        renderCard={(spell, _isSelected) => (
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
              {spell.concentration && <span className="text-amber-400/60">C</span>}
              {spell.ritual && <span className="text-accent-gold/60">R</span>}
            </div>
            <p className="text-xs text-parchment/60 line-clamp-2">
              {spell.description}
            </p>
          </div>
        )}
      />

      {/* Wizard: Prepared Spells section */}
      {castingSystem === 'spellbook' && spellbookSpells.length > 0 && (
        <div className="space-y-4 border-t border-parchment/10 pt-6">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-heading font-semibold text-parchment">
              Prepare Spells from Spellbook
            </h4>
            <span
              className={cn(
                'text-sm font-medium',
                isPreparedComplete ? 'text-green-400' : 'text-parchment/60',
              )}
              data-testid="prepared-counter"
            >
              {preparedSpellIds.length} of {maxPrepared} prepared
            </span>
          </div>

          <p className="text-sm text-parchment/60">
            Select up to {maxPrepared} spells from your spellbook to prepare. You can change your
            prepared spells after each long rest.
          </p>

          <SelectableCardGrid<Spell>
            items={spellbookSpells}
            selectedItems={preparedSpells}
            onSelect={handleTogglePrepared}
            getKey={(spell) => spell.id}
            multiSelect
            columns={{ sm: 1, md: 2, lg: 3 }}
            renderCard={(spell, isSelected) => (
              <div className="space-y-1">
                <span className="text-sm font-medium text-parchment">{spell.name}</span>
                <p className="text-xs text-parchment/50 capitalize">{spell.school}</p>
                <p className="text-xs text-parchment/60 line-clamp-2">{spell.description}</p>
                {isSelected && (
                  <span className="text-xs text-green-400">Prepared</span>
                )}
              </div>
            )}
          />
        </div>
      )}

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

// -- System Header Component --------------------------------------------------

function SystemHeader({
  castingSystem,
  classId,
  maxSpells,
  maxPrepared,
  selectedCount,
  preparedCount: _preparedCount,
  isComplete,
  abilityName,
  abilityModifier,
}: {
  castingSystem: CastingSystem
  classId: string
  maxSpells: number
  maxPrepared: number
  selectedCount: number
  preparedCount: number
  isComplete: boolean
  abilityName: string
  abilityModifier: number
}) {
  const capitalizedAbility = abilityName.charAt(0).toUpperCase() + abilityName.slice(1)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-heading font-semibold text-parchment">
          Level 1 Spells
        </h3>
        <span
          className={cn(
            'text-sm font-medium',
            isComplete ? 'text-green-400' : 'text-parchment/60',
          )}
          data-testid="spell-counter"
        >
          {selectedCount} of {maxSpells} selected
        </span>
      </div>

      {castingSystem === 'known' && (
        <div className="space-y-2">
          <p className="text-sm text-parchment/60" data-testid="known-caster-info">
            Choose {maxSpells} spells to learn. These spells are permanent choices until you level up.
          </p>
          {classId === 'warlock' && (
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-3" data-testid="pact-magic-info">
              <p className="text-sm text-amber-400/80">
                <span className="font-semibold">Pact Magic:</span> Your spell slots recharge on a
                short rest (not a long rest). At level 1, you have 1 spell slot.
              </p>
            </div>
          )}
        </div>
      )}

      {castingSystem === 'prepared' && (
        <div className="space-y-2">
          <p className="text-sm text-parchment/60" data-testid="prepared-caster-info">
            Select up to {maxSpells} spells to prepare from the full {classId} spell list.
            You can change your prepared spells after each long rest.
          </p>
          <div className="rounded-lg border border-parchment/10 bg-parchment/5 p-3" data-testid="prepared-formula">
            <p className="text-sm text-parchment/70">
              <span className="font-semibold">Spells Prepared:</span>{' '}
              {capitalizedAbility} modifier ({abilityModifier >= 0 ? '+' : ''}{abilityModifier})
              + Level (1) = {maxSpells} spells
            </p>
          </div>
        </div>
      )}

      {castingSystem === 'spellbook' && (
        <div className="space-y-2">
          <p className="text-sm text-parchment/60" data-testid="spellbook-info">
            Choose {maxSpells} spells for your spellbook. Then prepare up to {maxPrepared} of
            those spells each day.
          </p>
          <div className="rounded-lg border border-parchment/10 bg-parchment/5 p-3" data-testid="prepared-formula">
            <p className="text-sm text-parchment/70">
              <span className="font-semibold">Spellbook:</span> {maxSpells} spells{' '}
              <span className="mx-1 text-parchment/30">|</span>
              <span className="font-semibold">Prepared:</span>{' '}
              {capitalizedAbility} modifier ({abilityModifier >= 0 ? '+' : ''}{abilityModifier})
              + Level (1) = {maxPrepared} spells
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
