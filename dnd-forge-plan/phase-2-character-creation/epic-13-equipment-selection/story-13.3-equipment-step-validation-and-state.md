# Story 13.3 — Equipment Step Validation & State

> **Epic 13: Equipment Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a developer, I need equipment selections persisted and validated with inventory weight calculated. This story implements validation for both equipment modes (starting equipment and gold buy), persists all equipment data to the wizard store, computes carrying capacity and encumbrance, and determines equipped armor/shield for AC calculation.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Validation Requirements**:
  - **Starting Equipment Mode**: All choice groups must have a selection (including drill-down for generic items like "a martial weapon" resolved to a specific weapon)
  - **Gold Buy Mode**: Total cost must not exceed rolled/entered gold
- **Persisted Data**: All selected equipment items (resolved to specific item IDs with quantities), selected armor (for AC), selected weapons (for attack calculations), remaining currency, equipment selection mode used ("starting-equipment" | "gold-buy")
- **Carrying Capacity**: STR score x 15 = max carrying weight in pounds. If total inventory weight exceeds capacity, show encumbrance warning
- **AC Determination**: Based on equipped armor + shield + DEX modifier (with caps per armor type). This feeds into the Review Step's character preview
- **Encumbrance Rules** (optional variant): Over STR x 5 = encumbered (speed -10), Over STR x 10 = heavily encumbered (speed -20, disadvantage on ability checks/attacks/saves using STR/DEX/CON)

## Tasks

- [ ] **T13.3.1** — Implement `validateEquipmentStep()`: in starting equipment mode, all choice groups must have a selection (including drill-down for generic items); in gold buy mode, total cost must not exceed rolled gold
- [ ] **T13.3.2** — Persist to wizard store: all selected equipment items (resolved to specific item IDs with quantities), selected armor, selected weapons, remaining currency, equipment selection mode used
- [ ] **T13.3.3** — Compute and display total inventory weight vs. carrying capacity (STR x 15). Show encumbrance warning if applicable
- [ ] **T13.3.4** — Determine equipped armor and shield for AC calculation in the Review Step

## Acceptance Criteria

- `validateEquipmentStep()` returns errors if any starting equipment choice group is incomplete (including unresolved generic items)
- `validateEquipmentStep()` returns errors if gold buy mode total cost exceeds available gold
- `validateEquipmentStep()` returns `{ valid: true, errors: [] }` when all selections are valid
- All equipment data is persisted to the wizard store (items, armor, weapons, currency, mode)
- Total inventory weight is computed and displayed alongside carrying capacity (STR x 15)
- Encumbrance warning appears if total weight exceeds carrying capacity
- Equipped armor and shield are identified for AC calculation in the Review Step

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should return valid:false when starting equipment choice group is incomplete (including unresolved generic items)`
- `should return valid:false when gold buy mode total cost exceeds available gold`
- `should return valid:true when all selections are valid in starting equipment mode`
- `should return valid:true when all selections are valid in gold buy mode`
- `should compute carrying capacity correctly as STR score x 15`
- `should compute AC correctly from equipped armor + shield + DEX modifier per armor type`
- `should detect encumbrance when total weight exceeds carrying capacity`
- `should handle special AC calculations (Monk unarmored, Barbarian unarmored, Draconic Resilience)`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should persist all equipment data to wizard store (items, armor, weapons, currency, mode)`
- `should display total inventory weight alongside carrying capacity`
- `should show encumbrance warning when weight exceeds STR x 15`
- `should identify equipped armor and shield for AC calculation`

### Test Dependencies
- Mock Zustand wizard store for state persistence testing
- Mock STR/DEX ability scores for carrying capacity and AC computation
- Mock equipment data with weights and armor AC values
- Test fixtures for complete/incomplete equipment selections in both modes

## Identified Gaps

- **Edge Cases**: Recursive validation for nested equipment choices (top-level option valid only if specific weapon chosen) is complex and not fully specified
- **Error Handling**: No specification for handling equipment data with missing weight or cost values
- **Performance**: AC calculation with multiple armor types and class-specific formulas could be complex; no computation time budget specified

## Dependencies

- **Depends on:** Stories 13.1-13.2 (equipment UI must be built), Story 8.1 (wizard shell consumes the validate function), Epic 11 Story 11.6 (STR for carrying capacity, DEX for AC), Phase 1 SRD equipment data, Phase 1 calculation engine
- **Blocks:** Epic 15 Story 15.1 (review uses equipped armor for AC, weapon data for attack section, equipment list for inventory)

## Notes

- **AC Calculation from Armor**:
  - No armor: AC = 10 + DEX mod
  - Light armor: AC = base + DEX mod (leather 11, padded 11, studded leather 12)
  - Medium armor: AC = base + DEX mod (max 2) (hide 12, chain shirt 13, scale mail 14, breastplate 14, half plate 15)
  - Heavy armor: AC = base, no DEX (ring mail 14, chain mail 16, splint 17, plate 18)
  - Shield: +2 AC
  - Monk: AC = 10 + DEX mod + WIS mod (when unarmored)
  - Barbarian: AC = 10 + DEX mod + CON mod (when unarmored)
  - Sorcerer Draconic Bloodline: AC = 13 + DEX mod (when unarmored)
- The validation for starting equipment mode must recursively check nested choices — a top-level option like "(a) a martial weapon and a shield" is only valid if the specific martial weapon has been chosen
- Remaining currency should be tracked in multiple denominations if the player made purchases in silver/copper, but for simplicity, starting gold mode tracks everything in GP
- Weight tracking should include all items: class equipment + background equipment + any purchased items
- The carrying capacity display is informational — exceeding it is a warning, not a blocking error. Some DMs don't enforce encumbrance
