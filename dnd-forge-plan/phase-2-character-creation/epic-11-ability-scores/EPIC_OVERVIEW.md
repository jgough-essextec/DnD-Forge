# Epic 11: Ability Score Step
> **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Summary

Three distinct ability score generation methods -- Standard Array (drag-and-drop), Point Buy (interactive sliders), and Rolling (animated dice) -- each producing six ability scores that the player assigns to the six abilities, with racial bonuses clearly displayed. Includes smart recommendations based on class primary abilities, derived stat previews, and a clear summary with gameplay implications.

## Stories

| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 11.1 | Method Selection | 6 | Three method tabs/cards (Standard Array, Point Buy, Rolling) with descriptions, house rule support, method switching with confirmation |
| 11.2 | Standard Array Assignment | 6 | Drag-and-drop assignment of [15, 14, 13, 12, 10, 8] to abilities using @dnd-kit, click-to-assign alternative, suggested assignment, racial bonus display |
| 11.3 | Point Buy Interface | 7 | Interactive increment/decrement controls for 27-point allocation, point cost tracking, guardrails (8-15 range), quick presets, racial bonus display |
| 11.4 | Dice Rolling Interface | 8 | Animated 4d6-drop-lowest rolling for 6 sets, roll-all/reroll-all, house rule threshold toggle, assignment phase reusing Standard Array UI, raw roll preservation |
| 11.5 | Ability Score Summary & Recommendations | 4 | Summary table (base + racial + total + modifier), gameplay implication helper, class primary ability recommendations, derived combat stat preview |
| 11.6 | Ability Score Step Validation & State | 3 | Validation per method, persistence of scores/method/racial bonuses/raw rolls, progress sidebar display |

## Technical Scope

- **AbilityScoreStep.tsx** — Step 3 container with method selection tabs
- **StandardArrayAssigner.tsx** — Drag-and-drop using @dnd-kit/core and @dnd-kit/sortable
- **PointBuyAllocator.tsx** — Increment/decrement controls with 27-point budget tracking
- **DiceRollingInterface.tsx** — Two-phase UI: rolling phase with CSS 3D dice animation, then assignment phase
- **AbilityScoreSummary.tsx** — Summary table with modifiers and gameplay implications
- **@dnd-kit** library for drag-and-drop (Standard Array and Rolling assignment)
- Phase 1 dice engine for 4d6-drop-lowest rolls
- Phase 1 calculation engine for modifier computation and derived stats
- Point buy cost table: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9

## Dependencies

- **Depends on:** Epic 8 (Wizard Shell), Epic 9 (racial ability bonuses from race selection), Epic 10 (class primary ability for recommendations), Phase 1 dice engine, Phase 1 calculation engine
- **Blocks:** Epic 12 (ability modifiers needed for gameplay context), Epic 13 (STR for carrying capacity), Epic 14 (spellcasting ability modifier for prepared spell count), Epic 15 (review displays all ability data)
