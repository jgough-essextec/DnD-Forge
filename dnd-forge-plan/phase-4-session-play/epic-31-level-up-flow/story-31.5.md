# Story 31.5 — ASI / Feat Selection Step (Conditional)

> **Epic 31: Level Up Flow** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player reaching an ASI level, I need to choose between increasing ability scores or taking a feat. This step presents the player with two options: increase ability scores (with three sub-options) or select a feat from the available list. After selection, all derived stats affected by ability score changes are recalculated and displayed.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Ability Score Improvement (ASI) Rules (Complete)

**ASI Levels by Class:**
| Class | ASI Levels | Total ASIs |
|-------|-----------|-----------|
| Barbarian | 4, 8, 12, 16, 19 | 5 |
| Bard | 4, 8, 12, 16, 19 | 5 |
| Cleric | 4, 8, 12, 16, 19 | 5 |
| Druid | 4, 8, 12, 16, 19 | 5 |
| Fighter | 4, 6, 8, 12, 14, 16, 19 | 7 |
| Monk | 4, 8, 12, 16, 19 | 5 |
| Paladin | 4, 8, 12, 16, 19 | 5 |
| Ranger | 4, 8, 12, 16, 19 | 5 |
| Rogue | 4, 8, 10, 12, 16, 19 | 6 |
| Sorcerer | 4, 8, 12, 16, 19 | 5 |
| Warlock | 4, 8, 12, 16, 19 | 5 |
| Wizard | 4, 8, 12, 16, 19 | 5 |

**ASI Options (choose one):**
1. **+2 to one ability score:** Increase one ability by 2 (cannot exceed 20)
2. **+1 to two ability scores:** Increase two different abilities by 1 each (cannot exceed 20). Can also choose the same ability twice (equivalent to +2)
3. **Take a Feat instead:** Select a feat from the available feat list

**Ability Score Cap:** Ability scores cannot exceed 20 through ASI (magical items and effects can push above 20, but ASI cannot).

**Modifier Calculation:**
| Score | Modifier |
|-------|---------|
| 1 | -5 |
| 2-3 | -4 |
| 4-5 | -3 |
| 6-7 | -2 |
| 8-9 | -1 |
| 10-11 | +0 |
| 12-13 | +1 |
| 14-15 | +2 |
| 16-17 | +3 |
| 18-19 | +4 |
| 20 | +5 |

### Feat System

**Feat Selection Rules:**
- A feat is selected instead of the ASI (you give up the ability score increase)
- Some feats have prerequisites (e.g., minimum ability score, proficiency requirement, racial requirement)
- Feats the character doesn't qualify for should be disabled with an explanation
- Some feats grant +1 to an ability score (e.g., Athlete: +1 STR or DEX; Resilient: +1 to chosen ability + proficiency in that save)
- Some feats grant proficiencies (e.g., Heavily Armored: heavy armor proficiency + STR +1)
- Some feats grant special abilities (e.g., Lucky: 3 luck points per day)

**SRD Feats (examples):**
- **Grappler** (prereq: STR 13+): Advantage on grapple checks, pin creatures
- **Alert**: +5 initiative, can't be surprised while conscious
- **Tough**: +2 HP per level (retroactive)
- **Resilient**: +1 to chosen ability, gain proficiency in that ability's saving throw
- **War Caster** (prereq: spellcasting): Advantage on concentration saves, somatic components with hands full

### Cascade Recalculation
When an ability score changes, ALL derived stats must be recalculated:
- Ability modifier changes
- All skills using that ability
- Saving throw for that ability
- Spell attack bonus / spell save DC (if casting ability changed)
- Melee/ranged attack and damage (if STR/DEX changed)
- AC (if DEX changed)
- Initiative (if DEX changed)
- HP per level (if CON changed — retroactive: recalculate HP for every level by applying the new CON modifier instead of the old one)
- Carrying capacity (if STR changed)
- Passive Perception/Investigation (if WIS/INT changed)

### Optional 2024 Rules: Cantrip Replacement at ASI Levels
At ASI levels, the player may optionally replace one known cantrip with another from the same class spell list. This is from the 2024 rules update and is optional.

## Tasks

- [ ] **T31.5.1** — Create `components/levelup/ASIStep.tsx` — conditionally rendered when the new level is an ASI level for the character's class. Two mode cards: "Ability Score Increase" and "Choose a Feat"
- [ ] **T31.5.2** — **ASI mode:** three sub-options:
  - "+2 to one ability": dropdown of all 6 abilities. Selected ability increases by 2 (cannot exceed 20). Show modifier change: "STR: 16 (+3) -> 18 (+4)"
  - "+1 to two abilities": two dropdowns. Each selected ability increases by 1 (cannot exceed 20). Can select the same ability twice (equivalent to +2)
  - Show the cap: "Ability scores cannot exceed 20 through ASI"
- [ ] **T31.5.3** — **Feat mode:** reuse the FeatPicker from Phase 2 (Story 9.4.3). Show all available feats with prerequisites. Feats the character doesn't qualify for are disabled with an explanation. Selecting a feat applies its effects: some feats grant +1 to an ability (show the ability selector), some grant proficiencies, some grant special abilities
- [ ] **T31.5.4** — After ASI/feat selection, immediately recalculate all derived stats affected by the ability score change. Show a summary: "Stats Changed: STR Mod +3 -> +4, Athletics +5 -> +6, Melee Attack +5 -> +6, STR Save +5 -> +6"
- [ ] **T31.5.5** — **Cantrip replacement (2024 rules optional):** at ASI levels, the player may optionally replace one cantrip with another from the same class. Show: "Would you like to replace a cantrip?" as an optional sub-step

## Acceptance Criteria

1. ASI step appears only at the correct ASI level for the character's class
2. Fighter gets ASI at levels 4, 6, 8, 12, 14, 16, 19 (7 total)
3. Rogue gets ASI at levels 4, 8, 10, 12, 16, 19 (6 total)
4. Two mode cards: "Ability Score Increase" and "Choose a Feat"
5. ASI mode offers +2 to one ability or +1 to two abilities
6. Abilities cannot exceed 20 through ASI (enforced with UI feedback)
7. Modifier changes display clearly (e.g., "STR: 16 (+3) -> 18 (+4)")
8. Feat picker shows available feats with prerequisite validation
9. Ineligible feats are disabled with explanations
10. Feats that grant ability score increases show the ability selector
11. All derived stats recalculate after ASI/feat selection with a summary
12. Optional cantrip replacement is available as a sub-step

## Dependencies

- Story 31.1 (Level Up Entry & Overview) for the wizard container
- Phase 2, Story 9.4.3: FeatPicker component (reused)
- Phase 1 feat data (prerequisites, effects)
- Phase 1 calculation engine (for cascade recalculation)

## Notes

- The cascade recalculation is critical -- a single ability score change can affect 10+ derived stats
- The summary of affected stats helps the player understand the impact of their choice
- Fighter's 7 ASIs and Rogue's 6 ASIs make them the most customizable classes through feats
- Consider showing a "recommended" tag on ability scores that are close to a modifier breakpoint (e.g., STR 15 -> 16 changes modifier from +2 to +3)
- Retroactive HP from CON changes is handled in the HP step (Story 31.2) but the connection should be clear
