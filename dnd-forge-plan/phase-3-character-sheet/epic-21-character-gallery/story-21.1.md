# Story 21.1 — Gallery Grid Layout

> **Epic 21: Character Gallery (Home Screen)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player opening the app, I need to see all my characters displayed as visually distinct cards so I can quickly find and open the one I want.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Gallery as Home Screen**: The character gallery is the app's primary entry point (route: `/`). It fetches all non-archived characters via GET /api/characters/ using a useQuery hook
- **Gallery Card Identity (Gap S4)**: Cards must convey identity at a glance. Players identify characters by name, race, class, and level. Visual differentiation (avatar color, class icon) is critical
- **Responsive Grid**: 1 column mobile (<640px), 2 columns tablet (640-1024px), 3 columns desktop (1024-1440px), 4 columns wide (>1440px)
- **Card Content**: Avatar/portrait, character name (Cinzel font), race/class/level subtitle, quick stats (HP, AC, passive Perception), last edited timestamp, campaign badge
- **Card Interactions**: Hover effect (lift + shadow + gold border), click navigates to character sheet, right-click/kebab for context menu
- **Empty State**: When no characters exist, show welcoming illustration with CTA to create first character

## Tasks
- [ ] **T21.1.1** — Create `pages/HomePage.tsx` as the main gallery route (`/`). Fetches all non-archived characters via useQuery hook (GET /api/characters/). Displays a header with app branding, a "Create New Character" floating action button, and the character card grid
- [ ] **T21.1.2** — Create `components/gallery/CharacterGallery.tsx` — responsive grid of character cards. Layout: 1 column on mobile (<640px), 2 columns on tablet (640-1024px), 3 columns on desktop (1024-1440px), 4 columns on wide (>1440px). Cards have consistent height with overflow handled
- [ ] **T21.1.3** — Create `components/gallery/CharacterCard.tsx` — each card shows:
  - Avatar/portrait thumbnail (top, ~120px height) or race-silhouette placeholder with class-color background
  - Character name in Cinzel font (primary text)
  - "Level N [Race] [Class]" subtitle (e.g., "Level 1 High Elf Wizard")
  - Quick stats row: HP icon + max HP, shield icon + AC, eye icon + passive Perception
  - Last edited timestamp in muted text ("Edited 2 hours ago")
  - Campaign badge if linked to a campaign
- [ ] **T21.1.4** — Card hover effect: subtle lift with shadow increase, gold border glow on hover. Click navigates to character sheet view (`/character/:id`)
- [ ] **T21.1.5** — Card context menu (right-click or kebab icon): View, Edit, Duplicate, Export JSON, Archive, Delete
- [ ] **T21.1.6** — **Empty state:** when no characters exist, show a welcoming illustration with centered CTA: "You don't have any characters yet. Create your first adventurer!" with a prominent "Create Character" button

## Acceptance Criteria
- HomePage fetches all non-archived characters from the API via React Query and renders the gallery
- Responsive grid uses correct column count for each breakpoint
- Character cards display avatar, name, race/class/level, quick stats, and last edited timestamp
- Cards have consistent height within the grid
- Hover effect shows lift, shadow, and gold border glow
- Clicking a card navigates to the character sheet view
- Context menu (right-click/kebab) provides View, Edit, Duplicate, Export, Archive, Delete options
- Empty state shows welcoming illustration and "Create Character" CTA
- "Create New Character" floating action button is visible

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should format relative timestamps ("2 hours ago", "Yesterday", "3 days ago")`
- `should filter out archived characters from default gallery view`
- `should compute quick stats (HP, AC, passive Perception) for card display`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render HomePage with gallery grid loading all non-archived characters`
- `should render responsive grid (1 column mobile, 2 tablet, 3 desktop, 4 wide)`
- `should render CharacterCard with avatar, name, race/class/level, quick stats, last edited`
- `should display character name in Cinzel font`
- `should display quick stats row with HP, AC, and passive Perception icons`
- `should display relative "last edited" timestamp in muted text`
- `should apply hover effect (lift + shadow + gold border glow) on card hover`
- `should navigate to character sheet view on card click`
- `should show context menu with View, Edit, Duplicate, Export, Archive, Delete on right-click/kebab`
- `should display empty state with welcoming illustration and "Create Character" CTA when no characters exist`
- `should render "Create New Character" floating action button`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should load gallery with multiple characters, click a card, and navigate to the character sheet`
- `should see empty state on first launch and navigate to create a character via CTA`

### Test Dependencies
- MSW (Mock Service Worker) to mock GET /api/characters/ with multiple character records
- MSW to mock GET /api/characters/ with zero characters (empty state)
- Mock calculation engine for quick stats
- Mock avatar system from Epic 23
- Mock React Router for navigation

## Identified Gaps

- **Loading/Empty States**: No specification for loading spinner/skeleton while characters load from API
- **Error Handling**: No specification for API fetch failure (network error, server error)
- **Accessibility**: No ARIA labels for gallery grid, no keyboard navigation between cards, no screen reader support for card content
- **Performance**: No specification for render time with many characters (100+ cards)

## Dependencies
- Django REST API endpoints (GET /api/characters/) and React Query for fetching characters
- Phase 1 calculation engine for computing quick stats (AC, HP, passive Perception)
- Epic 23 (Avatar System) for portrait/placeholder display on cards
- Epic 25 (Routing) for navigation to character sheet and creation wizard

## Notes
- The gallery is the first screen players see — it sets the tone for the entire app
- Card information density should be minimal but sufficient: name, race/class/level, HP, AC is the sweet spot (Gap S4)
- The "Create New Character" button should be a floating action button (FAB) in the bottom-right corner on mobile, and a header button on desktop
- Campaign badges are for future use — show them if the character has a campaign link, otherwise omit
- Last edited timestamp should use relative time ("2 hours ago", "Yesterday", "3 days ago")
