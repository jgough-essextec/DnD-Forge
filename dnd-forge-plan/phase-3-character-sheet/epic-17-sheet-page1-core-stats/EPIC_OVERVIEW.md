# Epic 17: Character Sheet — Page 1 (Core Stats)

> **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Goal
A pixel-accurate digital recreation of the D&D 5e character sheet Page 1, showing all identity information, ability scores, skills, saving throws, combat stats, attacks, personality, and features in a responsive layout that works from mobile to desktop.

## Stories

| Story | Title | Description |
|-------|-------|-------------|
| 17.1 | Page 1 Layout Shell & Top Banner | Top banner with character name, class, level, race, background, alignment, XP, player name |
| 17.2 | Ability Score Blocks (Left Column) | Six ability scores with modifiers in classic vertical layout |
| 17.3 | Saving Throws List | All 6 saving throws with proficiency indicators and computed modifiers |
| 17.4 | Skills List | All 18 skills with proficiency, expertise markers, and computed modifiers |
| 17.5 | Combat Stats Block (Center Column Top) | AC, initiative bonus, and speed prominently displayed |
| 17.6 | Hit Points Block | HP max, current HP, and temporary HP with health status visualization |
| 17.7 | Hit Dice & Death Saves | Total hit dice, used dice tracking, and death saving throw recording |
| 17.8 | Attacks & Spellcasting Section | Equipped weapons with computed attack bonuses and damage |
| 17.9 | Personality & Features (Right Column) | Personality traits, ideals, bonds, flaws, and features & traits |
| 17.10 | Proficiency Bonus Display | Proficiency bonus prominently shown and computed from level |

## Key Components
- `components/character/CharacterSheet.tsx` — top-level sheet controller
- `components/character/page1/SheetBanner.tsx` — top banner
- `components/character/page1/AbilityScoreColumn.tsx` — ability score blocks
- `components/character/page1/SavingThrowsList.tsx` — saving throws
- `components/character/page1/SkillsList.tsx` — skills list
- `components/character/page1/CombatStatsRow.tsx` — AC, initiative, speed
- `components/character/page1/HitPointBlock.tsx` — HP section
- `components/character/page1/HitDiceBlock.tsx` — hit dice
- `components/character/page1/DeathSaves.tsx` — death saves
- `components/character/page1/AttacksSection.tsx` — attacks table
- `components/character/page1/PersonalityBlock.tsx` — personality traits
- `components/character/page1/FeaturesTraits.tsx` — features and traits

## Dependencies
- Phase 1: Calculation engine, dice engine, SRD data, Character type system
- Phase 2: AbilityScoreDisplay shared component, character data loaded via Django REST API
- Epic 20: View/Edit mode toggle system (build first or in parallel)

## Layout
**Page 1 Layout Zones (3-column on desktop):**
- Top banner: 40% name, 60% identity fields (class/level, background, player name, race, alignment, XP) in 2x3 grid
- Left column (~30%): 6 ability score blocks, saving throws, skills list, passive Perception
- Center column (~35%): AC/Initiative/Speed row, HP block, hit dice + death saves, attacks & spellcasting
- Right column (~35%): Personality traits, ideals, bonds, flaws, features & traits

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 17.1 — Page 1 Layout Shell & Top Banner | 3 | 10 | 2 | 15 |
| 17.2 — Ability Score Blocks | 4 | 9 | 1 | 14 |
| 17.3 — Saving Throws List | 4 | 8 | 1 | 13 |
| 17.4 — Skills List | 6 | 8 | 1 | 15 |
| 17.5 — Combat Stats Block | 9 | 9 | 1 | 19 |
| 17.6 — Hit Points Block | 6 | 11 | 1 | 18 |
| 17.7 — Hit Dice & Death Saves | 6 | 10 | 1 | 17 |
| 17.8 — Attacks & Spellcasting | 7 | 10 | 2 | 19 |
| 17.9 — Personality & Features | 2 | 10 | 1 | 13 |
| 17.10 — Proficiency Bonus Display | 6 | 5 | 0 | 11 |
| **Totals** | **53** | **90** | **11** | **154** |

### Key Gaps Found
- **Accessibility**: Pervasive across all stories -- missing ARIA labels, keyboard navigation, and screen reader support for ability scores, proficiency dots, dice rolls, tooltips, and interactive elements
- **Error Handling**: Missing error states for API load failure, invalid numeric inputs in edit mode, and empty states for many sections
- **Loading States**: No loading skeleton or spinner specified for initial character sheet load from the API
- **Performance**: No render time targets for the most complex page (Page 1 has 10+ distinct sections)
- **Edge Cases**: Boundary value handling not specified for ability scores (3-30 range), HP (negative values), and hit dice usage counts
