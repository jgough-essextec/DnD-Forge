/**
 * Tests for NPCTracker, NPCCard, and NPCForm components (Story 36.3)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NPCTracker } from '../NPCTracker'
import { NPCCard } from '../NPCCard'
import { NPCForm } from '../NPCForm'
import type { NPCEntry } from '@/utils/dm-notes'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeNPC(overrides: Partial<NPCEntry> = {}): NPCEntry {
  return {
    id: 'npc-1',
    campaignId: 'camp-1',
    name: 'Lord Neverember',
    description: 'A noble lord of Neverwinter',
    location: 'Neverwinter',
    relationship: 'Patron of the party',
    roles: ['Patron'],
    status: 'Alive',
    ...overrides,
  }
}

const mockNPCs: NPCEntry[] = [
  makeNPC({
    id: 'npc-1',
    name: 'Lord Neverember',
    roles: ['Patron', 'Ally'],
    status: 'Alive',
    location: 'Neverwinter',
    description: 'A noble lord',
  }),
  makeNPC({
    id: 'npc-2',
    name: 'Glasstaff',
    roles: ['Enemy'],
    status: 'Dead',
    location: 'Tresendar Manor',
    description: 'A corrupt wizard',
  }),
  makeNPC({
    id: 'npc-3',
    name: 'Bartender Bob',
    roles: ['Neutral', 'Merchant'],
    status: 'Alive',
    location: 'The Rusty Nail',
    description: 'A friendly tavern keeper',
  }),
  makeNPC({
    id: 'npc-4',
    name: 'Captured Knight',
    roles: ['Quest Giver'],
    status: 'Captured',
    location: 'Cragmaw Castle',
    description: 'A knight held prisoner',
  }),
  makeNPC({
    id: 'npc-5',
    name: 'Unknown Figure',
    roles: [],
    status: 'Unknown',
    location: undefined,
    description: 'A mysterious cloaked figure',
  }),
]

// ---------------------------------------------------------------------------
// NPCTracker Tests
// ---------------------------------------------------------------------------

describe('NPCTracker', () => {
  let onAddNPC: ReturnType<typeof vi.fn>
  let onUpdateNPC: ReturnType<typeof vi.fn>
  let onDeleteNPC: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onAddNPC = vi.fn()
    onUpdateNPC = vi.fn()
    onDeleteNPC = vi.fn()
  })

  it('should render NPC tracker with count', () => {
    render(
      <NPCTracker
        campaignId="camp-1"
        npcs={mockNPCs}
        onAddNPC={onAddNPC}
        onUpdateNPC={onUpdateNPC}
        onDeleteNPC={onDeleteNPC}
      />
    )
    expect(screen.getByTestId('npc-tracker')).toBeInTheDocument()
    expect(screen.getByText('NPC Tracker')).toBeInTheDocument()
    expect(screen.getByText('(5 NPCs)')).toBeInTheDocument()
  })

  it('should display NPC cards with name, role badges, status badge, and description preview', () => {
    render(
      <NPCTracker
        campaignId="camp-1"
        npcs={mockNPCs}
        onAddNPC={onAddNPC}
        onUpdateNPC={onUpdateNPC}
        onDeleteNPC={onDeleteNPC}
      />
    )
    expect(screen.getByText('Lord Neverember')).toBeInTheDocument()
    expect(screen.getByText('Glasstaff')).toBeInTheDocument()
    expect(screen.getByText('Bartender Bob')).toBeInTheDocument()
  })

  it('should open form on "Add NPC" click', async () => {
    const user = userEvent.setup()
    render(
      <NPCTracker
        campaignId="camp-1"
        npcs={mockNPCs}
        onAddNPC={onAddNPC}
        onUpdateNPC={onUpdateNPC}
        onDeleteNPC={onDeleteNPC}
      />
    )

    await user.click(screen.getByLabelText('Add NPC'))
    expect(screen.getByTestId('npc-form')).toBeInTheDocument()
  })

  it('should search NPCs by name', async () => {
    const user = userEvent.setup()
    render(
      <NPCTracker
        campaignId="camp-1"
        npcs={mockNPCs}
        onAddNPC={onAddNPC}
        onUpdateNPC={onUpdateNPC}
        onDeleteNPC={onDeleteNPC}
      />
    )

    const searchInput = screen.getByLabelText('Search NPCs')
    await user.type(searchInput, 'Lord')

    expect(screen.getByText('Lord Neverember')).toBeInTheDocument()
    expect(screen.queryByText('Glasstaff')).not.toBeInTheDocument()
    expect(screen.queryByText('Bartender Bob')).not.toBeInTheDocument()
  })

  it('should filter NPCs by role', async () => {
    const user = userEvent.setup()
    render(
      <NPCTracker
        campaignId="camp-1"
        npcs={mockNPCs}
        onAddNPC={onAddNPC}
        onUpdateNPC={onUpdateNPC}
        onDeleteNPC={onDeleteNPC}
      />
    )

    // Open filters
    await user.click(screen.getByLabelText('Toggle filters'))

    const roleFilters = screen.getByTestId('role-filters')
    await user.click(within(roleFilters).getByText('Enemy'))

    expect(screen.getByText('Glasstaff')).toBeInTheDocument()
    expect(screen.queryByText('Lord Neverember')).not.toBeInTheDocument()
  })

  it('should filter NPCs by status', async () => {
    const user = userEvent.setup()
    render(
      <NPCTracker
        campaignId="camp-1"
        npcs={mockNPCs}
        onAddNPC={onAddNPC}
        onUpdateNPC={onUpdateNPC}
        onDeleteNPC={onDeleteNPC}
      />
    )

    // Open filters
    await user.click(screen.getByLabelText('Toggle filters'))

    const statusFilters = screen.getByTestId('status-filters')
    await user.click(within(statusFilters).getByText('Dead'))

    expect(screen.getByText('Glasstaff')).toBeInTheDocument()
    expect(screen.queryByText('Lord Neverember')).not.toBeInTheDocument()
  })

  it('should show empty state when no NPCs', () => {
    render(
      <NPCTracker
        campaignId="camp-1"
        npcs={[]}
        onAddNPC={onAddNPC}
        onUpdateNPC={onUpdateNPC}
        onDeleteNPC={onDeleteNPC}
      />
    )
    expect(screen.getByText('No NPCs tracked yet.')).toBeInTheDocument()
  })

  it('should show no results message when filters match nothing', async () => {
    const user = userEvent.setup()
    render(
      <NPCTracker
        campaignId="camp-1"
        npcs={mockNPCs}
        onAddNPC={onAddNPC}
        onUpdateNPC={onUpdateNPC}
        onDeleteNPC={onDeleteNPC}
      />
    )

    const searchInput = screen.getByLabelText('Search NPCs')
    await user.type(searchInput, 'xyznonexistent')

    expect(screen.getByText('No NPCs match your search.')).toBeInTheDocument()
  })

  it('should clear all filters when clear button clicked', async () => {
    const user = userEvent.setup()
    render(
      <NPCTracker
        campaignId="camp-1"
        npcs={mockNPCs}
        onAddNPC={onAddNPC}
        onUpdateNPC={onUpdateNPC}
        onDeleteNPC={onDeleteNPC}
      />
    )

    // Search first
    const searchInput = screen.getByLabelText('Search NPCs')
    await user.type(searchInput, 'Lord')

    expect(screen.queryByText('Glasstaff')).not.toBeInTheDocument()

    // Clear filters
    await user.click(screen.getByLabelText('Clear all filters'))

    expect(screen.getByText('Glasstaff')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// NPCCard Tests
// ---------------------------------------------------------------------------

describe('NPCCard', () => {
  let onUpdate: ReturnType<typeof vi.fn>
  let onDelete: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    onUpdate = vi.fn()
    onDelete = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should display NPC name, role badges, and status badge', () => {
    render(<NPCCard npc={mockNPCs[0]} onUpdate={onUpdate} onDelete={onDelete} />)
    expect(screen.getByText('Lord Neverember')).toBeInTheDocument()
    expect(screen.getByText('Patron')).toBeInTheDocument()
    expect(screen.getByText('Ally')).toBeInTheDocument()
    expect(screen.getByText('Alive')).toBeInTheDocument()
  })

  it('should show description preview when collapsed', () => {
    render(<NPCCard npc={mockNPCs[0]} onUpdate={onUpdate} onDelete={onDelete} />)
    expect(screen.getByText('A noble lord')).toBeInTheDocument()
  })

  it('should show location when collapsed', () => {
    render(<NPCCard npc={mockNPCs[0]} onUpdate={onUpdate} onDelete={onDelete} />)
    expect(screen.getByText('Neverwinter')).toBeInTheDocument()
  })

  it('should expand to show all editable fields on click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<NPCCard npc={mockNPCs[0]} onUpdate={onUpdate} onDelete={onDelete} />)

    const card = screen.getByLabelText('NPC: Lord Neverember')
    await user.click(card)

    // Editable fields should appear
    expect(screen.getByLabelText('NPC name')).toBeInTheDocument()
    expect(screen.getByLabelText('NPC description')).toBeInTheDocument()
    expect(screen.getByLabelText('NPC location')).toBeInTheDocument()
    expect(screen.getByLabelText('NPC relationship')).toBeInTheDocument()
    expect(screen.getByLabelText('NPC DM notes')).toBeInTheDocument()
  })

  it('should auto-save NPC changes on field edit', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <NPCCard
        npc={mockNPCs[0]}
        onUpdate={onUpdate}
        onDelete={onDelete}
        defaultExpanded={true}
      />
    )

    const descField = screen.getByLabelText('NPC description')
    await user.clear(descField)
    await user.type(descField, 'Updated description')

    // Wait for debounce
    vi.advanceTimersByTime(600)

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Updated description',
      })
    )
  })

  it('should toggle roles when role buttons are clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <NPCCard
        npc={makeNPC({ roles: [] })}
        onUpdate={onUpdate}
        onDelete={onDelete}
        defaultExpanded={true}
      />
    )

    await user.click(screen.getByLabelText('Toggle Enemy role'))

    vi.advanceTimersByTime(600)

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        roles: ['Enemy'],
      })
    )
  })

  it('should change status when status button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <NPCCard
        npc={makeNPC({ status: 'Alive' })}
        onUpdate={onUpdate}
        onDelete={onDelete}
        defaultExpanded={true}
      />
    )

    await user.click(screen.getByLabelText('Set status to Dead'))

    vi.advanceTimersByTime(600)

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'Dead',
      })
    )
  })

  it('should show delete confirmation and call onDelete', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <NPCCard
        npc={mockNPCs[0]}
        onUpdate={onUpdate}
        onDelete={onDelete}
        defaultExpanded={true}
      />
    )

    await user.click(screen.getByLabelText('Delete NPC'))

    expect(screen.getByText('Delete Lord Neverember?')).toBeInTheDocument()

    await user.click(screen.getByTestId('confirm-delete-npc'))

    expect(onDelete).toHaveBeenCalledWith('npc-1')
  })

  it('should display all role types as toggle buttons', () => {
    render(
      <NPCCard
        npc={makeNPC()}
        onUpdate={onUpdate}
        onDelete={onDelete}
        defaultExpanded={true}
      />
    )
    expect(screen.getByLabelText('Toggle Ally role')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle Enemy role')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle Neutral role')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle Patron role')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle Merchant role')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle Quest Giver role')).toBeInTheDocument()
  })

  it('should display all status types as selection buttons', () => {
    render(
      <NPCCard
        npc={makeNPC()}
        onUpdate={onUpdate}
        onDelete={onDelete}
        defaultExpanded={true}
      />
    )
    expect(screen.getByLabelText('Set status to Alive')).toBeInTheDocument()
    expect(screen.getByLabelText('Set status to Dead')).toBeInTheDocument()
    expect(screen.getByLabelText('Set status to Unknown')).toBeInTheDocument()
    expect(screen.getByLabelText('Set status to Captured')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// NPCForm Tests
// ---------------------------------------------------------------------------

describe('NPCForm', () => {
  let onSave: ReturnType<typeof vi.fn>
  let onCancel: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onSave = vi.fn()
    onCancel = vi.fn()
  })

  it('should render the form', () => {
    render(
      <NPCForm campaignId="camp-1" onSave={onSave} onCancel={onCancel} />
    )
    expect(screen.getByTestId('npc-form')).toBeInTheDocument()
    // Both heading and button say "Add NPC"
    expect(screen.getAllByText('Add NPC')).toHaveLength(2)
  })

  it('should create a new NPC with only a name (all other fields optional)', async () => {
    const user = userEvent.setup()
    render(
      <NPCForm campaignId="camp-1" onSave={onSave} onCancel={onCancel} />
    )

    await user.type(screen.getByLabelText('NPC name'), 'New NPC')
    await user.click(screen.getAllByText('Add NPC')[1]) // submit button

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New NPC',
        campaignId: 'camp-1',
        status: 'Alive',
        roles: [],
      })
    )
  })

  it('should require name to submit', () => {
    render(
      <NPCForm campaignId="camp-1" onSave={onSave} onCancel={onCancel} />
    )
    const submitButtons = screen.getAllByText('Add NPC')
    const submitBtn = submitButtons[submitButtons.length - 1]
    expect(submitBtn).toBeDisabled()
  })

  it('should allow setting roles and status', async () => {
    const user = userEvent.setup()
    render(
      <NPCForm campaignId="camp-1" onSave={onSave} onCancel={onCancel} />
    )

    await user.type(screen.getByLabelText('NPC name'), 'Test NPC')
    await user.click(screen.getByLabelText('Toggle Enemy role'))
    await user.click(screen.getByLabelText('Set status to Dead'))

    await user.click(screen.getAllByText('Add NPC')[1])

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        roles: ['Enemy'],
        status: 'Dead',
      })
    )
  })

  it('should call onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    render(
      <NPCForm campaignId="camp-1" onSave={onSave} onCancel={onCancel} />
    )

    await user.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('should allow entering description, location, and relationship', async () => {
    const user = userEvent.setup()
    render(
      <NPCForm campaignId="camp-1" onSave={onSave} onCancel={onCancel} />
    )

    await user.type(screen.getByLabelText('NPC name'), 'Detailed NPC')
    await user.type(screen.getByLabelText('NPC description'), 'Tall and mysterious')
    await user.type(screen.getByLabelText('NPC location'), 'Dark Forest')
    await user.type(screen.getByLabelText('NPC relationship'), 'Old friend')

    await user.click(screen.getAllByText('Add NPC')[1])

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Detailed NPC',
        description: 'Tall and mysterious',
        location: 'Dark Forest',
        relationship: 'Old friend',
      })
    )
  })
})
