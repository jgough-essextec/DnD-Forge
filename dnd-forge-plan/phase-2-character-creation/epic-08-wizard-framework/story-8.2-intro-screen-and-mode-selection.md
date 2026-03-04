# Story 8.2 — Intro Screen & Mode Selection

> **Epic 8: Wizard Framework & Navigation** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to choose between guided wizard mode and freeform mode so I can use the workflow that matches my experience level. This story builds the initial wizard screen with welcoming header, mode selection cards (guided and freeform), optional character/player name entry, and session resume detection for in-progress characters.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Wizard Store**: Zustand store with sessionStorage persistence. On mount, the Intro Step checks for existing in-progress wizard state and offers to resume
- **Mode Selection**: Two creation paths — Guided (step-by-step wizard) and Freeform (all-at-once editable sheet). Selection stored in wizard store and determines which UI path is rendered
- **Player Preferences**: If the user has previously saved preferences (e.g., player name), these can be pre-populated from a user preferences store or localStorage

## Tasks

- [ ] **T8.2.1** — Create `components/wizard/IntroStep.tsx` — the initial wizard screen with a welcoming header ("Let's Build Your Adventurer!"), brief explanation of what the wizard does, and two prominent mode selection cards
- [ ] **T8.2.2** — Create the "Guided Creation" card: icon (wand/scroll), title, description ("Perfect for new players. We'll walk you through every step of building your character."), and a "Start Guided Creation" button
- [ ] **T8.2.3** — Create the "Freeform Creation" card: icon (quill/edit), title, description ("For experienced players who know the rules. Edit all fields directly on a blank character sheet."), and a "Start Freeform" button
- [ ] **T8.2.4** — Add an optional "Character Name" field on the intro screen so the player can name their character up front (can also be set later in the Background step)
- [ ] **T8.2.5** — Add a "Player Name" field on the intro screen (pre-populated from user preferences if stored)
- [ ] **T8.2.6** — If resuming an in-progress wizard (state found in sessionStorage), show a banner at the top: "Welcome back! You were building [Character Name or 'a character']. Pick up where you left off?" with Resume and Start Fresh buttons

## Acceptance Criteria

- The Intro Step renders as Step 0 of the wizard with a welcoming header and mode selection
- Two mode cards are displayed side-by-side (desktop) or stacked (mobile): Guided Creation and Freeform Creation
- Clicking "Start Guided Creation" sets the wizard mode and advances to Step 1 (Race Selection)
- Clicking "Start Freeform" sets the wizard mode and navigates to the Freeform Creation view
- Character Name and Player Name fields are optional text inputs that persist to the wizard store
- Player Name is pre-populated from user preferences if available
- When in-progress wizard state is found in sessionStorage, a resume banner appears with the character name (or "a character") and Resume/Start Fresh buttons
- Clicking "Resume" restores the wizard to the last active step with all prior selections intact
- Clicking "Start Fresh" clears the wizard store and shows the default Intro Step

## Dependencies

- **Depends on:** Story 8.1 (Wizard Shell — this is Step 0 rendered by the wizard controller), Phase 1 Zustand wizard store with sessionStorage persistence
- **Blocks:** Story 8.3 (Freeform mode is entered from this intro screen), all guided step Epics (9-15) are entered after this step

## Notes

- The welcoming header should use the dark fantasy theme with Cinzel font for the heading
- Mode selection cards should have subtle hover effects and clear visual hierarchy
- The resume banner should be prominent but dismissible — it sits above the mode selection cards
- Character name entered here flows to the Background Step (Story 12.3) where it can be edited further
- Consider adding a brief animated illustration or themed decorative element to make the intro screen inviting
