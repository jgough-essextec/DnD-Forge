/**
 * EquipmentSection Component (Story 18.3)
 *
 * Displays equipment/inventory list with:
 * - Item name, quantity, weight, equipped status
 * - Total weight and carrying capacity with encumbrance indicator
 * - Add/remove items in edit mode
 * - Toggle equipped state
 * - Attunement tracking (max 3 items)
 *
 * Weight tracking and encumbrance:
 * - Normal: weight < STR x 5
 * - Encumbered: STR x 5 <= weight < STR x 10 (-10 speed)
 * - Heavily Encumbered: STR x 10 <= weight < STR x 15 (-20 speed, disadvantage)
 * - Over Capacity: weight >= STR x 15 (cannot move)
 */

import { cn } from '@/lib/utils'
import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'

export interface EquipmentSectionProps {
  className?: string
}

type EncumbranceLevel = 'normal' | 'encumbered' | 'heavily-encumbered' | 'over-capacity'

function getEncumbranceLevel(
  weight: number,
  capacity: number,
  strength: number
): EncumbranceLevel {
  const threshold5 = strength * 5
  const threshold10 = strength * 10

  if (weight >= capacity) return 'over-capacity'
  if (weight >= threshold10) return 'heavily-encumbered'
  if (weight >= threshold5) return 'encumbered'
  return 'normal'
}

function getEncumbranceColor(level: EncumbranceLevel): string {
  switch (level) {
    case 'normal':
      return 'text-healing-green'
    case 'encumbered':
      return 'text-accent-gold'
    case 'heavily-encumbered':
      return 'text-damage-red'
    case 'over-capacity':
      return 'text-damage-red font-bold'
  }
}

function getEncumbranceLabel(level: EncumbranceLevel): string {
  switch (level) {
    case 'normal':
      return 'Normal'
    case 'encumbered':
      return 'Encumbered (-10 speed)'
    case 'heavily-encumbered':
      return 'Heavily Encumbered (-20 speed, disadvantage)'
    case 'over-capacity':
      return 'Over Capacity (cannot move)'
  }
}

export function EquipmentSection({ className }: EquipmentSectionProps) {
  const { character, editableCharacter, updateField, editMode, derivedStats } = useCharacterSheet()

  const inventory = editableCharacter.inventory ?? character?.inventory ?? []
  const attunedItems = editableCharacter.attunedItems ?? character?.attunedItems ?? []

  const { inventoryWeight, carryingCapacity } = derivedStats
  const strength = derivedStats.effectiveAbilityScores.strength

  const encumbranceLevel = getEncumbranceLevel(inventoryWeight, carryingCapacity, strength)
  const encumbranceColor = getEncumbranceColor(encumbranceLevel)
  const encumbranceLabel = getEncumbranceLabel(encumbranceLevel)

  const handleToggleEquipped = (itemId: string) => {
    const updatedInventory = inventory.map((item) =>
      item.id === itemId ? { ...item, isEquipped: !item.isEquipped } : item
    )
    updateField('inventory', updatedInventory)
  }

  const handleToggleAttuned = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId)
    if (!item) return

    const isCurrentlyAttuned = attunedItems.includes(itemId)

    if (isCurrentlyAttuned) {
      // Remove from attuned
      const updatedAttunedItems = attunedItems.filter((id) => id !== itemId)
      updateField('attunedItems', updatedAttunedItems)

      const updatedInventory = inventory.map((i) =>
        i.id === itemId ? { ...i, isAttuned: false } : i
      )
      updateField('inventory', updatedInventory)
    } else {
      // Add to attuned (check limit)
      if (attunedItems.length >= 3) {
        alert('You can only attune to 3 magic items at a time')
        return
      }

      const updatedAttunedItems = [...attunedItems, itemId]
      updateField('attunedItems', updatedAttunedItems)

      const updatedInventory = inventory.map((i) =>
        i.id === itemId ? { ...i, isAttuned: true } : i
      )
      updateField('inventory', updatedInventory)
    }
  }

  const handleQuantityChange = (itemId: string, delta: number) => {
    const updatedInventory = inventory.map((item) => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + delta)
        return { ...item, quantity: newQuantity }
      }
      return item
    }).filter((item) => item.quantity > 0)

    updateField('inventory', updatedInventory)
  }

  const handleRemoveItem = (itemId: string) => {
    if (!confirm('Remove this item from inventory?')) return

    const updatedInventory = inventory.filter((item) => item.id !== itemId)
    updateField('inventory', updatedInventory)

    // Also remove from attuned items if present
    if (attunedItems.includes(itemId)) {
      const updatedAttunedItems = attunedItems.filter((id) => id !== itemId)
      updateField('attunedItems', updatedAttunedItems)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 p-4 rounded-lg bg-secondary border border-accent-gold/20',
        className
      )}
      data-testid="equipment-section"
      aria-label="Equipment & Inventory"
    >
      {/* Header with Attunement Counter */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-accent-gold">Equipment & Inventory</h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-parchment/60">Attunement:</span>
          <span
            className={cn(
              'font-semibold',
              attunedItems.length >= 3 ? 'text-damage-red' : 'text-accent-gold'
            )}
            data-testid="attunement-counter"
          >
            {attunedItems.length} / 3
          </span>
        </div>
      </div>

      {/* Equipment Table */}
      {inventory.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="equipment-table">
            <thead>
              <tr className="border-b border-accent-gold/30 text-accent-gold">
                <th className="text-left p-2 font-semibold">Equipped</th>
                <th className="text-left p-2 font-semibold">Name</th>
                <th className="text-left p-2 font-semibold">Qty</th>
                <th className="text-left p-2 font-semibold">Weight</th>
                <th className="text-left p-2 font-semibold">Total</th>
                {editMode.isEditing && <th className="text-left p-2 font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const totalWeight = item.quantity * item.weight
                const isAttuned = item.isAttuned

                return (
                  <tr
                    key={item.id}
                    className="border-b border-accent-gold/10 hover:bg-primary/30 transition-colors"
                    data-testid={`equipment-row-${item.id}`}
                  >
                    {/* Equipped Checkbox */}
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={item.isEquipped}
                        onChange={() => handleToggleEquipped(item.id)}
                        className="w-4 h-4 cursor-pointer accent-accent-gold"
                        aria-label={`Toggle ${item.name} equipped`}
                        data-testid={`equipped-checkbox-${item.id}`}
                      />
                    </td>

                    {/* Item Name */}
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-parchment">{item.name}</span>
                        {item.requiresAttunement && (
                          <button
                            onClick={() => handleToggleAttuned(item.id)}
                            className={cn(
                              'px-2 py-0.5 text-xs rounded border',
                              isAttuned
                                ? 'bg-accent-gold/20 border-accent-gold text-accent-gold'
                                : 'border-accent-gold/30 text-parchment/60 hover:border-accent-gold'
                            )}
                            aria-label={`${isAttuned ? 'Unattuned' : 'Attune to'} ${item.name}`}
                            data-testid={`attune-button-${item.id}`}
                          >
                            {isAttuned ? 'Attuned' : 'Attune'}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="p-2">
                      {editMode.isEditing ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center bg-primary border border-accent-gold/30 rounded hover:border-accent-gold text-parchment"
                            aria-label="Decrease quantity"
                            data-testid={`quantity-decrease-${item.id}`}
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-parchment">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center bg-primary border border-accent-gold/30 rounded hover:border-accent-gold text-parchment"
                            aria-label="Increase quantity"
                            data-testid={`quantity-increase-${item.id}`}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="text-parchment">{item.quantity}</span>
                      )}
                    </td>

                    {/* Unit Weight */}
                    <td className="p-2 text-parchment">{item.weight} lb</td>

                    {/* Total Weight */}
                    <td className="p-2 text-parchment font-semibold">{totalWeight.toFixed(1)} lb</td>

                    {/* Actions */}
                    {editMode.isEditing && (
                      <td className="p-2">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="px-3 py-1 text-xs bg-damage-red/20 border border-damage-red/50 rounded hover:bg-damage-red/30 text-damage-red transition-colors"
                          aria-label={`Remove ${item.name}`}
                          data-testid={`remove-button-${item.id}`}
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-parchment/40 italic">
          No equipment in inventory
        </div>
      )}

      {/* Footer with Weight Summary */}
      <div className="flex items-center justify-between pt-3 border-t border-accent-gold/30">
        <div className="flex flex-col gap-1">
          <div className="text-sm">
            <span className="text-parchment/60">Total Weight:</span>{' '}
            <span className="font-semibold text-parchment" data-testid="total-weight">
              {inventoryWeight.toFixed(1)} lb
            </span>
          </div>
          <div className="text-sm">
            <span className="text-parchment/60">Carrying Capacity:</span>{' '}
            <span className="font-semibold text-parchment" data-testid="carrying-capacity">
              {carryingCapacity} lb
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div
            className={cn('text-sm font-semibold', encumbranceColor)}
            data-testid="encumbrance-indicator"
          >
            {encumbranceLabel}
          </div>
          <div className="text-xs text-parchment/60">
            {((inventoryWeight / carryingCapacity) * 100).toFixed(0)}% capacity
          </div>
        </div>
      </div>

      {/* Add Item Button (Edit Mode) */}
      {editMode.isEditing && (
        <button
          className="mt-2 px-4 py-2 bg-accent-gold/20 border border-accent-gold rounded hover:bg-accent-gold/30 text-accent-gold font-semibold transition-colors"
          onClick={() => {
            // TODO: Open equipment picker modal when implemented
            alert('Equipment picker will be implemented in a future story')
          }}
          data-testid="add-item-button"
        >
          + Add Item
        </button>
      )}
    </div>
  )
}
