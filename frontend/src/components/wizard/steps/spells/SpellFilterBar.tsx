// =============================================================================
// Story 14.4 -- SpellFilterBar
// Spell-specific filter bar wrapping SearchFilterBar with school, level,
// casting time, concentration, ritual, and component filters.
// =============================================================================

import { useMemo, useCallback } from 'react'
import { SearchFilterBar, type FilterDef } from '@/components/shared/SearchFilterBar'
import { SPELL_SCHOOLS } from '@/types/spell'

// -- Filter State Type --------------------------------------------------------

export interface SpellFilters {
  search: string
  school: string
  level: string
  castingTime: string
  concentration: boolean
  ritual: boolean
}

export const DEFAULT_SPELL_FILTERS: SpellFilters = {
  search: '',
  school: '',
  level: '',
  castingTime: '',
  concentration: false,
  ritual: false,
}

// -- Filter Definitions -------------------------------------------------------

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const SCHOOL_OPTIONS = SPELL_SCHOOLS.map((school) => ({
  value: school,
  label: capitalizeFirst(school),
}))

const LEVEL_OPTIONS = [
  { value: '0', label: 'Cantrip' },
  { value: '1', label: '1st Level' },
]

const CASTING_TIME_OPTIONS = [
  { value: 'action', label: 'Action' },
  { value: 'bonus-action', label: 'Bonus Action' },
  { value: 'reaction', label: 'Reaction' },
  { value: 'minute', label: '1 Minute+' },
]

const FILTER_DEFS: FilterDef[] = [
  { id: 'school', label: 'School', type: 'dropdown', options: SCHOOL_OPTIONS },
  { id: 'level', label: 'Level', type: 'dropdown', options: LEVEL_OPTIONS },
  { id: 'castingTime', label: 'Casting Time', type: 'dropdown', options: CASTING_TIME_OPTIONS },
  { id: 'concentration', label: 'Concentration', type: 'toggle' },
  { id: 'ritual', label: 'Ritual', type: 'toggle' },
]

// -- Props --------------------------------------------------------------------

interface SpellFilterBarProps {
  filters: SpellFilters
  onFiltersChange: (filters: SpellFilters) => void
  showLevelFilter?: boolean
}

// -- Component ----------------------------------------------------------------

export function SpellFilterBar({
  filters,
  onFiltersChange,
  showLevelFilter = true,
}: SpellFilterBarProps) {
  const activeFilters = useMemo(() => {
    if (showLevelFilter) return FILTER_DEFS
    return FILTER_DEFS.filter((f) => f.id !== 'level')
  }, [showLevelFilter])

  const filterValues = useMemo<Record<string, string | boolean>>(
    () => ({
      school: filters.school,
      level: filters.level,
      castingTime: filters.castingTime,
      concentration: filters.concentration,
      ritual: filters.ritual,
    }),
    [filters],
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search: value })
    },
    [filters, onFiltersChange],
  )

  const handleFilterChange = useCallback(
    (filterId: string, value: string | boolean) => {
      onFiltersChange({ ...filters, [filterId]: value })
    },
    [filters, onFiltersChange],
  )

  return (
    <SearchFilterBar
      searchPlaceholder="Search spells..."
      searchValue={filters.search}
      onSearchChange={handleSearchChange}
      filters={activeFilters}
      filterValues={filterValues}
      onFilterChange={handleFilterChange}
    />
  )
}
