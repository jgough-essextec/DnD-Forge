# Story 39.1 — PDF Generation Architecture

> **Epic 39: PDF Character Sheet Export** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a developer, I need the server-side PDF generation architecture using WeasyPrint so that character sheets can be rendered as high-quality PDFs entirely on the backend. This story establishes the Django app, the WeasyPrint service layer, the API endpoint, the base HTML template, and print-optimized CSS that all subsequent PDF stories build upon.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **PDF Approach**: Server-side rendering via Django templates + WeasyPrint. HTML+CSS is rendered to PDF on the backend; no client-side PDF generation
- **Paper Size**: US Letter (215.9mm x 279.4mm) default via `@page` CSS rule
- **Output Quality**: Vector text (searchable, selectable), crisp at any zoom, ~200KB per sheet
- **Font Strategy**: Cinzel for headings (loaded via `@font-face` in print CSS), system sans-serif for body text

## Tasks

- [ ] **T39.1.1** — Install WeasyPrint in backend requirements (`weasyprint>=60.0`) and verify system-level dependencies (Pango, GDK-PixBuf, libffi) are present in the development and CI environments
- [ ] **T39.1.2** — Create `backend/pdf/` Django app with a `PDFGenerationService` class responsible for loading templates, injecting character context, and calling `weasyprint.HTML(...).write_pdf()`. Register the app in `INSTALLED_APPS`
- [ ] **T39.1.3** — Create `GET /api/characters/:id/pdf/` endpoint in `backend/pdf/views.py`. The view fetches the character (with ownership check), passes data to `PDFGenerationService`, and returns the resulting PDF binary as an `HttpResponse` with `content_type='application/pdf'` and a `Content-Disposition: attachment` header using the filename format `[CharacterName]_Level[N]_[Class].pdf`
- [ ] **T39.1.4** — Create the base Django HTML template `templates/pdf/character_sheet.html` that serves as the entry point for WeasyPrint rendering. This template extends a minimal base and includes blocks for page 1, page 2, and the conditional spellcasting page
- [ ] **T39.1.5** — Create the print-optimized CSS stylesheet `static/pdf/styles.css` with `@page` rules for page size (US Letter default), margins, fonts (Cinzel for headings, sans-serif for body), and base typography. Link this stylesheet in the base template
- [ ] **T39.1.6** — Write an integration test using pytest and DRF `APITestCase`. The test calls the PDF endpoint for a test character and asserts: HTTP 200, `Content-Type: application/pdf`, response body starts with `%PDF-` magic bytes, and the `Content-Disposition` header contains the expected filename

## Acceptance Criteria

- WeasyPrint is installed and can render HTML+CSS to PDF on the backend
- `backend/pdf/` Django app exists with a `PDFGenerationService` that accepts character data and returns PDF bytes
- `GET /api/characters/:id/pdf/` returns a downloadable PDF with `Content-Type: application/pdf` and a `Content-Disposition: attachment` header
- Base Django template `templates/pdf/character_sheet.html` renders successfully through WeasyPrint
- Print CSS (`static/pdf/styles.css`) defines `@page` rules, page size, margins, and base typography
- Only the character owner (or a DM for that character's campaign) can access the endpoint; unauthorized requests return 403

## Testing Requirements

### Backend Integration Tests (pytest + DRF APITestCase)
_For endpoint behavior, service layer logic, PDF output validation_

- `should return HTTP 200 with Content-Type application/pdf for an authenticated character owner`
- `should return HTTP 403 when an unauthenticated user requests the PDF endpoint`
- `should return HTTP 403 when a user requests a PDF for a character they do not own`
- `should return HTTP 404 when requesting a PDF for a non-existent character ID`
- `should return a response body starting with %PDF- magic bytes`
- `should include Content-Disposition header with sanitized filename matching [CharacterName]_Level[N]_[Class].pdf`
- `should render the base template without errors for a fully populated character`
- `should render the base template without errors for a character with minimal/empty optional fields`

### Template Rendering Tests (pytest)
_For verifying Django templates produce valid HTML before PDF conversion_

- `should render character_sheet.html with sample character context without template errors`
- `should include the print CSS stylesheet link in the rendered HTML`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should download a valid PDF file when the export endpoint is called for a test character`
- `should produce a PDF under 500KB for a standard character`

### Test Dependencies
- Level 5 Fighter factory/fixture with all fields populated in the Django test database
- Authenticated API client (session auth) for the character owner
- Second user fixture for permission testing

## Identified Gaps

- **Error Handling**: Behavior when WeasyPrint encounters a rendering error (e.g., missing system font, broken image reference) needs a defined fallback — return 500 with a JSON error body or a partial PDF?
- **Edge Cases**: Behavior when character has missing or null optional fields (no backstory, no equipment, no spells) should degrade gracefully in the template with empty sections rather than template errors
- **Performance**: No target for PDF generation time on the server. WeasyPrint can be slow for complex layouts; consider whether an async task (Celery) is needed for large PDFs
- **System Dependencies**: WeasyPrint requires Pango, GDK-PixBuf, and other system libraries. CI/CD and production Dockerfile must include these packages

## Dependencies

- Character data model from Phase 1 (all character fields available via Django ORM)
- WeasyPrint library (`weasyprint>=60.0`) and its system-level dependencies (Pango, GDK-PixBuf, libffi)
- Django REST Framework authentication and permissions (session auth from prior phases)
- Character calculation engine from Phase 3 (derived stats: modifiers, AC, initiative, proficiency bonus)

## Notes

- WeasyPrint renders HTML+CSS to PDF entirely on the server. No JavaScript execution is needed. Django templates provide the HTML structure and character data via template context. This replaces the jsPDF coordinate-based drawing approach entirely
- WeasyPrint supports CSS3 paged media (`@page`, `page-break-before`, `@bottom-center` for page numbering), CSS Grid, and Flexbox, making layout straightforward compared to manual coordinate positioning
- The `PDFGenerationService` should be a standalone service class (not tied to the view) so it can be reused by the campaign export story (39.5) and any future batch/async export needs
- System dependencies (Pango, GDK-PixBuf) must be documented in the project README and included in the Dockerfile for CI and production environments
