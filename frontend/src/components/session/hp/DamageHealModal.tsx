/**
 * DamageHealModal (Story 27.1)
 *
 * Enhanced damage/heal modal with tabbed interface, damage type selection,
 * resistance/vulnerability auto-calculation, healing with source tracking,
 * real-time preview, and massive damage detection.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { DamageType } from '@/types/core'
import { cn } from '@/lib/utils'
import { Swords, Heart, AlertTriangle, X } from 'lucide-react'
import { applyDamage, applyHealing } from '@/utils/hp-tracker'
import type { DamageRelation } from '@/utils/hp-tracker'
import { DamageTypeSelector } from './DamageTypeSelector'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ModalTab = 'damage' | 'heal'

interface DamageHealModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: ModalTab
  hpCurrent: number
  hpMax: number
  tempHp: number
  resistances?: DamageType[]
  vulnerabilities?: DamageType[]
  immunities?: DamageType[]
  onApplyDamage: (amount: number, effective: number, damageType?: DamageType, damageRelation?: DamageRelation | null) => void
  onApplyHealing: (amount: number, effective: number, source?: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DamageHealModal({
  isOpen,
  onClose,
  initialTab = 'damage',
  hpCurrent,
  hpMax,
  tempHp,
  resistances = [],
  vulnerabilities = [],
  immunities = [],
  onApplyDamage,
  onApplyHealing,
}: DamageHealModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>(initialTab)
  const [amount, setAmount] = useState('')
  const [selectedDamageType, setSelectedDamageType] = useState<DamageType | null>(null)
  const [healSource, setHealSource] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      setAmount('')
      setSelectedDamageType(null)
      setHealSource('')
      // Focus input after a brief delay for the modal to render
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen, initialTab])

  const parsedAmount = parseInt(amount) || 0

  // Real-time preview for damage
  const damagePreview = activeTab === 'damage' && parsedAmount > 0
    ? applyDamage(hpCurrent, tempHp, hpMax, parsedAmount, selectedDamageType ?? undefined, resistances, vulnerabilities, immunities)
    : null

  // Real-time preview for healing
  const healingPreview = activeTab === 'heal' && parsedAmount > 0
    ? applyHealing(hpCurrent, hpMax, parsedAmount)
    : null

  const handleApply = useCallback(() => {
    if (parsedAmount <= 0) return

    if (activeTab === 'damage') {
      const result = applyDamage(
        hpCurrent,
        tempHp,
        hpMax,
        parsedAmount,
        selectedDamageType ?? undefined,
        resistances,
        vulnerabilities,
        immunities,
      )
      onApplyDamage(
        parsedAmount,
        result.effectiveDamage,
        selectedDamageType ?? undefined,
        result.damageRelation,
      )
    } else {
      const result = applyHealing(hpCurrent, hpMax, parsedAmount)
      onApplyHealing(parsedAmount, result.actualHealing, healSource || undefined)
    }

    onClose()
  }, [activeTab, parsedAmount, hpCurrent, tempHp, hpMax, selectedDamageType, resistances, vulnerabilities, immunities, healSource, onApplyDamage, onApplyHealing, onClose])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleApply()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleApply, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      data-testid="damage-heal-modal"
      role="dialog"
      aria-label="Damage and Healing"
    >
      <div className="bg-bg-secondary border-2 border-parchment/30 rounded-lg w-full max-w-sm max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-parchment/20">
          <h2 className="text-lg font-heading text-parchment">HP Adjustment</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-bg-primary/50 text-parchment/60 hover:text-parchment transition-colors"
            aria-label="Close modal"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-parchment/20">
          <button
            onClick={() => setActiveTab('damage')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors',
              activeTab === 'damage'
                ? 'text-damage-red border-b-2 border-damage-red bg-damage-red/5'
                : 'text-parchment/50 hover:text-parchment/80',
            )}
            aria-label="Take Damage tab"
            data-testid="tab-damage"
            type="button"
          >
            <Swords className="w-4 h-4" />
            Take Damage
          </button>
          <button
            onClick={() => setActiveTab('heal')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors',
              activeTab === 'heal'
                ? 'text-healing-green border-b-2 border-healing-green bg-healing-green/5'
                : 'text-parchment/50 hover:text-parchment/80',
            )}
            aria-label="Heal tab"
            data-testid="tab-heal"
            type="button"
          >
            <Heart className="w-4 h-4" />
            Heal
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs text-parchment/60 uppercase tracking-wider mb-1.5">
              {activeTab === 'damage' ? 'Damage Amount' : 'Healing Amount'}
            </label>
            <input
              ref={inputRef}
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-bg-primary border border-parchment/30 rounded-lg px-4 py-3 text-2xl text-center text-parchment font-heading focus:outline-none focus:border-accent-gold"
              data-testid="hp-amount-input"
              inputMode="numeric"
              autoFocus
            />
          </div>

          {/* Damage Type Selector (damage tab only) */}
          {activeTab === 'damage' && (
            <div>
              <label className="block text-xs text-parchment/60 uppercase tracking-wider mb-1.5">
                Damage Type (optional)
              </label>
              <DamageTypeSelector
                selected={selectedDamageType}
                onSelect={setSelectedDamageType}
                resistances={resistances}
                vulnerabilities={vulnerabilities}
                immunities={immunities}
              />
            </div>
          )}

          {/* Healing Source (heal tab only) */}
          {activeTab === 'heal' && (
            <div>
              <label className="block text-xs text-parchment/60 uppercase tracking-wider mb-1.5">
                Source (optional)
              </label>
              <input
                type="text"
                value={healSource}
                onChange={(e) => setHealSource(e.target.value)}
                placeholder="e.g., Cure Wounds, Potion"
                className="w-full bg-bg-primary border border-parchment/30 rounded px-3 py-2 text-parchment text-sm focus:outline-none focus:border-accent-gold"
                data-testid="heal-source-input"
              />
            </div>
          )}

          {/* Real-time Preview */}
          {damagePreview && parsedAmount > 0 && (
            <div
              className="rounded-lg border border-parchment/20 bg-bg-primary/50 p-3"
              data-testid="damage-preview"
            >
              {/* Damage relation info */}
              {damagePreview.damageRelation === 'resistance' && (
                <div className="text-xs text-blue-400 mb-1" data-testid="damage-relation-text">
                  Resisted: half damage
                </div>
              )}
              {damagePreview.damageRelation === 'vulnerability' && (
                <div className="text-xs text-red-400 mb-1" data-testid="damage-relation-text">
                  Vulnerable: double damage
                </div>
              )}
              {damagePreview.damageRelation === 'immunity' && (
                <div className="text-xs text-gray-400 mb-1" data-testid="damage-relation-text">
                  Immune: no damage
                </div>
              )}

              <div className="text-sm text-parchment">
                <span className="text-parchment/60">Current: </span>
                <span className="font-semibold">{hpCurrent}</span>
                {tempHp > 0 && (
                  <span className="text-blue-300"> (+{tempHp} temp)</span>
                )}
                <span className="text-parchment/60"> {'->'} After: </span>
                <span
                  className={cn(
                    'font-semibold',
                    damagePreview.newCurrent === 0 ? 'text-damage-red' : 'text-parchment',
                  )}
                >
                  {damagePreview.newCurrent}
                </span>
                {damagePreview.newTemp > 0 && (
                  <span className="text-blue-300"> (+{damagePreview.newTemp} temp)</span>
                )}
                <span className="text-parchment/40">
                  {' '}({damagePreview.effectiveDamage} damage)
                </span>
              </div>

              {/* Instant death warning */}
              {damagePreview.instantDeath && (
                <div
                  className="flex items-center gap-2 mt-2 p-2 rounded bg-damage-red/20 border border-damage-red/50 text-damage-red text-sm"
                  data-testid="instant-death-warning"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold">
                    Massive Damage! Instant death: damage exceeds max HP.
                  </span>
                </div>
              )}

              {/* Unconscious warning */}
              {damagePreview.newCurrent === 0 && !damagePreview.instantDeath && hpCurrent > 0 && (
                <div className="text-xs text-yellow-400 mt-1" data-testid="unconscious-warning">
                  Character falls unconscious. Death saves begin.
                </div>
              )}
            </div>
          )}

          {healingPreview && parsedAmount > 0 && (
            <div
              className="rounded-lg border border-parchment/20 bg-bg-primary/50 p-3"
              data-testid="healing-preview"
            >
              <div className="text-sm text-parchment">
                <span className="text-parchment/60">Current: </span>
                <span className="font-semibold">{hpCurrent}</span>
                <span className="text-parchment/60"> {'->'} After: </span>
                <span className="font-semibold text-healing-green">
                  {healingPreview.newCurrent}
                </span>
                <span className="text-parchment/40">
                  {' '}(+{healingPreview.actualHealing} HP)
                </span>
              </div>

              {/* Stabilized message */}
              {healingPreview.stabilized && (
                <div className="text-xs text-healing-green mt-1" data-testid="stabilized-message">
                  Stabilized! Death saves reset.
                </div>
              )}

              {/* Overheal warning */}
              {parsedAmount > healingPreview.actualHealing && healingPreview.actualHealing > 0 && (
                <div className="text-xs text-parchment/40 mt-1">
                  Capped at max HP ({hpMax})
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 pt-0 flex gap-2">
          <button
            onClick={handleApply}
            disabled={parsedAmount <= 0}
            className={cn(
              'flex-1 rounded-lg py-2.5 font-semibold text-sm transition-colors',
              activeTab === 'damage'
                ? 'bg-damage-red text-white hover:bg-damage-red/80 disabled:bg-damage-red/30'
                : 'bg-healing-green text-white hover:bg-healing-green/80 disabled:bg-healing-green/30',
              'disabled:cursor-not-allowed',
            )}
            data-testid="apply-button"
            type="button"
          >
            Apply {activeTab === 'damage' ? 'Damage' : 'Healing'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-parchment/10 text-parchment rounded-lg py-2.5 hover:bg-parchment/20 transition-colors text-sm"
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
