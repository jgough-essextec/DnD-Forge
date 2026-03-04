# Story 20.2 — Auto-Save with Debouncing

> **Epic 20: View / Edit Mode Toggle System** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player editing my character, I need my changes to save automatically without me having to click a save button, but without overwhelming the database with writes.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Debounce Strategy**: 500ms debounce timer. On field change, start timer. If another change occurs before timer fires, reset timer. When timer fires, write to IndexedDB via `updateCharacter()`
- **Save Status Indicator**: Visual indicator in header showing current save state (Saved, Saving..., Unsaved changes, Save failed)
- **Optimistic Concurrency**: Increment character's `version` field on every save. Detect conflicts if two tabs edit the same character
- **Emergency Save**: If IndexedDB is unavailable, save to sessionStorage as JSON backup
- **beforeunload**: Warn on tab close if unsaved changes exist
- **Dexie.js**: IndexedDB wrapper used for database operations (from Phase 1)

## Tasks
- [ ] **T20.2.1** — Implement auto-save in the `useCharacter` hook: when any character field changes, start a 500ms debounce timer. If another change occurs before the timer fires, reset the timer. When the timer fires, write the updated character to IndexedDB via `updateCharacter()`
- [ ] **T20.2.2** — Display a save status indicator in the character sheet header:
  - "Saved" (green checkmark) — no pending changes
  - "Saving..." (spinning icon) — debounce timer fired, write in progress
  - "Unsaved changes" (yellow dot) — changes exist but debounce timer hasn't fired yet
  - "Save failed" (red X) — IndexedDB write failed, show retry button
- [ ] **T20.2.3** — Implement optimistic concurrency: increment the character's `version` field on every save. If two tabs somehow edit the same character, detect the conflict on write and show a merge dialog (or "last write wins" with a warning)
- [ ] **T20.2.4** — On tab close / browser navigation while in edit mode with unsaved changes, trigger `beforeunload` confirmation: "You have unsaved changes. Leave anyway?"
- [ ] **T20.2.5** — Emergency save: if the debounce timer fires but IndexedDB is unavailable (e.g., storage quota exceeded), attempt to save the character as JSON in sessionStorage as a backup. Show a warning: "Auto-save failed. Your changes are temporarily stored. Please export your character as JSON."

## Acceptance Criteria
- Changes auto-save to IndexedDB after a 500ms debounce period
- Rapid changes reset the debounce timer (no excessive writes)
- Save status indicator shows correct state: Saved, Saving, Unsaved changes, or Save failed
- Save failed state provides a retry button
- Character version field increments on every save for conflict detection
- Tab close/navigation triggers beforeunload warning when unsaved changes exist
- Emergency save to sessionStorage works when IndexedDB is unavailable
- Emergency save shows a warning with guidance to export as JSON

## Dependencies
- Phase 1 IndexedDB database layer (Dexie.js) and Character type system
- Phase 1 state management (Zustand) for tracking save state
- Story 20.1 (Mode Toggle) — auto-save is active during edit mode

## Notes
- The 500ms debounce interval balances responsiveness with database performance
- The auto-save interval can be configured in settings (Story 25.3): 500ms / 1s / 2s / manual only
- The optimistic concurrency version field is a simple integer increment — not a full conflict resolution system
- The emergency sessionStorage save is a safety net — it should rarely be needed
- Currency changes, HP changes, and spell slot changes also trigger auto-save even in view mode
