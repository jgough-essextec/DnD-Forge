import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  joinCampaign,
  archiveCampaign,
  regenerateCode,
  removeCharacterFromCampaign,
  lookupCampaignByCode,
  getJoinedCampaigns,
  getCampaignParty,
  leaveCampaign,
} from '@/api/campaigns'
import type { Campaign, CreateCampaignData } from '@/types/campaign'

export const CAMPAIGNS_KEY = ['campaigns'] as const
export const JOINED_CAMPAIGNS_KEY = ['campaigns', 'joined'] as const
export const CAMPAIGN_KEY = (id: string) => ['campaign', id] as const
export const CAMPAIGN_PARTY_KEY = (id: string) => ['campaign', id, 'party'] as const

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
    mutationFn: (data: CreateCampaignData) => createCampaign(data),
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
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
      void queryClient.invalidateQueries({ queryKey: CAMPAIGN_KEY(variables.campaignId) })
    },
  })
}

/**
 * Mutation hook for archiving/unarchiving a campaign.
 */
export function useArchiveCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => archiveCampaign(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
      void queryClient.invalidateQueries({ queryKey: CAMPAIGN_KEY(id) })
    },
  })
}

/**
 * Mutation hook for regenerating a campaign join code.
 */
export function useRegenerateCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => regenerateCode(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
      void queryClient.invalidateQueries({ queryKey: CAMPAIGN_KEY(id) })
    },
  })
}

/**
 * Query hook for looking up a campaign by join code.
 * Disabled when code is null, empty, or less than 6 characters.
 */
export function useLookupCampaignByCode(code: string | null) {
  return useQuery({
    queryKey: ['campaign-lookup', code],
    queryFn: () => lookupCampaignByCode(code!),
    enabled: !!code && code.length === 6,
    retry: false,
  })
}

/**
 * Mutation hook for removing a character from a campaign.
 */
export function useRemoveCharacter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      campaignId,
      characterId,
    }: {
      campaignId: string
      characterId: string
    }) => removeCharacterFromCampaign(campaignId, characterId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
      void queryClient.invalidateQueries({ queryKey: CAMPAIGN_KEY(variables.campaignId) })
    },
  })
}

/**
 * Query hook for fetching campaigns the user has joined (not owned).
 */
export function useJoinedCampaigns() {
  return useQuery({
    queryKey: JOINED_CAMPAIGNS_KEY,
    queryFn: getJoinedCampaigns,
  })
}

/**
 * Query hook for fetching all party members in a campaign.
 */
export function useCampaignParty(id: string | null) {
  return useQuery({
    queryKey: CAMPAIGN_PARTY_KEY(id ?? ''),
    queryFn: () => getCampaignParty(id!),
    enabled: !!id,
  })
}

/**
 * Mutation hook for leaving a campaign.
 */
export function useLeaveCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => leaveCampaign(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
      void queryClient.invalidateQueries({ queryKey: JOINED_CAMPAIGNS_KEY })
      void queryClient.invalidateQueries({ queryKey: CAMPAIGN_KEY(id) })
      void queryClient.invalidateQueries({ queryKey: CAMPAIGN_PARTY_KEY(id) })
    },
  })
}
