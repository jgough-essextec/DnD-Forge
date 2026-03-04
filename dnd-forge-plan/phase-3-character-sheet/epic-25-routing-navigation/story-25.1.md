# Story 25.1 — Route Structure

> **Epic 25: Routing & Navigation** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a developer, I need all Phase 3 pages properly routed with clean URLs and navigation.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Route Structure**:
  - `/` — Home (Character Gallery)
  - `/character/new` — Creation Wizard (Phase 2, already exists)
  - `/character/:id` — Character Sheet View (default tab: Core Stats)
  - `/character/:id/edit` — Character Sheet Edit Mode (or use query param `?mode=edit`)
  - `/share#[data]` — Shared Character View (read-only)
  - `/import` — Import Character page (or modal overlay)
- **React Router**: Used for client-side routing. `useParams()` extracts characterId from URLs
- **404 Handling**: If character doesn't exist (API returns 404), show "Character not found" page with "Go Home" button
- **Page Transitions**: Slide-in from right (deeper navigation: gallery -> sheet), slide-in from left (back navigation: sheet -> gallery). Use framer-motion `AnimatePresence`
- **Browser History**: Mode changes and navigation push to history stack so browser back button works intuitively

## Tasks
- [ ] **T25.1.1** — Define Phase 3 routes in the React Router configuration:
  - `/` — Home (Character Gallery)
  - `/character/new` — Creation Wizard (Phase 2, already exists)
  - `/character/:id` — Character Sheet View (default tab: Core Stats)
  - `/character/:id/edit` — Character Sheet Edit Mode (or use query param `?mode=edit`)
  - `/share#[data]` — Shared Character View (read-only)
  - `/import` — Import Character page (or modal overlay)
- [ ] **T25.1.2** — Implement `useParams()` to extract `characterId` from the URL. If the API returns 404 for the character, show a 404-style page: "Character not found. It may have been deleted." with a "Go Home" button
- [ ] **T25.1.3** — Page transition animations: slide-in from right when navigating deeper (gallery -> sheet), slide-in from left when navigating back (sheet -> gallery). Use framer-motion `AnimatePresence`
- [ ] **T25.1.4** — Browser back button should work intuitively: sheet -> gallery, edit mode -> view mode. Push URL state changes to the history stack

## Acceptance Criteria
- All Phase 3 routes are defined and navigable
- `/` loads the Character Gallery (HomePage)
- `/character/:id` loads the character sheet in view mode
- `/character/:id/edit` loads the character sheet in edit mode
- `/share#[data]` loads the shared character view
- `/import` loads the import dialog/page
- Invalid character IDs show a 404 "Character not found" page with "Go Home" button
- Page transitions animate slide-in from right (forward) and slide-in from left (back)
- Browser back button navigates correctly through the history stack
- Edit mode to view mode transition is reflected in the URL

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should extract characterId from URL params using useParams()`
- `should determine navigation direction (forward/back) for animation selection`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should route "/" to the Character Gallery (HomePage)`
- `should route "/character/:id" to the character sheet in view mode`
- `should route "/character/:id/edit" to the character sheet in edit mode`
- `should route "/share#[data]" to the shared character view`
- `should route "/import" to the import dialog/page`
- `should show 404 "Character not found" page with "Go Home" button for invalid character IDs`
- `should reflect edit mode in the URL when toggling mode`
- `should navigate back correctly via browser back button`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should navigate from gallery to character sheet to edit mode and back using browser history`
- `should show 404 page for non-existent character ID and navigate home`
- `should display page transition animations (slide-in) when navigating between pages`

### Test Dependencies
- Mock React Router with test routes
- MSW (Mock Service Worker) to mock GET /api/characters/:id with character data (for valid IDs) and 404 responses (for 404 testing)
- Mock framer-motion AnimatePresence for transition testing
- Mock character sheet and gallery page components

## Identified Gaps

- **Error Handling**: No specification for handling corrupted URL parameters (non-UUID character IDs)
- **Accessibility**: No specification for focus management on page transitions, no screen reader announcement of page changes
- **Edge Cases**: No specification for deep linking behavior (sharing a direct character sheet URL with someone who has the app)

## Dependencies
- Phase 2 routing (creation wizard route already exists)
- Epic 17-19 (Character Sheet pages) — route targets
- Epic 21 (Gallery) — home route target
- Epic 22 (Import/Export) — import and share route targets
- framer-motion library for page transition animations

## Notes
- Routes should be scaffolded early (Week 5, Day 1-2) so other epics can build on them
- The `/character/:id/edit` route vs. `?mode=edit` query param is an architectural choice — either works
- framer-motion's `AnimatePresence` wraps route transitions for smooth page animations
- The 404 page should be friendly, not a dead end — include the "Go Home" button and possibly "Create New Character"
- Phase 2's creation wizard route (`/character/new`) should be preserved and not conflict with Phase 3 routes
