# Story 39.5 — PDF Export Options & UI

> **Epic 39: PDF Character Sheet Export** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player, I need a clear export dialog that lets me choose what to include in my PDF and download it. This story covers the export modal UI, page/option selection, PDF preview thumbnail, download/print actions, batch export for multiple characters, and error handling for PDF generation failures.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Export Trigger Points**: "Export PDF" button on character sheet quick-action bar, gallery card context menu
- **PDF Options**: Page selection, paper size (US Letter/A4), avatar toggle, DM notes toggle, color scheme (Classic/Minimal)
- **Preview**: Low-resolution thumbnail using html2canvas at 0.5x scale on a hidden preview component
- **Filename Format**: `[CharacterName]_Level[N]_[Class].pdf` (sanitized)
- **Batch Export**: Multiple characters exported as individual PDFs in a ZIP file using JSZip library
- **Error Handling**: Graceful fallback to print stylesheet if PDF generation fails

## Tasks

- [ ] **T39.5.1** — Create `components/export/PDFExportModal.tsx` — triggered by the "Export PDF" button on the character sheet quick-action bar and gallery card context menu
- [ ] **T39.5.2** — Export options dialog:
  - Page selection: checkboxes for "Page 1: Core Stats" (default on), "Page 2: Backstory & Description" (default on), "Page 3: Spellcasting" (default on for casters, off for non-casters)
  - Paper size: US Letter (default) or A4
  - Include avatar image: toggle (default on if avatar exists)
  - Include DM notes: toggle (default off, only visible in DM context)
  - Color scheme: "Classic" (black & white with amber accents) or "Minimal" (pure black & white, less ink)
- [ ] **T39.5.3** — **PDF preview:** render a low-resolution thumbnail preview of Page 1 in the modal so the player sees what they'll get before exporting. Use html2canvas at 0.5x scale on a hidden PDF preview component
- [ ] **T39.5.4** — **"Export PDF" button:** generates the PDF, shows a progress indicator ("Generating PDF..."), then triggers a browser download. Filename: `[CharacterName]_Level[N]_[Class].pdf` (sanitized)
- [ ] **T39.5.5** — **"Print" button:** alternative action that opens the browser print dialog with the PDF content rendered in a print-friendly layout (same content, using `@media print` styles instead of PDF generation)
- [ ] **T39.5.6** — **Batch export:** from the gallery, select multiple characters and "Export All as PDFs." Generates individual PDFs in a ZIP file (using JSZip library) or downloads them sequentially
- [ ] **T39.5.7** — Error handling: if PDF generation fails (e.g., out of memory on very large characters), show a graceful error: "PDF generation failed. Try exporting fewer pages or reducing backstory length." Fallback to the print stylesheet

## Acceptance Criteria

- PDFExportModal opens from both the character sheet quick-action bar and gallery card context menu
- All export options (page selection, paper size, avatar, DM notes, color scheme) are functional and persist choices
- Page 3 defaults to off for non-caster characters
- DM notes toggle is only visible when in DM context
- PDF preview thumbnail renders in the modal showing a preview of Page 1
- "Export PDF" generates the PDF with a progress indicator and triggers browser download with correct filename
- "Print" button opens the browser print dialog with print-friendly layout
- Batch export generates a ZIP file containing individual PDFs for selected characters
- Error handling shows a user-friendly message on failure and offers print stylesheet as fallback
- Filename format is `[CharacterName]_Level[N]_[Class].pdf` with sanitized characters

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should sanitize filename removing special characters invalid across OS platforms`
- `should generate correct filename format: [CharacterName]_Level[N]_[Class].pdf`
- `should default Page 3 to off for non-caster characters`
- `should default DM notes toggle to off and only make it visible in DM context`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render PDFExportModal with all export options (page selection, paper size, avatar, DM notes, color scheme)`
- `should show PDF preview thumbnail in the modal for Page 1`
- `should display progress indicator "Generating PDF..." during export`
- `should show error message with fallback to print stylesheet when PDF generation fails`
- `should persist export option choices across modal openings`
- `should hide DM notes toggle when not in DM context`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should open PDFExportModal from character sheet quick-action bar and download valid PDF`
- `should open PDFExportModal from gallery card context menu`
- `should batch export multiple characters as individual PDFs in a ZIP file`
- `should open browser print dialog when Print button is clicked`

### Test Dependencies
- Mock PDF generation functions (for unit/functional tests)
- Level 5 Fighter and Level 3 Wizard fixtures
- Non-caster character fixture (for Page 3 default behavior)
- DM context mock (for DM notes toggle visibility)
- JSZip mock for batch export testing
- Multiple character fixtures for batch export testing

## Identified Gaps

- **Error Handling**: No specification for batch export partial failures (what if 1 of 12 characters fails?)
- **Loading/Empty States**: No loading state specified for the PDF preview thumbnail generation
- **Edge Cases**: Maximum number of characters for batch export not defined
- **Performance**: No target for batch export time per character
- **Accessibility**: Modal accessibility (focus trap, ARIA labels) not explicitly mentioned
- **Mobile/Responsive**: PDF export modal layout on mobile not specified

## Dependencies

- Stories 39.1-39.4 (PDF generation architecture and all three page layouts)
- JSZip library (for batch export)
- Character sheet quick-action bar from Phase 3
- Gallery card context menu from Phase 3

## Notes

- The PDF chunk (jsPDF, html2canvas, PDF layout code) should be code-split and only loaded when the export action is triggered
- Batch export may be slow for many characters — show individual progress ("Exporting character 3 of 12...")
- Filename sanitization should remove special characters that are invalid in filenames across OS platforms
- The preview thumbnail doesn't need to be pixel-perfect — it's a rough preview to help the user decide
