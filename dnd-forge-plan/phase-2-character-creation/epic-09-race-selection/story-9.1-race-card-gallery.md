# Story 9.1 — Race Card Gallery

> **Epic 9: Race Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to see all available races at a glance with key information so I can pick the one that appeals to me. This story builds a responsive grid of race cards displaying key traits and information, with search/filter capabilities, class synergy indicators, and trait tooltips.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **SRD Races (9 total)**: Dwarf (Hill, Mountain), Elf (High, Wood), Halfling (Lightfoot, Stout), Human (Standard, Variant), Dragonborn, Gnome (Forest, Rock), Half-Elf, Half-Orc, Tiefling
- **Race Data Structure**: Each race has name, description, abilityBonuses, size (Small/Medium), speed, traits (array with name + description), languages, proficiencies, subraces (optional), darkvision (optional)
- **Layout**: Responsive card grid — 2 columns on mobile, 3 on tablet, 4-5 on desktop. Selection opens a detail panel (Story 9.2)
- **Shared Components**: Uses SelectableCardGrid from Epic 16, SearchFilterBar from Epic 16
- **Card Selection**: Single-select — clicking a card highlights it with gold border and accent glow; previously selected card reverts

## Tasks

- [ ] **T9.1.1** — Create `components/wizard/RaceStep.tsx` as the Step 1 container. Layout: a responsive grid of race cards (2 columns on mobile, 3 on tablet, 4-5 on desktop) with a detail panel that opens on selection
- [ ] **T9.1.2** — Create `components/wizard/race/RaceCard.tsx` — a selectable card for each race displaying: placeholder avatar/silhouette art (themed to race), race name in Cinzel font, 2-3 key traits as compact badges (e.g., "Darkvision 60ft", "+2 DEX", "Fey Ancestry"), size and speed as small icons, and a brief one-sentence tagline
- [ ] **T9.1.3** — Implement card selection state: clicking a card highlights it with a gold border and accent glow. Only one race is selected at a time. The previously selected card reverts to its default state
- [ ] **T9.1.4** — Add a search/filter bar above the grid: text search by race name, filter chips for size (Small/Medium), filter by primary ability bonus (STR, DEX, etc.), and a "Has Darkvision" toggle
- [ ] **T9.1.5** — Add a "Recommended for your class" badge on race cards if the player has already selected a class (from back-navigation). For example, if class is Wizard, highlight races with INT bonuses (High Elf, Gnome)
- [ ] **T9.1.6** — Implement a tooltip or info icon on each badge that shows the full trait description on hover/tap

## Acceptance Criteria

- All 9 SRD races are displayed as selectable cards in a responsive grid
- Each card shows the race name (Cinzel font), placeholder avatar, 2-3 trait badges, size/speed icons, and a tagline
- Clicking a card selects it with a gold border and accent glow; only one race is selected at a time
- The search/filter bar filters races by name, size, primary ability bonus, and darkvision
- If a class was previously selected, "Recommended for your class" badges appear on synergistic races
- Trait badges show full descriptions on hover/tap via tooltips
- The grid is responsive: 2 columns on mobile, 3 on tablet, 4-5 on desktop

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render all 9 SRD races as selectable cards in a responsive grid`
- `should display race name in Cinzel font, placeholder avatar, 2-3 trait badges, size/speed icons, and tagline on each card`
- `should select a card with gold border and accent glow when clicked and deselect previously selected card`
- `should filter races by name using the search bar`
- `should filter races by size (Small/Medium) using filter chips`
- `should filter races by primary ability bonus (STR, DEX, etc.)`
- `should toggle darkvision filter and show only races with darkvision`
- `should show Recommended for your class badge on synergistic races when class was previously selected`
- `should show full trait descriptions in tooltips on badge hover/tap`
- `should render 2 columns on mobile, 3 on tablet, 4-5 on desktop`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should select a race card and see the detail panel open`
- `should filter races using search and chip filters and see correct results`
- `should preserve filter state when returning to the Race Step via back-navigation`

### Test Dependencies
- Mock SRD race data (all 9 races with traits, bonuses, subraces)
- Mock wizard store with pre-selected class for synergy badge testing
- Mock Epic 16 shared components (SelectableCardGrid, SearchFilterBar)

## Identified Gaps

- **Error Handling**: No specification for what happens if SRD race data fails to load or is empty
- **Loading/Empty States**: No loading state defined while race data is being read; no empty state for zero filter results
- **Accessibility**: No ARIA labels specified for race cards, filter controls, or trait tooltips
- **Mobile/Responsive**: Responsive column counts are specified but no minimum card width or touch target sizes

## Dependencies

- **Depends on:** Story 8.1 (Wizard Shell — this is Step 1), Epic 16 Story 16.1 (SelectableCardGrid, SearchFilterBar), Phase 1 SRD race data
- **Blocks:** Story 9.2 (detail panel opens on card selection), Story 9.5 (validation requires race selection)

## Notes

- The "Recommended for your class" feature only appears when back-navigating (class selected in Step 2, then returning to Step 1). On initial forward navigation, class hasn't been selected yet
- Race card trait badges should be concise — abbreviate long trait names (e.g., "Darkvision 60ft" not "Superior Darkvision: You can see in dim light within 60 feet...")
- Consider using race-themed color accents on each card (subtle background tint or border color) to visually differentiate races
- The placeholder avatar/silhouette should be distinct enough per race to be recognizable at a glance
- Filter state should persist within the wizard session so returning to this step preserves the user's filter preferences
