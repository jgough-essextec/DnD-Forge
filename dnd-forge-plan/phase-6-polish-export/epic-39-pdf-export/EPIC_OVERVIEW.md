# Epic 39: PDF Character Sheet Export

> **Phase 6: Polish & Export** | Weeks 11-12

## Goal

Generate a downloadable PDF character sheet that faithfully reproduces the official D&D 5e three-page layout with all character data populated, clean typography, proper field sizing, and decorative borders — rendered server-side via Django templates and WeasyPrint.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 39.1 | PDF Generation Architecture | 5 | WeasyPrint setup, Django template structure, CSS page model, typography, font embedding |
| 39.2 | Page 1: Core Stats Layout | 12 | Header, ability scores, saves, skills, combat stats, HP, attacks, personality, features |
| 39.3 | Page 2: Backstory & Description Layout | 6 | Appearance, backstory, allies, features overflow, treasure, equipment |
| 39.4 | Page 3: Spellcasting Layout | 6 | Spellcasting header, cantrips, spell levels 1-9, Warlock pact magic, density, non-casters |
| 39.5 | PDF Export Options & UI | 7 | Export modal, options dialog, preview, download, print button, batch export, error handling |
| 39.6 | Campaign Export to PDF | 3 | Party summary PDF, overview page, full character sheets option |

## Technical Approach

- **Server-Side PDF Generation:** WeasyPrint renders Django HTML templates to PDF via a dedicated Django REST API endpoint (`/api/characters/{id}/pdf/`)
- **Django Templates:** HTML/CSS templates designed for the CSS paged media model (`@page` rules, page breaks, margins) producing clean multi-page PDFs
- **Vector Output:** Produces crisp, searchable text PDFs (~200KB per sheet) rather than raster image PDFs
- **Font Embedding:** Cinzel font loaded via CSS `@font-face` for authentic D&D headings, resolved by WeasyPrint at render time
- **Three-Page Layout:** Page 1 (Core Stats), Page 2 (Backstory & Description), Page 3 (Spellcasting)
- **Paper Sizes:** US Letter (215.9mm x 279.4mm) default, A4 option
- **React Integration:** React frontend calls the PDF API endpoint and triggers a file download; a preview option renders in an iframe

## Dependencies

- Phases 1-5 complete (all character data available)
- WeasyPrint Python library (server-side PDF rendering)
- Django templates for PDF layout
- JSZip library (for batch export on the frontend)

## Key Deliverables

- `characters/pdf.py` — Django view handling PDF generation via WeasyPrint
- `templates/pdf/character_sheet.html` — Django template for the three-page character sheet
- `templates/pdf/campaign_summary.html` — Django template for campaign summary PDF
- `static/pdf/pdf_styles.css` — CSS paged media stylesheet for PDF layout
- `src/components/export/PDFExportModal.tsx` — React export options dialog
- API endpoint: `GET /api/characters/{id}/pdf/` with query params for options

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 39.1 — PDF Generation Architecture | 7 | 1 | 3 | 11 |
| 39.2 — Page 1: Core Stats Layout | 7 | 1 | 3 | 11 |
| 39.3 — Page 2: Backstory & Description Layout | 8 | 0 | 3 | 11 |
| 39.4 — Page 3: Spellcasting Layout | 8 | 0 | 3 | 11 |
| 39.5 — PDF Export Options & UI | 4 | 6 | 4 | 14 |
| 39.6 — Campaign Export to PDF | 3 | 3 | 3 | 9 |
| **Totals** | **37** | **11** | **19** | **67** |

> **Testing Note:** Unit and functional tests for PDF generation (Stories 39.1-39.4, 39.6) use **pytest** with Django's test client and WeasyPrint assertions. Frontend tests for the export UI (Story 39.5) use Vitest + React Testing Library with MSW mocking the PDF API endpoint. E2E tests use Playwright.

### Key Gaps Found
- PDF accessibility (tagged PDF, reading order) not specified across all page layout stories
- Error handling for partial failures (e.g., one character failing in batch export, one page failing in campaign binder) not defined
- PDF generation performance targets (time per page on the server) not specified
- Edge cases for missing/null character fields, corrupt avatar images, and empty optional sections not addressed
- Multiclass character handling in PDF headers and spellcasting not fully specified
- WeasyPrint server resource limits (memory, concurrent PDF generation) not defined
