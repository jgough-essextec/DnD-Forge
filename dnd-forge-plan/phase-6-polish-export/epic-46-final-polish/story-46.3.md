# Story 46.3 — Error States & Recovery

> **Epic 46: Final Polish & UX Refinements** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player, when something goes wrong, I need clear error messages and a way to recover. This story covers implementing a global React error boundary, handling IndexedDB-specific errors, enhancing import error messaging, and structuring error handling for future-proofing (network errors for eventual sync features).

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Error Categories**:
  - **RENDER**: Unhandled React component errors (caught by error boundary)
  - **STORAGE**: IndexedDB errors (quota exceeded, corruption, version mismatch)
  - **VALIDATION**: Import errors (invalid format, version mismatch, unknown data)
  - **NETWORK**: Future-proofing for sync features
- **Error Boundary UI**: Friendly error page with "Something went wrong" message, "Reload App" button, "Report Bug" link, and emergency "Export All Data" button
- **IndexedDB Errors**: Storage quota exceeded, database corruption, version mismatch — all need specific recovery guidance
- **Import Errors**: Enhanced from Phase 3 with specific, actionable messages for version mismatch, unknown class, invalid format

## Tasks

- [ ] **T46.3.1** — **Global error boundary:** wrap the app in a React error boundary that catches unhandled errors. Show a friendly error page: "Something went wrong. Your data is safe in your browser." with a "Reload App" button and a "Report Bug" link (mailto or GitHub issues link)
- [ ] **T46.3.2** — **IndexedDB errors:** handle storage quota exceeded, database corruption, and version mismatch errors. Show: "Storage error. Try clearing some old characters or exporting your data for backup." Include a "Export All Data" emergency button that works even in the error state
- [ ] **T46.3.3** — **Import errors:** enhance the Phase 3 import error display with specific, actionable messages: "This file was exported from a newer version of D&D Character Forge. Please update the app." or "This file contains an unrecognized class: [name]. The character will be imported without class features."
- [ ] **T46.3.4** — **Network errors (future-proofing):** although the app is currently offline-first, structure error handling for future sync features. `utils/errorHandler.ts` with categories: STORAGE, NETWORK, VALIDATION, RENDER

## Acceptance Criteria

- Global React error boundary wraps the entire app and catches unhandled render errors
- Error boundary shows a friendly page with "Something went wrong. Your data is safe in your browser."
- Error page includes "Reload App" button that reloads the application
- Error page includes "Report Bug" link (mailto or GitHub issues)
- IndexedDB quota exceeded error shows specific message with guidance to clear old characters or export data
- IndexedDB corruption error shows specific message with recovery guidance
- "Export All Data" emergency button works even when the app is in an error state
- Import version mismatch shows "This file was exported from a newer version... Please update the app."
- Import unknown class shows "This file contains an unrecognized class: [name]..." with partial import option
- Import invalid format shows a clear "Invalid file format" message
- `utils/errorHandler.ts` exists with categorized error handling (STORAGE, NETWORK, VALIDATION, RENDER)
- Error handler is structured to support future sync/network features

## Dependencies

- Phase 3 import/export functionality (import error enhancement)
- Phase 1 IndexedDB/Dexie.js data layer (storage error handling)

## Notes

- The emergency "Export All Data" button is critical — it should be able to serialize all IndexedDB data to a JSON file even when the rest of the app is broken
- Consider implementing the emergency export as a standalone function that doesn't depend on React rendering
- React error boundaries only catch errors during rendering, not in event handlers or async code — use try/catch in those areas
- The error handler utility should log errors to console in development but suppress console output in production
- Consider adding an error count tracker that shows a warning if errors are happening frequently ("The app is experiencing issues. Consider clearing your browser cache.")
