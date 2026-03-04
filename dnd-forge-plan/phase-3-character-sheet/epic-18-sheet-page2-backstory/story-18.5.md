# Story 18.5 — Treasure Section

> **Epic 18: Character Sheet — Page 2 (Backstory & Details)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need a freeform section to track non-currency treasure — gems, art objects, magic items, quest items.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
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
- Treasure data persists via the API

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render treasure block in the right column below additional features`
- `should display rendered text content in view mode`
- `should provide textarea with placeholder text in edit mode`
- `should support adding structured treasure entries with name, GP value, and description`
- `should display graceful empty state (placeholder or collapsed section) when treasure is empty`
- `should persist treasure data via the API via auto-save`

### Test Dependencies
- Mock character data with freeform treasure text
- Mock character data with structured treasure entries
- Mock character data with no treasure (empty state)
- Mock auto-save system from Epic 20
- Mock view/edit mode context

## Identified Gaps

- **Accessibility**: No ARIA labels for treasure textarea, no screen reader support for structured entries
- **Edge Cases**: No specification for maximum treasure text length or entry count

## Dependencies
- Epic 20 view/edit mode toggle system
- Epic 20 auto-save system for persisting treasure changes

## Notes
- Treasure is a catch-all for non-currency valuables: gems, art objects, magic items that aren't equipment, quest items, deeds, letters of credit, etc.
- Most players start with no treasure — the empty state is the default experience
- Structured entries are optional — some players prefer a simple text list, others want organized tracking with GP values
- This section grows organically during gameplay as the character acquires treasure
