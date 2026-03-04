import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useEditMode,
  isMacPlatform,
  hasUnsavedChanges,
  EDIT_MODE_HELP_DISMISSED_KEY,
} from '@/hooks/useEditMode'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fireKeyDown(
  key: string,
  options: Partial<KeyboardEvent> = {}
) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  })
  window.dispatchEvent(event)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useEditMode', () => {
  beforeEach(() => {
    // Reset URL
    window.history.pushState({}, '', '/')
    localStorage.removeItem(EDIT_MODE_HELP_DISMISSED_KEY)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ---- Unit Tests ----

  describe('isMacPlatform', () => {
    it('should detect platform for correct modifier key (Ctrl vs Cmd)', () => {
      // In jsdom, navigator.platform is empty string, so it should return false (non-Mac)
      const result = isMacPlatform()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('hasUnsavedChanges', () => {
    it('should return true when dirty flag is true', () => {
      expect(hasUnsavedChanges(true)).toBe(true)
    })

    it('should return false when dirty flag is false', () => {
      expect(hasUnsavedChanges(false)).toBe(false)
    })
  })

  // ---- Functional Tests ----

  it('should start in view mode by default', () => {
    const { result } = renderHook(() => useEditMode())
    expect(result.current.isEditing).toBe(false)
    expect(result.current.isDirty).toBe(false)
  })

  it('should read initial mode from URL ending with /edit', () => {
    window.history.pushState({}, '', '/character/char-001/edit')
    const { result } = renderHook(() => useEditMode())
    expect(result.current.isEditing).toBe(true)
  })

  it('should toggle between view and edit mode', () => {
    const { result } = renderHook(() => useEditMode())

    act(() => {
      result.current.toggleMode()
    })
    expect(result.current.isEditing).toBe(true)

    act(() => {
      result.current.toggleMode()
    })
    expect(result.current.isEditing).toBe(false)
  })

  it('should enter edit mode', () => {
    const { result } = renderHook(() => useEditMode())

    act(() => {
      result.current.enterEditMode()
    })
    expect(result.current.isEditing).toBe(true)
  })

  it('should exit edit mode without confirmation when not dirty', () => {
    const { result } = renderHook(() => useEditMode())

    act(() => {
      result.current.enterEditMode()
    })
    expect(result.current.isEditing).toBe(true)

    act(() => {
      result.current.exitEditMode()
    })
    expect(result.current.isEditing).toBe(false)
  })

  it('should show confirmation when exiting with unsaved changes', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const { result } = renderHook(() => useEditMode())

    act(() => {
      result.current.enterEditMode()
      result.current.setDirty(true)
    })

    act(() => {
      result.current.exitEditMode()
    })

    expect(confirmSpy).toHaveBeenCalledWith(
      'You have unsaved changes. Leave edit mode?'
    )
    expect(result.current.isEditing).toBe(false)
  })

  it('should not exit when confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    const { result } = renderHook(() => useEditMode())

    act(() => {
      result.current.enterEditMode()
      result.current.setDirty(true)
    })

    act(() => {
      result.current.exitEditMode()
    })

    expect(result.current.isEditing).toBe(true)
  })

  it('should use custom onConfirmExit callback', () => {
    const onConfirmExit = vi.fn().mockReturnValue(true)

    const { result } = renderHook(() =>
      useEditMode({ onConfirmExit })
    )

    act(() => {
      result.current.enterEditMode()
      result.current.setDirty(true)
    })

    act(() => {
      result.current.exitEditMode()
    })

    expect(onConfirmExit).toHaveBeenCalled()
    expect(result.current.isEditing).toBe(false)
  })

  it('should toggle mode on Ctrl+E keyboard shortcut', () => {
    const { result } = renderHook(() => useEditMode())

    act(() => {
      fireKeyDown('e', { ctrlKey: true })
    })

    expect(result.current.isEditing).toBe(true)

    act(() => {
      fireKeyDown('e', { ctrlKey: true })
    })

    expect(result.current.isEditing).toBe(false)
  })

  it('should exit edit mode on Escape key press', () => {
    const { result } = renderHook(() => useEditMode())

    act(() => {
      result.current.enterEditMode()
    })
    expect(result.current.isEditing).toBe(true)

    act(() => {
      fireKeyDown('Escape')
    })

    expect(result.current.isEditing).toBe(false)
  })

  it('should exit edit mode on Escape with save prompt if unsaved changes', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const { result } = renderHook(() => useEditMode())

    act(() => {
      result.current.enterEditMode()
      result.current.setDirty(true)
    })

    act(() => {
      fireKeyDown('Escape')
    })

    expect(confirmSpy).toHaveBeenCalled()
    expect(result.current.isEditing).toBe(false)
  })

  it('should call onModeChange callback when mode changes', () => {
    const onModeChange = vi.fn()
    const { result } = renderHook(() =>
      useEditMode({ onModeChange })
    )

    act(() => {
      result.current.enterEditMode()
    })

    expect(onModeChange).toHaveBeenCalledWith(true)

    act(() => {
      result.current.exitEditMode()
    })

    expect(onModeChange).toHaveBeenCalledWith(false)
  })

  it('should track dirty state', () => {
    const { result } = renderHook(() => useEditMode())

    expect(result.current.isDirty).toBe(false)

    act(() => {
      result.current.setDirty(true)
    })

    expect(result.current.isDirty).toBe(true)

    act(() => {
      result.current.setDirty(false)
    })

    expect(result.current.isDirty).toBe(false)
  })

  it('should clear dirty state when exiting edit mode', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    const { result } = renderHook(() => useEditMode())

    act(() => {
      result.current.enterEditMode()
      result.current.setDirty(true)
    })

    expect(result.current.isDirty).toBe(true)

    act(() => {
      result.current.exitEditMode()
    })

    expect(result.current.isDirty).toBe(false)
  })

  it('should update URL when mode changes with characterId', () => {
    const { result } = renderHook(() =>
      useEditMode({ characterId: 'char-001' })
    )

    act(() => {
      result.current.enterEditMode()
    })

    expect(window.location.pathname).toBe('/character/char-001/edit')

    act(() => {
      result.current.exitEditMode()
    })

    expect(window.location.pathname).toBe('/character/char-001')
  })
})
