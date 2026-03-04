# Story 39.3 — Page 2: Backstory & Description Layout

> **Epic 39: PDF Character Sheet Export** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player, I need Page 2 of my PDF to contain all the roleplay and backstory information. This page includes character appearance fields, the backstory text area, allies and organizations, additional features that overflowed from Page 1, treasure/currency, and the full equipment list.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **PDF Layout**: Uses jsPDF direct drawing API with coordinates from `utils/pdfLayout.ts`. US Letter = 215.9mm x 279.4mm
- **Page 2 Structure**: Character appearance (with portrait), backstory, allies/organizations, additional features, treasure, equipment list
- **Avatar Handling**: Character portraits stored as base64 in IndexedDB. Embedded in PDF if avatar exists, placeholder silhouette otherwise
- **Text Overflow**: Backstory auto-sizes font to fit with minimum 8pt. Can continue onto additional pages if needed

## Tasks

- [ ] **T39.3.1** — **Character appearance block:** labeled fields for age, height, weight, eyes, skin, hair. Character portrait area (square, top-right) — populated with avatar image if one exists, otherwise a placeholder silhouette
- [ ] **T39.3.2** — **Backstory block:** large text area with the character's backstory. Auto-size font to fit, with a minimum readable size of 8pt. Overflow handled by continuing onto additional pages if needed
- [ ] **T39.3.3** — **Allies & Organizations:** labeled text block with organization names and descriptions
- [ ] **T39.3.4** — **Additional Features & Traits:** continuation of features that didn't fit on Page 1
- [ ] **T39.3.5** — **Treasure:** currency summary (CP, SP, EP, GP, PP with amounts) and notable treasure items
- [ ] **T39.3.6** — **Equipment list:** full inventory with item names, quantities, and weights. Total weight at the bottom with carrying capacity reference

## Acceptance Criteria

- Page 2 of the PDF contains all roleplay and backstory information
- Character appearance fields (age, height, weight, eyes, skin, hair) are properly labeled and populated
- Character portrait renders in the top-right if an avatar image exists; placeholder silhouette shown otherwise
- Backstory text renders with auto-sized font (minimum 8pt), continuing to additional pages for very long backstories
- Allies and organizations section is populated from character data
- Features that overflowed from Page 1 appear in the Additional Features section
- Currency (CP, SP, EP, GP, PP) displays with amounts in the treasure section
- Equipment list shows all inventory items with names, quantities, and weights
- Total weight and carrying capacity reference appear at the bottom of the equipment list

## Dependencies

- Story 39.1 (PDF generation architecture)
- Story 39.2 (Page 1 layout — features overflow from Page 1 to Page 2)
- Character data model with backstory, appearance, inventory, and treasure fields

## Notes

- Avatar images are stored as base64 JPEGs in IndexedDB (resized/cropped in Phase 3 to <=100KB)
- The portrait area should be a fixed square regardless of the original image aspect ratio
- For very long backstories (10,000+ characters), the auto-sizing should stop at 8pt minimum and overflow to additional pages
- Equipment weight calculations should use the carrying capacity rules (15x Strength score)
