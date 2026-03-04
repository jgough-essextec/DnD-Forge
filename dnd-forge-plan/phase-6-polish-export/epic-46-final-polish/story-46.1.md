# Story 46.1 — Loading States & Skeleton Screens

> **Epic 46: Final Polish & UX Refinements** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player, I need visual feedback while content loads so the app doesn't feel broken. This story covers implementing skeleton loading screens for the gallery, character sheet, campaign dashboard, SRD data loading, and PDF generation — providing smooth visual transitions from loading state to loaded content.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Skeleton Screen Design**: Grey pulsing rectangles matching the actual content layout structure. Smooth fade transition to real content when loaded
- **Loading Scenarios**:
  - Gallery: Characters loading from API (typically fast, but noticeable with 100+ characters)
  - Character sheet: Individual character data loading from API
  - Campaign dashboard: Party data and session notes loading
  - SRD data: First-time loading of Tier 2/3/4 data files (spell browser, creation wizard)
  - PDF generation: Multi-page PDF compilation (can take 2-5 seconds)
- **PDF Progress**: Determinate progress bar with page-by-page status (Page 1... Page 2... Page 3... Compiling...)

## Tasks

- [ ] **T46.1.1** — **Gallery skeleton:** while characters load from API, show skeleton card placeholders (grey pulsing rectangles matching the card layout). Transition: skeleton fades to real content
- [ ] **T46.1.2** — **Character sheet skeleton:** while a character loads, show the three-page layout structure with skeleton placeholders for each section. Ability score blocks pulse, text areas show grey lines
- [ ] **T46.1.3** — **Campaign dashboard skeleton:** party grid shows skeleton rows with pulsing cells. Tab content areas show loading indicators
- [ ] **T46.1.4** — **SRD data loading:** when navigating to the creation wizard or spell page for the first time, show: "Loading game data..." with a progress bar based on the number of data files fetched
- [ ] **T46.1.5** — **PDF generation loading:** show a modal with: "Generating your character sheet..." and a determinate progress bar (Page 1... Page 2... Page 3... Compiling...)

## Acceptance Criteria

- Gallery shows skeleton card placeholders while characters load from API
- Skeleton cards match the actual card layout dimensions and structure
- Gallery skeletons fade smoothly to real content when loaded
- Character sheet shows skeleton layout with pulsing ability score blocks and grey text line placeholders
- Campaign dashboard shows skeleton rows in the party grid and loading indicators in tab content
- SRD data loading shows "Loading game data..." with a progress bar indicating fetch progress
- PDF generation shows a modal with a determinate progress bar showing page-by-page status
- PDF progress shows: "Page 1..." -> "Page 2..." -> "Page 3..." -> "Compiling..." -> complete
- All skeleton screens use consistent pulsing animation and grey color scheme
- Skeletons respect reduced motion preferences (no pulsing animation when reduced motion is on)

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render gallery skeleton card placeholders with pulsing animation while characters load`
- `should render character sheet skeleton with pulsing ability score blocks and grey text lines while loading`
- `should render campaign dashboard skeleton rows with pulsing cells while party data loads`
- `should render "Loading game data..." with progress bar while SRD data fetches`
- `should render PDF generation modal with determinate progress bar showing page-by-page status`
- `should fade smoothly from skeleton to real content when data loads (200-300ms transition)`
- `should disable pulsing animation on skeletons when reduced motion preference is active`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should show gallery skeleton placeholders before characters appear from API`
- `should show PDF progress bar advancing through Page 1 -> Page 2 -> Page 3 -> Compiling -> complete`
- `should use consistent grey color scheme across all skeleton screens`

### Test Dependencies
- Delayed data loading simulation for skeleton visibility testing
- Reduced motion preference mock
- PDF generation progress event simulation
- SRD data loading progress tracking mock

## Identified Gaps

- **Loading/Empty States**: No specification for minimum skeleton display time (prevent flash of skeleton for fast loads)
- **Accessibility**: Skeleton screens should have aria-busy="true" and aria-label for screen readers — not specified
- **Edge Cases**: Behavior when data load fails while skeleton is showing (transition to error state) not specified
- **Performance**: No target for skeleton-to-content transition smoothness (frame rate during fade)

## Dependencies

- Story 42.2 (SRD data lazy loading — skeleton screens show while data loads)
- Epic 39 (PDF generation — progress indicator during generation)
- Story 41.4 (reduced motion — skeleton pulse animation must respect preference)

## Notes

- shadcn/ui includes a `Skeleton` component that can be used as the base for all skeleton screens
- Keep skeleton layouts simple — they don't need to perfectly match every detail, just the overall structure
- The transition from skeleton to real content should be a smooth fade (200-300ms) not an abrupt swap
- For the PDF generation modal, the progress should be based on actual generation steps, not a fake timer
- Consider using `React.Suspense` with custom fallback components for route-level skeletons
