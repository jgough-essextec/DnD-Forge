# Story 17.5 — Combat Stats Block (Center Column Top)

> **Epic 17: Character Sheet — Page 1 (Core Stats)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see my AC, initiative bonus, and speed prominently displayed at the top of the center column.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
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
