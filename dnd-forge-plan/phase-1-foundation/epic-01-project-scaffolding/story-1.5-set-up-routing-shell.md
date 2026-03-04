# Story 1.5 — Set Up Routing Shell

> **Epic 1: Project Scaffolding & Developer Toolchain** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need the application routes defined with placeholder pages so that navigation works end-to-end.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Routing**: React Router v6 with `BrowserRouter`. All page components are lazy-loaded using `React.lazy()` and `Suspense` for code splitting
- **Route structure**: The app has three main areas: (1) Player-facing pages (character gallery, creation wizard, character sheet, level up), (2) DM-facing pages (campaigns, encounter tracker), (3) Utility pages (dice roller, settings)
- **Layout**: A `MainLayout` component provides consistent navigation structure — top nav bar on desktop (logo + nav links) and bottom tab bar on mobile (breakpoint at 640px)
- **Error handling**: A global error boundary catches rendering errors anywhere in the component tree and shows a recovery UI instead of a white screen

## Tasks
- [ ] **T1.5.1** — Create React Router `BrowserRouter` wrapper in `App.tsx`
- [ ] **T1.5.2** — Define route structure with lazy-loaded placeholder pages:
  - `/` — Home (Character Gallery)
  - `/character/new` — Creation Wizard
  - `/character/:id` — Character Sheet View
  - `/character/:id/edit` — Character Sheet Edit Mode
  - `/character/:id/levelup` — Level Up Flow
  - `/campaigns` — Campaign List (DM)
  - `/campaign/:id` — Campaign Dashboard (DM)
  - `/campaign/:id/encounter` — Initiative Tracker (DM)
  - `/dice` — Standalone Dice Roller
  - `/settings` — App Settings
  - `*` — 404 Not Found
- [ ] **T1.5.3** — Create a `MainLayout` component with: top navigation bar (logo, nav links), content area, and bottom mobile nav bar
- [ ] **T1.5.4** — Create placeholder page components for each route (a card with the page name and a "coming in Phase N" label)
- [ ] **T1.5.5** — Implement responsive navigation: top nav on desktop, bottom tab bar on mobile (breakpoint at 640px)
- [ ] **T1.5.6** — Add a global error boundary that catches rendering errors and shows a recovery UI

## Acceptance Criteria
- All defined routes are accessible and render their placeholder content
- Navigation between routes works without full page reload (client-side routing)
- Lazy loading works — page components are loaded on demand (verify via network tab)
- The `MainLayout` displays a top navigation bar on desktop viewports (>640px)
- The `MainLayout` displays a bottom tab bar on mobile viewports (<=640px)
- Navigating to an undefined route shows the 404 page
- A rendering error in any page triggers the error boundary and shows a recovery UI (not a white screen)
- The error boundary provides a way to recover (e.g., "Go Home" button)

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should export all route path constants`
- `should render ErrorBoundary fallback UI when child throws`
- `should render ErrorBoundary "Go Home" button that navigates to /`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render MainLayout with top navigation bar containing logo and nav links`
- `should render placeholder page for each defined route with correct "coming in Phase N" label`
- `should render 404 page when navigating to undefined route`
- `should render loading fallback during lazy component load`
- `should display bottom tab bar with icons on mobile viewport (<=640px)`
- `should display top navigation bar on desktop viewport (>640px)`
- `should navigate between routes without full page reload`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should navigate to / and display Character Gallery placeholder`
- `should navigate to /character/new and display Creation Wizard placeholder`
- `should navigate to /dice and display Dice Roller placeholder`
- `should navigate to /settings and display Settings placeholder`
- `should display 404 page for /nonexistent-route`
- `should lazy-load page components on navigation (verify network tab)`
- `should show bottom tab bar on mobile viewport and top nav on desktop`
- `should recover from a rendering error via the error boundary`

### Test Dependencies
- React Testing Library with MemoryRouter for route testing
- Mock lazy-loaded components for testing Suspense fallbacks
- Viewport resizing utilities for responsive tests

## Identified Gaps

- **Error Handling**: No specification for nested error boundaries (per-route vs global only)
- **Loading/Empty States**: No specification for the Suspense fallback loading UI design
- **Accessibility**: No keyboard navigation specification for nav bar or mobile tab bar (tab order, focus management)
- **Accessibility**: No ARIA labels specified for navigation elements
- **Mobile/Responsive**: No specification for tablet viewport behavior (between 640px and 1024px)
- **Performance**: No lazy-loading chunk size targets

## Dependencies
- **Depends on:** Story 1.1 (project initialized), Story 1.2 (Tailwind/shadcn for styling), Story 1.3 (React Router installed)
- **Blocks:** All page-level work in Phases 2-6 depends on the routing shell

## Notes
- Placeholder pages should clearly label which Phase will implement them (e.g., "Character Gallery — Coming in Phase 2")
- The `BrowserRouter` requires a fallback server configuration for production deployment (all paths must return `index.html`). For development, Vite handles this automatically
- Consider using a `<Suspense fallback={<Loading />}>` wrapper around lazy-loaded routes for a consistent loading experience
- The bottom tab bar on mobile should include icons from lucide-react for: Home, Create, Dice, Campaigns, Settings
