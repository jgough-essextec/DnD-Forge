# Story 31.6 — Spell Progression Step (Conditional, Casters)

> **Epic 31: Level Up Flow** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a spellcaster leveling up, I need to gain new spell slots, learn or prepare new spells, and optionally swap one known spell. This step handles the full complexity of D&D 5e spellcasting progression for all caster types: known casters (Bard, Sorcerer, Warlock, Ranger), prepared casters (Cleric, Druid, Paladin), and the Wizard's unique spellbook system. It also covers cantrip acquisition, cantrip damage scaling, and Warlock Pact Magic updates.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Spellcasting Progression (Complete by Caster Type)

#### Full Caster Spell Slot Progression (Bard, Cleric, Druid, Sorcerer, Wizard)
| Level | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th | 9th |
|-------|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| 1 | 2 | - | - | - | - | - | - | - | - |
| 2 | 3 | - | - | - | - | - | - | - | - |
| 3 | 4 | 2 | - | - | - | - | - | - | - |
| 4 | 4 | 3 | - | - | - | - | - | - | - |
| 5 | 4 | 3 | 2 | - | - | - | - | - | - |
| 6 | 4 | 3 | 3 | - | - | - | - | - | - |
| 7 | 4 | 3 | 3 | 1 | - | - | - | - | - |
| 8 | 4 | 3 | 3 | 2 | - | - | - | - | - |
| 9 | 4 | 3 | 3 | 3 | 1 | - | - | - | - |
| 10 | 4 | 3 | 3 | 3 | 2 | - | - | - | - |
| 11 | 4 | 3 | 3 | 3 | 2 | 1 | - | - | - |
| 12 | 4 | 3 | 3 | 3 | 2 | 1 | - | - | - |
| 13 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | - | - |
| 14 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | - | - |
| 15 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | - |
| 16 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | - |
| 17 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | 1 |
| 18 | 4 | 3 | 3 | 3 | 3 | 1 | 1 | 1 | 1 |
| 19 | 4 | 3 | 3 | 3 | 3 | 2 | 1 | 1 | 1 |
| 20 | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 1 |

#### Half Caster Spell Slot Progression (Paladin, Ranger)
| Level | 1st | 2nd | 3rd | 4th | 5th |
|-------|-----|-----|-----|-----|-----|
| 2 | 2 | - | - | - | - |
| 3 | 3 | - | - | - | - |
| 4 | 3 | - | - | - | - |
| 5 | 4 | 2 | - | - | - |
| 6 | 4 | 2 | - | - | - |
| 7 | 4 | 3 | - | - | - |
| 8 | 4 | 3 | - | - | - |
| 9 | 4 | 3 | 2 | - | - |
| 13 | 4 | 3 | 3 | 1 | - |
| 17 | 4 | 3 | 3 | 2 | 1 |

#### Warlock Pact Magic Progression
| Level | Slots | Slot Level |
|-------|-------|-----------|
| 1 | 1 | 1st |
| 2 | 2 | 1st |
| 3 | 2 | 2nd |
| 5 | 2 | 3rd |
| 7 | 2 | 4th |
| 9 | 2 | 5th |
| 11 | 3 | 5th |
| 17 | 4 | 5th |

### Cantrip Progression
| Class | Cantrips Known by Level |
|-------|------------------------|
| Bard | 2 at Lv1, +1 at Lv4, +1 at Lv10 (total 4) |
| Cleric | 3 at Lv1, +1 at Lv4, +1 at Lv10 (total 5) |
| Druid | 2 at Lv1, +1 at Lv4, +1 at Lv10 (total 4) |
| Sorcerer | 4 at Lv1, +1 at Lv4, +1 at Lv10 (total 6) |
| Warlock | 2 at Lv1, +1 at Lv4, +1 at Lv10 (total 4) |
| Wizard | 3 at Lv1, +1 at Lv4, +1 at Lv10 (total 5) |
| Paladin | 0 (no cantrips) |
| Ranger | 0 (no cantrips) |

### Cantrip Damage Scaling (Character Level, NOT Class Level)
| Character Level | Damage Dice |
|----------------|-------------|
| 1-4 | 1 die (e.g., Fire Bolt: 1d10) |
| 5-10 | 2 dice (Fire Bolt: 2d10) |
| 11-16 | 3 dice (Fire Bolt: 3d10) |
| 17-20 | 4 dice (Fire Bolt: 4d10) |

### Spellcasting Types

**Known Casters (Bard, Sorcerer, Warlock, Ranger):**
- Have a fixed number of "Spells Known" that increases per level
- On level-up: gain new spells from the newly available levels + lower levels
- **Spell Swap:** May replace ONE known spell with another of the same level or lower. This happens on level-up only
- Bard Spells Known: 4 at Lv1, +1 per level (max 22 at Lv20)
- Sorcerer Spells Known: 2 at Lv1, +1 per level (max 15 at Lv20)
- Warlock Spells Known: 2 at Lv1, +1 per level (max 15 at Lv20, but also gains Mystic Arcanum)
- Ranger Spells Known: 2 at Lv2, +1 at most levels (max 11 at Lv20)

**Prepared Casters (Cleric, Druid, Paladin):**
- Don't have fixed "known" spells -- they have access to their entire class spell list
- Prepare a number of spells each day: ability modifier + class level (or half class level for Paladin)
  - Cleric: WIS mod + Cleric level
  - Druid: WIS mod + Druid level
  - Paladin: CHA mod + half Paladin level (round down, min 1)
- On level-up: preparation limit increases, and new spell levels may become available
- Domain/Circle/Oath spells are always prepared and don't count against the limit

**Wizard (Unique Spellbook System):**
- Maintains a spellbook of learned spells
- On level-up: **add 2 spells** to the spellbook from the Wizard spell list (any level the Wizard has slots for)
- Prepares spells daily: INT mod + Wizard level
- Can copy additional spells from scrolls/other spellbooks (not part of level-up)

## Tasks

- [ ] **T31.6.1** — Create `components/levelup/SpellProgressionStep.tsx` — conditionally rendered for casters. Shows all spellcasting changes at the new level
- [ ] **T31.6.2** — **New Spell Slots:** display the before/after spell slot table. Highlight new slots in gold: "1st Level: 3 -> 4 slots. New: 2nd Level: 2 slots (unlocked!)." For new spell levels unlocked, show excitement: "You can now cast 2nd level spells!"
- [ ] **T31.6.3** — **New Cantrips (if applicable):** if the class gains a new cantrip at this level, open the cantrip picker. Show the class's available cantrips, excluding those already known
- [ ] **T31.6.4** — **Known Casters (Bard, Sorcerer, Warlock, Ranger):**
  - Show "Spells Known: [old] -> [new]." Open the spell browser to select new spells from the newly available levels plus lower levels
  - "Swap one known spell: You may replace one spell you know with another of the same level or lower." Show the current known spell list with "Replace" buttons, then open the browser for the replacement
- [ ] **T31.6.5** — **Prepared Casters (Cleric, Druid, Paladin):**
  - Show "Prepared Spell Limit: [old] -> [new]." The full spell list is always available; the limit for daily preparation just increased
  - If new spell levels are unlocked, highlight the new spells available: "New spells available: Aid, Hold Person, Lesser Restoration..."
- [ ] **T31.6.6** — **Wizard Spellbook:**
  - "Add 2 spells to your spellbook from the Wizard spell list." Open the spell browser for selection. These can be from any level the Wizard has spell slots for
  - Show the updated prepared limit: "Prepared: INT Mod ([N]) + Wizard Level ([M]) = [total]"
- [ ] **T31.6.7** — **Warlock Pact Magic:** show the updated slot level and count. "Pact Magic: 2 x 2nd Level -> 2 x 2nd Level" (or level/count change if applicable)
- [ ] **T31.6.8** — **Cantrip damage scaling:** at character levels 5, 11, and 17, show: "Your cantrip damage increases! Fire Bolt: 1d10 -> 2d10." Update the stored cantrip damage data on the character

## Acceptance Criteria

1. Spell progression step appears only for caster classes
2. New spell slots are shown in a before/after table with new slots highlighted
3. Newly unlocked spell levels are highlighted with excitement messaging
4. New cantrips can be selected when the class gains a cantrip at this level
5. Known casters (Bard, Sorcerer, Warlock, Ranger) can select new spells and swap one known spell
6. Spell swap shows the current known list with "Replace" buttons
7. Prepared casters (Cleric, Druid, Paladin) see updated preparation limit
8. Prepared casters see newly available spells when a new level unlocks
9. Wizard adds exactly 2 spells to spellbook from available spell list
10. Wizard sees updated preparation limit (INT mod + Wizard level)
11. Warlock Pact Magic shows updated slot level and count
12. Cantrip damage scaling notification appears at character levels 5, 11, 17
13. Cantrip damage data is updated on the character

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should calculate correct spell slot progression for full casters at each level (e.g., Level 5 Wizard: 4/3/2)`
- `should calculate correct spell slot progression for half casters (Paladin, Ranger)`
- `should determine newly unlocked spell levels (e.g., Level 5 unlocks 3rd level slots)`
- `should return correct cantrip count progression by class and level`
- `should determine cantrip damage scaling at character levels 5, 11, 17`
- `should calculate prepared spell limit for each prepared caster type (Cleric: WIS + level, Paladin: CHA + half level)`
- `should return Warlock Pact Magic slot count and level for each Warlock level`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render SpellProgressionStep only for caster classes`
- `should display before/after spell slot table with new slots highlighted in gold`
- `should show excitement message when new spell level is unlocked`
- `should open cantrip picker when class gains a new cantrip at this level`
- `should show spell browser for known casters to select new spells`
- `should offer "swap one known spell" option for known casters (Bard, Sorcerer, Warlock, Ranger)`
- `should display updated preparation limit for prepared casters`
- `should show "Add 2 spells to your spellbook" for Wizard`
- `should display updated Pact Magic slot level and count for Warlock`
- `should show cantrip damage scaling notification at character levels 5, 11, 17`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should level up Wizard to Level 3, see new 2nd level slots unlocked, add 2 spells to spellbook`
- `should level up Bard to Level 4, select a new cantrip and a new spell, swap one known spell`
- `should level up to character Level 5 and see cantrip damage scaling notification (e.g., Fire Bolt 1d10 -> 2d10)`
- `should level up Warlock and see Pact Magic slot level and count update`

### Test Dependencies
- Mock character data for each caster type (full, half, known, prepared, Wizard, Warlock)
- Mock Phase 1 spell data (spell lists by class, spell slot progression tables)
- Mock Phase 2 spell browser and cantrip picker components
- Spell slot progression table test fixtures
- Known spells list fixture for swap testing

## Identified Gaps

- **Error Handling**: No specification for non-caster classes accessing this step accidentally; no validation for spell selections that don't match available spell levels
- **Edge Cases**: Half-casters (Paladin, Ranger) don't start casting until level 2 -- step should not appear at level 1; Wizard spellbook additions are separate from prepared spells (should be clear in UI); domain/circle/oath always-prepared spells display
- **Accessibility**: Spell browser reuse from Phase 2 should maintain accessibility; cantrip damage scaling notification needs ARIA live region; screen reader should announce each slot change
- **Mobile/Responsive**: Spell slot before/after table may be wide on mobile; spell browser modal sizing
- **Performance**: Spell list loading for the browser may be slow for classes with large spell lists

## Dependencies

- Story 31.1 (Level Up Entry & Overview) for the wizard container
- Phase 1 spell data (spell lists by class, spell slot progression tables)
- Phase 2 spell browser and cantrip picker (reused)
- Story 28.1 (Spell Slot Tracker) for slot display integration
- Story 28.2 (Warlock Pact Magic) for Pact Magic display

## Notes

- This is the most complex step for caster classes and may require significant UI space
- The spell swap for known casters is easily overlooked -- make it prominent in the UI
- Cantrip damage scaling uses total character level, not class level -- important for multiclass characters
- Half-casters (Paladin, Ranger) don't start spellcasting until level 2
- Wizard's spellbook is separate from prepared spells -- adding to spellbook != preparing
- Domain/Circle/Oath spells should be shown as "always prepared" and not count against limits
