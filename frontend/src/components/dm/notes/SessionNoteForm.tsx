/**
 * SessionNoteForm (Story 36.2)
 *
 * Add/edit form for session notes with structured fields.
 */

import { useState } from 'react'
import {
  Calendar,
  Hash,
  X,
  Plus,
  Save,
} from 'lucide-react'
import type { SessionNote } from '@/types/campaign'
import { getNextSessionNumber, getTodayDateString } from '@/utils/dm-notes'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SessionNoteFormProps {
  /** Existing session for editing, or null for creating */
  existingSession?: SessionNote | null
  /** All sessions for auto-increment */
  existingSessions: SessionNote[]
  /** Campaign ID */
  campaignId: string
  /** Called on save */
  onSave: (session: SessionNote) => void
  /** Called on cancel */
  onCancel: () => void
  /** Known NPC names for autocomplete */
  knownNPCs?: string[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionNoteForm({
  existingSession,
  existingSessions,
  campaignId,
  onSave,
  onCancel,
  knownNPCs = [],
}: SessionNoteFormProps) {
  const isEditing = !!existingSession

  const [sessionNumber] = useState(
    existingSession?.sessionNumber ?? getNextSessionNumber(existingSessions)
  )
  const [date, setDate] = useState(
    existingSession?.date ?? getTodayDateString()
  )
  const [title, setTitle] = useState(existingSession?.title ?? '')
  const [content, setContent] = useState(existingSession?.content ?? '')
  const [tags, setTags] = useState<string[]>(existingSession?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [xpAwarded, setXpAwarded] = useState(
    existingSession?.xpAwarded?.toString() ?? ''
  )

  // NPC and location tag inputs
  const [npcInput, setNpcInput] = useState('')
  const [npcsEncountered, setNpcsEncountered] = useState<string[]>([])
  const [locationInput, setLocationInput] = useState('')
  const [locationsVisited, setLocationsVisited] = useState<string[]>([])
  const [showNPCSuggestions, setShowNPCSuggestions] = useState(false)

  const filteredNPCSuggestions = knownNPCs.filter(
    (npc) =>
      npc.toLowerCase().includes(npcInput.toLowerCase()) &&
      !npcsEncountered.includes(npc)
  )

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleAddNPC = (name?: string) => {
    const npcName = name ?? npcInput.trim()
    if (npcName && !npcsEncountered.includes(npcName)) {
      setNpcsEncountered([...npcsEncountered, npcName])
      setNpcInput('')
      setShowNPCSuggestions(false)
    }
  }

  const handleRemoveNPC = (name: string) => {
    setNpcsEncountered(npcsEncountered.filter((n) => n !== name))
  }

  const handleAddLocation = () => {
    const trimmed = locationInput.trim()
    if (trimmed && !locationsVisited.includes(trimmed)) {
      setLocationsVisited([...locationsVisited, trimmed])
      setLocationInput('')
    }
  }

  const handleRemoveLocation = (loc: string) => {
    setLocationsVisited(locationsVisited.filter((l) => l !== loc))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const sessionNote: SessionNote = {
      id: existingSession?.id ?? crypto.randomUUID(),
      campaignId,
      sessionNumber,
      date,
      title: title.trim(),
      content: content.trim(),
      tags,
      xpAwarded: xpAwarded ? parseInt(xpAwarded, 10) : undefined,
    }

    onSave(sessionNote)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border-2 border-accent-gold/30 bg-bg-secondary p-4 space-y-4"
      data-testid="session-note-form"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-accent-gold">
          {isEditing ? 'Edit Session' : 'Add New Session'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded hover:bg-parchment/10 transition-colors"
          aria-label="Cancel"
        >
          <X className="w-5 h-5 text-parchment/50" />
        </button>
      </div>

      {/* Session number and date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-1.5 text-xs text-parchment/60 mb-1">
            <Hash className="w-3.5 h-3.5" />
            Session Number
          </label>
          <input
            type="number"
            value={sessionNumber}
            readOnly
            className="w-full px-3 py-2 rounded-lg bg-bg-primary/50 border border-parchment/20 text-parchment text-sm cursor-not-allowed opacity-60"
            aria-label="Session number"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs text-parchment/60 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm focus:border-accent-gold/40 focus:outline-none"
            aria-label="Session date"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-xs text-parchment/60 mb-1 block">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Session ${sessionNumber}: Into the Mines`}
          className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
          required
          aria-label="Session title"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="text-xs text-parchment/60 mb-1 block">Summary</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What happened this session..."
          className="w-full min-h-[100px] px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none resize-y"
          aria-label="Session summary"
        />
      </div>

      {/* NPCs Encountered */}
      <div>
        <label className="text-xs text-parchment/60 mb-1 block">
          NPCs Encountered
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {npcsEncountered.map((npc) => (
            <span
              key={npc}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30"
            >
              {npc}
              <button
                type="button"
                onClick={() => handleRemoveNPC(npc)}
                aria-label={`Remove ${npc}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="relative">
          <div className="flex gap-2">
            <input
              type="text"
              value={npcInput}
              onChange={(e) => {
                setNpcInput(e.target.value)
                setShowNPCSuggestions(true)
              }}
              onFocus={() => setShowNPCSuggestions(true)}
              onBlur={() => setTimeout(() => setShowNPCSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddNPC()
                }
              }}
              placeholder="Add NPC name..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
              aria-label="NPC name input"
            />
            <button
              type="button"
              onClick={() => handleAddNPC()}
              className="px-2 py-1.5 rounded-lg bg-parchment/10 text-parchment/60 hover:bg-parchment/20 transition-colors"
              aria-label="Add NPC"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* NPC autocomplete suggestions */}
          {showNPCSuggestions &&
            npcInput.trim() &&
            filteredNPCSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 rounded-lg border border-parchment/20 bg-bg-secondary shadow-xl max-h-40 overflow-y-auto">
                {filteredNPCSuggestions.map((npc) => (
                  <button
                    key={npc}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm text-parchment hover:bg-parchment/10 transition-colors"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleAddNPC(npc)
                    }}
                  >
                    {npc}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Locations Visited */}
      <div>
        <label className="text-xs text-parchment/60 mb-1 block">
          Locations Visited
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {locationsVisited.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs bg-green-500/20 text-green-400 border border-green-500/30"
            >
              {loc}
              <button
                type="button"
                onClick={() => handleRemoveLocation(loc)}
                aria-label={`Remove ${loc}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddLocation()
              }
            }}
            placeholder="Add location..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
            aria-label="Location input"
          />
          <button
            type="button"
            onClick={handleAddLocation}
            className="px-2 py-1.5 rounded-lg bg-parchment/10 text-parchment/60 hover:bg-parchment/20 transition-colors"
            aria-label="Add location"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* XP Awarded and Tags */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-parchment/60 mb-1 block">
            XP Awarded
          </label>
          <input
            type="number"
            value={xpAwarded}
            onChange={(e) => setXpAwarded(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
            aria-label="XP awarded"
          />
        </div>
        <div>
          <label className="text-xs text-parchment/60 mb-1 block">Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag()
                }
              }}
              placeholder="Add tag..."
              className="flex-1 px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
              aria-label="Tag input"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-2 py-2 rounded-lg bg-parchment/10 text-parchment/60 hover:bg-parchment/20 transition-colors"
              aria-label="Add tag"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs bg-accent-gold/15 text-accent-gold/80 border border-accent-gold/20"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                aria-label={`Remove ${tag} tag`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm text-parchment/60 hover:bg-parchment/10 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Update Session' : 'Add Session'}
        </button>
      </div>
    </form>
  )
}
