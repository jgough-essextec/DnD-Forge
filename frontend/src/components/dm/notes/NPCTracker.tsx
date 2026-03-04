/**
 * NPCTracker (Story 36.3)
 *
 * Searchable, filterable NPC management with card grid layout.
 */

import { useState, useMemo } from 'react'
import {
  Users,
  Plus,
  Search,
  Filter,
  X,
} from 'lucide-react'
import { NPCCard } from './NPCCard'
import { NPCForm } from './NPCForm'
import {
  NPC_ROLES,
  NPC_STATUSES,
  NPC_ROLE_COLORS,
  NPC_STATUS_COLORS,
  filterNPCsByName,
  filterNPCsByRole,
  filterNPCsByStatus,
  type NPCEntry,
  type NPCRole,
  type NPCStatus,
} from '@/utils/dm-notes'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NPCTrackerProps {
  campaignId: string
  npcs: NPCEntry[]
  onAddNPC: (npc: NPCEntry) => void
  onUpdateNPC: (npc: NPCEntry) => void
  onDeleteNPC: (npcId: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NPCTracker({
  campaignId,
  npcs,
  onAddNPC,
  onUpdateNPC,
  onDeleteNPC,
}: NPCTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<NPCRole | ''>('')
  const [statusFilter, setStatusFilter] = useState<NPCStatus | ''>('')
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = !!roleFilter || !!statusFilter || !!searchQuery

  const filteredNPCs = useMemo(() => {
    let result = npcs
    if (searchQuery) {
      result = filterNPCsByName(result, searchQuery)
    }
    if (roleFilter) {
      result = filterNPCsByRole(result, roleFilter)
    }
    if (statusFilter) {
      result = filterNPCsByStatus(result, statusFilter)
    }
    return result
  }, [npcs, searchQuery, roleFilter, statusFilter])

  const handleAddNPC = (npc: NPCEntry) => {
    onAddNPC(npc)
    setShowForm(false)
  }

  const clearFilters = () => {
    setRoleFilter('')
    setStatusFilter('')
    setSearchQuery('')
  }

  return (
    <div className="space-y-4" data-testid="npc-tracker">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-accent-gold" />
          <h2 className="font-heading text-lg text-accent-gold">NPC Tracker</h2>
          <span className="text-xs text-parchment/40">
            ({npcs.length} NPC{npcs.length !== 1 ? 's' : ''})
          </span>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30 transition-colors"
          aria-label="Add NPC"
        >
          <Plus className="w-4 h-4" />
          Add NPC
        </button>
      </div>

      {/* Search and filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NPCs..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
              aria-label="Search NPCs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-parchment/40 hover:text-parchment/60" />
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

        {/* Filter chips */}
        {showFilters && (
          <div className="space-y-2 p-3 rounded-lg bg-bg-primary/50 border border-parchment/10">
            {/* Role filters */}
            <div>
              <label className="text-xs text-parchment/50 mb-1.5 block">
                Role
              </label>
              <div className="flex flex-wrap gap-1.5" data-testid="role-filters">
                <button
                  onClick={() => setRoleFilter('')}
                  className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                    roleFilter === ''
                      ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/30'
                      : 'border-parchment/20 text-parchment/50 hover:border-parchment/40'
                  }`}
                >
                  All
                </button>
                {NPC_ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() =>
                      setRoleFilter(role === roleFilter ? '' : role)
                    }
                    className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                      roleFilter === role
                        ? NPC_ROLE_COLORS[role]
                        : 'border-parchment/20 text-parchment/50 hover:border-parchment/40'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Status filters */}
            <div>
              <label className="text-xs text-parchment/50 mb-1.5 block">
                Status
              </label>
              <div
                className="flex flex-wrap gap-1.5"
                data-testid="status-filters"
              >
                <button
                  onClick={() => setStatusFilter('')}
                  className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                    statusFilter === ''
                      ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/30'
                      : 'border-parchment/20 text-parchment/50 hover:border-parchment/40'
                  }`}
                >
                  All
                </button>
                {NPC_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setStatusFilter(status === statusFilter ? '' : status)
                    }
                    className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                      statusFilter === status
                        ? NPC_STATUS_COLORS[status]
                        : 'border-parchment/20 text-parchment/50 hover:border-parchment/40'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add NPC Form */}
      {showForm && (
        <NPCForm
          campaignId={campaignId}
          onSave={handleAddNPC}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* NPC Grid */}
      {npcs.length === 0 && !showForm && (
        <div className="text-center py-12 text-parchment/50">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm mb-2">No NPCs tracked yet.</p>
          <p className="text-xs text-parchment/30">
            Click "Add NPC" to start tracking characters your party encounters.
          </p>
        </div>
      )}

      {npcs.length > 0 && filteredNPCs.length === 0 && (
        <div className="text-center py-8 text-parchment/50">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No NPCs match your search.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredNPCs.map((npc) => (
          <NPCCard
            key={npc.id}
            npc={npc}
            onUpdate={onUpdateNPC}
            onDelete={onDeleteNPC}
          />
        ))}
      </div>
    </div>
  )
}
