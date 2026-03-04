/**
 * Tests for DMNotesPanel component (Story 36.1)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DMNotesPanel } from '../DMNotesPanel'
import type { CharacterDMNote, DMNoteTag } from '@/utils/dm-notes'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeNote(overrides: Partial<CharacterDMNote> = {}): CharacterDMNote {
  return {
    characterId: 'char-1',
    characterName: 'Thorn Ironforge',
    content: '',
    tags: [],
    updatedAt: '2024-06-15T12:00:00Z',
    ...overrides,
  }
}

const mockNotes: CharacterDMNote[] = [
  makeNote({
    characterId: 'char-1',
    characterName: 'Thorn Ironforge',
    content: 'Secretly working for the guild.',
    tags: ['Secret' as DMNoteTag],
  }),
  makeNote({
    characterId: 'char-2',
    characterName: 'Elara Nightwhisper',
    content: 'Has a **hidden agenda** with the elves.',
    tags: ['Plot Hook' as DMNoteTag, 'Motivation' as DMNoteTag],
  }),
  makeNote({
    characterId: 'char-3',
    characterName: 'Bron Stonewall',
    content: '',
    tags: [],
  }),
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DMNotesPanel', () => {
  let onSaveNote: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    onSaveNote = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render DM notes panel', () => {
    render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={mockNotes}
        onSaveNote={onSaveNote}
        isDMView={true}
      />
    )
    expect(screen.getByTestId('dm-notes-panel')).toBeInTheDocument()
    expect(screen.getByText('DM Notes')).toBeInTheDocument()
  })

  it('should NOT render dmNotes when character is viewed from gallery (player context)', () => {
    const { container } = render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={mockNotes}
        onSaveNote={onSaveNote}
        isDMView={false}
      />
    )
    expect(container.innerHTML).toBe('')
  })

  it('should render dmNotes when character is viewed from campaign dashboard (DM context)', () => {
    render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={mockNotes}
        onSaveNote={onSaveNote}
        isDMView={true}
      />
    )
    expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
    expect(screen.getByText('Elara Nightwhisper')).toBeInTheDocument()
    expect(screen.getByText('Bron Stonewall')).toBeInTheDocument()
  })

  it('should display character names as expandable sections', () => {
    render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={mockNotes}
        onSaveNote={onSaveNote}
      />
    )
    const buttons = screen.getAllByRole('button', { expanded: false })
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('should expand character section to show note editor', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={mockNotes}
        onSaveNote={onSaveNote}
      />
    )

    // Click on Thorn's name to expand
    const thornSection = screen.getByText('Thorn Ironforge').closest('button')!
    await user.click(thornSection)

    // Should show the textarea
    expect(
      screen.getByLabelText('DM notes for Thorn Ironforge')
    ).toBeInTheDocument()
  })

  it('should display markdown-lite editor with real-time preview', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={mockNotes}
        onSaveNote={onSaveNote}
      />
    )

    // Expand Thorn's section
    const thornSection = screen.getByText('Thorn Ironforge').closest('button')!
    await user.click(thornSection)

    // Click "Show Preview"
    const previewBtn = screen.getByLabelText('Show preview')
    await user.click(previewBtn)

    // Preview should be visible
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
  })

  it('should auto-save notes via callback on 500ms debounce after editing', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={[makeNote()]}
        onSaveNote={onSaveNote}
      />
    )

    // Expand the section
    const section = screen.getByText('Thorn Ironforge').closest('button')!
    await user.click(section)

    // Type in the textarea
    const textarea = screen.getByLabelText('DM notes for Thorn Ironforge')
    await user.type(textarea, 'New note content')

    // Before 500ms, onSaveNote should not have been called with final content
    expect(onSaveNote).not.toHaveBeenCalled()

    // Advance timers past debounce
    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(onSaveNote).toHaveBeenCalled()
    expect(onSaveNote).toHaveBeenCalledWith(
      'char-1',
      expect.any(String),
      expect.any(Array)
    )
  })

  it('should add quick-note tags (Secret, Plot Hook, Relationship, Motivation, Weakness) as colored badges', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={[makeNote()]}
        onSaveNote={onSaveNote}
      />
    )

    // Expand the section
    const section = screen.getByText('Thorn Ironforge').closest('button')!
    await user.click(section)

    // Verify all 5 tag buttons exist
    expect(screen.getByLabelText('Add Secret tag')).toBeInTheDocument()
    expect(screen.getByLabelText('Add Plot Hook tag')).toBeInTheDocument()
    expect(screen.getByLabelText('Add Relationship tag')).toBeInTheDocument()
    expect(screen.getByLabelText('Add Motivation tag')).toBeInTheDocument()
    expect(screen.getByLabelText('Add Weakness tag')).toBeInTheDocument()

    // Click on "Secret" tag
    await user.click(screen.getByLabelText('Add Secret tag'))

    // Tag should appear as badge
    const activeTags = screen.getByTestId('active-tags')
    expect(within(activeTags).getByText('Secret')).toBeInTheDocument()
  })

  it('should display "All DM Notes" view showing notes organized by character name', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={mockNotes}
        onSaveNote={onSaveNote}
      />
    )

    // Switch to "All Notes" view
    await user.click(screen.getByText('All Notes'))

    const allNotesView = screen.getByTestId('all-notes-view')
    expect(allNotesView).toBeInTheDocument()

    // Should show notes for characters that have content
    expect(within(allNotesView).getByText('Thorn Ironforge')).toBeInTheDocument()
    expect(
      within(allNotesView).getByText('Elara Nightwhisper')
    ).toBeInTheDocument()
    // Bron has no content/tags, shouldn't show in "All Notes"
    expect(
      within(allNotesView).queryByText('Bron Stonewall')
    ).not.toBeInTheDocument()
  })

  it('should show tag count in collapsed header', () => {
    render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={mockNotes}
        onSaveNote={onSaveNote}
      />
    )

    // Thorn has 1 tag
    expect(screen.getByText('(1 tag)')).toBeInTheDocument()
    // Elara has 2 tags
    expect(screen.getByText('(2 tags)')).toBeInTheDocument()
  })

  it('should show empty state when no characters', () => {
    render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={[]}
        onSaveNote={onSaveNote}
      />
    )
    expect(screen.getByText('No characters in this campaign yet.')).toBeInTheDocument()
  })

  it('should focus on a single character when focusCharacterId is provided', () => {
    render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={mockNotes}
        onSaveNote={onSaveNote}
        focusCharacterId="char-1"
      />
    )
    expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
    expect(screen.queryByText('Elara Nightwhisper')).not.toBeInTheDocument()
  })

  it('should remove a tag when clicking the X on an active tag', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={[makeNote({ tags: ['Secret'] })]}
        onSaveNote={onSaveNote}
      />
    )

    // Expand section
    const section = screen.getByText('Thorn Ironforge').closest('button')!
    await user.click(section)

    // Should show the tag
    expect(screen.getByTestId('active-tags')).toBeInTheDocument()

    // Click remove
    await user.click(screen.getByLabelText('Remove Secret tag'))

    // Tag should be gone
    expect(screen.queryByTestId('active-tags')).not.toBeInTheDocument()
  })

  it('should toggle tag on/off with quick-note buttons', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(
      <DMNotesPanel
        campaignId="camp-1"
        characterNotes={[makeNote()]}
        onSaveNote={onSaveNote}
      />
    )

    // Expand
    const section = screen.getByText('Thorn Ironforge').closest('button')!
    await user.click(section)

    // Add tag
    const secretBtn = screen.getByLabelText('Add Secret tag')
    await user.click(secretBtn)

    expect(screen.getByTestId('active-tags')).toBeInTheDocument()

    // Click again to toggle off
    await user.click(secretBtn)

    expect(screen.queryByTestId('active-tags')).not.toBeInTheDocument()
  })
})
