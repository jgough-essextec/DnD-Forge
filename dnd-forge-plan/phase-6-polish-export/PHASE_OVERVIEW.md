# Phase 6: Polish & Export

> **Timeline:** Weeks 11-12 | **Epics:** 39-46 | **Stories:** 34 | **Tasks:** ~155

## Summary

Phase 6 transforms the feature-complete D&D Character Forge app into a production-quality product. This phase does not add new features — it hardens, optimizes, and perfects what exists. Every epic in Phase 6 cuts across the entire codebase.

Key deliverables include pixel-accurate PDF character sheet export matching the official 5e three-page layout, an optimized print stylesheet, a full WCAG 2.1 AA accessibility pass across every interactive surface, performance optimization to meet all NFR targets (FCP <1.5s, TTI <3s, Lighthouse >90, bundle <500KB gzipped), PWA installation with complete offline functionality, and a final mobile responsive polish pass resolving every deferred UX issue from Phases 1-5.

## Phase 5 Dependencies

Phase 6 assumes ALL features from Phases 1-5 are complete and functional:
- Phase 1: Data layer, SRD data, core models
- Phase 2: Character creation wizard (all 7 steps)
- Phase 3: Character sheet display, edit mode, gallery, import/export
- Phase 4: Session play (dice roller, HP tracking, spell slots, conditions, rest, level-up)
- Phase 5: DM/campaign features (campaign management, combat tracker, session log, NPC/loot trackers)

## Epics Table

| Epic | Name | Stories | Approx Tasks | Focus |
|------|------|---------|-------------|-------|
| 39 | PDF Character Sheet Export | 6 | ~30 | Client-side PDF generation matching official 5e layout |
| 40 | Print Stylesheet Optimization | 3 | ~14 | @media print CSS for clean browser printing |
| 41 | Accessibility Audit & Remediation | 5 | ~25 | WCAG 2.1 AA compliance across entire app |
| 42 | Performance Optimization | 5 | ~25 | Bundle size, lazy loading, rendering, Lighthouse |
| 43 | Progressive Web App (PWA) | 3 | ~14 | Service worker, offline caching, installability |
| 44 | Mobile Responsive Final Polish | 4 | ~17 | Every screen at every breakpoint |
| 45 | Cross-Browser Testing & Bug Fixes | 2 | ~16 | Chrome, Firefox, Safari, Edge, mobile browsers + E2E |
| 46 | Final Polish & UX Refinements | 6 | ~24 | Loading states, empty states, errors, micro-interactions |

## Key Deliverables (~155 tasks)

- **PDF Export:** Three-page character sheet PDF, campaign summary PDF, export options UI
- **Print Stylesheet:** Optimized @media print CSS, ink-saving mode, cross-browser print testing
- **Accessibility:** Keyboard navigation, screen reader support, color contrast, reduced motion, form accessibility
- **Performance:** Bundle <500KB, SRD lazy loading, rendering optimization, Lighthouse >90, stress testing
- **PWA:** Service worker, offline caching, web app manifest, install prompt, offline UX indicators
- **Mobile Polish:** All screens at all breakpoints, touch interactions, landscape mode
- **Cross-Browser:** Manual testing on 6 browsers, Playwright E2E test suite with 10 critical flows
- **Final Polish:** Skeleton screens, empty states, error boundaries, micro-interactions, manual override system, settings

## Pre-Phase Audit Notes: Deferred Items from Earlier Phases

Phase 6 inherits a collection of "do it later" items explicitly deferred during Phases 1-5.

### From Phase 3 Open Questions

- **OQ1 -- Manual Override vs. Computed Values:** Show both computed and overridden values with a "Reset to Computed" button and visual indicator. Deferred to Phase 6 polish. (Addressed in Story 46.5)
- **OQ2 -- Section-Level Edit Toggles:** Inline section editors as an alternative to full-sheet edit mode. Deferred to Phase 6 polish. (Addressed in Story 46.6)
- **OQ4 -- Gallery Card "Detailed Cards" Toggle:** Show more stats (spell save DC, initiative, class features) on gallery cards via a toggle. Deferred to Phase 6 polish. (Addressed in Story 46.6)
- **OQ5 -- Pixel-Perfect PDF Export:** Phase 3 implemented "functional print" (all data, clean layout). Phase 6 upgrades to pixel-matched official 5e sheet layout. (Addressed in Epic 39)
- **OQ6 -- Diff-Based Undo Optimization:** Phase 3 uses 20 full character snapshots (~400KB per character in memory). Phase 6 should evaluate and implement a diff-based undo system if memory is a concern at scale. (Addressed in Story 42.3)

### From Phase 4 Open Questions

- **OQ1 -- Three.js Dice Upgrade:** Phase 4 used CSS 3D transforms. Phase 6 can upgrade to Three.js for physics-based dice tumbling if bundle size permits (~150KB addition). (Evaluated in Story 42.1)

### Non-Functional Requirements from the Tech Spec

| Requirement | Target | Status After Phase 5 |
|-------------|--------|---------------------|
| First Contentful Paint | < 1.5s | Needs measurement and optimization |
| Time to Interactive | < 3s | Needs measurement and optimization |
| Lighthouse Score | > 90 (all categories) | Needs audit |
| Offline Support | Full functionality (PWA) | Not yet implemented |
| Bundle Size | < 500KB (gzipped, excluding SRD data) | Needs measurement |
| SRD Data Size | Lazy-loaded, < 2MB total | Needs verification |
| Browser Support | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ | Needs cross-browser testing |
| Mobile Support | iOS Safari, Chrome Android | Needs device testing |
| Concurrent Characters | 100+ per user | Needs stress testing |
| Auto-save | Debounced, 500ms after last change | Implemented in Phase 3 |

## Dependencies & Recommended Build Order

```
Epic 39 (PDF Export) <-- independent, build first (highest user value)
  |
Epic 40 (Print Stylesheet) <-- shares layout knowledge with PDF
  |
Epic 41 (Accessibility) <-- cross-cutting, can begin in parallel
  |   |-- Story 41.1 (Keyboard) <-- independent
  |   |-- Story 41.2 (Screen Reader) <-- independent
  |   |-- Story 41.3 (Color Contrast) <-- independent
  |   |-- Story 41.4 (Reduced Motion) <-- independent
  |   +-- Story 41.5 (Form Accessibility) <-- independent
  |
Epic 42 (Performance) <-- should follow feature work to measure accurately
  |   |-- Story 42.1 (Bundle) <-- do first, affects all load times
  |   |-- Story 42.2 (SRD Lazy Load) <-- do second
  |   |-- Story 42.3 (Rendering) <-- do third
  |   |-- Story 42.4 (Lighthouse) <-- measure after optimizations
  |   +-- Story 42.5 (Stress Test) <-- measure after optimizations
  |
Epic 43 (PWA) <-- depends on performance work (don't cache bloated bundles)
  |   |-- Story 43.1 (Service Worker) <-- core PWA
  |   |-- Story 43.2 (Manifest) <-- core PWA
  |   +-- Story 43.3 (Offline UX) <-- after service worker works
  |
Epic 44 (Mobile Polish) <-- independent, can be done in parallel
  |
Epic 45 (Cross-Browser) <-- do after all other changes are complete
  |   |-- Story 45.1 (Manual testing) <-- first
  |   +-- Story 45.2 (E2E tests) <-- automate after manual verification
  |
Epic 46 (Final Polish) <-- last, addresses all remaining rough edges
      |-- Story 46.1 (Loading states)
      |-- Story 46.2 (Empty states)
      |-- Story 46.3 (Error states)
      |-- Story 46.4 (Micro-interactions)
      |-- Story 46.5 (Manual overrides)
      +-- Story 46.6 (Settings polish)
```

### Recommended Day-by-Day Schedule

1. **Week 11, Day 1-2:** Epic 39 Stories 39.1-39.4 (PDF generation architecture + three-page layout)
2. **Week 11, Day 3:** Epic 39 Stories 39.5-39.6 (PDF export UI + campaign PDF) + Epic 40 (Print stylesheet)
3. **Week 11, Day 4-5:** Epic 41 (Accessibility audit -- all 5 stories in parallel sweep)
4. **Week 12, Day 1-2:** Epic 42 (Performance optimization -- bundle, lazy load, rendering, Lighthouse)
5. **Week 12, Day 2-3:** Epic 43 (PWA -- service worker, manifest, offline UX)
6. **Week 12, Day 3-4:** Epic 44 (Mobile responsive final polish) + Epic 45 Story 45.1 (Cross-browser manual testing)
7. **Week 12, Day 5:** Epic 45 Story 45.2 (E2E tests) + Epic 46 (Final polish, loading/empty/error states, micro-interactions, settings)

## Phase 6 Completion Criteria

Before release, ALL of the following must be true:

1. PDF Export: Three-page character sheet PDF matching the official 5e layout, all data populated, vector text, <500KB file size, paper size options, page selection, avatar embedding, offline-capable
2. Campaign PDF: Party summary with one-page-per-character condensed view, DM quick-reference table
3. Print Stylesheet: Clean browser print output, no UI chrome, proper page breaks, ink-saving option, cross-browser
4. Accessibility: Full WCAG 2.1 AA compliance -- keyboard navigation, screen reader support, color contrast, reduced motion, form accessibility, touch targets >=44x44px
5. Performance: FCP <1.5s, TTI <3s, Lighthouse >90 all categories, bundle <500KB gzipped, SRD data <2MB lazy-loaded
6. Stress Tested: 100+ characters, large campaigns, long combats, no memory leaks
7. PWA: Installable, full offline functionality, service worker caching, update prompt, proper icons
8. Mobile Polish: All screens at all breakpoints, touch interactions, landscape mode
9. Cross-Browser: 6 browsers tested and functional, Playwright E2E suite with 10 critical flows
10. Final Polish: Loading states, empty states, error boundaries, micro-interactions, manual overrides, settings complete

## Open Questions for Phase 6

1. **PDF Library Choice:** jsPDF + html2canvas is specified in the tech spec, but `@react-pdf/renderer` offers a React-native PDF layout approach (JSX to PDF). It produces cleaner vector output but has a steeper learning curve and larger bundle (~250KB). **Recommendation:** Stick with jsPDF for Phase 6 using the hybrid approach (programmatic layout + html2canvas fallback). Evaluate @react-pdf/renderer for a future upgrade if PDF quality needs improvement.

## Summary Statistics

| Category | Count |
|----------|-------|
| Epics | 8 (Epic 39-46) |
| Stories | 34 |
| Tasks | ~155 |
| PDF Pages Laid Out | 3 (Core Stats, Backstory, Spellcasting) |
| Accessibility Checks | ~45 individual items |
| Performance Targets | 6 NFRs to meet |
| Browsers Tested | 6 (Chrome, Firefox, Safari, Edge, iOS Safari, Chrome Android) |
| Breakpoints Verified | 7 (360px, 390px, 428px, 640px, 768px, 1024px, 1440px) |
| E2E Test Scenarios | 10 critical flows |
| PWA Icon Sizes | 6+ |
| Empty States | 10+ |
| Loading Skeletons | 5 major screens |
| Keyboard Shortcuts | 9 |

## Testing Strategy Summary

| Epic | Unit | Functional | E2E | Total | Gaps Found |
|------|------|-----------|-----|-------|------------|
| 39 — PDF Character Sheet Export | 37 | 11 | 19 | 67 | 5 |
| 40 — Print Stylesheet Optimization | 2 | 9 | 14 | 25 | 5 |
| 41 — Accessibility Audit & Remediation | 8 | 41 | 18 | 67 | 6 |
| 42 — Performance Optimization | 17 | 8 | 32 | 57 | 7 |
| 43 — Progressive Web App (PWA) | 9 | 14 | 14 | 37 | 6 |
| 44 — Mobile Responsive Final Polish | 0 | 5 | 33 | 38 | 6 |
| 45 — Cross-Browser Testing & Bug Fixes | 0 | 0 | 20 | 20 | 6 |
| 46 — Final Polish & UX Refinements | 16 | 48 | 19 | 83 | 8 |
| **Totals** | **89** | **136** | **169** | **394** | **49** |

### Testing Infrastructure Needed
- **Test Fixtures**: Pre-created Level 5 Fighter, Level 3 Wizard, Level 5 Cleric (domain spells), Warlock (Pact Magic), multiclass Warlock/Wizard, non-caster Fighter, high-level Wizard (50+ spells), campaign with 4 characters, campaign with 8 characters, 100+ character generation script
- **Mock Data**: Empty IndexedDB state, corrupt/invalid import files, large backstory (10,000+ chars), large inventory (100+ items), characters with/without avatars
- **Test Utilities**: PDF header byte validator, PDF text extraction (pdf-parse), color contrast calculation utility, touch target measurement, animation fps profiler, bundle size measurement, Lighthouse CI integration
- **Environment Mocks**: navigator.onLine, prefers-reduced-motion media query, beforeinstallprompt event, requestIdleCallback, navigator.vibrate, window.matchMedia, print media query emulation
- **Playwright Configuration**: Multi-browser (chromium, firefox, webkit), viewport presets (360px, 390px, 428px, 640x360, 768px, 810px, 1024px, 1024x768, 1440px), offline mode emulation, network request monitoring, service worker verification
- **Library Mocks**: jsPDF mock, html2canvas mock, JSZip mock, Dexie.js IndexedDB mock, framer-motion mock, @dnd-kit mock
