# Story 4.1 — Ability Score Calculations

> **Epic 4: Calculation Engine** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need functions to compute modifiers, apply racial bonuses, and validate ability score generation methods.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Calculation engine architecture**: Pure functions with no side effects, no UI dependencies, no state management. Functions take data in and return computed results. Fully unit tested with >95% line coverage
- **Ability score modifier formula**: `Math.floor((score - 10) / 2)`. This produces: score 1 = -5, score 8 = -1, score 10 = 0, score 12 = +1, score 14 = +2, score 16 = +3, score 18 = +4, score 20 = +5
- **Ability score cap**: Standard cap is 20. The Barbarian level 20 capstone feature (Primal Champion) raises STR and CON maximum to 24. Some magic items can raise scores beyond 20. The `getTotalAbilityScore` function must accept an optional cap override
- **Score sources**: Base score + racial bonus + ASI bonus + feat bonus + misc bonus = total score (capped)
- **Standard array**: [15, 14, 13, 12, 10, 8] — must be used as a permutation (each value exactly once). Validation must check that the provided values are exactly these 6 numbers in any order
- **Point buy**: Budget of 27 points. Scores range from 8 to 15. Cost table: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9. Validation must check total cost <= 27 and all scores in range
- **Rolled scores**: Roll 4d6, drop the lowest die, sum remaining 3. Uses `crypto.getRandomValues()` for true randomness. Must return individual rolls, the dropped die, and the total for transparency
- **Effective ability scores**: The `getEffectiveAbilityScores` function takes a full Character and computes final scores by applying all bonuses (racial from race selection, ASI from level progression, feat bonuses from selected feats, any other bonuses) to the base scores

## Tasks
- [ ] **T4.1.1** — Implement `getModifier(score: number): number` — `Math.floor((score - 10) / 2)`
- [ ] **T4.1.2** — Implement `getTotalAbilityScore(base: number, racialBonus: number, asiBonus: number, featBonus: number, miscBonus: number): number` — capped at 20 (unless feature overrides, e.g., Barbarian capstone goes to 24)
- [ ] **T4.1.3** — Implement `getEffectiveAbilityScores(character: Character): AbilityScores` — applies all bonuses to base scores
- [ ] **T4.1.4** — Implement `validateStandardArray(assignments: number[]): boolean` — must be a permutation of [15, 14, 13, 12, 10, 8]
- [ ] **T4.1.5** — Implement `validatePointBuy(scores: AbilityScores): { valid: boolean; pointsUsed: number; pointsRemaining: number }` — each score 8-15, total cost <= 27
- [ ] **T4.1.6** — Implement `getPointBuyCost(score: number): number` — lookup from cost table
- [ ] **T4.1.7** — Implement `rollAbilityScore(): { rolls: number[]; dropped: number; total: number }` — roll 4d6, drop lowest, using `crypto.getRandomValues`
- [ ] **T4.1.8** — Write unit tests: modifier table (score 1 -> -5, 10 -> 0, 18 -> +4, 20 -> +5), point buy boundary cases, standard array validation (valid and invalid permutations), 10,000-roll distribution sanity check

## Acceptance Criteria
- `getModifier()` returns correct values for all scores 1-30
- `getTotalAbilityScore()` caps at 20 by default and respects the optional cap override
- `getEffectiveAbilityScores()` correctly sums base + racial + ASI + feat + misc bonuses for all 6 abilities
- `validateStandardArray()` accepts valid permutations and rejects invalid ones (wrong values, duplicates, missing values)
- `validatePointBuy()` correctly calculates point cost and reports remaining budget
- `getPointBuyCost()` returns correct cost for scores 8-15 and rejects out-of-range scores
- `rollAbilityScore()` returns 4 rolls, identifies the dropped die (lowest), and sums the kept 3
- Unit tests cover: modifier table boundary values, point buy exact budget (27 points), point buy over budget, standard array with valid/invalid permutations, rolled score distribution check (10,000 rolls averaging ~12.2)

## Dependencies
- **Depends on:** Story 2.1 (AbilityName, AbilityScores types), Story 2.8 (Character type), Story 3.7 (point buy cost table, standard array constant), Story 7.1 (dice engine for rollAbilityScore)
- **Blocks:** Story 4.2 (skill calculations use ability modifiers), Story 4.3 (combat calculations use ability modifiers), Story 4.4 (spellcasting uses ability modifiers)

## Notes
- The 10,000-roll distribution test should verify that the average of 4d6-drop-lowest is approximately 12.2 (the mathematical expected value). Allow a tolerance of +/-0.5 for statistical variation
- `rollAbilityScore` delegates to the dice engine (Story 7.1) for the actual random number generation. If the dice engine is not yet available, this function can be implemented with `crypto.getRandomValues()` directly and refactored later
- The Barbarian Primal Champion feature (level 20) raises the maximum for STR and CON to 24, not just the current score. This means `getTotalAbilityScore` needs to know the cap, which varies by character. The function should accept an optional `maxScore` parameter defaulting to 20
- Point buy validation should return both `pointsUsed` and `pointsRemaining` to support the UI showing a live budget counter during ability score assignment
