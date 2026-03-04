# Epic 4: Calculation Engine
> **Phase 1: Foundation** (Weeks 1-2)

## Summary
A pure-function calculation module that computes every derived stat from source data. Fully unit tested. Zero UI dependencies. This is the mathematical brain of the application.

## Stories
| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 4.1 | Ability Score Calculations | 8 | Compute modifiers, apply racial bonuses, validate ability score generation methods (standard array, point buy, rolled) |
| 4.2 | Proficiency & Skill Calculations | 7 | Proficiency bonus, skill modifiers, saving throws, passive scores with Jack of All Trades and Expertise support |
| 4.3 | Combat Stat Calculations | 9 | AC (all 14 armor formulas), initiative, speed, HP, hit dice, attack bonus, weapon damage, encumbrance |
| 4.4 | Spellcasting Calculations | 7 | Spell save DC, spell attack bonus, spell slots (including multiclass), cantrips known, spells prepared, pact magic |
| 4.5 | Level Up Calculations | 5 | Determine what a character gains at each new level: HP, features, subclass, ASI, spell slots, proficiency changes |
| 4.6 | Currency & Inventory Calculations | 5 | Currency conversion, total wealth, inventory weight tracking, starting gold rolls |
| 4.7 | Rest Mechanics | 3 | Compute what recovers on short rests (hit dice, Warlock slots, class features) and long rests (all HP, spell slots, etc.) |
| 4.8 | Character Validation | 3 | Validate character for completeness and rule compliance with error/warning classification |

## Technical Scope
- **Architecture:** Pure functions with no side effects, no UI dependencies, no state management
- **Testing:** Minimum 150 test cases, >95% line coverage
- **Key complexity:** 14 armor class formulas, multiclass spell slot calculation, three distinct spellcasting systems, class features that alter standard calculations (Jack of All Trades, Expertise, Reliable Talent, Fighting Styles)
- **D&D 5e rules:** All calculations must be SRD-accurate including edge cases
- **Dependencies consumed:** Epic 2 types, Epic 3 SRD data, Epic 7 dice engine (for random rolls)

## Dependencies
- **Depends on:** Epic 2 (Type System), Epic 3 (SRD Data), Epic 7 (Dice Engine)
- **Blocks:** Epic 5 (Database Layer) — stores calculated Character data; Epic 6 (Stores) — stores trigger recalculations
