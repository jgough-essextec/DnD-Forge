/**
 * DM Notes Utility Functions (Epic 36)
 *
 * Pure functions for DM notes management including markdown parsing,
 * session log operations, NPC filtering, and loot calculations.
 */

import type { SessionNote, NPC } from '@/types/campaign'

// ---------------------------------------------------------------------------
// DM Note Tag Types
// ---------------------------------------------------------------------------

/** Predefined quick-note tags for per-character DM notes */
export const DM_NOTE_TAGS = [
  'Secret',
  'Plot Hook',
  'Relationship',
  'Motivation',
  'Weakness',
] as const

export type DMNoteTag = (typeof DM_NOTE_TAGS)[number]

/** Color mapping for DM note tags */
export const DM_NOTE_TAG_COLORS: Record<DMNoteTag, string> = {
  Secret: 'bg-red-500/20 text-red-400 border-red-500/30',
  'Plot Hook': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Relationship: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Motivation: 'bg-green-500/20 text-green-400 border-green-500/30',
  Weakness: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

// ---------------------------------------------------------------------------
// NPC Extended Types
// ---------------------------------------------------------------------------

export const NPC_ROLES = [
  'Ally',
  'Enemy',
  'Neutral',
  'Patron',
  'Merchant',
  'Quest Giver',
] as const

export type NPCRole = (typeof NPC_ROLES)[number]

export const NPC_STATUSES = ['Alive', 'Dead', 'Unknown', 'Captured'] as const

export type NPCStatus = (typeof NPC_STATUSES)[number]

/** NPC role color mapping */
export const NPC_ROLE_COLORS: Record<NPCRole, string> = {
  Ally: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Enemy: 'bg-red-500/20 text-red-400 border-red-500/30',
  Neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  Patron: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Merchant: 'bg-green-500/20 text-green-400 border-green-500/30',
  'Quest Giver': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

/** NPC status color mapping */
export const NPC_STATUS_COLORS: Record<NPCStatus, string> = {
  Alive: 'bg-green-500/20 text-green-400 border-green-500/30',
  Dead: 'bg-red-500/20 text-red-400 border-red-500/30',
  Unknown: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  Captured: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

/** Extended NPC type with role, status, and session tracking */
export interface NPCEntry extends Omit<NPC, 'stats'> {
  roles: NPCRole[]
  status: NPCStatus
  sessionFirstAppeared?: string
}

// ---------------------------------------------------------------------------
// Loot Extended Types
// ---------------------------------------------------------------------------

export const LOOT_TYPES = [
  'Gold/Currency',
  'Magic Item',
  'Mundane Item',
  'Quest Reward',
  'Other',
] as const

export type LootType = (typeof LOOT_TYPES)[number]

/** Loot type color/icon mapping */
export const LOOT_TYPE_COLORS: Record<LootType, string> = {
  'Gold/Currency': 'bg-yellow-500/20 text-yellow-400',
  'Magic Item': 'bg-purple-500/20 text-purple-400',
  'Mundane Item': 'bg-gray-500/20 text-gray-400',
  'Quest Reward': 'bg-green-500/20 text-green-400',
  Other: 'bg-blue-500/20 text-blue-400',
}

/** Extended loot entry for the DM loot tracker */
export interface LootTrackerEntry {
  id: string
  name: string
  type: LootType
  value?: number
  quantity: number
  assignedTo?: string
  sessionId?: string
  sessionNumber?: number
  notes: string
  campaignId: string
}

/** Currency breakdown */
export interface CurrencyBreakdown {
  cp: number
  sp: number
  ep: number
  gp: number
  pp: number
}

/** Per-character DM notes data */
export interface CharacterDMNote {
  characterId: string
  characterName: string
  content: string
  tags: DMNoteTag[]
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Markdown-Lite Parser
// ---------------------------------------------------------------------------

/**
 * Parses markdown-lite formatting to HTML for preview.
 * Supports: bold (**text**), italic (*text*), headers (# ## ###),
 * and bullet lists (- item).
 */
export function parseMarkdownLite(text: string): string {
  if (!text) return ''

  const lines = text.split('\n')
  const result: string[] = []
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Headers
    if (trimmed.startsWith('### ')) {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      const content = formatInline(trimmed.slice(4))
      result.push(`<h3>${content}</h3>`)
      continue
    }
    if (trimmed.startsWith('## ')) {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      const content = formatInline(trimmed.slice(3))
      result.push(`<h2>${content}</h2>`)
      continue
    }
    if (trimmed.startsWith('# ')) {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      const content = formatInline(trimmed.slice(2))
      result.push(`<h1>${content}</h1>`)
      continue
    }

    // Bullet lists
    if (trimmed.startsWith('- ')) {
      if (!inList) {
        result.push('<ul>')
        inList = true
      }
      const content = formatInline(trimmed.slice(2))
      result.push(`<li>${content}</li>`)
      continue
    }

    // Close list if we're no longer in list items
    if (inList) {
      result.push('</ul>')
      inList = false
    }

    // Empty lines
    if (trimmed === '') {
      result.push('<br/>')
      continue
    }

    // Regular paragraph
    result.push(`<p>${formatInline(trimmed)}</p>`)
  }

  if (inList) {
    result.push('</ul>')
  }

  return result.join('')
}

/** Format inline markdown: bold and italic */
function formatInline(text: string): string {
  // Bold: **text**
  let result = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // Italic: *text*
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  return result
}

// ---------------------------------------------------------------------------
// Session Log Utilities
// ---------------------------------------------------------------------------

/**
 * Gets the next session number based on existing sessions.
 */
export function getNextSessionNumber(sessions: SessionNote[]): number {
  if (sessions.length === 0) return 1
  const maxNum = Math.max(...sessions.map((s) => s.sessionNumber))
  return maxNum + 1
}

/**
 * Gets today's date as an ISO date string (YYYY-MM-DD).
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Sorts sessions by date, newest first or oldest first.
 */
export function sortSessions(
  sessions: SessionNote[],
  order: 'newest' | 'oldest'
): SessionNote[] {
  const sorted = [...sessions].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
  return order === 'newest' ? sorted : sorted.reverse()
}

/**
 * Searches sessions by title and content.
 */
export function searchSessions(
  sessions: SessionNote[],
  query: string
): SessionNote[] {
  if (!query.trim()) return sessions
  const lower = query.toLowerCase()
  return sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(lower) ||
      s.content.toLowerCase().includes(lower)
  )
}

/**
 * Filters sessions by tag.
 */
export function filterSessionsByTag(
  sessions: SessionNote[],
  tag: string
): SessionNote[] {
  if (!tag) return sessions
  return sessions.filter((s) => s.tags.includes(tag))
}

/**
 * Formats a session date for display.
 */
export function formatSessionDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// NPC Utilities
// ---------------------------------------------------------------------------

/**
 * Filters NPCs by name (case-insensitive).
 */
export function filterNPCsByName(npcs: NPCEntry[], query: string): NPCEntry[] {
  if (!query.trim()) return npcs
  const lower = query.toLowerCase()
  return npcs.filter((npc) => npc.name.toLowerCase().includes(lower))
}

/**
 * Filters NPCs by role.
 */
export function filterNPCsByRole(npcs: NPCEntry[], role: NPCRole): NPCEntry[] {
  return npcs.filter((npc) => npc.roles.includes(role))
}

/**
 * Filters NPCs by status.
 */
export function filterNPCsByStatus(
  npcs: NPCEntry[],
  status: NPCStatus
): NPCEntry[] {
  return npcs.filter((npc) => npc.status === status)
}

/**
 * Filters NPCs by location.
 */
export function filterNPCsByLocation(
  npcs: NPCEntry[],
  location: string
): NPCEntry[] {
  if (!location.trim()) return npcs
  const lower = location.toLowerCase()
  return npcs.filter((npc) => npc.location?.toLowerCase().includes(lower))
}

/**
 * Creates a new NPCEntry with defaults.
 */
export function createDefaultNPC(
  campaignId: string,
  name: string
): NPCEntry {
  return {
    id: crypto.randomUUID(),
    campaignId,
    name,
    description: '',
    location: '',
    relationship: '',
    roles: [],
    status: 'Alive',
    dmNotes: '',
  }
}

// ---------------------------------------------------------------------------
// Loot Utilities
// ---------------------------------------------------------------------------

/**
 * Calculates total party loot value in GP from all loot entries.
 */
export function calculateTotalLootValue(entries: LootTrackerEntry[]): number {
  return entries.reduce((total, entry) => {
    const value = entry.value ?? 0
    return total + value * entry.quantity
  }, 0)
}

/**
 * Aggregates party gold/currency from a breakdown.
 * Converts everything to GP equivalent.
 * 1 PP = 10 GP, 1 GP = 1 GP, 1 EP = 0.5 GP, 1 SP = 0.1 GP, 1 CP = 0.01 GP
 */
export function aggregateCurrencyToGP(currency: CurrencyBreakdown): number {
  return (
    currency.pp * 10 +
    currency.gp +
    currency.ep * 0.5 +
    currency.sp * 0.1 +
    currency.cp * 0.01
  )
}

/**
 * Sorts loot entries by a given field.
 */
export function sortLootEntries(
  entries: LootTrackerEntry[],
  sortBy: 'name' | 'type' | 'value' | 'assignedTo' | 'sessionNumber',
  direction: 'asc' | 'desc' = 'asc'
): LootTrackerEntry[] {
  const sorted = [...entries].sort((a, b) => {
    let valA: string | number
    let valB: string | number

    switch (sortBy) {
      case 'name':
        valA = a.name.toLowerCase()
        valB = b.name.toLowerCase()
        break
      case 'type':
        valA = a.type
        valB = b.type
        break
      case 'value':
        valA = (a.value ?? 0) * a.quantity
        valB = (b.value ?? 0) * b.quantity
        break
      case 'assignedTo':
        valA = (a.assignedTo ?? 'zzz').toLowerCase()
        valB = (b.assignedTo ?? 'zzz').toLowerCase()
        break
      case 'sessionNumber':
        valA = a.sessionNumber ?? 0
        valB = b.sessionNumber ?? 0
        break
    }

    if (valA < valB) return -1
    if (valA > valB) return 1
    return 0
  })

  return direction === 'desc' ? sorted.reverse() : sorted
}

/**
 * Filters loot entries by type.
 */
export function filterLootByType(
  entries: LootTrackerEntry[],
  type: LootType
): LootTrackerEntry[] {
  return entries.filter((e) => e.type === type)
}

/**
 * Filters loot entries by assigned character.
 */
export function filterLootByAssignee(
  entries: LootTrackerEntry[],
  characterId: string
): LootTrackerEntry[] {
  if (characterId === 'unassigned') {
    return entries.filter((e) => !e.assignedTo || e.assignedTo === 'Party Loot')
  }
  return entries.filter((e) => e.assignedTo === characterId)
}

/**
 * Filters loot entries by session.
 */
export function filterLootBySession(
  entries: LootTrackerEntry[],
  sessionId: string
): LootTrackerEntry[] {
  return entries.filter((e) => e.sessionId === sessionId)
}

/**
 * Creates a new default loot entry.
 */
export function createDefaultLootEntry(
  campaignId: string
): LootTrackerEntry {
  return {
    id: crypto.randomUUID(),
    name: '',
    type: 'Mundane Item',
    quantity: 1,
    notes: '',
    campaignId,
  }
}

// ---------------------------------------------------------------------------
// DM Notes JSON Export Helpers
// ---------------------------------------------------------------------------

/**
 * Excludes dmNotes from a character export unless the toggle is on.
 */
export function filterDMNotesForExport<
  T extends { dmNotes?: string },
>(character: T, includeDMNotes: boolean): T {
  if (includeDMNotes) return character
  const copy = { ...character }
  delete copy.dmNotes
  return copy
}
