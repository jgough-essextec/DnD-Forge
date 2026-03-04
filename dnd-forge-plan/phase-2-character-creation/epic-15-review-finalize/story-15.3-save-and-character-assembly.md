# Story 15.3 — Save & Character Assembly

> **Epic 15: Review & Finalize Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to save my completed character and be taken to the character sheet view. This story implements the character assembly from wizard state, API save via React Query mutation, success celebration animation, save-and-create-another workflow, and error handling for save failures.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **Character Assembly**: The wizard store's `finalize()` method assembles a complete `Character` object from all wizard state:
  - Race + subrace + all race choices (ancestry, skills, cantrip, feat, languages)
  - Class + subclass + skills + fighting style
  - Ability scores (base + racial + method + raw rolls)
  - Background + personality + description + alignment
  - Equipment (items, armor, weapons, currency)
  - Spells (cantrips, known/spellbook, prepared)
  - All derived stats computed by the calculation engine
- **Database Save**: `POST /api/characters/` via React Query mutation sends the Character object to the Django REST API for persistence in PostgreSQL
- **Post-Save Navigation**: Navigate to the character sheet view at `/character/:id` using React Router
- **Session Cleanup**: Clear the wizard store (reset sessionStorage) after successful save
- **Success Celebration**: Confetti animation or themed "Your adventurer is ready!" splash screen

## Tasks

- [ ] **T15.3.1** — Implement the "Save Character" action: calls the wizard store's `finalize()` method which assembles a complete `Character` object from all wizard state, runs the calculation engine to compute all derived stats, and sends a `POST /api/characters/` via React Query mutation
- [ ] **T15.3.2** — Show a saving animation/progress indicator while the API request is in flight
- [ ] **T15.3.3** — On successful save: clear the wizard store (reset session), show a success celebration (confetti animation or themed "Your adventurer is ready!" splash), invalidate the characters list query cache, and navigate to the character sheet view (`/character/:id`)
- [ ] **T15.3.4** — Implement "Save & Create Another" button that saves the character and returns to the wizard Intro Step with a fresh state
- [ ] **T15.3.5** — Implement "Go Back & Edit" button that keeps the review open for further changes without saving yet
- [ ] **T15.3.6** — Handle save errors gracefully: if the API request fails, show an error message with a retry option and suggest exporting as JSON as a backup

## Acceptance Criteria

- "Save Character" assembles a complete Character object from wizard state and computes all derived stats
- The Character object is sent to `POST /api/characters/` via React Query mutation
- A saving animation/progress indicator is shown during the API request
- On success: wizard store is cleared, success celebration is shown, characters list query cache is invalidated, and navigation goes to `/character/:id`
- "Save & Create Another" saves the character and returns to the Intro Step with fresh state
- "Go Back & Edit" keeps the review open without saving
- API save errors show a user-friendly message with retry and JSON export fallback options

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should assemble a complete Character object from wizard state matching the Phase 1 Character interface`
- `should include all required fields: id, name, race, class, abilityScores, equipment, spells, personality, metadata`
- `should compute all derived stats during assembly (modifiers, AC, HP, initiative, proficiency bonus)`
- `should generate a UUID for the character id`
- `should set metadata fields (createdAt, updatedAt, creationMethod)`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should call wizard store finalize() and POST /api/characters/ via React Query mutation on Save Character click`
- `should show saving animation/progress indicator during API request`
- `should clear wizard store, show success celebration, invalidate characters query cache, and navigate to /character/:id on successful save`
- `should save character and return to Intro Step with fresh state on Save & Create Another click`
- `should keep review open without saving on Go Back & Edit click`
- `should show error message with retry and JSON export fallback on save failure`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should save a complete character, see celebration animation, and land on character sheet view`
- `should save and create another, returning to fresh Intro Step`
- `should handle API save failure gracefully with retry option`

### Test Dependencies
- Mock Zustand wizard store with finalize() method
- MSW (Mock Service Worker) handlers for POST /api/characters/ (success and failure scenarios)
- Mock React Router navigation
- Mock Phase 1 calculation engine for derived stat computation
- Complete character wizard state fixture

## Identified Gaps

- **Error Handling**: JSON export fallback on save failure is mentioned but no specification for the export format or download mechanism
- **Edge Cases**: Network failure and server error scenarios are mentioned in notes but no handling beyond the generic error message
- **Performance**: No specification for acceptable save duration or animation timing
- **Accessibility**: No ARIA announcements for save progress, success celebration, or error states

## Dependencies

- **Depends on:** Story 15.1 (character preview provides the data to save), Story 15.2 (validation must pass before save is enabled), Phase 1 calculation engine (for derived stat computation), React Query mutation for `POST /api/characters/`, Phase 1 Zustand wizard store (`finalize()` method), React Router (for navigation to `/character/:id`)
- **Blocks:** Nothing — this is the final action in the wizard flow

## Notes

- **Character Object Structure**: The assembled Character object should match the Phase 1 type system's `Character` interface, including:
  - id (auto-generated UUID)
  - name, playerName
  - race, subrace, class, subclass, level (1), background
  - abilityScores, abilityModifiers, savingThrows, skills
  - hp, ac, initiative, speed, proficiencyBonus
  - equipment, weapons, armor, currency
  - spells (cantrips, known, prepared, slots)
  - personality (traits, ideals, bonds, flaws), alignment
  - features (racial + class + background + feat)
  - description (age, height, weight, etc.), backstory, allies
  - metadata (createdAt, updatedAt, creationMethod)
- The success celebration should be thematic — consider a "Your adventurer is ready for their journey!" splash with the character's name, race, and class displayed prominently
- API save failures are possible (network issues, server errors, validation failures). The JSON export fallback ensures the player doesn't lose their work
- "Save & Create Another" should fully clear all wizard state before showing the Intro Step — no lingering data from the previous character
- Consider auto-saving the character name in the success splash: "Tharion the High Elf Wizard is ready for adventure!"
