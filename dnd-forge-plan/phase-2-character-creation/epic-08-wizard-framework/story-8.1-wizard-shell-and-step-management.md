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

## Dependencies

- **Depends on:** Phase 1 Zustand stores with sessionStorage persist middleware, Phase 1 type system for wizard state shape
- **Blocks:** Stories 8.2, 8.3 (Intro and Freeform plug into this shell), all step Epics (9-15) plug their step components into this wizard controller

## Notes

- The wizard step registry must be extensible for future phases (e.g., multiclass step, leveling wizard)
- The cascade warning logic needs to map which steps depend on which prior steps: race change affects ability scores and skill overlap; class change affects skills, equipment, and spells
- framer-motion AnimatePresence with direction-aware slide animations (slide left when advancing, slide right when going back)
- Mobile responsive: the progress sidebar collapses to a horizontal step indicator bar on screens below 768px
- The wizard should handle browser back/forward buttons gracefully (integrate with React Router history if applicable)
