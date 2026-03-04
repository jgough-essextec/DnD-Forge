# Story 21.1 — Gallery Grid Layout

> **Epic 21: Character Gallery (Home Screen)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player opening the app, I need to see all my characters displayed as visually distinct cards so I can quickly find and open the one I want.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Gallery as Home Screen**: The character gallery is the app's primary entry point (route: `/`). It loads all non-archived characters from IndexedDB
- **Gallery Card Identity (Gap S4)**: Cards must convey identity at a glance. Players identify characters by name, race, class, and level. Visual differentiation (avatar color, class icon) is critical
- **Responsive Grid**: 1 column mobile (<640px), 2 columns tablet (640-1024px), 3 columns desktop (1024-1440px), 4 columns wide (>1440px)
- **Card Content**: Avatar/portrait, character name (Cinzel font), race/class/level subtitle, quick stats (HP, AC, passive Perception), last edited timestamp, campaign badge
- **Card Interactions**: Hover effect (lift + shadow + gold border), click navigates to character sheet, right-click/kebab for context menu
- **Empty State**: When no characters exist, show welcoming illustration with CTA to create first character

## Tasks
- [ ] **T21.1.1** — Create `pages/HomePage.tsx` as the main gallery route (`/`). Loads all non-archived characters from IndexedDB. Displays a header with app branding, a "Create New Character" floating action button, and the character card grid
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
- HomePage loads all non-archived characters from IndexedDB and renders the gallery
- Responsive grid uses correct column count for each breakpoint
- Character cards display avatar, name, race/class/level, quick stats, and last edited timestamp
- Cards have consistent height within the grid
- Hover effect shows lift, shadow, and gold border glow
- Clicking a card navigates to the character sheet view
- Context menu (right-click/kebab) provides View, Edit, Duplicate, Export, Archive, Delete options
- Empty state shows welcoming illustration and "Create Character" CTA
- "Create New Character" floating action button is visible

## Dependencies
- Phase 1 IndexedDB database layer for loading characters
- Phase 1 calculation engine for computing quick stats (AC, HP, passive Perception)
- Epic 23 (Avatar System) for portrait/placeholder display on cards
- Epic 25 (Routing) for navigation to character sheet and creation wizard

## Notes
- The gallery is the first screen players see — it sets the tone for the entire app
- Card information density should be minimal but sufficient: name, race/class/level, HP, AC is the sweet spot (Gap S4)
- The "Create New Character" button should be a floating action button (FAB) in the bottom-right corner on mobile, and a header button on desktop
- Campaign badges are for future use — show them if the character has a campaign link, otherwise omit
- Last edited timestamp should use relative time ("2 hours ago", "Yesterday", "3 days ago")
