/**
 * Campaign Export & Import Utilities (Story 38.4)
 *
 * Functions for exporting campaigns to JSON, importing campaign JSON,
 * validating import data, and detecting duplicate characters for merge.
 */

import type { Campaign, SessionNote, NPC } from '@/types/campaign'
import type { Character } from '@/types/character'

// ---------------------------------------------------------------------------
// Export Types
// ---------------------------------------------------------------------------

/** Options for full campaign export */
export interface CampaignExportOptions {
  /** Include session notes (default: true) */
  includeSessions?: boolean
  /** Include NPC data (default: true) */
  includeNPCs?: boolean
  /** Include DM notes on characters (default: true) */
  includeDMNotes?: boolean
}

/** The exported campaign JSON structure */
export interface CampaignExportData {
  formatVersion: string
  exportType: 'full' | 'player-safe'
  exportedAt: string
  campaign: {
    id: string
    name: string
    description: string
    joinCode: string
    settings: Campaign['settings']
    isArchived: boolean
    createdAt: string
    updatedAt: string
  }
  characters: CampaignExportCharacter[]
  sessions: SessionNote[]
  npcs: NPC[]
}

/** Character data as included in a campaign export */
export interface CampaignExportCharacter {
  id: string
  name: string
  race: Character['race']
  classes: Character['classes']
  level: number
  background: Character['background']
  abilityScores: Character['abilityScores']
  hpMax: number
  hpCurrent: number
  inventory: Character['inventory']
  spellcasting: Character['spellcasting']
  dmNotes?: string
}

// ---------------------------------------------------------------------------
// Import Types
// ---------------------------------------------------------------------------

export type MergeStrategy = 'merge' | 'new-copy'

/** Result of a single validation stage */
export interface ValidationStageResult {
  stage: string
  passed: boolean
  errors: string[]
}

/** Overall import validation result */
export interface ImportValidationResult {
  valid: boolean
  stages: ValidationStageResult[]
}

/** A detected duplicate character during import */
export interface DuplicateCharacterMatch {
  importedName: string
  importedRace: string
  importedClass: string
  existingId: string
  existingName: string
}

/** Result of a campaign import operation */
export interface CampaignImportResult {
  campaign: Partial<Campaign>
  characters: CampaignExportCharacter[]
  newCampaignId: string
  characterIdMap: Record<string, string>
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FORMAT_VERSION = '1.0.0'

// ---------------------------------------------------------------------------
// Export Functions
// ---------------------------------------------------------------------------

/**
 * Export a full campaign with all data (DM backup).
 */
export function exportCampaign(
  campaign: Campaign,
  characters: Character[],
  options: CampaignExportOptions = {}
): CampaignExportData {
  const {
    includeSessions = true,
    includeNPCs = true,
    includeDMNotes = true,
  } = options

  const exportCharacters: CampaignExportCharacter[] = characters.map((c) => {
    const exportChar: CampaignExportCharacter = {
      id: c.id,
      name: c.name,
      race: c.race,
      classes: c.classes,
      level: c.level,
      background: c.background,
      abilityScores: c.abilityScores,
      hpMax: c.hpMax,
      hpCurrent: c.hpCurrent,
      inventory: c.inventory,
      spellcasting: c.spellcasting,
    }
    if (includeDMNotes && c.dmNotes) {
      exportChar.dmNotes = c.dmNotes
    }
    return exportChar
  })

  return {
    formatVersion: FORMAT_VERSION,
    exportType: 'full',
    exportedAt: new Date().toISOString(),
    campaign: {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      joinCode: campaign.joinCode,
      settings: campaign.settings,
      isArchived: campaign.isArchived,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    },
    characters: exportCharacters,
    sessions: includeSessions ? campaign.sessions : [],
    npcs: includeNPCs ? campaign.npcs : [],
  }
}

/**
 * Export a player-safe version of a campaign.
 * Excludes DM notes, NPC data, and DM-only session notes.
 */
export function exportCampaignPlayerSafe(
  campaign: Campaign,
  characters: Character[]
): CampaignExportData {
  const exportCharacters: CampaignExportCharacter[] = characters.map((c) => ({
    id: c.id,
    name: c.name,
    race: c.race,
    classes: c.classes,
    level: c.level,
    background: c.background,
    abilityScores: c.abilityScores,
    hpMax: c.hpMax,
    hpCurrent: c.hpCurrent,
    inventory: c.inventory,
    spellcasting: c.spellcasting,
    // No dmNotes in player-safe export
  }))

  // Filter out DM-only sessions (those tagged with "DM Only" in their tags)
  const playerSafeSessions = campaign.sessions.filter(
    (s) => !s.tags.includes('DM Only')
  )

  return {
    formatVersion: FORMAT_VERSION,
    exportType: 'player-safe',
    exportedAt: new Date().toISOString(),
    campaign: {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      joinCode: campaign.joinCode,
      settings: campaign.settings,
      isArchived: campaign.isArchived,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    },
    characters: exportCharacters,
    sessions: playerSafeSessions,
    npcs: [], // No NPCs in player-safe export
  }
}

/**
 * Generate a sanitized export filename.
 * Format: [CampaignName]_Campaign_Export_[YYYY-MM-DD].json
 */
export function generateExportFilename(campaignName: string): string {
  const sanitized = campaignName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 50)
  const date = new Date().toISOString().split('T')[0]
  return `${sanitized}_Campaign_Export_${date}.json`
}

// ---------------------------------------------------------------------------
// Validation Functions
// ---------------------------------------------------------------------------

/**
 * Validate campaign import JSON through 5 stages.
 *
 * 1. Syntax validation (valid JSON)
 * 2. Schema validation (required fields present)
 * 3. Type validation (field types correct)
 * 4. Reference validation (character IDs, session links)
 * 5. Business rules (campaign integrity)
 */
export function validateCampaignImport(json: string): ImportValidationResult {
  const stages: ValidationStageResult[] = []

  // Stage 1: Syntax validation
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
    stages.push({ stage: 'Syntax', passed: true, errors: [] })
  } catch {
    stages.push({
      stage: 'Syntax',
      passed: false,
      errors: ['Invalid JSON syntax. The file could not be parsed.'],
    })
    return { valid: false, stages }
  }

  // Stage 2: Schema validation (required fields)
  const schemaErrors: string[] = []
  const data = parsed as Record<string, unknown>

  if (!data.formatVersion) schemaErrors.push('Missing "formatVersion" field.')
  if (!data.exportType) schemaErrors.push('Missing "exportType" field.')
  if (!data.campaign) schemaErrors.push('Missing "campaign" field.')
  if (!data.characters) schemaErrors.push('Missing "characters" field.')

  if (data.campaign && typeof data.campaign === 'object') {
    const camp = data.campaign as Record<string, unknown>
    if (!camp.name) schemaErrors.push('Missing "campaign.name" field.')
    if (!camp.settings) schemaErrors.push('Missing "campaign.settings" field.')
  }

  stages.push({
    stage: 'Schema',
    passed: schemaErrors.length === 0,
    errors: schemaErrors,
  })

  if (schemaErrors.length > 0) {
    return { valid: false, stages }
  }

  // Stage 3: Type validation
  const typeErrors: string[] = []

  if (typeof data.formatVersion !== 'string') {
    typeErrors.push('"formatVersion" must be a string.')
  }
  if (data.exportType !== 'full' && data.exportType !== 'player-safe') {
    typeErrors.push('"exportType" must be "full" or "player-safe".')
  }
  if (!Array.isArray(data.characters)) {
    typeErrors.push('"characters" must be an array.')
  }
  if (data.sessions !== undefined && !Array.isArray(data.sessions)) {
    typeErrors.push('"sessions" must be an array if present.')
  }
  if (data.npcs !== undefined && !Array.isArray(data.npcs)) {
    typeErrors.push('"npcs" must be an array if present.')
  }

  const camp = data.campaign as Record<string, unknown>
  if (typeof camp.name !== 'string') {
    typeErrors.push('"campaign.name" must be a string.')
  }

  stages.push({
    stage: 'Types',
    passed: typeErrors.length === 0,
    errors: typeErrors,
  })

  if (typeErrors.length > 0) {
    return { valid: false, stages }
  }

  // Stage 4: Reference validation
  const refErrors: string[] = []
  const characters = data.characters as Array<Record<string, unknown>>

  for (const char of characters) {
    if (!char.id || typeof char.id !== 'string') {
      refErrors.push(`Character "${String(char.name ?? 'unknown')}" is missing a valid ID.`)
    }
    if (!char.name || typeof char.name !== 'string') {
      refErrors.push('A character entry is missing a valid name.')
    }
  }

  const sessions = (data.sessions ?? []) as Array<Record<string, unknown>>
  for (const session of sessions) {
    if (!session.id || typeof session.id !== 'string') {
      refErrors.push(`Session "${String(session.title ?? 'unknown')}" is missing a valid ID.`)
    }
  }

  stages.push({
    stage: 'References',
    passed: refErrors.length === 0,
    errors: refErrors,
  })

  if (refErrors.length > 0) {
    return { valid: false, stages }
  }

  // Stage 5: Business rules
  const bizErrors: string[] = []

  if (typeof camp.name === 'string' && camp.name.trim().length === 0) {
    bizErrors.push('Campaign name cannot be empty.')
  }

  if (characters.length === 0) {
    // Not an error, just a note - campaigns can exist with no characters
  }

  // Verify no duplicate character IDs in the export
  const charIds = characters.map((c) => c.id)
  const uniqueIds = new Set(charIds)
  if (uniqueIds.size !== charIds.length) {
    bizErrors.push('Duplicate character IDs found in the export data.')
  }

  stages.push({
    stage: 'Business Rules',
    passed: bizErrors.length === 0,
    errors: bizErrors,
  })

  return {
    valid: bizErrors.length === 0,
    stages,
  }
}

// ---------------------------------------------------------------------------
// Duplicate Detection
// ---------------------------------------------------------------------------

/**
 * Detect duplicate characters between imported data and existing characters.
 * Matches by name + race (raceId) + primary class (classId).
 */
export function detectDuplicateCharacters(
  imported: CampaignExportCharacter[],
  existing: Character[]
): DuplicateCharacterMatch[] {
  const matches: DuplicateCharacterMatch[] = []

  for (const imp of imported) {
    const impRace = typeof imp.race === 'object' && imp.race !== null
      ? (imp.race as { raceId?: string }).raceId ?? ''
      : String(imp.race ?? '')

    const impClass = Array.isArray(imp.classes) && imp.classes.length > 0
      ? (imp.classes[0] as { classId?: string }).classId ?? ''
      : ''

    for (const ex of existing) {
      const exRace = typeof ex.race === 'object' && ex.race !== null
        ? (ex.race as { raceId?: string }).raceId ?? ''
        : String(ex.race ?? '')

      const exClass = Array.isArray(ex.classes) && ex.classes.length > 0
        ? (ex.classes[0] as { classId?: string }).classId ?? ''
        : ''

      if (
        imp.name.toLowerCase() === ex.name.toLowerCase() &&
        impRace.toLowerCase() === exRace.toLowerCase() &&
        impClass.toLowerCase() === exClass.toLowerCase()
      ) {
        matches.push({
          importedName: imp.name,
          importedRace: impRace,
          importedClass: impClass,
          existingId: ex.id,
          existingName: ex.name,
        })
      }
    }
  }

  return matches
}

// ---------------------------------------------------------------------------
// Import Functions
// ---------------------------------------------------------------------------

/**
 * Generate a new UUID-like ID for imported entities.
 */
function generateId(): string {
  return 'import-' + Math.random().toString(36).slice(2, 11) + '-' + Date.now().toString(36)
}

/**
 * Import a campaign from validated export data.
 * Generates new IDs for the campaign and all characters to prevent conflicts.
 */
export function importCampaign(
  data: CampaignExportData,
  _mergeStrategy: MergeStrategy
): CampaignImportResult {
  const newCampaignId = generateId()
  const characterIdMap: Record<string, string> = {}

  // Generate new IDs for all characters
  const characters = data.characters.map((char) => {
    const newId = generateId()
    characterIdMap[char.id] = newId
    return {
      ...char,
      id: newId,
    }
  })

  const campaign: Partial<Campaign> = {
    id: newCampaignId,
    name: data.campaign.name,
    description: data.campaign.description,
    settings: data.campaign.settings,
    characterIds: characters.map((c) => c.id),
    sessions: data.sessions.map((s) => ({
      ...s,
      id: generateId(),
      campaignId: newCampaignId,
    })),
    npcs: data.npcs.map((n) => ({
      ...n,
      id: generateId(),
      campaignId: newCampaignId,
    })),
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return {
    campaign,
    characters,
    newCampaignId,
    characterIdMap,
  }
}

// ---------------------------------------------------------------------------
// Download Trigger
// ---------------------------------------------------------------------------

/**
 * Trigger a browser download of the given export data as a JSON file.
 */
export function downloadCampaignExport(
  data: CampaignExportData,
  filename: string
): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
