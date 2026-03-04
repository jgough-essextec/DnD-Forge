# Story 21.3 — Character Quick Actions

> **Epic 21: Character Gallery (Home Screen)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need quick-access actions for each character without opening the full sheet — duplicate, export, archive, and delete.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Character Actions**: Available from the kebab icon on each card and from the right-click context menu
- **Duplicate**: Deep copy with new ID, incremented name ("Gandalf" -> "Gandalf (Copy)"), fresh timestamps
- **Archive (Soft Delete)**: Sets `isArchived: true`. Card disappears from default view. 5-second undo toast. Viewable in "Show Archived" filter
- **Permanent Delete**: Confirmation dialog with character name. Cannot be undone. Removes from IndexedDB
- **Batch Operations**: Multi-select mode with checkbox overlay on cards. Batch action bar: Archive, Delete, Export All
- **Toast Notifications**: Success/undo feedback for all actions using shadcn/ui toast system

## Tasks
- [ ] **T21.3.1** — Create `components/gallery/CharacterActions.tsx` — a dropdown menu rendered from the kebab icon on each card and from the right-click context menu. Actions: View Character, Edit Character, Duplicate, Export as JSON, Archive, Delete
- [ ] **T21.3.2** — **Duplicate:** creates a deep copy of the character with a new ID, incremented name (e.g., "Gandalf -> Gandalf (Copy)"), and fresh timestamps. Persists immediately to IndexedDB. Shows a success toast: "Character duplicated!" with an "Open Copy" link
- [ ] **T21.3.3** — **Archive (soft delete):** sets `isArchived: true` on the character. Card disappears from the default gallery view. Show a toast: "Character archived. Undo?" with a 5-second undo timer. Archived characters appear in the "Show Archived" filtered view with a muted overlay and "Unarchive" action
- [ ] **T21.3.4** — **Permanent Delete:** confirmation dialog: "Permanently delete [Character Name]? This cannot be undone." Red "Delete" button, muted "Cancel" button. On confirm, remove from IndexedDB. Show toast: "Character deleted."
- [ ] **T21.3.5** — **Batch operations:** a "Select" mode toggle that enables multi-select on cards (checkbox overlay). When cards are selected, show a batch action bar at the bottom: "N selected — Archive | Delete | Export All"

## Acceptance Criteria
- Kebab icon on each card opens a dropdown with all action options
- Right-click context menu provides the same actions
- Duplicate creates a deep copy with new ID, "(Copy)" name suffix, and fresh timestamps
- Duplicate success toast shows with "Open Copy" link
- Archive sets `isArchived: true` and removes card from default view
- Archive toast shows "Undo?" with 5-second timer that reverses the archive
- Archived characters appear in "Show Archived" filter with muted styling and "Unarchive" action
- Permanent Delete shows confirmation dialog with character name and red Delete button
- Permanent Delete removes character from IndexedDB
- "Select" mode enables multi-select with checkbox overlay on cards
- Batch action bar appears with count and Archive/Delete/Export All options

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should create deep copy of character with new ID and "(Copy)" name suffix`
- `should handle existing copies: "Gandalf (Copy)" -> "Gandalf (Copy 2)"`
- `should set fresh timestamps (createdAt, updatedAt) on duplicated character`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render dropdown menu from kebab icon with all action options`
- `should duplicate character with new ID, "(Copy)" suffix, and fresh timestamps`
- `should show success toast with "Open Copy" link after duplicate`
- `should archive character (set isArchived: true) and remove from default gallery view`
- `should show undo toast with 5-second timer after archive`
- `should undo archive action within 5-second window`
- `should show archived characters with muted overlay in "Show Archived" view`
- `should show confirmation dialog with character name for permanent delete`
- `should remove character from IndexedDB on confirmed permanent delete`
- `should show "Character deleted" toast after permanent delete`
- `should enable multi-select mode with checkbox overlay on cards`
- `should show batch action bar with count and Archive/Delete/Export All options when cards selected`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should duplicate a character via context menu, see it appear in the gallery, and open the copy`
- `should archive a character, undo within 5 seconds, and verify the character reappears`
- `should select multiple characters, batch archive, and verify they are removed from gallery`

### Test Dependencies
- Mock IndexedDB with multiple character records for CRUD operations
- Mock toast notification system (shadcn/ui)
- Mock export utility from Story 22.1
- Mock timer for 5-second undo window

## Identified Gaps

- **Error Handling**: No specification for failure during duplicate (IndexedDB write failure), archive, or delete operations
- **Accessibility**: No keyboard shortcuts for quick actions, no ARIA labels for context menu items, no screen reader support for batch selection
- **Edge Cases**: No specification for batch delete confirmation (individual confirmation per character or single bulk confirmation?)

## Dependencies
- Story 21.1 (Gallery Grid Layout) — actions integrate with gallery cards
- Story 21.2 (Search, Filter & Sort) — "Show Archived" filter reveals archived characters
- Story 22.1 (JSON Export) — "Export as JSON" action uses the export utility
- Phase 1 IndexedDB database layer for character CRUD operations

## Notes
- The duplicate name logic should handle existing copies: "Gandalf (Copy)" -> "Gandalf (Copy 2)"
- Archive undo is implemented by keeping the character in state for 5 seconds before committing the flag
- Permanent delete is truly permanent — there's no recycle bin or recovery mechanism
- Batch operations are especially useful for housekeeping (archiving old campaign characters, exporting backups)
- The batch action bar should be a fixed bottom bar that doesn't scroll with the page
