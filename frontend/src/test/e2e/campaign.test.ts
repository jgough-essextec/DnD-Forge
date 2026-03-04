/**
 * E2E Integration Test: Campaign Flow (Epic 45, Story 45.2)
 *
 * Tests campaign management through the API:
 * - Create a new campaign
 * - List campaigns
 * - View campaign dashboard (detail endpoint)
 * - Add characters to a campaign (join via code)
 * - Archive/unarchive campaign
 * - Regenerate join code
 * - Remove character from campaign
 */

import { describe, it, expect } from 'vitest'
import {
  sortCampaigns,
  filterCampaignsByArchived,
  searchCampaigns,
  truncateDescription,
  formatCampaignDate,
  DEFAULT_CAMPAIGN_SETTINGS,
} from '@/utils/campaign'
import type { Campaign } from '@/types/campaign'

const BASE_URL = 'http://localhost:8000/api'

// ---------------------------------------------------------------------------
// Campaign CRUD via API
// ---------------------------------------------------------------------------

describe('Campaign: Create Campaign', () => {
  it('creates a new campaign via POST', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dragon Heist',
        description: 'An urban adventure in Waterdeep.',
        settings: DEFAULT_CAMPAIGN_SETTINGS,
      }),
    })

    expect(response.status).toBe(201)
    const campaign = await response.json()
    expect(campaign.id).toBe('camp-new-001')
    expect(campaign.name).toBe('Dragon Heist')
    expect(campaign.description).toBe('An urban adventure in Waterdeep.')
    expect(campaign.joinCode).toBeDefined()
    expect(campaign.characterCount).toBe(0)
  })
})

describe('Campaign: List Campaigns', () => {
  it('fetches campaign list from API', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/`)
    expect(response.ok).toBe(true)

    const campaigns = await response.json()
    expect(Array.isArray(campaigns)).toBe(true)
    expect(campaigns.length).toBeGreaterThan(0)
  })

  it('each campaign has required fields', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/`)
    const campaigns = await response.json()

    for (const camp of campaigns) {
      expect(camp).toHaveProperty('id')
      expect(camp).toHaveProperty('name')
      expect(camp).toHaveProperty('joinCode')
      expect(camp).toHaveProperty('characterIds')
      expect(camp).toHaveProperty('settings')
    }
  })
})

describe('Campaign: View Dashboard', () => {
  it('loads campaign detail by ID', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/camp-001/`)
    expect(response.ok).toBe(true)

    const campaign = await response.json()
    expect(campaign.id).toBe('camp-001')
    expect(campaign.name).toBe('Lost Mine of Phandelver')
    expect(campaign.characterIds).toEqual(['char-001', 'char-002'])
  })

  it('returns 404 for non-existent campaign', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/nonexistent/`)
    expect(response.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// Join Campaign
// ---------------------------------------------------------------------------

describe('Campaign: Join via Code', () => {
  it('looks up campaign by join code', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/lookup/ABC123/`)
    expect(response.ok).toBe(true)

    const campaign = await response.json()
    expect(campaign.name).toBe('Lost Mine of Phandelver')
  })

  it('returns 404 for invalid join code', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/lookup/INVALID/`)
    expect(response.status).toBe(404)
  })

  it('joins campaign with correct code', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/camp-001/join/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ join_code: 'ABC123' }),
    })

    expect(response.ok).toBe(true)
    const result = await response.json()
    expect(result.detail).toBe('Joined successfully.')
  })

  it('rejects join with wrong code', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/camp-001/join/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ join_code: 'WRONG' }),
    })

    expect(response.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// Campaign Management Actions
// ---------------------------------------------------------------------------

describe('Campaign: Archive and Unarchive', () => {
  it('archives a campaign', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/camp-001/archive/`, {
      method: 'POST',
    })
    expect(response.ok).toBe(true)

    const result = await response.json()
    expect(result.campaign).toBeDefined()
  })
})

describe('Campaign: Regenerate Join Code', () => {
  it('regenerates the join code', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/camp-001/regenerate-code/`, {
      method: 'POST',
    })
    expect(response.ok).toBe(true)

    const result = await response.json()
    expect(result.campaign.joinCode).toBe('NEW123')
  })
})

describe('Campaign: Remove Character', () => {
  it('removes a character from the campaign', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/camp-001/remove-character/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ character_id: 'char-001' }),
    })

    expect(response.ok).toBe(true)
    const result = await response.json()
    expect(result.detail).toBe('Character removed.')
  })

  it('returns 404 when removing non-member character', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/camp-001/remove-character/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ character_id: 'nonexistent' }),
    })

    expect(response.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// Campaign Utility Functions
// ---------------------------------------------------------------------------

describe('Campaign: Sorting Utilities', () => {
  const campaigns: Campaign[] = [
    {
      id: 'camp-a',
      name: 'Zephyr Campaign',
      description: 'A windy adventure',
      dmId: 'user-1',
      playerIds: [],
      characterIds: [],
      joinCode: 'A1',
      settings: { xpTracking: 'milestone', houseRules: { allowedSources: ['PHB'], abilityScoreMethod: 'any', startingLevel: 1, allowMulticlass: true, allowFeats: true, encumbranceVariant: false } },
      sessions: [],
      npcs: [],
      isArchived: false,
      characterCount: 0,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    },
    {
      id: 'camp-b',
      name: 'Alpha Campaign',
      description: 'The first adventure',
      dmId: 'user-1',
      playerIds: [],
      characterIds: [],
      joinCode: 'B1',
      settings: { xpTracking: 'milestone', houseRules: { allowedSources: ['PHB'], abilityScoreMethod: 'any', startingLevel: 1, allowMulticlass: true, allowFeats: true, encumbranceVariant: false } },
      sessions: [],
      npcs: [],
      isArchived: true,
      characterCount: 3,
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-15T00:00:00Z',
    },
  ]

  it('sorts by name alphabetically', () => {
    const sorted = sortCampaigns(campaigns, 'name')
    expect(sorted[0].name).toBe('Alpha Campaign')
  })

  it('sorts by updatedAt (newest first)', () => {
    const sorted = sortCampaigns(campaigns, 'updatedAt')
    expect(sorted[0].name).toBe('Zephyr Campaign')
  })

  it('filters out archived campaigns', () => {
    const active = filterCampaignsByArchived(campaigns, false)
    expect(active).toHaveLength(1)
    expect(active[0].name).toBe('Zephyr Campaign')
  })

  it('shows all when showArchived is true', () => {
    const all = filterCampaignsByArchived(campaigns, true)
    expect(all).toHaveLength(2)
  })

  it('searches campaigns by name', () => {
    const results = searchCampaigns(campaigns, 'alpha')
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Alpha Campaign')
  })

  it('searches campaigns by description', () => {
    const results = searchCampaigns(campaigns, 'windy')
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Zephyr Campaign')
  })
})

// ---------------------------------------------------------------------------
// Joined Campaigns
// ---------------------------------------------------------------------------

describe('Campaign: Joined Campaigns', () => {
  it('fetches joined campaigns list', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/joined/`)
    expect(response.ok).toBe(true)

    const campaigns = await response.json()
    expect(Array.isArray(campaigns)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Party Members
// ---------------------------------------------------------------------------

describe('Campaign: Party Members', () => {
  it('fetches party members for a campaign', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/camp-001/party/`)
    expect(response.ok).toBe(true)

    const members = await response.json()
    expect(Array.isArray(members)).toBe(true)
    expect(members.length).toBeGreaterThan(0)

    const member = members[0]
    expect(member).toHaveProperty('id')
    expect(member).toHaveProperty('name')
    expect(member).toHaveProperty('race')
    expect(member).toHaveProperty('class')
    expect(member).toHaveProperty('level')
    expect(member).toHaveProperty('hp')
    expect(member).toHaveProperty('ac')
  })

  it('returns 404 for non-existent campaign', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/nonexistent/party/`)
    expect(response.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// Leave Campaign
// ---------------------------------------------------------------------------

describe('Campaign: Leave Campaign', () => {
  it('leaves a campaign successfully', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/camp-001/leave/`, {
      method: 'POST',
    })
    expect(response.ok).toBe(true)

    const result = await response.json()
    expect(result.detail).toContain('left')
  })

  it('returns 404 for non-existent campaign', async () => {
    const response = await fetch(`${BASE_URL}/campaigns/nonexistent/leave/`, {
      method: 'POST',
    })
    expect(response.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// Campaign Utility Functions (continued)
// ---------------------------------------------------------------------------

describe('Campaign: Display Utilities', () => {
  it('truncateDescription trims long text', () => {
    const long = 'A'.repeat(200)
    const truncated = truncateDescription(long, 120)
    expect(truncated.length).toBeLessThanOrEqual(123) // 120 + '...'
    expect(truncated.endsWith('...')).toBe(true)
  })

  it('truncateDescription leaves short text unchanged', () => {
    const short = 'A short description'
    expect(truncateDescription(short, 120)).toBe(short)
  })

  it('formatCampaignDate formats a date string', () => {
    const formatted = formatCampaignDate('2026-03-04T12:00:00Z')
    expect(formatted).toContain('2026')
    expect(formatted).toContain('Mar')
  })
})
