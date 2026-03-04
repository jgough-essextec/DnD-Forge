# Story 46.6 — Settings & Preferences Polish

> **Epic 46: Final Polish & UX Refinements** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player, I need all settings and preferences to be discoverable and well-organized. This story covers auditing the settings page to ensure all preferences from across the app are accessible, verifying preference persistence, and implementing a first-run welcome experience for new users.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Settings Categories**:
  - **Dice**: Animation speed (Fast/Normal/Dramatic), sound effects toggle, default advantage/disadvantage lock
  - **Display**: Detailed gallery cards toggle, theme (dark only for now, structured for future light theme), reduced motion
  - **Accessibility**: High contrast mode, screen reader optimization hints
  - **Data**: Auto-save interval, undo history depth, export all data, clear all data
  - **PWA**: Check for updates, clear cache, about/version
- **Preference Storage**: IndexedDB preferences table, applied immediately on change (no "Save" button needed)
- **Deferred Items Addressed**:
  - Phase 3 OQ2 — Section-Level Edit Toggles (settings for edit mode behavior)
  - Phase 3 OQ4 — Gallery Card "Detailed Cards" Toggle (display setting)
- **First-Run Experience**: Welcome modal for first-time visitors with 3-step intro, stored dismissal in preferences

## Tasks

- [ ] **T46.6.1** — **Settings page audit:** verify all user preferences from across the app are accessible from the settings page:
  - Dice: animation speed (Fast/Normal/Dramatic), sound effects toggle, default advantage/disadvantage lock
  - Display: detailed gallery cards toggle, theme (dark only for now, but structure for future light theme), reduced motion
  - Accessibility: high contrast mode, screen reader optimization hints
  - Data: auto-save interval, undo history depth, export all data, clear all data
  - PWA: check for updates, clear cache, about/version
- [ ] **T46.6.2** — **Settings persistence:** all preferences stored in IndexedDB preferences table. Applied immediately on change (no "Save" button needed). Survive app restarts and PWA reinstalls
- [ ] **T46.6.3** — **First-run experience:** on first visit, show a brief welcome modal: "Welcome to D&D Character Forge!" with a 3-step intro: (1) Create characters with the guided wizard, (2) Use them at the table with dice, HP, and spell tracking, (3) DMs can manage campaigns and run combat. "Get Started" button. Don't show again (store dismissal in preferences)

## Acceptance Criteria

- Settings page contains all preference categories: Dice, Display, Accessibility, Data, PWA
- Dice settings include: animation speed (Fast/Normal/Dramatic), sound effects toggle, default advantage/disadvantage lock
- Display settings include: detailed gallery cards toggle, theme selector (dark only, structured for future expansion), reduced motion toggle
- Accessibility settings include: high contrast mode toggle, screen reader optimization hints
- Data settings include: auto-save interval, undo history depth, "Export All Data" button, "Clear All Data" button (with confirmation)
- PWA settings include: "Check for Updates" button, "Clear Cache" button, about/version display
- All preferences are stored in IndexedDB and persist across app restarts
- All preferences are applied immediately on change without a "Save" button
- Preferences survive PWA reinstallation (IndexedDB is separate from the service worker cache)
- First-run welcome modal appears on the first visit with a 3-step intro
- Welcome modal has a "Get Started" button that dismisses it
- Welcome modal does not appear on subsequent visits (dismissal stored in preferences)
- "Clear All Data" shows a confirmation dialog before executing
- "Export All Data" generates a full backup JSON file with all characters, campaigns, and settings

## Dependencies

- Phase 3 preferences system and settings page (foundation to build on)
- Story 41.3 (high contrast mode — setting must be in the accessibility section)
- Story 41.4 (reduced motion — setting must be in the display section)
- Story 43.1 (PWA update checking — setting must be in the PWA section)

## Notes

- The "theme" setting should be a select/radio with "Dark" selected and a disabled "Light" option marked "Coming Soon" to signal future support
- "Screen reader optimization hints" in accessibility could include tips like "Use heading navigation (H key) to jump between sections"
- The "Clear All Data" action is destructive — require a double confirmation (dialog + type "DELETE" to confirm)
- The about/version section should show the app version, build date, and a link to the project repository or changelog
- Consider organizing settings with collapsible sections or tabs if the list gets long
- The first-run welcome modal should be skippable and not block the user from interacting with the app
