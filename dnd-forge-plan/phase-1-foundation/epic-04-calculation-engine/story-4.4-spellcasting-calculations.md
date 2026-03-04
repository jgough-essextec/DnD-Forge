# Story 4.4 — Spellcasting Calculations

> **Epic 4: Calculation Engine** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need functions for spell save DC, spell attack bonus, spell slots (including multiclass), and preparation limits.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Spell save DC formula**: 8 + proficiency bonus + spellcasting ability modifier. Each class uses a different spellcasting ability: Wizard/Fighter(EK)/Rogue(AT) = INT, Cleric/Druid/Ranger = WIS, Bard/Paladin/Sorcerer/Warlock = CHA
- **Spell attack bonus formula**: Proficiency bonus + spellcasting ability modifier
- **Single-class spell slots**: Looked up from the class spell slot progression table based on class level and spellcasting type:
  - Full casters (Bard, Cleric, Druid, Sorcerer, Wizard): Full table, start at level 1
  - Half casters (Paladin, Ranger): Half table, start at level 2
  - Third casters (Arcane Trickster Rogue, Eldritch Knight Fighter): Third table, start at level 3
  - Non-casters (Barbarian, Fighter base, Monk, Rogue base): No spell slots
- **Multiclass spell slots**: When multiclassing, spell slot calculation uses a combined caster level:
  - Full casters contribute full class level
  - Half casters contribute half class level (rounded down)
  - Third casters contribute one-third class level (rounded down)
  - Warlock Pact Magic does NOT contribute to this calculation — tracked entirely separately
  - The combined caster level is looked up in the multiclass spell slot table (20 rows)
  - Example: Cleric 3 / Wizard 5 = combined caster level 8 (3 + 5), gets spell slots for a level 8 caster
  - Example: Paladin 4 / Sorcerer 3 = combined caster level 5 (2 + 3), gets spell slots for a level 5 caster
- **Cantrips known**: From class cantrip progression table. Number varies by class and level. Cantrips scale at character levels 5, 11, and 17 (not class level)
- **Spells prepared** (for prepared casters — Cleric, Druid, Paladin, Wizard): Ability modifier + class level (minimum 1). Wizard prepares from spellbook. Cleric/Druid prepare from full class list
- **Spells known** (for known casters — Bard, Ranger, Sorcerer): Fixed number from class table by level. Can swap one spell on level-up
- **Pact Magic** (Warlock only): Completely separate from standard spell slots. Few slots (1 at level 1, up to 4 at level 11+), all at the same level (starts at 1st, scales to 5th by level 9). Recharge on short rest. Mystic Arcanum at 11+ (one spell each of 6th, 7th, 8th, 9th level, each usable 1/long rest)

## Tasks
- [ ] **T4.4.1** — Implement `getSpellSaveDC(character: Character): number` — 8 + proficiency bonus + spellcasting ability modifier
- [ ] **T4.4.2** — Implement `getSpellAttackBonus(character: Character): number` — proficiency bonus + spellcasting ability modifier
- [ ] **T4.4.3** — Implement `getSpellSlots(character: Character): SpellSlots` — uses class spell slot progression table for single-class; multiclass spellcaster table for multiclass (summing caster levels: full=1, half=0.5 rounded down, third=0.33 rounded down, pact magic=separate)
- [ ] **T4.4.4** — Implement `getCantripsKnown(character: Character): number` — from class cantrip progression table
- [ ] **T4.4.5** — Implement `getSpellsPrepared(character: Character): number` — for prepared casters: ability modifier + class level (min 1). For known casters: fixed from class table
- [ ] **T4.4.6** — Implement `getPactMagicSlots(character: Character): { count: number; level: number }` — Warlock-specific: slots and their level by Warlock level
- [ ] **T4.4.7** — Write unit tests: spell save DC for Wizard INT 18 at level 5, multiclass Cleric 3/Wizard 5 spell slots (combined caster level 8), Warlock pact magic separate from multiclass slots, prepared spell count for Cleric WIS 16 level 4

## Acceptance Criteria
- `getSpellSaveDC()` returns 8 + proficiency + ability modifier for the correct spellcasting ability
- `getSpellAttackBonus()` returns proficiency + ability modifier
- `getSpellSlots()` returns correct slots for single-class casters at all levels
- `getSpellSlots()` correctly calculates multiclass spell slots by combining caster levels and looking up the multiclass table
- `getSpellSlots()` keeps Warlock Pact Magic slots entirely separate from standard slots
- `getCantripsKnown()` returns the correct number for each class at each level
- `getSpellsPrepared()` returns ability modifier + class level for prepared casters, and fixed table value for known casters
- `getPactMagicSlots()` returns correct slot count and level for Warlock at all levels
- Unit tests verify multiclass spell slot interaction, Warlock separation, and all preparation formulas

## Dependencies
- **Depends on:** Story 2.3 (SpellcastingType, ClassSpellcasting), Story 2.5 (SpellSlots, PactMagic, SpellcastingData, MULTICLASS_SPELL_SLOT_TABLE), Story 2.8 (Character), Story 3.2 (class data, spell slot progression tables), Story 4.1 (getModifier, getEffectiveAbilityScores), Story 4.2 (getProficiencyBonus)
- **Blocks:** Story 4.5 (level up shows new spell slots), Story 4.8 (validation checks spell counts)

## Notes
- For multiclass characters with multiple spellcasting classes, they may have different spellcasting abilities. The spell save DC and attack bonus are typically calculated per-class. However, they all use the same spell slot pool (except Warlock)
- A multiclass Warlock/Wizard has two completely independent spell slot systems: Warlock Pact Magic (1-4 slots, all at same level, short rest recharge) and Wizard standard slots (from multiclass table). They can use either type of slot to cast any spell they know/have prepared
- The "minimum 1" rule for prepared spells means even a Cleric with WIS 10 (modifier +0) at level 1 can prepare at least 1 spell
- Half casters (Paladin, Ranger) don't gain spellcasting until level 2. At level 1, they have no spell slots. For multiclass calculation, a Paladin 1 contributes 0 caster levels (floor(1/2) = 0)
- Third casters (EK Fighter, AT Rogue) don't gain spellcasting until level 3. Fighter 2 contributes 0 caster levels (floor(2/3) = 0), Fighter 3 contributes 1
