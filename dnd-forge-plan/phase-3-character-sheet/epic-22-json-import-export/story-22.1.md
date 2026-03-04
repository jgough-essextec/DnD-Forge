# Story 22.1 — JSON Export

> **Epic 22: JSON Import / Export** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a user, I want to export my character as a JSON file via a server-side API endpoint so I can back it up, share it with others, or transfer to another device. The export is produced by the Django backend, ensuring consistent formatting and data integrity, and delivered to the browser as a downloadable file.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Export Endpoint**: `GET /api/characters/:id/export/` returns JSON with `Content-Type: application/json` and `Content-Disposition: attachment` header
- **Export Format**: JSON with metadata wrapper containing `formatVersion`, `appVersion`, `exportedAt` (ISO timestamp), and the `character` object
- **Serializer**: `CharacterExportSerializer` formats all character fields for export, including nested relations (race, class, spells, equipment)
- **Filename Convention**: `Content-Disposition: attachment; filename="character-{name}.json"` with sanitized name
- **Authentication**: Requires session auth; users can only export their own characters (owner FK check)

## Tasks
- [ ] **T22.1.1** — Create `GET /api/characters/:id/export/` endpoint in Django. The view retrieves the character by ID, verifies the requesting user is the owner, serializes the data, and returns it as a downloadable JSON response. Return 404 if not found, 403 if not the owner
- [ ] **T22.1.2** — Create `CharacterExportSerializer` in the characters app. The serializer formats the character for export including: metadata wrapper (`formatVersion: "1.0"`, `appVersion`, `exportedAt` ISO timestamp), all character fields (name, race, class, level, ability scores, skills, spells, equipment, features, background, etc.), and nested related objects. Exclude internal-only fields (`id`, `owner`, `created_at`, `updated_at`) from the character payload
- [ ] **T22.1.3** — Set the `Content-Disposition` header on the response to `attachment; filename="character-{name}.json"` where `{name}` is the sanitized character name (replace special characters with underscores, lowercase). Set `Content-Type: application/json`. Return pretty-printed JSON (indent=2)
- [ ] **T22.1.4** — Frontend: Add an "Export" button to the character sheet header and gallery card context menu. On click, call the export endpoint via Axios with `responseType: 'blob'`. On success, create a download link using `URL.createObjectURL()`, trigger the browser download, and revoke the object URL afterward. Show a toast on success or error
- [ ] **T22.1.5** — Write tests. Backend: pytest test using DRF `APITestCase` that verifies the export endpoint returns valid JSON with correct metadata wrapper, correct `Content-Disposition` header, 403 for non-owner access, and 404 for nonexistent character. Frontend: Vitest test using MSW to mock the API, verify the download is triggered on button click, and verify error handling

## Acceptance Criteria
- `GET /api/characters/:id/export/` returns a JSON response with `Content-Type: application/json`
- Response includes `Content-Disposition: attachment; filename="character-{name}.json"` header
- Exported JSON includes metadata wrapper with `formatVersion`, `appVersion`, and `exportedAt` fields
- Exported JSON includes all character fields (name, race, class, level, ability scores, skills, spells, equipment, features, background)
- Internal fields (`id`, `owner`, `created_at`, `updated_at`) are excluded from the character payload
- Endpoint returns 404 for nonexistent characters and 403 for characters not owned by the requesting user
- Endpoint requires authentication (401 for unauthenticated requests)
- Exported JSON is pretty-printed (indented) for readability
- Frontend export button triggers API call, receives blob, and initiates browser file download
- Success and error states are communicated to the user via toast notifications

## Testing Requirements

### Backend Tests (pytest + DRF APITestCase)
_For API endpoint behavior, serialization, permissions, response format_

- `should return 200 with valid JSON body when exporting own character`
- `should include metadata wrapper with formatVersion, appVersion, and exportedAt ISO timestamp`
- `should include all character fields in the exported JSON (name, race, class, level, ability scores, etc.)`
- `should exclude internal fields (id, owner, created_at, updated_at) from character payload`
- `should set Content-Disposition header to attachment with sanitized filename`
- `should set Content-Type header to application/json`
- `should return pretty-printed JSON (indent=2)`
- `should return 403 when attempting to export another user's character`
- `should return 404 when character does not exist`
- `should return 401 when user is not authenticated`

### Frontend Tests (Vitest + MSW)
_For UI interactions, API integration, download trigger, error handling_

- `should call export endpoint when export button is clicked`
- `should trigger browser file download on successful API response`
- `should show success toast after export completes`
- `should show error toast when export API returns an error`
- `should display export button in character sheet header`
- `should display export option in gallery card context menu`

### Test Dependencies
- Factory for Character model instances (pytest-factoryboy or manual setup)
- Two test users for ownership/permission testing
- MSW handlers for mocking export endpoint in frontend tests
- Mock `URL.createObjectURL` and download link click in Vitest

## Identified Gaps

- **Batch Export**: No specification for exporting multiple characters in a single request. A future endpoint such as `POST /api/characters/export-batch/` accepting a list of character IDs could address this
- **Error Handling**: No specification for handling database errors or serialization failures during export
- **Rate Limiting**: No specification for rate limiting the export endpoint to prevent abuse
- **Large Characters**: No specification for characters with very large data (e.g., extensive spell lists or equipment) and potential response size concerns

## Dependencies
- Phase 1 Character model and type system for serialization
- Django REST Framework for API endpoint and serializer infrastructure
- Django session authentication middleware
- Story 21.1 (Gallery) — export accessible from gallery card context menu
- Story 21.3 (Quick Actions) — export is one of the quick actions

## Notes
- The `CharacterExportSerializer` is distinct from the standard `CharacterSerializer` used for CRUD operations. The export serializer includes the metadata wrapper and excludes internal fields, producing a format designed for portability rather than API consumption
- The `formatVersion` field ("1.0") establishes a versioning scheme for future import compatibility. If the export format changes, the version should be incremented
- Sanitizing the filename in the `Content-Disposition` header prevents issues with special characters in character names across different operating systems and browsers
- The frontend download mechanism (blob + createObjectURL) is the standard approach for triggering file downloads from API responses in SPAs
- Authentication and ownership checks are enforced server-side; the frontend should not need to perform any permission logic beyond passing the session cookie
