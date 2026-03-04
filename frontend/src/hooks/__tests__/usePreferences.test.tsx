import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePreferences, useUpdatePreferences } from '@/hooks/usePreferences'
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

describe('usePreferences', () => {
  it('fetches user preferences', async () => {
    const { result } = renderHook(() => usePreferences(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveProperty('theme', 'dark')
    expect(result.current.data).toHaveProperty('autoSaveEnabled', true)
    expect(result.current.data).toHaveProperty('lastActiveCharacterId', 'char-001')
  })
})

describe('useUpdatePreferences', () => {
  it('updates preferences', async () => {
    const { result } = renderHook(() => useUpdatePreferences(), {
      wrapper: createWrapper(),
    })

    let updated: unknown
    await act(async () => {
      updated = await result.current.mutateAsync({ theme: 'light' })
    })

    expect(updated).toHaveProperty('theme', 'light')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('updates autoSaveEnabled preference', async () => {
    const { result } = renderHook(() => useUpdatePreferences(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      const updated = await result.current.mutateAsync({ autoSaveEnabled: false })
      expect(updated).toHaveProperty('autoSaveEnabled', false)
    })
  })
})
