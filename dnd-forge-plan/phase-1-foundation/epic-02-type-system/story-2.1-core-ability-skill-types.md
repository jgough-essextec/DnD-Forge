# Story 2.1 — Core Ability & Skill Types

> **Epic 2: Complete Type System** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need type-safe representations of abilities, skills, and their relationships so the calculation engine can be built with compiler-verified correctness.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **D&D 5e Ability Scores**: The six core abilities are Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma. Each has a numeric score (typically 1-20, max 30) and a derived modifier: `Math.floor((score - 10) / 2)`
- **D&D 5e Skills**: There are 18 skills, each governed by one ability: Acrobatics (DEX), Animal Handling (WIS), Arcana (INT), Athletics (STR), Deception (CHA), History (INT), Insight (WIS), Intimidation (CHA), Investigation (INT), Medicine (WIS), Nature (INT), Perception (WIS), Performance (CHA), Persuasion (CHA), Religion (INT), Sleight of Hand (DEX), Stealth (DEX), Survival (WIS)
- **Skill proficiency**: A character can be proficient in a skill (adds proficiency bonus to checks), have expertise (doubles proficiency bonus), or be non-proficient (just ability modifier). Some class features like Jack of All Trades add half proficiency to non-proficient skills
- **Saving throws**: Each ability has a saving throw. Characters are proficient in 2 saving throws (determined by class)
- **Passive scores**: Formula is 10 + skill modifier. The rules define Passive Perception, Passive Insight, and Passive Investigation. Advantage adds +5, disadvantage subtracts -5. The type system should support passive scores for any skill
- **Alignment**: 9 standard alignments (Lawful Good, Neutral Good, Chaotic Good, Lawful Neutral, True Neutral, Chaotic Neutral, Lawful Evil, Neutral Evil, Chaotic Evil) plus "Unaligned" for creatures without moral/ethical alignment

## Tasks
- [ ] **T2.1.1** — Define `AbilityName` union type: `'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'`
- [ ] **T2.1.2** — Define `AbilityScores` interface with all 6 abilities as `number` properties
- [ ] **T2.1.3** — Define `SkillName` union type for all 18 skills
- [ ] **T2.1.4** — Define `SKILL_ABILITY_MAP` constant mapping each skill to its governing ability (e.g., `'acrobatics' -> 'dexterity'`)
- [ ] **T2.1.5** — Define `SkillProficiency` interface: `{ skill: SkillName; proficient: boolean; expertise: boolean }`
- [ ] **T2.1.6** — Define `SavingThrow` type: `{ ability: AbilityName; proficient: boolean }`
- [ ] **T2.1.7** — Define `PassiveScore` type: `{ skill: SkillName; value: number }` (supporting Perception, Insight, Investigation, and any other)
- [ ] **T2.1.8** — Define `Alignment` type as union of all 9 alignment values plus `'unaligned'`

## Acceptance Criteria
- All types compile with zero TypeScript errors under strict mode
- `AbilityName` union type includes exactly 6 abilities
- `SkillName` union type includes exactly 18 skills
- `SKILL_ABILITY_MAP` maps every `SkillName` to an `AbilityName` with no missing entries
- `SkillProficiency` supports proficient, expertise, and non-proficient states
- `PassiveScore` can represent passive scores for any skill, not just Perception
- `Alignment` includes all 9 standard alignments plus 'unaligned'

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should define AbilityName union type with exactly 6 abilities (strength, dexterity, constitution, intelligence, wisdom, charisma)`
- `should define SkillName union type with exactly 18 skills`
- `should define SKILL_ABILITY_MAP with all 18 skills mapped to correct governing ability`
- `should map acrobatics to dexterity in SKILL_ABILITY_MAP`
- `should map athletics to strength in SKILL_ABILITY_MAP`
- `should map arcana to intelligence in SKILL_ABILITY_MAP`
- `should define SkillProficiency with proficient and expertise boolean fields`
- `should define Alignment with all 9 standard alignments plus unaligned`
- `should have SKILL_ABILITY_MAP typed as Record<SkillName, AbilityName> with no missing entries`
- `should define PassiveScore supporting any SkillName, not just Perception`

### Test Dependencies
- No mock data needed — these are type compilation and constant verification tests

## Identified Gaps

No gaps identified.

## Dependencies
- **Depends on:** Story 1.1 (TypeScript configured with strict mode)
- **Blocks:** Story 2.2 (Race types use AbilityScores), Story 2.3 (Class types use SkillName, AbilityName), Story 2.8 (Character master type), Story 4.1 (Ability score calculations), Story 4.2 (Skill calculations)

## Notes
- The `SKILL_ABILITY_MAP` is a critical constant used extensively by the calculation engine. It must be typed as `Record<SkillName, AbilityName>` to ensure compile-time completeness checking
- Consider using `as const` assertions for union types to get the narrowest possible type inference
- Passive scores beyond Perception (Insight, Investigation) are used by some DMs and should be supported generically rather than hardcoded
