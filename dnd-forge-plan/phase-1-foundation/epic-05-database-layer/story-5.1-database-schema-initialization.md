# Story 5.1 — Database Schema & Initialization

> **Epic 5: Database Layer (IndexedDB via Dexie.js)** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need the IndexedDB database schema created and auto-upgrading.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Dexie.js**: A wrapper around IndexedDB that provides a simpler API, TypeScript support, schema versioning with migration, and reactive query hooks. The database is created in the browser and persists across sessions
- **Database tables**:
  - `characters` — stores full Character objects. Primary key: `id` (UUID). Indexes on `name` (for search), `campaignId` (for campaign filtering), `isArchived` (for filtering active vs archived), `updatedAt` (for sorting by recency)
  - `campaigns` — stores Campaign objects. Primary key: `id` (UUID). Indexes on `name` (for search), `joinCode` (for lookup)
  - `preferences` — stores UserPreferences. Primary key: `id` (single-row table with fixed ID like "user-preferences")
- **Schema versioning**: Dexie supports schema version migrations. Version 1 defines the initial schema. Future versions can add indexes, tables, or transform data. Each version upgrade runs a migration function
- **Singleton pattern**: The database instance should be created once and exported as a singleton for use throughout the app. This prevents multiple database connections
- **TypeScript integration**: Dexie supports generic typing of tables, so `db.characters` returns `Table<Character, string>` enabling type-safe queries

## Tasks
- [ ] **T5.1.1** — Create `utils/database.ts` defining the Dexie database class with tables: `characters`, `campaigns`, `preferences`
- [ ] **T5.1.2** — Define indexes: characters indexed on `id`, `name`, `campaignId`, `isArchived`, `updatedAt`; campaigns on `id`, `name`, `joinCode`; preferences on `id`
- [ ] **T5.1.3** — Implement database version migration strategy (version 1 initial schema)
- [ ] **T5.1.4** — Create singleton database instance export
- [ ] **T5.1.5** — Write integration test: database initializes, table count is correct, indexes exist

## Acceptance Criteria
- The Dexie database class defines all 3 tables (characters, campaigns, preferences)
- All specified indexes are defined and functional
- The database initializes without errors on first load
- The database migrates correctly when the schema version changes
- The singleton export provides the same instance throughout the application
- Integration tests verify table existence and index functionality
- TypeScript generics provide type-safe table operations

## Dependencies
- **Depends on:** Story 1.3 (Dexie.js installed), Story 2.8 (Character type), Story 2.9 (Campaign type), Story 2.10 (UserPreferences type)
- **Blocks:** Story 5.2 (Character CRUD), Story 5.3 (Campaign CRUD), Story 5.4 (Auto-save & Preferences)

## Notes
- Dexie's schema definition uses a string syntax for indexes: `'++id, name, campaignId, isArchived, updatedAt'`. The `++` prefix denotes auto-increment (not needed here since we use UUIDs), and `&` prefix denotes unique indexes
- IndexedDB has a limit on the number of indexes per table (varies by browser, typically ~64). Our index count is well within this limit
- The version 1 migration is just the schema definition. Actual data migration functions become necessary starting from version 2+ when the schema evolves
- Consider adding a `deleteDatabase()` utility function for development/testing that drops and recreates the database
- The `preferences` table is essentially a key-value store with a single row. Dexie handles this fine but it's a slightly unusual pattern
- Integration tests for IndexedDB require either a real browser environment or a mock like `fake-indexeddb` in the Vitest jsdom environment
