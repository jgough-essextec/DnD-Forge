# Epic 20: View / Edit Mode Toggle System

> **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Goal
A seamless mode-switching system that transforms the character sheet between a clean read-only view and a full-featured editing form, with auto-save, undo history, and cascade recalculation.

## Stories

| Story | Title | Description |
|-------|-------|-------------|
| 20.1 | Mode Toggle & Visual Differentiation | Clear mode switching with obvious visual cues |
| 20.2 | Auto-Save with Debouncing | Automatic saving without overwhelming the database |
| 20.3 | Undo / Redo History | Undo and redo changes in edit mode |
| 20.4 | Cascade Recalculation on Edit | Every edit triggers appropriate recalculations for derived stats |

## Key Components
- `components/character/ModeToggle.tsx` — toggle button for view/edit modes
- `useCharacter` hook — enhanced with auto-save debouncing
- `useCharacterCalculations` hook — wraps Phase 1 calculation engine for reactive recalculation

## Dependencies
- Phase 1: Calculation engine, Character type system, IndexedDB database layer, state stores
- Phase 2: Character data stored in IndexedDB from creation wizard

## Notes
- This epic is foundational — build first or in parallel with routing (Epic 25)
- All character sheet page epics (17, 18, 19) depend on the mode toggle system
- View mode: clean text rendering, no form borders, static proficiency dots, click-to-roll
- Edit mode: subtle field borders, hover states, edit icons, "Unsaved changes" indicator
- Auto-save uses 500ms debounce with optimistic concurrency (version field)
- Undo/redo uses full state snapshots (max 50 states, ~20KB each)
- Cascade recalculation uses a dependency map for efficient partial recalculation
