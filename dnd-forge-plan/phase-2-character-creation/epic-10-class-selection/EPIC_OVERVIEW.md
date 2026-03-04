# Epic 10: Class Selection Step
> **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Summary

A visually engaging class selection experience that helps players understand each class's role, abilities, and playstyle, and captures all level-1 class decisions including skill proficiencies and (for Clerics/Sorcerers/Warlocks) subclass selection. Handles variable skill pick counts per class, conditional subclass selection at level 1, and fighting style selection for Fighter/Paladin/Ranger.

## Stories

| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 10.1 | Class Card Gallery | 5 | Responsive grid of selectable class cards with role tags, hit die, primary ability icons, search/filter, race synergy indicator |
| 10.2 | Class Detail Panel | 7 | Slide-in panel with overview, proficiencies, level-1 features, spellcasting preview, level progression, starting equipment preview |
| 10.3 | Class Skill Proficiency Selection | 5 | Skill checklist with correct choose count per class, race skill pre-locking, ability grouping for Bard |
| 10.4 | Level-1 Subclass Selection (Conditional) | 6 | Subclass picker for Cleric (Divine Domain), Sorcerer (Sorcerous Origin), Warlock (Otherworldly Patron) |
| 10.5 | Fighting Style Selection (Conditional) | 5 | Fighting style radio cards for Fighter, Paladin, Ranger with class-appropriate options |
| 10.6 | Class Step Validation & State | 4 | Validation of all class selections, persistence to wizard store, cascade warning on class change |

## Technical Scope

- **ClassStep.tsx** — Step 2 container mirroring Race Step layout
- **ClassCard.tsx** — Selectable card with class icon, name, role tags, hit die badge, primary ability icons
- **ClassDetailPanel.tsx** — Tabbed/scrollable detail panel with full class information
- **ClassSkillSelector.tsx** — Skill checklist enforcing per-class choose counts
- **SubclassSelector.tsx** — Conditionally rendered for Cleric/Sorcerer/Warlock at level 1
- **FightingStyleSelector.tsx** — Radio cards for Fighter/Paladin/Ranger fighting styles
- Role archetype tag definitions for all 12 classes
- SRD class data (static JSON from Phase 1)

## Dependencies

- **Depends on:** Epic 8 (Wizard Shell), Epic 9 (race selection provides skill pre-locks and synergy data), Epic 16 (shared SelectableCardGrid, DetailSlidePanel, SearchFilterBar, CountSelector, ChoiceGroup)
- **Blocks:** Epic 11 (class primary ability recommendations), Epic 13 (starting equipment is class-based), Epic 14 (spellcasting is class-based), Epic 15 (review aggregates class data)
