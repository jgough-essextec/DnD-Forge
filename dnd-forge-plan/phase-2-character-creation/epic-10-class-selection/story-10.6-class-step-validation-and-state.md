# Story 10.6 — Class Step Validation & State

> **Epic 10: Class Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a developer, I need the Class Step to persist all class selections and validate completeness. This story implements validation for all class-related selections (class, skills, subclass, fighting style), persists the ClassSelection object to the wizard store, displays the class in the progress sidebar, and handles cascade warnings when changing class after prior selection.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Validation Requirements**:
  - Class must be selected
  - Skill proficiencies must meet the required count for the selected class
  - If the class requires a level-1 subclass (Cleric, Sorcerer, Warlock), it must be selected
  - If the class has a fighting style (Fighter, Paladin, Ranger), it must be selected
- **ClassSelection Object**: classId, subclassId (if applicable), chosenSkills (array of skill IDs), chosenFightingStyle (if applicable), level=1
- **Cascade Warning**: Changing class after it was previously selected may invalidate downstream steps: spell selections become invalid if switching from caster to non-caster, equipment options change, skill overlap with background may change
- **Progress Sidebar Display**: "Level 1 [Class Name]" or "Level 1 [Subclass] [Class]" if subclass is chosen (e.g., "Level 1 Life Domain Cleric")

## Tasks

- [ ] **T10.6.1** — Implement `validateClassStep()`: class must be selected; skill proficiencies must meet the required count; if level-1 subclass is required, it must be selected; if fighting style applies, it must be selected
- [ ] **T10.6.2** — Persist `ClassSelection` to wizard store: classId, subclassId (if applicable), chosenSkills, chosenFightingStyle (if applicable), level=1
- [ ] **T10.6.3** — Display class in progress sidebar: "Level 1 [Class Name]" or "Level 1 [Subclass] [Class]" if subclass is chosen
- [ ] **T10.6.4** — When changing class after previously selecting one, show a cascade warning if the change affects downstream steps (e.g., spell selections become invalid if switching from Wizard to Fighter)

## Acceptance Criteria

- `validateClassStep()` returns errors if class is not selected
- `validateClassStep()` returns errors if skill proficiency count does not match the class requirement
- `validateClassStep()` returns errors if level-1 subclass is required but not selected
- `validateClassStep()` returns errors if fighting style is required but not selected
- `validateClassStep()` returns `{ valid: true, errors: [] }` when all selections are complete
- ClassSelection is persisted to the Zustand wizard store on "Next" click
- Progress sidebar displays the class with subclass if applicable
- Changing class after prior selection shows a cascade warning identifying affected downstream steps

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should return valid:false with error when no class is selected`
- `should return valid:false with error when skill proficiency count does not match class requirement`
- `should return valid:false with error when level-1 subclass is required but not selected (Cleric, Sorcerer, Warlock)`
- `should return valid:false with error when fighting style is required but not selected (Fighter, Paladin, Ranger)`
- `should return valid:true with empty errors when all selections are complete`
- `should correctly build the ClassSelection object with classId, subclassId, chosenSkills, chosenFightingStyle, level=1`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should persist ClassSelection to wizard store on Next click`
- `should display class with subclass in progress sidebar (e.g., "Level 1 Life Domain Cleric")`
- `should show cascade warning when changing class after prior selection, identifying affected downstream steps`
- `should mark affected steps as incomplete in progress sidebar after cascade reset`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should complete class selection for Cleric with subclass and skills, advance to next step, and verify state persistence`
- `should change class from Wizard to Fighter and see cascade warning about spell and equipment reset`

### Test Dependencies
- Mock Zustand wizard store for state persistence testing
- Test fixtures for complete and incomplete ClassSelection objects for each class type
- Mock cascade dependency map for downstream step identification

## Identified Gaps

- **Error Handling**: No specification for handling invalid ClassSelection data restored from sessionStorage
- **Edge Cases**: Cascade reset when switching between two classes that both have subclasses (e.g., Cleric -> Warlock) should preserve common fields but reset class-specific ones

## Dependencies

- **Depends on:** Stories 10.1-10.5 (all class UI must be built for validation), Story 8.1 (wizard shell consumes the validate function), Phase 1 Zustand wizard store
- **Blocks:** Epic 11 (class primary ability affects ability score recommendations), Epic 12 (class skills needed for background overlap), Epic 13 (class determines starting equipment), Epic 14 (class determines spellcasting), Epic 15 (review aggregates class data)

## Notes

- Cascade warning when changing class should specifically identify what will be reset: "Changing from Wizard to Fighter will: reset your spell selections (Step 6), change your available starting equipment (Step 5), change your skill proficiencies. Continue?"
- The cascade logic needs a dependency map: class change affects skills (always), subclass (if applicable), fighting style (if applicable), equipment (Step 5), spellcasting (Step 6)
- When a cascade reset occurs, affected steps should be marked as incomplete in the progress sidebar
- ClassSelection.level is always 1 in Phase 2 — this field exists for future multiclass/level-up support
