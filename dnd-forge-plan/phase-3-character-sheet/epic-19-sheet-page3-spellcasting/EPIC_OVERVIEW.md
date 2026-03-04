# Epic 19: Character Sheet — Page 3 (Spellcasting)

> **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Goal
A comprehensive spellcasting page displayed only for spellcasting characters, showing the spellcasting header stats, spell slot tracking, and organized spell lists by level with prepared spell toggles.

## Stories

| Story | Title | Description |
|-------|-------|-------------|
| 19.1 | Spellcasting Header | Spellcasting ability, spell save DC, and spell attack bonus |
| 19.2 | Cantrips Section | Cantrips listed at the top of the spell page |
| 19.3 | Spell Slots & Spell Lists by Level | Spell slots and spell lists organized by level (1-9) with slot tracking and prepared toggles |
| 19.4 | Domain/Subclass Spells | Always-prepared domain/subclass spells separately marked |

## Key Components
- `components/character/page3/SpellcastingPage.tsx` — Page 3 container (conditionally rendered)
- `components/character/page3/SpellcastingHeader.tsx` — spellcasting stat boxes
- `components/character/page3/CantripList.tsx` — cantrip list
- `components/character/page3/SpellLevelSection.tsx` — repeating section per spell level

## Dependencies
- Phase 1: Spell data, spellcasting calculation formulas, Character type system
- Phase 2: SpellDetailCard component, spell browser/picker
- Epic 20: View/Edit mode toggle system

## Layout
**Page 3 Layout Zones (Spellcasting):**
- Top row: spellcasting class, spellcasting ability, spell save DC, spell attack bonus
- Body: 10 spell level sections (cantrips + levels 1-9), each with slots total, slots expended, and spell list with checkboxes for prepared spells

## Notes
- Page 3 is conditionally rendered: only shows for spellcasting characters
- Non-spellcasters see a placeholder message with info about when they might gain spellcasting
- Warlock Pact Magic slots are displayed separately from regular spell slots
- Prepared casters (Cleric, Druid, Wizard, Paladin) show prepared checkboxes with limit enforcement
- Known casters (Bard, Sorcerer, Warlock) show "Known" badges instead of checkboxes

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 19.1 — Spellcasting Header | 5 | 8 | 0 | 13 |
| 19.2 — Cantrips Section | 2 | 8 | 1 | 11 |
| 19.3 — Spell Slots & Spell Lists by Level | 6 | 12 | 2 | 20 |
| 19.4 — Domain/Subclass Spells | 3 | 7 | 0 | 10 |
| **Totals** | **16** | **35** | **3** | **54** |

### Key Gaps Found
- **Accessibility**: Missing ARIA labels for spell slot circles, prepared checkboxes, hover tooltips, and spell level sections. No keyboard navigation specification
- **Edge Cases**: Multiclass spellcasting with mixed prepared/known classes not fully specified. Homebrew domain spells not supported in SRD data
- **Loading/Empty States**: Empty spell level sections not specified. Non-spellcaster placeholder only covers basic Fighter/Rogue subclass scenarios
- **Performance**: No render performance targets for full 9-level caster with many spells per level
- **Dependency Issues**: SRD only contains Life Domain for Cleric -- other subclass spell lists need custom support
