# Epic 6: Zustand State Management Stores
> **Phase 1: Foundation** (Weeks 1-2)

## Summary
Application-level state management configured with Zustand, including persist middleware for wizard state survival across navigation.

## Stories
| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 6.1 | Character Store | 5 | Zustand store managing active character state, bridging to database layer, with auto-recalculation of derived stats |
| 6.2 | Wizard Store | 5 | Persistent store for character creation wizard state that survives page navigation, with finalize-to-Character assembly |
| 6.3 | UI Store | 3 | Store for transient UI state: modals, sidebar, edit mode, mobile nav, theme, responsive breakpoints |
| 6.4 | Dice Store | 4 | Store for dice roll history and configuration with advantage/disadvantage support and history management |

## Technical Scope
- **State library:** Zustand with middleware (persist for wizard store using sessionStorage)
- **Pattern:** Each store has state + actions, computed derivations trigger via the calculation engine
- **Character store:** Bridges to Dexie database layer for persistence, auto-recalculates derived stats on changes
- **Wizard store:** Persists to sessionStorage so creation progress survives navigation; `finalize()` assembles complete Character
- **UI store:** Transient state for modals, sidebar, edit mode, responsive detection
- **Dice store:** Roll history with truncation, advantage/disadvantage mechanics

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 6.1 — Character Store | 11 | 0 | 0 | 11 |
| 6.2 — Wizard Store | 11 | 0 | 0 | 11 |
| 6.3 — UI Store | 6 | 3 | 0 | 9 |
| 6.4 — Dice Store | 10 | 0 | 0 | 10 |
| **Totals** | **38** | **3** | **0** | **41** |

### Key Gaps Found
- Character store error recovery mechanism not specified (how to clear error state)
- Auto-recalculation debouncing for rapid field updates not specified as acceptance criteria
- Wizard store finalize behavior when state is incomplete not specified
- Cascading reset when changing earlier wizard steps not in acceptance criteria
- UI store theme synchronization with user preferences not in acceptance criteria
- Dice store advantage/disadvantage results array transparency mentioned in notes only
- No closeAllModals action for route navigation

## Dependencies
- **Depends on:** Epic 2 (Type System), Epic 4 (Calculation Engine), Epic 5 (Database Layer)
- **Blocks:** All Phase 2+ UI components consume these stores
