# Story 4.8 — Character Validation

> **Epic 4: Calculation Engine** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need a validation function that checks a character for completeness and rule compliance.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Validation categories**: Results are classified as errors (must fix before the character is considered valid) or warnings (informational, the character can still be used). This distinction is important for the UI — errors should block certain actions while warnings are advisory
- **Validation rules** (all must be checked):
  - **Required fields**: name, race, at least one class, ability scores — all must be populated
  - **Ability score range**: All scores must be between 1 and 30 (inclusive). Scores above 20 are only valid with specific features
  - **Point buy validation**: If method is "pointBuy", total cost must equal exactly 27 points, all scores between 8 and 15
  - **Standard array validation**: If method is "standard", values must be exactly [15, 14, 13, 12, 10, 8] in any assignment
  - **Skill proficiency count**: Number of chosen skill proficiencies must match class allowance + background + racial bonuses. No duplicate proficiencies (if class and background overlap, the player should have chosen a replacement)
  - **Spell count**: Number of known/prepared spells must not exceed cantrips known limit and prepared/known spell limit
  - **Equipment weight**: Total equipment weight vs carrying capacity (STR x 15). This is a warning, not an error, since some groups ignore encumbrance
  - **Attunement**: Maximum 3 attuned magic items. Exceeding is an error
  - **HP max**: If the calculated HP max differs from the stored value, issue a warning (the user may have manually overridden it)
  - **Multiclass prerequisites**: Each class has minimum ability score requirements for multiclassing. Fighter requires STR 13 or DEX 13. Wizard requires INT 13. Etc. Both the departing class and the entering class must meet requirements
- **CharacterValidation type**: Array of `{ field: string; severity: 'error' | 'warning'; message: string }`. The `field` path identifies which part of the character has the issue (e.g., "abilityScores.strength", "skills", "equipment.weight")

## Tasks
- [ ] **T4.8.1** — Implement `validateCharacter(character: Character): CharacterValidation[]` checking:
  - All required fields populated (name, race, class, ability scores)
  - Ability scores within valid range (1-30)
  - Point buy total equals exactly 27 (if method is pointBuy)
  - Standard array uses correct values (if method is standard)
  - Number of chosen skill proficiencies matches class + background allowance
  - No duplicate skill proficiencies (unless class and background overlap, then replacement)
  - Spell count matches cantrips known and prepared/known spell limits
  - Equipment weight vs. carrying capacity (warning, not error)
  - Attunement slots not exceeded (max 3)
  - HP max matches calculated value (warning if overridden)
  - Multiclass prerequisites met (if multiclassed)
- [ ] **T4.8.2** — Classify validation results as errors (must fix) vs. warnings (informational)
- [ ] **T4.8.3** — Write unit tests: valid character passes, character with 7 skills when allowed 4 fails, point buy totaling 28 fails, multiclass without prerequisites fails

## Acceptance Criteria
- `validateCharacter()` returns an empty array for a fully valid character
- Required field checks return errors for missing name, race, class, or ability scores
- Point buy validation catches over-budget (error) and under-budget (warning) allocations
- Standard array validation catches incorrect values
- Skill count validation catches too many or too few proficiencies
- Spell count validation catches exceeding preparation/known limits
- Equipment weight check returns a warning (not error) when exceeding carry capacity
- Attunement check returns an error when exceeding 3 items
- Multiclass prerequisite check catches characters that don't meet minimum ability score requirements
- All results include field path, severity, and human-readable message
- Unit tests cover valid characters, each specific validation rule violation, and edge cases

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should return empty array for fully valid character via validateCharacter`
- `should return error for missing name via validateCharacter`
- `should return error for missing race selection via validateCharacter`
- `should return error for missing class selection via validateCharacter`
- `should return error for missing ability scores via validateCharacter`
- `should return error for point buy totaling 28 points via validateCharacter`
- `should return warning for point buy under budget via validateCharacter`
- `should return error for invalid standard array values via validateCharacter`
- `should return error for 7 skill proficiencies when class allows 4 via validateCharacter`
- `should return error for duplicate skill proficiencies without replacement via validateCharacter`
- `should return warning for equipment weight exceeding carry capacity via validateCharacter`
- `should return error for exceeding 3 attuned magic items via validateCharacter`
- `should return warning for HP max not matching calculated value via validateCharacter`
- `should return error for multiclass without meeting prerequisite ability scores via validateCharacter`
- `should classify all results as error or warning severity via validateCharacter`
- `should include field path in dot notation for each validation result`

### Test Dependencies
- Character type fixtures: valid character, character with various violations
- Class data from Story 3.2 for proficiency allowances and multiclass requirements
- Background data from Story 3.5 for proficiency counts
- Calculation functions from Stories 4.1-4.4

## Identified Gaps

- **Error Handling**: No specification for how to handle partially constructed characters (during wizard flow) — should some validations be skipped?
- **Edge Cases**: Spell count validation for multiclass characters with multiple spellcasting classes needs clarification
- **Edge Cases**: Validation ordering (errors before warnings) is mentioned but not in acceptance criteria
- **Performance**: Validation should be fast enough for real-time feedback but no performance target specified

## Dependencies
- **Depends on:** Story 2.8 (Character, CharacterValidation types), Story 3.2 (class data for proficiency allowances, multiclass requirements), Story 3.5 (background data for proficiency counts), Story 4.1 (ability score validation functions), Story 4.2 (proficiency calculations), Story 4.3 (HP calculation for verification, encumbrance), Story 4.4 (spell slot/preparation calculations)
- **Blocks:** Epic 5 (database could run validation before save), Epic 6 (stores can expose validation state)

## Notes
- Validation should be fast enough to run on every character change (debounced) to provide real-time feedback in the UI
- The `field` path in validation results should use dot notation (e.g., "classes[0].chosenSkills") to allow the UI to highlight specific form fields
- Multiclass prerequisites: To multiclass, a character must meet the ability score minimums for BOTH their current class AND the new class. For example, a Fighter (STR 13 OR DEX 13) wanting to add Wizard (INT 13) must meet both requirements. These minimums are defined per class in the SRD
- The validation function should not throw errors — it always returns an array of results (empty if valid). This makes it safe to call at any time
- Consider ordering results by severity (errors first) for UI display
- Some validations may not be applicable during character creation (e.g., multiclass prerequisites only matter for level-up). Consider adding context about when to run which checks
