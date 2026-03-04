# Story 17.7 — Hit Dice & Death Saves

> **Epic 17: Character Sheet — Page 1 (Core Stats)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see my total hit dice, track used dice, and record death saving throw successes/failures.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Hit Dice**: Each class has a specific hit die (e.g., Fighter d10, Wizard d6, Barbarian d12). At level 1, the character has 1 hit die. Multiclass characters have separate pools per class
- **Death Saves**: Three success circles and three failure circles. Three successes = stabilized, three failures = dead. Natural 20 = restore 1 HP. Natural 1 = two failures. Check is >= 10 success, < 10 failure
- **Empty State**: Hit Dice Used = 0, Death Saves = 0/0 at character creation. Both are session-tracking fields (Gap S1)
- **Dice Engine**: Phase 1 dice engine for death save rolls (1d20, no modifier)

## Tasks
- [ ] **T17.7.1** — Create `components/character/page1/HitDiceBlock.tsx` — shows total hit dice (e.g., "1d10" for a level 1 Fighter) and tracks used hit dice. Display as "Used: 0 / Total: 1d10"
- [ ] **T17.7.2** — **Edit mode:** hit dice usage is adjustable with +/- buttons. For multiclass characters, show each class's hit dice separately (e.g., "1d10 (Fighter) + 1d8 (Rogue)")
- [ ] **T17.7.3** — Create `components/character/page1/DeathSaves.tsx` — three success circles and three failure circles in a row. Clicking a circle fills it in (toggling success/failure counts). Three successes = stabilized (show green checkmark). Three failures = dead (show red X with skull). A natural 20 = restore 1 HP (show tooltip). A natural 1 = two failures
- [ ] **T17.7.4** — Add a "Roll Death Save" button that rolls 1d20 and auto-fills the appropriate circle (>= 10 = success, < 10 = failure, 20 = critical success, 1 = critical failure marking 2 circles)
- [ ] **T17.7.5** — Reset death saves button (appears when any are marked): clears all circles back to empty

## Acceptance Criteria
- Hit dice display shows the correct die type for the character's class
- Hit dice usage tracking shows "Used: N / Total: XdY"
- Edit mode allows adjusting hit dice usage with +/- buttons
- Multiclass characters show separate hit dice pools per class
- Death saves display three success and three failure circles
- Clicking circles toggles them filled/empty
- Three successes shows a stabilized indicator (green checkmark)
- Three failures shows a dead indicator (red X with skull)
- "Roll Death Save" button rolls 1d20 and auto-fills the correct circle(s)
- Natural 20 is handled as critical success, natural 1 marks two failure circles
- Reset button clears all death save circles

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should determine correct hit die type from character class (e.g., Fighter d10, Wizard d6)`
- `should evaluate death save roll: >= 10 is success, < 10 is failure`
- `should evaluate natural 20 as critical success (restore 1 HP)`
- `should evaluate natural 1 as critical failure (marks 2 failure circles)`
- `should determine stabilized state when 3 successes reached`
- `should determine dead state when 3 failures reached`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render hit dice display with correct die type for the character class`
- `should display hit dice usage as "Used: N / Total: XdY"`
- `should render +/- buttons for hit dice usage adjustment in edit mode`
- `should render three success circles and three failure circles for death saves`
- `should toggle circle fill state when clicking death save circles`
- `should display green checkmark when 3 successes are marked`
- `should display red X with skull when 3 failures are marked`
- `should roll 1d20 and auto-fill correct circle when "Roll Death Save" button is clicked`
- `should mark 2 failure circles on natural 1 roll`
- `should clear all death save circles when reset button is clicked`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should roll death saves via the button, auto-fill circles, and reach stabilized or dead state`

### Test Dependencies
- Mock character data for various classes (Fighter d10, Wizard d6, Barbarian d12)
- Mock multiclass character data with separate hit dice pools
- Mock dice engine for controlled death save roll results (success, failure, nat 20, nat 1)
- Mock view/edit mode context

## Identified Gaps

- **Edge Cases**: No specification for what happens after stabilization or death (can the player continue marking? auto-reset?)
- **Accessibility**: No ARIA labels for death save circles, no screen reader announcement for roll results, no keyboard navigation for circle toggling
- **Error Handling**: No specification for hitting dice used count below 0 or above total

## Dependencies
- Phase 1 dice engine for death save rolls
- Phase 1 Character type system (hit die type per class)
- Epic 20 view/edit mode toggle system

## Notes
- Hit dice are used during short rests to recover HP — full tracking is a Phase 4 feature, but the display and manual adjustment is Phase 3
- Death saves are rare but critical during gameplay — the UI must be clear and unambiguous
- Both hit dice used and death saves are session-tracking fields that start at 0 for new characters (Gap S1)
- The "Roll Death Save" button should use the dice engine with appropriate visual feedback
