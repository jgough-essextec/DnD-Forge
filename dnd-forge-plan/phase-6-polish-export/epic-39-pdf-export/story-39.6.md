# Story 39.6 — Export UI & Download

> **Epic 39: PDF Character Sheet Export** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a user, I want a download button on the character sheet that fetches the server-generated PDF and saves it to my browser. This story covers the frontend "Export PDF" button, the Axios API call to the backend PDF endpoint, the browser download trigger from the blob response, and loading/error state handling.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Export Trigger**: "Export PDF" button on the character sheet page (quick-action bar)
- **API Call**: `GET /api/characters/:id/pdf/` via Axios with `responseType: 'blob'` to receive binary PDF data
- **Download Mechanism**: Create a temporary object URL from the blob response, create a hidden `<a>` element with `download` attribute, trigger click, revoke URL
- **State Handling**: Loading spinner during PDF generation, error toast on failure
- **No Client-Side PDF Generation**: All rendering happens on the server via WeasyPrint. The frontend only fetches and downloads

## Tasks

- [ ] **T39.6.1** — Add an "Export PDF" button to the character sheet UI (quick-action bar). Use a shadcn/ui `Button` with a download icon. The button should be visible to the character owner and DMs with access to the character
- [ ] **T39.6.2** — On button click, call `GET /api/characters/:id/pdf/` via Axios with `responseType: 'blob'`. Extract the filename from the `Content-Disposition` response header (falling back to `character_sheet.pdf` if not present)
- [ ] **T39.6.3** — Create browser download from the blob response: create an object URL via `URL.createObjectURL(blob)`, create a hidden `<a>` element with the `download` attribute set to the filename, programmatically click it, then revoke the object URL to free memory
- [ ] **T39.6.4** — Show a loading state during PDF generation: disable the button, show a spinner or "Generating PDF..." text. On success, trigger the download and reset the button. On failure (non-200 response or network error), show an error toast with a user-friendly message ("Failed to generate PDF. Please try again.")
- [ ] **T39.6.5** — Write tests: Vitest — mock Axios response with a PDF blob, verify `URL.createObjectURL` is called and the download anchor is created with the correct filename. Verify loading state toggles correctly. Verify error state shows toast on failure. E2E: Playwright test clicking the Export PDF button and verifying a download is triggered

## Acceptance Criteria

- "Export PDF" button is visible on the character sheet page for the character owner
- Clicking the button triggers an API call to `GET /api/characters/:id/pdf/` with `responseType: 'blob'`
- On successful response, the PDF downloads to the browser with the filename from the `Content-Disposition` header
- Loading state is shown while the API call is in progress (button disabled, spinner visible)
- Error state shows a user-friendly toast message when the API call fails
- The download mechanism works across major browsers (Chrome, Firefox, Safari, Edge)
- No client-side PDF generation libraries are loaded; all rendering happens server-side

## Testing Requirements

### Unit Tests (Vitest)
_For the download utility function and button component logic_

- `should call Axios GET with responseType blob when export is triggered`
- `should create an object URL from the blob response`
- `should create a hidden anchor element with the correct download filename from Content-Disposition header`
- `should fall back to "character_sheet.pdf" filename when Content-Disposition header is missing`
- `should revoke the object URL after triggering download`
- `should set loading state to true while API call is in progress`
- `should reset loading state to false after successful download`
- `should show error toast when API call returns non-200 status`
- `should show error toast when API call fails with network error`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes_

- `should render Export PDF button on the character sheet page`
- `should disable the button and show spinner during loading state`
- `should re-enable the button after download completes`
- `should display error toast when PDF generation fails`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should click Export PDF button and verify a file download is triggered`
- `should show loading indicator while PDF is being generated`
- `should show error message when server returns 500 for PDF generation`

### Test Dependencies
- MSW (Mock Service Worker) handler for `GET /api/characters/:id/pdf/` returning a mock PDF blob
- MSW handler returning 500 error for failure testing
- Character sheet page rendered with a test character
- Playwright download event listener for verifying file download

## Identified Gaps

- **Error Handling**: Specific error messages for different failure modes (401 unauthorized, 404 character not found, 500 server error) not defined — the toast should ideally differentiate
- **Edge Cases**: Behavior when the user clicks "Export PDF" multiple times rapidly — should debounce or disable the button during the request
- **Browser Compatibility**: The `URL.createObjectURL` + hidden anchor download approach may behave differently in Safari (especially iOS Safari). Needs cross-browser testing
- **Large PDFs**: No timeout defined for the API call. Very complex characters could take several seconds to render server-side. Consider a reasonable timeout (e.g., 30 seconds)

## Dependencies

- Story 39.1 (PDF generation architecture — the `GET /api/characters/:id/pdf/` endpoint must exist and return PDF binary)
- Story 39.5 (Multi-page assembly — the endpoint must produce a complete multi-page PDF)
- Character sheet page from Phase 3 (the quick-action bar where the Export PDF button is placed)
- Axios HTTP client (already in the project for API calls)
- shadcn/ui Button and Toast components (already in the project UI library)

## Notes

- No client-side PDF generation libraries (jsPDF, html2canvas, @react-pdf/renderer) are needed. All PDF rendering happens on the server via WeasyPrint. The frontend's only job is to make the API call and trigger the browser download
- The blob download pattern (`URL.createObjectURL` + hidden anchor) is a well-established approach. Remember to call `URL.revokeObjectURL()` after the download to avoid memory leaks
- The `Content-Disposition` header from the backend provides the filename (e.g., `attachment; filename="Thorin_Level5_Fighter.pdf"`). Parse this header to extract the filename for the download attribute
- Consider wrapping the download logic in a reusable `useFileDownload` hook or utility function, as it may be needed for future export features (e.g., campaign export)
