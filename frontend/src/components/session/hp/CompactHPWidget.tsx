/**
 * CompactHPWidget (Story 27.3)
 *
 * Sticky floating mobile widget that shows HP and AC at a glance.
 * Visible only on small screens (sm and below). Can collapse to a small
 * pill for minimal screen real-estate usage. Tapping opens the
 * DamageHealModal for quick adjustments. Persists across tab changes
 * via fixed positioning.
 */

import { useState, useCallback } from 'react'
import type { DamageType } from '@/types/core'
import type { DeathSaves } from '@/types/combat'
import { cn } from '@/lib/utils'
import { Heart, Shield, ChevronDown, ChevronUp, Skull } from 'lucide-react'
import { DamageHealModal } from './DamageHealModal'
import type { ModalTab } from './DamageHealModal'
import type { DamageRelation } from '@/utils/hp-tracker'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CompactHPWidgetProps {
  hpCurrent: number
  hpMax: number
  tempHp: number
  ac: number
  deathSaves: DeathSaves
  resistances?: DamageType[]
  vulnerabilities?: DamageType[]
  immunities?: DamageType[]
  onApplyDamage: (
    amount: number,
    effective: number,
    damageType?: DamageType,
    damageRelation?: DamageRelation | null,
  ) => void
  onApplyHealing: (amount: number, effective: number, source?: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CompactHPWidget({
  hpCurrent,
  hpMax,
  tempHp,
  ac,
  deathSaves,
  resistances = [],
  vulnerabilities = [],
  immunities = [],
  onApplyDamage,
  onApplyHealing,
}: CompactHPWidgetProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<ModalTab>('damage')

  const hpPercentage = hpMax > 0 ? (hpCurrent / hpMax) * 100 : 0
  const isDead = deathSaves.failures >= 3

  const getBarColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-800'
    if (percentage <= 24) return 'bg-damage-red'
    if (percentage <= 74) return 'bg-yellow-500'
    return 'bg-healing-green'
  }

  const getTextColor = (percentage: number) => {
    if (percentage === 0) return 'text-gray-500'
    if (percentage <= 24) return 'text-damage-red'
    if (percentage <= 74) return 'text-yellow-500'
    return 'text-healing-green'
  }

  const openModal = useCallback((tab: ModalTab) => {
    setModalTab(tab)
    setModalOpen(true)
  }, [])

  const toggleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setCollapsed((prev) => !prev)
  }, [])

  // Collapsed pill view
  if (collapsed) {
    return (
      <>
        <div
          className="fixed bottom-4 right-4 z-40 sm:hidden"
          data-testid="compact-hp-widget"
        >
          <button
            onClick={toggleCollapse}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-lg border',
              'bg-bg-secondary border-parchment/30',
            )}
            aria-label="Expand HP widget"
            data-testid="expand-widget"
            type="button"
          >
            <Heart className={cn('w-3.5 h-3.5', getTextColor(hpPercentage))} />
            <span className={cn('text-sm font-heading font-bold', getTextColor(hpPercentage))}>
              {hpCurrent}
            </span>
            <ChevronUp className="w-3 h-3 text-parchment/50" />
          </button>
        </div>

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
          onApplyDamage={onApplyDamage}
          onApplyHealing={onApplyHealing}
        />
      </>
    )
  }

  // Expanded widget view
  return (
    <>
      <div
        className="fixed bottom-4 right-4 left-4 z-40 sm:hidden"
        data-testid="compact-hp-widget"
      >
        <div className="bg-bg-secondary border-2 border-parchment/30 rounded-xl shadow-2xl p-3">
          {/* Top row: HP, AC, collapse */}
          <div className="flex items-center gap-3">
            {/* HP section -- tappable */}
            <button
              onClick={() => openModal('damage')}
              className="flex-1 flex items-center gap-2"
              aria-label="Open damage modal"
              data-testid="hp-tap-area"
              type="button"
            >
              {isDead ? (
                <Skull className="w-5 h-5 text-damage-red" />
              ) : (
                <Heart className={cn('w-5 h-5', getTextColor(hpPercentage))} />
              )}
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    'text-2xl font-heading font-bold',
                    getTextColor(hpPercentage),
                  )}
                  data-testid="compact-hp-current"
                >
                  {hpCurrent}
                </span>
                <span className="text-sm text-parchment/50">/ {hpMax}</span>
              </div>
              {tempHp > 0 && (
                <span className="text-xs text-blue-300 bg-blue-500/15 px-1.5 py-0.5 rounded">
                  +{tempHp}
                </span>
              )}
            </button>

            {/* AC display */}
            <div
              className="flex items-center gap-1 px-2 py-1 rounded bg-bg-primary/50"
              data-testid="compact-ac-display"
            >
              <Shield className="w-4 h-4 text-accent-gold" />
              <span className="text-lg font-heading font-bold text-accent-gold">
                {ac}
              </span>
            </div>

            {/* Collapse button */}
            <button
              onClick={toggleCollapse}
              className="p-1 rounded hover:bg-bg-primary/50 text-parchment/50 hover:text-parchment transition-colors"
              aria-label="Collapse HP widget"
              data-testid="collapse-widget"
              type="button"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* HP bar */}
          <div
            className="relative h-2 bg-bg-primary/50 rounded-full overflow-hidden mt-2"
            data-testid="compact-hp-bar"
          >
            <div
              className={cn('h-full transition-all duration-300', getBarColor(hpPercentage))}
              style={{ width: `${Math.min(hpPercentage, 100)}%` }}
            />
            {tempHp > 0 && (
              <div
                className="absolute top-0 h-full bg-blue-500/60 transition-all duration-300"
                style={{
                  left: `${Math.min(hpPercentage, 100)}%`,
                  width: `${Math.min((tempHp / hpMax) * 100, 100 - Math.min(hpPercentage, 100))}%`,
                }}
              />
            )}
          </div>

          {/* Quick action buttons */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => openModal('damage')}
              className="flex-1 text-xs text-damage-red bg-damage-red/10 border border-damage-red/20 rounded py-1.5 hover:bg-damage-red/20 transition-colors font-semibold"
              aria-label="Take damage"
              data-testid="quick-damage"
              type="button"
            >
              Damage
            </button>
            <button
              onClick={() => openModal('heal')}
              className="flex-1 text-xs text-healing-green bg-healing-green/10 border border-healing-green/20 rounded py-1.5 hover:bg-healing-green/20 transition-colors font-semibold"
              aria-label="Heal"
              data-testid="quick-heal"
              type="button"
            >
              Heal
            </button>
          </div>
        </div>
      </div>

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
        onApplyDamage={onApplyDamage}
        onApplyHealing={onApplyHealing}
      />
    </>
  )
}
