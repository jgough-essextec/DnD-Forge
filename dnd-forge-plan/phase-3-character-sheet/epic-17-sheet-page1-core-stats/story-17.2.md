# Story 17.2 — Ability Score Blocks (Left Column)

> **Epic 17: Character Sheet — Page 1 (Core Stats)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see my six ability scores with their modifiers in the classic vertical layout, with the modifier prominently displayed and the base score in a smaller circle.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Left Column Layout**: ~30% width on desktop, contains ability score blocks vertically, followed by saving throws and skills
- **AbilityScoreDisplay**: Shared component from Phase 2 (Story 16.3) that renders a single ability score block
- **Calculation Engine**: Computes ability modifiers from base scores and racial bonuses. Modifier = floor((score - 10) / 2)
- **Edit Mode Recalculation**: Changing a base ability score triggers cascade recalculation of modifier, related saves, related skills, AC (if DEX), HP max (if CON), spell DC (if spellcasting ability), all attack bonuses
- **Font**: Cinzel bold for modifier display, accent-gold for positive modifiers, accent-red for negative

## Tasks
- [ ] **T17.2.1** — Create `components/character/page1/AbilityScoreColumn.tsx` — renders 6 ability score blocks vertically in the left column. Each block uses the `AbilityScoreDisplay` shared component (from Phase 2, Story 16.3)
- [ ] **T17.2.2** — Each ability block shows: ability abbreviation label (STR, DEX, etc.) at top, large modifier value in the center (e.g., "+3" in bold Cinzel, accent-gold for positive, accent-red for negative), base total score in a smaller circle below (e.g., "16"), and a subtle tooltip showing the breakdown: "Base 14 + Racial +2 = 16 (Modifier: +3)"
- [ ] **T17.2.3** — **Edit mode:** clicking an ability score opens an inline numeric editor for the base score (before racial bonuses). The modifier and total auto-recalculate in real-time. Show the racial bonus as a non-editable "+N" badge
- [ ] **T17.2.4** — Add a compact "Inspiration" toggle at the top of the left column — a single checkbox or diamond icon that toggles between filled (has inspiration) and empty. Tooltip explains: "Inspiration lets you reroll one ability check, saving throw, or attack roll"

## Acceptance Criteria
- Six ability score blocks (STR, DEX, CON, INT, WIS, CHA) render vertically in the left column
- Each block prominently displays the modifier with the base score in a smaller circle
- Positive modifiers are accent-gold, negative modifiers are accent-red
- Tooltips show the full breakdown (base + racial bonus = total, modifier)
- Edit mode allows changing the base score with real-time recalculation of modifier and total
- Racial bonuses display as non-editable badges in edit mode
- Inspiration toggle is present at the top of the left column
- Layout matches the classic D&D 5e sheet ability score arrangement

## Dependencies
- Phase 1 calculation engine for modifier computation
- Phase 2 AbilityScoreDisplay shared component
- Epic 20 view/edit mode toggle system
- Epic 20 cascade recalculation (Story 20.4) for real-time updates

## Notes
- Changing an ability score has widespread cascade effects: STR affects Athletics, melee attacks, carrying capacity; DEX affects AC, initiative, multiple skills, ranged attacks; CON affects HP max; INT/WIS/CHA affect spellcasting for respective classes
- The Inspiration toggle is a simple boolean on the character model — it does not trigger recalculation
