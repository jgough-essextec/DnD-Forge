# Story 6.2 — Wizard Store

> **Epic 6: Zustand State Management Stores** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need a persistent store for character creation wizard state so it survives page navigation.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Zustand persist middleware**: Zustand supports middleware that automatically serializes/deserializes store state to a storage backend. For the wizard store, `sessionStorage` is used so the data persists during the browser session (survives navigation between routes) but is cleared when the tab is closed (no stale wizard state on next visit)
- **Wizard flow**: The character creation wizard is a multi-step form. Each step collects part of the character data:
  1. Character name
  2. Race selection (race + subrace + choices like languages, cantrip, skills)
  3. Class selection (class + skills + fighting style + other choices)
  4. Ability score assignment (method choice + score allocation)
  5. Background selection (background + skill choices + language/tool choices)
  6. Equipment selection (starting equipment packs OR starting gold)
  7. Spell selection (for spellcasting classes: cantrips + known/prepared spells)
  8. Review and finalize
- **State persistence**: If the user navigates away from the wizard (e.g., to check the dice roller or a character sheet for reference), the wizard state must survive. Session storage achieves this. The `reset()` action clears all state when starting a new character or after finalizing
- **Finalize**: The `finalize()` action assembles a complete `Character` object from all wizard state, runs it through the calculation engine to compute derived stats, and returns the fully initialized character. This character is then saved via the database layer
- **Character data flow**: Wizard state (partial selections) -> finalize() -> Character object (complete) -> calculation engine -> derived stats populated -> database save

## Tasks
- [ ] **T6.2.1** — Create `stores/wizardStore.ts` with Zustand persist middleware (sessionStorage backend)
- [ ] **T6.2.2** — State: `{ currentStep, raceSelection, classSelection, abilityScores, abilityScoreMethod, backgroundSelection, equipmentSelections, spellSelections, characterName, isComplete }`
- [ ] **T6.2.3** — Implement actions: `setStep(n)`, `setRace(selection)`, `setClass(selection)`, `setAbilityScores(scores, method)`, `setBackground(selection)`, `setEquipment(selections)`, `setSpells(selections)`, `reset()`, `finalize(): Character`
- [ ] **T6.2.4** — Implement `finalize()` that assembles a complete Character object from all wizard state and calls the calculation engine
- [ ] **T6.2.5** — Write tests: state persists across simulated navigation, reset clears all, finalize produces valid Character

## Acceptance Criteria
- The wizard store persists to sessionStorage and survives route navigation
- Each setter action updates its respective field and optionally advances the step
- `setStep(n)` allows navigating to any step (forward or backward)
- `reset()` clears all wizard state back to initial defaults
- `finalize()` assembles a valid `Character` object from the accumulated wizard state
- `finalize()` runs the character through the calculation engine to populate derived stats (AC, HP, skill modifiers, etc.)
- `finalize()` returns a Character ready to be saved to the database
- The store clears when the browser tab is closed (sessionStorage, not localStorage)
- Tests verify persistence across navigation, complete reset, and finalization producing a valid character

## Dependencies
- **Depends on:** Story 2.2 (RaceSelection), Story 2.3 (ClassSelection), Story 2.1 (AbilityScores), Story 2.6 (BackgroundSelection), Story 2.8 (Character), Story 2.10 (WizardState), Epic 4 (calculation engine for finalize)
- **Blocks:** Phase 2 Character Creation Wizard UI

## Notes
- Zustand persist middleware configuration: `{ name: 'dnd-forge-wizard', storage: createJSONStorage(() => sessionStorage) }`
- The `finalize()` function is critical — it translates user selections into a fully populated Character object. It must: (1) create a Character shell with UUID and timestamps, (2) populate all fields from wizard state, (3) compute all proficiencies from race + class + background, (4) compute all derived stats via calculation engine, (5) set initial HP (max hit die + CON mod for level 1)
- Consider adding step validation: each setter could validate the current step's data before marking it complete. This enables a progress indicator showing which steps are valid
- The `equipmentSelections` type is loosely defined (`any[]`) and should be refined once the equipment selection UI is designed in Phase 2
- `characterName` is stored separately from other selections because it doesn't naturally belong to any selection type (race, class, background, etc.)
- When the user goes back to a previous step and changes a selection, subsequent steps may be invalidated (e.g., changing class invalidates spell selections). Consider cascading resets
