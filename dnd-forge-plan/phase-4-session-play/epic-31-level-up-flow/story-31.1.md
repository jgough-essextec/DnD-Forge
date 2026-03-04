# Story 31.1 — Level Up Entry & Overview

> **Epic 31: Level Up Flow** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need a "Level Up" button that shows me what I gain at the next level and walks me through each decision. The level-up entry point provides a prominent button on the character sheet and gallery, and the overview screen dynamically generates a step list based on what the new level grants for the character's specific class, showing everything at a glance before diving into individual decisions.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Level Progression Overview

**XP Thresholds:**
| Level | XP Required | Level | XP Required |
|-------|------------|-------|------------|
| 1 | 0 | 11 | 85,000 |
| 2 | 300 | 12 | 100,000 |
| 3 | 900 | 13 | 120,000 |
| 4 | 2,700 | 14 | 140,000 |
| 5 | 6,500 | 15 | 165,000 |
| 6 | 14,000 | 16 | 195,000 |
| 7 | 23,000 | 17 | 225,000 |
| 8 | 34,000 | 18 | 265,000 |
| 9 | 48,000 | 19 | 305,000 |
| 10 | 64,000 | 20 | 355,000 |

**What a Level Grants (varies per class and level):**
Every level always grants:
- HP increase (roll hit die or take average + CON mod)

Some levels also grant:
- New class features (most levels have at least one)
- Proficiency bonus increase (levels 5, 9, 13, 17)
- Subclass selection (varies by class -- see below)
- Ability Score Improvement or Feat (ASI levels)
- New/increased spell slots (casters)
- New spells known or increased preparation limit (casters)
- Cantrip damage scaling (character levels 5, 11, 17)

**Subclass Selection Levels:**
| Class | Subclass Level |
|-------|---------------|
| Barbarian | 3 (Path) |
| Bard | 3 (College) |
| Cleric | 1 (Domain) -- chosen at creation |
| Druid | 2 (Circle) |
| Fighter | 3 (Archetype) |
| Monk | 3 (Tradition) |
| Paladin | 3 (Oath) |
| Ranger | 3 (Archetype) |
| Rogue | 3 (Archetype) |
| Sorcerer | 1 (Origin) -- chosen at creation |
| Warlock | 1 (Patron) -- chosen at creation |
| Wizard | 2 (School) |

**ASI Levels by Class:**
| Class | ASI Levels | Total |
|-------|-----------|-------|
| Most classes | 4, 8, 12, 16, 19 | 5 |
| Fighter | 4, 6, 8, 12, 14, 16, 19 | 7 |
| Rogue | 4, 8, 10, 12, 16, 19 | 6 |

### Dynamic Step Generation
The wizard steps are built dynamically based on what the new level provides. Examples:
- **Fighter Lv2 (non-caster, no ASI, no subclass):** HP -> Features (Action Surge) -> Review = 3 steps
- **Wizard Lv4 (caster, ASI level):** HP -> Features -> ASI/Feat -> Spells -> Review = 5 steps
- **Paladin Lv3 (half-caster, subclass):** HP -> Features -> Subclass -> Spells -> Review = 5 steps

### Multi-Level Support
Some DMs use milestone leveling and may grant 2+ levels at once. The wizard should walk through each level sequentially, clearly showing which level's decisions are being made.

## Tasks

- [ ] **T31.1.1** — Add a "Level Up" button to the character sheet's quick-action bar (and the character gallery card context menu). Button is visually distinct (accent-gold with a sparkle icon). If the character's XP meets the next level threshold, show a pulsing notification badge
- [ ] **T31.1.2** — Create `components/levelup/LevelUpWizard.tsx` — a modal wizard (reusing the wizard framework pattern from Phase 2). Steps are dynamically generated based on what the new level grants
- [ ] **T31.1.3** — **Level Up Overview screen (Step 0):** "Level Up to [N]!" header with a summary card showing everything the new level provides: HP increase method, new class features (listed by name), new proficiency bonus (if changed), subclass selection (if applicable), ASI/feat (if applicable), new spell slots (if caster), new spells known/prepared (if caster). Each item is a preview row; items requiring decisions have a "(Choose)" badge
- [ ] **T31.1.4** — Dynamically build the step list based on what the new level grants. For a non-caster at a non-ASI level, there may only be 2 steps (HP + features). For a caster at an ASI level with a subclass choice, there could be 5+ steps
- [ ] **T31.1.5** — Support leveling up multiple levels at once (e.g., DM grants 2 levels via milestone). Walk through each level sequentially, showing which level's decisions are being made

## Acceptance Criteria

1. "Level Up" button is visible on the character sheet quick-action bar and gallery card context menu
2. Button is visually distinct (accent-gold with sparkle icon)
3. If character XP meets the next level threshold, a pulsing notification badge appears
4. Level Up wizard opens as a modal, reusing the Phase 2 wizard framework pattern
5. Overview screen shows everything the new level grants with a summary card
6. Items requiring decisions are marked with a "(Choose)" badge
7. Step list is dynamically generated based on class, level, and caster status
8. Non-caster at non-ASI level has fewer steps than a caster at an ASI level
9. Multi-level advancement walks through each level sequentially with clear level indicators
10. Wizard can be cancelled at any point without applying changes

## Dependencies

- Phase 2 wizard framework pattern (modal wizard component)
- Phase 1 class data (features by level, subclass levels, ASI levels, spell progression)
- Phase 3 character sheet (quick-action bar, gallery card)

## Notes

- The overview screen is critical UX -- it gives the player excitement about what they're gaining and clarity about what decisions they need to make
- Multi-level support is important for milestone campaigns where the DM may advance the party by 2+ levels at once
- The wizard framework from Phase 2 should be reusable with dynamic step injection
- XP tracking is informational; the app supports both XP and milestone leveling
