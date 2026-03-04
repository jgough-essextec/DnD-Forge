# Story 36.3 — NPC Tracker

> **Epic 36: DM Notes System** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to track NPCs my party has encountered — their names, descriptions, relationships, and locations — so I can maintain consistency across sessions.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates the NPC tracker — a searchable, filterable list of NPCs the party has encountered, accessible from the "Notes" tab on the campaign dashboard.

**NPCEntry data model:**
```typescript
interface NPCEntry {
  name: string;                   // Required
  description: string;            // Appearance, personality, voice notes
  location: string;               // Where the party met them or where they reside
  role: string[];                 // Multi-select: Ally, Enemy, Neutral, Patron, Merchant, Quest Giver
  relationship: string;           // Freeform text about relationship to party
  status: 'Alive' | 'Dead' | 'Unknown' | 'Captured';
  sessionFirstAppeared?: string;  // Link to session note
}
```

**NPC role tags (6 types):** Ally, Enemy, Neutral, Patron, Merchant, Quest Giver

**NPC statuses (4 types):** Alive, Dead, Unknown, Captured

**NPC entry features:**
- Minimal required info is just a name — the DM can flesh out details later
- Card layout with name, role badges, status badge, and description preview
- Search by name, filter by role, status, or location
- Detail view: click to expand full NPC card with all fields editable, auto-save on changes

**Cross-referencing:** NPCs tagged in session notes link to their NPC tracker entry and vice versa. Clicking an NPC name in a session note opens their tracker entry. Quick-add from session log: when typing NPC names in session notes, autocomplete from existing NPCs or offer to create a new entry.

NPC entries are stored on the Campaign object (as part of campaign data in IndexedDB). They are a narrative tracking tool, not a combat tool — NPCs entering combat are added to the encounter tracker with quick stats (Story 35.1).

## Tasks

- [ ] **T36.3.1** — Create `components/dm/NPCTracker.tsx` — accessible from the "Notes" tab on the campaign dashboard. Shows a searchable, filterable list of NPCs
- [ ] **T36.3.2** — NPC entry fields: Name (required), Description (appearance, personality, voice notes), Location (where the party met them or where they reside), Role (Ally, Enemy, Neutral, Patron, Merchant, Quest Giver — multi-select), Relationship to party (freeform text), Status (Alive, Dead, Unknown, Captured), Session first appeared (link to session note)
- [ ] **T36.3.3** — "Add NPC" button: opens a compact form. Minimal required info is just a name — the DM can flesh out details later
- [ ] **T36.3.4** — NPC list: card layout with name, role badges, status badge, and description preview. Search by name. Filter by role, status, location
- [ ] **T36.3.5** — NPC detail view: click to expand the full NPC card with all fields editable. Auto-save on changes
- [ ] **T36.3.6** — Cross-reference: NPCs tagged in session notes link to their NPC tracker entry and vice versa. Clicking an NPC name in a session note opens their tracker entry
- [ ] **T36.3.7** — Quick-add from session log: when typing NPC names in session notes, autocomplete from existing NPCs or offer to create a new entry

## Acceptance Criteria

- NPC tracker is accessible from the "Notes" tab on the campaign dashboard
- NPCs display as cards with name, role badges, status badge, and description preview
- "Add NPC" requires only a name (all other fields optional)
- NPC detail view shows all fields editable with auto-save
- Search by name filters the NPC list in real time
- Filter by role, status, and location narrows the list
- Cross-referencing links NPC names in session notes to their tracker entries
- Quick-add from session log allows creating NPCs inline when typing in notes
- NPC entries persist to the campaign data in IndexedDB
- All 6 role types and 4 status types are available

## Dependencies

- Epic 34 Story 34.1 — Campaign dashboard ("Notes" tab host)
- Epic 33 Story 33.1 — Campaign data model (NPCEntry type)
- Epic 36 Story 36.2 — Session log (cross-referencing, autocomplete)

## Notes

- The NPC tracker is a narrative tool — it tracks story characters, not combat stats. When an NPC enters combat, the DM creates a combatant entry in the encounter tracker.
- Linking NPC tracker entries to combat stat blocks is a Phase 6 enhancement.
- The minimal required fields (just a name) are important for DM workflow. DMs often improvise NPCs on the fly and need to quickly record "Bartender at the Rusty Nail" and fill in details later.
- Consider color-coding status badges: Alive (green), Dead (red), Unknown (grey), Captured (amber).
- Consider color-coding role badges: Ally (blue), Enemy (red), Neutral (grey), Patron (gold), Merchant (green), Quest Giver (purple).
