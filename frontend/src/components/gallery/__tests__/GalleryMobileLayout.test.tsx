/**
 * Gallery Mobile Layout Tests (Story 44.1)
 *
 * Verifies mobile-specific responsive behavior:
 * - Single-column grid on mobile
 * - Name truncation with ellipsis
 * - Filter controls collapse into dropdown on mobile
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GalleryToolbar } from '@/components/gallery/GalleryToolbar'
import { CharacterGallery } from '@/components/gallery/CharacterGallery'
import type { GalleryFilters, GalleryCharacter } from '@/utils/gallery'

function makeCharacter(overrides: Partial<GalleryCharacter> = {}): GalleryCharacter {
  return {
    id: '1',
    name: 'Test Character',
    race: 'Human',
    class: 'Fighter',
    level: 5,
    hp: { current: 44, max: 44 },
    ac: 18,
    updatedAt: new Date().toISOString(),
    isArchived: false,
    ...overrides,
  }
}

const defaultFilters: GalleryFilters = {
  search: '',
  classes: [],
  races: [],
  levelRanges: [],
  showArchived: false,
}

describe('Gallery — Mobile Layout (Story 44.1)', () => {
  it('renders gallery grid with single-column class for mobile', () => {
    const chars = [
      makeCharacter({ id: '1', name: 'Aragorn' }),
      makeCharacter({ id: '2', name: 'Legolas' }),
    ]

    render(
      <CharacterGallery
        characters={chars}
        viewMode="grid"
        selectMode={false}
        selectedIds={new Set()}
        onSelectToggle={vi.fn()}
        onCardClick={vi.fn()}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onDuplicate={vi.fn()}
        onExport={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
        onCreateNew={vi.fn()}
        isFiltered={false}
      />,
    )

    const grid = screen.getByTestId('character-grid')
    // Should have grid-cols-1 class for mobile
    expect(grid.className).toContain('grid-cols-1')
  })

  it('truncates long character names with ellipsis via truncate class', () => {
    const chars = [
      makeCharacter({
        id: '1',
        name: 'Arthalionithriax the Magnificent Destroyer of Worlds',
      }),
    ]

    render(
      <CharacterGallery
        characters={chars}
        viewMode="grid"
        selectMode={false}
        selectedIds={new Set()}
        onSelectToggle={vi.fn()}
        onCardClick={vi.fn()}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onDuplicate={vi.fn()}
        onExport={vi.fn()}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
        onCreateNew={vi.fn()}
        isFiltered={false}
      />,
    )

    // The name heading should have the 'truncate' class
    const nameEl = screen.getByText(
      'Arthalionithriax the Magnificent Destroyer of Worlds',
    )
    expect(nameEl.className).toContain('truncate')
  })

  it('renders mobile filter toggle button', () => {
    render(
      <GalleryToolbar
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
        sortOption="lastEdited"
        onSortChange={vi.fn()}
        viewMode="grid"
        onViewModeChange={vi.fn()}
        classOptions={[{ value: 'fighter', label: 'Fighter' }]}
        raceOptions={[{ value: 'human', label: 'Human' }]}
        totalCount={10}
        filteredCount={10}
      />,
    )

    expect(screen.getByTestId('mobile-filter-toggle')).toBeInTheDocument()
  })

  it('toggles filter visibility when mobile filter button is clicked', () => {
    render(
      <GalleryToolbar
        filters={defaultFilters}
        onFiltersChange={vi.fn()}
        sortOption="lastEdited"
        onSortChange={vi.fn()}
        viewMode="grid"
        onViewModeChange={vi.fn()}
        classOptions={[{ value: 'fighter', label: 'Fighter' }]}
        raceOptions={[{ value: 'human', label: 'Human' }]}
        totalCount={10}
        filteredCount={10}
      />,
    )

    const toggle = screen.getByTestId('mobile-filter-toggle')

    // Initially filters are collapsed on mobile
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    // Click to expand
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows active filter count badge on mobile toggle', () => {
    render(
      <GalleryToolbar
        filters={{ ...defaultFilters, classes: ['fighter', 'wizard'] }}
        onFiltersChange={vi.fn()}
        sortOption="lastEdited"
        onSortChange={vi.fn()}
        viewMode="grid"
        onViewModeChange={vi.fn()}
        classOptions={[
          { value: 'fighter', label: 'Fighter' },
          { value: 'wizard', label: 'Wizard' },
        ]}
        raceOptions={[]}
        totalCount={10}
        filteredCount={5}
      />,
    )

    const toggle = screen.getByTestId('mobile-filter-toggle')
    // Should show "2" badge for 2 active class filters
    expect(toggle).toHaveTextContent('2')
  })
})
