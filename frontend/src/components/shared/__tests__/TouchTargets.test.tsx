/**
 * Touch Target Verification Tests (Story 44.3)
 *
 * Verifies that small interactive elements meet the 44x44px minimum
 * touch target size via transparent padding expansion.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProficiencyDot } from '@/components/shared/ProficiencyDot'
import { SlotCircleRow } from '@/components/session/spells/SlotCircleRow'

describe('Touch Targets — 44px Minimum (Story 44.3)', () => {
  describe('ProficiencyDot', () => {
    it('has min-w-[44px] and min-h-[44px] classes for touch target', () => {
      render(<ProficiencyDot level="proficient" />)

      const dot = screen.getByTestId('proficiency-dot-proficient')
      expect(dot.className).toContain('min-w-[44px]')
      expect(dot.className).toContain('min-h-[44px]')
    })

    it('has touch-manipulation class for proficient level', () => {
      render(<ProficiencyDot level="proficient" />)

      const dot = screen.getByTestId('proficiency-dot-proficient')
      expect(dot.className).toContain('touch-manipulation')
    })

    it('has touch-manipulation class for none level', () => {
      render(<ProficiencyDot level="none" />)

      const dot = screen.getByTestId('proficiency-dot-none')
      expect(dot.className).toContain('touch-manipulation')
    })

    it('has touch-manipulation class for expertise level', () => {
      render(<ProficiencyDot level="expertise" />)

      const dot = screen.getByTestId('proficiency-dot-expertise')
      expect(dot.className).toContain('touch-manipulation')
    })
  })

  describe('SlotCircleRow', () => {
    it('renders spell slot buttons with 44px min touch targets', () => {
      render(
        <SlotCircleRow
          level={1}
          total={3}
          used={1}
          onToggle={vi.fn()}
          label="1st"
        />,
      )

      const slot0 = screen.getByTestId('slot-circle-1-0')
      expect(slot0.className).toContain('min-w-[44px]')
      expect(slot0.className).toContain('min-h-[44px]')
    })

    it('renders spell slot buttons with touch-manipulation class', () => {
      render(
        <SlotCircleRow
          level={2}
          total={2}
          used={0}
          onToggle={vi.fn()}
          label="2nd"
        />,
      )

      const slot0 = screen.getByTestId('slot-circle-2-0')
      expect(slot0.className).toContain('touch-manipulation')
    })
  })
})
