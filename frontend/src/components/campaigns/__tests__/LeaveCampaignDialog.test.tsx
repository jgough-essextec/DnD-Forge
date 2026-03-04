import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LeaveCampaignDialog } from '../LeaveCampaignDialog'

describe('LeaveCampaignDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    campaignName: 'Lost Mine of Phandelver',
  }

  beforeEach(() => {
    defaultProps.onClose.mockClear()
    defaultProps.onConfirm.mockClear()
  })

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <LeaveCampaignDialog {...defaultProps} isOpen={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders campaign name in confirmation message', () => {
    render(<LeaveCampaignDialog {...defaultProps} />)
    expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to leave/)).toBeInTheDocument()
  })

  it('calls onConfirm when "Leave Campaign" is clicked', () => {
    render(<LeaveCampaignDialog {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /leave campaign/i }))
    expect(defaultProps.onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onClose when "Cancel" is clicked', () => {
    render(<LeaveCampaignDialog {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(defaultProps.onClose).toHaveBeenCalledOnce()
  })

  it('shows "Leaving..." when isLeaving is true', () => {
    render(<LeaveCampaignDialog {...defaultProps} isLeaving={true} />)
    expect(screen.getByText('Leaving...')).toBeInTheDocument()
    // The button text changes but the heading still says "Leave Campaign"
    expect(screen.getByRole('button', { name: /leaving/i })).toBeDisabled()
  })

  it('has alertdialog role for accessibility', () => {
    render(<LeaveCampaignDialog {...defaultProps} />)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})
