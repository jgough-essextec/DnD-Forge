# Story 36.1 — DM Notes Per Character

> **Epic 36: DM Notes System** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to write private notes about each character that are visible only from the DM campaign view, not on the player's character sheet.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story implements DM-only notes per character. The `dmNotes` field already exists on the Character type from prior phases. This story creates the UI for editing and viewing those notes, with strict visibility rules.

**Visibility rules:**
- DM notes are visible ONLY in the campaign dashboard context (when viewing a character from the campaign dashboard)
- When viewing the character sheet from the gallery (player context), `dmNotes` are NOT rendered
- The `dmNotes` field is excluded from JSON exports unless explicitly toggled

**Notes editor features:**
- Markdown-lite textarea (bold, italic, headers, bullet lists) with real-time preview
- Auto-save on 500ms debounce
- Quick-note tags: predefined tags the DM can click to add structured notes — "Secret", "Plot Hook", "Relationship", "Motivation", "Weakness". Tags appear as colored badges above the freeform notes

**"All DM Notes" view:** A single page showing all per-character DM notes across the campaign, organized by character name. Useful for pre-session review.

The notes panel is accessible from the character's expanded row in the Party Stats Grid (Story 34.2) as a slide-out panel or inline section.

## Tasks

- [ ] **T36.1.1** — The `dmNotes` field already exists on the Character type. Create `components/dm/DMNotesPanel.tsx` — a slide-out panel or inline section accessible from the character's expanded row in the party stats grid
- [ ] **T36.1.2** — Notes editor: markdown-lite textarea (bold, italic, headers, bullet lists) with real-time preview. Auto-save on 500ms debounce
- [ ] **T36.1.3** — Notes are visible ONLY in the campaign dashboard context. When viewing the character sheet from the gallery (non-DM context), `dmNotes` are not rendered. The field is excluded from JSON exports unless explicitly toggled
- [ ] **T36.1.4** — Quick-note tags: predefined tags the DM can click to add structured notes: "Secret", "Plot Hook", "Relationship", "Motivation", "Weakness". Tags appear as colored badges above the freeform notes
- [ ] **T36.1.5** — "All DM Notes" view: a single page showing all per-character DM notes across the campaign, organized by character name. Useful for pre-session review

## Acceptance Criteria

- DM notes panel is accessible from the party stats grid (expanded row or slide-out)
- Markdown-lite editor supports bold, italic, headers, and bullet lists with real-time preview
- Auto-save persists notes on 500ms debounce
- DM notes are NOT visible when viewing a character from the gallery (player context)
- DM notes are excluded from JSON exports unless explicitly toggled
- Quick-note tags (Secret, Plot Hook, Relationship, Motivation, Weakness) can be added as colored badges
- "All DM Notes" view shows all per-character notes organized by character name
- Notes save to the character's `dmNotes` field in IndexedDB

## Dependencies

- Epic 34 Story 34.2 — Party stats grid (expanded rows provide access to DM notes panel)
- Epic 33 Story 33.1 — Campaign data model, character resolution
- Epic 38 Story 38.2 — DM vs player context (controls note visibility)
- Phase 1-3 — Character type with `dmNotes` field

## Notes

- DM notes are one of the most personal and valuable pieces of DM data. They often contain plot spoilers, character secrets, and planned story beats. Keeping them strictly DM-only is critical.
- The "All DM Notes" aggregate view is essential for session prep — the DM reviews all character notes before each session to refresh their memory on ongoing plot threads.
- Quick-note tags add structured metadata without forcing the DM into a rigid note-taking format. They're additive (tag + freeform), not restrictive.
- Consider color-coding tags: "Secret" in red, "Plot Hook" in purple, "Relationship" in blue, "Motivation" in green, "Weakness" in orange.
