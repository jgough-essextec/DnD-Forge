# Story 38.2 — DM vs Player Context

> **Epic 38: Campaign Routing & Navigation** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a user, I need the app to clearly distinguish when I'm viewing a character as a player vs. managing it as a DM in a campaign context.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story establishes the visual and functional distinction between DM context and player context when viewing the same character. The same character data is shared — edits in either context save to the same IndexedDB record. The difference is purely in the UI: which panels are shown and which actions are available.

**DM Context** (character viewed from campaign dashboard):
- "DM View" badge in the header
- DM notes panel visible (slide-out)
- Campaign context badge showing the campaign name
- Quick link back to the campaign dashboard
- Additional actions: "Award XP", "Add to Encounter"
- Full visibility of all character data plus DM-only data

**Player Context** (character viewed from gallery):
- No "DM View" badge
- DM notes are HIDDEN (not rendered)
- No campaign management actions
- Session play tools prominent (dice, HP, spell slots)
- Standard character sheet view from prior phases

**Key principle:** The same character data is shared across contexts. Any edit (HP change, condition, level-up) in one context is immediately reflected in the other. The contexts differ only in what UI is presented.

## Tasks

- [ ] **T38.2.1** — When a character is viewed from the campaign dashboard (DM context), show a subtle "DM View" badge in the header. DM notes are visible. Additional actions like "Award XP" and "Add to Encounter" are available
- [ ] **T38.2.2** — When a character is viewed from the gallery (player context), DM notes are hidden. Session play tools (dice, HP, spell slots) are prominent. No campaign management actions
- [ ] **T38.2.3** — "DM View" on a character sheet includes: DM notes panel (slide-out), campaign context badge showing the campaign name, quick link back to the campaign dashboard
- [ ] **T38.2.4** — The same character data is shared — edits in either context save to the same IndexedDB record. The difference is purely UI/access (which panels are shown)

## Acceptance Criteria

- Characters viewed from campaign dashboard show "DM View" badge
- DM notes are visible only in DM context, hidden in player context
- DM context includes "Award XP" and "Add to Encounter" actions
- Player context shows session play tools prominently without campaign management actions
- Campaign context badge and quick link to dashboard appear in DM view
- Edits in either context save to the same IndexedDB record
- Changes made in DM context are immediately visible in player context and vice versa
- Navigation between contexts is seamless (no data reload required)

## Dependencies

- Epic 33 Story 33.1 — Campaign data model, character-campaign relationship
- Epic 34 Story 34.2 — Party stats grid (row click opens character in DM context)
- Epic 36 Story 36.1 — DM notes per character (visibility toggling)
- Phase 1-3 — Character sheet, gallery views (player context)
- Phase 4 — Session play tools (dice, HP, spell slots)

## Notes

- The DM vs player context distinction is purely a UI concern in Phase 5 (local-only, single device). There is no authentication or access control. The "DM" is whoever opened the campaign dashboard.
- In future phases with multi-device sync, this context distinction becomes more important — player devices would never see DM notes, enforced at the data layer rather than just the UI layer.
- The key technical implementation is passing a context flag (e.g., `isDMView: boolean`) to the character sheet component that controls which panels render. This is simpler than having two separate character sheet components.
- Consider using a React context provider (`DMContextProvider`) that wraps campaign dashboard routes and provides the DM flag to all child components.
