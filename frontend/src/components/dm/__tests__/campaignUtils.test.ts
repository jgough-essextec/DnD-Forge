import { describe, it, expect } from 'vitest'
import {
  sortCampaigns,
  filterCampaignsByArchived,
  searchCampaigns,
  formatCampaignDate,
  truncateDescription,
  CHARACTER_SOFT_CAP,
  CHARACTER_WARNING_THRESHOLD,
  DEFAULT_HOUSE_RULES,
  DEFAULT_CAMPAIGN_SETTINGS,
} from '@/utils/campaign'
import type { Campaign } from '@/types/campaign'

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'camp-1',
    name: 'Test Campaign',
    description: 'A test campaign',
    dmId: 'user-1',
    playerIds: [],
    characterIds: [],
    joinCode: 'ABC123',
    settings: {
      xpTracking: 'milestone',
      houseRules: { ...DEFAULT_HOUSE_RULES },
    },
    sessions: [],
    npcs: [],
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    ...overrides,
  }
}

describe('sortCampaigns', () => {
  const campaigns = [
    makeCampaign({ id: 'a', name: 'Zebra Campaign', updatedAt: '2024-01-01T00:00:00Z', createdAt: '2024-01-01T00:00:00Z' }),
    makeCampaign({ id: 'b', name: 'Alpha Campaign', updatedAt: '2024-06-01T00:00:00Z', createdAt: '2024-03-01T00:00:00Z' }),
    makeCampaign({ id: 'c', name: 'Middle Campaign', updatedAt: '2024-03-01T00:00:00Z', createdAt: '2024-06-01T00:00:00Z' }),
  ]

  it('sorts by updatedAt descending (default)', () => {
    const sorted = sortCampaigns(campaigns, 'updatedAt')
    expect(sorted.map((c) => c.id)).toEqual(['b', 'c', 'a'])
  })

  it('sorts by name alphabetically', () => {
    const sorted = sortCampaigns(campaigns, 'name')
    expect(sorted.map((c) => c.id)).toEqual(['b', 'c', 'a'])
  })

  it('sorts by createdAt descending', () => {
    const sorted = sortCampaigns(campaigns, 'createdAt')
    expect(sorted.map((c) => c.id)).toEqual(['c', 'b', 'a'])
  })

  it('does not mutate the original array', () => {
    const original = [...campaigns]
    sortCampaigns(campaigns, 'name')
    expect(campaigns).toEqual(original)
  })
})

describe('filterCampaignsByArchived', () => {
  const campaigns = [
    makeCampaign({ id: 'active-1', isArchived: false }),
    makeCampaign({ id: 'archived-1', isArchived: true }),
    makeCampaign({ id: 'active-2', isArchived: false }),
  ]

  it('filters out archived campaigns when showArchived is false', () => {
    const result = filterCampaignsByArchived(campaigns, false)
    expect(result).toHaveLength(2)
    expect(result.every((c) => !c.isArchived)).toBe(true)
  })

  it('includes all campaigns when showArchived is true', () => {
    const result = filterCampaignsByArchived(campaigns, true)
    expect(result).toHaveLength(3)
  })
})

describe('searchCampaigns', () => {
  const campaigns = [
    makeCampaign({ id: '1', name: 'Lost Mine of Phandelver', description: 'A starter adventure' }),
    makeCampaign({ id: '2', name: 'Curse of Strahd', description: 'Gothic horror' }),
    makeCampaign({ id: '3', name: 'Storm King', description: 'Giants adventure in the north' }),
  ]

  it('returns all campaigns for empty query', () => {
    expect(searchCampaigns(campaigns, '')).toHaveLength(3)
    expect(searchCampaigns(campaigns, '   ')).toHaveLength(3)
  })

  it('searches by name (case insensitive)', () => {
    const result = searchCampaigns(campaigns, 'lost')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
  })

  it('searches by description', () => {
    const result = searchCampaigns(campaigns, 'gothic')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('returns empty array for no matches', () => {
    expect(searchCampaigns(campaigns, 'nothing')).toHaveLength(0)
  })
})

describe('formatCampaignDate', () => {
  it('formats a date string', () => {
    const result = formatCampaignDate('2024-06-15T10:00:00Z')
    expect(result).toContain('Jun')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })
})

describe('truncateDescription', () => {
  it('does not truncate short descriptions', () => {
    expect(truncateDescription('Short')).toBe('Short')
  })

  it('truncates long descriptions with ellipsis', () => {
    const long = 'A'.repeat(200)
    const result = truncateDescription(long, 120)
    expect(result.length).toBeLessThanOrEqual(123) // 120 + '...'
    expect(result.endsWith('...')).toBe(true)
  })

  it('respects custom max length', () => {
    const result = truncateDescription('Hello World', 5)
    expect(result).toBe('Hello...')
  })
})

describe('constants', () => {
  it('CHARACTER_SOFT_CAP is 8', () => {
    expect(CHARACTER_SOFT_CAP).toBe(8)
  })

  it('CHARACTER_WARNING_THRESHOLD is 7', () => {
    expect(CHARACTER_WARNING_THRESHOLD).toBe(7)
  })

  it('DEFAULT_HOUSE_RULES has correct shape', () => {
    expect(DEFAULT_HOUSE_RULES).toEqual({
      allowedSources: ['PHB'],
      abilityScoreMethod: 'any',
      startingLevel: 1,
      allowMulticlass: true,
      allowFeats: true,
      encumbranceVariant: false,
    })
  })

  it('DEFAULT_CAMPAIGN_SETTINGS has correct shape', () => {
    expect(DEFAULT_CAMPAIGN_SETTINGS.xpTracking).toBe('milestone')
    expect(DEFAULT_CAMPAIGN_SETTINGS.houseRules).toBeDefined()
  })
})
