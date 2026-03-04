# Story 9.4 — Race-Specific Choice Panels

> **Epic 9: Race Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player choosing a race with additional decisions (Half-Elf skills, High Elf cantrip, Variant Human feat), I need clear interfaces for each choice. This story builds six specialized picker components for race-specific decisions: ability bonus chooser, skill chooser, feat picker, cantrip picker, language picker, and Dragonborn ancestry picker.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Race-Specific Choices**:
  - **Half-Elf**: +1 to two ability scores (any except CHA which is fixed +2), choose 2 skill proficiencies (from any of the 18 skills)
  - **Variant Human**: +1 to two ability scores (any two), choose 1 skill proficiency (from any), choose 1 feat (must meet prerequisites)
  - **High Elf**: Choose 1 wizard cantrip (from the wizard cantrip list), choose 1 extra language
  - **Dragonborn**: Choose 1 draconic ancestry (10 options) determining breath weapon and damage resistance
- **Feat Prerequisites**: Some feats have ability score prerequisites (e.g., "Requires STR 13+") or other requirements. Feats whose prerequisites the character doesn't meet are disabled with an explanation
- **Feat Sub-Choices**: Some feats include additional choices (e.g., ability score increases, proficiency picks). The feat picker must handle nested sub-pickers
- **Reusability**: AbilityBonusChooser, SkillChooser, LanguagePicker, and FeatPicker are reused in later steps/phases (class skill selection, background skills, ASI/feat at level up)

## Tasks

- [ ] **T9.4.1** — Create `components/wizard/race/AbilityBonusChooser.tsx` — for Half-Elf and Variant Human. Shows 6 ability score buttons; the player selects the required number. Already-fixed bonuses (e.g., Half-Elf CHA +2) are shown but not selectable. Validate correct count selected
- [ ] **T9.4.2** — Create `components/wizard/race/SkillChooser.tsx` — reusable component for picking N skills from a list. Used by Half-Elf (choose 2 from any), Variant Human (choose 1 from any). Shows skills as a checkbox list with ability grouping. Enforces the choose count
- [ ] **T9.4.3** — Create `components/wizard/race/FeatPicker.tsx` — for Variant Human only at this stage (reused later for ASI/feat at level up). Displays available feats as cards with name, prerequisites, and description. Feats whose prerequisites the character doesn't meet are disabled with explanation. Selecting a feat that includes ability score increases or proficiency choices shows nested sub-pickers
- [ ] **T9.4.4** — Create `components/wizard/race/CantripPicker.tsx` — for High Elf (choose 1 wizard cantrip). Shows cantrip cards from the wizard spell list filtered to level 0. Each card shows name, school, casting time, and description preview
- [ ] **T9.4.5** — Create `components/wizard/race/LanguagePicker.tsx` — reusable dropdown for choosing additional languages. Filters out languages the character already knows. Used by High Elf (+1 language) and any race with language choices
- [ ] **T9.4.6** — Create `components/wizard/race/DragonbornAncestryPicker.tsx` — table/card grid of 10 ancestry options (Black/Acid, Blue/Lightning, Brass/Fire, Bronze/Lightning, Copper/Acid, Gold/Fire, Green/Poison, Red/Fire, Silver/Cold, White/Cold). Each shows dragon color, damage type, breath weapon shape (5x30 ft line or 15 ft cone), and saving throw type

## Acceptance Criteria

- AbilityBonusChooser shows 6 ability buttons with fixed bonuses locked; enforces the correct selection count
- SkillChooser shows all skills grouped by ability with checkboxes; enforces the choose count (2 for Half-Elf, 1 for Variant Human)
- FeatPicker displays feat cards with prerequisites; disables feats whose prerequisites aren't met; shows nested sub-pickers for feats with additional choices
- CantripPicker shows wizard cantrips (level 0) as cards with name, school, casting time, and description preview
- LanguagePicker shows a dropdown of available languages excluding already-known languages
- DragonbornAncestryPicker shows 10 ancestries with dragon color, damage type, breath weapon shape, and saving throw type
- All pickers enforce their required selections and provide clear feedback on what remains to be chosen

## Dependencies

- **Depends on:** Story 9.2 (Race Detail Panel — these pickers render within the panel), Story 9.3 (Subrace Selection triggers these pickers), Phase 1 SRD race data, Phase 1 SRD spell data (for cantrip list), Phase 1 SRD feat data
- **Blocks:** Story 9.5 (validation checks all race-specific choices are complete), Epic 10 Story 10.3 (SkillChooser is reused for class skill selection), Epic 12 Story 12.1 (LanguagePicker and SkillChooser reused for background)

## Notes

- **Feat Complexity**: The FeatPicker is one of the more complex components in the entire wizard. D&D 5e SRD feats include: Grappler (requires STR 13), Alert, Tough, Lucky, War Caster (requires spellcasting), etc. Some feats grant ability score increases that need to be tracked
- **Skill Grouping by Ability**:
  - STR: Athletics
  - DEX: Acrobatics, Sleight of Hand, Stealth
  - INT: Arcana, History, Investigation, Nature, Religion
  - WIS: Animal Handling, Insight, Medicine, Perception, Survival
  - CHA: Deception, Intimidation, Performance, Persuasion
- **Wizard Cantrips for High Elf**: Fire Bolt, Light, Mage Hand, Mending, Message, Minor Illusion, Prestidigitation, Ray of Frost, Shocking Grasp, etc. (filtered from the spell data where class includes "Wizard" and level = 0)
- **Language List**: Common, Dwarvish, Elvish, Giant, Gnomish, Goblin, Halfling, Orc, Abyssal, Celestial, Draconic, Deep Speech, Infernal, Primordial, Sylvan, Undercommon
- All picker components should be designed for reuse — accept props for configuration rather than hardcoding race-specific behavior
