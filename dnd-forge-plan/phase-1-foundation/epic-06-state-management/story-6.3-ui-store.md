# Story 6.3 — UI Store

> **Epic 6: Zustand State Management Stores** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need a Zustand UI store for client-side preferences and transient UI state, with user preference synchronization from the Django REST API via React Query, so that visual state (modals, sidebar, edit mode) is managed locally while persistent preferences (theme) are fetched from and saved to the server.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **UI state (Zustand)**: Transient application state that controls visual elements. This state does NOT persist across sessions — it resets when the page is reloaded. Includes:
  - `activeModal: string | null` — which modal dialog is currently open (null = none)
  - `sidebarOpen: boolean` — whether the sidebar panel is expanded (desktop layout)
  - `editMode: boolean` — whether the character sheet is in view mode or edit mode
  - `mobileNavOpen: boolean` — whether the mobile navigation menu is expanded
  - `diceRollerOpen: boolean` — whether the floating dice roller panel is visible
  - `theme: 'dark' | 'light'` — the current color theme, initialized from API preferences on app load
  - `toasts: Toast[]` — array of active toast notifications
  - `modalState: Record<string, unknown>` — optional data payload for the active modal
- **Preferences (React Query)**: User preferences (theme, etc.) are persisted on the server via `GET /api/preferences/` and `PUT /api/preferences/`. React Query fetches preferences on app init and syncs the theme value into the Zustand UI store
- **Responsive breakpoint**: The app detects mobile (<= 640px) vs desktop (> 640px) via `window.matchMedia` and exposes an `isMobile` boolean flag

## Tasks
- [ ] **T6.3.1** — Create `stores/uiStore.ts` with Zustand. State: `{ activeModal, sidebarOpen, editMode, mobileNavOpen, diceRollerOpen, theme, toasts, modalState }`. No persist middleware
- [ ] **T6.3.2** — Implement toggle/set actions for each state property: `toggleSidebar()`, `setSidebarOpen(value)`, `setActiveModal(id, data?)`, `toggleEditMode()`, `toggleMobileNav()`, `toggleDiceRoller()`, `setTheme(theme)`, `addToast(toast)`, `removeToast(id)`
- [ ] **T6.3.3** — Create `hooks/usePreferences.ts` — React Query `useQuery(['preferences'], () => api.getPreferences())` hook that fetches user preferences from `GET /api/preferences/`
- [ ] **T6.3.4** — Create `hooks/useUpdatePreferences.ts` — React Query `useMutation` hook that saves preference changes via `PUT /api/preferences/` and invalidates the `['preferences']` query cache on success
- [ ] **T6.3.5** — Create `hooks/useSyncTheme.ts` — on app initialization, fetch preferences via `usePreferences()`, and when data arrives, call `uiStore.getState().setTheme(preferences.theme)` to apply the server-stored theme to the UI store
- [ ] **T6.3.6** — Implement responsive breakpoint detection hook (`hooks/useIsMobile.ts`) that uses `window.matchMedia('(max-width: 640px)')` and returns an `isMobile` boolean
- [ ] **T6.3.7** — Write tests: Vitest for Zustand store logic, Vitest + MSW for preference hooks, mock `window.matchMedia` for responsive hook

## Acceptance Criteria
- The UI store initializes with sensible defaults (no active modal, sidebar closed, view mode, mobile nav closed, dice roller closed, dark theme, empty toasts)
- Each state property has both a toggle action and a set action (e.g., `toggleSidebar()` and `setSidebarOpen(value)`)
- `setActiveModal(id, data?)` opens a modal with optional data payload, `setActiveModal(null)` closes it
- `toggleEditMode()` switches between view and edit modes
- `addToast(toast)` appends a toast notification, `removeToast(id)` removes it
- `usePreferences()` returns `{ data, isLoading, isError }` with user preferences from the API
- `useUpdatePreferences()` saves changes via `PUT /api/preferences/` and invalidates the cache on success
- On app init, the theme from API preferences is applied to the Zustand UI store via `setTheme()`
- When the user changes the theme in the UI, both the Zustand store and the API are updated (Zustand for immediate reactivity, API for persistence)
- The responsive breakpoint hook detects viewport width and returns `isMobile` accordingly
- The `isMobile` value updates when the window is resized
- The Zustand UI store does NOT persist across page reloads (no persist middleware)
- Tests use MSW for API mocking and mock `window.matchMedia` for responsive tests

## Testing Requirements

### Unit Tests (Vitest)
_For Zustand store logic_

- `should initialize with no active modal, sidebar closed, view mode, mobile nav closed, dice roller closed, dark theme, empty toasts`
- `should toggle sidebar state via toggleSidebar`
- `should set activeModal to specific ID and null to close via setActiveModal`
- `should pass modal data payload via setActiveModal(id, data)`
- `should toggle between view and edit modes via toggleEditMode`
- `should toggle mobile nav open/close via toggleMobileNav`
- `should toggle dice roller panel via toggleDiceRoller`
- `should set theme via setTheme`
- `should add toast via addToast and remove via removeToast`

### Hook Tests (Vitest + MSW + renderHook)
_For React Query preference hooks and responsive hook_

- `should fetch user preferences via usePreferences`
- `should return isLoading while preferences fetch is in progress`
- `should save preference changes via useUpdatePreferences`
- `should invalidate preferences cache on successful update`
- `should sync theme from API preferences to UI store via useSyncTheme`

### Functional Tests (Vitest)
_For responsive breakpoint hook_

- `should detect mobile viewport (<=640px) via useIsMobile hook`
- `should detect desktop viewport (>640px) via useIsMobile hook`
- `should update isMobile when window is resized`

### Test Dependencies
- MSW (Mock Service Worker) for API request interception
- `@testing-library/react` with `renderHook` for hook testing
- React Query `QueryClientProvider` wrapper for test renders
- Mock `window.matchMedia` for responsive breakpoint testing
- UIState type from Story 2.10

## Identified Gaps

- **Edge Cases**: No specification for `closeAllModals()` action when navigating between routes
- **Preference Schema**: The shape of the preferences API response is not fully defined — at minimum it includes `theme`, but may grow to include other settings
- **Mobile/Responsive**: Tablet viewport behavior (640px-1024px) is not specified
- **Toast Lifecycle**: Auto-dismiss timing for toasts is not specified at this layer

## Dependencies
- **Depends on:** Story 2.10 (UIState type), Django REST API preferences endpoints
- **Blocks:** All Phase 2+ UI components that consume UI state (modals, navigation, edit mode, theme, toasts)

## Notes
- The Zustand UI store holds transient state only. User preferences that need to survive across sessions (theme, etc.) are persisted via the Django REST API, not Zustand persist middleware or localStorage
- The theme sync flow: on app init, `usePreferences()` fetches from the API, `useSyncTheme()` applies the result to the Zustand store. When the user changes the theme, the UI store updates immediately (for instant feedback) and `useUpdatePreferences()` saves to the API in the background
- The responsive breakpoint hook should use `window.matchMedia('(max-width: 640px)')` with an event listener for changes, rather than polling `window.innerWidth`. This is more performant and aligns with CSS media query behavior
- Consider adding a `closeAllModals()` action that is called on route changes (modals from a previous page should not persist)
- The `editMode` flag is specific to the character sheet — when viewing a character, the user can toggle into edit mode. Consider scoping this to only be relevant on character sheet routes
- For the dice roller panel, `diceRollerOpen` controls a floating/slide-out panel that can be opened from any page. It overlays the content rather than navigating to `/dice`
- Actions should be named consistently: `toggleX()` for boolean flips, `setX(value)` for explicit value setting
