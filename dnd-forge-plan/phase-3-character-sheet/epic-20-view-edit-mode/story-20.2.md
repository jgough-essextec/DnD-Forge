# Story 20.2 — Auto-Save with Debouncing

> **Epic 20: View / Edit Mode Toggle System** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player editing my character, I need my changes to save automatically without me having to click a save button, but without overwhelming the database with writes.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Debounce Strategy**: 500ms debounce timer. On field change, start timer. If another change occurs before timer fires, reset timer. When timer fires, PUT /api/characters/:id via React Query mutation
- **Save Status Indicator**: Visual indicator in header showing current save state (Saved, Saving..., Unsaved changes, Save failed)
- **Optimistic Concurrency**: Increment character's `version` field on every save. Detect conflicts if two tabs edit the same character
- **Emergency Save**: If API is unavailable, save to sessionStorage as JSON backup
- **beforeunload**: Warn on tab close if unsaved changes exist

## Tasks
- [ ] **T20.2.1** — Implement auto-save in the `useCharacter` hook: when any character field changes, start a 500ms debounce timer. If another change occurs before the timer fires, reset the timer. When the timer fires, PUT /api/characters/:id via React Query mutation
- [ ] **T20.2.2** — Display a save status indicator in the character sheet header:
  - "Saved" (green checkmark) — no pending changes
  - "Saving..." (spinning icon) — debounce timer fired, write in progress
  - "Unsaved changes" (yellow dot) — changes exist but debounce timer hasn't fired yet
  - "Save failed" (red X) — API request failed, show retry button
- [ ] **T20.2.3** — Implement optimistic concurrency: increment the character's `version` field on every save. If two tabs somehow edit the same character, detect the conflict on write and show a merge dialog (or "last write wins" with a warning)
- [ ] **T20.2.4** — On tab close / browser navigation while in edit mode with unsaved changes, trigger `beforeunload` confirmation: "You have unsaved changes. Leave anyway?"
- [ ] **T20.2.5** — Emergency save: if the debounce timer fires but the API is unavailable (e.g., network error or server down), attempt to save the character as JSON in sessionStorage as a backup. Show a warning: "Auto-save failed. Your changes are temporarily stored. Please export your character as JSON."

## Acceptance Criteria
- Changes auto-save via API (PUT /api/characters/:id) after a 500ms debounce period
- Rapid changes reset the debounce timer (no excessive writes)
- Save status indicator shows correct state: Saved, Saving, Unsaved changes, or Save failed
- Save failed state provides a retry button
- Character version field increments on every save for conflict detection
- Tab close/navigation triggers beforeunload warning when unsaved changes exist
- Emergency save to sessionStorage works when the API is unavailable
- Emergency save shows a warning with guidance to export as JSON

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should debounce save calls at 500ms interval`
- `should reset debounce timer when new changes occur before timer fires`
- `should increment character version field on every successful save`
- `should detect version conflict when two saves have different base versions`
- `should serialize character data for sessionStorage emergency save`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should display "Saved" indicator (green checkmark) when no pending changes`
- `should display "Unsaved changes" indicator (yellow dot) when changes exist but debounce timer hasn't fired`
- `should display "Saving..." indicator (spinning icon) when write is in progress`
- `should display "Save failed" indicator (red X) with retry button when API request fails`
- `should trigger beforeunload warning on tab close when unsaved changes exist`
- `should save to sessionStorage as emergency backup when API is unavailable`
- `should show warning message guiding user to export as JSON when emergency save is triggered`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should make an edit, see "Unsaved changes" indicator, wait for debounce, and see "Saved" indicator`

### Test Dependencies
- MSW (Mock Service Worker) to mock PUT /api/characters/:id with success and failure scenarios
- Mock React Query mutation state for save status tracking
- Mock debounce timer (use fake timers in tests)
- Mock sessionStorage for emergency save testing
- Mock beforeunload event

## Identified Gaps

- **Error Handling**: No specification for retry behavior after "Save failed" (how many retries? exponential backoff?)
- **Edge Cases**: No specification for concurrent editing in two browser tabs with the same character beyond "last write wins"
- **Performance**: No specification for maximum character data size that auto-save should handle efficiently

## Dependencies
- Django REST API endpoints for character CRUD and React Query for API state management
- Phase 1 Character type system
- Story 20.1 (Mode Toggle) — auto-save is active during edit mode

## Notes
- The 500ms debounce interval balances responsiveness with API call frequency
- The auto-save interval can be configured in settings (Story 25.3): 500ms / 1s / 2s / manual only
- The optimistic concurrency version field is a simple integer increment — not a full conflict resolution system
- The emergency sessionStorage save is a safety net — it should rarely be needed
- Currency changes, HP changes, and spell slot changes also trigger auto-save even in view mode
