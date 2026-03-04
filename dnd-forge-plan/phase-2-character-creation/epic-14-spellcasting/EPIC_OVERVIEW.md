# Epic 14: Spellcasting Step (Conditional)
> **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Summary

A spell selection interface shown only for classes that have spellcasting at level 1 (Bard, Cleric, Druid, Sorcerer, Warlock, Wizard). Supports cantrip selection, known/prepared spell selection, and provides a rich spell browsing experience with full details. Handles three distinct spellcasting systems: known casters (Bard, Sorcerer, Warlock), prepared casters (Cleric, Druid), and spellbook casters (Wizard). The step is conditionally skipped for non-casters and classes that do not receive spells at level 1 (Paladin, Ranger, Fighter, Rogue).

## Stories

| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 14.1 | Spell Step Conditional Rendering | 3 | Skip step for non-casters at level 1, update progress bar to show "N/A", Sorcerer ancestry note |
| 14.2 | Cantrip Selection | 4 | Cantrip card grid with class-specific count, racial cantrip pre-locking, cantrip card component |
| 14.3 | Level 1 Spell Selection | 6 | Spell list browser for known/prepared/spellbook casters, computed prepared count, Warlock Pact Magic handling |
| 14.4 | Spell Detail Cards & Browser | 5 | Comprehensive spell detail display, filter bar, list virtualization, recommended spells, spell comparison |
| 14.5 | Spell Step Validation & State | 3 | Validation of cantrip/spell counts per class system, persistence of all spell selections |

## Technical Scope

- **SpellStep.tsx** — Step 6 container with conditional rendering logic
- **CantripSelector.tsx** — Cantrip card grid with class count enforcement
- **SpellSelector.tsx** — Browsable, searchable, filterable level 1 spell list with detail pane
- **SpellDetailCard.tsx** — Full spell info: header, properties, components, description, damage/healing
- **SpellFilterBar.tsx** — Search, school filter, casting time filter, ritual/concentration toggles, sort
- Windowed/virtualized spell list for performance (100+ spells)
- Spell count computation based on spellcasting ability modifier + class level
- Three spellcasting systems: known (Bard/Sorcerer/Warlock), prepared (Cleric/Druid), spellbook (Wizard)
- Warlock Pact Magic special handling (short rest recharge, single slot at level 1)
- SRD spell data (static JSON from Phase 1)

## Dependencies

- **Depends on:** Epic 8 (Wizard Shell — conditional step skip logic), Epic 9 (racial cantrips from High Elf/Tiefling), Epic 10 (class determines spellcasting type, spell list, cantrip/spell counts), Epic 11 (spellcasting ability modifier for prepared spell count), Phase 1 SRD spell data
- **Blocks:** Epic 15 (review displays spellcasting page with all spell selections)
