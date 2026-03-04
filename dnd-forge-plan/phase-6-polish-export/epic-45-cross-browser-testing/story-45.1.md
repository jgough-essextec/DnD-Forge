# Story 45.1 — Cross-Browser Functional Testing

> **Epic 45: Cross-Browser Testing & Bug Fixes** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a developer, I need the app to work on all target browsers. This story covers building a test matrix for core flows across 6 browsers, investigating and fixing Safari-specific issues (IndexedDB, CSS), Firefox-specific issues (print CSS, scrollbar styling), Edge-specific issues (PWA, PDF download), mobile browser testing, and CSS compatibility auditing with PostCSS autoprefixer.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Target Browsers**: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+, iOS Safari, Chrome Android
- **Core Flows to Test**: Character creation, character sheet rendering, dice rolling, HP tracking, rest automation, level-up, campaign management, combat tracker, PDF export, import/export
- **Safari Risk Areas**: IndexedDB reliability (historical bugs), `crypto.getRandomValues()` for dice, `backdrop-filter`, `gap` in flexbox, CSS custom properties, PWA installation on iOS
- **Firefox Risk Areas**: `@media print` rendering (page breaks differ), `overflow: auto` with nested flex, scrollbar styling
- **Edge Risk Areas**: Chromium-based so mostly Chrome-compatible, test PWA installation and PDF download
- **Mobile Risk Areas**: Touch interactions, viewport behavior, virtual keyboard handling
- **CSS Risk Features**: Container queries, `:has()` selector, `@layer`, CSS nesting — may need vendor prefixes or fallbacks

## Tasks

- [ ] **T45.1.1** — **Test matrix:** test core flows on each browser: character creation, character sheet rendering, dice rolling, HP tracking, rest automation, level-up, campaign management, combat tracker, PDF export, import/export
- [ ] **T45.1.2** — **Safari-specific issues:** test IndexedDB reliability (Safari has historically had bugs with IndexedDB). Test `crypto.getRandomValues()` for dice. Test CSS: `backdrop-filter` (used for modals), `gap` in flexbox, CSS custom properties. Test PWA installation on iOS Safari
- [ ] **T45.1.3** — **Firefox-specific issues:** test `@media print` rendering (Firefox handles page breaks differently). Test CSS: `overflow: auto` with nested flex containers, scrollbar styling
- [ ] **T45.1.4** — **Edge-specific issues:** Edge uses Chromium so most things should work identically to Chrome. Test PWA installation. Test PDF download behavior
- [ ] **T45.1.5** — **Mobile browser testing:** Chrome Android (primary), iOS Safari (critical), Samsung Internet. Test touch interactions, viewport behavior, virtual keyboard handling (numeric inputs shouldn't cause layout shifts)
- [ ] **T45.1.6** — **CSS compatibility:** audit for any CSS features that need vendor prefixes or aren't supported in older targets: container queries, `has()` selector, `@layer`, nesting. Use PostCSS autoprefixer in the Vite build

## Acceptance Criteria

- All 10 core flows tested and passing on Chrome 90+
- All 10 core flows tested and passing on Firefox 90+
- All 10 core flows tested and passing on Safari 15+
- All 10 core flows tested and passing on Edge 90+
- All 10 core flows tested and passing on iOS Safari
- All 10 core flows tested and passing on Chrome Android
- Safari IndexedDB reliability verified (data persists across sessions, no corruption)
- `crypto.getRandomValues()` works correctly for dice rolling in all browsers
- `backdrop-filter` renders correctly in Safari (modals have proper blur effect)
- Firefox @media print handles page breaks correctly (or documented workaround)
- Edge PWA installation and PDF download work correctly
- Virtual keyboard on mobile doesn't cause layout shifts
- PostCSS autoprefixer is configured in Vite build for vendor prefixes
- Known browser-specific discrepancies are documented with workarounds

## Dependencies

- All Phase 6 epics (39-44, 46) should be complete before cross-browser testing
- Story 40.3 (print testing) can be merged into this story or done in parallel

## Notes

- Use BrowserStack or similar service for testing browsers you don't have locally
- Safari on iOS is the most likely browser to have issues — test thoroughly
- Samsung Internet is used by a significant portion of Android users — worth testing
- Document all browser-specific bugs and fixes in a cross-browser compatibility report
- PostCSS autoprefixer should be configured with the browserslist: "chrome >= 90, firefox >= 90, safari >= 15, edge >= 90"
