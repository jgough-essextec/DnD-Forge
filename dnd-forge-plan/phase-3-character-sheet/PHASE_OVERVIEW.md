# Phase 3: Character Sheet & Management

## Timeline
**Weeks 5-6**

## Summary
Deliver a full-fidelity, 3-page digital character sheet with both read-only view and inline edit modes, a character gallery home screen with search/filter/sort, and complete character lifecycle management (duplicate, archive, delete, import, export). By the end of Phase 3, a player can view, edit, manage, and share their characters as fully functional digital character sheets.

## Phase 2 Dependencies
Phase 3 assumes all Phase 2 deliverables are complete — the creation wizard (guided + freeform), all wizard step components and data pickers, and the ability to save a valid level-1 character to IndexedDB. Phase 3 builds the "post-creation" experience: what happens after you hit "Save Character."

## Epics

| Epic | Name | Description |
|------|------|-------------|
| 17 | Character Sheet — Page 1 (Core Stats) | Pixel-accurate digital recreation of the D&D 5e character sheet Page 1: identity, ability scores, skills, saving throws, combat stats, attacks, personality, and features |
| 18 | Character Sheet — Page 2 (Backstory & Details) | Second page: character appearance, backstory narrative, allies & organizations, additional features, equipment/inventory with weight tracking, and currency |
| 19 | Character Sheet — Page 3 (Spellcasting) | Comprehensive spellcasting page: spellcasting header stats, spell slot tracking, organized spell lists by level with prepared spell toggles |
| 20 | View / Edit Mode Toggle System | Seamless mode-switching between clean read-only view and full-featured editing form, with auto-save, undo history, and cascade recalculation |
| 21 | Character Gallery (Home Screen) | Visually rich gallery of all characters with search, filter, sort, and character management actions — the primary entry point |
| 22 | JSON Import / Export | Export characters as portable JSON files and import characters from JSON, enabling sharing, backup, and migration |
| 23 | Character Avatar / Portrait System | Upload, crop, and display character portrait/avatar throughout the app |
| 24 | Character Sheet Responsive Design | Full usability across all device sizes, from mobile phones to wide desktop monitors |
| 25 | Routing & Navigation | React Router route structure, top bar, side navigation, settings, and page transitions |

## Key Deliverables
1. Three-page character sheet (Core Stats, Backstory & Details, Spellcasting) with accurate D&D 5e layout
2. View mode (clean read-only rendering with click-to-roll) and Edit mode (inline editing with auto-save, undo/redo, cascade recalculation)
3. Character gallery home screen with search, filter, sort, grid/list views
4. Character lifecycle management: duplicate, archive, delete
5. JSON import/export with 5-stage validation pipeline and batch support
6. Share via URL (compressed base64-encoded character data)
7. Avatar/portrait system with upload, crop, and default generation
8. Responsive design across mobile, tablet, desktop, and wide breakpoints
9. Print-friendly styles for browser printing
10. Full routing with clean URLs, breadcrumbs, 404 handling, page transitions
11. Settings and preferences page

## Pre-Phase Audit Notes

### Gap S1 — The Character Sheet Has More Fields Than the Wizard Produces
The wizard creates a level-1 character, but the character sheet must display fields that don't yet have values (Current HP, Temp HP, Death Saves, Hit Dice Used, Spell Slots Used, Conditions, XP, Treasure, Attunement, Additional Features). The sheet must gracefully handle empty states with placeholder text, empty slot indicators, or collapsed sections.

### Gap S2 — Edit Mode Must Handle Cascading Recalculations
When a player edits a core value (e.g., changes an ability score), dozens of derived values must update instantly. The edit mode must run the full calculation engine on every relevant change with debounced reactivity — not on every keystroke, but on field blur or after a 300ms pause.

### Gap S3 — The Official 5e Sheet Layout Has Specific Spatial Conventions
The standard D&D 5e character sheet has a specific layout players expect. Page 1: top banner, left column (abilities, saves, skills), center column (AC/initiative/speed, HP, attacks), right column (personality, features). Page 2: appearance, portrait, backstory, equipment, currency. Page 3: spellcasting header, spell levels with slot trackers.

### Gap S4 — Gallery Card Must Convey Identity at a Glance
Players identify characters by name, race, class, and level (in that priority order). Visual differentiation (avatar color, class icon) is critical when names are similar.

### Gap S5 — JSON Import Requires Robust Validation and Migration
Import must handle malformed JSON, wrong schema, version mismatch, duplicate IDs, invalid data references, and oversized data with clear error messages.

### Gap S6 — Edit Mode vs. View Mode Are Two Distinct UX Paradigms
View mode: clean typography, no visible form controls. Edit mode: smart form with inline validation and visible calculation engine. Transition must be seamless.

### Gap S7 — Attacks Section Is Computed, Not Just Stored
The Attacks & Spellcasting section generates attack rows from equipped weapons with computed attack bonuses and damage values based on proficiency, ability modifiers, and weapon properties.

### Gap S8 — Avatar/Portrait System
Support image upload (JPEG/PNG, max 2MB) stored as base64 in IndexedDB, crop/resize to standard aspect ratio, fallback default avatar based on race/class.

## Dependencies
- Phase 1: Types, SRD data, calculation engine, database layer, state stores, dice engine
- Phase 2: Character creation wizard (guided and freeform modes), all wizard step components and data pickers, valid level-1 character save to IndexedDB

## Recommended Build Order
1. **Week 5, Day 1-2:** Epic 25 (Routing scaffold) + Epic 20 (Mode toggle system)
2. **Week 5, Day 3-5:** Epic 17 (Page 1) — the most complex page with the most components
3. **Week 5 overflow to Week 6, Day 1:** Epic 18 (Page 2) + Epic 19 (Page 3) — can be parallelized
4. **Week 6, Day 2-3:** Epic 21 (Gallery) + Epic 23 (Avatar)
5. **Week 6, Day 4-5:** Epic 22 (Import/Export) + Epic 24 (Responsive polish) + Epic 25 (Settings/nav finalization)

## Statistics

| Category | Count |
|----------|-------|
| Epics | 9 (Epic 17-25) |
| Stories | 38 |
| Tasks | ~155 |
| New Components | ~45+ |
| Character Sheet Sections | ~25 distinct display components |
| Responsive Breakpoints | 4 (mobile, tablet, desktop, wide) |
| Edit Mode Features | Auto-save, undo/redo, cascade recalc, mode toggle |
| Import Validation Stages | 5 |
| Gallery Features | Search, 4 filter types, 6 sort options, grid/list toggle |
