/**
 * LootEntryForm (Story 36.4)
 *
 * Quick-add form for creating new loot entries.
 * Supports type selection, character assignment, and session linking.
 */

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import {
  LOOT_TYPES,
  LOOT_TYPE_COLORS,
  type LootTrackerEntry,
  type LootType,
  createDefaultLootEntry,
} from '@/utils/dm-notes'
import type { SessionNote } from '@/types/campaign'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LootEntryFormProps {
  campaignId: string
  /** Characters to assign loot to */
  characters: Array<{ id: string; name: string }>
  /** Sessions to link loot to */
  sessions: SessionNote[]
  onSave: (entry: LootTrackerEntry) => void
  onCancel: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LootEntryForm({
  campaignId,
  characters,
  sessions,
  onSave,
  onCancel,
}: LootEntryFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<LootType>('Mundane Item')
  const [value, setValue] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [assignedTo, setAssignedTo] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const selectedSession = sessions.find((s) => s.id === sessionId)

    const entry: LootTrackerEntry = {
      ...createDefaultLootEntry(campaignId),
      name: name.trim(),
      type,
      value: value ? parseFloat(value) : undefined,
      quantity: parseInt(quantity, 10) || 1,
      assignedTo: assignedTo || undefined,
      sessionId: sessionId || undefined,
      sessionNumber: selectedSession?.sessionNumber,
      notes: notes.trim(),
    }

    onSave(entry)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border-2 border-accent-gold/30 bg-bg-secondary p-4 space-y-3"
      data-testid="loot-entry-form"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-accent-gold">Add Loot</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded hover:bg-parchment/10 transition-colors"
          aria-label="Cancel"
        >
          <X className="w-5 h-5 text-parchment/50" />
        </button>
      </div>

      {/* Item name */}
      <div>
        <label className="text-xs text-parchment/60 mb-1 block">
          Item Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sword of Flame, 50 Gold Pieces..."
          className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
          required
          autoFocus
          aria-label="Item name"
        />
      </div>

      {/* Type selection */}
      <div>
        <label className="text-xs text-parchment/60 mb-1.5 block">Type</label>
        <div className="flex flex-wrap gap-1.5">
          {LOOT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full px-2.5 py-0.5 text-xs border transition-all ${
                type === t
                  ? `${LOOT_TYPE_COLORS[t]} border-current`
                  : 'border-parchment/20 text-parchment/40 hover:border-parchment/40'
              }`}
              aria-label={`Set type to ${t}`}
              aria-pressed={type === t}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Value and Quantity */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-parchment/60 mb-1 block">
            Value (GP)
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
            aria-label="Item value in GP"
          />
        </div>
        <div>
          <label className="text-xs text-parchment/60 mb-1 block">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
            aria-label="Quantity"
          />
        </div>
      </div>

      {/* Assign to character */}
      <div>
        <label className="text-xs text-parchment/60 mb-1 block">
          Assign to Character
        </label>
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm focus:border-accent-gold/40 focus:outline-none"
          aria-label="Assign to character"
        >
          <option value="">Party Loot (unassigned)</option>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Session link */}
      <div>
        <label className="text-xs text-parchment/60 mb-1 block">
          Session Awarded
        </label>
        <select
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm focus:border-accent-gold/40 focus:outline-none"
          aria-label="Session awarded"
        >
          <option value="">No session linked</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              Session {s.sessionNumber}: {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs text-parchment/60 mb-1 block">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes about this item..."
          className="w-full min-h-[60px] px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none resize-y"
          aria-label="Item notes"
        />
      </div>

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
          disabled={!name.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-accent-gold/20 text-accent-gold hover:bg-accent-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Loot
        </button>
      </div>
    </form>
  )
}
