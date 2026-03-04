# Story 44.1 — Mobile Layout Audit & Fixes

> **Epic 44: Mobile Responsive Final Polish** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player on a phone, I need every screen in the app to be usable without horizontal scrolling or overlapping elements. This story covers a systematic audit of every page at mobile widths (360px, 390px, 428px), plus specific layout fixes for the gallery, creation wizard, character sheet, and combat tracker on mobile devices.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Mobile Widths to Test**: 360px (smallest common phone), 390px (iPhone 14), 428px (iPhone 14 Pro Max)
- **Screens to Audit**: Gallery, character sheet (all 3 pages), creation wizard (all steps), edit mode, dice roller, session compact view, campaign list, campaign dashboard, combat tracker, session log, NPC tracker, loot tracker, PDF export modal, settings
- **Gallery Mobile**: Single column at <640px, consistent card height, truncated names, collapsed filter/sort controls
- **Wizard Mobile**: Step sidebar becomes horizontal progress bar, sticky Back/Next buttons at bottom, single-column card stacking
- **Character Sheet Mobile**: Phase 3 mobile layout (Story 24.3) must work with Phase 4 additions (dice roller, HP widget, spell slots, conditions, floating action bar)
- **Combat Tracker Mobile**: Full-width initiative list, inline expand on tap, large full-width Next Turn button, bottom sheet for HP editing

## Tasks

- [ ] **T44.1.1** — **Systematic audit:** test every page at 360px width (smallest common phone), 390px (iPhone 14), and 428px (iPhone 14 Pro Max). Screens to test: gallery, character sheet (all 3 pages), creation wizard (all steps), edit mode, dice roller, session compact view, campaign list, campaign dashboard, combat tracker, session log, NPC tracker, loot tracker, PDF export modal, settings
- [ ] **T44.1.2** — **Gallery mobile polish:** card grid should be single column at <640px. Card height consistent. Long character names truncate with ellipsis. Filter/sort controls collapse into a dropdown or bottom sheet rather than taking up screen space
- [ ] **T44.1.3** — **Creation wizard mobile:** step sidebar becomes a horizontal progress bar at the top. Step content scrolls vertically. "Back" and "Next" buttons are sticky at the bottom for easy thumb reach. Race and class cards stack in a single column
- [ ] **T44.1.4** — **Character sheet mobile:** verify the Phase 3 mobile layout (Story 24.3) works with all Phase 4 additions (dice roller, HP widget, spell slot tracker, conditions strip). The floating action bar at the bottom must not overlap with content
- [ ] **T44.1.5** — **Combat tracker mobile:** the initiative list should be the primary view (full width). Combatant details expand inline on tap. "Next Turn" button is a large, full-width button at the bottom. HP editing opens a bottom sheet

## Acceptance Criteria

- Every screen in the app is tested at 360px, 390px, and 428px widths
- No horizontal scrolling on any screen at any tested width
- No overlapping elements on any screen at any tested width
- Gallery uses single-column card layout at <640px with consistent card heights
- Long character names truncate with ellipsis (no overflow)
- Gallery filter/sort controls collapse into dropdown or bottom sheet on mobile
- Creation wizard uses horizontal progress bar (not sidebar) on mobile
- Wizard Back/Next buttons are sticky at bottom for thumb reach
- Race and class selection cards stack in single column on mobile
- Character sheet mobile layout works with all Phase 4 additions without overlap
- Floating action bar does not overlap content on mobile
- Combat tracker shows full-width initiative list with inline expand on tap
- "Next Turn" button is large and full-width at bottom of combat tracker on mobile
- HP editing uses bottom sheet on mobile (not modal)

## Testing Requirements

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should render every screen at 360px width with no horizontal scrolling or overlapping elements`
- `should render every screen at 390px width with no horizontal scrolling or overlapping elements`
- `should render every screen at 428px width with no horizontal scrolling or overlapping elements`
- `should render gallery as single-column card layout at <640px with consistent card heights`
- `should truncate long character names with ellipsis in gallery cards on mobile`
- `should collapse gallery filter/sort controls into dropdown or bottom sheet on mobile`
- `should render creation wizard with horizontal progress bar (not sidebar) on mobile`
- `should render wizard Back/Next buttons as sticky at bottom for thumb reach`
- `should render character sheet mobile layout with Phase 4 additions without overlap`
- `should render combat tracker with full-width initiative list and large Next Turn button at bottom on mobile`

### Test Dependencies
- Playwright viewport configuration for 360px, 390px, 428px widths
- All app screens rendered with full data
- Character with long name (40+ characters) for truncation testing
- Combat tracker with multiple combatants for mobile layout
- Creation wizard at various steps for progress bar testing

## Identified Gaps

- **Edge Cases**: Behavior with very long content (long spell names, feature descriptions) at 360px not specified
- **Accessibility**: Touch target sizes on mobile not re-verified here (covered in 44.3 but may interact)
- **Performance**: No specification for mobile rendering performance targets (slower devices)
- **Edge Cases**: Safe area inset handling for devices with bottom notches/gesture bars mentioned in notes but not in acceptance criteria

## Dependencies

- All Phase 1-5 features complete (audit covers every screen)
- Phase 3 mobile layout (Story 24.3) as the baseline for character sheet

## Notes

- Use Chrome DevTools device emulation for initial testing, then verify on real devices if possible
- The 360px width is the most constrained — if layouts work at 360px, they'll work at wider mobile sizes
- The floating action bar z-index must be higher than all content below it, but it must not cover critical information
- Consider using CSS `env(safe-area-inset-bottom)` for devices with bottom notches/gesture bars
