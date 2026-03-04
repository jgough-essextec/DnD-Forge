# Story 42.3 — Rendering Performance

> **Epic 42: Performance Optimization** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player with many characters or a DM with a large party, I need the app to remain responsive even with 100+ characters. This story covers gallery virtualization for large collections, memoization audit of all components, calculation engine caching, IndexedDB read optimization, debouncing expensive operations, and image lazy loading.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Gallery Performance**: 100+ characters must scroll at 60fps with virtual scrolling
- **Virtual Scrolling Libraries**: react-window or @tanstack/virtual — only render visible cards
- **Memoization Targets**: CharacterCard, AbilityScoreBlock, SkillRow, SpellCard, CombatantRow, all table cells
- **Calculation Engine**: Recomputes derived stats on every render — needs caching keyed on character version/timestamp
- **IndexedDB Optimization**: Batch reads with Dexie's `.toArray()` instead of per-card queries
- **Debounce Targets**: Spell search (150ms), skill matrix highlighting (150ms), gallery search (150ms)
- **Deferred Item**: Phase 3 OQ6 — Diff-based undo optimization if memory is a concern at scale

## Tasks

- [ ] **T42.3.1** — **Gallery virtualization:** when the gallery has 50+ characters, use virtual scrolling (react-window or @tanstack/virtual) to only render visible cards. Measure: gallery with 100 characters should maintain 60fps scroll
- [ ] **T42.3.2** — **Memoization audit:** review all components for unnecessary re-renders. Use `React.memo()` on: CharacterCard, AbilityScoreBlock, SkillRow, SpellCard, CombatantRow, all table cells. Use `useMemo()` for: derived calculations, filtered/sorted lists, spell slot computations
- [ ] **T42.3.3** — **Calculation engine caching:** the calculation engine recomputes derived stats on every render. Implement a memoization layer: cache results keyed on the character's version/timestamp. Invalidate when character data changes
- [ ] **T42.3.4** — **IndexedDB read optimization:** batch reads for the gallery (load all characters in one query, not one query per card). Use Dexie's `.toArray()` for bulk reads. For the campaign dashboard, load all party characters in a single query
- [ ] **T42.3.5** — **Debounce expensive operations:** spell search filtering, skill matrix highlighting, and gallery search should debounce input by 150ms to avoid re-filtering on every keystroke
- [ ] **T42.3.6** — **Image lazy loading:** avatar images in the gallery use `loading="lazy"` on `<img>` tags. Only decode images when they scroll into view

## Acceptance Criteria

- Gallery with 100+ characters scrolls at 60fps with virtual scrolling enabled
- Virtual scrolling activates when gallery has 50+ characters
- All performance-critical components are wrapped in `React.memo()` (CharacterCard, AbilityScoreBlock, SkillRow, SpellCard, CombatantRow, table cells)
- Derived calculations use `useMemo()` with proper dependencies
- Calculation engine results are cached and only recomputed when character data changes
- Gallery loads all characters in a single IndexedDB query (not per-card)
- Campaign dashboard loads all party characters in a single query
- Search inputs (spell search, skill matrix, gallery) debounce filtering by 150ms
- Avatar images use `loading="lazy"` and only decode when visible
- No unnecessary re-renders observed in React DevTools Profiler for static data

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should cache calculation engine results keyed on characterId-lastModified`
- `should invalidate calculation cache when character data changes`
- `should debounce spell search filtering by 150ms`
- `should debounce skill matrix highlighting by 150ms`
- `should debounce gallery search by 150ms`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should wrap CharacterCard, AbilityScoreBlock, SkillRow, SpellCard, CombatantRow in React.memo()`
- `should use useMemo() for derived calculations with proper dependencies`
- `should activate virtual scrolling when gallery has 50+ characters`
- `should use loading="lazy" on avatar images in the gallery`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should scroll gallery with 100+ characters at 60fps with virtual scrolling`
- `should load all gallery characters in a single IndexedDB query (not per-card)`
- `should filter gallery search results within 200ms on 100+ characters`
- `should show no unnecessary re-renders in React DevTools Profiler for static data`

### Test Dependencies
- Character generation script for 100+ characters
- Virtual scrolling library (react-window or @tanstack/virtual)
- React DevTools Profiler integration for re-render detection
- IndexedDB query monitoring
- Performance measurement utilities (fps counter, timing)

## Identified Gaps

- **Performance**: No specification for maximum memory usage with 100+ characters and virtual scrolling
- **Edge Cases**: Behavior when switching between virtual and non-virtual modes (crossing 50 character threshold)
- **Dependency Issues**: Choice between react-window (~6KB) and @tanstack/virtual (~15KB) not finalized
- **Edge Cases**: Phase 3 OQ6 diff-based undo decision not resolved — memory impact at scale unclear

## Dependencies

- Story 42.1 (bundle analysis — virtual scrolling library adds to bundle size)
- All Phase 1-5 features complete (rendering audit spans entire app)

## Notes

- react-window is smaller (~6KB) than @tanstack/virtual (~15KB) but less flexible. Choose based on the gallery's layout requirements
- The calculation engine cache key should be `${characterId}-${lastModified}` to invalidate on any change
- Phase 3 OQ6 (diff-based undo) should be evaluated here — if 100 characters with 20 undo snapshots each causes memory issues, implement diff-based undo
- Avatar images stored as base64 strings in IndexedDB should be converted to blob URLs for display to avoid blocking the main thread
