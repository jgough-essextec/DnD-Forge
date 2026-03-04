# Story 19.3 — Spell Slots & Spell Lists by Level

> **Epic 19: Character Sheet — Page 3 (Spellcasting)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a spellcaster, I need to see my spell slots and spell lists organized by spell level (1-9), with tracking for used slots and prepared/unprepared spell toggles.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Spell Slots**: Each spell level has a total number of slots and tracks expended slots. Slot counts depend on class and level. Always interactive (even in view mode) since slot tracking happens during play
- **Prepared vs. Known Casters**:
  - Prepared casters (Cleric, Druid, Wizard, Paladin): choose which spells to prepare each day. Show prepared checkbox. Prepared count vs. maximum enforced
  - Known casters (Bard, Sorcerer, Warlock): always "know" their spells. Show "Known" badge, no checkbox
- **Warlock Pact Magic**: Separate from regular spell slots. Always cast at highest available level. Recharge on short rest (not long rest like regular slots)
- **Spell Row Display**: Each spell shows prepared checkbox (if applicable), name, school icon, casting time, concentration badge, ritual badge
- **Spell Detail**: Clicking a spell expands to show full detail inline or in a side panel
- **Spell Description Hover**: Quick-preview tooltips showing name, components (V/S/M), and first sentence of description

## Tasks
- [ ] **T19.3.1** — Create `components/character/page3/SpellLevelSection.tsx` — a repeating section for each spell level (1 through 9, showing only levels the character has access to). Each section has: level header ("1st Level", "2nd Level", etc.), slot tracker, and spell list
- [ ] **T19.3.2** — **Spell slot tracker:** displays "Slots Total: N" and "Slots Expended: M" as a row of fillable circles. Clicking an empty circle marks it as expended (filled/crossed). Clicking an expended circle marks it as recovered. Always interactive (even in view mode since slot tracking happens during play)
- [ ] **T19.3.3** — **Spell list:** for each spell level, list all known/spellbook spells available at that level. Each spell row shows: prepared checkbox (for prepared casters), spell name, school icon, casting time, concentration badge (if applicable), ritual badge (if applicable)
- [ ] **T19.3.4** — **Prepared spell checkbox:** for prepared casters (Cleric, Druid, Wizard, Paladin), the checkbox toggles whether the spell is currently prepared. Show the prepared count vs. maximum: "Prepared: 4 / 5". Enforce the maximum — disable checkboxes when the limit is reached. For known casters (Bard, Sorcerer, Warlock), all spells are always "known" — hide the checkbox and show a "Known" badge
- [ ] **T19.3.5** — Clicking a spell name expands to show the full spell detail inline (or opens a side panel). Include all spell properties from the spell data
- [ ] **T19.3.6** — **Warlock Pact Magic:** if the character is a Warlock, display Pact Magic slots separately from regular spell slots. Label as "Pact Magic Slots" with a note: "Recharge on short rest." Warlock slots are always cast at the highest available level — show the current level prominently
- [ ] **T19.3.7** — **Edit mode:** "Add Spell" button per level opens the spell browser filtered to that level and class. "Remove Spell" button on each row. For Wizard spellbook: distinguish between "In Spellbook" (permanent) and "Prepared" (daily choice)
- [ ] **T19.3.8** — **Spell description on hover:** quick-preview tooltips that show spell name, components (V/S/M), and first sentence of description without needing to click

## Acceptance Criteria
- Spell level sections display for each level the character has access to (not empty levels)
- Each section has a level header, slot tracker with fillable circles, and spell list
- Spell slot circles are always interactive for tracking expended slots during play
- Spell list shows all spells at that level with appropriate icons and badges
- Prepared casters show prepared checkboxes with count/maximum enforcement
- Known casters show "Known" badges instead of checkboxes
- Warlock Pact Magic slots display separately with "Recharge on short rest" note
- Clicking a spell name shows full spell detail
- Hover tooltips show quick spell preview (name, components, first sentence)
- Edit mode provides "Add Spell" and "Remove Spell" buttons per level
- Wizard spellbook distinguishes between "In Spellbook" and "Prepared" states

## Dependencies
- Story 19.1 (Spellcasting Header) — spell levels are part of the spellcasting page
- Story 19.2 (Cantrips) — cantrips section precedes spell level sections
- Phase 1 SRD spell data for spell details, school, components
- Phase 1 calculation engine for spell slot counts by class/level
- Phase 2 SpellDetailCard and spell browser components
- Epic 20 view/edit mode toggle system

## Notes
- Spell slot tracking is one of the most interactive elements during a D&D session — it must be fast and intuitive
- The prepared spell limit is class-specific: Cleric/Druid = WIS mod + level, Wizard = INT mod + level, Paladin = CHA mod + half level (minimum 1)
- Warlock Pact Magic is fundamentally different from regular spellcasting and must be visually distinct
- The Wizard spellbook concept means a Wizard may "know" more spells than they can prepare — the spellbook is the full list, prepared is the daily subset
- Spell slot used tracking is a session field (Gap S1) — starts at 0 for new characters
