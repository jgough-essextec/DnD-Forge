import { api } from '@/lib/api'
import type { Campaign, CreateCampaignData } from '@/types/campaign'

/** DRF paginated response shape. */
interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Fetch all campaigns for the current user.
 */
export async function getCampaigns(): Promise<Campaign[]> {
  const response = await api.get<PaginatedResponse<Campaign> | Campaign[]>('/campaigns/')
  if (Array.isArray(response.data)) {
    return response.data
  }
  return response.data.results
}

/**
 * Fetch a single campaign by ID.
 */
export async function getCampaign(id: string): Promise<Campaign> {
  const response = await api.get<Campaign>(`/campaigns/${id}/`)
  return response.data
}

/**
 * Create a new campaign.
 */
export async function createCampaign(data: CreateCampaignData): Promise<Campaign> {
  const response = await api.post<Campaign>('/campaigns/', data)
  return response.data
}

/**
 * Partially update an existing campaign.
 */
export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
  const response = await api.patch<Campaign>(`/campaigns/${id}/`, data)
  return response.data
}

/**
 * Delete a campaign by ID.
 */
export async function deleteCampaign(id: string): Promise<void> {
  await api.delete(`/campaigns/${id}/`)
}

/**
 * Join a campaign using a join code.
 */
export async function joinCampaign(
  campaignId: string,
  joinCode: string,
  characterId: string
): Promise<void> {
  await api.post(`/campaigns/${campaignId}/join/`, { join_code: joinCode, character_id: characterId })
}

/**
 * Toggle the archived state of a campaign.
 */
export async function archiveCampaign(id: string): Promise<Campaign> {
  const response = await api.post<{ campaign: Campaign }>(`/campaigns/${id}/archive/`)
  return response.data.campaign
}

/**
 * Regenerate the join code for a campaign.
 */
export async function regenerateCode(id: string): Promise<Campaign> {
  const response = await api.post<{ campaign: Campaign }>(`/campaigns/${id}/regenerate-code/`)
  return response.data.campaign
}

/**
 * Remove a character from a campaign (unlink, not delete).
 */
export async function removeCharacterFromCampaign(
  campaignId: string,
  characterId: string
): Promise<void> {
  await api.post(`/campaigns/${campaignId}/remove-character/`, { character_id: characterId })
}

/**
 * Look up a campaign by join code.
 * Returns the campaign if the code matches, or throws a 404 error.
 */
export async function lookupCampaignByCode(code: string): Promise<Campaign> {
  const response = await api.get<Campaign>(`/campaigns/join/${code}/`)
  return response.data
}
