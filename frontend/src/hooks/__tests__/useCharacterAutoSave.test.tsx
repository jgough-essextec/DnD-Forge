import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Character } from '@/types/character'
import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Mock useUpdateCharacter at module level (must be before import of hook)
// ---------------------------------------------------------------------------

const mockMutateAsync = vi.fn()

// Stable mock result object so the hook sees the same reference across renders.
// Only mutateAsync is a live vi.fn() that can be reconfigured per test.
const stableMutationResult = {
  mutateAsync: mockMutateAsync,
  mutate: vi.fn(),
  reset: vi.fn(),
  isPending: false,
  isSuccess: false,
  isError: false,
  isIdle: true,
  data: undefined,
  error: null,
  status: 'idle' as const,
}

vi.mock('@/hooks/useCharacterMutations', () => ({
  useUpdateCharacter: () => stableMutationResult,
  useCreateCharacter: vi.fn(),
  useDeleteCharacter: vi.fn(),
}))

// Must import AFTER vi.mock declaration (vitest hoists vi.mock)
import { useCharacterAutoSave, serializeForEmergencySave } from '@/hooks/useCharacterAutoSave'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useCharacterAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    sessionStorage.clear()
    mockMutateAsync.mockReset()
    mockMutateAsync.mockResolvedValue({
      id: 'char-001',
      name: 'Test',
      version: 4,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ---- Unit Tests ----

  it('should debounce save calls at 500ms interval', async () => {
    renderHook(
      () => useCharacterAutoSave('char-001', { name: 'Updated' } as Partial<Character>),
      { wrapper: createWrapper() }
    )

    expect(mockMutateAsync).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(499)
    })
    expect(mockMutateAsync).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(mockMutateAsync).toHaveBeenCalledTimes(1)
  })

  it('should reset debounce timer when new changes occur before timer fires', async () => {
    const { rerender } = renderHook(
      ({ data }) => useCharacterAutoSave('char-001', data),
      {
        wrapper: createWrapper(),
        initialProps: { data: { name: 'First' } as Partial<Character> },
      }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(mockMutateAsync).not.toHaveBeenCalled()

    rerender({ data: { name: 'Second' } as Partial<Character> })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(mockMutateAsync).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })
    expect(mockMutateAsync).toHaveBeenCalledTimes(1)
    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'char-001',
      data: { name: 'Second' },
    })
  })

  it('should serialize character data for sessionStorage emergency save', () => {
    const data = { name: 'Test', level: 5 } as Partial<Character>
    const result = serializeForEmergencySave('char-001', data)
    const parsed = JSON.parse(result)

    expect(parsed.characterId).toBe('char-001')
    expect(parsed.data).toEqual(data)
    expect(parsed.timestamp).toBeDefined()
  })

  it('should start in idle status', () => {
    const { result } = renderHook(
      () => useCharacterAutoSave('char-001', {}),
      { wrapper: createWrapper() }
    )

    expect(result.current.status).toBe('idle')
    expect(result.current.lastSavedAt).toBeNull()
    expect(result.current.hasPendingChanges).toBe(false)
  })

  it('should not save when character data is empty', async () => {
    renderHook(
      () => useCharacterAutoSave('char-001', {}),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  // ---- Functional Tests ----

  it('should transition to saved status after successful save', async () => {
    const { result } = renderHook(
      () => useCharacterAutoSave('char-001', { name: 'Save Test' } as Partial<Character>),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    await waitFor(() => expect(result.current.status).toBe('saved'))
    expect(result.current.lastSavedAt).toBeInstanceOf(Date)
  })

  it('should show pending changes before debounce fires', () => {
    const { result } = renderHook(
      () => useCharacterAutoSave('char-001', { name: 'Pending' } as Partial<Character>),
      { wrapper: createWrapper() }
    )

    expect(result.current.hasPendingChanges).toBe(true)
    expect(result.current.status).toBe('idle')
  })

  it('should transition to saving status while write is in progress', async () => {
    let resolvePromise: (() => void) | undefined
    mockMutateAsync.mockImplementation(
      () => new Promise<void>((resolve) => { resolvePromise = resolve })
    )

    const { result } = renderHook(
      () => useCharacterAutoSave('char-001', { name: 'Saving' } as Partial<Character>),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    await waitFor(() => expect(result.current.status).toBe('saving'))

    // Clean up
    await act(async () => {
      resolvePromise?.()
    })
  })

  it('should transition to error status when API request fails with no retries', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(
      () =>
        useCharacterAutoSave('char-001', { name: 'Fail' } as Partial<Character>, {
          maxRetries: 0,
        }),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    await waitFor(() => expect(result.current.status).toBe('error'))
  })

  it('should trigger beforeunload warning when unsaved changes exist', () => {
    const { result } = renderHook(
      () => useCharacterAutoSave('char-001', { name: 'Unload Test' } as Partial<Character>),
      { wrapper: createWrapper() }
    )

    expect(result.current.hasPendingChanges).toBe(true)

    const event = new Event('beforeunload', { cancelable: true })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    window.dispatchEvent(event)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  it('should save to sessionStorage as emergency backup when API fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Server down'))

    renderHook(
      () =>
        useCharacterAutoSave(
          'char-001',
          { name: 'Emergency' } as Partial<Character>,
          { maxRetries: 0 }
        ),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    await waitFor(() => {
      const saved = sessionStorage.getItem('dnd-forge-emergency-save-char-001')
      expect(saved).not.toBeNull()
    })

    const parsed = JSON.parse(
      sessionStorage.getItem('dnd-forge-emergency-save-char-001')!
    )
    expect(parsed.characterId).toBe('char-001')
    expect(parsed.data.name).toBe('Emergency')
  })

  it('should allow manual retry after failure', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('Fail'))

    const { result } = renderHook(
      () =>
        useCharacterAutoSave(
          'char-001',
          { name: 'Retry Test' } as Partial<Character>,
          { maxRetries: 0 }
        ),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    await waitFor(() => expect(result.current.status).toBe('error'))

    mockMutateAsync.mockResolvedValueOnce({ id: 'char-001', version: 5 })

    await act(async () => {
      result.current.retry()
    })

    await waitFor(() => expect(result.current.status).toBe('saved'))
  })

  it('should respect configurable debounce interval', async () => {
    renderHook(
      () =>
        useCharacterAutoSave(
          'char-001',
          { name: 'Custom Debounce' } as Partial<Character>,
          { debounceMs: 1000 }
        ),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })
    expect(mockMutateAsync).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })
    expect(mockMutateAsync).toHaveBeenCalledTimes(1)
  })

  it('should not save when disabled', async () => {
    renderHook(
      () =>
        useCharacterAutoSave(
          'char-001',
          { name: 'Disabled' } as Partial<Character>,
          { enabled: false }
        ),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
