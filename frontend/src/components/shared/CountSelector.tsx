// =============================================================================
// Story 16.1 -- CountSelector
// "Choose N from this list" component with checkbox list and counter.
// =============================================================================

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CountSelectorProps<T> {
  items: T[]
  selectedItems: T[]
  onSelectionChange: (items: T[]) => void
  getKey: (item: T) => string
  getLabel: (item: T) => string
  getDescription?: (item: T) => string
  maxSelections: number
}

export function CountSelector<T>({
  items,
  selectedItems,
  onSelectionChange,
  getKey,
  getLabel,
  getDescription,
  maxSelections,
}: CountSelectorProps<T>) {
  const selectedKeys = new Set(selectedItems.map(getKey))
  const atMax = selectedItems.length >= maxSelections

  const handleToggle = (item: T) => {
    const key = getKey(item)
    if (selectedKeys.has(key)) {
      // Always allow unchecking
      onSelectionChange(selectedItems.filter((i) => getKey(i) !== key))
    } else if (!atMax) {
      onSelectionChange([...selectedItems, item])
    }
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  return (
    <div
      role="group"
      aria-label={`Select up to ${maxSelections} items`}
    >
      {/* Counter + Clear */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-parchment/70">
          <span className="font-semibold text-parchment" data-testid="selection-count">
            {selectedItems.length}
          </span>{' '}
          of {maxSelections} selected
        </span>
        {selectedItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-accent-gold hover:text-accent-gold/80 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Item List */}
      <div className="space-y-2">
        {items.map((item) => {
          const key = getKey(item)
          const isSelected = selectedKeys.has(key)
          const isDisabled = atMax && !isSelected

          return (
            <label
              key={key}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                isSelected
                  ? 'border-accent-gold/50 bg-accent-gold/5'
                  : isDisabled
                    ? 'border-parchment/10 opacity-50 cursor-not-allowed'
                    : 'border-parchment/20 hover:border-parchment/40',
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => handleToggle(item)}
                className="sr-only"
                aria-label={getLabel(item)}
              />

              {/* Custom checkbox */}
              <span
                className={cn(
                  'flex-shrink-0 mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
                  isSelected
                    ? 'bg-accent-gold border-accent-gold'
                    : 'border-parchment/40 bg-transparent',
                )}
              >
                {isSelected && <Check className="h-3 w-3 text-bg-primary" />}
              </span>

              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-parchment">
                  {getLabel(item)}
                </span>
                {getDescription && (
                  <p className="text-xs text-parchment/50 mt-0.5">
                    {getDescription(item)}
                  </p>
                )}
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
