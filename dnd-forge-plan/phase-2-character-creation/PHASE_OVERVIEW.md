# Phase 2: Character Creation Wizard

> **Timeline:** Weeks 3-4
> **Phase Goal:** Deliver a fully functional, guided character creation wizard that walks players through the official D&D 5e creation process step-by-step, as well as a freeform creation mode for experienced players. By the end of Phase 2, a user can create a complete, valid level-1 character and save it to IndexedDB.

## Summary

Phase 2 builds the core user-facing feature of D&D Character Forge: the character creation wizard. This phase implements a multi-step guided wizard (8 steps including intro), a parallel freeform creation mode, and all the data-driven UI components needed to select races, classes, ability scores, backgrounds, equipment, and spells. The wizard integrates with the Phase 1 foundation (type system, SRD game data, calculation engine, Dexie.js database, Zustand stores, dice engine) to produce complete, validated level-1 characters persisted to IndexedDB.

## Epics

| Epic | Name | Stories | Description |
|------|------|---------|-------------|
| 8 | Wizard Framework & Navigation | 3 | Reusable multi-step wizard shell, progress tracking, validation gating, state persistence, guided and freeform modes |
| 9 | Race Selection Step | 5 | Race card gallery, detail panel, subrace selection, race-specific choice panels, validation |
| 10 | Class Selection Step | 6 | Class card gallery, detail panel, skill proficiency selection, level-1 subclass, fighting style, validation |
| 11 | Ability Score Step | 6 | Method selection, Standard Array drag-and-drop, Point Buy sliders, Dice Rolling animation, summary, validation |
| 12 | Background & Personality Step | 4 | Background selection, personality characteristics, character description/identity, validation |
| 13 | Equipment Selection Step | 3 | Starting equipment packages, gold buy mode, validation |
| 14 | Spellcasting Step (Conditional) | 5 | Conditional rendering, cantrip selection, spell selection, spell detail browser, validation |
| 15 | Review & Finalize Step | 4 | Character sheet preview, validation summary, save & assembly, quick edit from review |
| 16 | Shared Wizard Components & Utilities | 3 | Shared selection components, tooltip/help system, modifier/stat display components |

## Key Deliverables

1. **Guided Wizard** — A player can complete all 7 steps of the guided wizard and save a valid level-1 character for every one of the 12 classes
2. **Freeform Mode** — A player can create a character using the freeform mode and save it
3. **All Races** — All 9 SRD races with all subraces and all conditional choices work correctly
4. **All Classes** — All 12 SRD classes with correct skill counts, level-1 subclass selection, and fighting style selection work correctly
5. **Ability Scores** — All 3 methods (Standard Array, Point Buy, Rolling) produce valid scores with racial bonuses correctly applied
6. **Backgrounds** — All SRD backgrounds are selectable with skill overlap detection and replacement working
7. **Equipment** — Both starting equipment packages and gold-buy mode work; AC computes correctly from armor selection
8. **Spellcasting** — Cantrip and spell selection works for all 6 level-1 casting classes with correct counts
9. **Review** — Character preview shows all 3 pages with correctly computed derived stats
10. **Persistence** — Wizard state survives browser refresh (sessionStorage); saved characters appear in character gallery (IndexedDB)
11. **Validation** — No character can be saved with validation errors; warnings are non-blocking but clearly communicated
12. **Responsive** — Wizard is usable on mobile (640px), tablet (1024px), and desktop (1440px)
13. **Accessible** — All interactive elements are keyboard-navigable with visible focus indicators; ARIA labels on all form controls

## Pre-Phase Audit Notes

Before breaking Phase 2 into work items, a cross-reference of the wizard steps against D&D 5e creation rules surfaced the following concerns:

### Gap W1 — Race Choices Are Not Uniform

Not every race is "pick race, done." Several races require additional player decisions during selection:

| Race | Additional Choices Required |
|------|-----------------------------|
| Dragonborn | Choose draconic ancestry (10 options) — determines breath weapon damage type + damage resistance |
| Half-Elf | Choose +1 to two ability scores (from any except CHA), choose 2 skill proficiencies (from any) |
| High Elf | Choose 1 wizard cantrip, choose 1 extra language |
| Wood Elf | No additional choices beyond subrace selection |
| Hill Dwarf / Mountain Dwarf | No additional choices beyond subrace selection |
| Human (Standard) | No choices (+1 all) |
| Human (Variant) | Choose +1 to two abilities, choose 1 skill proficiency, choose 1 feat |
| Forest Gnome / Rock Gnome | No additional choices beyond subrace selection |
| Lightfoot / Stout Halfling | No additional choices beyond subrace selection |
| Half-Orc | No additional choices |
| Tiefling | No additional choices |

The Race Step must dynamically render choice sub-panels based on the selected race. Variant Human is particularly complex because it pulls in the feat selection system.

### Gap W2 — Class Skill Choices Have Variable Counts

Each class offers a different number of skill picks from a different pool:

| Class | Skills to Choose | Pool Size |
|-------|-----------------|-----------|
| Barbarian | 2 | 6 |
| Bard | 3 (any skill) | 18 |
| Cleric | 2 | 5 |
| Druid | 2 | 8 |
| Fighter | 2 | 8 |
| Monk | 2 | 8 |
| Paladin | 2 | 6 |
| Ranger | 3 | 8 |
| Rogue | 4 | 11 |
| Sorcerer | 2 | 6 |
| Warlock | 2 | 7 |
| Wizard | 2 | 6 |

### Gap W3 — Subclass Selection at Level 1

Most subclasses are chosen at level 3, but Clerics choose their Divine Domain at level 1, Sorcerers choose their Sorcerous Origin at level 1, and Warlocks choose their Otherworldly Patron at level 1. The wizard must prompt for subclass selection during the Class Step for these three classes.

### Gap W4 — Background Skill Overlap Resolution

If a background grants a skill proficiency the character already has from their class, the PHB rules say the player may choose a replacement skill from any skill. The wizard must detect this overlap and prompt the player to pick a substitute.

### Gap W5 — Starting Equipment Has Nested Choices

Starting equipment options are not flat lists — they contain conditional groups (e.g., "(a) chain mail OR (b) leather armor, longbow, and 20 arrows"). Each generic item choice (e.g., "a martial weapon") requires drilling down into the weapon list. The Equipment Step must support multi-level selection trees.

### Gap W6 — Spellcasting Systems Vary by Class

The Spell Step must handle three distinct systems at level 1: known casters (Bard, Sorcerer, Warlock), prepared casters (Cleric, Druid), and spellbook casters (Wizard). Paladin, Ranger, Fighter, and Rogue do not get spells at level 1.

### Gap W7 — Freeform Mode Must Coexist with the Wizard

Freeform mode is a parallel creation path — not a separate page — that presents the full character sheet as an editable form without enforced step ordering.

### Gap W8 — Wizard State Recovery

If a user closes their browser mid-wizard, they should be able to resume. The Zustand wizard store with sessionStorage persistence handles this, but the wizard UI must check for in-progress state on mount and offer to resume or start fresh.

## Dependencies on Phase 1

Phase 2 assumes all Phase 1 deliverables are complete:

- **Project scaffolding** — React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router all configured
- **Full type system** — All TypeScript interfaces for Character, Race, Class, Spell, Equipment, Background, etc.
- **SRD game data files** — All races, classes, spells, equipment, backgrounds, feats as static JSON
- **Calculation engine** — Tested engine for computing derived stats (AC, HP, modifiers, proficiency bonus, etc.)
- **Database layer** — Dexie.js CRUD operations for characters
- **Zustand stores** — State management with sessionStorage persistence middleware
- **Dice engine** — Core dice rolling logic (NdM+X notation parsing, roll execution)

## Dependency Graph

```
Epic 8 (Wizard Framework)
  |-- Story 8.1 (Shell) — must be built first, all steps plug into this
  |-- Story 8.2 (Intro) — entry point
  |-- Story 8.3 (Freeform) — parallel path, shares components with guided steps
       |
Epic 16 (Shared Components) — built alongside or just ahead of the steps
       |
       |-- Epic 9 (Race Step) — first guided step
       |    depends on: shared card grid, detail panel, search/filter, count selector
       |
       |-- Epic 10 (Class Step) — second guided step
       |    depends on: shared card grid, detail panel, skill chooser (from Race Step)
       |
       |-- Epic 11 (Ability Scores) — third guided step
       |    depends on: dice engine (Phase 1), @dnd-kit (drag-and-drop)
       |
       |-- Epic 12 (Background) — fourth guided step
       |    depends on: skill chooser, language picker (from Race Step)
       |
       |-- Epic 13 (Equipment) — fifth guided step
       |    depends on: equipment SRD data, AC calculation engine
       |
       |-- Epic 14 (Spellcasting) — sixth guided step (conditional)
       |    depends on: spell SRD data, spell slot calculations
       |
       |-- Epic 15 (Review & Finalize) — final step
            depends on: ALL previous steps, calculation engine, database layer
```

**Parallelizable:** Once the wizard framework (Epic 8) and shared components (Epic 16) are in place, individual step Epics (9-14) can be worked in parallel by different developers. Epic 15 (Review) must be last as it integrates everything.

## Statistics

| Category | Count |
|----------|-------|
| Epics | 9 (Epic 8-16) |
| Stories | 39 |
| Tasks | ~145 |
| New Components | ~40+ |
| Reusable Shared Components | ~10 |
| Wizard Steps | 8 (Intro + 7 creation steps) |
| Data Pickers Required | 8 (Race, Subrace, Class, Subclass, Skills, Equipment, Spells, Feats) |
| Conditional UI Branches | 6+ (spellcasting type, level-1 subclass, fighting style, Dragonborn ancestry, Variant Human feat, skill overlap) |

## Open Questions

1. **Avatar/Portrait Upload:** Defer to Phase 3 (character management), show a placeholder silhouette based on race in Phase 2.
2. **Undo/Redo in Wizard:** Not for MVP wizard. Back navigation suffices.
3. **Dice Animation Fidelity:** CSS 3D transforms for Phase 2, upgrade to Three.js in Phase 4.
4. **Spell Description Length:** Truncate to 2-3 lines in list view, show full text in detail panel.
5. **Random Name Generator Quality:** Static list of 20-30 names per race for Phase 2, improve later.

## Testing Strategy Summary

| Epic | Unit | Functional | E2E | Total | Gaps Found |
|------|------|-----------|-----|-------|------------|
| 8 — Wizard Framework & Navigation | 4 | 30 | 10 | 44 | 6 |
| 9 — Race Selection Step | 11 | 39 | 11 | 61 | 5 |
| 10 — Class Selection Step | 13 | 42 | 14 | 69 | 6 |
| 11 — Ability Score Step | 23 | 46 | 9 | 78 | 7 |
| 12 — Background & Personality Step | 10 | 30 | 6 | 46 | 7 |
| 13 — Equipment Selection Step | 17 | 22 | 4 | 43 | 6 |
| 14 — Spellcasting Step (Conditional) | 22 | 31 | 7 | 60 | 7 |
| 15 — Review & Finalize Step | 16 | 27 | 11 | 54 | 8 |
| 16 — Shared Wizard Components & Utilities | 8 | 26 | 3 | 37 | 7 |
| **Totals** | **124** | **293** | **75** | **492** | **59** |

### Testing Infrastructure Needed
- **Mock Zustand wizard store** with sessionStorage persist middleware for all step state persistence/restore testing
- **Mock Phase 1 calculation engine** for derived stat computation (modifiers, AC, HP, initiative, spell save DC, attack bonuses)
- **Mock Phase 1 dice engine** with deterministic results for all rolling interfaces (ability scores, personality, gold)
- **Mock Phase 1 Dexie.js database layer** (`createCharacter()`) for save testing with success and failure scenarios
- **Mock SRD game data fixtures**: races (9), classes (12), spells (100+), equipment (weapons, armor, gear, packs), backgrounds, feats -- all as static JSON test fixtures
- **Mock @dnd-kit** (drag-and-drop library) for Standard Array and Rolling assignment testing
- **Mock framer-motion** for step transition and panel animation assertions
- **Mock react-window or @tanstack/react-virtual** for spell list virtualization testing
- **Mock user preferences store** for First-Time Hints, player name pre-population, and sound preferences
- **Complete character state fixtures**: Pre-built wizard state snapshots for caster (High Elf Wizard), non-caster (Human Fighter), and edge case (Variant Human Rogue) characters covering all wizard steps
- **Viewport testing utilities**: Responsive breakpoint testing for mobile (640px), tablet (1024px), and desktop (1440px)
- **Accessibility testing utilities**: ARIA assertion helpers, keyboard navigation test helpers, screen reader compatibility checks
