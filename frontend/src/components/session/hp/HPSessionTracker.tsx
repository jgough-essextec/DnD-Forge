/**
 * HPSessionTracker (Epic 27)
 *
 * Orchestrator component that composes the DamageHealModal, TempHPManager,
 * DeathSaveTracker, and event history into a unified HP tracking interface
 * for session play.
 */

import { useState, useCallback } from 'react'
import type { DamageType } from '@/types/core'
import type { DeathSaves } from '@/types/combat'
import { Heart, Minus, Plus, Skull } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  applyDamage,
  applyHealing,
  createDamageEvent,
  createHealingEvent,
  formatHPEvent,
} from '@/utils/hp-tracker'
import type { HPEvent, DamageRelation } from '@/utils/hp-tracker'
import { DamageHealModal } from './DamageHealModal'
import type { ModalTab } from './DamageHealModal'
import { TempHPManager } from './TempHPManager'
import { DeathSaveTracker } from './DeathSaveTracker'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HPSessionTrackerProps {
  hpCurrent: number
  hpMax: number
  tempHp: number
  deathSaves: DeathSaves
  resistances?: DamageType[]
  vulnerabilities?: DamageType[]
  immunities?: DamageType[]
  onUpdateHP: (current: number) => void
  onUpdateTempHP: (temp: number) => void
  onUpdateDeathSaves: (saves: DeathSaves) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HPSessionTracker({
  hpCurrent,
  hpMax,
  tempHp,
  deathSaves,
  resistances = [],
  vulnerabilities = [],
  immunities = [],
  onUpdateHP,
  onUpdateTempHP,
  onUpdateDeathSaves,
}: HPSessionTrackerProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<ModalTab>('damage')
  const [eventHistory, setEventHistory] = useState<HPEvent[]>([])

  const hpPercentage = hpMax > 0 ? (hpCurrent / hpMax) * 100 : 0

  const getHealthColor = (percentage: number) => {
    if (percentage === 0) return 'text-gray-800'
    if (percentage <= 24) return 'text-damage-red'
    if (percentage <= 74) return 'text-yellow-500'
    return 'text-healing-green'
  }

  const openModal = useCallback((tab: ModalTab) => {
    setModalTab(tab)
    setModalOpen(true)
  }, [])

  const addEvent = useCallback((event: HPEvent) => {
    setEventHistory((prev) => [event, ...prev].slice(0, 10))
  }, [])

  const handleApplyDamage = useCallback((
    amount: number,
    _effective: number,
    damageType?: DamageType,
    damageRelation?: DamageRelation | null,
  ) => {
    const result = applyDamage(
      hpCurrent,
      tempHp,
      hpMax,
      amount,
      damageType,
      resistances,
      vulnerabilities,
      immunities,
    )

    onUpdateHP(result.newCurrent)
    onUpdateTempHP(result.newTemp)

    // If character drops to 0 HP, reset death saves
    if (result.newCurrent === 0 && hpCurrent > 0) {
      onUpdateDeathSaves({ successes: 0, failures: 0, stable: false })
    }

    // Log event
    addEvent(createDamageEvent(amount, result.effectiveDamage, damageType, damageRelation))
  }, [hpCurrent, tempHp, hpMax, resistances, vulnerabilities, immunities, onUpdateHP, onUpdateTempHP, onUpdateDeathSaves, addEvent])

  const handleApplyHealing = useCallback((
    amount: number,
    _effective: number,
    source?: string,
  ) => {
    const result = applyHealing(hpCurrent, hpMax, amount)

    onUpdateHP(result.newCurrent)

    // If healing from 0 HP, reset death saves
    if (result.stabilized) {
      onUpdateDeathSaves({ successes: 0, failures: 0, stable: false })
    }

    addEvent(createHealingEvent(amount, result.actualHealing, source))
  }, [hpCurrent, hpMax, onUpdateHP, onUpdateDeathSaves, addEvent])

  const handleRegainHP = useCallback((hp: number) => {
    onUpdateHP(hp)
  }, [onUpdateHP])

  return (
    <div className="space-y-4" data-testid="hp-session-tracker">
      {/* HP Display */}
      <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-damage-red" />
            <span className="text-xs uppercase tracking-wider text-parchment/60 font-semibold">
              Hit Points
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => openModal('damage')}
              className="p-1.5 rounded hover:bg-bg-primary/50 text-parchment/60 hover:text-damage-red transition-colors"
              aria-label="Take damage"
              data-testid="open-damage-modal"
              type="button"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => openModal('heal')}
              className="p-1.5 rounded hover:bg-bg-primary/50 text-parchment/60 hover:text-healing-green transition-colors"
              aria-label="Heal"
              data-testid="open-heal-modal"
              type="button"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current HP Display */}
        <button
          onClick={() => openModal('damage')}
          className="w-full flex items-baseline gap-2 justify-center mb-3 cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Open HP adjustment modal"
          data-testid="hp-display"
          type="button"
        >
          {hpCurrent === 0 && <Skull className="w-6 h-6 text-gray-800" />}
          <div className={cn('text-5xl font-heading font-bold', getHealthColor(hpPercentage))}>
            {hpCurrent}
          </div>
          <div className="text-2xl text-parchment/50 font-semibold">
            / {hpMax}
          </div>
        </button>

        {/* HP Bar with Temp HP */}
        <TempHPManager
          tempHp={tempHp}
          hpCurrent={hpCurrent}
          hpMax={hpMax}
          onSetTempHP={onUpdateTempHP}
        />
      </div>

      {/* Death Save Tracker */}
      <DeathSaveTracker
        deathSaves={deathSaves}
        hpCurrent={hpCurrent}
        onUpdateDeathSaves={onUpdateDeathSaves}
        onRegainHP={handleRegainHP}
      />

      {/* Event History */}
      {eventHistory.length > 0 && (
        <div
          className="rounded-lg border border-parchment/15 bg-bg-secondary/50 p-3"
          data-testid="hp-event-history"
        >
          <div className="text-xs uppercase tracking-wider text-parchment/50 font-semibold mb-2">
            Recent
          </div>
          <div className="flex flex-wrap gap-1.5">
            {eventHistory.map((event) => (
              <span
                key={event.id}
                className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  event.type === 'damage'
                    ? 'bg-damage-red/10 text-damage-red/80'
                    : 'bg-healing-green/10 text-healing-green/80',
                )}
                data-testid="hp-event"
              >
                [{formatHPEvent(event)}]
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Damage/Heal Modal */}
      <DamageHealModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={modalTab}
        hpCurrent={hpCurrent}
        hpMax={hpMax}
        tempHp={tempHp}
        resistances={resistances}
        vulnerabilities={vulnerabilities}
        immunities={immunities}
        onApplyDamage={handleApplyDamage}
        onApplyHealing={handleApplyHealing}
      />
    </div>
  )
}
