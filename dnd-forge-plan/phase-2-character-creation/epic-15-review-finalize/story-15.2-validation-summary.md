# Story 15.2 — Validation Summary

> **Epic 15: Review & Finalize Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to see if anything is missing or incorrect so I can go back and fix it before saving. This story builds the validation summary that runs the full character validation, displays categorized results (errors, warnings, info), provides "Fix" links to navigate back to relevant steps, and gates the save button based on validation results.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Full Character Validation**: The Phase 1 calculation engine includes a `validateCharacter()` function that checks the assembled character data for completeness and correctness
- **Validation Categories**:
  - **Errors (red, must fix)**: Missing required fields (no race, no class), invalid ability score totals, incorrect proficiency counts, missing required subclass, missing fighting style
  - **Warnings (yellow, informational)**: Missing backstory, no character name (will use "Unnamed Adventurer"), low primary ability score, empty personality fields, unspent point buy points
  - **Info (blue, helpful)**: "Your character is ready to save!", "Tip: You can always edit these details later"
- **Fix Links**: Each validation message includes a clickable "Fix" link/button that navigates the wizard back to the relevant step
- **Save Button Gating**: If there are errors, the "Save Character" button is disabled with a tooltip: "Fix N errors before saving". If only warnings (or no issues), the button is enabled

## Tasks

- [ ] **T15.2.1** — Run the full `validateCharacter()` function from the calculation engine against the assembled character data
- [ ] **T15.2.2** — Display validation results at the top of the Review Step as a collapsible section:
  - **Errors** (red, must fix): missing required fields, invalid ability score totals, incorrect proficiency counts
  - **Warnings** (yellow, informational): missing backstory, no character name, low primary ability score, empty personality fields
  - **Info** (blue, helpful): "Your character is ready to save!", "Tip: You can always edit these details later"
- [ ] **T15.2.3** — Each validation message includes a "Fix" link/button that navigates back to the relevant wizard step
- [ ] **T15.2.4** — If there are no errors (warnings are acceptable), enable the "Save Character" button. If there are errors, disable it with a tooltip: "Fix N errors before saving"

## Acceptance Criteria

- Full character validation runs on entering the Review Step and displays results
- Errors are shown in red and must be fixed before saving
- Warnings are shown in yellow and are informational (non-blocking)
- Info messages are shown in blue for positive feedback and tips
- Each validation message has a "Fix" link that navigates to the relevant wizard step
- The "Save Character" button is disabled when errors exist, with a tooltip showing the error count
- The "Save Character" button is enabled when there are no errors (warnings are acceptable)
- The validation section is collapsible to avoid cluttering the preview

## Dependencies

- **Depends on:** Story 15.1 (character preview — validation summary appears above/alongside), Phase 1 calculation engine (`validateCharacter()` function), Story 8.1 (wizard shell for step navigation via "Fix" links)
- **Blocks:** Story 15.3 (save is gated by validation)

## Notes

- The validation should map each error/warning to a specific wizard step for the "Fix" link:
  - Race-related issues -> Step 1
  - Class-related issues -> Step 2
  - Ability score issues -> Step 3
  - Background/personality issues -> Step 4
  - Equipment issues -> Step 5
  - Spell issues -> Step 6
- The validation should re-run if the player navigates back, fixes something, and returns to the Review Step
- Consider showing a summary count at the top: "0 errors, 2 warnings" or "3 errors must be fixed"
- When the character is fully valid with no warnings, show a celebratory info message: "Your character is complete and ready for adventure!"
- The collapsible section should default to expanded if there are errors, collapsed if only warnings/info
