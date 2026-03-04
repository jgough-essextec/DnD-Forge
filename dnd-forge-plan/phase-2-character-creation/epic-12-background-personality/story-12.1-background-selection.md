# Story 12.1 — Background Selection

> **Epic 12: Background & Personality Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to choose a background that gives my character a history and additional proficiencies. This story builds the background selector with card/list display, expanded detail view, skill overlap detection and replacement, and language/tool proficiency choices.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **SRD Backgrounds**: Acolyte, Charlatan, Criminal, Entertainer, Folk Hero, Guild Artisan, Hermit, Noble, Outlander, Sage, Sailor, Soldier, Urchin (and others in SRD data)
- **Background Data**: Each background provides: name, description, feature (name + description), skill proficiencies (2 skills), tool proficiencies (varies), languages (varies), equipment (fixed list), personality characteristics tables (traits d8, ideals d6, bonds d6, flaws d6)
- **Skill Overlap Detection (Gap W4)**: If a background grants a skill the character already has from class or race, the PHB rules say the player may choose a replacement skill from any skill. The wizard must detect this overlap and prompt the player
  - Example: Elf gets Perception (race), Outlander grants Perception → overlap → player picks any other skill as replacement
  - Example: Criminal background grants Stealth, Rogue already chose Stealth → overlap → player picks replacement
- **Language Choices**: Some backgrounds offer language choices (e.g., Acolyte: 2 languages of choice). Reuse LanguagePicker from Epic 9 with already-known languages pre-excluded
- **Tool Proficiency Choices**: Some backgrounds offer tool choices (e.g., Guild Artisan: one type of artisan's tools)

## Tasks

- [ ] **T12.1.1** — Create `components/wizard/BackgroundStep.tsx` as the Step 4 container. Layout: background selector on the left/top, personality and description on the right/bottom
- [ ] **T12.1.2** — Create `components/wizard/background/BackgroundSelector.tsx` — list or card grid of all available backgrounds. Each card shows: name, skill proficiencies granted, tool proficiencies, languages, and a brief one-sentence description
- [ ] **T12.1.3** — On selecting a background, expand to show: full description, feature name and description, granted equipment list, and personality characteristic tables (traits, ideals, bonds, flaws)
- [ ] **T12.1.4** — Implement skill overlap detection: if the selected background grants a skill the character already has from class or race, highlight the conflict in red and show a replacement picker ("You already have Perception from your Elf race. Choose a replacement skill from any skill list.")
- [ ] **T12.1.5** — If the background offers language choices, show the language picker (reuse from Race Step) with already-known languages pre-excluded
- [ ] **T12.1.6** — If the background offers tool proficiency choices (e.g., Guild Artisan: one type of artisan's tools), show a dropdown selector

## Acceptance Criteria

- All SRD backgrounds are displayed in a selectable card/list grid
- Each background card shows name, skill proficiencies, tool proficiencies, languages, and brief description
- Selecting a background expands to show full details including feature, equipment, and personality tables
- Skill overlap is detected and highlighted in red when a background skill conflicts with existing race/class skills
- A replacement skill picker appears for each overlap, allowing selection from any skill
- Language choices show the LanguagePicker with already-known languages excluded
- Tool proficiency choices show a dropdown selector
- Only one background can be selected at a time

## Dependencies

- **Depends on:** Story 8.1 (Wizard Shell — this is Step 4), Epic 9 Story 9.4 (LanguagePicker component for reuse), Epic 9 Story 9.5 (race skill data for overlap detection), Epic 10 Story 10.6 (class skill data for overlap detection), Phase 1 SRD background data
- **Blocks:** Story 12.2 (personality tables come from selected background), Story 12.4 (validation checks background selection and replacements)

## Notes

- **Skill Overlap Resolution Example**:
  1. Player is a Wood Elf Rogue who chose Perception and Stealth as class skills
  2. Player selects Criminal background (grants Deception, Stealth)
  3. Stealth overlaps with class skill → highlight conflict
  4. Player picks any skill as replacement (e.g., Insight)
  5. Final skills: Perception (race), Stealth (class), other class skills, Deception (background), Insight (background replacement)
- Background equipment is separate from class starting equipment and is always granted (not a choice). Display it as a read-only list
- The background feature is a narrative/roleplay feature (e.g., Acolyte's "Shelter of the Faithful") — it doesn't have mechanical stats to compute
- Consider sorting backgrounds alphabetically or by theme (social, wilderness, criminal, scholarly)
- The personality characteristic tables (traits, ideals, bonds, flaws) are used in Story 12.2 — show a preview here but full interaction is in the next story
