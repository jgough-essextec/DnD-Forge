# Story 6.3 — UI Store

> **Epic 6: Zustand State Management Stores** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need a store for transient UI state.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **UI state**: Transient application state that controls visual elements. This state does NOT persist across sessions — it resets when the page is reloaded. Includes:
  - `activeModal: string | null` — which modal dialog is currently open (null = none). Modals include: spell details, item details, feature descriptions, confirmation dialogs, etc.
  - `sidebarOpen: boolean` — whether the sidebar panel is expanded (desktop layout)
  - `editMode: boolean` — whether the character sheet is in view mode or edit mode
  - `mobileNavOpen: boolean` — whether the mobile navigation menu is expanded
  - `diceRollerOpen: boolean` — whether the floating dice roller panel is visible
  - `theme: 'dark' | 'light'` — the current color theme (this could also be derived from preferences, but the UI store provides immediate reactivity)
- **Responsive breakpoint**: The app needs to detect whether the viewport is mobile (<= 640px) or desktop (> 640px) and expose this as a boolean flag (`isMobile`). This drives layout decisions: mobile gets bottom tab navigation, desktop gets top navigation bar
- **No persistence**: Unlike the wizard store, the UI store uses NO persist middleware. All state resets on page reload. This is intentional — modal state, sidebar state, etc. should not survive reloads

## Tasks
- [ ] **T6.3.1** — Create `stores/uiStore.ts` with state: `{ activeModal, sidebarOpen, editMode, mobileNavOpen, diceRollerOpen, theme }`
- [ ] **T6.3.2** — Implement toggle/set actions for each state property
- [ ] **T6.3.3** — Implement responsive breakpoint detection hook that auto-updates `isMobile` flag

## Acceptance Criteria
- The UI store initializes with sensible defaults (no active modal, sidebar closed, view mode, mobile nav closed, dice roller closed, dark theme)
- Each state property has both a toggle action and a set action (e.g., `toggleSidebar()` and `setSidebarOpen(value)`)
- `setActiveModal(id)` opens a modal, `setActiveModal(null)` closes it
- `toggleEditMode()` switches between view and edit modes
- The responsive breakpoint hook detects viewport width and sets `isMobile` accordingly
- The `isMobile` flag updates when the window is resized
- The store does NOT persist across page reloads

## Dependencies
- **Depends on:** Story 2.10 (UIState type), Story 5.4 (preferences for initial theme value)
- **Blocks:** All Phase 2+ UI components that consume UI state (modals, navigation, edit mode, etc.)

## Notes
- The responsive breakpoint hook should use `window.matchMedia('(max-width: 640px)')` with an event listener for changes, rather than polling `window.innerWidth`. This is more performant and aligns with CSS media query behavior
- The `theme` field in the UI store should be initialized from the user's stored preferences (Story 5.4). When the user changes the theme, both the UI store and preferences should be updated
- Consider adding a `closeAllModals()` action that is called when navigating between routes (modals from a previous page should not persist)
- The `editMode` flag is specific to the character sheet — when viewing a character, the user can toggle into edit mode to make changes. Consider scoping this to only be relevant on character sheet routes
- For the dice roller panel, `diceRollerOpen` controls a floating/slide-out panel that can be opened from any page. It overlays the content rather than navigating to `/dice`
- Actions should be named consistently: `toggleX()` for boolean flips, `setX(value)` for explicit value setting, `openX()`/`closeX()` for open/close patterns
