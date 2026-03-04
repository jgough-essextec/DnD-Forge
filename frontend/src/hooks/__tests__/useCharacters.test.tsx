import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCharacters, useCharacter } from '@/hooks/useCharacters'
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

describe('useCharacters', () => {
  it('fetches character summaries', async () => {
    const { result } = renderHook(() => useCharacters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeInstanceOf(Array)
    expect(result.current.data!.length).toBeGreaterThan(0)
    expect(result.current.data![0]).toHaveProperty('name', 'Thorn Ironforge')
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => useCharacters(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })
})

describe('useCharacter', () => {
  it('fetches a single character by ID', async () => {
    const { result } = renderHook(() => useCharacter('char-001'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveProperty('id', 'char-001')
    expect(result.current.data).toHaveProperty('name', 'Thorn Ironforge')
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useCharacter(null), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })

  it('does not fetch when id is empty string', () => {
    const { result } = renderHook(() => useCharacter(''), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })
})
