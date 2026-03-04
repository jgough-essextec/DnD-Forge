/**
 * Tests for FeatureUsageList component (Story 30.3)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FeatureUsageList } from '../FeatureUsageList'
import type { FeatureUsage } from '@/utils/rest-recovery'

const SHORT_REST_FEATURE: FeatureUsage = {
  featureId: 'second-wind',
  name: 'Second Wind',
  maxUses: 1,
  usesRemaining: 1,
  recoversOn: 'short_rest',
}

const LONG_REST_FEATURE: FeatureUsage = {
  featureId: 'rage',
  name: 'Rage',
  maxUses: 3,
  usesRemaining: 2,
  recoversOn: 'long_rest',
}

describe('FeatureUsageList', () => {
  it('renders empty state when no features provided', () => {
    render(<FeatureUsageList features={[]} />)
    expect(screen.getByTestId('feature-usage-list-empty')).toBeInTheDocument()
    expect(screen.getByText('No limited-use features')).toBeInTheDocument()
  })

  it('groups features by recovery type', () => {
    render(
      <FeatureUsageList
        features={[SHORT_REST_FEATURE, LONG_REST_FEATURE]}
      />,
    )

    expect(screen.getByTestId('short-rest-features-group')).toBeInTheDocument()
    expect(screen.getByTestId('long-rest-features-group')).toBeInTheDocument()
  })

  it('renders short rest features under the Short Rest Recovery heading', () => {
    render(
      <FeatureUsageList features={[SHORT_REST_FEATURE]} />,
    )

    expect(screen.getByText('Short Rest Recovery')).toBeInTheDocument()
    expect(screen.getByText('Second Wind')).toBeInTheDocument()
  })

  it('renders long rest features under the Long Rest Recovery heading', () => {
    render(
      <FeatureUsageList features={[LONG_REST_FEATURE]} />,
    )

    expect(screen.getByText('Long Rest Recovery')).toBeInTheDocument()
    expect(screen.getByText('Rage')).toBeInTheDocument()
  })

  it('passes onExpend and onRecover to children', () => {
    const onExpend = vi.fn()
    const onRecover = vi.fn()

    render(
      <FeatureUsageList
        features={[LONG_REST_FEATURE]}
        onExpend={onExpend}
        onRecover={onRecover}
      />,
    )

    // Rage has 1 expended (index 0 = empty) and 2 remaining
    fireEvent.click(screen.getByTestId('feature-circle-rage-0'))
    expect(onRecover).toHaveBeenCalledWith('rage')
  })
})
