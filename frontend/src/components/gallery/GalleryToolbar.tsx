// =============================================================================
// GalleryToolbar (Story 21.2)
//
// Toolbar above the character gallery grid providing:
// - Search with debounce
// - Filter chips: Class, Race, Level Range
// - Show Archived toggle
// - Sort dropdown
// - View mode toggle (grid / list)
// =============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  ChevronDown,
  LayoutGrid,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  GalleryFilters,
  SortOption,
  ViewMode,
  LevelRange,
} from '@/utils/gallery';
import { SORT_OPTIONS, LEVEL_RANGES } from '@/utils/gallery';

interface GalleryToolbarProps {
  filters: GalleryFilters;
  onFiltersChange: (filters: GalleryFilters) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  classOptions: { value: string; label: string }[];
  raceOptions: { value: string; label: string }[];
  totalCount: number;
  filteredCount: number;
}

export function GalleryToolbar({
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  classOptions,
  raceOptions,
  totalCount,
  filteredCount,
}: GalleryToolbarProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external search changes
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchInput = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onFiltersChange({ ...filters, search: value });
      }, 200);
    },
    [filters, onFiltersChange],
  );

  const clearSearch = useCallback(() => {
    setLocalSearch('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onFiltersChange({ ...filters, search: '' });
  }, [filters, onFiltersChange]);

  const toggleClassFilter = useCallback(
    (cls: string) => {
      const current = filters.classes;
      const next = current.includes(cls)
        ? current.filter((c) => c !== cls)
        : [...current, cls];
      onFiltersChange({ ...filters, classes: next });
    },
    [filters, onFiltersChange],
  );

  const toggleRaceFilter = useCallback(
    (race: string) => {
      const current = filters.races;
      const next = current.includes(race)
        ? current.filter((r) => r !== race)
        : [...current, race];
      onFiltersChange({ ...filters, races: next });
    },
    [filters, onFiltersChange],
  );

  const toggleLevelRange = useCallback(
    (range: LevelRange) => {
      const current = filters.levelRanges;
      const next = current.includes(range)
        ? current.filter((r) => r !== range)
        : [...current, range];
      onFiltersChange({ ...filters, levelRanges: next });
    },
    [filters, onFiltersChange],
  );

  const toggleArchived = useCallback(() => {
    onFiltersChange({ ...filters, showArchived: !filters.showArchived });
  }, [filters, onFiltersChange]);

  const hasActiveFilters =
    filters.search ||
    filters.classes.length > 0 ||
    filters.races.length > 0 ||
    filters.levelRanges.length > 0 ||
    filters.showArchived;

  const clearAllFilters = useCallback(() => {
    setLocalSearch('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onFiltersChange({
      search: '',
      classes: [],
      races: [],
      levelRanges: [],
      showArchived: false,
    });
  }, [onFiltersChange]);

  return (
    <div className="space-y-3" data-testid="gallery-toolbar">
      {/* Top row: search, sort, view toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-parchment/50" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search characters..."
            aria-label="Search characters"
            className={cn(
              'w-full rounded-lg border border-parchment/20 bg-bg-secondary pl-10 pr-8 py-2',
              'text-parchment placeholder:text-parchment/40',
              'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
              'transition-colors',
            )}
            data-testid="search-input"
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

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort characters"
            className={cn(
              'appearance-none rounded-lg border border-parchment/20 bg-bg-secondary',
              'pl-3 pr-8 py-2 text-parchment text-sm',
              'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
              'cursor-pointer transition-colors',
            )}
            data-testid="sort-select"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-parchment/50 pointer-events-none" />
        </div>

        {/* View mode toggle */}
        <div className="flex items-center rounded-lg border border-parchment/20 overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
            className={cn(
              'p-2 transition-colors',
              viewMode === 'grid'
                ? 'bg-accent-gold/20 text-accent-gold'
                : 'text-parchment/50 hover:text-parchment hover:bg-parchment/5',
            )}
            data-testid="view-grid-btn"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
            className={cn(
              'p-2 transition-colors',
              viewMode === 'list'
                ? 'bg-accent-gold/20 text-accent-gold'
                : 'text-parchment/50 hover:text-parchment hover:bg-parchment/5',
            )}
            data-testid="view-list-btn"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Class chips */}
        {classOptions.length > 0 && (
          <FilterChipGroup
            label="Class"
            options={classOptions}
            selectedValues={filters.classes}
            onToggle={toggleClassFilter}
          />
        )}

        {/* Race chips */}
        {raceOptions.length > 0 && (
          <FilterChipGroup
            label="Race"
            options={raceOptions}
            selectedValues={filters.races}
            onToggle={toggleRaceFilter}
          />
        )}

        {/* Level range chips */}
        <FilterChipGroup
          label="Level"
          options={LEVEL_RANGES}
          selectedValues={filters.levelRanges}
          onToggle={(v) => toggleLevelRange(v as LevelRange)}
        />

        {/* Show Archived toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none ml-auto">
          <button
            role="switch"
            aria-checked={filters.showArchived}
            aria-label="Show Archived"
            onClick={toggleArchived}
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
              filters.showArchived ? 'bg-accent-gold' : 'bg-parchment/20',
            )}
            data-testid="show-archived-toggle"
          >
            <span
              className={cn(
                'inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform',
                filters.showArchived ? 'translate-x-4.5' : 'translate-x-0.5',
              )}
            />
          </button>
          <span className="text-xs text-parchment/60">Archived</span>
        </label>

        {/* Clear all filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-accent-gold/70 hover:text-accent-gold transition-colors underline"
            data-testid="clear-filters-btn"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-xs text-parchment/40" data-testid="results-count">
          Showing {filteredCount} of {totalCount} characters
        </p>
      )}
    </div>
  );
}

// -- Internal sub-component: FilterChipGroup ----------------------------------

function FilterChipGroup({
  label,
  options,
  selectedValues,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!expanded) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  const selectedCount = selectedValues.length;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-label={`Filter by ${label}`}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border transition-all',
          selectedCount > 0
            ? 'bg-accent-gold/20 border-accent-gold text-accent-gold'
            : 'border-parchment/20 text-parchment/60 hover:border-parchment/40 hover:text-parchment/80',
        )}
        data-testid={`filter-chip-${label.toLowerCase()}`}
      >
        {label}
        {selectedCount > 0 && (
          <span className="ml-1 bg-accent-gold text-bg-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
            {selectedCount}
          </span>
        )}
        <ChevronDown size={14} className={cn('transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <div
          className={cn(
            'absolute left-0 top-full mt-1 z-50',
            'w-56 max-h-60 overflow-y-auto',
            'rounded-lg border border-parchment/20 bg-bg-secondary shadow-xl',
            'py-1',
          )}
        >
          {options.map((opt) => {
            const isActive = selectedValues.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => onToggle(opt.value)}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left transition-colors',
                  isActive
                    ? 'text-accent-gold bg-accent-gold/10'
                    : 'text-parchment/70 hover:bg-parchment/5 hover:text-parchment',
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0',
                    isActive ? 'bg-accent-gold border-accent-gold' : 'border-parchment/30',
                  )}
                >
                  {isActive && (
                    <svg
                      className="w-3 h-3 text-bg-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
