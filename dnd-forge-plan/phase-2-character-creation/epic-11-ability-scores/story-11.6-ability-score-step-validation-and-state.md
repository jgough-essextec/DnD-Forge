# Story 11.6 — Ability Score Step Validation & State

> **Epic 11: Ability Score Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a developer, I need all ability score data persisted and validated. This story implements validation for all three ability score methods, persists scores/method/racial bonuses/raw rolls to the wizard store, and displays a compact summary in the wizard progress sidebar.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Validation Requirements per Method**:
  - **Standard Array**: All 6 abilities must have assigned values; values must be a valid permutation of [15, 14, 13, 12, 10, 8]
  - **Point Buy**: All 6 abilities must have values between 8-15; exactly 27 points must be spent (or warning if fewer)
  - **Rolling**: All 6 rolls must be completed; all 6 totals must be assigned to abilities
- **Persisted Data**: abilityScores (base values for each of 6 abilities), abilityScoreMethod ("standard-array" | "point-buy" | "rolling"), racialBonuses (from race selection), rolledScores (raw die data if rolling method — array of 6 sets, each with 4 die values)
- **Progress Sidebar Display**: Compact modifier badges: "STR +1 | DEX +3 | CON +2 | INT +4 | WIS +0 | CHA -1"

## Tasks

- [ ] **T11.6.1** — Implement `validateAbilityScoreStep()`: all 6 abilities must have assigned values; if point buy, exactly 27 points must be spent; if standard array, values must be a valid permutation; if rolling, all 6 rolls must be completed and assigned
- [ ] **T11.6.2** — Persist to wizard store: abilityScores (base values), abilityScoreMethod, racialBonuses (from race selection), rolledScores (raw die data if rolling method)
- [ ] **T11.6.3** — Display summary in progress sidebar: show the six modifier values as compact badges (e.g., "STR +1 | DEX +3 | CON +2 | INT +4 | WIS +0 | CHA -1")

## Acceptance Criteria

- `validateAbilityScoreStep()` returns errors if any ability does not have an assigned value
- Standard Array validation confirms values are a valid permutation of [15, 14, 13, 12, 10, 8]
- Point Buy validation confirms exactly 27 points are spent (or returns a warning for fewer points)
- Rolling validation confirms all 6 rolls are completed and all totals are assigned
- All ability score data is persisted to the Zustand wizard store (base values, method, racial bonuses, raw rolls)
- Progress sidebar shows compact modifier badges for all 6 abilities

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should return valid:false with error if any ability does not have an assigned value`
- `should return valid:false for Standard Array if values are not a valid permutation of [15, 14, 13, 12, 10, 8]`
- `should return valid:false for Standard Array if duplicate values exist`
- `should return warning for Point Buy if fewer than 27 points are spent`
- `should return valid:false for Rolling if not all 6 rolls are completed`
- `should return valid:false for Rolling if not all 6 totals are assigned to abilities`
- `should return valid:true when all selections are complete for each method`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should persist ability scores, method, racial bonuses, and raw rolls to wizard store`
- `should display compact modifier badges in progress sidebar for all 6 abilities`
- `should restore selected method and all assignments when back-navigating to this step`

### Test Dependencies
- Mock Zustand wizard store for state persistence testing
- Test fixtures for complete/incomplete ability score data per method
- Mock raw roll data for rolling method

## Identified Gaps

- **Edge Cases**: Point Buy with fewer than 27 points spent is a warning, not error, but the warning vs. error distinction is not consistently enforced across all test paths
- **Dependency Issues**: Progress sidebar modifier display compactness on mobile is mentioned but no specific character/width limits defined

## Dependencies

- **Depends on:** Stories 11.1-11.5 (all ability score UI must be built), Story 8.1 (wizard shell consumes the validate function), Phase 1 Zustand wizard store
- **Blocks:** Epic 12 (ability modifiers available for gameplay context), Epic 13 (STR for carrying capacity, DEX for AC), Epic 14 (spellcasting ability modifier for prepared spell count), Epic 15 (review displays all ability data)

## Notes

- Point Buy validation edge case: if the player hasn't spent all 27 points, this should be a warning (not an error) — some players may intentionally leave points unspent for roleplay reasons (though uncommon)
- Rolling method raw data preservation is important for transparency and DM verification
- The progress sidebar modifier display should be compact enough to fit on mobile while still being readable
- When back-navigating to the Ability Score Step, the selected method and all assignments should be fully restored from the wizard store
- Standard Array validation should also verify no duplicate values (each of the 6 values used exactly once)
