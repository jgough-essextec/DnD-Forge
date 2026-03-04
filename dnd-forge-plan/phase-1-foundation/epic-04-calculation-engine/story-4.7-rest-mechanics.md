# Story 4.7 — Rest Mechanics

> **Epic 4: Calculation Engine** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need functions that compute what recovers on short and long rests.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Short Rest** (1+ hours): A period of downtime where characters can spend hit dice to recover HP and some features recharge:
  - **Spend Hit Dice**: The player chooses how many hit dice to spend. For each hit die spent, roll the die + CON modifier to recover that many HP (minimum 0 recovery per die). Hit dice spent are tracked (cannot exceed total available)
  - **Warlock Pact Magic**: All Warlock spell slots recover on short rest (this is unique to Warlock)
  - **Class features with shortRest recharge**: Features marked as `recharge: 'shortRest'` recover their uses. Examples: Fighter's Second Wind (1/short rest), Fighter's Action Surge (1-2/short rest), Monk's Ki points, Bard's Bardic Inspiration (at level 5+), Cleric's Channel Divinity
  - **Wizard Arcane Recovery** (level 1+): Recover spell slots with combined level equal to half wizard level (rounded up), once per day on short rest. No slot of 6th level or higher
- **Long Rest** (8 hours, at least 1 hour of watch allowed):
  - **Recover ALL lost HP**: HP current is set to HP max
  - **Recover Hit Dice**: Regain spent hit dice up to half your total number (minimum 1). Example: a level 5 character recovers up to 2 spent hit dice. If they had 3 spent, they recover 2 and still have 1 spent
  - **Recover ALL spell slots**: All standard spell slots fully restore (not Warlock pact slots, which recharge on short rest anyway)
  - **Recover ALL class features**: All features with `recharge: 'longRest'` or `recharge: 'shortRest'` recover their uses
  - **Reset death saves**: Death save successes and failures both reset to 0
  - **Exhaustion**: One level of exhaustion is removed (if any)
- **Important**: A character can only benefit from one long rest per 24-hour period. A long rest is interrupted if the character engages in 1+ hour of strenuous activity (walking, fighting, casting spells)

## Tasks
- [ ] **T4.7.1** — Implement `applyShortRest(character: Character, hitDiceToSpend: number[]): Character` — spend hit dice (roll + CON mod each), recover Warlock pact magic slots, recover applicable class features (those with `recharge: 'shortRest'`)
- [ ] **T4.7.2** — Implement `applyLongRest(character: Character): Character` — restore all HP, recover half total hit dice (min 1), restore all spell slots, restore all recharging features, reset death saves
- [ ] **T4.7.3** — Write unit tests: short rest spending 2 hit dice with CON mod +2, long rest recovering half hit dice when 3 of 5 spent, Warlock slots recovering on short rest

## Acceptance Criteria
- `applyShortRest()` correctly spends hit dice (rolls + CON mod, minimum 0 per die), recovers Warlock pact magic slots, and resets short-rest-recharge features
- `applyShortRest()` does not allow spending more hit dice than are available
- `applyShortRest()` does not heal above max HP
- `applyLongRest()` restores HP to maximum
- `applyLongRest()` recovers half total hit dice (rounded down, minimum 1)
- `applyLongRest()` restores all spell slots to full
- `applyLongRest()` resets all feature usage counters (both short and long rest recharge)
- `applyLongRest()` resets death saves to 0/0
- `applyLongRest()` reduces exhaustion by 1 level (if any)
- Unit tests verify all recovery mechanics including edge cases

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should heal by hit die roll + CON mod when spending hit dice on short rest via applyShortRest`
- `should not heal above max HP on short rest via applyShortRest`
- `should not allow spending more hit dice than available via applyShortRest`
- `should recover Warlock pact magic slots on short rest via applyShortRest`
- `should reset short-rest-recharge feature uses on short rest via applyShortRest`
- `should restore HP to maximum on long rest via applyLongRest`
- `should recover half total hit dice (rounded down, min 1) on long rest via applyLongRest`
- `should restore all spell slots on long rest via applyLongRest`
- `should reset all feature usage counters (short and long rest) on long rest via applyLongRest`
- `should reset death saves to 0/0 on long rest via applyLongRest`
- `should reduce exhaustion by 1 level on long rest via applyLongRest`
- `should return new Character object (immutable) from rest functions`

### Test Dependencies
- Character type fixtures with hit dice, spell slots, features, exhaustion, and death saves
- Dice engine from Story 7.1 for hit die rolls
- Feature data from Story 3.2 for recharge identification

## Identified Gaps

- **Edge Cases**: Short rest hit die spending for multiclass (choose which die type to spend) requires array of die types but exact behavior not specified
- **Edge Cases**: Wizard Arcane Recovery (recover spell slots on short rest) is noted as needing manual activation but not modeled in applyShortRest
- **Edge Cases**: Long rest hit dice recovery — which types to recover in multiclass is player choice, not automated

## Dependencies
- **Depends on:** Story 2.3 (Feature with recharge field), Story 2.5 (SpellSlots, PactMagic, SpellcastingData), Story 2.7 (DeathSaves, ConditionInstance for exhaustion), Story 2.8 (Character type), Story 7.1 (dice engine for hit die rolls)
- **Blocks:** Epic 6 (Stores will expose rest actions to the UI), Phase 3+ (Rest UI)

## Notes
- `applyShortRest` takes a `hitDiceToSpend` array where each element is the hit die type being spent (e.g., [10, 10, 6] for spending 2 Fighter d10s and 1 Wizard d6 in a multiclass character). The function rolls each die, adds CON modifier, and heals that amount
- Hit die recovery on long rest recovers half your TOTAL hit dice (across all classes), minimum 1. A level 5 character recovers up to 2. A level 1 character recovers 1 (minimum)
- The functions should return a new Character object (immutable update pattern) rather than mutating the input
- Wizard Arcane Recovery is a complex short-rest feature that is better handled as a specific action rather than automatic recovery. Consider flagging it as needing manual activation
- For multiclass characters, hit dice are tracked per class type. A Fighter 3/Wizard 2 has 3d10 + 2d6 hit dice. When recovering hit dice on a long rest, the player chooses which types to recover
- Exhaustion reduction on long rest only applies if the character has eaten and drunk during the rest period. The system should assume this condition is met
