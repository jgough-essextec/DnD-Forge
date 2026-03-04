# Epic 39: PDF Character Sheet Export

> **Phase 6: Polish & Export** | Weeks 11-12

## Goal

Generate a downloadable PDF character sheet that faithfully reproduces the official D&D 5e three-page layout with all character data populated, clean typography, proper field sizing, and decorative borders — entirely client-side with no server dependency.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 39.1 | PDF Generation Architecture | 5 | PDF library setup, module structure, coordinate system, typography, font embedding |
| 39.2 | Page 1: Core Stats Layout | 12 | Header, ability scores, saves, skills, combat stats, HP, attacks, personality, features |
| 39.3 | Page 2: Backstory & Description Layout | 6 | Appearance, backstory, allies, features overflow, treasure, equipment |
| 39.4 | Page 3: Spellcasting Layout | 6 | Spellcasting header, cantrips, spell levels 1-9, Warlock pact magic, density, non-casters |
| 39.5 | PDF Export Options & UI | 7 | Export modal, options dialog, preview, download, print button, batch export, error handling |
| 39.6 | Campaign Export to PDF | 3 | Party summary PDF, overview page, full character sheets option |

## Technical Approach

- **Hybrid PDF Generation:** jsPDF direct drawing for structural layout (boxes, borders, labels, decorative elements) with character data as positioned text. html2canvas as fallback for complex elements
- **Vector Output:** Produces crisp, searchable text PDFs (~200KB per sheet) rather than raster image PDFs
- **Font Embedding:** Embed Cinzel font as base64 TTF for authentic D&D headings (~100KB addition)
- **Three-Page Layout:** Page 1 (Core Stats), Page 2 (Backstory & Description), Page 3 (Spellcasting)
- **Paper Sizes:** US Letter (215.9mm x 279.4mm) default, A4 option

## Dependencies

- Phases 1-5 complete (all character data available)
- jsPDF library (already in tech spec)
- html2canvas library (fallback for complex elements)
- JSZip library (for batch export)

## Key Deliverables

- `utils/pdfExport.ts` — main export module
- `utils/pdfLayout.ts` — coordinate system and field positions
- `utils/pdfStyles.ts` — typography and color constants
- `components/export/PDFExportModal.tsx` — export options dialog
- Campaign summary PDF generation
