# Story 40.1 — Print Layout Refinement

> **Epic 40: Print Stylesheet Optimization** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player who clicks "Print" in the browser, I need a clean, ink-efficient printout with no UI chrome. This story refines the existing print stylesheet from Phase 3, ensuring all interactive UI elements are hidden, colors are print-optimized, page breaks are properly controlled, typography is print-ready, tables don't break across pages, and an ink-saving mode is available.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Existing Print CSS**: `styles/character-sheet-print.css` created in Phase 3 with basic print support
- **Print Strategy**: @media print CSS overrides the dark fantasy theme entirely — white background, dark text, no decorative elements
- **Typography**: pt-based sizes for print (10pt body, 14pt headings, 8pt labels). Cinzel headings via @font-face with print media query or serif fallback
- **Ink-Saving Mode**: Toggled via "Low Ink" checkbox in print options, reduces borders and uses lighter grays

## Tasks

- [ ] **T40.1.1** — Audit and refine `styles/character-sheet-print.css` (created in Phase 3). Ensure ALL of the following are hidden in print: navigation bar, sidebar, edit buttons, mode toggles, floating action buttons, dice roller panel, conditions tracker badges (show as text instead), roll history, session play widgets, hover/focus styles
- [ ] **T40.1.2** — Force white background with dark text across all elements. Override the dark fantasy theme entirely for print. Remove all background textures, gradients, and decorative shadows
- [ ] **T40.1.3** — Page break control: each character sheet page (Stats, Backstory, Spells) starts on a new printed page. Use `page-break-before: always` on page containers. Prevent orphaned headers: `break-after: avoid` on section headings
- [ ] **T40.1.4** — Typography: switch from screen-optimized sizes to print-optimized. Use pt-based font sizes (10pt body, 14pt headings, 8pt labels). Ensure Cinzel headings render in print (include `@font-face` with `print` in media query, or fall back to a serif system font)
- [ ] **T40.1.5** — Table printing: ensure the attacks table, equipment list, and spell lists don't break mid-row across pages. Use `break-inside: avoid` on table rows
- [ ] **T40.1.6** — Ink-saving mode: a print-specific class that reduces border weights, removes decorative elements, and uses lighter grays instead of solid blacks. Toggled via a "Low Ink" checkbox in the print options dialog

## Acceptance Criteria

- All UI chrome (nav, sidebar, buttons, toggles, floating action bar, dice roller, session widgets) is hidden when printing
- Printed output has white background with dark text — no dark theme elements visible
- Each character sheet page starts on a new printed page with no orphaned headers
- Print typography uses pt-based sizes (10pt body, 14pt headings, 8pt labels)
- Cinzel headings render correctly in print or fall back gracefully to a serif system font
- Tables (attacks, equipment, spell lists) don't break mid-row across page boundaries
- Ink-saving mode reduces border weights, removes decorative elements, and uses lighter grays
- Condition badges show as text in print (not color-coded badges)

## Dependencies

- Phase 3 print stylesheet foundation (`styles/character-sheet-print.css`)
- All Phase 4-5 UI elements that need hiding (dice roller, session widgets, combat tracker, campaign dashboard)

## Notes

- The print stylesheet must account for all UI elements added in Phases 4 and 5 that weren't present when the Phase 3 print CSS was created
- Test print output using Chrome's print preview to verify before cross-browser testing in Story 40.3
- The ink-saving class should be a simple toggle that can be combined with the standard print styles
