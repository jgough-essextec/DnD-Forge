/**
 * XPThresholdTable Component Tests (Story 37.3)
 *
 * Tests for the collapsible XP threshold reference table.
 */

import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { XPThresholdTable } from '../XPThresholdTable'

describe('XPThresholdTable', () => {
  it('should render the collapsible reference card', () => {
    renderWithProviders(<XPThresholdTable />)
    expect(screen.getByTestId('xp-threshold-table')).toBeInTheDocument()
    expect(screen.getByText('XP Threshold Reference')).toBeInTheDocument()
  })

  it('should start collapsed by default', () => {
    renderWithProviders(<XPThresholdTable />)
    expect(screen.queryByText('Level 1')).not.toBeInTheDocument()
  })

  it('should expand when clicked', () => {
    renderWithProviders(<XPThresholdTable />)
    fireEvent.click(screen.getByText('XP Threshold Reference'))
    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByText('Level 20')).toBeInTheDocument()
  })

  it('should show all 20 level thresholds when expanded', () => {
    renderWithProviders(<XPThresholdTable />)
    fireEvent.click(screen.getByText('XP Threshold Reference'))

    for (let i = 1; i <= 20; i++) {
      expect(screen.getByText(`Level ${i}`)).toBeInTheDocument()
    }
  })

  it('should show correct XP values for key levels', () => {
    renderWithProviders(<XPThresholdTable />)
    fireEvent.click(screen.getByText('XP Threshold Reference'))

    // Check a few key values
    expect(screen.getByText('0')).toBeInTheDocument()        // Level 1
    expect(screen.getByText('300')).toBeInTheDocument()      // Level 2
    expect(screen.getByText('900')).toBeInTheDocument()      // Level 3
    expect(screen.getByText('355,000')).toBeInTheDocument()  // Level 20
  })

  it('should collapse when clicked again', () => {
    renderWithProviders(<XPThresholdTable />)

    // Expand
    fireEvent.click(screen.getByText('XP Threshold Reference'))
    expect(screen.getByText('Level 1')).toBeInTheDocument()

    // Collapse
    fireEvent.click(screen.getByText('XP Threshold Reference'))
    expect(screen.queryByText('Level 1')).not.toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    renderWithProviders(<XPThresholdTable />)

    const button = screen.getByText('XP Threshold Reference').closest('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(button!)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveAttribute('aria-controls', 'xp-threshold-content')
  })
})
