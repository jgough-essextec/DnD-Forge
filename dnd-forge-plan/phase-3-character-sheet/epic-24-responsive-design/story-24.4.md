# Story 24.4 — Print-Friendly Styles

> **Epic 24: Character Sheet Responsive Design** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to print my character sheet from the browser with a clean, readable layout — even before the PDF export feature in Phase 6.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Print Approach**: CSS `@media print` rules in a dedicated stylesheet. Remove UI chrome, force white background, optimize typography
- **Print Layout**: Force three-column Page 1 layout regardless of screen size. Each page starts on a new printed page (`page-break-before: always`)
- **Print Button**: In character sheet header with options for which pages to print
- **Typography**: Increase contrast, ensure Cinzel headings render properly, use pt-based font sizes. Hide parchment textures (solid white background)
- **Browser Compatibility**: Chrome Print Preview, Firefox Print, Safari Print
- **Phase 6**: Pixel-perfect PDF export is a Phase 6 feature. Phase 3 targets "functional print" — all data, clean layout

## Tasks
- [ ] **T24.4.1** — Create `styles/character-sheet-print.css` with `@media print` rules. Remove all UI chrome (navigation, edit buttons, mode toggles, hover states). Force white background with dark text
- [ ] **T24.4.2** — Print layout: force the three-column Page 1 layout regardless of screen size. Each page (Stats, Backstory, Spells) starts on a new printed page using `page-break-before: always`
- [ ] **T24.4.3** — "Print" button in the character sheet header. Options dialog: "Print All Pages", "Page 1 Only (Core Stats)", "Pages 1 & 3 (Stats + Spells)", custom page selection
- [ ] **T24.4.4** — Optimize typography for print: increase contrast, ensure Cinzel headings render properly, use pt-based font sizes. Parchment textures are hidden in print (solid white background)
- [ ] **T24.4.5** — Test with: Chrome Print Preview, Firefox Print, Safari Print. Ensure proper page breaks, no orphaned headers, and readable font sizes

## Acceptance Criteria
- `@media print` stylesheet removes all UI chrome (nav, buttons, toggles, hover states)
- Print forces white background with dark text
- Page 1 prints in three-column layout regardless of screen size
- Each sheet page starts on a new printed page
- "Print" button in character sheet header opens options dialog
- Print options allow selecting which pages to print
- Cinzel headings render properly in print
- Font sizes use pt-based values optimized for print readability
- Parchment textures are hidden in print
- No orphaned headers across page breaks
- Works correctly in Chrome, Firefox, and Safari print

## Dependencies
- Epic 17-19 (Sheet components) — print targets
- Story 24.1 (Desktop Layout) — print forces the desktop layout

## Notes
- Phase 3 targets "functional print" — all character data in a clean, readable layout
- "Faithful print" matching the official WotC sheet pixel-for-pixel is a Phase 6 goal (PDF export)
- The `@media print` approach is lightweight and doesn't require any JavaScript for basic printing
- The "Print" button should call `window.print()` after setting up the appropriate class names to control which pages are visible
- Orphaned headers (a section title at the bottom of a page with content starting on the next page) should be prevented with `page-break-inside: avoid` and `break-after: avoid` on headings
- Print stylesheets should be loaded with `media="print"` to avoid affecting screen rendering
