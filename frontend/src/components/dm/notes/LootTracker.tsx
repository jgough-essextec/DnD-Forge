/**
 * LootTracker (Story 36.4)
 *
 * Running loot ledger with sortable table, currency tracking,
 * filtering, and character assignment.
 */

import { useState, useMemo } from 'react'
import {
  Coins,
  Plus,
  ArrowUpDown,
  Filter,
  X,
  Search,
  Trash2,
  Gem,
  Package,
  Award,
  CircleDollarSign,
  HelpCircle,
} from 'lucide-react'
import { LootEntryForm } from './LootEntryForm'
import {
  LOOT_TYPES,
  LOOT_TYPE_COLORS,
  calculateTotalLootValue,
  aggregateCurrencyToGP,
  sortLootEntries,
  filterLootByType,
  filterLootByAssignee,
  type LootTrackerEntry,
  type LootType,
  type CurrencyBreakdown,
} from '@/utils/dm-notes'
import type { SessionNote } from '@/types/campaign'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LootTrackerProps {
  campaignId: string
  lootEntries: LootTrackerEntry[]
  /** Characters for assignment */
  characters: Array<{ id: string; name: string }>
  /** Sessions for linking */
  sessions: SessionNote[]
  /** Party currency totals */
  partyCurrency?: CurrencyBreakdown
  onAddEntry: (entry: LootTrackerEntry) => void
  onDeleteEntry: (entryId: string) => void
}

// ---------------------------------------------------------------------------
// Type icon helper
// ---------------------------------------------------------------------------

function LootTypeIcon({ type }: { type: LootType }) {
  const iconClass = 'w-4 h-4'
  switch (type) {
    case 'Gold/Currency':
      return <CircleDollarSign className={iconClass} />
    case 'Magic Item':
      return <Gem className={iconClass} />
    case 'Mundane Item':
      return <Package className={iconClass} />
    case 'Quest Reward':
      return <Award className={iconClass} />
    case 'Other':
      return <HelpCircle className={iconClass} />
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LootTracker({
  campaignId,
  lootEntries,
  characters,
  sessions,
  partyCurrency,
  onAddEntry,
  onDeleteEntry,
}: LootTrackerProps) {
  const [showForm, setShowForm] = useState(false)
  const [sortBy, setSortBy] =
    useState<'name' | 'type' | 'value' | 'assignedTo' | 'sessionNumber'>('sessionNumber')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [typeFilter, setTypeFilter] = useState<LootType | ''>('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = !!typeFilter || !!assigneeFilter || !!searchQuery

  // Character lookup map
  const characterMap = useMemo(() => {
    const map = new Map<string, string>()
    characters.forEach((c) => map.set(c.id, c.name))
    return map
  }, [characters])

  // Filter and sort
  const filteredEntries = useMemo(() => {
    let result = lootEntries

    // Search filter
    if (searchQuery) {
      const lower = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(lower) ||
          e.notes.toLowerCase().includes(lower)
      )
    }

    if (typeFilter) {
      result = filterLootByType(result, typeFilter)
    }
    if (assigneeFilter) {
      result = filterLootByAssignee(result, assigneeFilter)
    }
    return sortLootEntries(result, sortBy, sortDir)
  }, [lootEntries, searchQuery, typeFilter, assigneeFilter, sortBy, sortDir])

  const totalValue = calculateTotalLootValue(lootEntries)
  const partyGoldTotal = partyCurrency
    ? aggregateCurrencyToGP(partyCurrency)
    : 0

  const handleSort = (
    field: 'name' | 'type' | 'value' | 'assignedTo' | 'sessionNumber'
  ) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const handleAddEntry = (entry: LootTrackerEntry) => {
    onAddEntry(entry)
    setShowForm(false)
  }

  const clearFilters = () => {
    setTypeFilter('')
    setAssigneeFilter('')
    setSearchQuery('')
  }

  const SortButton = ({
    field,
    children,
  }: {
    field: 'name' | 'type' | 'value' | 'assignedTo' | 'sessionNumber'
    children: React.ReactNode
  }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-xs font-medium transition-colors ${
        sortBy === field ? 'text-accent-gold' : 'text-parchment/50 hover:text-parchment/70'
      }`}
      aria-label={`Sort by ${field}`}
    >
      {children}
      {sortBy === field && (
        <ArrowUpDown className="w-3 h-3" />
      )}
    </button>
  )

  return (
    <div className="space-y-4" data-testid="loot-tracker">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-accent-gold" />
          <h2 className="font-heading text-lg text-accent-gold">
            Loot Tracker
          </h2>
          <span className="text-xs text-parchment/40">
            ({lootEntries.length} item{lootEntries.length !== 1 ? 's' : ''})
          </span>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30 transition-colors"
          aria-label="Add loot"
        >
          <Plus className="w-4 h-4" />
          Add Loot
        </button>
      </div>

      {/* Party Gold summary */}
      {partyCurrency && (
        <div
          className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3"
          data-testid="party-gold"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-yellow-400/80 font-medium">
              Party Gold
            </span>
            <span className="text-sm text-yellow-400 font-heading">
              {partyGoldTotal.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}{' '}
              GP
            </span>
          </div>
          <div className="flex gap-3 mt-1.5 text-xs text-parchment/40">
            {partyCurrency.pp > 0 && <span>{partyCurrency.pp} PP</span>}
            {partyCurrency.gp > 0 && <span>{partyCurrency.gp} GP</span>}
            {partyCurrency.ep > 0 && <span>{partyCurrency.ep} EP</span>}
            {partyCurrency.sp > 0 && <span>{partyCurrency.sp} SP</span>}
            {partyCurrency.cp > 0 && <span>{partyCurrency.cp} CP</span>}
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search loot..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
              aria-label="Search loot"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-parchment/40" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors ${
              hasActiveFilters
                ? 'border-accent-gold/40 text-accent-gold bg-accent-gold/10'
                : 'border-parchment/20 text-parchment/60 hover:border-parchment/40'
            }`}
            aria-label="Toggle filters"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-parchment/20 text-xs text-parchment/60 hover:border-parchment/40 transition-colors"
              aria-label="Clear all filters"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="space-y-2 p-3 rounded-lg bg-bg-primary/50 border border-parchment/10">
            {/* Type filter */}
            <div>
              <label className="text-xs text-parchment/50 mb-1.5 block">
                Type
              </label>
              <div className="flex flex-wrap gap-1.5" data-testid="type-filters">
                <button
                  onClick={() => setTypeFilter('')}
                  className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                    typeFilter === ''
                      ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/30'
                      : 'border-parchment/20 text-parchment/50 hover:border-parchment/40'
                  }`}
                >
                  All
                </button>
                {LOOT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      setTypeFilter(t === typeFilter ? '' : t)
                    }
                    className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                      typeFilter === t
                        ? `${LOOT_TYPE_COLORS[t]} border-current`
                        : 'border-parchment/20 text-parchment/50 hover:border-parchment/40'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee filter */}
            <div>
              <label className="text-xs text-parchment/50 mb-1.5 block">
                Assigned To
              </label>
              <div
                className="flex flex-wrap gap-1.5"
                data-testid="assignee-filters"
              >
                <button
                  onClick={() => setAssigneeFilter('')}
                  className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                    assigneeFilter === ''
                      ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/30'
                      : 'border-parchment/20 text-parchment/50 hover:border-parchment/40'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() =>
                    setAssigneeFilter(
                      assigneeFilter === 'unassigned' ? '' : 'unassigned'
                    )
                  }
                  className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                    assigneeFilter === 'unassigned'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'border-parchment/20 text-parchment/50 hover:border-parchment/40'
                  }`}
                >
                  Unassigned
                </button>
                {characters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() =>
                      setAssigneeFilter(
                        assigneeFilter === c.id ? '' : c.id
                      )
                    }
                    className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                      assigneeFilter === c.id
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'border-parchment/20 text-parchment/50 hover:border-parchment/40'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <LootEntryForm
          campaignId={campaignId}
          characters={characters}
          sessions={sessions}
          onSave={handleAddEntry}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Loot Table */}
      {lootEntries.length === 0 && !showForm && (
        <div className="text-center py-12 text-parchment/50">
          <Coins className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm mb-2">No loot recorded yet.</p>
          <p className="text-xs text-parchment/30">
            Click "Add Loot" to start tracking treasure and rewards.
          </p>
        </div>
      )}

      {lootEntries.length > 0 && (
        <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-parchment/10 bg-bg-primary/30">
            <div className="col-span-4">
              <SortButton field="name">Item</SortButton>
            </div>
            <div className="col-span-2">
              <SortButton field="type">Type</SortButton>
            </div>
            <div className="col-span-2 text-right">
              <SortButton field="value">Value</SortButton>
            </div>
            <div className="col-span-2">
              <SortButton field="assignedTo">Assigned</SortButton>
            </div>
            <div className="col-span-1">
              <SortButton field="sessionNumber">Ses.</SortButton>
            </div>
            <div className="col-span-1" />
          </div>

          {/* Table rows */}
          {filteredEntries.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-parchment/50">
              No loot matches your filters.
            </div>
          )}

          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-parchment/5 hover:bg-parchment/5 transition-colors items-center"
              data-testid={`loot-row-${entry.id}`}
            >
              <div className="col-span-4">
                <span className="text-sm text-parchment">{entry.name}</span>
                {entry.quantity > 1 && (
                  <span className="text-xs text-parchment/40 ml-1">
                    x{entry.quantity}
                  </span>
                )}
              </div>
              <div className="col-span-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${LOOT_TYPE_COLORS[entry.type]}`}
                >
                  <LootTypeIcon type={entry.type} />
                  <span className="hidden sm:inline">{entry.type}</span>
                </span>
              </div>
              <div className="col-span-2 text-right text-sm text-parchment/70">
                {entry.value != null
                  ? `${(entry.value * entry.quantity).toLocaleString()} GP`
                  : '-'}
              </div>
              <div className="col-span-2 text-sm text-parchment/60 truncate">
                {entry.assignedTo
                  ? characterMap.get(entry.assignedTo) ?? entry.assignedTo
                  : 'Party'}
              </div>
              <div className="col-span-1 text-xs text-parchment/40">
                {entry.sessionNumber ?? '-'}
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => onDeleteEntry(entry.id)}
                  className="p-1 rounded text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  aria-label={`Delete ${entry.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Total value */}
          <div
            className="px-4 py-3 bg-bg-primary/30 border-t border-parchment/10"
            data-testid="total-value"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-parchment/50 font-medium">
                Total Party Loot Value
              </span>
              <span className="text-sm text-accent-gold font-heading">
                ~{totalValue.toLocaleString()} GP
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
