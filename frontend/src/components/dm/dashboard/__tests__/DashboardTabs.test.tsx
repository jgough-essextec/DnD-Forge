/**
 * DashboardTabs component tests (Story 34.1)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardTabs } from '../DashboardTabs'
import type { DashboardTab } from '../DashboardTabs'

describe('DashboardTabs', () => {
  const defaultProps = {
    activeTab: 'party' as DashboardTab,
    onTabChange: vi.fn(),
  }

  it('should render all four tabs', () => {
    render(<DashboardTabs {...defaultProps} />)
    expect(screen.getByRole('tab', { name: /party/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /sessions/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /encounters/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /notes/i })).toBeInTheDocument()
  })

  it('should mark the active tab with aria-selected true', () => {
    render(<DashboardTabs {...defaultProps} activeTab="party" />)
    expect(screen.getByRole('tab', { name: /party/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /sessions/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('should call onTabChange when a tab is clicked', async () => {
    const onTabChange = vi.fn()
    render(<DashboardTabs {...defaultProps} onTabChange={onTabChange} />)

    await userEvent.click(screen.getByRole('tab', { name: /sessions/i }))
    expect(onTabChange).toHaveBeenCalledWith('sessions')
  })

  it('should call onTabChange with correct tab id for each tab', async () => {
    const onTabChange = vi.fn()
    render(<DashboardTabs {...defaultProps} onTabChange={onTabChange} />)

    await userEvent.click(screen.getByRole('tab', { name: /encounters/i }))
    expect(onTabChange).toHaveBeenCalledWith('encounters')

    await userEvent.click(screen.getByRole('tab', { name: /notes/i }))
    expect(onTabChange).toHaveBeenCalledWith('notes')

    await userEvent.click(screen.getByRole('tab', { name: /party/i }))
    expect(onTabChange).toHaveBeenCalledWith('party')
  })

  it('should render with tablist role', () => {
    render(<DashboardTabs {...defaultProps} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('should have aria-controls attributes pointing to panel IDs', () => {
    render(<DashboardTabs {...defaultProps} />)
    expect(screen.getByRole('tab', { name: /party/i })).toHaveAttribute('aria-controls', 'tabpanel-party')
    expect(screen.getByRole('tab', { name: /sessions/i })).toHaveAttribute('aria-controls', 'tabpanel-sessions')
  })

  it('should visually distinguish active tab from inactive tabs', () => {
    render(<DashboardTabs {...defaultProps} activeTab="encounters" />)
    const activeTab = screen.getByRole('tab', { name: /encounters/i })
    const inactiveTab = screen.getByRole('tab', { name: /party/i })
    expect(activeTab.className).toContain('text-accent-gold')
    expect(inactiveTab.className).toContain('text-parchment/60')
  })
})
