# D&D Character Forge -- ETL Data Pipeline Strategy

## Purpose

The app provides D&D 5e game reference data (races, classes, spells, equipment, etc.) through two complementary channels:

1. **Static TypeScript files** bundled with the React frontend for fast client-side lookups and compile-time type safety.
2. **Django fixtures loaded into PostgreSQL** for server-side validation, API endpoints, and query filtering.

This document defines the Extract-Transform-Load pipeline that produces both outputs from upstream SRD data sources. The frontend ETL runs at **build time** as a Node.js script. The Django fixtures are loaded via `manage.py loaddata` during deployment or development setup.

---

## Data Sources

### Primary Source: 5e-bits/5e-database (GitHub)

The underlying data repository powering the community 5e SRD API. Contains static JSON files for all SRD content.

- **Repository:** `https://github.com/5e-bits/5e-database`
- **License:** MIT (tooling) + OGL 1.0a (game content) -- zero copyright risk for SRD content
- **Format:** Static JSON files in `src/2014/` directory
- **Pinned version:** v4.2.1 (semantic releases for reproducible builds)
- **Why this source:** One-time clone (no rate limits), community-validated (843 stars, 89 contributors), API-compatible structure, SRD-scoped (only legally distributable content)

### Secondary Source: dnd5eapi.co (Validation Only)

The live REST API serving the same data. Used during the Validate phase to spot-check 20-30 transformed records against the API for accuracy. Not used at runtime.

### Future Source: 5etools-src (Phase 6+)

The most comprehensive D&D 5e dataset, covering all published sourcebooks. Earmarked for future homebrew/extended content support. Non-SRD content requires users to own the relevant sourcebooks. The transform layer uses a source adapter pattern so adding 5etools is a configuration change, not a rewrite.

---

## Key Data Entities

| Entity | Source File(s) | Approx Records | Notes |
|--------|---------------|----------------|-------|
| Races | `5e-SRD-Races.json`, `5e-SRD-Subraces.json`, `5e-SRD-Traits.json` | 9 races, 18 subraces | Merged with subraces and resolved traits |
| Classes | `5e-SRD-Classes.json`, `5e-SRD-Subclasses.json`, `5e-SRD-Features.json`, `5e-SRD-Levels.json` | 12 classes, 12 subclasses | Level-by-level feature maps and spell slot progression |
| Spells | `5e-SRD-Spells.json` | ~320 spells | Parsed into structured components, range, duration types |
| Equipment | `5e-SRD-Equipment.json`, `5e-SRD-Weapon-Properties.json` | ~250 items | Split into weapons (~40), armor (~17), gear, and tools |
| Backgrounds | `5e-SRD-Backgrounds.json` + supplements | 13 total | SRD provides only Acolyte; 12 hand-authored from OGL content |
| Feats | `5e-SRD-Feats.json` + supplements | 11-16 total | SRD provides only Grappler; 10-15 hand-authored from OGL content |
| Conditions | `5e-SRD-Conditions.json` | 15 conditions | Direct mapping with camelCase conversion |
| Languages | `5e-SRD-Languages.json` | 16 languages | Direct mapping |
| Skills | `5e-SRD-Skills.json`, `5e-SRD-Ability-Scores.json` | 18 skills, 6 abilities | Mapped to parent ability scores |

---

## Pipeline Architecture

```
EXTRACT              TRANSFORM              VALIDATE             LOAD
+-----------+       +---------------+       +------------+       +--------------+
| Clone 5e- |  -->  | Reshape JSON  |  -->  | Type-check |  -->  | Write .ts    |
| database  |       | to match our  |       | against    |       | files into   |
| at pinned |       | TypeScript    |       | interfaces |       | src/data/    |
| version   |       | interfaces    |       |            |       |              |
+-----------+       +---------------+       +------------+       +--------------+

npm run etl:extract --> etl:transform --> etl:validate --> etl:load
npm run etl          (runs all four in sequence)
```

### Why Both Static Files and Django Fixtures

SRD reference data is served through two channels for different purposes:

- **Static TypeScript files (frontend):** Compile-time type safety, zero-latency client-side lookups for the character creation wizard and sheet display, tree-shaking of unused data, and deterministic builds.
- **Django fixtures (backend):** Server-side validation of character data against SRD rules, paginated/filterable API endpoints for SRD browsing, and backend query support (e.g., "find all spells for class X at level Y").

---

## Extraction Approach

1. **Clone the repository** at a pinned release tag (`--depth 1 --branch v4.2.1`) for reproducible builds
2. **Source files** live under `etl/source-data/src/2014/`
3. **Supplemental data** for SRD gaps (backgrounds, feats) is hand-authored in `etl/supplements/` and committed to the repo
4. The cloned source data directory is gitignored -- raw source is not committed

---

## Transformation Rules

### Common Transformations (All Entities)

- **Flatten APIReferences:** Replace `{ index: "elf", name: "Elf", url: "/api/..." }` with the `index` string as the ID
- **Convert field names:** `snake_case` to `camelCase` throughout
- **Generate stable IDs:** Use the `index` field from source data

### Race Transformations

- Merge subraces into parent race objects by matching `race.index` to `subrace.race.index`
- Resolve trait APIReferences against `5e-SRD-Traits.json` and inline full trait objects
- Normalize ability bonuses from `[{ ability_score: { index: "dex" }, bonus: 2 }]` to `{ dexterity: 2 }`
- Extract choice nodes (Half-Elf ability choices, High Elf cantrip choice)
- Structure speed, senses (darkvision), resistances, and languages

### Class Transformations

- Group features from flat list into `Record<number, Feature[]>` by class and level
- Build spell slot progression tables from `5e-SRD-Levels.json`
- Resolve proficiency choices into typed skill choice structures
- Combine guaranteed and optional starting equipment into `StartingEquipmentChoice[]`
- Hardcode ASI levels and starting gold formulas (not in source data)
- Build the multiclass spell slot table from 5e rules

### Spell Transformations

- Parse string fields into structured types: casting time (`"1 action"` to `{ value: 1, unit: 'action' }`), range (`"120 feet"` to typed `SpellRange`), duration (`"Concentration, up to 1 minute"` to `{ type: 'concentration', value: 1, unit: 'minute' }`)
- Structure components as `{ verbal, somatic, material, materialDescription }`
- Build per-class spell index files for filtered spell lists

### Equipment Transformations

- Split by category into weapons, armor, adventuring gear, and tools
- Parse weapon properties (finesse, versatile, thrown, etc.) from APIReferences to string arrays
- Transform armor AC metadata: `{ base: 14, dex_bonus: true, max_bonus: 2 }` to typed `Armor` with `baseAC`, `dexCap`, stealth disadvantage, and STR requirements
- Normalize costs and weights

### Background and Feat Transformations

- Merge SRD data with hand-authored supplement files
- Resolve proficiency APIReferences to skill/tool names
- Structure personality tables (d8/d6 tables for traits/ideals/bonds/flaws)

---

## Validation Approach

### Type Safety

Every generated `.ts` file must compile without errors against the app's TypeScript interfaces (`tsc --noEmit`).

### Completeness Checks

- All 9 SRD races present with correct subraces
- All 12 SRD classes present with 20 levels of features each
- All 18 skills mapped to correct abilities
- All 15 conditions present
- Spell count matches expected (~320)
- All 13 armor types + shield present

### Referential Integrity

- Every spell's class list references valid class IDs
- Every subclass references a valid parent class
- Every race trait has a non-empty description
- Every class feature references a valid level

### Cross-Check Against Live API (Sample-Based)

Fetch 5-10 random entities per category from `dnd5eapi.co` and compare key fields against our transformed data to catch transformation errors.

### Calculation Engine Smoke Test

Run the calculation engine against 3 pre-built test characters using the transformed data and verify AC, HP, skill modifiers, and spell save DCs match hand-calculated values.

---

## Loading Strategy

### Channel 1: Static TypeScript Files (Frontend)

### Output Format

Generated files are TypeScript with typed constants, `as const` assertions, and `readonly` arrays:

```typescript
// src/data/races.ts (auto-generated -- do not edit manually)
// Source: 5e-bits/5e-database v4.2.1
// Generated: 2026-03-03T12:00:00Z

import type { Race } from '@/types';

export const races: readonly Race[] = [
  { id: 'dwarf', name: 'Dwarf', ... },
  // ...
] as const;
```

### Key Decisions

- **TypeScript, not JSON:** All output is `.ts` for compile-time type safety and tree-shaking
- **Immutable by default:** `as const` and `readonly` enforce that SRD data is never mutated
- **Generated header comments:** Include source version and timestamp for traceability
- **Barrel export:** `src/data/index.ts` re-exports all data files for clean imports
- **Committed to repo:** Generated files are committed so developers do not need to run ETL for normal development and CI builds are deterministic

---

## SRD Content Gaps

The SRD is intentionally limited in certain categories:

| Category | SRD Provides | Gap | Strategy |
|----------|-------------|-----|----------|
| Backgrounds | 1 (Acolyte) | 12 missing | Hand-author from OGL-safe mechanical data (proficiencies, equipment, feature names) |
| Feats | 1 (Grappler) | 10-15 missing | Hand-author commonly used feats from OGL-safe mechanical data |
| Subclasses | 1 per class | 1-3 per class missing | SRD sufficient for MVP; additional subclasses planned for Phase 6 |
| Spells | ~320 | ~40 missing | SRD covers most combat/utility spells; sufficient for MVP |

Supplemental data is maintained in `etl/supplements/` and follows the same schema as the source files.

---

## Directory Structure

```
project-root/
+-- etl/                          (build-time pipeline, NOT shipped in app bundle)
|   +-- source-data/              (git-cloned 5e-database, gitignored)
|   +-- supplements/              (hand-authored gap-fill data, committed)
|   |   +-- backgrounds.json
|   |   +-- feats.json
|   +-- extract.ts
|   +-- transform.ts
|   +-- transformers/             (per-entity transform modules)
|   |   +-- races.ts
|   |   +-- classes.ts
|   |   +-- spells.ts
|   |   +-- equipment.ts
|   |   +-- backgrounds.ts
|   |   +-- ...
|   +-- validate.ts
|   +-- load.ts
|   +-- config.ts                 (source version, paths, feature flags)
|   +-- utils.ts                  (APIRef resolver, case converters, parsers)
|
+-- src/
    +-- data/                     (OUTPUT: generated TypeScript data files, committed)
        +-- races.ts
        +-- classes.ts
        +-- subclasses.ts
        +-- spells.ts
        +-- spell-lists/
        +-- equipment.ts
        +-- weapons.ts
        +-- armor.ts
        +-- backgrounds.ts
        +-- feats.ts
        +-- conditions.ts
        +-- languages.ts
        +-- skills.ts
        +-- rules.ts
        +-- spell-slot-tables.ts
        +-- index.ts              (barrel export)
```

---

## Channel 2: Django Fixtures (Backend)

### Django Fixture Format

SRD data is also output as Django JSON fixtures for loading into PostgreSQL via `manage.py loaddata`. Each fixture file corresponds to a Django model:

```json
// backend/srd/fixtures/races.json (auto-generated -- do not edit manually)
[
  {
    "model": "srd.race",
    "pk": "dwarf",
    "fields": {
      "name": "Dwarf",
      "speed": 25,
      "size": "medium",
      "ability_bonuses": {"constitution": 2},
      "traits": ["darkvision", "dwarven-resilience", "stonecunning"]
    }
  }
]
```

### Django Management Commands

Custom management commands handle SRD data loading and validation:

```
python manage.py load_srd_data          -- Load all SRD fixtures into PostgreSQL
python manage.py load_srd_data --entity races  -- Load a single entity type
python manage.py validate_srd_data      -- Verify fixture data matches TypeScript files
python manage.py dump_srd_data          -- Export current DB SRD data as fixtures (dumpdata wrapper)
```

### Fixture Loading Strategy

- Fixtures are generated by the ETL pipeline alongside TypeScript files (an additional `etl:fixtures` step)
- Fixtures use natural keys (the SRD `index` field) as primary keys for idempotent loading
- `loaddata` is idempotent -- running it multiple times does not create duplicate records
- Fixtures are committed to the repository under `backend/srd/fixtures/` for deterministic deployments
- The `load_srd_data` management command is called during Docker container startup and CI setup

### Keeping Both Channels in Sync

The ETL pipeline produces both outputs from the same transformed intermediate data, ensuring consistency. The `validate_srd_data` management command cross-checks fixture data against the TypeScript files to catch drift.

---

## Update Strategy

1. Run `npm run etl:check-update` to compare pinned version against latest upstream release
2. Update `ETL_CONFIG.sourceVersion` in `etl/config.ts`
3. Run `npm run etl` for a full pipeline re-run (generates both TypeScript files and Django fixtures)
4. Review the diff in `src/data/` files and `backend/srd/fixtures/` files
5. Run the full test suite (frontend + backend) to catch breaking changes
6. Run `python manage.py validate_srd_data` to verify fixture/TypeScript consistency
7. Commit the updated data and fixture files

---

## Licensing

- **OGL 1.0a:** All SRD mechanical content (stats, spell mechanics, equipment tables) is distributable
- **MIT:** Both the 5e-database repo and ETL tooling code
- **Included:** Ability scores, hit dice, spell mechanics, equipment stats, race/class mechanical features, conditions, skills
- **Excluded:** Copyrighted flavor text, artwork, non-SRD content from paid sourcebooks, 2024 revision content
- **Required:** OGL notice in the app's About/Settings page
