import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useKeyboardShortcuts,
  isTypingTarget,
  DEFAULT_SHORTCUT_DEFINITIONS,
  createShortcut,
  type KeyboardShortcut,
} from '@/hooks/useKeyboardShortcuts'

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

function createTextInput(): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'text'
  document.body.appendChild(input)
  return input
}

function createTextarea(): HTMLTextAreaElement {
  const textarea = document.createElement('textarea')
  document.body.appendChild(textarea)
  return textarea
}

function cleanup() {
  document.body.innerHTML = ''
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useKeyboardShortcuts', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  // ---- Unit Tests ----

  describe('DEFAULT_SHORTCUT_DEFINITIONS', () => {
    it('should define all 9 keyboard shortcuts with correct key bindings and descriptions', () => {
      expect(DEFAULT_SHORTCUT_DEFINITIONS).toHaveLength(9)

      const keys = DEFAULT_SHORTCUT_DEFINITIONS.map((s) => s.key)
      expect(keys).toContain('d')
      expect(keys).toContain('r')
      expect(keys).toContain('e')
      expect(keys).toContain('s')
      expect(keys).toContain('l')
      expect(keys).toContain('n')
      expect(keys).toContain('/')
      expect(keys).toContain('Escape')
      expect(keys).toContain('?')

      // Each shortcut has a description and group
      for (const shortcut of DEFAULT_SHORTCUT_DEFINITIONS) {
        expect(shortcut.description).toBeTruthy()
        expect(shortcut.group).toBeTruthy()
      }
    })

    it('should have shortcuts grouped correctly', () => {
      const globalShortcuts = DEFAULT_SHORTCUT_DEFINITIONS.filter(
        (s) => s.group === 'Global'
      )
      const charSheetShortcuts = DEFAULT_SHORTCUT_DEFINITIONS.filter(
        (s) => s.group === 'Character Sheet'
      )
      const combatShortcuts = DEFAULT_SHORTCUT_DEFINITIONS.filter(
        (s) => s.group === 'Combat'
      )

      expect(globalShortcuts.length).toBeGreaterThan(0)
      expect(charSheetShortcuts.length).toBeGreaterThan(0)
      expect(combatShortcuts.length).toBeGreaterThan(0)
    })
  })

  describe('isTypingTarget', () => {
    it('should return true for text inputs', () => {
      const input = createTextInput()
      expect(isTypingTarget(input)).toBe(true)
    })

    it('should return true for textareas', () => {
      const textarea = createTextarea()
      expect(isTypingTarget(textarea)).toBe(true)
    })

    it('should return true for contenteditable elements', () => {
      const div = document.createElement('div')
      div.contentEditable = 'true'
      document.body.appendChild(div)
      expect(isTypingTarget(div)).toBe(true)
    })

    it('should return true for select elements', () => {
      const select = document.createElement('select')
      document.body.appendChild(select)
      expect(isTypingTarget(select)).toBe(true)
    })

    it('should return false for buttons', () => {
      const button = document.createElement('button')
      document.body.appendChild(button)
      expect(isTypingTarget(button)).toBe(false)
    })

    it('should return false for regular divs', () => {
      const div = document.createElement('div')
      document.body.appendChild(div)
      expect(isTypingTarget(div)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isTypingTarget(null)).toBe(false)
    })

    it('should return false for checkbox inputs', () => {
      const input = document.createElement('input')
      input.type = 'checkbox'
      document.body.appendChild(input)
      expect(isTypingTarget(input)).toBe(false)
    })

    it('should return true for search inputs', () => {
      const input = document.createElement('input')
      input.type = 'search'
      document.body.appendChild(input)
      expect(isTypingTarget(input)).toBe(true)
    })

    it('should return true for email inputs', () => {
      const input = document.createElement('input')
      input.type = 'email'
      document.body.appendChild(input)
      expect(isTypingTarget(input)).toBe(true)
    })
  })

  describe('createShortcut', () => {
    it('should merge a definition with a handler', () => {
      const handler = vi.fn()
      const shortcut = createShortcut(
        { key: 'd', description: 'Open dice roller', group: 'Global' },
        handler
      )

      expect(shortcut.key).toBe('d')
      expect(shortcut.description).toBe('Open dice roller')
      expect(shortcut.group).toBe('Global')
      expect(shortcut.handler).toBe(handler)
    })
  })

  // ---- Hook functional tests ----

  describe('hook behavior', () => {
    it('should fire handler when a registered key is pressed', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'd', description: 'Dice', group: 'Global', handler },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        fireKeyDown('d')
      })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should not fire handler when a different key is pressed', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'd', description: 'Dice', group: 'Global', handler },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        fireKeyDown('x')
      })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should prevent keyboard shortcuts from firing when an input is focused', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'd', description: 'Dice', group: 'Global', handler },
      ]

      const input = createTextInput()
      input.focus()

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        fireKeyDown('d')
      })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should prevent keyboard shortcuts from firing when a textarea is focused', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'd', description: 'Dice', group: 'Global', handler },
      ]

      const textarea = createTextarea()
      textarea.focus()

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        fireKeyDown('d')
      })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should support multiple shortcuts at once', () => {
      const diceHandler = vi.fn()
      const rollHandler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'd', description: 'Dice', group: 'Global', handler: diceHandler },
        { key: 'r', description: 'Roll', group: 'Global', handler: rollHandler },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        fireKeyDown('d')
      })
      expect(diceHandler).toHaveBeenCalledTimes(1)
      expect(rollHandler).not.toHaveBeenCalled()

      act(() => {
        fireKeyDown('r')
      })
      expect(rollHandler).toHaveBeenCalledTimes(1)
    })

    it('should not fire when enabled is false', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'd', description: 'Dice', group: 'Global', handler },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts, { enabled: false }))

      act(() => {
        fireKeyDown('d')
      })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should not fire simple key shortcuts when Ctrl is held', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'd', description: 'Dice', group: 'Global', handler },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        fireKeyDown('d', { ctrlKey: true })
      })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should fire Escape shortcut even when Ctrl is not held', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'Escape', description: 'Close', group: 'Global', handler },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        fireKeyDown('Escape')
      })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle case-insensitive key matching', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'd', description: 'Dice', group: 'Global', handler },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        fireKeyDown('D')
      })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle the ? key (shift required on most keyboards)', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: '?', description: 'Help', group: 'Global', handler },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        fireKeyDown('?', { shiftKey: true })
      })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle the / key for focusing search', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: '/', description: 'Search', group: 'Global', handler },
      ]

      renderHook(() => useKeyboardShortcuts(shortcuts))

      act(() => {
        fireKeyDown('/')
      })

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should clean up event listener on unmount', () => {
      const handler = vi.fn()
      const shortcuts: KeyboardShortcut[] = [
        { key: 'd', description: 'Dice', group: 'Global', handler },
      ]

      const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts))

      unmount()

      act(() => {
        fireKeyDown('d')
      })

      expect(handler).not.toHaveBeenCalled()
    })
  })
})
