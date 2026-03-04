/**
 * Tests for LootTracker and LootEntryForm components (Story 36.4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LootTracker } from '../LootTracker'
import { LootEntryForm } from '../LootEntryForm'
import type { LootTrackerEntry } from '@/utils/dm-notes'
import type { SessionNote } from '@/types/campaign'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeLoot(overrides: Partial<LootTrackerEntry> = {}): LootTrackerEntry {
  return {
    id: 'loot-1',
    name: 'Sword of Flame',
    type: 'Magic Item',
    value: 500,
    quantity: 1,
    assignedTo: undefined,
    sessionId: undefined,
    sessionNumber: 1,
    notes: '',
    campaignId: 'camp-1',
    ...overrides,
  }
}

const mockCharacters = [
  { id: 'char-1', name: 'Thorn Ironforge' },
  { id: 'char-2', name: 'Elara Nightwhisper' },
  { id: 'char-3', name: 'Bron Stonewall' },
]

const mockSessions: SessionNote[] = [
  {
    id: 'ses-1',
    campaignId: 'camp-1',
    sessionNumber: 1,
    date: '2024-06-01',
    title: 'Into the Mines',
    content: 'Explored mines',
    tags: [],
  },
  {
    id: 'ses-2',
    campaignId: 'camp-1',
    sessionNumber: 2,
    date: '2024-06-08',
    title: 'Dragon Fight',
    content: 'Fought a dragon',
    tags: [],
  },
]

const mockLootEntries: LootTrackerEntry[] = [
  makeLoot({
    id: 'loot-1',
    name: 'Sword of Flame',
    type: 'Magic Item',
    value: 500,
    quantity: 1,
    assignedTo: 'char-1',
    sessionNumber: 1,
  }),
  makeLoot({
    id: 'loot-2',
    name: 'Gold Pieces',
    type: 'Gold/Currency',
    value: 100,
    quantity: 50,
    assignedTo: undefined,
    sessionNumber: 1,
  }),
  makeLoot({
    id: 'loot-3',
    name: 'Healing Potion',
    type: 'Mundane Item',
    value: 50,
    quantity: 3,
    assignedTo: 'char-2',
    sessionNumber: 2,
  }),
  makeLoot({
    id: 'loot-4',
    name: 'Quest Reward Gem',
    type: 'Quest Reward',
    value: 200,
    quantity: 1,
    assignedTo: 'Party Loot',
    sessionNumber: 2,
  }),
  makeLoot({
    id: 'loot-5',
    name: 'Mysterious Artifact',
    type: 'Other',
    value: undefined,
    quantity: 1,
    notes: 'Unknown properties',
  }),
]

// ---------------------------------------------------------------------------
// LootTracker Tests
// ---------------------------------------------------------------------------

describe('LootTracker', () => {
  let onAddEntry: ReturnType<typeof vi.fn>
  let onDeleteEntry: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onAddEntry = vi.fn()
    onDeleteEntry = vi.fn()
  })

  it('should render loot tracker with count', () => {
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )
    expect(screen.getByTestId('loot-tracker')).toBeInTheDocument()
    expect(screen.getByText('Loot Tracker')).toBeInTheDocument()
    expect(screen.getByText('(5 items)')).toBeInTheDocument()
  })

  it('should render loot tracker as a sortable table', () => {
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )
    // Table headers
    expect(screen.getByLabelText('Sort by name')).toBeInTheDocument()
    expect(screen.getByLabelText('Sort by type')).toBeInTheDocument()
    expect(screen.getByLabelText('Sort by value')).toBeInTheDocument()
  })

  it('should display loot entries with name, type, value, assigned character, and session number', () => {
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )
    expect(screen.getByText('Sword of Flame')).toBeInTheDocument()
    expect(screen.getByText('Gold Pieces')).toBeInTheDocument()
    expect(screen.getByText('Healing Potion')).toBeInTheDocument()
    expect(screen.getByText('Quest Reward Gem')).toBeInTheDocument()
    expect(screen.getByText('Mysterious Artifact')).toBeInTheDocument()
  })

  it('should show total party loot value summary', () => {
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )
    const totalValue = screen.getByTestId('total-value')
    expect(totalValue).toBeInTheDocument()
    // 500 + 5000 + 150 + 200 + 0 = 5850
    expect(within(totalValue).getByText(/5,850 GP/)).toBeInTheDocument()
  })

  it('should display "Party Gold" tracker with aggregated currency', () => {
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        partyCurrency={{ cp: 100, sp: 50, ep: 0, gp: 200, pp: 5 }}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )
    const partyGold = screen.getByTestId('party-gold')
    expect(partyGold).toBeInTheDocument()
    expect(within(partyGold).getByText('Party Gold')).toBeInTheDocument()
    // 100*0.01 + 50*0.1 + 200 + 5*10 = 1 + 5 + 200 + 50 = 256
    expect(within(partyGold).getByText('256 GP')).toBeInTheDocument()
  })

  it('should open quick-add form on "Add Loot" button click', async () => {
    const user = userEvent.setup()
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )

    await user.click(screen.getByLabelText('Add loot'))
    expect(screen.getByTestId('loot-entry-form')).toBeInTheDocument()
  })

  it('should filter by type', async () => {
    const user = userEvent.setup()
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )

    // Open filters
    await user.click(screen.getByLabelText('Toggle filters'))

    const typeFilters = screen.getByTestId('type-filters')
    await user.click(within(typeFilters).getByText('Magic Item'))

    expect(screen.getByText('Sword of Flame')).toBeInTheDocument()
    expect(screen.queryByText('Gold Pieces')).not.toBeInTheDocument()
    expect(screen.queryByText('Healing Potion')).not.toBeInTheDocument()
  })

  it('should filter by assigned character', async () => {
    const user = userEvent.setup()
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )

    await user.click(screen.getByLabelText('Toggle filters'))

    const assigneeFilters = screen.getByTestId('assignee-filters')
    await user.click(within(assigneeFilters).getByText('Thorn Ironforge'))

    expect(screen.getByText('Sword of Flame')).toBeInTheDocument()
    expect(screen.queryByText('Healing Potion')).not.toBeInTheDocument()
  })

  it('should filter by "Unassigned" showing party loot', async () => {
    const user = userEvent.setup()
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )

    await user.click(screen.getByLabelText('Toggle filters'))

    const assigneeFilters = screen.getByTestId('assignee-filters')
    await user.click(within(assigneeFilters).getByText('Unassigned'))

    // Gold Pieces (undefined) and Quest Reward Gem (Party Loot) should show
    expect(screen.getByText('Gold Pieces')).toBeInTheDocument()
    expect(screen.getByText('Quest Reward Gem')).toBeInTheDocument()
    expect(screen.queryByText('Sword of Flame')).not.toBeInTheDocument()
  })

  it('should show empty state when no loot entries', () => {
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={[]}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )
    expect(screen.getByText('No loot recorded yet.')).toBeInTheDocument()
  })

  it('should delete loot entry when delete button clicked', async () => {
    const user = userEvent.setup()
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )

    await user.click(screen.getByLabelText('Delete Sword of Flame'))
    expect(onDeleteEntry).toHaveBeenCalledWith('loot-1')
  })

  it('should sort by name when column header clicked', async () => {
    const user = userEvent.setup()
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )

    await user.click(screen.getByLabelText('Sort by name'))

    // After sorting by name ascending, first item alphabetically should be first
    const rows = screen.getAllByTestId(/^loot-row-/)
    expect(rows.length).toBe(5)
  })

  it('should search loot by name', async () => {
    const user = userEvent.setup()
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )

    const searchInput = screen.getByLabelText('Search loot')
    await user.type(searchInput, 'Sword')

    expect(screen.getByText('Sword of Flame')).toBeInTheDocument()
    expect(screen.queryByText('Gold Pieces')).not.toBeInTheDocument()
  })

  it('should display quantity badge for items with quantity > 1', () => {
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )
    expect(screen.getByText('x50')).toBeInTheDocument()
    expect(screen.getByText('x3')).toBeInTheDocument()
  })

  it('should show character name for assigned loot', () => {
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )
    expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
    expect(screen.getByText('Elara Nightwhisper')).toBeInTheDocument()
  })

  it('should clear filters when clear button clicked', async () => {
    const user = userEvent.setup()
    render(
      <LootTracker
        campaignId="camp-1"
        lootEntries={mockLootEntries}
        characters={mockCharacters}
        sessions={mockSessions}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
      />
    )

    const searchInput = screen.getByLabelText('Search loot')
    await user.type(searchInput, 'Sword')

    expect(screen.queryByText('Gold Pieces')).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('Clear all filters'))

    expect(screen.getByText('Gold Pieces')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// LootEntryForm Tests
// ---------------------------------------------------------------------------

describe('LootEntryForm', () => {
  let onSave: ReturnType<typeof vi.fn>
  let onCancel: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onSave = vi.fn()
    onCancel = vi.fn()
  })

  it('should render the form', () => {
    render(
      <LootEntryForm
        campaignId="camp-1"
        characters={mockCharacters}
        sessions={mockSessions}
        onSave={onSave}
        onCancel={onCancel}
      />
    )
    expect(screen.getByTestId('loot-entry-form')).toBeInTheDocument()
    // Both heading and button say "Add Loot"
    expect(screen.getAllByText('Add Loot')).toHaveLength(2)
  })

  it('should require item name to submit', () => {
    render(
      <LootEntryForm
        campaignId="camp-1"
        characters={mockCharacters}
        sessions={mockSessions}
        onSave={onSave}
        onCancel={onCancel}
      />
    )
    const submitButtons = screen.getAllByText('Add Loot')
    const submitBtn = submitButtons[submitButtons.length - 1]
    expect(submitBtn).toBeDisabled()
  })

  it('should submit form with basic item data', async () => {
    const user = userEvent.setup()
    render(
      <LootEntryForm
        campaignId="camp-1"
        characters={mockCharacters}
        sessions={mockSessions}
        onSave={onSave}
        onCancel={onCancel}
      />
    )

    await user.type(screen.getByLabelText('Item name'), 'Magic Sword')
    await user.type(screen.getByLabelText('Item value in GP'), '250')

    // Clear the default quantity of "1" and set to "2"
    const qtyInput = screen.getByLabelText('Quantity')
    await user.clear(qtyInput)
    await user.type(qtyInput, '2')

    await user.click(screen.getAllByText('Add Loot')[1])

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Magic Sword',
        value: 250,
        quantity: 2,
        campaignId: 'camp-1',
      })
    )
  })

  it('should allow selecting loot type', async () => {
    const user = userEvent.setup()
    render(
      <LootEntryForm
        campaignId="camp-1"
        characters={mockCharacters}
        sessions={mockSessions}
        onSave={onSave}
        onCancel={onCancel}
      />
    )

    await user.type(screen.getByLabelText('Item name'), 'Gem')
    await user.click(screen.getByLabelText('Set type to Quest Reward'))
    await user.click(screen.getAllByText('Add Loot')[1])

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'Quest Reward',
      })
    )
  })

  it('should display all 5 loot types', () => {
    render(
      <LootEntryForm
        campaignId="camp-1"
        characters={mockCharacters}
        sessions={mockSessions}
        onSave={onSave}
        onCancel={onCancel}
      />
    )

    expect(screen.getByLabelText('Set type to Gold/Currency')).toBeInTheDocument()
    expect(screen.getByLabelText('Set type to Magic Item')).toBeInTheDocument()
    expect(screen.getByLabelText('Set type to Mundane Item')).toBeInTheDocument()
    expect(screen.getByLabelText('Set type to Quest Reward')).toBeInTheDocument()
    expect(screen.getByLabelText('Set type to Other')).toBeInTheDocument()
  })

  it('should allow assigning to a character', async () => {
    const user = userEvent.setup()
    render(
      <LootEntryForm
        campaignId="camp-1"
        characters={mockCharacters}
        sessions={mockSessions}
        onSave={onSave}
        onCancel={onCancel}
      />
    )

    await user.type(screen.getByLabelText('Item name'), 'Shield')
    await user.selectOptions(
      screen.getByLabelText('Assign to character'),
      'char-1'
    )
    await user.click(screen.getAllByText('Add Loot')[1])

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        assignedTo: 'char-1',
      })
    )
  })

  it('should allow linking to a session', async () => {
    const user = userEvent.setup()
    render(
      <LootEntryForm
        campaignId="camp-1"
        characters={mockCharacters}
        sessions={mockSessions}
        onSave={onSave}
        onCancel={onCancel}
      />
    )

    await user.type(screen.getByLabelText('Item name'), 'Gem')
    await user.selectOptions(
      screen.getByLabelText('Session awarded'),
      'ses-1'
    )
    await user.click(screen.getAllByText('Add Loot')[1])

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'ses-1',
        sessionNumber: 1,
      })
    )
  })

  it('should call onCancel when cancel clicked', async () => {
    const user = userEvent.setup()
    render(
      <LootEntryForm
        campaignId="camp-1"
        characters={mockCharacters}
        sessions={mockSessions}
        onSave={onSave}
        onCancel={onCancel}
      />
    )

    await user.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('should allow entering notes', async () => {
    const user = userEvent.setup()
    render(
      <LootEntryForm
        campaignId="camp-1"
        characters={mockCharacters}
        sessions={mockSessions}
        onSave={onSave}
        onCancel={onCancel}
      />
    )

    await user.type(screen.getByLabelText('Item name'), 'Ancient Book')
    await user.type(screen.getByLabelText('Item notes'), 'Written in Elvish')
    await user.click(screen.getAllByText('Add Loot')[1])

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: 'Written in Elvish',
      })
    )
  })

  it('should list characters in the assign dropdown', () => {
    render(
      <LootEntryForm
        campaignId="camp-1"
        characters={mockCharacters}
        sessions={mockSessions}
        onSave={onSave}
        onCancel={onCancel}
      />
    )

    const select = screen.getByLabelText('Assign to character')
    expect(within(select).getByText('Party Loot (unassigned)')).toBeInTheDocument()
    expect(within(select).getByText('Thorn Ironforge')).toBeInTheDocument()
    expect(within(select).getByText('Elara Nightwhisper')).toBeInTheDocument()
    expect(within(select).getByText('Bron Stonewall')).toBeInTheDocument()
  })

  it('should list sessions in the session dropdown', () => {
    render(
      <LootEntryForm
        campaignId="camp-1"
        characters={mockCharacters}
        sessions={mockSessions}
        onSave={onSave}
        onCancel={onCancel}
      />
    )

    const select = screen.getByLabelText('Session awarded')
    expect(within(select).getByText('No session linked')).toBeInTheDocument()
    expect(
      within(select).getByText('Session 1: Into the Mines')
    ).toBeInTheDocument()
    expect(
      within(select).getByText('Session 2: Dragon Fight')
    ).toBeInTheDocument()
  })
})
