# Story 3.3 — Spell Database

> **Epic 3: SRD Game Data Layer** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need the complete SRD spell list as a searchable, filterable dataset.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **SRD Spell count**: Approximately 300 spells covering cantrips (level 0) through 9th level across all 8 schools of magic
- **Spell data structure**: Each spell must conform to the `Spell` interface (Story 2.5) with: id, name, level (0-9), school (one of 8 schools: Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation), casting time, range, components (V/S/M with material descriptions and costs), duration, concentration flag, ritual flag, description, higher-level scaling, and class list
- **Class spell lists**: Each spellcasting class has its own spell list. A spell can appear on multiple class lists. Spell lists needed for: Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard
- **Spell search requirements**: The UI will need to filter spells by class, level, school, ritual flag, concentration flag, and free-text search. Utility functions must support these queries efficiently
- **Concentration spells**: Only one concentration spell can be active at a time. The `concentration: boolean` flag on each spell enables filtering and UI warnings
- **Ritual spells**: Spells with `ritual: true` can be cast without expending a spell slot by adding 10 minutes to casting time. Available to Bard, Cleric, Druid, Wizard (with class-specific rules)
- **Higher-level casting**: Many spells scale when cast at a higher level (e.g., "deals an extra 1d6 damage for each slot level above 1st"). Stored in `higherLevelDescription`
- **Cantrip scaling**: Cantrips automatically increase in power at character levels 5, 11, and 17 (not when upcast). This scaling is described in the spell's main description

## Tasks
- [ ] **T3.3.1** — Create `data/spells.ts` with all ~300 SRD spells, each containing: id, name, level (0-9), school, casting time, range, components (V/S/M with descriptions), duration, concentration flag, ritual flag, description, higher-level scaling, class list
- [ ] **T3.3.2** — Create spell index files by class: `data/spell-lists/wizard.ts`, `data/spell-lists/cleric.ts`, etc. — each containing an array of spell IDs for that class
- [ ] **T3.3.3** — Verify every spell has accurate data: cross-check 20 randomly selected spells against SRD source
- [ ] **T3.3.4** — Create utility function `getSpellsByClass(classId: string, maxLevel?: number): Spell[]`
- [ ] **T3.3.5** — Create utility function `searchSpells(query: string, filters?: { level?, school?, class?, ritual?, concentration? }): Spell[]`

## Acceptance Criteria
- All ~300 SRD spells are present with complete and accurate data
- Every spell entry passes TypeScript type checking against the `Spell` interface
- Class spell lists correctly map each class to its available spells
- `getSpellsByClass()` returns the correct spells for a given class, optionally filtered by max level
- `searchSpells()` supports text search combined with level, school, class, ritual, and concentration filters
- At least 20 spells have been manually verified against the SRD source for accuracy
- Concentration and ritual flags are correctly set for all spells

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should export spells array with approximately 300 spells`
- `should have every spell pass TypeScript type checking against Spell interface`
- `should have Fireball with level 3, school Evocation, and concentration false`
- `should have Shield with casting time reaction and trigger specified`
- `should have Cure Wounds on Cleric, Druid, Bard, and Paladin spell lists`
- `should return correct spells for getSpellsByClass('wizard')`
- `should filter getSpellsByClass with maxLevel parameter`
- `should return matching spells for searchSpells('fire') text search`
- `should filter spells by concentration flag in searchSpells`
- `should filter spells by ritual flag in searchSpells`

### Test Dependencies
- Spell type interface from Story 2.5
- Import via `@/data/spells` path alias

## Identified Gaps

- **Edge Cases**: Spells with variable damage types (e.g., Chromatic Orb) need accommodation in the damage field
- **Performance**: ~300 spells searched with `searchSpells()` may need indexing for fast filtering in the UI
- **Edge Cases**: Cantrip scaling at character levels 5, 11, 17 is described in text but not structured as data

## Dependencies
- **Depends on:** Story 2.5 (Spell, SpellSchool, SpellLevel, CastingTime, SpellRange, SpellComponents, SpellDuration types)
- **Blocks:** Story 4.4 (Spellcasting calculations reference spell data), Epic 6 Story 6.2 (Wizard store spell selections)

## Notes
- ~300 spells is a large dataset. Consider organizing the source file alphabetically and potentially splitting into multiple files by level or school for maintainability
- The `getSpellsByClass()` function should accept an optional `maxLevel` parameter to support the wizard UI showing only spells the character can actually cast at their current level
- `searchSpells()` should support case-insensitive text matching against spell name and description
- Some spells have variable damage types (e.g., Chromatic Orb lets the caster choose) — the damage field may need to accommodate this
- Cantrip scaling at levels 5, 11, and 17 is based on total character level, not class level — important for multiclass characters
- Material components with a gold cost (e.g., Revivify requires 300gp worth of diamonds) should have both the `materialDescription` and `materialCost` fields populated
