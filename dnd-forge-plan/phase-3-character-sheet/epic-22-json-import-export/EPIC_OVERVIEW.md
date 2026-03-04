# Epic 22: JSON Import / Export

> **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Goal
Allow players to export their characters as portable JSON files and import characters from JSON, enabling sharing, backup, and migration between devices or users.

## Stories

| Story | Title | Description |
|-------|-------|-------------|
| 22.1 | JSON Export | Export a character as a JSON file for backup, sharing, or transfer |
| 22.2 | JSON Import | Import a character from a JSON file with robust validation |
| 22.3 | Share via URL (Lightweight) | Quick sharing via compressed base64-encoded URL hash |

## Key Components
- `utils/characterExport.ts` — export serialization
- `utils/characterImport.ts` — import parsing and validation
- `components/gallery/ImportDialog.tsx` — import modal with drag-and-drop
- `pages/SharedCharacterView.tsx` — read-only shared view route

## Dependencies
- Phase 1: Character type system, IndexedDB database layer
- Phase 2: Character data in IndexedDB
- Epic 21: Gallery toolbar (import/export triggers)

## Notes
- Export wraps character in metadata: formatVersion, appVersion, exportedAt timestamp
- Import runs a 5-stage validation pipeline: syntax, schema, type, reference, business rules
- Batch export/import supported for multiple characters
- Session state (current HP, used spell slots, etc.) optionally excluded from export
- Share via URL uses pako (gzip) compression for base64-encoded character data
- URL share has 8,000 character size guard with fallback to JSON export
- Version migration framework in place for future schema changes
