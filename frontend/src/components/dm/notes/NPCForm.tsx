/**
 * NPCForm (Story 36.3)
 *
 * Compact form for creating a new NPC.
 * Only name is required; all other fields are optional.
 */

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import {
  NPC_ROLES,
  NPC_STATUSES,
  NPC_ROLE_COLORS,
  NPC_STATUS_COLORS,
  type NPCEntry,
  type NPCRole,
  type NPCStatus,
  createDefaultNPC,
} from '@/utils/dm-notes'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NPCFormProps {
  campaignId: string
  onSave: (npc: NPCEntry) => void
  onCancel: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NPCForm({ campaignId, onSave, onCancel }: NPCFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [roles, setRoles] = useState<NPCRole[]>([])
  const [status, setStatus] = useState<NPCStatus>('Alive')
  const [relationship, setRelationship] = useState('')

  const toggleRole = (role: NPCRole) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const npc: NPCEntry = {
      ...createDefaultNPC(campaignId, name.trim()),
      description,
      location: location || undefined,
      roles,
      status,
      relationship: relationship || undefined,
    }

    onSave(npc)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border-2 border-accent-gold/30 bg-bg-secondary p-4 space-y-3"
      data-testid="npc-form"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg text-accent-gold">Add NPC</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded hover:bg-parchment/10 transition-colors"
          aria-label="Cancel"
        >
          <X className="w-5 h-5 text-parchment/50" />
        </button>
      </div>

      {/* Name - required */}
      <div>
        <label className="text-xs text-parchment/60 mb-1 block">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="NPC name..."
          className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
          required
          autoFocus
          aria-label="NPC name"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-parchment/60 mb-1 block">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Appearance, personality, voice notes... (optional)"
          className="w-full min-h-[60px] px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none resize-y"
          aria-label="NPC description"
        />
      </div>

      {/* Location */}
      <div>
        <label className="text-xs text-parchment/60 mb-1 block">
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Where the party met them... (optional)"
          className="w-full px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
          aria-label="NPC location"
        />
      </div>

      {/* Roles */}
      <div>
        <label className="text-xs text-parchment/60 mb-1.5 block">Roles</label>
        <div className="flex flex-wrap gap-1.5">
          {NPC_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(role)}
              className={`rounded-full px-2.5 py-0.5 text-xs border transition-all ${
                roles.includes(role)
                  ? NPC_ROLE_COLORS[role]
                  : 'border-parchment/20 text-parchment/40 hover:border-parchment/40'
              }`}
              aria-label={`Toggle ${role} role`}
              aria-pressed={roles.includes(role)}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="text-xs text-parchment/60 mb-1.5 block">Status</label>
        <div className="flex flex-wrap gap-1.5">
          {NPC_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full px-2.5 py-0.5 text-xs border transition-all ${
                status === s
                  ? NPC_STATUS_COLORS[s]
                  : 'border-parchment/20 text-parchment/40 hover:border-parchment/40'
              }`}
              aria-label={`Set status to ${s}`}
              aria-pressed={status === s}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Relationship */}
      <div>
        <label className="text-xs text-parchment/60 mb-1 block">
          Relationship to Party
        </label>
        <input
          type="text"
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          placeholder="How does this NPC relate to the party... (optional)"
          className="w-full px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
          aria-label="NPC relationship"
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
          Add NPC
        </button>
      </div>
    </form>
  )
}
