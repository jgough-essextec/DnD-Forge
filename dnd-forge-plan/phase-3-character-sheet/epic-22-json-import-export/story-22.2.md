# Story 22.2 — JSON Import

> **Epic 22: JSON Import / Export** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a user, I want to import a character from a JSON file via API upload so I can restore backups, receive shared characters, or transfer characters from another device. The file is uploaded to a Django endpoint that validates the JSON structure, checks data integrity, and creates a new character owned by the current user.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Import Endpoint**: `POST /api/characters/import/` accepts multipart file upload (`Content-Type: multipart/form-data`) with a JSON file in the `file` field
- **Server-Side Validation**: `CharacterImportSerializer` validates JSON structure, required fields, data types, reference integrity against SRD data, and business rules (ability score ranges, level bounds)
- **Validation Result Levels**: Errors (block import, return 400), Warnings (included in response body, do not block import)
- **ID Generation**: Server always assigns a new UUID and sets `owner` FK to the requesting user (imported IDs are ignored)
- **File Size Limit**: Enforced server-side (e.g., 1MB max) via Django settings or view-level check
- **Version Compatibility**: If `formatVersion` in the uploaded JSON differs from current, apply server-side migration transforms before validation

## Tasks
- [ ] **T22.2.1** — Create `POST /api/characters/import/` endpoint in Django. The view accepts a multipart file upload, reads the JSON file content, passes it through the import serializer for validation, and on success creates a new Character in the database. Return 201 with the created character data on success, or 400 with detailed validation errors on failure. Enforce file size limit (1MB) and reject non-JSON files
- [ ] **T22.2.2** — Create `CharacterImportSerializer` in the characters app. The serializer performs multi-stage validation:
  1. JSON syntax validation: parse the uploaded file content, return clear error if malformed
  2. Schema validation: verify required fields exist (name, race, class, level, abilityScores, etc.)
  3. Type validation: verify field types match expected types (e.g., level is integer, name is string)
  4. Reference validation: check raceId, classId, spell IDs, equipment IDs against SRD data in the database. Unknown references produce warnings (not errors) to allow homebrew content
  5. Business rule validation: ability score ranges (3-30), level (1-20), HP consistency. Mismatches produce warnings
- [ ] **T22.2.3** — On successful validation, create a new Character model instance. Assign a new UUID (ignore any `id` in the imported JSON), set the `owner` foreign key to `request.user`, set `created_at` and `updated_at` to the current timestamp. Save all related data (spells, equipment, features) as nested creates
- [ ] **T22.2.4** — Return a structured response: on success (201), return the created character data plus any warnings. On failure (400), return a list of validation errors with field paths and human-readable messages. Example error: `{"field": "abilityScores.strength", "message": "Value 35 exceeds maximum of 30"}`
- [ ] **T22.2.5** — Frontend: Create an import UI accessible from the gallery toolbar. Provide a file picker button (accept `.json` files only). On file selection, upload via Axios as multipart form data to the import endpoint. Display a loading state during upload/validation. On success, show a success toast and navigate to the imported character. On error, display the validation errors returned by the API
- [ ] **T22.2.6** — Write tests. Backend: pytest tests using DRF `APITestCase` covering import with valid JSON (201 + character created), import with malformed JSON (400 + syntax error), import with missing required fields (400 + schema errors), import with invalid data types (400 + type errors), import with out-of-range values (400 + business rule errors), permission check (401 for unauthenticated), file size limit enforcement, and verification that imported character gets new UUID and correct owner. Frontend: Vitest tests using MSW to mock the import endpoint, test file picker interaction, upload trigger, success/error display

## Acceptance Criteria
- `POST /api/characters/import/` accepts a multipart file upload containing a JSON file
- Server validates JSON syntax, schema (required fields), data types, SRD references, and business rules
- Validation errors return 400 with a structured list of errors including field paths and messages
- SRD reference mismatches and business rule inconsistencies produce warnings (not blocking errors)
- On successful import, a new Character is created with a server-assigned UUID and the requesting user as owner
- `created_at` and `updated_at` are set to the current server time (imported timestamps are ignored)
- Response (201) includes the created character data and any warnings
- File size limit is enforced (1MB max); oversized files return 400 with a clear message
- Non-JSON files are rejected with a 400 response
- Unauthenticated requests return 401
- Frontend file picker allows selecting `.json` files, uploads to the API, and displays success or error results
- Frontend shows loading state during upload and validation

## Testing Requirements

### Backend Tests (pytest + DRF APITestCase)
_For API endpoint behavior, validation, permissions, data creation_

- `should return 201 and create character when importing valid JSON`
- `should assign new UUID to imported character (ignore any id in JSON)`
- `should set owner to the requesting user`
- `should set created_at and updated_at to current server time`
- `should return 400 with syntax error details for malformed JSON`
- `should return 400 with field-level errors for missing required fields (name, race, class, level, abilityScores)`
- `should return 400 with type errors for invalid data types (e.g., level as string)`
- `should return warnings (not errors) for unknown SRD references (raceId, classId, spell IDs)`
- `should return warnings for business rule violations (ability score out of range, HP mismatch)`
- `should return 400 when uploaded file exceeds size limit (1MB)`
- `should return 400 when uploaded file is not valid JSON (e.g., a PNG file)`
- `should return 401 when user is not authenticated`
- `should correctly create nested related objects (spells, equipment, features)`
- `should handle formatVersion migration when version differs from current`

### Frontend Tests (Vitest + MSW)
_For UI interactions, API integration, error display, loading states_

- `should render file picker that accepts .json files`
- `should upload selected file to import endpoint via multipart form data`
- `should show loading state during upload`
- `should show success toast and navigate on successful import`
- `should display validation errors returned by the API`
- `should display warnings from the API response`
- `should handle network errors gracefully`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows_

- `should import a character from a valid JSON file, see success, and find the character in the gallery`
- `should upload an invalid JSON file and see validation error messages`

### Test Dependencies
- Factory for Character model instances and valid export JSON fixtures
- Invalid JSON fixtures (syntax errors, missing fields, type mismatches, out-of-range values)
- SRD data fixtures in the test database for reference validation
- Two test users for ownership verification
- MSW handlers for mocking import endpoint in frontend tests

## Identified Gaps

- **Batch Import**: No specification for importing multiple characters in a single request. A future enhancement could accept a JSON file with a `characters` array and create multiple characters in one transaction
- **Duplicate Detection**: No specification for detecting or handling imports of characters with identical names already owned by the user
- **Rate Limiting**: No specification for rate limiting the import endpoint to prevent abuse or accidental repeated uploads
- **Accessibility**: No specification for keyboard-accessible file picker alternative or screen reader announcements for validation results
- **Progress Feedback**: For very large valid files, no specification for streaming validation progress to the client

## Dependencies
- Story 22.1 (JSON Export) — import must handle the export format produced by the export endpoint
- Phase 1 Character model and related models for database creation
- Phase 1 SRD data models for reference validation (races, classes, spells, equipment)
- Django REST Framework serializer and view infrastructure
- Django session authentication middleware
- Story 21.1 (Gallery) — import is triggered from the gallery toolbar

## Notes
- Reference validation against SRD data is lenient by design: unknown references produce warnings, not errors, to allow importing characters with homebrew or custom content. The server logs a warning but proceeds with the import
- Business rule violations (e.g., ability scores out of standard range) are also warnings. The calculation engine can recalculate derived values after import if needed
- The server always assigns a new UUID and owner, which means the same JSON file can be imported multiple times by different users without conflict
- The version migration framework is forward-looking: for v1.0, all imports are format version "1.0" so no migration is needed, but the infrastructure should be in place for future format changes
- File size limit (1MB) should be configurable via Django settings. For reference, a typical character JSON export is under 50KB
- The frontend should clear the file picker after a successful import so the user can immediately import another file if desired
