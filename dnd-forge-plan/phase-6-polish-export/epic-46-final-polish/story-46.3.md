# Story 46.3 — Error States & Recovery

> **Epic 46: Final Polish & UX Refinements** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player, when something goes wrong, I need clear error messages and a way to recover. This story covers implementing a global React error boundary, handling API-specific errors, enhancing import error messaging, and structuring error handling for comprehensive coverage (network errors, authentication errors, server errors).

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Error Categories**:
  - **RENDER**: Unhandled React component errors (caught by error boundary)
  - **NETWORK**: API errors (timeout, server unavailable, authentication expired)
  - **VALIDATION**: Import errors (invalid format, version mismatch, unknown data)
  - **AUTH**: Authentication/authorization errors (session expired, insufficient permissions)
- **Error Boundary UI**: Friendly error page with "Something went wrong" message, "Reload App" button, "Report Bug" link, and emergency "Export All Data" button
- **API Errors**: Server unavailable, timeout, authentication expired, permission denied — all need specific recovery guidance
- **Import Errors**: Enhanced from Phase 3 with specific, actionable messages for version mismatch, unknown class, invalid format

## Tasks

- [ ] **T46.3.1** — **Global error boundary:** wrap the app in a React error boundary that catches unhandled errors. Show a friendly error page: "Something went wrong. Your data is safe on the server." with a "Reload App" button and a "Report Bug" link (mailto or GitHub issues link)
- [ ] **T46.3.2** — **API errors:** handle server unavailable, timeout, and authentication expired errors. Show: "Connection error. Please check your internet connection or try again later." Include an "Export All Data" emergency button that fetches all data from the API for local backup
- [ ] **T46.3.3** — **Import errors:** enhance the Phase 3 import error display with specific, actionable messages: "This file was exported from a newer version of D&D Character Forge. Please update the app." or "This file contains an unrecognized class: [name]. The character will be imported without class features."
- [ ] **T46.3.4** — **Error handler utility:** `utils/errorHandler.ts` with categories: NETWORK, AUTH, VALIDATION, RENDER. Handle API timeouts, authentication expiry (redirect to login), server errors (retry with backoff), and validation failures

## Acceptance Criteria

- Global React error boundary wraps the entire app and catches unhandled render errors
- Error boundary shows a friendly page with "Something went wrong. Your data is safe on the server."
- Error page includes "Reload App" button that reloads the application
- Error page includes "Report Bug" link (mailto or GitHub issues)
- API unavailable error shows specific message with guidance to check connection or try again
- Authentication expired error redirects to login with appropriate messaging
- "Export All Data" emergency button fetches all data from API for local backup
- Import version mismatch shows "This file was exported from a newer version... Please update the app."
- Import unknown class shows "This file contains an unrecognized class: [name]..." with partial import option
- Import invalid format shows a clear "Invalid file format" message
- `utils/errorHandler.ts` exists with categorized error handling (NETWORK, AUTH, VALIDATION, RENDER)
- Error handler supports API timeouts, authentication expiry, server errors, and validation failures

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should categorize errors into NETWORK, AUTH, VALIDATION, and RENDER in errorHandler.ts`
- `should fetch all data from API and serialize to JSON via emergency export function independently of React rendering`
- `should generate specific import error message for version mismatch: "exported from a newer version"`
- `should generate specific import error message for unknown class: "unrecognized class: [name]"`
- `should generate "Invalid file format" message for malformed import files`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render global error boundary with "Something went wrong. Your data is safe on the server." message when unhandled error occurs`
- `should render "Reload App" button on error boundary page`
- `should render "Report Bug" link on error boundary page`
- `should render "Export All Data" emergency button that works even in error state`
- `should render API unavailable error with guidance to check connection or try again later`
- `should render specific actionable import error messages for version mismatch and unknown class`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should catch unhandled React errors and display error boundary instead of white screen`
- `should successfully export all data via emergency API fetch button even when app is in error state`
- `should show specific import error message when importing a file with invalid format`

### Test Dependencies
- Error boundary trigger mechanism (intentional throw in child component)
- API error simulation (server unavailable, timeout, authentication expired)
- Invalid import file fixtures (wrong format, newer version, unknown class)
- Emergency export function that fetches from API and bypasses React rendering
- errorHandler.ts with categorized error handling

## Identified Gaps

- **Error Handling**: React error boundaries don't catch errors in event handlers or async code — catch strategy for those not specified
- **Edge Cases**: Behavior when emergency "Export All Data" button itself fails (API completely unreachable)
- **Edge Cases**: Error count tracking and frequent-error warning mentioned in notes but not in acceptance criteria
- **Accessibility**: Error messages need proper ARIA roles and live region announcements — not specified

## Dependencies

- Phase 3 import/export functionality (import error enhancement)
- Django REST API data layer (API error handling)

## Notes

- The emergency "Export All Data" button is critical — it should be able to fetch all data from the API and serialize to a JSON file even when the rest of the app is broken
- Consider implementing the emergency export as a standalone fetch function that doesn't depend on React rendering
- React error boundaries only catch errors during rendering, not in event handlers or async code — use try/catch in those areas
- The error handler utility should log errors to console in development but suppress console output in production
- Consider adding an error count tracker that shows a warning if errors are happening frequently ("The app is experiencing issues. Consider clearing your browser cache.")
