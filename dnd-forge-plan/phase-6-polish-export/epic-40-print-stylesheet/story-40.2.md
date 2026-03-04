# Story 40.2 — Print-Specific Layouts

> **Epic 40: Print Stylesheet Optimization** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a developer, I need print layouts that differ from screen layouts to maximize paper real estate. This story defines print-specific column layouts for all three character sheet pages, a compact gallery roster print layout, and a campaign dashboard print layout for DM reference sheets.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Print Layout Strategy**: Force desktop-style column layouts in print regardless of screen size
- **Page 1 Print**: Three-column layout (ability scores/saves/skills | combat/HP/attacks | personality/features)
- **Page 2 Print**: Two-column layout (appearance/backstory | allies/equipment/treasure) with portrait top-right
- **Page 3 Print**: Multi-column spell list (2-3 columns) with slot circles as printable outlines
- **Gallery Print**: Compact roster — 3 characters per printed page (one summary per third-page)
- **Campaign Print**: Clean data table of party stats for DM quick reference

## Tasks

- [ ] **T40.2.1** — **Page 1 print layout:** force the three-column desktop layout regardless of the user's screen size. Left column: ability scores, saves, skills. Center: combat stats, HP, attacks. Right: personality, features
- [ ] **T40.2.2** — **Page 2 print layout:** two-column layout. Left: appearance fields + backstory. Right: allies/orgs + equipment + treasure. Portrait in top-right corner
- [ ] **T40.2.3** — **Page 3 print layout:** multi-column spell list layout. Two or three columns of spell names to maximize density. Spell slot circles rendered as printable outlines
- [ ] **T40.2.4** — **Gallery print:** printing from the gallery page produces a compact roster — one character summary per third-page (3 characters per printed page). Shows name, race, class, level, AC, HP, key stats
- [ ] **T40.2.5** — **Campaign dashboard print:** printing the party stats grid produces a clean data table with all player stats. Useful as a DM reference sheet

## Acceptance Criteria

- Page 1 prints in a three-column layout regardless of the user's screen size
- Page 2 prints in a two-column layout with portrait in the top-right corner
- Page 3 prints spell lists in 2-3 columns to maximize density with slot circles as printable outlines
- Gallery print produces a compact roster with 3 character summaries per printed page
- Each gallery character summary shows name, race, class, level, AC, HP, and key stats
- Campaign dashboard print produces a clean data table with all party stats
- All print layouts are optimized for paper real estate (no wasted space)

## Dependencies

- Story 40.1 (print layout refinement — base print styles must be in place)
- Phase 3 character sheet layouts (three-page structure)
- Phase 3 gallery component
- Phase 5 campaign dashboard and party stats grid

## Notes

- Print layouts should force column layouts using CSS Grid or Flexbox in the @media print stylesheet
- The gallery compact roster is useful for DMs who want a quick reference of all characters at the table
- Spell slot circles should render as simple circles with outlines (not filled) so players can mark them with a pencil
