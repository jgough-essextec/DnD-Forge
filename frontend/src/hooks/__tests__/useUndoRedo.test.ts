import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import type { Character } from '@/types/character'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSnapshot(overrides: Partial<Character> = {}): Partial<Character> {
  return { name: 'Test', level: 1, ...overrides }
}

function fireKeyDown(key: string, options: Partial<KeyboardEvent> = {}) {
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

describe('useUndoRedo', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ---- Unit Tests ----

  it('should push previous state onto undo stack', () => {
    const { result } = renderHook(() => useUndoRedo({ enabled: true }))

    act(() => {
      result.current.pushSnapshot(makeSnapshot({ name: 'State 1' }))
    })

    expect(result.current.undoCount).toBe(1)
    expect(result.current.canUndo).toBe(true)
  })

  it('should pop undo stack and push to redo stack on undo', () => {
    const onRestore = vi.fn()
    const { result } = renderHook(() =>
      useUndoRedo({ enabled: true, onRestore })
    )

    act(() => {
      result.current.pushSnapshot(makeSnapshot({ name: 'State 1' }))
      result.current.pushSnapshot(makeSnapshot({ name: 'State 2' }))
    })

    expect(result.current.undoCount).toBe(2)

    act(() => {
      result.current.undo()
    })

    expect(result.current.undoCount).toBe(1)
    expect(result.current.redoCount).toBe(1)
    expect(result.current.canRedo).toBe(true)
    expect(onRestore).toHaveBeenCalledWith(makeSnapshot({ name: 'State 2' }))
  })

  it('should clear redo stack when new changes are made after undoing', () => {
    const { result } = renderHook(() =>
      useUndoRedo({ enabled: true, onRestore: vi.fn() })
    )

    act(() => {
      result.current.pushSnapshot(makeSnapshot({ name: 'State 1' }))
      result.current.pushSnapshot(makeSnapshot({ name: 'State 2' }))
    })

    act(() => {
      result.current.undo()
    })

    expect(result.current.canRedo).toBe(true)

    // New change after undo should clear redo
    act(() => {
      result.current.pushSnapshot(makeSnapshot({ name: 'State 3' }))
    })

    expect(result.current.canRedo).toBe(false)
    expect(result.current.redoCount).toBe(0)
  })

  it('should enforce maximum stack depth of 50 states', () => {
    const { result } = renderHook(() =>
      useUndoRedo({ enabled: true, maxSnapshots: 50 })
    )

    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.pushSnapshot(makeSnapshot({ name: `State ${i}` }))
      }
    })

    expect(result.current.undoCount).toBe(50)
  })

  it('should discard oldest state when undo stack exceeds max depth', () => {
    const { result } = renderHook(() =>
      useUndoRedo({ enabled: true, maxSnapshots: 3 })
    )

    act(() => {
      result.current.pushSnapshot(makeSnapshot({ name: 'A' }))
      result.current.pushSnapshot(makeSnapshot({ name: 'B' }))
      result.current.pushSnapshot(makeSnapshot({ name: 'C' }))
      result.current.pushSnapshot(makeSnapshot({ name: 'D' }))
    })

    expect(result.current.undoCount).toBe(3)
  })

  // ---- Functional Tests ----

  it('should start with empty stacks', () => {
    const { result } = renderHook(() => useUndoRedo({ enabled: true }))

    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
    expect(result.current.undoCount).toBe(0)
    expect(result.current.redoCount).toBe(0)
  })

  it('should restore previous state when undo is called', () => {
    const onRestore = vi.fn()
    const { result } = renderHook(() =>
      useUndoRedo({ enabled: true, onRestore })
    )

    const state1 = makeSnapshot({ name: 'Before' })
    const state2 = makeSnapshot({ name: 'After' })

    act(() => {
      result.current.pushSnapshot(state1)
      result.current.pushSnapshot(state2)
    })

    act(() => {
      result.current.undo()
    })

    expect(onRestore).toHaveBeenCalledWith(state2)
  })

  it('should re-apply undone state when redo is called', () => {
    const onRestore = vi.fn()
    const { result } = renderHook(() =>
      useUndoRedo({ enabled: true, onRestore })
    )

    act(() => {
      result.current.pushSnapshot(makeSnapshot({ name: 'State 1' }))
      result.current.pushSnapshot(makeSnapshot({ name: 'State 2' }))
    })

    act(() => {
      result.current.undo()
    })

    act(() => {
      result.current.redo()
    })

    // Redo should restore the state that was undone
    expect(onRestore).toHaveBeenCalledTimes(2)
  })

  it('should trigger undo on Ctrl+Z keyboard shortcut', () => {
    const onRestore = vi.fn()
    const { result } = renderHook(() =>
      useUndoRedo({ enabled: true, onRestore })
    )

    act(() => {
      result.current.pushSnapshot(makeSnapshot({ name: 'State 1' }))
    })

    act(() => {
      fireKeyDown('z', { ctrlKey: true })
    })

    expect(onRestore).toHaveBeenCalled()
    expect(result.current.undoCount).toBe(0)
  })

  it('should trigger redo on Ctrl+Shift+Z keyboard shortcut', () => {
    const onRestore = vi.fn()
    const { result } = renderHook(() =>
      useUndoRedo({ enabled: true, onRestore })
    )

    act(() => {
      result.current.pushSnapshot(makeSnapshot({ name: 'State 1' }))
    })

    // Undo first
    act(() => {
      result.current.undo()
    })

    expect(result.current.canRedo).toBe(true)

    act(() => {
      fireKeyDown('z', { ctrlKey: true, shiftKey: true })
    })

    expect(result.current.redoCount).toBe(0)
    expect(result.current.undoCount).toBe(1)
  })

  it('should clear stacks when exiting edit mode (enabled becomes false)', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useUndoRedo({ enabled }),
      { initialProps: { enabled: true } }
    )

    act(() => {
      result.current.pushSnapshot(makeSnapshot({ name: 'State 1' }))
      result.current.pushSnapshot(makeSnapshot({ name: 'State 2' }))
    })

    expect(result.current.undoCount).toBe(2)

    rerender({ enabled: false })

    expect(result.current.undoCount).toBe(0)
    expect(result.current.redoCount).toBe(0)
  })

  it('should not push snapshots when disabled', () => {
    const { result } = renderHook(() =>
      useUndoRedo({ enabled: false })
    )

    act(() => {
      result.current.pushSnapshot(makeSnapshot({ name: 'State 1' }))
    })

    expect(result.current.undoCount).toBe(0)
  })

  it('should not trigger undo/redo when disabled', () => {
    const onRestore = vi.fn()
    const { result } = renderHook(() =>
      useUndoRedo({ enabled: false, onRestore })
    )

    act(() => {
      result.current.undo()
    })

    expect(onRestore).not.toHaveBeenCalled()

    act(() => {
      result.current.redo()
    })

    expect(onRestore).not.toHaveBeenCalled()
  })

  it('should clear history explicitly', () => {
    const { result } = renderHook(() =>
      useUndoRedo({ enabled: true, onRestore: vi.fn() })
    )

    act(() => {
      result.current.pushSnapshot(makeSnapshot({ name: 'State 1' }))
      result.current.pushSnapshot(makeSnapshot({ name: 'State 2' }))
    })

    act(() => {
      result.current.undo()
    })

    expect(result.current.undoCount).toBe(1)
    expect(result.current.redoCount).toBe(1)

    act(() => {
      result.current.clearHistory()
    })

    expect(result.current.undoCount).toBe(0)
    expect(result.current.redoCount).toBe(0)
  })
})
