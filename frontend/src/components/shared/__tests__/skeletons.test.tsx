/**
 * Tests for skeleton components (Story 46.1)
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonSheet,
  SkeletonTable,
  LoadingProgress,
} from '@/components/shared/skeletons'

// ---------------------------------------------------------------------------
// Skeleton primitive
// ---------------------------------------------------------------------------

describe('Skeleton', () => {
  it('should render with default rectangular variant', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstElementChild!
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('rounded-lg')
  })

  it('should render circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />)
    const el = container.firstElementChild!
    expect(el.className).toContain('rounded-full')
  })

  it('should render text variant', () => {
    const { container } = render(<Skeleton variant="text" />)
    const el = container.firstElementChild!
    expect(el.className).toContain('h-4')
  })

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="w-48 h-10" />)
    const el = container.firstElementChild!
    expect(el.className).toContain('w-48')
    expect(el.className).toContain('h-10')
  })

  it('should include pulse animation class', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstElementChild!
    expect(el.className).toContain('animate-pulse')
  })

  it('should include reduce-motion animation override class', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstElementChild!
    expect(el.className).toContain('reduce-motion:animate-none')
  })

  it('should be aria-hidden', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstElementChild!
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })
})

// ---------------------------------------------------------------------------
// SkeletonText
// ---------------------------------------------------------------------------

describe('SkeletonText', () => {
  it('should render 3 lines by default', () => {
    const { container } = render(<SkeletonText />)
    const lines = container.querySelectorAll('[aria-hidden="true"]')
    expect(lines.length).toBe(3)
  })

  it('should render specified number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />)
    const lines = container.querySelectorAll('[aria-hidden="true"]')
    expect(lines.length).toBe(5)
  })

  it('should make the last line shorter', () => {
    const { container } = render(<SkeletonText lines={3} />)
    const lines = container.querySelectorAll('[aria-hidden="true"]')
    const lastLine = lines[lines.length - 1]
    expect(lastLine.className).toContain('w-3/4')
  })
})

// ---------------------------------------------------------------------------
// SkeletonCard
// ---------------------------------------------------------------------------

describe('SkeletonCard', () => {
  it('should render with skeleton-card test id', () => {
    render(<SkeletonCard />)
    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument()
  })

  it('should contain circular avatar skeleton', () => {
    const { container } = render(<SkeletonCard />)
    const circles = container.querySelectorAll('.rounded-full')
    expect(circles.length).toBeGreaterThanOrEqual(1)
  })

  it('should contain stat block skeletons', () => {
    const { container } = render(<SkeletonCard />)
    // There should be multiple skeleton blocks
    const blocks = container.querySelectorAll('[aria-hidden="true"]')
    expect(blocks.length).toBeGreaterThanOrEqual(5)
  })
})

// ---------------------------------------------------------------------------
// SkeletonSheet
// ---------------------------------------------------------------------------

describe('SkeletonSheet', () => {
  it('should render with skeleton-sheet test id', () => {
    render(<SkeletonSheet />)
    expect(screen.getByTestId('skeleton-sheet')).toBeInTheDocument()
  })

  it('should have aria-busy for accessibility', () => {
    render(<SkeletonSheet />)
    const el = screen.getByTestId('skeleton-sheet')
    expect(el.getAttribute('aria-busy')).toBe('true')
  })

  it('should have status role', () => {
    render(<SkeletonSheet />)
    const el = screen.getByTestId('skeleton-sheet')
    expect(el.getAttribute('role')).toBe('status')
  })

  it('should render 6 ability score blocks', () => {
    const { container } = render(<SkeletonSheet />)
    // Grid with 6 ability blocks
    const abilityBlocks = container.querySelectorAll('.grid.grid-cols-3 > div, .grid.sm\\:grid-cols-6 > div')
    expect(abilityBlocks.length).toBeGreaterThanOrEqual(6)
  })
})

// ---------------------------------------------------------------------------
// SkeletonTable
// ---------------------------------------------------------------------------

describe('SkeletonTable', () => {
  it('should render with skeleton-table test id', () => {
    render(<SkeletonTable />)
    expect(screen.getByTestId('skeleton-table')).toBeInTheDocument()
  })

  it('should render default 3 rows and 4 columns', () => {
    const { container } = render(<SkeletonTable />)
    // 1 header row + 3 body rows = 4 flex rows
    const rows = container.querySelectorAll('.flex.gap-3')
    expect(rows.length).toBe(4)
  })

  it('should render custom row and column counts', () => {
    const { container } = render(<SkeletonTable rows={5} columns={6} />)
    const rows = container.querySelectorAll('.flex.gap-3')
    expect(rows.length).toBe(6) // 1 header + 5 body
  })

  it('should have aria-busy for accessibility', () => {
    render(<SkeletonTable />)
    const el = screen.getByTestId('skeleton-table')
    expect(el.getAttribute('aria-busy')).toBe('true')
  })
})

// ---------------------------------------------------------------------------
// LoadingProgress
// ---------------------------------------------------------------------------

describe('LoadingProgress', () => {
  it('should render with loading-progress test id', () => {
    render(<LoadingProgress progress={50} />)
    expect(screen.getByTestId('loading-progress')).toBeInTheDocument()
  })

  it('should display the label', () => {
    render(<LoadingProgress progress={50} label="Generating PDF..." />)
    expect(screen.getByText('Generating PDF...')).toBeInTheDocument()
  })

  it('should display the status message', () => {
    render(
      <LoadingProgress progress={66} statusMessage="Page 2 of 3..." />,
    )
    expect(screen.getByText('Page 2 of 3...')).toBeInTheDocument()
  })

  it('should display progress percentage', () => {
    render(<LoadingProgress progress={75} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('should clamp progress between 0 and 100', () => {
    render(<LoadingProgress progress={150} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('should have progressbar role', () => {
    render(<LoadingProgress progress={50} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toBeInTheDocument()
    expect(bar.getAttribute('aria-valuenow')).toBe('50')
  })

  it('should render modal overlay when modal prop is true', () => {
    render(<LoadingProgress progress={50} modal />)
    expect(screen.getByTestId('loading-progress-modal')).toBeInTheDocument()
  })

  it('should not render modal overlay by default', () => {
    render(<LoadingProgress progress={50} />)
    expect(screen.queryByTestId('loading-progress-modal')).not.toBeInTheDocument()
  })
})
