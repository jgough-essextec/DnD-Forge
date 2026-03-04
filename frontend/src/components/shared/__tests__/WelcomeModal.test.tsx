/**
 * Tests for WelcomeModal component (Story 46.6)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WelcomeModal } from '@/components/shared/WelcomeModal'

describe('WelcomeModal', () => {
  it('should not render when isOpen is false', () => {
    render(<WelcomeModal isOpen={false} onDismiss={vi.fn()} />)
    expect(screen.queryByTestId('welcome-modal')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<WelcomeModal isOpen={true} onDismiss={vi.fn()} />)
    expect(screen.getByTestId('welcome-modal')).toBeInTheDocument()
  })

  it('should display welcome title', () => {
    render(<WelcomeModal isOpen={true} onDismiss={vi.fn()} />)
    expect(
      screen.getByText('Welcome to D&D Character Forge!'),
    ).toBeInTheDocument()
  })

  // -----------------------------------------------------------------------
  // Step 1: Create Characters
  // -----------------------------------------------------------------------

  it('should show step 1 (Create Characters) initially', () => {
    render(<WelcomeModal isOpen={true} onDismiss={vi.fn()} />)
    expect(screen.getByText('Create Characters')).toBeInTheDocument()
    expect(
      screen.getByText(/Build your hero with a guided wizard/),
    ).toBeInTheDocument()
  })

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------

  it('should navigate to step 2 on Next click', () => {
    render(<WelcomeModal isOpen={true} onDismiss={vi.fn()} />)
    fireEvent.click(screen.getByTestId('welcome-next-btn'))
    expect(screen.getByText('Use at the Table')).toBeInTheDocument()
  })

  it('should navigate to step 3 on two Next clicks', () => {
    render(<WelcomeModal isOpen={true} onDismiss={vi.fn()} />)
    fireEvent.click(screen.getByTestId('welcome-next-btn'))
    fireEvent.click(screen.getByTestId('welcome-next-btn'))
    expect(screen.getByText('Manage Campaigns')).toBeInTheDocument()
  })

  it('should navigate back from step 2 to step 1', () => {
    render(<WelcomeModal isOpen={true} onDismiss={vi.fn()} />)
    fireEvent.click(screen.getByTestId('welcome-next-btn'))
    expect(screen.getByText('Use at the Table')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('welcome-back-btn'))
    expect(screen.getByText('Create Characters')).toBeInTheDocument()
  })

  it('should disable Back button on step 1', () => {
    render(<WelcomeModal isOpen={true} onDismiss={vi.fn()} />)
    const backBtn = screen.getByTestId('welcome-back-btn')
    expect(backBtn).toBeDisabled()
  })

  // -----------------------------------------------------------------------
  // Get Started / Dismiss
  // -----------------------------------------------------------------------

  it('should show "Get Started" button on last step', () => {
    render(<WelcomeModal isOpen={true} onDismiss={vi.fn()} />)
    // Navigate to step 3
    fireEvent.click(screen.getByTestId('welcome-next-btn'))
    fireEvent.click(screen.getByTestId('welcome-next-btn'))
    expect(screen.getByTestId('welcome-get-started-btn')).toBeInTheDocument()
  })

  it('should call onDismiss when "Get Started" is clicked', () => {
    const onDismiss = vi.fn()
    render(<WelcomeModal isOpen={true} onDismiss={onDismiss} />)
    // Navigate to last step
    fireEvent.click(screen.getByTestId('welcome-next-btn'))
    fireEvent.click(screen.getByTestId('welcome-next-btn'))
    fireEvent.click(screen.getByTestId('welcome-get-started-btn'))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('should call onDismiss when "Skip intro" is clicked', () => {
    const onDismiss = vi.fn()
    render(<WelcomeModal isOpen={true} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByTestId('welcome-skip-btn'))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  // -----------------------------------------------------------------------
  // Step indicators
  // -----------------------------------------------------------------------

  it('should render 3 step indicator dots', () => {
    render(<WelcomeModal isOpen={true} onDismiss={vi.fn()} />)
    const dots = screen.getAllByRole('button', { name: /Go to step/ })
    expect(dots.length).toBe(3)
  })

  it('should navigate to a step when dot is clicked', () => {
    render(<WelcomeModal isOpen={true} onDismiss={vi.fn()} />)
    // Click step 3 dot
    fireEvent.click(screen.getByRole('button', { name: 'Go to step 3' }))
    expect(screen.getByText('Manage Campaigns')).toBeInTheDocument()
  })

  // -----------------------------------------------------------------------
  // 3-step content validation
  // -----------------------------------------------------------------------

  it('should contain all 3 steps: Create, Table, Campaigns', () => {
    render(<WelcomeModal isOpen={true} onDismiss={vi.fn()} />)

    // Step 1
    expect(screen.getByText('Create Characters')).toBeInTheDocument()

    // Navigate and check step 2
    fireEvent.click(screen.getByTestId('welcome-next-btn'))
    expect(screen.getByText('Use at the Table')).toBeInTheDocument()

    // Navigate and check step 3
    fireEvent.click(screen.getByTestId('welcome-next-btn'))
    expect(screen.getByText('Manage Campaigns')).toBeInTheDocument()
  })
})
