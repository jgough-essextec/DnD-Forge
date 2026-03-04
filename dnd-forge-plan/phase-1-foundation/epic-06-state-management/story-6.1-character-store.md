# Story 6.1 — Character Store

> **Epic 6: Zustand State Management Stores** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need a Zustand store that manages the active character state and bridges to the database layer.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Zustand**: A lightweight state management library that works with React hooks. Stores are created with `create()` and consumed via `useStore()` hooks. No providers needed
- **Store state shape**: `{ activeCharacter: Character | null; characters: CharacterSummary[]; loading: boolean; error: string | null }`
  - `activeCharacter`: The currently loaded/editing character (full object). Null when no character is selected
  - `characters`: Array of CharacterSummary objects for the gallery view. Lightweight projections, not full character data
  - `loading`: True while async operations (database reads/writes) are in progress
  - `error`: Error message from the last failed operation. Null when no error
- **Database bridge**: The store's actions call the database layer functions (Story 5.2) for persistence. The store provides a reactive layer on top of the database
- **Auto-recalculation**: When the active character changes (ability scores, equipment, level, etc.), the store should automatically trigger the calculation engine (Epic 4) to recompute all derived stats (AC, HP max, skill modifiers, spell save DC, etc.) and update the character object
- **Field updater**: A generic `updateField(path, value)` function that updates any field on the active character. This avoids writing separate actions for every possible field update. The path uses dot notation (e.g., "abilityScores.strength", "equipment[0].isEquipped")

## Tasks
- [ ] **T6.1.1** — Create `stores/characterStore.ts` with state: `{ activeCharacter: Character | null; characters: CharacterSummary[]; loading: boolean; error: string | null }`
- [ ] **T6.1.2** — Implement actions: `loadCharacters()`, `loadCharacter(id)`, `saveCharacter()`, `createNewCharacter()`, `deleteCharacter(id)`, `duplicateCharacter(id)`
- [ ] **T6.1.3** — Implement `updateField(path: string, value: any)` — generic field updater with auto-recalculation trigger
- [ ] **T6.1.4** — Implement computed derivations: whenever the character changes, recompute all derived stats via the calculation engine
- [ ] **T6.1.5** — Write tests: store initializes empty, loading a character populates state, updates trigger recalculation

## Acceptance Criteria
- The store initializes with `activeCharacter: null`, empty `characters` array, `loading: false`, `error: null`
- `loadCharacters()` fetches all character summaries from the database and populates the `characters` array
- `loadCharacter(id)` fetches the full character from the database, sets it as `activeCharacter`, and triggers recalculation
- `saveCharacter()` persists the active character to the database via `updateCharacter()`
- `createNewCharacter()` calls `createCharacter()` and sets the result as `activeCharacter`
- `deleteCharacter(id)` removes from database and updates the `characters` list
- `duplicateCharacter(id)` creates a clone and adds it to the `characters` list
- `updateField()` updates the specified field path on `activeCharacter` and triggers auto-recalculation
- Derived stats (AC, HP, modifiers, etc.) are automatically recalculated when `activeCharacter` changes
- All async actions properly set `loading` and `error` states
- Tests verify initialization, loading, updates, and recalculation triggers

## Dependencies
- **Depends on:** Story 5.2 (Character CRUD functions), Story 5.4 (auto-save hook), Story 2.8 (Character, CharacterSummary types), Epic 4 (calculation engine for derived stat computation)
- **Blocks:** All Phase 2+ UI components that display or edit character data

## Notes
- The `updateField` function needs a way to set deeply nested values. Consider using `lodash-es/set` (immutable version) or a custom path-based setter. The path should support dot notation and array indexing
- Auto-recalculation should be debounced or batched to avoid excessive computation when multiple fields change in rapid succession (e.g., during point buy where the user adjusts multiple scores quickly)
- The `loading` flag should be set to true before any async operation and false after completion (success or failure). Use try/finally pattern
- Error handling: failed database operations should set the `error` field with a human-readable message. The UI can display this as a toast notification
- Consider adding a `derivedStats` computed property or separate object that holds all calculated values (AC, HP, modifiers, etc.) to avoid recalculating on every render
- The store does NOT use Zustand's persist middleware — character data is persisted via the database layer, not localStorage
