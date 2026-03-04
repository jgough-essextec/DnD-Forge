# Story 17.5 — Combat Stats Block (Center Column Top)

> **Epic 17: Character Sheet — Page 1 (Core Stats)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see my AC, initiative bonus, and speed prominently displayed at the top of the center column.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Center Column Layout**: ~35% width on desktop. Combat stats row at top, followed by HP block, hit dice/death saves, then attacks section
- **AC Computation**: Depends on equipped armor. Default: 10 + DEX mod. Light armor: armor base + DEX mod. Medium armor: armor base + DEX mod (max 2). Heavy armor: armor base (no DEX). Shield: +2. Special formulas: Barbarian Unarmored Defense (10 + DEX + CON), Monk Unarmored Defense (10 + DEX + WIS)
- **Initiative Computation**: DEX modifier + any class/feat bonuses (e.g., Alert feat +5, Bard's Jack of All Trades adds half proficiency)
- **Speed**: Walking speed from race data (e.g., Human 30ft, Dwarf 25ft). Multiple movement types possible (swim, fly, climb, burrow)
- **Dice Engine**: Phase 1 dice engine for initiative roll (1d20 + modifier)

## Tasks
- [ ] **T17.5.1** — Create `components/character/page1/CombatStatsRow.tsx` — three prominent stat boxes in a horizontal row: AC (shield icon), Initiative (lightning bolt icon), Speed (boot/running icon). Each box has the numeric value in large bold text and the label below
- [ ] **T17.5.2** — **AC box:** display computed AC from the calculation engine. Tooltip shows breakdown (e.g., "Studded Leather (12) + DEX Mod (+3) = 15" or "Chain Mail (16) + Shield (+2) = 18"). **Edit mode:** AC can be manually overridden with a toggle "Use computed / Manual" — some class features (e.g., Barbarian Unarmored Defense, Monk Unarmored Defense) have unique AC formulas
- [ ] **T17.5.3** — **Initiative box:** display DEX modifier (+ any class/feat bonuses). Tooltip: "DEX Mod (+3)". **Edit mode:** allow custom initiative bonus for features like Bard's Jack of All Trades or the Alert feat (+5). Clicking in view mode rolls initiative (1d20 + modifier)
- [ ] **T17.5.4** — **Speed box:** display walking speed from race data. If the character has multiple movement types (rare at level 1 but possible), show primary speed with a dropdown for others (swim, fly, climb, burrow). **Edit mode:** speed is editable for armor penalties or magic effects
- [ ] **T17.5.5** — Apply class-specific AC formula logic: detect Barbarian (10 + DEX + CON), Monk (10 + DEX + WIS), and default armor-based calculations. Show which formula is active in the tooltip

## Acceptance Criteria
- Three stat boxes (AC, Initiative, Speed) display prominently in a horizontal row
- Each box has an icon, large numeric value, and label
- AC is computed correctly based on equipped armor, shield, and class-specific formulas
- AC tooltip shows the full computation breakdown
- Initiative displays DEX modifier plus any bonuses
- Clicking initiative in view mode rolls 1d20 + modifier
- Speed displays walking speed with dropdown for additional movement types
- Edit mode allows manual AC override, custom initiative bonus, and speed editing
- Class-specific AC formulas (Barbarian, Monk) are correctly detected and applied

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compute AC with default formula (10 + DEX mod) when no armor equipped`
- `should compute AC with light armor formula (armor base + DEX mod)`
- `should compute AC with medium armor formula (armor base + DEX mod capped at 2)`
- `should compute AC with heavy armor formula (armor base only, no DEX)`
- `should compute AC with shield bonus (+2)`
- `should compute Barbarian Unarmored Defense (10 + DEX + CON)`
- `should compute Monk Unarmored Defense (10 + DEX + WIS)`
- `should compute initiative as DEX modifier plus any class/feat bonuses`
- `should generate AC tooltip breakdown string for each armor type`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render three stat boxes (AC, Initiative, Speed) in a horizontal row with icons`
- `should display large numeric values with labels below each box`
- `should show AC tooltip with full computation breakdown on hover`
- `should roll initiative (1d20 + modifier) when clicking initiative box in view mode`
- `should display walking speed with dropdown for additional movement types`
- `should provide manual AC override toggle in edit mode`
- `should show warning indicator when AC is manually overridden`
- `should allow custom initiative bonus input in edit mode`
- `should allow speed editing in edit mode`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should click initiative box, see dice roll, and display the result inline`

### Test Dependencies
- Mock character data for different armor types (light, medium, heavy, unarmored)
- Mock character data for Barbarian and Monk classes (special AC formulas)
- Mock dice engine for initiative roll
- Mock calculation engine for AC, initiative, speed computation
- Mock view/edit mode context

## Identified Gaps

- **Edge Cases**: No specification for speed reduction from heavy armor without sufficient STR (e.g., Chain Mail requires STR 13)
- **Accessibility**: No ARIA labels for stat boxes, no keyboard interaction for initiative roll, no screen reader support for tooltip breakdown
- **Error Handling**: No specification for manual AC override validation (minimum/maximum values)

## Dependencies
- Story 17.2 (Ability Score Blocks) — AC uses DEX/CON/WIS modifiers, initiative uses DEX
- Story 18.3 (Equipment) — AC depends on equipped armor and shield
- Phase 1 calculation engine for AC, initiative, and speed computation
- Phase 1 dice engine for initiative roll
- Epic 20 view/edit mode toggle system

## Notes
- AC is one of the most complex computed values due to the many possible formulas
- Manual AC override should show a warning indicator so players know the value is overridden
- Heavy armor without sufficient STR can reduce speed (e.g., Chain Mail requires STR 13)
- At level 1, most characters have only walking speed, but some races (e.g., Aarakocra) have fly speed
