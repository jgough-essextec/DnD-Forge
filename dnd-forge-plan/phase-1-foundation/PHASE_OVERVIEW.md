# Phase 1: Foundation

## Timeline
Weeks 1-2

## Summary
Establish the complete project scaffolding, type system, SRD game data layer, calculation engine (fully tested), database schema, and basic routing shell — so that Phases 2-6 can build UI and features on a rock-solid foundation.

## Epics in This Phase
| # | Epic | Stories | Description |
|---|------|---------|-------------|
| 1 | Project Scaffolding & Developer Toolchain | 5 | Clean, running project with all dependencies installed, configured, and verified. A developer can run `npm run dev` and see a blank app shell with routing. |
| 2 | Complete Type System | 10 | Every game entity, character field, calculation input/output, and UI state shape defined as TypeScript types/interfaces. Single source of truth for all code. |
| 3 | SRD Game Data Layer | 7 | All D&D 5e Systems Reference Document data structured as static JSON files, importable as typed constants. The game's immutable reference library. |
| 4 | Calculation Engine | 8 | Pure-function calculation module that computes every derived stat from source data. Fully unit tested. Zero UI dependencies. |
| 5 | Database Layer (IndexedDB via Dexie.js) | 4 | Fully functional offline-first persistence layer for characters, campaigns, and preferences with CRUD operations, auto-save, and import/export. |
| 6 | Zustand State Management Stores | 4 | Application-level state management configured with Zustand, including persist middleware for wizard state survival across navigation. |
| 7 | Dice Engine | 1 | Cryptographically random dice rolling engine supporting all D&D dice types, advantage/disadvantage, drop-lowest, and modifiers. |

## Key Deliverables
- Project runs: `npm run dev` shows the app shell with routing to all placeholder pages
- Types compile: Every type file compiles with zero TypeScript errors under strict mode
- Data loads: All SRD JSON files parse correctly and are importable as typed constants
- Calculations pass: 100% of calculation engine unit tests pass (minimum 150 test cases)
- Database works: Character and Campaign CRUD integration tests pass
- Stores function: Zustand stores initialize, update, and persist correctly
- Dice roll: Dice engine produces cryptographically random results with correct distribution
- Test coverage: Calculation engine has >95% line coverage; overall project >80%
- No hardcoded stats: Zero derived values exist as constants; everything flows through the calculation engine

## Pre-Phase Audit Notes

Before breaking Phase 1 into work items, a cross-reference of the technical spec against the D&D 5e rules surfaced the following gaps that must be addressed in the Phase 1 type system and data layer or the downstream phases will hit walls.

### Gap 1 — Armor Class Calculation Complexity (CRITICAL)
The spec says "Base 10 + DEX modifier (unarmored), or armor-specific formula" but does not enumerate the actual formulas. The calculation engine must handle all 14 armor formulas:
- Unarmored (10 + DEX mod)
- Barbarian Unarmored Defense (10 + DEX mod + CON mod)
- Monk Unarmored Defense (10 + DEX mod + WIS mod)
- Light armor: Padded (11 + DEX), Leather (11 + DEX), Studded Leather (12 + DEX)
- Medium armor: Hide (12 + DEX max 2), Chain Shirt (13 + DEX max 2), Scale Mail (14 + DEX max 2), Breastplate (14 + DEX max 2), Half Plate (15 + DEX max 2)
- Heavy armor: Ring Mail (14 flat), Chain Mail (16 flat), Splint (17 flat), Plate (18 flat)
- Shield (+2 add-on to any above)
- Heavy armor without meeting STR requirement reduces speed by 10 feet
- Wearing armor without proficiency causes disadvantage on all STR/DEX ability checks, saves, and attack rolls, and prevents spellcasting

### Gap 2 — Weapon Properties Not Defined
The type system and data layer must account for: Finesse, Versatile, Two-Handed, Light, Heavy, Reach, Thrown, Ammunition, Loading, Special. Weapons also have categories (Simple Melee, Simple Ranged, Martial Melee, Martial Ranged) and damage types (Bludgeoning, Piercing, Slashing).

### Gap 3 — All 14 Standard Conditions Missing
Must be defined as a type enum with descriptions and mechanical effects: Blinded, Charmed, Deafened, Exhaustion (6 levels), Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious.

### Gap 4 — Damage Types & Resistances
Required for racial traits and spell damage: Acid, Bludgeoning, Cold, Fire, Force, Lightning, Necrotic, Piercing, Poison, Psychic, Radiant, Slashing, Thunder. Plus immunity/vulnerability/resistance tracking.

### Gap 5 — Currency System Incomplete
Rates: 1 PP = 10 GP, 1 GP = 2 EP = 10 SP = 100 CP, 1 EP = 5 SP. Starting gold by class also missing.

### Gap 6 — Rest Mechanics Not Specified
Short rest (spend hit dice, Warlock slots recover, some class features recover) and long rest (all HP, half hit dice, all spell slots, all features, reset death saves) must be typed and calculated.

### Gap 7 — Death Save Mechanics
Nuanced rules: d20 with no modifiers at 0 HP, 10+ success, 9- failure, nat 20 = regain 1 HP, nat 1 = 2 failures, 3 successes = stabilize, 3 failures = death.

### Gap 8 — Spellcasting System Variance
Three distinct systems: Prepared Casters (Cleric, Druid, Paladin, Wizard), Known Casters (Bard, Ranger, Sorcerer), and Pact Magic (Warlock).

### Gap 9 — Multiclass Spell Slot Table
Full casters contribute full level, half casters half level (rounded down), third casters one-third level (rounded down), Warlock Pact Magic tracked separately.

### Gap 10 — Passive Scores (Not Just Perception)
Rules also define Passive Insight and Passive Investigation. Formula: 10 + skill modifier. Type system should support passive scores for any skill.

### Gap 11 — Inspiration Mechanic
Binary flag. Granted by DM. When used, grants advantage on one attack roll, saving throw, or ability check.

### Gap 12 — Carrying Capacity & Encumbrance
Carrying Capacity: STR x 15. Push/Drag/Lift: STR x 30. Encumbrance variant: STR x 5 unencumbered, STR x 10 encumbered (-10 speed), over = heavily encumbered. Small creatures halve capacity.

### Gap 13 — Feat Prerequisites
Some feats require minimum ability scores, specific races, or other conditions. The type system needs a `prerequisites` field on feats.

### Gap 14 — Special Class Features Affecting Calculations
Jack of All Trades, Remarkable Athlete, Reliable Talent, Expertise, Fighting Styles, Rage, Unarmored Defense — all alter standard calculations.

### Gap 15 — Spell Schools & Ritual Casting
All 8 schools must be typed. Ritual casting rules: add 10 minutes, don't expend slot. Spell type needs `ritual: boolean`.

### Gap 16 — Concentration
One concentration spell at a time. Damage requires CON save (DC 10 or half damage). Spells need `concentration: boolean`, character needs `activeConcentrationSpell` tracker.

## Dependencies
Phase 1 has no upstream dependencies. All subsequent phases depend on Phase 1.

### Internal Dependency Graph
```
Epic 1 (Scaffolding)
  └── Epic 2 (Types) — cannot write any code without types
       ├── Epic 3 (SRD Data) — data files must conform to types
       │    └── Epic 4 (Calculations) — calculations consume SRD data
       │         └── Epic 5 (Database) — stores Character type
       │              └── Epic 6 (Stores) — stores bridge to database
       └── Epic 7 (Dice Engine) — uses DieType from types, consumed by calculations
```

Parallelizable: Epics 3 and 7 can be worked simultaneously after Epic 2 is complete. Epic 4 depends on both 3 and 7. Epics 5 and 6 are sequential but can begin their type definitions during Epic 2.

## Summary Statistics
| Category | Count |
|----------|-------|
| Epics | 7 |
| Stories | 39 |
| Tasks | ~185 |
| Unit Tests Required | ~150+ test cases |
| Data Files to Create | ~20 JSON/TS files |
| Type Definitions | ~60+ interfaces/types |
| Calculation Functions | ~35+ pure functions |
| Database Functions | ~20+ CRUD operations |
| Zustand Stores | 4 |

## Testing Strategy Summary

| Epic | Unit | Functional | E2E | Total | Gaps Found |
|------|------|-----------|-----|-------|------------|
| 1 — Project Scaffolding | 27 | 13 | 21 | 61 | 5 |
| 2 — Complete Type System | 87 | 0 | 0 | 87 | 5 |
| 3 — SRD Game Data Layer | 67 | 0 | 0 | 67 | 6 |
| 4 — Calculation Engine | 111 | 0 | 0 | 111 | 7 |
| 5 — Database Layer | 44 | 2 | 0 | 46 | 6 |
| 6 — State Management Stores | 38 | 3 | 0 | 41 | 7 |
| 7 — Dice Engine | 15 | 0 | 0 | 15 | 3 |
| **Totals** | **389** | **18** | **21** | **428** | **39** |

### Testing Infrastructure Needed
- **Vitest + jsdom**: Primary test runner for all unit and functional tests (configured in Story 1.4)
- **@testing-library/react + @testing-library/jest-dom**: Component rendering and assertion utilities
- **Playwright**: E2E testing framework for full browser integration tests (Story 1.4 T1.4.7-T1.4.10)
- **fake-indexeddb**: IndexedDB mock for database layer tests in jsdom environment (Epic 5)
- **src/test/utils/renderWithProviders.tsx**: Test render wrapper with all providers (Zustand stores, Router, Theme)
- **src/test/utils/mockStores.ts**: Zustand store mocks for character, wizard, UI, and dice stores
- **src/test/utils/testData.ts**: Character, race, class, and equipment fixture data for consistent test inputs
- **Mock sessionStorage**: For Zustand persist middleware testing in wizard store (Epic 6)
- **Mock window.matchMedia**: For responsive breakpoint testing in UI store (Story 6.3)
- **Timer mocking (vi.useFakeTimers)**: For debounce testing in auto-save (Story 5.4)
- **crypto.getRandomValues**: Must be available or polyfilled in test environment for dice engine tests (Epic 7)
- **Mock calculation engine**: Deterministic mocks for calculation functions in store tests (Epic 6)
