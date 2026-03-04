# Epic 3: SRD Game Data Layer
> **Phase 1: Foundation** (Weeks 1-2)

## Summary
All D&D 5e Systems Reference Document data is structured as static JSON files, importable as typed constants. This is the game's reference library — immutable at runtime.

## Stories
| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 3.1 | Race Data Files | 4 | Complete race data for all 9 SRD races with subraces, traits, ability score increases, senses, proficiencies, and languages |
| 3.2 | Class Data Files | 6 | Complete class data for all 12 SRD classes with level-by-level feature progression, proficiencies, spell slot tables, and subclasses |
| 3.3 | Spell Database | 5 | Complete SRD spell list (~300 spells) as a searchable, filterable dataset with class spell lists and utility functions |
| 3.4 | Equipment Database | 6 | All SRD weapons, armor, adventuring gear, tools, and equipment packs as structured data |
| 3.5 | Background Data | 3 | All SRD backgrounds with proficiencies, equipment, features, and personality characteristic tables |
| 3.6 | Feat Data | 3 | All SRD feats with prerequisites and mechanical effects, plus availability filter function |
| 3.7 | Reference Tables & Constants | 3 | All static game rule tables as typed constants: modifier table, proficiency bonus, XP thresholds, point buy costs, conditions, currency rates |

## Technical Scope
- **Data format:** Static JSON or TypeScript files with full type conformance to Epic 2 types
- **Import pattern:** `import { races } from '@/data/races'` with full type inference
- **Coverage:** 9 races (with subraces), 12 classes (with SRD subclasses), ~300 spells, all SRD weapons/armor/gear/tools, 13+ backgrounds, SRD feats, all reference tables
- **Utility functions:** `getSpellsByClass()`, `searchSpells()`, `getAvailableFeats()` for data querying
- **Validation:** Every data entry must conform to its type interface; cross-check against SRD source for accuracy

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 3.1 — Race Data Files | 10 | 0 | 0 | 10 |
| 3.2 — Class Data Files | 10 | 0 | 0 | 10 |
| 3.3 — Spell Database | 10 | 0 | 0 | 10 |
| 3.4 — Equipment Database | 10 | 0 | 0 | 10 |
| 3.5 — Background Data | 8 | 0 | 0 | 8 |
| 3.6 — Feat Data | 9 | 0 | 0 | 9 |
| 3.7 — Reference Tables & Constants | 10 | 0 | 0 | 10 |
| **Totals** | **67** | **0** | **0** | **67** |

### Key Gaps Found
- Cross-referencing between data files: equipment packs referencing adventuring gear IDs, background equipment referencing item IDs — linkage mechanism not specified
- Dragonborn Breath Weapon damage scaling storage format unclear
- Spell data: cantrip scaling at character levels 5, 11, 17 stored as text only, not structured data
- Complex class features (Wild Shape, Rage) need separate description files but linking mechanism not specified
- Full PHB feat list vs SRD-only coverage ambiguity
- CONDITION_EFFECTS structured format schema not defined

## Dependencies
- **Depends on:** Epic 2 (Type System) — data files must conform to the defined types
- **Blocks:** Epic 4 (Calculation Engine) — calculations consume SRD data
