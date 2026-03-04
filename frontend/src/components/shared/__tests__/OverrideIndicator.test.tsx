/**
 * Tests for OverrideIndicator component (Story 46.5)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OverrideIndicator } from '@/components/shared/OverrideIndicator'

describe('OverrideIndicator', () => {
  it('should render the override indicator button', () => {
    render(
      <OverrideIndicator
        computedValue={18}
        fieldLabel="AC"
        onReset={vi.fn()}
      />,
    )
    expect(screen.getByTestId('override-indicator')).toBeInTheDocument()
  })

  it('should have accessible label with computed value', () => {
    render(
      <OverrideIndicator
        computedValue={18}
        fieldLabel="AC"
        onReset={vi.fn()}
      />,
    )
    const btn = screen.getByTestId('override-indicator')
    expect(btn.getAttribute('aria-label')).toContain('Calculated value: 18')
    expect(btn.getAttribute('aria-label')).toContain('AC is manually set')
  })

  it('should show tooltip on hover', () => {
    render(
      <OverrideIndicator
        computedValue={18}
        fieldLabel="AC"
        onReset={vi.fn()}
      />,
    )
    fireEvent.mouseEnter(screen.getByTestId('override-indicator'))
    expect(screen.getByTestId('override-tooltip')).toBeInTheDocument()
    expect(screen.getByText('This value is manually set.')).toBeInTheDocument()
  })

  it('should hide tooltip on mouse leave', () => {
    render(
      <OverrideIndicator
        computedValue={18}
        fieldLabel="AC"
        onReset={vi.fn()}
      />,
    )
    fireEvent.mouseEnter(screen.getByTestId('override-indicator'))
    expect(screen.getByTestId('override-tooltip')).toBeInTheDocument()
    fireEvent.mouseLeave(screen.getByTestId('override-indicator'))
    expect(screen.queryByTestId('override-tooltip')).not.toBeInTheDocument()
  })

  it('should display computed value in tooltip', () => {
    render(
      <OverrideIndicator
        computedValue={18}
        fieldLabel="AC"
        onReset={vi.fn()}
      />,
    )
    fireEvent.mouseEnter(screen.getByTestId('override-indicator'))
    expect(screen.getByText('18')).toBeInTheDocument()
  })

  it('should call onReset when clicked', () => {
    const onReset = vi.fn()
    render(
      <OverrideIndicator
        computedValue={18}
        fieldLabel="AC"
        onReset={onReset}
      />,
    )
    fireEvent.click(screen.getByTestId('override-indicator'))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('should show tooltip on focus for keyboard users', () => {
    render(
      <OverrideIndicator
        computedValue={18}
        fieldLabel="AC"
        onReset={vi.fn()}
      />,
    )
    fireEvent.focus(screen.getByTestId('override-indicator'))
    expect(screen.getByTestId('override-tooltip')).toBeInTheDocument()
  })

  it('should hide tooltip on blur', () => {
    render(
      <OverrideIndicator
        computedValue={18}
        fieldLabel="AC"
        onReset={vi.fn()}
      />,
    )
    fireEvent.focus(screen.getByTestId('override-indicator'))
    expect(screen.getByTestId('override-tooltip')).toBeInTheDocument()
    fireEvent.blur(screen.getByTestId('override-indicator'))
    expect(screen.queryByTestId('override-tooltip')).not.toBeInTheDocument()
  })
})
