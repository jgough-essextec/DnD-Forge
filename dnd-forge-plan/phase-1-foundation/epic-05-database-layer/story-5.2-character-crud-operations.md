# Story 5.2 — Character CRUD Operations

> **Epic 5: Database Layer (IndexedDB via Dexie.js)** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need repository functions for all character data operations.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Character storage**: The full `Character` object is stored in IndexedDB via Dexie.js. Each character has a UUID as its primary key, timestamps for creation and last update, and a version number for optimistic concurrency control
- **CRUD operations**: Create, Read (single + list), Update, Archive (soft delete), Delete (hard delete), Duplicate (deep clone), Export (to JSON), Import (from JSON)
- **CharacterSummary**: For the gallery page, a lightweight projection is needed containing only: id, name, race, class, level, HP, AC, and optional avatar URL. This avoids loading full character data for the list view
- **Optimistic concurrency**: When two browser tabs edit the same character, the second save should detect the version mismatch. The `updateCharacter` function should check that the version in the database matches the version in the update — if not, reject the update with a concurrency error
- **UUID generation**: Use the `uuid` library (installed in Story 1.3) for generating unique IDs
- **Character defaults**: When creating a new character with partial data, sensible defaults should be applied (empty arrays for equipment, zero currency, default alignment, etc.)
- **Export format**: `CharacterExport` type includes the character data plus a `formatVersion` string for forward compatibility. When importing, validate the format version and data integrity
- **Timestamps**: `createdAt` set on creation, `updatedAt` set on every update. Both are ISO 8601 date strings or Date objects

## Tasks
- [ ] **T5.2.1** — Implement `createCharacter(char: Partial<Character>): Promise<Character>` — generates UUID, sets timestamps, version=1, defaults
- [ ] **T5.2.2** — Implement `getCharacter(id: string): Promise<Character | undefined>`
- [ ] **T5.2.3** — Implement `getAllCharacters(includeArchived?: boolean): Promise<CharacterSummary[]>` — returns summary projections for gallery
- [ ] **T5.2.4** — Implement `updateCharacter(id: string, updates: Partial<Character>): Promise<Character>` — updates timestamp and version, optimistic concurrency check
- [ ] **T5.2.5** — Implement `archiveCharacter(id: string): Promise<void>` — soft delete (sets isArchived=true)
- [ ] **T5.2.6** — Implement `deleteCharacter(id: string): Promise<void>` — hard delete
- [ ] **T5.2.7** — Implement `duplicateCharacter(id: string, newName?: string): Promise<Character>` — deep clone with new ID
- [ ] **T5.2.8** — Implement `exportCharacter(id: string): Promise<CharacterExport>` — returns character with format version
- [ ] **T5.2.9** — Implement `importCharacter(data: CharacterExport): Promise<Character>` — validates format, generates new ID, saves
- [ ] **T5.2.10** — Write integration tests: full CRUD lifecycle, duplicate preserves data, export/import roundtrip, concurrent update detection

## Acceptance Criteria
- `createCharacter()` generates a UUID, sets timestamps, sets version to 1, applies defaults for missing fields, and persists to IndexedDB
- `getCharacter()` retrieves a character by ID or returns undefined if not found
- `getAllCharacters()` returns CharacterSummary projections (not full objects), filtered by archive status
- `updateCharacter()` increments the version, updates the timestamp, and rejects if version mismatch (concurrency conflict)
- `archiveCharacter()` sets `isArchived=true` without deleting data
- `deleteCharacter()` permanently removes the character from the database
- `duplicateCharacter()` creates a deep clone with a new UUID, new timestamps, and optionally a new name (default: "Copy of [name]")
- `exportCharacter()` returns the character data with a format version string
- `importCharacter()` validates the format, generates a new ID, and saves to the database
- Integration tests verify the complete CRUD lifecycle, duplicate data integrity, export/import roundtrip, and concurrent update rejection

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should generate UUID and set timestamps when creating a character via createCharacter`
- `should set version to 1 for newly created character via createCharacter`
- `should apply default values for missing fields in createCharacter`
- `should retrieve a character by ID via getCharacter`
- `should return undefined for non-existent character ID via getCharacter`
- `should return CharacterSummary projections (not full objects) via getAllCharacters`
- `should filter archived characters by default in getAllCharacters`
- `should include archived characters when includeArchived is true via getAllCharacters`
- `should increment version and update timestamp via updateCharacter`
- `should reject update with version mismatch (optimistic concurrency) via updateCharacter`
- `should set isArchived=true without deleting data via archiveCharacter`
- `should permanently remove character from database via deleteCharacter`
- `should deep clone with new UUID and timestamps via duplicateCharacter`
- `should name duplicate "Copy of [name]" by default via duplicateCharacter`
- `should export character with formatVersion string via exportCharacter`
- `should import character with new ID and save to database via importCharacter`
- `should roundtrip export then import preserving all data via exportCharacter/importCharacter`

### Test Dependencies
- `fake-indexeddb` for IndexedDB mocking
- Database singleton from Story 5.1
- Character type fixtures with various field configurations
- uuid library from Story 1.3

## Identified Gaps

- **Error Handling**: No specification for handling database write failures (quota exceeded, transaction aborted)
- **Error Handling**: Import validation does not specify behavior for unrecognized formatVersion
- **Edge Cases**: Concurrent update detection error message format not specified
- **Edge Cases**: No specification for getAllCharacters sort order (by updatedAt? by name?)

## Dependencies
- **Depends on:** Story 5.1 (database schema and singleton), Story 2.8 (Character, CharacterSummary, CharacterExport types), Story 1.3 (uuid library)
- **Blocks:** Story 5.4 (auto-save depends on updateCharacter), Epic 6 Story 6.1 (Character store bridges to these functions)

## Notes
- `getAllCharacters` should use Dexie's `.toArray()` with a filter for `isArchived` and then map to `CharacterSummary` format. Consider adding a compound index on `[isArchived+updatedAt]` for efficient sorted filtering
- Optimistic concurrency: the `updateCharacter` function should compare the incoming `version` against the stored `version`. If they differ, throw a specific error that the store layer can catch and present to the user (e.g., "This character was modified in another tab")
- Deep cloning for duplicate should handle nested objects correctly. Use `structuredClone()` (built-in) or JSON parse/stringify for a deep clone
- Import validation should check: (1) `formatVersion` is recognized, (2) required fields exist, (3) data types are correct for critical fields. It should NOT validate game rules (that's the calculation engine's job)
- Consider wrapping CRUD operations in Dexie transactions for atomicity, especially for operations that read-then-write (like duplicate and update)
