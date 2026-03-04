# Story 39.3 — Page 2: Backstory & Description Layout

> **Epic 39: PDF Character Sheet Export** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a user, I want the second page of my character PDF to show all roleplay, backstory, and inventory information. This page is a Django HTML template rendered by WeasyPrint, containing character appearance fields, personality traits, ideals, bonds, flaws, backstory text, features and traits, equipment list, and treasure/currency.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **PDF Layout**: Django HTML template rendered by WeasyPrint. CSS Grid/Flexbox for layout. Print CSS in `static/pdf/styles.css`
- **Page 2 Structure**: Character appearance (with portrait), backstory, personality traits, ideals, bonds, flaws, features & traits, equipment list, treasure
- **Avatar Handling**: Character portraits stored as image files or base64 in the database. Embedded in the template as an `<img>` tag if avatar exists; placeholder silhouette CSS otherwise
- **Text Overflow**: Long backstory content flows naturally in HTML. WeasyPrint handles page breaks automatically via CSS `page-break-inside: avoid` where appropriate

## Tasks

- [ ] **T39.3.1** — Create Django template `templates/pdf/page2_backstory.html`. This is an includable template block that renders the full page 2 layout. It receives the character object via template context
- [ ] **T39.3.2** — **Character appearance section:** HTML layout with labeled fields for age, height, weight, eyes, skin, hair. Character portrait area (square, top-right) using an `<img>` tag if avatar exists, or a CSS-styled placeholder silhouette otherwise
- [ ] **T39.3.3** — **Backstory section:** a `<div>` containing the character backstory text. Long backstories flow naturally in HTML and WeasyPrint handles page overflow automatically. Use a readable font size (10pt body) and appropriate line-height
- [ ] **T39.3.4** — **Personality section:** labeled boxes for personality traits, ideals, bonds, flaws. Rendered as bordered `<div>` elements with headings
- [ ] **T39.3.5** — **Features & Traits section:** full list of racial traits, class features, and feat descriptions. Rendered as an HTML list
- [ ] **T39.3.6** — **Equipment list:** HTML `<table>` with columns for item name, quantity, and weight. Total weight displayed at the bottom with carrying capacity reference (15 x Strength score)
- [ ] **T39.3.7** — **Treasure section:** currency summary (CP, SP, EP, GP, PP with amounts) displayed in a compact row or small table, plus notable treasure items listed below
- [ ] **T39.3.8** — Create CSS layout for page 2 in `static/pdf/styles.css` — two-column layout with backstory/personality on the left, equipment/treasure on the right, and features spanning the bottom
- [ ] **T39.3.9** — Write test: render the template with sample character data and verify the HTML output contains backstory text, equipment items, and currency values. Verify WeasyPrint produces a valid PDF from the template

## Acceptance Criteria

- Page 2 Django template renders all backstory and roleplay information from the character data
- Character appearance fields (age, height, weight, eyes, skin, hair) are properly labeled and populated
- Character portrait renders in the template if an avatar image exists; CSS placeholder silhouette shown otherwise
- Backstory text renders at a readable font size with natural HTML text flow; long backstories overflow to additional pages via WeasyPrint page break handling
- Personality traits, ideals, bonds, and flaws render in labeled bordered sections
- Features and traits section lists all racial traits, class features, and feat descriptions
- Currency (CP, SP, EP, GP, PP) displays with amounts in the treasure section
- Equipment list shows all inventory items with names, quantities, and weights in an HTML table
- Total weight and carrying capacity reference appear at the bottom of the equipment list
- Empty optional sections (no backstory, no equipment, no treasure) render gracefully with a "None" or empty placeholder rather than causing template errors

## Testing Requirements

### Backend Template Rendering Tests (pytest)
_For verifying Django template produces correct HTML with character data_

- `should render page2_backstory.html without template errors for a fully populated character`
- `should include character appearance fields (age, height, weight, eyes, skin, hair) in the rendered HTML`
- `should include an img tag with avatar source when character has an avatar`
- `should include placeholder silhouette markup when character has no avatar`
- `should include backstory text content in the rendered HTML`
- `should include personality traits, ideals, bonds, and flaws in the rendered HTML`
- `should include equipment table with item names, quantities, and weights`
- `should include currency values (CP, SP, EP, GP, PP) in the rendered HTML`
- `should render gracefully with empty optional fields (no backstory, no equipment, no treasure)`

### Backend PDF Output Tests (pytest + WeasyPrint)
_For verifying end-to-end PDF generation from the page 2 template_

- `should produce a valid PDF containing the backstory text as searchable content`
- `should produce a multi-page PDF when backstory exceeds a single page of content`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should download a PDF containing backstory and equipment data for a character with avatar`
- `should download a PDF with placeholder portrait for a character without avatar`

### Test Dependencies
- Character factory/fixture with full backstory, appearance fields, inventory, and treasure
- Character factory/fixture with avatar image
- Character factory/fixture without avatar image
- Character factory/fixture with very long backstory (10,000+ characters) for overflow testing
- Character factory/fixture with empty optional fields (no backstory, no equipment, no treasure)
- PDF text extraction utility (e.g., `pdfplumber`) for verifying text content in generated PDFs

## Identified Gaps

- **Edge Cases**: Behavior when avatar image file is missing or corrupt — template should fall back to placeholder silhouette gracefully
- **Edge Cases**: Very long equipment lists (50+ items) may push content beyond a single page. CSS page-break rules should handle this but need testing
- **Loading/Empty States**: Template should handle all optional sections being empty without visual artifacts (empty bordered boxes with "None" text)
- **Performance**: Large avatar images embedded as base64 in the template could slow WeasyPrint rendering. Consider serving avatars as file URLs instead

## Dependencies

- Story 39.1 (PDF generation architecture — WeasyPrint service, base template, print CSS)
- Story 39.2 (Page 1 layout — establishes the CSS patterns and template structure used here)
- Character data model with backstory, appearance, inventory, and treasure fields (Django ORM)

## Notes

- HTML/CSS templates replace jsPDF coordinate drawing. WeasyPrint renders the Django template to PDF server-side, so all layout is done with standard CSS
- Avatar images should be served as file URLs (or inline base64 data URIs) in the `<img>` tag. WeasyPrint resolves both local file paths and data URIs. The portrait area should use `object-fit: cover` CSS for consistent square display regardless of original aspect ratio
- Long backstories benefit from natural HTML text flow — no manual font resizing needed. WeasyPrint automatically creates additional pages when content overflows, controlled by CSS `page-break-inside` rules
- Equipment weight calculations should use the carrying capacity rules (15 x Strength score) computed in the template context by the backend service
