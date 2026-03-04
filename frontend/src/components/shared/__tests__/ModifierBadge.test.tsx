// =============================================================================
// Tests for ModifierBadge
// =============================================================================

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModifierBadge } from '@/components/shared/ModifierBadge'

describe('ModifierBadge', () => {
  it('formats positive values with + sign', () => {
    render(<ModifierBadge value={3} />)

    expect(screen.getByTestId('modifier-badge')).toHaveTextContent('+3')
  })

  it('formats negative values with - sign', () => {
    render(<ModifierBadge value={-2} />)

    expect(screen.getByTestId('modifier-badge')).toHaveTextContent('-2')
  })

  it('formats zero with + sign', () => {
    render(<ModifierBadge value={0} />)

    expect(screen.getByTestId('modifier-badge')).toHaveTextContent('+0')
  })

  it('does not show sign when showSign is false', () => {
    render(<ModifierBadge value={3} showSign={false} />)

    expect(screen.getByTestId('modifier-badge')).toHaveTextContent('3')
    // Should not have the plus sign
    expect(screen.getByTestId('modifier-badge').textContent).not.toContain('+')
  })
})
