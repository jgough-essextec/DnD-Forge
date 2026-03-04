/**
 * SessionNotePage (Story 36.2)
 *
 * Full session note detail view at /campaign/:id/session/:sessionId.
 * Shows all structured fields with inline editing.
 */

import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Hash,
  Users,
  MapPin,
  Award,
  Coins,
  Edit,
  Save,
  X,
  Tag,
} from 'lucide-react'
import { useCampaign, useUpdateCampaign } from '@/hooks/useCampaigns'
import { formatSessionDate } from '@/utils/dm-notes'
import { useUIStore } from '@/stores/uiStore'
import type { SessionNote } from '@/types/campaign'

export default function SessionNotePage() {
  const { id: campaignId, sessionId } = useParams<{
    id: string
    sessionId: string
  }>()
  const navigate = useNavigate()
  const { data: campaign, isLoading } = useCampaign(campaignId ?? null)
  const updateCampaign = useUpdateCampaign()
  const addToast = useUIStore((s) => s.addToast)

  const [isEditing, setIsEditing] = useState(false)

  const session = useMemo(
    () => campaign?.sessions.find((s) => s.id === sessionId),
    [campaign, sessionId]
  )

  // Edit state
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editXP, setEditXP] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const startEditing = () => {
    if (!session) return
    setEditTitle(session.title)
    setEditContent(session.content)
    setEditDate(session.date)
    setEditXP(session.xpAwarded?.toString() ?? '')
    setEditTags([...session.tags])
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !editTags.includes(trimmed)) {
      setEditTags([...editTags, trimmed])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setEditTags(editTags.filter((t) => t !== tag))
  }

  const saveChanges = () => {
    if (!campaign || !session || !campaignId) return

    const updatedSession: SessionNote = {
      ...session,
      title: editTitle.trim(),
      content: editContent.trim(),
      date: editDate,
      xpAwarded: editXP ? parseInt(editXP, 10) : undefined,
      tags: editTags,
    }

    const updatedSessions = campaign.sessions.map((s) =>
      s.id === session.id ? updatedSession : s
    )

    updateCampaign.mutate(
      { id: campaignId, data: { sessions: updatedSessions } },
      {
        onSuccess: () => {
          setIsEditing(false)
          addToast({ message: 'Session note updated.', type: 'success' })
        },
        onError: () => {
          addToast({
            message: 'Failed to update session note.',
            type: 'error',
          })
        },
      }
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-pulse text-parchment/50">
          Loading session...
        </div>
      </div>
    )
  }

  // Not found state
  if (!campaign || !session) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate(campaignId ? `/campaign/${campaignId}` : '/campaigns')}
          className="flex items-center gap-1.5 text-sm text-parchment/60 hover:text-parchment mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaign
        </button>
        <div className="text-center py-12">
          <p className="text-parchment/50">Session not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto" data-testid="session-note-page">
      {/* Back navigation */}
      <button
        onClick={() => navigate(`/campaign/${campaignId}`)}
        className="flex items-center gap-1.5 text-sm text-parchment/60 hover:text-parchment mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {campaign.name}
      </button>

      {/* Session header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-1 text-sm text-accent-gold font-medium">
              <Hash className="w-4 h-4" />
              Session {session.sessionNumber}
            </span>
            <span className="flex items-center gap-1 text-sm text-parchment/50">
              <Calendar className="w-4 h-4" />
              {isEditing ? (
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="px-2 py-0.5 rounded bg-bg-primary border border-parchment/20 text-parchment text-sm focus:border-accent-gold/40 focus:outline-none"
                  aria-label="Edit session date"
                />
              ) : (
                formatSessionDate(session.date)
              )}
            </span>
          </div>

          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-heading text-2xl text-accent-gold bg-bg-primary border border-parchment/20 rounded-lg px-3 py-1 w-full focus:border-accent-gold/40 focus:outline-none"
              aria-label="Edit session title"
            />
          ) : (
            <h1 className="font-heading text-2xl text-accent-gold">
              {session.title}
            </h1>
          )}
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={cancelEditing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-parchment/60 hover:bg-parchment/10 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </>
          ) : (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-parchment/60 hover:bg-parchment/10 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {editTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs bg-accent-gold/15 text-accent-gold/80 border border-accent-gold/20"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Tag className="w-4 h-4 text-parchment/40 mt-1" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Add tag..."
                className="flex-1 px-3 py-1 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
                aria-label="Tag input"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-2 py-1 rounded-lg bg-parchment/10 text-parchment/60 text-sm hover:bg-parchment/20 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          session.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {session.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-0.5 text-xs bg-accent-gold/15 text-accent-gold/80 border border-accent-gold/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )
        )}
      </div>

      {/* Content */}
      <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-6 mb-6">
        <h2 className="font-heading text-sm text-parchment/50 mb-3">
          Session Summary
        </h2>
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[200px] px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none resize-y"
            placeholder="What happened this session..."
            aria-label="Edit session summary"
          />
        ) : (
          <div className="text-sm text-parchment/80 whitespace-pre-wrap leading-relaxed">
            {session.content || (
              <span className="text-parchment/30 italic">
                No summary written yet.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Structured fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* XP Awarded */}
        <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <h3 className="text-xs font-medium text-parchment/50">
              XP Awarded
            </h3>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={editXP}
              onChange={(e) => setEditXP(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm focus:border-accent-gold/40 focus:outline-none"
              aria-label="Edit XP awarded"
            />
          ) : (
            <p className="text-lg text-parchment font-heading">
              {session.xpAwarded != null
                ? `${session.xpAwarded.toLocaleString()} XP`
                : '-'}
            </p>
          )}
        </div>

        {/* Loot Distributed */}
        <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-medium text-parchment/50">
              Loot Distributed
            </h3>
          </div>
          {session.lootDistributed && session.lootDistributed.length > 0 ? (
            <div className="space-y-1">
              {session.lootDistributed.map((dist, i) => (
                <div key={i} className="text-sm text-parchment/80">
                  <span className="text-parchment/50">
                    {dist.characterId}:
                  </span>{' '}
                  {dist.items.join(', ')}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-parchment/30 italic">None recorded</p>
          )}
        </div>

        {/* NPCs placeholder */}
        <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-medium text-parchment/50">
              NPCs Encountered
            </h3>
          </div>
          <p className="text-sm text-parchment/30 italic">
            Link NPCs from the NPC Tracker
          </p>
        </div>

        {/* Locations placeholder */}
        <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-green-400" />
            <h3 className="text-xs font-medium text-parchment/50">
              Locations Visited
            </h3>
          </div>
          <p className="text-sm text-parchment/30 italic">
            Add locations to this session
          </p>
        </div>
      </div>
    </div>
  )
}
