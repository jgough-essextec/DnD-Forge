import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BottomSheet } from '@/components/shared/BottomSheet'

describe('BottomSheet', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <BottomSheet isOpen={false} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>,
    )
    expect(screen.queryByTestId('bottom-sheet')).not.toBeInTheDocument()
  })

  it('renders content when isOpen is true', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <p>Sheet content</p>
      </BottomSheet>,
    )
    expect(screen.getByTestId('bottom-sheet')).toBeInTheDocument()
    expect(screen.getByText('Sheet content')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()} title="Edit HP">
        <p>Content</p>
      </BottomSheet>,
    )
    expect(screen.getByText('Edit HP')).toBeInTheDocument()
  })

  it('does not render title when not provided', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>,
    )
    expect(screen.queryByText('Edit HP')).not.toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet isOpen={true} onClose={onClose}>
        <p>Content</p>
      </BottomSheet>,
    )
    fireEvent.click(screen.getByTestId('bottom-sheet-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet isOpen={true} onClose={onClose}>
        <p>Content</p>
      </BottomSheet>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose for non-Escape keys', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet isOpen={true} onClose={onClose}>
        <p>Content</p>
      </BottomSheet>,
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders the drag handle', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>,
    )
    expect(screen.getByTestId('bottom-sheet-handle')).toBeInTheDocument()
  })

  it('has dialog role and aria-modal attribute', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </BottomSheet>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'Test')
  })

  it('uses custom testId when provided', () => {
    render(
      <BottomSheet isOpen={true} onClose={vi.fn()} testId="hp-bottom-sheet">
        <p>Content</p>
      </BottomSheet>,
    )
    expect(screen.getByTestId('hp-bottom-sheet')).toBeInTheDocument()
  })

  it('supports swipe-to-dismiss via touch events on handle', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet isOpen={true} onClose={onClose}>
        <p>Content</p>
      </BottomSheet>,
    )

    const handle = screen.getByTestId('bottom-sheet-handle')

    // Simulate a downward swipe exceeding the threshold (80px)
    fireEvent.touchStart(handle, {
      touches: [{ clientY: 100 }],
    })
    fireEvent.touchMove(handle, {
      touches: [{ clientY: 200 }],
    })
    fireEvent.touchEnd(handle)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not dismiss on short swipe below threshold', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet isOpen={true} onClose={onClose}>
        <p>Content</p>
      </BottomSheet>,
    )

    const handle = screen.getByTestId('bottom-sheet-handle')

    // Simulate a small swipe (under 80px threshold)
    fireEvent.touchStart(handle, {
      touches: [{ clientY: 100 }],
    })
    fireEvent.touchMove(handle, {
      touches: [{ clientY: 150 }],
    })
    fireEvent.touchEnd(handle)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not dismiss on upward swipe', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet isOpen={true} onClose={onClose}>
        <p>Content</p>
      </BottomSheet>,
    )

    const handle = screen.getByTestId('bottom-sheet-handle')

    // Simulate upward swipe
    fireEvent.touchStart(handle, {
      touches: [{ clientY: 200 }],
    })
    fireEvent.touchMove(handle, {
      touches: [{ clientY: 100 }],
    })
    fireEvent.touchEnd(handle)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('prevents body scroll when open', () => {
    const { unmount } = render(
      <BottomSheet isOpen={true} onClose={vi.fn()}>
        <p>Content</p>
      </BottomSheet>,
    )

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    // Should restore original overflow
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})
