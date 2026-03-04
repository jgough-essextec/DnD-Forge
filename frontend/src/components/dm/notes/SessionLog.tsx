/**
 * SessionLog (Story 36.2)
 *
 * Chronological timeline of sessions with search, filter,
 * sort toggle, and add/edit capabilities.
 */

import { useState, useMemo } from 'react'
import {
  Scroll,
  Plus,
  Search,
  ArrowUpDown,
  Filter,
  X,
} from 'lucide-react'
import type { SessionNote } from '@/types/campaign'
import { SessionNoteCard } from './SessionNoteCard'
import { SessionNoteForm } from './SessionNoteForm'
import {
  sortSessions,
  searchSessions,
  filterSessionsByTag,
} from '@/utils/dm-notes'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SessionLogProps {
  /** Campaign ID */
  campaignId: string
  /** All sessions for this campaign */
  sessions: SessionNote[]
  /** Called when a session is saved (create or update) */
  onSaveSession: (session: SessionNote) => void
  /** Called when a session is deleted */
  onDeleteSession: (sessionId: string) => void
  /** Known NPC names for autocomplete in form */
  knownNPCs?: string[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionLog({
  campaignId,
  sessions,
  onSaveSession,
  onDeleteSession,
  knownNPCs = [],
}: SessionLogProps) {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSession, setEditingSession] = useState<SessionNote | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Collect all unique tags from sessions
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    sessions.forEach((s) => s.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [sessions])

  // Filter and sort
  const filteredSessions = useMemo(() => {
    let result = sessions
    if (searchQuery) {
      result = searchSessions(result, searchQuery)
    }
    if (filterTag) {
      result = filterSessionsByTag(result, filterTag)
    }
    return sortSessions(result, sortOrder)
  }, [sessions, searchQuery, filterTag, sortOrder])

  const handleSave = (session: SessionNote) => {
    onSaveSession(session)
    setShowForm(false)
    setEditingSession(null)
  }

  const handleEdit = (session: SessionNote) => {
    setEditingSession(session)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSession(null)
  }

  return (
    <div className="space-y-4" data-testid="session-log">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scroll className="w-5 h-5 text-accent-gold" />
          <h2 className="font-heading text-lg text-accent-gold">
            Session Log
          </h2>
          <span className="text-xs text-parchment/40">
            ({sessions.length} session{sessions.length !== 1 ? 's' : ''})
          </span>
        </div>

        <button
          onClick={() => {
            setEditingSession(null)
            setShowForm(true)
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30 transition-colors"
          aria-label="Add new session"
        >
          <Plus className="w-4 h-4" />
          Add Session
        </button>
      </div>

      {/* Search and filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
              aria-label="Search sessions"
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

          {/* Sort toggle */}
          <button
            onClick={() =>
              setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-parchment/20 text-xs text-parchment/60 hover:border-parchment/40 transition-colors"
            aria-label={`Sort by ${sortOrder === 'newest' ? 'oldest' : 'newest'} first`}
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>

          {/* Filter toggle */}
          {allTags.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors ${
                filterTag
                  ? 'border-accent-gold/40 text-accent-gold bg-accent-gold/10'
                  : 'border-parchment/20 text-parchment/60 hover:border-parchment/40'
              }`}
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          )}
        </div>

        {/* Tag filter chips */}
        {showFilters && allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5" data-testid="tag-filters">
            <button
              onClick={() => setFilterTag('')}
              className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                filterTag === ''
                  ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/30'
                  : 'border-parchment/20 text-parchment/50 hover:border-parchment/40'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
                className={`rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                  filterTag === tag
                    ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/30'
                    : 'border-parchment/20 text-parchment/50 hover:border-parchment/40'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <SessionNoteForm
          existingSession={editingSession}
          existingSessions={sessions}
          campaignId={campaignId}
          onSave={handleSave}
          onCancel={handleCancel}
          knownNPCs={knownNPCs}
        />
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        {filteredSessions.length > 0 && (
          <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-parchment/10" />
        )}

        {/* Empty state */}
        {sessions.length === 0 && (
          <div className="text-center py-12 text-parchment/50">
            <Scroll className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-2">No sessions recorded yet.</p>
            <p className="text-xs text-parchment/30">
              Click "Add Session" to start your campaign log.
            </p>
          </div>
        )}

        {/* No results state */}
        {sessions.length > 0 && filteredSessions.length === 0 && (
          <div className="text-center py-8 text-parchment/50">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No sessions match your search.</p>
          </div>
        )}

        {/* Session cards */}
        {filteredSessions.map((session) => (
          <SessionNoteCard
            key={session.id}
            session={session}
            campaignId={campaignId}
            onEdit={handleEdit}
            onDelete={onDeleteSession}
          />
        ))}
      </div>
    </div>
  )
}
