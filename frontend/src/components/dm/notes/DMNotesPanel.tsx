/**
 * DMNotesPanel (Story 36.1)
 *
 * Per-character private DM notes with markdown-lite editor,
 * auto-save, quick-note tags, and "All Notes" aggregate view.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  BookOpen,
  Eye,
  Tag,
  ChevronDown,
  ChevronUp,
  Save,
  X,
} from 'lucide-react'
import {
  parseMarkdownLite,
  DM_NOTE_TAGS,
  DM_NOTE_TAG_COLORS,
  type DMNoteTag,
  type CharacterDMNote,
} from '@/utils/dm-notes'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DMNotesPanelProps {
  /** Campaign ID for context */
  campaignId: string
  /** All character notes for this campaign */
  characterNotes: CharacterDMNote[]
  /** Callback when notes are saved */
  onSaveNote: (characterId: string, content: string, tags: DMNoteTag[]) => void
  /** Whether the panel is in DM view context (notes only show in DM view) */
  isDMView?: boolean
  /** Optional: focus on a single character */
  focusCharacterId?: string
}

// ---------------------------------------------------------------------------
// Single Character Note Editor
// ---------------------------------------------------------------------------

interface NoteEditorProps {
  note: CharacterDMNote
  onSave: (characterId: string, content: string, tags: DMNoteTag[]) => void
}

function NoteEditor({ note, onSave }: NoteEditorProps) {
  const [content, setContent] = useState(note.content)
  const [tags, setTags] = useState<DMNoteTag[]>(note.tags)
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save on debounce (500ms)
  const debouncedSave = useCallback(
    (newContent: string, newTags: DMNoteTag[]) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        setIsSaving(true)
        onSave(note.characterId, newContent, newTags)
        setTimeout(() => setIsSaving(false), 300)
      }, 500)
    },
    [note.characterId, onSave]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    debouncedSave(newContent, tags)
  }

  const toggleTag = (tag: DMNoteTag) => {
    const newTags = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag]
    setTags(newTags)
    debouncedSave(content, newTags)
  }

  const removeTag = (tag: DMNoteTag) => {
    const newTags = tags.filter((t) => t !== tag)
    setTags(newTags)
    debouncedSave(content, newTags)
  }

  return (
    <div className="space-y-3">
      {/* Active tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5" data-testid="active-tags">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${DM_NOTE_TAG_COLORS[tag]}`}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-0.5 hover:opacity-70"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Quick-note tag buttons */}
      <div className="flex flex-wrap gap-1.5">
        <Tag className="w-4 h-4 text-parchment/50 mt-0.5" />
        {DM_NOTE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`rounded-full px-2 py-0.5 text-xs border transition-all ${
              tags.includes(tag)
                ? DM_NOTE_TAG_COLORS[tag]
                : 'border-parchment/20 text-parchment/50 hover:border-parchment/40'
            }`}
            aria-label={`Add ${tag} tag`}
            aria-pressed={tags.includes(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 text-xs text-parchment/60 hover:text-parchment transition-colors"
          aria-label={showPreview ? 'Hide preview' : 'Show preview'}
        >
          <Eye className="w-3.5 h-3.5" />
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
        {isSaving && (
          <span className="flex items-center gap-1 text-xs text-green-400" data-testid="saving-indicator">
            <Save className="w-3 h-3" />
            Saving...
          </span>
        )}
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className="w-full min-h-[120px] p-3 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm font-mono placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none resize-y"
        placeholder="Write DM notes here... Supports **bold**, *italic*, # headers, and - bullet lists"
        aria-label={`DM notes for ${note.characterName}`}
      />

      {/* Preview */}
      {showPreview && (
        <div
          className="p-3 rounded-lg bg-bg-primary/50 border border-parchment/10 text-sm text-parchment prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: parseMarkdownLite(content) }}
          data-testid="markdown-preview"
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Panel
// ---------------------------------------------------------------------------

export function DMNotesPanel({
  characterNotes,
  onSaveNote,
  isDMView = true,
  focusCharacterId,
}: DMNotesPanelProps) {
  const [expandedCharacters, setExpandedCharacters] = useState<Set<string>>(
    () => {
      if (focusCharacterId) return new Set([focusCharacterId])
      return new Set<string>()
    }
  )
  const [viewMode, setViewMode] = useState<'individual' | 'all'>(
    focusCharacterId ? 'individual' : 'individual'
  )

  // DM notes are NOT visible outside DM context
  if (!isDMView) {
    return null
  }

  const toggleExpanded = (characterId: string) => {
    setExpandedCharacters((prev) => {
      const next = new Set(prev)
      if (next.has(characterId)) {
        next.delete(characterId)
      } else {
        next.add(characterId)
      }
      return next
    })
  }

  const notesToShow = focusCharacterId
    ? characterNotes.filter((n) => n.characterId === focusCharacterId)
    : characterNotes

  const hasAnyNotes = characterNotes.some(
    (n) => n.content.trim() || n.tags.length > 0
  )

  return (
    <div className="space-y-4" data-testid="dm-notes-panel">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent-gold" />
          <h2 className="font-heading text-lg text-accent-gold">DM Notes</h2>
        </div>

        {!focusCharacterId && (
          <div className="flex rounded-lg border border-parchment/20 overflow-hidden">
            <button
              onClick={() => setViewMode('individual')}
              className={`px-3 py-1 text-xs transition-colors ${
                viewMode === 'individual'
                  ? 'bg-accent-gold/20 text-accent-gold'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 text-xs transition-colors ${
                viewMode === 'all'
                  ? 'bg-accent-gold/20 text-accent-gold'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              All Notes
            </button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {notesToShow.length === 0 && (
        <div className="text-center py-8 text-parchment/50">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No characters in this campaign yet.</p>
        </div>
      )}

      {/* Individual view with collapsible sections */}
      {viewMode === 'individual' && (
        <div className="space-y-2">
          {notesToShow.map((note) => (
            <div
              key={note.characterId}
              className="rounded-lg border-2 border-parchment/20 bg-bg-secondary overflow-hidden"
            >
              <button
                onClick={() => toggleExpanded(note.characterId)}
                className="w-full flex items-center justify-between p-3 hover:bg-parchment/5 transition-colors"
                aria-expanded={expandedCharacters.has(note.characterId)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm text-accent-gold">
                    {note.characterName}
                  </span>
                  {note.tags.length > 0 && (
                    <span className="text-xs text-parchment/40">
                      ({note.tags.length} tag{note.tags.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
                {expandedCharacters.has(note.characterId) ? (
                  <ChevronUp className="w-4 h-4 text-parchment/50" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-parchment/50" />
                )}
              </button>

              {expandedCharacters.has(note.characterId) && (
                <div className="px-3 pb-3">
                  <NoteEditor note={note} onSave={onSaveNote} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* All notes aggregate view */}
      {viewMode === 'all' && (
        <div className="space-y-4" data-testid="all-notes-view">
          {!hasAnyNotes && (
            <div className="text-center py-6 text-parchment/50">
              <p className="text-sm">
                No notes yet. Expand a character to start writing.
              </p>
            </div>
          )}
          {notesToShow
            .filter((n) => n.content.trim() || n.tags.length > 0)
            .map((note) => (
              <div
                key={note.characterId}
                className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-4 space-y-2"
              >
                <h3 className="font-heading text-sm text-accent-gold">
                  {note.characterName}
                </h3>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium border ${DM_NOTE_TAG_COLORS[tag]}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className="text-sm text-parchment/80 prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdownLite(note.content),
                  }}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
