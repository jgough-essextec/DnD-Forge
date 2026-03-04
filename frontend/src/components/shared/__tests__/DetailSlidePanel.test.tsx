// =============================================================================
// Tests for DetailSlidePanel
// =============================================================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DetailSlidePanel } from '@/components/shared/DetailSlidePanel'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  title: 'Test Panel',
  children: <p>Panel content here</p>,
}

describe('DetailSlidePanel', () => {
  it('renders title and children when open', async () => {
    render(<DetailSlidePanel {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getAllByText('Test Panel').length).toBeGreaterThan(0)
    })
    expect(screen.getAllByText('Panel content here').length).toBeGreaterThan(0)
  })

  it('does not render content when closed', () => {
    render(<DetailSlidePanel {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Test Panel')).not.toBeInTheDocument()
    expect(screen.queryByText('Panel content here')).not.toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<DetailSlidePanel {...defaultProps} onClose={onClose} />)

    const backdrop = screen.getByTestId('panel-backdrop')
    await user.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<DetailSlidePanel {...defaultProps} onClose={onClose} />)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<DetailSlidePanel {...defaultProps} onClose={onClose} />)

    const closeButtons = screen.getAllByLabelText('Close panel')
    await user.click(closeButtons[0])
    expect(onClose).toHaveBeenCalled()
  })
})
