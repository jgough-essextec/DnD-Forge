# Story 14.2 — Cantrip Selection

> **Epic 14: Spellcasting Step (Conditional)** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a spellcasting player, I need to choose my cantrips (at-will spells) from my class's cantrip list. This story builds the cantrip selector with a card grid of class-appropriate cantrips, live selection counter, racial cantrip pre-locking, and cantrip card components showing spell details.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Cantrips Known at Level 1**:
  | Class | Cantrips to Choose |
  |-------|--------------------|
  | Bard | 2 |
  | Cleric | 3 |
  | Druid | 2 |
  | Sorcerer | 4 |
  | Warlock | 2 |
  | Wizard | 3 |
- **Spellcasting Summary**: Displayed at the top of the step: "As a level 1 [Class], you can choose [N] cantrips and [M] level 1 spells. Your spellcasting ability is [Ability]."
- **Racial Cantrips**: Some races grant cantrips that don't count against class cantrip choices:
  - Tiefling: Thaumaturgy (cantrip)
  - High Elf: chosen wizard cantrip (from Epic 9 Story 9.4)
  - Forest Gnome: Minor Illusion
  These are displayed as pre-selected and locked with a "From Race" label
- **Cantrip Card**: Shows spell name, school of magic icon, casting time, range, and 1-2 sentence description preview. Full details on click/expand
- **Cantrips are Level 0 Spells**: Filtered from the spell data where level = 0 and the class is in the spell's class list

## Tasks

- [ ] **T14.2.1** — Create `components/wizard/SpellStep.tsx` as the Step 6 container. Top section shows spellcasting summary: "As a level 1 [Class], you can choose [N] cantrips and [M] level 1 spells. Your spellcasting ability is [Ability]."
- [ ] **T14.2.2** — Create `components/wizard/spells/CantripSelector.tsx` — displays all cantrips available to the class as a selectable card grid. Shows the count required: "Select N cantrips" with a live counter
- [ ] **T14.2.3** — If the character already has a racial cantrip (e.g., Tiefling: Thaumaturgy, High Elf: chosen wizard cantrip), display it as pre-selected and locked with a "From Race" label. It does NOT count against the class cantrip count
- [ ] **T14.2.4** — Implement cantrip card component: shows spell name, school of magic icon, casting time, range, and a 1-2 sentence description preview. Full details on click/expand

## Acceptance Criteria

- Spellcasting summary is displayed showing class, cantrip count, spell count, and spellcasting ability
- All cantrips available to the selected class are shown in a selectable card grid
- Live counter shows "N of M cantrips selected" updating as the player selects/deselects
- Racial cantrips are pre-selected and locked with "From Race" label, not counting against class count
- Each cantrip card shows name, school icon, casting time, range, and description preview
- Clicking a cantrip card reveals full spell details
- The correct number of cantrips must be selected for the class before proceeding

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should return correct cantrip count for each caster class (Bard:2, Cleric:3, Druid:2, Sorcerer:4, Warlock:2, Wizard:3)`
- `should filter cantrips from spell data (level 0, matching class spell list)`
- `should exclude racial cantrips from class cantrip count`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should display spellcasting summary showing class, cantrip count, spell count, and spellcasting ability`
- `should show all cantrips available to the selected class in a selectable card grid`
- `should update live counter "N of M cantrips selected" as player selects/deselects`
- `should pre-select and lock racial cantrips with From Race label (Tiefling: Thaumaturgy, High Elf: wizard cantrip)`
- `should display cantrip card with name, school icon, casting time, range, and description preview`
- `should reveal full spell details when cantrip card is clicked`
- `should enforce exact cantrip count for the class before allowing advancement`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should select 4 cantrips for Sorcerer and see correct count validation`
- `should see Tiefling racial cantrip Thaumaturgy pre-locked and select 3 additional Cleric cantrips`

### Test Dependencies
- Mock SRD spell data filtered to cantrips (level 0) per class
- Mock racial cantrip data from wizard store (Tiefling, High Elf, Forest Gnome)
- Mock class data for cantrip counts and spellcasting ability

## Identified Gaps

- **Error Handling**: No specification for what happens if the spell data has no cantrips for a class
- **Loading/Empty States**: No loading state while cantrip data is filtered from spell database
- **Accessibility**: No ARIA labels for cantrip cards, selection counter, or From Race label

## Dependencies

- **Depends on:** Story 14.1 (conditional rendering — this only shows for casting classes), Epic 9 Story 9.5 (racial cantrip data from race selection), Epic 10 Story 10.6 (class determines cantrip list and count), Phase 1 SRD spell data (cantrips filtered by class and level 0)
- **Blocks:** Story 14.5 (validation checks cantrip count)

## Notes

- **Spellcasting Ability by Class**:
  - Bard: CHA
  - Cleric: WIS
  - Druid: WIS
  - Sorcerer: CHA
  - Warlock: CHA
  - Wizard: INT
- Cantrips are at-will spells that can be cast unlimited times — this should be noted for new players
- The cantrip card grid should be manageable in size (most classes have 10-15 cantrips available)
- Consider sorting cantrips by school of magic or alphabetically, with a toggle between the two
- Popular cantrips to highlight: Wizard (Fire Bolt, Mage Hand, Prestidigitation), Cleric (Sacred Flame, Guidance, Thaumaturgy), Druid (Druidcraft, Produce Flame, Shillelagh)
- The racial cantrip "From Race" label should match the visual style used for race skills in the Class Step (Story 10.3)
