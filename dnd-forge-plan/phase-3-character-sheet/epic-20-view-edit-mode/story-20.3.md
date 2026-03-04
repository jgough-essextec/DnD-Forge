# Story 20.3 — Undo / Redo History

> **Epic 20: View / Edit Mode Toggle System** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to undo and redo changes in edit mode so I can safely experiment with modifications.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Undo/Redo Strategy**: State-based (not action-based). Each undo restores the full character state from the previous auto-save snapshot. Simpler implementation at the cost of granularity
- **Stack Depth**: Max 50 states (configurable). At ~20KB per character state, that's approximately 1MB per character in memory. Open question: may reduce to 20 states if memory is a concern
- **Stack Behavior**: Before each auto-save, push previous state onto undo stack. Undo pops undo stack, pushes current state onto redo stack. New changes after an undo clear the redo stack
- **Clear on Navigation**: Undo stack clears when exiting edit mode or navigating away from the character
- **Keyboard Shortcuts**: Ctrl+Z / Cmd+Z for undo, Ctrl+Shift+Z / Cmd+Shift+Z for redo

## Tasks
- [ ] **T20.3.1** — Implement an undo/redo stack in the character store: before each auto-save, push the previous character state onto the undo stack (max depth: 50 states). Each undo pops the stack and pushes the current state onto the redo stack
- [ ] **T20.3.2** — UI: "Undo" and "Redo" buttons in the edit mode toolbar (or the sheet header). Disabled when the respective stack is empty. Show the count of available undos
- [ ] **T20.3.3** — Keyboard shortcuts: `Ctrl+Z` / `Cmd+Z` for undo, `Ctrl+Shift+Z` / `Cmd+Shift+Z` for redo
- [ ] **T20.3.4** — Undo is state-based, not action-based: each undo restores the full character state from the previous auto-save snapshot, not individual field changes. This simplifies implementation at the cost of granularity
- [ ] **T20.3.5** — Clear the undo stack when exiting edit mode or navigating away from the character

## Acceptance Criteria
- Undo restores the character to the previous auto-save snapshot
- Redo re-applies the undone state
- Undo/Redo buttons display in the edit mode toolbar with available count
- Buttons are disabled when their respective stacks are empty
- Ctrl+Z / Cmd+Z triggers undo; Ctrl+Shift+Z / Cmd+Shift+Z triggers redo
- Maximum stack depth is 50 states
- New changes after an undo clear the redo stack
- Undo stack clears when exiting edit mode or navigating away
- Undo/redo operations trigger auto-save of the restored state

## Dependencies
- Story 20.2 (Auto-Save) — undo stack is populated from auto-save snapshots
- Phase 1 state management (Zustand) for undo/redo stack storage

## Notes
- State-based undo is simpler than action-based but less granular — a single undo may revert multiple field changes if they occurred within the same debounce window
- Memory usage at 50 states x 20KB is approximately 1MB per character — acceptable for modern browsers but worth monitoring
- The redo stack is cleared when new changes are made after undoing — standard undo/redo behavior
- Undo/redo buttons should only appear in edit mode (not view mode)
- Future optimization: diff-based undo in Phase 6 to reduce memory usage
