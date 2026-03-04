import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHighContrast } from '@/hooks/useHighContrast'

// ---------------------------------------------------------------------------
// Mock the preferences hooks
// ---------------------------------------------------------------------------

const mockMutate = vi.fn()

vi.mock('@/hooks/usePreferences', () => ({
  usePreferences: () => ({
    data: undefined,
    isLoading: false,
  }),
  useUpdatePreferences: () => ({
    mutate: mockMutate,
  }),
}))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useHighContrast', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('high-contrast')
    mockMutate.mockClear()
  })

  afterEach(() => {
    document.documentElement.classList.remove('high-contrast')
    vi.restoreAllMocks()
  })

  it('should default to false (high contrast off)', () => {
    const { result } = renderHook(() => useHighContrast())
    expect(result.current.highContrast).toBe(false)
  })

  it('should toggle high contrast mode on', () => {
    const { result } = renderHook(() => useHighContrast())

    act(() => {
      result.current.toggleHighContrast()
    })

    expect(result.current.highContrast).toBe(true)
  })

  it('should toggle high contrast mode off after on', () => {
    const { result } = renderHook(() => useHighContrast())

    act(() => {
      result.current.toggleHighContrast()
    })
    expect(result.current.highContrast).toBe(true)

    act(() => {
      result.current.toggleHighContrast()
    })
    expect(result.current.highContrast).toBe(false)
  })

  it('should set high contrast explicitly', () => {
    const { result } = renderHook(() => useHighContrast())

    act(() => {
      result.current.setHighContrast(true)
    })
    expect(result.current.highContrast).toBe(true)

    act(() => {
      result.current.setHighContrast(false)
    })
    expect(result.current.highContrast).toBe(false)
  })

  it('should apply .high-contrast class to document element when enabled', () => {
    const { result } = renderHook(() => useHighContrast())

    act(() => {
      result.current.setHighContrast(true)
    })

    expect(
      document.documentElement.classList.contains('high-contrast')
    ).toBe(true)
  })

  it('should remove .high-contrast class from document element when disabled', () => {
    const { result } = renderHook(() => useHighContrast())

    act(() => {
      result.current.setHighContrast(true)
    })
    expect(
      document.documentElement.classList.contains('high-contrast')
    ).toBe(true)

    act(() => {
      result.current.setHighContrast(false)
    })
    expect(
      document.documentElement.classList.contains('high-contrast')
    ).toBe(false)
  })

  it('should persist high contrast preference via the API', () => {
    const { result } = renderHook(() => useHighContrast())

    act(() => {
      result.current.setHighContrast(true)
    })

    expect(mockMutate).toHaveBeenCalledWith({ highContrast: true })
  })

  it('should persist turning off high contrast via the API', () => {
    const { result } = renderHook(() => useHighContrast())

    act(() => {
      result.current.setHighContrast(true)
    })
    mockMutate.mockClear()

    act(() => {
      result.current.setHighContrast(false)
    })

    expect(mockMutate).toHaveBeenCalledWith({ highContrast: false })
  })

  it('should call mutate on toggle', () => {
    const { result } = renderHook(() => useHighContrast())

    act(() => {
      result.current.toggleHighContrast()
    })

    expect(mockMutate).toHaveBeenCalledWith({ highContrast: true })
  })
})
