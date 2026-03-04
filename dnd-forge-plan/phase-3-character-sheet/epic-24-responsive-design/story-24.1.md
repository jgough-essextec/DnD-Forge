# Story 24.1 — Desktop Layout (1024px+)

> **Epic 24: Character Sheet Responsive Design** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player on desktop, I need the full 3-column character sheet layout with maximum information density.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Desktop Breakpoint**: 1024px+ width
- **Page 1 Desktop Layout (Gap S3)**: Three-column layout matching the official D&D 5e sheet:
  - Left column (~30%): ability scores, saving throws, skills, passive Perception
  - Center column (~35%): AC/initiative/speed, HP block, hit dice/death saves, attacks & spellcasting
  - Right column (~35%): personality traits/ideals/bonds/flaws, features & traits
  - Top banner: spans full width
- **Page 2 Desktop Layout**: Two-column — left (~40%) portrait/appearance/allies, right (~60%) backstory/features/treasure. Equipment spans full width at bottom
- **Page 3 Desktop Layout**: Multi-column flow (2-3 columns) for spell levels. Spell slot trackers inline with level headers
- **Tab Navigation**: Three tabs at the top of the sheet with active tab highlighting and entrance animations

## Tasks
- [ ] **T24.1.1** — Page 1 desktop: three-column layout matching the official sheet. Left column (ability scores, saves, skills) ~30% width, center column (combat stats, HP, attacks) ~35% width, right column (personality, features) ~35% width. Top banner spans full width
- [ ] **T24.1.2** — Page 2 desktop: two-column layout. Left (~40%): portrait, appearance, allies. Right (~60%): backstory, features, treasure. Equipment section spans full width at bottom
- [ ] **T24.1.3** — Page 3 desktop: cantrips and spell levels in a multi-column flow (2-3 columns depending on spell count). Spell slot trackers inline with level headers
- [ ] **T24.1.4** — Tab navigation between pages: three tabs at the top of the sheet. Active tab highlighted. Tab content rendered with entrance animation

## Acceptance Criteria
- Page 1 renders a three-column layout at 1024px+ with correct width ratios (30/35/35)
- Top banner spans full width above the three columns
- Page 2 renders a two-column layout with portrait/appearance on left and backstory on right
- Page 2 equipment section spans full width at the bottom
- Page 3 renders spell levels in a multi-column flow (2-3 columns)
- Tab navigation shows three tabs with active state highlighting
- Tab content renders with entrance animation
- Layout matches the spatial conventions of the official D&D 5e character sheet

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render Page 1 in three-column layout at 1024px+ with correct width ratios (30/35/35)`
- `should render top banner spanning full width above the three columns`
- `should render Page 2 in two-column layout with portrait/appearance left and backstory right`
- `should render Page 2 equipment section spanning full width at bottom`
- `should render Page 3 spell levels in multi-column flow (2-3 columns)`
- `should render tab navigation with three tabs and active state highlighting`
- `should render tab content with entrance animation`
- `should apply additional spacing on wide desktop (>1440px) with same column structure`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should render full three-column Page 1 layout at 1024px viewport width`
- `should switch between all three tabs and verify correct content and animations`

### Test Dependencies
- Mock character data with full content for all three pages
- Viewport size mocking (1024px, 1440px+)
- Mock framer-motion or CSS animation library for entrance animations

## Identified Gaps

- **Accessibility**: No specification for keyboard navigation between tabs, no ARIA roles for tab panels
- **Performance**: No render time targets for tab switching or page layout
- **Edge Cases**: No specification for exact column width behavior at 1024px boundary (transition from tablet)

## Dependencies
- Epic 17 (Page 1 components) — layout targets for columns
- Epic 18 (Page 2 components) — layout targets for columns
- Epic 19 (Page 3 components) — layout targets for spell columns
- Tailwind CSS responsive utilities (lg: and xl: breakpoints)

## Notes
- The desktop layout is the "reference" layout — it most closely matches the official paper character sheet
- Tailwind CSS grid or flexbox should be used for the column layouts
- The tab navigation should use React Router or local state — not full page navigation
- Wide desktop (>1440px) gets additional spacing but the same column structure
- Column widths are approximate — the exact percentages may need adjustment during implementation
