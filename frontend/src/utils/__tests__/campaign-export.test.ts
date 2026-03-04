import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  exportCampaign,
  exportCampaignPlayerSafe,
  generateExportFilename,
  validateCampaignImport,
  detectDuplicateCharacters,
  importCampaign,
  downloadCampaignExport,
} from '../campaign-export'
import type { CampaignExportData, CampaignExportCharacter } from '../campaign-export'
import type { Campaign } from '@/types/campaign'
import type { Character } from '@/types/character'
import { DEFAULT_HOUSE_RULES } from '@/utils/campaign'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'camp-1',
    name: 'Test Campaign',
    description: 'A test campaign.',
    dmId: 'user-1',
    playerIds: [],
    characterIds: ['char-1', 'char-2'],
    joinCode: 'ABC123',
    settings: {
      xpTracking: 'milestone',
      houseRules: { ...DEFAULT_HOUSE_RULES },
    },
    sessions: [
      {
        id: 'sess-1',
        campaignId: 'camp-1',
        sessionNumber: 1,
        date: '2024-01-15',
        title: 'The Beginning',
        content: 'The party met in a tavern.',
        tags: [],
      },
      {
        id: 'sess-2',
        campaignId: 'camp-1',
        sessionNumber: 2,
        date: '2024-01-22',
        title: 'DM Secret Notes',
        content: 'The BBEG is actually the barkeep.',
        tags: ['DM Only'],
      },
    ],
    npcs: [
      {
        id: 'npc-1',
        campaignId: 'camp-1',
        name: 'Gundren Rockseeker',
        description: 'A dwarf patron',
        dmNotes: 'Secret: knows about the mine',
      },
    ],
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-15T10:00:00Z',
    ...overrides,
  }
}

function makeCharacter(overrides: Record<string, unknown> = {}): Character {
  return {
    id: 'char-1',
    name: 'Thorn Ironforge',
    playerName: 'Test Player',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-15T10:00:00Z',
    version: 1,
    race: { raceId: 'dwarf', subraceId: 'hill-dwarf' },
    classes: [{ classId: 'fighter', level: 5, subclassId: 'champion' }],
    background: { backgroundId: 'soldier' },
    alignment: 'lawful-good',
    baseAbilityScores: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 13, charisma: 8 },
    abilityScores: { strength: 16, dexterity: 12, constitution: 16, intelligence: 10, wisdom: 14, charisma: 8 },
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 6500,
    hpMax: 52,
    hpCurrent: 44,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [1],
    speed: { walk: 25 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {},
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple', 'martial'],
      tools: [],
      languages: ['common', 'dwarvish'],
      skills: [],
      savingThrows: ['strength', 'constitution'],
    },
    inventory: [],
    currency: { cp: 0, sp: 15, ep: 0, gp: 50, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
    feats: [],
    description: { name: 'Thorn' },
    personality: { personalityTraits: ['trait1', 'trait2'], ideal: '', bond: '', flaw: '' },
    conditions: [],
    inspiration: false,
    campaignId: 'camp-1',
    isArchived: false,
    dmNotes: 'Secret DM note about this character',
    ...overrides,
  } as unknown as Character
}

// ---------------------------------------------------------------------------
// Export Tests
// ---------------------------------------------------------------------------

describe('exportCampaign', () => {
  it('should export full campaign JSON with all data', () => {
    const campaign = makeCampaign()
    const characters = [makeCharacter()]

    const result = exportCampaign(campaign, characters)

    expect(result.formatVersion).toBe('1.0.0')
    expect(result.exportType).toBe('full')
    expect(result.campaign.name).toBe('Test Campaign')
    expect(result.characters).toHaveLength(1)
    expect(result.characters[0].name).toBe('Thorn Ironforge')
    expect(result.sessions).toHaveLength(2) // includes DM Only session
    expect(result.npcs).toHaveLength(1)
    expect(result.exportedAt).toBeTruthy()
  })

  it('should include DM notes on characters in full export', () => {
    const characters = [makeCharacter({ dmNotes: 'Secret stuff' })]
    const result = exportCampaign(makeCampaign(), characters)

    expect(result.characters[0].dmNotes).toBe('Secret stuff')
  })

  it('should respect options to exclude sessions and NPCs', () => {
    const result = exportCampaign(makeCampaign(), [makeCharacter()], {
      includeSessions: false,
      includeNPCs: false,
    })

    expect(result.sessions).toHaveLength(0)
    expect(result.npcs).toHaveLength(0)
  })
})

describe('exportCampaignPlayerSafe', () => {
  it('should exclude DM notes, NPC entries, and DM-only session notes', () => {
    const campaign = makeCampaign()
    const characters = [makeCharacter({ dmNotes: 'Secret DM note' })]

    const result = exportCampaignPlayerSafe(campaign, characters)

    expect(result.exportType).toBe('player-safe')
    // No DM notes on characters
    expect(result.characters[0].dmNotes).toBeUndefined()
    // No NPCs
    expect(result.npcs).toHaveLength(0)
    // Only non-DM-only sessions
    expect(result.sessions).toHaveLength(1)
    expect(result.sessions[0].title).toBe('The Beginning')
  })
})

// ---------------------------------------------------------------------------
// Filename Tests
// ---------------------------------------------------------------------------

describe('generateExportFilename', () => {
  it('should generate sanitized filename', () => {
    // We need to mock Date to get a consistent date
    const mockDate = new Date('2024-06-15T10:00:00Z')
    vi.setSystemTime(mockDate)

    const filename = generateExportFilename('Lost Mine of Phandelver')
    expect(filename).toBe('Lost_Mine_of_Phandelver_Campaign_Export_2024-06-15.json')

    vi.useRealTimers()
  })

  it('should handle special characters in campaign name', () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))

    const filename = generateExportFilename('Dragon\'s Lair!! (Test)')
    expect(filename).toBe('Dragons_Lair_Test_Campaign_Export_2024-01-01.json')

    vi.useRealTimers()
  })

  it('should truncate very long campaign names', () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))

    const longName = 'A'.repeat(100)
    const filename = generateExportFilename(longName)
    // Name part should be truncated to 50 chars
    expect(filename.length).toBeLessThan(100)

    vi.useRealTimers()
  })
})

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('validateCampaignImport', () => {
  function makeValidExportJson(): string {
    const data: CampaignExportData = {
      formatVersion: '1.0.0',
      exportType: 'full',
      exportedAt: '2024-06-15T10:00:00Z',
      campaign: {
        id: 'camp-1',
        name: 'Test Campaign',
        description: 'A test.',
        joinCode: 'ABC123',
        settings: {
          xpTracking: 'milestone',
          houseRules: { ...DEFAULT_HOUSE_RULES },
        },
        isArchived: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-06-15T10:00:00Z',
      },
      characters: [
        {
          id: 'char-1',
          name: 'Thorn',
          race: { raceId: 'dwarf' } as CampaignExportCharacter['race'],
          classes: [{ classId: 'fighter', level: 5 }] as CampaignExportCharacter['classes'],
          level: 5,
          background: {} as CampaignExportCharacter['background'],
          abilityScores: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 13, charisma: 8 },
          hpMax: 52,
          hpCurrent: 44,
          inventory: [],
          spellcasting: null,
        },
      ],
      sessions: [],
      npcs: [],
    }
    return JSON.stringify(data)
  }

  it('should validate valid JSON through all 5 stages', () => {
    const result = validateCampaignImport(makeValidExportJson())

    expect(result.valid).toBe(true)
    expect(result.stages).toHaveLength(5)
    result.stages.forEach((stage) => {
      expect(stage.passed).toBe(true)
    })
  })

  it('should fail syntax validation for invalid JSON', () => {
    const result = validateCampaignImport('not json at all {{{')

    expect(result.valid).toBe(false)
    expect(result.stages).toHaveLength(1)
    expect(result.stages[0].stage).toBe('Syntax')
    expect(result.stages[0].passed).toBe(false)
  })

  it('should fail schema validation for missing required fields', () => {
    const result = validateCampaignImport(
      JSON.stringify({ foo: 'bar' })
    )

    expect(result.valid).toBe(false)
    const schemaStage = result.stages.find((s) => s.stage === 'Schema')
    expect(schemaStage).toBeTruthy()
    expect(schemaStage!.passed).toBe(false)
    expect(schemaStage!.errors.length).toBeGreaterThan(0)
  })

  it('should fail type validation for wrong field types', () => {
    const data = JSON.parse(makeValidExportJson())
    data.formatVersion = 123 // should be string
    data.exportType = 'invalid' // should be full or player-safe

    const result = validateCampaignImport(JSON.stringify(data))

    expect(result.valid).toBe(false)
    const typeStage = result.stages.find((s) => s.stage === 'Types')
    expect(typeStage?.passed).toBe(false)
  })

  it('should fail reference validation for characters missing IDs', () => {
    const data = JSON.parse(makeValidExportJson())
    data.characters = [{ name: 'No ID character' }] // missing id

    const result = validateCampaignImport(JSON.stringify(data))

    expect(result.valid).toBe(false)
    const refStage = result.stages.find((s) => s.stage === 'References')
    expect(refStage?.passed).toBe(false)
  })

  it('should fail business rules for duplicate character IDs', () => {
    const data = JSON.parse(makeValidExportJson())
    data.characters = [
      { id: 'dup-1', name: 'Char A' },
      { id: 'dup-1', name: 'Char B' }, // duplicate
    ]

    const result = validateCampaignImport(JSON.stringify(data))

    expect(result.valid).toBe(false)
    const bizStage = result.stages.find((s) => s.stage === 'Business Rules')
    expect(bizStage?.passed).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Duplicate Detection Tests
// ---------------------------------------------------------------------------

describe('detectDuplicateCharacters', () => {
  it('should detect duplicate characters by name + race + class', () => {
    const imported: CampaignExportCharacter[] = [
      {
        id: 'imp-1',
        name: 'Thorn Ironforge',
        race: { raceId: 'dwarf' } as CampaignExportCharacter['race'],
        classes: [{ classId: 'fighter' }] as CampaignExportCharacter['classes'],
        level: 5,
        background: {} as CampaignExportCharacter['background'],
        abilityScores: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 13, charisma: 8 },
        hpMax: 52,
        hpCurrent: 44,
        inventory: [],
        spellcasting: null,
      },
    ]

    const existing = [makeCharacter()]

    const matches = detectDuplicateCharacters(imported, existing)

    expect(matches).toHaveLength(1)
    expect(matches[0].importedName).toBe('Thorn Ironforge')
    expect(matches[0].existingId).toBe('char-1')
  })

  it('should return empty array when no duplicates exist', () => {
    const imported: CampaignExportCharacter[] = [
      {
        id: 'imp-1',
        name: 'Completely Different',
        race: { raceId: 'elf' } as CampaignExportCharacter['race'],
        classes: [{ classId: 'wizard' }] as CampaignExportCharacter['classes'],
        level: 3,
        background: {} as CampaignExportCharacter['background'],
        abilityScores: { strength: 8, dexterity: 14, constitution: 12, intelligence: 16, wisdom: 13, charisma: 10 },
        hpMax: 18,
        hpCurrent: 18,
        inventory: [],
        spellcasting: null,
      },
    ]

    const existing = [makeCharacter()]
    const matches = detectDuplicateCharacters(imported, existing)

    expect(matches).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Import Tests
// ---------------------------------------------------------------------------

describe('importCampaign', () => {
  it('should generate new IDs for campaign and characters on import', () => {
    const exportData: CampaignExportData = {
      formatVersion: '1.0.0',
      exportType: 'full',
      exportedAt: '2024-06-15T10:00:00Z',
      campaign: {
        id: 'old-camp-id',
        name: 'Imported Campaign',
        description: 'Imported.',
        joinCode: 'ABC123',
        settings: {
          xpTracking: 'milestone',
          houseRules: { ...DEFAULT_HOUSE_RULES },
        },
        isArchived: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-06-15T10:00:00Z',
      },
      characters: [
        {
          id: 'old-char-1',
          name: 'Thorn',
          race: { raceId: 'dwarf' } as CampaignExportCharacter['race'],
          classes: [{ classId: 'fighter' }] as CampaignExportCharacter['classes'],
          level: 5,
          background: {} as CampaignExportCharacter['background'],
          abilityScores: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 13, charisma: 8 },
          hpMax: 52,
          hpCurrent: 44,
          inventory: [],
          spellcasting: null,
        },
      ],
      sessions: [
        {
          id: 'old-sess-1',
          campaignId: 'old-camp-id',
          sessionNumber: 1,
          date: '2024-01-15',
          title: 'Session 1',
          content: 'Content',
          tags: [],
        },
      ],
      npcs: [],
    }

    const result = importCampaign(exportData, 'new-copy')

    // New campaign ID
    expect(result.newCampaignId).not.toBe('old-camp-id')
    expect(result.campaign.id).toBe(result.newCampaignId)

    // New character IDs
    expect(result.characters).toHaveLength(1)
    expect(result.characters[0].id).not.toBe('old-char-1')

    // ID map
    expect(result.characterIdMap['old-char-1']).toBe(result.characters[0].id)

    // Campaign name preserved
    expect(result.campaign.name).toBe('Imported Campaign')
  })
})

// ---------------------------------------------------------------------------
// Download Trigger Tests
// ---------------------------------------------------------------------------

describe('downloadCampaignExport', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should trigger a browser download', () => {
    // Mock URL methods that jsdom doesn't implement
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.createObjectURL = vi.fn().mockReturnValue('blob:test')
    URL.revokeObjectURL = vi.fn()

    // Mock DOM methods
    const mockClick = vi.fn()
    const mockLink = {
      click: mockClick,
      href: '',
      download: '',
    }
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as HTMLElement)
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as HTMLElement)

    const data: CampaignExportData = {
      formatVersion: '1.0.0',
      exportType: 'full',
      exportedAt: '2024-06-15T10:00:00Z',
      campaign: {
        id: 'camp-1',
        name: 'Test',
        description: '',
        joinCode: 'ABC123',
        settings: {
          xpTracking: 'milestone',
          houseRules: { ...DEFAULT_HOUSE_RULES },
        },
        isArchived: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-06-15T10:00:00Z',
      },
      characters: [],
      sessions: [],
      npcs: [],
    }

    downloadCampaignExport(data, 'test.json')

    expect(document.createElement).toHaveBeenCalledWith('a')
    expect(mockClick).toHaveBeenCalled()
    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test')

    // Restore
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })
})
