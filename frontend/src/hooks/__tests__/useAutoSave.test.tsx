import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAutoSave } from '@/hooks/useAutoSave'
import * as charactersApi from '@/api/characters'
import type { Character } from '@/types/character'
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

describe('useAutoSave', () => {
  let updateSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    updateSpy = vi.spyOn(charactersApi, 'updateCharacter').mockResolvedValue({
      id: 'char-001',
      name: 'Test',
    } as Character)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('starts in idle status', () => {
    const { result } = renderHook(
      () => useAutoSave('char-001', {}),
      { wrapper: createWrapper() }
    )

    expect(result.current.status).toBe('idle')
    expect(result.current.lastSavedAt).toBeNull()
  })

  it('does not save when character data is empty object', async () => {
    renderHook(
      () => useAutoSave('char-001', {}),
      { wrapper: createWrapper() }
    )

    await vi.advanceTimersByTimeAsync(5000)

    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('debounces saves by 2 seconds', async () => {
    renderHook(
      () => useAutoSave('char-001', { name: 'Updated' }),
      { wrapper: createWrapper() }
    )

    // Should not call API before 2 seconds
    expect(updateSpy).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1999)
    expect(updateSpy).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    // Now the timer should have fired
    expect(updateSpy).toHaveBeenCalledTimes(1)
    expect(updateSpy).toHaveBeenCalledWith('char-001', { name: 'Updated' })
  })

  it('transitions to saved status after successful save', async () => {
    const { result } = renderHook(
      () => useAutoSave('char-001', { name: 'Save Test' }),
      { wrapper: createWrapper() }
    )

    await vi.advanceTimersByTimeAsync(2000)

    await waitFor(() => expect(result.current.status).toBe('saved'))
    expect(result.current.lastSavedAt).toBeInstanceOf(Date)
  })

  it('transitions to error status on API failure', async () => {
    updateSpy.mockRejectedValueOnce(new Error('Server error'))

    const { result } = renderHook(
      () => useAutoSave('char-001', { name: 'Fail Test' }),
      { wrapper: createWrapper() }
    )

    await vi.advanceTimersByTimeAsync(2000)

    await waitFor(() => expect(result.current.status).toBe('error'))
  })
})
