/**
 * NPCCard (Story 36.3)
 *
 * Individual NPC card showing name, role badges, status badge,
 * and description preview. Expandable to show all editable fields.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Users,
  Scroll,
  Trash2,
  X,
} from 'lucide-react'
import {
  NPC_ROLES,
  NPC_STATUSES,
  NPC_ROLE_COLORS,
  NPC_STATUS_COLORS,
  type NPCEntry,
  type NPCRole,
} from '@/utils/dm-notes'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NPCCardProps {
  npc: NPCEntry
  /** Called when any NPC field changes (auto-save) */
  onUpdate: (npc: NPCEntry) => void
  /** Called when NPC is deleted */
  onDelete: (npcId: string) => void
  /** Whether this card starts expanded */
  defaultExpanded?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NPCCard({
  npc,
  onUpdate,
  onDelete,
  defaultExpanded = false,
}: NPCCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [localNPC, setLocalNPC] = useState<NPCEntry>(npc)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-save on change with debounce
  const debouncedUpdate = useCallback(
    (updated: NPCEntry) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => {
        onUpdate(updated)
      }, 500)
    },
    [onUpdate]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const updateField = <K extends keyof NPCEntry>(
    field: K,
    value: NPCEntry[K]
  ) => {
    const updated = { ...localNPC, [field]: value }
    setLocalNPC(updated)
    debouncedUpdate(updated)
  }

  const toggleRole = (role: NPCRole) => {
    const newRoles = localNPC.roles.includes(role)
      ? localNPC.roles.filter((r) => r !== role)
      : [...localNPC.roles, role]
    updateField('roles', newRoles)
  }

  const handleDelete = () => {
    onDelete(npc.id)
    setShowDeleteConfirm(false)
  }

  const descriptionPreview =
    localNPC.description.length > 100
      ? localNPC.description.slice(0, 100) + '...'
      : localNPC.description

  return (
    <div
      className="rounded-lg border-2 border-parchment/20 bg-bg-secondary overflow-hidden"
      data-testid={`npc-card-${npc.id}`}
    >
      {/* Card header */}
      <div
        className="p-3 cursor-pointer hover:bg-parchment/5 transition-colors"
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
        aria-label={`NPC: ${localNPC.name}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-base text-parchment">
              {localNPC.name}
            </h3>

            {/* Role and Status badges */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {localNPC.roles.map((role) => (
                <span
                  key={role}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium border ${NPC_ROLE_COLORS[role]}`}
                >
                  {role}
                </span>
              ))}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium border ${NPC_STATUS_COLORS[localNPC.status]}`}
              >
                {localNPC.status}
              </span>
            </div>

            {/* Description preview */}
            {!expanded && descriptionPreview && (
              <p className="text-sm text-parchment/60 mt-1.5 line-clamp-2">
                {descriptionPreview}
              </p>
            )}

            {/* Location */}
            {!expanded && localNPC.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-parchment/40">
                <MapPin className="w-3 h-3" />
                {localNPC.location}
              </div>
            )}
          </div>

          {expanded ? (
            <ChevronUp className="w-4 h-4 text-parchment/50 ml-2 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-parchment/50 ml-2 shrink-0" />
          )}
        </div>
      </div>

      {/* Expanded detail/edit view */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-parchment/10 pt-3 space-y-3">
          {/* Name */}
          <div>
            <label className="text-xs text-parchment/60 mb-1 block">Name</label>
            <input
              type="text"
              value={localNPC.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm focus:border-accent-gold/40 focus:outline-none"
              aria-label="NPC name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-parchment/60 mb-1 block">
              Description
            </label>
            <textarea
              value={localNPC.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Appearance, personality, voice notes..."
              className="w-full min-h-[80px] px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none resize-y"
              aria-label="NPC description"
            />
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-1 text-xs text-parchment/60 mb-1">
              <MapPin className="w-3 h-3" />
              Location
            </label>
            <input
              type="text"
              value={localNPC.location ?? ''}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Where the party met them..."
              className="w-full px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none"
              aria-label="NPC location"
            />
          </div>

          {/* Roles */}
          <div>
            <label className="flex items-center gap-1 text-xs text-parchment/60 mb-1.5">
              <Users className="w-3 h-3" />
              Roles
            </label>
            <div className="flex flex-wrap gap-1.5">
              {NPC_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`rounded-full px-2.5 py-0.5 text-xs border transition-all ${
                    localNPC.roles.includes(role)
                      ? NPC_ROLE_COLORS[role]
                      : 'border-parchment/20 text-parchment/40 hover:border-parchment/40'
                  }`}
                  aria-label={`Toggle ${role} role`}
                  aria-pressed={localNPC.roles.includes(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-parchment/60 mb-1.5 block">
              Status
            </label>
            <div className="flex flex-wrap gap-1.5">
              {NPC_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => updateField('status', status)}
                  className={`rounded-full px-2.5 py-0.5 text-xs border transition-all ${
                    localNPC.status === status
                      ? NPC_STATUS_COLORS[status]
                      : 'border-parchment/20 text-parchment/40 hover:border-parchment/40'
                  }`}
                  aria-label={`Set status to ${status}`}
                  aria-pressed={localNPC.status === status}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Relationship */}
          <div>
            <label className="flex items-center gap-1 text-xs text-parchment/60 mb-1">
              <Scroll className="w-3 h-3" />
              Relationship to Party
            </label>
            <textarea
              value={localNPC.relationship ?? ''}
              onChange={(e) => updateField('relationship', e.target.value)}
              placeholder="How does this NPC relate to the party..."
              className="w-full min-h-[60px] px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none resize-y"
              aria-label="NPC relationship"
            />
          </div>

          {/* DM Notes */}
          <div>
            <label className="text-xs text-parchment/60 mb-1 block">
              DM Notes
            </label>
            <textarea
              value={localNPC.dmNotes ?? ''}
              onChange={(e) => updateField('dmNotes', e.target.value)}
              placeholder="Private DM notes about this NPC..."
              className="w-full min-h-[60px] px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder-parchment/30 focus:border-accent-gold/40 focus:outline-none resize-y"
              aria-label="NPC DM notes"
            />
          </div>

          {/* Session first appeared */}
          {localNPC.sessionFirstAppeared && (
            <div className="text-xs text-parchment/40">
              First appeared in session: {localNPC.sessionFirstAppeared}
            </div>
          )}

          {/* Delete */}
          <div className="pt-2 border-t border-parchment/10">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 transition-colors"
                aria-label="Delete NPC"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete NPC
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400">
                  Delete {localNPC.name}?
                </span>
                <button
                  onClick={handleDelete}
                  className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  data-testid="confirm-delete-npc"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2 py-1 rounded text-xs bg-parchment/10 text-parchment/60 hover:bg-parchment/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
