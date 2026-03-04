# Story 17.4 — Skills List

> **Epic 17: Character Sheet — Page 1 (Core Stats)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see all 18 skills with proficiency indicators, expertise markers, and computed modifiers, grouped or listed in the official order.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Left Column Layout**: Skills list renders below saving throws in the left column (~30% width)
- **Skill Computation**: modifier = ability mod + proficiency bonus (if proficient) + double proficiency bonus (if expertise). Jack of All Trades (Bard feature) adds half proficiency bonus to non-proficient skills
- **Proficiency States**: empty circle (not proficient), filled circle (proficient), double circle/filled with inner ring (expertise), half-filled dot (Jack of All Trades)
- **18 Official Skills in Alphabetical Order**: Acrobatics (DEX), Animal Handling (WIS), Arcana (INT), Athletics (STR), Deception (CHA), History (INT), Insight (WIS), Intimidation (CHA), Investigation (INT), Medicine (WIS), Nature (INT), Perception (WIS), Performance (CHA), Persuasion (CHA), Religion (INT), Sleight of Hand (DEX), Stealth (DEX), Survival (WIS)
- **Passive Scores**: Passive Perception = 10 + Perception modifier. Also Passive Insight and Passive Investigation
- **Dice Engine**: Phase 1 dice engine for click-to-roll (1d20 + skill modifier)

## Tasks
- [ ] **T17.4.1** — Create `components/character/page1/SkillsList.tsx` — renders all 18 skills in the official alphabetical order. Each row: proficiency indicator, skill modifier (signed), skill name, and governing ability abbreviation in muted text (e.g., "Stealth (DEX)")
- [ ] **T17.4.2** — Proficiency indicator states: empty circle = not proficient, filled circle = proficient, double circle (or filled with inner ring) = expertise. Modifier calculation: ability mod + proficiency bonus (if proficient) + double proficiency bonus (if expertise). Jack of All Trades (Bard feature): add half proficiency bonus to non-proficient skills — show as half-filled dot
- [ ] **T17.4.3** — **Edit mode:** proficiency dots cycle through three states on click: not proficient -> proficient -> expertise -> not proficient. This recalculates the modifier immediately
- [ ] **T17.4.4** — In view mode, clicking a skill triggers a dice roll: roll 1d20 + modifier. Display the result inline with the skill name highlighted
- [ ] **T17.4.5** — Below the skills list, show "Passive Perception: N" (10 + Perception modifier). Also show Passive Insight and Passive Investigation as these are commonly referenced by DMs
- [ ] **T17.4.6** — **Edit mode:** add a "Custom Bonus" field next to each skill for situational modifiers (e.g., Observant feat adds +5 to passive Perception)

## Acceptance Criteria
- All 18 skills display in official alphabetical order with governing ability abbreviation
- Proficiency indicators correctly show not proficient, proficient, and expertise states
- Modifiers are correctly computed including proficiency, expertise, and Jack of All Trades
- In view mode, clicking a skill rolls 1d20 + modifier and displays the result inline
- In edit mode, proficiency dots cycle through three states with immediate recalculation
- Passive Perception, Passive Insight, and Passive Investigation display below the skills list
- Custom bonus fields are available in edit mode for situational modifiers
- Skills list is compact enough to fit in the left column on desktop

## Dependencies
- Story 17.2 (Ability Score Blocks) — skills depend on ability modifiers
- Story 17.10 (Proficiency Bonus) — skills use proficiency bonus
- Phase 1 dice engine for click-to-roll functionality
- Phase 1 calculation engine for skill modifier computation
- Epic 20 view/edit mode toggle system

## Notes
- The skills list is one of the most frequently referenced sections during gameplay — it must be scannable and compact
- Jack of All Trades is a Bard class feature: it means the half-filled dot state is only relevant for Bard characters
- Custom bonuses accommodate feats like Observant (+5 passive Perception/Investigation) and class features like Remarkable Athlete
