# Story 6.4 — Dice Store

> **Epic 6: Zustand State Management Stores** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need a store for dice roll history and configuration.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Dice store purpose**: Manages dice roll history and provides a high-level `roll()` action that delegates to the dice engine (Epic 7). The store maintains a history of rolls for review and enables rolling from anywhere in the app
- **Store state shape**:
  - `rolls: DiceRoll[]` — history of recent rolls, most recent first
  - `maxHistory: number` — maximum number of rolls to keep in history (default: 50). When exceeded, oldest rolls are dropped
- **DiceRoll interface** (from Story 2.10): `{ id: string; dice: { type: DieType; count: number }[]; results: number[]; modifier: number; total: number; label?: string; advantage?: boolean; disadvantage?: boolean; timestamp: Date }`
- **Die types**: d4, d6, d8, d10, d12, d20, d100 — the 7 standard D&D dice
- **Advantage/Disadvantage**: When rolling with advantage, roll 2d20 and take the higher result. When rolling with disadvantage, roll 2d20 and take the lower result. These are mutually exclusive — if both would apply, they cancel out (roll normally)
- **Roll labels**: Optional labels describe what the roll is for (e.g., "Attack Roll", "Perception Check", "Fireball Damage"). This helps interpret the roll history
- **History management**: The roll history is kept in memory (not persisted to database). When it exceeds `maxHistory`, the oldest entries are removed

## Tasks
- [ ] **T6.4.1** — Create `stores/diceStore.ts` with state: `{ rolls: DiceRoll[]; maxHistory: number }`
- [ ] **T6.4.2** — Implement `roll(dice: { type: DieType; count: number }[], modifier: number, label?: string, advantage?: boolean, disadvantage?: boolean): DiceRoll`
- [ ] **T6.4.3** — Implement `clearHistory()` and `removeRoll(id)`
- [ ] **T6.4.4** — Write tests: roll produces valid results within die range, advantage takes higher of 2d20, disadvantage takes lower, history accumulates and truncates at maxHistory

## Acceptance Criteria
- The dice store initializes with empty roll history and default maxHistory of 50
- `roll()` delegates to the dice engine for random number generation and returns a complete `DiceRoll` object
- `roll()` adds the result to the front of the roll history
- When advantage is true, the roll uses 2d20 and takes the higher result
- When disadvantage is true, the roll uses 2d20 and takes the lower result
- When both advantage and disadvantage are true, they cancel out and a normal roll is made
- Roll results include the individual die results, modifier, total, optional label, and timestamp
- Roll history is capped at `maxHistory` entries (oldest removed when exceeded)
- `clearHistory()` empties the roll history
- `removeRoll(id)` removes a specific roll from history
- Tests verify result ranges, advantage/disadvantage mechanics, and history management

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should initialize with empty roll history and maxHistory of 50`
- `should produce valid DiceRoll result within die range via roll`
- `should add roll result to front of history via roll`
- `should take higher of 2d20 when advantage is true via roll`
- `should take lower of 2d20 when disadvantage is true via roll`
- `should cancel out advantage and disadvantage (roll normally) when both true via roll`
- `should include individual die results, modifier, total, label, and timestamp in roll result`
- `should truncate history at maxHistory (remove oldest when exceeded)`
- `should clear all roll history via clearHistory`
- `should remove specific roll by ID via removeRoll`

### Test Dependencies
- Mock dice engine from Story 7.1 for deterministic testing
- DiceRoll, DieType types from Story 2.10

## Identified Gaps

- **Edge Cases**: Advantage/disadvantage results array should contain both d20 values for transparency but this is mentioned in notes only
- **Edge Cases**: No specification for roll behavior with empty dice array

## Dependencies
- **Depends on:** Story 2.10 (DiceRoll, DieType types), Story 7.1 (dice engine for actual random number generation)
- **Blocks:** Phase 2+ Dice Roller UI, character sheet roll actions

## Notes
- The `roll()` action is the primary interface for all rolling in the app. Components should call this rather than using the dice engine directly, so all rolls are tracked in history
- The dice engine (Story 7.1) provides the raw random number generation. The dice store provides the application-level wrapper (history, labels, advantage/disadvantage logic)
- Advantage/disadvantage on d20 rolls is the most common case, but the dice array supports any combination (e.g., 2d6+1d8 for mixed damage, 4d6 for ability scores)
- When rolling with advantage, the `results` array should contain both d20 results (for transparency) and the `total` should reflect only the higher one + modifier
- The `id` field on each DiceRoll should be a UUID generated at roll time, enabling `removeRoll()` to target specific entries
- Consider adding a `rollWithPredefined()` action for common roll types: attack roll (1d20 + modifier), damage roll (dice from weapon), ability check (1d20 + modifier), saving throw (1d20 + modifier)
- Roll history is intentionally NOT persisted. It's session-only data that would clutter the database. If a user wants to save a roll, that would be a different feature
