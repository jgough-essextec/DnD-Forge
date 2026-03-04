# Story 2.7 — Condition, Combat & Session Types

> **Epic 2: Complete Type System** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need types for all gameplay-state tracking: conditions, combat, initiative, rests, and death saves.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **D&D 5e Conditions** (14 standard + Exhaustion levels): Blinded, Charmed, Deafened, Exhaustion (6 levels with escalating penalties), Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious. Each condition has specific mechanical effects on the character's abilities
- **Exhaustion levels**: 1 = disadvantage on ability checks, 2 = speed halved, 3 = disadvantage on attack rolls and saving throws, 4 = HP max halved, 5 = speed reduced to 0, 6 = death. Effects are cumulative
- **Death saves**: When at 0 HP, roll d20 (no modifiers) at start of turn. 10+ = success, 9- = failure. Natural 20 = regain 1 HP (resets both counters). Natural 1 = 2 failures. 3 successes = stabilize. 3 failures = death. Taking damage at 0 HP = automatic failure (critical = 2 failures). Receiving healing at 0 HP = regain consciousness
- **Speed types**: Most creatures have walk speed. Some have fly, swim, climb, or burrow speed. Different races and class features grant or modify these
- **Attacks**: Calculated from weapon + ability modifier + proficiency. Finesse weapons use STR or DEX (player choice). Ranged weapons use DEX
- **Initiative**: DEX modifier + bonuses (e.g., Alert feat +5, Jack of All Trades half proficiency). Used for combat turn order
- **Encounters**: DM tool for tracking initiative order, current turn, round number, and combatant status. Entries can be player characters or NPCs/monsters
- **Rest types**: Short rest (1+ hours, spend hit dice, some features recover) and Long rest (8 hours, all HP recover, spell slots reset, etc.)

## Tasks
- [ ] **T2.7.1** — Define `Condition` enum: all 14 standard conditions (Blinded through Unconscious) plus Exhaustion with level tracking
- [ ] **T2.7.2** — Define `ConditionInstance` interface: `{ condition: Condition; exhaustionLevel?: 1|2|3|4|5|6; source?: string; duration?: string }`
- [ ] **T2.7.3** — Define `DeathSaves` interface: `{ successes: 0|1|2|3; failures: 0|1|2|3; stable: boolean }`
- [ ] **T2.7.4** — Define `Speed` interface: `{ walk: number; fly?: number; swim?: number; climb?: number; burrow?: number }` — accounting for races/features with multiple movement types
- [ ] **T2.7.5** — Define `Attack` interface: `{ name: string; attackBonus: number; damage: DamageDice; range?: string; properties?: string[]; isProficient: boolean; abilityUsed: AbilityName }`
- [ ] **T2.7.6** — Define `InitiativeEntry` interface: `{ id: string; name: string; initiative: number; isPlayer: boolean; characterId?: string; hp?: number; maxHp?: number; ac?: number; conditions: ConditionInstance[] }`
- [ ] **T2.7.7** — Define `Encounter` interface: `{ id: string; campaignId: string; entries: InitiativeEntry[]; currentTurnIndex: number; round: number; isActive: boolean }`
- [ ] **T2.7.8** — Define `RestType` enum: `'short' | 'long'`

## Acceptance Criteria
- All types compile with zero TypeScript errors under strict mode
- `Condition` enum includes all 14 standard D&D 5e conditions
- `ConditionInstance` supports Exhaustion with level tracking (1-6) and optional source/duration metadata
- `DeathSaves` tracks successes and failures as 0-3 with a stable flag
- `Speed` supports all 5 movement types (walk, fly, swim, climb, burrow)
- `Attack` captures all data needed to display and calculate an attack action
- `Encounter` can track a full combat encounter with initiative order, rounds, and current turn
- `RestType` distinguishes short and long rests

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should define Condition enum with all 14 standard conditions`
- `should define ConditionInstance with optional exhaustionLevel (1-6) for Exhaustion`
- `should define DeathSaves with successes and failures as 0|1|2|3 literal types`
- `should define Speed interface with required walk and optional fly, swim, climb, burrow`
- `should define Attack interface with attackBonus, damage, abilityUsed, and isProficient`
- `should define InitiativeEntry supporting both player characters and NPCs`
- `should define Encounter with currentTurnIndex, round counter, and isActive flag`
- `should define RestType as short or long`

### Test Dependencies
- No mock data needed — these are type compilation tests
- Depends on AbilityName from Story 2.1, DamageDice from Story 2.4

## Identified Gaps

- **Edge Cases**: ConditionInstance.exhaustionLevel is optional even when condition is not Exhaustion; a discriminated union would be stricter
- **Edge Cases**: DeathSaves does not track whether the last roll was a natural 1 (2 failures) or natural 20 (regain 1 HP)

## Dependencies
- **Depends on:** Story 2.1 (uses AbilityName), Story 2.2 (uses DamageType via DamageDice), Story 2.4 (uses DamageDice)
- **Blocks:** Story 2.8 (Character master type includes conditions, death saves, speed), Story 2.9 (Campaign types reference Encounter), Story 3.7 (Condition data), Story 4.3 (Combat calculations), Story 4.7 (Rest mechanics)

## Notes
- `DeathSaves.successes` and `DeathSaves.failures` use literal union types `0|1|2|3` to enforce the valid range at the type level
- `ConditionInstance.exhaustionLevel` is only relevant when `condition` is Exhaustion. It could be modeled as a discriminated union for stricter typing, but the optional field approach is simpler
- The `Encounter` interface is primarily for the DM initiative tracker feature. The `currentTurnIndex` points into the sorted `entries` array
- `Speed.walk` is required because every creature has a walking speed. Other movement types are optional because most characters only have walk speed initially
- `Attack` is a pre-calculated display type. The raw data comes from `Weapon` + character stats processed through the calculation engine
