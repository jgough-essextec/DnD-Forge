# Story 39.2 — Page 1: Core Stats Layout

> **Epic 39: PDF Character Sheet Export** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player exporting my character sheet, I need Page 1 to show all combat-relevant stats in a familiar layout. Page 1 reproduces the official D&D 5e character sheet front page with the character header, ability scores column, saving throws, skills, combat stats, hit points, attacks table, personality traits, and features/proficiencies.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **PDF Layout**: Uses jsPDF direct drawing API with coordinates defined in `utils/pdfLayout.ts`. All measurements in mm. US Letter = 215.9mm x 279.4mm
- **Page 1 Structure**: Three-column layout matching official 5e sheet — Left (ability scores, saves, skills), Center (combat stats, HP, attacks), Right (personality, features)
- **Typography**: Cinzel for headings, Helvetica for body. Sizes defined in `utils/pdfStyles.ts`
- **Data Source**: Character model from Phases 1-3 with computed values from the calculation engine

## Tasks

- [ ] **T39.2.1** — **Character header:** name (large, centered), class & level, background, player name, race, alignment, experience points — arranged in a two-row header block with labeled fields
- [ ] **T39.2.2** — **Ability scores column (left):** six vertical blocks, each containing: score (large number in a box), modifier (derived, in a circle or shield shape below), ability name label. Positioned along the left margin
- [ ] **T39.2.3** — **Saving throws section:** six rows (one per ability), each with: filled/empty proficiency circle, modifier value, ability name. Adjacent to the ability score column
- [ ] **T39.2.4** — **Skills section:** 18 rows, each with: filled/empty proficiency circle (double-filled for expertise), modifier value, skill name. Grouped visually below saving throws
- [ ] **T39.2.5** — **Inspiration & proficiency bonus:** two small boxes at the top of the saves/skills column. Proficiency bonus auto-populated
- [ ] **T39.2.6** — **Passive Perception:** labeled box below skills showing the computed value
- [ ] **T39.2.7** — **Combat stats row (center-top):** three prominent boxes: AC (with armor type note), Initiative, Speed. Positioned prominently
- [ ] **T39.2.8** — **Hit Points block (center):** HP Maximum (labeled), Current HP (large box), Temporary HP (smaller box). Below: Hit Dice (total and type), Death Saves (three success circles, three failure circles)
- [ ] **T39.2.9** — **Attacks & Spellcasting table (center-bottom):** table with columns: Name, Atk Bonus, Damage/Type. Pre-populated with character's equipped weapons and cantrip attacks. Space for additional rows
- [ ] **T39.2.10** — **Personality block (right column):** four labeled boxes stacked vertically: Personality Traits, Ideals, Bonds, Flaws. Text auto-sized to fit (reduce font size for long entries)
- [ ] **T39.2.11** — **Features & Traits (right column, bottom):** scrollable text block listing all racial traits, class features, and feat descriptions. Truncate with "..." if content exceeds available space, with a note: "See full sheet for complete features"
- [ ] **T39.2.12** — **Proficiencies & Languages (bottom-left):** labeled box listing armor, weapon, tool, and language proficiencies

## Acceptance Criteria

- Page 1 of the PDF contains all combat-relevant character stats in the official 5e layout
- All six ability scores render with scores, modifiers, and labels in the left column
- Saving throws show proficiency indicators and correct modifiers
- All 18 skills render with proficiency circles (filled/empty/double for expertise) and modifiers
- Combat stats (AC, Initiative, Speed) are prominently displayed
- Hit points block shows max HP, current HP, temp HP, hit dice, and death saves
- Attacks table is populated with equipped weapons and cantrip attacks
- Personality traits, ideals, bonds, and flaws render with auto-sized text
- Features and proficiencies are listed with appropriate truncation for overflow
- All computed values (modifiers, AC, initiative, passive perception) are correctly calculated

## Dependencies

- Story 39.1 (PDF generation architecture must be in place)
- Character calculation engine from Phase 3 (derived stats)
- Character data model with all fields populated

## Notes

- Text auto-sizing is critical for personality traits and features — long entries should reduce font size to fit, with a minimum readable size of 8pt
- Proficiency circles should match the style used in the app: filled (proficient), empty (not proficient), double-ring (expertise)
- The layout should closely match the official 5e character sheet for familiarity
