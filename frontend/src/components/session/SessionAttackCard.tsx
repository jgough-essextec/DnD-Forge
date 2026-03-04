/**
 * SessionAttackCard (Epic 32 - Story 32.1)
 *
 * Compact card for a single weapon or cantrip attack in the session view.
 * Shows the attack name, attack bonus, and damage dice. Tapping triggers
 * an attack roll via the dice store.
 */

import { useCallback } from 'react'
import { Sword } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDiceStore } from '@/stores/diceStore'
import { useUIStore } from '@/stores/uiStore'
import type { Attack } from '@/types/combat'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SessionAttackCardProps {
  attack: Attack
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDamage(attack: Attack): string {
  return attack.damageRolls
    .map((dr) => {
      const diceStr = `${dr.dice.count}${dr.dice.die}`
      const mod = dr.dice.modifier ?? 0
      const bonus = (dr.bonus ?? 0) + mod
      const bonusStr = bonus > 0 ? `+${bonus}` : bonus < 0 ? `${bonus}` : ''
      return `${diceStr}${bonusStr} ${dr.damageType}`
    })
    .join(' + ')
}

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionAttackCard({ attack, className }: SessionAttackCardProps) {
  const roll = useDiceStore((s) => s.roll)
  const diceRollerOpen = useUIStore((s) => s.diceRollerOpen)
  const toggleDiceRoller = useUIStore((s) => s.toggleDiceRoller)

  const handleAttackRoll = useCallback(() => {
    if (!diceRollerOpen) {
      toggleDiceRoller()
    }

    // Roll attack: 1d20 + attack bonus
    roll(
      [{ type: 'd20', count: 1 }],
      attack.attackBonus,
      `${attack.name} Attack (${formatModifier(attack.attackBonus)})`,
    )
  }, [diceRollerOpen, toggleDiceRoller, roll, attack])

  const handleDamageRoll = useCallback(() => {
    if (!diceRollerOpen) {
      toggleDiceRoller()
    }

    // Roll damage for each damage roll component
    const dice = attack.damageRolls.map((dr) => ({
      type: dr.dice.die,
      count: dr.dice.count,
    }))
    const totalBonus = attack.damageRolls.reduce(
      (sum, dr) => sum + (dr.bonus ?? 0) + (dr.dice.modifier ?? 0),
      0,
    )

    roll(dice, totalBonus, `${attack.name} Damage`)
  }, [diceRollerOpen, toggleDiceRoller, roll, attack])

  return (
    <div
      className={cn(
        'rounded-lg border border-parchment/20 bg-bg-secondary p-3',
        'min-w-[140px] flex-shrink-0',
        className,
      )}
      data-testid={`attack-card-${attack.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Attack name */}
      <div className="flex items-center gap-1.5 mb-2">
        <Sword className="w-4 h-4 text-accent-gold flex-shrink-0" aria-hidden="true" />
        <span className="text-sm font-heading font-semibold text-parchment truncate">
          {attack.name}
        </span>
      </div>

      {/* Attack roll button */}
      <button
        type="button"
        onClick={handleAttackRoll}
        className={cn(
          'w-full py-2 rounded border border-accent-gold/30 bg-accent-gold/10',
          'text-accent-gold font-bold text-base',
          'hover:bg-accent-gold/20 active:bg-accent-gold/30 transition-colors',
          'min-h-[44px] cursor-pointer',
        )}
        aria-label={`Roll ${attack.name} attack: ${formatModifier(attack.attackBonus)} to hit`}
        data-testid={`attack-roll-${attack.name.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {formatModifier(attack.attackBonus)} to hit
      </button>

      {/* Damage roll button */}
      <button
        type="button"
        onClick={handleDamageRoll}
        className={cn(
          'w-full py-1.5 mt-1.5 rounded border border-damage-red/30 bg-damage-red/10',
          'text-damage-red text-xs font-medium',
          'hover:bg-damage-red/20 active:bg-damage-red/30 transition-colors',
          'min-h-[36px] cursor-pointer',
        )}
        aria-label={`Roll ${attack.name} damage: ${formatDamage(attack)}`}
        data-testid={`damage-roll-${attack.name.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {formatDamage(attack)}
      </button>
    </div>
  )
}
