import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8000/api'

// Simulated session state for test mocking
let currentUser: Record<string, unknown> | null = null

// ---------------------------------------------------------------------------
// Mock data: Characters
// ---------------------------------------------------------------------------

interface MockCharacterSummary {
  id: string
  name: string
  race: string
  class: string
  level: number
  hp: { current: number; max: number }
  ac: number
  avatarUrl?: string
}

const mockCharacterSummaries: MockCharacterSummary[] = [
  {
    id: 'char-001',
    name: 'Thorn Ironforge',
    race: 'Dwarf',
    class: 'Fighter',
    level: 5,
    hp: { current: 44, max: 52 },
    ac: 18,
  },
  {
    id: 'char-002',
    name: 'Elara Nightwhisper',
    race: 'Elf',
    class: 'Wizard',
    level: 3,
    hp: { current: 18, max: 18 },
    ac: 12,
    avatarUrl: 'https://example.com/elara.png',
  },
]

const mockCharacterDetail: Record<string, unknown> = {
  id: 'char-001',
  name: 'Thorn Ironforge',
  playerName: 'Test Player',
  avatarUrl: null,
  createdAt: '2024-06-01T12:00:00Z',
  updatedAt: '2024-06-15T08:30:00Z',
  version: 3,
  race: { raceId: 'dwarf', subraceId: 'hill-dwarf' },
  classes: [
    {
      classId: 'fighter',
      level: 5,
      subclassId: 'champion',
      hitDie: 10,
      skillProficiencies: ['athletics', 'perception'],
    },
  ],
  background: {
    backgroundId: 'soldier',
    characterIdentity: { name: 'Thorn Ironforge' },
    characterPersonality: {
      personalityTraits: [
        'I can stare down a hell hound without flinching.',
        'I enjoy being strong.',
      ],
      ideal: 'Greater Good',
      bond: 'I fight for those who cannot fight for themselves.',
      flaw: 'I have a weakness for ale.',
    },
  },
  alignment: 'lawful-good',
  baseAbilityScores: {
    strength: 16,
    dexterity: 12,
    constitution: 14,
    intelligence: 10,
    wisdom: 13,
    charisma: 8,
  },
  abilityScores: {
    strength: 16,
    dexterity: 12,
    constitution: 16,
    intelligence: 10,
    wisdom: 14,
    charisma: 8,
  },
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
  combatStats: {
    armorClass: { base: 18, formula: '16 + 2 (shield)', modifiers: [] },
    initiative: 1,
    speed: { walk: 25 },
    hitPoints: { current: 44, max: 52, temporary: 0 },
    attacks: [],
    savingThrows: { strength: 6, constitution: 5 },
  },
  proficiencies: {
    armor: ['light', 'medium', 'heavy', 'shields'],
    weapons: ['simple melee', 'martial melee'],
    tools: [],
    languages: ['common', 'dwarvish'],
    skills: [],
    savingThrows: ['strength', 'constitution'],
  },
  inventory: [],
  currency: { cp: 0, sp: 15, ep: 0, gp: 50, pp: 0 },
  attunedItems: [],
  spellcasting: null,
  features: ['second-wind', 'action-surge', 'extra-attack'],
  feats: [],
  description: {
    name: 'Thorn Ironforge',
    age: '150',
    height: "4'4\"",
    weight: '180 lbs',
    eyes: 'Brown',
    skin: 'Tan',
    hair: 'Black',
    appearance: 'Stocky and battle-scarred',
    backstory: 'A veteran of many wars.',
    alliesAndOrgs: 'The Ironforge Clan',
    treasure: 'A family crest ring',
  },
  personality: {
    personalityTraits: [
      'I can stare down a hell hound without flinching.',
      'I enjoy being strong.',
    ],
    ideal: 'Greater Good',
    bond: 'I fight for those who cannot fight for themselves.',
    flaw: 'I have a weakness for ale.',
  },
  conditions: [],
  inspiration: false,
  campaignId: null,
  isArchived: false,
}

// ---------------------------------------------------------------------------
// Mock data: Campaigns
// ---------------------------------------------------------------------------

interface MockCampaign {
  id: string
  name: string
  description: string
  dmId: string
  playerIds: string[]
  characterIds: string[]
  joinCode: string
  settings: {
    xpTracking: 'milestone' | 'xp'
    houseRules: {
      allowedSources: string[]
      abilityScoreMethod: string
      startingLevel: number
      allowMulticlass: boolean
      allowFeats: boolean
      encumbranceVariant: boolean
    }
  }
  sessions: never[]
  npcs: never[]
  isArchived: boolean
  characterCount: number
  createdAt: string
  updatedAt: string
}

const mockCampaigns: MockCampaign[] = [
  {
    id: 'camp-001',
    name: 'Lost Mine of Phandelver',
    description: 'A classic introductory adventure.',
    dmId: 'user-001',
    playerIds: ['user-002', 'user-003'],
    characterIds: ['char-001', 'char-002'],
    joinCode: 'ABC123',
    settings: {
      xpTracking: 'milestone',
      houseRules: {
        allowedSources: ['PHB', 'DMG'],
        abilityScoreMethod: 'any',
        startingLevel: 1,
        allowMulticlass: true,
        allowFeats: true,
        encumbranceVariant: false,
      },
    },
    sessions: [],
    npcs: [],
    isArchived: false,
    characterCount: 2,
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-06-15T10:00:00Z',
  },
]

// ---------------------------------------------------------------------------
// Mock data: Preferences
// ---------------------------------------------------------------------------

let mockPreferences = {
  theme: 'dark' as const,
  autoSaveEnabled: true,
  lastActiveCharacterId: 'char-001',
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export const handlers = [
  // Auth endpoints
  http.get(`${BASE_URL}/auth/me/`, () => {
    if (currentUser) {
      return HttpResponse.json(currentUser)
    }
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 403 }
    )
  }),

  http.post(`${BASE_URL}/auth/login/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>
    if (body.username === 'testuser' && body.password === 'SecurePass123!') {
      currentUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        avatar_url: '',
        date_joined: '2024-01-01T00:00:00Z',
      }
      return HttpResponse.json(currentUser)
    }
    return HttpResponse.json(
      { non_field_errors: ['Invalid username or password.'] },
      { status: 400 }
    )
  }),

  http.post(`${BASE_URL}/auth/logout/`, () => {
    currentUser = null
    return HttpResponse.json({ detail: 'Successfully logged out.' })
  }),

  http.post(`${BASE_URL}/auth/register/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>
    if (body.username === 'existinguser') {
      return HttpResponse.json(
        { username: ['A user with that username already exists.'] },
        { status: 400 }
      )
    }
    currentUser = {
      id: '660e8400-e29b-41d4-a716-446655440001',
      username: body.username,
      email: body.email,
      display_name: '',
      avatar_url: '',
      date_joined: '2024-01-01T00:00:00Z',
    }
    return HttpResponse.json(currentUser, { status: 201 })
  }),

  http.patch(`${BASE_URL}/auth/me/`, async ({ request }) => {
    if (!currentUser) {
      return HttpResponse.json(
        { detail: 'Authentication credentials were not provided.' },
        { status: 403 }
      )
    }
    const body = (await request.json()) as Record<string, unknown>
    currentUser = { ...currentUser, ...body }
    return HttpResponse.json(currentUser)
  }),

  http.get(`${BASE_URL}/auth/csrf/`, () => {
    return HttpResponse.json({ csrfToken: 'test-csrf-token' })
  }),

  // -------------------------------------------------------------------------
  // Character endpoints
  // -------------------------------------------------------------------------

  http.get(`${BASE_URL}/characters/`, () => {
    return HttpResponse.json(mockCharacterSummaries)
  }),

  http.get(`${BASE_URL}/characters/:id/`, ({ params }) => {
    const { id } = params
    if (id === 'char-001') {
      return HttpResponse.json(mockCharacterDetail)
    }
    return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
  }),

  http.post(`${BASE_URL}/characters/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const newCharacter = {
      ...mockCharacterDetail,
      ...body,
      id: 'char-new-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    }
    return HttpResponse.json(newCharacter, { status: 201 })
  }),

  http.patch(`${BASE_URL}/characters/:id/`, async ({ params, request }) => {
    const { id } = params
    if (id !== 'char-001') {
      return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
    }
    const body = (await request.json()) as Record<string, unknown>
    const updated = {
      ...mockCharacterDetail,
      ...body,
      updatedAt: new Date().toISOString(),
      version: (mockCharacterDetail.version as number) + 1,
    }
    return HttpResponse.json(updated)
  }),

  http.delete(`${BASE_URL}/characters/:id/`, ({ params }) => {
    const { id } = params
    if (id !== 'char-001') {
      return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // -------------------------------------------------------------------------
  // Character export endpoint
  // -------------------------------------------------------------------------

  http.get(`${BASE_URL}/characters/:id/export/`, ({ params }) => {
    const { id } = params
    if (id !== 'char-001') {
      return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
    }
    const exportData = {
      formatVersion: '1.0',
      appVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      character: {
        name: 'Thorn Ironforge',
        race: 'Dwarf',
        class_name: 'Fighter',
        level: 5,
        ability_scores: {
          strength: 16,
          dexterity: 12,
          constitution: 16,
          intelligence: 10,
          wisdom: 14,
          charisma: 8,
        },
        skills: [],
        equipment: [],
        spells: [],
        background: 'Soldier',
        hp: 52,
        character_data: {},
        is_archived: false,
      },
    }
    return new HttpResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="character-Thorn-Ironforge.json"',
      },
    })
  }),

  // -------------------------------------------------------------------------
  // Character import endpoint
  // -------------------------------------------------------------------------

  http.post(`${BASE_URL}/characters/import/`, async ({ request }) => {
    if (!currentUser) {
      return HttpResponse.json(
        { detail: 'Authentication credentials were not provided.' },
        { status: 403 }
      )
    }
    // Try to parse the form data or body
    let characterData: Record<string, unknown> = {}
    try {
      const contentType = request.headers.get('content-type') || ''
      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData()
        const file = formData.get('file')
        if (file && file instanceof File) {
          const text = await file.text()
          const parsed = JSON.parse(text)
          characterData = parsed.character || parsed
        }
      } else {
        const body = await request.json()
        characterData = (body as Record<string, unknown>).character as Record<string, unknown> || body as Record<string, unknown>
      }
    } catch {
      return HttpResponse.json(
        { file: 'Invalid JSON' },
        { status: 400 }
      )
    }

    // Basic validation
    if (!characterData.name || !characterData.race || !characterData.class_name) {
      return HttpResponse.json(
        { file: 'Missing required fields' },
        { status: 400 }
      )
    }

    const importedCharacter = {
      id: 'char-imported-001',
      name: characterData.name,
      race: characterData.race,
      class_name: characterData.class_name,
      level: characterData.level || 1,
      ability_scores: characterData.ability_scores || {},
      skills: characterData.skills || [],
      equipment: characterData.equipment || [],
      spells: characterData.spells || [],
      background: characterData.background || '',
      hp: characterData.hp || 0,
      character_data: characterData.character_data || {},
      campaign: null,
      owner: currentUser.id,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return HttpResponse.json(
      { character: importedCharacter, warnings: [] },
      { status: 201 }
    )
  }),

  // -------------------------------------------------------------------------
  // Character share endpoint
  // -------------------------------------------------------------------------

  http.get(`${BASE_URL}/characters/:id/share/`, ({ params }) => {
    const { id } = params
    if (!currentUser) {
      return HttpResponse.json(
        { detail: 'Authentication credentials were not provided.' },
        { status: 403 }
      )
    }
    if (id !== 'char-001') {
      return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
    }
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    return HttpResponse.json({
      token: 'share-token-abc-123',
      url: '/shared/share-token-abc-123',
      expires_at: expiresAt.toISOString(),
    })
  }),

  // -------------------------------------------------------------------------
  // Shared character public endpoint
  // -------------------------------------------------------------------------

  http.get(`${BASE_URL}/shared/:token/`, ({ params }) => {
    const { token } = params
    if (token === 'expired-token') {
      return HttpResponse.json(
        { detail: 'This share link has expired.' },
        { status: 410 }
      )
    }
    if (token !== 'share-token-abc-123') {
      return HttpResponse.json({ detail: 'Share link not found.' }, { status: 404 })
    }
    return HttpResponse.json({
      formatVersion: '1.0',
      appVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      character: {
        name: 'Thorn Ironforge',
        race: 'Dwarf',
        class_name: 'Fighter',
        level: 5,
        ability_scores: {
          strength: 16,
          dexterity: 12,
          constitution: 16,
          intelligence: 10,
          wisdom: 14,
          charisma: 8,
        },
        skills: [],
        equipment: [],
        spells: [],
        background: 'Soldier',
        hp: 52,
        character_data: {},
        is_archived: false,
      },
    })
  }),

  // -------------------------------------------------------------------------
  // Campaign endpoints
  // -------------------------------------------------------------------------

  http.get(`${BASE_URL}/campaigns/`, () => {
    return HttpResponse.json(mockCampaigns)
  }),

  http.get(`${BASE_URL}/campaigns/:id/`, ({ params }) => {
    const { id } = params
    const campaign = mockCampaigns.find((c) => c.id === id)
    if (campaign) {
      return HttpResponse.json(campaign)
    }
    return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
  }),

  http.post(`${BASE_URL}/campaigns/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const newCampaign = {
      id: 'camp-new-001',
      name: body.name ?? 'New Campaign',
      description: body.description ?? '',
      dmId: 'user-001',
      playerIds: [],
      characterIds: [],
      joinCode: 'XYZ789',
      settings: body.settings ?? {
        xpTracking: 'milestone',
        houseRules: {
          allowedSources: ['PHB'],
          abilityScoreMethod: 'any',
          startingLevel: 1,
          allowMulticlass: true,
          allowFeats: true,
          encumbranceVariant: false,
        },
      },
      sessions: [],
      npcs: [],
      isArchived: false,
      characterCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(newCampaign, { status: 201 })
  }),

  http.patch(`${BASE_URL}/campaigns/:id/`, async ({ params, request }) => {
    const { id } = params
    const campaign = mockCampaigns.find((c) => c.id === id)
    if (!campaign) {
      return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
    }
    const body = (await request.json()) as Record<string, unknown>
    const updated = {
      ...campaign,
      ...body,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(updated)
  }),

  http.delete(`${BASE_URL}/campaigns/:id/`, ({ params }) => {
    const { id } = params
    const campaign = mockCampaigns.find((c) => c.id === id)
    if (!campaign) {
      return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${BASE_URL}/campaigns/:id/archive/`, ({ params }) => {
    const { id } = params
    const campaign = mockCampaigns.find((c) => c.id === id)
    if (!campaign) {
      return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
    }
    campaign.isArchived = !campaign.isArchived
    return HttpResponse.json({
      detail: `Campaign ${campaign.isArchived ? 'archived' : 'unarchived'}.`,
      campaign,
    })
  }),

  http.post(
    `${BASE_URL}/campaigns/:id/regenerate-code/`,
    ({ params }) => {
      const { id } = params
      const campaign = mockCampaigns.find((c) => c.id === id)
      if (!campaign) {
        return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
      }
      campaign.joinCode = 'NEW123'
      return HttpResponse.json({
        detail: 'Join code regenerated.',
        campaign,
      })
    }
  ),

  http.post(
    `${BASE_URL}/campaigns/:id/remove-character/`,
    async ({ params, request }) => {
      const { id } = params
      const campaign = mockCampaigns.find((c) => c.id === id)
      if (!campaign) {
        return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
      }
      const body = (await request.json()) as Record<string, string>
      const charId = body.character_id
      if (!charId || !campaign.characterIds.includes(charId)) {
        return HttpResponse.json(
          { detail: 'Character not found in this campaign.' },
          { status: 404 }
        )
      }
      campaign.characterIds = campaign.characterIds.filter(
        (cid) => cid !== charId
      )
      campaign.characterCount = campaign.characterIds.length
      return HttpResponse.json({ detail: 'Character removed.' })
    }
  ),

  // Campaign lookup by join code
  http.get(`${BASE_URL}/campaigns/join/:code/`, ({ params }) => {
    const { code } = params
    const campaign = mockCampaigns.find((c) => c.joinCode === code)
    if (campaign) {
      return HttpResponse.json(campaign)
    }
    return HttpResponse.json(
      { detail: 'Campaign not found. Please check the code and try again.' },
      { status: 404 }
    )
  }),

  http.post(`${BASE_URL}/campaigns/:id/join/`, async ({ params, request }) => {
    const { id } = params
    const campaign = mockCampaigns.find((c) => c.id === id)
    if (!campaign) {
      return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
    }
    const body = (await request.json()) as Record<string, string>
    // Support both camelCase (legacy) and snake_case (current API) parameter names
    const joinCode = body.join_code || body.joinCode
    if (joinCode !== campaign.joinCode) {
      return HttpResponse.json(
        { detail: 'Invalid join code.' },
        { status: 400 }
      )
    }
    return HttpResponse.json({ detail: 'Joined successfully.' })
  }),

  // -------------------------------------------------------------------------
  // Preferences endpoints
  // -------------------------------------------------------------------------

  http.get(`${BASE_URL}/preferences/`, () => {
    return HttpResponse.json(mockPreferences)
  }),

  http.put(`${BASE_URL}/preferences/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    mockPreferences = { ...mockPreferences, ...body } as typeof mockPreferences
    return HttpResponse.json(mockPreferences)
  }),

  // -------------------------------------------------------------------------
  // Reference data stubs
  // -------------------------------------------------------------------------

  http.get(`${BASE_URL}/races/`, () => {
    return HttpResponse.json([])
  }),
  http.get(`${BASE_URL}/classes/`, () => {
    return HttpResponse.json([])
  }),
]

/**
 * Helper to set the mock user state for tests.
 */
export function setMockUser(user: Record<string, unknown> | null) {
  currentUser = user
}

/**
 * Helper to reset the mock user state.
 */
export function resetMockUser() {
  currentUser = null
}
