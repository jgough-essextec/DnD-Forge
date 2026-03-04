# Story 18.5 — Treasure Section

> **Epic 18: Character Sheet — Page 2 (Backstory & Details)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need a freeform section to track non-currency treasure — gems, art objects, magic items, quest items.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Treasure Section Position**: In the right column of Page 2, below the backstory and additional features sections
- **Empty State**: Treasure starts empty for new characters — this is a Gap S1 field that must display gracefully when empty
- **Two Input Modes**: Freeform text block for simple tracking, and optional structured entries for more organized tracking (name, GP value, description)

## Tasks
- [ ] **T18.5.1** — Create `components/character/page2/TreasureBlock.tsx` — a freeform text block for tracking miscellaneous treasure. **View mode:** rendered text. **Edit mode:** textarea with placeholder: "Gems, art objects, magic items, and other valuables"
- [ ] **T18.5.2** — Optionally support structured treasure entries: "Add Treasure Item" button that creates a named entry with optional value in GP and description

## Acceptance Criteria
- Treasure block renders in the right column below additional features
- View mode shows rendered text content
- Edit mode provides a textarea with helpful placeholder text
- Optional structured entries allow adding named treasure items with GP value and description
- Empty state displays gracefully (placeholder text or collapsed section)
- Treasure data persists to IndexedDB

## Dependencies
- Epic 20 view/edit mode toggle system
- Epic 20 auto-save system for persisting treasure changes

## Notes
- Treasure is a catch-all for non-currency valuables: gems, art objects, magic items that aren't equipment, quest items, deeds, letters of credit, etc.
- Most players start with no treasure — the empty state is the default experience
- Structured entries are optional — some players prefer a simple text list, others want organized tracking with GP values
- This section grows organically during gameplay as the character acquires treasure
