/**
 * EquipmentSummary (Story 13.3)
 *
 * Displays a summary of the character's equipment selections including:
 * - Total inventory weight vs. carrying capacity
 * - Encumbrance status warnings
 * - AC preview based on equipped armor + DEX modifier
 * - Weapons list with damage dice
 * - Gold remaining (in gold buy mode)
 */

import { useMemo } from 'react'
import { Shield, Swords, Weight, AlertTriangle, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getWeaponById, getArmorById } from '@/data/equipment'
import { getArmorClass } from '@/utils/calculations/combat'
import type { InventoryItem } from '@/types/equipment'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EquipmentSummaryProps {
  equipment: InventoryItem[]
  /** DEX modifier for AC calculation */
  dexModifier: number
  /** STR score for carrying capacity */
  strScore: number
  /** Remaining gold in gold buy mode */
  remainingGold?: number | null
  /** Equipment mode */
  mode: 'starting-equipment' | 'gold-buy'
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Calculate total weight of all inventory items */
export function getTotalWeight(items: InventoryItem[]): number {
  return items.reduce((total, item) => total + item.weight * item.quantity, 0)
}

/** Calculate carrying capacity from STR score */
export function getCarryCapacity(strScore: number): number {
  return strScore * 15
}

/** Get encumbrance status */
export function getEncumbranceStatus(
  totalWeight: number,
  strScore: number,
): { level: 'normal' | 'encumbered' | 'heavily-encumbered' | 'over-capacity'; label: string } {
  const capacity = strScore * 15
  const encumberedThreshold = strScore * 5
  const heavilyEncumberedThreshold = strScore * 10

  if (totalWeight > capacity) {
    return { level: 'over-capacity', label: 'Over Capacity' }
  }
  if (totalWeight > heavilyEncumberedThreshold) {
    return { level: 'heavily-encumbered', label: 'Heavily Encumbered' }
  }
  if (totalWeight > encumberedThreshold) {
    return { level: 'encumbered', label: 'Encumbered' }
  }
  return { level: 'normal', label: 'Normal' }
}

/** Calculate AC preview from equipment */
export function calculateACPreview(
  equipment: InventoryItem[],
  dexModifier: number,
): { ac: number; armorName: string | null; hasShield: boolean } {
  // Find equipped armor (prefer strongest)
  let bestArmor: { baseAC: number; category: string; dexCap: number | null; name: string } | null = null
  let hasShield = false

  for (const item of equipment) {
    if (item.category === 'shield') {
      hasShield = true
      continue
    }
    if (item.category === 'armor') {
      const armorData = getArmorById(item.equipmentId)
      if (armorData && (!bestArmor || armorData.baseAC > bestArmor.baseAC)) {
        bestArmor = {
          baseAC: armorData.baseAC,
          category: armorData.category,
          dexCap: armorData.dexCap,
          name: armorData.name,
        }
      }
    }
  }

  const ac = getArmorClass({
    armor: bestArmor
      ? {
          baseAC: bestArmor.baseAC,
          category: bestArmor.category,
          dexCap: bestArmor.dexCap,
        }
      : undefined,
    shield: hasShield,
    dexModifier,
  })

  return { ac, armorName: bestArmor?.name ?? null, hasShield }
}

/** Extract weapon items from equipment */
function getWeaponItems(equipment: InventoryItem[]): Array<{
  name: string
  damage: string
  quantity: number
}> {
  const weapons: Array<{ name: string; damage: string; quantity: number }> = []

  for (const item of equipment) {
    if (item.category === 'weapon') {
      const weaponData = getWeaponById(item.equipmentId)
      if (weaponData) {
        weapons.push({
          name: weaponData.name,
          damage: `${weaponData.damage.count}d${weaponData.damage.die.replace('d', '')} ${weaponData.damage.type}`,
          quantity: item.quantity,
        })
      } else {
        weapons.push({
          name: item.name,
          damage: '--',
          quantity: item.quantity,
        })
      }
    }
  }

  return weapons
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EquipmentSummary({
  equipment,
  dexModifier,
  strScore,
  remainingGold,
  mode,
}: EquipmentSummaryProps) {
  const totalWeight = useMemo(() => getTotalWeight(equipment), [equipment])
  const carryCapacity = useMemo(() => getCarryCapacity(strScore), [strScore])
  const encumbrance = useMemo(() => getEncumbranceStatus(totalWeight, strScore), [totalWeight, strScore])
  const acPreview = useMemo(() => calculateACPreview(equipment, dexModifier), [equipment, dexModifier])
  const weapons = useMemo(() => getWeaponItems(equipment), [equipment])

  return (
    <div
      className="rounded-lg border border-parchment/15 bg-bg-secondary/30 p-4 space-y-4"
      data-testid="equipment-summary"
      aria-label="Equipment Summary"
    >
      <h4 className="text-sm font-semibold text-parchment/80 uppercase tracking-wider">
        Equipment Summary
      </h4>

      {/* AC Preview */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-parchment/5">
        <div className="flex items-center justify-center h-12 w-12 rounded-full border-2 border-accent-gold/30 bg-accent-gold/5">
          <Shield className="h-6 w-6 text-accent-gold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-parchment" data-testid="ac-preview">
              {acPreview.ac}
            </span>
            <span className="text-sm text-parchment/50">AC</span>
          </div>
          <p className="text-xs text-parchment/40">
            {acPreview.armorName
              ? `${acPreview.armorName}${acPreview.hasShield ? ' + Shield' : ''}`
              : acPreview.hasShield
                ? 'Shield only (no armor)'
                : 'Unarmored (10 + DEX)'}
          </p>
        </div>
      </div>

      {/* Weight & Encumbrance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-parchment/70">
            <Weight className="h-4 w-4" />
            <span>Weight</span>
          </div>
          <span className="text-sm font-mono text-parchment" data-testid="total-weight">
            {totalWeight.toFixed(1)} / {carryCapacity} lb
          </span>
        </div>

        {/* Weight bar */}
        <div className="h-2 rounded-full bg-parchment/10 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              encumbrance.level === 'normal' && 'bg-emerald-500',
              encumbrance.level === 'encumbered' && 'bg-yellow-500',
              encumbrance.level === 'heavily-encumbered' && 'bg-orange-500',
              encumbrance.level === 'over-capacity' && 'bg-red-500',
            )}
            style={{ width: `${Math.min(100, (totalWeight / carryCapacity) * 100)}%` }}
            role="progressbar"
            aria-valuenow={totalWeight}
            aria-valuemax={carryCapacity}
            aria-label="Carrying weight"
          />
        </div>

        {encumbrance.level !== 'normal' && (
          <div className={cn(
            'flex items-center gap-2 text-xs p-2 rounded',
            encumbrance.level === 'encumbered' && 'bg-yellow-500/10 text-yellow-400',
            encumbrance.level === 'heavily-encumbered' && 'bg-orange-500/10 text-orange-400',
            encumbrance.level === 'over-capacity' && 'bg-red-500/10 text-red-400',
          )} role="alert">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              {encumbrance.level === 'encumbered' && 'Encumbered: Speed reduced by 10 ft'}
              {encumbrance.level === 'heavily-encumbered' && 'Heavily Encumbered: Speed -20 ft, disadvantage on STR/DEX/CON checks'}
              {encumbrance.level === 'over-capacity' && 'Over carrying capacity! Speed reduced to 5 ft'}
            </span>
          </div>
        )}
      </div>

      {/* Weapons List */}
      {weapons.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-parchment/70">
            <Swords className="h-4 w-4" />
            <span>Weapons</span>
          </div>
          <div className="space-y-1">
            {weapons.map((weapon, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-parchment/70">
                  {weapon.name}
                  {weapon.quantity > 1 && <span className="text-parchment/40 ml-1">x{weapon.quantity}</span>}
                </span>
                <span className="font-mono text-parchment/50">{weapon.damage}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gold Remaining (gold buy mode only) */}
      {mode === 'gold-buy' && remainingGold !== null && remainingGold !== undefined && (
        <div className="flex items-center justify-between p-2 rounded bg-parchment/5">
          <div className="flex items-center gap-2 text-sm text-parchment/70">
            <Coins className="h-4 w-4 text-accent-gold" />
            <span>Gold Remaining</span>
          </div>
          <span className={cn(
            'text-sm font-bold',
            remainingGold >= 0 ? 'text-emerald-400' : 'text-red-400',
          )} data-testid="gold-remaining">
            {remainingGold} gp
          </span>
        </div>
      )}

      {/* Item Count */}
      <div className="flex items-center justify-between text-xs text-parchment/40 pt-2 border-t border-parchment/10">
        <span>Total Items</span>
        <span>{equipment.reduce((sum, item) => sum + item.quantity, 0)}</span>
      </div>
    </div>
  )
}
