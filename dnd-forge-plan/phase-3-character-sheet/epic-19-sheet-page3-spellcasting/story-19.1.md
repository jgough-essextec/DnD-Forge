# Story 19.1 — Spellcasting Header

> **Epic 19: Character Sheet — Page 3 (Spellcasting)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a spellcaster, I need to see my spellcasting ability, spell save DC, and spell attack bonus at the top of the spell page.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Page 3 Conditional Rendering**: Only shown for spellcasting characters. Non-spellcasters see a placeholder message with info about when they might gain spellcasting (e.g., "Eldritch Knight at level 3")
- **Spellcasting Header Stat Boxes**: Four boxes in a row — Spellcasting Class, Spellcasting Ability, Spell Save DC, Spell Attack Bonus
- **Spell Save DC Computation**: 8 + proficiency bonus + spellcasting ability modifier
- **Spell Attack Bonus Computation**: proficiency bonus + spellcasting ability modifier
- **Spellcasting Abilities by Class**: Wizard = Intelligence, Cleric/Druid/Ranger = Wisdom, Bard/Paladin/Sorcerer/Warlock = Charisma
- **Edit Mode**: Spellcasting class and ability are dropdowns (for edge cases). DC and attack bonus can be manually overridden

## Tasks
- [ ] **T19.1.1** — Create `components/character/page3/SpellcastingPage.tsx` as the Page 3 container. Conditionally rendered: if the character has no spellcasting data, show a placeholder message ("This character doesn't have spellcasting abilities" with a note about when they might gain them, e.g., "Eldritch Knight at level 3")
- [ ] **T19.1.2** — Create `components/character/page3/SpellcastingHeader.tsx` — top row with four stat boxes: Spellcasting Class (e.g., "Wizard"), Spellcasting Ability (e.g., "Intelligence"), Spell Save DC (computed: 8 + proficiency + ability mod), Spell Attack Bonus (computed: proficiency + ability mod)
- [ ] **T19.1.3** — Tooltip on Spell Save DC: "8 + Proficiency Bonus (+2) + INT Modifier (+3) = 13"
- [ ] **T19.1.4** — Tooltip on Spell Attack Bonus: "Proficiency Bonus (+2) + INT Modifier (+3) = +5"
- [ ] **T19.1.5** — **Edit mode:** spellcasting class and ability are dropdowns (for edge cases like multiclass or custom). DC and attack bonus can be manually overridden

## Acceptance Criteria
- Page 3 container conditionally renders based on whether the character has spellcasting
- Non-spellcasters see a clear placeholder message with context about future spellcasting
- Four stat boxes display: Spellcasting Class, Spellcasting Ability, Spell Save DC, Spell Attack Bonus
- Spell Save DC is correctly computed: 8 + proficiency + ability modifier
- Spell Attack Bonus is correctly computed: proficiency + ability modifier
- Tooltips show full computation breakdown for DC and attack bonus
- Edit mode provides dropdowns for class and ability, and manual override for DC and attack bonus

## Dependencies
- Story 17.10 (Proficiency Bonus) — used in DC and attack bonus calculations
- Story 17.2 (Ability Scores) — spellcasting ability modifier used in computations
- Phase 1 calculation engine for spell save DC and attack bonus
- Phase 1 SRD data for spellcasting ability by class
- Epic 20 view/edit mode toggle system

## Notes
- The spellcasting page is the third tab of the character sheet — it may not be visited for non-spellcasting characters
- The placeholder message for non-spellcasters should be informative: Fighter subclasses (Eldritch Knight), Rogue subclasses (Arcane Trickster) gain spellcasting at level 3
- Multiclass characters may have multiple spellcasting classes with different abilities — this is an edge case for future phases but the dropdown accommodates it
