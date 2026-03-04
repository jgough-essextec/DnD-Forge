# Epic 2: Complete Type System
> **Phase 1: Foundation** (Weeks 1-2)

## Summary
Every game entity, character field, calculation input/output, and UI state shape is defined as TypeScript types/interfaces. This is the single source of truth that all code depends on. No component or function gets written without types first.

## Stories
| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 2.1 | Core Ability & Skill Types | 8 | Type-safe representations of abilities, skills, saving throws, passive scores, and alignment |
| 2.2 | Race & Species Types | 8 | Complete type definitions for races including traits, subraces, senses, resistances, and selection choices |
| 2.3 | Class & Subclass Types | 14 | Class types capturing full complexity of features, proficiencies, spell progression, fighting styles, and level advancement |
| 2.4 | Equipment & Inventory Types | 12 | All equipment categories, weapon properties, armor formulas, currency, encumbrance, and inventory management |
| 2.5 | Spell & Spellcasting Types | 11 | Three spellcasting systems (prepared, known, pact magic), spell properties, concentration, ritual casting, multiclass spell slots |
| 2.6 | Background & Personality Types | 4 | Backgrounds and personality/roleplaying system types |
| 2.7 | Condition, Combat & Session Types | 8 | All gameplay-state tracking: conditions, combat, initiative, rests, death saves, speed, attacks |
| 2.8 | Character Master Type | 4 | Complete Character interface aggregating all sub-types into the master entity |
| 2.9 | Campaign & DM Types | 4 | Campaign, session, house rules, and DM note types |
| 2.10 | UI State & Store Types | 6 | Application-level state management types: wizard state, UI state, dice rolls, user preferences, barrel exports |

## Technical Scope
- **Language:** TypeScript with strict mode enabled
- **Patterns:** Union types, discriminated unions, interfaces, enums, const assertions, Record types
- **Domain coverage:** D&D 5e SRD — all 9 races with subraces, 12 classes with subclasses, 18 skills, 6 ability scores, spell system, equipment, backgrounds, feats, conditions
- **Key architectural decisions:** Types must account for all 16 audit gaps identified in the pre-phase audit (AC formulas, weapon properties, conditions, damage types, currency, rests, death saves, spellcasting variants, multiclass spell slots, passive scores, inspiration, carrying capacity, feat prerequisites, special class features, spell schools, concentration)

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 2.1 — Core Ability & Skill Types | 10 | 0 | 0 | 10 |
| 2.2 — Race & Species Types | 8 | 0 | 0 | 8 |
| 2.3 — Class & Subclass Types | 10 | 0 | 0 | 10 |
| 2.4 — Equipment & Inventory Types | 10 | 0 | 0 | 10 |
| 2.5 — Spell & Spellcasting Types | 10 | 0 | 0 | 10 |
| 2.6 — Background & Personality Types | 7 | 0 | 0 | 7 |
| 2.7 — Condition, Combat & Session Types | 8 | 0 | 0 | 8 |
| 2.8 — Character Master Type | 10 | 0 | 0 | 10 |
| 2.9 — Campaign & DM Types | 6 | 0 | 0 | 6 |
| 2.10 — UI State & Store Types | 8 | 0 | 0 | 8 |
| **Totals** | **87** | **0** | **0** | **87** |

### Key Gaps Found
- MechanicalEffect type defined in Story 2.3 but consumed by Story 2.2 (Race types) — potential circular dependency; should be in shared types file
- DieType definition location ambiguous between Story 2.10 and shared types
- WizardState.equipmentSelections typed as `any[]` bypasses type safety
- EquipmentItem.properties uses `Record<string, any>` as catch-all
- Several types use loose string typing where union types would be safer (UserPreferences.defaultAbilityScoreMethod, Campaign.joinCode)

## Dependencies
- **Depends on:** Epic 1 (Project Scaffolding) — needs TypeScript configured with strict mode and path aliases
- **Blocks:** Epic 3 (SRD Data), Epic 4 (Calculation Engine), Epic 5 (Database), Epic 6 (Stores), Epic 7 (Dice Engine) — all code depends on these types
