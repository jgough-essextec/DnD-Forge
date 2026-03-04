// =============================================================================
// Tests for ProficiencyDot
// =============================================================================

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProficiencyDot } from '@/components/shared/ProficiencyDot'

describe('ProficiencyDot', () => {
  it('renders with "Not proficient" label for none level', () => {
    render(<ProficiencyDot level="none" />)

    expect(screen.getByTestId('proficiency-dot-none')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Not proficient')
  })

  it('renders with "Proficient" label for proficient level', () => {
    render(<ProficiencyDot level="proficient" />)

    expect(screen.getByTestId('proficiency-dot-proficient')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Proficient')
  })

  it('renders with "Expertise" label for expertise level', () => {
    render(<ProficiencyDot level="expertise" />)

    expect(screen.getByTestId('proficiency-dot-expertise')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Expertise')
  })

  it('renders with "Half proficiency" label for half level', () => {
    render(<ProficiencyDot level="half" />)

    expect(screen.getByTestId('proficiency-dot-half')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Half proficiency')
  })

  it('uses custom label when provided', () => {
    render(<ProficiencyDot level="proficient" label="Stealth proficiency" />)

    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Stealth proficiency')
  })
})
