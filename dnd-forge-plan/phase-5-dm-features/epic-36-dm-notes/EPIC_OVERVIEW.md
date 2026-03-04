# Epic 36: DM Notes System

> **Phase 5: DM Features** | Weeks 9-10

## Goal

A comprehensive note-taking system for the DM — per-character private notes (hidden from player view), campaign-level session logs with a timeline, NPC tracking, and loot/reward management.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 36.1 | DM Notes Per Character | 5 | Markdown-lite editor, auto-save, DM-only visibility, quick-note tags, all-notes view |
| 36.2 | Session Log / Campaign Timeline | 8 | Chronological timeline, structured fields, search/filter, encounter linking |
| 36.3 | NPC Tracker | 7 | NPC entries with roles/status, search/filter, cross-reference with sessions |
| 36.4 | Loot & Reward Tracker | 7 | Loot ledger, SRD item search, assign to characters, currency tracking |

## Key Data Models

```typescript
interface SessionNote {
  id: string;
  sessionNumber: number;
  date: Date;
  title: string;
  summary: string;
  npcsEncountered: string[];
  locationsVisited: string[];
  lootAwarded: LootEntry[];
  xpAwarded?: number;
  milestoneLevel?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface NPCEntry {
  name: string;
  description: string;
  location: string;
  role: string[];  // Ally, Enemy, Neutral, Patron, Merchant, Quest Giver
  relationship: string;
  status: 'Alive' | 'Dead' | 'Unknown' | 'Captured';
  sessionFirstAppeared?: string;
}

interface LootEntry {
  name: string;
  type: 'Gold/Currency' | 'Magic Item' | 'Mundane Item' | 'Quest Reward' | 'Other';
  value?: number;
  quantity: number;
  assignedTo?: string;
  sessionId?: string;
  notes: string;
}
```

## Dependencies

- **Epic 33 Story 33.1** — Campaign data model (SessionNote, NPCEntry, LootEntry types)
- **Epic 34 Story 34.1** — Campaign dashboard (Notes tab host)
- **Epic 34 Story 34.2** — Party stats grid (DM notes panel accessible from expanded rows)
- **Epic 35 Story 35.6** — End encounter links to session log
- **Phase 1:** SRD magic item data (for loot tracker search)

## New Components

- `components/dm/DMNotesPanel.tsx`
- `components/dm/SessionLog.tsx`
- `components/dm/NPCTracker.tsx`
- `components/dm/LootTracker.tsx`
