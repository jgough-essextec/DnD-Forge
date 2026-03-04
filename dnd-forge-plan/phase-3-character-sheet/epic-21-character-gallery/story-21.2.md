# Story 21.2 — Search, Filter & Sort

> **Epic 21: Character Gallery (Home Screen)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player with many characters, I need to search by name and filter by class, race, level, or campaign to find specific characters quickly.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Gallery Toolbar**: Positioned above the card grid with search, filter chips, sort dropdown, and view toggle
- **Search**: Text input with debounced (200ms) case-insensitive substring match on character name
- **Filter Chips**: By Class (multi-select dropdown with counts), By Race (same pattern), By Level range (toggle chips), By Campaign, Show Archived toggle
- **Sort Options**: Last Edited (default), Name A-Z, Name Z-A, Level High-Low, Level Low-High, Date Created Newest, Date Created Oldest
- **View Toggle**: Grid View (cards) vs. List View (compact sortable table)
- **Preference Persistence**: Last-used sort/filter preferences saved via API (PUT /api/preferences/) using React Query mutation

## Tasks
- [ ] **T21.2.1** — Create `components/gallery/GalleryToolbar.tsx` — a toolbar above the card grid with search and filter controls
- [ ] **T21.2.2** — **Search:** text input with magnifying glass icon. Filters characters by name (case-insensitive, substring match). Debounced at 200ms. Show "No characters match your search" empty state when no results
- [ ] **T21.2.3** — **Filter chips:**
  - By Class: dropdown showing all classes present in the user's characters (e.g., if they have 3 Fighters and 2 Wizards, show "Fighter (3)" and "Wizard (2)"). Multi-select
  - By Race: same pattern as class
  - By Level range: "1-4", "5-10", "11-16", "17-20" toggle chips
  - By Campaign: dropdown of campaigns the user has characters in, plus "No Campaign"
  - "Show Archived": toggle to include archived characters (displayed with a muted/dimmed style)
- [ ] **T21.2.4** — **Sort:** dropdown with options: "Last Edited" (default), "Name (A-Z)", "Name (Z-A)", "Level (High to Low)", "Level (Low to High)", "Date Created (Newest)", "Date Created (Oldest)"
- [ ] **T21.2.5** — **View toggle:** switch between "Grid View" (cards) and "List View" (compact table). List view shows: avatar thumbnail, name, race, class, level, AC, HP, campaign, last edited — as a sortable data table
- [ ] **T21.2.6** — Persist the user's last-used sort/filter preferences via API (PUT /api/preferences/) using React Query mutation so the gallery opens in their preferred state

## Acceptance Criteria
- Gallery toolbar renders above the card grid with search, filters, sort, and view toggle
- Search filters characters by name with case-insensitive substring match at 200ms debounce
- "No characters match your search" shows when search returns no results
- Class filter shows multi-select dropdown with counts of characters per class
- Race filter shows multi-select dropdown with counts of characters per race
- Level range filter provides toggle chips for 1-4, 5-10, 11-16, 17-20
- Campaign filter shows dropdown of campaigns with "No Campaign" option
- "Show Archived" toggle includes archived characters with muted styling
- Sort dropdown offers 7 sort options with "Last Edited" as default
- View toggle switches between Grid (cards) and List (table) views
- List view displays a sortable data table with all key character fields
- Sort/filter preferences persist via API and restore on next visit

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should filter characters by name with case-insensitive substring match`
- `should filter characters by class (multi-select, AND logic)`
- `should filter characters by race (multi-select, AND logic)`
- `should filter characters by level range (1-4, 5-10, 11-16, 17-20)`
- `should combine multiple filters with AND logic`
- `should sort characters by all 7 sort options correctly`
- `should compute filter counts dynamically from character data`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render gallery toolbar with search, filters, sort, and view toggle`
- `should filter characters by name as user types with 200ms debounce`
- `should show "No characters match your search" when search returns no results`
- `should render class filter dropdown with character counts per class`
- `should render race filter dropdown with character counts per race`
- `should render level range toggle chips (1-4, 5-10, 11-16, 17-20)`
- `should show "Show Archived" toggle that includes archived characters with muted styling`
- `should render sort dropdown with 7 options and "Last Edited" as default`
- `should switch between Grid View (cards) and List View (table) with view toggle`
- `should render sortable data table in List view with key character fields`
- `should persist sort/filter preferences via API and restore on next visit`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should search for a character by name, apply class filter, sort by level, and verify filtered results`
- `should switch between grid and list views and verify both display correctly`

### Test Dependencies
- MSW (Mock Service Worker) to mock GET /api/characters/ with diverse character set (multiple classes, races, levels, campaigns)
- MSW to mock GET/PUT /api/preferences/ for persistence testing
- Mock debounce timer for search
- Fixture data with archived characters

## Identified Gaps

- **Accessibility**: No keyboard navigation for filter chips, no ARIA labels for filter dropdowns, no screen reader support for dynamic filter counts
- **Edge Cases**: No specification for behavior when all filters exclude all characters (combined empty state)
- **Performance**: No specification for filter/sort performance with large character collections (100+ characters)

## Dependencies
- Story 21.1 (Gallery Grid Layout) — toolbar integrates with the gallery grid
- Django REST API endpoints (GET /api/characters/) and React Query for fetching characters
- Django REST API preferences endpoints (GET/PUT /api/preferences/) for persisting sort/filter preferences

## Notes
- Filter counts are dynamic — they reflect only the user's actual characters, not all possible classes/races
- Multiple filters combine with AND logic: selecting "Fighter" class AND "Human" race shows only Human Fighters
- The search field should be cleared when navigating away and restored from preferences on return
- List view is useful for players with many characters (10+) who want a compact overview
- Archived characters in the "Show Archived" view should have a visual indicator (muted/dimmed) and show an "Unarchive" action
