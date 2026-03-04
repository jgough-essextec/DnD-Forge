# Story 7.1 — Core Dice Engine

> **Epic 7: Dice Engine** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need a pure-function dice engine that all rolling throughout the app delegates to.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Cryptographic randomness**: All dice rolls must use `crypto.getRandomValues()` for true randomness. This is a Web Crypto API available in all modern browsers. It provides a uniform distribution, which is critical for fair dice simulation. Do NOT use `Math.random()` which is a pseudorandom number generator and not suitable for gaming
- **Uniform distribution**: When rolling a d20, each value 1-20 must have exactly 1/20 probability. The implementation must avoid modulo bias. The correct approach: generate a random integer in a range that is evenly divisible by the die size, then use modulo. Alternatively, use rejection sampling: generate a random value, reject if it falls outside the valid range, retry
- **Die types**: d4 (4-sided), d6 (6-sided), d8 (8-sided), d10 (10-sided), d12 (12-sided), d20 (20-sided), d100 (100-sided, also called percentile die)
- **D&D rolling mechanics**:
  - **Basic roll**: Roll N dice of a given type, sum them, add modifier. E.g., 2d6+3 = roll 2 six-sided dice, sum them, add 3
  - **Drop lowest**: Roll N dice, sort, remove the lowest K, sum remaining. Primary use: 4d6 drop lowest for ability score generation
  - **Advantage**: Roll 2d20, take the higher result, add modifier. Used when the character has a situational advantage
  - **Disadvantage**: Roll 2d20, take the lower result, add modifier. Used when the character has a situational disadvantage
  - **Ability score generation**: Roll 6 sets of 4d6-drop-lowest. Each set produces one ability score (range 3-18, average ~12.2)
  - **Initiative**: Roll 1d20 + DEX modifier + any bonuses. Determines combat turn order
  - **Hit points on level up**: Roll the class hit die + CON modifier. Minimum 1
  - **Starting gold**: Parse a formula like "5d4x10" (roll 5d4, multiply by 10) and compute the result. Monk's formula is "5d4" (no multiplier)

## Tasks
- [ ] **T7.1.1** — Implement `rollDie(sides: number): number` using `crypto.getRandomValues()` — returns 1 to sides inclusive, uniform distribution
- [ ] **T7.1.2** — Implement `rollDice(count: number, sides: number): number[]` — returns array of individual results
- [ ] **T7.1.3** — Implement `rollWithDropLowest(count: number, sides: number, dropCount: number): { rolls: number[]; dropped: number[]; kept: number[]; total: number }` — for 4d6 drop lowest
- [ ] **T7.1.4** — Implement `rollWithAdvantage(sides: number, modifier: number): { roll1: number; roll2: number; used: number; total: number }` — roll 2, take higher
- [ ] **T7.1.5** — Implement `rollWithDisadvantage(sides: number, modifier: number): { roll1: number; roll2: number; used: number; total: number }` — roll 2, take lower
- [ ] **T7.1.6** — Implement `rollAbilityScoreSet(): { scores: { rolls: number[]; dropped: number; total: number }[]; totals: number[] }` — 6 sets of 4d6-drop-lowest
- [ ] **T7.1.7** — Implement `rollInitiative(modifier: number): number` — d20 + modifier
- [ ] **T7.1.8** — Implement `rollHitPoints(hitDie: HitDie, conModifier: number): number` — roll hit die + CON mod, minimum 1
- [ ] **T7.1.9** — Implement `rollStartingGold(diceFormula: string): number` — parse formula like "5d4x10" and roll
- [ ] **T7.1.10** — Write unit tests: distribution test (10,000 d20 rolls should average ~10.5 +/-0.5), drop lowest always drops the minimum value, advantage always returns the higher die, all die types produce values in valid range

## Acceptance Criteria
- `rollDie()` produces values in the range [1, sides] with uniform distribution
- `rollDie()` uses `crypto.getRandomValues()`, NOT `Math.random()`
- `rollDice()` returns an array of the correct length with each value in valid range
- `rollWithDropLowest()` correctly identifies and drops the lowest die/dice, returning separate arrays for dropped and kept values
- `rollWithAdvantage()` returns both d20 rolls, identifies which was used (higher), and adds modifier to produce total
- `rollWithDisadvantage()` returns both d20 rolls, identifies which was used (lower), and adds modifier
- `rollAbilityScoreSet()` produces 6 ability scores, each from 4d6-drop-lowest, with full transparency (all rolls, dropped die, total)
- `rollInitiative()` returns d20 + modifier
- `rollHitPoints()` returns hit die roll + CON modifier, minimum 1 (even if CON modifier is negative)
- `rollStartingGold()` correctly parses and evaluates dice formulas with and without multipliers
- Distribution test: 10,000 d20 rolls average approximately 10.5 (tolerance +/-0.5)
- All die types (d4, d6, d8, d10, d12, d20, d100) produce values in their valid range

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should produce values in range [1, sides] for d4, d6, d8, d10, d12, d20, d100 via rollDie`
- `should use crypto.getRandomValues, not Math.random via rollDie`
- `should return array of correct length with valid values via rollDice`
- `should drop the lowest die and sum remaining via rollWithDropLowest`
- `should return both d20 rolls and use the higher one via rollWithAdvantage`
- `should return both d20 rolls and use the lower one via rollWithDisadvantage`
- `should produce 6 ability scores from 4d6-drop-lowest via rollAbilityScoreSet`
- `should return d20 + modifier via rollInitiative`
- `should return hit die roll + CON mod with minimum 1 via rollHitPoints`
- `should return minimum 1 HP even with negative CON modifier via rollHitPoints`
- `should parse and roll "5d4x10" formula correctly via rollStartingGold`
- `should parse and roll "5d4" (no multiplier) for Monk via rollStartingGold`
- `should produce 10,000 d20 rolls averaging approximately 10.5 (+/-0.5) distribution test`
- `should produce 10,000 ability score rolls averaging approximately 12.2 (+/-0.5) distribution test`
- `should never produce values outside valid range across 10,000 rolls for all die types`

### Test Dependencies
- crypto.getRandomValues must be available in test environment (jsdom or polyfill)
- HitDie type from Story 2.3
- DieType type from Story 2.10

## Identified Gaps

- **Edge Cases**: Modulo bias handling is described in notes but not in acceptance criteria as a testable requirement
- **Edge Cases**: rollStartingGold formula parsing does not specify behavior for invalid formula strings
- **Error Handling**: No specification for rollDie behavior with invalid sides (0, negative, non-integer)

## Dependencies
- **Depends on:** Story 2.3 (HitDie type), Story 2.10 (DieType type)
- **Blocks:** Story 4.1 (ability score rolling), Story 4.3 (initiative rolling), Story 4.6 (starting gold rolling), Story 4.7 (hit die rolling for rest mechanics), Story 6.4 (Dice store delegates to this engine)

## Notes
- **Avoiding modulo bias**: When using `crypto.getRandomValues()` to generate a number in range [1, N], naive `(randomValue % N) + 1` introduces bias when the random value's range is not evenly divisible by N. The proper approach is rejection sampling: generate values until one falls within a range evenly divisible by N. For common die sizes (4, 6, 8, 10, 12, 20, 100), this bias is tiny but should still be handled correctly
- `crypto.getRandomValues()` fills a `Uint32Array` with random 32-bit integers. For a d20: generate a Uint32, compute `value % 20`, reject if the original value was in the biased range (values >= Math.floor(2^32 / 20) * 20), retry. In practice, rejection is extremely rare
- The dice engine is pure functions with no state. The dice store (Story 6.4) adds the state layer (history, labels) on top
- `rollStartingGold` must parse formulas like "5d4x10", "2d4x10", and "5d4" (Monk's special case with no multiplier). A simple regex can extract the count, die size, and optional multiplier: `/(\d+)d(\d+)(?:x(\d+))?/`
- `rollHitPoints` enforces minimum 1 HP gained per level even if a low roll + negative CON modifier would produce 0 or less
- For the distribution test, 10,000 rolls is enough to detect gross bias. The expected average of a d20 is 10.5. With 10,000 samples, the standard error is about 0.058, so the true mean should almost always fall within +/-0.5
- All functions should be in a single file `utils/diceEngine.ts` for easy import and testing
