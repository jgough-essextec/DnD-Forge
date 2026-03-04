# Story 20.4 — Cascade Recalculation on Edit

> **Epic 20: View / Edit Mode Toggle System** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a developer, I need every edit to trigger the appropriate recalculations so derived stats are always accurate.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Cascade Recalculation (Gap S2)**: Editing a core value triggers many derived value updates:
  - Changing STR: STR modifier, STR save, Athletics, melee attack bonuses, melee damage, carrying capacity, encumbrance
  - Changing DEX: DEX modifier, DEX save, Acrobatics/Stealth/Sleight of Hand, AC (if applicable), initiative, ranged attack bonuses
  - Changing CON: CON modifier, CON save, Max HP (recalculate per level: +1 HP per level), concentration save
  - Changing INT/WIS/CHA: respective modifier, saves, related skills, spell save DC (if spellcasting ability), spell attack bonus
  - Changing level: proficiency bonus, HP max, spell slots, all proficiency-dependent values
  - Changing equipment: AC (armor/shield), attack table, inventory weight
  - Changing spells: spell page data only
- **Debounced Recalculation**: Run on field blur, after 300ms of inactivity, or on explicit "Recalculate" button press. Not on every keystroke
- **Visual Feedback**: Changed derived values flash with gold highlight (300ms fade)

## Tasks
- [ ] **T20.4.1** — Create a `useCharacterCalculations` hook that wraps the Phase 1 calculation engine. Input: the mutable character data. Output: all computed derived values (AC, initiative, all skill modifiers, all save modifiers, spell save DC, attack bonuses, HP max, passive scores, carrying capacity, spell attack bonus). Recalculates on every character data change
- [ ] **T20.4.2** — Implement a dependency map for efficient partial recalculation:
  - Ability score change -> recalc: modifier, related saves, related skills, AC (if DEX), HP max (if CON), spell DC (if spellcasting ability), all attack bonuses
  - Level change -> recalc: proficiency bonus, HP max, spell slots, all proficiency-dependent values
  - Equipment change -> recalc: AC (if armor/shield), attack table, inventory weight
  - Spell list change -> recalc: spell page data only
- [ ] **T20.4.3** — Performance guard: debounce recalculation to avoid running the full engine on every keystroke. Run on field blur, after 300ms of inactivity, or on explicit "Recalculate" button press
- [ ] **T20.4.4** — Visual feedback on recalculation: when a derived value changes, briefly flash the new value with a gold highlight (300ms fade) so the player notices the change

## Acceptance Criteria
- `useCharacterCalculations` hook correctly computes all derived values from character data
- Changing an ability score triggers recalculation of all dependent values (saves, skills, AC, HP, attacks, etc.)
- Changing level triggers recalculation of proficiency bonus and all proficiency-dependent values
- Changing equipment triggers AC and attack table recalculation
- Recalculation is debounced at 300ms (not on every keystroke)
- Recalculation runs on field blur and after 300ms of inactivity
- Changed derived values flash with a gold highlight (300ms fade)
- Dependency map ensures efficient partial recalculation (not full recalc on every change)

## Dependencies
- Phase 1 calculation engine (the core computation logic)
- Story 20.1 (Mode Toggle) — recalculation runs in edit mode
- Story 20.2 (Auto-Save) — recalculated values are saved with the character

## Notes
- The Phase 1 calculation engine does the actual math; this hook wraps it with React reactivity and debouncing
- The dependency map is an optimization — if a spell list changes, there's no need to recalculate AC or carrying capacity
- The 300ms debounce is separate from the 500ms auto-save debounce — recalculation should feel responsive while auto-save can be slightly delayed
- Visual feedback (gold flash) helps players understand the cascade effects of their edits
- Full recalculation as a fallback is acceptable — the dependency map is an optimization, not a requirement
