import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  joinCampaign,
} from '@/api/campaigns'
import type { Campaign } from '@/types/campaign'

export const CAMPAIGNS_KEY = ['campaigns'] as const
export const CAMPAIGN_KEY = (id: string) => ['campaign', id] as const

/**
 * Query hook for fetching all campaigns.
 */
export function useCampaigns() {
  return useQuery({
    queryKey: CAMPAIGNS_KEY,
    queryFn: getCampaigns,
  })
}

/**
 * Query hook for fetching a single campaign by ID.
 * Disabled when id is null or empty.
 */
export function useCampaign(id: string | null) {
  return useQuery({
    queryKey: CAMPAIGN_KEY(id ?? ''),
    queryFn: () => getCampaign(id!),
    enabled: !!id,
  })
}

/**
 * Mutation hook for creating a new campaign.
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => createCampaign(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
    },
  })
}

/**
 * Mutation hook for updating an existing campaign.
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Campaign> }) =>
      updateCampaign(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
      void queryClient.invalidateQueries({ queryKey: CAMPAIGN_KEY(variables.id) })
    },
  })
}

/**
 * Mutation hook for deleting a campaign.
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
    },
  })
}

/**
 * Mutation hook for joining a campaign.
 */
export function useJoinCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      campaignId,
      joinCode,
      characterId,
    }: {
      campaignId: string
      joinCode: string
      characterId: string
    }) => joinCampaign(campaignId, joinCode, characterId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
    },
  })
}
