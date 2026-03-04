# Story 3.7 — Reference Tables & Constants

> **Epic 3: SRD Game Data Layer** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need all static game rule tables available as typed constants.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Ability score modifier table**: Maps score to modifier. Formula: `Math.floor((score - 10) / 2)`. Range: score 1 = -5, score 10 = 0, score 20 = +5, score 30 = +10. While the formula is simple, a lookup table ensures consistency
- **Proficiency bonus by level**: Level 1-4 = +2, 5-8 = +3, 9-12 = +4, 13-16 = +5, 17-20 = +6. Formula: `Math.ceil(level / 4) + 1`
- **XP thresholds by level**: Cumulative XP required to reach each level. Level 1 = 0, Level 2 = 300, Level 3 = 900, Level 4 = 2700, Level 5 = 6500, Level 6 = 14000, Level 7 = 23000, Level 8 = 34000, Level 9 = 48000, Level 10 = 64000, Level 11 = 85000, Level 12 = 100000, Level 13 = 120000, Level 14 = 140000, Level 15 = 165000, Level 16 = 195000, Level 17 = 225000, Level 18 = 265000, Level 19 = 305000, Level 20 = 355000
- **Point buy cost table**: Score 8 = 0 points, 9 = 1, 10 = 2, 11 = 3, 12 = 4, 13 = 5, 14 = 7, 15 = 9. Total budget: 27 points. Scores below 8 or above 15 are not allowed in point buy
- **Standard array**: [15, 14, 13, 12, 10, 8] — assigned to any abilities in any order
- **Carrying capacity**: STR score x 15 = max weight in pounds. Push/Drag/Lift: STR x 30
- **Encumbrance thresholds**: STR x 5 = unencumbered limit, STR x 10 = encumbered (-10ft speed), above = heavily encumbered (-20ft speed, disadvantage on ability checks, attacks, and saves using STR/DEX/CON)
- **Currency conversion rates** (all in CP as base unit): PP = 1000 CP, GP = 100 CP, EP = 50 CP, SP = 10 CP, CP = 1 CP
- **Starting gold dice by class**: Barbarian 2d4x10, Bard 5d4x10, Cleric 5d4x10, Druid 2d4x10, Fighter 5d4x10, Monk 5d4, Paladin 5d4x10, Ranger 5d4x10, Rogue 4d4x10, Sorcerer 3d4x10, Warlock 4d4x10, Wizard 4d4x10
- **14 D&D 5e Conditions**: Each condition has a name, description, and mechanical effects:
  - Blinded: Can't see, auto-fail sight checks, attack rolls have disadvantage, attacks against have advantage
  - Charmed: Can't attack charmer, charmer has advantage on social checks
  - Deafened: Can't hear, auto-fail hearing checks
  - Exhaustion: 6 cumulative levels (1: disadvantage on ability checks, 2: speed halved, 3: disadvantage on attacks and saves, 4: HP max halved, 5: speed reduced to 0, 6: death)
  - Frightened: Disadvantage on ability checks and attacks while source in sight, can't willingly move closer
  - Grappled: Speed becomes 0, ends if grappler is incapacitated or moved out of reach
  - Incapacitated: Can't take actions or reactions
  - Invisible: Impossible to see without magic/special sense, attacks have advantage, attacks against have disadvantage
  - Paralyzed: Incapacitated, can't move or speak, auto-fail STR/DEX saves, attacks have advantage, melee hits are crits
  - Petrified: Transformed to stone, weight x10, incapacitated, unaware, attacks have advantage, auto-fail STR/DEX saves, resistance to all damage, immune to poison/disease
  - Poisoned: Disadvantage on attack rolls and ability checks
  - Prone: Disadvantage on attacks, attacks within 5ft have advantage, attacks beyond 5ft have disadvantage, must spend half movement to stand
  - Restrained: Speed 0, attacks have disadvantage, attacks against have advantage, disadvantage on DEX saves
  - Stunned: Incapacitated, can't move, can only speak falteringly, auto-fail STR/DEX saves, attacks against have advantage
  - Unconscious: Incapacitated, can't move/speak, unaware, drop what held, fall prone, auto-fail STR/DEX saves, attacks have advantage, melee hits are crits

## Tasks
- [ ] **T3.7.1** — Create `data/rules.ts` or `utils/constants.ts` containing:
  - Ability score modifier lookup table (score -> modifier)
  - Proficiency bonus by level table (level -> bonus)
  - XP thresholds by level table (level -> cumulative XP)
  - Point buy cost table (score -> cumulative cost)
  - Standard array values [15, 14, 13, 12, 10, 8]
  - Carrying capacity multiplier (15 lbs per STR point)
  - Encumbrance thresholds (STR x 5 and STR x 10)
  - Currency conversion rates (all to CP base)
  - Starting gold dice by class
- [ ] **T3.7.2** — Create `data/conditions.ts` with all 14 conditions, each including: name, description, mechanical effects (listed as bullet points), whether it has levels (exhaustion only)
- [ ] **T3.7.3** — Create `CONDITION_EFFECTS` constant mapping each condition to its mechanical impact on the character (e.g., Blinded -> disadvantage on attack rolls, auto-fail checks requiring sight, attacks against you have advantage)

## Acceptance Criteria
- All reference tables are present and accurate
- Ability score modifier table covers scores 1-30
- XP thresholds match SRD for all 20 levels
- Point buy costs are correct for scores 8-15
- Currency conversion rates are internally consistent
- All 14 conditions are present with complete mechanical effect descriptions
- `CONDITION_EFFECTS` provides structured mechanical data (not just text descriptions) for each condition
- All constants pass TypeScript type checking

## Dependencies
- **Depends on:** Story 2.7 (Condition enum, ConditionInstance), Story 2.4 (Currency, CurrencyAmount)
- **Blocks:** Story 4.1 (Modifier and point buy calculations use reference tables), Story 4.2 (Proficiency bonus table), Story 4.5 (XP threshold table), Story 4.6 (Currency conversion rates)

## Notes
- The ability score modifier can be computed via formula (`Math.floor((score - 10) / 2)`) but a lookup table provides O(1) access and serves as documentation. Both should exist — the table for reference and the formula for the calculation engine
- XP thresholds are not evenly distributed. The jump from level 10 to 11 is 21,000 XP but from level 19 to 20 is 50,000 XP
- Point buy costs increase non-linearly: going from 14 to 15 costs 2 points, while going from 8 to 9 costs 1 point. This makes high scores expensive
- The `CONDITION_EFFECTS` constant should use a structured format (not just strings) so the calculation engine can programmatically apply condition effects. For example: `{ attackRollModifier: 'disadvantage', sightChecks: 'auto-fail' }` for Blinded
- Exhaustion is the only condition with levels. Level 6 exhaustion causes death. The effects are cumulative — a creature at exhaustion level 3 also suffers the effects of levels 1 and 2
