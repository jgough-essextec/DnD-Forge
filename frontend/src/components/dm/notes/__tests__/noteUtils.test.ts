/**
 * Tests for dm-notes.ts utility functions
 *
 * Covers: markdown parsing, session operations, NPC filtering,
 * loot calculations, and export helpers.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  parseMarkdownLite,
  getNextSessionNumber,
  getTodayDateString,
  sortSessions,
  searchSessions,
  filterSessionsByTag,
  filterNPCsByName,
  filterNPCsByRole,
  filterNPCsByStatus,
  filterNPCsByLocation,
  createDefaultNPC,
  calculateTotalLootValue,
  aggregateCurrencyToGP,
  sortLootEntries,
  filterLootByType,
  filterLootByAssignee,
  filterLootBySession,
  createDefaultLootEntry,
  filterDMNotesForExport,
  DM_NOTE_TAGS,
  NPC_ROLES,
  NPC_STATUSES,
  LOOT_TYPES,
  type NPCEntry,
  type LootTrackerEntry,
} from '@/utils/dm-notes'
import type { SessionNote } from '@/types/campaign'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeSession(overrides: Partial<SessionNote> = {}): SessionNote {
  return {
    id: 'session-1',
    campaignId: 'camp-1',
    sessionNumber: 1,
    date: '2024-06-01',
    title: 'Into the Mines',
    content: 'The party ventured into the abandoned mines.',
    tags: ['dungeon', 'combat'],
    xpAwarded: 500,
    ...overrides,
  }
}

function makeNPC(overrides: Partial<NPCEntry> = {}): NPCEntry {
  return {
    id: 'npc-1',
    campaignId: 'camp-1',
    name: 'Lord Neverember',
    description: 'A noble lord',
    location: 'Neverwinter',
    relationship: 'Patron',
    roles: ['Patron'],
    status: 'Alive',
    ...overrides,
  }
}

function makeLoot(overrides: Partial<LootTrackerEntry> = {}): LootTrackerEntry {
  return {
    id: 'loot-1',
    name: 'Sword of Flame',
    type: 'Magic Item',
    value: 500,
    quantity: 1,
    notes: 'Found in the dragon hoard',
    campaignId: 'camp-1',
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Markdown-Lite Parser
// ---------------------------------------------------------------------------

describe('parseMarkdownLite', () => {
  it('should return empty string for empty input', () => {
    expect(parseMarkdownLite('')).toBe('')
  })

  it('should parse bold text (**text**)', () => {
    const result = parseMarkdownLite('This is **bold** text')
    expect(result).toContain('<strong>bold</strong>')
  })

  it('should parse italic text (*text*)', () => {
    const result = parseMarkdownLite('This is *italic* text')
    expect(result).toContain('<em>italic</em>')
  })

  it('should parse h1 headers (# text)', () => {
    const result = parseMarkdownLite('# Header One')
    expect(result).toContain('<h1>Header One</h1>')
  })

  it('should parse h2 headers (## text)', () => {
    const result = parseMarkdownLite('## Header Two')
    expect(result).toContain('<h2>Header Two</h2>')
  })

  it('should parse h3 headers (### text)', () => {
    const result = parseMarkdownLite('### Header Three')
    expect(result).toContain('<h3>Header Three</h3>')
  })

  it('should parse bullet lists (- item)', () => {
    const result = parseMarkdownLite('- Item one\n- Item two')
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>Item one</li>')
    expect(result).toContain('<li>Item two</li>')
    expect(result).toContain('</ul>')
  })

  it('should handle mixed formatting (bold inside header)', () => {
    const result = parseMarkdownLite('# **Bold Header**')
    expect(result).toContain('<h1><strong>Bold Header</strong></h1>')
  })

  it('should handle empty lines as line breaks', () => {
    const result = parseMarkdownLite('Line one\n\nLine two')
    expect(result).toContain('<br/>')
  })

  it('should handle regular paragraphs', () => {
    const result = parseMarkdownLite('Just a paragraph')
    expect(result).toContain('<p>Just a paragraph</p>')
  })

  it('should close list before a header', () => {
    const result = parseMarkdownLite('- Item\n# Header')
    expect(result).toContain('</ul><h1>Header</h1>')
  })
})

// ---------------------------------------------------------------------------
// Session Utilities
// ---------------------------------------------------------------------------

describe('getNextSessionNumber', () => {
  it('should return 1 for empty sessions array', () => {
    expect(getNextSessionNumber([])).toBe(1)
  })

  it('should auto-increment based on existing sessions', () => {
    const sessions = [
      makeSession({ sessionNumber: 1 }),
      makeSession({ sessionNumber: 3 }),
      makeSession({ sessionNumber: 2 }),
    ]
    expect(getNextSessionNumber(sessions)).toBe(4)
  })

  it('should handle non-contiguous session numbers', () => {
    const sessions = [
      makeSession({ sessionNumber: 1 }),
      makeSession({ sessionNumber: 5 }),
    ]
    expect(getNextSessionNumber(sessions)).toBe(6)
  })
})

describe('getTodayDateString', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should default date to today when creating a new session note', () => {
    const today = getTodayDateString()
    expect(today).toBe('2024-06-15')
  })
})

describe('sortSessions', () => {
  const sessions = [
    makeSession({ id: 's1', date: '2024-06-01', sessionNumber: 1 }),
    makeSession({ id: 's2', date: '2024-07-01', sessionNumber: 2 }),
    makeSession({ id: 's3', date: '2024-05-01', sessionNumber: 3 }),
  ]

  it('should sort sessions newest-first', () => {
    const sorted = sortSessions(sessions, 'newest')
    expect(sorted[0].id).toBe('s2')
    expect(sorted[1].id).toBe('s1')
    expect(sorted[2].id).toBe('s3')
  })

  it('should sort sessions oldest-first', () => {
    const sorted = sortSessions(sessions, 'oldest')
    expect(sorted[0].id).toBe('s3')
    expect(sorted[1].id).toBe('s1')
    expect(sorted[2].id).toBe('s2')
  })

  it('should not mutate the original array', () => {
    const original = [...sessions]
    sortSessions(sessions, 'newest')
    expect(sessions).toEqual(original)
  })
})

describe('searchSessions', () => {
  const sessions = [
    makeSession({ id: 's1', title: 'Into the Mines', content: 'Found gold' }),
    makeSession({ id: 's2', title: 'Battle at the Bridge', content: 'Lost a companion' }),
    makeSession({ id: 's3', title: 'The Kings Court', content: 'Met the king in the mines' }),
  ]

  it('should search across session titles', () => {
    const results = searchSessions(sessions, 'Bridge')
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('s2')
  })

  it('should search across session summaries', () => {
    const results = searchSessions(sessions, 'mines')
    expect(results).toHaveLength(2) // title match + content match
  })

  it('should be case-insensitive', () => {
    const results = searchSessions(sessions, 'bridge')
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('s2')
  })

  it('should return all sessions for empty query', () => {
    expect(searchSessions(sessions, '')).toHaveLength(3)
    expect(searchSessions(sessions, '  ')).toHaveLength(3)
  })
})

describe('filterSessionsByTag', () => {
  const sessions = [
    makeSession({ id: 's1', tags: ['dungeon', 'combat'] }),
    makeSession({ id: 's2', tags: ['roleplay'] }),
    makeSession({ id: 's3', tags: ['dungeon', 'boss'] }),
  ]

  it('should filter sessions by tag', () => {
    const results = filterSessionsByTag(sessions, 'dungeon')
    expect(results).toHaveLength(2)
  })

  it('should return all sessions for empty tag', () => {
    expect(filterSessionsByTag(sessions, '')).toHaveLength(3)
  })

  it('should return empty array when no sessions match', () => {
    expect(filterSessionsByTag(sessions, 'nonexistent')).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// NPC Utilities
// ---------------------------------------------------------------------------

describe('filterNPCsByName', () => {
  const npcs = [
    makeNPC({ id: 'n1', name: 'Lord Neverember' }),
    makeNPC({ id: 'n2', name: 'Bartender Bob' }),
    makeNPC({ id: 'n3', name: 'Lady Silverhand' }),
  ]

  it('should filter NPCs by name (case-insensitive)', () => {
    const results = filterNPCsByName(npcs, 'lord')
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('n1')
  })

  it('should return all NPCs for empty query', () => {
    expect(filterNPCsByName(npcs, '')).toHaveLength(3)
  })

  it('should support partial name matches', () => {
    const results = filterNPCsByName(npcs, 'er')
    expect(results).toHaveLength(3) // Neverember, Bartender, Silverhand all contain 'er'
  })
})

describe('filterNPCsByRole', () => {
  const npcs = [
    makeNPC({ id: 'n1', roles: ['Ally', 'Patron'] }),
    makeNPC({ id: 'n2', roles: ['Enemy'] }),
    makeNPC({ id: 'n3', roles: ['Merchant', 'Ally'] }),
  ]

  it('should filter NPCs by role (Ally)', () => {
    const results = filterNPCsByRole(npcs, 'Ally')
    expect(results).toHaveLength(2)
  })

  it('should filter NPCs by role (Enemy)', () => {
    const results = filterNPCsByRole(npcs, 'Enemy')
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('n2')
  })

  it('should filter NPCs by role (Patron)', () => {
    const results = filterNPCsByRole(npcs, 'Patron')
    expect(results).toHaveLength(1)
  })

  it('should filter NPCs by role (Merchant)', () => {
    const results = filterNPCsByRole(npcs, 'Merchant')
    expect(results).toHaveLength(1)
  })

  it('should filter NPCs by role (Quest Giver)', () => {
    expect(filterNPCsByRole(npcs, 'Quest Giver')).toHaveLength(0)
  })

  it('should filter NPCs by role (Neutral)', () => {
    expect(filterNPCsByRole(npcs, 'Neutral')).toHaveLength(0)
  })
})

describe('filterNPCsByStatus', () => {
  const npcs = [
    makeNPC({ id: 'n1', status: 'Alive' }),
    makeNPC({ id: 'n2', status: 'Dead' }),
    makeNPC({ id: 'n3', status: 'Unknown' }),
    makeNPC({ id: 'n4', status: 'Captured' }),
  ]

  it('should filter NPCs by status (Alive)', () => {
    expect(filterNPCsByStatus(npcs, 'Alive')).toHaveLength(1)
  })

  it('should filter NPCs by status (Dead)', () => {
    expect(filterNPCsByStatus(npcs, 'Dead')).toHaveLength(1)
  })

  it('should filter NPCs by status (Unknown)', () => {
    expect(filterNPCsByStatus(npcs, 'Unknown')).toHaveLength(1)
  })

  it('should filter NPCs by status (Captured)', () => {
    expect(filterNPCsByStatus(npcs, 'Captured')).toHaveLength(1)
  })
})

describe('filterNPCsByLocation', () => {
  const npcs = [
    makeNPC({ id: 'n1', location: 'Neverwinter' }),
    makeNPC({ id: 'n2', location: 'Waterdeep' }),
    makeNPC({ id: 'n3', location: 'Neverwinter Castle' }),
  ]

  it('should filter NPCs by location', () => {
    const results = filterNPCsByLocation(npcs, 'Neverwinter')
    expect(results).toHaveLength(2)
  })

  it('should be case-insensitive', () => {
    const results = filterNPCsByLocation(npcs, 'waterdeep')
    expect(results).toHaveLength(1)
  })

  it('should return all for empty location', () => {
    expect(filterNPCsByLocation(npcs, '')).toHaveLength(3)
  })
})

describe('createDefaultNPC', () => {
  it('should create NPC with given name and campaign ID', () => {
    const npc = createDefaultNPC('camp-1', 'Test NPC')
    expect(npc.name).toBe('Test NPC')
    expect(npc.campaignId).toBe('camp-1')
    expect(npc.id).toBeTruthy()
    expect(npc.status).toBe('Alive')
    expect(npc.roles).toEqual([])
    expect(npc.description).toBe('')
  })
})

// ---------------------------------------------------------------------------
// Loot Utilities
// ---------------------------------------------------------------------------

describe('calculateTotalLootValue', () => {
  it('should calculate total party loot value in GP from all loot entries', () => {
    const entries = [
      makeLoot({ value: 500, quantity: 1 }),
      makeLoot({ value: 100, quantity: 3 }),
      makeLoot({ value: undefined, quantity: 1 }),
    ]
    expect(calculateTotalLootValue(entries)).toBe(800)
  })

  it('should return 0 for empty entries', () => {
    expect(calculateTotalLootValue([])).toBe(0)
  })

  it('should handle entries without value', () => {
    const entries = [makeLoot({ value: undefined })]
    expect(calculateTotalLootValue(entries)).toBe(0)
  })
})

describe('aggregateCurrencyToGP', () => {
  it('should aggregate party gold/currency across all characters', () => {
    const currency = { cp: 100, sp: 50, ep: 10, gp: 25, pp: 2 }
    // 100*0.01 + 50*0.1 + 10*0.5 + 25 + 2*10 = 1 + 5 + 5 + 25 + 20 = 56
    expect(aggregateCurrencyToGP(currency)).toBe(56)
  })

  it('should return 0 for zero currency', () => {
    expect(aggregateCurrencyToGP({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 })).toBe(
      0
    )
  })

  it('should handle only GP', () => {
    expect(aggregateCurrencyToGP({ cp: 0, sp: 0, ep: 0, gp: 100, pp: 0 })).toBe(100)
  })

  it('should handle only PP', () => {
    expect(aggregateCurrencyToGP({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 5 })).toBe(50)
  })
})

describe('sortLootEntries', () => {
  const entries = [
    makeLoot({ id: 'l1', name: 'Sword', value: 100, quantity: 1, type: 'Magic Item' }),
    makeLoot({ id: 'l2', name: 'Shield', value: 50, quantity: 2, type: 'Mundane Item' }),
    makeLoot({ id: 'l3', name: 'Potion', value: 25, quantity: 1, type: 'Quest Reward' }),
  ]

  it('should sort loot entries by item name ascending', () => {
    const sorted = sortLootEntries(entries, 'name', 'asc')
    expect(sorted[0].name).toBe('Potion')
    expect(sorted[1].name).toBe('Shield')
    expect(sorted[2].name).toBe('Sword')
  })

  it('should sort loot entries by item name descending', () => {
    const sorted = sortLootEntries(entries, 'name', 'desc')
    expect(sorted[0].name).toBe('Sword')
    expect(sorted[2].name).toBe('Potion')
  })

  it('should sort loot entries by type', () => {
    const sorted = sortLootEntries(entries, 'type', 'asc')
    expect(sorted[0].type).toBe('Magic Item')
    expect(sorted[1].type).toBe('Mundane Item')
    expect(sorted[2].type).toBe('Quest Reward')
  })

  it('should sort loot entries by value (total = value * quantity)', () => {
    const sorted = sortLootEntries(entries, 'value', 'asc')
    // Potion=25, Sword=100, Shield=100
    expect(sorted[0].name).toBe('Potion') // 25*1=25
    // Sword and Shield both = 100, stable sort preserves original order
    expect(sorted[1].name).toBe('Sword') // 100*1=100
    expect(sorted[2].name).toBe('Shield') // 50*2=100
  })

  it('should sort by assignedTo', () => {
    const withAssignees = [
      makeLoot({ id: 'l1', assignedTo: 'Zara' }),
      makeLoot({ id: 'l2', assignedTo: 'Alice' }),
      makeLoot({ id: 'l3', assignedTo: undefined }),
    ]
    const sorted = sortLootEntries(withAssignees, 'assignedTo', 'asc')
    expect(sorted[0].assignedTo).toBe('Alice')
    expect(sorted[1].assignedTo).toBe('Zara')
    expect(sorted[2].assignedTo).toBeUndefined()
  })

  it('should sort by session number', () => {
    const withSessions = [
      makeLoot({ id: 'l1', sessionNumber: 3 }),
      makeLoot({ id: 'l2', sessionNumber: 1 }),
      makeLoot({ id: 'l3', sessionNumber: undefined }),
    ]
    const sorted = sortLootEntries(withSessions, 'sessionNumber', 'asc')
    expect(sorted[0].sessionNumber).toBeUndefined()
    expect(sorted[1].sessionNumber).toBe(1)
    expect(sorted[2].sessionNumber).toBe(3)
  })

  it('should not mutate the original array', () => {
    const original = [...entries]
    sortLootEntries(entries, 'name', 'asc')
    expect(entries).toEqual(original)
  })
})

describe('filterLootByType', () => {
  const entries = [
    makeLoot({ id: 'l1', type: 'Magic Item' }),
    makeLoot({ id: 'l2', type: 'Gold/Currency' }),
    makeLoot({ id: 'l3', type: 'Magic Item' }),
    makeLoot({ id: 'l4', type: 'Mundane Item' }),
  ]

  it('should filter loot entries by type', () => {
    expect(filterLootByType(entries, 'Magic Item')).toHaveLength(2)
    expect(filterLootByType(entries, 'Gold/Currency')).toHaveLength(1)
    expect(filterLootByType(entries, 'Mundane Item')).toHaveLength(1)
    expect(filterLootByType(entries, 'Quest Reward')).toHaveLength(0)
  })
})

describe('filterLootByAssignee', () => {
  const entries = [
    makeLoot({ id: 'l1', assignedTo: 'char-1' }),
    makeLoot({ id: 'l2', assignedTo: undefined }),
    makeLoot({ id: 'l3', assignedTo: 'Party Loot' }),
    makeLoot({ id: 'l4', assignedTo: 'char-2' }),
  ]

  it('should filter loot entries by assigned character', () => {
    expect(filterLootByAssignee(entries, 'char-1')).toHaveLength(1)
    expect(filterLootByAssignee(entries, 'char-2')).toHaveLength(1)
  })

  it('should filter by "Unassigned" showing party loot and unassigned', () => {
    const unassigned = filterLootByAssignee(entries, 'unassigned')
    expect(unassigned).toHaveLength(2) // undefined + "Party Loot"
  })
})

describe('filterLootBySession', () => {
  const entries = [
    makeLoot({ id: 'l1', sessionId: 'ses-1' }),
    makeLoot({ id: 'l2', sessionId: 'ses-2' }),
    makeLoot({ id: 'l3', sessionId: 'ses-1' }),
    makeLoot({ id: 'l4', sessionId: undefined }),
  ]

  it('should filter loot entries by session', () => {
    expect(filterLootBySession(entries, 'ses-1')).toHaveLength(2)
    expect(filterLootBySession(entries, 'ses-2')).toHaveLength(1)
  })
})

describe('createDefaultLootEntry', () => {
  it('should create a default loot entry with campaign ID', () => {
    const entry = createDefaultLootEntry('camp-1')
    expect(entry.campaignId).toBe('camp-1')
    expect(entry.id).toBeTruthy()
    expect(entry.type).toBe('Mundane Item')
    expect(entry.quantity).toBe(1)
    expect(entry.name).toBe('')
    expect(entry.notes).toBe('')
  })
})

// ---------------------------------------------------------------------------
// DM Notes Export
// ---------------------------------------------------------------------------

describe('filterDMNotesForExport', () => {
  it('should exclude dmNotes field from JSON export when export toggle is off', () => {
    const character = { name: 'Test', dmNotes: 'secret stuff' }
    const result = filterDMNotesForExport(character, false)
    expect(result.dmNotes).toBeUndefined()
    expect(result.name).toBe('Test')
  })

  it('should include dmNotes field in JSON export when export toggle is explicitly on', () => {
    const character = { name: 'Test', dmNotes: 'secret stuff' }
    const result = filterDMNotesForExport(character, true)
    expect(result.dmNotes).toBe('secret stuff')
    expect(result.name).toBe('Test')
  })

  it('should handle character without dmNotes field', () => {
    const character = { dmNotes: undefined as string | undefined }
    const result = filterDMNotesForExport(character, false)
    expect(result.dmNotes).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('Constants', () => {
  it('should have 5 DM note tags', () => {
    expect(DM_NOTE_TAGS).toHaveLength(5)
    expect(DM_NOTE_TAGS).toContain('Secret')
    expect(DM_NOTE_TAGS).toContain('Plot Hook')
    expect(DM_NOTE_TAGS).toContain('Relationship')
    expect(DM_NOTE_TAGS).toContain('Motivation')
    expect(DM_NOTE_TAGS).toContain('Weakness')
  })

  it('should have 6 NPC roles', () => {
    expect(NPC_ROLES).toHaveLength(6)
    expect(NPC_ROLES).toContain('Ally')
    expect(NPC_ROLES).toContain('Enemy')
    expect(NPC_ROLES).toContain('Neutral')
    expect(NPC_ROLES).toContain('Patron')
    expect(NPC_ROLES).toContain('Merchant')
    expect(NPC_ROLES).toContain('Quest Giver')
  })

  it('should have 4 NPC statuses', () => {
    expect(NPC_STATUSES).toHaveLength(4)
    expect(NPC_STATUSES).toContain('Alive')
    expect(NPC_STATUSES).toContain('Dead')
    expect(NPC_STATUSES).toContain('Unknown')
    expect(NPC_STATUSES).toContain('Captured')
  })

  it('should have 5 loot types', () => {
    expect(LOOT_TYPES).toHaveLength(5)
    expect(LOOT_TYPES).toContain('Gold/Currency')
    expect(LOOT_TYPES).toContain('Magic Item')
    expect(LOOT_TYPES).toContain('Mundane Item')
    expect(LOOT_TYPES).toContain('Quest Reward')
    expect(LOOT_TYPES).toContain('Other')
  })
})
