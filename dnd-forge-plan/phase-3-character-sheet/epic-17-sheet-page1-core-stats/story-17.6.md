# Story 17.6 — Hit Points Block

> **Epic 17: Character Sheet — Page 1 (Core Stats)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see and track my HP max, current HP, and temporary HP, with a clear visual indicator of my health status.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **HP Block Position**: Below combat stats row in the center column
- **Max HP Computation**: Hit die max + CON modifier at level 1, plus per-level additions for higher levels. Calculation engine handles this
- **Current HP**: Always editable even in view mode since HP changes constantly during play. Starts equal to Max HP for new characters
- **Temp HP**: Separate from current HP. Don't stack — only the higher value applies (per 5e rules). Damage applies to temp HP first
- **Empty State Handling**: Current HP = Max HP, Temp HP = 0 at character creation. Must display these initial states gracefully
- **Color Gradient for Health**: Green (75-100%), yellow (25-74%), red (1-24%), black with skull icon (0 HP)

## Tasks
- [ ] **T17.6.1** — Create `components/character/page1/HitPointBlock.tsx` — the HP section below combat stats. Three HP fields: Max HP (computed, displayed at top), Current HP (large editable field in center), Temp HP (smaller field below)
- [ ] **T17.6.2** — Max HP: computed by the calculation engine (hit die max + CON mod at level 1, plus per-level additions). Tooltip shows breakdown. **Edit mode:** allow manual override for house rules or Tough feat adjustments
- [ ] **T17.6.3** — Current HP: always editable (even in view mode since HP changes constantly during play). Display as a large number with a color gradient: green (75-100%), yellow (25-74%), red (1-24%), black with skull icon (0). Include quick-adjust buttons: "-" (take damage) and "+" (heal) that open a numeric input modal
- [ ] **T17.6.4** — Temp HP: editable field. Temp HP don't stack (only the higher value applies) — enforce this with a tooltip note. Display as a separate number in a blue-tinted box. When temp HP is present, show it as a "shield" over the current HP
- [ ] **T17.6.5** — HP bar: a slim horizontal bar below the numbers showing current HP as a percentage of max. Color matches the gradient (green to yellow to red)
- [ ] **T17.6.6** — Quick damage/heal modal: when clicking the -/+ buttons, show a small popup with a numeric input and "Apply" button. Damage applies to temp HP first, then current HP (per 5e rules). Healing cannot exceed max HP. Log the change in a mini-history (last 5 changes visible)

## Acceptance Criteria
- Max HP displays correctly computed from class hit die and CON modifier
- Max HP tooltip shows the full computation breakdown
- Current HP is always editable with quick-adjust +/- buttons
- Current HP color changes based on health percentage (green/yellow/red/black)
- Temp HP displays in a blue-tinted box and doesn't stack (enforced)
- HP bar shows current HP as a percentage of max with matching color gradient
- Quick damage/heal modal correctly applies damage to temp HP first, then current HP
- Healing cannot exceed max HP
- Mini-history shows last 5 HP changes
- Edit mode allows manual override of Max HP

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compute Max HP as hit die max + CON modifier at level 1`
- `should compute health percentage as (currentHP / maxHP) * 100`
- `should determine color tier: green (75-100%), yellow (25-74%), red (1-24%), black (0)`
- `should apply damage to temp HP first, then current HP per 5e rules`
- `should cap healing so current HP does not exceed max HP`
- `should enforce temp HP non-stacking rule (only higher value applies)`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render Max HP, Current HP, and Temp HP fields in the HP block`
- `should display Max HP tooltip with computation breakdown`
- `should always allow Current HP editing even in view mode`
- `should change Current HP color based on health percentage (green/yellow/red/black)`
- `should display skull icon at 0 HP`
- `should render HP bar showing current HP as percentage of max with matching color`
- `should display Temp HP in a blue-tinted box`
- `should show +/- quick-adjust buttons for Current HP`
- `should open damage/heal modal when clicking +/- buttons`
- `should apply damage correctly through temp HP then current HP in the modal`
- `should display mini-history of last 5 HP changes`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should take damage via quick-adjust modal, see temp HP reduce first, then current HP, with color change and history update`

### Test Dependencies
- Mock character data with various HP states (full, partial, low, zero)
- Mock character data with temp HP active
- Mock calculation engine for Max HP computation
- Mock view/edit mode context

## Identified Gaps

- **Error Handling**: No specification for negative HP input or HP values exceeding max in the damage/heal modal
- **Loading/Empty States**: Initial state (Current HP = Max HP, Temp HP = 0) is mentioned but no visual treatment for "full health" distinguished from "empty/unset"
- **Accessibility**: No ARIA labels for HP fields, no screen reader announcement for HP color changes, no keyboard shortcuts for quick-adjust buttons
- **Performance**: Mini-history is session-only but no specification for history persistence across tab refreshes

## Dependencies
- Story 17.2 (Ability Score Blocks) — HP max depends on CON modifier
- Phase 1 calculation engine for Max HP computation
- Epic 20 view/edit mode toggle system (though current HP is always editable)

## Notes
- Current HP is one of the most frequently changed values during gameplay — the quick damage/heal modal must be fast and intuitive
- At character creation, Current HP equals Max HP and Temp HP is 0
- The HP block is a critical "empty state" case from Gap S1: these fields exist at level 1 but Temp HP starts at 0
- The mini-history is session-only (not persisted to IndexedDB) — it helps players track what just happened
