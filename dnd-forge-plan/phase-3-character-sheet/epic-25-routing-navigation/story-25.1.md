# Story 25.1 — Route Structure

> **Epic 25: Routing & Navigation** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a developer, I need all Phase 3 pages properly routed with clean URLs and navigation.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Route Structure**:
  - `/` — Home (Character Gallery)
  - `/character/new` — Creation Wizard (Phase 2, already exists)
  - `/character/:id` — Character Sheet View (default tab: Core Stats)
  - `/character/:id/edit` — Character Sheet Edit Mode (or use query param `?mode=edit`)
  - `/share#[data]` — Shared Character View (read-only)
  - `/import` — Import Character page (or modal overlay)
- **React Router**: Used for client-side routing. `useParams()` extracts characterId from URLs
- **404 Handling**: If character doesn't exist in IndexedDB, show "Character not found" page with "Go Home" button
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
- [ ] **T25.1.2** — Implement `useParams()` to extract `characterId` from the URL. If the character doesn't exist in IndexedDB, show a 404-style page: "Character not found. It may have been deleted." with a "Go Home" button
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
