# Story 8.1 — Wizard Shell & Step Management

> **Epic 8: Wizard Framework & Navigation** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need a guided step-by-step interface so I can create my character without feeling overwhelmed by all the options at once. This story builds the top-level wizard controller, progress tracking sidebar, navigation buttons with validation gating, step transitions, state persistence with session recovery, conditional step skipping, and keyboard navigation.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Wizard Step Registry**: Step 0 (Intro/Mode Selection), Step 1 (Race), Step 2 (Class), Step 3 (Ability Scores), Step 4 (Background & Personality), Step 5 (Equipment), Step 6 (Spellcasting — conditional), Step 7 (Review & Finalize)
- **State Management**: Zustand wizard store with sessionStorage persist middleware for state recovery across browser closes
- **Animation**: framer-motion for slide left/right step transitions
- **Step Validation Interface**: Each step component exposes `validate(): { valid: boolean; errors: string[] }` — the wizard calls this before advancing
- **Conditional Step Logic**: If selected class has no spellcasting at level 1 (Fighter, Barbarian, Monk, Paladin, Ranger, Rogue), the wizard skips Step 6 (Spellcasting) and jumps from Step 5 (Equipment) to Step 7 (Review)
- **Cascade Warning**: When a user changes a prior selection that invalidates later steps (e.g., switching race resets ability score racial bonuses), show a warning dialog before proceeding

## Tasks

- [ ] **T8.1.1** — Create `components/wizard/CreationWizard.tsx` as the top-level wizard controller. It reads `currentStep` from the wizard store and renders the corresponding step component. Includes animated transitions between steps (framer-motion slide left/right)
- [ ] **T8.1.2** — Define the wizard step registry as a constant array:
  - Step 0: Intro / Mode Selection
  - Step 1: Race Selection
  - Step 2: Class Selection
  - Step 3: Ability Scores
  - Step 4: Background & Personality
  - Step 5: Equipment
  - Step 6: Spellcasting (conditional — skip for non-casters at level 1)
  - Step 7: Review & Finalize
- [ ] **T8.1.3** — Create `components/wizard/WizardProgress.tsx` — a left sidebar (desktop) / top bar (mobile) showing all steps with numbered indicators. Completed steps show a checkmark icon. Current step is highlighted with the accent-gold color. Future steps are dimmed. Clicking a completed step navigates back to it
- [ ] **T8.1.4** — Create `components/wizard/WizardNavigation.tsx` — a fixed bottom bar with "Back" and "Next" buttons. The "Next" button is disabled (with tooltip explaining why) until the current step's validation passes. Shows "Save Character" on the final step instead of "Next". Include a "Skip" option on the Spellcasting step only (since it's conditional)
- [ ] **T8.1.5** — Implement step validation gating: each step component exposes a `validate(): { valid: boolean; errors: string[] }` function. The wizard calls this before advancing. Invalid fields are highlighted with error messages
- [ ] **T8.1.6** — Implement back navigation that preserves all state — returning to a previous step shows the user's prior selections intact. Changing a prior selection (e.g., switching race) triggers a cascade warning if it invalidates later steps (e.g., "Changing your race will reset your ability scores because racial bonuses change. Continue?")
- [ ] **T8.1.7** — Wire the wizard to the Zustand wizard store: every selection immediately persists to sessionStorage via the store's persist middleware. On mount, check for existing wizard state and show a modal: "You have an unfinished character. Resume or Start Fresh?"
- [ ] **T8.1.8** — Implement the conditional step skip logic: if the selected class has no spellcasting at level 1, the wizard jumps from Equipment (Step 5) directly to Review (Step 7). The progress bar reflects this by dimming the Spellcasting step with a "N/A" label
- [ ] **T8.1.9** — Add keyboard navigation support: Enter/Tab to advance, Escape to go back, number keys (1-7) to jump to completed steps

## Acceptance Criteria

- The wizard renders the correct step component based on `currentStep` from the Zustand wizard store
- Step transitions are animated with framer-motion slide left/right
- The progress sidebar/top bar shows all 8 steps with correct visual states (completed, current, future, N/A)
- Clicking a completed step navigates back to it; future steps are not clickable
- The "Next" button is disabled until the current step's validation passes, with a tooltip explaining missing requirements
- The final step shows "Save Character" instead of "Next"
- Back navigation preserves all prior selections
- Changing a prior selection that invalidates later steps shows a cascade warning dialog
- The wizard store persists all state to sessionStorage; closing and reopening the browser shows a "Resume or Start Fresh?" modal
- Non-caster classes cause Step 6 (Spellcasting) to be skipped and marked "N/A" in the progress bar
- Keyboard navigation works: Enter/Tab to advance, Escape to go back, number keys to jump to completed steps

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should define the wizard step registry with all 8 steps in correct order`
- `should identify conditional steps (Spellcasting) in the step registry`
- `should determine non-caster classes skip Step 6 (Fighter, Barbarian, Monk, Paladin, Ranger, Rogue)`
- `should map cascade dependencies correctly (race change affects ability scores, class change affects spells/equipment/skills)`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render the correct step component based on currentStep from the wizard store`
- `should animate step transitions with framer-motion slide left on advance and slide right on back`
- `should show progress sidebar with all 8 steps and correct visual states (completed, current, future, N/A)`
- `should allow clicking completed steps to navigate back but prevent clicking future steps`
- `should disable the Next button until current step validation passes and show tooltip explaining why`
- `should show Save Character button on the final step instead of Next`
- `should preserve all prior selections when navigating back`
- `should show cascade warning dialog when changing a prior selection that invalidates later steps`
- `should show Resume or Start Fresh modal when in-progress wizard state is found in sessionStorage`
- `should skip Step 6 and mark it N/A in progress bar for non-caster classes`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should complete full wizard navigation from Step 0 to Step 7 for a caster class`
- `should skip Spellcasting step when non-caster class is selected and navigate directly from Equipment to Review`
- `should persist wizard state to sessionStorage, survive browser refresh, and offer resume`
- `should handle keyboard navigation (Enter to advance, Escape to go back, number keys to jump)`

### Test Dependencies
- Mock Zustand wizard store with sessionStorage persist middleware
- Mock step components for each wizard step (stub validate functions)
- Mock framer-motion for animation assertions
- Test fixtures for caster and non-caster class selections

## Identified Gaps

- **Error Handling**: No specification for what happens if the wizard store is corrupted or contains invalid data on resume
- **Loading/Empty States**: No loading UI defined while wizard state is being restored from sessionStorage
- **Accessibility**: Keyboard navigation is specified but no ARIA live region announcements for step changes or validation errors
- **Mobile/Responsive**: Progress sidebar collapse to horizontal bar at 768px is mentioned but no detail on touch/swipe gestures for step navigation
- **Performance**: No render time criteria for step transitions or initial wizard load
- **Dependency Issues**: Browser back/forward button integration with React Router is noted but not in acceptance criteria

## Dependencies

- **Depends on:** Phase 1 Zustand stores with sessionStorage persist middleware, Phase 1 type system for wizard state shape
- **Blocks:** Stories 8.2, 8.3 (Intro and Freeform plug into this shell), all step Epics (9-15) plug their step components into this wizard controller

## Notes

- The wizard step registry must be extensible for future phases (e.g., multiclass step, leveling wizard)
- The cascade warning logic needs to map which steps depend on which prior steps: race change affects ability scores and skill overlap; class change affects skills, equipment, and spells
- framer-motion AnimatePresence with direction-aware slide animations (slide left when advancing, slide right when going back)
- Mobile responsive: the progress sidebar collapses to a horizontal step indicator bar on screens below 768px
- The wizard should handle browser back/forward buttons gracefully (integrate with React Router history if applicable)
