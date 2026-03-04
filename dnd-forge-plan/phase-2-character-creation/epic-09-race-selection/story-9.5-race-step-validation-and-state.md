# Story 9.5 — Race Step Validation & State

> **Epic 9: Race Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a developer, I need the Race Step to validate all selections and persist them to the wizard store. This story implements the validation function that checks all race-related selections are complete, persists the full RaceSelection object to the Zustand wizard store, handles back-navigation restore, and displays a summary in the wizard progress sidebar.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Validation Requirements by Race**:
  - All races: race must be selected
  - Races with subraces (Dwarf, Elf, Gnome, Halfling): subrace must be selected
  - Dragonborn: draconic ancestry must be chosen
  - Half-Elf: +1 to two ability scores must be assigned, 2 skill proficiencies must be chosen
  - High Elf: 1 wizard cantrip must be chosen, 1 extra language must be chosen
  - Variant Human: +1 to two abilities must be assigned, 1 skill proficiency must be chosen, 1 feat must be chosen
  - Human (Standard), Half-Orc, Tiefling: no additional choices required
- **RaceSelection Object**: Persisted to Zustand wizard store. Fields: raceId, subraceId, chosenAbilityBonuses, chosenSkills, chosenLanguages, chosenCantrip, chosenFeat, dragonbornAncestry
- **Step Validation Interface**: The Race Step exposes `validate(): { valid: boolean; errors: string[] }` consumed by the wizard shell (Story 8.1)

## Tasks

- [ ] **T9.5.1** — Implement `validateRaceStep()`: race must be selected; if race has subraces, subrace must be selected; all conditional choices must be completed (Dragonborn ancestry, Half-Elf ability bonuses and skills, High Elf cantrip and language, Variant Human abilities/skill/feat)
- [ ] **T9.5.2** — On "Next" click, persist the complete `RaceSelection` object to the wizard store including all choices. This includes: raceId, subraceId, chosen ability bonuses, chosen skills, chosen languages, chosen cantrip, chosen feat, dragonborn ancestry
- [ ] **T9.5.3** — On back-navigation to the Race Step, restore all previous selections from the wizard store and re-render the detail panel with the previously selected race/subrace
- [ ] **T9.5.4** — Display a summary of selected race/subrace in the wizard progress sidebar: "[Subrace] [Race]" (e.g., "High Elf", "Hill Dwarf", "Variant Human")

## Acceptance Criteria

- `validateRaceStep()` returns `{ valid: false, errors: [...] }` if race is not selected
- `validateRaceStep()` returns errors for missing subrace selection when applicable
- `validateRaceStep()` returns errors for incomplete race-specific choices (ancestry, ability bonuses, skills, cantrip, language, feat)
- `validateRaceStep()` returns `{ valid: true, errors: [] }` when all selections are complete
- On "Next" click, the full RaceSelection object is persisted to the Zustand wizard store
- Back-navigating to the Race Step restores all prior selections and renders the detail panel correctly
- The wizard progress sidebar shows the selected race/subrace summary (e.g., "High Elf", "Hill Dwarf", "Variant Human")

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should return valid:false with error when no race is selected`
- `should return valid:false with error when race with subraces has no subrace selected (Dwarf, Elf, Gnome, Halfling)`
- `should return valid:false with error for incomplete Dragonborn ancestry selection`
- `should return valid:false with error for incomplete Half-Elf ability bonuses or skill choices`
- `should return valid:false with error for incomplete High Elf cantrip or language choice`
- `should return valid:false with error for incomplete Variant Human abilities, skill, or feat selection`
- `should return valid:true with empty errors when all selections are complete for each race type`
- `should generate user-friendly validation error messages (e.g., "Please select a subrace for your Dwarf")`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should persist the complete RaceSelection object to the wizard store on Next click`
- `should restore all previous selections from the wizard store on back-navigation including detail panel state`
- `should display selected race/subrace summary in the progress sidebar (e.g., "High Elf", "Hill Dwarf")`
- `should clear race-specific choices when switching race (e.g., Elf -> High Elf choices cleared when changing to Dwarf)`

### Test Dependencies
- Mock Zustand wizard store for state persistence testing
- Test fixtures for each race's complete and incomplete RaceSelection objects
- Mock validation scenarios for each race type

## Identified Gaps

- **Edge Cases**: Switching race after filling all choices should clear stale data from previous race; mentioned in notes but not in acceptance criteria
- **Error Handling**: No specification for handling corrupted RaceSelection objects in the wizard store
- **Dependency Issues**: Progress sidebar summary for races without subraces (just race name) vs. with subraces is specified, but display for Variant Human with feat name is not specified

## Dependencies

- **Depends on:** Stories 9.1-9.4 (all race selection UI must be built for validation to check), Story 8.1 (wizard shell consumes the validate function and manages step navigation), Phase 1 Zustand wizard store
- **Blocks:** Epic 10 (class step may use race data for synergy), Epic 11 (ability scores use racial bonuses from this step), Epic 12 (background skill overlap checks against race skills)

## Notes

- The validation error messages should be user-friendly: "Please select a subrace for your Dwarf" rather than "subraceId is null"
- The RaceSelection object in the wizard store should be fully typed using the Phase 1 type system
- Back-navigation restore must handle all race-specific picker states (e.g., the FeatPicker should show the previously selected feat, the AbilityBonusChooser should show the previously chosen abilities)
- The progress sidebar summary should handle all race/subrace combinations correctly, including races without subraces (just show race name)
- Consider edge case: if user selects Elf -> High Elf, fills in choices, then back-navigates and changes to Dwarf, all High Elf-specific choices should be cleared from the store
