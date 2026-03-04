# Story 44.2 — Tablet Layout Audit & Fixes

> **Epic 44: Mobile Responsive Final Polish** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player using a tablet at the game table, I need the app to use the extra screen space effectively. This story covers testing at tablet widths (768px, 810px, 1024px) and specific layout optimizations for the campaign dashboard, combat tracker, and dice roller on tablets.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Tablet Widths to Test**: 768px (iPad Mini), 810px (iPad), 1024px (iPad Pro 11")
- **Layout Strategy**: Two-column layouts where appropriate to use extra screen space
- **Campaign Dashboard Tablet**: Party stats grid should show all columns without horizontal scroll, hide least important if needed
- **Combat Tracker Tablet**: Side-by-side layout — initiative list (60%) + selected combatant detail (40%), no full-screen modals for HP
- **Dice Roller Tablet**: Side panel (right edge, 30% width) instead of full-screen overlay, stays visible during character sheet interaction

## Tasks

- [ ] **T44.2.1** — **Tablet audit:** test at 768px (iPad Mini), 810px (iPad), and 1024px (iPad Pro 11"). All screens should use two-column layouts where appropriate
- [ ] **T44.2.2** — **Campaign dashboard tablet:** party stats grid should show all columns without horizontal scrolling. If too wide, hide the least important columns (conditions, notes) and make them expandable
- [ ] **T44.2.3** — **Combat tracker tablet:** side-by-side layout — initiative list on the left (60%), selected combatant detail on the right (40%). No full-screen modals for HP editing — use the detail panel
- [ ] **T44.2.4** — **Dice roller tablet:** side panel (right edge, 30% width) rather than a full-screen overlay. Stays visible while the character sheet is open for seamless rolling

## Acceptance Criteria

- All screens tested at 768px, 810px, and 1024px widths
- Two-column layouts are used where appropriate on tablet sizes
- Campaign dashboard party stats grid shows all columns without horizontal scrolling at 1024px
- Less important columns (conditions, notes) collapse or become expandable if grid is too wide at 768px
- Combat tracker uses side-by-side layout: initiative list (60% left), combatant detail (40% right)
- HP editing uses the detail panel on tablet (no full-screen modal)
- Dice roller displays as a side panel (30% width, right edge) on tablet
- Dice roller side panel stays visible while interacting with the character sheet
- No horizontal scrolling or overlapping elements at any tablet width

## Dependencies

- All Phase 1-5 features complete (audit covers every screen)
- Phase 5 campaign dashboard and combat tracker layouts

## Notes

- At 1024px, the app should be close to the desktop layout — the iPad Pro 11" essentially gets the desktop experience
- The dice roller as a side panel on tablets is a significant UX improvement for game-table use
- Consider using CSS container queries for component-level responsive behavior if supported
- Test with both landscape and portrait orientations on tablets (handled in Story 44.4)
