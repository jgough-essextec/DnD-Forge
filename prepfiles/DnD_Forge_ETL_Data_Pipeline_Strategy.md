# D&D Character Forge — Phase 1 Addendum

## SRD Data Pipeline: Extract-Transform-Load Strategy

**Status:** Gap identified — the original spec and Phase 1 plan specified *what* data files to create but never defined *where* the data comes from, *how* it gets transformed, or *how* it gets loaded. This addendum closes that gap.

**Placement:** This is a Phase 1 concern. The data pipeline must run before the calculation engine can be tested against real data, and before any UI can render game content. It slots into **Epic 3 (SRD Game Data Layer)** as a new prerequisite story block.

---

## 1. Source Landscape Assessment

There are four viable sources for D&D 5e SRD game data. Each has tradeoffs.

### Source A: 5e SRD REST API (`dnd5eapi.co`)

The official community API serving structured JSON for all SRD content.

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://www.dnd5eapi.co/api/2014/` |
| **Auth** | None (completely open, GET only) |
| **Format** | REST JSON, also supports GraphQL |
| **License** | MIT (API code) + OGL 1.0a (game content) |
| **Coverage** | Ability scores, classes, conditions, damage types, equipment categories, equipment, features, languages, magic schools, proficiencies, races, skills, spells, subclasses, subraces, traits, weapon properties, alignments, backgrounds, feats, levels, magic items, monsters, rule sections, rules |
| **Structure** | Deeply nested JSON with cross-references via `APIReference { index, name, url }` |
| **Versioning** | `/api/2014/` for 2014 PHB rules; `/api/2024/` planned |
| **Strengths** | Clean REST interface, well-documented, typed schemas (OpenAPI spec available), actively maintained, no download needed |
| **Weaknesses** | Rate limits possible on bulk extraction, requires ~300+ HTTP calls to extract all spells individually, API-specific JSON shape doesn't match our type system directly |
| **Best for** | Quick prototyping, validation/cross-checking, or as a secondary source |

### Source B: 5e-database (`github.com/5e-bits/5e-database`)

The underlying data repository that powers the 5e SRD API above. Contains raw JSON files.

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/5e-bits/5e-database` |
| **Format** | Static JSON files in `src/2014/` directory |
| **License** | MIT + OGL 1.0a |
| **Coverage** | Same as the API (it IS the API's data source) |
| **Key files** | `5e-SRD-Races.json`, `5e-SRD-Classes.json`, `5e-SRD-Spells.json`, `5e-SRD-Equipment.json`, `5e-SRD-Features.json`, `5e-SRD-Traits.json`, `5e-SRD-Backgrounds.json`, `5e-SRD-Conditions.json`, `5e-SRD-Damage-Types.json`, `5e-SRD-Languages.json`, `5e-SRD-Proficiencies.json`, `5e-SRD-Skills.json`, `5e-SRD-Levels.json`, `5e-SRD-Subclasses.json`, `5e-SRD-Subraces.json`, `5e-SRD-Magic-Schools.json`, `5e-SRD-Weapon-Properties.json`, `5e-SRD-Ability-Scores.json`, `5e-SRD-Alignments.json`, `5e-SRD-Feats.json`, `5e-SRD-Magic-Items.json`, `5e-SRD-Monsters.json`, `5e-SRD-Rule-Sections.json`, `5e-SRD-Rules.json` |
| **Structure** | Same nested JSON as the API but as downloadable flat files |
| **Strengths** | Can clone entire dataset in one `git clone`, no rate limits, MIT licensed, versioned with semantic releases (currently v4.2.1), same structure as the API so documentation cross-applies, 843 stars / 407 forks (well-vetted), community-verified accuracy |
| **Weaknesses** | SRD only (no content from paid sourcebooks), JSON structure uses MongoDB-style `_id` fields and `APIReference` cross-references that need flattening |
| **Best for** | PRIMARY source — bulk download, offline processing, deterministic builds |

### Source C: 5etools-src (`github.com/5etools-mirror-3/5etools-src`)

The most comprehensive D&D 5e data repository, covering far more than just the SRD.

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/5etools-mirror-3/5etools-src` |
| **Format** | JSON files in `data/` directory |
| **License** | MIT (tooling code), OGL 1.0a (SRD content) — but non-SRD content sourced from paid books has unclear copyright status |
| **Coverage** | ALL published D&D 5e content including PHB, DMG, XGtE, TCoE, VGtM, MToF, and dozens more sourcebooks |
| **Key directories** | `data/races.json`, `data/class/` (one file per class), `data/spells/` (split by source book), `data/items.json`, `data/items-base.json`, `data/backgrounds.json`, `data/feats.json`, `data/conditionsdiseases.json`, `data/skills.json`, `data/languages.json` |
| **Structure** | Uses a custom tag/reference system (`{@creature goblin}`, `{@spell fireball}`) for internal linking, plus extensive metadata per entry |
| **Strengths** | Most complete dataset available, includes ALL subclasses/races/spells from every sourcebook, well-structured JSON, actively maintained, has a dedicated wiki for JSON schema |
| **Weaknesses** | Non-SRD content is copyrighted by Wizards of the Coast — using it requires users to own the source books. Custom tag system (`{@...}`) requires parsing/stripping. Large dataset (~hundreds of MB with all content) |
| **Best for** | FUTURE expansion source for homebrew/extended content. NOT for MVP due to copyright complexity. The SRD-filtered subset could be used for cross-validation. |

### Source D: Community JSON Schema (`github.com/BrianWendt/dnd5e_json_schema`)

A formal JSON Schema definition project for D&D 5e data structures.

| Attribute | Detail |
|-----------|--------|
| **URL** | `https://github.com/BrianWendt/dnd5e_json_schema` |
| **Format** | JSON Schema files defining data structures for races, spells, equipment, feats, features, actions, etc. |
| **License** | MIT |
| **Coverage** | Schema definitions (not data itself) |
| **Strengths** | Can be used to validate our transformed data, defines canonical field names |
| **Weaknesses** | No actual game data, just structure definitions |
| **Best for** | Validation reference during the Transform phase |

### Additional Minor Sources

| Source | URL | Notes |
|--------|-----|-------|
| BTMorton/dnd-5e-srd | `github.com/BTMorton/dnd-5e-srd` | SRD as markdown + JSON, simpler structure, useful for cross-checking |
| vorpalhex/srd_spells | `github.com/vorpalhex/srd_spells` | Deprecated, recommends 5etools instead |
| rogueturnip/5eImport | `github.com/rogueturnip/5eImport` | Tool that imports 5etools JSON into MongoDB — proves the ETL pattern works |

---

## 2. Recommended Source Strategy

### Primary: `5e-bits/5e-database` (Source B)

This is our primary extraction source for the following reasons:

- **Clean license:** MIT + OGL means zero copyright risk for SRD content
- **Static files:** One-time clone, no API rate limits, deterministic builds
- **API parity:** If we ever need to validate against the live API, the data structures match exactly
- **Community validated:** 843 stars, 89 contributors, 879 commits — this data has been reviewed extensively
- **Versioned:** Semantic releases let us pin to a specific data version and track updates
- **SRD scoped:** Contains only legally distributable content

### Secondary (Validation): `dnd5eapi.co` (Source A)

Used during the Transform phase to spot-check our transformed data against the live API. We'll call 20-30 specific endpoints to validate our transformation logic produces correct results.

### Future (Expansion): `5etools-mirror-3/5etools-src` (Source C)

Earmarked for Phase 6+ when we add homebrew/extended content support. The app architecture should be designed so swapping in a richer data source is a config change, not a rewrite. Users who own additional sourcebooks could point to their own 5etools dataset.

---

## 3. ETL Pipeline Architecture

### Overview

The pipeline runs as a **build-time Node.js script** (not runtime). It produces static TypeScript files that get bundled with the app. SRD data never hits the database at runtime — it's imported as constants.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BUILD-TIME ETL PIPELINE                         │
│                                                                        │
│  ┌──────────┐    ┌──────────────┐    ┌───────────┐    ┌──────────────┐ │
│  │ EXTRACT  │───>│  TRANSFORM   │───>│  VALIDATE │───>│    LOAD      │ │
│  │          │    │              │    │           │    │              │ │
│  │ Clone or │    │ Reshape JSON │    │ Type-check│    │ Write .ts    │ │
│  │ download │    │ to match our │    │ against   │    │ files into   │ │
│  │ 5e-db    │    │ TypeScript   │    │ interfaces│    │ src/data/    │ │
│  │ JSON     │    │ interfaces   │    │           │    │              │ │
│  └──────────┘    └──────────────┘    └───────────┘    └──────────────┘ │
│                                                                        │
│  npm run etl:extract → etl:transform → etl:validate → etl:load        │
│  npm run etl          (runs all four in sequence)                       │
└─────────────────────────────────────────────────────────────────────────┘

        ↓ produces ↓

┌─────────────────────────────────────────────────────────────────────────┐
│                    STATIC APP DATA (bundled at build)                   │
│                                                                        │
│  src/data/                                                              │
│  ├── races.ts              ← typed Race[] constant                     │
│  ├── classes.ts            ← typed Class[] constant                    │
│  ├── subclasses.ts         ← typed Subclass[] constant                 │
│  ├── spells.ts             ← typed Spell[] constant                    │
│  ├── spell-lists/                                                       │
│  │   ├── wizard.ts         ← spell IDs for wizard class                │
│  │   ├── cleric.ts         ← spell IDs for cleric class                │
│  │   └── ...                                                            │
│  ├── equipment.ts          ← typed EquipmentItem[] constant            │
│  ├── weapons.ts            ← typed Weapon[] constant                   │
│  ├── armor.ts              ← typed Armor[] constant                    │
│  ├── backgrounds.ts        ← typed Background[] constant               │
│  ├── feats.ts              ← typed Feat[] constant                     │
│  ├── conditions.ts         ← typed Condition[] constant                │
│  ├── languages.ts          ← typed Language[] constant                 │
│  ├── skills.ts             ← typed Skill[] constant                    │
│  ├── rules.ts              ← typed constants (XP table, proficiency,   │
│  │                            point buy, etc.)                          │
│  ├── spell-slot-tables.ts  ← progression tables                        │
│  └── index.ts              ← barrel export                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why Static Files Instead of Runtime API Calls?

The spec requires **offline-first (PWA)** and **no server dependency**. Fetching from `dnd5eapi.co` at runtime would break offline mode, add latency, and create a hard dependency on an external service. Instead, we extract the data once at build time and bake it into the bundle as typed constants. This gives us type safety at compile time, zero runtime overhead, offline-by-default, and deterministic builds.

---

## 4. Extract Phase

### Step E1: Clone the 5e-database Repository

```bash
# In the project root, outside the app's src/ directory
git clone --depth 1 --branch v4.2.1 https://github.com/5e-bits/5e-database.git etl/source-data
```

Pin to a specific release tag (v4.2.1 as of writing) so builds are reproducible. The shallow clone (`--depth 1`) keeps the download small.

### Step E2: Identify Source Files

The relevant files live under `etl/source-data/src/2014/`:

| Our Target | Source File(s) | Approx Records |
|-----------|----------------|----------------|
| races.ts | `5e-SRD-Races.json` + `5e-SRD-Subraces.json` + `5e-SRD-Traits.json` | 9 races, 18 subraces |
| classes.ts | `5e-SRD-Classes.json` + `5e-SRD-Subclasses.json` + `5e-SRD-Features.json` + `5e-SRD-Levels.json` | 12 classes, 12 subclasses |
| spells.ts | `5e-SRD-Spells.json` | ~320 spells |
| equipment.ts | `5e-SRD-Equipment.json` + `5e-SRD-Equipment-Categories.json` | ~250 items |
| weapons.ts | Filtered from `5e-SRD-Equipment.json` (weapon category) + `5e-SRD-Weapon-Properties.json` | ~40 weapons |
| armor.ts | Filtered from `5e-SRD-Equipment.json` (armor category) | ~17 items |
| backgrounds.ts | `5e-SRD-Backgrounds.json` | ~1 SRD background (Acolyte) |
| feats.ts | `5e-SRD-Feats.json` | ~1 SRD feat (Grappler) |
| conditions.ts | `5e-SRD-Conditions.json` | 15 conditions |
| languages.ts | `5e-SRD-Languages.json` | 16 languages |
| skills.ts | `5e-SRD-Skills.json` + `5e-SRD-Ability-Scores.json` | 18 skills, 6 abilities |
| rules.ts | `5e-SRD-Rules.json` + `5e-SRD-Rule-Sections.json` | Reference tables |
| spell-slot-tables.ts | `5e-SRD-Levels.json` (spellcasting progression per class) | 12×20 level entries |

### Step E3: Handle SRD Gaps

The SRD is intentionally limited. Critically, it only includes one background (Acolyte) and one feat (Grappler). For MVP completeness, we need to supplement from OGL-compatible sources or hand-author the missing data.

| Data Category | SRD Provides | Full PHB Has | Gap Strategy |
|---------------|-------------|-------------|-------------|
| Races | 9 core races + subraces | Same (core) | SRD sufficient for MVP |
| Classes | 12 classes + 1 subclass each | 12 classes + 2-4 subclasses each | SRD sufficient for MVP; additional subclasses are Phase 6 |
| Spells | ~320 spells | ~360 spells | SRD covers most combat/utility spells; sufficient for MVP |
| Backgrounds | 1 (Acolyte) | 13+ | **CRITICAL GAP** — hand-author 12 additional backgrounds from the OGL-available descriptions (names, proficiencies, feature names are OGL; flavor text is not) |
| Feats | 1 (Grappler) | 40+ | **CRITICAL GAP** — hand-author 10-15 commonly used feats from OGL content |
| Equipment | Full SRD list | Same (core) | SRD sufficient |

**Resolution:** Create `etl/supplements/` directory containing hand-authored JSON files for backgrounds and feats that fill the SRD gaps. These follow the same schema as the 5e-database source files but are maintained by us. All content must stay within OGL bounds (mechanical effects only, no copyrighted flavor text).

---

## 5. Transform Phase

### Transform Script: `etl/transform.ts`

A Node.js TypeScript script that reads raw 5e-database JSON and outputs our app's typed data files.

### Transformation Rules by Entity Type

#### T1: Races

**Input:** `5e-SRD-Races.json`, `5e-SRD-Subraces.json`, `5e-SRD-Traits.json`

**Transformations:**

1. **Flatten APIReferences:** Replace `{ index: "elf", name: "Elf", url: "/api/2014/races/elf" }` with just `"elf"` for IDs
2. **Merge subraces into parent:** The source splits races and subraces into separate files. Join them by `race.index` → `subrace.race.index`
3. **Resolve traits:** Each race has a `traits` array of APIReferences. Resolve these against `5e-SRD-Traits.json` and inline the full trait objects
4. **Normalize ability bonuses:** Source uses `ability_bonuses: [{ ability_score: { index: "dex" }, bonus: 2 }]`. Transform to `abilityScoreIncrease: { dexterity: 2 }`
5. **Extract choice nodes:** Races like Half-Elf have `ability_bonus_options` (choose N from a list). Transform to our `ChoiceConfig` type
6. **Map speed:** Source uses `speed: 30`. Transform to `speed: { walk: 30 }`
7. **Map senses:** Extract from traits (e.g., Darkvision 60ft) into structured `Sense` objects
8. **Map resistances:** Extract from traits (e.g., Dwarven Resilience → poison resistance) into `Resistance` objects
9. **Map languages:** Transform from `languages: [APIRef, ...]` + `language_options` to `{ fixed: string[], choose?: number }`
10. **Generate stable IDs:** Use the `index` field as our ID (e.g., `"elf"`, `"high-elf"`)

#### T2: Classes

**Input:** `5e-SRD-Classes.json`, `5e-SRD-Subclasses.json`, `5e-SRD-Features.json`, `5e-SRD-Levels.json`

**Transformations:**

1. **Build level-by-level feature map:** The source has features as a flat list with `level: N`. Group them into `features: Record<number, Feature[]>`
2. **Build spell slot progression:** The `5e-SRD-Levels.json` file contains `spellcasting` data per class per level. Extract into our `SpellSlotProgression` table
3. **Resolve proficiency choices:** Source uses `proficiency_choices: [{ choose: 2, from: { options: [...] } }]`. Map to our `SkillChoices` type
4. **Normalize starting equipment:** Source uses `starting_equipment` (guaranteed items) + `starting_equipment_options` (choose-one groups). Combine into our `StartingEquipmentChoice[]`
5. **Extract subclass metadata:** Map `subclasses` array to our `Subclass` type, joining against `5e-SRD-Subclasses.json` for features
6. **Map hit die:** Direct mapping: `hit_die: 10` → `hitDie: 10`
7. **Map saving throws:** `saving_throws: [{ index: "str" }, { index: "con" }]` → `savingThrows: ['strength', 'constitution']`
8. **Calculate ASI levels:** Not in source data — hardcode per class (most: [4,8,12,16,19]; Fighter: [4,6,8,12,14,16,19]; Rogue: [4,8,10,12,16,19])

#### T3: Spells

**Input:** `5e-SRD-Spells.json`

**Transformations:**

1. **Map spell level:** `level: 0` → cantrip, `level: 1-9` → spell level
2. **Parse components:** Source has `components: ["V", "S", "M"]` + `material: "string"`. Transform to our `SpellComponents { verbal, somatic, material, materialDescription }`
3. **Parse casting time:** Source has `casting_time: "1 action"`. Parse into `{ value: 1, unit: 'action' }`
4. **Parse range:** Source has `range: "120 feet"` or `"Self"` or `"Touch"`. Parse into our `SpellRange` type
5. **Parse duration:** Source has `duration: "Concentration, up to 1 minute"`. Parse into `{ type: 'concentration', value: 1, unit: 'minute' }`
6. **Map concentration flag:** `concentration: true/false` — direct mapping
7. **Map ritual flag:** `ritual: true/false` — direct mapping
8. **Extract class lists:** `classes: [{ index: "wizard" }, ...]` → `classes: ["wizard", ...]`
9. **Extract damage data:** Source has nested `damage.damage_type` and `damage.damage_at_slot_level`. Transform to our `DamageDice` type
10. **Build per-class spell indices:** Group spell IDs by class for the `spell-lists/*.ts` files

#### T4: Equipment / Weapons / Armor

**Input:** `5e-SRD-Equipment.json`, `5e-SRD-Weapon-Properties.json`

**Transformations:**

1. **Split by category:** Filter source equipment into weapons, armor, adventuring gear, tools
2. **Normalize weapon properties:** Source uses `properties: [{ index: "finesse" }]`. Transform to `properties: ['finesse']`
3. **Parse damage dice:** Source uses `damage: { damage_dice: "1d8", damage_type: { index: "slashing" } }`. Transform to our `DamageDice` type
4. **Parse weapon range:** `range: { normal: 80, long: 320 }` → direct mapping
5. **Parse armor AC:** Source uses `armor_class: { base: 14, dex_bonus: true, max_bonus: 2 }`. Transform to our `Armor` type with `baseAC`, `dexCap`, etc.
6. **Parse costs:** `cost: { quantity: 50, unit: "gp" }` → `cost: { amount: 50, unit: 'gp' }`
7. **Parse weight:** Direct mapping with unit standardization to pounds

#### T5: Backgrounds (Supplemented)

**Input:** `5e-SRD-Backgrounds.json` + `etl/supplements/backgrounds.json`

**Transformations:**

1. **Merge SRD and supplement data** into a single array
2. **Map proficiencies:** Resolve APIReferences to skill names
3. **Map equipment:** Flatten equipment lists
4. **Build personality tables:** Structure d8/d6 tables for traits/ideals/bonds/flaws

#### T6: Conditions, Languages, Skills, Rules

These are mostly direct mappings with field renaming (snake_case → camelCase) and APIReference flattening.

---

## 6. Validate Phase

### Validation Script: `etl/validate.ts`

Runs after transformation to catch data quality issues before they reach the app.

**Validation checks:**

1. **TypeScript compilation:** Import every generated `.ts` file and verify it compiles without errors against our type interfaces
2. **Completeness checks:**
   - All 9 SRD races present
   - All 12 SRD classes present
   - All 12 SRD subclasses present
   - All 18 skills mapped to correct abilities
   - All 14 conditions present
   - Spell count matches expected (~320)
   - All armor types present (13 + shield)
3. **Referential integrity:**
   - Every spell's class list references valid class IDs
   - Every subclass references a valid parent class
   - Every race trait has a description
   - Every class feature references a valid level
4. **Cross-check against live API (sample-based):**
   - Fetch 5 random races from `dnd5eapi.co` and compare key fields
   - Fetch 10 random spells and compare level, school, components, classes
   - Fetch 5 random equipment items and compare cost, weight, properties
5. **Calculation engine smoke test:**
   - Run the calculation engine against 3 pre-built test characters using the transformed data
   - Verify AC, HP, skill modifiers, spell save DCs match hand-calculated values

---

## 7. Load Phase

### Load Script: `etl/load.ts`

Writes validated data into `src/data/` as TypeScript files.

**Output format:**

```typescript
// src/data/races.ts (auto-generated — do not edit manually)
// Source: 5e-bits/5e-database v4.2.1
// Generated: 2026-03-03T12:00:00Z

import type { Race } from '@/types';

export const races: readonly Race[] = [
  {
    id: 'dwarf',
    name: 'Dwarf',
    description: 'Bold and hardy...',
    abilityScoreIncrease: { constitution: 2 },
    age: 'Dwarves mature at the same rate as humans...',
    size: 'Medium',
    speed: { walk: 25 },
    senses: [{ type: 'darkvision', range: 60 }],
    traits: [ /* ... */ ],
    languages: { fixed: ['common', 'dwarvish'] },
    subraces: [
      { id: 'hill-dwarf', name: 'Hill Dwarf', /* ... */ },
      { id: 'mountain-dwarf', name: 'Mountain Dwarf', /* ... */ },
    ],
    // ...
  },
  // ...
] as const;
```

**Key load decisions:**

- **`as const` assertion** on all arrays so TypeScript narrows the types
- **`readonly` arrays** to enforce immutability at the type level
- **Generated header comment** with source version and timestamp for traceability
- **No JSON files at runtime** — everything is `.ts` for type safety and tree-shaking
- **Barrel export** from `src/data/index.ts` for clean imports

---

## 8. Pipeline Tooling & NPM Scripts

### Directory Structure

```
project-root/
├── etl/                          ← ETL pipeline (NOT shipped in app bundle)
│   ├── source-data/              ← git-cloned 5e-database (gitignored)
│   ├── supplements/              ← hand-authored gap-fill data (committed)
│   │   ├── backgrounds.json      ← 12 additional backgrounds
│   │   └── feats.json            ← 10-15 additional feats
│   ├── extract.ts                ← Clone/download script
│   ├── transform.ts              ← Main transformation logic
│   ├── transformers/             ← Per-entity transform modules
│   │   ├── races.ts
│   │   ├── classes.ts
│   │   ├── spells.ts
│   │   ├── equipment.ts
│   │   ├── backgrounds.ts
│   │   └── ...
│   ├── validate.ts               ← Validation script
│   ├── load.ts                   ← Output writer
│   ├── config.ts                 ← Source version, paths, feature flags
│   └── utils.ts                  ← Shared helpers (APIRef resolver, case converters)
├── src/
│   └── data/                     ← OUTPUT: generated TypeScript data files (committed)
│       ├── races.ts
│       ├── classes.ts
│       ├── spells.ts
│       └── ...
```

### NPM Scripts

```json
{
  "scripts": {
    "etl:extract": "ts-node etl/extract.ts",
    "etl:transform": "ts-node etl/transform.ts",
    "etl:validate": "ts-node etl/validate.ts",
    "etl:load": "ts-node etl/load.ts",
    "etl": "npm run etl:extract && npm run etl:transform && npm run etl:validate && npm run etl:load",
    "etl:check-update": "ts-node etl/check-update.ts"
  }
}
```

### Config File: `etl/config.ts`

```typescript
export const ETL_CONFIG = {
  sourceRepo: 'https://github.com/5e-bits/5e-database.git',
  sourceVersion: 'v4.2.1',
  sourceDir: 'etl/source-data',
  supplementsDir: 'etl/supplements',
  outputDir: 'src/data',
  validationApiBase: 'https://www.dnd5eapi.co/api/2014',
  validationSampleSize: 10,
};
```

---

## 9. Data Versioning & Update Strategy

### Initial Load

The ETL pipeline runs once during Phase 1 setup. The generated `src/data/*.ts` files are committed to the repository so that:

- Developers don't need to run the ETL pipeline for normal development
- CI/CD builds are deterministic
- The app builds without network access

### Updating Data

When the upstream `5e-bits/5e-database` releases a new version:

1. Run `npm run etl:check-update` — compares pinned version against latest release
2. Update `ETL_CONFIG.sourceVersion` to the new tag
3. Run `npm run etl` — full pipeline re-run
4. Review the diff in `src/data/` files
5. Run the full test suite to catch any breaking changes
6. Commit the updated data files

### Future: 5etools Integration (Phase 6+)

The transform layer is designed with a **source adapter pattern**. Each transformer accepts a generic intermediate representation, not raw source JSON. To add 5etools as a source:

1. Create `etl/adapters/5etools.ts` that reads 5etools JSON format and outputs the same intermediate representation
2. Strip 5etools-specific tags (`{@creature ...}`, `{@spell ...}`) into plain text or structured references
3. Filter by source book (only include content the user owns)
4. The transform, validate, and load phases remain unchanged

---

## 10. Updated Phase 1 Epic 3 — Revised Stories & Tasks

This replaces the original Epic 3 stories with an ETL-aware version.

### Story 3.0 — ETL Pipeline Infrastructure (NEW — prerequisite for all other Story 3.x)

> As a developer, I need a working ETL pipeline that extracts 5e SRD data from the 5e-database repository and transforms it into our typed data files.

**Tasks:**

- [ ] **T3.0.1** — Create `etl/` directory structure and `etl/config.ts` with source configuration
- [ ] **T3.0.2** — Implement `etl/extract.ts`: git clone `5e-bits/5e-database` at pinned version to `etl/source-data/`; skip if already cloned at correct version
- [ ] **T3.0.3** — Implement `etl/utils.ts`: shared helpers — `resolveApiRef()` (flatten APIReferences), `snakeToCamel()` (field name conversion), `parseRange()`, `parseDuration()`, `parseCastingTime()`, `parseDamageDice()`
- [ ] **T3.0.4** — Implement `etl/load.ts`: generic writer that takes a typed array and a target filename, writes a `.ts` file with proper imports, `as const`, readonly, and generated-file header
- [ ] **T3.0.5** — Implement `etl/validate.ts`: framework for running completeness checks, referential integrity checks, and optional API cross-checks
- [ ] **T3.0.6** — Add npm scripts for `etl:extract`, `etl:transform`, `etl:validate`, `etl:load`, and combined `etl`
- [ ] **T3.0.7** — Add `etl/source-data/` to `.gitignore` (raw source is not committed)
- [ ] **T3.0.8** — Install dev dependencies: `ts-node`, `simple-git` (for programmatic git clone)

### Story 3.1 — Race Data Transformer (REVISED)

> As a developer, I need the race transformer to produce typed race data from the 5e-database source.

**Tasks:**

- [ ] **T3.1.1** — Implement `etl/transformers/races.ts`: read `5e-SRD-Races.json`, `5e-SRD-Subraces.json`, `5e-SRD-Traits.json`; apply all T1 transformation rules; output typed `Race[]`
- [ ] **T3.1.2** — Handle race-specific choice nodes: Half-Elf ability bonus choices, High Elf cantrip choice, Half-Elf skill choices, Dragonborn ancestry choice
- [ ] **T3.1.3** — Extract and structure racial innate spellcasting (Tiefling, Drow)
- [ ] **T3.1.4** — Validate output: 9 races, correct subraces per race, all ability bonuses present
- [ ] **T3.1.5** — Write `src/data/races.ts` and `src/data/languages.ts`

### Story 3.2 — Class Data Transformer (REVISED)

> As a developer, I need the class transformer to produce typed class data with full level progression.

**Tasks:**

- [ ] **T3.2.1** — Implement `etl/transformers/classes.ts`: read all class source files; apply T2 transformation rules
- [ ] **T3.2.2** — Build `features: Record<number, Feature[]>` by grouping features from `5e-SRD-Features.json` by class and level
- [ ] **T3.2.3** — Build spell slot progression tables from `5e-SRD-Levels.json` for each spellcasting type
- [ ] **T3.2.4** — Hardcode ASI levels per class (not in source data)
- [ ] **T3.2.5** — Hardcode starting gold dice formulas per class (not in source data)
- [ ] **T3.2.6** — Build multiclass spell slot table (not in source data — derive from 5e rules)
- [ ] **T3.2.7** — Validate output: 12 classes, 20 levels of features each, correct spell progressions
- [ ] **T3.2.8** — Write `src/data/classes.ts`, `src/data/subclasses.ts`, `src/data/spell-slot-tables.ts`

### Story 3.3 — Spell Data Transformer (REVISED)

> As a developer, I need the spell transformer to produce a searchable spell database with per-class spell lists.

**Tasks:**

- [ ] **T3.3.1** — Implement `etl/transformers/spells.ts`: read `5e-SRD-Spells.json`; apply T3 transformation rules
- [ ] **T3.3.2** — Parse all string-format fields (casting time, range, duration, components) into structured types
- [ ] **T3.3.3** — Build per-class spell index files under `src/data/spell-lists/`
- [ ] **T3.3.4** — Validate output: ~320 spells, every spell has valid school/level/classes
- [ ] **T3.3.5** — Cross-check 10 spells against live API for accuracy
- [ ] **T3.3.6** — Write `src/data/spells.ts` and `src/data/spell-lists/*.ts`

### Story 3.4 — Equipment Data Transformer (REVISED)

> As a developer, I need equipment data split into weapons, armor, gear, and tools.

**Tasks:**

- [ ] **T3.4.1** — Implement `etl/transformers/equipment.ts`: read `5e-SRD-Equipment.json`; split by category; apply T4 transformation rules
- [ ] **T3.4.2** — Transform weapon properties with full rule effects from `5e-SRD-Weapon-Properties.json`
- [ ] **T3.4.3** — Transform armor with complete AC calculation metadata (base, dex cap, stealth disadvantage, STR requirement)
- [ ] **T3.4.4** — Build equipment packs from equipment categories
- [ ] **T3.4.5** — Validate: all 13 armor types + shield present, all weapon properties mapped
- [ ] **T3.4.6** — Write `src/data/weapons.ts`, `src/data/armor.ts`, `src/data/equipment.ts`, `src/data/tools.ts`, `src/data/equipment-packs.ts`

### Story 3.5 — Supplemental Data Authoring (NEW)

> As a developer, I need hand-authored data for backgrounds and feats that the SRD doesn't cover.

**Tasks:**

- [ ] **T3.5.1** — Author `etl/supplements/backgrounds.json` with 12 additional backgrounds: Charlatan, Criminal, Entertainer, Folk Hero, Guild Artisan, Hermit, Noble, Outlander, Sage, Sailor, Soldier, Urchin — using only OGL-safe mechanical data (proficiencies, equipment, feature names, personality table structures)
- [ ] **T3.5.2** — Author `etl/supplements/feats.json` with 10-15 commonly used feats: Alert, Crossbow Expert, Defensive Duelist, Dual Wielder, Great Weapon Master, Lucky, Mage Slayer, Mobile, Observant, Polearm Master, Sentinel, Sharpshooter, Tough, War Caster — using only OGL-safe mechanical data
- [ ] **T3.5.3** — Implement `etl/transformers/backgrounds.ts` and `etl/transformers/feats.ts` that merge SRD + supplements
- [ ] **T3.5.4** — Validate combined output against type interfaces
- [ ] **T3.5.5** — Write `src/data/backgrounds.ts` and `src/data/feats.ts`

### Story 3.6 — Reference Data & Conditions (REVISED)

> As a developer, I need conditions, damage types, skills, and game rule constants.

**Tasks:**

- [ ] **T3.6.1** — Transform `5e-SRD-Conditions.json` → `src/data/conditions.ts` with mechanical effects
- [ ] **T3.6.2** — Transform `5e-SRD-Damage-Types.json` → `src/data/damage-types.ts`
- [ ] **T3.6.3** — Transform `5e-SRD-Skills.json` + `5e-SRD-Ability-Scores.json` → `src/data/skills.ts` with ability mappings
- [ ] **T3.6.4** — Author `src/data/rules.ts` with all reference constants (XP table, proficiency bonus table, point buy costs, standard array, currency conversion rates, carrying capacity multipliers)
- [ ] **T3.6.5** — Validate all reference data for completeness

### Story 3.7 — Full Pipeline Integration Test (NEW)

> As a developer, I need confidence that the entire ETL pipeline produces correct, complete, type-safe data.

**Tasks:**

- [ ] **T3.7.1** — Run full `npm run etl` from a clean state and verify all output files are generated
- [ ] **T3.7.2** — Run `tsc --noEmit` on all generated data files — zero TypeScript errors
- [ ] **T3.7.3** — Run automated validation checks — all pass
- [ ] **T3.7.4** — Build 3 test characters from generated data and verify calculation engine produces correct derived stats:
  - Test Character 1: Human Fighter (Champion) level 5, Standard Array, Chain Mail + Shield → AC 18, HP 44 (average)
  - Test Character 2: High Elf Wizard (Evocation) level 3, Point Buy (INT 15+1), no armor → AC 10+DEX, 5 prepared spells
  - Test Character 3: Hill Dwarf Cleric (Life) level 1, Rolled stats, Scale Mail + Shield → AC 18 (14+2+2), Spell Save DC 13 (8+2+3)
- [ ] **T3.7.5** — Commit all generated `src/data/*.ts` files to the repository
- [ ] **T3.7.6** — Document the ETL process in `etl/README.md` with setup instructions, update procedure, and troubleshooting

---

## 11. Licensing & Legal Notes

All data included in the app must comply with the following:

- **OGL 1.0a (Open Game License):** The D&D 5e SRD content is released under this license. Mechanical game rules, stat blocks, spell descriptions, and equipment tables are OGL-safe.
- **MIT License:** Both the 5e-bits/5e-database repo and the 5etools-src repo use MIT for their tooling code.
- **What we CAN include:** Ability scores, hit dice, spell mechanics, equipment stats, race/class mechanical features, conditions, skills — all mechanical game content from the SRD.
- **What we CANNOT include:** Copyrighted flavor text, artwork, character names from published adventures, non-SRD subclasses/races/spells/feats from paid sourcebooks (PHB, XGtE, TCoE, etc.), or any content from the D&D 5e 2024 revision (different license).
- **OGL notice requirement:** The app must include an OGL notice in the About/Settings page attributing the SRD content.
- **Future 5etools integration:** Users importing non-SRD content must own the relevant sourcebooks. The app should display a disclaimer and not redistribute this data.
