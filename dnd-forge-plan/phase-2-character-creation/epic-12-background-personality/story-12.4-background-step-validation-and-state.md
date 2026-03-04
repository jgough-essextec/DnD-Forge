# Story 12.4 — Background Step Validation & State

> **Epic 12: Background & Personality Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a developer, I need background selections and personality data persisted and validated. This story implements validation for background selection and skill replacements, persists all background/personality/description data to the wizard store, and displays the background name and character name in the progress sidebar.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Validation Requirements**:
  - **Error (blocking)**: Background must be selected; if skill overlap exists, replacement must be chosen
  - **Warning (non-blocking)**: Personality traits should have at least 1 entry; character name should be entered
- **Persisted Data**: backgroundId, chosenSkills (including any replacements for overlaps), chosenLanguages (if background has language choices), chosenTools (if background has tool choices), personalityTraits (array of 2 strings), ideals (string), bonds (string), flaws (string), characterName, alignment, all description fields (age, height, weight, eye color, hair color, skin color, appearance notes, backstory, allies/organizations)
- **Progress Sidebar Display**: Background name, character name (if entered)

## Tasks

- [ ] **T12.4.1** — Implement `validateBackgroundStep()`: background must be selected; if skill overlap exists, replacement must be chosen; personality traits should have at least 1 entry (warning, not error); character name should be entered (warning, not error)
- [ ] **T12.4.2** — Persist to wizard store: backgroundId, chosenSkills (including replacements), chosenLanguages, chosenTools, personalityTraits, ideals, bonds, flaws, characterName, alignment, all description fields
- [ ] **T12.4.3** — Display in progress sidebar: background name, character name (if entered)

## Acceptance Criteria

- `validateBackgroundStep()` returns error if background is not selected
- `validateBackgroundStep()` returns error if skill overlap exists but replacement is not chosen
- `validateBackgroundStep()` returns warning (not error) if personality traits have fewer than 1 entry
- `validateBackgroundStep()` returns warning (not error) if character name is empty
- `validateBackgroundStep()` returns `{ valid: true, errors: [] }` when background is selected and all overlaps are resolved (warnings are non-blocking)
- All background, personality, and description data is persisted to the Zustand wizard store
- Progress sidebar shows background name and character name

## Dependencies

- **Depends on:** Stories 12.1-12.3 (all background UI must be built), Story 8.1 (wizard shell consumes the validate function), Phase 1 Zustand wizard store
- **Blocks:** Epic 13 (background equipment is added to inventory), Epic 15 (review displays all background/personality data)

## Notes

- The distinction between errors (blocking) and warnings (non-blocking) is important: a player MUST select a background and resolve skill overlaps, but CAN proceed without naming their character or filling in personality traits
- Warnings should be displayed as yellow badges in the validation output, distinct from red error badges
- Character name is particularly important to track as a warning because the review step and save function will use it. An unnamed character should still be saveable but with a default like "Unnamed Adventurer"
- When back-navigating to this step, all previously entered personality and description text should be fully restored from the wizard store
- Long text fields (backstory, allies) should be auto-saved to the wizard store on change/blur to prevent data loss
