# Story 6.2 — Wizard Store

> **Epic 6: Zustand State Management Stores** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need the wizard store to manage ephemeral character creation wizard state in Zustand, with finalization posting the completed character to the Django REST API via a React Query mutation, so that wizard progress is kept in-memory during the creation flow and only committed to the server on finalization.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Zustand for ephemeral wizard state**: The wizard store holds in-progress creation state only. No data is sent to the API until finalization. The store uses Zustand without persist middleware — state lives in memory only and is lost on page refresh (acceptable for a creation flow)
- **Wizard flow**: The character creation wizard is a multi-step form. Each step collects part of the character data:
  1. Character name
  2. Race selection (race + subrace + choices like languages, cantrip, skills)
  3. Class selection (class + skills + fighting style + other choices)
  4. Ability score assignment (method choice + score allocation)
  5. Background selection (background + skill choices + language/tool choices)
  6. Equipment selection (starting equipment packs OR starting gold)
  7. Spell selection (for spellcasting classes: cantrips + known/prepared spells)
  8. Review and finalize
- **Finalization via API**: The `useCreateCharacterFromWizard()` React Query hook takes the wizard store state, transforms it into a `CreateCharacterPayload`, and submits it via `POST /api/characters/`. The Django backend computes all derived stats (AC, HP, modifiers, etc.) and returns the fully populated Character. On success, the wizard store is cleared
- **Character data flow**: Wizard state (ephemeral Zustand) -> transform to payload -> `POST /api/characters/` -> Django computes derived stats -> Character response -> invalidate React Query cache -> clear wizard store

## Tasks
- [ ] **T6.2.1** — Create `stores/wizardStore.ts` with Zustand (no persist middleware). State: `{ currentStep, raceSelection, classSelection, abilityScores, abilityScoreMethod, backgroundSelection, equipmentSelections, spellSelections, characterName, isComplete }`
- [ ] **T6.2.2** — Implement setter actions: `setStep(n)`, `setRace(selection)`, `setClass(selection)`, `setAbilityScores(scores, method)`, `setBackground(selection)`, `setEquipment(selections)`, `setSpells(selections)`, `setCharacterName(name)`, `reset()`
- [ ] **T6.2.3** — Create `hooks/useCreateCharacterFromWizard.ts` — React Query `useMutation` hook that: (1) reads wizard store state, (2) transforms it into a `CreateCharacterPayload`, (3) calls `POST /api/characters/` via the API layer, (4) on success invalidates `['characters']` query cache, (5) on success calls `wizardStore.getState().reset()` to clear the wizard
- [ ] **T6.2.4** — Create `utils/transformWizardToPayload.ts` — pure function that converts wizard store state into a `CreateCharacterPayload` object suitable for the API. Handles mapping race/class/background selections into the API schema
- [ ] **T6.2.5** — Write tests: Vitest for wizard store setter/reset logic, Vitest for payload transform function, Vitest + MSW for the finalization mutation hook

## Acceptance Criteria
- Wizard state is ephemeral — stored in Zustand only, no API calls during the creation steps
- Each setter action updates its respective field in the wizard store
- `setStep(n)` allows navigating to any step (forward or backward)
- `reset()` clears all wizard state back to initial defaults
- `useCreateCharacterFromWizard()` transforms wizard state into an API payload and posts to `POST /api/characters/`
- On successful API response, the `['characters']` React Query cache is invalidated
- On successful API response, the wizard store is automatically cleared via `reset()`
- The mutation hook exposes `{ mutate, isLoading, isError, error }` for the UI to handle loading and error states
- `transformWizardToPayload()` is a pure, testable function that maps wizard selections to the API schema
- Tests verify store logic, payload transformation, and API interaction

## Testing Requirements

### Unit Tests (Vitest)
_For Zustand store logic and pure transform function_

- `should initialize wizard store with currentStep 0 and all selections null/empty`
- `should update raceSelection via setRace action`
- `should update classSelection via setClass action`
- `should update abilityScores and method via setAbilityScores action`
- `should update backgroundSelection via setBackground action`
- `should update equipmentSelections via setEquipment action`
- `should update spellSelections via setSpells action`
- `should update characterName via setCharacterName action`
- `should navigate to any step via setStep action`
- `should clear all wizard state back to defaults via reset`
- `should transform complete wizard state into valid CreateCharacterPayload via transformWizardToPayload`
- `should handle missing optional fields (e.g., no spells for non-caster) in transformWizardToPayload`

### Hook Tests (Vitest + MSW + renderHook)
_For React Query mutation hook with mocked API_

- `should post character payload to /api/characters/ via useCreateCharacterFromWizard`
- `should invalidate characters query cache on successful creation`
- `should clear wizard store on successful creation`
- `should return isError true when API call fails`
- `should not clear wizard store when API call fails`

### Test Dependencies
- MSW (Mock Service Worker) for API request interception
- `@testing-library/react` with `renderHook` for hook testing
- React Query `QueryClientProvider` wrapper for test renders
- RaceSelection, ClassSelection, AbilityScores, BackgroundSelection type fixtures

## Identified Gaps

- **Error Handling**: No specification for finalize behavior when wizard state is incomplete (missing required selections). The transform function should validate completeness before posting
- **Edge Cases**: Changing class after spell selection should invalidate spell choices but cascading reset is not specified in acceptance criteria
- **Edge Cases**: WizardState.equipmentSelections is `any[]`; the transform function must handle this loosely-typed field
- **UX**: Whether to show a confirmation dialog before finalization (preventing accidental submission) is not specified

## Dependencies
- **Depends on:** Story 2.2 (RaceSelection), Story 2.3 (ClassSelection), Story 2.1 (AbilityScores), Story 2.6 (BackgroundSelection), Story 2.8 (Character), Story 2.10 (WizardState), Story 6.1 (character API layer and React Query hooks for cache invalidation)
- **Blocks:** Phase 2 Character Creation Wizard UI

## Notes
- The wizard store intentionally does NOT use Zustand persist middleware. Wizard state is ephemeral — if the user refreshes the page, the creation progress is lost. This is a deliberate simplification; if persistence is needed later, sessionStorage-backed persist middleware can be added
- The `transformWizardToPayload()` function is extracted as a pure utility so it can be unit-tested independently from React hooks and Zustand. It maps frontend selection types into the API's `CreateCharacterPayload` schema
- The Django backend is responsible for computing all derived stats (AC, HP, modifiers, proficiency bonus, etc.) from the raw character data. The frontend does not run a calculation engine — it trusts the API response
- `characterName` is stored separately from other selections because it does not naturally belong to any selection type (race, class, background, etc.)
- When the user goes back to a previous step and changes a selection, subsequent steps may be invalidated (e.g., changing class invalidates spell selections). Consider cascading resets in the setter actions
- The `equipmentSelections` type is loosely defined (`any[]`) and should be refined once the equipment selection UI is designed in Phase 2
