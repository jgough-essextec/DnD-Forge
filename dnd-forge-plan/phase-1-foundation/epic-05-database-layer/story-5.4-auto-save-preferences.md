# Story 5.4 — Auto-Save & Preferences

> **Epic 5: Database Layer (IndexedDB via Dexie.js)** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need debounced auto-save for character edits and user preference persistence.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Auto-save**: As the user edits a character (changing ability scores, adding equipment, preparing spells, etc.), changes should be automatically persisted to IndexedDB. A debounce of 500ms prevents excessive writes — rapid successive changes coalesce into a single save operation
- **useAutoSave hook**: A React hook that watches a character object and triggers a debounced save. It should: (1) detect changes via reference equality or deep comparison, (2) debounce the save call by 500ms (configurable), (3) call `updateCharacter()` from Story 5.2, (4) handle save errors gracefully (show a toast/notification, don't lose data)
- **User preferences**: Application-wide settings stored in IndexedDB. There is typically a single preferences record. The `UserPreferences` interface (from Story 2.10) includes:
  - `diceAnimations: boolean` — whether to show animated dice rolls
  - `autoCalculate: boolean` — whether derived stats auto-update
  - `theme: 'dark' | 'light'` — color theme
  - `defaultAbilityScoreMethod: string` — default method for new characters
  - `showTooltips: boolean` — whether to show D&D rule tooltips
- **Default preferences**: If no preferences record exists (first app load), create one with sensible defaults: diceAnimations=true, autoCalculate=true, theme='dark', defaultAbilityScoreMethod='standard', showTooltips=true

## Tasks
- [ ] **T5.4.1** — Implement `useAutoSave(character: Character, delay?: number)` hook — debounces 500ms, calls `updateCharacter`
- [ ] **T5.4.2** — Implement `getPreferences(): Promise<UserPreferences>`
- [ ] **T5.4.3** — Implement `updatePreferences(prefs: Partial<UserPreferences>): Promise<void>`
- [ ] **T5.4.4** — Create default preferences constant
- [ ] **T5.4.5** — Write test: auto-save triggers after delay, multiple rapid changes coalesce into single save

## Acceptance Criteria
- `useAutoSave` debounces saves by 500ms (or configurable delay)
- Multiple rapid character changes result in only one database write
- Auto-save does not fire if the character has not actually changed
- `getPreferences()` returns stored preferences or creates/returns defaults if none exist
- `updatePreferences()` merges partial updates into existing preferences
- Default preferences are sensible and applied on first load
- Tests verify debounce behavior and change coalescing

## Dependencies
- **Depends on:** Story 5.1 (database schema), Story 5.2 (updateCharacter function), Story 2.8 (Character type), Story 2.10 (UserPreferences type)
- **Blocks:** Epic 6 Story 6.1 (Character store uses auto-save), Epic 6 Story 6.3 (UI store uses preferences for theme)

## Notes
- The debounce implementation can use `lodash-es/debounce` (installed in Story 1.3) or a custom implementation with `setTimeout`/`clearTimeout`
- The hook should clean up the debounce timer on unmount to prevent saving after the component is gone
- Consider adding a "save in progress" indicator that the UI can consume (e.g., a small spinner or "Saving..." text in the status bar)
- Error handling in auto-save should not throw — instead, it should log the error and potentially retry once. Lost data due to a failed auto-save would be a terrible user experience
- The `getPreferences` function should use a put-if-absent pattern: check if the record exists, if not, insert the defaults and return them
- Preferences are stored with a fixed ID (e.g., `'default'`) since there is only one preferences record per browser
