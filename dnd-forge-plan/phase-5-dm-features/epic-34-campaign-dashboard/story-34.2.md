# Story 34.2 — Party Stats Grid

> **Epic 34: Campaign Dashboard & Party Overview** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to see every character's key combat stats in a sortable table so I can reference them during play.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates the Party Stats Grid — a sortable data table showing all party characters with their key combat stats. It is the primary component of the "Party" tab on the campaign dashboard.

**Table columns** (10+):
- Avatar (small, 32px)
- Name
- Race
- Class/Level
- AC (Armor Class)
- HP (current/max with color bar)
- Speed
- Passive Perception
- Spell Save DC (or "---" for non-casters)
- Initiative Modifier
- Conditions (active condition badges)

**HP column** features:
- Mini progress bar with green/yellow/red gradient
- Skull icon at 0 HP
- Blue badge for temp HP
- Quick HP +/- buttons for fast damage/healing without navigating to character sheet
- Uses the same damage logic from Phase 4 (temp HP first, overflow to 0, massive damage check)

**Row interaction:**
- Click: navigates to character sheet in side panel (desktop) or full page (mobile). Side panel shows read-only compact view with "Open Full Sheet" link.
- Expand chevron: reveals detail panel with proficient skills (highlighted), languages, key class features, and DM notes preview.

**Sorting:** Clicking a column header sorts the table. Default: alphabetical by name. Clicking again reverses. Sort indicator arrow on active column.

## Tasks

- [ ] **T34.2.1** — Create `components/dm/PartyStatsGrid.tsx` — a data table showing all party characters with columns: Avatar (small, 32px), Name, Race, Class/Level, AC, HP (current/max with color bar), Speed, Passive Perception, Spell Save DC (or "---" for non-casters), Initiative Modifier
- [ ] **T34.2.2** — Sortable columns: clicking a column header sorts the table. Default sort: alphabetical by name. Clicking again reverses sort order. Sort indicator arrow on active column
- [ ] **T34.2.3** — HP column: show a mini progress bar (green/yellow/red gradient) alongside the numbers. If a character is at 0 HP, show a skull icon. If temp HP exists, show a blue badge
- [ ] **T34.2.4** — Active conditions: show condition badges inline in a "Conditions" column (or as colored dots under the character name). Hovering shows condition names
- [ ] **T34.2.5** — Row click: navigates to the character sheet in a side panel (desktop) or full page (mobile). Side panel shows a read-only compact view of the character sheet with "Open Full Sheet" link
- [ ] **T34.2.6** — Expandable rows: clicking an expand chevron reveals a detail panel showing: all proficient skills (highlighted), languages, key class features, and DM notes preview
- [ ] **T34.2.7** — "Quick HP" column actions: +/- buttons on each character's HP cell for fast combat damage/healing without navigating to their sheet. Uses the same damage logic from Phase 4 (temp HP first, overflow to 0, massive damage check)

## Acceptance Criteria

- Party Stats Grid displays all campaign characters in a sortable data table
- All 10+ columns are present: avatar, name, race, class/level, AC, HP, speed, passive perception, spell save DC, initiative modifier
- Columns are sortable with visual sort indicator
- HP column shows a color-coded progress bar, skull icon at 0 HP, and blue temp HP badge
- Active conditions display as colored badges with hover tooltips
- Row click opens character sheet in side panel (desktop) or full page (mobile)
- Expandable rows show proficient skills, languages, class features, and DM notes preview
- Quick HP buttons allow fast damage/healing using Phase 4 HP logic
- Table remains usable with 8+ characters (soft cap from Story 33.5)

## Dependencies

- Story 34.1 — Campaign dashboard layout (Party tab host)
- Epic 33 Story 33.1 — Campaign data model with character resolution
- Phase 4 — HP tracker logic (for quick HP buttons), conditions system
- Phase 1-3 — Character data (ability scores, skills, class features, languages)

## Notes

- The Party Stats Grid is the most frequently referenced component during gameplay. Performance and readability are critical.
- The quick HP buttons are a major DM quality-of-life feature — they save navigating to individual character sheets during combat.
- Consider virtual scrolling if party size exceeds 8 characters, though this is unlikely in practice.
- The DM notes preview in expandable rows connects to Epic 36 Story 36.1 (DM Notes Per Character).
