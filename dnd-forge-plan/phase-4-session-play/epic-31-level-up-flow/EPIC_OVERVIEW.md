# Epic 31: Level Up Flow

> **Phase 4: Session Play Features** | Weeks 7-8

## Goal

A guided, step-by-step level advancement wizard that handles the full complexity of D&D 5e leveling -- HP increase (roll or average), new class features, subclass selection, ability score improvement / feat selection, spell slot progression, new spells, cantrip scaling, proficiency bonus increases, and feature use scaling -- for all 12 classes across levels 1-20.

## Stories

| Story | Title | Tasks | Summary |
|-------|-------|-------|---------|
| 31.1 | Level Up Entry & Overview | 5 | Level Up button with XP badge, modal wizard, dynamic overview screen showing all gains, step list generation, multi-level support |
| 31.2 | HP Increase Step | 5 | Roll or take average, animated die roll, CON mod applied, min 1 HP, retroactive CON adjustment |
| 31.3 | New Class Features Step | 6 | Feature list display, choice-based features (Fighting Style, Metamagic, etc.), scaling features auto-update, proficiency bonus increase, Extra Attack notification, new proficiencies |
| 31.4 | Subclass Selection Step | 4 | Conditional step at subclass level, reuse Phase 2 SubclassSelector, preview future features, auto-apply for Lv 1 subclass classes |
| 31.5 | ASI / Feat Selection Step | 5 | Conditional at ASI levels, +2/+1+1 ability modes with 20 cap, feat picker with prerequisites, cascade stat recalculation, optional cantrip replacement |
| 31.6 | Spell Progression Step | 8 | New spell slots display, cantrip picker, known caster spell selection + swap, prepared caster limit update, Wizard spellbook +2, Warlock Pact Magic update, cantrip damage scaling |
| 31.7 | Level Up Review & Apply | 5 | Complete change summary, apply with full recalculation, cancel with confirmation, gallery card update, XP/milestone support |

## Key Technical Notes

### Subclass Selection Levels
| Class | Subclass Level |
|-------|---------------|
| Barbarian | 3 (Path) |
| Bard | 3 (College) |
| Cleric | 1 (Domain) |
| Druid | 2 (Circle) |
| Fighter | 3 (Archetype) |
| Monk | 3 (Tradition) |
| Paladin | 3 (Oath) |
| Ranger | 3 (Archetype) |
| Rogue | 3 (Archetype) |
| Sorcerer | 1 (Origin) |
| Warlock | 1 (Patron) |
| Wizard | 2 (School) |

### ASI Levels by Class
| Class | ASI Levels | Total |
|-------|-----------|-------|
| Most classes | 4, 8, 12, 16, 19 | 5 |
| Fighter | 4, 6, 8, 12, 14, 16, 19 | 7 |
| Rogue | 4, 8, 10, 12, 16, 19 | 6 |

### Proficiency Bonus Progression
| Level | Bonus |
|-------|-------|
| 1-4 | +2 |
| 5-8 | +3 |
| 9-12 | +4 |
| 13-16 | +5 |
| 17-20 | +6 |

### Cantrip Damage Scaling (Character Level, not Class Level)
- Level 5: damage dice double (e.g., Fire Bolt 1d10 -> 2d10)
- Level 11: damage dice triple (e.g., Fire Bolt -> 3d10)
- Level 17: damage dice quadruple (e.g., Fire Bolt -> 4d10)

### Spellcasting Progression Types
- **Known Casters** (Bard, Sorcerer, Warlock, Ranger): Fixed spells known, may swap 1 on level-up
- **Prepared Casters** (Cleric, Druid, Paladin): Prepare ability mod + class level daily
- **Wizard:** Spellbook-based, add 2 per level, prepare INT mod + Wizard level

## Dependencies

- **Phase 1:** Class data, spell data, feat data, calculation engine
- **Phase 2:** SubclassSelector, FeatPicker, spell browser (reused)
- **Phase 3:** Character sheet, auto-save system
- **Phase 4:** Dice Roller (for HP roll), Spell Slot Tracker (for slot display)

## Components Created

- `components/levelup/LevelUpWizard.tsx`
- `components/levelup/HPIncreaseStep.tsx`
- `components/levelup/NewFeaturesStep.tsx`
- `components/levelup/SubclassSelectionStep.tsx`
- `components/levelup/ASIStep.tsx`
- `components/levelup/SpellProgressionStep.tsx`
- `components/levelup/LevelUpReview.tsx`

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 31.1 — Level Up Entry & Overview | 6 | 8 | 4 | 18 |
| 31.2 — HP Increase Step | 5 | 7 | 3 | 15 |
| 31.3 — New Class Features Step | 6 | 8 | 4 | 18 |
| 31.4 — Subclass Selection Step | 5 | 7 | 3 | 15 |
| 31.5 — ASI / Feat Selection Step | 7 | 10 | 4 | 21 |
| 31.6 — Spell Progression Step | 7 | 10 | 4 | 21 |
| 31.7 — Level Up Review & Apply | 4 | 10 | 4 | 18 |
| **Totals** | **40** | **60** | **26** | **126** |

### Key Gaps Found
- Accessibility gaps across all steps: wizard modal focus trapping not specified; ARIA labels needed for step navigation, ability score dropdowns, feat prerequisites, spell browser; screen reader announcements for die rolls, stat changes, celebration messages
- Edge cases: Level Up at max level (20) behavior undefined; multi-level advancement through ASI + subclass level simultaneously; subclass selection is permanent with no undo; Tough feat retroactive HP; features with choices at subclass levels (Battle Master maneuvers, Warlock invocations)
- Error handling: IndexedDB save failures during apply; snapshot creation failures; missing class data for next level; recalculation failures
- Performance: cascade recalculation time after ASI; spell list loading performance; full recalculation after level-up apply
- Mobile/responsive: wizard modal sizing on mobile; long feature/spell lists scrollability
