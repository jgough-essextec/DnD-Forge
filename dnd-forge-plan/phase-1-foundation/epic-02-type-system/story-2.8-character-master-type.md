# Story 2.8 — Character Master Type

> **Epic 2: Complete Type System** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need the complete Character interface that aggregates all sub-types into the master entity.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Character interface**: The master entity that aggregates all sub-types defined in Stories 2.1-2.7. This is the primary data structure stored in the database and managed by Zustand stores. It includes:
  - **Identity fields**: id (UUID), name, playerName, avatar URL, timestamps (createdAt, updatedAt), version number for optimistic concurrency
  - **Core choices**: race (RaceSelection from Story 2.2), classes (ClassSelection[] from Story 2.3 — array for multiclass), background (BackgroundSelection from Story 2.6), alignment (from Story 2.1)
  - **Ability scores**: base scores (AbilityScores from Story 2.1), method used (standard array, point buy, rolled), raw rolls (if rolled)
  - **Level & XP**: total character level, experience points
  - **Combat stats**: hpMax, hpCurrent, tempHp, hitDiceTotal, hitDiceUsed, armorClassOverride (optional manual override), initiativeBonus (optional), speed (Speed from Story 2.7), deathSaves (DeathSaves from Story 2.7)
  - **Proficiencies**: all categories (armor, weapons, tools, languages, skills, saving throws)
  - **Equipment & inventory**: equipment array (EquipmentItem[] from Story 2.4), currency (Currency from Story 2.4), attuned items (max 3)
  - **Spellcasting**: SpellcastingData from Story 2.5
  - **Features, traits, feats**: class features, racial traits, feats
  - **Personality & description**: CharacterDescription from Story 2.6, personality traits, ideals, bonds, flaws
  - **Conditions**: active conditions (ConditionInstance[] from Story 2.7)
  - **Inspiration**: boolean flag (granted by DM, used for advantage on one roll)
  - **Meta**: campaignId (optional), isArchived (soft delete), dmNotes (optional DM-only notes)
- **CharacterSummary**: A lightweight projection of Character used for gallery card display — only the fields needed to render a card (id, name, race, class, level, HP, AC, avatar)
- **CharacterExport**: Character data plus a `formatVersion` string for JSON import/export compatibility
- **CharacterValidation**: Array of validation results with field path, severity (error vs warning), and message

## Tasks
- [ ] **T2.8.1** — Define the master `Character` interface incorporating all sub-types from stories 2.1-2.7. This should include:
  - Identity fields (id, name, playerName, avatar, createdAt, updatedAt, version)
  - Core choices (race: RaceSelection, classes: ClassSelection[], background: BackgroundSelection, alignment)
  - Ability scores (base scores, method used, raw rolls)
  - Level & XP
  - Combat stats (hpMax, hpCurrent, tempHp, hitDiceTotal, hitDiceUsed, armorClassOverride?, initiativeBonus?, speed, deathSaves)
  - Proficiencies (all categories)
  - Equipment & inventory (equipment, currency, attunedItems)
  - Spellcasting data
  - Features, traits, feats
  - Personality & description
  - Conditions
  - Inspiration (boolean)
  - Meta (campaignId, isArchived, dmNotes)
- [ ] **T2.8.2** — Define `CharacterSummary` interface (for gallery cards): `{ id, name, race, class, level, hp, ac, avatarUrl? }`
- [ ] **T2.8.3** — Define `CharacterExport` type (for JSON import/export): `Character` plus a `formatVersion: string` field
- [ ] **T2.8.4** — Define `CharacterValidation` type: `{ field: string; severity: 'error' | 'warning'; message: string }[]`

## Acceptance Criteria
- All types compile with zero TypeScript errors under strict mode
- `Character` interface includes every field needed by the character sheet, creation wizard, and calculation engine
- `Character.classes` is an array (not a single class) to support multiclassing
- `Character` includes the `inspiration` boolean flag
- `Character` includes `version` for optimistic concurrency control
- `CharacterSummary` contains only the fields needed for gallery card rendering
- `CharacterExport` extends Character with `formatVersion` for import/export compatibility
- `CharacterValidation` classifies issues as errors (must fix) or warnings (informational)

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should define Character interface with all required identity fields (id, name, createdAt, updatedAt, version)`
- `should define Character.classes as array of ClassSelection to support multiclassing`
- `should define Character with inspiration boolean flag`
- `should define Character with version number for optimistic concurrency`
- `should define CharacterSummary with only gallery-card fields (id, name, race, class, level, hp, ac)`
- `should define CharacterExport extending Character with formatVersion string`
- `should define CharacterValidation as array of { field, severity, message }`
- `should define Character with all combat stat fields (hpMax, hpCurrent, tempHp, hitDiceTotal, hitDiceUsed)`
- `should define Character with optional armorClassOverride and initiativeBonus`
- `should define Character with attunedItems field`

### Test Dependencies
- No mock data needed — these are type compilation tests
- Depends on all types from Stories 2.1 through 2.7

## Identified Gaps

- **Edge Cases**: No specification for Character.attunedItems maximum of 3 at type level (enforced only at runtime via validation)
- **Edge Cases**: Character.abilityScoreMethod should be a union type (standard/pointBuy/rolled) rather than a string for type safety
- **Dependency Issues**: Character aggregates all sub-types; any change to sub-types will ripple to this interface

## Dependencies
- **Depends on:** Story 2.1 (AbilityScores, Alignment, SkillProficiency, SavingThrow), Story 2.2 (RaceSelection), Story 2.3 (ClassSelection, Feature), Story 2.4 (EquipmentItem, Currency), Story 2.5 (SpellcastingData), Story 2.6 (BackgroundSelection, CharacterDescription), Story 2.7 (ConditionInstance, DeathSaves, Speed)
- **Blocks:** Epic 5 (Database stores Character), Epic 6 (Stores manage Character), Story 4.8 (Character validation)

## Notes
- The `classes` field is an array of `ClassSelection` to support multiclassing. For a single-class character, this array has one element. The character's total level is the sum of all class levels
- `armorClassOverride` and `initiativeBonus` are optional override fields that let a user manually set values when the calculation engine cannot account for some edge case
- `version` is incremented on every save and used for optimistic concurrency control in the database layer — if two tabs edit the same character, the second save detects the version mismatch
- The `attunedItems` field should be constrained to a maximum of 3 items (validated by the calculation engine, not enforced at the type level)
- Consider making `Character` a deep readonly type for the store's output, with mutations handled through specific update functions
