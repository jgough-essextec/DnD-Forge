# Story 14.5 — Spell Step Validation & State

> **Epic 14: Spellcasting Step (Conditional)** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a developer, I need spell selections validated and persisted. This story implements validation for cantrip and spell counts per class and spellcasting system, persists all spell selections to the wizard store, and displays a spell count summary in the progress sidebar.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Validation Requirements by Spellcasting System**:
  - **All casters**: Correct number of cantrips selected for the class (Bard 2, Cleric 3, Druid 2, Sorcerer 4, Warlock 2, Wizard 3)
  - **Known casters (Bard, Sorcerer, Warlock)**: Correct number of known spells selected (Bard 4, Sorcerer 2, Warlock 2)
  - **Prepared casters (Cleric, Druid)**: Prepared spell count within limit ([ability mod + 1], minimum 1)
  - **Wizard**: 6 spellbook spells selected; prepared spell count within limit ([INT mod + 1], minimum 1)
  - **All**: No duplicate selections; all selected spells must be valid for the class's spell list
- **Persisted Data**: selectedCantrips (spell IDs), selectedSpells (spell IDs — known spells or spellbook spells), preparedSpells (spell IDs — initial prepared list for prepared casters and Wizard), racialCantrips (tracked separately, not included in class cantrip count)
- **Progress Sidebar Display**: "N cantrips, M spells selected" with spell count

## Tasks

- [ ] **T14.5.1** — Implement `validateSpellStep()`: correct number of cantrips selected for the class; correct number of known spells (known casters) or spellbook spells (Wizard) selected; prepared spell count within limit; no duplicate selections; all selected spells must be valid for the class's spell list
- [ ] **T14.5.2** — Persist to wizard store: selectedCantrips (spell IDs), selectedSpells (spell IDs — known or spellbook), preparedSpells (spell IDs — initial prepared list), racial cantrips (tracked separately)
- [ ] **T14.5.3** — Display in progress sidebar: "N cantrips, M spells selected" with spell count

## Acceptance Criteria

- `validateSpellStep()` returns errors if cantrip count doesn't match class requirement
- `validateSpellStep()` returns errors if known spell count (Bard/Sorcerer/Warlock) doesn't match requirement
- `validateSpellStep()` returns errors if Wizard spellbook doesn't have exactly 6 spells
- `validateSpellStep()` returns errors if prepared spell count exceeds the limit
- `validateSpellStep()` returns errors for duplicate spell selections
- `validateSpellStep()` returns errors if any selected spell is not on the class's spell list
- `validateSpellStep()` returns `{ valid: true, errors: [] }` when all selections are valid
- All spell data is persisted to the wizard store (cantrips, spells, prepared, racial cantrips)
- Progress sidebar shows "N cantrips, M spells selected"

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should return valid:false when cantrip count does not match class requirement`
- `should return valid:false when known spell count (Bard/Sorcerer/Warlock) does not match requirement`
- `should return valid:false when Wizard spellbook does not have exactly 6 spells`
- `should return valid:false when prepared spell count exceeds the limit`
- `should return valid:false for duplicate spell selections`
- `should return valid:false when any selected spell is not on the class spell list`
- `should return valid:true when all selections are valid`
- `should exclude racial cantrips from class cantrip count validation`
- `should exclude Cleric domain spells from prepared spell limit validation`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should persist all spell data to wizard store (cantrips, spells, prepared, racial cantrips)`
- `should display "N cantrips, M spells selected" in progress sidebar`
- `should restore all previously selected cantrips and spells on back-navigation`

### Test Dependencies
- Mock Zustand wizard store for state persistence testing
- Mock class spell list data for validation against
- Test fixtures for complete/incomplete spell selections per spellcasting system
- Mock racial cantrip and Cleric domain spell data

## Identified Gaps

- **Edge Cases**: Class change resetting spell selections when returning to this step is mentioned in notes but not formally tested
- **Dependency Issues**: Warlock known spell count vs. Pact Magic slot count distinction needs clear separation in validation

## Dependencies

- **Depends on:** Stories 14.1-14.4 (spell selection UI must be built), Story 8.1 (wizard shell consumes the validate function), Epic 10 Story 10.6 (class for spell list validation), Epic 11 Story 11.6 (spellcasting ability modifier for prepared count), Phase 1 Zustand wizard store, Phase 1 SRD spell data
- **Blocks:** Epic 15 Story 15.1 (review displays spellcasting page with all selections)

## Notes

- **Validation Edge Cases**:
  - Cleric domain spells are always prepared and should be included in the prepared list but NOT count against the limit
  - Racial cantrips (Tiefling Thaumaturgy, High Elf wizard cantrip, Forest Gnome Minor Illusion) should NOT count against class cantrip selections
  - Warlock's known spell count is separate from their Pact Magic slot count — they know 2 spells but only have 1 slot
  - Wizard's prepared count is from their spellbook only — they can't prepare spells not in their spellbook
- The progress sidebar spell count should distinguish between cantrips and leveled spells for clarity
- When back-navigating to the Spell Step, all previously selected cantrips and spells should be restored from the wizard store
- If the class was changed (back to Class Step and then forward again), spell selections may need to be reset if the new class has a different spell list
- The spell list validation (ensuring all selected spells are on the class's list) prevents edge cases where a class change might leave orphaned spell selections
