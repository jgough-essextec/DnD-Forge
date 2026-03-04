# Story 9.2 — Race Detail Panel

> **Epic 9: Race Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, after clicking a race card I need to see the full details — all traits, ability bonuses, proficiencies, languages, and subrace options — so I can make an informed decision. This story builds a slide-in detail panel that presents comprehensive race information organized into clear sections.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **Panel Layout**: Slide-in panel — right side on desktop, bottom sheet on mobile. Animated entrance with framer-motion
- **Shared Components**: Uses DetailSlidePanel from Epic 16
- **Race Data Sections**: The panel organizes race data into sections: header (name, size, speed, description), ability score bonuses, racial traits, languages, proficiencies, speed & senses
- **Ability Bonus Variations**: Most races have fixed bonuses (e.g., Elf +2 DEX). Half-Elf has CHA +2 fixed and +1 to two other abilities (player choice). Variant Human has +1 to two abilities (player choice). These choice bonuses require selectable dropdowns
- **Trait Categories**: Traits have mechanical effect types — vision (Darkvision), resistance (Dwarven Resilience, Fey Ancestry), advantage, proficiency (Dwarven Combat Training). Each should have a subtle icon indicating the type

## Tasks

- [ ] **T9.2.1** — Create `components/wizard/race/RaceDetailPanel.tsx` — a slide-in panel (right side on desktop, bottom sheet on mobile) that shows when a race card is clicked. Animated entrance with framer-motion
- [ ] **T9.2.2** — Panel header: race name, size badge, speed badge, description paragraph from SRD data
- [ ] **T9.2.3** — "Ability Score Bonuses" section: display each bonus as "+2 Dexterity" with a visual indicator (colored number). If the race has choice bonuses (Half-Elf: +1 to two others), display selectable dropdowns
- [ ] **T9.2.4** — "Racial Traits" section: list all traits with name in bold and description below. Traits with mechanical effects (e.g., Darkvision, Fey Ancestry, Dwarven Resilience) should have a subtle icon indicating the type (vision, resistance, advantage, proficiency)
- [ ] **T9.2.5** — "Languages" section: list fixed languages and, if applicable, a language chooser dropdown (e.g., High Elf gets one extra language)
- [ ] **T9.2.6** — "Proficiencies" section: list any weapon, armor, or tool proficiencies granted by the race
- [ ] **T9.2.7** — "Speed & Senses" section: walking speed, special movement (if any), darkvision range

## Acceptance Criteria

- Clicking a race card opens a slide-in detail panel with animated entrance
- The panel shows on the right side on desktop and as a bottom sheet on mobile
- Panel header displays race name, size badge, speed badge, and description
- Ability score bonuses are displayed with visual indicators; choice bonuses show selectable dropdowns
- All racial traits are listed with name, description, and mechanical effect type icons
- Languages section lists fixed languages and shows a chooser for races with language choices
- Proficiencies section lists all granted weapon, armor, and tool proficiencies
- Speed & senses section shows walking speed, special movement, and darkvision range
- The panel can be closed by clicking outside it or pressing a close button

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should open a slide-in detail panel with animated entrance when a race card is clicked`
- `should render panel on the right side on desktop and as a bottom sheet on mobile`
- `should display race name, size badge, speed badge, and description in the panel header`
- `should show ability score bonuses with visual indicators and selectable dropdowns for choice bonuses (Half-Elf, Variant Human)`
- `should list all racial traits with name, description, and mechanical effect type icons (vision, resistance, advantage, proficiency)`
- `should display fixed languages and show a language chooser dropdown for races with language choices`
- `should list granted weapon, armor, and tool proficiencies`
- `should show walking speed, special movement, and darkvision range in Speed & Senses section`
- `should close the panel when clicking outside or pressing the close button`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should open detail panel for each of the 9 races and display correct race-specific data`
- `should scroll through long trait lists for races with many traits (e.g., Dwarf)`

### Test Dependencies
- Mock SRD race data with full trait/proficiency/language details
- Mock Epic 16 DetailSlidePanel component
- Test fixtures for races with choice bonuses (Half-Elf, Variant Human) and without

## Identified Gaps

- **Error Handling**: No specification for what happens if race data is incomplete or missing fields
- **Accessibility**: No ARIA labels specified for panel sections, ability dropdown selectors, or close button
- **Mobile/Responsive**: Bottom sheet on mobile is mentioned but no swipe-to-close or max height specified

## Dependencies

- **Depends on:** Story 9.1 (Race Card Gallery — selection triggers panel open), Epic 16 Story 16.1 (DetailSlidePanel), Phase 1 SRD race data
- **Blocks:** Story 9.3 (subrace selector is rendered within this panel), Story 9.4 (race-specific choice panels are rendered within this panel)

## Notes

- The panel must be scrollable for races with many traits (e.g., Dwarf has numerous proficiencies and traits)
- The ability bonus choice dropdowns (Half-Elf, Variant Human) are interactive within the panel — these connect to Story 9.4's AbilityBonusChooser component
- Trait type icons should be consistent across the app (vision=eye icon, resistance=shield icon, advantage=dice icon, proficiency=star icon)
- Consider adding a "Confirm Selection" button at the bottom of the panel, or have the selection be implicit (closing the panel with data filled in)
- Language chooser should exclude languages the race already grants as fixed (e.g., High Elf already knows Common and Elvish, extra language choice excludes these)
