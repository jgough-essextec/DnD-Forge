# Story 11.1 — Method Selection

> **Epic 11: Ability Score Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to choose how I want to generate my ability scores, with clear explanations of each method. This story builds the method selection interface with three options (Standard Array, Point Buy, Rolling), descriptions of each, house rule support, and confirmation when switching methods.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **Three Methods**:
  - **Standard Array**: Use pre-set values [15, 14, 13, 12, 10, 8] and assign each to an ability. Balanced and predictable
  - **Point Buy**: Start each score at 8, spend 27 points to increase scores (max 15). Full control over build
  - **Rolling**: Roll 4d6, drop lowest die, six times. Classic method — exciting but unpredictable
- **House Rules**: Campaign data may restrict which methods are allowed. If restricted, only show allowed method(s) with an explanation
- **Method Switching**: Changing methods after starting (e.g., switching from Point Buy to Rolling) resets any in-progress assignments. A confirmation dialog warns the player before resetting

## Tasks

- [ ] **T11.1.1** — Create `components/wizard/AbilityScoreStep.tsx` as the Step 3 container. Top section shows three method selection tabs/cards: Standard Array, Point Buy, and Rolling. Each has a brief description
- [ ] **T11.1.2** — Standard Array card: "Use the pre-set values [15, 14, 13, 12, 10, 8] and assign each to an ability. Balanced and predictable."
- [ ] **T11.1.3** — Point Buy card: "Customize each score from 8 to 15 using 27 points. Full control over your build."
- [ ] **T11.1.4** — Rolling card: "Roll 4d6, drop the lowest die, six times. The classic method — exciting but unpredictable!"
- [ ] **T11.1.5** — If the campaign has house rules restricting the method (from campaign data), only show the allowed method(s) and explain the restriction
- [ ] **T11.1.6** — Switching methods resets any in-progress assignments with a confirmation dialog

## Acceptance Criteria

- Three method options are displayed as selectable tabs or cards with descriptions
- Selecting a method renders the corresponding interface (Standard Array, Point Buy, or Rolling) below
- Only one method can be active at a time
- If campaign house rules restrict methods, only allowed methods are shown with an explanation
- Switching methods after starting shows a confirmation dialog warning about reset
- Confirming the switch resets all in-progress ability score assignments

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render three method options as selectable tabs/cards with descriptions`
- `should render Standard Array interface below when Standard Array method is selected`
- `should render Point Buy interface below when Point Buy method is selected`
- `should render Rolling interface below when Rolling method is selected`
- `should allow only one method to be active at a time`
- `should show only allowed methods with explanation when campaign house rules restrict methods`
- `should show confirmation dialog when switching methods after starting assignments`
- `should reset all in-progress ability score assignments after confirming method switch`
- `should default to Standard Array as the most beginner-friendly option`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should select each method and see the corresponding interface rendered`
- `should switch from Point Buy (with partial allocation) to Rolling and confirm reset`

### Test Dependencies
- Mock wizard store for tracking selected method and in-progress state
- Mock campaign data with method restrictions for house rule testing
- Stub method-specific interface components

## Identified Gaps

- **Error Handling**: No specification for what happens if campaign data is unavailable (noted graceful absence in notes but not in acceptance criteria)
- **Loading/Empty States**: No loading state while campaign data is checked
- **Accessibility**: No ARIA labels specified for method selection tabs/cards or confirmation dialog

## Dependencies

- **Depends on:** Story 8.1 (Wizard Shell — this is Step 3), Phase 1 campaign data (for house rule restrictions)
- **Blocks:** Stories 11.2-11.4 (each method's interface renders based on the selected method), Story 11.6 (validation depends on method selection)

## Notes

- The method selection should default to Standard Array as the most beginner-friendly option
- Consider adding a brief "Which should I choose?" helper: "Standard Array is recommended for new players. Point Buy gives the most control. Rolling is the most fun but can result in very high or very low scores."
- Campaign house rule data may not exist in Phase 2 if campaigns aren't implemented yet — design the restriction feature to be gracefully absent if no campaign context exists
- The selected method should be visually prominent (highlighted tab/card) while unselected methods are dimmed but still clickable
