# Story 39.5 — PDF Multi-page Assembly

> **Epic 39: PDF Character Sheet Export** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a developer, I need the multi-page PDF assembly logic that combines all individual page templates into a single cohesive PDF document. This story covers the master Django template that includes page 1 (core stats), page 2 (backstory), and the conditional spellcasting page, with CSS `@page` rules for page breaks between sections and page numbering via CSS counters.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **PDF Assembly**: Master Django template `templates/pdf/character_sheet.html` includes all page sub-templates and controls page breaks via CSS
- **Page Breaks**: CSS `page-break-before: always` on each page section ensures clean separation between pages
- **Page Numbering**: CSS `@bottom-center { content: counter(page) " / " counter(pages); }` for automatic page numbering in the footer
- **Conditional Pages**: Spellcasting page included only for spellcasters via `{% if character.is_spellcaster %}`
- **WeasyPrint Render**: `PDFGenerationService.generate()` loads the master template, injects context, and calls `weasyprint.HTML(string=html).write_pdf()`

## Tasks

- [ ] **T39.5.1** — Update the master Django template `templates/pdf/character_sheet.html` to assemble all pages. Use `{% include %}` tags: `{% include "pdf/page1_core_stats.html" %}`, `{% include "pdf/page2_backstory.html" %}`, and conditionally `{% if character.is_spellcaster %}{% include "pdf/page3_spellcasting.html" %}{% endif %}`
- [ ] **T39.5.2** — Add CSS `@page` rules in `static/pdf/styles.css` for page breaks between sections. Each included page template's root element gets `page-break-before: always` to ensure it starts on a new PDF page. The first page section should not have `page-break-before`
- [ ] **T39.5.3** — Add page numbering via CSS counters: `@page { @bottom-center { content: counter(page) " / " counter(pages); } }` to display "1 / 3" in the footer of each page. Style the footer with small font size and muted color
- [ ] **T39.5.4** — Add character name and sheet title to the `@top-center` page margin area via CSS: `@page { @top-center { content: "{{ character.name }} - Character Sheet"; } }` (rendered via template before CSS is parsed by WeasyPrint)
- [ ] **T39.5.5** — Update `PDFGenerationService.generate(character)` to render the master template with full character context (including computed stats, spells, equipment) and call `weasyprint.HTML(string=rendered_html, base_url=static_base).write_pdf()` to produce the final PDF bytes
- [ ] **T39.5.6** — Write integration test: generate a complete multi-page PDF for a spellcaster and verify: total page count is 3, each page contains expected content sections. Generate for a non-caster and verify: total page count is 2

## Acceptance Criteria

- Master template assembles page 1, page 2, and conditional page 3 into a single HTML document
- Each page section starts on a new PDF page via CSS `page-break-before: always` rules
- Page numbering appears in the footer of every page (e.g., "1 / 3") via CSS `@page` margin rules
- Character name appears in the header of every page via CSS `@page` margin rules
- Spellcaster characters produce a 3-page PDF (core stats, backstory, spellcasting)
- Non-caster characters produce a 2-page PDF (core stats, backstory) with no empty spellcasting page
- `PDFGenerationService.generate()` returns valid PDF bytes for both caster and non-caster characters
- The `base_url` parameter is correctly set so WeasyPrint can resolve CSS stylesheet and font references

## Testing Requirements

### Backend Template Assembly Tests (pytest)
_For verifying the master template correctly includes all sub-templates_

- `should render character_sheet.html including page1 and page2 content for a non-caster Fighter`
- `should render character_sheet.html including page1, page2, and page3 content for a Wizard`
- `should NOT include page3_spellcasting.html content when character.is_spellcaster is false`
- `should include page-break CSS classes on each page section root element`

### Backend PDF Output Tests (pytest + WeasyPrint)
_For verifying the complete multi-page PDF assembly_

- `should produce a 2-page PDF for a non-caster Fighter (core stats + backstory)`
- `should produce a 3-page PDF for a Wizard (core stats + backstory + spellcasting)`
- `should include page numbers in PDF footer on every page`
- `should include character name in PDF header on every page`
- `should resolve CSS stylesheet via base_url without WeasyPrint warnings`
- `should produce a PDF under 500KB for a standard character`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should download a complete multi-page PDF for a spellcaster character`
- `should download a 2-page PDF for a non-caster character`

### Test Dependencies
- Level 5 Fighter factory/fixture (non-caster, produces 2-page PDF)
- Level 3 Wizard factory/fixture (caster, produces 3-page PDF)
- PDF page count utility (e.g., `PyPDF2.PdfReader` to count pages)
- PDF text extraction utility for verifying content on specific pages

## Identified Gaps

- **Edge Cases**: Characters with very long backstories may cause page 2 to span multiple physical PDF pages, affecting total page count and page numbering. The assembly should handle this gracefully
- **Edge Cases**: Characters with many spells may cause the spellcasting page to span multiple physical pages. Page break rules within the spellcasting section need testing
- **Performance**: No target for total PDF generation time. Complex characters with large backstories and many spells could be slow. Profile WeasyPrint rendering time
- **CSS Compatibility**: WeasyPrint's CSS support is extensive but not 100% browser-compatible. Any CSS used in templates should be tested against WeasyPrint's supported properties

## Dependencies

- Story 39.1 (PDF generation architecture — WeasyPrint service, base template, print CSS)
- Story 39.2 (Page 1 template — `templates/pdf/page1_core_stats.html`)
- Story 39.3 (Page 2 template — `templates/pdf/page2_backstory.html`)
- Story 39.4 (Page 3 template — `templates/pdf/page3_spellcasting.html`)
- Django template engine and static file serving for CSS resolution

## Notes

- The master template (`character_sheet.html`) is the single entry point for `PDFGenerationService`. It assembles all pages by including sub-templates, so page-level templates (39.2, 39.3, 39.4) do not need to know about each other
- CSS `@page` margin boxes (`@top-center`, `@bottom-center`) are a WeasyPrint-supported feature from the CSS Paged Media Module Level 3 spec. They provide clean header/footer content without polluting the template HTML
- The `base_url` parameter passed to `weasyprint.HTML()` must point to the Django static files directory so that `<link rel="stylesheet" href="...">` references resolve correctly. Use `settings.STATIC_ROOT` or `settings.STATICFILES_DIRS` as the base
- Page breaks are controlled by CSS rather than manual page splitting. This means a very long backstory or spell list can naturally overflow to additional physical pages, and the page counter adjusts automatically
