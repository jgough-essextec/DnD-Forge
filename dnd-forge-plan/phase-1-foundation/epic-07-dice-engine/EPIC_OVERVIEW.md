# Epic 7: Dice Engine
> **Phase 1: Foundation** (Weeks 1-2)

## Summary
A cryptographically random dice rolling engine that supports all D&D dice types, advantage/disadvantage, drop-lowest, and modifiers.

## Stories
| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 7.1 | Core Dice Engine | 10 | Pure-function dice engine using crypto.getRandomValues() for all rolling: individual dice, multi-dice, drop-lowest, advantage/disadvantage, ability score sets, initiative, hit points, starting gold |

## Technical Scope
- **Randomness:** `crypto.getRandomValues()` for cryptographically secure random numbers with uniform distribution
- **Die types:** d4, d6, d8, d10, d12, d20, d100
- **Features:** Single die rolls, multi-dice rolls, drop-lowest (4d6 drop 1), advantage (2d20 take higher), disadvantage (2d20 take lower), ability score set generation, initiative rolls, HP rolls, starting gold formula parsing
- **Testing:** Distribution tests (10,000 d20 rolls averaging ~10.5), correctness tests for drop-lowest, advantage/disadvantage, valid range enforcement

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 7.1 — Core Dice Engine | 15 | 0 | 0 | 15 |
| **Totals** | **15** | **0** | **0** | **15** |

### Key Gaps Found
- Modulo bias handling described in notes but not testable via acceptance criteria
- Error handling for invalid inputs (rollDie with 0 or negative sides, rollStartingGold with invalid formula) not specified
- crypto.getRandomValues polyfill requirement for test environments not documented

## Dependencies
- **Depends on:** Epic 2 (Type System) — uses DieType and related types
- **Blocks:** Epic 4 (Calculation Engine) — calculation engine delegates random rolls to the dice engine
