# Story 11.4 — Dice Rolling Interface

> **Epic 11: Ability Score Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player using the Rolling method, I need to roll 4d6-drop-lowest six times with animated dice and assign the results to abilities. This story builds a two-phase rolling interface: Phase 1 for rolling six sets of 4d6 with animated dice, and Phase 2 for assigning the six totals to abilities using the same drag-and-drop/click-to-assign interface as Standard Array.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Rolling Method**: 4d6 drop lowest — roll four six-sided dice, discard the lowest value, sum the remaining three. Repeat six times to generate six ability score values
- **Dice Engine**: Phase 1 dice engine handles the roll mechanics (4d6 notation parsing, roll execution, drop-lowest logic). This story adds the visual/animation layer on top
- **Dice Animation**: CSS 3D transforms for a realistic tumbling effect on four d6 dice. Animation duration: 1-2 seconds. Optional sound effects (dice clatter) controlled by user preferences
- **Two Phases**:
  - Phase 1 (Rolling): 6 roll slots, each showing "Not Rolled" or the result. Roll button triggers animated dice for current slot. Shows 4 individual die values with lowest crossed out/dimmed, and total of kept 3
  - Phase 2 (Assignment): Once all 6 sets are rolled, display the 6 totals as assignable values using the same drag-and-drop/click-to-assign interface as Standard Array (Story 11.2). Show racial bonuses and modifiers
- **House Rule Toggle**: Optional "Reroll if total below X" — if enabled and total of all 6 scores is below a threshold (commonly 70), automatically offer a reroll
- **Raw Roll Preservation**: Individual die values per set are stored in the wizard store for display on the character sheet

## Tasks

- [ ] **T11.4.1** — Create `components/wizard/ability/DiceRollingInterface.tsx` — a two-phase interface: Phase 1 is rolling six sets of 4d6, Phase 2 is assigning the six totals to abilities (reusing the drag-and-drop assigner from Standard Array)
- [ ] **T11.4.2** — Phase 1: display 6 roll slots. Each slot shows either "Not Rolled" or the result. A "Roll" button triggers an animated dice roll for the current slot using the dice engine. Show the 4 individual die values with the lowest visually crossed out/dimmed, and the total of the kept 3
- [ ] **T11.4.3** — Implement dice rolling animation: use CSS 3D transforms for a realistic tumbling effect on four d6 dice. After the animation (1-2 seconds), reveal the values. Include optional sound effects (dice clatter) controlled by user preferences
- [ ] **T11.4.4** — Add a "Roll All" button that auto-rolls all 6 sets in sequence with a slight delay between each for dramatic effect
- [ ] **T11.4.5** — Add a "Reroll All" button that re-rolls all 6 sets (with a confirmation dialog: "Are you sure? Your current rolls will be lost.")
- [ ] **T11.4.6** — Optional house rule toggle: "Reroll if total is below X" — if enabled and the total of all 6 scores is below a threshold (commonly 70), automatically offer a reroll
- [ ] **T11.4.7** — Once all 6 sets are rolled, Phase 2 activates: display the 6 totals as assignable values using the same drag-and-drop/click-to-assign interface as Standard Array. Show racial bonuses and modifiers
- [ ] **T11.4.8** — Preserve the raw roll data (individual die values per set) in the wizard store for display on the character sheet

## Acceptance Criteria

- Phase 1 shows 6 roll slots, each starting as "Not Rolled"
- Rolling a slot triggers an animated dice roll showing 4 d6 with CSS 3D tumbling for 1-2 seconds
- After animation, the 4 die values are revealed with the lowest crossed out, and the total of kept 3 is shown
- "Roll All" auto-rolls all 6 sets in sequence with dramatic pacing
- "Reroll All" re-rolls all sets after a confirmation dialog
- Optional house rule toggle offers reroll when total of all 6 scores is below the threshold
- Phase 2 activates after all 6 rolls, showing the totals as assignable values using drag-and-drop or click-to-assign
- Racial bonuses and modifiers are displayed in Phase 2 alongside each ability slot
- Raw roll data (individual die values per set) is persisted to the wizard store

## Dependencies

- **Depends on:** Story 11.1 (Method Selection — this renders when Rolling is selected), Story 11.2 (reuses the drag-and-drop/click-to-assign interface for Phase 2), Phase 1 dice engine, Epic 9 Story 9.5 (racial ability bonuses)
- **Blocks:** Story 11.5 (summary uses rolled and assigned values), Story 11.6 (validation checks all rolls complete and assigned)

## Notes

- **4d6 Drop Lowest Statistics**: The average result is approximately 12.24 per roll, with possible range 3-18. Total of 6 rolls averages ~73.5. Very low totals (below 70) are rare but possible
- The dice animation should feel satisfying and thematic — this is one of the most iconic moments of D&D character creation
- CSS 3D transforms for dice: consider a cube with dot faces (1-6), rotating on X and Y axes before settling on the final face
- Sound effects should be opt-in via user preferences — do not auto-play audio
- The "Roll All" sequential delay should be 500-800ms between each set for dramatic effect without being too slow
- Phase 2 should visually transition from the rolling interface — consider a "Your rolls are ready!" celebration before showing the assignment UI
- Raw roll data is valuable for the character sheet ("You rolled: [4,3,6,2] -> dropped 2 -> total 13") and for DMs who want to verify rolls
- @dnd-kit dependency is shared with Standard Array — ensure it's only installed once
