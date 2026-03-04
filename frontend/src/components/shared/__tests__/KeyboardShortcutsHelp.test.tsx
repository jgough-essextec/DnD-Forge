import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KeyboardShortcutsHelp } from '@/components/shared/KeyboardShortcutsHelp'
import { DEFAULT_SHORTCUT_DEFINITIONS } from '@/hooks/useKeyboardShortcuts'

describe('KeyboardShortcutsHelp', () => {
  it('should not render when isOpen is false', () => {
    render(<KeyboardShortcutsHelp isOpen={false} onClose={vi.fn()} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render a dialog when isOpen is true', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should have role="dialog" with aria-modal and aria-labelledby', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={vi.fn()} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'keyboard-shortcuts-title')
  })

  it('should display the title "Keyboard Shortcuts"', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })

  it('should display all default shortcut descriptions', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={vi.fn()} />)

    for (const shortcut of DEFAULT_SHORTCUT_DEFINITIONS) {
      expect(screen.getByText(shortcut.description)).toBeInTheDocument()
    }
  })

  it('should display shortcut groups', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('Global')).toBeInTheDocument()
    expect(screen.getByText('Character Sheet')).toBeInTheDocument()
    expect(screen.getByText('Combat')).toBeInTheDocument()
  })

  it('should display extra shortcuts when provided', () => {
    render(
      <KeyboardShortcutsHelp
        isOpen={true}
        onClose={vi.fn()}
        extraShortcuts={[
          { key: 'x', description: 'Custom action', group: 'Custom' },
        ]}
      />
    )

    expect(screen.getByText('Custom action')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('should call onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<KeyboardShortcutsHelp isOpen={true} onClose={onClose} />)

    const closeButton = screen.getByLabelText('Close keyboard shortcuts dialog')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(<KeyboardShortcutsHelp isOpen={true} onClose={onClose} />)

    const dialog = screen.getByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<KeyboardShortcutsHelp isOpen={true} onClose={onClose} />)

    const backdrop = screen.getByTestId('keyboard-shortcuts-backdrop')
    fireEvent.click(backdrop)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose when dialog content is clicked', () => {
    const onClose = vi.fn()
    render(<KeyboardShortcutsHelp isOpen={true} onClose={onClose} />)

    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('should display a note that shortcuts are disabled in text fields', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={vi.fn()} />)

    expect(
      screen.getByText('Shortcuts are disabled when typing in text fields')
    ).toBeInTheDocument()
  })

  it('should format key names correctly (Escape -> Esc)', () => {
    render(<KeyboardShortcutsHelp isOpen={true} onClose={vi.fn()} />)

    // The Escape shortcut should render as "Esc"
    expect(screen.getByText('Esc')).toBeInTheDocument()
  })
})
