# Story 39.1 — PDF Generation Architecture

> **Epic 39: PDF Character Sheet Export** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a developer, I need a reliable client-side PDF generation pipeline that can produce multi-page character sheets with precise layout control. This story establishes the foundational architecture for all PDF export functionality — the library approach, module structure, coordinate system, typography constants, and font embedding.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **PDF Approach**: Hybrid — jsPDF direct drawing for structural layout (boxes, borders, labels, decorative elements) with character data as positioned text. html2canvas as fallback for complex elements like spell lists
- **Paper Sizes**: US Letter (215.9mm x 279.4mm) default, A4 option. All measurements in mm (jsPDF default)
- **Output Quality**: Vector text (searchable, selectable), crisp at any zoom, ~200KB per sheet
- **Font Strategy**: Embed Cinzel as base64 TTF (~100KB) for authentic D&D headings, Helvetica for body text

## Tasks

- [ ] **T39.1.1** — Evaluate and select the PDF generation approach. Two viable strategies:
  - **Strategy A — html2canvas + jsPDF:** Render hidden HTML "print templates" to canvas, then embed as images in a PDF. Pros: uses existing React components, CSS-accurate. Cons: raster output (not searchable text), large file sizes (~2-5MB per sheet), blurry at low DPI
  - **Strategy B — jsPDF direct drawing:** Build the PDF layout programmatically using jsPDF's drawing API (lines, rectangles, text positioning). Pros: vector output, crisp at any zoom, searchable text, small files (~200KB). Cons: must manually position every element, no CSS
  - **Recommended: Hybrid** — use jsPDF direct drawing for the structural layout (boxes, borders, labels, decorative elements) and populate character data as positioned text. This produces the crispest, smallest PDFs. Use html2canvas only as a fallback for complex elements like spell lists that would be tedious to position manually
- [ ] **T39.1.2** — Create `utils/pdfExport.ts` — the main export module. Entry point: `exportCharacterPDF(character: Character, options: PDFExportOptions): Promise<Blob>`. Options include: pages to include, paper size (US Letter default, A4 option), include avatar, include DM notes
- [ ] **T39.1.3** — Create `utils/pdfLayout.ts` — defines the coordinate system for the three-page layout. All measurements in mm (jsPDF default). US Letter = 215.9mm x 279.4mm. Define constants for all field positions, box dimensions, and text origins
- [ ] **T39.1.4** — Create `utils/pdfStyles.ts` — typography constants: font families (embed custom fonts or use jsPDF standard fonts), sizes for headings/labels/values, line heights, colors. The aesthetic should match the dark fantasy theme adapted for print (black borders on white background, gold accents as dark amber)
- [ ] **T39.1.5** — Font embedding: jsPDF's default fonts (Helvetica, Times, Courier) don't include Cinzel or Inter. Either embed Cinzel as a base64 TTF (adds ~100KB to bundle) or accept a close substitute (Times New Roman for headings, Helvetica for body). Recommend embedding Cinzel for the authentic D&D feel since it's used throughout the app

## Acceptance Criteria

- PDF generation module (`utils/pdfExport.ts`) exists with typed entry point accepting a Character and PDFExportOptions
- Coordinate system (`utils/pdfLayout.ts`) defines all field positions for US Letter and A4 paper sizes
- Typography constants (`utils/pdfStyles.ts`) define font families, sizes, line heights, and colors for print
- Font embedding strategy is implemented (Cinzel embedded or substitute selected)
- A simple test PDF can be generated with a placeholder layout to verify the pipeline works end-to-end
- Generated PDF is vector output with searchable text, not raster images

## Dependencies

- Character data model from Phase 1 (all character fields available)
- jsPDF library installed and configured
- html2canvas library installed (for fallback use)

## Notes

- jsPDF + html2canvas is specified in the tech spec, but `@react-pdf/renderer` is an alternative. Recommendation is to stick with jsPDF for Phase 6 and evaluate @react-pdf/renderer for future upgrades
- The PDF chunk should be code-split (loaded on export action only) to avoid impacting initial bundle size
- All coordinate constants should be centralized in pdfLayout.ts so adjustments to the layout propagate everywhere
