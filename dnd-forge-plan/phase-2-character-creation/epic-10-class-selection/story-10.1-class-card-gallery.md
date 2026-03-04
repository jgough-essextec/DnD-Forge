# Story 10.1 — Class Card Gallery

> **Epic 10: Class Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to see all 12 classes with their roles and key features so I can choose the one that matches my desired playstyle. This story builds a responsive card grid of all 12 SRD classes with role archetype tags, hit die, primary ability icons, search/filter capabilities, and race synergy indicators.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **SRD Classes (12 total)**: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard
- **Role Archetype Tags**:
  - Barbarian: Striker / Tank
  - Bard: Support / Spellcaster
  - Cleric: Healer / Support
  - Druid: Spellcaster / Support
  - Fighter: Striker / Tank
  - Monk: Striker
  - Paladin: Tank / Healer
  - Ranger: Striker / Utility
  - Rogue: Striker / Utility
  - Sorcerer: Spellcaster
  - Warlock: Spellcaster
  - Wizard: Spellcaster / Utility
- **Race Synergy**: If the player already selected a race (Step 1), highlight classes whose primary ability matches the race's ability bonuses (e.g., Elf +2 DEX highlights Rogue, Ranger, Monk)
- **Layout**: Mirrors the Race Step — responsive card grid + detail panel
- **Shared Components**: Uses SelectableCardGrid, SearchFilterBar from Epic 16

## Tasks

- [ ] **T10.1.1** — Create `components/wizard/ClassStep.tsx` as the Step 2 container. Layout mirrors the Race Step: responsive card grid + detail panel
- [ ] **T10.1.2** — Create `components/wizard/class/ClassCard.tsx` — a selectable card for each class displaying: class icon/silhouette placeholder, class name, role archetype tag (e.g., "Tank", "Healer", "Spellcaster", "Striker", "Support", "Utility"), hit die badge (e.g., "d10"), primary ability icons (e.g., STR for Fighter, INT for Wizard), and a one-sentence role summary
- [ ] **T10.1.3** — Define role archetype tags for all 12 classes:
  - Barbarian: Striker / Tank
  - Bard: Support / Spellcaster
  - Cleric: Healer / Support
  - Druid: Spellcaster / Support
  - Fighter: Striker / Tank
  - Monk: Striker
  - Paladin: Tank / Healer
  - Ranger: Striker / Utility
  - Rogue: Striker / Utility
  - Sorcerer: Spellcaster
  - Warlock: Spellcaster
  - Wizard: Spellcaster / Utility
- [ ] **T10.1.4** — Add filter/search bar: text search by name, filter by role archetype, filter by primary ability, filter by "Has Spellcasting" toggle
- [ ] **T10.1.5** — Add "Synergy with your race" indicator if the player already selected a race — highlight classes whose primary ability matches the race's ability bonuses (e.g., Elf +2 DEX highlights Rogue, Ranger, Monk)

## Acceptance Criteria

- All 12 SRD classes are displayed as selectable cards in a responsive grid
- Each card shows the class name, icon placeholder, role archetype tags, hit die badge, primary ability icons, and a role summary
- Only one class can be selected at a time with gold border and accent glow
- Search/filter bar filters by name, role archetype, primary ability, and spellcasting toggle
- If a race was previously selected, synergy indicators appear on classes matching the race's ability bonuses
- The grid layout mirrors the Race Step (2 columns mobile, 3 tablet, 4-5 desktop)

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should define correct role archetype tags for all 12 classes`
- `should compute race synergy indicators based on race ability bonuses vs. class primary abilities`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render all 12 SRD classes as selectable cards in a responsive grid`
- `should display class name, icon placeholder, role archetype tags, hit die badge, primary ability icons, and role summary on each card`
- `should select only one class at a time with gold border and accent glow`
- `should filter classes by name using text search`
- `should filter classes by role archetype, primary ability, and Has Spellcasting toggle`
- `should show synergy indicators on classes matching race ability bonuses when race was previously selected`
- `should render grid with 2 columns on mobile, 3 on tablet, 4-5 on desktop`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should select a class card and see the detail panel open`
- `should filter classes using search and role archetype filters and see correct results`

### Test Dependencies
- Mock SRD class data (all 12 classes with hit dice, primary abilities, proficiencies)
- Mock wizard store with pre-selected race for synergy indicator testing
- Mock Epic 16 shared components (SelectableCardGrid, SearchFilterBar)

## Identified Gaps

- **Error Handling**: No specification for empty SRD class data or failed data loading
- **Loading/Empty States**: No loading state while class data loads; no empty state for zero filter results
- **Accessibility**: No ARIA labels specified for class cards, role tags, or filter controls
- **Mobile/Responsive**: Responsive column counts specified but no minimum card dimensions or touch target sizes

## Dependencies

- **Depends on:** Story 8.1 (Wizard Shell — this is Step 2), Epic 9 (race selection data for synergy indicators), Epic 16 Story 16.1 (SelectableCardGrid, SearchFilterBar), Phase 1 SRD class data
- **Blocks:** Story 10.2 (detail panel opens on card selection), Story 10.6 (validation requires class selection)

## Notes

- Role archetype tags help new players understand what each class does in a party context
- The "Has Spellcasting" filter should include a note that Paladin and Ranger don't get spells until level 2
- Hit die badges should visually scale to indicate relative toughness (d6 smallest, d12 largest)
- Primary ability icons should use the standard D&D ability abbreviations (STR, DEX, CON, INT, WIS, CHA)
- Consider color-coding role tags: Striker=red, Tank=blue, Healer=green, Spellcaster=purple, Support=yellow, Utility=teal
