import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useCreateCharacter,
  useUpdateCharacter,
  useDeleteCharacter,
} from '@/hooks/useCharacterMutations'
import type { CreateCharacterData } from '@/types/character'
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

describe('useCreateCharacter', () => {
  it('creates a character and returns the result', async () => {
    const { result } = renderHook(() => useCreateCharacter(), {
      wrapper: createWrapper(),
    })

    let character: unknown
    await act(async () => {
      character = await result.current.mutateAsync({
        name: 'New Hero',
        playerName: 'Tester',
      } as CreateCharacterData)
    })

    expect(character).toHaveProperty('id', 'char-new-001')
    expect(character).toHaveProperty('name', 'New Hero')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateCharacter', () => {
  it('updates a character and returns the updated data', async () => {
    const { result } = renderHook(() => useUpdateCharacter(), {
      wrapper: createWrapper(),
    })

    let updated: unknown
    await act(async () => {
      updated = await result.current.mutateAsync({
        id: 'char-001',
        data: { name: 'Updated Name' },
      })
    })

    expect(updated).toHaveProperty('name', 'Updated Name')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteCharacter', () => {
  it('deletes a character successfully', async () => {
    const { result } = renderHook(() => useDeleteCharacter(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync('char-001')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
