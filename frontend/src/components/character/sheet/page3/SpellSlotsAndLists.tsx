/**
 * SpellSlotsAndLists Component (Story 19.3 - Epic 19)
 *
 * Displays spell slots and spell lists organized by level (1-9).
 * - Spell slot tracker with fillable circles (always interactive for tracking during play)
 * - Spell lists with prepared/known checkboxes
 * - Warlock Pact Magic tracked separately
 */

import { useState } from 'react'
import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { getSpellById } from '@/data/spells'
import { cn } from '@/lib/utils'
import type { Spell, SpellLevel, SpellSchool } from '@/types/spell'

// School icons and colors (shared with CantripsSection)
const SCHOOL_CONFIG: Record<SpellSchool, { icon: string; color: string }> = {
  abjuration: { icon: '🛡️', color: 'text-blue-400' },
  conjuration: { icon: '✨', color: 'text-purple-400' },
  divination: { icon: '👁️', color: 'text-cyan-400' },
  enchantment: { icon: '💫', color: 'text-pink-400' },
  evocation: { icon: '⚡', color: 'text-red-400' },
  illusion: { icon: '🌀', color: 'text-purple-300' },
  necromancy: { icon: '💀', color: 'text-green-400' },
  transmutation: { icon: '🔄', color: 'text-yellow-400' },
}

const SPELL_LEVEL_NAMES: Record<number, string> = {
  1: '1st Level',
  2: '2nd Level',
  3: '3rd Level',
  4: '4th Level',
  5: '5th Level',
  6: '6th Level',
  7: '7th Level',
  8: '8th Level',
  9: '9th Level',
}

export function SpellSlotsAndLists() {
  const { character, editableCharacter, derivedStats, updateField } = useCharacterSheet()
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null)

  const activeCharacter = character
    ? { ...character, ...editableCharacter }
    : null

  if (!activeCharacter?.spellcasting) return null

  const spellcastingData = activeCharacter.spellcasting
  const spellSlots = derivedStats.spellSlots

  // Determine if this is a prepared caster
  const isPreparedCaster = spellcastingData.type === 'prepared'
  const preparedCount = spellcastingData.preparedSpells.length
  const preparedMax = derivedStats.spellsPrepared

  // Get all spell levels that this character has access to
  const availableLevels = Object.keys(spellSlots)
    .map(Number)
    .filter(level => level > 0 && spellSlots[level] > 0)
    .sort((a, b) => a - b)

  if (availableLevels.length === 0) {
    return (
      <section className="space-y-3" data-testid="spell-slots-section">
        <h2 className="text-xl font-serif text-accent-gold">Spell Slots</h2>
        <p className="text-sm text-parchment/60 italic">No spell slots available</p>
      </section>
    )
  }

  return (
    <section className="space-y-6" data-testid="spell-slots-section">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif text-accent-gold">Spell Slots</h2>
        {isPreparedCaster && (
          <div className="text-sm text-parchment/60">
            Prepared: <span className="text-accent-gold font-semibold">{preparedCount}</span> / {preparedMax}
          </div>
        )}
      </div>

      {/* Warlock Pact Magic (if applicable) */}
      {spellcastingData.pactMagic && (
        <PactMagicSection pactMagic={spellcastingData.pactMagic} />
      )}

      {/* Spell level sections */}
      {availableLevels.map(level => (
        <SpellLevelSection
          key={level}
          level={level as SpellLevel}
          spellcastingData={spellcastingData}
          isPreparedCaster={isPreparedCaster}
          canPrepareMore={isPreparedCaster && preparedCount < preparedMax}
          expandedSpellId={expandedSpellId}
          onToggleExpand={setExpandedSpellId}
          onTogglePrepared={(spellId, isPrepared) => {
            if (!activeCharacter.spellcasting) return
            const updated = isPrepared
              ? activeCharacter.spellcasting.preparedSpells.filter(id => id !== spellId)
              : [...activeCharacter.spellcasting.preparedSpells, spellId]
            updateField('spellcasting', {
              ...activeCharacter.spellcasting,
              preparedSpells: updated,
            })
          }}
          onToggleSlot={(slotIndex) => {
            if (!activeCharacter.spellcasting) return
            const usedSlots = activeCharacter.spellcasting.usedSpellSlots[level] ?? 0
            const totalSlots = spellSlots[level] ?? 0
            // Toggle: if clicking an empty slot, mark as used; if clicking a used slot, mark as available
            const newUsed = slotIndex < usedSlots ? usedSlots - 1 : usedSlots + 1
            updateField('spellcasting', {
              ...activeCharacter.spellcasting,
              usedSpellSlots: {
                ...activeCharacter.spellcasting.usedSpellSlots,
                [level]: Math.max(0, Math.min(totalSlots, newUsed)),
              },
            })
          }}
        />
      ))}
    </section>
  )
}

/**
 * PactMagicSection
 * Warlock-specific Pact Magic display
 */
interface PactMagicSectionProps {
  pactMagic: NonNullable<any>['pactMagic']
}

function PactMagicSection({ pactMagic }: PactMagicSectionProps) {
  if (!pactMagic) return null

  const available = pactMagic.totalSlots - pactMagic.usedSlots

  return (
    <div
      className="p-4 rounded-lg border bg-purple-950/20 border-purple-500/30"
      data-testid="pact-magic-section"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-serif text-purple-300">Pact Magic Slots</h3>
        <span className="text-xs text-purple-400 italic">Recharge on short rest</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-parchment/80">
        <span>Level {pactMagic.slotLevel} Slots:</span>
        <span className="font-semibold text-parchment">{available} / {pactMagic.totalSlots}</span>
      </div>
    </div>
  )
}

/**
 * SpellLevelSection
 * Section for a single spell level (1-9) with slot tracker and spell list
 */
interface SpellLevelSectionProps {
  level: SpellLevel
  spellcastingData: any
  isPreparedCaster: boolean
  canPrepareMore: boolean
  expandedSpellId: string | null
  onToggleExpand: (spellId: string | null) => void
  onTogglePrepared: (spellId: string, isPrepared: boolean) => void
  onToggleSlot: (slotIndex: number) => void
}

function SpellLevelSection({
  level,
  spellcastingData,
  isPreparedCaster,
  canPrepareMore,
  expandedSpellId,
  onToggleExpand,
  onTogglePrepared,
  onToggleSlot,
}: SpellLevelSectionProps) {
  const { derivedStats } = useCharacterSheet()
  const spellSlots = derivedStats.spellSlots
  const totalSlots = spellSlots[level] ?? 0
  const usedSlots = spellcastingData.usedSpellSlots[level] ?? 0

  // Get spells at this level
  const knownSpellIds = spellcastingData.knownSpells.filter((id: string) => {
    const spell = getSpellById(id)
    return spell?.level === level
  })

  const spells = knownSpellIds
    .map((id: string) => getSpellById(id))
    .filter((spell: Spell | undefined): spell is Spell => spell !== undefined)

  if (spells.length === 0 && totalSlots === 0) return null

  return (
    <div className="space-y-3" data-testid={`spell-level-${level}`}>
      {/* Level header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif text-parchment">
          {SPELL_LEVEL_NAMES[level]}
        </h3>
      </div>

      {/* Spell slot tracker */}
      {totalSlots > 0 && (
        <SpellSlotTracker
          total={totalSlots}
          used={usedSlots}
          onToggle={onToggleSlot}
        />
      )}

      {/* Spell list */}
      {spells.length > 0 ? (
        <div className="space-y-2">
          {spells.map((spell: Spell) => (
            <SpellRow
              key={spell.id}
              spell={spell}
              isPrepared={spellcastingData.preparedSpells.includes(spell.id)}
              isPreparedCaster={isPreparedCaster}
              canTogglePrepared={isPreparedCaster && (
                spellcastingData.preparedSpells.includes(spell.id) || canPrepareMore
              )}
              isExpanded={expandedSpellId === spell.id}
              onToggleExpand={() => onToggleExpand(
                expandedSpellId === spell.id ? null : spell.id
              )}
              onTogglePrepared={() => onTogglePrepared(
                spell.id,
                spellcastingData.preparedSpells.includes(spell.id)
              )}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-parchment/50 italic">No spells known at this level</p>
      )}
    </div>
  )
}

/**
 * SpellSlotTracker
 * Circle tracker for spell slots (always interactive)
 */
interface SpellSlotTrackerProps {
  total: number
  used: number
  onToggle: (slotIndex: number) => void
}

function SpellSlotTracker({ total, used, onToggle }: SpellSlotTrackerProps) {
  return (
    <div className="flex items-center gap-2" data-testid="spell-slot-tracker">
      <span className="text-xs text-parchment/60">Slots:</span>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const isUsed = i < used
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(i)}
              className={cn(
                'w-5 h-5 rounded-full border-2 transition-all',
                'hover:scale-110 cursor-pointer',
                isUsed
                  ? 'bg-parchment/20 border-parchment/40'
                  : 'bg-accent-gold/80 border-accent-gold'
              )}
              aria-label={`Spell slot ${i + 1}${isUsed ? ' (used)' : ' (available)'}`}
              data-testid={`slot-${i}`}
            />
          )
        })}
      </div>
      <span className="text-xs text-parchment/60 ml-2">
        {total - used} / {total} available
      </span>
    </div>
  )
}

/**
 * SpellRow
 * Individual spell in the list
 */
interface SpellRowProps {
  spell: Spell
  isPrepared: boolean
  isPreparedCaster: boolean
  canTogglePrepared: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onTogglePrepared: () => void
}

function SpellRow({
  spell,
  isPrepared,
  isPreparedCaster,
  canTogglePrepared,
  isExpanded,
  onToggleExpand,
  onTogglePrepared,
}: SpellRowProps) {
  const schoolConfig = SCHOOL_CONFIG[spell.school]
  const castingTimeText = formatCastingTime(spell.castingTime)

  return (
    <div
      className={cn(
        'border rounded-lg p-3 transition-all',
        'bg-bg-secondary border-parchment/20',
        'hover:border-parchment/40',
        isExpanded && 'border-accent-gold/60'
      )}
      data-testid={`spell-${spell.id}`}
    >
      {/* Spell header row */}
      <div className="flex items-start gap-3">
        {/* Prepared checkbox or Known badge */}
        {isPreparedCaster ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (canTogglePrepared) {
                onTogglePrepared()
              }
            }}
            disabled={!canTogglePrepared}
            className={cn(
              'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
              'transition-all mt-0.5',
              isPrepared
                ? 'bg-accent-gold border-accent-gold'
                : 'bg-transparent border-parchment/40',
              canTogglePrepared ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'
            )}
            aria-label={`${isPrepared ? 'Unprepare' : 'Prepare'} ${spell.name}`}
            data-testid={`prepare-checkbox-${spell.id}`}
          >
            {isPrepared && <span className="text-primary text-xs">✓</span>}
          </button>
        ) : (
          <span
            className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 flex-shrink-0"
            data-testid={`known-badge-${spell.id}`}
          >
            Known
          </span>
        )}

        {/* Spell info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggleExpand}>
          <div className="flex items-start gap-2">
            <span className="text-base">{schoolConfig.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-parchment flex items-center gap-2 flex-wrap">
                <span>{spell.name}</span>
                {spell.concentration && (
                  <span className="text-xs text-cyan-400" title="Concentration">⚠️</span>
                )}
                {spell.ritual && (
                  <span className="text-xs text-purple-400" title="Ritual">📜</span>
                )}
              </h4>
              <div className="flex flex-wrap gap-2 mt-1 text-xs text-parchment/60">
                <span className={schoolConfig.color}>
                  {spell.school.charAt(0).toUpperCase() + spell.school.slice(1)}
                </span>
                <span>•</span>
                <span>{castingTimeText}</span>
              </div>
            </div>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-parchment/10 space-y-2">
              <div className="text-xs text-parchment/60 space-y-1">
                <div>
                  <span className="font-semibold">Range: </span>
                  {formatRange(spell.range)}
                </div>
                <div>
                  <span className="font-semibold">Components: </span>
                  {formatComponents(spell.components)}
                </div>
                <div>
                  <span className="font-semibold">Duration: </span>
                  {formatDuration(spell.duration)}
                </div>
              </div>
              <p className="text-sm text-parchment/80 leading-relaxed">
                {spell.description}
              </p>
              {spell.higherLevelDescription && (
                <p className="text-xs text-parchment/70 italic">
                  <span className="font-semibold">At Higher Levels: </span>
                  {spell.higherLevelDescription}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper formatting functions
function formatCastingTime(castingTime: Spell['castingTime']): string {
  if (castingTime.unit === 'action') return '1 action'
  if (castingTime.unit === 'bonus-action') return '1 bonus action'
  if (castingTime.unit === 'reaction') return '1 reaction'
  return `${castingTime.value} ${castingTime.unit}${castingTime.value !== 1 ? 's' : ''}`
}

function formatRange(range: Spell['range']): string {
  if (range.type === 'self') {
    if (range.shape && range.areaSize) {
      return `Self (${range.areaSize}-foot ${range.shape})`
    }
    return 'Self'
  }
  if (range.type === 'touch') return 'Touch'
  if (range.type === 'sight') return 'Sight'
  if (range.type === 'unlimited') return 'Unlimited'
  if (range.type === 'ranged' && range.distance && range.unit) {
    return `${range.distance} ${range.unit}`
  }
  return 'Unknown'
}

function formatComponents(components: Spell['components']): string {
  const parts = []
  if (components.verbal) parts.push('V')
  if (components.somatic) parts.push('S')
  if (components.material) {
    if (components.materialDescription) {
      parts.push(`M (${components.materialDescription})`)
    } else {
      parts.push('M')
    }
  }
  return parts.join(', ')
}

function formatDuration(duration: Spell['duration']): string {
  if (duration.type === 'instantaneous') return 'Instantaneous'
  if (duration.type === 'concentration') {
    return `Concentration, up to ${duration.value} ${duration.unit}${duration.value !== 1 ? 's' : ''}`
  }
  if (duration.type === 'timed') {
    return `${duration.value} ${duration.unit}${duration.value !== 1 ? 's' : ''}`
  }
  if (duration.type === 'until-dispelled') return 'Until dispelled'
  return 'Unknown'
}
