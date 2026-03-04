# Story 43.1 — Service Worker & Offline Caching

> **Epic 43: Progressive Web App (PWA)** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player at a table with no Wi-Fi, I need the app to work completely offline after my first visit. This story covers configuring vite-plugin-pwa with Workbox, defining the caching strategy (pre-cache app shell + runtime cache data), verifying complete offline functionality, pre-caching all SRD data on service worker install, and implementing a non-intrusive update flow.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **PWA Plugin**: vite-plugin-pwa with Workbox
- **Registration Type**: `registerType: 'prompt'` — show a prompt when updates are available rather than auto-reloading
- **Pre-cache Targets**: All JS/CSS bundles, HTML, fonts, icons, Tier 1 SRD data, and ALL SRD data files (~2MB total)
- **Runtime Cache Strategy**: CacheFirst for Tier 2/3/4 SRD data, NetworkFirst ready for future sync features
- **Offline Features**: Gallery, character sheets, dice roller, creation wizard, campaign dashboard, combat tracker, PDF export — ALL must work offline
- **Update Flow**: Non-intrusive toast notification, never auto-reload mid-session

## Tasks

- [ ] **T43.1.1** — Install and configure `vite-plugin-pwa` in `vite.config.ts`. Configuration:
  - `registerType: 'prompt'` — show a prompt when updates are available rather than auto-reloading
  - `workbox.globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}']` — pre-cache all static assets including SRD data files and fonts
  - `includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'fonts/*', 'icons/*']` — ensure all PWA assets are cached
- [ ] **T43.1.2** — **Service worker strategy:** use "pre-cache app shell + runtime cache data" approach:
  - Pre-cache: all JS/CSS bundles, HTML, fonts, icons, and Tier 1 SRD data
  - Runtime cache (CacheFirst): Tier 2/3/4 SRD data files (cached on first request, served from cache thereafter)
  - Runtime cache (NetworkFirst): no external API calls to cache in the current architecture, but structure is ready for future sync features
- [ ] **T43.1.3** — **Offline verification:** after installing the service worker, toggle airplane mode and verify: gallery loads, character sheets render, dice roller works, creation wizard completes (all SRD data must be cached), campaign dashboard loads, combat tracker functions, PDF export works (jsPDF is client-side)
- [ ] **T43.1.4** — **SRD data pre-caching:** the SRD JSON files (~2MB total) must be pre-cached on service worker install, not lazily. Otherwise the first offline visit after install will fail if the user hasn't visited every page. Add all SRD files to the workbox pre-cache manifest
- [ ] **T43.1.5** — **Update flow:** when a new version is deployed, the service worker detects the update. Show a non-intrusive toast: "A new version of D&D Character Forge is available. [Reload to update]". Clicking reloads and activates the new service worker. Never auto-reload (the user might be mid-session)

## Acceptance Criteria

- vite-plugin-pwa is configured in `vite.config.ts` with `registerType: 'prompt'`
- Service worker pre-caches all JS/CSS bundles, HTML, fonts, icons, and SRD data files
- All SRD JSON files (~2MB) are pre-cached on service worker install (not lazy)
- After service worker install, the entire app works offline: gallery, character sheets, dice roller, creation wizard, campaign dashboard, combat tracker, PDF export
- Runtime caching is configured with CacheFirst for SRD data and NetworkFirst ready for future sync
- When a new version is available, a non-intrusive toast notification appears with a "Reload to update" action
- The app never auto-reloads without user action
- Service worker activates correctly on first visit and caches all required assets

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should configure vite-plugin-pwa with registerType: 'prompt' in vite.config.ts`
- `should include all SRD JSON files in workbox pre-cache manifest`
- `should configure CacheFirst strategy for Tier 2/3/4 SRD data runtime caching`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should show non-intrusive toast notification when a new version is available`
- `should reload and activate new service worker only when user clicks "Reload to update"`
- `should never auto-reload the app without user action`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should register service worker on first visit and cache all required assets`
- `should pre-cache all SRD JSON files (~2MB) on service worker install`
- `should load gallery page fully offline after service worker install`
- `should render character sheet fully offline after service worker install`
- `should complete creation wizard fully offline (all SRD data cached)`
- `should run dice roller offline`
- `should generate PDF export offline (jsPDF is client-side)`
- `should load campaign dashboard offline`

### Test Dependencies
- vite-plugin-pwa configuration with Workbox
- Playwright offline mode emulation (page.context().setOffline(true))
- Service worker registration verification
- Cache storage inspection utilities
- SRD data file manifest for pre-cache verification

## Identified Gaps

- **Error Handling**: No specification for behavior when service worker install fails mid-caching (partial cache state)
- **Performance**: SRD pre-caching (~2MB) impact on initial service worker install time not measured
- **Edge Cases**: Behavior when user closes browser during service worker install not specified
- **Edge Cases**: skipWaiting() behavior during mid-session updates not fully specified

## Dependencies

- Epic 42 (Performance) should be complete — don't cache bloated/unoptimized bundles
- Story 42.2 (SRD data lazy loading — need to know which files to pre-cache)

## Notes

- The SRD data pre-caching (~2MB) increases the initial service worker install time, but is essential for full offline support
- Test the service worker in Chrome DevTools Application tab (Service Workers section)
- The `registerType: 'prompt'` setting means the user must explicitly choose to update — this is critical for a game table scenario where reloading mid-session would be disruptive
- Consider adding a `skipWaiting()` option that only activates when the user navigates away and back
