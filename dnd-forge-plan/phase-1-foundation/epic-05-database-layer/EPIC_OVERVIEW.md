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

## Dependencies
- **Depends on:** Epic 2 (Type System) — stores Character, Campaign, and Preferences types; Epic 4 (Calculation Engine) — calculation results stored on Character
- **Blocks:** Epic 6 (State Management Stores) — stores bridge to the database layer
