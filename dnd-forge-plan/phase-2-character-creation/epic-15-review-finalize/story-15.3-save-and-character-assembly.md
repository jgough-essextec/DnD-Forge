# Story 15.3 — Save & Character Assembly

> **Epic 15: Review & Finalize Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to save my completed character and be taken to the character sheet view. This story implements the character assembly from wizard state, IndexedDB save via Dexie.js, success celebration animation, save-and-create-another workflow, and error handling for save failures.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Character Assembly**: The wizard store's `finalize()` method assembles a complete `Character` object from all wizard state:
  - Race + subrace + all race choices (ancestry, skills, cantrip, feat, languages)
  - Class + subclass + skills + fighting style
  - Ability scores (base + racial + method + raw rolls)
  - Background + personality + description + alignment
  - Equipment (items, armor, weapons, currency)
  - Spells (cantrips, known/spellbook, prepared)
  - All derived stats computed by the calculation engine
- **Database Save**: `createCharacter()` from the Phase 1 Dexie.js database layer writes the Character object to IndexedDB
- **Post-Save Navigation**: Navigate to the character sheet view at `/character/:id` using React Router
- **Session Cleanup**: Clear the wizard store (reset sessionStorage) after successful save
- **Success Celebration**: Confetti animation or themed "Your adventurer is ready!" splash screen

## Tasks

- [ ] **T15.3.1** — Implement the "Save Character" action: calls the wizard store's `finalize()` method which assembles a complete `Character` object from all wizard state, runs the calculation engine to compute all derived stats, and calls `createCharacter()` from the database layer
- [ ] **T15.3.2** — Show a saving animation/progress indicator while the character is being written to IndexedDB
- [ ] **T15.3.3** — On successful save: clear the wizard store (reset session), show a success celebration (confetti animation or themed "Your adventurer is ready!" splash), and navigate to the character sheet view (`/character/:id`)
- [ ] **T15.3.4** — Implement "Save & Create Another" button that saves the character and returns to the wizard Intro Step with a fresh state
- [ ] **T15.3.5** — Implement "Go Back & Edit" button that keeps the review open for further changes without saving yet
- [ ] **T15.3.6** — Handle save errors gracefully: if IndexedDB write fails, show an error message with a retry option and suggest exporting as JSON as a backup

## Acceptance Criteria

- "Save Character" assembles a complete Character object from wizard state and computes all derived stats
- The Character object is written to IndexedDB via `createCharacter()`
- A saving animation/progress indicator is shown during the write
- On success: wizard store is cleared, success celebration is shown, and navigation goes to `/character/:id`
- "Save & Create Another" saves the character and returns to the Intro Step with fresh state
- "Go Back & Edit" keeps the review open without saving
- Save errors show a user-friendly message with retry and JSON export fallback options

## Dependencies

- **Depends on:** Story 15.1 (character preview provides the data to save), Story 15.2 (validation must pass before save is enabled), Phase 1 calculation engine (for derived stat computation), Phase 1 Dexie.js database layer (`createCharacter()`), Phase 1 Zustand wizard store (`finalize()` method), React Router (for navigation to `/character/:id`)
- **Blocks:** Nothing — this is the final action in the wizard flow

## Notes

- **Character Object Structure**: The assembled Character object should match the Phase 1 type system's `Character` interface, including:
  - id (auto-generated UUID)
  - name, playerName
  - race, subrace, class, subclass, level (1), background
  - abilityScores, abilityModifiers, savingThrows, skills
  - hp, ac, initiative, speed, proficiencyBonus
  - equipment, weapons, armor, currency
  - spells (cantrips, known, prepared, slots)
  - personality (traits, ideals, bonds, flaws), alignment
  - features (racial + class + background + feat)
  - description (age, height, weight, etc.), backstory, allies
  - metadata (createdAt, updatedAt, creationMethod)
- The success celebration should be thematic — consider a "Your adventurer is ready for their journey!" splash with the character's name, race, and class displayed prominently
- IndexedDB write failures are rare but possible (storage quota exceeded, private browsing restrictions). The JSON export fallback ensures the player doesn't lose their work
- "Save & Create Another" should fully clear all wizard state before showing the Intro Step — no lingering data from the previous character
- Consider auto-saving the character name in the success splash: "Tharion the High Elf Wizard is ready for adventure!"
