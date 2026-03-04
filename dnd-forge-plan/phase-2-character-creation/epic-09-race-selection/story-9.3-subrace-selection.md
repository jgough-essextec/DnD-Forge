# Story 9.3 — Subrace Selection

> **Epic 9: Race Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player choosing a race with subraces, I need to pick my subrace and see how it modifies my racial traits. This story builds the subrace selector within the detail panel, handles races with and without subraces, and implements special subrace-like choices for Variant Human and Dragonborn ancestry.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Races with Subraces**: Dwarf (Hill Dwarf, Mountain Dwarf), Elf (High Elf, Wood Elf), Gnome (Forest Gnome, Rock Gnome), Halfling (Lightfoot Halfling, Stout Halfling)
- **Races without Subraces**: Human (but has Standard vs. Variant as a special case), Dragonborn (has ancestry as a special case), Half-Elf, Half-Orc, Tiefling
- **Variant Human**: Treated as a subrace-like option. When selected, requires: +1 to two abilities (dropdowns), 1 skill proficiency (from all 18), 1 feat (opens feat picker — connects to Story 9.4)
- **Dragonborn Ancestry**: 10 draconic ancestries — Black/Acid, Blue/Lightning, Brass/Fire, Bronze/Lightning, Copper/Acid, Gold/Fire, Green/Poison, Red/Fire, Silver/Cold, White/Cold. Each determines breath weapon damage type, breath weapon shape (5x30 ft line or 15 ft cone), and damage resistance
- **Subrace Data**: Each subrace has name, additional ability bonuses, unique traits. Combined view shows base race traits + subrace traits with clear grouping

## Tasks

- [ ] **T9.3.1** — Create `components/wizard/race/SubraceSelector.tsx` — within the detail panel, if the selected race has subraces, display subrace options as selectable tabs or mini-cards. Each shows the subrace name, additional ability bonus, and unique traits
- [ ] **T9.3.2** — When a subrace is selected, update the detail panel to show the combined traits (base race + subrace). Clearly distinguish which traits come from the base race vs. the subrace using subtle labels or grouping
- [ ] **T9.3.3** — Handle races without subraces (Human standard, Dragonborn, Half-Elf, Half-Orc, Tiefling) by hiding the subrace selector entirely
- [ ] **T9.3.4** — Handle Variant Human as a special subrace-like option: when selected, show inputs for +1 to two abilities (dropdowns), 1 skill proficiency (dropdown from all 18), and 1 feat (opens feat picker — see T9.4.3)
- [ ] **T9.3.5** — Handle Dragonborn ancestry as a special subrace-like chooser: display a 10-row table of draconic ancestries showing dragon type, damage type, and breath weapon shape (line vs. cone). Selection sets the damage resistance and breath weapon type

## Acceptance Criteria

- Races with subraces show a subrace selector (tabs or mini-cards) within the detail panel
- Selecting a subrace updates the detail panel to show combined base race + subrace traits with clear visual grouping
- Races without subraces do not show the subrace selector
- Variant Human shows inputs for +1 to two abilities, 1 skill proficiency, and 1 feat
- Dragonborn ancestry shows a 10-option table with dragon type, damage type, and breath weapon shape
- Selecting a Dragonborn ancestry sets the character's damage resistance and breath weapon type
- Subrace selection is required for races that have subraces before the step can be validated

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should show subrace selector (tabs or mini-cards) for races with subraces (Dwarf, Elf, Gnome, Halfling)`
- `should update detail panel to show combined base race + subrace traits with clear visual grouping when subrace is selected`
- `should hide subrace selector for races without subraces (Human standard, Dragonborn, Half-Elf, Half-Orc, Tiefling)`
- `should show Standard Human and Variant Human as distinct subrace-like options`
- `should render inputs for +1 to two abilities, 1 skill proficiency, and 1 feat when Variant Human is selected`
- `should display 10-row Dragonborn ancestry table with dragon type, damage type, and breath weapon shape`
- `should set damage resistance and breath weapon type when Dragonborn ancestry is selected`
- `should require subrace selection for applicable races before step validation passes`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should select Dwarf, choose Hill Dwarf subrace, and see combined traits displayed`
- `should select Human, choose Variant Human, and complete all required sub-choices (abilities, skill, feat)`
- `should select Dragonborn, choose Gold ancestry, and see Fire damage resistance applied`

### Test Dependencies
- Mock SRD race data with complete subrace data for all 9 races
- Mock Variant Human sub-picker components (AbilityBonusChooser, SkillChooser, FeatPicker)
- Test fixtures for each subrace combination

## Identified Gaps

- **Error Handling**: No specification for clearing Variant Human-specific choices when switching away from Variant Human
- **Edge Cases**: Switching from Elf -> High Elf with filled choices to Dwarf should clear all Elf-specific choices, mentioned in Story 9.5 notes but not here
- **Accessibility**: No keyboard navigation specified for subrace tabs/mini-cards or Dragonborn ancestry table

## Dependencies

- **Depends on:** Story 9.2 (Race Detail Panel — subrace selector is rendered within the panel), Phase 1 SRD race data with subrace data
- **Blocks:** Story 9.4 (Variant Human feat picker and ability chooser are triggered from subrace selection), Story 9.5 (validation must check subrace selection)

## Notes

- **Dragonborn Ancestry Table**:
  | Dragon | Damage Type | Breath Weapon |
  |--------|-------------|---------------|
  | Black | Acid | 5x30 ft line (DEX save) |
  | Blue | Lightning | 5x30 ft line (DEX save) |
  | Brass | Fire | 5x30 ft line (DEX save) |
  | Bronze | Lightning | 5x30 ft line (DEX save) |
  | Copper | Acid | 5x30 ft line (DEX save) |
  | Gold | Fire | 15 ft cone (DEX save) |
  | Green | Poison | 15 ft cone (CON save) |
  | Red | Fire | 15 ft cone (DEX save) |
  | Silver | Cold | 15 ft cone (CON save) |
  | White | Cold | 15 ft cone (CON save) |

- Variant Human is the most complex "subrace" since it involves ability bonuses, a skill, and a feat. The feat picker (Story 9.4) is a substantial UI component
- The subrace selector should clearly show what each subrace adds on top of the base race (e.g., Hill Dwarf adds +1 WIS and Dwarven Toughness)
- Standard Human (+1 all abilities) vs. Variant Human (+1 to two, +1 skill, +1 feat) should be clearly presented as distinct options
