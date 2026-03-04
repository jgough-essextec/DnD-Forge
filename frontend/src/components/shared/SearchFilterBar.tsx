// =============================================================================
// Story 16.1 -- SearchFilterBar
// Generic search + filter bar with debounced search, dropdowns, toggles, chips.
// =============================================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilterDef {
  id: string
  label: string
  type: 'dropdown' | 'toggle' | 'chip'
  options?: { value: string; label: string }[]
}

interface SearchFilterBarProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters: FilterDef[]
  filterValues: Record<string, string | boolean>
  onFilterChange: (filterId: string, value: string | boolean) => void
}

export function SearchFilterBar({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
}: SearchFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync external value changes
  useEffect(() => {
    setLocalSearch(searchValue)
  }, [searchValue])

  const debouncedSearch = useCallback(
    (value: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      debounceTimer.current = setTimeout(() => {
        onSearchChange(value)
      }, 300)
    },
    [onSearchChange],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  const handleSearchInput = (value: string) => {
    setLocalSearch(value)
    debouncedSearch(value)
  }

  const clearSearch = () => {
    setLocalSearch('')
    onSearchChange('')
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-parchment/50" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => handleSearchInput(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search"
          className={cn(
            'w-full rounded-lg border border-parchment/20 bg-bg-secondary pl-10 pr-8 py-2',
            'text-parchment placeholder:text-parchment/40',
            'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
            'transition-colors',
          )}
        />
        {localSearch && (
          <button
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-parchment/50 hover:text-parchment transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      {filters.map((filter) => {
        switch (filter.type) {
          case 'dropdown':
            return (
              <DropdownFilter
                key={filter.id}
                filter={filter}
                value={filterValues[filter.id] as string}
                onChange={(value) => onFilterChange(filter.id, value)}
              />
            )
          case 'toggle':
            return (
              <ToggleFilter
                key={filter.id}
                filter={filter}
                value={!!filterValues[filter.id]}
                onChange={(value) => onFilterChange(filter.id, value)}
              />
            )
          case 'chip':
            return (
              <ChipFilter
                key={filter.id}
                filter={filter}
                value={filterValues[filter.id] as string}
                onChange={(value) => onFilterChange(filter.id, value)}
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}

// -- Dropdown Filter ----------------------------------------------------------

function DropdownFilter({
  filter,
  value,
  onChange,
}: {
  filter: FilterDef
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        aria-label={filter.label}
        className={cn(
          'appearance-none rounded-lg border border-parchment/20 bg-bg-secondary',
          'pl-3 pr-8 py-2 text-parchment text-sm',
          'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
          'cursor-pointer transition-colors',
        )}
      >
        <option value="">{filter.label}</option>
        {filter.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-parchment/50 pointer-events-none" />
    </div>
  )
}

// -- Toggle Filter ------------------------------------------------------------

function ToggleFilter({
  filter,
  value,
  onChange,
}: {
  filter: FilterDef
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none" data-testid={`toggle-${filter.id}`}>
      <button
        role="switch"
        aria-checked={value}
        aria-label={filter.label}
        onClick={() => onChange(!value)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          value ? 'bg-accent-gold' : 'bg-parchment/20',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 rounded-full bg-white transition-transform',
            value ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
      <span className="text-sm text-parchment/80">{filter.label}</span>
    </label>
  )
}

// -- Chip Filter --------------------------------------------------------------

function ChipFilter({
  filter,
  value,
  onChange,
}: {
  filter: FilterDef
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={filter.label}>
      {filter.options?.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(value === opt.value ? '' : opt.value)}
          className={cn(
            'rounded-full px-3 py-1 text-sm border transition-all',
            value === opt.value
              ? 'bg-accent-gold/20 border-accent-gold text-accent-gold'
              : 'border-parchment/20 text-parchment/60 hover:border-parchment/40 hover:text-parchment/80',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
