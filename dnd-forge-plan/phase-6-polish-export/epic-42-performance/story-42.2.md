# Story 42.2 — SRD Data Lazy Loading

> **Epic 42: Performance Optimization** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a developer, I need SRD data to load on demand, not at initial page load, to keep TTI under 3 seconds. This story covers splitting SRD data into four tiers based on when they're needed, implementing a DataLoader utility with caching, adding preloading hints for anticipated navigation, and measuring total SRD data payload to stay under 2MB.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90, SRD data <2MB total
- **Accessibility Target**: WCAG 2.1 AA compliance
- **SRD Data Tier Strategy**:
  - **Tier 1 (always loaded, ~50KB):** races.json (names + key traits only), classes.json (names + hit die + key info only), ability score tables, proficiency bonus table, conditions list, XP thresholds — enough for gallery and basic sheet
  - **Tier 2 (on demand, ~200KB each):** full race details, full class features, equipment.json
  - **Tier 3 (on demand, ~500KB):** spells.json — typically the largest single file
  - **Tier 4 (on demand, ~300KB):** monsters.json index, full monster stat blocks loaded individually
- **DataLoader**: Uses dynamic `import()` for JSON files, caches in Zustand store, shows skeleton loading states
- **Preloading**: `requestIdleCallback` used to preload data when user navigates to likely-needed pages

## Tasks

- [ ] **T42.2.1** — **Data splitting strategy:** separate SRD data into tiers:
  - **Tier 1 (always loaded, ~50KB):** races.json (names + key traits only), classes.json (names + hit die + key info only), ability score tables, proficiency bonus table, conditions list, XP thresholds. This is enough to render the gallery and basic sheet
  - **Tier 2 (loaded on demand, ~200KB each):** full race details (loaded when race step opens), full class features (loaded when class step opens or sheet features section renders), equipment.json (loaded when equipment step or inventory renders)
  - **Tier 3 (loaded on demand, ~500KB):** spells.json (loaded when spell step opens or spell page renders). This is typically the largest single file
  - **Tier 4 (loaded on demand, ~300KB):** monsters.json index (loaded when DM starts an encounter). Full monster stat blocks loaded individually
- [ ] **T42.2.2** — Implement a `DataLoader` utility that uses dynamic `import()` for JSON files. Cache loaded data in memory (Zustand store) so subsequent accesses are instant. Show skeleton loading states while data loads
- [ ] **T42.2.3** — **Preloading hints:** when the user navigates to the creation wizard, preload Tier 2 data in the background (using `requestIdleCallback`). When navigating to a character sheet, preload the spell data if the character is a caster
- [ ] **T42.2.4** — Measure total SRD data payload: target <2MB for all tiers combined. If over, compress JSON files (Vite can gzip static assets) or trim unused fields from the source data

## Acceptance Criteria

- SRD data is split into 4 tiers with Tier 1 (~50KB) loaded at initial page load
- Tiers 2-4 are loaded on demand via dynamic `import()` only when needed
- DataLoader utility caches loaded data in Zustand store for instant subsequent access
- Skeleton loading states are shown while SRD data loads
- Preloading hints fire on navigation to creation wizard (Tier 2) and caster character sheet (Tier 3)
- Preloading uses `requestIdleCallback` to avoid blocking the main thread
- Total SRD data payload across all tiers is under 2MB
- TTI remains under 3 seconds with only Tier 1 data loaded at startup
- Gallery and basic character sheet render correctly with only Tier 1 data

## Dependencies

- Story 42.1 (bundle size analysis — need to understand current SRD data sizes)
- Phase 1 SRD data files (races, classes, spells, monsters, equipment)

## Notes

- The service worker (Epic 43) will pre-cache ALL tiers for offline use — but the initial page load should only include Tier 1
- Vite's JSON import supports dynamic imports natively: `const data = await import('./data/spells.json')`
- Consider splitting spells.json by level (spells-1.json, spells-2.json, etc.) if the single file is too large
- The DataLoader should handle concurrent requests for the same data file (dedup in-flight requests)
