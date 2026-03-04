import type { Campaign } from '@/types/campaign'

export type CampaignSortKey = 'updatedAt' | 'name' | 'createdAt'

/**
 * Sort campaigns by the specified key.
 */
export function sortCampaigns(
  campaigns: Campaign[],
  sortKey: CampaignSortKey
): Campaign[] {
  return [...campaigns].sort((a, b) => {
    switch (sortKey) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'updatedAt':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
  })
}

/**
 * Filter campaigns by archived status.
 */
export function filterCampaignsByArchived(
  campaigns: Campaign[],
  showArchived: boolean
): Campaign[] {
  if (showArchived) {
    return campaigns
  }
  return campaigns.filter((c) => !c.isArchived)
}

/**
 * Search campaigns by name or description.
 */
export function searchCampaigns(
  campaigns: Campaign[],
  query: string
): Campaign[] {
  if (!query.trim()) {
    return campaigns
  }
  const lower = query.toLowerCase()
  return campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(lower) ||
      c.description.toLowerCase().includes(lower)
  )
}

/**
 * Get the character soft cap warning threshold.
 */
export const CHARACTER_SOFT_CAP = 8
export const CHARACTER_WARNING_THRESHOLD = 7

/**
 * Format a date string for display.
 */
export function formatCampaignDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get a truncated description for campaign card display.
 */
export function truncateDescription(description: string, maxLen = 120): string {
  if (description.length <= maxLen) {
    return description
  }
  return description.slice(0, maxLen).trimEnd() + '...'
}

/**
 * Default house rules for new campaigns.
 */
export const DEFAULT_HOUSE_RULES = {
  allowedSources: ['PHB'],
  abilityScoreMethod: 'any' as const,
  startingLevel: 1,
  allowMulticlass: true,
  allowFeats: true,
  encumbranceVariant: false,
}

/**
 * Default campaign settings for new campaigns.
 */
export const DEFAULT_CAMPAIGN_SETTINGS = {
  xpTracking: 'milestone' as const,
  houseRules: DEFAULT_HOUSE_RULES,
}
