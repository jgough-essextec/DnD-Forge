# Story 25.3 — Settings & Preferences

> **Epic 25: Routing & Navigation** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need a settings page or panel to configure my preferences (dice sounds, auto-save, theme, default ability score method).

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Settings Storage**: API-backed preferences (GET/PUT /api/preferences/) via React Query
- **Settings Access**: Via the nav bar gear icon. Can be a dedicated page or slide-out panel
- **Available Settings**:
  - Default Player Name: pre-fills in creation wizard
  - Dice Sound Effects: on/off toggle
  - Dice Animation Speed: fast / normal / dramatic
  - Auto-Save Interval: 500ms / 1s / 2s / manual only
  - Default Ability Score Method: Standard Array / Point Buy / Rolling
  - Show Dice Roll Results Inline: on/off toggle
  - Reduced Motion: on/off toggle (disables all animations for accessibility)
  - Dark Mode / Light Mode: toggle (default: dark)
  - Gallery Default Sort: dropdown matching gallery sort options
- **Danger Zone**: "Clear All Data" requires typing "DELETE" to confirm. "Export All Data" exports all user data via API
- **About Section**: App version, OGL license acknowledgments, SRD link, credits

## Tasks
- [ ] **T25.3.1** — Create `pages/SettingsPage.tsx` or `components/layout/SettingsPanel.tsx` — accessible from the nav bar gear icon. Settings persisted via API (PUT /api/preferences/) using React Query mutation
- [ ] **T25.3.2** — Available settings:
  - **Default Player Name:** pre-fills in the creation wizard
  - **Dice Sound Effects:** toggle on/off
  - **Dice Animation Speed:** fast / normal / dramatic
  - **Auto-Save Interval:** 500ms / 1s / 2s / manual only
  - **Default Ability Score Method:** Standard Array / Point Buy / Rolling
  - **Show Dice Roll Results Inline:** toggle
  - **Reduced Motion:** toggle (disables all animations for accessibility)
  - **Dark Mode / Light Mode:** toggle (default: dark)
  - **Gallery Default Sort:** dropdown matching gallery sort options
- [ ] **T25.3.3** — "Clear All Data" danger zone at the bottom of settings: "Delete all characters, campaigns, and preferences. This cannot be undone." Requires typing "DELETE" to confirm
- [ ] **T25.3.4** — "Export All Data" button that exports all user data (fetched via GET /api/export/) as a single JSON backup file
- [ ] **T25.3.5** — "About" section: app version, license acknowledgments (OGL for SRD content), link to D&D 5e SRD, credits

## Acceptance Criteria
- Settings page/panel is accessible from the nav bar gear icon
- All listed settings are configurable and persist via API (PUT /api/preferences/)
- Default Player Name pre-fills in the creation wizard
- Dice settings (sound, animation speed, inline results) affect dice engine behavior
- Auto-Save Interval setting affects the debounce timer in edit mode
- Default Ability Score Method sets the default in the creation wizard
- Reduced Motion toggle disables all animations across the app
- Dark/Light Mode toggle switches the app theme
- Gallery Default Sort setting affects the gallery's initial sort order
- "Clear All Data" requires typing "DELETE" and confirms before executing
- "Clear All Data" deletes all characters, campaigns, and preferences via API (DELETE /api/user-data/)
- "Export All Data" exports all user data via API as a JSON file
- "About" section shows version, OGL acknowledgments, SRD link, and credits
- Settings changes take effect immediately without requiring a page reload

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should serialize preferences to API-compatible format`
- `should validate auto-save interval options (500ms, 1s, 2s, manual)`
- `should validate ability score method options (Standard Array, Point Buy, Rolling)`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render settings page accessible from nav bar gear icon`
- `should display all listed settings with correct control types (toggles, dropdowns)`
- `should persist Default Player Name via API preferences endpoint`
- `should toggle Dice Sound Effects on/off`
- `should change Dice Animation Speed (fast/normal/dramatic)`
- `should change Auto-Save Interval setting`
- `should change Default Ability Score Method setting`
- `should toggle Show Dice Roll Results Inline`
- `should toggle Reduced Motion and disable all animations`
- `should toggle Dark/Light Mode theme`
- `should change Gallery Default Sort setting`
- `should render "Clear All Data" danger zone requiring "DELETE" confirmation`
- `should not execute clear when incorrect text is typed`
- `should delete all data via API when "DELETE" is correctly typed and confirmed`
- `should render "Export All Data" button that exports all user data via API`
- `should display About section with version, OGL acknowledgments, SRD link, credits`
- `should apply settings changes immediately without page reload`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should change a setting, navigate away, return, and verify the setting persisted`
- `should toggle Reduced Motion and verify animations are disabled across the app`

### Test Dependencies
- MSW (Mock Service Worker) to mock preferences API endpoints (GET/PUT /api/preferences/)
- Mock dice engine for dice-related settings
- Mock Zustand stores for theme state (ephemeral UI state)
- Mock auto-save system from Story 20.2

## Identified Gaps

- **Error Handling**: No specification for API preferences write failure
- **Accessibility**: No specification for settings form ARIA labels, no keyboard navigation for settings controls
- **Edge Cases**: No specification for "Export All Data" with very large databases (many characters with avatars)
- **Loading/Empty States**: No specification for settings loading state while preferences are fetched from API

## Dependencies
- Django REST API preferences endpoints (GET/PUT /api/preferences/) and React Query for state management
- Phase 1 dice engine (affected by dice settings)
- Story 20.2 (Auto-Save) — auto-save interval setting
- Story 21.2 (Gallery Sort) — gallery default sort setting
- Story 25.2 (Top Nav) — settings gear icon trigger

## Notes
- Settings should take effect immediately — no "Save" button needed
- The "Reduced Motion" setting is an accessibility feature that should be respected by all animation code (framer-motion, CSS transitions)
- "Clear All Data" is a destructive operation — the "type DELETE" confirmation prevents accidental data loss
- "Export All Data" is useful for full backups before clearing data or migrating devices
- The OGL (Open Game License) acknowledgment is legally required for apps that use D&D SRD content
- Dark mode is the default theme, matching the dark fantasy aesthetic of the app
