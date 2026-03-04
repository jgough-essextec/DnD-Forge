# Epic 6: State Management (React Query + Zustand)
> **Phase 1: Foundation** (Weeks 1-2)

## Summary
Application-level state management using React Query for server state (characters, campaigns, preferences) and Zustand for UI-only state (wizard progress, modals, dice history). React Query handles all API communication, caching, and optimistic updates; Zustand handles transient client-side state.

## Stories
| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 6.1 | Character React Query Hooks | 5 | React Query hooks (useCharacters, useCharacter, useCreateCharacter, useUpdateCharacter, useDeleteCharacter) wrapping API endpoints, with cache invalidation and optimistic updates |
| 6.2 | Wizard Store (Zustand) | 5 | Zustand store for character creation wizard state that survives page navigation; `finalize()` assembles complete Character and submits via API mutation |
| 6.3 | UI Store (Zustand) | 3 | Zustand store for transient UI state: modals, sidebar, edit mode, mobile nav, theme, responsive breakpoints; syncs user preferences from API on login |
| 6.4 | Dice Store (Zustand) | 4 | Zustand store for dice roll history and configuration with advantage/disadvantage support and history management |

## Technical Scope
- **Server state:** React Query (@tanstack/react-query) for all API data — characters, campaigns, preferences
- **UI state:** Zustand for transient client-side state — wizard progress, modals, dice history
- **Pattern:** React Query hooks manage fetching, caching, mutations, and cache invalidation; Zustand stores manage local-only state with no server persistence
- **Character hooks:** React Query queries and mutations wrapping DRF API endpoints, with optimistic updates and auto-recalculation of derived stats
- **Wizard store:** Zustand with persist middleware (sessionStorage) so creation progress survives navigation; `finalize()` assembles complete Character and calls the create character API mutation
- **UI store:** Transient state for modals, sidebar, edit mode, responsive detection; syncs theme/preferences from user preferences API
- **Dice store:** Roll history with truncation, advantage/disadvantage mechanics (client-side only)

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 6.1 — Character React Query Hooks | 11 | 0 | 0 | 11 |
| 6.2 — Wizard Store | 11 | 0 | 0 | 11 |
| 6.3 — UI Store | 6 | 3 | 0 | 9 |
| 6.4 — Dice Store | 10 | 0 | 0 | 10 |
| **Totals** | **38** | **3** | **0** | **41** |

### Key Gaps Found
- React Query error/retry configuration for API failures not specified
- Auto-recalculation debouncing for rapid field updates not specified as acceptance criteria
- Wizard store finalize behavior when state is incomplete not specified
- Cascading reset when changing earlier wizard steps not in acceptance criteria
- UI store theme synchronization with user preferences API not in acceptance criteria
- Dice store advantage/disadvantage results array transparency mentioned in notes only
- No closeAllModals action for route navigation

## Dependencies
- **Depends on:** Epic 2 (Type System), Epic 4 (Calculation Engine), Epic 5 (Database Layer / API), Epic 48 (Authentication)
- **Blocks:** All Phase 2+ UI components consume these hooks and stores
