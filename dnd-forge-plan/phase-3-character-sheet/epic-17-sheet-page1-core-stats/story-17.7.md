# Story 17.7 — Hit Dice & Death Saves

> **Epic 17: Character Sheet — Page 1 (Core Stats)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see my total hit dice, track used dice, and record death saving throw successes/failures.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
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

## Dependencies
- Phase 1 dice engine for death save rolls
- Phase 1 Character type system (hit die type per class)
- Epic 20 view/edit mode toggle system

## Notes
- Hit dice are used during short rests to recover HP — full tracking is a Phase 4 feature, but the display and manual adjustment is Phase 3
- Death saves are rare but critical during gameplay — the UI must be clear and unambiguous
- Both hit dice used and death saves are session-tracking fields that start at 0 for new characters (Gap S1)
- The "Roll Death Save" button should use the dice engine with appropriate visual feedback
