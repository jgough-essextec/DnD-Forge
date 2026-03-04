/**
 * SessionNoteCard (Story 36.2)
 *
 * Individual session entry card for the session timeline.
 * Shows session number, date, title, summary preview, and tags.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Hash,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Users,
  MapPin,
  Coins,
  Award,
  ExternalLink,
} from 'lucide-react'
import type { SessionNote } from '@/types/campaign'
import { formatSessionDate } from '@/utils/dm-notes'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SessionNoteCardProps {
  session: SessionNote
  campaignId: string
  onEdit: (session: SessionNote) => void
  onDelete: (sessionId: string) => void
  /** NPC names referenced in this session */
  npcsEncountered?: string[]
  /** Locations visited in this session */
  locationsVisited?: string[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionNoteCard({
  session,
  campaignId,
  onEdit,
  onDelete,
  npcsEncountered = [],
  locationsVisited = [],
}: SessionNoteCardProps) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleNavigateToDetail = () => {
    navigate(`/campaign/${campaignId}/session/${session.id}`)
  }

  const handleDelete = () => {
    onDelete(session.id)
    setShowDeleteConfirm(false)
  }

  const summaryPreview =
    session.content.length > 150
      ? session.content.slice(0, 150) + '...'
      : session.content

  return (
    <div
      className="relative pl-8 pb-6"
      data-testid={`session-card-${session.id}`}
    >
      {/* Timeline dot */}
      <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-accent-gold border-2 border-bg-primary" />

      {/* Card */}
      <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary overflow-hidden">
        {/* Header - always visible */}
        <div
          className="p-4 cursor-pointer hover:bg-parchment/5 transition-colors"
          onClick={() => setExpanded(!expanded)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setExpanded(!expanded)
            }
          }}
          aria-expanded={expanded}
          aria-label={`Session ${session.sessionNumber}: ${session.title}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1 text-xs text-accent-gold font-medium">
                  <Hash className="w-3.5 h-3.5" />
                  Session {session.sessionNumber}
                </span>
                <span className="flex items-center gap-1 text-xs text-parchment/50">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatSessionDate(session.date)}
                </span>
              </div>

              <h3 className="font-heading text-base text-parchment truncate">
                {session.title}
              </h3>

              {!expanded && (
                <p className="text-sm text-parchment/60 mt-1 line-clamp-2">
                  {summaryPreview}
                </p>
              )}

              {/* Tags */}
              {session.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {session.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2 py-0.5 text-xs bg-accent-gold/15 text-accent-gold/80 border border-accent-gold/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="ml-2 flex items-center gap-1">
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-parchment/50" />
              ) : (
                <ChevronDown className="w-4 h-4 text-parchment/50" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-parchment/10 pt-3 space-y-3">
            {/* Full content */}
            <div className="text-sm text-parchment/80 whitespace-pre-wrap">
              {session.content}
            </div>

            {/* Structured fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {npcsEncountered.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Users className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-parchment/50 text-xs block">
                      NPCs Encountered
                    </span>
                    <span className="text-parchment/80">
                      {npcsEncountered.join(', ')}
                    </span>
                  </div>
                </div>
              )}

              {locationsVisited.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-parchment/50 text-xs block">
                      Locations
                    </span>
                    <span className="text-parchment/80">
                      {locationsVisited.join(', ')}
                    </span>
                  </div>
                </div>
              )}

              {session.xpAwarded != null && session.xpAwarded > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Award className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-parchment/50 text-xs block">
                      XP Awarded
                    </span>
                    <span className="text-parchment/80">
                      {session.xpAwarded.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              )}

              {session.lootDistributed && session.lootDistributed.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Coins className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-parchment/50 text-xs block">
                      Loot Distributed
                    </span>
                    <span className="text-parchment/80">
                      {session.lootDistributed.length} distribution
                      {session.lootDistributed.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-parchment/10">
              <button
                onClick={handleNavigateToDetail}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-accent-gold hover:bg-accent-gold/10 transition-colors"
                aria-label="View session details"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Details
              </button>
              <button
                onClick={() => onEdit(session)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-parchment/60 hover:bg-parchment/10 transition-colors"
                aria-label="Edit session"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:bg-red-400/10 transition-colors"
                  aria-label="Delete session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs text-red-400">
                    Permanently delete Session {session.sessionNumber}?
                  </span>
                  <button
                    onClick={handleDelete}
                    className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    data-testid="confirm-delete"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-1 rounded text-xs bg-parchment/10 text-parchment/60 hover:bg-parchment/20 transition-colors"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
