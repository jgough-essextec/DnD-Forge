/**
 * StartingEquipmentSelector (Story 13.1)
 *
 * Renders the class starting equipment choices as radio-button groups.
 * Each choice group shows the available options, and for options containing
 * "Any" generic items (e.g., "Any martial weapon"), a nested picker is displayed
 * so the player can drill down to a specific item.
 *
 * Equipment packs show their contents in an expandable list.
 */

import { useState, useCallback, useMemo } from 'react'
import { ChevronDown, ChevronRight, Package, Swords, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChoiceGroup } from '@/components/shared/ChoiceGroup'
import { WEAPONS, getWeaponById, getArmorById, getEquipmentPackById } from '@/data/equipment'
import { getClassById } from '@/data/classes'
import type { Weapon } from '@/types/equipment'
import type { StartingEquipmentChoice } from '@/types/class'
import type { InventoryItem, EquipmentCategory } from '@/types/equipment'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChoiceSelections {
  /** Map of choiceIndex -> selected option index */
  choices: Record<number, number>
  /** Map of choiceIndex -> resolved specific item ID for "Any ..." picks */
  specificItems: Record<string, string>
}

interface StartingEquipmentSelectorProps {
  classId: string
  selections: ChoiceSelections
  onSelectionsChange: (selections: ChoiceSelections) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Detects if an option string refers to a generic category pick (e.g. "Any martial weapon") */
function isGenericPick(optionText: string): boolean {
  const lower = optionText.toLowerCase()
  return lower.startsWith('any ')
}

/** Parse a generic pick to determine which category of items to show */
function getGenericPickCategory(optionText: string): {
  type: 'weapon' | 'simple-weapon' | 'martial-weapon' | 'simple-melee' | 'martial-melee' | 'armor' | 'other'
  label: string
} {
  const lower = optionText.toLowerCase()
  if (lower.includes('martial melee weapon') || lower.includes('martial melee'))
    return { type: 'martial-melee', label: 'martial melee weapons' }
  if (lower.includes('martial weapon'))
    return { type: 'martial-weapon', label: 'martial weapons' }
  if (lower.includes('simple melee weapon') || lower.includes('simple melee'))
    return { type: 'simple-melee', label: 'simple melee weapons' }
  if (lower.includes('simple weapon'))
    return { type: 'simple-weapon', label: 'simple weapons' }
  return { type: 'other', label: 'items' }
}

/** Get weapons filtered by generic pick type */
function getWeaponsForGenericPick(
  pickType: string,
): readonly Weapon[] {
  switch (pickType) {
    case 'martial-melee':
      return WEAPONS.filter((w) => w.category === 'martial-melee')
    case 'martial-weapon':
      return WEAPONS.filter((w) => w.category === 'martial-melee' || w.category === 'martial-ranged')
    case 'simple-melee':
      return WEAPONS.filter((w) => w.category === 'simple-melee')
    case 'simple-weapon':
      return WEAPONS.filter((w) => w.category === 'simple-melee' || w.category === 'simple-ranged')
    default:
      return WEAPONS
  }
}

/** Convert a resolved starting equipment selection to InventoryItems */
export function resolveStartingEquipment(
  classId: string,
  selections: ChoiceSelections,
): InventoryItem[] {
  const cls = getClassById(classId)
  if (!cls) return []

  const items: InventoryItem[] = []
  let itemIdCounter = 0

  const addItem = (name: string, equipmentId: string, category: EquipmentCategory, weight: number, quantity: number = 1) => {
    items.push({
      id: `starting-${itemIdCounter++}`,
      equipmentId,
      name,
      category,
      quantity,
      weight,
      isEquipped: false,
      isAttuned: false,
      requiresAttunement: false,
    })
  }

  cls.startingEquipment.forEach((choice, choiceIndex) => {
    const selectedOption = selections.choices[choiceIndex]
    if (selectedOption === undefined) return

    const optionItems = choice.options[selectedOption]
    if (!optionItems) return

    optionItems.forEach((itemText) => {
      // Parse quantity prefix: e.g. "2 Handaxes", "20 arrows", "5 Javelins"
      const qtyMatch = itemText.match(/^(\d+)\s+(.+)$/)
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1
      const nameText = qtyMatch ? qtyMatch[2] : itemText

      // Check if this is a generic pick that needs resolution
      if (isGenericPick(nameText)) {
        const key = `${choiceIndex}-${nameText}`
        const specificId = selections.specificItems[key]
        if (specificId) {
          const weapon = getWeaponById(specificId)
          if (weapon) {
            addItem(weapon.name, weapon.id, 'weapon', weapon.weight, qty)
            return
          }
          const armor = getArmorById(specificId)
          if (armor) {
            addItem(armor.name, armor.id, armor.category === 'shield' ? 'shield' : 'armor', armor.weight, qty)
            return
          }
        }
        return
      }

      // Check if it's a known weapon
      const weaponId = nameText.toLowerCase().replace(/\s+/g, '-')
      const weapon = getWeaponById(weaponId)
      if (weapon) {
        addItem(weapon.name, weapon.id, 'weapon', weapon.weight, qty)
        return
      }

      // Check if it's known armor
      const armorId = nameText.toLowerCase().replace(/\s+/g, '-')
      const armor = getArmorById(armorId)
      if (armor) {
        addItem(armor.name, armor.id, armor.category === 'shield' ? 'shield' : 'armor', armor.weight, qty)
        return
      }

      // Check if it's an equipment pack
      const packId = nameText.toLowerCase().replace(/[']/g, '').replace(/\s+/g, '-')
      const pack = getEquipmentPackById(packId)
      if (pack) {
        addItem(pack.name, pack.id, 'pack', 0, 1)
        return
      }

      // Otherwise, add as generic adventuring gear
      addItem(nameText, nameText.toLowerCase().replace(/\s+/g, '-'), 'adventuring-gear', 0, qty)
    })
  })

  return items
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Displays the contents of an equipment pack in an expandable panel */
function PackContents({ packName }: { packName: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const packId = packName.toLowerCase().replace(/[']/g, '').replace(/\s+/g, '-')
  const pack = getEquipmentPackById(packId)

  if (!pack) return null

  return (
    <div className="ml-8 mt-1">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="flex items-center gap-1 text-xs text-parchment/50 hover:text-parchment/70 transition-colors"
        aria-expanded={isExpanded}
      >
        <Package className="h-3 w-3" />
        <span>Pack contents ({pack.cost.amount} {pack.cost.unit})</span>
        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {isExpanded && (
        <ul className="mt-1 ml-4 space-y-0.5">
          {pack.contents.map((item, i) => (
            <li key={i} className="text-xs text-parchment/40">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** A picker for selecting a specific weapon from a filtered category */
function WeaponPicker({
  weapons,
  selectedId,
  onSelect,
  label,
}: {
  weapons: readonly Weapon[]
  selectedId: string | null
  onSelect: (id: string) => void
  label: string
}) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return weapons
    const lower = search.toLowerCase()
    return weapons.filter((w) => w.name.toLowerCase().includes(lower))
  }, [weapons, search])

  return (
    <div className="ml-8 mt-2 p-3 rounded-lg border border-parchment/15 bg-bg-secondary/30" role="listbox" aria-label={label}>
      <p className="text-xs font-medium text-parchment/70 mb-2">
        Choose a specific {label}:
      </p>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search weapons..."
        aria-label={`Search ${label}`}
        className={cn(
          'w-full mb-2 rounded border border-parchment/20 bg-bg-secondary px-2 py-1',
          'text-xs text-parchment placeholder:text-parchment/40',
          'focus:outline-none focus:border-accent-gold/50',
        )}
      />
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filtered.map((weapon) => (
          <button
            key={weapon.id}
            role="option"
            aria-selected={selectedId === weapon.id}
            onClick={() => onSelect(weapon.id)}
            className={cn(
              'w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors',
              selectedId === weapon.id
                ? 'bg-accent-gold/10 border border-accent-gold/50 text-parchment'
                : 'hover:bg-parchment/5 text-parchment/70',
            )}
          >
            <div className="flex items-center gap-2">
              <Swords className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium">{weapon.name}</span>
            </div>
            <div className="flex items-center gap-3 text-parchment/50">
              <span>{weapon.damage.count}d{weapon.damage.die.replace('d', '')} {weapon.damage.type}</span>
              <span>{weapon.weight} lb</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-parchment/40 text-center py-2">No weapons found</p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function StartingEquipmentSelector({
  classId,
  selections,
  onSelectionsChange,
}: StartingEquipmentSelectorProps) {
  const cls = getClassById(classId)

  const handleChoiceSelect = useCallback(
    (choiceIndex: number, optionIndex: number) => {
      onSelectionsChange({
        ...selections,
        choices: {
          ...selections.choices,
          [choiceIndex]: optionIndex,
        },
      })
    },
    [selections, onSelectionsChange],
  )

  const handleSpecificItemSelect = useCallback(
    (key: string, itemId: string) => {
      onSelectionsChange({
        ...selections,
        specificItems: {
          ...selections.specificItems,
          [key]: itemId,
        },
      })
    },
    [selections, onSelectionsChange],
  )

  if (!cls) {
    return (
      <div className="text-parchment/50 text-sm" role="alert">
        No class selected. Please choose a class first.
      </div>
    )
  }

  return (
    <div className="space-y-6" data-testid="starting-equipment-selector">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-accent-gold" />
        <h3 className="text-lg font-semibold text-parchment">
          {cls.name} Starting Equipment
        </h3>
      </div>

      {cls.startingEquipment.map((choice: StartingEquipmentChoice, choiceIndex: number) => {
        const selectedOption = selections.choices[choiceIndex]
        const hasMultipleOptions = choice.options.length > 1

        return (
          <div key={choiceIndex} className="space-y-2">
            <p className="text-sm font-medium text-parchment/80">
              {choice.description}
              {hasMultipleOptions && <span className="text-parchment/50 ml-1">(Choose one)</span>}
            </p>

            {hasMultipleOptions ? (
              <>
                <ChoiceGroup
                  label={choice.description}
                  options={choice.options.map((option, optIdx) => ({
                    value: optIdx,
                    label: option.join(', '),
                    description: option.some((item) => {
                      const packId = item.toLowerCase().replace(/[']/g, '').replace(/\s+/g, '-')
                      return !!getEquipmentPackById(packId)
                    })
                      ? 'Contains equipment pack (click to expand contents)'
                      : undefined,
                  }))}
                  selectedValue={selectedOption ?? null}
                  onSelect={(value) => handleChoiceSelect(choiceIndex, value)}
                />

                {/* Show pack contents when option is selected and contains a pack */}
                {selectedOption !== undefined &&
                  choice.options[selectedOption]?.map((item, itemIdx) => {
                    const packId = item.toLowerCase().replace(/[']/g, '').replace(/\s+/g, '-')
                    if (getEquipmentPackById(packId)) {
                      return <PackContents key={itemIdx} packName={item} />
                    }
                    return null
                  })}

                {/* Show weapon picker for generic "Any ..." selections */}
                {selectedOption !== undefined &&
                  choice.options[selectedOption]?.map((item) => {
                    // Ignore quantity prefix
                    const qtyMatch = item.match(/^(\d+)\s+(.+)$/)
                    const nameText = qtyMatch ? qtyMatch[2] : item

                    if (!isGenericPick(nameText)) return null
                    const { type, label } = getGenericPickCategory(nameText)
                    if (type === 'other') return null

                    const key = `${choiceIndex}-${nameText}`
                    const weapons = getWeaponsForGenericPick(type)

                    return (
                      <WeaponPicker
                        key={key}
                        weapons={weapons}
                        selectedId={selections.specificItems[key] ?? null}
                        onSelect={(id) => handleSpecificItemSelect(key, id)}
                        label={label}
                      />
                    )
                  })}
              </>
            ) : (
              /* Single option -- auto-selected, show as informational */
              <div className="p-3 rounded-lg border border-parchment/15 bg-bg-secondary/30">
                <div className="flex items-center gap-2 text-sm text-parchment/70">
                  <Package className="h-4 w-4 text-accent-gold/70" />
                  <span>{choice.options[0].join(', ')}</span>
                </div>
                {/* Show pack contents for auto-included packs */}
                {choice.options[0].map((item, itemIdx) => {
                  const packId = item.toLowerCase().replace(/[']/g, '').replace(/\s+/g, '-')
                  if (getEquipmentPackById(packId)) {
                    return <PackContents key={itemIdx} packName={item} />
                  }
                  return null
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
