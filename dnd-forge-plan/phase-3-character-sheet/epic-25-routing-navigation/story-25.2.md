# Story 25.2 — Top Navigation Bar

> **Epic 25: Routing & Navigation** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need a consistent navigation bar across the app that shows where I am and lets me get to key areas.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Top Nav Components**: Fixed top bar with app logo/name ("D&D Character Forge" in Cinzel), breadcrumb trail, and right-side action buttons
- **Breadcrumbs**: Dynamically update based on current route:
  - Gallery: "Characters"
  - Character sheet: "Characters > [Character Name]"
  - Edit mode: "Characters > [Character Name] > Editing"
- **Right-Side Actions**: "New Character" button (accent-gold), "Import" button, settings gear icon
- **Mobile**: Collapse to hamburger menu with slide-out drawer. Keep character name and key actions visible
- **Font**: Cinzel for app name in the nav bar

## Tasks
- [ ] **T25.2.1** — Create `components/layout/TopNav.tsx` — fixed top bar with: app logo/name ("D&D Character Forge" in Cinzel), breadcrumb trail (Home > Character Name), and right-side actions
- [ ] **T25.2.2** — Right-side actions in the nav bar: "New Character" button (accent-gold), "Import" button, and a settings gear icon
- [ ] **T25.2.3** — Breadcrumbs dynamically update based on the current route: "Characters" (on gallery), "Characters > [Name]" (on character sheet), "Characters > [Name] > Editing" (in edit mode)
- [ ] **T25.2.4** — Mobile: collapse the top nav into a hamburger menu with a slide-out drawer. Keep the character name and key actions visible

## Acceptance Criteria
- Top navigation bar is fixed at the top of all pages
- App name "D&D Character Forge" displays in Cinzel font on the left
- Breadcrumbs dynamically update based on the current route
- Breadcrumb links are clickable for navigation (e.g., "Characters" navigates to gallery)
- "New Character" button (accent-gold) navigates to creation wizard
- "Import" button opens the import dialog
- Settings gear icon navigates to settings
- Mobile: nav collapses to hamburger menu with slide-out drawer
- Character name remains visible on mobile when viewing a character sheet
- Top nav doesn't overlap with page content (appropriate padding/margin)

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render fixed top navigation bar on all pages`
- `should display app name "D&D Character Forge" in Cinzel font`
- `should display "New Character" button (accent-gold) that navigates to creation wizard`
- `should display "Import" button that opens import dialog`
- `should display settings gear icon that navigates to settings`
- `should render breadcrumbs as "Characters" on gallery page`
- `should render breadcrumbs as "Characters > [Character Name]" on character sheet`
- `should render breadcrumbs as "Characters > [Character Name] > Editing" in edit mode`
- `should make breadcrumb links clickable for navigation`
- `should collapse nav to hamburger menu with slide-out drawer on mobile`
- `should keep character name visible on mobile when viewing character sheet`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should navigate between pages using breadcrumbs and verify they update dynamically`
- `should open hamburger menu on mobile and navigate using slide-out drawer`

### Test Dependencies
- Mock React Router for navigation testing
- Mock route state for breadcrumb generation
- Mock character data for dynamic character name in breadcrumbs
- Viewport size mocking for mobile hamburger menu

## Identified Gaps

- **Accessibility**: No ARIA labels for navigation bar, breadcrumbs, or hamburger menu. No keyboard navigation specification for mobile drawer
- **Edge Cases**: No specification for very long character names in breadcrumbs (truncation behavior)
- **Mobile/Responsive**: No specification for hamburger drawer close behavior (tap outside, swipe, escape key)

## Dependencies
- Story 25.1 (Route Structure) — breadcrumbs reflect route structure
- Epic 20 (View/Edit Mode) — breadcrumbs show "Editing" state
- Epic 21 (Gallery) — "Characters" breadcrumb links to gallery
- Epic 22 (Import) — "Import" button triggers import dialog

## Notes
- The top nav is the app's primary navigation chrome — it should be visible on every page
- The fixed position means page content needs top padding equal to the nav height
- Breadcrumbs are a key wayfinding tool — they help players understand where they are in the app
- The hamburger menu on mobile should include all nav actions plus any additional links
- The settings gear icon could open a slide-out panel or navigate to a dedicated settings page
- The app name may be shortened to just the logo/icon on mobile to save space
