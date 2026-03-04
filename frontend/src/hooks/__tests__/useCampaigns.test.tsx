import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useCampaigns,
  useCampaign,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  useJoinCampaign,
  useJoinedCampaigns,
  useCampaignParty,
  useLeaveCampaign,
} from '@/hooks/useCampaigns'
import type { ReactNode } from 'react'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCampaigns', () => {
  it('fetches all campaigns', async () => {
    const { result } = renderHook(() => useCampaigns(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeInstanceOf(Array)
    expect(result.current.data!.length).toBeGreaterThan(0)
    expect(result.current.data![0]).toHaveProperty('name', 'Lost Mine of Phandelver')
  })
})

describe('useCampaign', () => {
  it('fetches a single campaign by ID', async () => {
    const { result } = renderHook(() => useCampaign('camp-001'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveProperty('id', 'camp-001')
    expect(result.current.data).toHaveProperty('name', 'Lost Mine of Phandelver')
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useCampaign(null), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateCampaign', () => {
  it('creates a campaign', async () => {
    const { result } = renderHook(() => useCreateCampaign(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      const campaign = await result.current.mutateAsync({
        name: 'New Campaign',
        description: 'A brave new adventure',
      })
      expect(campaign).toHaveProperty('id', 'camp-new-001')
      expect(campaign).toHaveProperty('name', 'New Campaign')
    })
  })
})

describe('useUpdateCampaign', () => {
  it('updates a campaign', async () => {
    const { result } = renderHook(() => useUpdateCampaign(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      const updated = await result.current.mutateAsync({
        id: 'camp-001',
        data: { name: 'Updated Campaign Name' },
      })
      expect(updated).toHaveProperty('name', 'Updated Campaign Name')
    })
  })
})

describe('useDeleteCampaign', () => {
  it('deletes a campaign', async () => {
    const { result } = renderHook(() => useDeleteCampaign(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync('camp-001')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useJoinCampaign', () => {
  it('joins a campaign with valid join code', async () => {
    const { result } = renderHook(() => useJoinCampaign(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({
        campaignId: 'camp-001',
        joinCode: 'ABC123',
        characterId: 'char-001',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('fails to join with invalid join code', async () => {
    const { result } = renderHook(() => useJoinCampaign(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      try {
        await result.current.mutateAsync({
          campaignId: 'camp-001',
          joinCode: 'WRONG',
          characterId: 'char-001',
        })
      } catch {
        // Expected error
      }
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useJoinedCampaigns', () => {
  it('fetches joined campaigns', async () => {
    const { result } = renderHook(() => useJoinedCampaigns(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeInstanceOf(Array)
  })
})

describe('useCampaignParty', () => {
  it('fetches party members for a campaign', async () => {
    const { result } = renderHook(() => useCampaignParty('camp-001'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeInstanceOf(Array)
    expect(result.current.data!.length).toBeGreaterThan(0)
    expect(result.current.data![0]).toHaveProperty('name')
    expect(result.current.data![0]).toHaveProperty('race')
    expect(result.current.data![0]).toHaveProperty('class')
    expect(result.current.data![0]).toHaveProperty('hp')
    expect(result.current.data![0]).toHaveProperty('ac')
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useCampaignParty(null), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useLeaveCampaign', () => {
  it('leaves a campaign successfully', async () => {
    const { result } = renderHook(() => useLeaveCampaign(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync('camp-001')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
