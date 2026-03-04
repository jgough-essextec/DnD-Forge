# Epic 28: Spell Slot Tracker

> **Phase 4: Session Play Features** | Weeks 7-8

## Goal

An interactive spell slot management system integrated into the character sheet's spellcasting page, allowing players to expend and recover spell slots during play, with correct handling of Warlock Pact Magic, Arcane Recovery, and rest-based recovery.

## Stories

| Story | Title | Tasks | Summary |
|-------|-------|-------|---------|
| 28.1 | Spell Slot Expend & Recover UI | 5 | Clickable slot circles (filled/expended), cast-to-expend prompts, running slot summary, dimmed spells when no slots, ritual casting option |
| 28.2 | Warlock Pact Magic Slots | 4 | Separate Pact Magic section (purple accent), all-same-level display, short rest recovery, multiclass separation |
| 28.3 | Arcane Recovery (Wizard) | 4 | Arcane Recovery button, slot selection modal with level budget, daily usage tracking, short rest integration prompt |

## Key Technical Notes

### Spell Slot Recovery Rules
- **Standard caster slots:** Recover on long rest only
- **Warlock Pact Magic:** All slots recover on short rest; always cast at highest available level
- **Wizard Arcane Recovery:** Once per day during short rest, recover slots totaling up to ceil(Wizard level / 2) levels; no slot can be 6th level or higher

### Pact Magic Specifics
- Warlock slots are always at the same level (e.g., at Warlock level 5: 2 x 3rd Level Slots)
- In multiclass builds, Pact Magic slots are tracked separately from standard spell slots
- Pact Magic slots recover on short rest; standard slots do not

## Dependencies

- **Phase 1:** Spell data, class data (Warlock Pact Magic table, Wizard features)
- **Phase 3:** SpellLevelSection.tsx component, spell page layout

## Components Created

- Enhanced `SpellLevelSection.tsx` (clickable slot circles)
- Pact Magic slot section
- Arcane Recovery modal

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 28.1 — Spell Slot Expend & Recover UI | 5 | 9 | 4 | 18 |
| 28.2 — Warlock Pact Magic Slots | 5 | 6 | 2 | 13 |
| 28.3 — Arcane Recovery (Wizard) | 5 | 7 | 3 | 15 |
| **Totals** | **15** | **22** | **9** | **46** |

### Key Gaps Found
- Accessibility gaps: missing ARIA labels for slot circles (available/expended state), Pact Magic section, Arcane Recovery budget display; no keyboard interaction for toggling slots or navigating the recovery modal
- Edge cases: Mystic Arcanum (Warlock 6th-9th level 1/day spells) tracking not specified in tasks; slot state inconsistency handling; multiclass Wizard using Wizard class level (not total) for Arcane Recovery budget
- Dependency issues: circular dependency between Epic 28 (spell slots) and Epic 30 (rest automation) -- both depend on each other
- Performance: slot state auto-save frequency and Arcane Recovery modal render time not specified
