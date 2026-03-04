import { api } from '@/lib/api'
import type { Campaign } from '@/types/campaign'

/**
 * Fetch all campaigns for the current user.
 */
export async function getCampaigns(): Promise<Campaign[]> {
  const response = await api.get<Campaign[]>('/campaigns/')
  return response.data
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
export async function createCampaign(data: { name: string; description?: string }): Promise<Campaign> {
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
  await api.post(`/campaigns/${campaignId}/join/`, { joinCode, characterId })
}
