/**
 * Tests for FeatureUsageCounter component (Story 30.3)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FeatureUsageCounter } from '../FeatureUsageCounter'

describe('FeatureUsageCounter', () => {
  it('renders the feature name', () => {
    render(
      <FeatureUsageCounter
        featureId="second-wind"
        name="Second Wind"
        maxUses={1}
        usesRemaining={1}
      />,
    )

    expect(screen.getByText('Second Wind')).toBeInTheDocument()
  })

  it('renders correct number of circles for maxUses', () => {
    render(
      <FeatureUsageCounter
        featureId="rage"
        name="Rage"
        maxUses={4}
        usesRemaining={4}
      />,
    )

    const circles = screen.getAllByTestId(/^feature-circle-rage-/)
    expect(circles).toHaveLength(4)
  })

  it('renders filled circles for remaining uses and empty for expended', () => {
    render(
      <FeatureUsageCounter
        featureId="ki"
        name="Ki Points"
        maxUses={5}
        usesRemaining={3}
      />,
    )

    // 2 expended (first two), 3 remaining
    const circles = screen.getAllByTestId(/^feature-circle-ki-/)
    expect(circles[0]).toHaveAttribute('aria-label', 'Ki Points use 1: expended')
    expect(circles[1]).toHaveAttribute('aria-label', 'Ki Points use 2: expended')
    expect(circles[2]).toHaveAttribute('aria-label', 'Ki Points use 3: available')
    expect(circles[3]).toHaveAttribute('aria-label', 'Ki Points use 4: available')
    expect(circles[4]).toHaveAttribute('aria-label', 'Ki Points use 5: available')
  })

  it('displays usage count (remaining/max)', () => {
    render(
      <FeatureUsageCounter
        featureId="rage"
        name="Rage"
        maxUses={3}
        usesRemaining={2}
      />,
    )

    expect(screen.getByText('2/3')).toBeInTheDocument()
  })

  it('calls onExpend when clicking a filled circle', () => {
    const onExpend = vi.fn()

    render(
      <FeatureUsageCounter
        featureId="rage"
        name="Rage"
        maxUses={3}
        usesRemaining={3}
        onExpend={onExpend}
      />,
    )

    // Click last filled circle (index 2, since 0 expended)
    fireEvent.click(screen.getByTestId('feature-circle-rage-2'))
    expect(onExpend).toHaveBeenCalledWith('rage')
  })

  it('calls onRecover when clicking an empty circle', () => {
    const onRecover = vi.fn()

    render(
      <FeatureUsageCounter
        featureId="rage"
        name="Rage"
        maxUses={3}
        usesRemaining={1}
        onRecover={onRecover}
      />,
    )

    // First 2 circles are expended, click one of them
    fireEvent.click(screen.getByTestId('feature-circle-rage-0'))
    expect(onRecover).toHaveBeenCalledWith('rage')
  })

  it('does not fire click handlers when readOnly', () => {
    const onExpend = vi.fn()
    const onRecover = vi.fn()

    render(
      <FeatureUsageCounter
        featureId="rage"
        name="Rage"
        maxUses={3}
        usesRemaining={2}
        onExpend={onExpend}
        onRecover={onRecover}
        readOnly
      />,
    )

    fireEvent.click(screen.getByTestId('feature-circle-rage-0'))
    fireEvent.click(screen.getByTestId('feature-circle-rage-2'))
    expect(onExpend).not.toHaveBeenCalled()
    expect(onRecover).not.toHaveBeenCalled()
  })

  it('displays infinity symbol for unlimited uses (null maxUses)', () => {
    render(
      <FeatureUsageCounter
        featureId="rage"
        name="Rage"
        maxUses={null}
        usesRemaining={0}
      />,
    )

    expect(screen.getByLabelText('Rage: unlimited uses')).toBeInTheDocument()
  })
})
