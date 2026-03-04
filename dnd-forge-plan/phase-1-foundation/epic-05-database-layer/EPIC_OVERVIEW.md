# Epic 5: Database Layer (IndexedDB via Dexie.js)
> **Phase 1: Foundation** (Weeks 1-2)

## Summary
A fully functional offline-first persistence layer for characters, campaigns, and preferences with CRUD operations, auto-save, and import/export.

## Stories
| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 5.1 | Database Schema & Initialization | 5 | IndexedDB database schema with Dexie, tables for characters/campaigns/preferences, indexes, migrations, singleton instance |
| 5.2 | Character CRUD Operations | 10 | Repository functions for all character data operations: create, read, update, archive, delete, duplicate, export, import |
| 5.3 | Campaign CRUD Operations | 8 | Repository functions for campaign management: create, read, update, add/remove characters, query by campaign |
| 5.4 | Auto-Save & Preferences | 5 | Debounced auto-save hook for character edits, user preference persistence with defaults |

## Technical Scope
- **Database:** Dexie.js wrapping IndexedDB for offline-first persistence
- **Tables:** characters, campaigns, preferences
- **Indexes:** characters on id/name/campaignId/isArchived/updatedAt; campaigns on id/name/joinCode; preferences on id
- **Features:** CRUD operations, soft delete (archive), deep clone (duplicate), JSON export/import, debounced auto-save, optimistic concurrency
- **Testing:** Integration tests covering full CRUD lifecycle, concurrent updates, export/import roundtrip

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 5.1 — Database Schema & Initialization | 8 | 0 | 0 | 8 |
| 5.2 — Character CRUD Operations | 17 | 0 | 0 | 17 |
| 5.3 — Campaign CRUD Operations | 11 | 0 | 0 | 11 |
| 5.4 — Auto-Save & Preferences | 8 | 2 | 0 | 10 |
| **Totals** | **44** | **2** | **0** | **46** |

### Key Gaps Found
- Error handling for database failures (quota exceeded, corrupted IndexedDB, transaction aborted) not specified
- Import validation behavior for unrecognized formatVersion not specified
- Concurrent update error message format not specified
- Campaign deletion behavior for associated characters not explicit in acceptance criteria
- Auto-save failure retry mechanism described in notes but not in acceptance criteria
- No "save in progress" indicator specified

## Dependencies
- **Depends on:** Epic 2 (Type System) — stores Character, Campaign, and Preferences types; Epic 4 (Calculation Engine) — calculation results stored on Character
- **Blocks:** Epic 6 (State Management Stores) — stores bridge to the database layer
