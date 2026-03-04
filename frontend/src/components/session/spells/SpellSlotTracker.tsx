/**
 * SpellSlotTracker Component (Story 28.1, 28.2, 28.3)
 *
 * Main orchestrator for session spell slot management. Composes:
 * - SlotSummary: running availability summary with color coding
 * - SlotCircleRow: interactive circles per spell level
 * - PactMagicTracker: Warlock Pact Magic section
 * - CastSpellPrompt: cast-to-expend dialog with upcast/ritual options
 * - ArcaneRecoveryModal: Wizard Arcane Recovery feature
 * - Long rest recovery button
 */

import { useState, useCallback } from 'react'
import type { Spell } from '@/types/spell'
import type { PactMagic } from '@/types/spell'
import { cn } from '@/lib/utils'
import {
  expendSlot,
  restoreSlot,
  restoreAllSlots,
  expendPactSlot,
  restorePactSlots,
  applyArcaneRecovery,
  canCastAtLevel,
  formatSpellLevel,
} from '@/utils/spell-slots'
import { SlotSummary } from './SlotSummary'
import { SlotCircleRow } from './SlotCircleRow'
import { CastSpellPrompt } from './CastSpellPrompt'
import { PactMagicTracker } from './PactMagicTracker'
import { ArcaneRecoveryModal } from './ArcaneRecoveryModal'

export interface SpellSlotTrackerProps {
  /** Maximum slots by level (e.g., { 1: 4, 2: 3, 3: 2 }) */
  maxSlots: Record<number, number>
  /** Used slots by level */
  usedSlots: Record<number, number>
  /** Called when usedSlots changes */
  onUsedSlotsChange: (usedSlots: Record<number, number>) => void
  /** Pact Magic data (if Warlock) */
  pactMagic?: PactMagic
  /** Called when pact magic changes */
  onPactMagicChange?: (pactMagic: PactMagic) => void
  /** Wizard level (if Wizard, for Arcane Recovery) */
  wizardLevel?: number
  /** Whether Arcane Recovery has been used today */
  arcaneRecoveryUsed?: boolean
  /** Called when Arcane Recovery is used */
  onArcaneRecoveryUse?: (selectedSlots: number[]) => void
  /** Called when all standard slots should be restored (long rest) */
  onLongRest?: () => void
  /** List of known/prepared spells for cast-to-expend functionality */
  spells?: Spell[]
}

export function SpellSlotTracker({
  maxSlots,
  usedSlots,
  onUsedSlotsChange,
  pactMagic,
  onPactMagicChange,
  wizardLevel,
  arcaneRecoveryUsed = false,
  onArcaneRecoveryUse,
  onLongRest,
  spells,
}: SpellSlotTrackerProps) {
  const [castingSpell, setCastingSpell] = useState<Spell | null>(null)
  const [showArcaneRecovery, setShowArcaneRecovery] = useState(false)

  // Get available spell levels
  const slotLevels = Object.keys(maxSlots)
    .map(Number)
    .filter(level => (maxSlots[level] ?? 0) > 0)
    .sort((a, b) => a - b)

  // Slot toggle handler
  const handleToggleSlot = useCallback(
    (level: number, slotIndex: number) => {
      const used = usedSlots[level] ?? 0
      // If clicking an index below the used count, restore; otherwise expend
      const newUsedSlots = slotIndex < used
        ? restoreSlot(usedSlots, level)
        : expendSlot(usedSlots, level)
      onUsedSlotsChange(newUsedSlots)
    },
    [usedSlots, onUsedSlotsChange],
  )

  // Pact Magic toggle handler
  const handleTogglePactSlot = useCallback(
    (slotIndex: number) => {
      if (!pactMagic || !onPactMagicChange) return
      const isUsed = slotIndex < pactMagic.usedSlots
      onPactMagicChange(
        isUsed
          ? { ...pactMagic, usedSlots: Math.max(0, pactMagic.usedSlots - 1) }
          : expendPactSlot(pactMagic),
      )
    },
    [pactMagic, onPactMagicChange],
  )

  // Pact Magic short rest recovery
  const handlePactShortRest = useCallback(() => {
    if (!pactMagic || !onPactMagicChange) return
    onPactMagicChange(restorePactSlots(pactMagic))
  }, [pactMagic, onPactMagicChange])

  // Mystic Arcanum handlers
  const handleUseMysticArcanum = useCallback(
    (level: number) => {
      if (!pactMagic || !onPactMagicChange || !pactMagic.mysticArcanum) return
      const arcanum = pactMagic.mysticArcanum[level]
      if (!arcanum) return
      onPactMagicChange({
        ...pactMagic,
        mysticArcanum: {
          ...pactMagic.mysticArcanum,
          [level]: { ...arcanum, used: true },
        },
      })
    },
    [pactMagic, onPactMagicChange],
  )

  const handleResetMysticArcanum = useCallback(
    (level: number) => {
      if (!pactMagic || !onPactMagicChange || !pactMagic.mysticArcanum) return
      const arcanum = pactMagic.mysticArcanum[level]
      if (!arcanum) return
      onPactMagicChange({
        ...pactMagic,
        mysticArcanum: {
          ...pactMagic.mysticArcanum,
          [level]: { ...arcanum, used: false },
        },
      })
    },
    [pactMagic, onPactMagicChange],
  )

  // Cast spell handler
  const handleCastWithSlot = useCallback(
    (slotLevel: number) => {
      onUsedSlotsChange(expendSlot(usedSlots, slotLevel))
      setCastingSpell(null)
    },
    [usedSlots, onUsedSlotsChange],
  )

  // Long rest handler
  const handleLongRest = useCallback(() => {
    onUsedSlotsChange(restoreAllSlots(usedSlots))
    if (pactMagic && onPactMagicChange) {
      const restored = restorePactSlots(pactMagic)
      // Also reset Mystic Arcanum
      if (pactMagic.mysticArcanum) {
        const resetArcanum: Record<number, { spellId: string; used: boolean }> = {}
        for (const [level, data] of Object.entries(pactMagic.mysticArcanum)) {
          resetArcanum[Number(level)] = { ...data, used: false }
        }
        onPactMagicChange({ ...restored, mysticArcanum: resetArcanum })
      } else {
        onPactMagicChange(restored)
      }
    }
    onLongRest?.()
  }, [usedSlots, onUsedSlotsChange, pactMagic, onPactMagicChange, onLongRest])

  // Arcane Recovery handler
  const handleArcaneRecoveryConfirm = useCallback(
    (selectedSlots: number[]) => {
      const newUsedSlots = applyArcaneRecovery(usedSlots, maxSlots, selectedSlots)
      onUsedSlotsChange(newUsedSlots)
      onArcaneRecoveryUse?.(selectedSlots)
      setShowArcaneRecovery(false)
    },
    [usedSlots, maxSlots, onUsedSlotsChange, onArcaneRecoveryUse],
  )

  // Spell casting initiator (for spell list integration)
  const handleSpellClick = useCallback(
    (spell: Spell) => {
      if (spell.level === 0) return // Cantrips don't need slots
      setCastingSpell(spell)
    },
    [],
  )

  return (
    <div className="space-y-4" data-testid="spell-slot-tracker">
      {/* Slot Summary */}
      <SlotSummary maxSlots={maxSlots} usedSlots={usedSlots} />

      {/* Pact Magic (if Warlock) */}
      {pactMagic && onPactMagicChange && (
        <PactMagicTracker
          pactMagic={pactMagic}
          onToggleSlot={handleTogglePactSlot}
          onShortRestRecover={handlePactShortRest}
          onUseMysticArcanum={handleUseMysticArcanum}
          onResetMysticArcanum={handleResetMysticArcanum}
        />
      )}

      {/* Standard Spell Slot Rows */}
      <div className="space-y-2">
        {slotLevels.map(level => (
          <SlotCircleRow
            key={level}
            level={level}
            total={maxSlots[level] ?? 0}
            used={usedSlots[level] ?? 0}
            onToggle={(slotIndex: number) => handleToggleSlot(level, slotIndex)}
            label={`${formatSpellLevel(level)}`}
          />
        ))}
      </div>

      {/* Spell list with dimming for no-slot levels */}
      {spells && spells.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-parchment/10">
          {spells
            .filter(spell => spell.level > 0)
            .map(spell => {
              const hasSlots = canCastAtLevel(usedSlots, maxSlots, spell.level)
              return (
                <button
                  key={spell.id}
                  type="button"
                  onClick={() => handleSpellClick(spell)}
                  className={cn(
                    'w-full text-left px-3 py-1.5 rounded text-sm transition-all',
                    hasSlots
                      ? 'text-parchment/80 hover:bg-parchment/10 cursor-pointer'
                      : 'text-parchment/30 cursor-pointer',
                  )}
                  title={hasSlots ? `Cast ${spell.name}` : 'No slots available'}
                  data-testid={`spell-cast-${spell.id}`}
                >
                  <span className="font-medium">{spell.name}</span>
                  <span className="text-xs text-parchment/40 ml-2">
                    {formatSpellLevel(spell.level)}
                  </span>
                  {!hasSlots && (
                    <span className="text-xs text-red-400/60 ml-2">
                      (no slots)
                    </span>
                  )}
                  {spell.ritual && (
                    <span className="text-xs text-purple-400/60 ml-2">
                      (ritual)
                    </span>
                  )}
                </button>
              )
            })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        {/* Long Rest button */}
        <button
          type="button"
          onClick={handleLongRest}
          className="px-3 py-1.5 rounded-lg border bg-blue-950/20 border-blue-500/30 text-xs font-medium text-blue-300 hover:bg-blue-950/40 transition-all cursor-pointer"
          data-testid="long-rest-button"
        >
          Long Rest (Restore All)
        </button>

        {/* Arcane Recovery button (Wizard only) */}
        {wizardLevel !== undefined && wizardLevel > 0 && (
          <button
            type="button"
            onClick={() => setShowArcaneRecovery(true)}
            disabled={arcaneRecoveryUsed}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
              arcaneRecoveryUsed
                ? 'bg-parchment/5 border-parchment/20 text-parchment/30 cursor-not-allowed'
                : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/40 cursor-pointer',
            )}
            data-testid="arcane-recovery-button"
          >
            Arcane Recovery (1/day)
            {arcaneRecoveryUsed && (
              <span className="ml-1 text-parchment/40">[Used]</span>
            )}
          </button>
        )}
      </div>

      {/* Cast Spell Prompt */}
      {castingSpell && (
        <CastSpellPrompt
          spell={castingSpell}
          maxSlots={maxSlots}
          usedSlots={usedSlots}
          onCastWithSlot={handleCastWithSlot}
          onCastAsRitual={() => setCastingSpell(null)}
          onCancel={() => setCastingSpell(null)}
          onOverrideCast={() => setCastingSpell(null)}
        />
      )}

      {/* Arcane Recovery Modal */}
      {showArcaneRecovery && wizardLevel !== undefined && (
        <ArcaneRecoveryModal
          wizardLevel={wizardLevel}
          maxSlots={maxSlots}
          usedSlots={usedSlots}
          usedToday={arcaneRecoveryUsed}
          onConfirm={handleArcaneRecoveryConfirm}
          onCancel={() => setShowArcaneRecovery(false)}
        />
      )}
    </div>
  )
}
