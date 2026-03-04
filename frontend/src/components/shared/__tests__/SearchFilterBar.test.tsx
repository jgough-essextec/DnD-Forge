// =============================================================================
// Tests for SearchFilterBar
// =============================================================================

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { SearchFilterBar } from '@/components/shared/SearchFilterBar'
import type { FilterDef } from '@/components/shared/SearchFilterBar'

const filters: FilterDef[] = [
  {
    id: 'category',
    label: 'Category',
    type: 'dropdown',
    options: [
      { value: 'martial', label: 'Martial' },
      { value: 'caster', label: 'Caster' },
    ],
  },
  {
    id: 'official',
    label: 'Official Only',
    type: 'toggle',
  },
  {
    id: 'source',
    label: 'Source',
    type: 'chip',
    options: [
      { value: 'phb', label: 'PHB' },
      { value: 'xge', label: 'XGE' },
    ],
  },
]

const defaultProps = {
  searchValue: '',
  onSearchChange: vi.fn(),
  filters,
  filterValues: {} as Record<string, string | boolean>,
  onFilterChange: vi.fn(),
}

afterEach(() => {
  vi.useRealTimers()
})

describe('SearchFilterBar', () => {
  it('renders search input and filter controls', () => {
    render(<SearchFilterBar {...defaultProps} />)

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    // Dropdown filter
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    // Toggle filter
    expect(screen.getByLabelText('Official Only')).toBeInTheDocument()
    // Chip filter buttons
    expect(screen.getByText('PHB')).toBeInTheDocument()
    expect(screen.getByText('XGE')).toBeInTheDocument()
  })

  it('calls onSearchChange after debounce on input', async () => {
    vi.useFakeTimers()
    const onSearchChange = vi.fn()

    render(
      <SearchFilterBar
        {...defaultProps}
        onSearchChange={onSearchChange}
      />,
    )

    const input = screen.getByRole('textbox')

    // Use fireEvent to avoid userEvent timing issues with fake timers
    await act(async () => {
      fireEvent.change(input, { target: { value: 'fighter' } })
    })

    // Before debounce fires
    expect(onSearchChange).not.toHaveBeenCalled()

    // Advance past debounce
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onSearchChange).toHaveBeenCalledWith('fighter')
  })

  it('calls onFilterChange when dropdown is changed', async () => {
    const onFilterChange = vi.fn()

    render(
      <SearchFilterBar
        {...defaultProps}
        onFilterChange={onFilterChange}
      />,
    )

    const select = screen.getByLabelText('Category')
    fireEvent.change(select, { target: { value: 'martial' } })

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith('category', 'martial')
    })
  })

  it('calls onFilterChange when toggle is clicked', async () => {
    const onFilterChange = vi.fn()

    render(
      <SearchFilterBar
        {...defaultProps}
        onFilterChange={onFilterChange}
      />,
    )

    const toggle = screen.getByLabelText('Official Only')
    fireEvent.click(toggle)

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith('official', true)
    })
  })

  it('calls onFilterChange when chip is clicked', async () => {
    const onFilterChange = vi.fn()

    render(
      <SearchFilterBar
        {...defaultProps}
        onFilterChange={onFilterChange}
      />,
    )

    fireEvent.click(screen.getByText('PHB'))

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith('source', 'phb')
    })
  })
})
