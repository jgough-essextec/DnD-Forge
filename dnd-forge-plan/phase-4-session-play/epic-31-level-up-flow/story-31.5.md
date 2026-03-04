# Story 31.5 — ASI / Feat Selection Step (Conditional)

> **Epic 31: Level Up Flow** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player reaching an ASI level, I need to choose between increasing ability scores or taking a feat. This step presents the player with two options: increase ability scores (with three sub-options) or select a feat from the available list. After selection, all derived stats affected by ability score changes are recalculated and displayed.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
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

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should return correct ASI levels for each class (Fighter: 4,6,8,12,14,16,19; Rogue: 4,8,10,12,16,19; others: 4,8,12,16,19)`
- `should enforce ability score cap of 20 for ASI increases`
- `should calculate +2 to one ability correctly with cap enforcement`
- `should calculate +1 to two abilities correctly with cap enforcement`
- `should validate feat prerequisites (e.g., Grappler requires STR 13+)`
- `should cascade recalculate all derived stats after ability score change (modifier, skills, saves, spell DC, AC, HP)`
- `should calculate retroactive HP change when CON modifier increases`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render ASIStep only at correct ASI level for the character's class`
- `should display two mode cards: "Ability Score Increase" and "Choose a Feat"`
- `should show +2 to one ability dropdown with all 6 abilities and prevent exceeding 20`
- `should show +1 to two abilities with two dropdowns`
- `should display modifier change preview (e.g., "STR: 16 (+3) -> 18 (+4)")`
- `should reuse FeatPicker from Phase 2 with prerequisite validation`
- `should disable ineligible feats with explanation`
- `should show ability selector for feats that grant +1 to an ability`
- `should display cascade recalculation summary after selection`
- `should offer optional cantrip replacement sub-step at ASI levels`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should select +2 STR at ASI level, verify modifier change preview and cascade recalculation summary`
- `should select Alert feat and verify +5 initiative in recalculation summary`
- `should attempt to increase an ability already at 20 and verify cap enforcement`
- `should select Resilient feat, choose an ability, and verify save proficiency added`

### Test Dependencies
- Mock character data at ASI levels for Fighter (7 ASIs), Rogue (6 ASIs), standard class (5 ASIs)
- Mock Phase 2 FeatPicker component
- Mock Phase 1 feat data with prerequisites
- Mock Phase 1 calculation engine for cascade recalculation
- Character with various ability scores near breakpoints and cap

## Identified Gaps

- **Error Handling**: No specification for what happens if character already has all abilities at 20 (no valid ASI choice); no undo for ASI/feat selection within the wizard step
- **Edge Cases**: Feats that grant +1 to a choice of abilities and that ability is already at 20; "same ability twice" option for +1/+1 should be explicitly tested; interaction between Tough feat (retroactive +2 HP per level) and HP calculation
- **Accessibility**: Mode card selection should be keyboard navigable; ability score dropdowns need ARIA labels; feat prerequisites explanation should be screen-reader accessible
- **Performance**: Cascade recalculation may be computationally expensive -- no performance target specified

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
