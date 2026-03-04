# Story 43.3 — Offline UX Indicators

> **Epic 43: Progressive Web App (PWA)** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player, I need to know when I'm offline and be assured that my data is safe. This story covers a network status indicator in the app header, data safety reassurance messaging, documenting feature availability offline, and handling the first-time offline experience when SRD data may not be fully cached.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Network Detection**: `navigator.onLine` property and `online`/`offline` events
- **Local-First Architecture**: All data is in IndexedDB — nothing is lost when offline. No backend to sync with
- **Offline Badge**: Small badge in app header, hidden when online, shows "Offline" with cloud-slash icon when offline
- **Data Safety**: All changes save to IndexedDB locally — no sync needed. Reassurance message prevents user anxiety
- **First-Time Cache**: If user installs PWA and goes offline before SRD data is fully cached, need helpful guidance

## Tasks

- [ ] **T43.3.1** — **Network status indicator:** a small badge in the app header that shows online/offline status. Online: hidden (no indicator needed). Offline: show a subtle "Offline" badge with a cloud-slash icon. Use `navigator.onLine` and the `online`/`offline` events
- [ ] **T43.3.2** — **Data safety messaging:** when offline, if the user makes changes (edit character, create new character, run combat), show a subtle reassurance: "Changes saved locally." No data is lost because the app is local-first — there's nothing to sync. This message preempts anxiety about offline data loss
- [ ] **T43.3.3** — **Feature availability:** all features work offline in the current architecture (no backend). If future phases add sync features, those specific actions should be grayed out with "Available when online" tooltips. For Phase 6, nothing needs to be disabled
- [ ] **T43.3.4** — **First-time offline experience:** if a user installs the PWA and goes offline before SRD data is fully cached, show a helpful message: "Some game data is still loading. Please connect to the internet briefly to complete the setup." Track caching progress and show a completion indicator

## Acceptance Criteria

- Network status badge is hidden when online (no unnecessary visual noise)
- When offline, an "Offline" badge with cloud-slash icon appears in the app header
- Badge transitions smoothly when network status changes (no flicker)
- "Changes saved locally" reassurance message appears when making changes while offline
- Reassurance message is subtle (not a blocking modal) and auto-dismisses
- All features remain fully functional offline (no features disabled or grayed out)
- If SRD data is not fully cached when going offline, a helpful message guides the user to reconnect briefly
- Caching progress is tracked and a completion indicator shows when all SRD data is cached
- Network status detection works correctly across all supported browsers

## Dependencies

- Story 43.1 (service worker must be working for offline functionality)
- Story 43.2 (PWA must be installable for the first-time offline scenario)

## Notes

- `navigator.onLine` can give false positives (returns true when connected to a network that has no internet) — but for a local-first app this is acceptable since no internet is actually needed
- The "Changes saved locally" message should use the same toast system as other notifications in the app
- Future-proofing for sync features: structure the offline UX so that individual actions can be selectively disabled when a backend is added
- The caching progress indicator could be a small bar or percentage in the settings page showing "Offline ready: 85%" until all SRD data is cached
