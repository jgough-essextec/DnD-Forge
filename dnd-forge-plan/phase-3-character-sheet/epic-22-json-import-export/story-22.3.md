# Story 22.3 — Share via URL (Lightweight)

> **Epic 22: JSON Import / Export** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a user, I want to share characters via URL, where the recipient can view the character data and import it to their own account via the API. Sharing is server-side: the owner generates a time-limited share token/link through a Django endpoint, and the recipient accesses a public endpoint that returns the character JSON without requiring authentication.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Share Endpoint**: `GET /api/characters/:id/share/` generates a unique share token and returns the shareable URL (requires auth, owner only)
- **Public Shared Endpoint**: `GET /api/shared/:token/` returns the character JSON for the given token (no auth required, read-only)
- **Share Token Model**: `CharacterShareToken` model stores token (UUID), character FK, created_at, expires_at (configurable TTL, default 7 days)
- **Token Expiry**: Expired tokens return 410 Gone with a message indicating the link has expired
- **Import from Share**: Recipient can import the shared character to their account via the existing `POST /api/characters/import/` endpoint (from Story 22.2)

## Tasks
- [ ] **T22.3.1** — Create `GET /api/characters/:id/share/` endpoint in Django. The view verifies the requesting user owns the character, generates a `CharacterShareToken` (UUID token, character FK, `created_at`, `expires_at` set to 7 days from now), saves it to the database, and returns the shareable URL: `{ "share_url": "https://{domain}/shared/{token}", "expires_at": "ISO timestamp" }`. Return 403 if not the owner, 404 if character not found. If a non-expired token already exists for this character, return the existing one rather than creating a duplicate
- [ ] **T22.3.2** — Create the `CharacterShareToken` model in the characters app. Fields: `token` (UUIDField, primary key, default=uuid4), `character` (ForeignKey to Character, on_delete=CASCADE), `created_at` (DateTimeField, auto_now_add), `expires_at` (DateTimeField). Add a database index on `token` for fast lookups. Add a model method `is_expired` that checks if `expires_at < now`
- [ ] **T22.3.3** — Create `GET /api/shared/:token/` public endpoint (no authentication required). The view looks up the `CharacterShareToken` by token UUID. If found and not expired, serialize the character using the same `CharacterExportSerializer` from Story 22.1 and return 200 with the character JSON. If the token is expired, return 410 Gone with `{"detail": "This share link has expired"}`. If the token does not exist, return 404
- [ ] **T22.3.4** — Frontend: Add a "Share" button to the character sheet header and gallery card context menu. On click, call the share endpoint. On success, display a share dialog showing the generated URL with a "Copy Link" button (copies to clipboard) and the expiration date. Show a toast "Share link copied!" on successful copy. If the share link was already generated (non-expired token exists), show the existing link
- [ ] **T22.3.5** — Frontend: Create a `/shared/:token` route. When visited, call `GET /api/shared/:token/` to fetch the character data. Display a read-only character summary with a banner "Shared Character -- [Character Name]". If the user is authenticated, show an "Import to My Characters" button that sends the character JSON to `POST /api/characters/import/` (reusing the import endpoint from Story 22.2). If the token is expired, show an expiration message. If the token is invalid, show a 404 page
- [ ] **T22.3.6** — Write tests. Backend: pytest tests using DRF `APITestCase` covering share token generation (201 + URL returned), ownership check (403 for non-owner), reuse of existing non-expired token, public shared endpoint returns character data (200), expired token returns 410, nonexistent token returns 404, and cascade delete when character is deleted. Frontend: Vitest tests using MSW to mock share/shared endpoints, test share dialog UI, copy-to-clipboard, shared character view rendering, import button interaction, and expired/invalid token error states

## Acceptance Criteria
- `GET /api/characters/:id/share/` generates a unique share token and returns the shareable URL with expiration date
- Share endpoint requires authentication and verifies character ownership (403 for non-owners, 404 for missing characters)
- If a non-expired share token already exists for the character, the existing token/URL is returned (no duplicate tokens)
- `GET /api/shared/:token/` returns the character JSON without requiring authentication
- Expired tokens return 410 Gone with a clear expiration message
- Nonexistent tokens return 404
- Share tokens have a configurable TTL (default 7 days)
- Share tokens are cascade-deleted when the character is deleted
- Frontend share button triggers token generation and displays the shareable URL in a dialog
- "Copy Link" button copies the URL to clipboard with a success toast
- `/shared/:token` route displays a read-only character summary with a "Shared Character" banner
- Authenticated users on the shared view can import the character to their account via the import endpoint
- Unauthenticated users can view the shared character but cannot import (import button hidden or redirects to login)

## Testing Requirements

### Backend Tests (pytest + DRF APITestCase)
_For API endpoint behavior, token management, permissions, public access_

- `should return 200 with share_url and expires_at when generating share link for own character`
- `should create a CharacterShareToken in the database with correct character FK and expiry`
- `should return existing non-expired token instead of creating a duplicate`
- `should return 403 when attempting to share another user's character`
- `should return 404 when character does not exist`
- `should return 401 when user is not authenticated (share endpoint)`
- `should return 200 with character JSON from public shared endpoint (no auth required)`
- `should return character data matching the CharacterExportSerializer format`
- `should return 410 Gone when share token is expired`
- `should return 404 when share token does not exist`
- `should cascade-delete share tokens when character is deleted`
- `should set default token expiry to 7 days from creation`

### Frontend Tests (Vitest + MSW)
_For UI interactions, share dialog, shared view, clipboard, error states_

- `should display share button in character sheet header`
- `should display share option in gallery card context menu`
- `should call share endpoint and display share dialog with URL on success`
- `should copy share URL to clipboard when "Copy Link" button is clicked`
- `should show success toast "Share link copied!" after copying`
- `should display expiration date in the share dialog`
- `should render shared character view with read-only character summary`
- `should display banner "Shared Character -- [Character Name]" on shared view`
- `should show "Import to My Characters" button for authenticated users on shared view`
- `should call import endpoint when "Import to My Characters" is clicked`
- `should display expiration message when shared token is expired (410 response)`
- `should display 404 page when shared token is invalid`
- `should hide import button for unauthenticated users`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows_

- `should generate share link, open it in a new context, view the shared character, and import it to a different user's account`
- `should show expiration message when visiting an expired share link`

### Test Dependencies
- Factory for Character model instances and CharacterShareToken instances
- Two test users (owner and recipient) for permission and import testing
- Time mocking (freezegun or similar) to test token expiry
- MSW handlers for mocking share and shared endpoints in frontend tests
- Mock clipboard API for copy-to-clipboard testing

## Identified Gaps

- **Token Management UI**: No specification for the owner to view, revoke, or regenerate share tokens for their characters. A future enhancement could add a "Manage Share Links" section
- **Rate Limiting**: No specification for rate limiting share token generation or public shared endpoint access to prevent abuse
- **Analytics**: No specification for tracking how many times a shared link is accessed
- **Accessibility**: No ARIA labels for the share dialog, shared character banner, or screen reader announcements for clipboard copy confirmation
- **Mobile/Responsive**: No specification for how the share dialog and shared character view render on mobile devices

## Dependencies
- Story 22.1 (JSON Export) — shared endpoint reuses `CharacterExportSerializer` for consistent character JSON format
- Story 22.2 (JSON Import) — "Import to My Characters" reuses the `POST /api/characters/import/` endpoint
- Phase 1 Character model for the CharacterShareToken foreign key relationship
- Django REST Framework for API endpoint infrastructure
- Django session authentication middleware (for share generation and authenticated import)
- Epic 25 (Routing) — `/shared/:token` route must be registered in React Router

## Notes
- The share token approach is more robust than URL-encoded data: it avoids URL length limits, keeps character data on the server, and allows the owner to control access through token expiry
- Reusing the existing `CharacterExportSerializer` (Story 22.1) and import endpoint (Story 22.2) keeps the sharing feature lightweight and consistent with the export/import format
- The 7-day default TTL balances convenience (links remain valid long enough to share) with security (links do not persist indefinitely). This should be configurable via Django settings
- Cascade deletion of share tokens when a character is deleted ensures no orphaned tokens point to nonexistent data
- The public shared endpoint (`GET /api/shared/:token/`) intentionally does not require authentication so that recipients without accounts can still view the character. However, importing requires authentication
- A future enhancement could allow the owner to set custom expiry durations or create permanent share links
