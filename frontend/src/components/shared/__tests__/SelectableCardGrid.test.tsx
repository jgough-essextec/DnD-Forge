// =============================================================================
// Tests for SelectableCardGrid
// =============================================================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectableCardGrid } from '@/components/shared/SelectableCardGrid'

interface TestItem {
  id: string
  name: string
}

const items: TestItem[] = [
  { id: '1', name: 'Fighter' },
  { id: '2', name: 'Wizard' },
  { id: '3', name: 'Rogue' },
  { id: '4', name: 'Cleric' },
]

const defaultProps = {
  items,
  selectedItems: [] as TestItem[],
  onSelect: vi.fn(),
  getKey: (item: TestItem) => item.id,
  renderCard: (item: TestItem) => <span>{item.name}</span>,
}

describe('SelectableCardGrid', () => {
  it('renders grid with items', () => {
    render(<SelectableCardGrid {...defaultProps} />)

    expect(screen.getByText('Fighter')).toBeInTheDocument()
    expect(screen.getByText('Wizard')).toBeInTheDocument()
    expect(screen.getByText('Rogue')).toBeInTheDocument()
    expect(screen.getByText('Cleric')).toBeInTheDocument()
  })

  it('renders with ARIA listbox and option roles', () => {
    render(<SelectableCardGrid {...defaultProps} />)

    expect(screen.getByRole('listbox')).toBeInTheDocument()
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(4)
  })

  it('calls onSelect when an item is clicked (single-select)', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <SelectableCardGrid
        {...defaultProps}
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByText('Wizard'))
    expect(onSelect).toHaveBeenCalledWith(items[1])
  })

  it('marks selected items with aria-selected true', () => {
    render(
      <SelectableCardGrid
        {...defaultProps}
        selectedItems={[items[0]]}
      />,
    )

    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    expect(options[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('supports multiSelect mode with aria-multiselectable', () => {
    render(
      <SelectableCardGrid
        {...defaultProps}
        multiSelect={true}
        selectedItems={[items[0], items[2]]}
      />,
    )

    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true')

    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    expect(options[1]).toHaveAttribute('aria-selected', 'false')
    expect(options[2]).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onSelect on keyboard Enter', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <SelectableCardGrid
        {...defaultProps}
        onSelect={onSelect}
      />,
    )

    const options = screen.getAllByRole('option')
    options[1].focus()
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(items[1])
  })
})
