# Story 36.4 — Loot & Reward Tracker

> **Epic 36: DM Notes System** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to track loot I've given to the party — magic items, gold, quest rewards — and optionally assign items to specific characters.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates the loot and reward tracker — a running ledger of all treasure and rewards given during the campaign, accessible from the "Notes" tab on the campaign dashboard.

**LootEntry data model:**
```typescript
interface LootEntry {
  name: string;                   // Required, item name
  type: 'Gold/Currency' | 'Magic Item' | 'Mundane Item' | 'Quest Reward' | 'Other';
  value?: number;                 // In GP equivalent, optional
  quantity: number;               // Default 1
  assignedTo?: string;            // Character ID, or "Party Loot" for unassigned
  sessionId?: string;             // Link to session note
  notes: string;                  // Freeform
}
```

**Loot tracker features:**
- Running ledger sortable by item name, type, value, assigned character, session number
- Total value summary: "Total party loot value: ~2,450 GP"
- "Add Loot" with SRD magic item search for auto-filling known items, custom items for homebrew
- "Assign to Character" optionally adds item to character's equipment list in IndexedDB
- Filtering by type, assigned character, session, and "Unassigned" (party loot not yet claimed)
- Separate "Party Gold" tracker showing total currency across all characters

**Character inventory integration:** When loot is assigned to a character, the DM can optionally add it to that character's equipment list. This updates the character's inventory in IndexedDB with a confirmation dialog.

Loot entries are stored as part of the campaign data in IndexedDB.

## Tasks

- [ ] **T36.4.1** — Create `components/dm/LootTracker.tsx` — accessible from the "Notes" tab. A running ledger of all treasure and rewards given during the campaign
- [ ] **T36.4.2** — Loot entry fields: Item name (required), Type (Gold/Currency, Magic Item, Mundane Item, Quest Reward, Other), Value (in GP equivalent, optional), Quantity (default 1), Assigned to (dropdown of party characters, or "Party Loot" for unassigned), Session awarded (link to session note), Notes (freeform)
- [ ] **T36.4.3** — Loot list: sortable table with columns for item name, type icon, value, assigned character, session number. Total value summary at the bottom: "Total party loot value: ~2,450 GP"
- [ ] **T36.4.4** — "Add Loot" button: quick-add form. SRD magic item search for auto-filling name and description of known items. Custom items for homebrew
- [ ] **T36.4.5** — "Assign to Character" action: when loot is assigned, optionally add it to that character's equipment list (updates the character's inventory in IndexedDB). Confirmation: "Add [item] to [character]'s inventory?"
- [ ] **T36.4.6** — Filtering: by type, by assigned character, by session. "Unassigned" filter shows party loot not yet claimed
- [ ] **T36.4.7** — Currency tracking: separate from item loot, a "Party Gold" tracker showing total currency across all characters (aggregated from each character's currency data)

## Acceptance Criteria

- Loot tracker is accessible from the "Notes" tab on the campaign dashboard
- Loot entries include name, type, value, quantity, assigned character, session link, and notes
- Loot list is a sortable table with type icons and value summary
- Total party loot value displays at the bottom
- "Add Loot" form includes SRD magic item search and custom item entry
- Assigning loot to a character optionally updates their equipment list in IndexedDB
- Assignment confirmation dialog prevents accidental inventory changes
- Filtering by type, character, session, and "Unassigned" works
- "Party Gold" tracker aggregates currency across all characters
- Loot entries persist to campaign data in IndexedDB

## Dependencies

- Epic 34 Story 34.1 — Campaign dashboard ("Notes" tab host)
- Epic 33 Story 33.1 — Campaign data model (LootEntry type)
- Epic 36 Story 36.2 — Session log (session linking)
- Phase 1 — SRD magic item data (for item search)
- Phase 1-3 — Character equipment/inventory data model

## Notes

- The loot tracker serves dual purposes: it helps the DM track what they've given the party (campaign-level view) and optionally syncs to character inventories (character-level view).
- The "Party Gold" aggregation is a frequently requested DM feature — knowing the party's total wealth helps with encounter balance and treasure planning.
- SRD magic item search provides auto-fill for official items. For homebrew items, the DM enters everything manually.
- Consider showing a warning if the total party loot value seems unusually high for the party's level (using the DMG wealth-by-level guidelines as a reference).
