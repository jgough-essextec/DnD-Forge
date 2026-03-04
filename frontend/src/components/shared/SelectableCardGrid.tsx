// =============================================================================
// Story 16.1 -- SelectableCardGrid
// Generic responsive grid of selectable cards with single/multi-select modes.
// =============================================================================

import { useCallback } from 'react'
import { cn } from '@/lib/utils'

interface SelectableCardGridProps<T> {
  items: T[]
  selectedItems: T[]
  onSelect: (item: T) => void
  getKey: (item: T) => string
  renderCard: (item: T, isSelected: boolean) => React.ReactNode
  columns?: { sm?: number; md?: number; lg?: number }
  multiSelect?: boolean
}

const COLUMN_CLASSES: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
}

export function SelectableCardGrid<T>({
  items,
  selectedItems,
  onSelect,
  getKey,
  renderCard,
  columns = {},
  multiSelect = false,
}: SelectableCardGridProps<T>) {
  const { sm = 1, md = 2, lg = 3 } = columns

  const selectedKeys = new Set(selectedItems.map(getKey))

  const isSelected = useCallback(
    (item: T) => selectedKeys.has(getKey(item)),
    [selectedKeys, getKey],
  )

  const smClass = COLUMN_CLASSES[sm] ?? 'grid-cols-1'
  const mdClass = COLUMN_CLASSES[md] ? `md:${COLUMN_CLASSES[md]}` : 'md:grid-cols-2'
  const lgClass = COLUMN_CLASSES[lg] ? `lg:${COLUMN_CLASSES[lg]}` : 'lg:grid-cols-3'

  return (
    <div
      role="listbox"
      aria-multiselectable={multiSelect}
      className={cn('grid gap-4', smClass, mdClass, lgClass)}
    >
      {items.map((item) => {
        const key = getKey(item)
        const selected = isSelected(item)

        return (
          <div
            key={key}
            role="option"
            aria-selected={selected}
            tabIndex={0}
            onClick={() => onSelect(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(item)
              }
            }}
            className={cn(
              'cursor-pointer rounded-lg border-2 p-4 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
              selected
                ? 'border-accent-gold shadow-[0_0_12px_rgba(232,180,48,0.3)] bg-accent-gold/10'
                : 'border-parchment/20 hover:border-parchment/40 hover:bg-parchment/5',
            )}
          >
            {renderCard(item, selected)}
          </div>
        )
      })}
    </div>
  )
}
