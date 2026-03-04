# Story 42.5 — Stress Testing

> **Epic 42: Performance Optimization** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a developer, I need to verify the app handles edge cases at scale. This story covers testing with 100+ characters, large campaigns, long combat encounters, memory leak detection, and IndexedDB storage limits with extreme data sizes.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Stress Test Scenarios**:
  - 100+ characters in gallery: test initial render, scroll performance, search filter, IndexedDB query time
  - Large campaign: 8 characters, 20 session notes, 50 NPC entries, 100 loot items
  - Long combat: 8 party members + 20 monsters, 10 rounds of combat
  - Memory leaks: heap snapshots before/after repeated operations
  - IndexedDB limits: very long backstories (10,000+ chars), large inventories (100+ items), extensive spell lists
- **NFR Target**: 100+ concurrent characters per user
- **Memory Testing**: Chrome DevTools Memory tab, heap snapshots comparison
- **Auto-save**: Debounced at 500ms — must not cause performance issues under stress

## Tasks

- [ ] **T42.5.1** — **100+ characters test:** create a script that generates 100+ characters with varied classes, races, levels, and equipment. Load the gallery and measure: initial render time, scroll performance, search filter responsiveness, IndexedDB query time
- [ ] **T42.5.2** — **Large campaign test:** create a campaign with 8 characters, 20 session notes, 50 NPC entries, and 100 loot items. Measure dashboard load time and interaction responsiveness
- [ ] **T42.5.3** — **Long combat test:** run an encounter with 8 party members + 20 monsters. Cycle through 10 rounds of combat. Measure: turn advance speed, HP update responsiveness, condition management, memory usage over time
- [ ] **T42.5.4** — **Memory leak detection:** use Chrome DevTools Memory tab to take heap snapshots before and after: creating 10 characters, opening/closing 10 modals, running 100 dice rolls, navigating through 20 character sheets. Verify no growing memory allocations
- [ ] **T42.5.5** — **IndexedDB storage limits:** test with characters that have very long backstories (10,000+ chars), large inventories (100+ items), and extensive spell lists. Verify no storage quota errors

## Acceptance Criteria

- Gallery with 100+ characters renders in <2 seconds initial load
- Gallery with 100+ characters scrolls at 60fps
- Gallery search filter responds within 200ms on 100+ characters
- Campaign dashboard with 8 characters, 20 sessions, 50 NPCs, 100 loot items loads in <3 seconds
- Combat tracker with 28 combatants (8 party + 20 monsters) advances turns in <100ms
- HP updates in large combat are responsive (no perceptible lag)
- No memory leaks detected after: creating 10 characters, opening/closing 10 modals, running 100 dice rolls, navigating 20 character sheets
- Characters with 10,000+ character backstories save and load without errors
- Characters with 100+ inventory items render their equipment list without lag
- No IndexedDB storage quota errors under stress conditions

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should generate 100+ realistic characters with varied classes, races, levels, and equipment via test script`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should render gallery with 100+ characters in <2 seconds initial load`
- `should scroll gallery with 100+ characters at 60fps`
- `should filter gallery search within 200ms on 100+ characters`
- `should load campaign dashboard with 8 characters, 20 sessions, 50 NPCs, 100 loot items in <3 seconds`
- `should advance combat turns in <100ms with 28 combatants (8 party + 20 monsters)`
- `should detect no memory leaks after creating 10 characters, opening/closing 10 modals, running 100 dice rolls`
- `should save and load characters with 10,000+ character backstories without errors`
- `should render equipment list for characters with 100+ inventory items without lag`
- `should not encounter IndexedDB storage quota errors under stress conditions`

### Test Dependencies
- Character generation script producing 100+ realistic characters
- Large campaign fixture (8 characters, 20 sessions, 50 NPCs, 100 loot items)
- Combat encounter fixture (8 party + 20 monsters)
- Chrome DevTools Memory API integration for heap snapshot comparison
- Performance timing utilities for render time and interaction responsiveness

## Identified Gaps

- **Error Handling**: No recovery strategy specified if stress tests reveal actual failures (just "document and create fix tasks")
- **Performance**: No specification for memory usage ceiling (how many MB is acceptable for 100+ characters?)
- **Edge Cases**: Safari's IndexedDB storage limits (~500MB-1GB) not specifically tested or accounted for
- **Edge Cases**: Auto-save performance under stress (debounced 500ms with 100+ characters editing) not specified

## Dependencies

- Stories 42.1-42.3 (optimizations should be in place before stress testing)
- All Phase 1-5 features complete (stress testing exercises entire app)

## Notes

- The character generation script should create realistic characters (not empty shells) for accurate stress testing
- Memory leak detection should compare heap snapshots over time, not just before/after — watch for steadily growing allocations
- IndexedDB storage limits vary by browser — Safari has historically been the most restrictive (~500MB-1GB)
- If stress tests reveal issues, document them and create targeted fix tasks
- Consider running stress tests as part of the CI/CD pipeline (Playwright can generate characters programmatically)
