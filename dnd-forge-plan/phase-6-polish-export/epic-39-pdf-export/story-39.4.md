# Story 39.4 — Page 3: Spellcasting Layout

> **Epic 39: PDF Character Sheet Export** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a spellcaster, I need Page 3 to show my spellcasting stats, spell slots, and full spell list organized by level. This page includes the spellcasting header (class, ability, save DC, attack bonus), cantrips, spell levels 1-9 with slot tracking and prepared status, special handling for Warlock Pact Magic, and dense multi-column layout to fit as many spells as possible.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **PDF Layout**: Uses jsPDF direct drawing API with coordinates from `utils/pdfLayout.ts`. US Letter = 215.9mm x 279.4mm
- **Page 3 Structure**: Spellcasting header, cantrips, spell levels 1-9 with slot circles and prepared checkboxes
- **Spell Data**: From SRD spells.json, character's known/prepared spells from Phase 2 creation and Phase 4 session play
- **Density Target**: 7-8pt font for spell names, two columns for characters with many spells
- **Non-Casters**: Page 3 shows "No Spellcasting" centered or is omitted entirely based on export options
- **Warlock Special Case**: Pact Magic displayed separately from regular spell slots (short rest recovery)

## Tasks

- [ ] **T39.4.1** — **Spellcasting header:** spellcasting class, spellcasting ability, spell save DC, spell attack bonus — all in labeled boxes across the top
- [ ] **T39.4.2** — **Cantrips section:** list of known cantrips with names. Compact format since cantrips don't use slots
- [ ] **T39.4.3** — **Spell levels 1-9:** for each level, show: "Level [N]" header, slots total (circle row: filled = max slots), then a list of spell names with a checkbox/circle for "Prepared" status. Mark prepared spells as filled, unprepared as empty. Domain/always-prepared spells marked with a star
- [ ] **T39.4.4** — **Warlock Pact Magic:** separate section at the top of the spell list, visually distinct. Shows "Pact Magic: [N] x Level [M] Slots (Short Rest)" followed by Warlock spell list
- [ ] **T39.4.5** — **Spell list density:** fit as many spells per column as possible. Use two columns for spell lists if the character has many spells. Font size 7-8pt for spell names to maximize space
- [ ] **T39.4.6** — **Non-casters:** if the character has no spellcasting, Page 3 shows "No Spellcasting" centered, or the page is omitted entirely based on export options

## Acceptance Criteria

- Page 3 renders spellcasting header with correct class, ability, save DC, and attack bonus
- Cantrips are listed in a compact format without slot circles
- Each spell level (1-9) shows level header, slot circles (filled for max slots), and spell list with prepared/unprepared indicators
- Domain and always-prepared spells are marked with a star indicator
- Warlock Pact Magic is displayed in a visually distinct section with short rest recovery note
- Two-column layout is used when spell count is high to maximize density
- Spell names render at 7-8pt for maximum space utilization
- Non-caster characters show "No Spellcasting" or the page is omitted per export options
- All spell data is correctly sourced from the character's known/prepared spells

## Dependencies

- Story 39.1 (PDF generation architecture)
- SRD spell data from Phase 1
- Character spell tracking from Phase 2 (creation) and Phase 4 (session play)

## Notes

- Warlock multiclassing requires special handling: Pact Magic slots are separate from regular spell slots
- The spell page is the most data-dense and may require html2canvas fallback if manual positioning proves too tedious
- Some characters (e.g., high-level Wizard) may have 50+ spells — two-column layout is essential
- Ritual-only spells could be marked with an (R) indicator for convenience
