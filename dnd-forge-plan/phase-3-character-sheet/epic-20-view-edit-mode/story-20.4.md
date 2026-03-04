# Story 20.4 — Cascade Recalculation on Edit

> **Epic 20: View / Edit Mode Toggle System** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a developer, I need every edit to trigger the appropriate recalculations so derived stats are always accurate.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
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

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should map ability score changes to dependent values (modifier, related saves, skills, AC, HP, spell DC, attacks)`
- `should map level changes to dependent values (proficiency bonus, HP max, spell slots)`
- `should map equipment changes to dependent values (AC, attack table, inventory weight)`
- `should map spell list changes to spell page data only`
- `should debounce recalculation at 300ms`
- `should run recalculation on field blur event`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should recalculate all dependent values when an ability score changes`
- `should recalculate proficiency-dependent values when level changes`
- `should recalculate AC and attack table when equipment changes`
- `should not recalculate AC when spell list changes (partial recalc)`
- `should flash changed derived values with gold highlight (300ms fade)`
- `should debounce recalculation (not fire on every keystroke)`
- `should run recalculation on field blur`

### Test Dependencies
- Mock Phase 1 calculation engine with known input/output mappings
- Mock character data for testing cascade effects
- Mock debounce timer (use fake timers)
- Mock view/edit mode context

## Identified Gaps

- **Performance**: No specification for maximum acceptable recalculation time (latency budget)
- **Error Handling**: No specification for what happens if the calculation engine throws an error during recalculation
- **Edge Cases**: No specification for simultaneous changes to multiple fields within the same debounce window

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
