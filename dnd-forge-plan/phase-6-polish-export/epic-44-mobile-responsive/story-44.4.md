# Story 44.4 — Landscape Mode

> **Epic 44: Mobile Responsive Final Polish** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player holding their phone sideways, I need the app to adapt to landscape orientation. This story covers verifying landscape layouts on mobile (640x360), tablet (1024x768), and testing orientation changes mid-interaction to ensure no state is lost.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Landscape Mobile (640x360)**: Session compact view should switch to two-column layout (HP/actions left, stats/spells right), dice roller uses landscape width efficiently
- **Landscape Tablet (1024x768)**: Should render the desktop layout at this size, no elements clipped or overlapping
- **Orientation Change**: UI must reflow without losing state or closing modals when device is rotated mid-interaction
- **PWA Manifest**: `orientation: "any"` — app supports both portrait and landscape

## Tasks

- [ ] **T44.4.1** — **Landscape mobile (640x360):** verify no layout breaks. The session compact view should switch to a two-column layout (HP/actions left, stats/spells right). The dice roller panel should use landscape width efficiently
- [ ] **T44.4.2** — **Landscape tablet (1024x768):** should render the desktop layout at this size. Verify no elements are clipped or overlapping
- [ ] **T44.4.3** — **Orientation change:** test rotating the device mid-interaction (e.g., while the dice roller is open, while editing a character). UI should reflow without losing state or closing modals

## Acceptance Criteria

- No layout breaks at landscape mobile (640x360)
- Session compact view uses two-column layout in landscape (HP/actions left, stats/spells right)
- Dice roller panel uses landscape width efficiently (not a narrow strip)
- Landscape tablet (1024x768) renders the desktop layout
- No elements clipped or overlapping in landscape tablet
- Rotating device mid-interaction reflows the UI without losing state
- Open modals remain open and usable after orientation change
- Form inputs retain their values after orientation change
- Dice roller retains its state (expression, history) after orientation change

## Testing Requirements

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should render landscape mobile (640x360) without layout breaks`
- `should render session compact view in two-column layout (HP/actions left, stats/spells right) in landscape mobile`
- `should render dice roller panel using landscape width efficiently (not a narrow strip)`
- `should render landscape tablet (1024x768) with desktop layout and no clipped elements`
- `should reflow UI without losing state when rotating device mid-interaction`
- `should keep open modals visible and usable after orientation change`
- `should retain form input values after orientation change`
- `should retain dice roller state (expression, history) after orientation change`

### Test Dependencies
- Playwright viewport configuration for 640x360 (landscape mobile) and 1024x768 (landscape tablet)
- Viewport resize simulation for orientation change testing
- Open modal state verification during viewport changes
- Form input value persistence verification
- Dice roller state persistence verification

## Identified Gaps

- **Edge Cases**: Chrome DevTools rotation simulation doesn't perfectly replicate real behavior — actual device testing needed
- **Error Handling**: No specification for behavior if modal becomes unusable after orientation change (e.g., taller than viewport)
- **Performance**: No specification for reflow time after orientation change
- **Edge Cases**: State loss in uncontrolled components during resize not fully mitigated

## Dependencies

- Stories 44.1 and 44.2 (mobile and tablet layouts must be working in portrait first)
- All Phase 1-5 features complete

## Notes

- CSS media queries based on width will naturally handle landscape/portrait since the width changes on rotation
- The main risk with orientation changes is state loss in uncontrolled components or modals that unmount on resize
- React state in Zustand is unaffected by DOM changes, so most state should survive orientation changes
- Test orientation change on actual devices — Chrome DevTools rotation simulation doesn't perfectly replicate real behavior
- The session compact view's two-column landscape layout is especially useful for players holding phones sideways at the table
