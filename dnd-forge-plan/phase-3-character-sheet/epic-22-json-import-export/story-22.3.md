# Story 22.3 — Share via URL (Lightweight)

> **Epic 22: JSON Import / Export** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need a quick way to share a read-only view of my character without requiring the recipient to import a JSON file.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **URL Encoding**: Character data compressed with `pako` (gzip) library, then base64-encoded into the URL hash: `/share#[encodedData]`
- **Share Route**: `pages/SharedCharacterView.tsx` — read-only route that decodes the URL hash and renders the character sheet with no edit capabilities
- **Size Limit**: 8,000 character URL length guard. Most level 1-5 characters fit comfortably. If exceeded, suggest JSON export instead
- **No Backend Required**: Everything is client-side — the URL contains the full character data
- **Share Link Button**: In the character sheet header, copies URL to clipboard with toast notification
- **Import from Share**: The shared view includes an "Import to My Characters" button

## Tasks
- [ ] **T22.3.1** — Generate a shareable URL by encoding the character data as a compressed, base64-encoded URL hash: `/share#[encodedData]`. Use `pako` (gzip) compression to keep URL lengths manageable
- [ ] **T22.3.2** — Create `pages/SharedCharacterView.tsx` — a read-only route that decodes the URL hash, deserializes the character data, and renders the character sheet in view-only mode with no edit capabilities
- [ ] **T22.3.3** — Add a "Share Link" button to the character sheet header. Clicking it copies the shareable URL to clipboard with a toast: "Share link copied!" Include a warning: "This link contains your full character data in the URL"
- [ ] **T22.3.4** — Size guard: if the encoded character data exceeds 8,000 characters (URL length limits), show a warning and suggest JSON export instead. Most level 1-5 characters should fit comfortably
- [ ] **T22.3.5** — The shared view shows a banner: "Shared Character — [Character Name]" with an "Import to My Characters" button that copies the character into the viewer's IndexedDB

## Acceptance Criteria
- Shareable URL is generated with compressed, base64-encoded character data in the hash
- SharedCharacterView route correctly decodes the URL and renders the character sheet
- Shared view is read-only with no edit mode or toggle
- "Share Link" button copies the URL to clipboard with success toast
- Warning message explains that the URL contains full character data
- Size guard warns when encoded data exceeds 8,000 characters and suggests JSON export
- Shared view banner shows "Shared Character — [Character Name]"
- "Import to My Characters" button creates the character in the viewer's IndexedDB with a new ID
- The pako compression library is used for efficient encoding

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compress character data using pako gzip compression`
- `should base64-encode compressed data for URL hash`
- `should decode base64 URL hash and decompress to character data`
- `should detect when encoded data exceeds 8,000 character URL length limit`
- `should handle corrupted/invalid URL data gracefully with error`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render SharedCharacterView in read-only mode with no edit toggle`
- `should display banner "Shared Character -- [Character Name]" on shared view`
- `should render "Import to My Characters" button on shared view`
- `should create character in viewer's IndexedDB with new ID when "Import to My Characters" is clicked`
- `should copy shareable URL to clipboard when "Share Link" button is clicked`
- `should show success toast "Share link copied!" after copying`
- `should show warning about URL containing full character data`
- `should show size guard warning when data exceeds 8,000 characters and suggest JSON export`
- `should display error message when URL data is corrupted or invalid`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should generate share link, navigate to it, view the shared character sheet in read-only mode, and import it`

### Test Dependencies
- Mock pako compression library
- Mock character data of various sizes (within and exceeding URL limit)
- Mock clipboard API
- Mock IndexedDB for "Import to My Characters"
- Mock React Router for share route

## Identified Gaps

- **Error Handling**: No specification for graceful handling of browser URL length limits beyond 8,000 characters
- **Accessibility**: No ARIA labels for shared view banner, no screen reader support for clipboard copy confirmation
- **Edge Cases**: No specification for shared URLs with very old format versions (future migration concern)
- **Mobile/Responsive**: No specification for how the shared view renders on mobile

## Dependencies
- Story 22.1 (JSON Export) — share uses similar serialization logic
- Story 22.2 (JSON Import) — "Import to My Characters" uses import logic
- Epic 17-19 (Character Sheet Pages) — shared view renders the same sheet components
- Epic 25 (Routing) — share route (`/share#[data]`) must be registered

## Notes
- The `pako` library provides gzip compression that significantly reduces the URL length
- URL length limits vary by browser but 8,000 characters is a safe maximum for most
- The share URL is self-contained — the recipient doesn't need an account or the app installed (as long as they access the URL in a browser)
- Share URLs are ephemeral — they're not stored or tracked. The data is fully contained in the URL
- This is a lightweight sharing solution for Phase 3. A more robust server-side sharing mechanism could be added in future phases
- The shared view should handle invalid/corrupted URL data gracefully with an error message
