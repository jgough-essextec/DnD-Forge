# Story 27.1 — Damage & Healing Input

> **Epic 27: HP Tracker** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player during combat, I need to quickly apply damage or healing to my character with the correct 5e rules for temp HP, overflow damage, and max HP caps. The damage/healing input modal provides a tabbed interface for applying damage (with damage type tracking for resistance/vulnerability) and healing (with stabilization logic), plus a mini-history of recent HP events.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Damage Application Rules (Complete)

**Step-by-step damage application:**
1. Determine raw damage amount
2. Apply resistance (halve, round down) or vulnerability (double) if the character has the relevant trait and a damage type is specified. If immune, damage becomes 0
3. If character has temporary HP > 0: subtract damage from temp HP first
4. Any remaining damage (after temp HP) subtracts from current HP
5. Current HP cannot go below 0 (no negative HP in 5e)
6. **Massive Damage Rule:** If the remaining damage after reaching 0 HP equals or exceeds the character's max HP, the character is **instantly killed** (not just unconscious)
7. If current HP reaches 0 (and not instant death): character falls unconscious, death saves reset to 0 successes / 0 failures

**Damage Types in D&D 5e:**
Acid, Bludgeoning, Cold, Fire, Force, Lightning, Necrotic, Piercing, Poison, Psychic, Radiant, Slashing, Thunder

**Resistance/Vulnerability/Immunity:**
- **Resistance:** Take half damage of that type (round down). Example: 7 fire damage with fire resistance = 3 damage
- **Vulnerability:** Take double damage of that type. Example: 7 fire damage with fire vulnerability = 14 damage
- **Immunity:** Take 0 damage of that type

### D&D 5e Healing Rules
- Healing adds to current HP, capped at max HP (cannot overheal)
- Healing a character at 0 HP: character regains consciousness, resets death saves to 0/0, removes the unconscious condition
- Most healing comes from spells (Cure Wounds, Healing Word), potions, or class features

### Component Enhancement
This story enhances the Phase 3 HP block (`components/character/page1/HitPointBlock.tsx`) with a quick-input overlay modal.

## Tasks

- [ ] **T27.1.1** — Enhance the Phase 3 HP block (`components/character/page1/HitPointBlock.tsx`) with a quick-input overlay. Clicking the HP number (or the +/- buttons) opens an input modal with two tabs: "Take Damage" and "Heal"
- [ ] **T27.1.2** — **Take Damage tab:** numeric input for damage amount, optional damage type dropdown (for resistance/vulnerability tracking), "Apply" button. Below the input, show a real-time preview: "Current: 25 -> After: 18 (7 damage)" or "Current: 25 -> 0 HP (instant death: damage exceeds max HP)" if applicable
- [ ] **T27.1.3** — Damage application logic (strict 5e rules):
  1. If temp HP > 0: subtract damage from temp HP first
  2. Remaining damage (after temp HP absorbed) subtracts from current HP
  3. Current HP cannot go below 0
  4. If remaining damage after reaching 0 HP >= max HP: **instant death** (show dramatic warning modal: "Massive Damage! Your character is killed instantly.")
  5. If current HP reaches 0 (not instant death): character is unconscious, reset death saves to 0/0, show unconscious condition badge
- [ ] **T27.1.4** — **Resistance/Vulnerability:** if a damage type is selected and the character has resistance to that type, auto-halve the damage (round down) and show "(Resisted: half damage)." If vulnerable, auto-double. If immune, set damage to 0 and show "(Immune)"
- [ ] **T27.1.5** — **Heal tab:** numeric input for healing amount. Healing adds to current HP up to max HP. If at 0 HP: healing stabilizes the character, resets death saves, removes unconscious condition. Show preview: "Current: 0 -> After: 8 (stabilized!)"
- [ ] **T27.1.6** — Log each damage/heal event in a mini-history (last 10 events) visible in the HP block: "[-7 slashing] [+12 healing] [-4 fire (resisted from 8)]"
- [ ] **T27.1.7** — Keyboard shortcuts in the HP modal: number keys to input amount, Enter to apply, Tab to switch between Damage/Heal tabs

## Acceptance Criteria

1. Clicking the HP number opens a modal with "Take Damage" and "Heal" tabs
2. Take Damage tab shows numeric input, optional damage type dropdown, and "Apply" button
3. Real-time preview shows HP before/after with correct calculations
4. Damage reduces temp HP first, then current HP, with 0 HP floor
5. Massive damage (remaining >= max HP after reaching 0) triggers instant death warning
6. Reaching 0 HP sets unconscious, resets death saves to 0/0
7. Resistance halves damage (round down), vulnerability doubles, immunity zeroes
8. Heal tab adds HP capped at max HP
9. Healing from 0 HP stabilizes, resets death saves, removes unconscious
10. Mini-history shows last 10 damage/heal events with type annotations
11. Keyboard shortcuts work: numbers for input, Enter to apply, Tab to switch tabs

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should apply damage to temp HP first, then current HP (e.g., 10 temp HP + 30 HP, 15 damage = 0 temp HP, 25 HP)`
- `should clamp current HP at 0 (no negative HP)`
- `should detect massive damage instant death (remaining damage after 0 HP >= max HP)`
- `should halve damage for resistance (round down: 7 fire with resistance = 3)`
- `should double damage for vulnerability (7 fire with vulnerability = 14)`
- `should set damage to 0 for immunity`
- `should cap healing at max HP (cannot overheal)`
- `should reset death saves to 0/0 when healing from 0 HP`
- `should generate correct HP event log entry with damage type annotation`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should open damage/heal modal when HP number is clicked`
- `should render "Take Damage" and "Heal" tabs in the modal`
- `should show real-time preview "Current: 25 -> After: 18 (7 damage)"`
- `should show instant death warning when massive damage applies`
- `should display damage type dropdown with all 13 D&D damage types`
- `should show "(Resisted: half damage)" when damage type matches character resistance`
- `should add HP on heal tab capped at max HP with preview`
- `should show "stabilized!" message when healing from 0 HP`
- `should display mini-history of last 10 damage/heal events`
- `should switch between Damage/Heal tabs with Tab key`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should open HP modal, enter damage amount, select fire damage type with resistance, verify halved damage preview, and apply`
- `should take lethal damage to 0 HP, see unconscious state, then heal to stabilize`
- `should trigger massive damage instant death when remaining damage exceeds max HP`
- `should use keyboard shortcuts: number keys for amount, Enter to apply, Tab to switch tabs`

### Test Dependencies
- Mock character data with known HP, max HP, temp HP, resistances, vulnerabilities, immunities
- Mock Zustand character store for HP state management
- Mock conditions store for unconscious condition badge
- HP event factory for generating test log entries

## Identified Gaps

- **Error Handling**: No specification for non-numeric input in damage/heal fields; behavior when modal is submitted with 0 or negative values
- **Loading/Empty States**: No specification for mini-history when no events exist yet
- **Edge Cases**: Behavior when damage type is not selected but character has resistances; rounding for resistance with odd damage values (e.g., 3 fire with resistance = 1); applying damage when already at 0 HP (should trigger death save failures?)
- **Accessibility**: No ARIA labels for damage/heal modal tabs; no focus management on modal open; screen reader announcement for HP change results
- **Mobile/Responsive**: Modal sizing on small screens not specified; number input behavior on mobile (numeric keyboard)

## Dependencies

- Phase 3 HitPointBlock component (`components/character/page1/HitPointBlock.tsx`)
- Phase 1 character data types (resistance/vulnerability/immunity data)
- Epic 29 (Conditions Tracker) for adding/removing unconscious condition badge

## Notes

- The damage type dropdown is optional -- quick damage without a type is common for speed
- The mini-history is stored on the character object in memory (not persisted long-term)
- The massive damage instant death rule is rare but important to implement correctly
- This modal is also triggered by the Compact HP Widget (Story 27.3)
