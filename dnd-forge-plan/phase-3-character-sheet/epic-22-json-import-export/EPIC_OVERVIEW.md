# Epic 22: JSON Import / Export

> **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Goal
Allow players to export their characters as portable JSON files via the API, import characters from JSON with server-side validation, and share characters via API-generated share tokens for read-only access.

## Stories

| Story | Title | Description |
|-------|-------|-------------|
| 22.1 | JSON Export | Export a character as a JSON file via API endpoint for backup, sharing, or transfer |
| 22.2 | JSON Import | Import a character from a JSON file with server-side validation via API |
| 22.3 | Share via API Token | Share characters via API-generated share tokens with read-only shared views |

## Key Components
- `api/characterExport.ts` — API client for export endpoints (`GET /api/characters/:id/export/`)
- `api/characterImport.ts` — API client for import endpoints (`POST /api/characters/import/`)
- `api/characterShare.ts` — API client for share token endpoints (`POST /api/characters/:id/share/`, `GET /api/shared/:token/`)
- `components/gallery/ImportDialog.tsx` — import modal with drag-and-drop and file upload
- `components/gallery/ShareDialog.tsx` — share dialog with token generation and copy-link
- `pages/SharedCharacterView.tsx` — read-only shared view route (`/share/:token`)

## Dependencies
- Phase 1: Character type system, Django REST API layer
- Phase 2: Character data persisted via Django REST API
- Epic 21: Gallery toolbar (import/export triggers)

## Notes
- Export via API endpoint returns character JSON wrapped in metadata: formatVersion, appVersion, exportedAt timestamp
- Import via API endpoint runs server-side validation pipeline: syntax, schema, type, reference, business rules
- Batch export/import supported for multiple characters via API
- Session state (current HP, used spell slots, etc.) optionally excluded from export
- Share via API: `POST /api/characters/:id/share/` generates a unique share token; `GET /api/shared/:token/` returns read-only character data
- Share tokens can be revoked by the owner; optional expiration time
- Share URL format: `/share/:token` -- no client-side compression needed, data served from API
- Version migration framework in place for future schema changes

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 22.1 — JSON Export | 8 | 5 | 0 | 13 |
| 22.2 — JSON Import | 10 | 9 | 2 | 21 |
| 22.3 — Share via API Token | 5 | 9 | 1 | 15 |
| **Totals** | **23** | **23** | **3** | **49** |

### Key Gaps Found
- **Error Handling**: Missing specification for file size limits on import, API error handling (network failures, server validation errors, auth errors), and invalid share token handling
- **Loading/Empty States**: No loading indicator specified during server-side validation pipeline or share token generation
- **Accessibility**: Missing keyboard alternatives for drag-and-drop import, no ARIA labels for validation result sections and share dialog
- **Edge Cases**: Large avatar data inflating JSON export size, duplicate name handling on import, share token expiration/revocation UX, and very old format version migration not fully specified
