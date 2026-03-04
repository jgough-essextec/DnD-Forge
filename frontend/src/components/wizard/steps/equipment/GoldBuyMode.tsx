/**
 * GoldBuyMode (Story 13.2)
 *
 * Gold-based equipment purchasing mode for the Equipment step.
 * Players roll or enter starting gold, then browse a tabbed equipment catalog
 * to buy items. Includes a shopping cart with quantity controls, running gold
 * total, and equipment pack expansion.
 */

import { useState, useMemo, useCallback } from 'react'
import { Coins, Plus, Minus, Trash2, Search, ShoppingCart, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  WEAPONS,
  ARMOR,
  EQUIPMENT_PACKS,
  STARTING_GOLD,
} from '@/data/equipment'
import type { Weapon, Armor, EquipmentPack, CurrencyAmount, InventoryItem, EquipmentCategory } from '@/types/equipment'
import { CURRENCY_CONVERSION_RATES } from '@/types/equipment'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CartItem {
  id: string
  name: string
  cost: CurrencyAmount
  weight: number
  quantity: number
  category: EquipmentCategory
}

export interface GoldBuyState {
  gold: number | null
  goldSource: 'rolled' | 'manual' | null
  cart: CartItem[]
}

interface GoldBuyModeProps {
  classId: string
  state: GoldBuyState
  onStateChange: (state: GoldBuyState) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a CurrencyAmount to GP */
function costToGP(cost: CurrencyAmount): number {
  const rateInCP = CURRENCY_CONVERSION_RATES[cost.unit]
  const gpRateInCP = CURRENCY_CONVERSION_RATES['gp']
  return (cost.amount * rateInCP) / gpRateInCP
}

/** Format a GP amount for display */
function formatGP(amount: number): string {
  if (Number.isInteger(amount)) return `${amount} gp`
  return `${amount.toFixed(2)} gp`
}

/** Get the total cost of all items in the cart */
export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + costToGP(item.cost) * item.quantity, 0)
}

/** Get the total weight of all items in the cart */
export function getCartWeight(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.weight * item.quantity, 0)
}

/** Convert cart items to InventoryItem array */
export function cartToInventoryItems(cart: CartItem[]): InventoryItem[] {
  return cart.map((item, index) => ({
    id: `gold-buy-${index}`,
    equipmentId: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    weight: item.weight,
    isEquipped: false,
    isAttuned: false,
    requiresAttunement: false,
  }))
}

/** Essentials kit items */
const ESSENTIALS_KIT: Array<{ name: string; id: string; cost: CurrencyAmount; weight: number; category: EquipmentCategory }> = [
  { name: 'Backpack', id: 'backpack', cost: { amount: 2, unit: 'gp' }, weight: 5, category: 'adventuring-gear' },
  { name: 'Bedroll', id: 'bedroll', cost: { amount: 1, unit: 'gp' }, weight: 7, category: 'adventuring-gear' },
  { name: 'Rations (1 day)', id: 'rations', cost: { amount: 5, unit: 'sp' }, weight: 2, category: 'adventuring-gear' },
  { name: 'Rope, hempen (50 feet)', id: 'rope-hempen', cost: { amount: 1, unit: 'gp' }, weight: 10, category: 'adventuring-gear' },
  { name: 'Torch', id: 'torch', cost: { amount: 1, unit: 'cp' }, weight: 1, category: 'adventuring-gear' },
  { name: 'Waterskin', id: 'waterskin', cost: { amount: 2, unit: 'sp' }, weight: 5, category: 'adventuring-gear' },
]

// ---------------------------------------------------------------------------
// Catalog Tabs
// ---------------------------------------------------------------------------

type CatalogTab = 'weapons' | 'armor' | 'gear' | 'packs'

const CATALOG_TABS: Array<{ id: CatalogTab; label: string }> = [
  { id: 'weapons', label: 'Weapons' },
  { id: 'armor', label: 'Armor & Shields' },
  { id: 'gear', label: 'Adventuring Gear' },
  { id: 'packs', label: 'Equipment Packs' },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function GoldRollSection({
  classId,
  gold,
  goldSource,
  onSetGold,
}: {
  classId: string
  gold: number | null
  goldSource: 'rolled' | 'manual' | null
  onSetGold: (gold: number, source: 'rolled' | 'manual') => void
}) {
  const [manualGold, setManualGold] = useState('')
  const formula = STARTING_GOLD.find((sg) => sg.classId === classId)

  const handleRoll = () => {
    if (!formula) return
    // Roll dice: NdM * multiplier
    let sum = 0
    for (let i = 0; i < formula.diceCount; i++) {
      sum += Math.floor(Math.random() * 4) + 1 // d4
    }
    const total = sum * formula.multiplier
    onSetGold(total, 'rolled')
  }

  const handleManual = () => {
    const value = parseInt(manualGold, 10)
    if (!isNaN(value) && value >= 0) {
      onSetGold(value, 'manual')
    }
  }

  return (
    <div className="p-4 rounded-lg border border-parchment/15 bg-bg-secondary/30 space-y-3">
      <div className="flex items-center gap-2">
        <Coins className="h-5 w-5 text-accent-gold" />
        <h4 className="font-semibold text-parchment">Starting Gold</h4>
      </div>

      {formula && (
        <p className="text-sm text-parchment/60">
          Formula: <span className="font-mono text-parchment/80">{formula.dice}</span>
          <span className="ml-2 text-parchment/40">(Average: {formula.average} gp)</span>
        </p>
      )}

      {gold !== null ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30">
            <Coins className="h-4 w-4 text-accent-gold" />
            <span className="text-lg font-bold text-accent-gold">{gold} gp</span>
          </div>
          <span className="text-xs text-parchment/40">
            ({goldSource === 'rolled' ? 'Rolled' : 'Manual entry'})
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRoll}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm',
              'bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30 transition-colors',
            )}
            data-testid="roll-gold-button"
          >
            <Sparkles className="h-4 w-4" />
            Roll Gold
          </button>

          <span className="text-xs text-parchment/40">or</span>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={manualGold}
              onChange={(e) => setManualGold(e.target.value)}
              placeholder="Enter gold"
              min="0"
              aria-label="Manual gold amount"
              className={cn(
                'w-24 rounded border border-parchment/20 bg-bg-secondary px-2 py-1.5',
                'text-sm text-parchment placeholder:text-parchment/40',
                'focus:outline-none focus:border-accent-gold/50',
              )}
            />
            <button
              onClick={handleManual}
              disabled={!manualGold || isNaN(parseInt(manualGold, 10))}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                'bg-parchment/10 text-parchment/70 hover:bg-parchment/20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              Set
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CatalogItemRow({
  name,
  cost,
  weight,
  details,
  disabled,
  onAdd,
}: {
  name: string
  cost: CurrencyAmount
  weight: number
  details?: string
  disabled: boolean
  onAdd: () => void
}) {
  return (
    <div className={cn(
      'flex items-center justify-between px-3 py-2 rounded-lg',
      'hover:bg-parchment/5 transition-colors',
      disabled && 'opacity-50',
    )}>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-parchment font-medium">{name}</span>
        {details && (
          <span className="text-xs text-parchment/50 ml-2">{details}</span>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-parchment/60 flex-shrink-0">
        <span>{formatGP(costToGP(cost))}</span>
        <span>{weight} lb</span>
        <button
          onClick={onAdd}
          disabled={disabled}
          aria-label={`Add ${name}`}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
            disabled
              ? 'bg-parchment/5 text-parchment/30 cursor-not-allowed'
              : 'bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20',
          )}
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>
    </div>
  )
}

function PackCatalogRow({
  pack,
  disabled,
  onAdd,
}: {
  pack: EquipmentPack
  disabled: boolean
  onAdd: () => void
}) {
  const [showContents, setShowContents] = useState(false)

  return (
    <div className="rounded-lg">
      <div className={cn(
        'flex items-center justify-between px-3 py-2',
        'hover:bg-parchment/5 transition-colors',
        disabled && 'opacity-50',
      )}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-parchment font-medium">{pack.name}</span>
            <button
              onClick={() => setShowContents(!showContents)}
              className="text-xs text-parchment/40 hover:text-parchment/60 transition-colors"
              aria-expanded={showContents}
            >
              ({showContents ? 'hide' : 'show'} contents)
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-parchment/60 flex-shrink-0">
          <span>{pack.cost.amount} {pack.cost.unit}</span>
          <button
            onClick={onAdd}
            disabled={disabled}
            aria-label={`Add ${pack.name}`}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
              disabled
                ? 'bg-parchment/5 text-parchment/30 cursor-not-allowed'
                : 'bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20',
            )}
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
      </div>
      {showContents && (
        <ul className="ml-6 px-3 pb-2 space-y-0.5">
          {pack.contents.map((item, i) => (
            <li key={i} className="text-xs text-parchment/40">* {item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function GoldBuyMode({ classId, state, onStateChange }: GoldBuyModeProps) {
  const [activeTab, setActiveTab] = useState<CatalogTab>('weapons')
  const [searchQuery, setSearchQuery] = useState('')

  const remainingGold = useMemo(() => {
    if (state.gold === null) return null
    return state.gold - getCartTotal(state.cart)
  }, [state.gold, state.cart])

  const handleSetGold = useCallback((gold: number, source: 'rolled' | 'manual') => {
    onStateChange({ ...state, gold, goldSource: source })
  }, [state, onStateChange])

  const addToCart = useCallback((item: CartItem) => {
    const existingIndex = state.cart.findIndex((c) => c.id === item.id)
    if (existingIndex >= 0) {
      const updated = [...state.cart]
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1,
      }
      onStateChange({ ...state, cart: updated })
    } else {
      onStateChange({ ...state, cart: [...state.cart, { ...item, quantity: 1 }] })
    }
  }, [state, onStateChange])

  const updateCartQuantity = useCallback((index: number, delta: number) => {
    const updated = [...state.cart]
    const newQty = updated[index].quantity + delta
    if (newQty <= 0) {
      updated.splice(index, 1)
    } else {
      updated[index] = { ...updated[index], quantity: newQty }
    }
    onStateChange({ ...state, cart: updated })
  }, [state, onStateChange])

  const removeFromCart = useCallback((index: number) => {
    const updated = [...state.cart]
    updated.splice(index, 1)
    onStateChange({ ...state, cart: updated })
  }, [state, onStateChange])

  const addEssentialsKit = useCallback(() => {
    let currentCart = [...state.cart]
    for (const essentialItem of ESSENTIALS_KIT) {
      const existingIndex = currentCart.findIndex((c) => c.id === essentialItem.id)
      if (existingIndex >= 0) {
        currentCart[existingIndex] = {
          ...currentCart[existingIndex],
          quantity: currentCart[existingIndex].quantity + 1,
        }
      } else {
        currentCart.push({
          ...essentialItem,
          quantity: 1,
        })
      }
    }
    onStateChange({ ...state, cart: currentCart })
  }, [state, onStateChange])

  const canAfford = useCallback((cost: CurrencyAmount): boolean => {
    if (state.gold === null) return false
    return costToGP(cost) <= (remainingGold ?? 0)
  }, [state.gold, remainingGold])

  // Filter catalog items by search
  const filteredWeapons = useMemo(() => {
    if (!searchQuery) return WEAPONS
    const lower = searchQuery.toLowerCase()
    return WEAPONS.filter((w) => w.name.toLowerCase().includes(lower))
  }, [searchQuery])

  const filteredArmor = useMemo(() => {
    if (!searchQuery) return ARMOR
    const lower = searchQuery.toLowerCase()
    return ARMOR.filter((a) => a.name.toLowerCase().includes(lower))
  }, [searchQuery])

  const filteredPacks = useMemo(() => {
    if (!searchQuery) return EQUIPMENT_PACKS
    const lower = searchQuery.toLowerCase()
    return EQUIPMENT_PACKS.filter((p) => p.name.toLowerCase().includes(lower))
  }, [searchQuery])

  return (
    <div className="space-y-4" data-testid="gold-buy-mode">
      {/* Gold Roll Section */}
      <GoldRollSection
        classId={classId}
        gold={state.gold}
        goldSource={state.goldSource}
        onSetGold={handleSetGold}
      />

      {state.gold !== null && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Equipment Catalog (left 2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            {/* Catalog Tabs */}
            <div className="flex border-b border-parchment/15">
              {CATALOG_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-colors border-b-2',
                    activeTab === tab.id
                      ? 'border-accent-gold text-accent-gold'
                      : 'border-transparent text-parchment/50 hover:text-parchment/70',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-parchment/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment..."
                aria-label="Search equipment"
                className={cn(
                  'w-full rounded-lg border border-parchment/20 bg-bg-secondary pl-10 pr-8 py-2',
                  'text-sm text-parchment placeholder:text-parchment/40',
                  'focus:outline-none focus:border-accent-gold/50',
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-parchment/50 hover:text-parchment"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Buy */}
            <button
              onClick={addEssentialsKit}
              data-testid="essentials-kit-button"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors',
              )}
            >
              <Sparkles className="h-4 w-4" />
              Essentials Kit (backpack, bedroll, rations, rope, torch, waterskin)
            </button>

            {/* Catalog Content */}
            <div className="max-h-[400px] overflow-y-auto space-y-1 rounded-lg border border-parchment/10 p-2">
              {activeTab === 'weapons' &&
                filteredWeapons.map((weapon: Weapon) => (
                  <CatalogItemRow
                    key={weapon.id}
                    name={weapon.name}
                    cost={weapon.cost}
                    weight={weapon.weight}
                    details={`${weapon.damage.count}d${weapon.damage.die.replace('d', '')} ${weapon.damage.type}${weapon.properties.length ? ' - ' + weapon.properties.join(', ') : ''}`}
                    disabled={!canAfford(weapon.cost)}
                    onAdd={() =>
                      addToCart({
                        id: weapon.id,
                        name: weapon.name,
                        cost: weapon.cost,
                        weight: weapon.weight,
                        quantity: 1,
                        category: 'weapon',
                      })
                    }
                  />
                ))}

              {activeTab === 'armor' &&
                filteredArmor.map((armor: Armor) => (
                  <CatalogItemRow
                    key={armor.id}
                    name={armor.name}
                    cost={armor.cost}
                    weight={armor.weight}
                    details={`${armor.category} | AC ${armor.baseAC}${armor.stealthDisadvantage ? ' | Stealth Disadvantage' : ''}${armor.strengthRequirement ? ` | STR ${armor.strengthRequirement}` : ''}`}
                    disabled={!canAfford(armor.cost)}
                    onAdd={() =>
                      addToCart({
                        id: armor.id,
                        name: armor.name,
                        cost: armor.cost,
                        weight: armor.weight,
                        quantity: 1,
                        category: armor.category === 'shield' ? 'shield' : 'armor',
                      })
                    }
                  />
                ))}

              {activeTab === 'gear' &&
                ESSENTIALS_KIT.map((item) => (
                  <CatalogItemRow
                    key={item.id}
                    name={item.name}
                    cost={item.cost}
                    weight={item.weight}
                    disabled={!canAfford(item.cost)}
                    onAdd={() =>
                      addToCart({
                        id: item.id,
                        name: item.name,
                        cost: item.cost,
                        weight: item.weight,
                        quantity: 1,
                        category: 'adventuring-gear',
                      })
                    }
                  />
                ))}

              {activeTab === 'packs' &&
                filteredPacks.map((pack: EquipmentPack) => (
                  <PackCatalogRow
                    key={pack.id}
                    pack={pack}
                    disabled={!canAfford(pack.cost)}
                    onAdd={() =>
                      addToCart({
                        id: pack.id,
                        name: pack.name,
                        cost: pack.cost,
                        weight: 0,
                        quantity: 1,
                        category: 'pack',
                      })
                    }
                  />
                ))}
            </div>
          </div>

          {/* Shopping Cart (right col) */}
          <div className="space-y-3">
            {/* Remaining Gold Header */}
            <div className={cn(
              'p-3 rounded-lg border',
              remainingGold !== null && remainingGold >= 0
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-red-500/30 bg-red-500/5',
            )}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-parchment/70">Remaining Gold</span>
                <span className={cn(
                  'text-lg font-bold',
                  remainingGold !== null && remainingGold >= 0
                    ? 'text-emerald-400'
                    : 'text-red-400',
                )} data-testid="remaining-gold">
                  {remainingGold !== null ? formatGP(remainingGold) : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-parchment/40">Total spent</span>
                <span className="text-xs text-parchment/50">{formatGP(getCartTotal(state.cart))}</span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="rounded-lg border border-parchment/15 bg-bg-secondary/30">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-parchment/10">
                <ShoppingCart className="h-4 w-4 text-accent-gold" />
                <span className="text-sm font-semibold text-parchment">
                  Cart ({state.cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                </span>
              </div>

              {state.cart.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-parchment/40">
                  No items in cart. Browse the catalog to add equipment.
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto divide-y divide-parchment/10">
                  {state.cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-parchment font-medium">{item.name}</span>
                        <button
                          onClick={() => removeFromCart(index)}
                          aria-label={`Remove ${item.name}`}
                          className="text-red-400/60 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQuantity(index, -1)}
                            aria-label={`Decrease ${item.name} quantity`}
                            className="p-0.5 rounded hover:bg-parchment/10 text-parchment/50 hover:text-parchment transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-mono text-parchment/70 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(index, 1)}
                            aria-label={`Increase ${item.name} quantity`}
                            className="p-0.5 rounded hover:bg-parchment/10 text-parchment/50 hover:text-parchment transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-xs text-parchment/50">
                          {formatGP(costToGP(item.cost) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {state.cart.length > 0 && (
                <div className="px-3 py-2 border-t border-parchment/10">
                  <div className="flex justify-between text-xs text-parchment/50">
                    <span>Total Weight</span>
                    <span>{getCartWeight(state.cart).toFixed(1)} lb</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
