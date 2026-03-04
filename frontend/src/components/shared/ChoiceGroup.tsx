// =============================================================================
// Story 16.1 -- ChoiceGroup
// Radio-button group with custom styling for single selection.
// =============================================================================

import { cn } from '@/lib/utils'

interface ChoiceOption<T> {
  value: T
  label: string
  description?: string
  disabled?: boolean
}

interface ChoiceGroupProps<T> {
  options: ChoiceOption<T>[]
  selectedValue: T | null
  onSelect: (value: T) => void
  label: string
}

export function ChoiceGroup<T>({
  options,
  selectedValue,
  onSelect,
  label,
}: ChoiceGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="space-y-2">
      {options.map((option, index) => {
        const isSelected = selectedValue === option.value

        return (
          <div
            key={index}
            role="radio"
            aria-checked={isSelected}
            aria-disabled={option.disabled}
            tabIndex={option.disabled ? -1 : 0}
            onClick={() => {
              if (!option.disabled) {
                onSelect(option.value)
              }
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !option.disabled) {
                e.preventDefault()
                onSelect(option.value)
              }
            }}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border-2 transition-all',
              option.disabled
                ? 'opacity-50 cursor-not-allowed border-parchment/10'
                : 'cursor-pointer',
              !option.disabled && isSelected
                ? 'border-accent-gold bg-accent-gold/5'
                : '',
              !option.disabled && !isSelected
                ? 'border-parchment/20 hover:border-parchment/40'
                : '',
              'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
            )}
          >
            {/* Custom radio dot */}
            <span
              className={cn(
                'flex-shrink-0 mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                isSelected
                  ? 'border-accent-gold'
                  : 'border-parchment/40',
              )}
            >
              {isSelected && (
                <span className="h-2.5 w-2.5 rounded-full bg-accent-gold" />
              )}
            </span>

            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-parchment">
                {option.label}
              </span>
              {option.description && (
                <p className="text-xs text-parchment/50 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
